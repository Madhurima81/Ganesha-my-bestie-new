// Ganesha My Bestie — Scene Registry
// Single source of truth for all 22 scenes across 5 zones.
// Claude Code reads this file whenever Madhurima says:
// "apply X to all scenes" or "apply X to Zone 2" etc.

export const SCENE_REGISTRY = [

  // ─── Zone 1 — Symbol Mountain (FREE) ───────────────────────────────
  {
    id: 'modak',
    sceneNum: 1,
    zone: 'symbol-mountain',
    zoneName: 'Symbol Mountain',
    displayName: 'Modak',
    file: 'src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx',
    isBenchmark: true, // ← NewModakV7 is the benchmark for ALL tasks
  },
  {
    id: 'pond',
    sceneNum: 2,
    zone: 'symbol-mountain',
    zoneName: 'Symbol Mountain',
    displayName: 'Pond',
    file: 'src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx',
  },
  {
    id: 'symbol',
    sceneNum: 3,
    zone: 'symbol-mountain',
    zoneName: 'Symbol Mountain',
    displayName: 'Symbol',
    file: 'src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx',
  },
  {
    id: 'final-scene',
    sceneNum: 4,
    zone: 'symbol-mountain',
    zoneName: 'Symbol Mountain',
    displayName: 'Sacred Assembly',
    file: 'src/zones/symbol-mountain/scenes/final scene/SacredAssemblySceneV8.jsx',
  },

  // ─── Zone 2 — Cave of Secrets (Paid) ───────────────────────────────
  {
    id: 'vakratunda-mahakaya',
    sceneNum: 5,
    zone: 'cave-of-secrets',
    zoneName: 'Cave of Secrets',
    displayName: 'Vakratunda Mahakaya',
    file: 'src/zones/meaning cave/scenes/VakratundaMahakaya/CaveSceneFixedV2.jsx',
  },
  {
    id: 'suryakoti-samaprabha',
    sceneNum: 6,
    zone: 'cave-of-secrets',
    zoneName: 'Cave of Secrets',
    displayName: 'Suryakoti Samaprabha',
    file: 'src/zones/meaning cave/scenes/suryakoti-samaprabha/SuryakotiSceneV4.jsx',
  },
  {
    id: 'nirvighnam-kurumedeva',
    sceneNum: 7,
    zone: 'cave-of-secrets',
    zoneName: 'Cave of Secrets',
    displayName: 'Nirvighnam Kurumedeva',
    file: 'src/zones/meaning cave/scenes/nirvighnam-kurumedeva/NirvighnamSceneV5.jsx',
  },
  {
    id: 'sarvakaryeshu-sarvada',
    sceneNum: 8,
    zone: 'cave-of-secrets',
    zoneName: 'Cave of Secrets',
    displayName: 'Sarvakaryeshu Sarvada',
    file: 'src/zones/meaning cave/scenes/sarvakaryeshu-sarvada/SarvakaryeshuSarvadaV7.jsx',
  },
  {
    id: 'final-meaning-scene',
    sceneNum: 9,
    zone: 'cave-of-secrets',
    zoneName: 'Cave of Secrets',
    displayName: 'Cave Finale',
    file: 'src/zones/meaning cave/scenes/final meaning scene/Cavescene5memoryfinale.jsx',
  },

  // ─── Zone 3 — Shloka River (Paid) ──────────────────────────────────
  {
    id: 'vakratunda-grove',
    sceneNum: 10,
    zone: 'shloka-river',
    zoneName: 'Shloka River',
    displayName: 'Vakratunda Grove',
    file: 'src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx',
  },
  {
    id: 'suryakoti-bank',
    sceneNum: 11,
    zone: 'shloka-river',
    zoneName: 'Shloka River',
    displayName: 'Suryakoti Bank',
    file: 'src/zones/shloka-river/scenes/Scene2/SuryakotiBankSimplified.jsx',
  },
  {
    id: 'nirvighnam-chant',
    sceneNum: 12,
    zone: 'shloka-river',
    zoneName: 'Shloka River',
    displayName: 'Nirvighnam Chant',
    file: 'src/zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx',
  },
  {
    id: 'sarvakaryeshu-chant',
    sceneNum: 13,
    zone: 'shloka-river',
    zoneName: 'Shloka River',
    displayName: 'Sarvakaryeshu Chant',
    file: 'src/zones/shloka-river/scenes/scene4/SarvakaryeshuChantSimplified.jsx',
  },
  {
    id: 'shloka-river-finale',
    sceneNum: 14,
    zone: 'shloka-river',
    zoneName: 'Shloka River',
    displayName: 'Shloka River Finale',
    file: 'src/zones/shloka-river/scenes/scene5/ShlokaRiverFinale.jsx',
  },

  // ─── Zone 4 — Festival Square (Paid) ───────────────────────────────
  {
    id: 'game1',
    sceneNum: 15,
    zone: 'festival-square',
    zoneName: 'Festival Square',
    displayName: 'Piano Game',
    file: 'src/zones/festival-square/Game1-piano/FestivalPianoGame.jsx',
  },
  {
    id: 'game2',
    sceneNum: 16,
    zone: 'festival-square',
    zoneName: 'Festival Square',
    displayName: 'Rangoli Game',
    file: 'src/zones/festival-square/Game2-Rangoli/FestivalRangoliGame.jsx',
  },
  {
    id: 'game3',
    sceneNum: 17,
    zone: 'festival-square',
    zoneName: 'Festival Square',
    displayName: 'Modak Cooking',
    file: 'src/zones/festival-square/game3-cooking/ModakCookingGame.jsx',
  },
  {
    id: 'game4',
    sceneNum: 18,
    zone: 'festival-square',
    zoneName: 'Festival Square',
    displayName: 'Mandap Decoration',
    file: 'src/zones/festival-square/Game4-mandapdecor/MandapDecorationGame.jsx',
  },

  // ─── Zone 5 — About Me Hut (Paid) ──────────────────────────────────
  {
    id: 'family-tree',
    sceneNum: 19,
    zone: 'about-me-hut',
    zoneName: 'About Me Hut',
    displayName: 'Family Tree',
    file: 'src/zones/about-me-hut/name/Namebirthdaygame.jsx',
  },
  {
    id: 'favorite-food',
    sceneNum: 20,
    zone: 'about-me-hut',
    zoneName: 'About Me Hut',
    displayName: 'Favorite Food',
    file: 'src/zones/about-me-hut/family-tree/Familytreegame.jsx',
  },
  {
    id: 'dreams-wishes',
    sceneNum: 21,
    zone: 'about-me-hut',
    zoneName: 'About Me Hut',
    displayName: 'Dreams and Wishes',
    file: 'src/zones/about-me-hut/food/Favoritefoodgame.jsx',
  },
  {
    id: 'name-birthday',
    sceneNum: 22,
    zone: 'about-me-hut',
    zoneName: 'About Me Hut',
    displayName: 'Name and Birthday',
    file: 'src/zones/about-me-hut/enjoy/ObstacleRemoverGame.jsx',
  },
];

// ─── Helper functions ───────────────────────────────────────────────────────

// Get all scenes in a zone
export const getScenesByZone = (zone) =>
  SCENE_REGISTRY.filter((s) => s.zone === zone);

// Get a single scene by id
export const getSceneById = (id) =>
  SCENE_REGISTRY.find((s) => s.id === id);

// Get the benchmark scene (NewModakV7)
export const getBenchmarkScene = () =>
  SCENE_REGISTRY.find((s) => s.isBenchmark === true);

// Get all zone names (unique)
export const ZONES = [
  'symbol-mountain',
  'cave-of-secrets',
  'shloka-river',
  'festival-square',
  'about-me-hut',
];

