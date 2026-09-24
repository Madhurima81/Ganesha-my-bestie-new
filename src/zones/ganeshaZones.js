// Single source of truth for all Ganesha body-part zone positions.
// Used by:
//  - GaneshaIllustration.jsx (renders clickable hitboxes)
//  - SacredAssemblySceneV8.jsx (renders hint glows, sparkles, flying-symbol targets)
//
// width/height are px at the .ganesha-assembly-container's native 920x1020 design
// size — kept in px (not %) because SacredAssemblySceneV8's getZoneCenter() does
// px arithmetic (calc() offsets, +40px sparkle padding) on these values. The
// container itself scales visually via CSS transform:scale() (see
// SacredAssemblyScene.css .ganesha-assembly-container-scale-wrap), which resizes
// everything inside proportionally without needing these values to change.

export const GANESHA_ZONES = [
  {
    id: 'eyes',
    acceptTypes: ['eyes'],
    hint: 'Divine Sight',
    position: { top: '31.8%', left: '31.4%', width: '295px', height: '105px' }
  },
  {
    id: 'ears',
    acceptTypes: ['ears'],
    hint: 'Deep Listening',
    // One hint glow on the right, but two visual hitboxes (left + right ear).
    position: { top: '25.8%', left: '61.4%', width: '170px', height: '250px' },
    extraHitboxes: [
      { hitId: 'ears-left', box: { top: '20%', left: '16%', width: '150px', height: '230px' } }
    ]
  },
  {
    id: 'trunk',
    acceptTypes: ['trunk'],
    hint: 'Removing Obstacles',
    position: { top: '36.4%', left: '39.4%', width: '145px', height: '245px' }
  },
  {
    id: 'tusk',
    acceptTypes: ['tusk'],
    hint: 'Breaking Barriers',
    position: { top: '61.9%', left: '79.3%', width: '185px', height: '93px' }
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
    position: { top: '52.2%', left: '34.5%', width: '245px', height: '200px' }
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
