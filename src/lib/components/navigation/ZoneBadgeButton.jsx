// ZoneBadgeButton.jsx - Zone badge icon shown in game scenes next to HomeButton
// Tap → goes back to Zone Welcome (NOT the map)
// Emojis are placeholders — replace with SVGs later

import React from 'react';

const ZONE_BADGES = {
  'symbol-mountain': { emoji: '🏔️', label: 'Symbol Mountain' },
  'cave-of-secrets': { emoji: '🦇', label: 'Cave of Secrets' },
  'shloka-river':    { emoji: '🌊', label: 'Shloka River' },
  'festival-square': { emoji: '🎪', label: 'Festival Square' },
  'about-me-hut':    { emoji: '🏠', label: 'About Me Hut' },
};

const ZoneBadgeButton = ({ zoneId, onBack, style = {} }) => {
  const badge = ZONE_BADGES[zoneId] || { emoji: '🗺️', label: 'Zone' };

  return (
    <button
      onClick={onBack}
      title={badge.label}
      aria-label={`Back to ${badge.label}`}
      style={{
        position: 'fixed',
        top: 20,
        left: 80,
        zIndex: 20000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 56,
        height: 56,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(10px)',
        borderRadius: '50%',
        border: '2px solid rgba(160,120,220,0.4)',
        boxShadow: '0 4px 16px rgba(120,80,200,0.2)',
        cursor: 'pointer',
        fontSize: 26,
        lineHeight: 1,
        ...style,
      }}
    >
      {badge.emoji}
    </button>
  );
};

export default ZoneBadgeButton;
