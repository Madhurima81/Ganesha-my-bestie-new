// lib/components/help/HelpMenu.jsx

import React from 'react';
import './HelpMenu.css';
import CloseButton from '../../../components/CloseButton';

const HelpMenu = ({
  show,
  onClose,
  helpConfig,
  sceneState,
  zoneId = 'symbol-mountain'
}) => {
  if (!show) return null;

  const hints = helpConfig?.getHints ? helpConfig.getHints(sceneState) : [];
  const tips = helpConfig?.generalTips || [];
  const mainHint = hints.length > 0 ? hints[0] : null;

  return (
    <div className="help-overlay" onClick={onClose}>
      <div
        className="help-card"
        data-zone={zoneId}
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton onClose={onClose} />

        <h2 className="help-title">Need Help?</h2>

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
