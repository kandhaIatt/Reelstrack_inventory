import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { reelsApi, transfersApi } from '../api/services';
import { ArrowRightLeft } from 'lucide-react';

export default function TransferScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useApp();

  const [reelId, setReelId] = useState(searchParams.get('reelId') || '');
  const [reel, setReel] = useState(null);
  const [toUnit, setToUnit] = useState('U2');
  const [ref, setRef] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (reelId) {
      reelsApi.getById(reelId).then((res) => setReel(res.data)).catch(() => setReel(null));
    }
  }, [reelId]);

  const n3 = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  const handleTransfer = async () => {
    if (!reel) {
      showToast('Reel not selected', 'Select a valid reel', true);
      return;
    }
    try {
      const payload = { reelId: reel.id, toUnit, ref, notes };
      const res = await transfersApi.create(payload);
      showToast(`Reel ${reel.id} transferred`, `${reel.unit} → ${toUnit}`);
      navigate(`/reels/${reel.id}`);
    } catch (err) {
      showToast('Transfer failed', 'Error', true);
    }
  };

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">Transfer Reel</h1>
        <p className="page-sub">Move stock between manufacturing units</p>
      </div>

      <div className="card card-pad">
        <div className="field">
          <label>Reel number</label>
          <input
            className="input num"
            placeholder="e.g. R-21056"
            value={reelId}
            onChange={(e) => setReelId(e.target.value)}
          />
        </div>

        {reel && (
          <div>
            <div className="divider" />
            <div className="between">
              <div>
                <div style={{ fontSize: '15.5px', fontWeight: 660 }} className="num">{reel.id}</div>
                <div className="tiny muted">{reel.type} · {reel.gsm} GSM · Current Unit: {reel.unit}</div>
              </div>
              <div className="num" style={{ fontWeight: 700 }}>{n3(reel.remaining)} kg</div>
            </div>
          </div>
        )}
      </div>

      <div className="card card-pad mt10">
        <div className="field">
          <label>To unit</label>
          <select className="select" value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
            <option value="U1">Chennai Unit</option>
            <option value="U2">Bangalore Unit</option>
            <option value="U3">Hyderabad Unit</option>
            <option value="U4">Coimbatore Unit</option>
            <option value="U5">Pondicherry Unit</option>
            <option value="U6">Madurai Unit</option>
          </select>
        </div>

        <div className="field">
          <label>Transfer reference (optional)</label>
          <input className="input num" placeholder="e.g. TRF-2026-0093" value={ref} onChange={(e) => setRef(e.target.value)} />
        </div>

        <div className="field">
          <label>Notes (optional)</label>
          <textarea
            className="input"
            placeholder="Reason for transfer"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <button className="btn btn-primary btn-block mt14" disabled={!reel} onClick={handleTransfer}>
        <ArrowRightLeft size={18} /> Transfer reel
      </button>
    </div>
  );
}
