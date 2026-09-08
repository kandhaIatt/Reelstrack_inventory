import React, { useEffect, useState } from 'react';
import { posApi } from '../api/services';
import { Download } from 'lucide-react';
import { downloadCsv } from '../utils/exportCsv';

export default function POReportsScreen() {
  const [pos, setPos] = useState([]);

  useEffect(() => {
    posApi.getAll().then((res) => setPos(res.data));
  }, []);

  const totalValue = (po) => (po.items || []).reduce((sum, item) => sum + Number(item.kg || 0) * Number(item.rate || 0), 0) * 1.18;
  const monthly = Object.entries(pos.reduce((result, po) => {
    const month = (po.date || '').split(' ')[1] || 'Unknown';
    result[month] = (result[month] || 0) + totalValue(po) / 100000;
    return result;
  }, {})).map(([m, v]) => ({ m, v }));
  const maxM = Math.max(...monthly.map((m) => m.v));

  const supplierValues = Object.entries(pos.reduce((result, po) => {
    result[po.supplier] = (result[po.supplier] || 0) + totalValue(po);
    return result;
  }, {}));
  const supplierTotal = supplierValues.reduce((sum, [, value]) => sum + value, 0);
  const bySupplier = supplierValues.map(([n, value]) => ({ n, value, v: `₹${(value / 100000).toFixed(2)}L`, p: supplierTotal ? Math.round(value / supplierTotal * 100) : 0 }));
  const reelsOrdered = pos.reduce((sum, po) => sum + (po.items || []).reduce((itemSum, item) => itemSum + Number(item.qty || 0), 0), 0);
  const weightOrdered = pos.reduce((sum, po) => sum + (po.items || []).reduce((itemSum, item) => itemSum + Number(item.kg || 0), 0), 0);
  const avgRate = weightOrdered ? pos.reduce((sum, po) => sum + (po.items || []).reduce((itemSum, item) => itemSum + Number(item.kg || 0) * Number(item.rate || 0), 0), 0) / weightOrdered : 0;
  const exportReport = () => downloadCsv('purchase-order-report.csv', [
    { label: 'PO No', value: (po) => po.id },
    { label: 'Supplier', value: (po) => po.supplier },
    { label: 'Unit', value: (po) => po.unit },
    { label: 'Date', value: (po) => po.date },
    { label: 'Status', value: (po) => po.status },
    { label: 'Value incl GST', value: totalValue },
  ], pos);

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">PO Reports</h1>
        <p className="page-sub">Live procurement analytics</p>
      </div>

      <div className="stats-grid">
        <div className="stat"><div className="stat-label">Purchase Value</div><div className="stat-value num">₹{(supplierTotal / 100000).toFixed(2)}L</div></div>
        <div className="stat"><div className="stat-label">Reels Ordered</div><div className="stat-value num">{reelsOrdered}</div></div>
        <div className="stat"><div className="stat-label">Weight Ordered</div><div className="stat-value num">{Math.round(weightOrdered).toLocaleString('en-IN')}<small>kg</small></div></div>
        <div className="stat"><div className="stat-label">Avg Rate</div><div className="stat-value num">₹{avgRate.toFixed(2)}<small>/kg</small></div></div>
      </div>

      <div className="sec"><span className="sec-title">Monthly Purchase Value (₹ Lakhs)</span></div>
      <div className="card card-pad">
        <div className="barchart">
          {monthly.map((m) => (
            <div key={m.m} className={`col ${m.v === maxM ? 'peak' : ''}`}>
              <span className="val num">{m.v}</span>
              <span className="stem" style={{ height: `${Math.round((m.v / maxM) * 100)}%` }} />
              <span className="lbl">{m.m}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sec"><span className="sec-title">Supplier Share</span></div>
      <div className="card card-pad">
        {bySupplier.map((s) => (
          <div key={s.n} className="hbar">
            <div className="top">
              <span className="nm">{s.n}</span>
              <span><span className="amt num">{s.v}</span><span className="pct num">{s.p}%</span></span>
            </div>
            <div className="bar">
              <i style={{ width: `${s.p}%` }} />
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-ghost mt18" onClick={exportReport} disabled={!pos.length}>
        <Download size={17} /> Export report
      </button>
    </div>
  );
}
