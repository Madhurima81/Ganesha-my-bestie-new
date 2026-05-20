// MainWelcomeScreen.jsx - PRODUCTION READY VERSION
import React, { useState, useEffect, useRef } from 'react';
import PrimaryBtn from '../shared/PrimaryBtn';
import GaneshaCharacter from '../character/GaneshaCharacter';
import { playUiTap } from '../../services/AudioService';
import './MainWelcomeScreen.css';

const MAIN_WELCOME_VO_LINE = "Hi bestie... I'm Ganesha. I am known as the remover of obstacles, and I help children be wise, kind, and brave. Come play with me.";

const MainWelcomeScreen = ({ onStartAdventure }) => {
  const [showButton, setShowButton] = useState(false);
  const [showHintArrow, setShowHintArrow] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const containerRef = useRef(null);
  const ambientRef = useRef(null);
  const fadeRef = useRef(null);
  const voiceTimersRef = useRef([]);
  const introSpokenRef = useRef(false);
  const introAttemptRef = useRef(false);

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
    let isAudioOn = audioEnabled === null ? true : audioEnabled === 'true';
    // Welcome screen should recover from stale global mute flags left by replay flows.
    if (!isAudioOn) {
      localStorage.setItem('ganesha_audio_enabled', 'true');
      isAudioOn = true;
    }
    if (!isAudioOn || !window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') {
      return () => {
        voiceTimersRef.current.forEach(clearTimeout);
        window.speechSynthesis?.cancel();
      };
    }

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices() || [];
      if (!voices.length) return null;
      return (
        voices.find((v) => /en(-|_)?(US|IN|GB)/i.test(v.lang || '')) ||
        voices.find((v) => /en/i.test(v.lang || '')) ||
        voices[0]
      );
    };

    const speakIntro = () => {
      if (introSpokenRef.current || introAttemptRef.current) return;
      introAttemptRef.current = true;
      const utterance = new window.SpeechSynthesisUtterance(MAIN_WELCOME_VO_LINE);
      utterance.rate = 1.02;
      utterance.pitch = 1;
      utterance.volume = 0.9;
      const voice = pickVoice();
      if (voice) utterance.voice = voice;
      utterance.onstart = () => {
        introSpokenRef.current = true;
      };
      utterance.onerror = () => {
        introAttemptRef.current = false;
      };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    };

    const scheduleIntro = () => {
      const timerId = setTimeout(speakIntro, 500);
      voiceTimersRef.current.push(timerId);
    };

    // Start VO after screen fade-in completes, then +500ms.
    const containerEl = containerRef.current;
    if (containerEl) {
      containerEl.addEventListener('animationend', scheduleIntro, { once: true });
      // Fallback in case animationend doesn't fire on some browsers.
      const fallbackTimer = setTimeout(scheduleIntro, 1500);
      voiceTimersRef.current.push(fallbackTimer);
    } else {
      scheduleIntro();
    }

    // Fallback: if speech is delayed/blocked, trigger on first interaction.
    const onFirstInteraction = () => speakIntro();
    document.addEventListener('pointerdown', onFirstInteraction, { once: true });
    document.addEventListener('touchstart', onFirstInteraction, { once: true });
    // Some iOS browsers load voices lazily.
    window.speechSynthesis.addEventListener?.('voiceschanged', speakIntro, { once: true });

    return () => {
      voiceTimersRef.current.forEach(clearTimeout);
      window.speechSynthesis?.cancel();
      document.removeEventListener('pointerdown', onFirstInteraction);
      document.removeEventListener('touchstart', onFirstInteraction);
      window.speechSynthesis.removeEventListener?.('voiceschanged', speakIntro);
      containerEl?.removeEventListener('animationend', scheduleIntro);
    };
  }, []);

  // Soft ambient bed on welcome screen (same track as map, lower volume)
  useEffect(() => {
    const audio = ambientRef.current;
    if (!audio) return;

    const audioEnabled = localStorage.getItem('ganesha_audio_enabled');
    const isAudioOn = audioEnabled === null ? true : audioEnabled === 'true';
    if (!isAudioOn) return;

    const TARGET_VOL = 0.22;

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
    <div ref={containerRef} className="main-welcome-container">
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
          <h1 className="welcome-title">Ganesha My Bestie</h1>
          <p className="welcome-subtitle">Come play with me.</p>
          <p className="welcome-story">
            Ganesha is a loving friend known as the remover of obstacles. He teaches us to use our
            big ears to listen, our calm mind to think, and our kind heart to help others.
          </p>
        </div>
      </div>
      
      {/* GANESHA */}
      <div className={`welcome-ganesha-image-container ${showButton ? 'visible' : ''}`}>
        <div className="ganesha-wrap">
          <GaneshaCharacter
            expression="happy"
            pose="blessing"
            size="100%"
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
