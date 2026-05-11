// ZoneBadgeButton.jsx - Zone badge icon shown in game scenes next to HomeButton
// Tap -> goes back to Zone Welcome (NOT the map)

import React from 'react';

const ZONE_BADGES = {
  'symbol-mountain': { image: '/images/zone-badge/icon-symbolmtn.png', emoji: 'SM', label: 'Symbol Mountain' },
  'cave-of-secrets': { image: '/images/cave-of-secrets-map-icon.png',   emoji: 'CS', label: 'Cave of Secrets' },
  'shloka-river':    { image: '/images/zone-badge/icon-shlokariver.png', emoji: 'SR', label: 'Shloka River' },
  'festival-square': { image: '/images/festival-square-map-icon.png',   emoji: 'FS', label: 'Festival Square' },
  'about-me-hut':    { image: '/images/zone-badge/icon-aboutme.png',    emoji: 'AH', label: 'About Me Hut' },
};

const NAV_BUTTON_SIZE = '36px';
const NAV_BUTTON_TOP = '10px';
const NAV_BUTTON_LEFT = '10px';
const NAV_BUTTON_GAP = '8px';

const ZoneBadgeButton = ({ zoneId, onBack, style = {} }) => {
  const badge = ZONE_BADGES[zoneId] || { emoji: 'ZN', label: 'Zone' };

  return (
    <button
      onClick={onBack}
      title={badge.label}
      aria-label={`Back to ${badge.label}`}
      style={{
        position: 'fixed',
        top: NAV_BUTTON_TOP,
        left: `calc(${NAV_BUTTON_LEFT} + ${NAV_BUTTON_SIZE} + ${NAV_BUTTON_GAP})`,
        zIndex: 20000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: NAV_BUTTON_SIZE,
        height: NAV_BUTTON_SIZE,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(10px)',
        borderRadius: '50%',
        border: '2px solid rgba(160, 120, 220, 0.4)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        fontSize: 26,
        lineHeight: 1,
        overflow: 'hidden',
        padding: 0,
        ...style,
      }}
    >
      {badge.image ? (
        <img
          src={badge.image}
          alt={badge.label}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
        />
      ) : (
        badge.emoji
      )}
    </button>
  );
};

export default ZoneBadgeButton;
