// zones/shloka-river/core/ModeSelectionModal.jsx
// Modal for choosing between Auto Play and Manual Round modes

import React from 'react';

const ModeSelectionModal = ({ 
  isOpen, 
  onSelectMode, 
  profileName = 'explorer',
  gameName = 'Memory Game',
  theme = {
    primaryColor: '#4CAF50',
    accentColor: '#81C784',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }
}) => {
  
  if (!isOpen) return null;

  return (
    <div 
      className="mode-selection-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div 
        className="mode-selection-card"
        style={{
          background: theme.backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '30px',
          padding: '50px 40px',
          maxWidth: '550px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 25px 70px rgba(0,0,0,0.4)',
          border: '3px solid rgba(255,255,255,0.2)',
          animation: 'slideUp 0.4s ease-out'
        }}
      >
        
        {/* Header */}
        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '12px',
          textShadow: '0 3px 6px rgba(0,0,0,0.3)',
          letterSpacing: '0.5px'
        }}>
          🐘 How do you want to play? 🪷
        </div>

        {/* Subtitle with game name */}
        <div style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.95)',
          marginBottom: '10px',
          fontWeight: '500'
        }}>
          {gameName} Adventure
        </div>

        <div style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.85)',
          marginBottom: '35px',
          fontStyle: 'italic'
        }}>
          Choose your learning path, {profileName}!
        </div>

        {/* Auto Play Button */}
        <button
          onClick={() => onSelectMode('auto')}
          className="mode-button"
          style={{
            width: '100%',
            padding: '24px 30px',
            marginBottom: '18px',
            background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
            border: 'none',
            borderRadius: '18px',
            color: 'white',
            fontSize: '17px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(76, 175, 80, 0.5)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px) scale(1.02)';
            e.target.style.boxShadow = '0 10px 30px rgba(76, 175, 80, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.5)';
          }}
        >
          <div style={{ 
            fontSize: '28px', 
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            ▶️ Auto Play
          </div>
          <div style={{ 
            fontSize: '13px', 
            opacity: 0.95,
            fontWeight: '500',
            lineHeight: '1.5'
          }}>
            Start from Round 1 and learn step by step<br/>
            <span style={{ fontSize: '11px', opacity: 0.8 }}>
              Perfect for first-time learners!
            </span>
          </div>
        </button>

        {/* Manual Round Button */}
        <button
          onClick={() => onSelectMode('manual')}
          className="mode-button"
          style={{
            width: '100%',
            padding: '24px 30px',
            background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
            border: 'none',
            borderRadius: '18px',
            color: 'white',
            fontSize: '17px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(33, 150, 243, 0.5)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px) scale(1.02)';
            e.target.style.boxShadow = '0 10px 30px rgba(33, 150, 243, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.5)';
          }}
        >
          <div style={{ 
            fontSize: '28px', 
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            🎯 Choose a Round
          </div>
          <div style={{ 
            fontSize: '13px', 
            opacity: 0.95,
            fontWeight: '500',
            lineHeight: '1.5'
          }}>
            Pick any round you like and practice!<br/>
            <span style={{ fontSize: '11px', opacity: 0.8 }}>
              Great for mastering specific rounds!
            </span>
          </div>
        </button>

        {/* Bottom hint text */}
        <div style={{
          marginTop: '25px',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.7)',
          fontStyle: 'italic'
        }}>
          💡 You can switch modes anytime!
        </div>

      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.95);
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          }
        }

        .mode-button:active {
          transform: translateY(0) scale(0.98) !important;
        }

        /* Ripple effect on click */
        .mode-button::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .mode-button:active::after {
          width: 300px;
          height: 300px;
        }
      `}</style>
    </div>
  );
};

// ⭐ CRITICAL: Must be default export
export default ModeSelectionModal;