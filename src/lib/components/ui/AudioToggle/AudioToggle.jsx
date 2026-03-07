import React from 'react';
import './AudioToggle.css';

/**
 * AudioToggle — persistent audio on/off button for all scenes.
 * Matches the HomeButton Toca Boca visual style.
 *
 * Usage:
 *   const { isAudioOn, toggleAudio } = useAudioPreference();
 *   <AudioToggle isAudioOn={isAudioOn} onToggle={toggleAudio} />
 *
 * Props:
 *   isAudioOn  — boolean, current audio state
 *   onToggle   — function, called on tap
 *   position   — 'bottom-right' (default) | 'bottom-left' | 'top-right' | 'top-left'
 */
const AudioToggle = ({ isAudioOn, onToggle, position = 'bottom-right' }) => {
  return (
    <button
      className={`audio-toggle audio-toggle--${position} ${isAudioOn ? 'audio-toggle--on' : 'audio-toggle--off'}`}
      onClick={onToggle}
      aria-label={isAudioOn ? 'Turn off sound' : 'Turn on sound'}
      title={isAudioOn ? 'Mute' : 'Unmute'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        fill="none"
        className="audio-toggle__icon"
      >
        {/* Speaker body */}
        <path
          d="M8 17v14h8l11 9V8L16 17H8z"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {isAudioOn ? (
          <>
            {/* Sound wave — near */}
            <path
              d="M31 19a7 7 0 0 1 0 10"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Sound wave — far */}
            <path
              d="M36 14a14 14 0 0 1 0 20"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.65"
            />
          </>
        ) : (
          <>
            {/* Mute X */}
            <line x1="32" y1="19" x2="43" y2="30" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="43" y1="19" x2="32" y2="30" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
          </>
        )}
      </svg>
    </button>
  );
};

export default AudioToggle;
