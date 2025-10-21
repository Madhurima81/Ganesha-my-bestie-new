// zones/shloka-river/shared/SanskritWordMission.jsx
import React, { useState, useEffect } from 'react';
import './SanskritWordMission.css';

const SanskritWordMission = ({
  show,
  word, // 'vakratunda' or 'mahakaya'
  beforeImage,
  afterImage,
  powerConfig,
  onComplete,
  onCancel
}) => {
  const [rescuePhase, setRescuePhase] = useState('problem');
  const [showParticles, setShowParticles] = useState(false);
  const [syllableProgress, setSyllableProgress] = useState([]);

  useEffect(() => {
    if (show) {
      setRescuePhase('problem');
      setShowParticles(false);
      setSyllableProgress([]);
    }
  }, [show, word]);

  const syllables = {
    vakratunda: ['va', 'kra', 'tun', 'da'],
    mahakaya: ['ma', 'ha', 'ka', 'ya']
  };

  const messages = {
    vakratunda: {
      problem: "Help! I'm trapped by rigid vines!",
      action: "Flexibility power is flowing...",
      success: "Thank you! I can move freely now!"
    },
    mahakaya: {
      problem: "I'm too weak to break free!",
      action: "Inner strength is building...",
      success: "Amazing! I feel so powerful!"
    }
  };

  const handleSyllableClick = (syllable) => {
    const wordSyllables = syllables[word];
    const nextSyllable = wordSyllables[syllableProgress.length];
    
    if (syllable === nextSyllable) {
      const newProgress = [...syllableProgress, syllable];
      setSyllableProgress(newProgress);
      
      // Play audio if available
      if (window.playSanskritAudio) {
        window.playSanskritAudio(syllable);
      }
      
      // If complete, start rescue
      if (newProgress.length === wordSyllables.length) {
        setTimeout(() => {
          setRescuePhase('action');
          setShowParticles(true);

             // 🎵 PLAY THE FULL WORD when power activates
    if (window.playSanskritWord) {
      window.playSanskritWord(word);
    }
          
          setTimeout(() => {
            setShowParticles(false);
            setRescuePhase('success');
          }, 3000);
        }, 500);
      }
    }
  };

  const handleComplete = () => {
    onComplete?.(word);
  };

  if (!show) return null;

  const currentMessages = messages[word] || messages.vakratunda;
  const wordSyllables = syllables[word] || [];

  return (
    <div className="sanskrit-word-mission">
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

        {/* Chant Instructions */}
        {rescuePhase === 'problem' && (
          <div className="chant-instruction">
            Chant <strong>{word.toUpperCase()}</strong> to unlock the power!
          </div>
        )}

        {/* Syllable Buttons */}
        {rescuePhase === 'problem' && (
          <div className="syllable-chant-buttons">
            {wordSyllables.map((syl, idx) => (
              <button
                key={syl}
                className={`syllable-chant-btn ${
                  syllableProgress.includes(syl) ? 'completed' : ''
                } ${syllableProgress.length === idx ? 'active' : ''}`}
                onClick={() => handleSyllableClick(syl)}
                disabled={syllableProgress.length !== idx}
              >
                {syl.toUpperCase()}
              </button>
            ))}
          </div>
        )}

{/* Power App Image Flowing */}
{showParticles && powerConfig?.image && (
  <div className="power-flowing-container">
    <img 
      src={powerConfig.image} 
      alt="Power" 
      className="power-app-image"
    />
    <div className="power-glow" style={{ 
      background: `radial-gradient(circle, ${powerConfig.color}80, transparent)`
    }} />
  </div>
)}

{rescuePhase === 'success' && (
  <button 
    className="mission-complete-btn"
    onClick={handleComplete}
  >
    {word === 'mahakaya' ? 'Complete Scene! ⭐' : 'Continue Adventure'}
  </button>
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

export default SanskritWordMission;
