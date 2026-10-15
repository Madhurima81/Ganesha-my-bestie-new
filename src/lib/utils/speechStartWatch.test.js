import { createSpeechStartWatcher } from './speechStartWatch';

class FakeUtterance {
  constructor(text) {
    this.text = text;
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
  }
}

const makeSpeechSynthesis = () => {
  const synth = {
    spoken: [],
    canceled: 0,
    speak(utterance) {
      this.spoken.push(utterance);
      this.current = utterance;
    },
    cancel() {
      this.canceled += 1;
      this.current?.onerror?.({ error: 'canceled' });
      this.current = null;
    },
    resume() {},
  };
  return synth;
};

describe('createSpeechStartWatcher', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('normal line speaks once', () => {
    const synth = makeSpeechSynthesis();
    const watcher = createSpeechStartWatcher({ speechSynthesis: synth, watchMs: 1400, retryDelayMs: 150 });
    let endCount = 0;

    watcher.speak({
      buildUtterance: () => {
        const u = new FakeUtterance('hello');
        u.onend = () => { endCount += 1; };
        return u;
      },
    });

    expect(synth.spoken).toHaveLength(1);
    synth.spoken[0].onstart();
    jest.advanceTimersByTime(1400);
    synth.spoken[0].onend();
    expect(synth.spoken).toHaveLength(1);
    expect(endCount).toBe(1);
  });

  test('stuck line is retried once and ends once', () => {
    const synth = makeSpeechSynthesis();
    const watcher = createSpeechStartWatcher({ speechSynthesis: synth, watchMs: 1400, retryDelayMs: 150 });
    let endCount = 0;

    watcher.speak({
      buildUtterance: () => {
        const u = new FakeUtterance('hello');
        u.onend = () => { endCount += 1; };
        return u;
      },
    });

    jest.advanceTimersByTime(1400);
    expect(synth.canceled).toBe(1);
    jest.advanceTimersByTime(150);
    expect(synth.spoken).toHaveLength(2);
    synth.spoken[1].onstart();
    synth.spoken[1].onend();
    expect(endCount).toBe(1);
  });

  test('stuck forever stops after one retry', () => {
    const synth = makeSpeechSynthesis();
    const watcher = createSpeechStartWatcher({ speechSynthesis: synth, watchMs: 1400, retryDelayMs: 150 });

    watcher.speak({
      buildUtterance: () => new FakeUtterance('hello'),
    });

    jest.advanceTimersByTime(1400);
    jest.advanceTimersByTime(150);
    expect(synth.spoken).toHaveLength(2);
    jest.advanceTimersByTime(1400);
    jest.advanceTimersByTime(1000);
    expect(synth.spoken).toHaveLength(2);
  });

  test('stop prevents a pending retry', () => {
    const synth = makeSpeechSynthesis();
    const watcher = createSpeechStartWatcher({ speechSynthesis: synth, watchMs: 1400, retryDelayMs: 150 });

    watcher.speak({
      buildUtterance: () => new FakeUtterance('hello'),
    });
    watcher.cancelPending();
    jest.advanceTimersByTime(2000);

    expect(synth.spoken).toHaveLength(1);
  });

  test('unmount mid-line invalidates the line and its pending retry', () => {
    const synth = makeSpeechSynthesis();
    const watcher = createSpeechStartWatcher({ speechSynthesis: synth, watchMs: 1400, retryDelayMs: 150 });
    let endCount = 0;

    watcher.speak({
      buildUtterance: () => {
        const u = new FakeUtterance('leaving');
        u.onend = () => { endCount += 1; };
        return u;
      },
    });
    watcher.cancelPending();
    jest.advanceTimersByTime(2000);

    expect(synth.spoken).toHaveLength(1);
    expect(endCount).toBe(0);
  });

  test('replace prevents an older pending retry', () => {
    const synth = makeSpeechSynthesis();
    const watcher = createSpeechStartWatcher({ speechSynthesis: synth, watchMs: 1400, retryDelayMs: 150 });

    watcher.speak({
      buildUtterance: () => new FakeUtterance('first'),
    });
    watcher.speak({
      buildUtterance: () => new FakeUtterance('second'),
    });
    synth.spoken[1].onstart();
    jest.advanceTimersByTime(2000);

    expect(synth.spoken.map((u) => u.text)).toEqual(['first', 'second']);
  });
});
