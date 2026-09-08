import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, ArrowLeft, Search, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Topbar({ onToggleMenu }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { openSheet, closeSheet } = useApp();
  const [query, setQuery] = useState('');

  const isDetailView = ['/reels/', '/pos/', '/units/'].some((path) =>
    location.pathname.includes(path)
  );

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      const q = query.trim().toUpperCase();
      if (q.startsWith('R-')) {
        navigate(`/reels/${q}`);
      } else if (q.startsWith('PO-')) {
        navigate(`/pos/${q}`);
      } else {
        navigate(`/reels?q=${encodeURIComponent(query)}`);
      }
      setQuery('');
    }
  };

  const showNotifications = () => {
    openSheet(
      'Notifications',
      <div className="listcard">
        <div className="card-pad" style={{ boxShadow: 'none' }}>
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '640' }}>
                4 reels below 25% balance
              </div>
              <div className="tiny muted" style={{ marginTop: '2px' }}>
                R-21072, R-21065, R-21059, R-21063
              </div>
              <div className="tiny muted" style={{ marginTop: '3px' }}>
                1 hour ago
              </div>
            </div>
          </div>
        </div>
      </div>,
      <button className="btn btn-ghost btn-block" onClick={closeSheet}>
        Close
      </button>
    );
  };

  return (
    <header className="topbar">
      <button className="hbtn menu-btn" onClick={onToggleMenu} aria-label="Open menu">
        <Menu size={19} />
      </button>

      {isDetailView && (
        <button className="hbtn" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={18} />
        </button>
      )}

      <div className="crumb">
        <span className="link" onClick={() => navigate('/dashboard')}>
          ReelTrack
        </span>
        <span className="sep">/</span>
        <b>
          {location.pathname === '/dashboard'
            ? 'Dashboard'
            : location.pathname.substring(1).toUpperCase()}
        </b>
      </div>

      <div className="tb-spacer" />

      <div className="gsearch">
        <span className="gi">
          <Search size={16} />
        </span>
        <input
          type="search"
          placeholder="Search reel, job or PO…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
        <kbd>/</kbd>
      </div>

      <button className="hbtn" onClick={showNotifications} aria-label="Notifications">
        <Bell size={18} />
        <span className="dot" />
      </button>
    </header>
  );
}
