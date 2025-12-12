// Location: zones/shloka-river/core/components/UniversalPauseButton.jsx

import React from 'react';

const UniversalPauseButton = ({ 
  onPause,
  theme = { primaryColor: '#FF6B35' },
  disabled = false 
}) => {
  return (
    <button
      onClick={onPause}
      disabled={disabled}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: disabled 
          ? 'rgba(200, 200, 200, 0.5)' 
          : 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        zIndex: 9999,
        fontSize: '24px',
        color: 'white',
        border: 'none',
        boxShadow: disabled 
          ? 'none' 
          : '0 4px 15px rgba(255, 107, 107, 0.4)',
        transition: 'all 0.3s ease'
      }}
    >
      ⏸
    </button>
  );
};

export default UniversalPauseButton;