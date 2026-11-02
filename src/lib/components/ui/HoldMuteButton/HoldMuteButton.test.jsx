import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import HoldMuteButton from './HoldMuteButton';
import { isVoiceMuted, setVoiceMuted } from '../../../utils/voiceMute';

beforeEach(() => { jest.useFakeTimers(); localStorage.clear(); setVoiceMuted(false); });
afterEach(() => jest.useRealTimers());

const btn = () => screen.getByRole('button');

test('pressing shows a "keep holding" bubble (not only a ring on the covered button)', () => {
  render(<HoldMuteButton />);
  fireEvent.pointerDown(btn(), { pointerId: 1 });
  act(() => { jest.advanceTimersByTime(300); });
  expect(screen.getByText('Keep holding to turn voice off')).toBeTruthy();
  expect(isVoiceMuted()).toBe(false);
});

test('holding ~1s turns voice off and the bubble says so', () => {
  render(<HoldMuteButton />);
  fireEvent.pointerDown(btn(), { pointerId: 1 });
  act(() => { jest.advanceTimersByTime(1200); });
  expect(isVoiceMuted()).toBe(true);
  expect(screen.getByText('Voice is off')).toBeTruthy();
  // the click that follows letting go must not unmute again
  fireEvent.pointerUp(btn(), { pointerId: 1 });
  fireEvent.click(btn());
  expect(isVoiceMuted()).toBe(true);
});

test('the confirmation goes away by itself', () => {
  render(<HoldMuteButton />);
  fireEvent.pointerDown(btn(), { pointerId: 1 });
  act(() => { jest.advanceTimersByTime(1200); });
  fireEvent.pointerUp(btn(), { pointerId: 1 });
  act(() => { jest.advanceTimersByTime(2600); });
  expect(screen.queryByText('Voice is off')).toBeNull();
});

test('a short press does not mute and the bubble disappears', () => {
  render(<HoldMuteButton />);
  fireEvent.pointerDown(btn(), { pointerId: 1 });
  act(() => { jest.advanceTimersByTime(300); });
  fireEvent.pointerUp(btn(), { pointerId: 1 });
  fireEvent.click(btn());
  expect(isVoiceMuted()).toBe(false);
  expect(screen.queryByText('Keep holding to turn voice off')).toBeNull();
});

test('tapping when muted turns voice on and says so', () => {
  setVoiceMuted(true);
  render(<HoldMuteButton />);
  fireEvent.pointerDown(btn(), { pointerId: 1 });
  fireEvent.pointerUp(btn(), { pointerId: 1 });
  fireEvent.click(btn());
  expect(isVoiceMuted()).toBe(false);
  expect(screen.getByText('Voice is on')).toBeTruthy();
});
