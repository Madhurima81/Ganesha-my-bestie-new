// PauseBlurOverlay.jsx
// Visual blur overlay that appears when pause menu is open
// Provides professional visual feedback like Alto's Adventure, Monument Valley

import React from 'react';

export const PauseBlurOverlay = ({ show }) => {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(3px)',
      WebkitBackdropFilter: 'blur(3px)', // Safari support
      zIndex: 999, // Below pause menu (1000)
      pointerEvents: 'none', // Clicks pass through to pause menu
      transition: 'opacity 0.2s ease-out',
      opacity: 1
    }} />
  );
};

export default PauseBlurOverlay;
