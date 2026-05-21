import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { UploadCloud, Database, AlertCircle, CheckCircle2, FileSpreadsheet, Loader2 } from 'lucide-react';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  // 1. Initial Load: Fetch Active Uploaded Profiles Ledger
  const fetchDatasets = () => {
    api.get('/datasets/list')
      .then(res => setDatasets(res.data || []))
      .catch(err => console.error("Error fetching repository list:", err));
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage({ text: '', isError: false });
    }
  };

  // 2. Action Handler: Multi-part form stream ingestion processing
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ text: 'Please choose an operational CSV file format first.', isError: true });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setMessage({ text: '', isError: false });

    try {
      await api.post('/datasets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ text: `Dataset "${file.name}" successfully parsed and ingested into MySQL!`, isError: false });
      setFile(null);
      fetchDatasets(); // Refresh list layout
    } catch (err) {
      console.error("Ingestion channel crash:", err);
      setMessage({ text: err.response?.data?.detail || 'Failed to parse database matrix mapping.', isError: true });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-sm">
      <Navbar />
      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex-grow">
        
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Data Workspace ingestion</h2>
          <p className="text-slate-500 text-xs font-medium mt-0.5">Upload multi-row CSV metrics grids to trigger live pipeline training layers.</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-2 text-xs font-bold ${
            message.isError ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            {message.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Block: Interactive Upload Form Panel Context */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-1">
            <h3 className="text-base font-black text-slate-800 mb-4">Ingest New File</h3>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              
              <div className="border-2 border-dashed border-purple-100 bg-purple-50/20 rounded-2xl p-6 text-center flex flex-col items-center justify-center hover:bg-purple-50/50 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="text-purple-500 mb-2" size={32} />
                <span className="text-xs font-bold text-slate-600 block truncate max-w-[200px]">
                  {file ? file.name : "Drag or choose a .csv file"}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Maximum data limit path: 50MB</span>
              </div>

              <button 
                type="submit" 
                disabled={uploading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl py-3 font-bold flex items-center justify-center space-x-2 shadow-md shadow-purple-100 transition-all cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    <span>Indexing row spaces...</span>
                  </>
                ) : (
                  <span>Commit File to Pipeline</span>
                )}
              </button>
            </form>
          </div>

          {/* Right Block: Loaded Profiles Ledger Layout */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 min-h-[240px]">
            <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-1.5">
              <Database size={16} className="text-purple-500" /> Active Repositories Ledger
            </h3>
            
            <div className="space-y-2">
              {datasets.length > 0 ? datasets.map((name, index) => (
                <div key={index} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100/60 text-purple-600 rounded-lg">
                      <FileSpreadsheet size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs font-mono">{name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Status: Ready</p>
                    </div>
                  </div>
                  <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                    Synchronized
                  </span>
                </div>
              )) : (
                <p className="text-slate-400 text-xs italic text-center py-10">No datasets active in your user environment loop profile context.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Upload;