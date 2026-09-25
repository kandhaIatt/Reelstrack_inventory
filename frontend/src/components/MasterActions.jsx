import React from 'react';
import { Pencil, Power } from 'lucide-react';

/**
 * Reusable action buttons for master data entries (Mills, Reel Types, Units).
 *
 * Props:
 * - active: boolean indicating current active state of the item.
 * - onEdit: callback invoked when the edit button is clicked.
 * - onToggle: callback invoked when the power button is clicked.
 */
export default function MasterActions({ active, onEdit, onToggle }) {
  return (
    <div className="actions">
      <button
        className="icon-btn"
        title="Edit"
        onClick={onEdit}
        type="button"
      >
        <Pencil size={16} />
      </button>
      <button
        className="icon-btn"
        title={active ? 'Deactivate' : 'Activate'}
        onClick={onToggle}
        type="button"
      >
        <Power size={16} />
      </button>
    </div>
  );
}
