import React from 'react';
import { act, render } from '@testing-library/react';
import PoseImage from './PoseImage';

const requests = [];
const NativeImage = global.Image;
beforeEach(() => {
  jest.useFakeTimers();
  requests.length = 0;
  global.Image = class {
    constructor() { requests.push(this); }
    decode = jest.fn(() => Promise.resolve());
  };
});
afterEach(() => { global.Image = NativeImage; jest.useRealTimers(); });
const loaded = async (request) => { await act(async () => { await request.onload(); }); };

test('keeps the current pose until the next has loaded and decoded, then overlaps them', async () => {
  const { container, rerender } = render(<PoseImage src="idle-a" alt="Bunny" />);
  const originalImage = container.querySelector("img");
  rerender(<PoseImage src="happy-a" alt="Bunny" />);
  expect(container.querySelector('img').getAttribute('src')).toBe('idle-a');
  let decode;
  requests[0].decode.mockImplementation(() => new Promise(resolve => { decode = resolve; }));
  await act(async () => { requests[0].onload(); });
  expect(container.querySelector('img').getAttribute('src')).toBe('idle-a');
  await act(async () => { decode(); });
  expect([...container.querySelectorAll('img')].map(img => img.getAttribute('src'))).toEqual(['happy-a','idle-a']);
  expect(container.querySelector('.pose-image-previous')).toBe(originalImage);
  act(() => { jest.advanceTimersByTime(300); });
  expect(container.querySelectorAll('img')).toHaveLength(1);
  expect(container.querySelector('img').alt).toBe('Bunny');
});

test('ignores obsolete loads when another pose is requested', async () => {
  const { container, rerender } = render(<PoseImage src="idle-b" />);
  rerender(<PoseImage src="eating-b" />);
  rerender(<PoseImage src="happy-b" />);
  await loaded(requests[1]);
  await loaded(requests[0]);
  expect(container.querySelector('img').getAttribute('src')).toBe('happy-b');
});

test('preserves the visible pose when loading fails', async () => {
  const { container, rerender } = render(<PoseImage src="idle-c" />);
  rerender(<PoseImage src="missing-c" />);
  await act(async () => { requests[0].onerror(new Error('Missing image')); });
  expect(container.querySelector('img').getAttribute('src')).toBe('idle-c');
});
