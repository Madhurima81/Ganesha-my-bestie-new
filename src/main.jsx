import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { UpdateManager } from './lib/components/offline/UpdateManager.jsx'

// AppV1/V2/V3 removed — dead code whose static imports pulled old scene
// versions (and NewModakSceneV7) into the main bundle.
const GaneshaExpressionTest = React.lazy(() => import('./lib/components/character/GaneshaExpressionTest.jsx'))

import './index.css'
import { cloudSync } from './lib/services/CloudSync'
import { initAnalytics } from './lib/services/analytics'
import { initErrorMonitoring } from './lib/services/errorMonitoring'
import { initAudioService } from './lib/services/AudioService'
// Side-effect import: attaches the app-wide `beforeinstallprompt` listener immediately,
// independent of the onboarding sequence, so return visits (not just first-run
// onboarding) can still trigger the PWA install nudge.
import './lib/services/PwaInstallManager'

// initAudioService() stays eager - MainWelcomeScreen needs it for its own
// sound toggle on the very first screen, so it can't be deferred.
initAudioService();      // Preload Howler SFX instances

// Sentry/PostHog/Supabase (~310KB gzip combined) were previously initialised
// here too, before React even rendered - meaning the welcome screen's first
// paint waited on fetching, parsing, and executing all three SDKs. None of
// them are needed for that first paint (error monitoring, analytics, and
// cloud sync all matter for what happens after a child starts playing, not
// for the screen itself), so they're deferred until the browser is idle
// after the initial render instead of blocking it.
const deferredInit = () => {
  initErrorMonitoring();   // Sentry
  initAnalytics();         // PostHog
  cloudSync.init();        // Supabase cloud sync
};
// Dev safety: prevent stale UI from old PWA service-worker caches on localhost.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
)) {
  navigator.serviceWorker.getRegistrations()
    .then((regs) => Promise.all(regs.map((r) => r.unregister())))
    .then(() => (window.caches ? caches.keys() : Promise.resolve([])))
    .then((keys) => Promise.all((keys || []).map((k) => caches.delete(k))))
    .catch(() => {});
}

const isExpressionPreview = new URLSearchParams(window.location.search).get('preview') === 'ganesha';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isExpressionPreview
      ? <React.Suspense fallback={null}><GaneshaExpressionTest /></React.Suspense>
      : <UpdateManager><App/></UpdateManager>}
  </React.StrictMode>,
)

if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
  window.requestIdleCallback(deferredInit, { timeout: 2000 });
} else {
  setTimeout(deferredInit, 0);
}
