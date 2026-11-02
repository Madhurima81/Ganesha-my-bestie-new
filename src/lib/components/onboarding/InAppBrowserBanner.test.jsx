import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import InAppBrowserBanner from './InAppBrowserBanner';

const UA = {
  googleAppIpad: 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 GSA/320.0.640192823 Safari/604.1',
  safariIpad: 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  instagramAndroid: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36 Instagram 300.0.0.0',
  chromeDesktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
};
const setUA = (ua) => Object.defineProperty(window.navigator, 'userAgent', { value: ua, configurable: true });

beforeEach(() => { localStorage.clear(); window.matchMedia = jest.fn(() => ({ matches: false })); });

test('shows inside the Google app on an iPad, naming Safari', () => {
  setUA(UA.googleAppIpad);
  render(<InAppBrowserBanner />);
  expect(screen.getByText(/Open in Safari for the best experience/)).toBeTruthy();
});

test('shows inside Instagram on Android, naming Chrome', () => {
  setUA(UA.instagramAndroid);
  render(<InAppBrowserBanner />);
  expect(screen.getByText(/Open in Chrome for the best experience/)).toBeTruthy();
});

test('never shows in real Safari or on a desktop browser', () => {
  setUA(UA.safariIpad);
  const a = render(<InAppBrowserBanner />);
  expect(a.container.firstChild).toBeNull();
  setUA(UA.chromeDesktop);
  const b = render(<InAppBrowserBanner />);
  expect(b.container.firstChild).toBeNull();
});

test('never shows in the installed Home Screen app', () => {
  setUA(UA.googleAppIpad);
  window.matchMedia = jest.fn(() => ({ matches: true }));
  const { container } = render(<InAppBrowserBanner />);
  expect(container.firstChild).toBeNull();
});

test('"Got it" hides it and it stays hidden next time', () => {
  setUA(UA.googleAppIpad);
  const first = render(<InAppBrowserBanner />);
  fireEvent.click(screen.getByText('Got it'));
  expect(first.container.firstChild).toBeNull();
  first.unmount();
  const second = render(<InAppBrowserBanner />);
  expect(second.container.firstChild).toBeNull();
});

test('"Copy link" copies the page address', async () => {
  setUA(UA.googleAppIpad);
  const writeText = jest.fn(() => Promise.resolve());
  Object.assign(navigator, { clipboard: { writeText } });
  render(<InAppBrowserBanner />);
  await act(async () => { fireEvent.click(screen.getByText('Copy link')); });
  expect(writeText).toHaveBeenCalledWith(window.location.href);
  expect(screen.getByText('Copied!')).toBeTruthy();
});
