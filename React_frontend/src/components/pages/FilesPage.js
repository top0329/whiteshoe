import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../assets/css/styles.css';
import { useDropzone } from 'react-dropzone';

require('dotenv').config();

function FilesPage() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/get-all-files`, { token });
        if (response.data.message === `You're logged out. Please login again`) {
          localStorage.removeItem('token');
          toast.info('Session expired. Please login again.');
          return;
        }
        setFiles(response.data.files);
      } catch (error) {
        console.error('Error fetching files:', error);
        toast.error(error.response ? error.response.data.message : 'Error fetching data');
      }
    };

    fetchFiles();
  }, []);

  const onDrop = (acceptedFiles) => {
    uploadFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const uploadFile = async (selectedFile) => {
    const formData = new FormData();
    formData.append('file', selectedFile);
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/upload-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.message === `You're logged out. Please login again`) {
        localStorage.removeItem('token');
        toast.info('Session expired. Please login again.');
        return;
      }

      if (response.status === 200) {
        toast.success('File uploaded successfully!');
        const newFile = response.data.file;
        setFiles([...files, newFile]); // Update files state safely
      } else {
        throw new Error('File upload unsuccessful');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.response ? error.response.data.message : 'Error uploading file');
    }
  };

  const removeFile = async (fileId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/delete-file/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.message === `You're logged out. Please login again`) {
        localStorage.removeItem('token');
        toast.info('Session expired. Please login again.');
        return;
      }

      setFiles(files.filter(f => f._id !== fileId));
    } catch (error) {
      console.error('Error removing file:', error);
      toast.error('Error removing file');
    }
  };

  return (
    <div>
      <ToastContainer />
      <div id="header">
        <h1>Files</h1>
      </div>
      <div id="main">
        <div className="files-section">
          <h2>Your Files</h2>
          <ul id="fileList">
            {files.map((file) => (
              <li key={file._id}>
                {file.filename} <button onClick={() => removeFile(file._id)}>Remove</button>
              </li>
            ))}
          </ul>
          <h3>Upload New File</h3>
          <div {...getRootProps()} className="dropzone" style={{ paddingBottom: 20 }}>
            <input {...getInputProps()} />
            {isDragActive ?
              <p>Drop the file here ...</p> :
              <p className='content'>Drag 'n' drop a file here, or <span className='click_here'>click here</span> to select a file</p>}
          </div>
          <input id="fileUpload" type="file" style={{ display: 'none' }} onChange={(e) => uploadFile(e.target.files[0])} accept=".doc, .docx, .pdf" />
        </div>
      </div>
    </div>
  );
}

export default FilesPage;
