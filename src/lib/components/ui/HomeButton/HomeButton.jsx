import React, { useState, useRef, useEffect } from 'react';
import './HomeButton.css';

/**
 * HomeButton — 2-tap-to-confirm pattern (Sago Mini style).
 * Tap 1: arms the button (ring animates in, ~2s window).
 * Tap 2: actually navigates home.
 * Prevents accidental exits without needing a pause/resume modal.
 */
const HomeButton = ({
  onNavigate,
  onPrepareNavigate,
  position = 'top-left',
  transitionMs = 130,
  armWindowMs = 2000
}) => {
  const [isPressing, setIsPressing] = useState(false);
  const [isArmed, setIsArmed] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const disarmTimer = useRef(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (disarmTimer.current) clearTimeout(disarmTimer.current);
    };
  }, []);

  const handleHome = () => {
    if (isNavigating) return;

    // First tap → arm the button
    if (!isArmed) {
      setIsArmed(true);
      setIsPressing(true);

      // Brief squash feedback
      setTimeout(() => setIsPressing(false), transitionMs + 120);

      // Auto-disarm after 2s if no second tap
      disarmTimer.current = setTimeout(() => {
        setIsArmed(false);
      }, armWindowMs);

      return;
    }

    // Second tap → actually navigate
    if (disarmTimer.current) clearTimeout(disarmTimer.current);

    setIsNavigating(true);
    setIsPressing(true);
    onPrepareNavigate?.('zones');

    setTimeout(() => {
      onNavigate?.('zones');
    }, transitionMs);

    setTimeout(() => {
      setIsPressing(false);
      setIsArmed(false);
      setIsNavigating(false);
    }, transitionMs + 120);
  };

  return (
    <button
      className={`home-button home-button--${position} ${isPressing ? 'home-button--pressing' : ''} ${isArmed ? 'home-button--armed' : ''}`}
      onClick={handleHome}
      aria-label={isArmed ? 'Tap again to go home' : 'Go back to zone'}
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
