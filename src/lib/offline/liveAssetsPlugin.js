/* global Buffer */
// liveAssetsPlugin.js — build-time list of every file the LIVE app needs, written to dist/live-assets.json.
//
// Why: the PWA only precaches the tiny app shell; scenes cache the first time a child opens them. To make the
// installed app work offline like a downloaded app, the browser downloads this list once (see precacheLive.js).
// The list must contain only files the live app uses: the build also bundles obsolete zones (Cave of Secrets,
// Festival Square), backups and dev tools that a child never opens.
//
// How: for every output chunk that is not purely dead-zone code, take its own file, its CSS, the assets it
// imports, and every /images, /audio, /intro-story path its code or CSS mentions (public files are referenced by
// text, so the bundler does not track them). A path ending in "/" or a prefix such as "/audio/words/" includes
// that public folder's media files.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const DEAD_MODULE_RE = /(meaning cave|festival-square|[\\/]archive[\\/]|[\\/]src[\\/]dev[\\/]|backup|[ _.-]copy|original|Namebirthday)/i;
const MEDIA_EXT = 'png|jpe?g|webp|svg|gif|mp3|wav|webm|ogg|m4a';
const MEDIA_FILE_RE = new RegExp(`\\.(${MEDIA_EXT})$`, 'i');
// Any string literal that starts with one of the public media folders (quote, backtick or url( in CSS).
const PUBLIC_REF_RE = /["'`(]\s*(\/(?:images|audio|intro-story)\/[^"'`\s${}()\\]*)/g;
const SKIP_CHUNK_RE = /(^|\/)(vendor-|lazy-)/; // shell is precached already; analytics SDKs are pointless offline

const walk = (dir, out = []) => {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (MEDIA_FILE_RE.test(entry.name)) out.push(full);
  }
  return out;
};

// Resolve one mentioned public path to real files: exact file, a folder ("/audio/words/"), or a prefix.
export function resolvePublicRef(ref, publicDir, warnings = []) {
  const clean = ref.split('?')[0].split('#')[0];
  const rel = clean.replace(/^\//, '');
  const abs = path.join(publicDir, rel);
  if (MEDIA_FILE_RE.test(clean)) {
    return fs.existsSync(abs) && fs.statSync(abs).isFile() ? [abs] : (warnings.push(`missing public file ${clean}`), []);
  }
  const depth = rel.split('/').filter(Boolean).length;
  if (clean.endsWith('/')) {
    if (depth < 2) { warnings.push(`skipped broad folder ${clean}`); return []; }
    return walk(abs);
  }
  // prefix such as /audio/words/word- or /images/new-explorer-: every media file in that folder starting with it.
  // In a top-level folder the prefix must be specific (6+ characters) so "/images/a" cannot sweep up the folder.
  const dir = path.dirname(abs);
  const base = path.basename(abs);
  const inTopLevel = path.relative(publicDir, dir).split(path.sep).filter(Boolean).length < 2;
  if (inTopLevel && base.length < 6) {
    warnings.push(`skipped broad prefix ${clean}`); return [];
  }
  return walk(dir).filter((f) => path.basename(f).startsWith(base));
}

const toUrl = (publicDir, abs) => '/' + path.relative(publicDir, abs).split(path.sep).join('/');

export function collectLiveAssets(bundle, publicDir, liveSceneFiles = []) {
  const files = new Map(); // url -> bytes
  const warnings = [];
  const publicRefs = new Set();
  const add = (url, bytes) => { if (url && !files.has(url)) files.set(url, bytes || 0); };
  const assetBytes = (fileName) => {
    const item = bundle[fileName];
    if (!item) return 0;
    const src = item.type === 'asset' ? item.source : item.code;
    return typeof src === 'string' ? Buffer.byteLength(src) : (src?.byteLength || 0);
  };
  const scanText = (text) => { for (const m of text.matchAll(PUBLIC_REF_RE)) publicRefs.add(m[1]); };
  const cssSeen = new Set();
  const scanCss = (cssFile) => {
    if (cssSeen.has(cssFile)) return;
    cssSeen.add(cssFile);
    const item = bundle[cssFile];
    if (!item || item.type !== 'asset') return;
    add('/' + cssFile, assetBytes(cssFile));
    const css = String(item.source);
    scanText(css);
    for (const m of css.matchAll(/url\(\s*["']?(\/assets\/[^"')\s]+)/g)) add(m[1], assetBytes(m[1].slice(1)));
  };

  // Roots = the live scenes (from the scene registry, minus dead zones) + the app's own screens (everything the entry
  // chunk loads on demand that is not a scene). Then follow what they import. A chunk only counts if a live root
  // reaches it: the bundler also emits tiny shared chunks for images that old or dead scenes use.
  const norm = (p) => String(p || '').split('\\').join('/').toLowerCase();
  const chunks = Object.values(bundle).filter((i) => i.type === 'chunk');
  const entries = chunks.filter((c) => c.isEntry);
  const rootNames = new Set();
  const sceneHits = new Set();
  for (const c of chunks) {
    const facade = norm(c.facadeModuleId);
    if (!facade) continue;
    for (const f of liveSceneFiles) {
      if (facade.endsWith(norm(f))) { rootNames.add(c.fileName); sceneHits.add(f); }
    }
  }
  for (const f of liveSceneFiles) if (!sceneHits.has(f)) warnings.push(`no chunk found for live scene ${f}`);
  for (const entry of entries) {
    for (const name of entry.dynamicImports || []) {
      const c = bundle[name];
      const facade = norm(c?.facadeModuleId);
      if (c && facade && !facade.includes('/src/zones/') && !DEAD_MODULE_RE.test(facade)) rootNames.add(name);
    }
  }

  // Follow static imports everywhere. Follow dynamic imports only from non-entry chunks, and never into a chunk that
  // is just an image/sound URL: App.jsx globs every image under src/zones (to warm scene backgrounds), which makes the
  // entry chunk "dynamically import" every picture in the repo, dead zones included.
  const isMediaWrapper = (c) => /\.(webp|png|jpe?g|gif|svg|mp3|wav|webm|mp4)(\?.*)?$/i.test(norm(c?.facadeModuleId));
  const reached = new Set();
  const queue = [...rootNames];
  while (queue.length) {
    const name = queue.pop();
    if (reached.has(name)) continue;
    const c = bundle[name];
    if (!c || c.type !== 'chunk') continue;
    reached.add(name);
    for (const next of c.imports || []) if (!reached.has(next)) queue.push(next);
    if (c.isEntry) continue;
    for (const next of c.dynamicImports || []) if (!reached.has(next) && !isMediaWrapper(bundle[next])) queue.push(next);
  }

  let liveChunks = 0;
  for (const name of reached) {
    const item = bundle[name];
    if (item.isEntry || SKIP_CHUNK_RE.test(item.fileName)) continue;
    liveChunks++;
    add('/' + item.fileName, assetBytes(item.fileName));
    scanText(item.code);
    for (const a of item.viteMetadata?.importedAssets || []) add('/' + a, assetBytes(a));
    for (const c of item.viteMetadata?.importedCss || []) scanCss(c);
  }
  // The entry chunk is the always-loaded core: its shared styles and the public files it names (avatars, map art) count.
  for (const entry of entries) {
    scanText(entry.code);
    for (const a of entry.viteMetadata?.importedAssets || []) add('/' + a, assetBytes(a));
    for (const c of entry.viteMetadata?.importedCss || []) scanCss(c);
  }
  const deadChunks = chunks.length - reached.size - entries.length;

  for (const ref of publicRefs) {
    for (const abs of resolvePublicRef(ref, publicDir, warnings)) add(toUrl(publicDir, abs), fs.statSync(abs).size);
  }

  const list = [...files.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([u, s]) => ({ u, s }));
  const totalBytes = list.reduce((n, f) => n + f.s, 0);
  const version = crypto.createHash('sha1').update(list.map((f) => `${f.u}:${f.s}`).join('\n')).digest('hex').slice(0, 12);
  return { manifest: { version, count: list.length, totalBytes, files: list }, warnings: [...new Set(warnings)], liveChunks, deadChunks };
}

// Live scene files = the scene registry's `file:` entries, minus obsolete/parked zones and backups.
export function readLiveSceneFiles(registryPath = 'src/config/sceneRegistry.js') {
  const text = fs.readFileSync(registryPath, 'utf8');
  return [...text.matchAll(/file:\s*'([^']+)'/g)].map((m) => m[1]).filter((f) => !DEAD_MODULE_RE.test(f));
}

// Chunks and assets the bundler drops after generateBundle (empty chunks) must not stay in the list: a 404 would
// leave the download "unfinished" for ever. Returns the manifest with only files that exist in the output folder.
export function filterManifestToOutput(manifest, outDir) {
  const files = manifest.files.filter((f) => {
    const rel = decodeURIComponent(f.u).replace(/^\//, '');
    return fs.existsSync(path.join(outDir, rel));
  });
  const dropped = manifest.files.length - files.length;
  const totalBytes = files.reduce((n, f) => n + f.s, 0);
  const version = crypto.createHash('sha1').update(files.map((f) => `${f.u}:${f.s}`).join('\n')).digest('hex').slice(0, 12);
  return { manifest: { version, count: files.length, totalBytes, files }, dropped };
}

export default function liveAssetsPlugin() {
  let publicDir = 'public';
  let outDir = 'dist';
  return {
    name: 'gmb-live-assets',
    apply: 'build',
    configResolved(config) {
      publicDir = config.publicDir || 'public';
      outDir = path.resolve(config.root || '.', config.build?.outDir || 'dist');
    },
    closeBundle() {
      const file = path.join(outDir, 'live-assets.json');
      if (!fs.existsSync(file)) return;
      const { manifest, dropped } = filterManifestToOutput(JSON.parse(fs.readFileSync(file, 'utf8')), outDir);
      fs.writeFileSync(file, JSON.stringify(manifest));
      console.log(`[gmb-live-assets] final list: ${manifest.count} files, ${(manifest.totalBytes / 1048576).toFixed(1)} MB (${dropped} not in the build output, dropped)`);
    },
    generateBundle(_options, bundle) {
      const liveSceneFiles = readLiveSceneFiles();
      const { manifest, warnings, liveChunks, deadChunks } = collectLiveAssets(bundle, publicDir, liveSceneFiles);
      this.emitFile({ type: 'asset', fileName: 'live-assets.json', source: JSON.stringify(manifest) });
      const mb = (manifest.totalBytes / 1048576).toFixed(1);
      this.info?.(`live-assets.json: ${manifest.count} files, ${mb} MB (${liveChunks} live chunks, ${deadChunks} not reached by a live scene or screen)`);
      warnings.forEach((w) => this.warn(`live-assets: ${w}`));
    },
  };
}
