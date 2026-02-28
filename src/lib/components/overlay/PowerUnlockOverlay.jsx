import React, { useState, useEffect, useRef } from 'react';
import './PowerUnlockOverlay.css';
import { getZoneTheme } from '../../config/ZoneThemes';

/**
 * PowerUnlockOverlay Component
 *
 * @param {Object} props
 * @param {string} props.title - Power title
 * @param {string|Object} props.description - Description text or object with {main: string[], emphasis: string}
 * @param {string} props.icon - Icon URL
 * @param {string} props.iconColor - Glow color
 * @param {string} props.buttonText - Button text
 * @param {boolean} props.showButton - Button visibility
 * @param {boolean} props.showPlayAgain - Show play again button (for shloka-river zone)
 * @param {string} props.playAgainText - Play again button text
 * @param {function} props.onShow - Callback when shown
 * @param {function} props.onComplete - Callback on complete
 * @param {function} props.onPlayAgain - Callback for play again
 */
const PowerUnlockOverlay = ({
  title,
  description,
  icon,
  iconColor = '#FFD700',
  zoneId = 'symbol-mountain',
  buttonText = 'Continue',
  showButton = false,
  showPlayAgain = false,
  playAgainText = 'Play Again',
  onShow,
  onComplete,
  onPlayAgain
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [iconAnimated, setIconAnimated] = useState(true);
  // Two-phase: icon blooms first, description + button fade in after delay
  const [isCelebrationPhase, setIsCelebrationPhase] = useState(true);
  const hasCalledOnShow = useRef(false);
  const zoneTheme = getZoneTheme(zoneId);
  const zoneThemeVars = {
    '--zone-accent-color': zoneTheme.accentColor,
    '--zone-glow-color': zoneTheme.glowColor
  };

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsVisible(true), 50);
    // After 1.5s: end celebration phase so description + button fade in
    const celebrationTimer = setTimeout(() => setIsCelebrationPhase(false), 1500);
    let showTimer;
    if (!hasCalledOnShow.current && onShow) {
      hasCalledOnShow.current = true;
      showTimer = setTimeout(() => onShow(), 100);
    }

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(celebrationTimer);
      if (showTimer) clearTimeout(showTimer);
    };
  }, []);

  const handleContinue = () => {
    setIsVisible(false);
    setTimeout(() => onComplete?.(), 300);
  };

  const handlePlayAgain = () => {
    setIsVisible(false);
    setTimeout(() => onPlayAgain?.(), 300);
  };

  // Render description based on type
  const renderDescription = () => {
    // If description is an object with main and emphasis
    if (typeof description === 'object' && description.main) {
      return (
        <div className="power-description-container">
          {description.main.map((text, index) => (
            <p key={index} className="power-description-main">
              {text}
            </p>
          ))}
          {description.emphasis && (
            <p className="power-description-emphasis">
              {description.emphasis}
            </p>
          )}
        </div>
      );
    }
    
    // Fallback to simple string
    return <p className="power-description">{description}</p>;
  };

  return (
    <div className={`power-overlay ${isVisible ? 'visible' : ''} ${isCelebrationPhase ? 'celebration' : ''}`} style={zoneThemeVars}>
      <div className="power-backdrop" />

      <div className="power-particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              '--delay': `${Math.random() * 3}s`,
              '--x': `${Math.random() * 100}%`,
              '--duration': `${3 + Math.random() * 2}s`,
              '--color': iconColor
            }}
          />
        ))}
      </div>

      <div className="power-content">
        <div className={`power-icon-wrapper ${iconAnimated ? 'animated' : ''}`}>
          <div
            className="power-glow-outer"
            style={{ '--glow-color': iconColor }}
          />
          <div
            className="power-glow-inner"
            style={{ '--glow-color': iconColor }}
          />

          <div className="power-rays">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="ray"
                style={{
                  '--rotation': `${i * 45}deg`,
                  '--color': iconColor
                }}
              />
            ))}
          </div>

          <div className="power-icon">
            <img src={icon} alt={title} />
          </div>
        </div>

        <h1 className="power-title">{title}</h1>

        {/* Phase 2: description + button — hidden during celebration, fade in after 1.5s
            Inline styles guarantee override of any CSS class or keyframe animation */}
        <div
          style={{
            opacity: isCelebrationPhase ? 0 : 1,
            transform: isCelebrationPhase ? 'translateY(18px)' : 'translateY(0)',
            transition: 'opacity 0.65s ease-out, transform 0.65s ease-out',
            pointerEvents: isCelebrationPhase ? 'none' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            gap: 'inherit'
          }}
        >
          {renderDescription()}

          {showButton && (
            <div className="power-button-group">
              {showPlayAgain && (
                <button
                  className="power-button-secondary"
                  onClick={handlePlayAgain}
                >
                  🔄 {playAgainText}
                </button>
              )}
              <button
                className="power-button"
                onClick={handleContinue}
              >
                {buttonText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PowerUnlockOverlay;
