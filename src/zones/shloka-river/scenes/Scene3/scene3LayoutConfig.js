export const NIRVIGHNAM_LAYOUT = {
  turtleStart: { l: 30.7, t: 71.5 },
  turtleWidth: 9,
  turtleFlip: true,
  nest: { l: 86.1, t: 66.9, w: 12, flip: false },
  obstacles: [
    { id: 'stone', l: 39.4, t: 75.1, w: 10, label: 'stone', flip: false },
    { id: 'branch', l: 53.8, t: 72.5, w: 9, label: 'branch', flip: false },
    { id: 'reed', l: 64.3, t: 67.8, w: 11, label: 'reeds', flip: false },
  ],
  swimPath: [
    { l: 41.7, t: 78.3 },
    { l: 53.2, t: 78.1 },
    { l: 65.1, t: 77.5 },
    { l: 77.8, t: 68.8 },
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
    l: 50,
    t: 56,
    w: 52,
    flip: false,
  },
  beaver: {
    w: 8,
    flip: false,
  },
  friends: [
    { id: 'turtle', label: 'Turtle', brings: 'logs', l: 72, t: 62, w: 10, flip: false },
    { id: 'bird', label: 'Bird', brings: 'vines', l: 78, t: 55, w: 10, flip: false },
    { id: 'squirrel', label: 'Squirrel', brings: 'pegs', l: 74, t: 65, w: 10, flip: false },
    { id: 'bunny', label: 'Bunny', brings: 'planks', l: 80, t: 60, w: 10, flip: false },
  ],
  beaverPath: [
    { l: 18, t: 68 },
    { l: 32, t: 65 },
    { l: 48, t: 63 },
    { l: 62, t: 64 },
    { l: 76, t: 66 },
  ],
};
