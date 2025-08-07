import io
from uuid import uuid4
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from docx import Document
import PyPDF2
from typing import List
from qdrant_client import QdrantClient
import openai

app = FastAPI()


origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

qdrant: QdrantClient | None = None
COLLECTION_NAME = "documents"

@app.on_event("startup")
async def startup_event():
    global qdrant
    QDRANT_URL = "http://localhost:6333"
    qdrant = QdrantClient(url=QDRANT_URL)

    try:
        qdrant.delete_collection(collection_name=COLLECTION_NAME)
        print(f"Deleted old collection '{COLLECTION_NAME}'")
    except Exception:
        print(f"Collection '{COLLECTION_NAME}' not found or could not be deleted")

    qdrant.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config={"size": 384, "distance": "Cosine"},
    )
    print(f"Created collection '{COLLECTION_NAME}' with vector size 384")

from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')

def create_embedding(text: str):
    embedding = model.encode(text)
    return embedding.tolist()

@app.get("/")
async def root():
    return {"message": "Chatbot backend is running"}


import traceback

@app.post("/upload", include_in_schema=False)
@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        filename = file.filename

        if qdrant is None:
            raise HTTPException(status_code=503, detail="Qdrant client not initialized")

        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
            text = df.to_string()
        elif filename.endswith(".docx"):
            doc = Document(io.BytesIO(contents))
            text = "\n".join(para.text for para in doc.paragraphs)
        elif filename.endswith(".pdf"):
            reader = PyPDF2.PdfReader(io.BytesIO(contents))
            text_list = []
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_list.append(page_text)
            text = "\n".join(text_list)
        elif filename.endswith(".txt"):
            text = contents.decode('utf-8')
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        embedding_vector = create_embedding(text)

        qdrant.upsert(
            collection_name=COLLECTION_NAME,
            points=[
                {
                    "id": str(uuid4()),
                    "vector": embedding_vector,
                    "payload": {"filename": filename, "text": text[:500]},
                }
            ],
        )
        return {"filename": filename, "extracted_text": text[:500]}
    except Exception as e:
        print("Error in /upload/:", e)
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Failed to process file: {str(e)}")

class CMSContent(BaseModel):
    title: str
    content: str

@app.post("/cms", include_in_schema=False)
@app.post("/cms/")
async def import_cms(content: CMSContent):
    if qdrant is None:
        raise HTTPException(status_code=503, detail="Qdrant client not initialized")

    embedding_vector = create_embedding(content.content)

    qdrant.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            {
                "id": str(uuid4()),
                "vector": embedding_vector,
                "payload": {"title": content.title, "content": content.content[:500]},
            }
        ],
    )

    return {"message": f"CMS content '{content.title}' imported successfully"}

class Question(BaseModel):
    question: str

@app.post("/ask/")
async def ask_question(q: Question):
    if qdrant is None:
        raise HTTPException(status_code=503, detail="Qdrant client not initialized")

    try:
        question_embedding = create_embedding(q.question)

        search_result = qdrant.search(
            collection_name=COLLECTION_NAME,
            query_vector=question_embedding,
            limit=3,
            with_payload=True,
        )

        matches = []
        for hit in search_result:
            payload = hit.payload
            if "text" in payload:
                matches.append(payload["text"])
            elif "content" in payload:
                matches.append(payload["content"])

        if not matches:
            return {"answer": "No answer found. Please try rephrasing your question or upload more documents."}

        return {"answer": matches[0]}
    except Exception as e:
        print("Error in /ask/:", e)
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")
