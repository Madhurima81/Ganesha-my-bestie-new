// Tusk scene uses a different lineup than the Eyes/Ears reveal scenes.
// Keep its path-clearing positions local to this scene so it does not inherit
// the reveal layout from earlier mini-games.
export const TUSK_ANIMAL_POSITIONS = {
  peacock: { x: 74, y: 67, depth: 'in-front' },
  monkey: { x: 28, y: 56, depth: 'in-front' },
  elephant: { x: 54, y: 52, depth: 'in-front' },
  cow: { x: 45, y: 78, depth: 'in-front' }
};

// Trail blockage anchor for the tusk game.
export const TUSK_OBSTACLE_POSITION = {
  scale: 1.75,
  x: 53.53107517048464,
  y: 30.758808415110515,
  depth: 'between-middle-front'
};
