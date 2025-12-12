import React, { useState, useEffect } from 'react';
import './DiscoveryFlip.css';

/**
 * DiscoveryFlip Component
 * 
 * A reusable page-flip storybook component for discovery moments.
 * Shows two pages: celebration (left) and power unlock/mission (right)
 * 
 * @param {Object} props
 * @param {string} props.celebrationTitle - Title for left page (e.g., "You Found Mooshika!")
 * @param {string} props.celebrationText - Description text for left page
 * @param {string} props.celebrationImage - Image URL/component for left page
 * @param {string} props.powerTitle - Title for right page (e.g., "Divine Guidance Power Unlocked!")
 * @param {string} props.powerText - Mission text for right page
 * @param {string} props.powerImage - Image URL/component for right page (power symbol, character, etc.)
 * @param {string} props.buttonText - Text for continue button (default: "Continue Adventure")
 * @param {function} props.onContinue - Callback when continue button is clicked
 * @param {boolean} props.autoFlip - Auto flip after delay (default: false)
 * @param {number} props.autoFlipDelay - Delay before auto flip in ms (default: 2000)
 */
const DiscoveryFlip = ({
  celebrationTitle,
  celebrationText,
  celebrationImage,
  powerTitle,
  powerText,
  powerImage,
  buttonText = "Continue Adventure",
  onContinue,
  autoFlip = false,
  autoFlipDelay = 2000
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    // Show entrance animation
    setShowSparkles(true);
    
    // Auto flip if enabled
    if (autoFlip && !isFlipped) {
      const timer = setTimeout(() => {
        handleFlip();
      }, autoFlipDelay);
      return () => clearTimeout(timer);
    }
  }, [autoFlip, autoFlipDelay, isFlipped]);

  const handleFlip = () => {
    // Play page turn sound (you can add audio here)
    setIsFlipped(true);
    setShowSparkles(true);
    
    // Remove sparkles after animation
    setTimeout(() => setShowSparkles(false), 1000);
  };

  return (
    <div className="discovery-flip-container">
      {/* Background overlay with blur */}
      <div className="discovery-flip-backdrop" />
      
      {/* Sparkle effects */}
      {showSparkles && (
        <div className="sparkle-container">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`sparkle sparkle-${i}`}>✨</div>
          ))}
        </div>
      )}

      {/* Book container */}
      <div className={`discovery-book ${isFlipped ? 'flipped' : ''}`}>
        
        {/* LEFT PAGE - Celebration */}
        <div className="book-page page-left">
          <div className="page-content">
            {/* Decorative border */}
            <div className="page-border">
              <div className="border-corner border-top-left">🌸</div>
              <div className="border-corner border-top-right">🌸</div>
              <div className="border-corner border-bottom-left">🌸</div>
              <div className="border-corner border-bottom-right">🌸</div>
            </div>

            <h1 className="page-title celebration-title">{celebrationTitle}</h1>
            
            <div className="page-image-container">
              {typeof celebrationImage === 'string' ? (
                <img src={celebrationImage} alt="Celebration" className="page-image celebration-image" />
              ) : (
                celebrationImage
              )}
            </div>

            <p className="page-text celebration-text">{celebrationText}</p>

            {/* Page turn indicator (only show if not flipped) */}
            {!isFlipped && (
              <div className="page-turn-hint" onClick={handleFlip}>
                <div className="page-curl">📖</div>
                <p className="turn-text">Turn page →</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PAGE - Power/Mission (flips in) */}
        <div className="book-page page-right">
          <div className="page-content">
            {/* Decorative border */}
            <div className="page-border">
              <div className="border-corner border-top-left">⭐</div>
              <div className="border-corner border-top-right">⭐</div>
              <div className="border-corner border-bottom-left">⭐</div>
              <div className="border-corner border-bottom-right">⭐</div>
            </div>

            <h1 className="page-title power-title">{powerTitle}</h1>
            
            <div className="page-image-container power-glow">
              {typeof powerImage === 'string' ? (
                <img src={powerImage} alt="Power" className="page-image power-image" />
              ) : (
                powerImage
              )}
            </div>

            <p className="page-text power-text">{powerText}</p>

            {/* Continue button (only show after flip) */}
            {isFlipped && (
              <button 
                className="continue-button"
                onClick={onContinue}
              >
                {buttonText}
              </button>
            )}
          </div>
        </div>

        {/* Flipping page (middle layer for animation) */}
        <div className="book-page page-flip">
          <div className="page-flip-front">
            <div className="page-content">
              <h1 className="page-title celebration-title">{celebrationTitle}</h1>
              <div className="page-image-container">
                {typeof celebrationImage === 'string' ? (
                  <img src={celebrationImage} alt="Celebration" className="page-image" />
                ) : (
                  celebrationImage
                )}
              </div>
              <p className="page-text">{celebrationText}</p>
            </div>
          </div>
          <div className="page-flip-back">
            <div className="page-content">
              <h1 className="page-title power-title">{powerTitle}</h1>
              <div className="page-image-container power-glow">
                {typeof powerImage === 'string' ? (
                  <img src={powerImage} alt="Power" className="page-image" />
                ) : (
                  powerImage
                )}
              </div>
              <p className="page-text">{powerText}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skip option for advanced users (subtle) */}
      {!isFlipped && (
        <button 
          className="skip-button"
          onClick={handleFlip}
        >
          Skip →
        </button>
      )}
    </div>
  );
};

export default DiscoveryFlip;