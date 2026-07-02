import { ANIMAL_POSITIONS } from './animalPositions';

// Shared default animal positions for the path-facing games.
// Eyes can override these at runtime, and Ears/Tusk can reuse the same result.
export const TUSK_ANIMAL_POSITIONS = {
  ...ANIMAL_POSITIONS
};

// Trail blockage anchor for the tusk game.
export const TUSK_OBSTACLE_POSITION = {
  scale: 1.75,
  x: 53.53107517048464,
  y: 30.758808415110515,
  depth: 'between-middle-front'
};
