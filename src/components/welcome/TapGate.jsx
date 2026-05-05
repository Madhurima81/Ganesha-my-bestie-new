import React, { useRef } from 'react';
import './TapGate.css';

const TapGate = ({ onUnlock }) => {
  const unlockedRef = useRef(false);

  const unlockAudio = async () => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;

    try {
      localStorage.setItem('ganesha_audio_enabled', 'true');
    } catch {}

    // Unlock HTML audio in this user gesture.
    try {
      const audio = new Audio(
        'data:audio/mp3;base64,SUQzAwAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjQwLjEwMQAAAAAAAAAAAAAA//uQZAAPAAAAAAACAAADSAAAAAEAAACtAAAAAAA='
      );
      audio.volume = 0;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
    } catch {}

    // Unlock speech synthesis in this same gesture.
    try {
      if (window.speechSynthesis && typeof window.SpeechSynthesisUtterance !== 'undefined') {
        const u = new window.SpeechSynthesisUtterance('');
        u.volume = 0;
        window.speechSynthesis.speak(u);
      }
    } catch {}

    onUnlock?.();
  };

  return (
    <div className="tap-gate-screen">
      <button className="tap-gate-button" type="button" onClick={unlockAudio}>
        Tap to continue
      </button>
    </div>
  );
};

export default TapGate;
