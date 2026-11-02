// ProfileChip.jsx - Reusable profile avatar chip
// Reads active profile from localStorage and renders the same chip as CleanMapZone.
// onClick → onNavigate('profile') → profile-welcome screen

import React, { useState, useEffect } from 'react';

const EMOJI_TO_ANIMAL = { '🐵': 'monkey', '🦚': 'peacock', '🐿️': 'squirrel', '🐯': 'tiger' };

// Any of the 20 explorer friends (owl, turtle, fish...) — same rule as CleanMapZone's chip.
// Do NOT hardcode a short list: ids missing from it fell through to printing the raw id as text ("rt", "OW").
const getAnimalId = (avatar) => {
  if (!avatar) return null;
  if (typeof avatar === 'object' && avatar.id) return avatar.id;
  if (EMOJI_TO_ANIMAL[avatar]) return EMOJI_TO_ANIMAL[avatar];
  if (typeof avatar === 'string') {
    const id = avatar.trim().toLowerCase();
    if (/^[a-z0-9-]+$/.test(id)) return id;
  }
  return null;
};

const ProfileChip = ({ onNavigate, pulseOnce = false }) => {
  const [profile, setProfile] = useState(null);
  const [pulsePhase, setPulsePhase] = useState('idle');

  useEffect(() => {
    const activeId = localStorage.getItem('activeProfileId');
    if (!activeId) return;
    try {
      const data = JSON.parse(localStorage.getItem('gameProfiles') || '{}');
      const p = data.profiles?.[activeId];
      if (p) setProfile(p);
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!pulseOnce) return undefined;

    setPulsePhase('up');
    const t1 = setTimeout(() => setPulsePhase('settle'), 170);
    const t2 = setTimeout(() => setPulsePhase('idle'), 620);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pulseOnce]);

  if (!profile) return null;

  const animalId = getAnimalId(profile.avatar);
  const isPulsing = pulsePhase !== 'idle';
  const pulseTransform = pulsePhase === 'up' ? 'scale(1.05)' : 'scale(1)';
  const pulseShadow = isPulsing
    ? '0 7px 22px rgba(120,80,200,0.28), 0 0 0 4px rgba(92,62,166,0.12)'
    : '0 4px 16px rgba(120,80,200,0.2)';

  return (
    <button
      onClick={() => onNavigate?.('profile')}
      title="Switch Explorer"
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 20000,
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(10px, 1vw, 18px)',
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(6px)',
        padding: '6px 10px',
        borderRadius: 20,
        border: '2px solid rgba(160,120,220,0.4)',
        boxShadow: pulseShadow,
        transform: pulseTransform,
        transition: 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 240ms ease',
        cursor: 'pointer',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 800,
      }}
    >
      <span style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #f3eeff, #e4d4ff)',
        border: '2.5px solid rgba(140,100,220,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {animalId ? (
          <img
            src={`/images/new-explorer-${animalId}.webp`}
            alt={profile.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            onError={(e) => {
              if (!e.currentTarget.dataset.tried) { e.currentTarget.dataset.tried = '1'; e.currentTarget.src = `/images/new-explorer-${animalId}.png`; }
              else e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span style={{ fontSize: 'clamp(28px, 3vw, 42px)' }}>{profile.avatar || '🧒'}</span>
        )}
      </span>
      <span style={{
        fontSize: 13,
        fontWeight: 800,
        color: '#5c3ea6',
        whiteSpace: 'nowrap',
      }}>
        {profile.name}
      </span>
    </button>
  );
};

export default ProfileChip;

