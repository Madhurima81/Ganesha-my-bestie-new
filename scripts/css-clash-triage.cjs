// scripts/css-clash-triage.cjs
//
// Finds @keyframes names that are defined DIFFERENTLY in two or more CSS files that live code actually loads,
// and that an `animation` / `animation-name` rule really uses. Those are the real "one scene breaks another"
// risks (Vite bundles all CSS into one global stylesheet; the last definition wins everywhere).
// Stricter than scripts/check-css-clashes.cjs, which lists every duplicate name (dead and unused ones too).
//
//   node scripts/css-clash-triage.cjs            print the table
//   node scripts/css-clash-triage.cjs out.json   also write the rows as JSON
//   --dist=<folder>  built folder holding assets/*.css (default dist); --before-dist=<folder>  build from before your change
// "Used" is cross-checked against the built dist/assets CSS (run `npm run build` first): a name no built CSS file uses is
// not a real user, so dead-but-imported CSS files are ignored. With no dist/ it falls back to the source-only reading.
//
// KNOWN GAP (found 2026-10-14): "used" above is read from CSS only. An animation name used from JS/JSX
// (`style={{ animation: 'glow 2s' }}`, a template string, a variable) is invisible to the CSS scan, so a name with no
// CSS user can still be depended on. The JS scan near the bottom lists those files (a line containing the word
// "animation" and the name). It is a heuristic (it can miss names built from variables): before renaming or deleting a
// definition, also search src/ for the name by hand.
//
// What counts as loaded: a CSS file imported by a .js/.jsx/.mjs file under src/ that is not a backup / old copy
// (names containing backup, copy, original, old, .bak, pre-, "with inline css", a dated name like "7th oct", wrking, (1)), and not under "meaning cave"
// (obsolete) or "festival-square" (parked).

const fs = require('fs');
const path = require('path');

const root = path.resolve('src');
// Usage: node scripts/css-clash-triage.cjs [out.json] [--before-dist=<dir>]
//   --before-dist=<dir>  a dist/ folder built BEFORE your renames (or `git stash`, build, copy dist). Adds the check
//                        that matters after a rename: names defined there that are gone now but still used.
const argv = process.argv.slice(2);
const OUT = argv.find((a) => !a.startsWith('--')) || null;
const beforeDistArg = (argv.find((a) => a.startsWith('--before-dist=')) || '').slice('--before-dist='.length) || null;
// --dist=<folder>  the folder that holds assets/*.css for the build to check (default: dist). Another session may build elsewhere.
const distArg = (argv.find((a) => a.startsWith('--dist=')) || '').slice('--dist='.length) || 'dist';
const distAssets = fs.existsSync(path.resolve(distArg, 'assets')) ? path.resolve(distArg, 'assets') : path.resolve(distArg);
const SKIP = /node_modules|dist|meaning cave|festival-square|backup|copy|original|\bold\b|\.bak|oldflow|with inline css|pre-|\b\d{1,2}(st|nd|rd|th)\b|wrking|\(\d+\)|with new|partial|V1\b/i;

// First line: which build is being checked, and how fresh it is.
{
  let newest = null;
  if (fs.existsSync(distAssets)) for (const e of fs.readdirSync(distAssets)) if (/\.css$/.test(e)) { const t = fs.statSync(path.join(distAssets, e)).mtime; if (!newest || t > newest) newest = t; }
  console.log(`dist used: ${distAssets} | newest CSS: ${newest ? newest.toLocaleString() : 'NONE FOUND (source-only fallback)'}`);
}

const all = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!/node_modules|dist/i.test(e.name)) walk(p); } else all.push(p);
  }
})(root);

// 1. CSS files imported by live JS/JSX
const imported = new Set();
for (const f of all.filter((x) => /\.(jsx?|mjs)$/.test(x) && !SKIP.test(x.replace(root, '')))) {
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(/import\s+(?:[^'"]*from\s+)?['"]([^'"]+\.css)['"]/g)) {
    const p = path.resolve(path.dirname(f), m[1]);
    if (fs.existsSync(p)) imported.add(p);
  }
}
const cssText = {};
for (const f of imported) cssText[f] = fs.readFileSync(f, 'utf8');

// 2. keyframes per file, keyed by body (identical copies are not a clash)
const defs = {};
for (const f of imported) {
  const css = cssText[f];
  const re = /@keyframes\s+([A-Za-z0-9_-]+)\s*\{/g;
  let m;
  while ((m = re.exec(css))) {
    let depth = 1;
    let i = re.lastIndex;
    while (i < css.length && depth > 0) { if (css[i] === '{') depth++; else if (css[i] === '}') depth--; i++; }
    const body = css.slice(re.lastIndex, i - 1).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim();
    if (!defs[m[1]]) defs[m[1]] = new Map();
    if (!defs[m[1]].has(body)) defs[m[1]].set(body, new Set());
    defs[m[1]].get(body).add(f);
  }
}

// Keyframe names defined in a built dist/ (all its CSS files).
const keyframeNamesInDist = (dir) => {
  const names = new Set();
  if (!dir || !fs.existsSync(dir)) return names;
  (function walkDist(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walkDist(p);
      else if (/\.css$/.test(e.name)) {
        const css = fs.readFileSync(p, 'utf8');
        for (const m of css.matchAll(/@keyframes\s+([A-Za-z0-9_-]+)\s*\{/g)) names.add(m[1]);
      }
    }
  })(dir);
  return names;
};
const builtCssDefinitions = keyframeNamesInDist(distAssets);
// Animation names that some CSS file in the built dist/ really uses (animation / animation-name). A name no built CSS uses is
// not a real user, so dead-but-imported CSS files (imported by an unused component) stop counting. Empty set = no dist: skip.
const animationNamesUsedInDist = (dir) => {
  const names = new Set();
  if (!dir || !fs.existsSync(dir)) return names;
  for (const e of fs.readdirSync(dir)) {
    if (!/\.css$/.test(e)) continue;
    const css = fs.readFileSync(path.join(dir, e), 'utf8');
    for (const m of css.matchAll(/animation(?:-name)?\s*:\s*([^;}]+)/g)) for (const tok of m[1].split(/[\s,]+/)) names.add(tok.replace('!important', ''));
  }
  return names;
};
const builtCssUsed = animationNamesUsedInDist(distAssets);
const isUsedInBuild = (name) => !builtCssUsed.size || builtCssUsed.has(name);
// 3. animation names actually used by an animation / animation-name declaration, per file
const usedNames = {};
for (const f of imported) {
  const set = new Set();
  const re = /animation(?:-name)?\s*:\s*([^;}]+)/g;
  let m;
  while ((m = re.exec(cssText[f]))) for (const tok of m[1].split(/[\s,]+/)) { const t = tok.replace('!important', ''); if (isUsedInBuild(t)) set.add(t); }
  usedNames[f] = set;
}

// JS/JSX usage: a line that mentions "animation" and the clashing name as a word (inline styles, template strings).
const jsFiles = all.filter((x) => /\.(jsx?|mjs)$/.test(x) && !SKIP.test(x.replace(root, '')));
const jsText = {};
for (const f of jsFiles) jsText[f] = fs.readFileSync(f, 'utf8');
const escapeRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const jsUsers = (name) => {
  const re = new RegExp('(^|[^A-Za-z0-9_-])' + escapeRe(name) + '([^A-Za-z0-9_-]|$)');
  return jsFiles.filter((f) => jsText[f].split(/\r?\n/).some((line) => /animation/i.test(line) && re.test(line)));
};
const ignoredAnimationTokens = new Set([
  'animation', 'animationName', 'animationDelay', 'animationDuration', 'animationTimingFunction', 'animationIterationCount',
  'none', 'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'infinite', 'forwards', 'backwards', 'both', 'normal',
  'reverse', 'alternate', 'alternate-reverse', 'running', 'paused', 'initial', 'inherit', 'unset', 'var', 'calc',
]);
const isTimingToken = (tok) => /^-?\d*\.?\d+(ms|s|%|px|rem|em|vh|vw)$/.test(tok) || /^cubic-bezier$|^steps$/.test(tok);
const rel = (f) => path.relative(root, f).split(path.sep).join('/');
const jsAnimationCandidates = new Map();
for (const f of jsFiles) {
  const lines = jsText[f].split(/\r?\n/);
  lines.forEach((line, idx) => {
    if (!/animation/i.test(line)) return;
    const literals = [...line.matchAll(/['"`]([^'"`]*[A-Za-z][^'"`]*)['"`]/g)].map((m) => m[1]);
    for (const literal of literals) {
      for (const part of literal.split(',')) {
        if (!/\b\d*\.?\d+(ms|s)\b/.test(part)) continue;
        const tok = part.trim().split(/\s+/)[0];
        if (!/^[A-Za-z_][A-Za-z0-9_-]*$/.test(tok) || ignoredAnimationTokens.has(tok) || isTimingToken(tok)) continue;
        if (!jsAnimationCandidates.has(tok)) jsAnimationCandidates.set(tok, new Set());
        jsAnimationCandidates.get(tok).add(`${rel(f)}:${idx + 1}`);
      }
    }
  });
}

const rows = [];
for (const [name, bodies] of Object.entries(defs)) {
  const files = new Set([...bodies.values()].flatMap((s) => [...s]));
  if (bodies.size < 2 || files.size < 2) continue;
  const users = [...imported].filter((f) => usedNames[f].has(name));
  rows.push({ name, versions: bodies.size, defined: [...files].map(rel), users: users.map(rel), jsUsers: jsUsers(name).map(rel) });
}
const used = rows.filter((r) => r.users.length);
console.log(`CSS files imported by live code: ${imported.size} | differing-name clashes: ${rows.length} | and used by an animation rule: ${used.length}`);
console.log('\nREAL RISK (different definitions in 2+ loaded files, and the animation is used):');
for (const r of used.sort((a, b) => b.defined.length - a.defined.length)) {
  console.log(`  ${r.name.padEnd(24)} ${String(r.versions).padStart(2)} versions, ${String(r.defined.length).padStart(2)} files  | defined in: ${r.defined.slice(0, 3).join(', ')}${r.defined.length > 3 ? ' +' + (r.defined.length - 3) : ''}`);
}
const withJs = rows.filter((r) => r.jsUsers.length);
console.log(`\nAlso used from JS/JSX (not seen by the CSS scan; check these before renaming): ${withJs.length} names`);
for (const r of withJs) console.log(`  ${r.name.padEnd(24)} ${r.jsUsers.slice(0, 3).join(', ')}${r.jsUsers.length > 3 ? ' +' + (r.jsUsers.length - 3) : ''}`);
// Keyframes that JS/JSX defines itself (an inline <style> block / template string): those are not orphans.
const jsDefinitions = new Set();
for (const f of jsFiles) for (const m of jsText[f].matchAll(/@keyframes\s+([A-Za-z0-9_-]+)/g)) jsDefinitions.add(m[1]);
const isDefinedNow = (name) => (builtCssDefinitions.size ? builtCssDefinitions.has(name) : Boolean(defs[name])) || jsDefinitions.has(name);

const orphaned = [...jsAnimationCandidates.entries()]
  .filter(([name]) => !isDefinedNow(name))
  .sort((a, b) => a[0].localeCompare(b[0]));
console.log(`\nORPHANED (JS uses it, no CSS file or inline JS style defines it): ${orphaned.length} names`);
console.log('  (pre-existing breakage is possible: compare with --before-dist to see what YOUR change orphaned)');
for (const [name, locations] of orphaned) {
  const list = [...locations];
  console.log(`  ${name.padEnd(24)} ${list.slice(0, 3).join(', ')}${list.length > 3 ? ' +' + (list.length - 3) : ''}`);
}

// The check that matters after a rename: defined in the BEFORE build, gone now, still used (from JS or a live CSS rule).
const cssUsedNames = new Set();
for (const f of imported) for (const t of usedNames[f]) if (/^[A-Za-z_][A-Za-z0-9_-]*$/.test(t) && !ignoredAnimationTokens.has(t) && !isTimingToken(t)) cssUsedNames.add(t);
let orphanedByChange = null;
if (beforeDistArg) {
  const before = keyframeNamesInDist(path.resolve(beforeDistArg, fs.existsSync(path.resolve(beforeDistArg, 'assets')) ? 'assets' : '.'));
  if (!before.size) {
    console.log(`\nORPHANED BY THIS CHANGE: could not read any CSS keyframes from ${beforeDistArg} (pass the folder that holds assets/*.css)`);
  } else {
    orphanedByChange = [...before]
      .filter((name) => !isDefinedNow(name) && (jsAnimationCandidates.has(name) || cssUsedNames.has(name)))
      .sort();
    console.log(`\nORPHANED BY THIS CHANGE (defined in ${beforeDistArg}, gone now, still used from JS or CSS): ${orphanedByChange.length} names`);
    for (const name of orphanedByChange) {
      const where = [...(jsAnimationCandidates.get(name) || [])].slice(0, 2);
      console.log(`  ${name.padEnd(24)} ${where.join(', ') || '(used by a CSS animation rule)'}`);
    }
  }
} else {
  console.log('\nORPHANED BY THIS CHANGE: not checked (run with --before-dist=<dist folder built before your renames>)');
}
console.log(`\nDefined differently but never used by any loaded file (dead keyframes): ${rows.length - used.length}`);
if (OUT) fs.writeFileSync(OUT, JSON.stringify({ rows, orphaned: orphaned.map(([name, locations]) => ({ name, locations: [...locations] })), orphanedByChange }, null, 1));
