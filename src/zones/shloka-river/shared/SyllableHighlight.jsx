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
  const nextSlotRef = useRef(0); // earliest time (ms) the next syllable may start
  const onSyllableLitRef = useRef(onSyllableLit);
  onSyllableLitRef.current = onSyllableLit; // timers always call the latest handler

  const clearPending = () => {
    staggerTimersRef.current.forEach(clearTimeout);
    staggerTimersRef.current = [];
    nextSlotRef.current = 0;
  };

  useLayoutEffect(() => {
    const prevLitCount = prevLitCountRef.current;

    if (litCount < prevLitCount) {
      // Scene reset / replay: drop anything still queued for the old run.
      clearPending();
    } else if (litCount > prevLitCount && onSyllableLitRef.current) {
      // A fast drag can cross several thresholds at once, or litCount can rise
      // again before the previous syllable's timer has fired. Each syllable
      // gets its own slot in a queue and pending timers are NEVER cancelled by
      // a later increase (that used to silently drop syllables), and each new
      // call's stopVoice() can't kill the previous one before it's heard.
      const now = Date.now();
      for (let index = prevLitCount; index < litCount; index += 1) {
        const syllableAudio = audioSyllables[index] ?? syllables[index];
        if (!syllableAudio) continue;
        const startAt = Math.max(now, nextSlotRef.current);
        nextSlotRef.current = startAt + SYLLABLE_STAGGER_MS;
        const timerId = setTimeout(() => {
          staggerTimersRef.current = staggerTimersRef.current.filter((t) => t !== timerId);
          onSyllableLitRef.current?.(syllableAudio, index);
        }, startAt - now);
        staggerTimersRef.current.push(timerId);
      }
    }

    prevLitCountRef.current = litCount;
  }, [audioSyllables, litCount, syllables]);

  useEffect(() => clearPending, []);

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
