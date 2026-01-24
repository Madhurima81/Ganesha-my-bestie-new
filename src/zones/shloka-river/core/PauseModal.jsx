// Location: zones/shloka-river/core/components/PauseModal.jsx

import React from 'react';
import UnifiedButtonV2 from '../../../lib/components/ui/Button/UnifiedButtonV2';

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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Continue Playing Button - Green */}
          <UnifiedButtonV2
            variant="primary"
            size="large"
            onClick={onContinue}
          >
            ▶️ Keep Playing!
          </UnifiedButtonV2>

          {/* Exit to Menu Button - Red */}
          <UnifiedButtonV2
            variant="danger"
            onClick={onExit}
          >
            🏠 Exit to Menu
          </UnifiedButtonV2>
        </div>

        <p style={{ fontSize: '14px', color: '#999', marginTop: '20px' }}>
          Progress saved automatically ✨
        </p>
      </div>
    </div>
  );
};

export default PauseModal;