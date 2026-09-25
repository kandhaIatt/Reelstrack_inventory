import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOffline) {
      document.body.style.paddingTop = '42px';
      document.documentElement.style.setProperty('--banner-height', '42px');
    } else {
      document.body.style.paddingTop = '0px';
      document.documentElement.style.setProperty('--banner-height', '0px');
    }
    
    return () => {
      document.body.style.paddingTop = '0px';
      document.documentElement.style.setProperty('--banner-height', '0px');
    };
  }, [isOffline]);

  if (!isOffline) return null;

  return (
    <div style={{
      background: '#ef4444',
      color: 'white',
      height: '42px',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      fontWeight: '500',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 99999
    }}>
      <WifiOff size={18} />
      You are currently offline. Changes cannot be saved until connectivity is restored.
    </div>
  );
}
