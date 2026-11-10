import { useState } from "react";
import "./FileUpload.css";

function FileUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a CSV file.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        "http://127.0.0.1:5000/api/crop-prices/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Upload failed.");
        return;
      }

      setMessage(
        `${data.message} ${data.recordsUploaded} records uploaded.`
      );

      setFile(null);
    } catch (error) {
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-upload-container">
      <h2>Upload Market Prices</h2>

      <p className="upload-description">
        Upload a CSV file containing crop market price data.
      </p>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
      />

      {file && (
        <p className="selected-file">
          Selected: {file.name}
        </p>
      )}

      <button
        className="upload-button"
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload CSV"}
      </button>

      {message && (
        <p className="upload-message">
          {message}
        </p>
      )}
    </div>
  );
}

export default FileUpload;