import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import GaneshaIntroStory from './GaneshaIntroStory';

jest.mock('../lib/config/ganeshaUsageSystem', () => ({
  GANESHA_USAGE_SYSTEM: { startJourney: { asset: '/x.webp' } },
}));

let spoken;
beforeEach(() => {
  jest.useFakeTimers();
  spoken = [];
  window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
  window.SpeechSynthesisUtterance = function (text) { this.text = text; };
  window.speechSynthesis = {
    speak: jest.fn((u) => { if (u.text) spoken.push(u); }),
    cancel: jest.fn(),
    resume: jest.fn(),
    getVoices: () => [],
  };
  localStorage.clear();
});
afterEach(() => jest.useRealTimers());

const activeDot = (container) =>
  Array.from(container.querySelectorAll('.gis-dot')).findIndex((d) => d.classList.contains('active'));

function startStory() {
  const view = render(<GaneshaIntroStory profileId="p1" onComplete={jest.fn()} />);
  fireEvent.click(screen.getByText('Skip'));            // skip the opening video
  fireEvent.click(screen.getByText('Tap to begin'));
  act(() => { jest.advanceTimersByTime(200); });         // first voice line starts
  return view;
}

test('turns the page after the voice finishes plus a short pause', () => {
  const { container } = startStory();
  expect(activeDot(container)).toBe(0);
  act(() => { spoken[0].onend(); });
  act(() => { jest.advanceTimersByTime(2400); });
  expect(activeDot(container)).toBe(0);                  // still pausing
  act(() => { jest.advanceTimersByTime(200); });
  expect(activeDot(container)).toBe(1);
});

test('a cancelled voice line never turns the page', () => {
  const { container } = startStory();
  act(() => { spoken[0].onerror({ error: 'canceled' }); });
  act(() => { spoken[0].onerror({ error: 'interrupted' }); });
  act(() => { jest.advanceTimersByTime(3000); });
  expect(activeDot(container)).toBe(0);
});

test('tapping Next stops the old line from also advancing (no double skip)', () => {
  const { container } = startStory();
  fireEvent.click(screen.getByLabelText('Next page'));
  act(() => { jest.advanceTimersByTime(200); });
  act(() => { spoken[0].onend(); });                     // stale line from page 1 finishes late
  act(() => { jest.advanceTimersByTime(2000); });
  expect(activeDot(container)).toBe(1);                  // still page 2, not 3
});

test('muted / no voice: page turns after the read-time fallback', () => {
  localStorage.setItem('ganesha_audio_enabled', 'false');
  const { container } = startStory();
  act(() => { jest.advanceTimersByTime(5000); });
  expect(activeDot(container)).toBe(0);
  act(() => { jest.advanceTimersByTime(1000); });
  act(() => { jest.advanceTimersByTime(2500); });
  expect(activeDot(container)).toBe(1);
});

test('voice that never reports its end: watchdog still turns the page', () => {
  const { container } = startStory();
  act(() => { jest.advanceTimersByTime(8000 + 45 * 90 + 2600); });
  expect(activeDot(container)).toBe(1);
});

test('replaying by hand keeps the child on that page', () => {
  const { container } = startStory();
  fireEvent.click(screen.getByLabelText('Hear this page again'));
  act(() => { jest.advanceTimersByTime(30000); });
  expect(activeDot(container)).toBe(0);
});

test('last story page leads to the end screen, which never auto-finishes', () => {
  const onComplete = jest.fn();
  const { container } = render(<GaneshaIntroStory profileId="p1" onComplete={onComplete} />);
  fireEvent.click(screen.getByText('Skip'));
  fireEvent.click(screen.getByText('Tap to begin'));
  for (let i = 0; i < 5; i += 1) {
    act(() => { jest.advanceTimersByTime(200); });
    act(() => { spoken[spoken.length - 1].onend(); });
    act(() => { jest.advanceTimersByTime(2600); });
  }
  expect(screen.getByText("Let's go")).toBeTruthy();
  act(() => { jest.advanceTimersByTime(60000); });
  expect(onComplete).not.toHaveBeenCalled();
  expect(container.querySelector('.storyEnd')).not.toBeNull();
});
