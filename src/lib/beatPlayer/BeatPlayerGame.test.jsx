import React from 'react';
import { act, render } from '@testing-library/react';
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

test('retains loose rope through the help beat and enables handles only for tying', () => {
  const renderBeat = (beat, state = 'before', layoutDebug = false) => (
    <BeatPlayerGame
      flowJson={{ beats: { 0: { ...beat, before: beat[state] }, 4: flow.beats[4] } }}
      assetMap={assets}
      isPaused
      isAudioOn={false}
      layoutDebug={layoutDebug}
    />
  );
  const { container, rerender } = render(renderBeat(flow.beats[4], 'after'));
  const curves = () => [...container.querySelectorAll('[data-beat-rope] path')]
    .map((path) => path.getAttribute('d'));
  const looseCurves = curves();
  expect(looseCurves).toHaveLength(4);

  for (const state of ['before', 'movement', 'after']) {
    rerender(renderBeat(flow.beats[5], state));
    expect(curves()).toEqual(looseCurves);
    expect(container.querySelectorAll('[data-beat-rope] ellipse')).toHaveLength(0);
    expect(container.querySelector('[data-beat-rope]').style.pointerEvents).toBe('none');
  }
  rerender(renderBeat(flow.beats[5], 'before', true));
  expect(container.querySelectorAll('[data-beat-rope] ellipse, [data-beat-rope] circle'))
    .toHaveLength(0);

  rerender(renderBeat(flow.beats[6]));
  expect(curves()).toHaveLength(4);
  expect(container.querySelectorAll('[data-beat-rope] ellipse')).toHaveLength(2);

  rerender(renderBeat(flow.beats[7]));
  expect(container.querySelector('[data-beat-rope]')).toBeNull();
});


test.each(['bunnySprite', 'bowlItem'])('keeps %s visible until replacement artwork is decoded', async (gameKey) => {
  const NativeImage = global.Image;
  const requests = [];
  global.Image = class {
    constructor() { requests.push(this); }
    decode = () => Promise.resolve();
  };
  const assetMap = { before: gameKey + '-before.png', after: gameKey + '-after.png' };
  const view = (path) => <BeatPlayerGame
    flowJson={{ beats: { 0: { before: { items: [{ gameKey, path, name: gameKey, x: 50, y: 50, w: 20, scale: 100 }] } } } }}
    assetMap={assetMap} isPaused isAudioOn={false}
  />;
  let unmount;
  try {
    const rendered = render(view('before'));
    unmount = rendered.unmount;
    const button = rendered.container.querySelector('[data-beat-key]');
    const original = button.querySelector('img');
    rendered.rerender(view('after'));
    expect(button.querySelector('img')).toBe(original);
    expect(original.getAttribute('src')).toBe(assetMap.before);
    await act(async () => { await requests.find(image => image.src === assetMap.after).onload(); });
    expect(rendered.container.querySelector('[data-beat-key]')).toBe(button);
    expect([...button.querySelectorAll('img')].map(image => image.getAttribute('src'))).toEqual([assetMap.after, assetMap.before]);
  } finally {
    unmount?.();
    global.Image = NativeImage;
  }
});
