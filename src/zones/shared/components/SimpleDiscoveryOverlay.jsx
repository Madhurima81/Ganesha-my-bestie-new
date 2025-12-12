import React, { useState, useEffect } from 'react';
import './SimpleDiscoveryOverlay.css';

/**
 * SimpleDiscoveryOverlay Component
 * 
 * A clean, story-focused discovery overlay that shows celebration and mission moments.
 * Uses simple fade transitions instead of complex page flips.
 * Perfect for kids 6-7 years old - clear, focused, not overwhelming.
 * 
 * Flow:
 * 1. Celebration moment (auto-advances after delay)
 * 2. Mission/Power moment (button to continue)
 * 
 * @param {Object} props
 * @param {string} props.celebrationTitle - Title for celebration (e.g., "You Found Mooshika!")
 * @param {string} props.celebrationText - Celebration description text
 * @param {string|JSX} props.celebrationImage - Image or component for celebration
 * @param {string} props.powerTitle - Title for power/mission (e.g., "Divine Guidance Power Unlocked!")
 * @param {string} props.powerText - Mission description text
 * @param {string|JSX} props.powerIcon - Power icon/symbol image or component
 * @param {string} props.buttonText - Text for continue button (default: "Continue Adventure")
 * @param {function} props.onComplete - Callback when user clicks continue button
 * @param {number} props.celebrationDuration - How long to show celebration before power (default: 2500ms)
 * @param {boolean} props.showSparkles - Show sparkle animations (default: true)
 */
const SimpleDiscoveryOverlay = ({
  celebrationTitle,
  celebrationText,
  celebrationImage,
  powerTitle,
  powerText,
  powerIcon,
  buttonText = "Continue Adventure",
  onComplete,
  celebrationDuration = 2500,
  showSparkles = true
}) => {
  const [stage, setStage] = useState('celebration'); // 'celebration' or 'power'
  const [isVisible, setIsVisible] = useState(false);

  /*useEffect(() => {
    // Fade in
    setTimeout(() => setIsVisible(true), 50);

    // Auto-advance from celebration to power
    if (stage === 'celebration') {
      const timer = setTimeout(() => {
        setStage('power');
      }, celebrationDuration);
      return () => clearTimeout(timer);
    }
  }, [stage, celebrationDuration]);*/

  useEffect(() => {
  // Fade in only
  setTimeout(() => setIsVisible(true), 50);
}, []);

  const handleContinue = () => {
    // Fade out before calling onComplete
    setIsVisible(false);
    setTimeout(() => {
      onComplete?.();
    }, 300);
  };

  return (
    <div className={`discovery-overlay ${isVisible ? 'visible' : ''}`}>
      {/* Dark backdrop with blur - different opacity per stage */}
      <div className={`discovery-backdrop ${stage === 'celebration' ? 'celebration-backdrop' : 'power-backdrop'}`} />

      {/* Sparkles */}
      {showSparkles && (
        <div className="discovery-sparkles">
          {[...Array(15)].map((_, i) => (
            <div key={i} className={`sparkle sparkle-${i % 5}`}>✨</div>
          ))}
        </div>
      )}

      {/* Celebration Stage - TAP ANYWHERE */}
{/* Celebration Stage - TAP ANYWHERE */}
{stage === 'celebration' && (
  <>
    {/* INVISIBLE FULL-SCREEN CLICK LAYER */}
    <div
      onClick={() => setStage('power')}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999,
        cursor: 'pointer'
      }}
    />
    
    {/* VISUAL CONTENT */}
    <div className="discovery-content celebration-stage">
      {/* Title */}
      <h1 className="discovery-title celebration-title">
        {celebrationTitle}
      </h1>

      {/* Image */}
      <div className="discovery-image-container">
        {typeof celebrationImage === 'string' ? (
          <img 
            src={celebrationImage} 
            alt="Celebration" 
            className="discovery-image celebration-image"
          />
        ) : (
          celebrationImage
        )}
      </div>

      {/* Text */}
      <p className="discovery-text celebration-text">
        {celebrationText}
      </p>

      {/* Tap anywhere hint */}
      <p className="tap-hint">
        Tap anywhere to see what it is!
      </p>

      {/* Progress indicator */}
      <div className="stage-indicator">
        <div className="dot active"></div>
        <div className="dot"></div>
      </div>
    </div>
  </>
)}

      {/* Power/Mission Stage */}
      {stage === 'power' && (
        <div className="discovery-content power-stage">
          {/* Title */}
          <h1 className="discovery-title power-title">
            {powerTitle}
          </h1>

          {/* Power Icon with glow */}
          <div className="discovery-icon-container">
            <div className="power-glow" />
            {typeof powerIcon === 'string' ? (
              <img 
                src={powerIcon} 
                alt="Power Icon" 
                className="discovery-icon power-icon"
              />
            ) : (
              powerIcon
            )}
          </div>

          {/* Text */}
          <p className="discovery-text power-text">
            {powerText}
          </p>

          {/* Continue Button */}
          <button 
            className="discovery-button"
            onClick={handleContinue}
          >
            {buttonText}
          </button>

          {/* Progress indicator */}
          <div className="stage-indicator">
            <div className="dot"></div>
            <div className="dot active"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleDiscoveryOverlay;