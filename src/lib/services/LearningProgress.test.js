import { getUnlockedLearnings, getLatestLearning } from './LearningProgress';

const live = (profile, scene, symbols, extra = {}) =>
  localStorage.setItem(
    `temp_session_${profile}_symbol-mountain_${scene}`,
    JSON.stringify({ discoveredSymbols: symbols, lastSaved: 1000, ...extra })
  );

beforeEach(() => localStorage.clear());

test('nothing played: nothing unlocked', () => {
  expect(getUnlockedLearnings('p1')).toEqual([]);
  expect(getLatestLearning('p1')).toBeNull();
});

test('a symbol found mid-scene counts before the scene is finished', () => {
  live('p1', 'modak', { mooshika: true });
  const ids = getUnlockedLearnings('p1').map((l) => l.learningId);
  expect(ids).toEqual(['mooshika']);
  expect(getLatestLearning('p1')).not.toBeNull();
});

test('scene keys map to catalog ids (belly -> bigBelly, ear -> ears); false and unknown keys are ignored', () => {
  live('p1', 'modak', { belly: true, modak: false, nonsense: true });
  live('p1', 'symbol', { ear: true });
  const ids = getUnlockedLearnings('p1').map((l) => l.learningId).sort();
  expect(ids).toEqual(['bigBelly', 'ears']);
});

test("another child's in-progress scenes do not count", () => {
  live('p2', 'modak', { mooshika: true });
  expect(getUnlockedLearnings('p1')).toEqual([]);
});

test('replay sessions do not count', () => {
  localStorage.setItem('replay_session_p1_symbol-mountain_modak', JSON.stringify({ discoveredSymbols: { mooshika: true } }));
  expect(getUnlockedLearnings('p1')).toEqual([]);
});

test('a finished scene and a live one together, no duplicates', () => {
  localStorage.setItem('p1_gameProgress', JSON.stringify({
    zones: { 'symbol-mountain': { scenes: { modak: { completed: true, completedAt: 500, symbols: { mooshika: true } } } } },
  }));
  live('p1', 'pond', { lotus: true });
  live('p1', 'modak', { mooshika: true });
  const ids = getUnlockedLearnings('p1').map((l) => l.learningId).sort();
  expect(ids).toEqual(['lotus', 'mooshika']);
});

test('garbage in storage is skipped', () => {
  localStorage.setItem('temp_session_p1_symbol-mountain_modak', '{not json');
  expect(getUnlockedLearnings('p1')).toEqual([]);
});

test('Shloka River words found mid-scene count (chantedVerses, like the mandala)', () => {
  localStorage.setItem('temp_session_p1_shloka-river_vakratunda-grove', JSON.stringify({
    chantedVerses: { 'vakratunda-chant': true, 'mahakaya-chant': true, 'suryakoti-chant': false },
    lastSaved: 2000,
  }));
  const ids = getUnlockedLearnings('p1').map((l) => l.learningId).sort();
  expect(ids).toEqual(['mahakaay', 'vakratunda']);
});

test("a temp session's `symbols` field counts too", () => {
  localStorage.setItem('temp_session_p1_symbol-mountain_modak', JSON.stringify({ symbols: { modak: true }, lastSaved: 1 }));
  expect(getUnlockedLearnings('p1').map((l) => l.learningId)).toEqual(['modak']);
});

test('once unlocked it stays: wiping the scene live state (Play Again) does not take it away', () => {
  live('p1', 'modak', { mooshika: true });
  expect(getUnlockedLearnings('p1').map((l) => l.learningId)).toEqual(['mooshika']);
  localStorage.removeItem('temp_session_p1_symbol-mountain_modak');
  expect(getUnlockedLearnings('p1').map((l) => l.learningId)).toEqual(['mooshika']);
});

test("remembered learnings belong to one child and clear with that child's key", () => {
  live('p1', 'modak', { mooshika: true });
  getUnlockedLearnings('p1');
  expect(getUnlockedLearnings('p2')).toEqual([]);
  localStorage.removeItem('p1_learningsUnlocked');
  localStorage.removeItem('temp_session_p1_symbol-mountain_modak');
  expect(getUnlockedLearnings('p1')).toEqual([]);
});
