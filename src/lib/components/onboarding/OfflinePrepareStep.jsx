// OfflinePrepareStep.jsx — the visible "Getting Ganesha ready" step at the end of grown-up setup.
//
// Like an app's first-run download: a progress bar the grown-up can watch, ideally on Wi-Fi, so the child gets a
// complete app. "Skip for now" always works; the quiet background download (OfflineReadyManager) carries on later.
// It shows nothing and moves straight on when there is nothing to do: dev build, no service-worker support,
// data-saver on, offline, or this version already downloaded.
import React, { useEffect, useRef, useState } from 'react';
import PrimaryBtn from '../shared/PrimaryBtn';
import {
  loadManifest, isReadyFor, markReady, downloadAll, pruneObsolete,
} from '../../offline/precacheLive';
import { isProd } from '../../offline/env';
import { recorderIsOn } from '../../offline/assetRecorderCore';

const supported = () => typeof window !== 'undefined' && 'caches' in window && 'serviceWorker' in navigator;
const skipReason = () => {
  if (!isProd()) return 'dev';
  if (recorderIsOn()) return 'recording';
  if (!supported()) return 'unsupported';
  if (navigator.connection?.saveData) return 'data-saver';
  if (navigator.onLine === false) return 'offline';
  return null;
};

export default function OfflinePrepareStep({ onFinish }) {
  const [status, setStatus] = useState('checking'); // checking | downloading | done | failed
  const [percent, setPercent] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const controllerRef = useRef(null);
  const finishedRef = useRef(false);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    controllerRef.current?.abort();
    onFinish();
  };

  useEffect(() => {
    if (skipReason()) { finish(); return undefined; }
    let cancelled = false;
    let doneTimer = null;
    const controller = new AbortController();
    controllerRef.current = controller;

    (async () => {
      try {
        setStatus('checking');
        const manifest = await loadManifest();
        if (cancelled) return;
        if (isReadyFor(manifest)) { finish(); return; }
        setPercent(0);
        setStatus('downloading');
        const result = await downloadAll({
          manifest,
          signal: controller.signal,
          onProgress: (p) => { if (!cancelled) setPercent(p.percent); },
        });
        if (cancelled || result.aborted) return;
        if (result.failed > 0) { setStatus('failed'); return; }
        markReady(manifest);
        pruneObsolete(manifest).catch(() => {});
        try { navigator.storage?.persist?.(); } catch { /* best effort */ }
        setStatus('done');
        doneTimer = setTimeout(() => { if (!cancelled) finish(); }, 1400);
      } catch {
        if (!cancelled) setStatus('failed');
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(doneTimer);
      controller.abort();
    };
    // finish() only touches refs and the stable onFinish callback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const heading = status === 'done' ? 'Ready!' : 'Getting Ganesha ready';
  const body = {
    checking: 'One moment…',
    downloading: 'This lets Ganesha work even without internet. Please keep this screen open until it is done.',
    done: 'Ganesha is ready to play, even without internet.',
    failed: 'We could not finish. Check the internet connection and try again, or skip for now. Ganesha will keep trying later.',
  }[status];

  return (
    <>
      <h2 className="create-step-heading">{heading}</h2>
      <p className="handoff-body" role="status" aria-live="polite">{body}</p>

      {(status === 'downloading' || status === 'done') && (
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={status === 'done' ? 100 : percent}
          aria-label="Getting Ganesha ready"
          style={{ width: '100%', maxWidth: '320px', height: '14px', margin: '4px auto 14px', borderRadius: '999px', background: '#ece4f8', overflow: 'hidden' }}
        >
          <div style={{ height: '100%', width: `${status === 'done' ? 100 : percent}%`, background: '#7356b4', borderRadius: '999px', transition: 'width .25s ease' }} />
        </div>
      )}
      {status === 'downloading' && (
        <p className="handoff-body" aria-hidden="true" style={{ fontWeight: 800 }}>{percent}%</p>
      )}

      {status === 'failed' && (
        <PrimaryBtn label="Try again" onClick={() => setAttempt((n) => n + 1)} size="md" fullWidth className="final-cta-btn" />
      )}
      {status !== 'done' && (
        <button type="button" className="back-btn" style={{ minHeight: '60px', minWidth: '60px' }} onClick={finish}>
          Skip for now
        </button>
      )}
    </>
  );
}
