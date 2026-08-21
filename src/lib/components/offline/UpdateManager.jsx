// UpdateManager.jsx - Handles PWA updates
import { useState, useEffect } from 'react';

const UpdatePrompt = ({ onUpdate }) => (
  <div
    style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      background: '#4A148C',
      color: '#FFFFFF',
      borderRadius: '16px',
      padding: '14px 20px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      maxWidth: 'calc(100vw - 32px)',
    }}
  >
    <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '15px' }}>
      A new version of Ganesha My Bestie is ready.
    </span>
    <button
      onClick={onUpdate}
      style={{
        fontFamily: 'Baloo 2, sans-serif',
        fontWeight: 600,
        fontSize: '15px',
        color: '#4A148C',
        background: '#FFD700',
        border: 'none',
        borderRadius: '12px',
        padding: '10px 18px',
        minHeight: '44px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      Refresh
    </button>
  </div>
);

export const UpdateManager = ({ children }) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      });
    }
  }, []);

  return (
    <>
      {children}
      {updateAvailable && (
        <UpdatePrompt onUpdate={() => window.location.reload()} />
      )}
    </>
  );
};
