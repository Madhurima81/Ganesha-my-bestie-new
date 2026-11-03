import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ParentDashboard from './ParentDashboard';

jest.mock('../dashboard/PinScreen', () => ({ onSuccess }) => <button onClick={onSuccess}>enter-pin</button>);

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('activeProfileId', 'p1');
  localStorage.setItem('gameProfiles', JSON.stringify({ profiles: { p1: { id: 'p1', name: 'Radha', age: 7, avatar: 'owl' } } }));
});

test('normal entry: asks for the PIN first and opens on "For Parents"', () => {
  render(<ParentDashboard onBack={() => {}} onOpenChildProfile={() => {}} />);
  expect(screen.getByText('enter-pin')).toBeTruthy();
  expect(screen.queryByText('Child profile')).toBeNull();
});

test('coming back from Child profile: no PIN, straight to Settings', () => {
  render(<ParentDashboard onBack={() => {}} onOpenChildProfile={() => {}} initialUnlocked initialTab="settings" />);
  expect(screen.queryByText('enter-pin')).toBeNull();
  expect(screen.getByText('Child profile')).toBeTruthy(); // the Settings > Child row
});

test('Child profile "Open" asks the app to open the profile picker', () => {
  const open = jest.fn();
  render(<ParentDashboard onBack={() => {}} onOpenChildProfile={open} initialUnlocked initialTab="settings" />);
  const row = screen.getByText('Child profile').closest('.pd-setting-row');
  fireEvent.click(row.querySelector('button'));
  expect(open).toHaveBeenCalledTimes(1);
});
