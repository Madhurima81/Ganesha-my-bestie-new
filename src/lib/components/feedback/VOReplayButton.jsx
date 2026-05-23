import React, { useState } from 'react';
import './VOReplayButton.css';

/**
 * VOReplayButton — child-tappable replay for the last-played VO of the current phase.
 *
 * Usage:
 *   const lastVoRef = useRef(null);
 *
 *   // whenever you fire a phase VO, also store it:
 *   const playPhaseVO = (line) => {
 *     lastVoRef.current = line;
 *     speak(line, { age: 6, style: "child" });
 *   };
 *
 *   <VOReplayButton getLine={() => lastVoRef.current} speak={speak} />
 *
 * Props:
 *   getLine  () => string | null   – returns the most recent VO line
 *   speak    function              – useGaneshaVoice().speak
 *   position 'top-right' | 'top-left' (default 'top-right')
 *   disabled boolean               – hide when no VO has played yet
 */
export default function VOReplayButton({
  getLine,
  speak,
  onReplay,
  position = 'top-right',
  disabled = false,
}) {
  const [playing, setPlaying] = useState(false);

  const handleTap = () => {
    if (playing || disabled) return;
    setPlaying(true);
    if (typeof onReplay === 'function') {
      onReplay();
    } else {
      const line = typeof getLine === 'function' ? getLine() : null;
      if (!line || typeof speak !== 'function') {
        setPlaying(false);
        return;
      }
      speak(line, { age: 6, style: 'child', moment: 'encouragement' });
    }
    // Visual cue lasts ~2.5s; matches typical short VO length
    setTimeout(() => setPlaying(false), 2500);
  };

  if (disabled) return null;

  return (
    <button
      type="button"
      className={`vo-replay-btn vo-replay-btn--${position} ${playing ? 'vo-replay-btn--playing' : ''}`}
      onClick={handleTap}
      aria-label="Replay voice"
    >
            <img
        className="vo-replay-icon"
        src="/images/icons/replay-icon.png"
        alt=""
        aria-hidden="true"
      />
      {playing && (
        <>
          <span className="vo-wave vo-wave--1" />
          <span className="vo-wave vo-wave--2" />
        </>
      )}
    </button>
  );
}

