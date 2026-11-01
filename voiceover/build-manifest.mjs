#!/usr/bin/env node
// Lists which voiceover clips from voiceover/script.csv actually exist in public/audio/,
// and writes public/audio/vo-manifest.json. Run after adding recordings:
//   node voiceover/build-manifest.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const rows = fs.readFileSync(path.join(root, 'voiceover/script.csv'), 'utf8').split(/\r?\n/).slice(1);
const wanted = rows.map((r) => r.split(',')[0]).filter((n) => n.endsWith('.mp3')).map((n) => n.slice(0, -4));
const files = wanted.filter((n) => fs.existsSync(path.join(root, 'public/audio', `${n}.mp3`)));
fs.writeFileSync(path.join(root, 'public/audio/vo-manifest.json'), JSON.stringify({ files }, null, 1) + '\n');
console.log(`${files.length} of ${wanted.length} clips recorded`);
