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

  const titles = {
    mooshika: {
      problem: "❤️ This Animal Needs Your Help!",
      success: "🎉 You Saved the Animal!"
    },
    modak: {
      problem: "❤️ This Animal Needs Your Help!",
      success: "🎉 You Saved the Animal!"
    },
    belly: {
      problem: "❤️ This Animal Needs Your Help!",
      success: "🎉 You Saved the Animal!"
    }
  };

  const descriptions = {
    mooshika: {
      problem: "They're lost and need guidance. Use your Divine Guidance to help.",
      success: "They found their way home — great job!"
    },
    modak: {
      problem: "They're tired and hungry. Use your Sweet Blessing to help.",
      success: "They feel energized again — great job!"
    },
    belly: {
      problem: "They can't carry all their treasures! Use your Cosmic Container to help.",
      success: "Everything fits perfectly — great job!"
    }
  };

  const currentMessages = messages[symbolKey] || messages.mooshika;
  const currentTitles = titles[symbolKey] || titles.mooshika;
  const currentDescriptions = descriptions[symbolKey] || descriptions.mooshika;

  return (
    <div className="symbol-mission-overlay">
      {/* Main Card */}
      <div className="symbol-mission-card">
        
        {/* Cancel Button */}
        {rescuePhase === 'problem' && onCancel && (
          <button 
            className="symbol-mission-btn-close" 
            onClick={onCancel}
            aria-label="Close"
          >
            ✕
          </button>
        )}

        {/* Title */}
        <h1 className="symbol-mission-title">
          {currentTitles[rescuePhase === 'success' ? 'success' : 'problem']}
        </h1>
        
        {/* Animal Image Section */}
        <div className="symbol-mission-image-wrapper">
            <div className="symbol-mission-image-container">
              <img 
                src={rescuePhase === 'success' ? afterImage : beforeImage}
                alt="Animal"
                className="symbol-mission-img"
              />
              
              {/* Speech Bubble */}
              <div className="symbol-mission-bubble">
                <div className="symbol-mission-bubble-text">
                  {currentMessages[rescuePhase]}
                </div>
              </div>
            </div>
        </div>

        {/* Description Text */}
        <p className="symbol-mission-desc">
          {currentDescriptions[rescuePhase === 'success' ? 'success' : 'problem']}
        </p>

        {/* Power Particles */}
    {/* Power Particles Container */}
{showParticles && (
  <div className="symbol-power-particles">
    {Array.from({length: 12}).map((_, i) => ( /* Increased to 12 particles for more effect */
      <div
        key={i}
        className="symbol-particle"
        style={{ 
          '--delay': `${i * 0.15}s` /* Faster sequence */
        }}
      >
         <img src={powerConfig.image} alt="particle" />
      </div>
    ))}
  </div>
)}

        {/* Action Button - Problem State */}
        {rescuePhase === 'problem' && (
          <button 
            className="symbol-mission-btn-action"
            onClick={handleUsePower}
          >
            <span>👍</span> Use {powerConfig.name}!
          </button>
        )}

        {/* Complete Button - Success State */}
{/* Complete Button - Success State */}
        {rescuePhase === 'success' && (
          <button 
            className="symbol-mission-btn-success"
            onClick={handleComplete}
          >
            {/* If it's the Belly (last mission), show End Scene, otherwise Continue */}
            {symbolKey === 'belly' ? "Level Complete" : "Continue Adventure"}
          </button>
        )}
      </div>
    </div>
  );
};

export default SymbolPowerMission;