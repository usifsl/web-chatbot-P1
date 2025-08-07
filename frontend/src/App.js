import React, { useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [file, setFile] = useState(null);
  const [cmsTitle, setCmsTitle] = useState('');
  const [cmsContent, setCmsContent] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');

  const sendQuestion = async () => {
    if (!question.trim()) return;

    const newMessages = [...messages, { role: 'user', text: question }];
    setMessages(newMessages);
    setQuestion('');

    const response = await fetch('http://127.0.0.1:8000/ask/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    const data = await response.json();
    setMessages([...newMessages, { role: 'bot', text: data.answer }]);
  };

  const uploadFile = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setUploadStatus('Uploading...');
    const formData = new FormData();
    formData.append('file', selectedFile);

    const response = await fetch('http://127.0.0.1:8000/upload/', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      setUploadStatus(`Uploaded: ${result.filename}`);
    } else {
      setUploadStatus('Upload failed.');
    }
  };

  const submitCMS = async () => {
    if (!cmsTitle.trim() || !cmsContent.trim()) return;

    const response = await fetch('http://127.0.0.1:8000/cms/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: cmsTitle, content: cmsContent }),
    });

    if (response.ok) {
      setCmsTitle('');
      setCmsContent('');
      alert('CMS content submitted!');
    } else {
      alert('CMS submission failed.');
    }
  };

  return (
    <div className="app-container">
      <div className="chat-container">
        <div className="chat-header">AI Chatbot</div>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="input-bar">
          <label htmlFor="file-upload" className="upload-icon">📎</label>
          <input id="file-upload" type="file" onChange={uploadFile} />
          <input
            type="text"
            placeholder="Type your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendQuestion()}
          />
          <button onClick={sendQuestion}>Ask</button>
        </div>
        {uploadStatus && <div className="upload-status">{uploadStatus}</div>}
      </div>

      <div className="cms-container">
        <h2>CMS Content Input</h2>
        <input
          type="text"
          placeholder="Title"
          value={cmsTitle}
          onChange={(e) => setCmsTitle(e.target.value)}
        />
        <textarea
          placeholder="Content"
          value={cmsContent}
          onChange={(e) => setCmsContent(e.target.value)}
        />
        <button onClick={submitCMS}>Submit CMS</button>
      </div>
    </div>
  );
}

export default App;
