import React from 'react';
import './AudioToggle.css';

/**
 * AudioToggle — lavender circle style matching profile chip + home button.
 * Uses icon-sound-on.svg / icon-sound-off.svg from public/images/icons/.
 *
 * Voice-only: this only silences narration/VO (repeat players skipping lines
 * they've already heard). SFX and music are intentionally NOT affected —
 * see useVoiceGuidance.js / AudioService.js. Labels say "voice", not "sound",
 * so it doesn't read as a whole-app mute.
 *
 * Props:
 *   isAudioOn  — boolean, current voice-narration state
 *   onToggle   — function, called on tap
 *   position   — 'bottom-right' (default) | 'bottom-left' | 'top-right' | 'top-left'
 */
const AudioToggle = ({ isAudioOn, onToggle, position = 'bottom-right' }) => {
  return (
    <button
      className={`audio-toggle audio-toggle--${position} ${isAudioOn ? 'audio-toggle--on' : 'audio-toggle--off'}`}
      onClick={onToggle}
      aria-label={isAudioOn ? 'Turn off voice narration' : 'Turn on voice narration'}
      title={isAudioOn ? 'Turn off voice' : 'Turn on voice'}
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
