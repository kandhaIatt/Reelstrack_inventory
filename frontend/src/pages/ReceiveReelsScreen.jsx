import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { posApi } from '../api/services';
import { Plus, Check, Truck } from 'lucide-react';

export default function ReceiveReelsScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [kg, setKg] = useState(412);
  const [gsm, setGsm] = useState(120);
  const [width, setWidth] = useState(80);
  const [bf, setBf] = useState(18);
  const [type, setType] = useState('Kraft');
  const [mill, setMill] = useState('Suvarna Durga');

  useEffect(() => {
    if (!id) return;
    posApi.getById(id)
      .then((res) => {
        setPo(res.data);
        if (res.data.items && res.data.items.length) {
          const first = res.data.items[0];
          setGsm(first.gsm);
          setWidth(first.width);
          setBf(first.bf || 18);
          setType(first.type);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="empty">Loading PO details...</div>;
  if (!po) return <div className="empty">Purchase Order not found</div>;

  const totalReels = po.items ? po.items.reduce((s, i) => s + i.qty, 0) : 0;
  const pending = totalReels - (po.received || 0);

  const handleReceive = async () => {
    try {
      const payload = { kg: Number(kg), gsm: Number(gsm), width: Number(width), bf: Number(bf), type, mill, unit: po.unit };
      const response = await posApi.receive(po.id, payload);
      showToast(`Reel ${response.data.id} received`, 'Added to inventory');
      navigate(`/pos/${po.id}`);
    } catch (err) {
      showToast('Receiving failed', err.response?.data?.message || 'Error', true);
    }
  };

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">Receive Reels</h1>
        <p className="page-sub">{po.id} · {po.supplier}</p>
      </div>

      <div className="grid-3">
        <div className="stat"><div className="stat-label">Ordered</div><div className="stat-value num">{totalReels}</div></div>
        <div className="stat"><div className="stat-label">Received</div><div className="stat-value num">{po.received || 0}</div></div>
        <div className="stat"><div className="stat-label">Pending</div><div className="stat-value num">{pending}</div></div>
      </div>

      <div className="sec"><span className="sec-title">Receiving Entry</span></div>
      <div className="card card-pad">
        <div className="grid-2">
          <div className="field">
            <label>Actual weight (kg)</label>
            <input className="input num" type="number" value={kg} onChange={(e) => setKg(e.target.value)} />
          </div>
          <div className="field">
            <label>Actual GSM</label>
            <input className="input num" type="number" value={gsm} onChange={(e) => setGsm(e.target.value)} />
          </div>
          <div className="field">
            <label>Actual width (cm)</label>
            <input className="input num" type="number" value={width} onChange={(e) => setWidth(e.target.value)} />
          </div>
          <div className="field">
            <label>BF</label>
            <input className="input num" type="number" value={bf} onChange={(e) => setBf(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>Reel type</label>
          <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
            <option>Kraft</option>
            <option>Semi-Kraft</option>
            <option>Duplex Board</option>
            <option>Test Liner</option>
          </select>
        </div>

        <div className="field">
          <label>Mill</label>
          <select className="select" value={mill} onChange={(e) => setMill(e.target.value)}>
            <option>Suvarna Durga</option>
            <option>ABC Papers</option>
            <option>Sri Lakshmi Papers</option>
            <option>Tamil Nadu Kraft</option>
            <option>South India Paper Mills</option>
          </select>
        </div>
      </div>

      <button className="btn btn-primary btn-block mt14" onClick={handleReceive}>
        <Plus size={18} /> Add reel to inventory
      </button>
    </div>
  );
}
