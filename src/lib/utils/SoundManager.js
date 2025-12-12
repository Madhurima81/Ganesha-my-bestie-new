// SoundManager.js - Production-ready sound system
class SoundManager {
  constructor() {
    this.sounds = {};
    this.muted = false;
    this.volume = 0.7; // 70% volume default
  }

  // Preload sound
  loadSound(name, url) {
    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.volume = this.volume;
    this.sounds[name] = audio;
    
    return new Promise((resolve, reject) => {
      audio.addEventListener('canplaythrough', resolve, { once: true });
      audio.addEventListener('error', reject, { once: true });
    });
  }

  // Play sound
  play(name) {
    if (this.muted) return;
    
    const sound = this.sounds[name];
    if (!sound) {
      console.warn(`Sound "${name}" not loaded`);
      return;
    }

    // Clone audio for overlapping sounds
    const soundClone = sound.cloneNode();
    soundClone.volume = this.volume;
    
    soundClone.play().catch(err => {
      console.warn(`Failed to play sound "${name}":`, err);
    });
  }

  // Set volume (0.0 to 1.0)
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume;
    });
  }

  // Toggle mute
  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();

// Preload all sounds
export const initializeSounds = async () => {
  try {
    await Promise.all([
      soundManager.loadSound('button-click', '/sounds/button-click.mp3'),
      soundManager.loadSound('success', '/sounds/success-chime.mp3'),
      soundManager.loadSound('sparkle', '/sounds/sparkle.mp3'),
      // Add more sounds as needed
    ]);
    console.log('✅ All sounds loaded');
  } catch (err) {
    console.warn('⚠️ Some sounds failed to load:', err);
  }
};