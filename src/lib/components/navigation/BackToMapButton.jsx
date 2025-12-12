// BackToMapButton.jsx - Reusable navigation component for all scenes
// Path: lib/components/navigation/BackToMapButton.jsx

import React from 'react';

const BackToMapButton = ({ 
  onNavigate, 
  hideCoach, 
  clearManualCloseTracking,
  position = 'bottom-left',
  customStyle = {}
}) => {
  
  const handleMapNavigation = () => {
    console.log('🗺️ DIRECT MAP: Navigation initiated from scene');
    
    // Clean GameCoach before navigation (critical for smooth UX)
    if (hideCoach) {
      hideCoach();
      console.log('✅ GameCoach hidden before map navigation');
    }
    if (clearManualCloseTracking) {
      clearManualCloseTracking();
      console.log('✅ GameCoach tracking cleared');
    }
    
    // Navigate directly to map, bypassing profile welcome
    if (onNavigate) {
      onNavigate('direct-to-map');
    } else {
      console.error('❌ onNavigate prop not provided to BackToMapButton');
    }
  };

  // Position presets
  const getPositionStyle = () => {
    const baseStyle = {
      position: 'fixed',
      zIndex: 99999,
      background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '25px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
      border: '2px solid white',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      userSelect: 'none'
    };

    // Position-specific styles
    const positions = {
      'bottom-left': { bottom: '20px', left: '20px' },
      'bottom-right': { bottom: '20px', right: '20px' },
      'top-left': { top: '20px', left: '20px' },
      'top-right': { top: '20px', right: '20px' },
      'bottom-center': { bottom: '20px', left: '50%', transform: 'translateX(-50%)' }
    };

    return {
      ...baseStyle,
      ...positions[position],
      ...customStyle
    };
  };

  return (
    <div 
      style={getPositionStyle()}
      onClick={handleMapNavigation}
      onMouseEnter={(e) => {
        e.target.style.transform = position === 'bottom-center' ? 'translateX(-50%) scale(1.05)' : 'scale(1.05)';
        e.target.style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = position === 'bottom-center' ? 'translateX(-50%) scale(1)' : 'scale(1)';
        e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
      }}
    >
      🗺️ Back to Map
    </div>
  );
};

export default BackToMapButton;