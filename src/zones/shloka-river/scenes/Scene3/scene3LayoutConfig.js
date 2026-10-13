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

// Phone landscape (<= 500px tall): the whole obstacle cluster (stone, branch, reeds), the hit zones
// on them, the stepping nodes the turtle walks and the bank spots they land on move together
// PHONE_CLUSTER_SHIFT_L percent to the left, which gives the turtle breathing room beside the rock
// on a short screen. The nest, swim path and turtle start stay where they are. iPad / desktop keep
// NIRVIGHNAM_LAYOUT unchanged.
const PHONE_CLUSTER_SHIFT_L = -4;
const shiftL = (p) => ({ ...p, l: Math.round((p.l + PHONE_CLUSTER_SHIFT_L) * 10) / 10 });
export const NIRVIGHNAM_LAYOUT_PHONE = {
  ...NIRVIGHNAM_LAYOUT,
  obstacles: NIRVIGHNAM_LAYOUT.obstacles.map(shiftL),
  bankSpots: Object.fromEntries(Object.entries(NIRVIGHNAM_LAYOUT.bankSpots).map(([k, v]) => [k, shiftL(v)])),
  hitZones: Object.fromEntries(Object.entries(NIRVIGHNAM_LAYOUT.hitZones).map(([k, v]) => [k, shiftL(v)])),
  turtleNodes: NIRVIGHNAM_LAYOUT.turtleNodes.map(shiftL),
};

const KURUMEDEVA_LAYOUT_DEFAULT = {
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
    { id: 'elephant', label: 'Elephant', brings: 'support', l: 27, t: 46.4, w: 13, flip: false },
    { id: 'monkey', label: 'Monkey', brings: 'ropes', l: 7.7, t: 62.2, w: 10, flip: false },
  ],
  beaverPath: [
    { l: 39.7, t: 62.9 },
    { l: 53, t: 66.6 },
    { l: 69.7, t: 70.3 },
    { l: 85, t: 66.7 },
  ],
};

// Phone (either orientation, so a phone that loads in portrait and is then rotated still gets it;
// every iPad has a short side >= 744px): the finished bridge was too dominant next to the
// characters at 740x360, so the bridge is ~9% smaller, 2% lower and 3% further left (clear of the
// beaver family on the right bank), the elephant ~7% smaller and the beaver 5% smaller. Monkey and
// the baby beaver are unchanged; the two beaver-path points that walk on the bridge move with it. iPad / desktop keep KURUMEDEVA_LAYOUT_DEFAULT.
const isSmallPhone = () => typeof window !== 'undefined'
  && Math.min(window.innerWidth, window.innerHeight) <= 500
  && Math.max(window.innerWidth, window.innerHeight) <= 1023;

const KURUMEDEVA_LAYOUT_PHONE = {
  ...KURUMEDEVA_LAYOUT_DEFAULT,
  bridge: {
    ...KURUMEDEVA_LAYOUT_DEFAULT.bridge,
    // 3% left as well: at the old centre even the smaller bridge still ran under the beaver family
    // (~78-86% of the width) in the finished state.
    l: Math.round((KURUMEDEVA_LAYOUT_DEFAULT.bridge.l - 3) * 10) / 10,
    t: Math.round((KURUMEDEVA_LAYOUT_DEFAULT.bridge.t + 2) * 10) / 10,
    w: Math.round(KURUMEDEVA_LAYOUT_DEFAULT.bridge.w * 0.91 * 10) / 10,
  },
  beaver: {
    ...KURUMEDEVA_LAYOUT_DEFAULT.beaver,
    w: Math.round(KURUMEDEVA_LAYOUT_DEFAULT.beaver.w * 0.95 * 10) / 10,
  },
  friends: KURUMEDEVA_LAYOUT_DEFAULT.friends.map((f) => (
    f.id === 'elephant' ? { ...f, w: Math.round(f.w * 0.93 * 10) / 10 } : f
  )),
  beaverPath: KURUMEDEVA_LAYOUT_DEFAULT.beaverPath.map((p, i) => (
    i === 1 || i === 2
      ? { l: Math.round((p.l - 3) * 10) / 10, t: Math.round((p.t + 2) * 10) / 10 }
      : p
  )),
};

export const KURUMEDEVA_LAYOUT = isSmallPhone() ? KURUMEDEVA_LAYOUT_PHONE : KURUMEDEVA_LAYOUT_DEFAULT;
