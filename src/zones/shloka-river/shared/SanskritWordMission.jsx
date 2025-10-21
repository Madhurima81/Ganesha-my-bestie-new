// zones/shloka-river/shared/SanskritWordMission.jsx
import React, { useState, useEffect } from 'react';
import './SanskritWordMission.css';

const SanskritWordMission = ({
  show,
  word, // 'vakratunda', 'mahakaya', 'suryakoti', 'samaprabha', 'nirvighnam', 'kurumedeva', etc.
  beforeImage,
  afterImage,
  powerConfig,
  onComplete,
  onCancel,
  isFinalWordInScene = false // NEW PROP: To control the button text
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

  // EXPANDED: Syllables for all 8 words
  const syllables = {
    vakratunda: ['va', 'kra', 'tun', 'da'],
    mahakaya: ['ma', 'ha', 'ka', 'ya'],
    suryakoti: ['sur', 'ya', 'ko', 'ti'],
    samaprabha: ['sa', 'ma', 'pra', 'bha'],
    nirvighnam: ['nir', 'vigh', 'nam'],
    kurumedeva: ['kuru', 'me', 'de', 'va'],
    sarvakaryeshu: ['sar', 'va', 'kar', 'yeshu'],
    sarvada: ['sar', 'va', 'da'],
    default: [] // Fallback
  };

  // EXPANDED: Messages for all 8 words
  const messages = {
    vakratunda: {
      problem: "Help! I'm trapped by rigid vines!",
      action: "Flexibility power is flowing...",
      success: "Thank you! I can move freely now!"
    },
    mahakaya: {
      problem: "I'm too weak to break this rock!",
      action: "Inner strength is building...",
      success: "Amazing! I feel so powerful!"
    },
    suryakoti: {
        problem: "It's so dark... I can't find my way!",
        action: "Brilliance Power is lighting the path...",
        success: "Wow! It's as bright as a thousand suns!"
    },
    samaprabha: {
        problem: "My colors are all dull and faded!",
        action: "Splendor Power is restoring the glow...",
        success: "I'm shining beautifully again! Thank you!"
    },
    nirvighnam: {
      problem: "This heavy log is blocking my home!",
      action: "Sacred Wisdom is clearing the obstacle...",
      success: "The path is clear! You removed the obstacle!"
    },
    kurumedeva: {
      problem: "My nest is so plain and unfinished!",
      action: "Divine Grace is making it beautiful...",
      success: "It's a masterpiece! Thank you, divine artist!"
    },
    sarvakaryeshu: {
        problem: "I can't get this heavy cart to move!",
        action: "Flow Power is making the work easy...",
        success: "It's moving so smoothly now! All my work feels easy."
    },
    sarvada: {
        problem: "My beautiful sand castle is washing away!",
        action: "Everlasting Power is making it strong...",
        success: "It will stand forever! Thank you!"
    },
    default: {
        problem: "I need your help!",
        action: "Sacred power is flowing...",
        success: "Thank you for saving me!"
    }
  };

  const handleSyllableClick = (syllable) => {
    const wordSyllables = syllables[word] || syllables.default;
    const nextSyllableIndex = syllableProgress.length;

    if (syllable === wordSyllables[nextSyllableIndex]) {
      const newProgress = [...syllableProgress, syllable];
      setSyllableProgress(newProgress);
      
      if (window.playSanskritAudio) {
        window.playSanskritAudio(syllable);
      }
      
      if (newProgress.length === wordSyllables.length) {
        setTimeout(() => {
          setRescuePhase('action');
          setShowParticles(true);

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

  if (!show || !word) return null;

  const currentMessages = messages[word] || messages.default;
  const wordSyllables = syllables[word] || syllables.default;

  return (
    <div className="sanskrit-word-mission">
      <div className="mission-scene-container">
        
        <div className="mission-animal-wrapper">
          <img 
            src={rescuePhase === 'success' ? afterImage : beforeImage}
            alt="Animal in mission"
            className={`mission-animal ${rescuePhase}`}
          />
          <div className={`mission-speech-bubble ${rescuePhase}`}>
            <div className="speech-text">{currentMessages[rescuePhase]}</div>
            <div className="speech-pointer" />
          </div>
        </div>

        {rescuePhase === 'problem' && (
          <div className="chant-instruction">
            Chant <strong>{word.toUpperCase()}</strong> to unlock the power!
          </div>
        )}

        {rescuePhase === 'problem' && (
          <div className="syllable-chant-buttons">
            {wordSyllables.map((syl, idx) => (
              <button
                key={syl + idx}
                className={`syllable-chant-btn ${syllableProgress.includes(syl) ? 'completed' : ''} ${syllableProgress.length === idx ? 'active' : ''}`}
                onClick={() => handleSyllableClick(syl)}
                disabled={syllableProgress.length !== idx}
              >
                {syl.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {showParticles && powerConfig?.image && (
          <div className="power-flowing-container">
            <img 
              src={powerConfig.image} 
              alt={`${powerConfig.name} Power`} 
              className="power-app-image"
            />
            <div className="power-glow" style={{ 
              background: powerConfig.color ? `radial-gradient(circle, ${powerConfig.color}80, transparent)` : 'none'
            }} />
          </div>
        )}

        {rescuePhase === 'success' && (
          <button 
            className="mission-complete-btn"
            onClick={handleComplete}
          >
            {/* UPDATED: Use the new prop for flexible text */}
            {isFinalWordInScene ? 'Complete Scene! ⭐' : 'Continue Adventure'}
          </button>
        )}

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