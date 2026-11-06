import React, { useState, useRef, useEffect } from 'react';
import { VO_REPLAY_EVENT } from '../../hooks/useOnVoiceReplay';
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
 *   // or provide a scene-specific replay callback when replay needs
 *   // phase-aware timing / voice config / side effects:
 *   <VOReplayButton onReplay={replayCurrentVoice} />
 *
 * Props:
 *   getLine  () => string | null   – returns the most recent VO line
 *   speak    function              – useGaneshaVoice().speak
 *   onReplay function              – optional scene-owned replay handler
 *   position 'top-right' | 'top-left' (default 'top-right')
 *   variant  'gameplay' opts into the 60px-hit / 46px-visible shell used by the 13 live scenes
 *   disabled boolean               – hide when no VO has played yet
 */
export default function VOReplayButton({
  getLine,
  speak,
  onReplay,
  position = 'top-right',
  variant,
  disabled = false,
}) {
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);
  const timerRef = useRef(null);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      window.clearTimeout(timerRef.current);
    };
  }, []);

  // One release path: the line's real end (via `done`), the short fallback timer, or the failsafe.
  const release = () => {
    window.clearTimeout(timerRef.current);
    playingRef.current = false;
    if (aliveRef.current) setPlaying(false);
  };

  const handleTap = () => {
    // The ref (not just state) blocks a double-tap landing before React re-renders.
    if (playingRef.current || playing || disabled) return;
    playingRef.current = true;
    setPlaying(true);
    window.dispatchEvent(new CustomEvent(VO_REPLAY_EVENT));
    if (typeof onReplay === 'function') {
      // A scene that wants the button locked until its line really ends reads `done` and calls it
      // from the line's onEnd; a scene that ignores the argument keeps the 2.5s lock below.
      // The 10s failsafe means a lost onEnd can never leave the button dead.
      const wantsDone = onReplay.length > 0;
      onReplay(release);
      timerRef.current = window.setTimeout(release, wantsDone ? 10000 : 2500);
      return;
    } else {
      const line = typeof getLine === 'function' ? getLine() : null;
      if (!line || typeof speak !== 'function') {
        release();
        return;
      }
      speak(line, { age: 6, style: 'child', moment: 'encouragement', onEnd: release });
    }
    // Visual cue lasts ~2.5s; matches typical short VO length (10s failsafe if onEnd is lost)
    timerRef.current = window.setTimeout(release, 10000);
  };

  if (disabled) return null;

  return (
    <button
      type="button"
      className={`vo-replay-btn vo-replay-btn--${position} ${playing ? 'vo-replay-btn--playing' : ''}${variant === 'gameplay' ? ' vo-replay-btn--gameplay' : ''}`}
      onClick={handleTap}
      aria-label="Replay voice"
    >
            <img
        className="vo-replay-icon"
        src="/images/icons/replay-icon-opt.webp"
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

