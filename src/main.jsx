import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AppV2 from './AppV2.jsx'
import AppV3 from './AppV3.jsx'
import GaneshaExpressionTest from './lib/components/character/GaneshaExpressionTest.jsx'

//import AppV1 from './AppV1.jsx'

import './index.css'
import { cloudSync } from './lib/services/CloudSync'
import { initAnalytics } from './lib/services/analytics'
import { initErrorMonitoring } from './lib/services/errorMonitoring'
import { initAudioService } from './lib/services/AudioService'

// Initialise services (all no-ops if env keys are missing)
initErrorMonitoring();   // Sentry — init first so it catches early errors
initAnalytics();         // PostHog
cloudSync.init();        // Supabase cloud sync
initAudioService();      // Preload Howler SFX instances

const isExpressionPreview = new URLSearchParams(window.location.search).get('preview') === 'ganesha';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isExpressionPreview ? <GaneshaExpressionTest /> : <App/>}
  </React.StrictMode>,
)
