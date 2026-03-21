import React, { useState } from 'react';
import './HomeButton.css';

/**
 * HomeButton — fixed home icon shown in every scene and zone welcome.
 * Lavender circle style matching the profile chip on the map.
 */
const HomeButton = ({
  onNavigate,
  onPrepareNavigate,
  position = 'top-left',
  transitionMs = 130
}) => {
  const [isPressing, setIsPressing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleHome = () => {
    if (isNavigating) return;

    setIsNavigating(true);
    setIsPressing(true);
    onPrepareNavigate?.('zones');

    setTimeout(() => {
      onNavigate?.('zones');
    }, transitionMs);

    setTimeout(() => {
      setIsPressing(false);
      setIsNavigating(false);
    }, transitionMs + 120);
  };

  return (
    <button
      className={`home-button home-button--${position} ${isPressing ? 'home-button--pressing' : ''}`}
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
