// export-sound-lab.mjs — build the Sound Lab as a standalone folder + zip you can send to anyone.
//   npm run sound-lab:export
// Output (git-ignored):  sound-lab-export/sound-lab/   and   sound-lab-export.zip  (unzips to one folder: sound-lab/)
// The zip needs NO project, NO npm install: just Python or Node to run a tiny local server
// (browsers block audio loading from file://, so a double-clicked HTML file would stay silent).

import { build } from 'vite';
import { cpSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const buildDir = join(root, 'node_modules/.sound-lab-build');
const stage = join(root, 'sound-lab-export');          // git-ignored staging folder
const outDir = join(stage, 'sound-lab');                // the folder the recipient gets after unzipping
const site = join(outDir, 'site');
const zipPath = join(root, 'sound-lab-export.zip');
const PORT = 8765;

// 1. Build the page alone.
await build({ root, configFile: join(root, 'vite.soundlab.config.js'), logLevel: 'warn' });

// 2. Assemble the folder.
rmSync(stage, { recursive: true, force: true });
mkdirSync(site, { recursive: true });
cpSync(buildDir, site, { recursive: true });
renameSync(join(site, 'sound-lab.html'), join(site, 'index.html'));

// 3. Only the audio the lab touches (same URLs the app uses, so no code changes are needed).
const AUDIO = [
  'sfx',                                  // every SFX role
  'sfx-role-mapping-2',                   // frog sounds
  'music/bg-ambient.mp3',                 // welcome + scene beds
  'ambient/map ambient sound.mp3',        // home + map beds
  'syllables/tunda-vakratunda.mp3',       // used by the "Sanskrit guard" test
];
const missing = [];
for (const rel of AUDIO) {
  const from = join(root, 'public/audio', rel);
  if (!existsSync(from)) { missing.push(rel); continue; }
  cpSync(from, join(site, 'audio', rel), { recursive: true });
}

// 4. Tiny static servers with correct MIME types (Windows Python can mis-serve .js, which breaks modules).
writeFileSync(join(outDir, 'serve.py'), `import http.server, mimetypes, os, socketserver, sys, webbrowser, threading
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else ${PORT}
for ext, mt in {'.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
                '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.html': 'text/html'}.items():
    mimetypes.add_type(mt, ext)
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'site'))
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('127.0.0.1', PORT), H) as srv:
    url = f'http://localhost:{PORT}/'
    print(f'Sound Lab running at {url}  (close this window to stop)')
    threading.Timer(1.0, lambda: webbrowser.open(url)).start()
    srv.serve_forever()
`);
writeFileSync(join(outDir, 'serve.mjs'), `import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
const PORT = Number(process.argv[2]) || ${PORT};
const dir = join(fileURLToPath(new URL('.', import.meta.url)), 'site');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.png': 'image/png', '.svg': 'image/svg+xml' };
createServer(async (req, res) => {
  try {
    let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\\\]\\.\\.)+/, '');
    let file = join(dir, p);
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end('not found'); }
}).listen(PORT, '127.0.0.1', () => {
  const url = 'http://localhost:' + PORT + '/';
  console.log('Sound Lab running at ' + url + '  (close this window to stop)');
  const open = process.platform === 'win32' ? 'start ""' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(open + ' ' + url);
});
`);

// 5. Launchers + readme.
const bat = [
  '@echo off',
  'title Sound Lab',
  'cd /d "%~dp0"',
  'where python >nul 2>nul && (python serve.py & goto :done)',
  'where py >nul 2>nul && (py serve.py & goto :done)',
  'where node >nul 2>nul && (node serve.mjs & goto :done)',
  'echo.',
  'echo Sound Lab needs Python or Node.js to run a tiny local server.',
  'echo Install one (python.org or nodejs.org), then double-click this file again.',
  ':done',
  'pause',
  '',
].join('\r\n');
writeFileSync(join(outDir, 'start-sound-lab.bat'), bat);
writeFileSync(join(outDir, 'start-sound-lab.command'), `#!/bin/bash
cd "$(dirname "$0")"
if command -v python3 >/dev/null 2>&1; then python3 serve.py
elif command -v node >/dev/null 2>&1; then node serve.mjs
else echo "Sound Lab needs Python 3 or Node.js (python.org / nodejs.org), then run this again."; fi
`);
writeFileSync(join(outDir, 'README.txt'), `SOUND LAB  (Ganesha My Bestie)
Built ${new Date().toLocaleString()}

WHAT IT IS
A page to hear every sound effect and background track in the app, check the rules between them,
and see which scenes use which sound. Press "Run a whole scene" first.

HOW TO OPEN IT
  Windows:  double-click  start-sound-lab.bat
  Mac:      open Terminal, type  bash   then drag start-sound-lab.command into the window, press Enter
  Anything else:  run  python3 serve.py  (or  node serve.mjs)  inside this folder
Your browser opens at http://localhost:${PORT}/ . Close the black window to stop.

WHY NOT JUST DOUBLE-CLICK index.html?
Browsers refuse to load sounds from a file opened straight from disk, so the page would stay silent.
The launcher starts a tiny server on YOUR computer only. Nothing is uploaded anywhere.

TIPS
- Turn your volume up and tap something: browsers stay silent until you tap.
- Needs Python 3 or Node.js installed (either one).
- The "which scenes use what" list is a snapshot from the day this was built.
- Headphones or a tablet speaker will tell you more than laptop speakers.
`);

// 6. Zip.
rmSync(zipPath, { force: true });
if (process.platform === 'win32') {
  execFileSync('powershell', ['-NoProfile', '-Command', `Compress-Archive -Path '${outDir}' -DestinationPath '${zipPath}' -Force`], { stdio: 'inherit' });
} else {
  execFileSync('zip', ['-qr', zipPath, 'sound-lab'], { cwd: stage, stdio: 'inherit' });
}

const kb = Math.round(readFileSync(zipPath).length / 1024);
console.log(`\nBuilt ${zipPath} (${(kb / 1024).toFixed(1)} MB)`);
if (missing.length) console.warn('Missing audio (skipped):', missing.join(', '));
