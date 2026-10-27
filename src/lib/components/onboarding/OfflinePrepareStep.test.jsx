import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';

jest.mock('../../offline/env', () => ({ isProd: jest.fn(() => true) }));
jest.mock('../../offline/precacheLive', () => ({
  loadManifest: jest.fn(),
  isReadyFor: jest.fn(() => false),
  markReady: jest.fn(),
  downloadAll: jest.fn(),
  pruneObsolete: jest.fn(() => Promise.resolve(0)),
}));

// The shared button imports a stylesheet; the jest setup has no CSS mapper installed, so use a plain stand-in.
jest.mock('../shared/PrimaryBtn', () => {
  const mockReact = require('react');
  return { __esModule: true, default: ({ label, onClick }) => mockReact.createElement('button', { type: 'button', onClick }, label) };
});

import OfflinePrepareStep from './OfflinePrepareStep';
import { isProd } from '../../offline/env';
import { loadManifest, isReadyFor, markReady, downloadAll } from '../../offline/precacheLive';

const MANIFEST = { version: 'v1', files: [{ u: '/assets/a.js', s: 1 }] };
const flush = async () => { await act(async () => { await Promise.resolve(); await Promise.resolve(); }); };

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  isProd.mockReturnValue(true);
  isReadyFor.mockReturnValue(false);
  loadManifest.mockResolvedValue(MANIFEST);
  Object.defineProperty(window, 'caches', { value: {}, configurable: true });
  Object.defineProperty(navigator, 'serviceWorker', { value: {}, configurable: true });
  Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  Object.defineProperty(navigator, 'connection', { value: undefined, configurable: true });
});
afterEach(() => { jest.useRealTimers(); });

describe('OfflinePrepareStep', () => {
  test('moves straight on (shows nothing to wait for) in a dev build', async () => {
    isProd.mockReturnValue(false);
    const onFinish = jest.fn();
    render(<OfflinePrepareStep onFinish={onFinish} />);
    await flush();
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(downloadAll).not.toHaveBeenCalled();
  });

  test('moves straight on when offline or when data-saver is on', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    const offline = jest.fn();
    const first = render(<OfflinePrepareStep onFinish={offline} />);
    await flush();
    expect(offline).toHaveBeenCalledTimes(1);
    first.unmount();

    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true });
    const saver = jest.fn();
    render(<OfflinePrepareStep onFinish={saver} />);
    await flush();
    expect(saver).toHaveBeenCalledTimes(1);
    expect(downloadAll).not.toHaveBeenCalled();
  });

  test('moves straight on when this version is already downloaded', async () => {
    isReadyFor.mockReturnValue(true);
    const onFinish = jest.fn();
    render(<OfflinePrepareStep onFinish={onFinish} />);
    await flush();
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(downloadAll).not.toHaveBeenCalled();
  });

  test('shows progress, and Skip for now moves on and stops the download', async () => {
    let signal;
    downloadAll.mockImplementation(({ signal: s, onProgress }) => {
      signal = s;
      onProgress({ percent: 42 });
      return new Promise(() => {}); // a slow download that never finishes by itself
    });
    const onFinish = jest.fn();
    render(<OfflinePrepareStep onFinish={onFinish} />);
    await flush();
    expect(screen.getByText('Getting Ganesha ready')).toBeTruthy();
    expect(screen.getByText('42%')).toBeTruthy();
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('42');

    fireEvent.click(screen.getByText('Skip for now'));
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(signal.aborted).toBe(true);
    expect(markReady).not.toHaveBeenCalled();
  });

  test('a finished download says Ready!, remembers it and moves on by itself', async () => {
    downloadAll.mockResolvedValue({ total: 1, saved: 1, skipped: 0, failed: 0, aborted: false });
    const onFinish = jest.fn();
    render(<OfflinePrepareStep onFinish={onFinish} />);
    await flush();
    expect(screen.getByText('Ready!')).toBeTruthy();
    expect(markReady).toHaveBeenCalledWith(MANIFEST);
    expect(screen.queryByText('Skip for now')).toBeNull();
    expect(onFinish).not.toHaveBeenCalled();
    act(() => { jest.advanceTimersByTime(1500); });
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  test('a failed download offers Try again and Skip, and Try again downloads again', async () => {
    downloadAll
      .mockResolvedValueOnce({ total: 1, saved: 0, skipped: 0, failed: 1, aborted: false })
      .mockResolvedValueOnce({ total: 1, saved: 1, skipped: 0, failed: 0, aborted: false });
    const onFinish = jest.fn();
    render(<OfflinePrepareStep onFinish={onFinish} />);
    await flush();
    expect(screen.getByText(/could not finish/i)).toBeTruthy();
    expect(screen.getByText('Skip for now')).toBeTruthy();
    expect(markReady).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Try again'));
    await flush();
    expect(downloadAll).toHaveBeenCalledTimes(2);
    expect(screen.getByText('Ready!')).toBeTruthy();
    expect(markReady).toHaveBeenCalledTimes(1);
  });

  test('a list that cannot be loaded shows the failure state, not a blank screen', async () => {
    loadManifest.mockRejectedValue(new Error('404'));
    render(<OfflinePrepareStep onFinish={jest.fn()} />);
    await flush();
    expect(screen.getByText(/could not finish/i)).toBeTruthy();
    expect(screen.getByText('Skip for now')).toBeTruthy();
  });
});
