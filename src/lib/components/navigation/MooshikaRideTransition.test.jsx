/** @jest-environment jsdom */
// The Mooshika ride speaks one recorded line ("Hold on tight! Let's go!") when it exists and falls back to the
// old computer-voice line (with the child's name) when it does not.
import React from 'react';
import { render, act } from '@testing-library/react';
import MooshikaRideTransition from './MooshikaRideTransition';

let mockHasClip = true;
jest.mock('../../audio/voClip', () => ({
  getVoClipUrl: (text) => (global.__rideHasClip && /hold on tight! let's go!/i.test(text) ? '/audio/app-ride-01.mp3' : null),
  playVoClip: (url, opts) => {
    const clip = {
      url,
      opts,
      stop: jest.fn((fire = true) => { if (fire) opts.onEnd?.(); }),
    };
    global.__rideClips.push(clip);
    return clip;
  },
}));

const advance = (ms) => act(() => { jest.advanceTimersByTime(ms); });

beforeEach(() => {
  jest.useFakeTimers();
  mockHasClip = true;
  global.__rideHasClip = true;
  global.__rideClips = [];
  localStorage.setItem('ganesha_audio_enabled', 'true');
  window.speechSynthesis = { cancel: jest.fn(), speak: jest.fn() };
  global.SpeechSynthesisUtterance = function FakeUtterance(text) { this.text = text; };
  window.AudioContext = undefined;
});
afterEach(() => { jest.useRealTimers(); });

test('plays the recorded line (no child name) and finishes shortly after it ends', () => {
  const onComplete = jest.fn();
  render(<MooshikaRideTransition avatarId="owl" profileName="Asha" onComplete={onComplete} />);
  advance(600);
  expect(global.__rideClips).toHaveLength(1);
  expect(global.__rideClips[0].url).toBe('/audio/app-ride-01.mp3');
  expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
  expect(onComplete).not.toHaveBeenCalled();
  act(() => { global.__rideClips[0].opts.onEnd(); });
  advance(300);
  expect(onComplete).toHaveBeenCalledTimes(1);
});

test('with no recording it still speaks the old line with the name', () => {
  global.__rideHasClip = false;
  render(<MooshikaRideTransition avatarId="owl" profileName="Asha" onComplete={jest.fn()} />);
  advance(600);
  expect(global.__rideClips).toHaveLength(0);
  expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1);
  expect(window.speechSynthesis.speak.mock.calls[0][0].text).toContain('Asha');
});

test('leaving the ride early stops the recording without finishing the transition', () => {
  const onComplete = jest.fn();
  const { unmount } = render(<MooshikaRideTransition avatarId="owl" profileName="Asha" onComplete={onComplete} />);
  advance(600);
  const clip = global.__rideClips[0];
  unmount();
  expect(clip.stop).toHaveBeenCalledWith(false);
  advance(6000);
  expect(onComplete).not.toHaveBeenCalled();
});

test('muted: no recording and no speech, and the ride still ends on time', () => {
  localStorage.setItem('ganesha_audio_enabled', 'false');
  const onComplete = jest.fn();
  render(<MooshikaRideTransition avatarId="owl" profileName="Asha" onComplete={onComplete} />);
  advance(4000);
  expect(global.__rideClips).toHaveLength(0);
  expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
  expect(onComplete).toHaveBeenCalledTimes(1);
});
