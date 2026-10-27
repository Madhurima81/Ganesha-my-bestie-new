// OfflineReadyManager.jsx — saves the whole live app on the device (once) so it plays offline like a downloaded app.
//
// Runs in the background on the calm screens (welcome, map, zone welcome) and pauses while a scene is open, so it
// never competes with gameplay. Resumable: leaving and coming back only fetches what is still missing. Shows a small,
// quiet note while it works, and says plainly if it could not finish. Production only: dev has no file list.
import React, { useEffect, useState } from 'react';
import {
  loadManifest, isReadyFor, markReady, downloadAll, pruneObsolete,
} from '../../offline/precacheLive';
import { isProd } from '../../offline/env';

// Screens where a background download is fine: only AFTER setup, when a profile exists. Before that the grown-up
// sees the visible "Getting Ganesha ready" step in setup (OfflinePrepareStep) and owns the download; starting here
// as well would spend a family's data while they are only looking at the landing or welcome screen. Not 'scene'
// (gameplay), not boot/error.
const CALM_VIEWS = new Set(['profile-welcome', 'profile-selector', 'map', 'zone-welcome']);
// Where the note is shown (a grown-up is most likely looking, and nothing important is covered).
const NOTE_VIEWS = new Set(['profile-welcome', 'map', 'zone-welcome']);

const supported = () => typeof window !== 'undefined' && 'caches' in window && 'serviceWorker' in navigator;

export default function OfflineReadyManager({ view }) {
  const [status, setStatus] = useState('idle'); // idle | downloading | done | error | offline
  const [percent, setPercent] = useState(0);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!isProd() || !supported() || !CALM_VIEWS.has(view)) return undefined;
    if (navigator.connection?.saveData) return undefined; // the family asked the phone to save data
    let cancelled = false;
    let doneTimer = null;
    const controller = new AbortController();

    const run = async () => {
      try {
        const manifest = await loadManifest();
        if (cancelled) return;
        if (isReadyFor(manifest)) { setStatus('idle'); return; }
        setPercent(0);
        setStatus('downloading');
        const result = await downloadAll({
          manifest,
          signal: controller.signal,
          onProgress: (p) => { if (!cancelled) setPercent(p.percent); },
        });
        if (cancelled || result.aborted) return; // left the calm screens: it resumes next time
        if (result.failed > 0) { setStatus(navigator.onLine ? 'error' : 'offline'); return; }
        markReady(manifest);
        pruneObsolete(manifest).catch(() => {});
        try { navigator.storage?.persist?.(); } catch { /* best effort: asks the browser not to clear this */ }
        setStatus('done');
        doneTimer = setTimeout(() => { if (!cancelled) setStatus('idle'); }, 4500);
      } catch {
        if (!cancelled) setStatus(navigator.onLine ? 'error' : 'offline');
      }
    };

    const startTimer = setTimeout(run, 2500); // let the screen settle before using the network
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(startTimer);
      clearTimeout(doneTimer);
    };
  }, [view, retry]);

  // Coming back online after a failed or offline attempt: try again on its own.
  useEffect(() => {
    const onOnline = () => setRetry((n) => n + 1);
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  if (status === 'idle' || !NOTE_VIEWS.has(view)) return null;

  const text = {
    downloading: `Getting Ganesha ready for offline play… ${percent}%`,
    done: 'Ready for offline play ✓',
    error: 'Could not finish getting ready for offline play.',
    offline: 'You are offline. Getting ready will finish when you reconnect.',
  }[status];

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed', left: '50%', bottom: 'max(12px, env(safe-area-inset-bottom))', transform: 'translateX(-50%)',
        zIndex: 900, maxWidth: 'min(92vw, 420px)', padding: '8px 14px', borderRadius: '999px',
        background: 'rgba(255, 249, 230, 0.94)', border: '1px solid #eadfc9', boxShadow: '0 4px 14px rgba(40,20,80,0.14)',
        fontFamily: "'Nunito', sans-serif", fontSize: '13px', fontWeight: 700, color: '#5d4a82',
        display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center',
      }}
    >
      <span>{text}</span>
      {status === 'downloading' && (
        <span aria-hidden="true" style={{ width: '90px', height: '6px', borderRadius: '999px', background: '#efe7d7', overflow: 'hidden' }}>
          <span style={{ display: 'block', height: '100%', width: `${percent}%`, background: '#7356b4', transition: 'width .2s ease' }} />
        </span>
      )}
      {status === 'error' && (
        <button
          type="button"
          onClick={() => setRetry((n) => n + 1)}
          style={{ minHeight: '60px', minWidth: '60px', border: 'none', borderRadius: '999px', padding: '0 20px', background: '#7356b4', color: '#fff', fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
