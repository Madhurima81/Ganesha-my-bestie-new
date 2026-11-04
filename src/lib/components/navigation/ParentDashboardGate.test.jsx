import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ParentDashboard from './ParentDashboard';

const WORDS = { ZERO: '0', ONE: '1', TWO: '2', THREE: '3', FOUR: '4', FIVE: '5', SIX: '6', SEVEN: '7', EIGHT: '8', NINE: '9' };

beforeEach(() => {
  jest.useFakeTimers();
  localStorage.clear();
  localStorage.setItem('activeProfileId', 'p1');
  localStorage.setItem('gameProfiles', JSON.stringify({ profiles: { p1: { id: 'p1', name: 'Radha', age: 7, avatar: 'owl' } } }));
});
afterEach(() => jest.useRealTimers());

// The prompt reads like "THREE, ONE, ...": key those digits back in.
const typeAnswer = () => {
  const prompt = document.querySelector('.pg-prompt').textContent;
  prompt.split(',').map((w) => WORDS[w.trim()]).forEach((d) => fireEvent.click(screen.getByText(d, { selector: '.pg-key' })));
};

test('the dashboard asks the grown-up check, not a PIN, and stores nothing', () => {
  render(<ParentDashboard onBack={() => {}} onOpenChildProfile={() => {}} />);
  expect(screen.getByText('Grown-ups only!')).toBeTruthy();
  expect(screen.queryByText(/PIN/i)).toBeNull();
  expect(localStorage.getItem('gmb_parent_pin')).toBeNull();
  expect(localStorage.getItem('gmb_pin_set')).toBeNull();
});

test('the right digits open Settings; there is no Change PIN row any more', () => {
  render(<ParentDashboard onBack={() => {}} onOpenChildProfile={() => {}} />);
  typeAnswer();
  act(() => { jest.advanceTimersByTime(200); });
  fireEvent.click(screen.getByText('Settings'));
  expect(screen.getByText('Explorers')).toBeTruthy();
  expect(screen.queryByText('Change PIN')).toBeNull();
  expect(screen.getByText('Delete all data')).toBeTruthy();
});

test('Back leaves the dashboard', () => {
  const back = jest.fn();
  render(<ParentDashboard onBack={back} onOpenChildProfile={() => {}} />);
  fireEvent.click(screen.getByText('← Back'));
  expect(back).toHaveBeenCalled();
});
