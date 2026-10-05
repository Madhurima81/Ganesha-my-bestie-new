// Single source of truth for all Ganesha body-part zone positions.
// Used by:
//  - GaneshaIllustration.jsx (renders clickable hitboxes)
//  - SacredAssemblySceneV8.jsx (renders hint glows, sparkles, flying-symbol targets)
//
// Positions are percentages of the square .ganesha-assembly-container. Keep
// width/height in percentages too so the marker centers and forgiving hitboxes
// scale consistently across iPad Pro and smaller iPad Safari layouts.

export const GANESHA_ZONES = [
  {
    id: 'eyes',
    acceptTypes: ['eyes'],
    hint: 'Divine Sight',
    position: { top: '27.7%', left: '32.3%', width: '32.1%', height: '11.4%' }
  },
  {
    id: 'ears',
    acceptTypes: ['ears'],
    hint: 'Deep Listening',
    // One hint glow on the right, but two visual hitboxes (left + right ear).
    position: { top: '24.0%', left: '61.9%', width: '18.5%', height: '27.2%' },
    extraHitboxes: [
      { hitId: 'ears-left', box: { top: '20%', left: '16%', width: '16.3%', height: '25.0%' } }
    ]
  },
  {
    id: 'trunk',
    acceptTypes: ['trunk'],
    hint: 'Removing Obstacles',
    position: { top: '30.6%', left: '40.9%', width: '15.8%', height: '26.6%' }
  },
  {
    id: 'tusk',
    acceptTypes: ['tusk'],
    hint: 'Breaking Barriers',
    position: { top: '47.1%', left: '39.5%', width: '18.5%', height: '8.5%' }
  },
  {
    id: 'left-hand',
    acceptTypes: ['modak'],
    hint: 'Sweet Blessings',
    position: { top: '58.0%', left: '59.6%', width: '19.6%', height: '13.0%' }
  },
  {
    id: 'right-hand',
    acceptTypes: ['lotus'],
    hint: 'Pure Wisdom',
    position: { top: '41.0%', left: '71.6%', width: '15.2%', height: '21.7%' }
  },
  {
    id: 'belly',
    acceptTypes: ['belly'],
    hint: 'Universe Within',
    position: { top: '52.3%', left: '35.8%', width: '26.6%', height: '21.7%' }
  },
  {
    id: 'base',
    acceptTypes: ['mooshika'],
    hint: 'Divine Vehicle',
    position: { bottom: '10%', left: '20%', transform: 'translateX(-50%)', width: '19.6%', height: '19.6%' }
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
