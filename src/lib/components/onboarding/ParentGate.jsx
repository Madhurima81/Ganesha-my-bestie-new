import React, { useMemo, useState, useCallback } from 'react';
import OnboardingCard from './OnboardingCard';
import './ParentGate.css';

// Reusable parent gate — a Khan Academy Kids-style challenge: 3-4 random digits are
// spelled out as words, and the parent keys the digits back in on a numeric keypad.
// Re-mount this component fresh for ANY adult-only entry point (first-run onboarding,
// "add profile", "edit profile", parent dashboard, etc) — it holds no state outside
// itself and writes nothing to storage that would let a repeat visit skip it. A wrong
// answer just regenerates a new random sequence; there is no lockout.
const DIGIT_WORDS = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];

function generateChallenge() {
  const length = Math.random() < 0.5 ? 3 : 4;
  const digits = Array.from({ length }, () => Math.floor(Math.random() * 10));
  return { digits, answer: digits.join('') };
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'];

const ParentGate = ({ onComplete, onBackToWelcome }) => {
  const [challenge, setChallenge] = useState(generateChallenge);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');

  const words = useMemo(
    () => challenge.digits.map((d) => DIGIT_WORDS[d]).join(', '),
    [challenge]
  );

  const handleKey = useCallback((key) => {
    setFeedback('');
    if (key === 'clear') {
      setInput('');
      return;
    }
    if (key === 'back') {
      setInput((prev) => prev.slice(0, -1));
      return;
    }
    setInput((prev) => {
      if (prev.length >= challenge.digits.length) return prev;
      const next = prev + key;
      if (next.length === challenge.digits.length) {
        if (next === challenge.answer) {
          setTimeout(() => onComplete(), 120);
        } else {
          setFeedback("That's not quite it — here's a new one.");
          setChallenge(generateChallenge());
          return '';
        }
      }
      return next;
    });
  }, [challenge, onComplete]);

  const displaySlots = challenge.digits.map((_, i) => input[i] || '');

  return (
    <OnboardingCard heading="Grown-ups only!" subheading="A quick check before we continue.">
      <p className="pg-prompt">{words}</p>

      <div className="pg-slots" aria-live="polite">
        {displaySlots.map((digit, i) => (
          <span key={i} className="pg-slot">{digit}</span>
        ))}
      </div>

      {feedback ? <p className="onb-error">{feedback}</p> : null}

      <div className="pg-keypad">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className="pg-key"
            onClick={() => handleKey(key)}
          >
            {key === 'clear' ? 'Clear' : key === 'back' ? '⌫' : key}
          </button>
        ))}
      </div>

      {onBackToWelcome && (
        <button type="button" className="onb-link" onClick={onBackToWelcome}>
          ← Back
        </button>
      )}
    </OnboardingCard>
  );
};

export default ParentGate;
