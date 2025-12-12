import React from 'react';
import './GamePauseMenu.css';

const GamePauseMenu = ({ onContinue, onReplay, onEndGame }) => {
  return (
    <div className="game-pause-overlay">
      <div className="pause-modal">
        <div className="pause-header">
          <h2 className="pause-title">Game Paused</h2>
          <span className="pause-icon">⏸️</span>
        </div>

        <div className="pause-buttons">
          <button className="pause-btn continue" onClick={onContinue}>
            <span className="btn-icon">▶️</span>
            <span className="btn-text">Continue Playing</span>
          </button>

          <button className="pause-btn replay" onClick={onReplay}>
            <span className="btn-icon">🔄</span>
            <span className="btn-text">Restart Game</span>
          </button>

          <button className="pause-btn end-game" onClick={onEndGame}>
            <span className="btn-icon">🏠</span>
            <span className="btn-text">Back to Games</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamePauseMenu;