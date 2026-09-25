import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { reelsApi } from '../api/services';
import { Upload, Plus, FileText, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ImportReelsScreen() {
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await reelsApi.importCsv(formData);
      showToast('Success', `Imported ${res.data.count} reels`);
      setFile(null);
      navigate('/reels');
    } catch (err) {
      showToast('Upload failed', err.response?.data?.message || 'Check CSV format', true);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const header = "Reel ID,Name,Mill,Type,Width,GSM,Original Weight,Current Weight\n";
    const example = "R-1001,Test Reel,Test Mill,Kraft,100,120,500,500\n";
    const blob = new Blob([header + example], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "reels_import_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">Import & Bulk Add Reels</h1>
        <p className="page-sub">Upload CSV to bulk import reels to inventory</p>
      </div>

      <div className="grid-2">
        <div className="card card-pad">
          <div className="sec mt0"><span className="sec-title">CSV Import</span></div>
          <p className="muted small mb10">Upload a CSV file. The first row must be headers.</p>
          
          <button className="btn btn-sm btn-ghost mb10" onClick={downloadTemplate}>
            <Download size={15} /> Download Template
          </button>
          
          <div className="field mt10">
            <input type="file" className="input" accept=".csv" onChange={handleFileChange} />
          </div>
          
          <button 
            className="btn btn-primary mt10" 
            disabled={!file || uploading} 
            onClick={handleUpload}
          >
            <Upload size={16} /> {uploading ? 'Importing...' : 'Upload & Import'}
          </button>
        </div>
      </div>
    </div>
  );
}
