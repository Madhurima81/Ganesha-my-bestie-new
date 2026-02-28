// PauseMenu.jsx
// Reusable Pause Button & Menu Component for all scenes
// Based on the Modak scene implementation

import React from 'react';
import './PauseMenu.css';
import { getZoneTheme } from '../../../config/ZoneThemes';

// ========================================
// PAUSE BUTTON COMPONENT
// ========================================
export const PauseButton = ({ onClick, visible }) => {
  if (!visible) return null;

  return (
    <button
      className="universal-pause-button"
      onClick={onClick}
      aria-label="Pause"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#5D2E0F">
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
      </svg>
    </button>
  );
};

// ========================================
// PAUSE MENU COMPONENT (Centered Overlay)
// ========================================
export const PauseMenu = ({
  show,
  onResume,
  onBackToMap,
  isSoundOn = true,
  onSoundToggle,
  zoneId,
  zoneName = "Adventure",
  showParentsOption = true
}) => {
  if (!show) return null;

  const normalizeZoneNameToId = (name) => {
    if (!name) return 'symbol-mountain';
    const normalized = name.toLowerCase().trim().replace(/\s+/g, '-');
    const zoneNameMap = {
      'symbol-mountain': 'symbol-mountain',
      'cave-of-secrets': 'cave-of-secrets',
      'festival-square': 'festival-square',
      'shloka-river': 'shloka-river',
      'about-me-hut': 'about-me-hut'
    };
    return zoneNameMap[normalized] || 'symbol-mountain';
  };

  const resolvedZoneId = zoneId || normalizeZoneNameToId(zoneName);
  const theme = getZoneTheme(resolvedZoneId);
  const pauseThemeVars = {
    '--zone-menu-bg': theme.menuBg,
    '--zone-menu-border': theme.menuBorder,
    '--zone-menu-border-width': theme.menuBorderWidth,
    '--zone-text-primary': theme.textPrimary,
    '--zone-text-secondary': theme.textSecondary,
    '--zone-font-family': theme.fontFamily,
    '--zone-font-family-body': theme.fontFamilyBody,
    '--zone-button-bg': theme.buttonBg,
    '--zone-button-hover-bg': theme.buttonHoverBg,
    '--zone-button-hover-border': theme.buttonHoverBorder,
    '--zone-button-active-bg': theme.buttonActiveBg,
    '--zone-badge-text': theme.badgeText,
    '--zone-glow-color': theme.glowColor,
    '--zone-parent-bg': theme.parentBg,
    '--zone-parent-hover-bg': theme.parentHoverBg,
    '--zone-parent-border': theme.parentBorder,
    '--zone-divider-color': theme.dividerColor,
    '--zone-divider-style': theme.dividerStyle,
    '--zone-blur': theme.blur
  };

  return (
    <div
      className="universal-pause-overlay"
      onClick={onResume}
    >
      <div
        className="universal-pause-card"
        style={pauseThemeVars}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="universal-pause-header">
          <h2 className="universal-pause-title">{zoneName}</h2>
          
        </div>

        {/* Menu Items */}
        <div className="universal-pause-menu">
          {/* Continue Button (Primary) */}
          <button
            className="universal-pause-item universal-pause-item-primary"
            onClick={onResume}
          >
            <span className="universal-pause-icon universal-pause-icon-play">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </span>
            Continue Adventure
          </button>

          {/* Back to Map */}
          <button
            className="universal-pause-item universal-pause-item-secondary"
            onClick={onBackToMap}
          >
            <span className="universal-pause-icon-emoji">🏠</span>
          Home
          </button>

          {/* Sound Toggle */}
          {onSoundToggle && (
              <button
                className="universal-pause-item universal-pause-item-secondary"
                onClick={onSoundToggle}
              >
              <span className="universal-pause-icon-emoji">
                {isSoundOn ? '🔊' : '🔇'}
              </span>
              Sound: <span className={`universal-pause-sound-status ${isSoundOn ? 'on' : 'off'}`}>
                {isSoundOn ? 'On' : 'Off'}
              </span>
            </button>
          )}

          {/* Parents (Hold) */}
          {showParentsOption && (
            <button
              className="universal-pause-item universal-pause-item-secondary universal-pause-item-parent"
              onMouseDown={(e) => {
                // Long press handler - would need timeout logic
                console.log('Parents button held');
              }}
            >
              <span className="universal-pause-icon-emoji">👤</span>
              Parents (Hold)
            </button>
          )}
        </div>

        {/* Footer hint */}
        <p className="universal-pause-footer">
          Tap anywhere to jump back in
        </p>
      </div>
    </div>
  );
};

export default PauseMenu;
