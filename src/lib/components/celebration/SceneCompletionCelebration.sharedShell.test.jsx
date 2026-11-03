import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import SceneCompletionCelebration from './SceneCompletionCelebration';

jest.mock('../../audio/sfx', () => ({ sfx: { play: jest.fn() } }));
jest.mock('../animation/PoseImage', () => ({ preparePose: () => Promise.resolve(), usePreloadPoses: () => {} }));
jest.mock('../audio/SanskritVoiceRecorder', () => () => null);
jest.mock('../../theme/CompletionScreenThemeAdapter', () => ({ applyCompletionScreenTheme: jest.fn() }));
jest.mock('../../theme/RecorderThemeAdapter', () => ({ applyRecorderTheme: jest.fn() }));

const base = (over = {}) => ({
  show: true,
  sharedShell: true,
  zoneId: 'symbol-mountain',
  sceneId: 'modak',
  completionTitle: 'Mooshika Made It!',
  completionSubtitle: 'Small steps brought him to Ganesha.',
  discoveredSymbols: ['mooshika', 'modak', 'belly'],
  symbolImages: { mooshika: '/m.webp', modak: '/mo.webp', belly: '/b.webp' },
  symbolData: { modak: { title: 'Modak', description: 'Ganesha loves modak.' } },
  nextSceneName: 'Find a Way to the Lotus',
  completionData: { stars: 3, symbols: { mooshika: true } },
  onComplete: jest.fn(), onContinue: jest.fn(), onReplay: jest.fn(), onExploreZones: jest.fn(),
  ...over,
});

beforeEach(() => { jest.useFakeTimers(); localStorage.clear(); localStorage.setItem('activeProfileId', 'p1'); });
afterEach(() => jest.useRealTimers());

const open = async (props) => {
  const view = render(<SceneCompletionCelebration {...props} />);
  // trophies pop in one by one (timer, then a promise): step the clock and flush promises
  for (let i = 0; i < 8; i += 1) {
    await act(async () => { jest.advanceTimersByTime(500); await Promise.resolve(); });
  }
  return view;
};

test('uses the opening card: title, subtitle, trophies, one button, two quiet links', async () => {
  const { container } = await open(base());
  expect(container.querySelector('.game-modal-card')).not.toBeNull();
  expect(container.querySelector('.celebration-card')).toBeNull();
  expect(screen.getByText('Mooshika Made It!')).toBeTruthy();
  expect(screen.getByText('Small steps brought him to Ganesha.')).toBeTruthy();
  expect(container.querySelectorAll('.game-modal-icon-item').length).toBe(3);
  expect(screen.getByText('Next Adventure')).toBeTruthy();
  expect(screen.getByText('Find a Way to the Lotus')).toBeTruthy();
  expect(screen.getByText('Home')).toBeTruthy();
  expect(screen.getByText('Play Again')).toBeTruthy();
});

test('without the flag the classic card is unchanged', async () => {
  const { container } = await open(base({ sharedShell: false }));
  expect(container.querySelector('.celebration-card')).not.toBeNull();
  expect(container.querySelector('.game-modal-card')).toBeNull();
});

test('Play Again calls onReplay and does NOT mark the scene complete', async () => {
  const p = base(); await open(p);
  fireEvent.click(screen.getByText('Play Again'));
  expect(p.onReplay).toHaveBeenCalledTimes(1);
  expect(p.onComplete).not.toHaveBeenCalled();
});

test('Home marks the scene complete and goes to the map/zones', async () => {
  const p = base(); await open(p);
  fireEvent.click(screen.getByText('Home'));
  expect(p.onComplete).toHaveBeenCalledWith('modak', p.completionData);
  expect(p.onExploreZones).toHaveBeenCalledTimes(1);
});

test('Next Adventure: exit animation, then complete + continue exactly once (double tap ignored)', async () => {
  const p = base(); const { container } = await open(p);
  fireEvent.click(screen.getByText('Next Adventure'));
  fireEvent.click(screen.getByText('Next Adventure'));
  expect(container.querySelector('.celebration-backdrop.exiting')).not.toBeNull();
  act(() => { jest.advanceTimersByTime(800); });
  expect(p.onComplete).toHaveBeenCalledTimes(1);
  expect(p.onContinue).toHaveBeenCalledTimes(1);
});

test('tapping a trophy with info opens its popup; "Got it!" closes it; trophies without info do nothing', async () => {
  await open(base());
  fireEvent.click(screen.getByText('Mooshika')); // no info
  expect(screen.queryByText('Ganesha loves modak.')).toBeNull();
  fireEvent.click(screen.getByText('Modak'));
  expect(screen.getByText('Ganesha loves modak.')).toBeTruthy();
  fireEvent.click(screen.getByText('Got it!'));
  expect(screen.queryByText('Ganesha loves modak.')).toBeNull();
});

test('a final scene shows Home as the main button and no next-scene line', async () => {
  const p = base({ isFinalScene: true, nextSceneName: 'Whatever' }); await open(p);
  expect(screen.queryByText('Whatever')).toBeNull();
  expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(2); // main button + quiet link
});
