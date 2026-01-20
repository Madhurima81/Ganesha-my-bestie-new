// GamePauseMenu.jsx - Enhanced version for Shloka River with flexible options
import React from 'react';
import './GamePauseMenu.css';

const GamePauseMenu = ({
  show,
  gameName = "Game",
  onResume,
  onRestart,
  onBackToModes, // Go back to mode selection
  onChangeWord, // NEW: Choose different word
  onChangeLevel, // NEW: Choose different level
  onComplete // End game / I'm Done
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
              <span className="pause-btn-subtitle">Restart this activity</span>
            </div>
          </button>

          {/* 3. Choose Different Word - NEW! */}
          {onChangeWord && (
            <button className="pause-button word-select" onClick={onChangeWord}>
              <span className="pause-btn-icon">📝</span>
              <div className="pause-btn-content">
                <span className="pause-btn-label">Different Word</span>
                <span className="pause-btn-subtitle">Practice another word</span>
              </div>
            </button>
          )}

          {/* 4. Choose Different Level - NEW! */}
          {onChangeLevel && (
            <button className="pause-button level-select" onClick={onChangeLevel}>
              <span className="pause-btn-icon">🎯</span>
              <div className="pause-btn-content">
                <span className="pause-btn-label">Different Level</span>
                <span className="pause-btn-subtitle">Try a different challenge</span>
              </div>
            </button>
          )}

          {/* 5. Change Mode (Back to mode selection) */}
          {onBackToModes && (
            <button className="pause-button design" onClick={onBackToModes}>
              <span className="pause-btn-icon">🎨</span>
              <div className="pause-btn-content">
                <span className="pause-btn-label">Change Mode</span>
                <span className="pause-btn-subtitle">Choose a different game mode</span>
              </div>
            </button>
          )}

          {/* 6. I'm Done / End Game */}
          {onComplete && (
            <button className="pause-button complete" onClick={onComplete}>
              <span className="pause-btn-icon">✨</span>
              <div className="pause-btn-content">
                <span className="pause-btn-label">I'm Done!</span>
                <span className="pause-btn-subtitle">End game and see results</span>
              </div>
            </button>
          )}
        </div>
        <div className="pause-decoration top-left">🪷</div>
      </div>
    </div>
  );
};

export default GamePauseMenu;