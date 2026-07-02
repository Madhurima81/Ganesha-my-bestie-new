// Single source of truth for all Ganesha body-part zone positions.
// Used by:
//  - GaneshaIllustration.jsx (renders clickable hitboxes)
//  - SacredAssemblySceneV8.jsx (renders hint glows, sparkles, flying-symbol targets)

export const GANESHA_ZONES = [
  {
    id: 'eyes',
    acceptTypes: ['eyes'],
    hint: 'Divine Sight',
    position: { top: '28%', left: '48%', transform: 'translateX(-50%)', width: '280px', height: '90px' }
  },
  {
    id: 'ears',
    acceptTypes: ['ears'],
    hint: 'Deep Listening',
    // One hint glow on the right, but two visual hitboxes (left + right ear).
    position: { top: '20%', right: '16%', width: '150px', height: '230px' },
    extraHitboxes: [
      { hitId: 'ears-left', box: { top: '20%', left: '16%', width: '150px', height: '230px' } }
    ]
  },
  {
    id: 'trunk',
    acceptTypes: ['trunk'],
    hint: 'Removing Obstacles',
    position: { top: '33%', left: '50%', transform: 'translateX(-50%)', width: '120px', height: '220px' }
  },
  {
    id: 'tusk',
    acceptTypes: ['tusk'],
    hint: 'Breaking Barriers',
    position: { top: '43%', left: '50%', transform: 'translateX(-50%)', width: '170px', height: '78px' }
  },
  {
    id: 'left-hand',
    acceptTypes: ['modak'],
    hint: 'Sweet Blessings',
    position: { top: '55%', right: '20%', width: '180px', height: '120px' }
  },
  {
    id: 'right-hand',
    acceptTypes: ['lotus'],
    hint: 'Pure Wisdom',
    position: { top: '38%', right: '12%', width: '140px', height: '200px' }
  },
  {
    id: 'belly',
    acceptTypes: ['belly'],
    hint: 'Universe Within',
    position: { top: '43%', left: '50%', transform: 'translateX(-50%)', width: '210px', height: '165px' }
  },
  {
    id: 'base',
    acceptTypes: ['mooshika'],
    hint: 'Divine Vehicle',
    position: { bottom: '10%', left: '20%', transform: 'translateX(-50%)', width: '180px', height: '180px' }
  }
];

// Z-index for the visual layer (which body-part image draws on top)
export const ZONE_VISUAL_Z_INDEX = {
  base: 1, ears: 2, belly: 3,
  'left-hand': 4, 'right-hand': 4,
  tusk: 5, trunk: 6, eyes: 7
};

// Z-index for the clickable hitbox (which zone wins when overlapping)
export const ZONE_HITBOX_Z_INDEX = {
  base: 10, belly: 20,
  'left-hand': 30, 'right-hand': 30,
  ears: 40, trunk: 50, tusk: 60, eyes: 70
};
