// ZoneBadgeButton.jsx - Zone badge icon shown in game scenes next to HomeButton
// Tap -> goes back to Zone Welcome (NOT the map)

import React from 'react';
import './ZoneBadgeButton.css';

const ZONE_BADGES = {
  'symbol-mountain': { image: '/images/zone-badge/icon-symbolmtn.png', emoji: 'SM', label: 'Symbol Mountain' },
  'cave-of-secrets': { image: '/images/cave-of-secrets-map-icon.png',   emoji: 'CS', label: 'Cave of Secrets' },
  'shloka-river':    { image: '/images/zone-badge/icon-shlokariver.png', emoji: 'SR', label: 'Shloka River' },
  'festival-square': { image: '/images/festival-square-map-icon.png',   emoji: 'FS', label: 'Festival Square' },
  'about-me-hut':    { image: '/images/zone-badge/icon-aboutme.png',    emoji: 'AH', label: 'About Me Hut' },
};

const ZoneBadgeButton = ({ zoneId, onBack, style = {} }) => {
  const badge = ZONE_BADGES[zoneId] || { emoji: 'ZN', label: 'Zone' };

  return (
    <button
      className="zone-badge-button"
      onClick={onBack}
      title={badge.label}
      aria-label={`Back to ${badge.label}`}
      style={style}
    >
      {badge.image ? (
        <img
          src={badge.image}
          alt={badge.label}
          className="zone-badge-button__icon"
        />
      ) : (
        badge.emoji
      )}
    </button>
  );
};

export default ZoneBadgeButton;
