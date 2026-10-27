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
// A bare media file name inside live code, e.g. sfx-chime.wav or app-Vakratunda.png (no spaces; %20 is decoded later).
const NAME_TOKEN_RE = new RegExp(`[A-Za-z0-9_%@.-]+\\.(?:${MEDIA_EXT})(?![A-Za-z0-9])`, 'g');
const SKIP_CHUNK_RE = /(^|\/)(vendor-|lazy-|assetRecorder)/; // shell is precached already; analytics SDKs are pointless offline

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
  let clean = ref.split('?')[0].split('#')[0];
  // Code writes spaces as %20 ("/audio/ambient/map%20ambient%20sound.mp3"); the file on disk has real spaces.
  try { clean = decodeURIComponent(clean); } catch { /* not valid percent-encoding: use as written */ }
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

// Encoded, so the key matches the URL the browser actually requests ("map%20ambient%20sound.mp3").
const toUrl = (publicDir, abs) => encodeURI('/' + path.relative(publicDir, abs).split(path.sep).join('/'));

// Zones that are not in the live product (Cave of Secrets is obsolete, Festival Square is parked): their big
// backgrounds are named in zone data and opening screens but a child cannot reach them, so do not download them.
export const NOT_LIVE_PUBLIC_RE = /^\/images\/(festivalsquare-bg|cave-of-secrets-background|cave-bg)\.[a-z0-9]+$/i;

// A heavy original is dropped only when the app never names it directly (it was swept in by a folder or prefix
// reference such as "/images/new-explorer-" or "/audio/ambient/") AND its lighter twin is in the list too.
// png/jpg -> webp (the avatars use the png only if the webp fails to load); wav -> mp3.
export function dropHeavyTwins(urls, exactUrls) {
  const set = new Set(urls);
  const dropped = [];
  for (const u of urls) {
    if (exactUrls.has(u)) continue;
    const twin = /\.(png|jpe?g)$/i.test(u) ? u.replace(/\.(png|jpe?g)$/i, '.webp') : /\.wav$/i.test(u) ? u.replace(/\.wav$/i, '.mp3') : null;
    if (twin && set.has(twin)) dropped.push(u);
  }
  return dropped;
}

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
  // Bare file names written in live code ("sfx-chime.wav", voice config "file: 'opening.wav'") have no folder in
  // them, so the path pattern cannot see them; collect them too.
  const nameTokens = new Set();
  const scanText = (text) => {
    for (const m of text.matchAll(PUBLIC_REF_RE)) publicRefs.add(m[1]);
    for (const m of text.matchAll(NAME_TOKEN_RE)) {
      nameTokens.add(m[0]);
      try { nameTokens.add(decodeURIComponent(m[0])); } catch { /* keep the raw form only */ }
    }
  };
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

  const exactUrls = new Set(); // public files the app names directly (a full file name in the code)
  for (const ref of publicRefs) {
    const isExact = MEDIA_FILE_RE.test(ref.split('?')[0].split('#')[0]);
    for (const abs of resolvePublicRef(ref, publicDir, warnings)) {
      const url = toUrl(publicDir, abs);
      add(url, fs.statSync(abs).size);
      if (isExact) exactUrls.add(url);
    }
  }

  // Public media files the live code names by bare file name. A name that exists once in public/ is certain; a
  // common name (e.g. "opening.wav" in every scene folder) only counts in folders the list already uses.
  const allPublic = walk(publicDir);
  const baseCount = new Map();
  for (const abs of allPublic) baseCount.set(path.basename(abs), (baseCount.get(path.basename(abs)) || 0) + 1);
  const usedDirs = new Set([...files.keys()].map((u) => decodeURIComponent(u).replace(/\/[^/]*$/, '')));
  for (const abs of allPublic) {
    const base = path.basename(abs);
    if (base.length < 6 || !nameTokens.has(base)) continue;
    const url = toUrl(publicDir, abs);
    const dir = decodeURIComponent(url).replace(/\/[^/]*$/, '');
    if (baseCount.get(base) === 1 || usedDirs.has(dir)) {
      add(url, fs.statSync(abs).size);
      exactUrls.add(url); // named by the app: never trimmed as a heavy twin
    }
  }

  // Trim what a child cannot reach or never needs (see NOT_LIVE_PUBLIC_RE / dropHeavyTwins).
  let notLive = 0, heavyTwins = 0, trimmedBytes = 0;
  for (const url of [...files.keys()]) {
    if (NOT_LIVE_PUBLIC_RE.test(url)) { trimmedBytes += files.get(url); files.delete(url); notLive++; }
  }
  for (const url of dropHeavyTwins([...files.keys()], exactUrls)) {
    trimmedBytes += files.get(url); files.delete(url); heavyTwins++;
  }

  const list = [...files.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([u, s]) => ({ u, s }));
  const totalBytes = list.reduce((n, f) => n + f.s, 0);
  const version = crypto.createHash('sha1').update(list.map((f) => `${f.u}:${f.s}`).join('\n')).digest('hex').slice(0, 12);
  return {
    manifest: { version, count: list.length, totalBytes, files: list },
    warnings: [...new Set(warnings)],
    liveChunks,
    deadChunks,
    trimmed: { notLive, heavyTwins, bytes: trimmedBytes },
  };
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
      const { manifest, warnings, liveChunks, deadChunks, trimmed } = collectLiveAssets(bundle, publicDir, liveSceneFiles);
      this.emitFile({ type: 'asset', fileName: 'live-assets.json', source: JSON.stringify(manifest) });
      const mb = (manifest.totalBytes / 1048576).toFixed(1);
      this.info?.(`live-assets.json: ${manifest.count} files, ${mb} MB (${liveChunks} live chunks, ${deadChunks} not reached by a live scene or screen; trimmed ${trimmed.notLive} not-live-zone and ${trimmed.heavyTwins} heavy-twin files, ${(trimmed.bytes / 1048576).toFixed(1)} MB)`);
      warnings.forEach((w) => this.warn(`live-assets: ${w}`));
    },
  };
}
