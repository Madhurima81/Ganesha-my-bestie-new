// Create file: components/AudioProgressTracker.jsx
import React from 'react';

const AudioProgressTracker = ({
  learnedSyllables = {},
  learnedWords = {},
  currentPhase = 'vakratunda',
  onSyllablePlay,
  onWordPlay,
  mode = 'chanting'
}) => {
  
  const syllableData = {
    vakratunda: ['va', 'kra', 'tun', 'da'],
    mahakaya: ['ma', 'ha', 'ka', 'ya']
  };
  
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'rgba(255, 248, 220, 0.95)',
      border: '2px solid #D2B48C',
      borderRadius: '15px',
      padding: '15px',
      minWidth: '200px',
      zIndex: 100
    }}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#8B4513' }}>
        Learning: {currentPhase.toUpperCase()}
      </div>
      
      <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
        {syllableData[currentPhase].map((syllable) => (
          <button
            key={syllable}
            onClick={() => onSyllablePlay && onSyllablePlay(syllable)}
            style={{
              background: learnedSyllables[syllable] ? '#4CAF50' : '#e0e0e0',
              color: learnedSyllables[syllable] ? 'white' : '#666',
              border: 'none',
              borderRadius: '5px',
              padding: '5px 8px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {syllable.toUpperCase()}
            {learnedSyllables[syllable] && ' ✓'}
          </button>
        ))}
      </div>
      
      {learnedWords[currentPhase] && (
        <button
          onClick={() => onWordPlay && onWordPlay(currentPhase)}
          style={{
            background: '#FFD700',
            color: '#8B4513',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          🔊 Hear {currentPhase}
        </button>
      )}
    </div>
  );
};

export default AudioProgressTracker;