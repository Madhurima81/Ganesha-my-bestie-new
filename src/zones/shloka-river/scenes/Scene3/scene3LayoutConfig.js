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
  hitZones: {
    stone: { l: 67.3, t: 73.2, w: 13.8, h: 13.5 },
    reed: { l: 51.9, t: 66.5, w: 15.3, h: 15.3 },
    branchDrop: { l: 62, t: 84, w: 16, h: 10 },
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
  // Orientation flipped to match the BeatPlayer prototype's beat 1 (Sept
  // 2026): Mother Beaver starts on the LEFT bank with Elephant/Monkey, Baby
  // Beaver waits on the RIGHT — reverse of the earlier setup. beaverPath is
  // the same S-curve walked in the opposite direction (left → right), so it
  // still tracks the river art exactly.
  beaver: {
    w: 10,
    flip: false,
  },
  beaverBaby: {
    l: 79.6,
    t: 60.8,
    w: 6.5,
    flip: true,
  },
  // Bridge redesign (GMB_KurumeDeva_New_Assets pack): exactly 2 ask-for-help
  // loops — Elephant (support logs), Monkey (rope) — then Beaver lays the
  // planks alone, no third helper. Positions match the BeatPlayer prototype's
  // beat 1 snapshot.
  friends: [
    { id: 'elephant', label: 'Elephant', brings: 'support', l: 35.8, t: 46.4, w: 13, flip: false },
    { id: 'monkey', label: 'Monkey', brings: 'ropes', l: 4.1, t: 55.2, w: 10, flip: false },
  ],
  beaverPath: [
    { l: 39.7, t: 62.9 },
    { l: 53, t: 66.6 },
    { l: 69.7, t: 70.3 },
    { l: 85, t: 66.7 },
  ],
};
