// WelcomeLayers.jsx - the opening animation as TWO layers: a muted background video that plays once
// and holds its last frame, with a transparent animated Ganesha laid over it. The GIF is swapped to
// the still after STILL_AFTER_MS so he plays exactly once (reduced-motion users get the still at once).
// Used by the welcome screen and by the Ganesha intro story's opening, so both show the same thing.
import React, { useEffect, useState } from 'react';
import './WelcomeLayers.css';

const GANESHA_GIF = '/images/welcome/ganesha-welcome.gif';
const GANESHA_STILL = '/images/welcome/ganesha-welcome-still.png';
const POSTER = '/images/welcome/welcome-bg-poster.webp';
const STILL_AFTER_MS = 2300;

const prefersReducedMotion = () => {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
  } catch {
    return false;
  }
};

const WelcomeLayers = ({ videoRef, onEnded, onError }) => {
  const [showStill, setShowStill] = useState(prefersReducedMotion);

  useEffect(() => {
    if (showStill) return undefined;
    const t = setTimeout(() => setShowStill(true), STILL_AFTER_MS);
    return () => clearTimeout(t);
  }, [showStill]);

  return (
    <div className="welcomeLayers">
      <div className="welcomeLayers-box">
        <video
          ref={videoRef}
          className="welcomeLayers-bg"
          poster={POSTER}
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={onEnded}
          onError={onError}
        >
          <source src="/videos/welcome-bg.webm" type="video/webm" />
          <source src="/videos/welcome-bg.mp4" type="video/mp4" />
        </video>
        <img
          className="welcomeLayers-ganesha"
          src={showStill ? GANESHA_STILL : GANESHA_GIF}
          alt="Ganesha welcoming you"
          draggable={false}
        />
      </div>
    </div>
  );
};

export default WelcomeLayers;
