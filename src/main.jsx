import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AppV2 from './AppV2.jsx'
import AppV3 from './AppV3.jsx'
import GaneshaExpressionTest from './lib/components/character/GaneshaExpressionTest.jsx'

//import AppV1 from './AppV1.jsx'

import './index.css'

// test 2

const isExpressionPreview = new URLSearchParams(window.location.search).get('preview') === 'ganesha';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isExpressionPreview ? <GaneshaExpressionTest /> : <App/>}
  </React.StrictMode>,
)
