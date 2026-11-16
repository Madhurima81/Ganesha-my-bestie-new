/** @jest-environment jsdom */
// Recorded-voice behaviour of the shared beat engine (Symbol Mountain's Tusk nest game), driven
// with a fake Audio: the story waits for the recording, a pause / tab hide stops it without
// advancing and replays it on resume, and a success ("after") line interrupted mid-way is never
// reported as done.
import React from 'react';
import { act, render } from '@testing-library/react';
import BeatPlayerGame from './BeatPlayerGame';

jest.mock('./BeatPlayerGame.css', () => ({}));

jest.mock('../audio/voClip', () => ({
  getVoClipUrl: (text) => (text && !/no recording/i.test(text) ? `/audio/${String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-')}.mp3` : null),
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

const BEFORE = 'Can the torn leaf help?';
const AFTER = 'You did it! All those little things helped rebuild the nest.';

// A story beat with no interaction: before (spoken) -> movement (silent) -> after (spoken) -> done.
const flow = {
  beats: {
    0: {
      before: { items: [], audio: { voText: BEFORE } },
      movement: { items: [], audio: { voText: '' } },
      after: { items: [], audio: { voText: AFTER } },
    },
  },
};

const clips = () => global.__clips;
// The engine awaits promises between states, so flush microtasks as time moves on.
const advance = async (ms) => {
  for (let left = ms; left > 0; left -= 100) {
    await act(async () => { jest.advanceTimersByTime(Math.min(100, left)); await Promise.resolve(); await Promise.resolve(); });
  }
};
const endClip = (clip) => act(async () => { clip.ended = true; clip.opts.onEnd?.(); await Promise.resolve(); await Promise.resolve(); });

const game = (props = {}) => (
  <BeatPlayerGame flowJson={flow} assetMap={{}} isActive isAudioOn isPaused={false} {...props} />
);

beforeEach(() => {
  jest.useFakeTimers();
  global.__clips = [];
  global.Audio = function FakeAudio() {
    this.play = () => Promise.resolve();
    this.pause = () => {};
  };
  window.speechSynthesis = { cancel: jest.fn(), speak: jest.fn(), getVoices: () => [], speaking: false, pending: false };
  global.SpeechSynthesisUtterance = function FakeUtterance() {};
});

afterEach(() => { jest.useRealTimers(); });

describe('BeatPlayerGame with recorded voice', () => {
  test('speaks the state line from its recording, never with the computer voice', async () => {
    render(game());
    await advance(100);
    expect(clips()).toHaveLength(1);
    expect(clips()[0].url).toContain('can-the-torn-leaf-help');
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
  });

  test('waits for the recording to end before moving on to the next state', async () => {
    render(game());
    await advance(100);
    await advance(5000); // a long wait: the story must not run on by itself
    expect(clips()).toHaveLength(1);
    await endClip(clips()[0]);
    await advance(2000); // autoAdvance + movement
    expect(clips()).toHaveLength(2);
    expect(clips()[1].url).toContain('you-did-it');
  });

  test('pause mid-line: stops the clip without advancing, replays the same line on resume', async () => {
    const { rerender } = render(game());
    await advance(100);
    const first = clips()[0];

    rerender(game({ isPaused: true }));
    expect(first.stop).toHaveBeenCalledWith(false);
    await advance(8000);
    expect(clips()).toHaveLength(1); // nothing advanced behind the sidebar

    rerender(game({ isPaused: false }));
    await advance(1000);
    expect(clips()).toHaveLength(2);
    expect(clips()[1].url).toBe(first.url); // that line again, from the start
  });

  test('success line cut off by a pause is not reported done; finishing it normally is', async () => {
    const onBeatSuccessDone = jest.fn();
    const { rerender } = render(game({ onBeatSuccessDone }));
    await advance(100);
    await endClip(clips()[0]);
    await advance(2000);
    const success = clips()[1];
    expect(success.url).toContain('you-did-it');

    rerender(game({ onBeatSuccessDone, isPaused: true }));
    expect(success.stop).toHaveBeenCalledWith(false);
    await advance(3000);
    expect(onBeatSuccessDone).not.toHaveBeenCalled();

    rerender(game({ onBeatSuccessDone, isPaused: false }));
    await advance(1000);
    const replay = clips()[clips().length - 1];
    expect(replay.url).toBe(success.url);
    await endClip(replay);
    expect(onBeatSuccessDone).toHaveBeenCalledWith(1);
  });

  test('leaving the game stops its recording', async () => {
    const { unmount } = render(game());
    await advance(100);
    const first = clips()[0];
    unmount();
    expect(first.stop).toHaveBeenCalledWith(false);
  });

  test('a line with no recording still uses the computer voice', async () => {
    const noClipFlow = { beats: { 0: { before: { items: [], audio: { voText: 'A line with no recording yet.' } } } } };
    render(game({ flowJson: noClipFlow }));
    await advance(100);
    expect(clips()).toHaveLength(0);
    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1);
  });
});
