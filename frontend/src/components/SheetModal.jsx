import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SheetModal() {
  const { modal, closeSheet } = useApp();

  if (!modal) return null;

  return (
    <>
      <div className="scrim show" onClick={closeSheet} />
      <div className="sheet show" role="dialog" aria-modal="true">
        <div className="sheet-head">
          <div className="sheet-title">{modal.title}</div>
          <button className="x-btn" onClick={closeSheet}>
            <X size={17} />
          </button>
        </div>
        <div className="sheet-body">{modal.body}</div>
        {modal.foot && <div className="sheet-foot">{modal.foot}</div>}
      </div>
    </>
  );
}
