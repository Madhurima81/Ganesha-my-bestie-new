/**
 * Separate entry point for the game test harness — NOT the main app.
 *
 * Served by /game-test.html. This deliberately skips App.jsx and everything it
 * pulls in (loading screen, profile init, PWA/UpdateManager, analytics, Sentry,
 * Supabase, scene registry) so it compiles in ~1s instead of ~18s.
 *
 *   npm run dev  →  http://localhost:5173/game-test.html
 *
 * Dev-only: game-test.html is not in the production rollup input, and the map
 * link that points here is import.meta.env.DEV-gated.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import GameTestHarness from './GameTestHarness.jsx';
import '../index.css';

// Kill any stale PWA service worker / caches so the harness isn't served old code.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then((regs) => Promise.all(regs.map((r) => r.unregister())))
    .then(() => (window.caches ? caches.keys() : []))
    .then((keys) => Promise.all((keys || []).map((k) => caches.delete(k))))
    .catch(() => {});
}

// No StrictMode: it double-invokes effects, which makes the games' intro
// timers / VO fire twice and muddies the console during manual testing.
ReactDOM.createRoot(document.getElementById('root')).render(<GameTestHarness />);
