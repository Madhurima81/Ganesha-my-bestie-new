import React from 'react';
import './HomeButton.css';

/**
 * HomeButton — simple fixed home icon shown in every scene.
 * Replaces the pause menu. Tapping navigates back to zone welcome.
 */
const HomeButton = ({ onNavigate, position = 'top-left' }) => {
  const handleHome = () => {
    onNavigate?.('zone-welcome');
  };

  return (
    <button
      className={`home-button home-button--${position}`}
      onClick={handleHome}
      aria-label="Go back to zone"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        fill="none"
        className="home-button__icon"
      >
        {/* Roof */}
        <path
          d="M24 6L4 22h6v18h10V28h8v12h10V22h6L24 6z"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Door */}
        <rect x="19" y="28" width="10" height="12" rx="2" fill="#F4A261" />
        {/* Chimney */}
        <rect x="30" y="10" width="5" height="8" rx="1" fill="#FFFFFF" />
      </svg>
    </button>
  );
};

export default HomeButton;
