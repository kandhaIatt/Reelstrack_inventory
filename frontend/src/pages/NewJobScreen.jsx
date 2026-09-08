import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { reelsApi, jobsApi } from '../api/services';
import { Scissors, Search, AlertTriangle, Check } from 'lucide-react';

export default function NewJobScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast, openSheet, closeSheet } = useApp();

  const [reelId, setReelId] = useState(searchParams.get('reelId') || '');
  const [w, setW] = useState(80);
  const [l, setL] = useState(63);
  const [gsm, setGsm] = useState(120);
  const [sheets, setSheets] = useState(3000);
  const [corr, setCorr] = useState(true);
  const [f, setF] = useState(0.45);

  const [calc, setCalc] = useState(null);
  const [reel, setReel] = useState(null);
  const [reelsList, setReelsList] = useState([]);

  useEffect(() => {
    reelsApi.getAll(user?.role === 'ADMIN' ? null : user?.unitId).then((res) => {
      setReelsList(res.data);
    });
  }, [user]);

  useEffect(() => {
    if (reelId) {
      reelsApi.getById(reelId).then((res) => {
        setReel(res.data);
        if (res.data.gsm) setGsm(res.data.gsm);
      }).catch(() => setReel(null));
    } else {
      setReel(null);
    }
  }, [reelId]);

  useEffect(() => {
    const payload = { reelId, w: Number(w), l: Number(l), gsm: Number(gsm), sheets: Number(sheets), corr, f: Number(f) };
    jobsApi.calculate(payload).then((res) => setCalc(res.data)).catch(() => {});
  }, [reelId, w, l, gsm, sheets, corr, f]);

  const n0 = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');
  const n2 = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const n3 = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  const handleRecommend = async () => {
    const payload = { w: Number(w), l: Number(l), gsm: Number(gsm), sheets: Number(sheets), corr, f: Number(f) };
    try {
      const res = await reelsApi.recommend(payload, user?.role === 'ADMIN' ? null : user?.unitId);
      const candidates = res.data;

      if (!candidates.length) {
        handleSplitPlan();
        return;
      }

      openSheet(
        'Recommend a reel',
        <div>
          <div className="card card-pad" style={{ boxShadow: 'none', background: 'var(--surface-2)' }}>
            <div className="lines">
              <div><span className="k">Cutting size</span><span className="v num">{w} × {l} cm</span></div>
              <div><span className="k">Effective GSM</span><span className="v num">{Math.round(calc?.effGsm || gsm)} GSM</span></div>
              <div><span className="k">Sheets</span><span className="v num">{n0(sheets)}</span></div>
              <div className="total">
                <span className="k" style={{ fontWeight: 640 }}>Material needed</span>
                <span className="v num">{n3(calc?.kg || 0)} kg</span>
              </div>
            </div>
          </div>

          <div className="sec"><span className="sec-title">{candidates.length} reels can run this job</span></div>
          {candidates.slice(0, 6).map((c, i) => (
            <button
              key={c.reel.id}
              className="item-card mt10"
              style={{ display: 'block', width: '100%', textAlign: 'left' }}
              onClick={() => {
                setReelId(c.reel.id);
                closeSheet();
                showToast(`Reel ${c.reel.id} selected`, `${n3(c.rem)} kg available`);
              }}
            >
              <div className="between">
                <div>
                  <div className="reel-no num" style={{ fontSize: '16px' }}>{c.reel.id}</div>
                  <div className="tiny muted">{c.reel.type} · {c.reel.width} cm · {c.reel.unit}</div>
                </div>
                {i === 0 && <span className="badge b-primary">Best fit</span>}
              </div>
              <div className="wt-row" style={{ marginTop: '10px' }}>
                <div className="wt"><div className="k">Available</div><div className="v num">{n2(c.rem)}<small>kg</small></div></div>
                <div className="wt"><div className="k">Needed</div><div className="v num">{n2(c.req)}<small>kg</small></div></div>
                <div className="wt"><div className="k">Left after</div><div className="v num" style={{ color: 'var(--ok)' }}>{n2(c.leftover)}<small>kg</small></div></div>
              </div>
            </button>
          ))}
        </div>,
        <button className="btn btn-ghost btn-block" onClick={closeSheet}>Close</button>
      );
    } catch (err) {
      showToast('Recommendation failed', 'Check cut inputs', true);
    }
  };

  const handleSplitPlan = async () => {
    const payload = { w: Number(w), l: Number(l), gsm: Number(gsm), sheets: Number(sheets), corr, f: Number(f) };
    try {
      const res = await reelsApi.splitPlan(payload, user?.role === 'ADMIN' ? null : user?.unitId);
      const plan = res.data;

      openSheet(
        'Split across reels',
        <div>
          <div className="card card-pad" style={{ boxShadow: 'none', background: 'var(--surface-2)' }}>
            <div className="lines">
              <div><span className="k">Cutting size</span><span className="v num">{w} × {l} cm</span></div>
              <div><span className="k">Material needed</span><span className="v num">{n3(calc?.kg || 0)} kg</span></div>
            </div>
          </div>

          <div className="sec"><span className="sec-title">{plan.feasible ? `Split across ${plan.legs.length} reels` : 'Stock short'}</span></div>
          {plan.legs.map((leg, i) => (
            <div key={leg.reel.id} className="item-card mt10">
              <div className="between">
                <div>
                  <div className="reel-no num" style={{ fontSize: '16px' }}>{leg.reel.id}</div>
                  <div className="tiny muted">{leg.reel.type} · {leg.reel.width} cm</div>
                </div>
                <span className="badge b-primary">Reel {i + 1}</span>
              </div>
              <div className="wt-row" style={{ marginTop: '10px' }}>
                <div className="wt"><div className="k">Cut here</div><div className="v num">{n0(leg.sheets)}<small>sheets</small></div></div>
                <div className="wt"><div className="k">Consumes</div><div className="v num">{n2(leg.kg)}<small>kg</small></div></div>
                <div className="wt"><div className="k">Left after</div><div className="v num">{n2(leg.after)}<small>kg</small></div></div>
              </div>
            </div>
          ))}
        </div>,
        plan.feasible ? (
          <div className="btn-row">
            <button className="btn btn-ghost" onClick={closeSheet}>Cancel</button>
            <button className="btn btn-primary" onClick={() => executeSplitJob(payload)}>Run split job</button>
          </div>
        ) : (
          <button className="btn btn-ghost btn-block" onClick={closeSheet}>Close</button>
        )
      );
    } catch (err) {
      showToast('Split planning failed', 'Invalid cut input', true);
    }
  };

  const executeJob = async () => {
    try {
      const payload = { reelId, w: Number(w), l: Number(l), gsm: Number(gsm), sheets: Number(sheets), corr, f: Number(f) };
      const res = await jobsApi.execute(payload);
      showToast('Job completed successfully', `${res.data.no} · ${n3(res.data.kg)} kg consumed`);
      closeSheet();
      navigate(`/reels/${reelId}`);
    } catch (err) {
      showToast('Job execution failed', err.response?.data?.message || 'Check reel balance', true);
    }
  };

  const executeSplitJob = async (payload) => {
    try {
      const res = await jobsApi.executeSplit(payload);
      showToast('Split job completed', `${res.data.length} jobs created`);
      closeSheet();
      navigate('/jobs');
    } catch (err) {
      showToast('Split execution failed', 'Stock error', true);
    }
  };

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">New Job</h1>
        <p className="page-sub">Enter cutting details — consumption updates as you type</p>
      </div>

      <div className="sec" style={{ marginTop: 0 }}><span className="sec-title">Reel</span></div>
      <div className="card card-pad">
        <div className="field" style={{ marginBottom: '10px' }}>
          <label>Reel number</label>
          <input
            className="input num"
            placeholder="e.g. R-21056"
            value={reelId}
            onChange={(e) => setReelId(e.target.value)}
          />
        </div>

        {reel ? (
          <div>
            <div className="between">
              <div>
                <div style={{ fontSize: '15.5px', fontWeight: 660 }} className="num">{reel.id}</div>
                <div className="tiny muted">{reel.type} · {reel.gsm} GSM · {reel.width} cm · {reel.unit}</div>
              </div>
              <span className="badge b-ok">Available</span>
            </div>
            <div className="divider" />
            <div className="between">
              <span className="small muted">Remaining weight</span>
              <span className="num" style={{ fontSize: '19px', fontWeight: 700, color: reel.remaining < 1 ? 'var(--danger)' : 'var(--ok)' }}>
                {n3(reel.remaining)} kg
              </span>
            </div>
          </div>
        ) : (
          <div className="pill-note">
            <span>Enter a reel number or use auto-recommendation.</span>
          </div>
        )}
      </div>

      <button className="btn btn-soft btn-block mt10" onClick={handleRecommend}>
        <Search size={17} /> Recommend a reel for this job
      </button>

      <div className="sec"><span className="sec-title">Cutting Details</span></div>
      <div className="card card-pad">
        <div className="grid-2">
          <div className="field">
            <label>Cutting width</label>
            <div className="input-suffix">
              <input className="input num" type="number" value={w} onChange={(e) => setW(e.target.value)} />
              <span className="sfx">cm</span>
            </div>
          </div>
          <div className="field">
            <label>Cutting length</label>
            <div className="input-suffix">
              <input className="input num" type="number" value={l} onChange={(e) => setL(e.target.value)} />
              <span className="sfx">cm</span>
            </div>
          </div>
          <div className="field">
            <label>GSM</label>
            <div className="input-suffix">
              <input className="input num" type="number" value={gsm} onChange={(e) => setGsm(e.target.value)} />
              <span className="sfx">gsm</span>
            </div>
          </div>
          <div className="field">
            <label>Number of sheets</label>
            <div className="input-suffix">
              <input className="input num" type="number" value={sheets} onChange={(e) => setSheets(e.target.value)} />
              <span className="sfx">nos</span>
            </div>
          </div>
        </div>

        <div className="divider" />
        <div className="between">
          <div>
            <div style={{ fontWeight: 640, fontSize: '14.5px' }}>Corrugation</div>
            <div className="tiny muted">Adds flute take-up to the GSM</div>
          </div>
          <button className={`switch ${corr ? 'on' : ''}`} onClick={() => setCorr(!corr)} />
        </div>

        {corr && (
          <div style={{ marginTop: '12px' }}>
            <div className="field">
              <label>Corrugation factor</label>
              <input className="input num" type="number" step="0.01" value={f} onChange={(e) => setF(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      <div className="sec"><span className="sec-title">Live Calculation</span></div>
      <div className={`calc ${calc?.isOk ? '' : 'calc-warn'}`}>
        <div className="calc-top">
          <div className="stat-label">Estimated consumption</div>
          <div className="calc-big" style={{ marginTop: '6px' }}>
            <b className="num">{n3(calc?.kg || 0)}</b><span>kg</span>
          </div>
          <div className="calc-eq num">
            {n0(sheets)} × {Math.round(calc?.effGsm || gsm)} GSM × {(w/100).toFixed(2)}m × {(l/100).toFixed(2)}m ÷ 1000
          </div>
        </div>

        <div className="card-pad" style={{ padding: '12px 14px' }}>
          <div className="lines">
            <div><span className="k">Effective GSM</span><span className="v num">{Math.round(calc?.effGsm || gsm)} GSM</span></div>
            <div><span className="k">Previous balance</span><span className="v num">{calc?.prevBalance ? `${n3(calc.prevBalance)} kg` : '—'}</span></div>
            <div>
              <span className="k">Remaining after job</span>
              <span className="v num" style={{ color: calc?.isOk ? 'var(--ok)' : 'var(--danger)' }}>
                {calc?.afterBalance !== undefined ? `${n3(calc.afterBalance)} kg` : '—'}
              </span>
            </div>
          </div>
        </div>

        {calc && !calc.isOk && reel && (
          <div className="alert">
            <AlertTriangle size={18} />
            <div>
              <div className="t">Insufficient material</div>
              <div className="s num">Required {n2(calc.kg)} kg · Available {n2(calc.prevBalance)} kg</div>
              <button className="btn btn-sm btn-danger mt10" onClick={handleSplitPlan}>
                Split across reels
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt14">
        <button
          className="btn btn-primary btn-block"
          disabled={!calc?.isOk}
          onClick={() => {
            openSheet(
              'Confirm Job',
              <div>
                <div className="lines">
                  <div><span className="k">Reel</span><span className="v num">{reelId}</span></div>
                  <div><span className="k">Sheet size</span><span className="v num">{w} × {l} cm</span></div>
                  <div><span className="k">Sheets</span><span className="v num">{n0(sheets)}</span></div>
                  <div><span className="k">Consumption</span><span className="v num" style={{ color: 'var(--danger)' }}>{n3(calc.kg)} kg</span></div>
                  <div><span className="k">Balance after</span><span className="v num" style={{ color: 'var(--ok)' }}>{n3(calc.afterBalance)} kg</span></div>
                </div>
              </div>,
              <div className="btn-row">
                <button className="btn btn-ghost" onClick={closeSheet}>Edit</button>
                <button className="btn btn-primary" onClick={executeJob}>Confirm job</button>
              </div>
            );
          }}
        >
          <Check size={18} /> {reel ? 'Complete job' : 'Select a reel to continue'}
        </button>
      </div>
    </div>
  );
}
