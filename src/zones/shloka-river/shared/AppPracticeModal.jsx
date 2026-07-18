// zones/shloka-river/shared/AppPracticeModal.jsx
import React from 'react';
import './AppPracticeModal.css';
import CloseButton from '../../../components/CloseButton';

const AppPracticeModal = ({
  show,
  word,
  appImage,
  appColor,
  savedRecordingsCount = 0,
  onOpenRecorder,
  onClose
}) => {
  if (!show) return null;

  const syllables = {
    vakratunda: ['va', 'kra', 'tun', 'da'],
    mahakaya: ['ma', 'ha', 'ka', 'ya']
  };

  const wordSyllables = syllables[word] || [];

  const playSyllable = (syllable) => {
    if (window.playSanskritAudio) {
      window.playSanskritAudio(syllable);
    }
  };

  const playFullWord = () => {
    if (window.playSanskritWord) {
      window.playSanskritWord(word);
    }
  };

  return (
    <div className="practice-modal-overlay" onClick={onClose}>
      <div className="practice-modal" onClick={(e) => e.stopPropagation()}>
        <CloseButton onClose={onClose} />

        <div className="practice-header">
          <img src={appImage} alt={word} className="practice-app-icon" />
          <h2 className="practice-title">Practice {word.toUpperCase()}</h2>
          <p className="practice-subtitle">
            Listen and practice the sacred sounds
          </p>
        </div>

        <div className="practice-syllables">
          <p className="practice-label">Tap each sound:</p>
          <div className="syllable-buttons-grid">
            {wordSyllables.map((syl) => (
              <button
                key={syl}
                className="syllable-practice-btn"
                onClick={() => playSyllable(syl)}
                style={{ borderColor: appColor }}
              >
                <span className="syllable-text">{syl.toUpperCase()}</span>
                <span className="syllable-speaker">🔊</span>
              </button>
            ))}
          </div>
        </div>

        <div className="practice-full-word">
          <p className="practice-label">Chant the full word:</p>
          <button
            className="full-word-btn"
            onClick={playFullWord}
            style={{ backgroundColor: appColor }}
          >
            <span className="full-word-text">{word.toUpperCase()}</span>
            <span className="word-speaker">🔊</span>
          </button>
        </div>

        <div className="practice-recording">
          <p className="practice-label">Record yourself chanting:</p>

          {savedRecordingsCount > 0 && (
            <div className="recordings-badge">
              You have {savedRecordingsCount} recording{savedRecordingsCount > 1 ? 's' : ''} saved ✨
            </div>
          )}

          <button
            className="open-recorder-btn"
            onClick={onOpenRecorder}
            style={{ backgroundColor: appColor }}
          >
            <span className="recorder-icon">🎤</span>
            <span className="recorder-text">
              {savedRecordingsCount > 0 ? 'Add Another Recording' : 'Start Recording'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppPracticeModal;
