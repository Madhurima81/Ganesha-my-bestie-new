import { isSuccessLineDone } from './successLine';

describe('isSuccessLineDone', () => {
  test('recording that started and ended normally counts, however short (no 1.5 s rule)', () => {
    expect(isSuccessLineDone({ finished: true, recorded: true, played: true, elapsedMs: 900 }, 1500))
      .toEqual({ done: true, path: 'recording' });
  });

  test('recording that never started (blocked / failed to load) does not count', () => {
    expect(isSuccessLineDone({ finished: true, recorded: true, played: false, elapsedMs: 0 }, 1500))
      .toEqual({ done: false, path: 'recording' });
  });

  test('a cut-off recording (finished false) never counts', () => {
    expect(isSuccessLineDone({ finished: false, recorded: true, played: true, elapsedMs: 4000 }, 1500).done).toBe(false);
  });

  test('computer voice keeps the elapsed-time rule', () => {
    expect(isSuccessLineDone({ finished: true, elapsedMs: 1499 }, 1500)).toEqual({ done: false, path: 'tts' });
    expect(isSuccessLineDone({ finished: true, elapsedMs: 1500 }, 1500)).toEqual({ done: true, path: 'tts' });
    expect(isSuccessLineDone({ finished: false, elapsedMs: 9000 }, 1500).done).toBe(false);
  });

  test('missing result never counts', () => {
    expect(isSuccessLineDone(undefined, 1500).done).toBe(false);
    expect(isSuccessLineDone(null, 1500).done).toBe(false);
  });
});
