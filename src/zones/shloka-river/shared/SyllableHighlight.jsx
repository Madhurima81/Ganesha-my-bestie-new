import React, { useEffect, useRef } from 'react';
import './SyllableHighlight.css';

export default function SyllableHighlight({
  syllables = [],
  litCount = 0,
  audioSyllables = [],
  onSyllableLit = null,
}) {
  const prevLitCountRef = useRef(litCount);

  useEffect(() => {
    const prevLitCount = prevLitCountRef.current;

    if (litCount > prevLitCount && onSyllableLit) {
      for (let index = prevLitCount; index < litCount; index += 1) {
        const syllableAudio = audioSyllables[index] ?? syllables[index];
        if (syllableAudio) onSyllableLit(syllableAudio, index);
      }
    }

    prevLitCountRef.current = litCount;
  }, [audioSyllables, litCount, onSyllableLit, syllables]);

  return (
    <div className="syl-row" role="status" aria-live="polite">
      {syllables.map((s, i) => (
        <span key={i} className={`syl ${i < litCount ? 'lit' : ''}`}>{s}</span>
      ))}
    </div>
  );
}
