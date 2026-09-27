// Scene → learning fallback map.
//
// ProgressManager only stores per-learning granularity (a `symbols: {key: true}`
// object) for 2 of the 9 live Symbol Mountain / Shloka River scenes: `pond`
// and `symbol`. `modak` was a wiring bug (fixed — its onComplete wrapper now
// forwards completionData) so it also has real per-symbol data going forward.
// `final-scene` only ever writes `symbols: { all: true }` (recap, no new
// symbols). All 5 Shloka River scenes only ever write `{ completed, stars }`
// — no word/chant keys reach ProgressManager at all (that richer data goes to
// a separate GameStateManager store instead) — so Shloka learnings can ONLY
// be derived from this fallback map.
//
// LearningProgress.js prefers real per-learning data from ProgressManager
// wherever it exists, and only falls back to this map when a completed
// scene's `symbols` object is missing, empty, or the `{ all: true }` recap
// marker.

export const SCENE_LEARNING_MAP = {
  'symbol-mountain': {
    modak: ['mooshika', 'modak', 'bigBelly'],
    pond: ['lotus', 'trunk'],
    symbol: ['eyes', 'ears', 'tusk'],
    'final-scene': [], // recap of previously-earned symbols, introduces nothing new
  },
  'shloka-river': {
    'vakratunda-grove': ['vakratunda', 'mahakaay'],
    'suryakoti-bank': ['suryakoti', 'samaprabha'],
    'nirvighnam-chant': ['nirvighnam', 'kuruMeDeva'],
    'sarvakaryeshu-chant': ['sarvakaryeshu', 'sarvada'],
    'shloka-river-finale': [], // recap of previously-earned words, introduces nothing new
  },
};

// ProgressManager's `symbols` object uses the same lowercase keys as the
// scene code (`belly`, `mahakaya`, `kurumedeva`), but learningCatalog.js
// uses different IDs for those three (`bigBelly`, `mahakaay`, `kuruMeDeva`).
// Everything else is identical between the two systems.
export const PROGRESS_KEY_TO_CATALOG_ID = {
  belly: 'bigBelly',
  mahakaya: 'mahakaay',
  kurumedeva: 'kuruMeDeva',
};

export function progressKeyToCatalogId(key) {
  return PROGRESS_KEY_TO_CATALOG_ID[key] || key;
}
