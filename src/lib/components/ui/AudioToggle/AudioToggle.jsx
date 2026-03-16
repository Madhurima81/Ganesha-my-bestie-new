import React from 'react';
import './AudioToggle.css';

/**
 * AudioToggle — lavender circle style matching profile chip + home button.
 * Uses icon-sound-on.svg / icon-sound-off.svg from public/images/icons/.
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
      <img
        src={isAudioOn
          ? '/images/icons/icon-sound-on.svg'
          : '/images/icons/icon-sound-off.svg'}
        alt=""
        className="audio-toggle__icon"
      />
    </button>
  );
};

export default AudioToggle;
