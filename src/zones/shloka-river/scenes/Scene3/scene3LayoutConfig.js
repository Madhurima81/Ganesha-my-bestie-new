export const NIRVIGHNAM_LAYOUT = {
  turtleStart: { l: 79.2, t: 76.4 },
  turtleWidth: 9,
  turtleFlip: false,
  nest: { l: 27.8, t: 55.3, w: 12, flip: false },
  obstacles: [
    { id: 'stone', l: 67.3, t: 73.2, w: 14.7, label: 'stone', flip: false },
    { id: 'branch', l: 58.3, t: 71.7, w: 12.3, label: 'branch', flip: false },
    { id: 'reed', l: 50.8, t: 71.4, w: 17.7, label: 'reeds', flip: false },
  ],
  bankSpots: {
    stone: { l: 74, t: 56 },
    branch: { l: 62, t: 84 },
  },
  turtleNodes: [
    { l: 64.3, t: 74 },
    { l: 59, t: 71.7 },
    { l: 50.2, t: 72.2 },
  ],
  // The turtle walks the crossing obstacle-by-obstacle and ends at Turtle
  // Node 3, then does one short swim from there to settle at the nest.
  swimPath: [
    { l: 32.9, t: 58.3 },
  ],
  pathLine: {
    x1: 16,
    y1: 60,
    x2: 84,
    y2: 58,
  },
};

export const KURUMEDEVA_LAYOUT = {
  bridge: {
    l: 57.7,
    t: 71.1,
    w: 46.5,
    r: 5,
    flip: false,
  },
  beaver: {
    w: 8,
    flip: true,
  },
  beaverBaby: {
    l: 10.6,
    t: 66.7,
    w: 8.5,
    flip: false,
  },
  friends: [
    { id: 'turtle', label: 'Turtle', brings: 'logs', l: 30.1, t: 63.3, w: 10, flip: false },
    { id: 'bird', label: 'Bird', brings: 'vines', l: 21.7, t: 39.7, w: 10, flip: false },
    { id: 'squirrel', label: 'Squirrel', brings: 'pegs', l: 38.7, t: 47.7, w: 10, flip: false },
    { id: 'bunny', label: 'Bunny', brings: 'planks', l: 29.6, t: 47.9, w: 10, flip: false },
  ],
  beaverPath: [
    { l: 73.9, t: 69.9 },
    { l: 63.1, t: 67.9 },
    { l: 49.1, t: 68.2 },
    { l: 41.9, t: 65.5 },
    { l: 34.3, t: 66.9 },
    { l: 26.8, t: 65.4 },
    { l: 20.2, t: 64.7 },
  ],
};
