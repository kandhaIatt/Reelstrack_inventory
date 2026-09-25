import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { reelsApi, mastersApi, posApi } from '../api/services';
import { Disc, Save, X, Plus, Trash2, Check } from 'lucide-react';

const REEL_SOURCES = [
  'Against PO',
  'Opening balance (go-live stock)',
  'Local purchase (no PO)',
  'Customer return',
  'Mill replacement',
  'Correction of earlier records',
  'Other'
];

export default function AddReelScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useApp();
  const isAdmin = user?.role === 'ADMIN';

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  // Master data
  const [units, setUnits] = useState([]);
  const [mills, setMills] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [reelTypes, setReelTypes] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  // Batch specification
  const [spec, setSpec] = useState({
    id: '',
    type: '',
    gsm: 120,
    bf: 18,
    width: 80,
    mill: '',
    unit: user?.unitId || '',
    source: REEL_SOURCES[0],
    poNumber: '',
    supplier: '',
    rate: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
    weight: 412
  });


  useEffect(() => {
    if (!isAdmin) {
      setInitLoading(false);
      return;
    }
    Promise.all([
      mastersApi.getUnits(),
      mastersApi.getMills(),
      mastersApi.getSuppliers(),
      mastersApi.getReelTypes(),
      posApi.getAll().catch(() => ({ data: [] }))
    ]).then(([uRes, mRes, sRes, tRes, poRes]) => {
      setUnits(uRes.data || []);
      setMills(mRes.data || []);
      setSuppliers(sRes.data || []);
      setReelTypes(tRes.data || []);
      setPurchaseOrders(poRes.data || []);
      
      const defaultType = tRes.data && tRes.data.length > 0 ? tRes.data[0].name : 'Kraft';
      const defaultMill = mRes.data && mRes.data.length > 0 ? mRes.data[0].name : '';
      const defaultUnit = user?.unitId || (uRes.data && uRes.data.length > 0 ? uRes.data[0].id : '');
      
      setSpec(prev => ({
        ...prev,
        type: defaultType,
        mill: defaultMill,
        unit: defaultUnit
      }));
      
      setInitLoading(false);
    }).catch(err => {
      console.error(err);
      setInitLoading(false);
    });
  }, [isAdmin, user]);

  if (initLoading) return <div className="empty">Loading...</div>;
  if (!isAdmin) return <div className="empty">Unauthorized access</div>;

  const handleSpecChange = (field, value) => {
    setSpec(prev => ({ ...prev, [field]: value }));
  };



  // Validation
  const problems = [];
  if (!spec.source) {
    problems.push('Reason is required.');
  }
  if (spec.source === 'Against PO' && !spec.poNumber.trim()) {
    problems.push('PO Number is required when reason is Against PO.');
  }
  if (spec.source === 'Other' && !spec.note.trim()) {
    problems.push('A note is required when reason is Other.');
  }
  
  const id = (spec.id || '').trim();
  const kg = Number(spec.weight);
  if (!id) {
    problems.push(`Reel number is missing.`);
  }
  if (!(kg > 0)) {
    problems.push(`Weight must be more than zero.`);
  } else if (kg > 2000) {
    problems.push(`${kg} kg looks wrong for a single reel.`);
  }

  const totalKg = Number(spec.weight) || 0;
  const totalValue = totalKg * (Number(spec.rate) || 0);
  
  const unitName = units.find(u => u.id === spec.unit)?.name || '—';

  const n2 = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const inr = (v) => '₹' + Math.round(Number(v)).toLocaleString('en-IN');

  const commitReelBatch = async () => {
    if (problems.length) return;
    setLoading(true);
    
    try {
      const payload = {
        id: spec.id.trim(),
        type: spec.type,
        gsm: Number(spec.gsm),
        bf: spec.bf ? Number(spec.bf) : null,
        width: Number(spec.width),
        mill: spec.mill,
        unit: spec.unit,
        source: spec.source,
        po: spec.source === 'Against PO' ? spec.poNumber.trim() : null,
        supplier: spec.supplier || null,
        rate: spec.rate ? Number(spec.rate) : null,
        note: spec.note || null,
        rec: spec.date,
        orig: Number(spec.weight),
        remaining: Number(spec.weight)
      };

      await reelsApi.create(payload);
      showToast(`Reel added`, `${spec.weight} kg added to stock`);
      navigate('/reels');
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding reels');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb10">
        <button className="btn btn-sm btn-ghost" onClick={() => navigate('/reels')}>
          ← Back to Reel Inventory
        </button>
      </div>
      <div className="page-head">
        <div className="muted tiny mb10">Reel Inventory / Add Reel</div>
        <h1 className="page-title">Add Reel</h1>
        <p className="page-sub">Add a single reel to stock.</p>
      </div>

      <div className="sec"><span className="sec-title">1 · Reel specification</span></div>
      <div className="card card-pad">
        <div className="grid-2">
          <div className="field">
            <label>Reel type</label>
            <select className="select" value={spec.type} onChange={e => handleSpecChange('type', e.target.value)}>
              {reelTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Mill</label>
            <select className="select" value={spec.mill} onChange={e => handleSpecChange('mill', e.target.value)}>
              {mills.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label>GSM</label>
            <input className="input num" type="number" value={spec.gsm} onChange={e => handleSpecChange('gsm', e.target.value)} />
          </div>
          <div className="field">
            <label>Width (cm)</label>
            <input className="input num" type="number" value={spec.width} onChange={e => handleSpecChange('width', e.target.value)} />
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label>BF <span className="muted tiny">(0 for duplex)</span></label>
            <input className="input num" type="number" value={spec.bf} onChange={e => handleSpecChange('bf', e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Holding unit</label>
            <select className="select" value={spec.unit} onChange={e => handleSpecChange('unit', e.target.value)}>
              {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="sec"><span className="sec-title">2 · Source & Details</span><span className="tiny muted" style={{marginLeft: '8px'}}>Required source details</span></div>
      <div className="card card-pad">
        <div className="grid-2">
          <div className="field">
            <label>Reason *</label>
            <select className="select" value={spec.source} onChange={e => handleSpecChange('source', e.target.value)}>
              {REEL_SOURCES.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>

          {spec.source === 'Against PO' && (
            <div className="field">
              <label>Purchase Order *</label>
              <select className="select" value={spec.poNumber} onChange={e => handleSpecChange('poNumber', e.target.value)}>
                <option value="">Select an active PO or enter below</option>
                {purchaseOrders.map(po => (
                  <option key={po.id || po.poNumber} value={po.poNumber || po.id}>
                    {po.poNumber || po.id} {po.supplier ? `(${po.supplier})` : ''}
                  </option>
                ))}
              </select>
              <input
                className="input mt10"
                placeholder="Or type PO number manually (e.g. PO-2024-001)"
                value={spec.poNumber}
                onChange={e => handleSpecChange('poNumber', e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Supplier <span className="muted tiny">(optional)</span></label>
            <select className="select" value={spec.supplier} onChange={e => handleSpecChange('supplier', e.target.value)}>
              <option value="">Not recorded</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Rate ₹/kg <span className="muted tiny">(optional)</span></label>
            <input className="input num" type="number" placeholder="Leave blank if unknown" value={spec.rate} onChange={e => handleSpecChange('rate', e.target.value)} />
          </div>
        </div>
        <div className="grid-2">
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Received on</label>
            <input className="input" type="date" value={spec.date} onChange={e => handleSpecChange('date', e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Note {spec.source === 'Other' ? '*' : <span className="muted tiny">(optional)</span>}</label>
            <input className="input" placeholder="e.g. replacement for damaged reel R-21044" value={spec.note} onChange={e => handleSpecChange('note', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="sec"><span className="sec-title">3 · Reel Details</span></div>
      <div className="card card-pad">
        <div className="grid-2">
          <div className="field">
            <label>Reel Number</label>
            <input className="input" value={spec.id} onChange={e => handleSpecChange('id', e.target.value)} />
          </div>
          <div className="field">
            <label>Weight (kg)</label>
            <input className="input num" type="number" value={spec.weight} onChange={e => handleSpecChange('weight', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="sec"><span className="sec-title">Summary</span></div>
      <div className="card card-pad">
        <div className="lines">
          <div><span className="k">Reel Number</span><span className="v num">{spec.id || '—'}</span></div>
          <div><span className="k">Total weight</span><span className="v num">{n2(totalKg)} kg</span></div>
          <div><span className="k">Specification</span><span className="v num">{spec.type} · {spec.gsm} GSM · {spec.width} cm</span></div>
          <div><span className="k">Going to</span><span className="v num">{unitName}</span></div>
          <div><span className="k">Reason / PO</span><span className="v num">{spec.source} {spec.source === 'Against PO' && spec.poNumber ? `(${spec.poNumber})` : ''}</span></div>
          {Number(spec.rate) > 0 && <div><span className="k">Value at ₹{spec.rate}/kg</span><span className="v num">{inr(totalValue)}</span></div>}
        </div>
      </div>

      {problems.length > 0 && (
        <div className="card card-pad mt10" style={{ borderColor: 'var(--warn)' }}>
          <div style={{ fontWeight: 650, color: 'var(--warn)', marginBottom: '6px' }}>
            {problems.length} thing{problems.length > 1 ? 's' : ''} to fix before adding
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px' }} className="small muted">
            {problems.slice(0, 8).map((p, idx) => <li key={idx}>{p}</li>)}
            {problems.length > 8 && <li>…and {problems.length - 8} more</li>}
          </ul>
        </div>
      )}

      <button className="btn btn-primary btn-block mt14" disabled={problems.length > 0 || loading} onClick={commitReelBatch}>
        <Check size={18} /> {loading ? 'Saving...' : `Add ${spec.id || 'reel'} to inventory`}
      </button>
      <button className="btn btn-ghost btn-block mt10" onClick={() => navigate('/reels')}>Discard</button>

    </div>
  );
}
