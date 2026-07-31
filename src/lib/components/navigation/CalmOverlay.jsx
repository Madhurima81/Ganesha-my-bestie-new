// CalmOverlay.jsx - Tiny Story Calm Experience
// Full-screen co-regulation overlay for parent + child
// NO timers · NO progress bars · NO achievement tone · NO gamification
// Fonts: Baloo 2 (labels) · Nunito (body) - NO EXCEPTIONS

import React, { useState, useEffect } from 'react';
import './CalmOverlay.css';
import CloseButton from '../../../components/CloseButton';

const TOTAL_CYCLES = 3;

const PARTICLES = [
  { left: '7%', top: '16%', size: 5, delay: '0s', dur: '7s', color: 'rgba(207,198,243,0.55)' },
  { left: '18%', top: '74%', size: 4, delay: '1.2s', dur: '8s', color: 'rgba(180,160,255,0.48)' },
  { left: '30%', top: '10%', size: 6, delay: '2.1s', dur: '6s', color: 'rgba(207,198,243,0.42)' },
  { left: '73%', top: '20%', size: 4, delay: '0.8s', dur: '9s', color: 'rgba(220,210,255,0.50)' },
  { left: '86%', top: '64%', size: 5, delay: '1.8s', dur: '7s', color: 'rgba(207,198,243,0.45)' },
  { left: '92%', top: '13%', size: 3, delay: '3.0s', dur: '8s', color: 'rgba(180,160,255,0.52)' },
  { left: '55%', top: '84%', size: 5, delay: '2.5s', dur: '6.5s', color: 'rgba(207,198,243,0.40)' },
  { left: '44%', top: '3%', size: 7, delay: '0.4s', dur: '10s', color: 'rgba(220,210,255,0.35)' },
];

export default function CalmOverlay({ sym, onClose, onDone }) {
  const [visible, setVisible] = useState(false);
  const [breathState, setBreathState] = useState('idle');
  const [cycleCount, setCycleCount] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 60);
    const t2 = setTimeout(() => {
      setCycleCount(1);
      setBreathState('inhale');
    }, 820);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (breathState === 'inhale') {
      const t = setTimeout(() => setBreathState('exhale'), 4000);
      return () => clearTimeout(t);
    }
    if (breathState === 'exhale') {
      const t = setTimeout(() => {
        if (cycleCount < TOTAL_CYCLES) {
          setCycleCount((c) => c + 1);
          setBreathState('inhale');
        } else {
          setBreathState('complete');
        }
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [breathState, cycleCount]);

  const handleDismiss = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => {
      breathState === 'complete' ? onDone() : onClose();
    }, 540);
  };

  const breathCue =
    breathState === 'inhale' ? 'Breathe in... slowly' :
    breathState === 'exhale' ? 'Breathe out... softly' : '';

  const isBreathing = breathState === 'inhale' || breathState === 'exhale';

  return (
    <div
      className={[
        'co-veil',
        visible ? 'co-veil-visible' : '',
        exiting ? 'co-veil-exit' : '',
      ].join(' ')}
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-label="Calm breathing moment"
    >
      <div className="co-particles" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="co-particle"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              animationDelay: p.delay,
              animationDuration: p.dur,
            }}
          />
        ))}
      </div>

      <div className="co-watermark" aria-hidden="true">🐘</div>

      <div
        className={[
          'co-panel',
          visible ? 'co-panel-visible' : '',
          exiting ? 'co-panel-exit' : '',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton onClose={handleDismiss} />

        <span className="co-symbol-icon" aria-hidden="true">{sym.emoji || '🐘'}</span>
        <p className="co-technique-label">{(sym.technique || 'Breathing Together').toUpperCase()}</p>
        <p className="co-story-text">{sym.resetStory}</p>

        <div className="co-breath-area" aria-hidden="true">
          <div className="co-breath-base" />
          <div className={`co-breath-ripple${isBreathing ? ' co-ripple-active' : ''}`} />
        </div>

        {breathCue && <p className="co-breath-cue" key={breathState}>{breathCue}</p>}

        <p className={`co-closure-line${breathState === 'complete' ? ' co-closure-visible' : ''}`}>
          The feeling is getting smaller. You are safe.
        </p>
      </div>
    </div>
  );
}
