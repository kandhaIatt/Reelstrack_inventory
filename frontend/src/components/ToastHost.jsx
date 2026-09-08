import React from 'react';
import { Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ToastHost() {
  const { toastInfo } = useApp();

  if (!toastInfo) return null;

  return (
    <div className="toast show">
      <div
        className="tick"
        style={{ background: toastInfo.isError ? '#c2352c' : '#12805c' }}
      >
        {toastInfo.isError ? <X size={16} /> : <Check size={16} />}
      </div>
      <div>
        <div className="msg">{toastInfo.msg}</div>
        {toastInfo.sub && <div className="sub">{toastInfo.sub}</div>}
      </div>
    </div>
  );
}
