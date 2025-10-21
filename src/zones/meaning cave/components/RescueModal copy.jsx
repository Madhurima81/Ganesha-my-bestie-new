import React, { useState } from 'react';
import './RescueModal.css';
import SparkleAnimation from '../../../lib/components/animation/SparkleAnimation';

const RescueModal = ({
  show,
  wordData,
  onComplete,
  profileName
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [phase, setPhase] = useState('question'); // question | reveal | success
  const [imageRevealed, setImageRevealed] = useState(false);

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
    
    // Correct answer moves to reveal phase
    setTimeout(() => {
      setPhase('reveal');
    }, 500);
  };

  // Image Click Handler
  const handleImageClick = () => {
    if (phase !== 'reveal' || imageRevealed) return;
    
    // Reveal the transformed image
    setImageRevealed(true);
    
    // Show success after animation
    setTimeout(() => {
      setPhase('success');
    }, 1500);
  };

  // Continue Button Handler
  const handleContinue = () => {
    onComplete(true);
  };

  return (
    <div className="rescue-modal-overlay">
      <div className="rescue-modal-clean">
        
        {/* ✅ LEFT SIDE: Image */}
        <div className="rescue-left-panel">
          <div 
            className={`rescue-image-container ${phase === 'reveal' && !imageRevealed ? 'clickable' : ''}`}
            onClick={handleImageClick}
          >
            <img 
              src={imageRevealed ? wordData.afterImage : wordData.beforeImage}
              alt="rescue scenario"
              className={`rescue-image ${imageRevealed ? 'revealed' : ''}`}
            />
            
            {/* Click Instruction Overlay */}
            {phase === 'reveal' && !imageRevealed && (
              <div className="click-overlay">
                <div className="click-prompt">
                  <div className="click-icon">👆</div>
                  <div className="click-text">Click to Transform!</div>
                </div>
              </div>
            )}

            {/* Sparkles during reveal */}
            {imageRevealed && phase !== 'success' && (
              <div className="reveal-sparkles">
                <SparkleAnimation 
                  type="glitter" 
                  count={20} 
                  color="#FFD700" 
                  size={12} 
                  duration={1500}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}
          </div>
        </div>

        {/* ✅ RIGHT SIDE: Content */}
        <div className="rescue-right-panel">
          
          {/* Header */}
          <div className="rescue-header-clean">
            <h2 className="rescue-question-clean">{wordData.question}</h2>
            {wordData.hint && phase === 'question' && (
              <p className="rescue-hint-clean">💡 {wordData.hint}</p>
            )}
          </div>

          {/* Question Phase: Options */}
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

          {/* Reveal Phase: Waiting Message */}
          {phase === 'reveal' && !imageRevealed && (
            <div className="rescue-waiting-clean">
              <div className="waiting-icon">✨</div>
              <p>Click the image to see <strong>{wordData.wordName}'s</strong> power!</p>
            </div>
          )}

          {/* Success Phase: Result */}
          {phase === 'success' && (
            <div className="rescue-success-clean">
              <div className="success-icon-clean">🎉</div>
              <h3>You knew <span className="word-highlight">{wordData.wordName.toUpperCase()}</span> means <span className="meaning-highlight">{wordData.meaning}</span>!</h3>
              
              <div className="word-display-clean">
                <div className="sanskrit-text">{wordData.sanskritWord}</div>
                <div className="word-name-text">({wordData.wordName})</div>
                <div className="meaning-text">"{wordData.meaning}"</div>
              </div>
              
              <p className="animal-saved-clean">{wordData.animalSavedMessage} ❌</p>
              
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