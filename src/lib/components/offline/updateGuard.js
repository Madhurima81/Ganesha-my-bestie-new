// updateGuard.js - safe-moment logic for PWA updates and failed lazy chunks.
//
// After a deploy an installed app can still be running the OLD shell, which asks for hashed chunks that no
// longer exist. This file decides WHEN it is safe to reload (never mid-game) and installs the handlers that
// react to a failed chunk. See docs/KNOWN_PITFALLS.md "lazy chunk after deploy".

export const VIEW_EVENT = 'gmb:viewchange';
export const CHUNK_FAILED_EVENT = 'gmb:chunk-failed';
const RELOAD_STAMP_KEY = 'gmb_chunk_reload_ts';
const RELOAD_GUARD_MS = 30000;

// Views where nothing is in progress. Everything else (scene, twg, forms, parent screens) counts as busy.
const SAFE_VIEWS = new Set([
  'loading', 'landing', 'main-welcome', 'profile-welcome', 'profile-selector', 'map', 'zone-welcome'
]);

export const publishAppView = (view) => {
  if (typeof window === 'undefined') return;
  window.__gmbView = view;
  window.dispatchEvent(new CustomEvent(VIEW_EVENT, { detail: view }));
};

export const isSafeView = (view) => {
  const v = view === undefined ? (typeof window !== 'undefined' ? window.__gmbView : undefined) : view;
  // Before the app has published a view nothing is running yet, so a reload is harmless.
  return v === undefined || v === null || SAFE_VIEWS.has(v);
};

const reloadedRecently = () => {
  try {
    const ts = Number(sessionStorage.getItem(RELOAD_STAMP_KEY) || 0);
    return ts > 0 && Date.now() - ts < RELOAD_GUARD_MS;
  } catch { return false; }
};

const stampReload = () => {
  try { sessionStorage.setItem(RELOAD_STAMP_KEY, String(Date.now())); } catch { /* private mode */ }
};

export const CHUNK_ERROR_RE = /dynamically imported module|Importing a module script failed|error loading dynamically imported|Unable to preload CSS|Loading chunk .* failed|Failed to fetch dynamically/i;
export const isChunkLoadError = (err) => CHUNK_ERROR_RE.test(String((err && (err.message || err)) || ''));

// A lazy chunk failed. On a safe view reload ONCE (the guard stops loops); otherwise tell the UI to show the
// "Tap to refresh" card. Returns 'reloading' or 'card'.
export const handleChunkFailure = () => {
  if (typeof window === 'undefined') return 'card';
  if (isSafeView() && !reloadedRecently()) {
    stampReload();
    window.location.reload();
    return 'reloading';
  }
  window.dispatchEvent(new CustomEvent(CHUNK_FAILED_EVENT));
  return 'card';
};

// Old runtime cache name, replaced by ganesha-images-v2 (vite.config.js). Free the space once.
const purgeLegacyCaches = () => {
  try { if (window.caches) window.caches.delete('ganesha-images'); } catch { /* ignore */ }
};

let installed = false;
export const installChunkErrorHandlers = () => {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  purgeLegacyCaches();
  // Vite fires this when a dynamic import's preload fails. Do NOT preventDefault: the import must still reject
  // so React's boundary (ChunkErrorBoundary) sees it.
  window.addEventListener('vite:preloadError', () => { handleChunkFailure(); });
  window.addEventListener('unhandledrejection', (e) => {
    if (isChunkLoadError(e.reason)) handleChunkFailure();
  });
};
