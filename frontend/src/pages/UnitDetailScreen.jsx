import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mastersApi, reelsApi, jobsApi } from '../api/services';
import { Factory, Disc, ChevronRight } from 'lucide-react';

export default function UnitDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [unit, setUnit] = useState(null);
  const [reels, setReels] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    mastersApi.getUnits()
      .then((res) => {
        const found = res.data.find((u) => u.id === id);
        setUnit(found);
      });
    reelsApi.getAll(id).then((res) => setReels(res.data));
    jobsApi.getAll(id).then((res) => setJobs(res.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="empty">Loading unit details...</div>;
  if (!unit) return <div className="empty">Unit not found</div>;

  const n0 = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');
  const n2 = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const availKg = reels.reduce((s, r) => s + r.remaining, 0);

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">{unit.name}</h1>
        <p className="page-sub">{unit.city} · In-charge: {unit.incharge}</p>
      </div>

      <div className="grid-3">
        <div className="stat"><div className="stat-label">Reels</div><div className="stat-value num">{reels.length}</div></div>
        <div className="stat"><div className="stat-label">Available</div><div className="stat-value num">{n0(availKg)}<small>kg</small></div></div>
        <div className="stat"><div className="stat-label">Jobs</div><div className="stat-value num">{jobs.length}</div></div>
      </div>

      <div className="sec"><span className="sec-title">Reels at this Unit</span></div>
      {reels.length ? (
        <div className="listcard">
          {reels.map((r) => (
            <button key={r.id} className="li" onClick={() => navigate(`/reels/${r.id}`)}>
              <span className="li-ico"><Disc size={18} /></span>
              <span className="li-main">
                <span className="li-title num">{r.id}</span>
                <span className="li-sub">{r.gsm} GSM {r.type} · {n2(r.remaining)} kg left</span>
              </span>
              <ChevronRight size={17} className="li-chev" />
            </button>
          ))}
        </div>
      ) : (
        <div className="card card-pad muted small">No reels currently at this unit.</div>
      )}
    </div>
  );
}
