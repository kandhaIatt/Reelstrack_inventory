import React, { useState, useEffect } from 'react';
import { transfersApi } from '../api/services';
import { ArrowRightLeft } from 'lucide-react';

export default function TransferHistoryScreen() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transfersApi.getAll()
      .then((res) => setTransfers(res.data))
      .finally(() => setLoading(false));
  }, []);

  const n3 = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">Transfer History</h1>
        <p className="page-sub">{transfers.length} movements recorded</p>
      </div>

      <div className="card card-pad">
        {loading ? (
          <div className="empty">Loading transfers...</div>
        ) : (
          <div className="tl">
            {transfers.map((t, i) => (
              <div key={i} className="tl-item">
                <div className="tl-dot" style={{ color: '#2358c4' }}>
                  <ArrowRightLeft size={13} />
                </div>
                <div className="tl-title num">{t.reel}</div>
                <div className="tl-sub">
                  {t.fromUnit} → {t.toUnit} · <span className="num">{n3(t.kg)} kg</span>
                </div>
                <div className="tl-time">
                  {t.date} · {t.ref} {t.notes ? `· ${t.notes}` : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
