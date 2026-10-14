// scripts/css-clash-triage.cjs
//
// Finds @keyframes names that are defined DIFFERENTLY in two or more CSS files that live code actually loads,
// and that an `animation` / `animation-name` rule really uses. Those are the real "one scene breaks another"
// risks (Vite bundles all CSS into one global stylesheet; the last definition wins everywhere).
// Stricter than scripts/check-css-clashes.cjs, which lists every duplicate name (dead and unused ones too).
//
//   node scripts/css-clash-triage.cjs            print the table
//   node scripts/css-clash-triage.cjs out.json   also write the rows as JSON
//
// What counts as loaded: a CSS file imported by a .js/.jsx/.mjs file under src/ that is not a backup / old copy
// (names containing backup, copy, original, old, .bak, pre-, "with inline css"), and not under "meaning cave"
// (obsolete) or "festival-square" (parked).

const fs = require('fs');
const path = require('path');

const root = path.resolve('src');
const OUT = process.argv[2] || null;
const SKIP = /node_modules|dist|meaning cave|festival-square|backup|copy|original|\bold\b|\.bak|oldflow|with inline css|pre-/i;

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

// 3. animation names actually used by an animation / animation-name declaration, per file
const usedNames = {};
for (const f of imported) {
  const set = new Set();
  const re = /animation(?:-name)?\s*:\s*([^;}]+)/g;
  let m;
  while ((m = re.exec(cssText[f]))) for (const tok of m[1].split(/[\s,]+/)) set.add(tok.replace('!important', ''));
  usedNames[f] = set;
}

const rel = (f) => path.relative(root, f).split(path.sep).join('/');
const rows = [];
for (const [name, bodies] of Object.entries(defs)) {
  const files = new Set([...bodies.values()].flatMap((s) => [...s]));
  if (bodies.size < 2 || files.size < 2) continue;
  const users = [...imported].filter((f) => usedNames[f].has(name));
  rows.push({ name, versions: bodies.size, defined: [...files].map(rel), users: users.map(rel) });
}
const used = rows.filter((r) => r.users.length);
console.log(`CSS files imported by live code: ${imported.size} | differing-name clashes: ${rows.length} | and used by an animation rule: ${used.length}`);
console.log('\nREAL RISK (different definitions in 2+ loaded files, and the animation is used):');
for (const r of used.sort((a, b) => b.defined.length - a.defined.length)) {
  console.log(`  ${r.name.padEnd(24)} ${String(r.versions).padStart(2)} versions, ${String(r.defined.length).padStart(2)} files  | defined in: ${r.defined.slice(0, 3).join(', ')}${r.defined.length > 3 ? ' +' + (r.defined.length - 3) : ''}`);
}
console.log(`\nDefined differently but never used by any loaded file (dead keyframes): ${rows.length - used.length}`);
if (OUT) fs.writeFileSync(OUT, JSON.stringify(used, null, 1));
