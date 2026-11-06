// Resolve any of the app's symbol / shloka-word keys to its learningCatalog entry.
// Sidebars, the Mandala popup and scenes spell a few ids differently
// (belly / ear / eye / mahakaya / "vakratunda-chant"), so every caller goes through here
// and the affirmation text always comes from the one canonical catalog.

import { LEARNING_IDS, getLearningById } from './learningCatalog';

const BY_LOWER = LEARNING_IDS.reduce((acc, id) => {
  acc[id.toLowerCase()] = id;
  return acc;
}, {});

const ALIASES = { belly: 'bigbelly', ear: 'ears', eye: 'eyes', mahakaya: 'mahakaay' };

export function getLearningForKey(rawKey) {
  const key = String(rawKey || '')
    .toLowerCase()
    .replace(/-chant$/, '')
    .replace(/[\s-]+/g, '')
    .trim();
  const lower = ALIASES[key] || key;
  const id = BY_LOWER[lower];
  return id ? getLearningById(id) : null;
}
