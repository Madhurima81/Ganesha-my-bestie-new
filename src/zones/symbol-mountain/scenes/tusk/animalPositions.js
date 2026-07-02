// Shared fixed animal positions for Symbol Mountain story flow.
// Used by Eyes + Ears so characters stay in the same place across scenes.

export const ANIMAL_POSITIONS = {
  monkey: { x: 33.38041402525821, y: 64.4986482945884, depth: 'behind-middle' },
  peacock: { x: 85.17, y: 42.55, depth: 'behind-middle' },
  cow: { x: 71.79849915585275, y: 63.41463414634146, depth: 'behind-middle' },
  elephant: { x: 53.81, y: 55.28, depth: 'behind-middle' }
};

export const ANIMAL_POSITIONS_ARRAY = Object.entries(ANIMAL_POSITIONS).map(([id, pos]) => ({
  id,
  ...pos
}));
