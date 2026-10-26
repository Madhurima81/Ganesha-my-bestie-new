import {
  cacheNameFor, downloadAll, pruneObsolete, isReadyFor, markReady, loadManifest,
  CACHE_CHUNKS, CACHE_SCENE_IMAGES, CACHE_AUDIO, CACHE_IMAGES, CACHE_INTRO, READY_VERSION_KEY,
} from './precacheLive';

const makeCaches = (preset = {}) => {
  const stores = {};
  const store = (name) => (stores[name] = stores[name] || new Map(Object.entries(preset[name] || {})));
  Object.keys(preset).forEach(store);
  return {
    stores,
    open: async (name) => {
      const m = store(name);
      return {
        match: async (url) => (m.has(url) ? m.get(url) : undefined),
        put: async (url, res) => { m.set(url, res); },
        keys: async () => [...m.keys()].map((u) => ({ url: `https://gmb.test${u}` })),
        delete: async (req) => m.delete(new URL(req.url).pathname),
      };
    },
  };
};
const okFetch = (log = []) => async (url) => { log.push(url); return { ok: true, status: 200, url }; };

describe('cacheNameFor', () => {
  test('maps each kind of file to the cache the service worker reads', () => {
    expect(cacheNameFor('/assets/Modak-abc.js')).toBe(CACHE_CHUNKS);
    expect(cacheNameFor('/assets/Modak-abc.css')).toBe(CACHE_CHUNKS);
    expect(cacheNameFor('/assets/bg-123.webp')).toBe(CACHE_SCENE_IMAGES);
    expect(cacheNameFor('/audio/words/vakratunda.mp3')).toBe(CACHE_AUDIO);
    expect(cacheNameFor('/audio/sound-cow.webm')).toBe(CACHE_AUDIO);
    expect(cacheNameFor('/assets/ear_grass_rustle-QpjGzif7.wav')).toBe(CACHE_AUDIO);
    expect(cacheNameFor('/assets/dragon-studio-wind-gust-CKnCyhJi.mp3')).toBe(CACHE_AUDIO);
    expect(cacheNameFor('/images/ganesha-final-new.svg')).toBe(CACHE_IMAGES);
    expect(cacheNameFor('/intro-story/story1-img1.webp')).toBe(CACHE_INTRO);
  });
  test('files no service-worker rule would serve offline are not downloaded', () => {
    expect(cacheNameFor('/videos/intro.mp4')).toBeNull();
    expect(cacheNameFor('/live-assets.json')).toBeNull();
  });
});

describe('downloadAll', () => {
  const manifest = {
    version: 'v1',
    files: [
      { u: '/assets/a-1.js', s: 100 },
      { u: '/assets/b-1.webp', s: 300 },
      { u: '/audio/words/x.mp3', s: 600 },
      { u: '/videos/skip.mp4', s: 999 },
    ],
  };

  test('saves every missing file, skips cached ones and unsupported types, reaches 100%', async () => {
    const cachesApi = makeCaches({ [CACHE_CHUNKS]: { '/assets/a-1.js': {} } });
    const log = [];
    const seen = [];
    const result = await downloadAll({ manifest, fetchFn: okFetch(log), cachesApi, onProgress: (p) => seen.push(p.percent) });
    expect(result).toMatchObject({ total: 3, saved: 2, skipped: 1, failed: 0 });
    expect(log.sort()).toEqual(['/assets/b-1.webp', '/audio/words/x.mp3']);
    expect(cachesApi.stores[CACHE_SCENE_IMAGES].has('/assets/b-1.webp')).toBe(true);
    expect(cachesApi.stores[CACHE_AUDIO].has('/audio/words/x.mp3')).toBe(true);
    expect(seen[seen.length - 1]).toBe(100);
  });

  test('a failed file is retried once, then counted as failed', async () => {
    let calls = 0;
    const flaky = async (url) => {
      if (url === '/assets/b-1.webp') { calls++; if (calls === 1) return { ok: false, status: 503 }; }
      return { ok: true, status: 200 };
    };
    const retried = await downloadAll({ manifest, fetchFn: flaky, cachesApi: makeCaches() });
    expect(retried.failed).toBe(0);
    expect(calls).toBe(2);

    const alwaysDown = async (url) => (url === '/audio/words/x.mp3' ? { ok: false, status: 500 } : { ok: true, status: 200 });
    const failed = await downloadAll({ manifest, fetchFn: alwaysDown, cachesApi: makeCaches() });
    expect(failed.failed).toBe(1);
  });

  test('stops when aborted and reports it', async () => {
    const controller = new AbortController();
    const slow = async () => { controller.abort(); return { ok: true, status: 200 }; };
    const result = await downloadAll({ manifest, fetchFn: slow, cachesApi: makeCaches(), signal: controller.signal, concurrency: 1 });
    expect(result.aborted).toBe(true);
    expect(result.saved).toBeLessThan(3);
  });

  test('running it again downloads nothing new (resumable)', async () => {
    const cachesApi = makeCaches();
    await downloadAll({ manifest, fetchFn: okFetch(), cachesApi });
    const log = [];
    const second = await downloadAll({ manifest, fetchFn: okFetch(log), cachesApi });
    expect(log).toEqual([]);
    expect(second.skipped).toBe(3);
  });
});

describe('pruneObsolete', () => {
  test('removes hashed files that are no longer in the list and keeps the rest', async () => {
    const cachesApi = makeCaches({
      [CACHE_CHUNKS]: { '/assets/old-0.js': {}, '/assets/keep-1.js': {} },
      [CACHE_SCENE_IMAGES]: { '/assets/old-0.webp': {} },
      [CACHE_AUDIO]: { '/audio/words/x.mp3': {} },
    });
    const removed = await pruneObsolete({ files: [{ u: '/assets/keep-1.js' }] }, cachesApi);
    expect(removed).toBe(2);
    expect(cachesApi.stores[CACHE_CHUNKS].has('/assets/keep-1.js')).toBe(true);
    expect(cachesApi.stores[CACHE_AUDIO].has('/audio/words/x.mp3')).toBe(true); // other caches untouched
  });
});

describe('ready marker and manifest loading', () => {
  const memory = () => { const d = {}; return { getItem: (k) => d[k] ?? null, setItem: (k, v) => { d[k] = String(v); } }; };
  test('remembers which list version was fully downloaded', () => {
    const storage = memory();
    expect(isReadyFor({ version: 'v1' }, storage)).toBe(false);
    markReady({ version: 'v1' }, storage);
    expect(storage.getItem(READY_VERSION_KEY)).toBe('v1');
    expect(isReadyFor({ version: 'v1' }, storage)).toBe(true);
    expect(isReadyFor({ version: 'v2' }, storage)).toBe(false);
  });
  test('loadManifest rejects a missing or malformed list', async () => {
    await expect(loadManifest(async () => ({ ok: false, status: 404 }))).rejects.toThrow();
    await expect(loadManifest(async () => ({ ok: true, json: async () => ({ nope: 1 }) }))).rejects.toThrow();
    const good = { version: 'v', files: [] };
    await expect(loadManifest(async () => ({ ok: true, json: async () => good }))).resolves.toEqual(good);
  });
});
