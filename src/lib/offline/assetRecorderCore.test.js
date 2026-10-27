import {
  normalizeEntry, keyFor, keyAt, addFiles, buildExport, loadRecord, saveRecord, recorderWanted, RECORD_STORAGE_KEY,
} from './assetRecorderCore';

const ORIGIN = 'https://gmb.test';
const entry = (name, extra = {}) => ({ name, decodedBodySize: 1000, encodedBodySize: 400, transferSize: 450, ...extra });
const memory = () => { const d = {}; return { getItem: (k) => d[k] ?? null, setItem: (k, v) => { d[k] = String(v); }, removeItem: (k) => { delete d[k]; } }; };

describe('normalizeEntry', () => {
  test('keeps same-origin pictures, sounds, code and styles, decoded and without the query', () => {
    expect(normalizeEntry(entry(`${ORIGIN}/assets/rock-ab12.webp?x=1`), ORIGIN)).toEqual({ u: '/assets/rock-ab12.webp', bytes: 1000 });
    expect(normalizeEntry(entry(`${ORIGIN}/audio/ambient/map%20ambient%20sound.mp3`), ORIGIN).u).toBe('/audio/ambient/map%20ambient%20sound.mp3');
    expect(normalizeEntry(entry(`${ORIGIN}/assets/Pond-1.js`), ORIGIN)).not.toBeNull();
  });
  test('ignores other sites, non-media, service-worker plumbing and dev-server files', () => {
    expect(normalizeEntry(entry('https://fonts.gstatic.com/x.woff2'), ORIGIN)).toBeNull();
    expect(normalizeEntry(entry('https://cdn.other.com/a.png'), ORIGIN)).toBeNull();
    expect(normalizeEntry(entry(`${ORIGIN}/api/thing`), ORIGIN)).toBeNull();
    expect(normalizeEntry(entry(`${ORIGIN}/sw.js`), ORIGIN)).toBeNull();
    expect(normalizeEntry(entry(`${ORIGIN}/workbox-abc123.js`), ORIGIN)).toBeNull();
    expect(normalizeEntry(entry(`${ORIGIN}/src/App.jsx.js`), ORIGIN)).toBeNull();
    expect(normalizeEntry({ name: 'not a url' }, ORIGIN)).toBeNull();
  });
  test('a file served from cache (size 0 on the wire) still counts, by its decoded size', () => {
    expect(normalizeEntry(entry(`${ORIGIN}/assets/a.png`, { transferSize: 0, encodedBodySize: 0, decodedBodySize: 5000 }), ORIGIN).bytes).toBe(5000);
  });
});

describe('keyFor', () => {
  test('files a fetch under the scene being played, the zone welcome, or the screen', () => {
    expect(keyFor({ view: 'scene', zone: 'symbol-mountain', scene: 'pond' })).toBe('scene:symbol-mountain/pond');
    expect(keyFor({ view: 'zone-welcome', zone: 'about-me-hut' })).toBe('zone-welcome:about-me-hut');
    expect(keyFor({ view: 'map' })).toBe('screen:map');
    expect(keyFor({})).toBe('screen:boot');
    expect(keyFor({ view: 'scene' })).toBe('screen:scene'); // scene view but no ids yet
  });
});

describe('keyAt', () => {
  const timeline = [{ t: 0, key: 'screen:map' }, { t: 100, key: 'scene:a/b' }, { t: 250, key: 'screen:map' }];
  test('returns the key that was active when the fetch started', () => {
    expect(keyAt(timeline, 50)).toBe('screen:map');
    expect(keyAt(timeline, 100)).toBe('scene:a/b');
    expect(keyAt(timeline, 249)).toBe('scene:a/b');
    expect(keyAt(timeline, 9999)).toBe('screen:map');
  });
  test('a fetch from before the first note goes to the first key; an empty timeline goes to boot', () => {
    expect(keyAt([{ t: 500, key: 'screen:map' }], 10)).toBe('screen:map');
    expect(keyAt([], 10)).toBe('screen:boot');
  });
});

describe('addFiles and buildExport', () => {
  test('counts only files new to that key, keeps the biggest size seen, and exports sorted by size', () => {
    const record = {};
    expect(addFiles(record, 'scene:a/b', [{ u: '/x.png', bytes: 10 }, { u: '/y.png', bytes: 500 }])).toBe(2);
    expect(addFiles(record, 'scene:a/b', [{ u: '/x.png', bytes: 90 }, { u: '/z.mp3', bytes: 5 }])).toBe(1);
    const out = buildExport(record, { page: 'https://gmb.test' });
    expect(out.version).toBe(1);
    expect(out.page).toBe('https://gmb.test');
    const k = out.keys['scene:a/b'];
    expect(k.count).toBe(3);
    expect(k.bytes).toBe(595);
    expect(k.files.map((f) => f.u)).toEqual(['/y.png', '/x.png', '/z.mp3']);
    expect(k.files[1].bytes).toBe(90);
  });
});

describe('storage and the on/off flag', () => {
  test('saves and reloads the record, and survives broken storage', () => {
    const s = memory();
    saveRecord({ k: { '/a.png': 1 } }, s);
    expect(loadRecord(s)).toEqual({ k: { '/a.png': 1 } });
    s.setItem(RECORD_STORAGE_KEY, '{bad json');
    expect(loadRecord(s)).toEqual({});
    expect(loadRecord({ getItem() { throw new Error('blocked'); } })).toEqual({});
  });
  test('?recordassets=1 turns it on and stays on; ?recordassets=0 turns it off; otherwise off', () => {
    const s = memory();
    expect(recorderWanted('', s)).toBe(false);
    expect(recorderWanted('?recordassets=1', s)).toBe(true);
    expect(recorderWanted('', s)).toBe(true);
    expect(recorderWanted('?recordassets=0', s)).toBe(false);
    expect(recorderWanted('', s)).toBe(false);
  });
});
