import { useEffect } from 'react';
import { getSyllablePath, getWordPath } from '../config/content/voiceGuidance';

// Warm a Sanskrit word's syllable + full-word MP3s so the first tap plays instantly.
// playSyllable/playWord build a fresh Audio on demand, and an uncached fetch/decode was the lateness.
// fetch() (not Audio.preload) so iOS warms too, and it fills the service worker's audio cache.
const warmed = new Set();

export default function useWarmSanskritAudio(word, syllables = []) {
  const key = syllables.join('|');
  useEffect(() => {
    if (!word) return;
    const paths = [getWordPath(word), ...key.split('|').filter(Boolean).map((s) => getSyllablePath(word, s))];
    paths.forEach((path) => {
      if (!path || warmed.has(path)) return;
      warmed.add(path);
      fetch(path).catch(() => warmed.delete(path)); // offline/blip: allow a retry next mount
    });
  }, [word, key]);
}
