const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const source = fs.readFileSync('src/pages/CleanMapZone.jsx', 'utf8');
const defs = source.slice(source.indexOf('const ZONES_DATA'), source.indexOf('const ZONE_ART_TO_ZONE_ID'));
const rules = source.slice(source.indexOf('const getZoneDefinition'), source.indexOf('const playUnlockChime'));
const states = source.slice(source.indexOf('const getZoneState'), source.indexOf('const getMainMapGaneshaAsset'));
const context = { assert, DEBUG_UNLOCK_ALL_ZONES: false, ZONE_GANESHA_OVERLAY_IDS: {}, MAP_GANESHA_ZONE_POS: { 'symbol-mountain': {}, 'shloka-river': {}, 'about-me-hut': {} }, MAP_GANESHA_ALL_DONE_POS: {}, MAP_ZONE_ORDER: ['symbol-mountain', 'shloka-river', 'about-me-hut', 'festival-square'], localStorage: { getItem: () => null } };
vm.createContext(context);
vm.runInContext(defs + rules + states + `
const p = {
  'symbol-mountain': { completedScenes: 0, totalScenes: 4, hasStarted: false },
  'shloka-river': { completedScenes: 0, totalScenes: 5 },
  'about-me-hut': { completedScenes: 0, totalScenes: 4 },
  'festival-square': { completedScenes: 0, totalScenes: 4 }
};
assert.equal(getZoneState('symbol-mountain', p), 'active');
assert.equal(getZoneState('shloka-river', p), 'locked');
p['symbol-mountain'].hasStarted = true;
assert.equal(getZoneState('symbol-mountain', p), 'in-progress');
p['symbol-mountain'].completedScenes = 4;
assert.equal(getZoneState('shloka-river', p), 'active');
p['shloka-river'].completedScenes = 5;
assert.equal(getZoneState('about-me-hut', p), 'active');
p['about-me-hut'].completedScenes = 4;
assert.equal(getMapGaneshaState(p, {}).pose, 'celebration');
assert.equal(getZoneState('festival-square', p), 'coming-soon');
`, context);
console.log('Passed: first visit, scene start, River/Lodge unlocks, final celebration, future-zone exclusion.');
