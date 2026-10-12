// Finds CSS animation names (@keyframes) defined in more than one live CSS file WITH DIFFERENT CONTENT.
//
// Why: Vite bundles every scene's CSS into ONE global stylesheet. If two files define
// `@keyframes stageHintGlow` differently, the one loaded last silently wins for BOTH scenes - a scene
// that looked right yesterday can break when load order changes (Kurumedeva's friend glow did).
// Identical copies (e.g. a plain fadeIn) are harmless and are not reported.
//
// Run:  node scripts/check-css-clashes.cjs            (exit code 1 when a risky clash is found)
//       node scripts/check-css-clashes.cjs --all      (also list identical duplicates)
// Fix:  prefix the animation with the scene/component name (kuruHintGlow, vakHintPulse, ...).
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'src');
const SKIP_DIR = /node_modules|dist|meaning cave|festival-square/i;
const SKIP_FILE = /backup|copy|original|old|\.bak/i;
const showAll = process.argv.includes('--all');

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIR.test(entry.name)) walk(full);
    } else if (entry.name.endsWith('.css') && !SKIP_FILE.test(entry.name)) {
      files.push(full);
    }
  }
})(root);

// name -> Map(normalizedBody -> Set(files))
const byName = {};
for (const file of files) {
  const css = fs.readFileSync(file, 'utf8');
  const re = /@keyframes\s+([A-Za-z0-9_-]+)\s*\{/g;
  let m;
  while ((m = re.exec(css))) {
    let depth = 1;
    let i = re.lastIndex;
    while (i < css.length && depth > 0) {
      if (css[i] === '{') depth += 1;
      else if (css[i] === '}') depth -= 1;
      i += 1;
    }
    const body = css.slice(re.lastIndex, i - 1).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim();
    const bodies = (byName[m[1]] = byName[m[1]] || new Map());
    if (!bodies.has(body)) bodies.set(body, new Set());
    bodies.get(body).add(path.relative(root, file).split(path.sep).join('/'));
  }
}

let risky = 0;
let identical = 0;
for (const [name, bodies] of Object.entries(byName).sort()) {
  const where = [...bodies.values()].reduce((n, s) => n + s.size, 0);
  if (where < 2) continue;
  if (bodies.size > 1) {
    risky += 1;
    console.log(`\nRISKY  ${name}  - ${bodies.size} different definitions in ${where} files`);
    let v = 1;
    for (const files of bodies.values()) console.log(`   version ${v++}: ${[...files].join(', ')}`);
  } else {
    identical += 1;
    if (showAll) console.log(`\nsame   ${name}  (${where} files, identical)`);
  }
}
console.log(`\nCSS files scanned: ${files.length} | names defined in 2+ files: ${risky + identical} | RISKY (different content): ${risky} | harmless (identical): ${identical}`);
process.exit(risky ? 1 : 0);
