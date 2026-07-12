// Shared fixed animal positions for Symbol Mountain story flow.
// Used by Eyes + Ears so characters stay in the same place across scenes.

export const ANIMAL_POSITIONS = {
  monkey: { x: 10.07, y: 18.11, depth: 'behind-middle' },
  peacock: { x: 69.21, y: 68.92, depth: 'behind-middle' },
  cow: { x: 43.43, y: 80.61, depth: 'behind-middle' },
  elephant: { x: 50.04, y: 64.64, depth: 'behind-middle' }
};

export const ANIMAL_POSITIONS_ARRAY = Object.entries(ANIMAL_POSITIONS).map(([id, pos]) => ({
  id,
  ...pos
}));
