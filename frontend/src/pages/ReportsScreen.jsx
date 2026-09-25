import React, { useState, useEffect } from 'react';
import { dashboardApi, reelsApi, reportsApi } from '../api/services';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { downloadCsv } from '../utils/exportCsv';

export default function ReportsScreen() {
  const [stats, setStats] = useState(null);
  const [reels, setReels] = useState([]);

  useEffect(() => {
    dashboardApi.getStats().then((res) => setStats(res.data));
    reelsApi.getAll().then((res) => setReels(res.data));
  }, []);

  const n0 = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');

  const unitConsumption = Object.values(reels.reduce((result, reel) => {
    const consumed = Math.max(0, Number(reel.orig || 0) - Number(reel.remaining || 0));
    result[reel.unit] = result[reel.unit] || { n: reel.unit, v: 0 };
    result[reel.unit].v += consumed;
    return result;
  }, {}));
  const maxU = Math.max(...unitConsumption.map((u) => u.v));
  
  const handleDownload = async (apiCall, filename) => {
    try {
      const response = await apiCall();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      alert('Failed to download report');
    }
  };

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">Reports & Downloads</h1>
        <p className="page-sub">Live inventory and generated reports</p>
      </div>

      <div className="sec" style={{ marginTop: 0 }}><span className="sec-title">Inventory Summary</span></div>
      <div className="stats-grid">
        <div className="stat"><div className="stat-label">Total Reels</div><div className="stat-value num">{stats?.totalReels || 0}</div></div>
        <div className="stat"><div className="stat-label">Total Weight</div><div className="stat-value num">{n0(stats?.totalWeight)}<small>kg</small></div></div>
        <div className="stat"><div className="stat-label">Available</div><div className="stat-value num">{n0(stats?.availableWeight)}<small>kg</small></div></div>
        <div className="stat"><div className="stat-label">Consumed</div><div className="stat-value num">{n0(stats?.consumedWeight)}<small>kg</small></div></div>
      </div>

      <div className="sec"><span className="sec-title">Core Reports</span></div>
      <div className="card card-pad" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <button className="btn btn-outline" onClick={() => handleDownload(reportsApi.downloadDailyStockPdf, 'daily_stock.pdf')}>
          <FileText size={17} style={{ marginRight: '5px' }} /> Daily Stock (PDF)
        </button>
        <button className="btn btn-outline" onClick={() => handleDownload(reportsApi.downloadProductionPlanPdf, 'production_plan.pdf')}>
          <FileText size={17} style={{ marginRight: '5px' }} /> Production Plan (PDF)
        </button>
        <button className="btn btn-outline" onClick={() => handleDownload(reportsApi.downloadLedgerHistoryExcel, 'ledger_history.xlsx')}>
          <FileSpreadsheet size={17} style={{ marginRight: '5px' }} /> Ledger History (Excel)
        </button>
        <button className="btn btn-outline" onClick={() => handleDownload(reportsApi.downloadPOSummaryExcel, 'po_summary.xlsx')}>
          <FileSpreadsheet size={17} style={{ marginRight: '5px' }} /> PO Summary (Excel)
        </button>
        <button className="btn btn-outline" onClick={() => handleDownload(reportsApi.downloadRateTrendsExcel, 'rate_trends.xlsx')}>
          <FileSpreadsheet size={17} style={{ marginRight: '5px' }} /> Rate Trends (Excel)
        </button>
        <button className="btn btn-outline" onClick={() => handleDownload(reportsApi.downloadSupplierPerformanceExcel, 'supplier_performance.xlsx')}>
          <FileSpreadsheet size={17} style={{ marginRight: '5px' }} /> Supplier Performance (Excel)
        </button>
        <button className="btn btn-outline" onClick={() => handleDownload(reportsApi.downloadWastageExcel, 'wastage_writeoff.xlsx')}>
          <FileSpreadsheet size={17} style={{ marginRight: '5px' }} /> Wastage & Write-off (Excel)
        </button>
        <button className="btn btn-outline" onClick={() => handleDownload(reportsApi.downloadReconciliationExcel, 'reconciliation.xlsx')}>
          <FileSpreadsheet size={17} style={{ marginRight: '5px' }} /> Reconciliation (Excel)
        </button>
      </div>

      <div className="sec"><span className="sec-title">Unit-wise Consumption</span></div>
      <div className="card card-pad">
        {unitConsumption.map((u) => (
          <div key={u.n} className="hbar">
            <div className="top">
              <span className="nm">{u.n}</span>
              <span className="amt num">{n0(u.v)} kg</span>
            </div>
            <div className="bar">
              <i className="ok" style={{ width: `${Math.max(1, Math.round((u.v / (maxU || 1)) * 100))}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
