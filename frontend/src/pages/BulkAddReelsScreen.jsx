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

export default function BulkAddReelsScreen() {
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
    billNumber: '',
    vehicleNo: '',
    totalValue: '',
    qty: 1,
    sameWeight: true,
    weight: 412
  });

  const [rows, setRows] = useState([]);

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
      
      setRows([{ id: '', kg: 412, edited: false }]);
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

  const handleQtyChange = (e) => {
    let qty = Math.max(1, Math.min(60, Number(e.target.value) || 1));
    handleSpecChange('qty', qty);
    
    setRows(prev => {
      let newRows = [...prev];
      while (newRows.length < qty) {
        newRows.push({ id: '', kg: spec.sameWeight ? spec.weight : '', edited: false });
      }
      if (newRows.length > qty) {
        newRows.length = qty;
      }
      return newRows;
    });
  };

  const handleSameWeightChange = (checked) => {
    handleSpecChange('sameWeight', checked);
    if (checked) {
      setRows(prev => prev.map(r => r.edited ? r : { ...r, kg: spec.weight }));
    }
  };

  const handleWeightChange = (e) => {
    const val = e.target.value;
    handleSpecChange('weight', val);
    if (spec.sameWeight) {
      setRows(prev => prev.map(r => r.edited ? r : { ...r, kg: val }));
    }
  };

  const handleRowChange = (index, field, value) => {
    setRows(prev => {
      const newRows = [...prev];
      newRows[index] = { ...newRows[index], [field]: value };
      if (field === 'kg') newRows[index].edited = true;
      return newRows;
    });
  };

  const handleAddRow = () => {
    const newQty = rows.length + 1;
    handleSpecChange('qty', newQty);
    setRows(prev => [...prev, { id: '', kg: spec.sameWeight ? spec.weight : '', edited: false }]);
  };

  const handleRemoveRow = (index) => {
    setRows(prev => {
      let newRows = prev.filter((_, i) => i !== index);
      if (newRows.length === 0) {
        newRows = [{ id: '', kg: spec.sameWeight ? spec.weight : '', edited: false }];
      }
      handleSpecChange('qty', newRows.length);
      return newRows;
    });
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
  
  const seenIds = new Set();
  rows.forEach((r, i) => {
    const id = (r.id || '').trim();
    const kg = Number(r.kg);
    if (!id) {
      problems.push(`Row ${i + 1}: reel number is missing.`);
    } else {
      if (seenIds.has(id.toLowerCase())) {
        problems.push(`Reel ${id} is entered twice in this batch.`);
      }
      seenIds.add(id.toLowerCase());
    }
    if (!(kg > 0)) {
      problems.push(`Row ${i + 1}: weight must be more than zero.`);
    } else if (kg > 2000) {
      problems.push(`Row ${i + 1}: ${kg} kg looks wrong for a single reel.`);
    }
  });

  const totalKg = rows.reduce((s, r) => s + (Number(r.kg) || 0), 0);
  const totalValue = spec.totalValue ? Number(spec.totalValue) : (spec.rate ? totalKg * Number(spec.rate) : null);
  
  const unitName = units.find(u => u.id === spec.unit)?.name || '—';

  const n2 = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const inr = (v) => '₹' + Math.round(Number(v)).toLocaleString('en-IN');

  const commitReelBatch = async () => {
    if (problems.length) return;
    setLoading(true);
    
    try {
      const payload = {
        type: spec.type,
        gsm: Number(spec.gsm),
        bf: spec.bf ? Number(spec.bf) : null,
        width: Number(spec.width),
        mill: spec.mill,
        unit: spec.unit,
        source: spec.source,
        poNumber: spec.source === 'Against PO' ? spec.poNumber.trim() : null,
        supplier: spec.supplier || null,
        billNumber: spec.billNumber || null,
        vehicleNo: spec.vehicleNo || null,
        totalValue: spec.totalValue ? Number(spec.totalValue) : null,
        rate: spec.rate ? Number(spec.rate) : null,
        note: spec.note || null,
        date: spec.date,
        reels: rows.map(r => ({
          id: r.id.trim(),
          weight: Number(r.kg)
        }))
      };

      await reelsApi.bulkAdd(payload);
      showToast(`${rows.length} reels added`, `${n2(totalKg)} kg now in stock`);
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
        <div className="muted tiny mb10">Reel Inventory / Bulk Add</div>
        <h1 className="page-title">Bulk Add Reels</h1>
        <p className="page-sub">Add reels against a Purchase Order or non-PO sources like opening balances, local purchases, and returns.</p>
      </div>

      <div className="sec"><span className="sec-title">1 · Reel specification</span><span className="tiny muted" style={{marginLeft: '8px'}}>Applies to every reel in this batch</span></div>
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
          <div className="field">
            <label>Bill Number <span className="muted tiny">(optional)</span></label>
            <input className="input" placeholder="e.g. INV-2024" value={spec.billNumber} onChange={e => handleSpecChange('billNumber', e.target.value)} />
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Vehicle No. <span className="muted tiny">(optional)</span></label>
            <input className="input" placeholder="e.g. TN 01 AB 1234" value={spec.vehicleNo} onChange={e => handleSpecChange('vehicleNo', e.target.value)} />
          </div>
          <div className="field">
            <label>Total Value <span className="muted tiny">(optional)</span></label>
            <input className="input num" type="number" placeholder="Leave blank if unknown" value={spec.totalValue} onChange={e => handleSpecChange('totalValue', e.target.value)} />
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

      <div className="sec"><span className="sec-title">3 · Reels</span><span className="tiny muted" style={{marginLeft: '8px'}}>Numbers and weights</span></div>
      <div className="card card-pad">
        <div className="grid-2">
          <div className="field">
            <label>How many reels</label>
            <input className="input num" type="number" min="1" max="60" value={spec.qty} onChange={handleQtyChange} />
          </div>
          <div className="field">
            <label>Weight per reel (kg)</label>
            <input className="input num" type="number" value={spec.weight} disabled={!spec.sameWeight} onChange={handleWeightChange} />
          </div>
        </div>
        <label className="check-row" style={{ marginBottom: 0 }}>
          <input type="checkbox" checked={spec.sameWeight} onChange={e => handleSameWeightChange(e.target.checked)} />
          <span>Same weight for every reel <span className="muted tiny">— untick to weigh each one separately</span></span>
        </label>
      </div>

      <div className="mt10">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: '44px' }}>#</th>
                <th>Reel number</th>
                <th className="r">Weight (kg)</th>
                <th style={{ width: '52px' }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="dim">{i + 1}</td>
                  <td>
                    <input className="input num" style={{ height: '36px' }} value={r.id} onChange={e => handleRowChange(i, 'id', e.target.value)} />
                  </td>
                  <td className="r">
                    <input className="input num r" style={{ height: '36px' }} type="number" value={r.kg} onChange={e => handleRowChange(i, 'kg', e.target.value)} />
                  </td>
                  <td>
                    <button className="x-btn" style={{ width: '28px', height: '28px', color: 'var(--danger)' }} onClick={() => handleRemoveRow(i)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <button className="btn btn-soft btn-block mt10" onClick={handleAddRow}>
        <Plus size={17} /> Add one more reel
      </button>

      <div className="sec"><span className="sec-title">Summary</span></div>
      <div className="card card-pad">
        <div className="lines">
          <div><span className="k">Reels being added</span><span className="v num">{rows.length}</span></div>
          <div><span className="k">Total weight</span><span className="v num">{n2(totalKg)} kg</span></div>
          <div><span className="k">Specification</span><span className="v num">{spec.type} · {spec.gsm} GSM · {spec.width} cm</span></div>
          <div><span className="k">Going to</span><span className="v num">{unitName}</span></div>
          <div><span className="k">Reason / PO</span><span className="v num">{spec.source} {spec.source === 'Against PO' && spec.poNumber ? `(${spec.poNumber})` : ''}</span></div>
          <div><span className="k">Total Value</span><span className="v num">{totalValue ? inr(totalValue) : '—'}</span></div>
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
        <Check size={18} /> {loading ? 'Saving...' : `Add ${rows.length} reel${rows.length === 1 ? '' : 's'} to inventory`}
      </button>
      <button className="btn btn-ghost btn-block mt10" onClick={() => navigate('/reels')}>Discard</button>

    </div>
  );
}
