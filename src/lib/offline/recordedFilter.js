// recordedFilter.js — trims the offline download's PICTURE list to what the asset recorder actually saw being fetched
// while every scene, the map and the zone welcomes were played (recordedAssets.json). Reading imports cannot tell a
// picture a scene shows from one it only imports; the recording can. Code, styles and audio are not touched here.
import crypto from 'node:crypto';

const IMAGE_RE = /\.(png|jpe?g|webp|svg|gif)$/i;
const decode = (s) => { try { return decodeURIComponent(s); } catch { return s; } };

// Stable name for a served URL: /assets/<name>-<8-char build hash>.<ext> -> <name>.<ext>; any other path stays as is.
export const keyOfUrl = (url) => {
  const p = decode(url);
  if (p.startsWith('/assets/')) return p.slice(8).replace(/-[A-Za-z0-9_-]{8}(\.[A-Za-z0-9]+)$/, '$1');
  return p;
};

const manifestFrom = (files) => {
  const sorted = [...files].sort((a, b) => a.u.localeCompare(b.u));
  const totalBytes = sorted.reduce((n, f) => n + f.s, 0);
  const version = crypto.createHash('sha1').update(sorted.map((f) => `${f.u}:${f.s}`).join('\n')).digest('hex').slice(0, 12);
  return { version, count: sorted.length, totalBytes, files: sorted };
};

// manifest: { files: [{u, s}] }. keys: array of recorded picture keys.
// assetFiles: [{u, s}] every built /assets file (to add a recorded picture the import graph missed).
// publicSize(path): size of a file in public/, or 0 when there is none.
export function applyRecorded(manifest, keys, { assetFiles = [], publicSize = () => 0 } = {}) {
  const wanted = new Set(keys);
  const kept = [];
  let dropped = 0;
  let droppedBytes = 0;
  for (const f of manifest.files) {
    if (IMAGE_RE.test(f.u) && !wanted.has(keyOfUrl(f.u))) { dropped++; droppedBytes += f.s; continue; }
    kept.push(f);
  }
  const have = new Set(kept.map((f) => keyOfUrl(f.u)));
  const byKey = new Map();
  for (const f of assetFiles) if (IMAGE_RE.test(f.u)) byKey.set(keyOfUrl(f.u), f);
  const added = [];
  const notFound = [];
  for (const key of wanted) {
    if (have.has(key)) continue;
    if (key.startsWith('/')) {
      const size = publicSize(key);
      if (size) { added.push({ u: encodeURI(key), s: size }); continue; }
    } else if (byKey.has(key)) { added.push(byKey.get(key)); continue; }
    notFound.push(key);
  }
  return { manifest: manifestFrom([...kept, ...added]), dropped, droppedBytes, added: added.length, notFound };
}
