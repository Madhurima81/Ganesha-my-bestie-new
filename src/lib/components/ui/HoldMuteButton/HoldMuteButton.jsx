import React, { useCallback, useEffect, useRef, useState } from 'react';
import '../AudioToggle/AudioToggle.css';
import { isVoiceMuted, setVoiceMuted, subscribeVoiceMute } from '../../../utils/voiceMute';

const HOLD_MS = 1000;
const RING_R = 27;
const RING_C = 2 * Math.PI * RING_R;

/**
 * HoldMuteButton — Home-only voice mute (voice only; SFX and ambient keep playing).
 * Unmuted: a plain tap does nothing, so a stray toddler tap can't mute; press and
 * hold ~1s (a ring fills) to mute. Muted: a single tap unmutes.
 * Reads/writes the shared flag in utils/voiceMute (same one Settings > Voice uses).
 */
const HoldMuteButton = ({ position = 'bottom-left', onUnmute }) => {
  const [muted, setMuted] = useState(isVoiceMuted);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(0);
  const holdingRef = useRef(false);
  const justMutedRef = useRef(false);
  const justMutedTimer = useRef(null);

  useEffect(() => subscribeVoiceMute(setMuted), []);

  const cancelHold = useCallback(() => {
    holdingRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setProgress(0);
  }, []);

  useEffect(() => () => { cancelHold(); clearTimeout(justMutedTimer.current); }, [cancelHold]);

  const tick = useCallback(() => {
    if (!holdingRef.current) return;
    const p = Math.min(1, (performance.now() - startRef.current) / HOLD_MS);
    setProgress(p);
    if (p >= 1) {
      cancelHold();
      setVoiceMuted(true);
      // letting go of the button fires a click; it must not read as the tap that unmutes
      justMutedRef.current = true;
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [cancelHold]);

  // the click that follows letting go of a finished hold arrives right after pointerup; drop it, then forget it
  const handlePointerUp = () => {
    cancelHold();
    clearTimeout(justMutedTimer.current);
    justMutedTimer.current = setTimeout(() => { justMutedRef.current = false; }, 350);
  };

  const handlePointerDown = (e) => {
    justMutedRef.current = false;
    if (muted) return; // unmute happens on click
    e.currentTarget.setPointerCapture?.(e.pointerId);
    holdingRef.current = true;
    startRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  };

  const handleClick = () => {
    if (justMutedRef.current) { justMutedRef.current = false; return; }
    if (!muted) return; // plain tap while unmuted does nothing
    setVoiceMuted(false);
    onUnmute?.();
  };

  const label = muted ? 'Voice is muted. Tap to turn voice on' : 'Press and hold to mute voice';

  return (
    <button
      type="button"
      className={`audio-toggle audio-toggle--${position} ${muted ? 'audio-toggle--off' : 'audio-toggle--on'}`}
      style={{ touchAction: 'none', WebkitTouchCallout: 'none', userSelect: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={cancelHold}
      onPointerLeave={cancelHold}
      onClick={handleClick}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={label}
      title={label}
    >
      <img
        src={muted ? '/images/icons/icon-sound-off.svg' : '/images/icons/icon-sound-on.svg'}
        alt=""
        className="audio-toggle__icon"
      />
      {progress > 0 && (
        <svg
          viewBox="0 0 60 60"
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', transform: 'rotate(-90deg)' }}
        >
          <circle
            cx="30" cy="30" r={RING_R}
            fill="none" stroke="#FFD700" strokeWidth="4" strokeLinecap="round"
            strokeDasharray={RING_C}
            strokeDashoffset={RING_C * (1 - progress)}
          />
        </svg>
      )}
    </button>
  );
};

export default HoldMuteButton;
