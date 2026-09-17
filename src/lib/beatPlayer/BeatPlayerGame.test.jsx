import React from 'react';
import { render } from '@testing-library/react';
import BeatPlayerGame from './BeatPlayerGame';
import flow from '../../dev/beatPlayerPreview/kurumedeva/kurumedevaFlowSample.json';

jest.mock('./BeatPlayerGame.css', () => ({}));

const assets = Object.fromEntries(Object.values(flow.beats).flatMap((beat) =>
  ['before', 'movement', 'after'].flatMap((state) =>
    (beat[state]?.items || []).map((item) => [item.path, item.path]))));

function scene(items) {
  return <BeatPlayerGame
    flowJson={{ beats: { 0: { before: { items } } } }}
    assetMap={assets}
    isPaused
    isAudioOn={false}
  />;
}

test('keeps the unkeyed log mounted when the Kurumedeva help bubble leaves', () => {
  const { container, rerender } = render(scene(flow.beats[5].before.items));
  const log = container.querySelector('img[src="Bridge/logs-bare.png"]');
  expect(log).not.toBeNull();
  rerender(scene(flow.beats[5].movement.items));
  expect(container.querySelector('img[src="Bridge/logs-bare.png"]')).toBe(log);
});

test('keeps keyed actors and duplicate unkeyed scenery mounted after reordering', () => {
  const items = flow.beats[2].before.items;
  const decorative = items.find((item) => !item.gameKey && item.path.includes('support-log'));
  const initial = [...items, { ...decorative, x: 80 }];
  const { container, rerender } = render(scene(initial));
  const originalNodes = [...container.querySelectorAll('img')];
  rerender(scene([initial[1], initial[0], ...initial.slice(2)]));
  const currentNodes = [...container.querySelectorAll('img')];
  expect(currentNodes).toHaveLength(originalNodes.length);
  originalNodes.forEach((node) => expect(currentNodes).toContain(node));
});
