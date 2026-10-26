import fs from 'fs';
import os from 'os';
import path from 'path';
import { collectLiveAssets, resolvePublicRef, readLiveSceneFiles, filterManifestToOutput } from './liveAssetsPlugin';

let publicDir;
const touch = (rel, bytes = 10) => {
  const abs = path.join(publicDir, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, Buffer.alloc(bytes));
};

beforeEach(() => {
  publicDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gmb-public-'));
  touch('audio/words/vakratunda.mp3', 50);
  touch('audio/words/mahakaya.mp3', 60);
  touch('audio/voice/line-a.mp3', 70);
  touch('images/ganesha.svg', 80);
  touch('images/unused-big.png', 999);
  touch('intro-story/story1.webp', 20);
});
afterEach(() => fs.rmSync(publicDir, { recursive: true, force: true }));

const chunk = (fileName, facade, code, extra = {}) => ({
  type: 'chunk',
  fileName,
  facadeModuleId: facade,
  isEntry: !!extra.isEntry,
  code,
  imports: extra.imports || [],
  dynamicImports: extra.dynamicImports || [],
  viteMetadata: { importedAssets: new Set(extra.assets || []), importedCss: new Set(extra.css || []) },
});
const asset = (source) => ({ type: 'asset', source });

const LIVE_SCENES = ['src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx'];

describe('resolvePublicRef', () => {
  test('exact file, folder and prefix references resolve to real files only', () => {
    const warnings = [];
    expect(resolvePublicRef('/images/ganesha.svg', publicDir, warnings)).toHaveLength(1);
    expect(resolvePublicRef('/audio/words/', publicDir, warnings)).toHaveLength(2);
    expect(resolvePublicRef('/audio/words/vak', publicDir, warnings)).toHaveLength(1);
    expect(resolvePublicRef('/images/missing.png', publicDir, warnings)).toHaveLength(0);
    expect(warnings.some((w) => w.includes('missing'))).toBe(true);
  });
  test('a specific prefix in a top-level folder is included, a short one is not', () => {
    touch('images/new-explorer-owl.webp', 12);
    touch('images/new-explorer-owl.png', 12);
    touch('images/abc-other.png', 12);
    const warnings = [];
    expect(resolvePublicRef('/images/new-explorer-', publicDir, warnings)).toHaveLength(2);
    expect(resolvePublicRef('/images/a', publicDir, warnings)).toHaveLength(0);
  });
  test('a whole top-level folder is never included', () => {
    const warnings = [];
    expect(resolvePublicRef('/images/', publicDir, warnings)).toHaveLength(0);
    expect(warnings.some((w) => w.includes('broad'))).toBe(true);
  });
});

describe('collectLiveAssets', () => {
  const bundle = () => ({
    // always-loaded core: loads one app screen and (by dynamic import) both scenes
    'assets/index-main.js': chunk('assets/index-main.js', '/p/src/main.jsx', 'const avatar="/images/ganesha.svg";', {
      isEntry: true,
      css: ['assets/index-main.css'],
      dynamicImports: ['assets/MapScreen-1.js', 'assets/Pond-1.js', 'assets/Cave-1.js', 'assets/OldPondV2-1.js', 'assets/glob-dead-bg-1.js'],
    }),
    'assets/index-main.css': asset('body{background:url(/assets/bg-shared.webp)}'),
    'assets/bg-shared.webp': asset('x'.repeat(25)),
    'assets/vendor-react-1.js': chunk('assets/vendor-react-1.js', null, ''),
    // import.meta.glob(..., { query: '?url' }) turns every image into a dynamic import of a tiny URL chunk
    'assets/glob-dead-bg-1.js': chunk('assets/glob-dead-bg-1.js', '/p/src/zones/meaning cave/assets/images/bg.webp?url', 'export default "/assets/glob-dead-bg.webp"', { assets: ['assets/glob-dead-bg.webp'] }),
    'assets/glob-dead-bg.webp': asset('x'.repeat(600)),
    // an app screen (not a scene) = live root
    'assets/MapScreen-1.js': chunk('assets/MapScreen-1.js', '/p/src/pages/CleanMapZone.jsx', 'const a=`/intro-story/story1.webp`;', { assets: ['assets/map-1.webp'] }),
    'assets/map-1.webp': asset('x'.repeat(35)),
    // a live scene = live root; it imports a shared image chunk
    'assets/Pond-1.js': chunk('assets/Pond-1.js', '/p/src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx',
      'const a="/images/ganesha.svg",b=`/audio/words/${id}.mp3`,c="/audio/words/";',
      { assets: ['assets/water-1.webp'], css: ['assets/Pond-1.css'], imports: ['assets/shared-lotus-1.js'] }),
    'assets/Pond-1.css': asset('.x{background:url(/assets/pond-bg-2.webp)} .y{background:url("/images/ganesha.svg")}'),
    'assets/water-1.webp': asset('x'.repeat(40)),
    'assets/pond-bg-2.webp': asset('x'.repeat(30)),
    'assets/shared-lotus-1.js': chunk('assets/shared-lotus-1.js', '/p/src/zones/symbol-mountain/shared/lotus.webp', 'export default "/assets/lotus-1.webp"', { assets: ['assets/lotus-1.webp'] }),
    'assets/lotus-1.webp': asset('x'.repeat(45)),
    // dead zone scene and an old version nothing live reaches
    'assets/Cave-1.js': chunk('assets/Cave-1.js', '/p/src/zones/meaning cave/scenes/CaveScene.jsx', 'const a="/images/unused-big.png";', { assets: ['assets/cave-1.png'] }),
    'assets/cave-1.png': asset('x'.repeat(500)),
    'assets/OldPondV2-1.js': chunk('assets/OldPondV2-1.js', '/p/src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV2.jsx', '', { assets: ['assets/old-pond-1.svg'], imports: ['assets/old-only-1.js'] }),
    'assets/old-pond-1.svg': asset('x'.repeat(7000)),
    'assets/old-only-1.js': chunk('assets/old-only-1.js', '/p/src/zones/symbol-mountain/shared/old-icon.webp', 'export default "/assets/old-icon-1.webp"', { assets: ['assets/old-icon-1.webp'] }),
    'assets/old-icon-1.webp': asset('x'.repeat(900)),
    'assets/lazy-sentry-1.js': chunk('assets/lazy-sentry-1.js', null, ''),
  });

  const urlsOf = (b = bundle()) => collectLiveAssets(b, publicDir, LIVE_SCENES).manifest.files.map((f) => f.u);

  test('includes live scenes, app screens, what they import and the public files they name', () => {
    expect(urlsOf()).toEqual(expect.arrayContaining([
      '/assets/Pond-1.js', '/assets/Pond-1.css', '/assets/water-1.webp', '/assets/pond-bg-2.webp',
      '/assets/MapScreen-1.js', '/assets/map-1.webp', '/assets/shared-lotus-1.js', '/assets/lotus-1.webp',
      '/assets/bg-shared.webp', '/images/ganesha.svg', '/audio/words/vakratunda.mp3', '/audio/words/mahakaya.mp3',
      '/intro-story/story1.webp',
    ]));
  });

  test('leaves out dead zones, old versions nothing live reaches, the shell and analytics SDKs', () => {
    const urls = urlsOf();
    for (const gone of ['/assets/glob-dead-bg-1.js', '/assets/glob-dead-bg.webp', '/assets/Cave-1.js', '/assets/cave-1.png', '/images/unused-big.png', '/assets/OldPondV2-1.js',
      '/assets/old-pond-1.svg', '/assets/old-only-1.js', '/assets/old-icon-1.webp', '/assets/index-main.js',
      '/assets/vendor-react-1.js', '/assets/lazy-sentry-1.js']) {
      expect(urls).not.toContain(gone);
    }
  });

  test('warns when a live scene has no chunk in the build', () => {
    const { warnings } = collectLiveAssets(bundle(), publicDir, [...LIVE_SCENES, 'src/zones/x/Missing.jsx']);
    expect(warnings.some((w) => w.includes('Missing.jsx'))).toBe(true);
  });

  test('reports sizes and a version that changes when the list changes', () => {
    const first = collectLiveAssets(bundle(), publicDir, LIVE_SCENES).manifest;
    expect(first.totalBytes).toBeGreaterThan(0);
    expect(first.count).toBe(first.files.length);
    const changed = bundle();
    changed['assets/Pond-1.js'] = chunk('assets/Pond-1.js', '/p/src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx', 'const a="/images/ganesha.svg";', { assets: ['assets/water-1.webp'] });
    expect(collectLiveAssets(changed, publicDir, LIVE_SCENES).manifest.version).not.toBe(first.version);
  });
});

describe('readLiveSceneFiles', () => {
  test('keeps live scene files and drops obsolete/parked zones', () => {
    const file = path.join(publicDir, 'registry.js');
    fs.writeFileSync(file, [
      "{ file: 'src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx' },",
      "{ file: 'src/zones/meaning cave/scenes/Cave.jsx' },",
      "{ file: 'src/zones/festival-square/Game1/Piano.jsx' },",
      "{ file: 'src/zones/about-me-hut/food/Favoritefoodgame.jsx' },",
    ].join('\n'));
    expect(readLiveSceneFiles(file)).toEqual([
      'src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx',
      'src/zones/about-me-hut/food/Favoritefoodgame.jsx',
    ]);
  });
});

describe('filterManifestToOutput', () => {
  test('drops files the build did not write and recomputes the totals and version', () => {
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'gmb-out-'));
    fs.mkdirSync(path.join(out, 'assets'), { recursive: true });
    fs.writeFileSync(path.join(out, 'assets', 'kept-1.js'), 'x');
    fs.writeFileSync(path.join(out, 'assets', 'with space.webp'), 'x');
    const manifest = { version: 'old', files: [{ u: '/assets/kept-1.js', s: 5 }, { u: '/assets/with%20space.webp', s: 7 }, { u: '/assets/gone-1.js', s: 9 }] };
    const { manifest: next, dropped } = filterManifestToOutput(manifest, out);
    fs.rmSync(out, { recursive: true, force: true });
    expect(dropped).toBe(1);
    expect(next.files.map((f) => f.u)).toEqual(['/assets/kept-1.js', '/assets/with%20space.webp']);
    expect(next.totalBytes).toBe(12);
    expect(next.count).toBe(2);
    expect(next.version).not.toBe('old');
  });
});
