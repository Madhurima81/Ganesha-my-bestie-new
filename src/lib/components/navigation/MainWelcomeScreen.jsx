// MainWelcomeScreen.jsx - PRODUCTION READY VERSION
import React, { useState, useEffect, useRef } from 'react';
import ProfilePillBtn from '../shared/ProfilePillBtn';
import { playUiTap } from '../../services/AudioService';
import { ambience } from '../../audio/ambience';
import AudioToggle from '../ui/AudioToggle/AudioToggle';
import useAudioPreference from '../../hooks/useAudioPreference';
import DeviceChoiceModal from './DeviceChoiceModal';
import './MainWelcomeScreen.css';

const MainWelcomeScreen = ({ onStartAdventure }) => {
  const [showButton, setShowButton] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [showDeviceChoice, setShowDeviceChoice] = useState(false);
  const { isAudioOn, toggleAudio } = useAudioPreference();
  const startTimerRef = useRef(null);

  // Animate entrance
  useEffect(() => {
    const buttonTimer = setTimeout(() => setShowButton(true), 1500);
    return () => {
      clearTimeout(buttonTimer);
    };
  }, []);

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

  const handleStartAdventure = () => {
    // Prevent double-click spam
    if (isStarting) {
      return;
    }

    playUiTap(0.24);
    setShowDeviceChoice(true);
  };

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
      <div className={`welcome-title-container ${showButton ? 'visible' : ''}`}>
        <div className="welcome-title-wrapper">
          <h1 className="welcome-title">Ganesha My Bestie</h1>
        </div>
      </div>

      <div className={`welcome-ganesha-image-container ${showButton ? 'visible' : ''}`}>
        <div className="ganesha-wrap">
          <video
            className="welcome-ganesha-video"
            poster="/images/ganesha-welcome-poster.webp"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/videos/ganeshawelcome-new.webm" type="video/webm" />
            <source src="/videos/ganeshawelcome-new.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      <div className="welcome-content-overlay">
        <div className={`adventure-button-container ${showButton ? 'visible' : ''}`}>
          <ProfilePillBtn
            label={isStarting ? 'Starting...' : 'Begin'}
            onClick={handleStartAdventure}
            disabled={isStarting}
            size="lg"
            fullWidth={false}
          />
        </div>
      </div>

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
