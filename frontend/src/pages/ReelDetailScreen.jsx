import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reelsApi, jobsApi, transfersApi } from '../api/services';
import { Scissors, ArrowRightLeft, Disc } from 'lucide-react';

export default function ReelDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reel, setReel] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      reelsApi.getById(id),
      jobsApi.getAll(null, id),
      transfersApi.getByReel(id),
    ])
      .then(([rRes, jRes, tRes]) => {
        setReel(rRes.data);
        setJobs(jRes.data);
        setTransfers(tRes.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="empty">Loading reel details...</div>;
  if (!reel) return <div className="empty">Reel not found</div>;

  const n0 = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');
  const n2 = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const n3 = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  const consumed = reel.orig - reel.remaining;
  const pctLeft = Math.max(0, (reel.remaining / reel.orig) * 100);
  const st = reel.remaining < 1 ? 'Exhausted' : reel.remaining / reel.orig < 0.25 ? 'Low Stock' : 'Available';

  return (
    <div>
      <div className="page-head">
        <div className="between">
          <h1 className="page-title num">{reel.id}</h1>
          <span className={`badge ${st === 'Low Stock' ? 'b-warn' : st === 'Exhausted' ? 'b-muted' : 'b-ok'}`}>
            {st}
          </span>
        </div>
        <p className="page-sub">
          {reel.type} · {reel.gsm} GSM · {reel.mill}
        </p>
      </div>

      <div className="hero">
        <div className="hero-label">Remaining Weight</div>
        <div className="hero-main">
          <b className="num">{n3(reel.remaining)}</b>
          <span>kg</span>
        </div>
        <div className="hero-bar">
          <i style={{ width: `${pctLeft}%` }} />
        </div>
        <div className="hero-split">
          <span>Consumed <b className="num">{n2(consumed)} kg</b></span>
          <span>{Math.round(pctLeft)}% left</span>
        </div>
        <div className="hero-grid">
          <div>
            <div className="k">Original</div>
            <div className="v num">{n0(reel.orig)} kg</div>
          </div>
          <div>
            <div className="k">Jobs done</div>
            <div className="v num">{jobs.length}</div>
          </div>
          <div>
            <div className="k">Unit</div>
            <div className="v">{reel.unit}</div>
          </div>
        </div>
      </div>

      <div className="btn-row mt14">
        <button
          className="btn btn-primary"
          disabled={reel.remaining < 1}
          onClick={() => navigate(`/jobs/new?reelId=${reel.id}`)}
        >
          <Scissors size={17} /> Perform job
        </button>
        <button className="btn btn-ghost" onClick={() => navigate(`/transfers/new?reelId=${reel.id}`)}>
          <ArrowRightLeft size={17} /> Transfer
        </button>
      </div>

      <div className="sec">
        <span className="sec-title">Reel Information</span>
      </div>
      <div className="kv">
        <div><div className="k">Reel number</div><div className="v num">{reel.id}</div></div>
        <div><div className="k">Mill</div><div className="v">{reel.mill}</div></div>
        <div><div className="k">Type</div><div className="v">{reel.type}</div></div>
        <div><div className="k">BF</div><div className="v">{reel.bf || '—'}</div></div>
        <div><div className="k">GSM</div><div className="v">{reel.gsm} GSM</div></div>
        <div><div className="k">Original width</div><div className="v">{reel.width} cm</div></div>
        <div><div className="k">Original weight</div><div className="v num">{n0(reel.orig)} kg</div></div>
        <div><div className="k">Current unit</div><div className="v">{reel.unit}</div></div>
        <div><div className="k">Received on</div><div className="v">{reel.rec}</div></div>
        <div><div className="k">Source PO</div><div className="v">{reel.po || '—'}</div></div>
      </div>

      <div className="sec">
        <span className="sec-title">Job History</span>
        <span className="tiny muted">{jobs.length} jobs</span>
      </div>

      {jobs.length ? (
        jobs.map((j) => (
          <div key={j.no} className="card card-pad mt10">
            <div className="between">
              <div>
                <div className="num" style={{ fontSize: '15px', fontWeight: 660 }}>{j.no}</div>
                <div className="tiny muted">{j.date} · {j.time}</div>
              </div>
              <span className="badge b-ok">{j.status}</span>
            </div>
            <div className="row wrap mt10" style={{ gap: '6px' }}>
              <span className="badge b-muted">{j.w} × {j.l} cm</span>
              <span className="badge b-muted">{n0(j.sheets)} sheets</span>
              <span className="badge b-muted">{j.gsm} GSM</span>
              {j.corr && <span className="badge b-primary">Corrugated ×{(1 + j.f).toFixed(2)}</span>}
            </div>
            <div className="wt-row">
              <div className="wt">
                <div className="k">Effective GSM</div>
                <div className="v num">{Math.round(j.effGsm)}</div>
              </div>
              <div className="wt">
                <div className="k">Consumed</div>
                <div className="v num" style={{ color: 'var(--danger)' }}>{n3(j.kg)}<small>kg</small></div>
              </div>
              <div className="wt">
                <div className="k">Balance after</div>
                <div className="v num">{n3(j.after)}<small>kg</small></div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="card card-pad muted small">No jobs recorded on this reel yet.</div>
      )}
    </div>
  );
}
