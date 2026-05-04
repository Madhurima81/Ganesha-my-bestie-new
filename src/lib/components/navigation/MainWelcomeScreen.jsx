// MainWelcomeScreen.jsx - PRODUCTION READY VERSION
import React, { useState, useEffect, useRef } from 'react';
import PrimaryBtn from '../shared/PrimaryBtn';
import GaneshaCharacter from '../character/GaneshaCharacter';
import { playUiTap } from '../../services/AudioService';
import './MainWelcomeScreen.css';

const MAIN_WELCOME_VO_KEY = 'gmb_vo_main_welcome_intro_heard';
const MAIN_WELCOME_VO_LINE = "Hi! I'm Ganesha. Tap Start and let's be besties!";

const MainWelcomeScreen = ({ onStartAdventure }) => {
  const [showButton, setShowButton] = useState(false);
  const [showHintArrow, setShowHintArrow] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const ambientRef = useRef(null);
  const fadeRef = useRef(null);
  const voiceTimersRef = useRef([]);

  // Track time on screen for analytics
  useEffect(() => {
    const startTime = Date.now();
    return () => {
      const timeOnScreen = Date.now() - startTime;
      console.log(`📊 Welcome screen viewed for ${timeOnScreen}ms`);
    };
  }, []);

  // Animate entrance
  useEffect(() => {
    const buttonTimer = setTimeout(() => setShowButton(true), 1500);
    
    // Add arrow hint after 10 seconds if still no click
    const arrowTimer = setTimeout(() => setShowHintArrow(true), 10000);
    
    return () => {
      clearTimeout(buttonTimer);
      clearTimeout(arrowTimer);
    };
  }, []);

  useEffect(() => {
    const audioEnabled = localStorage.getItem('ganesha_audio_enabled');
    const isAudioOn = audioEnabled === null ? true : audioEnabled === 'true';
    const alreadyHeard = localStorage.getItem(MAIN_WELCOME_VO_KEY) === '1';
    if (!isAudioOn || alreadyHeard || !window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') {
      return () => {
        voiceTimersRef.current.forEach(clearTimeout);
        window.speechSynthesis?.cancel();
      };
    }

    localStorage.setItem(MAIN_WELCOME_VO_KEY, '1');
    const timerId = setTimeout(() => {
      const utterance = new window.SpeechSynthesisUtterance(MAIN_WELCOME_VO_LINE);
      utterance.rate = 1.02;
      utterance.pitch = 1;
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    }, 450);
    voiceTimersRef.current.push(timerId);

    return () => {
      voiceTimersRef.current.forEach(clearTimeout);
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Soft ambient bed on welcome screen (same track as map, lower volume)
  useEffect(() => {
    const audio = ambientRef.current;
    if (!audio) return;

    const TARGET_VOL = 0.18;

    const fadeIn = () => {
      clearInterval(fadeRef.current);
      audio.volume = 0;
      audio.play().catch(() => {});
      fadeRef.current = setInterval(() => {
        const next = Math.min(audio.volume + 0.02, TARGET_VOL);
        audio.volume = next;
        if (next >= TARGET_VOL) clearInterval(fadeRef.current);
      }, 80);
    };

    fadeIn();

    const onFirstInteraction = () => {
      if (audio.paused) fadeIn();
      document.removeEventListener('click', onFirstInteraction);
      document.removeEventListener('touchstart', onFirstInteraction);
    };
    document.addEventListener('click', onFirstInteraction);
    document.addEventListener('touchstart', onFirstInteraction);

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        clearInterval(fadeRef.current);
        audio.pause();
      } else {
        fadeIn();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(fadeRef.current);
      audio.pause();
      document.removeEventListener('click', onFirstInteraction);
      document.removeEventListener('touchstart', onFirstInteraction);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const handleStartAdventure = () => {
    // Prevent double-click spam
    if (isStarting) {
      console.log('⚠️ Already starting adventure, ignoring click');
      return;
    }
    
    setIsStarting(true);
    console.log('🎸 Starting new adventure from main welcome');

    playUiTap(0.24);
    
    // Add slight delay for visual feedback
    setTimeout(() => {
      onStartAdventure();
    }, 300);
  };

  return (
    <div className="main-welcome-container">
      {/* TWINKLING STARS */}
      <div className="twinkle-stars" aria-hidden="true">
        <span/><span/><span/><span/><span/><span/>
        <span/><span/><span/><span/><span/><span/>
      </div>

      {/* FLOATING GOLDEN LIGHT PARTICLES */}
      <div className="floating-lights" aria-hidden="true">
        <span/><span/><span/><span/><span/>
      </div>

      {/* ATMOSPHERIC OVERLAY — center lift + edge depth */}
      <div className="welcome-bg-overlay" aria-hidden="true" />

      {/* CINEMATIC VIGNETTE */}
      <div className="welcome-vignette" aria-hidden="true" />

      {/* TITLE TEXT */}
      <div className={`welcome-title-container ${showButton ? 'visible' : ''}`}>
        <div className="welcome-title-wrapper">
          <h1 className="welcome-title">Ganesha World</h1>
        </div>
      </div>
      
      {/* GANESHA - Inline SVG component with breathing animation */}
      <div className={`welcome-ganesha-image-container ${showButton ? 'visible' : ''}`}>
        <div className="ganesha-wrap">
          <GaneshaCharacter
            expression="happy"
            className="welcome-ganesha-image"
          />
        </div>
      </div>
      
      {/* HINT ARROW - Appears after 10 seconds */}
      <div className={`hint-arrow ${showHintArrow ? 'visible' : ''}`} />
      
      {/* BUTTON AT BOTTOM */}
      <div className="welcome-content-overlay">
        <div className={`adventure-button-container ${showButton ? 'visible' : ''}`}>
          <PrimaryBtn
            label={isStarting ? 'Starting...' : 'Start'}
            onClick={handleStartAdventure}
            disabled={isStarting}
            size="lg"
            fullWidth={false}
          />
        </div>
      </div>

      <audio
        ref={ambientRef}
        src="/audio/ambient/map%20ambient%20sound.wav"
        loop
        preload="auto"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default MainWelcomeScreen;
