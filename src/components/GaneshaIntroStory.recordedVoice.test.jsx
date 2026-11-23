/** @jest-environment jsdom */
// Recorded-voice behaviour of the Ganesha intro story: the opening line and each page play their recording,
// the story turns the page after a recording ends, and leaving stops it. (The older GaneshaIntroStory.test.jsx
// covers the visuals; this file only covers the voice.)
import React from 'react';
import { render, act } from '@testing-library/react';
import GaneshaIntroStory from './GaneshaIntroStory';

jest.mock('./GaneshaIntroStory.css', () => ({}), { virtual: true });
jest.mock('../lib/components/feedback/VOReplayButton', () => () => null);
jest.mock('../lib/components/navigation/WelcomeLayers', () => () => null);

jest.mock('../lib/audio/voClip', () => ({
  getVoClipUrl: (text) => (global.__introHasClips && text ? `/audio/${String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-')}.mp3` : null),
  playVoClip: (url, opts = {}) => {
    const clip = { url, opts, stop: jest.fn((fire = true) => { if (fire) opts.onEnd?.(); }) };
    global.__introClips.push(clip);
    return clip;
  },
}));

const advance = (ms) => act(() => { jest.advanceTimersByTime(ms); });

beforeEach(() => {
  jest.useFakeTimers();
  global.__introHasClips = true;
  global.__introClips = [];
  localStorage.setItem('ganesha_audio_enabled', 'true');
  window.speechSynthesis = { cancel: jest.fn(), speak: jest.fn(), resume: jest.fn(), getVoices: () => [] };
  global.SpeechSynthesisUtterance = function FakeUtterance(t) { this.text = t; };
  window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
});
afterEach(() => { jest.useRealTimers(); });

const startStory = () => {
  const onComplete = jest.fn();
  const view = render(<GaneshaIntroStory profileId="p1" onComplete={onComplete} />);
  advance(500);                       // opening greeting over the sunray video
  return { onComplete, ...view };
};

test('the opening greeting plays from its recording', () => {
  startStory();
  expect(global.__introClips).toHaveLength(1);
  expect(global.__introClips[0].url).toContain('hi-i-m-ganesha');
  expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
});

test('page 1 plays its recording once the opening video ends, and the story turns the page after it', () => {
  startStory();
  advance(15500);                     // the safety cap ends the (unplayable in jsdom) video
  advance(400);                       // page 1 starts a moment later
  const page1 = global.__introClips.find((c) => c.url.includes('my-mom-parvati'));
  expect(page1).toBeDefined();
  act(() => { page1.opts.onEnd(); });
  advance(3000);                      // AUTO_ADVANCE_PAUSE_MS
  advance(400);                       // the next page starts a moment later
  expect(global.__introClips.some((c) => c.url.includes('one-day-mom-asked-me'))).toBe(true);
});

test('leaving the story stops the recording and does not turn the page', () => {
  const { unmount } = startStory();
  advance(15500);
  advance(400);
  const page1 = global.__introClips.find((c) => c.url.includes('my-mom-parvati'));
  unmount();
  expect(page1.stop).toHaveBeenCalledWith(false);
  advance(8000);
  expect(global.__introClips.some((c) => c.url.includes('one-day-mom-asked-me'))).toBe(false);
});

test('with no recordings the computer voice still speaks the page', () => {
  global.__introHasClips = false;
  startStory();
  advance(15500);
  advance(400);
  expect(global.__introClips).toHaveLength(0);
  expect(window.speechSynthesis.speak).toHaveBeenCalled();
});
