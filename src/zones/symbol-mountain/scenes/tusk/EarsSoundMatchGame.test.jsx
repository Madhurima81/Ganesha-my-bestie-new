/** @jest-environment jsdom */
// Recorded-voice behaviour of the Ears game, driven with a fake Audio (no real sound):
// sidebar open mid-line, tab hide and return, success line interrupted then Continue,
// and what counts as a finished success line. Play Again's flag reset is covered by
// lib/config/SceneResetConfigs.symbolScene.test.js.
import React from 'react';
import { render, act } from '@testing-library/react';
import EarsSoundMatchGame from './EarsSoundMatchGame';

// Every line has a recording; playVoClip hands back a controllable fake clip.
jest.mock('../../../../lib/audio/voClip', () => ({
  getVoClipUrl: (text) => (text ? `/audio/${String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-')}.mp3` : null),
  playVoClip: (url, opts) => {
    const clip = {
      url,
      opts,
      ended: false,
      // Like the real one: stop() fires onEnd only when asked to (default true).
      stop: jest.fn((fireEnd = true) => {
        if (fireEnd && !clip.ended) { clip.ended = true; opts.onEnd?.(); }
      }),
    };
    global.__clips.push(clip);
    return clip;
  },
}));

const clips = () => global.__clips;
const startClip = (clip) => act(() => { clip.opts.onStart?.(); });
const endClip = (clip) => act(() => { clip.ended = true; clip.opts.onEnd?.(); });
const advance = (ms) => act(() => { jest.advanceTimersByTime(ms); });
const setHidden = (hidden) => {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  act(() => { document.dispatchEvent(new Event('visibilitychange')); });
};

beforeEach(() => {
  jest.useFakeTimers();
  global.__clips = [];
  global.Audio = function FakeAudio() {
    this.play = () => Promise.resolve();
    this.pause = () => {};
    this.load = () => {};
    this.addEventListener = () => {};
    this.removeEventListener = () => {};
  };
  window.speechSynthesis = { cancel: () => {}, speak: () => {}, getVoices: () => [], speaking: false, pending: false };
  global.SpeechSynthesisUtterance = function FakeUtterance() {};
  setHidden(false);
});

afterEach(() => {
  jest.useRealTimers();
  setHidden(false);
});

describe('Ears game with recorded voice', () => {
  test('plays the round prompt from its recording', () => {
    render(<EarsSoundMatchGame isActive isPaused={false} />);
    advance(1000);
    expect(clips()).toHaveLength(1);
    expect(clips()[0].url).toContain('elephant-is-thirsty-listen-for-water');
  });

  test('sidebar open mid-line: stops without advancing, replays only that line on close', () => {
    const { rerender } = render(<EarsSoundMatchGame isActive isPaused={false} />);
    advance(1000);
    const first = clips()[0];
    startClip(first);

    rerender(<EarsSoundMatchGame isActive isPaused />);
    expect(first.stop).toHaveBeenCalledWith(false);
    advance(6000);
    expect(clips()).toHaveLength(1); // the game holds behind the sidebar

    rerender(<EarsSoundMatchGame isActive isPaused={false} />);
    advance(3000);
    expect(clips()).toHaveLength(2);
    expect(clips()[1].url).toBe(first.url); // same line, from the start, once
  });

  test('tab hide then return: line stopped, then replayed once, nothing advances meanwhile', () => {
    render(<EarsSoundMatchGame isActive isPaused={false} />);
    advance(1000);
    const first = clips()[0];
    startClip(first);

    setHidden(true);
    expect(first.stop).toHaveBeenCalledWith(false);
    advance(6000);
    expect(clips()).toHaveLength(1);

    setHidden(false);
    advance(2500);
    expect(clips()).toHaveLength(2);
    expect(clips()[1].url).toBe(first.url);
  });

  test('leaving the game stops its recording', () => {
    const { unmount } = render(<EarsSoundMatchGame isActive isPaused={false} />);
    advance(1000);
    const first = clips()[0];
    startClip(first);
    unmount();
    expect(first.stop).toHaveBeenCalledWith(false);
  });

  describe('success line (Elephant found water.) replayed on Continue', () => {
    const renderContinue = (onSuccessDone) => render(
      <EarsSoundMatchGame isActive isPaused={false} initialRound={1} initialSuccessDone={0} onSuccessDone={onSuccessDone} />
    );

    test('interrupted by the sidebar, then the child leaves: not marked done; Continue plays it again', () => {
      const onSuccessDone = jest.fn();
      const view = renderContinue(onSuccessDone);
      advance(700);
      expect(clips()[0].url).toContain('elephant-found-water');
      startClip(clips()[0]);

      view.rerender(
        <EarsSoundMatchGame isActive isPaused initialRound={1} initialSuccessDone={0} onSuccessDone={onSuccessDone} />
      );
      expect(onSuccessDone).not.toHaveBeenCalled();
      view.unmount();
      expect(onSuccessDone).not.toHaveBeenCalled();

      // Continue: the saved marker is still 0, so the line is NOT skipped.
      renderContinue(onSuccessDone);
      advance(700);
      expect(clips()[clips().length - 1].url).toContain('elephant-found-water');
    });

    test('a recording that played to its end counts as done even when short (no 1.5 s rule)', () => {
      const onSuccessDone = jest.fn();
      renderContinue(onSuccessDone);
      advance(700);
      const clip = clips()[0];
      startClip(clip);
      advance(900); // shorter than SUCCESS_LINE_MIN_MS
      endClip(clip);
      expect(onSuccessDone).toHaveBeenCalledWith(1);
    });

    test('a recording that never started (blocked) is not marked done', () => {
      const onSuccessDone = jest.fn();
      renderContinue(onSuccessDone);
      advance(700);
      endClip(clips()[0]); // ended without ever starting
      expect(onSuccessDone).not.toHaveBeenCalled();
    });
  });
});
