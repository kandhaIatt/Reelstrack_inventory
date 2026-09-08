import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { posApi } from '../api/services';
import { Search, Plus, BarChart3, ChevronRight, FileText } from 'lucide-react';

export default function PurchaseOrdersScreen() {
  const navigate = useNavigate();
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    posApi.getAll()
      .then((res) => setPos(res.data))
      .finally(() => setLoading(false));
  }, []);

  const n0 = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');
  const inr = (v) => '₹' + Math.round(Number(v || 0)).toLocaleString('en-IN');

  const filtered = pos.filter((p) => {
    const q = search.toLowerCase().trim();
    if (q && !(p.id.toLowerCase().includes(q) || p.supplier.toLowerCase().includes(q))) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  const getTotals = (p) => {
    const sub = p.items ? p.items.reduce((s, i) => s + i.kg * i.rate, 0) : 0;
    const reels = p.items ? p.items.reduce((s, i) => s + i.qty, 0) : 0;
    const kg = p.items ? p.items.reduce((s, i) => s + i.kg, 0) : 0;
    return { sub, total: sub * 1.18, reels, kg };
  };

  return (
    <div>
      <div className="page-head">
        <div className="between wrap">
          <div>
            <h1 className="page-title">Purchase Orders</h1>
            <p className="page-sub">Procurement across all mills and suppliers</p>
          </div>
          <div className="btn-row">
            <button className="btn btn-sm btn-ghost" onClick={() => navigate('/po-reports')}>
              <BarChart3 size={15} /> PO reports
            </button>
            <button className="btn btn-sm btn-primary" onClick={() => navigate('/pos/create')}>
              <Plus size={15} /> New PO
            </button>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="searchbar">
          <span className="ico"><Search size={17} /></span>
          <input
            className="input"
            placeholder="Search PO or supplier"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="chip-scroll mt14">
        <button className={`chip ${!statusFilter ? 'on' : ''}`} onClick={() => setStatusFilter('')}>
          All
        </button>
        {['Pending Approval', 'Open', 'Partially Received', 'Completed', 'Cancelled'].map((s) => (
          <button
            key={s}
            className={`chip ${statusFilter === s ? 'on' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt14">
        {loading ? (
          <div className="empty">Loading purchase orders...</div>
        ) : !filtered.length ? (
          <div className="empty">
            <div className="ei"><FileText size={24} /></div>
            <div className="et">No purchase orders found</div>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>PO No</th>
                  <th>Supplier</th>
                  <th>Date</th>
                  <th className="r">Reels</th>
                  <th className="r">Weight</th>
                  <th className="r">Amount</th>
                  <th>Received</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const t = getTotals(p);
                  const pct = t.reels ? Math.round((p.received || 0) / t.reels * 100) : 0;
                  return (
                    <tr key={p.id} onClick={() => navigate(`/pos/${p.id}`)}>
                      <td className="id num">{p.id}</td>
                      <td>{p.supplier}<div className="dim">{p.unit}</div></td>
                      <td>{p.date}</td>
                      <td className="r num">{t.reels}</td>
                      <td className="r num">{n0(t.kg)}</td>
                      <td className="r num" style={{ fontWeight: 660 }}>{inr(t.total)}</td>
                      <td>
                        <span className="bar"><i style={{ width: `${pct}%` }} /></span>
                        <div className="dim">{p.received || 0} of {t.reels} reels</div>
                      </td>
                      <td>
                        <span className={`badge ${p.status === 'Pending Approval' ? 'b-warn' : p.status === 'Completed' ? 'b-ok' : 'b-info'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
