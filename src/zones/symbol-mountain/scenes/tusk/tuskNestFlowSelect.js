import defaultFlow from './tuskNestFlow.json';
import phoneFlow from './tuskNestFlowPhone.json';

// Phone = short side <= 500 and long side <= 1023 (same rule as
// KURUMEDEVA_LAYOUT): orientation-independent so a phone that loads in portrait
// still gets it, and every iPad short side is >= 744. Chosen once at mount.
export const isPhoneViewport = () => {
  if (typeof window === 'undefined') return false;
  const w = window.innerWidth;
  const h = window.innerHeight;
  return Math.min(w, h) <= 500 && Math.max(w, h) <= 1023;
};

// iPad/desktop -> tuskNestFlow.json, phone -> tuskNestFlowPhone.json. Same
// beats/story/VO in both; only the item layout (x, y, scale, drop targets) differs.
export const getTuskNestFlow = () => (isPhoneViewport() ? phoneFlow : defaultFlow);
