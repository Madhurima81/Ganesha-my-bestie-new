// ProfileChip.jsx - Reusable profile avatar chip
// Reads active profile from localStorage and renders the same chip as CleanMapZone.
// onClick → onNavigate('profile') → profile-welcome screen

import React, { useState, useEffect } from 'react';

const ANIMAL_IDS = ['monkey', 'peacock', 'squirrel', 'tiger'];
const EMOJI_TO_ANIMAL = { '🐵': 'monkey', '🦚': 'peacock', '🐿️': 'squirrel', '🐯': 'tiger' };

const getAnimalId = (avatar) => {
  if (ANIMAL_IDS.includes(avatar)) return avatar;
  return EMOJI_TO_ANIMAL[avatar] || null;
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
        gap: 10,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(10px)',
        padding: '8px 18px 8px 8px',
        borderRadius: 999,
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
        width: 'clamp(52px, 5.5vw, 88px)',
        height: 'clamp(52px, 5.5vw, 88px)',
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
            src={`/images/new-explorer-${animalId}.png`}
            alt={profile.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <span style={{ fontSize: 'clamp(28px, 3vw, 42px)' }}>{profile.avatar || '🧒'}</span>
        )}
      </span>
      <span style={{
        fontSize: 16,
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

