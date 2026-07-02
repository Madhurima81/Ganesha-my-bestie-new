export const NIRVIGHNAM_LAYOUT = {
  turtleStart: { l: 79.2, t: 76.4 },
  turtleWidth: 9,
  turtleFlip: false,
  nest: { l: 27.8, t: 63.2, w: 12, flip: false },
  obstacles: [
    { id: 'stone', l: 45.8, t: 77.6, w: 10, label: 'stone', flip: false },
    { id: 'branch', l: 55.8, t: 75.1, w: 9, label: 'branch', flip: false },
    { id: 'reed', l: 65, t: 71.4, w: 11, label: 'reeds', flip: false },
  ],
  swimPath: [
    { l: 66.5, t: 77.4 },
    { l: 53.2, t: 78.1 },
    { l: 43.4, t: 71.1 },
    { l: 33.8, t: 66.2 },
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
    l: 60.4,
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
    l: 18.6,
    t: 64.8,
    w: 8.5,
    flip: false,
  },
  friends: [
    { id: 'turtle', label: 'Turtle', brings: 'logs', l: 32, t: 62, w: 10, flip: false },
    { id: 'bird', label: 'Bird', brings: 'vines', l: 24.3, t: 54.7, w: 10, flip: false },
    { id: 'squirrel', label: 'Squirrel', brings: 'pegs', l: 34, t: 63.8, w: 10, flip: false },
    { id: 'bunny', label: 'Bunny', brings: 'planks', l: 33.1, t: 57.3, w: 10, flip: false },
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
