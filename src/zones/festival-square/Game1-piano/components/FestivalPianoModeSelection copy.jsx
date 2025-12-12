// FestivalPianoModeSelection.jsx
// Mode selection screen for Piano game - Free Play vs Musical Challenge

import React from 'react';
import './FestivalPianoModeSelection.css';

const FestivalPianoModeSelection = ({ 
  onSelectMode,
  ganeshaImage 
}) => {
  return (
    <div className="mode-selection-container">
      {/* Ganesha Introduction */}
      <div className="ganesha-intro">
        <div 
          className="ganesha-intro-image"
          style={{ backgroundImage: `url(${ganeshaImage})` }}
        />
        <div className="ganesha-intro-message">
          <h2>🎵 Welcome to My Music Studio!</h2>
          <p>Choose how you'd like to explore music today</p>
        </div>
      </div>

      {/* Mode Cards */}
      <div className="mode-cards">
        {/* Free Play Mode */}
        <div className="mode-card free-play">
          <div className="mode-icon">🎨</div>
          <h3>Free Play</h3>
          <p className="mode-subtitle">Explore & Discover</p>
          
          <div className="mode-features">
            <div className="feature">
              <span className="feature-icon">🎹</span>
              <span>Tap any instrument</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🦚</span>
              <span>Watch animals dance</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📚</span>
              <span>Learn about each sound</span>
            </div>
            <div className="feature">
              <span className="feature-icon">✨</span>
              <span>Relax and create</span>
            </div>
          </div>

          <div className="mode-difficulty">
            <span className="difficulty-label">Difficulty:</span>
            <div className="difficulty-stars">
              <span className="star filled">⭐</span>
              <span className="star">⭐</span>
              <span className="star">⭐</span>
            </div>
          </div>

          <div className="mode-rewards">
            <span>Earn up to 4 ⭐</span>
          </div>

          <button 
            className="select-mode-btn free-play-btn"
            onClick={() => onSelectMode('free-play')}
          >
            Start Free Play
          </button>

          <div className="mode-best-for">
            Perfect for: Ages 4-6, Relaxation, Sensory Exploration
          </div>
        </div>

        {/* Musical Challenge Mode */}
        <div className="mode-card challenge">
          <div className="mode-badge">⭐ Challenge</div>
          <div className="mode-icon">🎯</div>
          <h3>Musical Challenge</h3>
          <p className="mode-subtitle">Match the Patterns</p>
          
          <div className="mode-features">
            <div className="feature">
              <span className="feature-icon">👀</span>
              <span>Watch the pattern</span>
            </div>
            <div className="feature">
              <span className="feature-icon">👂</span>
              <span>Listen carefully</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🎵</span>
              <span>Play it back correctly</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🏆</span>
              <span>3 progressive rounds</span>
            </div>
          </div>

          <div className="mode-difficulty">
            <span className="difficulty-label">Difficulty:</span>
            <div className="difficulty-stars">
              <span className="star filled">⭐</span>
              <span className="star filled">⭐</span>
              <span className="star filled">⭐</span>
            </div>
          </div>

          <div className="mode-rewards">
            <span>Earn up to 8 ⭐</span>
          </div>

          <button 
            className="select-mode-btn challenge-btn"
            onClick={() => onSelectMode('challenge')}
          >
            Start Challenge
          </button>

          <div className="mode-best-for">
            Perfect for: Ages 6-8, Memory Building, Pattern Recognition
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="mode-info">
        <p>💡 You can switch modes anytime from the pause menu</p>
      </div>
    </div>
  );
};

export default FestivalPianoModeSelection;