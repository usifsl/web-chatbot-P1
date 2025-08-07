import React, { useState } from "react";

function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/upload/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setUploadResult(data.extracted_text || "Uploaded successfully.");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadResult("Upload failed.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Upload a File</h2>
      <input type="file" onChange={handleFileChange} className="mb-2" />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Upload
      </button>
      {uploadResult && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <strong>Upload Result:</strong>
          <p className="text-sm whitespace-pre-wrap">{uploadResult}</p>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
