import React, { useState, useEffect } from 'react';
import { dashboardApi, reelsApi } from '../api/services';
import { Download } from 'lucide-react';
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
  const exportReport = () => downloadCsv('inventory-report.csv', [
    { label: 'Metric', value: (row) => row.metric },
    { label: 'Value', value: (row) => row.value },
  ], [
    { metric: 'Total Reels', value: stats?.totalReels || 0 },
    { metric: 'Total Weight (kg)', value: stats?.totalWeight || 0 },
    { metric: 'Available Weight (kg)', value: stats?.availableWeight || 0 },
    { metric: 'Consumed Weight (kg)', value: stats?.consumedWeight || 0 },
    ...unitConsumption.map((unit) => ({ metric: `Consumed - ${unit.n} (kg)`, value: unit.v })),
  ]);

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">Reports</h1>
        <p className="page-sub">Live inventory and consumption</p>
      </div>

      <div className="sec" style={{ marginTop: 0 }}><span className="sec-title">Inventory Summary</span></div>
      <div className="stats-grid">
        <div className="stat"><div className="stat-label">Total Reels</div><div className="stat-value num">{stats?.totalReels || 0}</div></div>
        <div className="stat"><div className="stat-label">Total Weight</div><div className="stat-value num">{n0(stats?.totalWeight)}<small>kg</small></div></div>
        <div className="stat"><div className="stat-label">Available</div><div className="stat-value num">{n0(stats?.availableWeight)}<small>kg</small></div></div>
        <div className="stat"><div className="stat-label">Consumed</div><div className="stat-value num">{n0(stats?.consumedWeight)}<small>kg</small></div></div>
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
              <i className="ok" style={{ width: `${Math.round((u.v / maxU) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-ghost mt18" onClick={exportReport} disabled={!stats}>
        <Download size={17} /> Export report
      </button>
    </div>
  );
}
