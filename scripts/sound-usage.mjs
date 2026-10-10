// sound-usage.mjs — which LIVE files call which SFX role.
//   npm run sound-usage            → prints a table, writes src/dev/soundUsage.generated.json
// The Sound Lab page (sound-lab.html) shows the same data. Scope = the 3 live zones + shared
// components. Backups, copies, dev harnesses, parked (festival-square) and obsolete (meaning cave) are skipped.

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROLE_IDS, ALIASES, CALL_NAMES } from '../src/lib/audio/sfxNames.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const SCAN_DIRS = [
  'src/zones/symbol-mountain', 'src/zones/shloka-river', 'src/zones/about-me-hut',
  'src/lib/components', 'src/pages',
];
const SKIP_NAME = /backup|copy|before|oldflow|(^|[-_. ])old([-_. ]|$)|FIXED|_bak|\.bak/i;
const SKIP_FILE = /V6\.jsx$/;           // NewModakSceneV6: superseded by V7

// `?.(` too: scenes often call playSfx?.('x') / playSparkle?.()
const CALL_RE = new RegExp(`\\b(${Object.keys(CALL_NAMES).join('|')})\\s*(?:\\?\\.)?\\(`, 'g');
const KEY_RE = /\bplaySfx\s*(?:\?\.)?\(\s*['"]([A-Za-z]+)['"]/g;

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) { yield* walk(full); continue; }
    if (name.endsWith('.jsx') && !SKIP_NAME.test(name) && !SKIP_FILE.test(name)) yield full;
  }
}

const rows = [];
let scanned = 0;
for (const d of SCAN_DIRS) {
  const abs = join(root, d);
  for (const file of walk(abs)) {
    scanned += 1;
    const text = readFileSync(file, 'utf8');
    const counts = {};
    let m;
    while ((m = CALL_RE.exec(text))) counts[CALL_NAMES[m[1]]] = (counts[CALL_NAMES[m[1]]] || 0) + 1;
    while ((m = KEY_RE.exec(text))) {
      const role = ROLE_IDS.includes(m[1]) ? m[1] : ALIASES[m[1]];
      if (role) counts[role] = (counts[role] || 0) + 1;
    }
    if (Object.keys(counts).length) rows.push({ file: relative(root, file).split(sep).join('/'), counts });
  }
}
rows.sort((a, b) => a.file.localeCompare(b.file));

const out = { generatedAt: new Date().toISOString(), scanned, roles: ROLE_IDS, rows };
writeFileSync(join(root, 'src/dev/soundUsage.generated.json'), JSON.stringify(out, null, 1));

const short = (p) => p.split('/').pop().replace('.jsx', '');
console.log(`Scanned ${scanned} live files, ${rows.length} call SFX.\n`);
console.log(['file'.padEnd(34), ...ROLE_IDS.map((r) => r.slice(0, 5).padStart(5))].join(' '));
for (const r of rows) console.log([short(r.file).slice(0, 33).padEnd(34), ...ROLE_IDS.map((x) => String(r.counts[x] || '·').padStart(5))].join(' '));
const unused = ROLE_IDS.filter((r) => !rows.some((x) => x.counts[r]));
console.log(`\nRoles no live file calls: ${unused.join(', ') || 'none'}`);
