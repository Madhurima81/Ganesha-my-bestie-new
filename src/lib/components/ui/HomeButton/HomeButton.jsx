import React, { useEffect, useRef, useState } from 'react';
import './HomeButton.css';

/**
 * HomeButton - 2-tap-to-confirm pattern.
 * Tap 1: arms the button and shows a tooltip for a short confirm window.
 * Tap 2: actually navigates home.
 */
const HomeButton = ({
  onNavigate,
  onPrepareNavigate,
  position = 'top-left',
  transitionMs = 130,
  armWindowMs = 2500
}) => {
  const [isPressing, setIsPressing] = useState(false);
  const [isArmed, setIsArmed] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const disarmTimer = useRef(null);
  const pressTimer = useRef(null);

  const clearDisarmTimer = () => {
    if (disarmTimer.current) {
      clearTimeout(disarmTimer.current);
      disarmTimer.current = null;
    }
  };

  const clearPressTimer = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const resetArmedState = () => {
    clearDisarmTimer();
    setIsArmed(false);
    setShowTooltip(false);
  };

  useEffect(() => {
    return () => {
      clearDisarmTimer();
      clearPressTimer();
    };
  }, []);

  const handleHome = () => {
    if (isNavigating) return;

    if (!isArmed) {
      clearDisarmTimer();
      setIsArmed(true);
      setShowTooltip(true);
      setIsPressing(true);

      clearPressTimer();
      pressTimer.current = setTimeout(() => {
        setIsPressing(false);
        pressTimer.current = null;
      }, transitionMs + 120);

      disarmTimer.current = setTimeout(() => {
        resetArmedState();
      }, armWindowMs);

      return;
    }

    resetArmedState();
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
    <div className={`home-button-wrapper home-button-wrapper--${position}`}>
      <button
        className={`home-button ${isPressing ? 'home-button--pressing' : ''}`}
        onClick={handleHome}
        aria-label={isArmed ? 'Tap again to go home' : 'Go back to zone'}
      >
        <img
          src="/images/icons/icon-home.svg"
          alt=""
          className="home-button__icon"
        />
      </button>

      {showTooltip && (
        <div className="home-tooltip" aria-hidden="true">
          Tap again to go home
        </div>
      )}
    </div>
  );
};

export default HomeButton;
