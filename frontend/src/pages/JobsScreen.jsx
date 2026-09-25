import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { jobsApi } from '../api/services';
import { Search, Plus, Rows, Grid, Download, Scissors, RotateCcw } from 'lucide-react';
import { downloadCsv } from '../utils/exportCsv';

export default function JobsScreen() {
  const { user } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') || '';
  const viewMode = searchParams.get('view') || 'table';

  const setSearch = (q) => {
    setSearchParams(prev => {
      if (q) prev.set('q', q);
      else prev.delete('q');
      return prev;
    }, { replace: true });
  };

  const setViewMode = (view) => {
    setSearchParams(prev => {
      if (view && view !== 'table') prev.set('view', view);
      else prev.delete('view');
      return prev;
    }, { replace: true });
  };

  const loadJobs = () => {
    setLoading(true);
    jobsApi.getAll(isAdmin ? null : user?.unitId)
      .then((res) => setJobs(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadJobs();
  }, [isAdmin, user]);

  const handleReverse = async (id) => {
    if (!window.confirm(`Are you sure you want to reverse job ${id}? This will restore the reel weight.`)) return;
    try {
      await jobsApi.reverseJob(id);
      showToast('Job Reversed', `Job ${id} reversed successfully`);
      loadJobs();
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to reverse job', true);
    }
  };

  const n0 = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');
  const n3 = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase().trim();
    if (q && !(j.no.toLowerCase().includes(q) || j.reel.toLowerCase().includes(q))) return false;
    return true;
  });

  const totalConsumedKg = filtered.reduce((s, j) => s + (j.status === 'Completed' ? j.totalKg || j.kg : 0), 0);
  const exportJobs = () => downloadCsv('cutting-jobs.csv', [
    { label: 'Job No', value: (job) => job.no },
    { label: 'Reel', value: (job) => job.reel },
    { label: 'Unit', value: (job) => job.unit },
    { label: 'Width (cm)', value: (job) => job.w },
    { label: 'Length (cm)', value: (job) => job.l },
    { label: 'GSM', value: (job) => job.gsm },
    { label: 'Sheets', value: (job) => job.sheets },
    { label: 'Output (kg)', value: (job) => job.kg },
    { label: 'Waste (kg)', value: (job) => job.waste || 0 },
    { label: 'Total Consumed (kg)', value: (job) => job.totalKg || job.kg },
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
                  <th>Size</th>
                  <th>Sheets</th>
                  <th>Output</th>
                  <th>Waste</th>
                  <th>Consumed</th>
                  <th>Status</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((j) => (
                  <tr key={j.no} className="hover">
                    <td>
                      <div className="num" style={{ fontWeight: 640 }}>{j.no}</div>
                      <div className="tiny muted">{j.date} {j.time}</div>
                    </td>
                    <td><div className="num" style={{ color: 'var(--primary)' }}>{j.reel}</div></td>
                    <td>
                      <div className="num">{j.w}×{j.l}</div>
                      <div className="tiny muted">{j.gsm} GSM</div>
                    </td>
                    <td><div className="num">{n0(j.sheets)}</div></td>
                    <td><div className="num">{n3(j.kg)}<small>kg</small></div></td>
                    <td><div className="num">{n3(j.waste || 0)}<small>kg</small></div></td>
                    <td><div className="num" style={{ fontWeight: 600 }}>{n3(j.totalKg || j.kg)}<small>kg</small></div></td>
                    <td>
                      <span className={`badge ${j.status === 'Completed' ? 'b-ok' : 'b-warn'}`}>{j.status}</span>
                    </td>
                    {isAdmin && (
                      <td>
                        {j.status === 'Completed' && (
                          <button className="btn btn-sm btn-ghost" onClick={() => handleReverse(j.id || j.no)} title="Reverse Job">
                            <RotateCcw size={15} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid-2">
            {filtered.map((j) => (
              <div key={j.no} className="item-card">
                <div className="between">
                  <div>
                    <div className="num" style={{ fontWeight: 660 }}>{j.no}</div>
                    <div className="tiny muted">{j.date} {j.time}</div>
                  </div>
                  <span className={`badge ${j.status === 'Completed' ? 'b-ok' : 'b-warn'}`}>{j.status}</span>
                </div>
                <div className="divider" />
                <div className="grid-2">
                  <div>
                    <div className="k">Reel used</div>
                    <div className="v num" style={{ color: 'var(--primary)' }}>{j.reel}</div>
                  </div>
                  <div>
                    <div className="k">Cut size</div>
                    <div className="v num">{j.w}×{j.l} · {j.gsm} GSM</div>
                  </div>
                </div>
                <div className="wt-row mt10">
                  <div className="wt"><div className="k">Output</div><div className="v num">{n3(j.kg)}<small>kg</small></div></div>
                  <div className="wt"><div className="k">Waste</div><div className="v num">{n3(j.waste || 0)}<small>kg</small></div></div>
                  <div className="wt"><div className="k">Consumed</div><div className="v num" style={{ color: 'var(--danger)' }}>{n3(j.totalKg || j.kg)}<small>kg</small></div></div>
                </div>
                {isAdmin && j.status === 'Completed' && (
                  <div className="mt10" style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                    <button className="btn btn-sm btn-ghost btn-block" onClick={() => handleReverse(j.id || j.no)}>
                      <RotateCcw size={15} /> Reverse Job
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
