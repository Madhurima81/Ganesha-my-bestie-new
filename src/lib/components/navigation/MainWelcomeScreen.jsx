// MainWelcomeScreen.jsx - PRODUCTION READY VERSION
import React, { useState, useEffect, useRef } from 'react';
import { ambience } from '../../audio/ambience';
import AudioToggle from '../ui/AudioToggle/AudioToggle';
import useAudioPreference from '../../hooks/useAudioPreference';
import DeviceChoiceModal from './DeviceChoiceModal';
import WelcomeLayers from './WelcomeLayers';
import './MainWelcomeScreen.css';

// First visit: brand welcome (~1.5s after it fades in), then Ganesha + title fade out (350ms) and the
// device-choice modal fades in (300ms). Returning visits skip the splash and show the modal at once.
const SEEN_KEY = 'gmb_brand_welcome_seen';
const SPLASH_VISIBLE_MS = 3000;   // 1.5s entrance delay + ~1.5s visible
const FADE_OUT_MS = 350;

const hasSeenSplash = () => {
  try { return localStorage.getItem(SEEN_KEY) === '1'; } catch { return false; }
};

const MainWelcomeScreen = ({ onStartAdventure }) => {
  const [showButton, setShowButton] = useState(false);
  const [splashDone, setSplashDone] = useState(hasSeenSplash);
  const [splashFading, setSplashFading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [showDeviceChoice, setShowDeviceChoice] = useState(hasSeenSplash);
  const { isAudioOn, toggleAudio } = useAudioPreference();
  const startTimerRef = useRef(null);

  // Animate entrance
  useEffect(() => {
    const buttonTimer = setTimeout(() => setShowButton(true), 1500);
    return () => {
      clearTimeout(buttonTimer);
    };
  }, []);

  useEffect(() => {
    if (splashDone) return undefined;
    const fadeTimer = setTimeout(() => setSplashFading(true), SPLASH_VISIBLE_MS);
    const doneTimer = setTimeout(() => {
      try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ }
      setSplashDone(true);
      setShowDeviceChoice(true);
    }, SPLASH_VISIBLE_MS + FADE_OUT_MS);
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer); };
  }, [splashDone]);

  // Soft ambient bed on welcome screen. Shared player: follows Parent Settings > Ambience, ducks for VO.
  useEffect(() => ambience.play('welcome'), []);

  useEffect(() => {
    return () => {
      if (startTimerRef.current) {
        clearTimeout(startTimerRef.current);
        startTimerRef.current = null;
      }
    };
  }, []);

  const handleContinueHere = () => {
    if (isStarting) {
      return;
    }

    setIsStarting(true);

    // Add slight delay for visual feedback
    startTimerRef.current = setTimeout(() => {
      onStartAdventure();
      startTimerRef.current = null;
    }, 300);
  };

  return (
    <div className="main-welcome-container">
      {!splashDone && (
      <>
      <div className={`welcome-title-container ${showButton && !splashFading ? 'visible' : ''}`} style={splashFading ? { transitionDuration: `${FADE_OUT_MS}ms` } : undefined}>
        <div className="welcome-title-wrapper">
          <h1 className="welcome-title">Ganesha My Bestie</h1>
        </div>
      </div>

      <div className={`welcome-ganesha-image-container ${showButton && !splashFading ? 'visible' : ''}`} style={splashFading ? { transitionDuration: `${FADE_OUT_MS}ms` } : undefined}>
        <div className="ganesha-wrap">
          <WelcomeLayers />
        </div>
      </div>

      </>
      )}

      {/* [welcome mute removed 2026-10-09] mute lives on Home map + Parent Dashboard; uncomment to restore.
      <AudioToggle
        isAudioOn={isAudioOn}
        onToggle={toggleAudio}
        position="top-right"
      />
      */}


      <DeviceChoiceModal
        isOpen={showDeviceChoice}
        onClose={() => setShowDeviceChoice(false)}
        onContinueHere={handleContinueHere}
      />
    </div>
  );
};

export default MainWelcomeScreen;
