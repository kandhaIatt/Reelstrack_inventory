import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, reelsApi, mastersApi } from '../api/services';
import { BarChart3, FileText, Scissors, ChevronRight, Factory, AlertTriangle, ArrowRightLeft, Check, Clock } from 'lucide-react';

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [units, setUnits] = useState([]);
  const [reels, setReels] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const unitFilter = isAdmin ? null : user?.unitId;
    dashboardApi.getStats(unitFilter).then((res) => setStats(res.data)).catch(() => setError('Dashboard data could not be loaded.'));
    dashboardApi.getActivity().then((res) => setActivities(res.data)).catch(() => {});
    mastersApi.getUnits().then((res) => setUnits(res.data)).catch(() => {});
    reelsApi.getAll(unitFilter).then((res) => setReels(res.data)).catch(() => {});
  }, [isAdmin, user]);

  const n0 = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');
  const n2 = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const lowStockReels = reels.filter(
    (r) => (r.remaining / r.orig) < 0.25 || r.remaining < 1
  ).slice(0, 5);

  return (
    <div>
      <div className="page-head">
        <div className="between wrap">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-sub">
              {isAdmin ? 'Manufacturing overview · All units · August 2026' : `${user?.unitId || 'U1'} Unit · Operator view`}
            </p>
          </div>
          <div className="btn-row">
            <button className="btn btn-sm btn-ghost" onClick={() => navigate('/reports')}>
              <BarChart3 size={15} /> Reports
            </button>
            {isAdmin && (
              <button className="btn btn-sm btn-ghost" onClick={() => navigate('/pos/create')}>
                <FileText size={15} /> New PO
              </button>
            )}
            <button className="btn btn-sm btn-primary" onClick={() => navigate('/jobs/new')}>
              <Scissors size={15} /> New job
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat">
          <div className="stat-label">{isAdmin ? 'Total Reels' : 'Reels at Unit'}</div>
          <div className="stat-value num">{n0(stats?.totalReels)}</div>
          <div className="stat-foot">{isAdmin ? 'Across 6 units' : 'Active inventory'}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Total Weight</div>
          <div className="stat-value num">{n0(stats?.totalWeight)}<small>kg</small></div>
          <div className="stat-foot">procured</div>
        </div>
        <div className="stat">
          <div className="stat-label">Available Weight</div>
          <div className="stat-value num" style={{ color: 'var(--ok)' }}>{n0(stats?.availableWeight)}<small>kg</small></div>
          <div className="stat-foot">
            {stats?.totalWeight ? Math.round((stats.availableWeight / stats.totalWeight) * 100) : 0}% of stock
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Active Jobs</div>
          <div className="stat-value num">{n0(stats?.activeJobs)}</div>
          <div className="stat-foot">Running now</div>
        </div>
        {isAdmin && (
          <div className="stat">
            <div className="stat-label">Pending POs</div>
            <div className="stat-value num" style={{ color: 'var(--warn)' }}>{n0(stats?.pendingPOs)}</div>
            <div className="stat-foot">Awaiting approval</div>
          </div>
        )}
      </div>

      <div className="two-col mt18">
        <div className="col-stack">
          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">Stock utilisation</span>
              <span className="small muted num">
                {n0(stats?.consumedWeight)} kg of {n0(stats?.totalWeight)} kg consumed
              </span>
            </div>
            <div className="bar">
              <i
                style={{
                  width: `${stats?.totalWeight ? Math.round((stats.consumedWeight / stats.totalWeight) * 100) : 0}%`,
                }}
              />
            </div>
            <div className="between mt10 small muted">
              <span>
                Available <b className="num" style={{ color: 'var(--ok)' }}>{n0(stats?.availableWeight)} kg</b>
              </span>
              <span>
                {stats?.totalWeight ? Math.round((stats.consumedWeight / stats.totalWeight) * 100) : 0}% used
              </span>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">{isAdmin ? 'Units Overview' : 'Your Unit Details'}</span>
              {isAdmin && (
                <button className="sec-link" onClick={() => navigate('/units')}>
                  All units <ChevronRight size={13} />
                </button>
              )}
            </div>
            <div className="list-grid">
              {(isAdmin ? units.slice(0, 4) : units.filter((u) => u.id === user?.unitId)).map((u) => (
                <button
                  key={u.id}
                  className="card card-pad tap"
                  style={{ display: 'block', width: '100%', textAlign: 'left' }}
                  onClick={() => navigate(`/units/${u.id}`)}
                >
                  <div className="between">
                    <div className="row">
                      <div className="li-ico">
                        <Factory size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '15.5px', fontWeight: 660 }}>{u.name}</div>
                        <div className="tiny muted">{u.city} · {u.incharge}</div>
                      </div>
                    </div>
                    <ChevronRight size={18} className="li-chev" />
                  </div>
                  <div className="wt-row">
                    <div className="wt">
                      <div className="k">Reels</div>
                      <div className="v num">{u.targetReels || 0}</div>
                    </div>
                    <div className="wt">
                      <div className="k">Available</div>
                      <div className="v num">{n0(u.targetWeight)}<small>kg</small></div>
                    </div>
                    <div className="wt">
                      <div className="k">Active Jobs</div>
                      <div className="v num">{u.targetJobs || 0}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-stack">
          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">Needs attention</span>
              <button className="sec-link" onClick={() => navigate('/reels?status=Low+Stock')}>
                Low stock <ChevronRight size={13} />
              </button>
            </div>
            {lowStockReels.length ? (
              <div className="lines">
                {lowStockReels.map((r) => (
                  <div key={r.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/reels/${r.id}`)}>
                    <span className="k num">
                      {r.id} <span className="muted">· {r.unit}</span>
                    </span>
                    <span className="v">
                      <span className="badge b-warn">
                        {r.remaining < 1 ? 'Exhausted' : 'Low Stock'}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="small muted">All reels are healthy.</div>
            )}
          </div>

          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">Recent activity</span>
            </div>
            <div className="tl">
              {activities.slice(0, 6).map((a, idx) => (
                <div key={idx} className="tl-item">
                  <div className="tl-dot" style={{ color: a.tone === 'ok' ? '#12805c' : '#0d7c8f' }}>
                    {a.icon === 'scissors' ? <Scissors size={14} /> : <ArrowRightLeft size={14} />}
                  </div>
                  <div className="tl-title">{a.title}</div>
                  {a.sub && <div className="tl-sub">{a.sub}</div>}
                  <div className="tl-time">{a.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
