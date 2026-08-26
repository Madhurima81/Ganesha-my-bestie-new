/**
 * Dev-only Vite plugin: lets the /dev/game-test annotation overlay POST
 * markup + comments to disk so Claude Code can read them back.
 *
 * Endpoints (dev server only):
 *   POST /__annotations      body = { game, url, viewport, items:[...] }
 *                            → writes src/dev/annotations/<game>-<ts>.json
 *                              and overwrites src/dev/annotations/latest.json
 *   GET  /__annotations      → returns latest.json (or {} if none yet)
 *
 * Not active in `vite build` (apply: 'serve').
 */
import fs from 'fs';
import path from 'path';

export default function annotationsPlugin() {
  const outDir = path.resolve(process.cwd(), 'src/dev/annotations');

  return {
    name: 'dev-annotations',
    apply: 'serve',
    configureServer(server) {
      fs.mkdirSync(outDir, { recursive: true });

      server.middlewares.use('/__annotations', (req, res) => {
        res.setHeader('Content-Type', 'application/json');

        if (req.method === 'GET') {
          const latest = path.join(outDir, 'latest.json');
          if (fs.existsSync(latest)) {
            res.end(fs.readFileSync(latest, 'utf8'));
          } else {
            res.end('{}');
          }
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (c) => { body += c; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              const stamp = new Date().toISOString().replace(/[:.]/g, '-');
              const game = String(data.game || 'unknown').replace(/[^a-z0-9_-]/gi, '');
              const payload = JSON.stringify({ savedAt: stamp, ...data }, null, 2);

              const named = path.join(outDir, `${game}-${stamp}.json`);
              fs.writeFileSync(named, payload);
              fs.writeFileSync(path.join(outDir, 'latest.json'), payload);

              // eslint-disable-next-line no-console
              console.log(`\n📝 annotations saved → src/dev/annotations/${game}-${stamp}.json  (${(data.items || []).length} item(s))\n`);
              res.end(JSON.stringify({ ok: true, file: `src/dev/annotations/${game}-${stamp}.json` }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ ok: false, error: String(err) }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end(JSON.stringify({ ok: false, error: 'method not allowed' }));
      });
    },
  };
}
