import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reelsApi } from '../api/services';
import { Search, Filter, Rows, Grid, Download, Scissors, ChevronRight, Disc } from 'lucide-react';
import { downloadCsv } from '../utils/exportCsv';

export default function ReelsScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdmin = user?.role === 'ADMIN';

  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [millFilter, setMillFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [widthFilter, setWidthFilter] = useState('');

  useEffect(() => {
    const unit = isAdmin ? null : user?.unitId;
    reelsApi.getAll({ unit, mill: millFilter, type: typeFilter, width: widthFilter || undefined, status: statusFilter })
      .then((res) => setReels(res.data))
      .finally(() => setLoading(false));
  }, [isAdmin, user, millFilter, typeFilter, widthFilter, statusFilter]);

  const n0 = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');
  const n2 = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const getStatus = (r) => {
    if (r.remaining < 1) return 'Exhausted';
    if (r.remaining / r.orig < 0.25) return 'Low Stock';
    return 'Available';
  };

  const filtered = reels.filter((r) => {
    const q = search.toLowerCase().trim();
    if (q && !(r.id.toLowerCase().includes(q) || r.mill.toLowerCase().includes(q) || r.type.toLowerCase().includes(q))) {
      return false;
    }
    return true;
  });

  const mills = [...new Set(reels.map((reel) => reel.mill).filter(Boolean))];
  const types = [...new Set(reels.map((reel) => reel.type).filter(Boolean))];
  const widths = [...new Set(reels.map((reel) => reel.width).filter(Boolean))].sort((a, b) => a - b);

  const totalAvailKg = filtered.reduce((s, r) => s + r.remaining, 0);
  const exportInventory = () => downloadCsv('reel-inventory.csv', [
    { label: 'Reel No', value: (reel) => reel.id },
    { label: 'Type', value: (reel) => reel.type },
    { label: 'GSM', value: (reel) => reel.gsm },
    { label: 'Width (cm)', value: (reel) => reel.width },
    { label: 'Mill', value: (reel) => reel.mill },
    { label: 'Unit', value: (reel) => reel.unit },
    { label: 'Original (kg)', value: (reel) => reel.orig },
    { label: 'Remaining (kg)', value: (reel) => reel.remaining },
    { label: 'Status', value: getStatus },
  ], filtered);

  return (
    <div>
      <div className="page-head">
        <div className="between wrap">
          <div>
            <h1 className="page-title">Reel Inventory</h1>
            <p className="page-sub">
              {filtered.length} reels · {n0(totalAvailKg)} kg available
            </p>
          </div>
          <div className="btn-row">
            <button className="btn btn-sm btn-ghost" onClick={exportInventory} disabled={!filtered.length}>
              <Download size={15} /> Export
            </button>
            <button className="btn btn-sm btn-primary" onClick={() => navigate('/jobs/new')}>
              <Scissors size={15} /> New job
            </button>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="searchbar">
          <span className="ico">
            <Search size={17} />
          </span>
          <input
            className="input"
            placeholder="Search reel, mill or type"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Filter size={18} aria-hidden="true" />
        <select className="select filter-select" aria-label="Filter by mill" value={millFilter} onChange={(e) => setMillFilter(e.target.value)}>
          <option value="">All mills</option>
          {mills.map((mill) => <option key={mill} value={mill}>{mill}</option>)}
        </select>
        <select className="select filter-select" aria-label="Filter by type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All types</option>
          {types.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        <select className="select filter-select" aria-label="Filter by width" value={widthFilter} onChange={(e) => setWidthFilter(e.target.value)}>
          <option value="">All widths</option>
          {widths.map((width) => <option key={width} value={width}>{width} cm</option>)}
        </select>
        <div className="seg-view">
          <button className={viewMode === 'table' ? 'on' : ''} onClick={() => setViewMode('table')}>
            <Rows size={14} /> Table
          </button>
          <button className={viewMode === 'cards' ? 'on' : ''} onClick={() => setViewMode('cards')}>
            <Grid size={14} /> Cards
          </button>
        </div>
      </div>

      <div className="chip-scroll mt14">
        <button className={`chip ${!statusFilter ? 'on' : ''}`} onClick={() => setStatusFilter('')}>
          All
        </button>
        {['Available', 'Low Stock', 'Exhausted'].map((s) => (
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
          <div className="empty">Loading inventory...</div>
        ) : !filtered.length ? (
          <div className="empty">
            <div className="ei"><Disc size={24} /></div>
            <div className="et">No reels match</div>
            <div className="es">Try clearing search or filters</div>
          </div>
        ) : viewMode === 'table' ? (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Reel No</th>
                  <th>Type</th>
                  <th>Width</th>
                  <th>Mill</th>
                  <th>Unit</th>
                  <th className="r">Original</th>
                  <th className="r">Remaining</th>
                  <th>Usage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const st = getStatus(r);
                  const pct = Math.min(100, ((r.orig - r.remaining) / r.orig) * 100);
                  return (
                    <tr key={r.id} onClick={() => navigate(`/reels/${r.id}`)}>
                      <td className="id num">{r.id}</td>
                      <td>
                        {r.type}
                        <div className="dim">{r.gsm} GSM {r.bf ? `· BF ${r.bf}` : ''}</div>
                      </td>
                      <td className="num">{r.width} cm</td>
                      <td>{r.mill}</td>
                      <td>{r.unit}</td>
                      <td className="r num">{n0(r.orig)}</td>
                      <td className="r num" style={{ fontWeight: 660, color: st === 'Low Stock' ? 'var(--warn)' : st === 'Exhausted' ? 'var(--danger)' : 'var(--ok)' }}>
                        {n2(r.remaining)}
                      </td>
                      <td>
                        <span className="bar">
                          <i
                            className={st === 'Low Stock' ? 'warn' : st === 'Exhausted' ? 'danger' : 'ok'}
                            style={{ width: `${pct}%` }}
                          />
                        </span>
                        <div className="dim">{Math.round(pct)}% used</div>
                      </td>
                      <td>
                        <span className={`badge ${st === 'Low Stock' ? 'b-warn' : st === 'Exhausted' ? 'b-muted' : 'b-ok'}`}>
                          {st}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="tbl-foot">
              <span>{filtered.length} reels</span>
              <span className="num">{n0(totalAvailKg)} kg available</span>
            </div>
          </div>
        ) : (
          <div className="list-grid">
            {filtered.map((r) => {
              const st = getStatus(r);
              const pct = Math.min(100, ((r.orig - r.remaining) / r.orig) * 100);
              return (
                <div key={r.id} className="card tap" onClick={() => navigate(`/reels/${r.id}`)}>
                  <div className="card-pad">
                    <div className="reel-head">
                      <div>
                        <div className="reel-no num">{r.id}</div>
                        <div className="reel-meta">{r.type} · {r.gsm} GSM · {r.width} cm</div>
                        <div className="reel-meta">{r.mill}</div>
                      </div>
                      <span className={`badge ${st === 'Low Stock' ? 'b-warn' : st === 'Exhausted' ? 'b-muted' : 'b-ok'}`}>
                        {st}
                      </span>
                    </div>
                    <div className="wt-row">
                      <div className="wt">
                        <div className="k">Original</div>
                        <div className="v num">{n0(r.orig)}<small>kg</small></div>
                      </div>
                      <div className="wt">
                        <div className="k">Remaining</div>
                        <div className="v num" style={{ color: st === 'Low Stock' ? 'var(--warn)' : 'var(--ok)' }}>
                          {n2(r.remaining)}<small>kg</small>
                        </div>
                      </div>
                      <div className="wt">
                        <div className="k">Unit</div>
                        <div className="v">{r.unit}</div>
                      </div>
                    </div>
                    <div className="bar mt10">
                      <i className={st === 'Low Stock' ? 'warn' : 'ok'} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="card-foot">
                    <span>Received {r.rec}</span>
                    <span className="link">View details <ChevronRight size={13} /></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
