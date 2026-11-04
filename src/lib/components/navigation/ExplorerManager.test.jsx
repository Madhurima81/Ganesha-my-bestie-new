import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExplorerManager from './ExplorerManager';
import GameStateManager from '../../services/GameStateManager';

const seed = () => {
  const a = 'profile_a';
  const b = 'profile_b';
  localStorage.setItem('activeProfileId', a);
  localStorage.setItem('gameProfiles', JSON.stringify({
    profiles: {
      [a]: { id: a, name: 'Radha', age: 7, avatar: 'owl', createdAt: 1 },
      [b]: { id: b, name: 'Arjun', age: 9, avatar: 'tiger', createdAt: 2 },
    },
  }));
  localStorage.setItem(`${a}_gameProgress`, JSON.stringify({ totalStars: 4 }));
  localStorage.setItem(`${b}_gameProgress`, JSON.stringify({ totalStars: 6 }));
  GameStateManager.activeProfileId = a;
};

const profileOf = (id) => JSON.parse(localStorage.getItem('gameProfiles')).profiles[id];

beforeEach(() => { localStorage.clear(); seed(); });

test('lists every explorer with name and age', () => {
  render(<ExplorerManager />);
  expect(screen.getByText('Radha')).toBeTruthy();
  expect(screen.getByText('Age 7')).toBeTruthy();
  expect(screen.getByText('Arjun')).toBeTruthy();
  expect(screen.getByText('Age 9')).toBeTruthy();
});

test('Okay saves a new name, age and avatar, and tells the dashboard', () => {
  const changed = jest.fn();
  render(<ExplorerManager onChanged={changed} />);
  fireEvent.click(screen.getByLabelText('Edit Radha'));
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Rani' } });
  fireEvent.click(screen.getByLabelText('Older'));
  fireEvent.click(screen.getByLabelText('Change avatar'));
  fireEvent.click(screen.getByLabelText('Lion'));
  fireEvent.click(screen.getByText('Okay'));

  expect(profileOf('profile_a')).toMatchObject({ name: 'Rani', age: 8, avatar: 'lion' });
  expect(localStorage.getItem('childName')).toBe('Rani'); // active child: the dashboard reads this
  expect(changed).toHaveBeenCalled();
  expect(screen.getByText('Rani')).toBeTruthy();
});

test('Cancel changes nothing', () => {
  render(<ExplorerManager />);
  fireEvent.click(screen.getByLabelText('Edit Arjun'));
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Zed' } });
  fireEvent.click(screen.getByText('Cancel'));
  expect(profileOf('profile_b').name).toBe('Arjun');
});

test('Okay is disabled while the name is empty, and the name stops at 12 characters', () => {
  render(<ExplorerManager />);
  fireEvent.click(screen.getByLabelText('Edit Radha'));
  fireEvent.click(screen.getByLabelText('Clear name'));
  expect(screen.getByText('Okay').disabled).toBe(true);
  expect(screen.getByLabelText('Name').maxLength).toBe(12);
});

test('age stays between 3 and 14', () => {
  render(<ExplorerManager />);
  fireEvent.click(screen.getByLabelText('Edit Radha'));
  for (let i = 0; i < 20; i += 1) fireEvent.click(screen.getByLabelText('Younger'));
  expect(screen.getByLabelText('Younger').disabled).toBe(true);
  for (let i = 0; i < 20; i += 1) fireEvent.click(screen.getByLabelText('Older'));
  expect(screen.getByLabelText('Older').disabled).toBe(true);
  fireEvent.click(screen.getByText('Okay'));
  expect(profileOf('profile_a').age).toBe(14);
});

test('delete takes two steps, "Keep" backs out, "Delete" removes only that explorer and its data', () => {
  render(<ExplorerManager />);
  fireEvent.click(screen.getByLabelText('Edit Arjun'));
  fireEvent.click(screen.getByText('Delete explorer'));
  expect(profileOf('profile_b')).toBeTruthy(); // nothing yet
  fireEvent.click(screen.getByText('Keep'));
  expect(profileOf('profile_b')).toBeTruthy();

  fireEvent.click(screen.getByText('Delete explorer'));
  fireEvent.click(screen.getByText('Delete'));
  expect(profileOf('profile_b')).toBeUndefined();
  expect(localStorage.getItem('profile_b_gameProgress')).toBeNull();
  expect(profileOf('profile_a')).toBeTruthy();
  expect(localStorage.getItem('profile_a_gameProgress')).not.toBeNull();
});

test('updateProfile ignores an unknown id and clamps age', () => {
  expect(GameStateManager.updateProfile('nope', { name: 'X' })).toBeNull();
  GameStateManager.updateProfile('profile_a', { age: 99 });
  expect(profileOf('profile_a').age).toBe(14);
});
