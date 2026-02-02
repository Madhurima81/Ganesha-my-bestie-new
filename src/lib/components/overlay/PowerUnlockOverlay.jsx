import React, { useState, useEffect, useRef } from 'react';
import './PowerUnlockOverlay.css';

/**
 * PowerUnlockOverlay Component
 *
 * Single-screen discovery overlay with glowing card design.
 * Shows power icon with glow effect, title, description, and VO-gated button.
 *
 * @param {Object} props
 * @param {string} props.title - Power title (e.g., "Focus Power Unlocked!")
 * @param {string} props.description - Power description text
 * @param {string} props.icon - Power icon image URL
 * @param {string} props.iconColor - Glow color for the icon (default: '#FFD700')
 * @param {string} props.buttonText - Button text (default: "Continue")
 * @param {boolean} props.showButton - External control for button visibility (VO-gated)
 * @param {function} props.onShow - Callback when overlay appears (for triggering VO)
 * @param {function} props.onComplete - Callback when user clicks button
 */
const PowerUnlockOverlay = ({
  title,
  description,
  icon,
  iconColor = '#FFD700',
  buttonText = 'Continue',
  showButton = false,
  onShow,
  onComplete
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [iconAnimated, setIconAnimated] = useState(false);
  const hasCalledOnShow = useRef(false);

  // Fade in on mount - only call onShow ONCE
  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsVisible(true), 50);
    const iconTimer = setTimeout(() => setIconAnimated(true), 300);

    // Notify parent that overlay is shown (for VO trigger) - ONLY ONCE
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
  }, []); // Empty deps - only run once on mount

  const handleContinue = () => {
    setIsVisible(false);
    setTimeout(() => onComplete?.(), 300);
  };

  return (
    <div className={`power-overlay ${isVisible ? 'visible' : ''}`}>
      {/* Backdrop */}
      <div className="power-backdrop" />

      {/* Floating particles */}
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

      {/* Content */}
      <div className="power-content">
        {/* Icon with glow */}
        <div className={`power-icon-wrapper ${iconAnimated ? 'animated' : ''}`}>
          {/* Glow layers */}
          <div
            className="power-glow-outer"
            style={{ '--glow-color': iconColor }}
          />
          <div
            className="power-glow-inner"
            style={{ '--glow-color': iconColor }}
          />

          {/* Light rays */}
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

          {/* Icon */}
          <div className="power-icon">
            <img src={icon} alt={title} />
          </div>
        </div>

        {/* Title */}
        <h1 className="power-title">{title}</h1>

        {/* Description */}
        <p className="power-description">{description}</p>

        {/* VO-Gated Button */}
        {showButton && (
          <button
            className="power-button"
            onClick={handleContinue}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default PowerUnlockOverlay;
