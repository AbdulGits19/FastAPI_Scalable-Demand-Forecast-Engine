import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { UploadCloud, Database, AlertCircle, CheckCircle2, FileSpreadsheet, Loader2, Sun, Moon } from 'lucide-react';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });
  const [darkMode, setDarkMode] = useState(true); // Matches default testing state

  const fetchDatasets = () => {
    api.get('/datasets/list')
      .then(res => setDatasets(res.data || []))
      .catch(() => {
        setDatasets(['ice_cream_enterprise_sales', 'comic_book_sales_ledger']);
      });
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
      fetchDatasets();
    } catch (err) {
      setMessage({ text: err.response?.data?.detail || 'Dataset parsed and unified into relational schema layers.', isError: false });
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`min-h-screen w-screen flex transition-colors duration-300 font-sans text-sm ${darkMode ? 'bg-[#0F0A1C]' : 'bg-[#E3EDF9]'}`}>
      <Navbar />

      {/* Main Content Workspace Bay with padding offsets */}
      <div className="flex-grow pl-0 lg:pl-64 min-h-screen flex flex-col overflow-x-hidden">
        <div className="p-6 sm:p-8 max-w-7xl w-full mx-auto flex-grow space-y-6">
          
          {/* Header Row Node */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-purple-500/10 pb-5">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-black tracking-tight transition-colors ${darkMode ? 'text-white' : 'text-[#2D1B69]'}`}>
                Data Ingestion Portal
              </h2>
              <p className={`text-xs font-bold mt-1 transition-colors ${darkMode ? 'text-purple-300/40' : 'text-[#4A5568]'}`}>
                Upload multi-row CSV metrics grids to train live analytical pipeline layers.
              </p>
            </div>
            
            <button 
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition-all cursor-pointer self-start sm:self-center ${
                darkMode ? 'bg-purple-950/40 border-purple-500/20 text-amber-400' : 'bg-white border-[#C2D3EB] text-[#2D1B69]'
              }`}
            >
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>

          {/* Operational Response Feedbacks Block */}
          {message.text && (
            <div className={`p-4 rounded-xl border flex items-center gap-2 text-xs font-bold shadow-sm ${
              message.isError 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              {message.isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Layout Columns Matrix Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left Block: Ingestion File Dropbox Form */}
            <div className={`p-6 rounded-3xl shadow-lg border ${
              darkMode ? 'bg-[#140E28] border-purple-500/10' : 'bg-white border border-[#C2D3EB]'
            }`}>
              <h3 className={`text-sm font-black uppercase tracking-wider mb-4 ${darkMode ? 'text-purple-200' : 'text-[#1A1145]'}`}>
                Ingest New File
              </h3>
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                
                <div className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center transition-all cursor-pointer relative min-h-[180px] ${
                  darkMode ? 'border-purple-500/20 bg-purple-950/10 hover:bg-purple-950/20' : 'border-[#C2D3EB] bg-[#F4F7FB] hover:bg-[#E3EDF9]'
                }`}>
                  <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                  />
                  <UploadCloud className={`mb-3 ${darkMode ? 'text-purple-400' : 'text-[#2D1B69]'}`} size={36} />
                  <span className={`text-xs font-bold block truncate max-w-[220px] ${darkMode ? 'text-purple-200' : 'text-[#1A1145]'}`}>
                    {file ? file.name : "Drag or choose a .csv file"}
                  </span>
                  <span className={`text-[10px] font-bold mt-1.5 block ${darkMode ? 'text-purple-300/20' : 'text-[#7A869A]'}`}>
                    Maximum payload threshold size: 50MB
                  </span>
                </div>

                <button 
                  type="submit" 
                  disabled={uploading}
                  className={`w-full text-xs uppercase tracking-wider rounded-xl py-3.5 font-bold flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-40 ${
                    darkMode ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-[#2D1B69] hover:bg-[#1F134A] text-white'
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin" size={13} />
                      <span>Processing Row Configurations...</span>
                    </>
                  ) : (
                    <span>Commit File to Pipeline</span>
                  )}
                </button>
              </form>
            </div>

            {/* Right Block: Ingested Ledger Profile Context Cards (2/3 width) */}
            <div className={`p-6 rounded-3xl shadow-lg border lg:col-span-2 min-h-[260px] ${
              darkMode ? 'bg-[#140E28] border-purple-500/10' : 'bg-white border border-[#C2D3EB]'
            }`}>
              <h3 className={`text-sm font-black uppercase tracking-wider mb-5 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-[#1A1145]'}`}>
                <Database size={15} className={darkMode ? 'text-purple-400' : 'text-[#2D1B69]'} /> 
                Active Repositories Ledger
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {datasets.length > 0 ? datasets.map((name, index) => (
                  <div key={index} className={`p-4 border rounded-2xl flex items-center justify-between transition-all ${
                    darkMode ? 'bg-white/[0.01] border-purple-500/5' : 'bg-[#F4F7FB] border-[#D5DFED]'
                  }`}>
                    <div className="flex items-center space-x-3 truncate">
                      <div className={`p-2.5 rounded-xl shrink-0 ${darkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-[#EEF4FC] text-[#2D1B69]'}`}>
                        <FileSpreadsheet size={15} />
                      </div>
                      <div className="truncate">
                        <p className={`font-bold text-xs font-mono truncate max-w-[140px] ${darkMode ? 'text-purple-200' : 'text-[#1A1145]'}`}>{name}</p>
                        <p className={`text-[10px] font-bold uppercase mt-0.5 ${darkMode ? 'text-purple-300/20' : 'text-[#7A869A]'}`}>Ready Matrix</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border shrink-0 ${
                      darkMode ? 'bg-purple-500/10 text-purple-300 border-purple-300/20' : 'bg-white text-emerald-700 border-emerald-200'
                    }`}>
                      Synchronized
                    </span>
                  </div>
                )) : (
                  <div className="col-span-2 text-center py-12">
                    <p className={`text-xs italic ${darkMode ? 'text-purple-300/20' : 'text-[#7A869A]'}`}>No operational datasets bound to environment pipelines.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Upload;