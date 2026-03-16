import React from 'react';
import './HomeButton.css';

/**
 * HomeButton — fixed home icon shown in every scene and zone welcome.
 * Lavender circle style matching the profile chip on the map.
 */
const HomeButton = ({ onNavigate, position = 'top-left' }) => {
  const handleHome = () => {
    onNavigate?.('zones');
  };

  return (
    <button
      className={`home-button home-button--${position}`}
      onClick={handleHome}
      aria-label="Go back to zone"
    >
      <img
        src="/images/icons/icon-home.svg"
        alt=""
        className="home-button__icon"
      />
    </button>
  );
};

export default HomeButton;
