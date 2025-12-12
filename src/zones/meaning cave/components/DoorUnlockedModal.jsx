// zones/cave-of-secrets/components/DoorUnlockedModal.jsx
import React from 'react';
import './DoorUnlockedModal.css';

const DoorUnlockedModal = ({ 
  show,
  title = "Door Unlocked!",
  symbolImage,              // The symbol/icon image
  description,              // Description text
  buttonText = "Start",     // Button text
  onStart,                  // Button click handler
  
  // 🎨 Customization Options
  titleColor = "#FF6B35",          // Title text color (orange in reference)
  buttonColor = "#FFA500",         // Button background color
  buttonTextColor = "#FFFFFF",     // Button text color
  cardBorderColor = "#FFA500",     // Card border glow color
  overlayOpacity = 0.85            // Background overlay darkness
}) => {
  if (!show) return null;

  return (
    <div 
      className="door-unlocked-overlay"
      style={{
        background: `rgba(0, 0, 0, ${overlayOpacity})`
      }}
    >
      <div 
        className="door-unlocked-card"
        style={{
          borderColor: cardBorderColor,
          boxShadow: `0 0 30px ${cardBorderColor}, 0 0 60px ${cardBorderColor}40`
        }}
      >
        {/* Title */}
        <h1 
          className="door-unlocked-title"
          style={{ color: titleColor }}
        >
          {title}
        </h1>
        
        {/* Symbol Icon */}
        {symbolImage && (
          <div className="door-unlocked-icon-container">
            <img 
              src={symbolImage} 
              alt="symbol" 
              className="door-unlocked-icon" 
            />
          </div>
        )}
        
        {/* Description */}
        <p className="door-unlocked-description">
          {description}
        </p>
        
        {/* Start Button */}
        <button 
          className="door-unlocked-button" 
          onClick={onStart}
          style={{
            background: buttonColor,
            color: buttonTextColor,
            boxShadow: `0 4px 15px ${buttonColor}60`
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default DoorUnlockedModal;