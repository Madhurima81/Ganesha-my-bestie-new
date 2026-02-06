// PauseMenu.jsx
// Reusable Pause Button & Menu Component for all scenes
// Based on the Modak scene implementation

import React from 'react';
import './PauseMenu.css';

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
  zoneName = "Adventure",
  showParentsOption = true
}) => {
  if (!show) return null;

  return (
    <div
      className="universal-pause-overlay"
      onClick={onResume}
    >
      <div
        className="universal-pause-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="universal-pause-header">
          <h2 className="universal-pause-title">{zoneName}</h2>
          <p className="universal-pause-subtitle">PAUSED</p>
          <div className="universal-pause-divider" />
        </div>

        {/* Menu Items */}
        <div className="universal-pause-menu">
          {/* Resume Button (Primary) */}
          <button
            className="universal-pause-item universal-pause-item-primary"
            onClick={onResume}
          >
            <span className="universal-pause-icon universal-pause-icon-play">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </span>
            Resume
          </button>

          {/* Back to Map */}
          <button
            className="universal-pause-item"
            onClick={onBackToMap}
          >
            <span className="universal-pause-icon-emoji">🏠</span>
            Back to Map
          </button>

          {/* Sound Toggle */}
          {onSoundToggle && (
            <button
              className="universal-pause-item"
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
              className="universal-pause-item"
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
          (Tap outside to resume)
        </p>
      </div>
    </div>
  );
};

export default PauseMenu;
