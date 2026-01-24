// lib/components/help/HelpMenu.jsx

import React from 'react';
import './HelpMenu.css';

const HelpMenu = ({ 
  show,
  onClose, 
  helpConfig, // The modakHelpConfig object
  sceneState, // CRITICAL: The current state of the game (phase, basketFull, etc.)
  zoneId = 'symbol-mountain' 
}) => {
  if (!show) return null;

  // 1. Get Dynamic Hints based on the Scene State
  // The ?. check prevents crashes if props aren't ready
  const hints = helpConfig?.getHints ? helpConfig.getHints(sceneState) : [];
  
  // 2. Get Static Tips
  const tips = helpConfig?.generalTips || [];

  // We only show the MAIN hint (Priority 1) in the Hero Card to keep it simple
  const mainHint = hints.length > 0 ? hints[0] : null;

  return (
    <div className="help-overlay" onClick={onClose}>
      <div 
        className="help-card" 
        data-zone={zoneId} /* This injects the Cream BG and Yellow Border */
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button className="help-close" onClick={onClose}>✕</button>

        {/* Title */}
        <h2 className="help-title">Need Help?</h2>

        {/* SECTION A: What to Tap (HERO CARD) */}
        {mainHint && (
          <div className="help-hero-wrapper">
            <span className="help-section-label">What to Tap</span>
            
            <div className="help-hero-card">
              <div className="hero-image-circle">
                <img src={mainHint.image} alt={mainHint.name} className="hero-image" />
                <div className="tap-animation">👆</div> 
              </div>

              <div className="hero-text">
                <h3>{mainHint.name}</h3>
                <p>{mainHint.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION B: Helpful Tips (PILLS) */}
        {tips.length > 0 && (
          <div className="help-tips-wrapper">
            <span className="help-section-label">Helpful Tips</span>
            <div className="tips-grid">
              {tips.map((tip, index) => (
                <div key={index} className="tip-pill">
                  <span className="tip-icon">💡</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default HelpMenu;