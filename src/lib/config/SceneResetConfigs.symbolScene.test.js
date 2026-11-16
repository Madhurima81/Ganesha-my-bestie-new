import { SCENE_RESET_CONFIGS } from './SceneResetConfigs';

// Scene 3 (Eyes / Ears / Tusk): Play Again must clear every flag the scene and its games read
// (KNOWN_PITFALLS 11d), or the recorded success lines are skipped on the second play.
describe("Play Again resets scene 3's saved flags", () => {
  const resets = SCENE_RESET_CONFIGS.symbol.specificResets;

  test.each([
    ['eyesSuccessDone', []],
    ['eyesDone', []],
    ['earsRoundsDone', 0],
    ['earsSuccessDone', 0],
    ['nestBeatsDone', 0],
    ['nestSuccessDone', 0],
    ['completedGames', []],
  ])('%s is cleared', (key, empty) => {
    expect(resets).toHaveProperty(key);
    expect(resets[key]).toEqual(empty);
  });

  test('restarts on the Eyes game', () => {
    expect(resets.phase).toBe('eyes_game');
    expect(resets.activeGame).toBe('eyes');
  });
});
