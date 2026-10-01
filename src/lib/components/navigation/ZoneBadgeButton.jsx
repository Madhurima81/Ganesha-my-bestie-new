// ZoneBadgeButton.jsx - Zone badge icon shown in game scenes
// variant="gameplay": sole top-left control of the 13 live gameplay scenes (Home removed there).
// Without it the button keeps its legacy position beside HomeButton (parked zones).
// Tap -> goes back to Zone Welcome (NOT the map)

import React from 'react';
import './ZoneBadgeButton.css';

const ZONE_BADGES = {
  'symbol-mountain': { image: '/images/zone-badge/icon-symbolmtn.webp', emoji: 'SM', label: 'Symbol Mountain' },
  'cave-of-secrets': { image: '/images/cave-of-secrets-map-icon.png',   emoji: 'CS', label: 'Cave of Secrets' },
  'shloka-river':    { image: '/images/zone-badge/icon-shlokariver.webp', emoji: 'SR', label: 'Shloka River' },
  'festival-square': { image: '/images/festival-square-map-icon.png',   emoji: 'FS', label: 'Festival Square' },
  'about-me-hut':    { image: '/images/zone-badge/icon-aboutme.webp',    emoji: 'AH', label: 'Lambodara Lodge' },
};

const ZoneBadgeButton = ({ zoneId, onBack, variant, style = {} }) => {
  const badge = ZONE_BADGES[zoneId] || { emoji: 'ZN', label: 'Zone' };

  return (
    <button
      className={`zone-badge-button${variant === 'gameplay' ? ' zone-badge-button--gameplay' : ''}`}
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
