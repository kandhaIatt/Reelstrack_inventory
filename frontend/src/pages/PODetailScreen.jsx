import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { posApi } from '../api/services';
import { Check, Truck, X, FileText } from 'lucide-react';

export default function PODetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    posApi.getById(id)
      .then((res) => setPo(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="empty">Loading PO details...</div>;
  if (!po) return <div className="empty">Purchase Order not found</div>;

  const n0 = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');
  const inr = (v) => '₹' + Math.round(Number(v || 0)).toLocaleString('en-IN');

  const sub = po.items ? po.items.reduce((s, i) => s + i.kg * i.rate, 0) : 0;
  const tax = sub * 0.18;
  const total = sub + tax;
  const totalReels = po.items ? po.items.reduce((s, i) => s + i.qty, 0) : 0;
  const totalKg = po.items ? po.items.reduce((s, i) => s + i.kg, 0) : 0;

  const handleApprove = async () => {
    try {
      const res = await posApi.approve(po.id);
      setPo(res.data);
      showToast(`${po.id} approved`, 'PO is now open for delivery');
    } catch (err) {
      showToast('Approval failed', 'Error updating status', true);
    }
  };

  const handleCancel = async () => {
    try {
      const res = await posApi.cancel(po.id, 'Cancelled by user');
      setPo(res.data);
      showToast(`${po.id} cancelled`, 'Order cancelled', true);
    } catch (err) {
      showToast('Cancellation failed', 'Error', true);
    }
  };

  return (
    <div>
      <div className="page-head">
        <div className="between">
          <h1 className="page-title num">{po.id}</h1>
          <span className={`badge ${po.status === 'Pending Approval' ? 'b-warn' : po.status === 'Completed' ? 'b-ok' : 'b-info'}`}>
            {po.status}
          </span>
        </div>
        <p className="page-sub">{po.supplier} · {po.date}</p>
      </div>

      <div className="hero">
        <div className="hero-label">Grand Total</div>
        <div className="hero-main"><b className="num">{inr(total)}</b></div>
        <div className="hero-grid" style={{ marginTop: '14px' }}>
          <div><div className="k">Reels</div><div className="v num">{totalReels}</div></div>
          <div><div className="k">Weight</div><div className="v num">{n0(totalKg)} kg</div></div>
          <div><div className="k">Received</div><div className="v num">{po.received || 0} / {totalReels}</div></div>
        </div>
      </div>

      <div className="sec"><span className="sec-title">PO Information</span></div>
      <div className="kv">
        <div><div className="k">PO number</div><div className="v num">{po.id}</div></div>
        <div><div className="k">PO date</div><div className="v">{po.date}</div></div>
        <div><div className="k">Supplier</div><div className="v">{po.supplier}</div></div>
        <div><div className="k">Delivery unit</div><div className="v">{po.unit}</div></div>
        <div><div className="k">Expected delivery</div><div className="v">{po.eta}</div></div>
        <div><div className="k">Payment terms</div><div className="v">{po.terms}</div></div>
      </div>

      <div className="sec"><span className="sec-title">Order Items</span></div>
      {po.items.map((it, i) => (
        <div key={i} className="item-card mt10">
          <div className="between">
            <span className="item-tag">Item {i + 1}</span>
            <span className="num" style={{ fontWeight: 700, fontSize: '15px' }}>{inr(it.kg * it.rate)}</span>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 650, marginTop: '4px' }}>{it.type} · {it.gsm} GSM</div>
          <div className="wt-row" style={{ marginTop: '10px' }}>
            <div className="wt"><div className="k">Expected wt</div><div className="v num">{n0(it.kg)}<small>kg</small></div></div>
            <div className="wt"><div className="k">Rate</div><div className="v num">₹{it.rate}<small>/kg</small></div></div>
            <div className="wt"><div className="k">Reels</div><div className="v num">{it.qty}</div></div>
          </div>
        </div>
      ))}

      <div className="sec"><span className="sec-title">Order Summary</span></div>
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

      <div className="mt14">
        {po.status === 'Pending Approval' && (
          <div>
            <button className="btn btn-primary btn-block" onClick={handleApprove}>
              <Check size={18} /> Approve PO
            </button>
            <button className="btn btn-danger btn-block mt10" onClick={handleCancel}>
              <X size={18} /> Cancel PO
            </button>
          </div>
        )}
        {(po.status === 'Open' || po.status === 'Partially Received') && (
          <button className="btn btn-primary btn-block" onClick={() => navigate(`/pos/${po.id}/receive`)}>
            <Truck size={18} /> Receive reels
          </button>
        )}
      </div>
    </div>
  );
}
