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

// Initialise services (all no-ops if env keys are missing)
initErrorMonitoring();   // Sentry â€” init first so it catches early errors
initAnalytics();         // PostHog
cloudSync.init();        // Supabase cloud sync
initAudioService();      // Preload Howler SFX instances
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
