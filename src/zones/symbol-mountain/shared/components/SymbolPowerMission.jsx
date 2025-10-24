// zones/symbol-mountain/shared/components/SymbolPowerMission.jsx
import React, { useState, useEffect } from 'react';
import './SymbolPowerMission.css';

const SymbolPowerMission = ({
  show,
  symbolKey, // 'mooshika', 'modak', 'belly'
  beforeImage,
  afterImage,
  powerConfig,
  onComplete,
  onCancel
}) => {
  const [rescuePhase, setRescuePhase] = useState('problem');
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (show) {
      setRescuePhase('problem');
      setShowParticles(false);
    }
  }, [show, symbolKey]);

  const handleUsePower = () => {
    setRescuePhase('action');
    setShowParticles(true);
    
    setTimeout(() => {
      setShowParticles(false);
      setRescuePhase('success');
    }, 3000);
  };

  const handleComplete = () => {
    onComplete?.(symbolKey);
  };

  if (!show) return null;

  const messages = {
    mooshika: {
      problem: "Help! I'm stuck in this maze!",
      action: "Divine guidance is flowing...",
      success: "Thank you! Now I know the way!"
    },
    modak: {
      problem: "I'm so hungry and weak!",
      action: "Sweet blessings are coming...",
      success: "Yum! I feel so energized!"
    },
    belly: {
      problem: "I can't carry all my treasures!",
      action: "Cosmic container power activating...",
      success: "Amazing! Everything fits perfectly!"
    }
  };

  const currentMessages = messages[symbolKey] || messages.mooshika;

  return (
    <div className="symbol-power-mission">
   
      
      {/* Main content */}
      <div className="mission-scene-container">
        
        {/* Animal Image */}
        <div className="mission-animal-wrapper">
          <img 
            src={rescuePhase === 'success' ? afterImage : beforeImage}
            alt="Animal"
            className={`mission-animal ${rescuePhase}`}
          />
          
          {/* Speech Bubble */}
          <div className={`mission-speech-bubble ${rescuePhase}`}>
            <div className="speech-text">
              {currentMessages[rescuePhase]}
            </div>
            <div className="speech-pointer" />
          </div>
        </div>

        {/* Symbol Power Display */}
        {rescuePhase === 'problem' && (
          <div className="symbol-power-display" onClick={handleUsePower}>
            <img 
              src={powerConfig.image}
              alt={powerConfig.name}
              className="power-symbol pulsing"
            />
            <div className="power-instruction">
              Tap to use {powerConfig.name}!
            </div>
          </div>
        )}

        {/* Power Particles */}
        {showParticles && (
          <div className="power-particles">
            {Array.from({length: 8}).map((_, i) => (
              <img
                key={i}
                src={powerConfig.image}
                alt="particle"
                className="particle"
                style={{ 
                  '--delay': `${i * 0.3}s`,
                  filter: `drop-shadow(0 0 10px ${powerConfig.color})`
                }}
              />
            ))}
          </div>
        )}

        {/* Complete Button */}
        {rescuePhase === 'success' && (
          <button 
            className="mission-complete-btn"
            onClick={handleComplete}
          >
            Continue Adventure
          </button>
        )}

           {/* Darkening overlay 
      <div className="mission-overlay" />

        {/* Cancel Button */}
        {rescuePhase === 'problem' && onCancel && (
          <button 
            className="mission-cancel-btn" 
            onClick={onCancel}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default SymbolPowerMission;