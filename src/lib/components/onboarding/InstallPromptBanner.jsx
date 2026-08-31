import React, { useEffect, useState } from 'react';
import pwaInstallManager from '../../services/PwaInstallManager';

// Dismissible banner (never a blocking modal). Mounted alongside the child-profile
// creation → Mooshika ride handoff — the parent is still confirmed present at that
// moment, right before handing off to the child. Stops showing after 2 declines
// (tracked in PwaInstallManager, shared app-wide so a later re-mount still respects it).
const InstallPromptBanner = () => {
  const [visible, setVisible] = useState(
    pwaInstallManager.isAvailable() && !pwaInstallManager.hasExhaustedDismissals()
  );

  useEffect(() => {
    const unsubscribe = pwaInstallManager.subscribe((available) => {
      setVisible(available && !pwaInstallManager.hasExhaustedDismissals());
    });
    return unsubscribe;
  }, []);

  const handleInstall = async () => {
    await pwaInstallManager.promptInstall();
    setVisible(false);
  };

  const handleDismiss = () => {
    pwaInstallManager.recordDismissal();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        background: '#fff',
        borderTop: '3px solid #FF5722',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.15)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        zIndex: 2000,
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Baloo 2', cursive", color: '#FF5722', fontSize: '1rem' }}>
          Add to Home Screen
        </div>
        <div style={{ fontSize: '0.85rem', color: '#5D4037' }}>
          Install for instant, full-screen access.
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={handleDismiss}
          style={{
            fontFamily: "'Nunito', sans-serif",
            background: 'transparent',
            border: 'none',
            color: '#888',
            minHeight: '60px',
            padding: '0 8px',
            cursor: 'pointer',
          }}
        >
          Not now
        </button>
        <button
          onClick={handleInstall}
          style={{
            fontFamily: "'Baloo 2', cursive",
            background: '#FF5722',
            color: '#fff',
            border: 'none',
            borderRadius: '999px',
            padding: '0 22px',
            minHeight: '60px',
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          Install
        </button>
      </div>
    </div>
  );
};

export default InstallPromptBanner;
