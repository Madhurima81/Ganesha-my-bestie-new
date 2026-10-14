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
// Usage: node scripts/css-clash-triage.cjs [out.json] [--before-dist=<dir>] [--dist=<dir>] [--all-imported]
//   --follow-all-imports  old graph: follow every import, used or not (default follows an import only if its binding is referenced).
//   --all-imported       count every imported CSS file (old basis) instead of only those reachable from src/main.jsx.
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

// 1. CSS files that count. DEFAULT = REACHABLE: start at src/main.jsx, follow static imports, re-exports and lazy `import()`
//    through the JS graph, and collect the CSS each reachable JS file imports (and CSS @import). Parked/obsolete zones
//    (festival-square, meaning cave) are reachable-but-not-counted. --all-imported = the old basis: every CSS imported by any
//    non-backup JS/JSX file, reachable or not (this over-counts: dead components still import CSS).
const ALL_IMPORTED = argv.includes('--all-imported');
const PARKED = /festival-square|meaning cave/i;
const EXTS = ['', '.jsx', '.js', '.mjs', '/index.jsx', '/index.js'];
const resolveSpec = (from, spec) => {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(path.dirname(from), spec);
  for (const e of EXTS) { const q = base + e; if (fs.existsSync(q) && fs.statSync(q).isFile()) return q; }
  return null;
};
// Reachability walk. Two modes:
//   USED (default): follow an import only if its binding is really referenced in that file outside the import statement
//     (JSX tag, call, passed as a value, re-exported). Side-effect imports (import './x.css') and `export ... from` stay live.
//     `{false && (...)}` and `if (false) {...}` blocks and comments do not count as references.
//   --follow-all-imports: the previous behaviour (every import is followed, used or not).
const FOLLOW_ALL = argv.includes('--follow-all-imports');
// --without=<file>:<binding>[,<file>:<binding>...]  what-if: pretend those imports are already removed (file relative to src/).
const WITHOUT = new Set(((argv.find((a) => a.startsWith('--without=')) || '').slice('--without='.length)).split(',').filter(Boolean));
const stripBlocks = (src, openRe) => {
  // remove `{false && ...}` style blocks by balancing braces from the opening brace
  let out = '';
  let pos = 0;
  const re = new RegExp(openRe.source, 'g');
  let m;
  while ((m = re.exec(src))) {
    const open = src.indexOf('{', m.index + (m[0].startsWith('{') ? 0 : m[0].indexOf('{')));
    if (open < 0) break;
    let depth = 1;
    let i = open + 1;
    while (i < src.length && depth > 0) { if (src[i] === '{') depth++; else if (src[i] === '}') depth--; i++; }
    out += src.slice(pos, m.index) + ' ';
    pos = i;
    re.lastIndex = i;
  }
  return out + src.slice(pos);
};
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^[ \t]*\/\/.*$/gm, ' ');
const stripDead = (src) => {
  let s = stripBlocks(src, /\{\s*false\s*&&/);
  s = stripBlocks(s, /\bif\s*\(\s*false\s*\)\s*\{/);
  return s;
};
// import bindings of one statement: returns {spec, names[], sideEffect}
const parseImports = (src) => {
  const list = [];
  for (const m of src.matchAll(/^[ \t]*import\s+([^'"();]*?)\s*from\s*['"]([^'"]+)['"][ \t]*;?/gm)) {
    const clause = m[1].trim();
    const names = [];
    const named = clause.match(/\{([^}]*)\}/);
    if (named) for (const part of named[1].split(',')) { const p = part.trim(); if (!p) continue; const as = p.split(/\s+as\s+/); names.push((as[1] || as[0]).trim()); }
    const rest = clause.replace(/\{[^}]*\}/, '').replace(/\*\s+as\s+(\w+)/, (x, n) => { names.push(n); return ''; });
    for (const d of rest.split(',')) { const n = d.trim(); if (/^[A-Za-z_$][\w$]*$/.test(n)) names.push(n); }
    list.push({ spec: m[2], names, index: m.index, text: m[0] });
  }
  for (const m of src.matchAll(/^[ \t]*import[ \t]*['"]([^'"]+)['"][ \t]*;?/gm)) list.push({ spec: m[1], names: [], sideEffect: true, index: m.index, text: m[0] });
  return list;
};
const walkGraph = (usedOnly) => {
  const reachJs = new Set();
  const reachCss = new Set();
  const parkedReached = new Set();
  const unresolvedDynamic = [];
  const unusedImports = []; // {file, binding, spec, why}
  const queue = [path.join(root, 'main.jsx')];
  const cssQueue = [];
  while (queue.length) {
    const f = queue.pop();
    if (reachJs.has(f) || !fs.existsSync(f)) continue;
    reachJs.add(f);
    if (!ALL_IMPORTED && PARKED.test(f)) { parkedReached.add(f); continue; }
    const src = fs.readFileSync(f, 'utf8');
    const noComments = stripComments(src);
    let body = noComments;
    for (const imp of parseImports(noComments)) body = body.split(imp.text).join(' ');
    const live = stripDead(body);
    const follow = (sp) => {
      const clean = sp.split('?')[0];
      if (/\.css$/.test(clean)) { const q = path.resolve(path.dirname(f), clean); if (fs.existsSync(q)) cssQueue.push(q); return; }
      if (/\.(webp|png|jpe?g|svg|mp3|wav|json|gif|mp4|woff2?)$/.test(clean)) return;
      const r = resolveSpec(f, clean);
      if (r && /\.(jsx?|mjs)$/.test(r)) queue.push(r);
    };
    for (const imp of parseImports(noComments)) {
      if (!imp.sideEffect && imp.names.length && imp.names.every((n) => WITHOUT.has(relP(f) + ':' + n))) continue; // --without what-if
      if (imp.sideEffect || !usedOnly) { follow(imp.spec); continue; }
      const usedNames = imp.names.filter((n) => !WITHOUT.has(relP(f) + ':' + n)).filter((n) => new RegExp('(^|[^\\w$.]|\\.\\.\\.)' + n.replace(/\$/g, '\\$') + '($|[^\\w$])').test(live));
      if (!usedNames.length && imp.names.length) {
        for (const n of imp.names) {
          const anywhere = new RegExp('(^|[^\\w$.]|\\.\\.\\.)' + n.replace(/\$/g, '\\$') + '($|[^\\w$])').test(body);
          unusedImports.push({ file: relP(f), binding: n, spec: imp.spec, why: anywhere ? 'only inside a dead block ({false && ...} / if (false))' : 'never referenced outside the import' });
        }
        continue;
      }
      follow(imp.spec);
    }
    for (const m of noComments.matchAll(/export\s+(?:\*|\{[^}]*\})(?:\s+as\s+\w+)?\s*from\s*['"]([^'"]+)['"]/g)) follow(m[1]);
    for (const m of noComments.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
      if (usedOnly) {
        const before = noComments.slice(Math.max(0, m.index - 220), m.index);
        const decl = before.match(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=[^;]*$/);
        if (decl && !new RegExp('(^|[^\\w$.]|\\.\\.\\.)' + decl[1] + '($|[^\\w$])').test(live.replace(new RegExp('(?:const|let|var)\\s+' + decl[1] + '\\s*='), ' '))) {
          unusedImports.push({ file: relP(f), binding: decl[1], spec: m[1], why: 'lazy import, binding never referenced (or only in a dead block)' });
          continue;
        }
      }
      follow(m[1]);
    }
    for (const m of noComments.matchAll(/import\(\s*`([^`]+)`\s*\)/g)) unresolvedDynamic.push(`${relP(f)} -> ${m[1]}`);
  }
  while (cssQueue.length) {
    const q = cssQueue.pop();
    if (reachCss.has(q)) continue;
    reachCss.add(q);
    for (const m of fs.readFileSync(q, 'utf8').matchAll(/@import\s+(?:url\()?['"]?([^'")\s;]+\.css)['"]?/g)) {
      const r = path.resolve(path.dirname(q), m[1]);
      if (fs.existsSync(r)) cssQueue.push(r);
    }
  }
  return { reachJs, reachCss, parkedReached, unresolvedDynamic, unusedImports };
};
const relP = (f) => path.relative(root, f).split(path.sep).join('/');
const graphAll = walkGraph(false);
const graphUsed = FOLLOW_ALL ? graphAll : walkGraph(true);
const { reachJs, reachCss, parkedReached, unresolvedDynamic, unusedImports } = graphUsed;

// CSS imported by ANY js/jsx under src (no filtering): used to count the ones nothing reaches.
const importedByAnyJs = new Map();
for (const f of all.filter((x) => /\.(jsx?|mjs)$/.test(x))) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/import\s+(?:[^'"]*from\s+)?['"]([^'"]+\.css)['"]/g)) {
    const q = path.resolve(path.dirname(f), m[1]);
    if (fs.existsSync(q)) { if (!importedByAnyJs.has(q)) importedByAnyJs.set(q, []); importedByAnyJs.get(q).push(f); }
  }
}
const imported = new Set();
if (ALL_IMPORTED) {
  for (const f of all.filter((x) => /\.(jsx?|mjs)$/.test(x) && !SKIP.test(x.replace(root, '')))) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/import\s+(?:[^'"]*from\s+)?['"]([^'"]+\.css)['"]/g)) {
      const q = path.resolve(path.dirname(f), m[1]);
      if (fs.existsSync(q)) imported.add(q);
    }
  }
} else {
  for (const q of reachCss) if (!PARKED.test(q)) imported.add(q);
}
const unreachableCss = [...importedByAnyJs.keys()].filter((q) => !reachCss.has(q));
console.log(`basis: ${ALL_IMPORTED ? 'ALL IMPORTED (old, over-counts)' : FOLLOW_ALL ? 'REACHABLE, every import followed (old graph)' : 'LIVE = reachable AND actually used'} | live JS files: ${reachJs.size} (old graph: ${graphAll.reachJs.size}) | live CSS files: ${reachCss.size} (old graph: ${graphAll.reachCss.size}) | parked/obsolete JS reached (not followed): ${parkedReached.size} | CSS imported by some JS but NOT live: ${unreachableCss.length}`);
if (!FOLLOW_ALL) {
  console.log(`
REACHABLE-BUT-UNUSED IMPORTS in live files: ${unusedImports.length} bindings`);
  for (const u of unusedImports) console.log(`  ${u.file} : ${u.binding} (from '${u.spec}') : ${u.why}`);
}
console.log(`dynamic imports with an unresolvable template string: ${unresolvedDynamic.length}${unresolvedDynamic.length ? ' (CSS behind these may be missed)' : ''}`);
for (const u of unresolvedDynamic) console.log(`  ${u}`);
const cssText = {};
for (const f of imported) cssText[f] = fs.readFileSync(f, 'utf8');

// Compare keyframe bodies by meaning, not by spelling: strip comments, `from` = `0%`, `to` = `100%`, no whitespace around
// { } : ; , no trailing semicolon, and a lone `0deg` = `0`. Nothing else is normalised: any other property, value or order
// difference stays a clash.
const normBody = (raw) => raw
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|[{},\s])from(?=\s*[,{])/g, '$10%')
  .replace(/(^|[{},\s])to(?=\s*[,{])/g, '$1100%')
  .replace(/\s+/g, ' ')
  .replace(/\s*([{}:;,])\s*/g, '$1')
  .replace(/;}/g, '}')
  .replace(/;$/, '')
  .replace(/(?<![\d.])0deg/g, '0')
  .trim();

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
    const body = normBody(css.slice(re.lastIndex, i - 1));
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
const jsFiles = ALL_IMPORTED
  ? all.filter((x) => /\.(jsx?|mjs)$/.test(x) && !SKIP.test(x.replace(root, '')))
  : [...reachJs].filter((x) => !PARKED.test(x));
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

// Keyframes defined INSIDE JS/JSX (a <style> element or template string) are global too: add them to the clash detection.
const inlineDefs = {}; // name -> Set of js files
for (const f of jsFiles) {
  const src = jsText[f];
  const re = /@keyframes\s+([A-Za-z0-9_-]+)\s*\{/g;
  let m;
  while ((m = re.exec(src))) {
    let depth = 1;
    let i = re.lastIndex;
    while (i < src.length && depth > 0) { if (src[i] === '{') depth++; else if (src[i] === '}') depth--; i++; }
    const body = normBody(src.slice(re.lastIndex, i - 1));
    if (!defs[m[1]]) defs[m[1]] = new Map();
    if (!defs[m[1]].has(body)) defs[m[1]].set(body, new Set());
    defs[m[1]].get(body).add(f);
    if (!inlineDefs[m[1]]) inlineDefs[m[1]] = new Set();
    inlineDefs[m[1]].add(f);
  }
}
const rows = [];
for (const [name, bodies] of Object.entries(defs)) {
  const files = new Set([...bodies.values()].flatMap((s) => [...s]));
  if (bodies.size < 2 || files.size < 2) continue;
  const users = [...imported].filter((f) => usedNames[f].has(name));
  rows.push({ name, versions: bodies.size, defined: [...files].map(rel), users: users.map(rel), jsUsers: jsUsers(name).map(rel), inline: inlineDefs[name] ? [...inlineDefs[name]].map(rel) : [] });
}
const used = rows.filter((r) => r.users.length || (r.inline.length && r.jsUsers.length));
console.log(`CSS files imported by live code: ${imported.size} | differing-name clashes: ${rows.length} | and used by an animation rule: ${used.length}`);
console.log('\nREAL RISK (different definitions in 2+ loaded files, and the animation is used):');
for (const r of used.sort((a, b) => b.defined.length - a.defined.length)) {
  console.log(`  ${r.name.padEnd(24)} ${String(r.versions).padStart(2)} versions, ${String(r.defined.length).padStart(2)} files  | defined in: ${r.defined.slice(0, 3).join(', ')}${r.defined.length > 3 ? ' +' + (r.defined.length - 3) : ''}${r.inline.length ? '  [INLINE in ' + r.inline.length + ' JS file(s)]' : ''}`);
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
// Keyframes defined inside JS/JSX (global once that component mounts), with whether a CSS file or another JS file defines the same name.
const inlineNames = Object.keys(inlineDefs).sort();
console.log(`\nINLINE DEFINITIONS (@keyframes inside JS/JSX): ${inlineNames.length} names`);
for (const n of inlineNames) {
  const files = [...inlineDefs[n]].map(rel);
  const cssFiles = [...defs[n].values()].flatMap((x) => [...x]).filter((f) => !inlineDefs[n].has(f)).map(rel);
  const flag = defs[n].size > 1 ? 'DIFFERENT bodies' : 'same body';
  console.log(`  ${n.padEnd(24)} inline: ${files.slice(0, 3).join(', ')}${files.length > 3 ? ' +' + (files.length - 3) : ''}${cssFiles.length ? ' | also in CSS: ' + cssFiles.slice(0, 2).join(', ') + (cssFiles.length > 2 ? ' +' + (cssFiles.length - 2) : '') : ''} | ${flag}`);
}
// CSS that some JS imports but nothing reachable does: dead-file candidates (listed, never deleted by this script).
console.log(`\nUNREACHABLE CSS (imported only by JS that main.jsx never reaches): ${unreachableCss.length}`);
for (const q of unreachableCss.sort()) console.log(`  ${rel(q).padEnd(60)} imported by: ${importedByAnyJs.get(q).slice(0, 2).map(rel).join(', ')}${importedByAnyJs.get(q).length > 2 ? ' +' + (importedByAnyJs.get(q).length - 2) : ''}`);
console.log(`\nDefined differently but never used by any loaded file (dead keyframes): ${rows.length - used.length}`);
if (OUT) fs.writeFileSync(OUT, JSON.stringify({ rows, orphaned: orphaned.map(([name, locations]) => ({ name, locations: [...locations] })), orphanedByChange, reachableJs: [...reachJs].map(rel), unusedImports, reachableCss: [...reachCss].map(rel), unreachableCss: unreachableCss.map(rel) }, null, 1));
