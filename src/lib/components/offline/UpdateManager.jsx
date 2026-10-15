// UpdateManager.jsx - Handles PWA updates
import { useState, useEffect } from 'react';
import ChunkErrorBoundary, { RefreshCard } from './ChunkErrorBoundary';
import { VIEW_EVENT, CHUNK_FAILED_EVENT, isSafeView } from './updateGuard';

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
        minHeight: '60px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      Refresh
    </button>
  </div>
);

// A new service worker can be found/installed/activated at any moment. We only RECORD that (updatePending) and
// show the Refresh banner when the app is on a safe view (map, Home, Zone Welcome...). Never mid-scene, and
// never an automatic reload. A failed lazy chunk is handled separately by ChunkErrorBoundary / updateGuard.
export const UpdateManager = ({ children }) => {
  const [updatePending, setUpdatePending] = useState(false);
  const [chunkFailed, setChunkFailed] = useState(false);
  const [view, setView] = useState(() => (typeof window !== 'undefined' ? window.__gmbView : undefined));

  useEffect(() => {
    const onView = (e) => setView(e.detail);
    window.addEventListener(VIEW_EVENT, onView);
    // Busy view + lazy chunk failed: the only case where a card appears mid-scene (a reload would be lost work otherwise).
    const onChunkFailed = () => setChunkFailed(true);
    window.addEventListener(CHUNK_FAILED_EVENT, onChunkFailed);
    return () => {
      window.removeEventListener(VIEW_EVENT, onView);
      window.removeEventListener(CHUNK_FAILED_EVENT, onChunkFailed);
    };
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return undefined;
    const sw = navigator.serviceWorker;
    // An update only counts if an older worker was already controlling this page (not the first install).
    const hadController = !!sw.controller;
    let registration = null;
    let cancelled = false;
    const markPending = () => { if (!cancelled) setUpdatePending(true); };

    const watchWorker = (worker) => {
      if (!worker) return;
      if (worker.state === 'installed' && hadController) markPending();
      worker.addEventListener('statechange', () => {
        if ((worker.state === 'installed' || worker.state === 'activated') && hadController) markPending();
      });
    };
    const onUpdateFound = () => watchWorker(registration && registration.installing);
    const onControllerChange = () => { if (hadController) markPending(); };
    const checkForUpdate = () => {
      if (document.visibilityState === 'hidden' || !registration) return;
      registration.update().catch(() => {});
    };

    sw.addEventListener('controllerchange', onControllerChange);
    sw.getRegistration().then((reg) => {
      if (cancelled || !reg) return;
      registration = reg;
      if (reg.waiting && hadController) markPending();
      watchWorker(reg.installing);
      reg.addEventListener('updatefound', onUpdateFound);
      checkForUpdate();
    }).catch(() => {});
    document.addEventListener('visibilitychange', checkForUpdate);
    window.addEventListener('online', checkForUpdate);

    return () => {
      cancelled = true;
      sw.removeEventListener('controllerchange', onControllerChange);
      document.removeEventListener('visibilitychange', checkForUpdate);
      window.removeEventListener('online', checkForUpdate);
      if (registration) registration.removeEventListener('updatefound', onUpdateFound);
    };
  }, []);

  return (
    <>
      <ChunkErrorBoundary>{children}</ChunkErrorBoundary>
      {chunkFailed && <RefreshCard />}
      {!chunkFailed && updatePending && isSafeView(view) && (
        <UpdatePrompt onUpdate={() => window.location.reload()} />
      )}
    </>
  );
};
