import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reelsApi, jobsApi, transfersApi } from '../api/services';
import { Scissors, ArrowRightLeft, Disc, AlertTriangle, Printer, Settings } from 'lucide-react';

export default function ReelDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [reel, setReel] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  // Correction Modal State
  const [showCorrection, setShowCorrection] = useState(false);
  const [correctionWidth, setCorrectionWidth] = useState('');
  const [correctionGsm, setCorrectionGsm] = useState('');
  const [correctionMill, setCorrectionMill] = useState('');
  
  // Adjust Weight Modal State
  const [showAdjustWeight, setShowAdjustWeight] = useState(false);
  const [adjustWeightVal, setAdjustWeightVal] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustNotes, setAdjustNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      reelsApi.getById(id),
      jobsApi.getAll(null, id),
      transfersApi.getByReel(id),
      reelsApi.getLedger(id)
    ])
      .then(([rRes, jRes, tRes, lRes]) => {
        setReel(rRes.data);
        setJobs(jRes.data);
        setTransfers(tRes.data);
        setLedger(lRes.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleHold = async () => {
    if (!window.confirm(`Put reel ${id} on hold?`)) return;
    try {
      const res = await reelsApi.hold(id, 'User put on hold');
      setReel(res.data);
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleWriteOff = async () => {
    const reason = prompt('Reason for write-off:');
    if (!reason) return;
    if (!window.confirm(`Are you sure you want to completely write off reel ${id}?`)) return;
    try {
      const res = await reelsApi.writeOff(id, reason);
      setReel(res.data);
    } catch (e) {
      alert('Failed to write off reel');
    }
  };

  const handleRelease = async () => {
    try {
      const res = await reelsApi.release(id, 'User released hold');
      setReel(res.data);
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleCorrection = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {};
      if (correctionWidth) payload.width = correctionWidth;
      if (correctionGsm) payload.gsm = correctionGsm;
      if (correctionMill) payload.mill = correctionMill;
      
      const res = await reelsApi.correction(id, payload.width, payload.gsm, payload.mill);
      setReel(res.data);
      setShowCorrection(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply correction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdjustWeight = async (e) => {
    e.preventDefault();
    if (!adjustReason) {
      alert('Reason is mandatory');
      return;
    }
    if (adjustReason === 'Other' && !adjustNotes) {
      alert('Notes are mandatory when Reason is Other');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await reelsApi.adjustWeight(id, adjustWeightVal, adjustReason, adjustNotes);
      setReel(res.data);
      setShowAdjustWeight(false);
      setAdjustWeightVal('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to adjust weight');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReverseJob = async (jobId) => {
    if (!window.confirm(`Are you sure you want to reverse job ${jobId}? This will restore the consumed weight to the reel.`)) return;
    try {
      await jobsApi.reverse(jobId);
      // Refresh data
      const [rRes, jRes, lRes] = await Promise.all([
        reelsApi.getById(id),
        jobsApi.getAll(null, id),
        reelsApi.getLedger(id)
      ]);
      setReel(rRes.data);
      setJobs(jRes.data);
      setLedger(lRes.data);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to reverse job');
    }
  };

  const printLabel = async () => {
    try {
      const res = await reelsApi.printLabel(id);
      alert(res.data.message || 'Label sent to printer');
    } catch (e) {
      alert('Failed to print label');
    }
  };

  if (loading) return <div className="empty">Loading reel details...</div>;
  if (!reel) return <div className="empty">Reel not found</div>;

  const n0 = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');
  const n2 = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const n3 = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  const isWrittenOff = reel.status === 'WRITTEN_OFF';
  
  // Actually "Consumed by Jobs" is what the jobs say
  const consumedByJobs = jobs.filter(j => j.status === 'Completed').reduce((acc, j) => acc + (j.kg || 0), 0);
  // "Written Off" weight from ledger
  const writtenOffWeight = ledger.filter(l => l.referenceType === 'WRITE_OFF').reduce((acc, l) => acc + Math.abs(l.amount || 0), 0);
  
  const pctLeft = Math.max(0, (reel.remaining / reel.orig) * 100);
  const isExhausted = reel.remaining <= 0;
  const isLowStock = !isExhausted && reel.remaining < 40;
  const isOnHold = reel.status === 'ON_HOLD';
  const isInTransit = reel.status === 'IN_TRANSIT';
  
  let st = 'Available';
  if (isWrittenOff) st = 'Written Off';
  else if (isInTransit) st = 'In Transit';
  else if (isOnHold) st = 'On Hold';
  else if (isExhausted) st = 'Exhausted';
  else if (isLowStock) st = 'Low Stock';

  return (
    <div>
      <div className="page-head">
        <div className="between">
          <h1 className="page-title num">{reel.id}</h1>
          <span className={`badge ${isWrittenOff ? 'b-danger' : isOnHold || isLowStock ? 'b-warn' : isExhausted ? 'b-muted' : 'b-ok'}`}>
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
          <i style={{ width: `${pctLeft}%`, background: isOnHold ? 'var(--warn)' : '' }} />
        </div>
        <div className="hero-split">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>Consumed by Jobs: <b className="num">{n3(consumedByJobs)} kg</b></span>
            {writtenOffWeight > 0 && (
              <span>Written Off: <b className="num" style={{ color: 'var(--danger)' }}>{n3(writtenOffWeight)} kg</b></span>
            )}
          </div>
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
          disabled={isExhausted || isOnHold || isWrittenOff || isInTransit}
          onClick={() => navigate(`/jobs/new?reelId=${reel.id}`)}
        >
          <Scissors size={17} /> Perform job
        </button>
        <button className="btn btn-ghost" disabled={isOnHold || isWrittenOff || isInTransit} onClick={() => navigate(`/transfers/new?reelId=${reel.id}`)}>
          <ArrowRightLeft size={17} /> Transfer
        </button>
        <button className="btn btn-ghost" onClick={printLabel}>
          <Printer size={17} /> Print Label
        </button>
        <button 
          className="btn btn-ghost" 
          disabled={isInTransit || isWrittenOff}
          title={(isInTransit || isWrittenOff) ? 'Not adjustable in current state' : ''}
          onClick={() => setShowAdjustWeight(true)}>
          <Settings size={17} /> Set Weight
        </button>

        {isAdmin && (
          <>
            <div className="spacer"></div>
            {isOnHold ? (
              <button className="btn btn-ghost" disabled={isWrittenOff || isInTransit} onClick={handleRelease}>
                <AlertTriangle size={17} /> Release
              </button>
            ) : (
              <button className="btn btn-ghost" disabled={isWrittenOff || isInTransit} onClick={handleHold}>
                <AlertTriangle size={17} /> Hold
              </button>
            )}
            <button className="btn btn-ghost" disabled={consumedByJobs > 0 || isWrittenOff} title={consumedByJobs > 0 ? 'Cannot correct after first consumption' : ''} onClick={() => {
              setCorrectionWidth(reel.width || '');
              setCorrectionGsm(reel.gsm || '');
              setCorrectionMill(reel.mill || '');
              setShowCorrection(true);
            }}>
              <Settings size={17} /> Correct
            </button>
            <button className="btn btn-ghost" style={{ color: 'var(--danger)' }} disabled={isWrittenOff} onClick={handleWriteOff}>
              <AlertTriangle size={17} /> Write-off
            </button>
          </>
        )}
      </div>

      {showCorrection && (
        <div className="modal">
          <div className="modal-content">
            <h3 className="h3">Detail Correction</h3>
            <p className="dim mt10">Correct data-entry mistakes before the first consumption.</p>
            <form className="form mt14" onSubmit={handleCorrection}>
              <div className="fg">
                <label>Width (cm)</label>
                <input
                  type="number"
                  className="input num"
                  value={correctionWidth}
                  onChange={(e) => setCorrectionWidth(e.target.value)}
                />
              </div>
              <div className="fg">
                <label>GSM</label>
                <input
                  type="number"
                  className="input num"
                  value={correctionGsm}
                  onChange={(e) => setCorrectionGsm(e.target.value)}
                />
              </div>
              <div className="fg">
                <label>Mill</label>
                <input
                  type="text"
                  className="input"
                  value={correctionMill}
                  onChange={(e) => setCorrectionMill(e.target.value)}
                />
              </div>
              <div className="btn-row mt18">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Apply Correction'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCorrection(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAdjustWeight && (
        <div className="modal">
          <div className="modal-content">
            <h3 className="h3">Set Exact Weight</h3>
            <p className="dim mt10">Manually sync the reel's remaining weight to its actual physical weight.</p>
            <form className="form mt14" onSubmit={handleAdjustWeight}>
              <div className="fg">
                <label>New Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input num"
                  placeholder="e.g. 150.5"
                  value={adjustWeightVal}
                  onChange={(e) => setAdjustWeightVal(e.target.value)}
                  required
                />
              </div>
              {adjustWeightVal && !isNaN(adjustWeightVal) && (
                <div style={{ padding: '10px', background: 'var(--bg2)', borderRadius: '6px', fontSize: '14px', marginBottom: '14px' }}>
                  Difference: <strong>{(parseFloat(adjustWeightVal) - reel.remaining).toFixed(2)} kg</strong>
                </div>
              )}
              <div className="fg">
                <label>Reason <span className="req">*</span></label>
                <select 
                  className="input" 
                  value={adjustReason} 
                  onChange={(e) => setAdjustReason(e.target.value)}
                  required
                >
                  <option value="">Select reason...</option>
                  <option value="Scale difference">Scale difference</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Spillage">Spillage</option>
                  <option value="Wastage">Wastage</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {adjustReason === 'Other' && (
                <div className="fg">
                  <label>Notes <span className="req">*</span></label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Enter notes (max 200 chars)"
                    maxLength="200"
                    value={adjustNotes}
                    onChange={(e) => setAdjustNotes(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="btn-row mt18">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Set Weight'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAdjustWeight(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`badge ${j.status === 'REVERSED' ? 'b-danger' : 'b-ok'}`}>{j.status}</span>
                {isAdmin && j.status !== 'REVERSED' && (
                  <button className="btn btn-ghost btn-sm" style={{ height: '28px', color: 'var(--danger)' }} onClick={() => handleReverseJob(j.id)}>
                    Reverse
                  </button>
                )}
              </div>
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
