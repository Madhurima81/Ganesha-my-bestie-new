// GamePauseMenu.jsx - Festival Square Game Pause Menu (Updated)
import React from 'react';
import './GamePauseMenu.css';

const GamePauseMenu = ({
  show,
  gameName = "Modak Cooking",
  currentStars = 0,
  hasDesignOption = false, // true for Rangoli, false for Modak/Piano/Decor
  onResume,
  onRestart,
  onDifferentDesign, // Only for Rangoli
  onComplete // For "I'm Done!" button
}) => {
  if (!show) return null;

  return (
    <div className="game-pause-overlay">
      <div className="game-pause-modal">
        {/* Header with game icon */}
        <div className="pause-header">
          <div className="pause-icon">⏸️</div>
          <h2 className="pause-title">Game Paused</h2>
          <div className="pause-game-name">{gameName}</div>
        </div>

        {/* Current Progress */}
        <div className="pause-progress">
          <span className="pause-stars">⭐ {currentStars} Stars Earned</span>
        </div>

        {/* Menu Options */}
        <div className="pause-menu-options">
          
          {/* Resume/Keep Playing */}
          <button 
            className="pause-button resume"
            onClick={onResume}
          >
            <span className="pause-btn-icon">▶️</span>
            <div className="pause-btn-content">
              <span className="pause-btn-label">Keep Playing</span>
              <span className="pause-btn-subtitle">Resume game</span>
            </div>
          </button>

          {/* Restart This Game */}
          <button 
            className="pause-button restart"
            onClick={onRestart}
          >
            <span className="pause-btn-icon">🔄</span>
            <div className="pause-btn-content">
              <span className="pause-btn-label">Start Fresh</span>
              <span className="pause-btn-subtitle">Restart this game</span>
            </div>
          </button>

          {/* Different Design (only for Rangoli) */}
          {hasDesignOption && (
            <button 
              className="pause-button design"
              onClick={onDifferentDesign}
            >
              <span className="pause-btn-icon">🎨</span>
              <div className="pause-btn-content">
                <span className="pause-btn-label">Different Design</span>
                <span className="pause-btn-subtitle">Choose new pattern</span>
              </div>
            </button>
          )}

          {/* I'm Done Creating! */}
          {onComplete && (
            <button 
              className="pause-button complete"
              onClick={onComplete}
            >
              <span className="pause-btn-icon">✨</span>
              <div className="pause-btn-content">
                <span className="pause-btn-label">I'm Done Creating!</span>
                <span className="pause-btn-subtitle">See my masterpiece</span>
              </div>
            </button>
          )}

        </div>

        {/* Decorative elements */}
        <div className="pause-decoration top-left">🪔</div>
        <div className="pause-decoration top-right">🪔</div>
        <div className="pause-decoration bottom-left">🌸</div>
        <div className="pause-decoration bottom-right">🌸</div>
      </div>
    </div>
  );
};

export default GamePauseMenu;