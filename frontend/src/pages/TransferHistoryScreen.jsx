import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { transfersApi } from '../api/services';
import { ArrowRightLeft } from 'lucide-react';

export default function TransferHistoryScreen() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';

  const setStatusFilter = (status) => {
    setSearchParams(prev => {
      if (status) prev.set('status', status);
      else prev.delete('status');
      return prev;
    }, { replace: true });
  };

  useEffect(() => {
    transfersApi.getAll()
      .then((res) => setTransfers(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = transfers.filter(t => !statusFilter || t.status === statusFilter);

  const n3 = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">Transfer History</h1>
        <p className="page-sub">{transfers.length} movements recorded</p>
      </div>

      <div className="chip-scroll mt14" style={{ marginBottom: '20px' }}>
        <button className={`chip ${!statusFilter ? 'on' : ''}`} onClick={() => setStatusFilter('')}>
          All
        </button>
        {['DISPATCHED', 'RECEIVED', 'REJECTED'].map((s) => (
          <button
            key={s}
            className={`chip ${statusFilter === s ? 'on' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="card card-pad">
        {loading ? (
          <div className="empty">Loading transfers...</div>
        ) : (
          <div className="tl">
            {filtered.map((t, i) => (
              <div key={i} className="tl-item" style={{ marginBottom: '20px' }}>
                <div className="tl-dot" style={{ color: t.status === 'RECEIVED' ? '#10b981' : t.status === 'REJECTED' ? '#ef4444' : '#2358c4' }}>
                  <ArrowRightLeft size={13} />
                </div>
                <div className="between">
                  <div className="tl-title num">{t.reel}</div>
                  <span className={`badge ${t.status === 'RECEIVED' ? 'b-ok' : t.status === 'REJECTED' ? 'b-danger' : 'b-info'}`}>{t.status || 'RECEIVED'}</span>
                </div>
                <div className="tl-sub">
                  {t.fromUnit} → {t.toUnit} · <span className="num">{n3(t.kg)} kg</span>
                </div>
                <div className="tl-time">
                  {t.date} · {t.ref} {t.notes ? `· ${t.notes}` : ''}
                </div>
                {t.status === 'DISPATCHED' && (
                  <div style={{ marginTop: '10px' }} className="btn-row">
                    <button className="btn btn-sm btn-primary" onClick={async () => {
                      try {
                        await transfersApi.receive(t.id);
                        window.location.reload();
                      } catch (err) { alert('Failed to receive transfer'); }
                    }}>Receive</button>
                    <button className="btn btn-sm btn-ghost" style={{ color: '#ef4444' }} onClick={async () => {
                      const reason = prompt('Rejection reason:');
                      if (reason) {
                        try {
                          await transfersApi.reject(t.id, { notes: reason });
                          window.location.reload();
                        } catch (err) { alert('Failed to reject transfer'); }
                      }
                    }}>Reject</button>
                    <button className="btn btn-sm btn-ghost" onClick={async () => {
                      if (window.confirm('Cancel this transfer?')) {
                        try {
                          await transfersApi.cancel(t.id);
                          window.location.reload();
                        } catch (err) { alert('Failed to cancel transfer'); }
                      }
                    }}>Cancel</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
