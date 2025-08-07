# Web Chatbot with Document Analysis and CMS Integration

Project Overview

This is a web-based chatbot application that answers user questions based on uploaded files (PDF, DOCX, CSV, TXT) and custom CMS content. It uses semantic search via embeddings and a vector database (Qdrant) to find the most relevant text fragments and return them as answers.

Features

- Chatbot interface with clean "bubble chat" UI
- Upload documents (.pdf, .docx, .csv, .txt) for analysis
- Submit CMS content via form
- Vector-based search using Qdrant
- Answers based on file/CMS content
- Backend powered by FastAPI
- Frontend built with React
- Responsive design for desktop and mobile

Project Structure

project/
├── backend/
│ ├── app.py
│ ├── qdrant_utils.py
│ ├── embeddings.py
│ ├── document_parser.py
│ └── requirements.txt
│
├── frontend/
│ ├── public/
│ ├── src/
│ │ ├── App.js
│ │ ├── App.css
│ │ └── components/
│ │ ├── Chat.js
│ │ ├── FileUpload.js
│ │ └── CMSInput.js
│ └── package.json
│
└── README.md


Technologies Used

| Layer      | Technology                     |
|------------|--------------------------------|
| Frontend   | React, HTML, CSS               |
| Backend    | Python, FastAPI                |
| Vectors    | Qdrant                         |
| Embeddings | SentenceTransformers (local)   |
| Files      | pdfminer, python-docx, pandas  |

> Note: Embeddings can be replaced with OpenAI API if needed.


## 🚀 Setup Instructions

### 1. Backend (FastAPI)

#### Install dependencies:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

Run FastAPI server:
uvicorn app:app --reload
Server will be available at: http://localhost:8000

2. Frontend (React)
Install dependencies:
cd frontend
npm install

Start React app:
npm start
Frontend runs at: http://localhost:3000

3. Qdrant Setup
Option 1: Run locally via Docker
docker run -p 6333:6333 qdrant/qdrant
Option 2: Use Qdrant Cloud
Create a free Qdrant Cloud project

Update Qdrant host/port/API key in qdrant_utils.py

🧪 Testing Checklist
 Chatbot loads and sends messages

 Upload a PDF/DOCX/CSV file → ask a question

 Submit CMS content → ask a question

 Chatbot responds based on content

 No crashes or frontend errors

 Clean UI with loading spinner and status messages

📝 Notes
Currently uses basic responses based on top-matching chunk

You can enhance the chatbot by using an LLM (e.g., OpenAI or HuggingFace) to rewrite or improve answers

All embeddings are done locally using sentence-transformers

📦 Deliverables
Full source code (frontend + backend)

README with setup instructions

Qdrant-compatible vector storage

Basic chatbot UI and document-based Q&A functionality

🔒 License
MIT – Free to use, modify, and share.