import React, { useEffect, useLayoutEffect, useRef } from 'react';
import './SyllableHighlight.css';

const SYLLABLE_STAGGER_MS = 320;

export default function SyllableHighlight({
  syllables = [],
  litCount = 0,
  dimIndices = [],
  audioSyllables = [],
  onSyllableLit = null,
}) {
  const prevLitCountRef = useRef(litCount);
  const staggerTimersRef = useRef([]);

  useLayoutEffect(() => {
    const prevLitCount = prevLitCountRef.current;

    if (litCount > prevLitCount && onSyllableLit) {
      // A fast scratch/drag can cross more than one threshold before React
      // commits, jumping litCount by 2+ in one go. Firing onSyllableLit for
      // all of them in the same tick lets each new call's stopVoice() kill
      // the previous one's audio before it's heard — so stagger playback
      // instead of dispatching the whole range synchronously.
      staggerTimersRef.current.forEach(clearTimeout);
      staggerTimersRef.current = [];
      for (let index = prevLitCount; index < litCount; index += 1) {
        const syllableAudio = audioSyllables[index] ?? syllables[index];
        if (!syllableAudio) continue;
        const delay = (index - prevLitCount) * SYLLABLE_STAGGER_MS;
        const timerId = setTimeout(() => onSyllableLit(syllableAudio, index), delay);
        staggerTimersRef.current.push(timerId);
      }
    }

    prevLitCountRef.current = litCount;
  }, [audioSyllables, litCount, onSyllableLit, syllables]);

  useEffect(() => () => {
    staggerTimersRef.current.forEach(clearTimeout);
    staggerTimersRef.current = [];
  }, []);

  return (
    <div className="syl-row" role="status" aria-live="polite">
      {syllables.map((s, i) => (
        <span
          key={i}
          className={`syl ${i < litCount ? 'lit' : ''} ${dimIndices.includes(i) ? 'is-dimmed' : ''}`}
        >
          {s}
        </span>
      ))}
    </div>
  );
}
