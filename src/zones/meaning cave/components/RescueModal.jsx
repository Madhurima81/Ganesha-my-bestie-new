// zones/cave-of-secrets/components/RescueModal.jsx
import React, { useState } from 'react';
import './RescueModal.css';

const RescueModal = ({
  show,
  wordData,
  onComplete,
  profileName
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [phase, setPhase] = useState('question'); // question | transforming | success
  const [showPowerFlow, setShowPowerFlow] = useState(false);

  if (!show || !wordData) return null;

  // ═══════════════════════════════════════
  // OPTION CLICK HANDLER
  // ═══════════════════════════════════════
  
  const handleOptionClick = (optionId, isCorrect) => {
    setSelectedOption(optionId);
    
    if (!isCorrect) {
      // Wrong answer - shake and reset
      setTimeout(() => {
        setSelectedOption(null);
      }, 1000);
      return;
    }
    
    // Correct answer - start transformation automatically
    setTimeout(() => {
      setPhase('transforming');
      setShowPowerFlow(true);
      
      // After power flows, show success
      setTimeout(() => {
        setShowPowerFlow(false);
        setPhase('success');
      }, 3000);
    }, 500);
  };

  // Continue Button Handler
  const handleContinue = () => {
    onComplete(true);
  };

  return (
    <div className="rescue-modal-overlay">
      <div className="rescue-modal-clean">
        
        {/* ═══════════════════════════════════════
            LEFT SIDE: Image with Symbol Particles
            ═══════════════════════════════════════ */}
        <div className="rescue-left-panel">
          <div className="rescue-image-container">
            {/* Main Animal Image - Transforms automatically */}
            <img 
              src={phase === 'success' || phase === 'transforming' ? wordData.afterImage : wordData.beforeImage}
              alt="rescue scenario"
              className={`rescue-image ${phase === 'success' || phase === 'transforming' ? 'revealed' : ''}`}
            />

            {/* Symbol Particles Power Flow - Just like SymbolPowerMission */}
            {showPowerFlow && wordData.symbolImage && (
              <div className="power-particles">
                {Array.from({length: 8}).map((_, i) => (
                  <div
                    key={i}
                    className="particle"
                    style={{ '--delay': `${i * 0.3}s` }}
                  >
                    <img
                      src={wordData.symbolImage}
                      alt="power particle"
                      style={{ 
                        filter: 'drop-shadow(0 0 10px #FFD700) brightness(1.2)'
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════
            RIGHT SIDE: Content Area
            ═══════════════════════════════════════ */}
        <div className="rescue-right-panel">
          
          {/* Header - Question & Hint */}
          <div className="rescue-header-clean">
            <h2 className="rescue-question-clean">{wordData.question}</h2>
            {wordData.hint && phase === 'question' && (
              <p className="rescue-hint-clean">💡 {wordData.hint}</p>
            )}
          </div>

          {/* ═════════════════════════════════════
              PHASE 1: QUESTION - Show Options
              ═════════════════════════════════════ */}
          {phase === 'question' && (
            <>
              <div className="rescue-instruction-clean">
                <p>{wordData.taskInstruction}</p>
              </div>
              
              <div className="rescue-options-clean">
                {wordData.options.map((option) => (
                  <button
                    key={option.id}
                    className={`rescue-option-clean ${
                      selectedOption === option.id 
                        ? option.isCorrect 
                          ? 'correct' 
                          : 'incorrect'
                        : ''
                    }`}
                    onClick={() => handleOptionClick(option.id, option.isCorrect)}
                    disabled={selectedOption !== null}
                  >
                    {option.icon && (
                      <span className="option-icon-clean">{option.icon}</span>
                    )}
                    <span className="option-label-clean">{option.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ═════════════════════════════════════
              PHASE 2: TRANSFORMING - Power Flow
              ═════════════════════════════════════ */}
          {phase === 'transforming' && (
            <div className="rescue-waiting-clean">
              <div className="waiting-icon">✨</div>
              <p>The power of <strong>{wordData.wordName}</strong> is flowing!</p>
            </div>
          )}

          {/* ═════════════════════════════════════
              PHASE 3: SUCCESS - Show Results
              ═════════════════════════════════════ */}
          {phase === 'success' && (
            <div className="rescue-success-clean">
              <div className="success-icon-clean">🎉</div>
              
              <h3>
                You knew <span className="word-highlight">{wordData.wordName.toUpperCase()}</span> means{' '}
                <span className="meaning-highlight">{wordData.meaning}</span>!
              </h3>
              
              {/* Word Display Card */}
              <div className="word-display-clean">
                <div className="sanskrit-text">{wordData.sanskritWord}</div>
                <div className="word-name-text">({wordData.wordName})</div>
                <div className="meaning-text">"{wordData.meaning}"</div>
              </div>
              
              {/* Animal Saved Message */}
              <p className="animal-saved-clean">{wordData.animalSavedMessage}</p>
              
              {/* Continue Button */}
              <button className="rescue-continue-btn" onClick={handleContinue}>
                Continue Adventure →
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default RescueModal;