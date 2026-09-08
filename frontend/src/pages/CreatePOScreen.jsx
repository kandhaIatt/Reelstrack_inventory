import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { posApi } from '../api/services';
import { Plus, Check, Trash } from 'lucide-react';

const REEL_TYPES = ['Kraft', 'Semi-Kraft', 'Duplex Board', 'Test Liner', 'Golden Kraft'];

export default function CreatePOScreen() {
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [supplier, setSupplier] = useState('S1');
  const [unit, setUnit] = useState('U1');
  const [eta, setEta] = useState('2026-08-25');
  const [terms, setTerms] = useState('30 Days');
  const [items, setItems] = useState([]);

  // Item modal form state
  const [type, setType] = useState('Kraft');
  const [gsm, setGsm] = useState(120);
  const [width, setWidth] = useState(80);
  const [bf, setBf] = useState(18);
  const [qty, setQty] = useState(2);
  const [kg, setKg] = useState(824);
  const [rate, setRate] = useState(38);
  const [showItemForm, setShowItemForm] = useState(false);

  const n0 = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');
  const inr = (v) => '₹' + Math.round(Number(v || 0)).toLocaleString('en-IN');

  const sub = items.reduce((s, i) => s + i.kg * i.rate, 0);
  const tax = sub * 0.18;
  const total = sub + tax;

  const handleAddItem = () => {
    setItems([...items, { type, gsm: Number(gsm), width: Number(width), bf: Number(bf), qty: Number(qty), kg: Number(kg), rate: Number(rate) }]);
    setShowItemForm(false);
  };

  const handleCreate = async () => {
    if (!items.length) {
      showToast('No items added', 'Add at least one line item', true);
      return;
    }
    try {
      const payload = { supplier, unit, eta, terms, items };
      const res = await posApi.create(payload);
      showToast(`${res.data.id} created`, 'Sent for approval');
      navigate(`/pos/${res.data.id}`);
    } catch (err) {
      showToast('PO creation failed', 'Error saving order', true);
    }
  };

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">New Purchase Order</h1>
        <p className="page-sub">Raise an order against a supplier and delivery unit</p>
      </div>

      <div className="card card-pad">
        <div className="field">
          <label>Supplier</label>
          <select className="select" value={supplier} onChange={(e) => setSupplier(e.target.value)}>
            <option value="S1">Suvarna Durga Paper Mills</option>
            <option value="S2">ABC Papers Pvt Ltd</option>
            <option value="S3">Sri Lakshmi Papers</option>
            <option value="S4">Tamil Nadu Kraft Industries</option>
            <option value="S5">South India Paper Mills</option>
          </select>
        </div>

        <div className="field">
          <label>Delivery unit</label>
          <select className="select" value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="U1">Chennai Unit</option>
            <option value="U2">Bangalore Unit</option>
            <option value="U3">Hyderabad Unit</option>
            <option value="U4">Coimbatore Unit</option>
            <option value="U5">Pondicherry Unit</option>
          </select>
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Expected delivery</label>
            <input className="input" type="date" value={eta} onChange={(e) => setEta(e.target.value)} />
          </div>
          <div className="field">
            <label>Payment terms</label>
            <select className="select" value={terms} onChange={(e) => setTerms(e.target.value)}>
              <option>Advance</option>
              <option>15 Days</option>
              <option>30 Days</option>
              <option>45 Days</option>
            </select>
          </div>
        </div>
      </div>

      <div className="sec">
        <span className="sec-title">Reel Items</span>
        <span className="tiny muted">{items.length} added</span>
      </div>

      {items.map((it, idx) => (
        <div key={idx} className="item-card mt10">
          <div className="between">
            <span className="item-tag">Item {idx + 1}</span>
            <button className="x-btn" style={{ width: '28px', height: '28px', color: 'var(--danger)' }} onClick={() => setItems(items.filter((_, i) => i !== idx))}>
              <Trash size={15} />
            </button>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 650, marginTop: '2px' }}>
            {it.type} · {it.gsm} GSM · {it.width} cm
          </div>
          <div className="between mt8 small">
            <span className="muted">{it.qty} reels · {n0(it.kg)} kg · ₹{it.rate}/kg</span>
            <span className="num" style={{ fontWeight: 700 }}>{inr(it.kg * it.rate)}</span>
          </div>
        </div>
      ))}

      {showItemForm ? (
        <div className="card card-pad mt10" style={{ background: 'var(--surface-2)' }}>
          <div className="grid-2">
            <div className="field">
              <label>Reel type</label>
              <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
                {REEL_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>GSM</label>
              <input className="input num" type="number" value={gsm} onChange={(e) => setGsm(e.target.value)} />
            </div>
            <div className="field">
              <label>Width (cm)</label>
              <input className="input num" type="number" value={width} onChange={(e) => setWidth(e.target.value)} />
            </div>
            <div className="field">
              <label>BF</label>
              <input className="input num" type="number" value={bf} onChange={(e) => setBf(e.target.value)} />
            </div>
            <div className="field">
              <label>Quantity (reels)</label>
              <input className="input num" type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
            <div className="field">
              <label>Expected weight (kg)</label>
              <input className="input num" type="number" value={kg} onChange={(e) => setKg(e.target.value)} />
            </div>
            <div className="field">
              <label>Rate per kg</label>
              <input className="input num" type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
          </div>
          <div className="btn-row mt10">
            <button className="btn btn-ghost" onClick={() => setShowItemForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddItem}>Save Item</button>
          </div>
        </div>
      ) : (
        <button className="btn btn-soft btn-block mt10" onClick={() => setShowItemForm(true)}>
          <Plus size={17} /> Add item
        </button>
      )}

      <div className="sec"><span className="sec-title">PO Summary</span></div>
      <div className="card card-pad">
        <div className="lines">
          <div><span className="k">Subtotal</span><span className="v num">{inr(sub)}</span></div>
          <div><span className="k">GST @ 18%</span><span className="v num">{inr(tax)}</span></div>
          <div className="total">
            <span className="k" style={{ fontWeight: 640 }}>Grand total</span>
            <span className="v num">{inr(total)}</span>
          </div>
        </div>
      </div>

      <button className="btn btn-primary btn-block mt14" disabled={!items.length} onClick={handleCreate}>
        <Check size={18} /> Create purchase order
      </button>
    </div>
  );
}
