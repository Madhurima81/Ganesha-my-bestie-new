import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ParentDashboard from './ParentDashboard';
import GameStateManager from '../../services/GameStateManager';

jest.mock('../onboarding/ParentGate', () => ({ onComplete }) => <button onClick={onComplete}>enter-pin</button>);

const seed = () => {
  const id = 'profile_test1';
  localStorage.setItem('activeProfileId', id);
  localStorage.setItem('gameProfiles', JSON.stringify({ profiles: { [id]: { id, name: 'Radha', age: 7, avatar: 'owl' } } }));
  localStorage.setItem(`${id}_gameProgress`, JSON.stringify({ totalStars: 9, completedScenes: 3, zones: {} }));
  localStorage.setItem(`${id}_modak_state`, '{"done":true}');
  GameStateManager.activeProfileId = null; // like a fresh page load before anything set it
  return id;
};

function openSettings() {
  render(<ParentDashboard onBack={() => {}} onOpenChildProfile={() => {}} />);
  fireEvent.click(screen.getByText('enter-pin'));
  fireEvent.click(screen.getByText('Settings'));
}

beforeEach(() => { localStorage.clear(); window.alert = jest.fn(); });

test('Reset progress wipes the child\'s progress but keeps the profile', () => {
  const id = seed();
  window.confirm = jest.fn(() => true);
  openSettings();
  fireEvent.click(screen.getByText('Reset'));
  expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('Radha'));
  expect(localStorage.getItem(`${id}_modak_state`)).toBeNull();
  const progress = JSON.parse(localStorage.getItem(`${id}_gameProgress`) || '{}');
  expect(progress.totalStars || 0).toBe(0);
  expect(JSON.parse(localStorage.getItem('gameProfiles')).profiles[id].name).toBe('Radha');
});

test('Cancelling the confirm erases nothing', () => {
  const id = seed();
  window.confirm = jest.fn(() => false);
  openSettings();
  fireEvent.click(screen.getByText('Reset'));
  expect(localStorage.getItem(`${id}_modak_state`)).toBe('{"done":true}');
  expect(JSON.parse(localStorage.getItem(`${id}_gameProgress`)).totalStars).toBe(9);
});
