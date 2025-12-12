// FestivalPianoModeSelection.jsx - SIMPLE INLINE VERSION
// Simple button-based mode selection like Rangoli design cards

import React from 'react';
import './FestivalPianoModeSelection.css';

const FestivalPianoModeSelection = ({ 
  onSelectMode,
  ganeshaImage 
}) => {
  return (
    <div className="mode-selection-simple">
      {/* Ganesha with Welcome Message */}
      <div className="welcome-section">
        <div 
          className="ganesha-welcome-image"
          style={{ backgroundImage: `url(${ganeshaImage})` }}
        />
        <h2 className="welcome-title">🎵 Welcome to My Music Studio!</h2>
        <p className="welcome-subtitle">How would you like to play today?</p>
      </div>

      {/* Two Mode Options as Cards */}
      <div className="mode-options">
        {/* Free Play Option */}
        <div 
          className="mode-option-card free-play-card"
          onClick={() => onSelectMode('free-play')}
        >
          <div className="option-icon">🎨</div>
          <h3>Free Play</h3>
          <p className="option-description">Explore & discover sounds</p>
          <div className="option-badge easy-badge">Easy</div>
          <div className="option-sections">Up to 4 ⭐</div>
        </div>

        {/* Musical Challenge Option */}
        <div 
          className="mode-option-card challenge-card"
          onClick={() => onSelectMode('challenge')}
        >
          <div className="challenge-badge">⭐ Challenge</div>
          <div className="option-icon">🎯</div>
          <h3>Musical Challenge</h3>
          <p className="option-description">Match the rhythm patterns</p>
          <div className="option-badge advanced-badge">Advanced</div>
          <div className="option-sections">Up to 8 ⭐</div>
        </div>
      </div>
    </div>
  );
};

export default FestivalPianoModeSelection;