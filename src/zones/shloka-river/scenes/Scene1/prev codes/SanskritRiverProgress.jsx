// SanskritRiverProgress.jsx - Enhanced child-friendly Sanskrit progress bar
import React, { useState, useEffect } from 'react';
import './SanskritRiverProgress.css';

const SanskritRiverProgress = ({
  learnedWords = {},
  currentScene = 1,
  onWordClick,
  onWordHover,
  className = ''
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [ripplePosition, setRipplePosition] = useState(null);

const words = [
  {
    id: 'vakratunda',
    sanskrit: 'वक्रतुण्ड',
    transliteration: 'VAKRATUNDA',
    meaning: 'Curved Trunk',
    scene: 1,
    position: { x: 8, y: 60 }
  },
  {
    id: 'mahakaya',
    sanskrit: 'महाकाय',
    transliteration: 'MAHAKAYA', 
    meaning: 'Mighty Form',
    scene: 1,
    position: { x: 20, y: 45 }
  },
  {
    id: 'suryakoti',
    sanskrit: 'सूर्यकोटि',
    transliteration: 'SURYAKOTI',
    meaning: 'Million Suns',
    scene: 2,
    position: { x: 32, y: 55 }
  },
  {
    id: 'samaprabha',
    sanskrit: 'समप्रभ',
    transliteration: 'SAMAPRABHA',
    meaning: 'Equal Brilliance',
    scene: 2,
    position: { x: 44, y: 40 }
  },
  {
    id: 'nirvighnam',
    sanskrit: 'निर्विघ्नं',
    transliteration: 'NIRVIGHNAM',
    meaning: 'Without Obstacles',
    scene: 3,
    position: { x: 56, y: 50 }
  },
  {
    id: 'kurume-deva',
    sanskrit: 'कुरुमे देव',
    transliteration: 'KURUME DEVA',
    meaning: 'Make It So, Divine One',
    scene: 3,
    position: { x: 68, y: 35 }
  },
  {
    id: 'sarvakaryeshu',
    sanskrit: 'सर्वकार्येषु',
    transliteration: 'SARVAKARYESHU',
    meaning: 'In All Tasks',
    scene: 4,
    position: { x: 80, y: 50 }
  },
  {
    id: 'sarvada',
    sanskrit: 'सर्वदा',
    transliteration: 'SARVADA',
    meaning: 'Always',
    scene: 4,
    position: { x: 92, y: 45 }
  }
];

  // Get word state
  const getWordState = (word) => {
    const wordData = learnedWords[word.id];
    
    if (wordData?.learned) return 'learned';
    if (word.scene === currentScene) return 'current';
    if (word.scene < currentScene) return 'available';
    return 'locked';
  };

  // Get word completion percentage
  const getCompletionPercentage = (word) => {
    const wordData = learnedWords[word.id];
    if (!wordData) return 0;
    
    if (wordData.learned) return 100;
    
    // Calculate based on syllables learned
    const syllableCount = word.id === 'vakratunda' ? 4 : 
                         word.id === 'mahakaya' ? 4 : 
                         word.id === 'suryakoti' ? 4 : 4;
    
    const learnedSyllables = Object.values(wordData.syllables || {}).filter(Boolean).length;
    return Math.round((learnedSyllables / syllableCount) * 100);
  };

  // Handle word click
  const handleWordClick = (word, event) => {
    const state = getWordState(word);
    
    if (state === 'learned') {
      // Create ripple effect
      const rect = event.currentTarget.getBoundingClientRect();
      setRipplePosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
      
      // Show popup
      setSelectedWord(word);
      setShowPopup(true);
      
      // Play audio preview
      playWordAudio(word.id);
      
      // Clear ripple after animation
      setTimeout(() => setRipplePosition(null), 600);
    }
    
    if (onWordClick) {
      onWordClick(word, state);
    }
  };

  // Play word audio
  const playWordAudio = (wordId) => {
    try {
      const audio = new Audio(`/audio/words/${wordId}.mp3`);
      audio.play().catch(console.warn);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  };

  // Close popup
  const closePopup = () => {
    setShowPopup(false);
    setSelectedWord(null);
  };

  return (
    <div className={`sanskrit-river-progress ${className}`}>
      {/* River background path */}
      <div className="river-path">
        <svg viewBox="0 0 100 20" className="river-svg">
          <defs>
            <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4FC3F7" />
              <stop offset="50%" stopColor="#29B6F6" />
              <stop offset="100%" stopColor="#03A9F4" />
            </linearGradient>
          </defs>
          <path
            d="M 0,15 Q 25,5 50,12 Q 75,20 100,8"
            stroke="url(#riverGradient)"
            strokeWidth="8"
            fill="none"
            className="river-curve"
          />
        </svg>
        
        {/* Connecting bridges between learned words */}
        {words.map((word, index) => {
          const currentState = getWordState(word);
          const nextWord = words[index + 1];
          const nextState = nextWord ? getWordState(nextWord) : null;
          
          if (currentState === 'learned' && nextState === 'learned' && nextWord) {
            return (
              <div
                key={`bridge-${word.id}`}
                className="word-bridge"
                style={{
                  left: `${word.position.x + 5}%`,
                  top: `${word.position.y}%`,
                  width: `${nextWord.position.x - word.position.x - 5}%`
                }}
              />
            );
          }
          return null;
        })}
      </div>

      {/* Word islands */}
      {words.map((word) => {
        const state = getWordState(word);
        const completion = getCompletionPercentage(word);
        
        return (
          <div
            key={word.id}
            className={`word-island ${state} ${state === 'current' ? 'wobble' : ''}`}
            style={{
              left: `${word.position.x}%`,
              top: `${word.position.y}%`
            }}
            onClick={(e) => handleWordClick(word, e)}
            onMouseEnter={() => onWordHover?.(word, state)}
          >
            {/* Island base with water reflection */}
            <div className="island-base">
              <div className="island-shadow" />
              <div className="water-reflection" />
            </div>
            
            {/* Word content */}
            <div className="word-content">
              <div className="sanskrit-text">{word.sanskrit}</div>
              <div className="transliteration-text">{word.transliteration}</div>
              
              {/* Scene indicator */}
              <div className={`scene-indicator scene-${word.scene}`}>
                {word.scene}
              </div>
              
              {/* Progress fill for partial learning */}
              {completion > 0 && completion < 100 && (
                <div 
                  className="progress-fill"
                  style={{ height: `${completion}%` }}
                />
              )}
              
              {/* State indicators */}
              {state === 'learned' && (
                <div className="learned-glow" />
              )}
              
              {state === 'locked' && (
                <div className="locked-indicator">🔒</div>
              )}
            </div>
            
            {/* Hover sparkles for learned words */}
            {state === 'learned' && (
              <div className="hover-sparkles">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`sparkle sparkle-${i}`}>✨</div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Ripple effect */}
      {ripplePosition && (
        <div
          className="tap-ripple"
          style={{
            left: ripplePosition.x,
            top: ripplePosition.y
          }}
        />
      )}

      {/* Word detail popup */}
      {showPopup && selectedWord && (
        <div className="word-popup-overlay" onClick={closePopup}>
          <div className="word-popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close-btn" onClick={closePopup}>×</button>
            
            <div className="popup-word-display">
              <div className="popup-sanskrit-text">{selectedWord.sanskrit}</div>
              <div className="popup-transliteration">{selectedWord.transliteration}</div>
            </div>
            
            <h2 className="popup-title">Word Meaning</h2>
            
            <p className="popup-meaning">
              <strong>{selectedWord.meaning}</strong>
            </p>
            
            <p className="popup-scene-info">
              Learned in Scene {selectedWord.scene}
            </p>
            
            <div className="popup-actions">
              <button 
                className="popup-audio-btn"
                onClick={() => playWordAudio(selectedWord.id)}
              >
                🔊 Listen Again
              </button>
              
              <button className="popup-continue-btn" onClick={closePopup}>
                Continue Learning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SanskritRiverProgress;