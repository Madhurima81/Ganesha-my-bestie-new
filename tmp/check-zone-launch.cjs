const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const parser = require('@babel/parser');
const source = fs.readFileSync('src/lib/components/zone/ZoneWelcome.jsx', 'utf8');
parser.parse(source, { sourceType: 'module', plugins: ['jsx'] });
const code = source.slice(source.indexOf('const launchScene ='), source.indexOf('const handleReplayIntroStory ='));
const events = [];
const context = {
  zoneData: { id: 'shloka-river' }, sceneStatuses: {}, dlog: () => {},
  localStorage: { getItem: () => 'explorer', setItem: (...args) => events.push(['started', ...args]) },
  setActiveScene: (...args) => events.push(['active', ...args]),
  onSceneSelect: (...args) => events.push(['launch', ...args]),
};
vm.createContext(context);
vm.runInContext(code, context);
assert.equal(events.length, 0, 'Opening welcome must not write progress');
for (const [status, action, replay, expected] of [
  ['available', 'start', false, 'start'],
  ['in-progress', 'continue', false, 'continue'],
  ['completed', 'replay', false, 'replay'],
  ['available', 'default', false, 'start'],
  ['in-progress', 'default', false, 'continue'],
  ['completed', 'default', false, 'replay'],
  ['completed', 'default', true, 'continue'],
]) {
  events.length = 0;
  context.sceneStatuses.scene = { status, hasReplaySession: replay };
  vm.runInContext(`handleSceneClick({id: 'scene'}, '${action}')`, context);
  assert.equal(events.length, 3);
  assert.deepEqual(events[0], ['started', 'gmb_zone_started_explorer_shloka-river', 'true']);
  assert.equal(events[1][3], expected);
  assert.equal(events[2][2].mode, expected);
}
events.length = 0;
context.sceneStatuses.scene = { status: 'locked' };
vm.runInContext("handleSceneClick({id: 'scene'}, 'start')", context);
assert.equal(events.length, 0, 'Locked scenes must not write or launch');
context.sceneStatuses.scene = { status: 'available' };
context.localStorage.getItem = () => { throw Error('Storage blocked'); };
vm.runInContext("handleSceneClick({id: 'scene'}, 'start')", context);
assert.equal(events.at(-1)[0], 'launch', 'Storage errors must not block entry');
events.length = 0;
context.onSceneSelect = undefined;
vm.runInContext("handleSceneClick({id: 'scene'}, 'start')", context);
assert.equal(events.length, 0, 'No launch handler means no progression writes');
console.log('Passed: syntax, all launch modes, locked/browsing guards, storage failure, missing handler.');
