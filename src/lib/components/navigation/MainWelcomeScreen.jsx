// MainWelcomeScreen.jsx - PRODUCTION READY VERSION
import React, { useState, useEffect, useRef } from 'react';
import ProfilePillBtn from '../shared/ProfilePillBtn';
import { playUiTap } from '../../services/AudioService';
import AudioToggle from '../ui/AudioToggle/AudioToggle';
import useAudioPreference from '../../hooks/useAudioPreference';
import './MainWelcomeScreen.css';

const MainWelcomeScreen = ({ onStartAdventure }) => {
  const [showButton, setShowButton] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const { isAudioOn, toggleAudio } = useAudioPreference();
  const ambientRef = useRef(null);
  const fadeRef = useRef(null);
  const startTimerRef = useRef(null);

  // Animate entrance
  useEffect(() => {
    const buttonTimer = setTimeout(() => setShowButton(true), 1500);
    return () => {
      clearTimeout(buttonTimer);
    };
  }, []);

  // Soft ambient bed on welcome screen (same track as map, lower volume)
  useEffect(() => {
    const audio = ambientRef.current;
    if (!audio) return;

    const TARGET_VOL = 0.22;
    const canFadeVolume = !/iPhone/i.test(navigator.userAgent || '');

    const fadeIn = () => {
      clearInterval(fadeRef.current);
      if (canFadeVolume) {
        audio.volume = 0;
      } else {
        audio.volume = TARGET_VOL;
      }
      audio.play().catch(() => {});
      if (!canFadeVolume) return;

      fadeRef.current = setInterval(() => {
        const next = Math.min(audio.volume + 0.02, TARGET_VOL);
        audio.volume = next;
        if (next >= TARGET_VOL) clearInterval(fadeRef.current);
      }, 80);
    };

    if (isAudioOn) {
      fadeIn();
    } else {
      clearInterval(fadeRef.current);
      audio.pause();
      audio.currentTime = 0;
    }

    const onFirstInteraction = () => {
      if (audio.paused) fadeIn();
      document.removeEventListener('pointerdown', onFirstInteraction);
    };
    document.addEventListener('pointerdown', onFirstInteraction);

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        clearInterval(fadeRef.current);
        audio.pause();
      } else if (isAudioOn) {
        fadeIn();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(fadeRef.current);
      audio.pause();
      document.removeEventListener('pointerdown', onFirstInteraction);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isAudioOn]);

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

    setIsStarting(true);
    playUiTap(0.24);

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
            poster="/images/ganesha-hi-stand.webp"
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

      <AudioToggle
        isAudioOn={isAudioOn}
        onToggle={toggleAudio}
        position="top-right"
      />

      <audio
        ref={ambientRef}
        src="/audio/ambient/map%20ambient%20sound.wav"
        loop
        preload="metadata"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default MainWelcomeScreen;
