import React, { useState, useEffect, useRef } from 'react';
import './PowerUnlockOverlay.css';

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
  buttonText = 'Continue',
  showButton = false,
  showPlayAgain = false,
  playAgainText = 'Play Again',
  onShow,
  onComplete,
  onPlayAgain
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [iconAnimated, setIconAnimated] = useState(false);
  const hasCalledOnShow = useRef(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsVisible(true), 50);
    const iconTimer = setTimeout(() => setIconAnimated(true), 300);

    let showTimer;
    if (!hasCalledOnShow.current && onShow) {
      hasCalledOnShow.current = true;
      showTimer = setTimeout(() => onShow(), 100);
    }

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(iconTimer);
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
    <div className={`power-overlay ${isVisible ? 'visible' : ''}`}>
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

        {/* Dynamic description rendering */}
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
  );
};

export default PowerUnlockOverlay;