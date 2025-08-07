import React, { useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadResult("");
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/upload/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResult(`Upload Result:\n${data.extracted_text}`);
      } else {
        setUploadResult(`Error: ${data.detail || "Unknown error"}`);
      }
    } catch (error) {
      setUploadResult(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "20px auto" }}>
      <h2>Web Chatbot - Upload Files</h2>
      <input type="file" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        style={{ marginLeft: 10, padding: "5px 10px" }}
      >
        Upload
      </button>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          marginTop: 20,
          backgroundColor: "#f0f0f0",
          padding: 10,
          borderRadius: 5,
          minHeight: 100,
        }}
      >
        {uploadResult}
      </pre>
    </div>
  );
}
