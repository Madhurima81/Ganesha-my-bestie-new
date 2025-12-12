// GamePauseMenu.jsx - Final version with all options
import React from 'react';
import './GamePauseMenu.css';

const GamePauseMenu = ({
  show,
  gameName = "Game",
  onResume,
  onRestart,
  onBackToModes, // This prop is for the purple button
  onComplete // This prop is for the yellow button
}) => {
  if (!show) return null;

  return (
    <div className="game-pause-overlay">
      <div className="game-pause-modal">
        <button 
          className="pause-close-x"
          onClick={onResume}
        >
          ×
        </button>

        <div className="pause-header">
          <h2 className="pause-title">Game Paused</h2>
          <div className="pause-game-name">{gameName}</div>
        </div>

        <div className="pause-menu-options">
          {/* 1. Keep Playing */}
          <button className="pause-button resume" onClick={onResume}>
            <span className="pause-btn-icon">▶️</span>
            <div className="pause-btn-content">
              <span className="pause-btn-label">Keep Playing</span>
              <span className="pause-btn-subtitle">Resume game</span>
            </div>
          </button>

          {/* 2. Start Fresh */}
          <button className="pause-button restart" onClick={onRestart}>
            <span className="pause-btn-icon">🔄</span>
            <div className="pause-btn-content">
              <span className="pause-btn-label">Start Fresh</span>
              <span className="pause-btn-subtitle">Restart this game</span>
            </div>
          </button>

          {/* 3. Change Mode (Purple Button) - This will now appear */}
          {onBackToModes && (
            <button className="pause-button design" onClick={onBackToModes}>
              <span className="pause-btn-icon">🎨</span>
              <div className="pause-btn-content">
                <span className="pause-btn-label">Change Mode</span>
                <span className="pause-btn-subtitle">Choose a different activity</span>
              </div>
            </button>
          )}

          {/* 4. I'm Done (Yellow Button) */}
          {onComplete && (
            <button className="pause-button complete" onClick={onComplete}>
              <span className="pause-btn-icon">✨</span>
              <div className="pause-btn-content">
                <span className="pause-btn-label">I'm Done Creating!</span>
                <span className="pause-btn-subtitle">See my masterpiece</span>
              </div>
            </button>
          )}
        </div>
        <div className="pause-decoration top-left">🪔</div>
      </div>
    </div>
  );
};

export default GamePauseMenu;