import React, { useEffect, useState } from 'react';
import SparkleAnimation from '../../../lib/components/animation/SparkleAnimation';
import './AboutMeSparkle.css';

// One sparkle for every About Me Hut game. Games choose a preset, never their own numbers.
// Same gold star as Symbol Mountain (NewModakSceneV7 uses #ffd76b stars).
//   burst  - small pop for one right answer
//   big    - the "all done" shower
//   linger - a softer sparkle that stays about 3 s (behind a card, around a drawing)
//   persist- stays until the screen is left (fadeOut false, onComplete never fires; Family Tree's Ganesha tree)
// SparkleAnimation itself loops its stars until it is unmounted, so this wrapper fades them out and
// removes them at the end of `duration` (the shared component only calls onComplete, it never removes itself).
const GOLD = '#ffd76b';
const FADE_MS = 500;

const PRESETS = {
  burst:  { count: 14, size: 10, duration: 1700, fadeOut: true },
  big:    { count: 42, size: 12, duration: 2400, fadeOut: true },
  linger: { count: 20, size: 10, duration: 3000, fadeOut: true },
};
const PERSIST = { count: 20, size: 7, duration: 4000, fadeOut: false };

const AboutMeSparkle = ({ preset = 'burst', persist = false, onComplete }) => {
  const p = persist ? PERSIST : (PRESETS[preset] || PRESETS.burst);
  const [phase, setPhase] = useState('on'); // on -> fading -> gone

  useEffect(() => {
    if (!p.fadeOut) return undefined;
    // Fade during the LAST 500 ms of `duration`, so a game's own unmount timer (duration + 50..80 ms) never cuts a sparkle off.
    const fadeTimer = setTimeout(() => setPhase('fading'), Math.max(0, p.duration - FADE_MS));
    const goneTimer = setTimeout(() => setPhase('gone'), p.duration + 50);
    return () => { clearTimeout(fadeTimer); clearTimeout(goneTimer); };
  }, [p.fadeOut, p.duration]);

  if (phase === 'gone') return null;
  const extra = onComplete ? { onComplete } : {};
  return (
    <div className={`am-sparkle${phase === 'fading' ? ' am-sparkle--fading' : ''}`}>
      <SparkleAnimation
        type="star"
        count={p.count}
        color={GOLD}
        size={p.size}
        duration={p.duration}
        fadeOut={p.fadeOut}
        area="full"
        {...extra}
      />
    </div>
  );
};

export default AboutMeSparkle;
