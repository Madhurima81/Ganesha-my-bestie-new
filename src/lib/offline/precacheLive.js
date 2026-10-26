// precacheLive.js — "download the whole app once" for offline play.
//
// The build writes /live-assets.json (see liveAssetsPlugin.js): every file the live app uses. On a first open
// (and after each deploy that changes the list) this module saves the missing files into the SAME browser caches
// the service worker's runtime rules read (vite.config.js runtimeCaching), so offline play serves them with no
// service-worker change beyond the cache names below. Nothing here touches gameplay.
export const MANIFEST_URL = '/live-assets.json';
export const READY_VERSION_KEY = 'gmb_offline_ready_version';

// Keep in step with vite.config.js runtimeCaching cacheName values.
export const CACHE_CHUNKS = 'ganesha-chunks';
export const CACHE_SCENE_IMAGES = 'ganesha-scene-images';
export const CACHE_AUDIO = 'ganesha-audio';
export const CACHE_IMAGES = 'ganesha-images-v2';
export const CACHE_INTRO = 'ganesha-intro-story';

export function cacheNameFor(url) {
  if (/^\/assets\/.+\.(js|css)$/i.test(url)) return CACHE_CHUNKS;
  if (/^\/assets\/.+\.(png|jpe?g|webp|svg|gif)$/i.test(url)) return CACHE_SCENE_IMAGES;
  // /audio/* are public files; /assets/*.mp3|wav are sounds a scene imports (e.g. the Ears game), hashed by the build.
  if (/^\/(audio|assets)\/.+\.(mp3|wav|webm|ogg|m4a)$/i.test(url)) return CACHE_AUDIO;
  if (/^\/images\/.+\.(png|jpe?g|svg|webp|gif)$/i.test(url)) return CACHE_IMAGES;
  if (/^\/intro-story\/.+\.(png|jpe?g|svg|webp|gif)$/i.test(url)) return CACHE_INTRO;
  return null; // no service-worker rule would serve it offline, so do not download it
}

export async function loadManifest(fetchFn = fetch) {
  const res = await fetchFn(MANIFEST_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`manifest ${res.status}`);
  const manifest = await res.json();
  if (!manifest || !Array.isArray(manifest.files) || !manifest.version) throw new Error('bad manifest');
  return manifest;
}

export function isReadyFor(manifest, storage = globalThis.localStorage) {
  try { return storage.getItem(READY_VERSION_KEY) === manifest.version; } catch { return false; }
}

export function markReady(manifest, storage = globalThis.localStorage) {
  try { storage.setItem(READY_VERSION_KEY, manifest.version); } catch { /* storage blocked: it will just re-check next time */ }
}

// Save every missing file. Resumable (already-cached files are skipped), polite (a few at a time, stops on
// abort), and tolerant (a failed file is retried once, then counted). Returns { total, saved, skipped, failed }.
export async function downloadAll({
  manifest,
  fetchFn = fetch,
  cachesApi = globalThis.caches,
  concurrency = 4,
  signal,
  onProgress = () => {},
}) {
  const jobs = manifest.files
    .map((f) => ({ url: f.u, bytes: f.s || 0, cacheName: cacheNameFor(f.u) }))
    .filter((j) => j.cacheName);
  const totalBytes = jobs.reduce((n, j) => n + j.bytes, 0) || 1;
  const caches = new Map();
  const openCache = async (name) => {
    if (!caches.has(name)) caches.set(name, await cachesApi.open(name));
    return caches.get(name);
  };

  let doneBytes = 0, saved = 0, skipped = 0;
  const failedJobs = [];
  const report = () => onProgress({ percent: Math.min(100, Math.round((doneBytes / totalBytes) * 100)), saved, skipped, failed: failedJobs.length, total: jobs.length });

  const runOne = async (job) => {
    if (signal?.aborted) return false;
    const cache = await openCache(job.cacheName);
    if (await cache.match(job.url)) { skipped++; doneBytes += job.bytes; report(); return true; }
    const res = await fetchFn(job.url, { cache: 'reload', signal });
    if (!res.ok) throw new Error(`${res.status} ${job.url}`);
    await cache.put(job.url, res);
    saved++; doneBytes += job.bytes; report();
    return true;
  };

  const runAll = async (list, failOut) => {
    let next = 0;
    const worker = async () => {
      while (next < list.length && !signal?.aborted) {
        const job = list[next++];
        try { await runOne(job); } catch { if (signal?.aborted) return; failOut.push(job); }
      }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, list.length) }, worker));
  };

  await runAll(jobs, failedJobs);
  if (failedJobs.length && !signal?.aborted) {
    const retry = failedJobs.splice(0, failedJobs.length);
    await runAll(retry, failedJobs);
  }
  report();
  return { total: jobs.length, saved, skipped, failed: failedJobs.length, aborted: !!signal?.aborted };
}

// After a complete download, drop hashed files from older deploys so the cache does not grow for ever.
export async function pruneObsolete(manifest, cachesApi = globalThis.caches) {
  const keep = new Set(manifest.files.map((f) => f.u));
  let removed = 0;
  for (const name of [CACHE_CHUNKS, CACHE_SCENE_IMAGES]) {
    const cache = await cachesApi.open(name);
    for (const req of await cache.keys()) {
      const { pathname } = new URL(req.url);
      if (pathname.startsWith('/assets/') && !keep.has(pathname)) { await cache.delete(req); removed++; }
    }
  }
  return removed;
}
