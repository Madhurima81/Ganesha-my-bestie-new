// lib/components/missions/SaveAnimalMission.jsx - MODAL STYLE REDESIGN
import React, { useState, useEffect } from 'react';
import HelperSignatureAnimation from '../animation/HelperSignatureAnimation';
import './SaveAnimalMission.css';

const SaveAnimalMission = ({
  show,
  word,
  beforeImage,
  afterImage,
  powerConfig,
  smartwatchBase,
  smartwatchScreen,
  appImage,
  onComplete,
  onCancel,
  
  // Reload support props
  isReload = false,
  initialRescuePhase = 'problem',
  initialShowParticles = false,
  missionJustCompleted = false,
  onSaveMissionState
}) => {
  const [rescuePhase, setRescuePhase] = useState('problem');
  const [showParticles, setShowParticles] = useState(false);

  // Handle reload state restoration
  useEffect(() => {
    if (show && isReload) {
      console.log('🔄 Save Animal Mission: Restoring state from reload', {
        initialRescuePhase,
        initialShowParticles,
        missionJustCompleted
      });
      
      setRescuePhase(initialRescuePhase);
      setShowParticles(initialShowParticles);
      
      if (missionJustCompleted) {
        setTimeout(() => {
          handleRescueComplete();
        }, 1000);
      }
    } else if (show) {
      console.log('🎯 Save Animal Mission: Fresh start for', word);
      setRescuePhase('problem');
      setShowParticles(false);
    }
  }, [show, word, isReload]);

  // Save state for reload support
  const saveMissionState = (additionalState = {}) => {
    const currentState = {
      rescuePhase,
      showParticles,
      word,
      ...additionalState
    };
    
    if (onSaveMissionState) {
      onSaveMissionState(currentState);
    }
  };

  const handleRescueAction = () => {
    console.log('🔥 RESCUE ACTION: Using power to help');
    setRescuePhase('action');
    saveMissionState({ rescuePhase: 'action' });
    
    setShowParticles(true);
    saveMissionState({ rescuePhase: 'action', showParticles: true });
    
    setTimeout(() => {
      setShowParticles(false);
      setRescuePhase('success');
      saveMissionState({ rescuePhase: 'success', showParticles: false });
    }, 3000);
  };

  const handleRescueComplete = () => {
    console.log('✅ Rescue complete for:', word);
    saveMissionState({ missionJustCompleted: true });
    onComplete?.(word);
  };

  const handleCancel = () => {
    onCancel?.();
  };

  if (!show) return null;

  // Message objects
  const problemMessages = {
    nirvighnam: "Help! I want to eat that fruit!",
    kurumedeva: "I'm so frightened, please help me!",
    vakratunda: "Help! I want to eat that fruit!",
    mahakaya: "I'm so frightened, please help me!",
    suryakoti: "It's so dark, I can't see anything!",
    samaprabha: "I'm lost in this gloomy forest!"
  };

  const actionMessages = {
    nirvighnam: "My sacred wisdom is flowing to you!",
    kurumedeva: "Feel my divine grace!",
    vakratunda: "My flexibility is flowing to you!",
    mahakaya: "Feel my inner strength!",
    suryakoti: "My solar clarity is shining on you!",
    samaprabha: "My radiant light is guiding you!"
  };

  const successMessages = {
    nirvighnam: "Thank you! I feel so wise now!",
    kurumedeva: "Your grace helped me feel blessed!",
    vakratunda: "Thank you! I feel so brave now!",
    mahakaya: "Your strength helped me feel safe!",
    suryakoti: "Amazing! Now I can see clearly!",
    samaprabha: "Wonderful! The path is bright now!"
  };

  const buttonTexts = {
    nirvighnam: "Amazing! Continue Learning",
    kurumedeva: "Awesome! End Scene",
    vakratunda: "Amazing! Continue Learning",
    mahakaya: "Awesome! End Scene",
    suryakoti: "Brilliant! Continue Learning", 
    samaprabha: "Radiant! End Scene"
  };

  return (
  <div className="save-animal-mission">
    
    {/* Main Container - Wide Gradient Box */}
    <div className="mission-container">
      
      {/* LEFT SIDE - Smartwatch + App */}
      <div className="mission-left-side">
        
        {/* Smartwatch */}
        <div className="mission-smartwatch">
          <img 
            src={smartwatchBase}
            alt="Smartwatch Base"
            className="smartwatch-base"
          />
          
          <img 
            src={smartwatchScreen}
            alt="Screen"
            className="smartwatch-screen"
          />
          
          <img 
            src={appImage}
            alt="Power App"
            onClick={(e) => {
              e.stopPropagation();
              if (rescuePhase === 'problem') {
                handleRescueAction();
              }
            }}
            className={`smartwatch-app ${rescuePhase === 'problem' ? 'pulsing' : ''}`}
            style={{
              filter: rescuePhase === 'problem' 
                ? `drop-shadow(0 0 15px ${powerConfig?.color || '#FFD700'}) brightness(1.4)` 
                : 'none'
            }}
          />
        </div>
        
        {/* Instruction Bubble - Shows during problem phase */}
        {rescuePhase === 'problem' && (
          <div className="instruction-bubble">
            Tap your {powerConfig?.name || 'Power'} app!
            <div className="instruction-pointer" />
          </div>
        )}
      </div>

      {/* RIGHT SIDE - Animal Scene */}
      <div className="mission-right-side">
        
        {rescuePhase === 'problem' && (
          <div className="mission-scene">
            <img 
              src={beforeImage}
              alt="Animal in trouble"
              className="mission-animal-image"
            />
            
            <div className="animal-speech-bubble">
              <div className="speech-text">
                {problemMessages[word] || "Help me, please!"}
              </div>
              <div className="speech-pointer" />
            </div>
          </div>
        )}

        {rescuePhase === 'action' && (
          <div className="mission-scene">
            <img 
              src={beforeImage}
              alt="Using power to help"
              className="mission-animal-image glowing"
            />
            
            <div className="child-speech-bubble">
              <div className="speech-text">
                {actionMessages[word] || "My power is helping you!"}
              </div>
              <div className="speech-pointer-child" />
            </div>
            
            <HelperSignatureAnimation
              helperId={word === 'vakratunda' ? 'snuggyshawl' : 'hammerhero'}
              fromPosition={{ x: 80, y: 80 }}
              toPosition={{ x: 20, y: 30 }}
              onAnimationComplete={() => {
                setTimeout(() => {
                  setRescuePhase('success');
                  saveMissionState({ rescuePhase: 'success' });
                }, 1000);
              }}
            />
          </div>
        )}

        {rescuePhase === 'success' && (
          <div className="mission-scene">
            <img 
              src={afterImage}
              alt="Happy rescued animal"
              className="mission-animal-image celebrating"
            />
            
            <div className="animal-speech-bubble success">
              <div className="speech-text">
                {successMessages[word] || "Thank you for helping me!"}
              </div>
              <div className="speech-pointer" />
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM SECTION - Complete Button */}
      {rescuePhase === 'success' && (
        <div className="mission-bottom-section">
          <button 
            className="mission-complete-btn"
            onClick={handleRescueComplete}
          >
            {buttonTexts[word] || "Continue!"}
          </button>
        </div>
      )}

      {/* Power Particles Effect */}
      {showParticles && (
        <div className="power-particles">
          {Array.from({length: 8}).map((_, i) => (
            <div 
              key={i} 
              className="particle"
              style={{ 
                '--delay': `${i * 0.3}s`,
                color: powerConfig?.color || '#FFD700'
              }}
            >
              {powerConfig?.icon || '✨'}
            </div>
          ))}
        </div>
      )}

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

export default SaveAnimalMission;