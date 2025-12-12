// Location: zones/shloka-river/core/components/PauseModal.jsx

import React from 'react';

const PauseModal = ({ isOpen, onContinue, onExit, gameName, theme }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '30px',
        padding: '40px',
        maxWidth: '450px',
        textAlign: 'center',
        boxShadow: '0 30px 90px rgba(0,0,0,0.5)'
      }}>
        <div style={{ fontSize: '72px', marginBottom: '20px' }}>⏸️</div>
        
        <h2 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '15px'
        }}>
          Take a Break?
        </h2>
        
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '35px' }}>
          Your progress is saved! 🌟
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Continue Playing Button */}
          <button
            onClick={onContinue}
            style={{
              width: '100%',
              padding: '20px',
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              border: 'none',
              borderRadius: '16px',
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)'
            }}
          >
            ▶️ Keep Playing!
          </button>

          {/* Exit to Menu Button */}
          <button
            onClick={onExit}
            style={{
              width: '100%',
              padding: '20px',
              background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
              border: 'none',
              borderRadius: '16px',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)'
            }}
          >
            🏠 Exit to Menu
            <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
              Progress saved automatically
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PauseModal;