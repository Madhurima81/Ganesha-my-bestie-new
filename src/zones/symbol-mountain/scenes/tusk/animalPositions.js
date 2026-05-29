// Shared fixed animal positions for Symbol Mountain story flow.
// Used by Eyes + Ears so characters stay in the same place across scenes.

export const ANIMAL_POSITIONS = {
  peacock: { x: 34, y: 68 },
  monkey: { x: 46, y: 66 },
  elephant: { x: 58, y: 66 },
  cow: { x: 70, y: 68 }
};

export const ANIMAL_POSITIONS_ARRAY = Object.entries(ANIMAL_POSITIONS).map(([id, pos]) => ({
  id,
  ...pos
}));

