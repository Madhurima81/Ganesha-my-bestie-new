// Delegates CSS keyframe clash checks to the loaded-and-used triage.
//
// Vite bundles CSS globally, but the old scanner counted every duplicate name,
// including parked/dead CSS and unused keyframes. Keep `npm run check:css`
// aligned with the real-risk triage used for the CSS clash cleanup batches.

const { spawnSync } = require('child_process');
const path = require('path');

const triage = path.join(__dirname, 'css-clash-triage.cjs');
const result = spawnSync(process.execPath, [triage, ...process.argv.slice(2)], {
  stdio: 'inherit',
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
