// Resolve a saved profile avatar (animal id, {id}, or legacy emoji) to an explorer id.
// Art lives at /images/new-explorer-<id>.webp for all 20 explorer friends.
// Never use a short allow-list here (KNOWN_PITFALLS 65).
const EMOJI_TO_ANIMAL = { '🐵': 'monkey', '🦚': 'peacock', '🐿️': 'squirrel', '🐯': 'tiger' };

export function getExplorerAvatarId(avatar) {
  if (!avatar) return null;
  if (typeof avatar === 'object' && avatar.id) return avatar.id;
  if (EMOJI_TO_ANIMAL[avatar]) return EMOJI_TO_ANIMAL[avatar];
  if (typeof avatar === 'string') {
    const id = avatar.trim().toLowerCase();
    if (/^[a-z0-9-]+$/.test(id)) return id;
  }
  return null;
}

// The 20 explorer friends a child can pick. Art: /images/new-explorer-<id>.webp (+ .png fallback).
export const EXPLORER_AVATARS = [
  'monkey', 'elephant', 'peacock', 'tiger', 'lion', 'rabbit', 'squirrel', 'mouse', 'owl', 'deer',
  'horse', 'camel', 'buffalo', 'cobra', 'turtle', 'fish', 'swan', 'crane', 'crow', 'fox',
].map((id) => ({ id, name: id.charAt(0).toUpperCase() + id.slice(1) }));
