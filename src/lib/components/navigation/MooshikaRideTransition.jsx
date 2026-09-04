// MooshikaRideTransition.jsx — Chosen avatar rides Mooshika across the sky pan bg
import React, { useEffect, useRef, useState } from 'react';
import './MooshikaRideTransition.css';

const MooshikaRideTransition = ({ avatarId = 'monkey', profileName, onComplete }) => {
  const completedRef = useRef(false);
  const [isLanding, setIsLanding] = useState(false);

  useEffect(() => {
    const audioEnabled = localStorage.getItem('ganesha_audio_enabled');
    const isAudioOn = audioEnabled === null ? true : audioEnabled === 'true';
    const canSpeak = isAudioOn && window.speechSynthesis && typeof window.SpeechSynthesisUtterance !== 'undefined';

    // Soft whoosh
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) {
        const ctx = new Ctx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 2.8);
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.025, ctx.currentTime + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 3);
      }
    } catch (e) {
      // non-blocking
    }

    const finishTransition = () => {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete && onComplete();
      }
    };

    const voTimer = setTimeout(() => {
      if (canSpeak) {
        window.speechSynthesis.cancel();
        const u = new window.SpeechSynthesisUtterance(
          `Hold on tight, ${profileName || 'little one'}! We are flying to my world.`
        );
        u.rate = 1.02;
        u.pitch = 1.05;
        u.volume = 0.9;
        u.onend = () => {
          setTimeout(finishTransition, 180);
        };
        u.onerror = () => {
          setTimeout(finishTransition, 180);
        };
        window.speechSynthesis.speak(u);
      }
    }, 500);

    const landingTimer = setTimeout(() => {
      setIsLanding(true);
    }, 3000);

    const doneTimer = setTimeout(() => {
      finishTransition();
    }, canSpeak ? 5200 : 3500);

    return () => {
      clearTimeout(voTimer);
      clearTimeout(landingTimer);
      clearTimeout(doneTimer);
      if (!completedRef.current) {
        window.speechSynthesis?.cancel();
      }
    };
  }, [profileName, onComplete]);

  return (
    <div className={`mooshika-ride-scene ${isLanding ? 'exiting' : ''}`}>
      {/* Sky pan bg — slides right-to-left to create forward-flight illusion */}
      <div className="sky-pan" />

      {/* Mooshika + avatar — stays roughly centered, gentle bob, dips at end */}
      <div className={`mooshika-flyer ${isLanding ? 'landing' : ''}`}>
        <img
          src="/images/mooshika-flying.webp"
          alt="Mooshika"
          className="mooshika-img"
        />
        <img
          src={`/images/new-explorer-${avatarId}.webp`}
          alt="Your avatar"
          className="rider-img"
          onError={(e) => {
            if (!e.currentTarget.dataset.fallback) {
              e.currentTarget.dataset.fallback = '1';
              e.currentTarget.src = `/images/new-explorer-${avatarId}.png`;
            }
          }}
        />
      </div>

      {/* Sparkle trail */}
      <div className="mooshika-trail">
        <span /><span /><span /><span />
      </div>
    </div>
  );
};

export default MooshikaRideTransition;
