import React, { useEffect, useState } from 'react';
import pwaInstallManager, { isIOS } from '../../services/PwaInstallManager';

// Dismissible banner (never a blocking modal). Mounted alongside the child-profile
// creation → Mooshika ride handoff — the parent is still confirmed present at that
// moment, right before handing off to the child. Stops showing after 2 declines
// (tracked in PwaInstallManager, shared app-wide so a later re-mount still respects it).
//
// iOS Safari never fires `beforeinstallprompt` — there is no programmatic install
// trigger there at all, only the manual Share -> Add to Home Screen path. So on iOS
// this renders a 3-step visual walkthrough instead of an "Install" button.
//
// `onContinue` is optional — pass it when this banner sits on its own screen (screen
// 6) and something downstream (the Mooshika ride) is waiting for this moment to
// resolve, one way or another. It fires once, whether the parent installs, dismisses,
// or there was never anything to show in the first place.
const InstallPromptBanner = ({ onContinue }) => {
  const [visible, setVisible] = useState(pwaInstallManager.shouldShowAnyNudge());
  const [showIOSSteps, setShowIOSSteps] = useState(false);
  const onIOS = isIOS();

  useEffect(() => {
    const unsubscribe = pwaInstallManager.subscribe(() => {
      setVisible(pwaInstallManager.shouldShowAnyNudge());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!visible) onContinue?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInstall = async () => {
    await pwaInstallManager.promptInstall();
    setVisible(false);
    onContinue?.();
  };

  const handleDismiss = () => {
    pwaInstallManager.recordDismissal();
    setVisible(false);
    setShowIOSSteps(false);
    onContinue?.();
  };

  if (!visible) return null;

  if (onIOS && showIOSSteps) {
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
          padding: '16px 20px',
          zIndex: 2000,
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        <div style={{ fontFamily: "'Baloo 2', cursive", color: '#FF5722', fontSize: '1rem', marginBottom: '10px' }}>
          Add to Home Screen
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem', color: '#5D4037' }}>
            <div style={{ fontSize: '1.6rem' }}>⬆️</div>
            1. Tap Share
          </div>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem', color: '#5D4037' }}>
            <div style={{ fontSize: '1.6rem' }}>➕</div>
            2. Add to Home Screen
          </div>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem', color: '#5D4037' }}>
            <div style={{ fontSize: '1.6rem' }}>✅</div>
            3. Tap Add
          </div>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            fontFamily: "'Baloo 2', cursive",
            background: '#FF5722',
            color: '#fff',
            border: 'none',
            borderRadius: '999px',
            padding: '0 22px',
            minHeight: '48px',
            width: '100%',
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          Got it
        </button>
      </div>
    );
  }

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
          onClick={onIOS ? () => setShowIOSSteps(true) : handleInstall}
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
          {onIOS ? 'Show me how' : 'Install'}
        </button>
      </div>
    </div>
  );
};

export default InstallPromptBanner;
