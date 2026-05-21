import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
    }
  };

  const handleUpload = async () => {
  if (!file) return;
  setStatus('uploading');
  
  const formData = new FormData();
  formData.append('file', file);

  try {
    // Ensure your axios instance ('api') is automatically 
    // attaching the Authorization Bearer token from localStorage
    const res = await api.post('/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // Match your backend return: { "status": "success", ... }
    if (res.data.status === "success") {
      setStatus('success');
      setMessage(`Successfully processed ${res.data.rows_uploaded} records!`);
      setFile(null);
    }
  } catch (err) {
    setStatus('error');
    // If it's a 401, you're not logged in. If it's a 400, your CSV is messy.
    setMessage(err.response?.data?.detail || 'Upload failed. Check connection or CSV format.');
  }
};

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="bg-white max-w-2xl w-full rounded-[40px] shadow-sm border border-slate-100 p-12 text-center">
          <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <UploadCloud className="text-purple-600" size={32} />
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-4">Upload Dataset</h2>
          <p className="text-gray-500 font-medium mb-8">
            Upload your latest historical sales CSV. The AI will automatically retrain on the new data.
          </p>

          <label className="border-2 border-dashed border-purple-200 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 transition-colors mb-8 group">
            <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            <FileText className="text-purple-300 group-hover:text-purple-500 mb-4 transition-colors" size={40} />
            <span className="text-purple-600 font-bold text-lg">
              {file ? file.name : "Click to browse or drag CSV here"}
            </span>
          </label>

          <button 
            onClick={handleUpload}
            disabled={!file || status === 'uploading'}
            className="w-full bg-purple-600 text-white rounded-2xl py-4 font-black text-lg hover:bg-purple-700 disabled:bg-gray-300 transition-all flex items-center justify-center space-x-2"
          >
            {status === 'uploading' ? (
              <><Loader2 className="animate-spin" /><span>Processing...</span></>
            ) : (
              <span>Process Dataset</span>
            )}
          </button>

          {status === 'success' && (
            <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center space-x-2 font-bold">
              <CheckCircle size={20} /> <span>{message}</span>
            </div>
          )}
          
          {status === 'error' && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center justify-center space-x-2 font-bold">
              <AlertCircle size={20} /> <span>{message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;