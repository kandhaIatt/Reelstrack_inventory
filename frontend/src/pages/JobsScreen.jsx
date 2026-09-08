import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsApi } from '../api/services';
import { Search, Plus, Rows, Grid, Download, Scissors } from 'lucide-react';
import { downloadCsv } from '../utils/exportCsv';

export default function JobsScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    jobsApi.getAll(isAdmin ? null : user?.unitId)
      .then((res) => setJobs(res.data))
      .finally(() => setLoading(false));
  }, [isAdmin, user]);

  const n0 = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');
  const n3 = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase().trim();
    if (q && !(j.no.toLowerCase().includes(q) || j.reel.toLowerCase().includes(q))) return false;
    return true;
  });

  const totalConsumedKg = filtered.reduce((s, j) => s + (j.status === 'Completed' ? j.kg : 0), 0);
  const exportJobs = () => downloadCsv('cutting-jobs.csv', [
    { label: 'Job No', value: (job) => job.no },
    { label: 'Reel', value: (job) => job.reel },
    { label: 'Unit', value: (job) => job.unit },
    { label: 'Width (cm)', value: (job) => job.w },
    { label: 'Length (cm)', value: (job) => job.l },
    { label: 'GSM', value: (job) => job.gsm },
    { label: 'Sheets', value: (job) => job.sheets },
    { label: 'Consumed (kg)', value: (job) => job.kg },
    { label: 'Balance (kg)', value: (job) => job.after },
    { label: 'Status', value: (job) => job.status },
  ], filtered);

  return (
    <div>
      <div className="page-head">
        <div className="between wrap">
          <div>
            <h1 className="page-title">Cutting Jobs</h1>
            <p className="page-sub">
              {filtered.length} jobs · {n0(totalConsumedKg)} kg consumed
            </p>
          </div>
          <div className="btn-row">
            <button className="btn btn-sm btn-ghost" onClick={exportJobs} disabled={!filtered.length}>
              <Download size={15} /> Export
            </button>
            <button className="btn btn-sm btn-primary" onClick={() => navigate('/jobs/new')}>
              <Plus size={15} /> New job
            </button>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="searchbar">
          <span className="ico"><Search size={17} /></span>
          <input
            className="input"
            placeholder="Search job or reel"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="seg-view">
          <button className={viewMode === 'table' ? 'on' : ''} onClick={() => setViewMode('table')}>
            <Rows size={14} /> Table
          </button>
          <button className={viewMode === 'cards' ? 'on' : ''} onClick={() => setViewMode('cards')}>
            <Grid size={14} /> Cards
          </button>
        </div>
      </div>

      <div className="mt14">
        {loading ? (
          <div className="empty">Loading jobs...</div>
        ) : !filtered.length ? (
          <div className="empty">
            <div className="ei"><Scissors size={24} /></div>
            <div className="et">No jobs yet</div>
            <div className="es">Completed jobs will appear here</div>
          </div>
        ) : viewMode === 'table' ? (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Job No</th>
                  <th>Reel</th>
                  <th>Sheet size</th>
                  <th className="r">Sheets</th>
                  <th>GSM</th>
                  <th className="r">Eff. GSM</th>
                  <th className="r">Consumed</th>
                  <th className="r">Balance</th>
                  <th>When</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((j) => (
                  <tr key={j.no} onClick={() => navigate(`/reels/${j.reel}`)}>
                    <td className="id num">{j.no}</td>
                    <td className="num">{j.reel}<div className="dim">{j.unit}</div></td>
                    <td className="num">{j.w} × {j.l} cm</td>
                    <td className="r num">{n0(j.sheets)}</td>
                    <td className="num">{j.gsm}</td>
                    <td className="r num">{Math.round(j.effGsm)}</td>
                    <td className="r num" style={{ fontWeight: 660, color: 'var(--danger)' }}>{n3(j.kg)}</td>
                    <td className="r num">{n3(j.after)}</td>
                    <td>{j.date}<div className="dim">{j.time}</div></td>
                    <td><span className="badge b-ok">{j.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="tbl-foot">
              <span>{filtered.length} jobs</span>
              <span className="num">{n0(totalConsumedKg)} kg consumed</span>
            </div>
          </div>
        ) : (
          <div className="list-grid">
            {filtered.map((j) => (
              <div key={j.no} className="card card-pad" onClick={() => navigate(`/reels/${j.reel}`)}>
                <div className="between">
                  <div>
                    <div className="num" style={{ fontSize: '15px', fontWeight: 660 }}>{j.no}</div>
                    <div className="tiny muted">Reel {j.reel} · {j.unit}</div>
                  </div>
                  <span className="badge b-ok">{j.status}</span>
                </div>
                <div className="wt-row mt10">
                  <div className="wt">
                    <div className="k">Sheets</div>
                    <div className="v num">{n0(j.sheets)}</div>
                  </div>
                  <div className="wt">
                    <div className="k">Consumed</div>
                    <div className="v num" style={{ color: 'var(--danger)' }}>{n3(j.kg)}<small>kg</small></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
