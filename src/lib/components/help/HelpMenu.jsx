// lib/components/help/HelpMenu.jsx
// Universal Help Menu component with zone-specific theming

import React from 'react';
import './HelpMenu.css';
import { getZoneTheme } from '../../config/ZoneThemes';

const HelpMenu = ({ 
  show,
  onClose, 
  onNavigate, 
  resetScene,
  helpConfig,
  sceneState,
  onSoundToggle,
  isAudioOn,
  zoneId = 'symbol-mountain' // ← NEW: Zone ID for theming
}) => {
  if (!show) return null;
  
  const hints = helpConfig?.getHints?.(sceneState) || [];
  const generalTips = helpConfig?.generalTips || [];
  const sceneName = helpConfig?.sceneName || 'This Game';
  
  // Get theme for current zone
  const theme = getZoneTheme(zoneId);

  return (
    <div className="help-menu-overlay" onClick={onClose}>
      <div 
        className="help-menu-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.helpBg,
          border: `4px solid ${theme.menuBorder}`,
          fontFamily: theme.fontFamilyBody
        }}
      >
        
        {/* HEADER */}
        <div className="help-menu-header">
          <h2 
            className="help-menu-title"
            style={{
              fontFamily: theme.fontFamily,
              color: theme.textPrimary
            }}
          >
            Need Help?
          </h2>
          <button 
            className="help-menu-close" 
            onClick={onClose}
            aria-label="Close help menu"
            style={{
              border: `3px solid ${theme.accentColor}`,
              background: 'white',
              color: theme.textPrimary
            }}
          >
            ✕
          </button>
        </div>

        {/* SCENE-SPECIFIC VISUAL GUIDE */}
        {hints.length > 0 && (
          <>
            <div className="help-section">
              <h3 
                className="help-section-title"
                style={{
                  fontFamily: theme.fontFamily,
                  color: theme.textPrimary
                }}
              >
                What to Tap in {sceneName}:
              </h3>
              
              <div className="help-hints-grid">
                {hints.map((hint, index) => (
                  <div 
                    key={index} 
                    className="help-game-hint"
                    style={{
                      background: theme.helpCardBg,
                      border: `3px solid ${theme.helpCardBorder}`
                    }}
                  >
                    <div 
                      className="help-hint-icon-container"
                      style={{
                        background: theme.helpHintIconBg,
                        border: `2px solid ${theme.accentColor}`
                      }}
                    >
                      <img 
                        src={hint.image} 
                        alt={hint.name}
                        className="help-hint-icon"
                      />
                    </div>
                    <div className="help-hint-text">
                      <div 
                        className="help-hint-name"
                        style={{
                          fontFamily: theme.fontFamily,
                          color: theme.textPrimary
                        }}
                      >
                        {hint.name}
                      </div>
                      <div 
                        className="help-hint-description"
                        style={{ color: theme.textSecondary }}
                      >
                        {hint.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div 
              className="help-menu-divider"
              style={{
                background: `linear-gradient(to right, transparent, ${theme.accentColor}, transparent)`
              }}
            />
          </>
        )}

        {/* GENERAL TIPS */}
        {generalTips.length > 0 && (
          <>
            <div className="help-section">
              <h3 
                className="help-section-title"
                style={{
                  fontFamily: theme.fontFamily,
                  color: theme.textPrimary
                }}
              >
                💡 Helpful Tips:
              </h3>
              <ul className="help-tips-list">
                {generalTips.map((tip, index) => (
                  <li 
                    key={index} 
                    className="help-tip-item"
                    style={{ color: theme.textPrimary }}
                  >
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            
            <div 
              className="help-menu-divider"
              style={{
                background: `linear-gradient(to right, transparent, ${theme.accentColor}, transparent)`
              }}
            />
          </>
        )}

        {/* UNIVERSAL NAVIGATION OPTIONS */}
        <div className="help-section">
          <h3 
            className="help-section-title"
            style={{
              fontFamily: theme.fontFamily,
              color: theme.textPrimary
            }}
          >
            What do you want to do?
          </h3>
          
          <div className="help-menu-options">
            
            {/* Go Back to Map */}
            <button 
              className="help-option-button"
              onClick={() => {
                onClose();
                setTimeout(() => onNavigate?.('map'), 100);
              }}
              style={{
                background: theme.buttonBg,
                border: `3px solid ${theme.accentColor}`,
                color: theme.textPrimary
              }}
            >
              <span className="help-option-icon">🏠</span>
              <div className="help-option-text">
                <div className="help-option-title">Go Back to Map</div>
                <div 
                  className="help-option-subtitle"
                  style={{ color: theme.textSecondary }}
                >
                  Leave this game
                </div>
              </div>
            </button>

            {/* Restart Game */}
            <button 
              className="help-option-button"
              onClick={() => {
                onClose();
                resetScene?.();
              }}
              style={{
                background: theme.buttonBg,
                border: `3px solid ${theme.accentColor}`,
                color: theme.textPrimary
              }}
            >
              <span className="help-option-icon">🔄</span>
              <div className="help-option-text">
                <div className="help-option-title">Start Over</div>
                <div 
                  className="help-option-subtitle"
                  style={{ color: theme.textSecondary }}
                >
                  Play this game from the beginning
                </div>
              </div>
            </button>

            {/* Pick Another Game */}
            <button 
              className="help-option-button"
              onClick={() => {
                onClose();
                onNavigate?.('zones');
              }}
              style={{
                background: theme.buttonBg,
                border: `3px solid ${theme.accentColor}`,
                color: theme.textPrimary
              }}
            >
              <span className="help-option-icon">🎮</span>
              <div className="help-option-text">
                <div className="help-option-title">Try Different Game</div>
                <div 
                  className="help-option-subtitle"
                  style={{ color: theme.textSecondary }}
                >
                  See all activities
                </div>
              </div>
            </button>

            {/* Sound Toggle */}
            <button 
              className="help-option-button"
              onClick={() => {
                onSoundToggle?.();
              }}
              style={{
                background: theme.buttonBg,
                border: `3px solid ${theme.accentColor}`,
                color: theme.textPrimary
              }}
            >
              <span className="help-option-icon">{isAudioOn ? '🔊' : '🔇'}</span>
              <div className="help-option-text">
                <div className="help-option-title">
                  Turn Sound {isAudioOn ? 'Off' : 'On'}
                </div>
                <div 
                  className="help-option-subtitle"
                  style={{ color: theme.textSecondary }}
                >
                  {isAudioOn ? 'Make it quiet' : 'Turn on sounds'}
                </div>
              </div>
            </button>

            {/* Ask a Grown-up */}
            <button 
              className="help-option-button parent-option"
              onClick={() => {
                onClose();
                console.log('Open parent zone');
              }}
              style={{
                background: theme.parentBg,
                border: `3px solid ${theme.parentBorder}`,
                color: theme.textPrimary
              }}
            >
              <span className="help-option-icon">👪</span>
              <div className="help-option-text">
                <div className="help-option-title">Ask a Grown-up</div>
                <div 
                  className="help-option-subtitle"
                  style={{ color: theme.textSecondary }}
                >
                  For parents
                </div>
              </div>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpMenu;