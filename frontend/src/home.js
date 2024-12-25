import React, { useState, useEffect } from "react";
import axios from "axios";
import './home.css';

export const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState(null);
  const [dragOver, setDragOver] = useState(false); 

  const onFileChange = (file) => {
    setSelectedFile(file);
    setPrediction(""); 
    setConfidence(null); 
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null); 
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault(); 
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);

    const file = event.dataTransfer.files[0]; 
    if (file && file.type.startsWith("image/")) {
      onFileChange(file);
    } else {
      alert("Vui lòng thả một tệp hình ảnh hợp lệ!");
    }
  };

  const onFileUpload = async () => {
    if (!selectedFile) {
      alert("Vui lòng chọn hoặc kéo thả một file trước!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://localhost:8000/predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPrediction(response.data.class);
      setConfidence(response.data.confidence);
    } catch (error) {
      console.error("Lỗi:", error);
      console.log("Error response:", error.response);
      alert("Đã xảy ra lỗi khi gửi file!");
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl); 
      }
    };
  }, [previewUrl]);

  return (
    <div className="container">
      <h2>Phân loại bệnh trên lá lúa</h2>
      <div
        className={`drop-area ${dragOver ? "drag-over" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p>Kéo thả ảnh vào đây hoặc nhấn nút bên dưới để chọn tệp</p>
        <input
          type="file"
          onChange={(e) => onFileChange(e.target.files[0])}
          accept="image/*"
          style={{ display: "none" }}
          id="fileInput"
        />
        <label htmlFor="fileInput">
          Chọn tệp
        </label>
      </div>
  
      {previewUrl && (
        <div>
          <h3>Hình ảnh đã chọn:</h3>
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              maxwidth: "350px",
              height:'auto',
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "5px",
            }}
          />
        </div>
      )}
  
      <button onClick={onFileUpload}>Dự đoán</button>
  
      {prediction && (
        <div className="prediction">
          <h3>Kết quả dự đoán:</h3>
          <p style={{fontSize:'18px'}}>Phân loại: <span className="result">{prediction}</span></p>
          {confidence && (
            <p style={{fontSize:'18px'}}>Độ tin cậy: <span className="result">{(confidence * 100).toFixed(2)}%</span></p>
          )}
        </div>
      )}
    </div>
  );  
};
