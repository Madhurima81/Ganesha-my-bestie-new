import React, { useEffect, useMemo, useState, useCallback } from 'react';
import OnboardingCard from './OnboardingCard';
import './ParentGate.css';

// Reusable parent gate — a Khan Academy Kids-style challenge: 4 random digits are
// spelled out as words, and the parent keys the digits back in on a numeric keypad.
// Re-mount this component fresh for ANY adult-only entry point (first-run onboarding,
// "add profile", "edit profile", parent dashboard, etc) — it holds no state outside
// itself and writes nothing to storage that would let a repeat visit skip it. A wrong
// answer just regenerates a new random sequence; there is no lockout.
const DIGIT_WORDS = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];

function generateChallenge() {
  const digits = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10));
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

  // Hardware keyboard: 0-9 (top row or number pad) types a digit, Backspace/Delete removes one,
  // Escape clears. Same path as the on-screen keypad, so the answer check and the reset on a wrong
  // answer behave identically. Ignored with Ctrl/Cmd/Alt held and while typing in a text field.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const tag = event.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target?.isContentEditable) return;
      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        handleKey(event.key);
      } else if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();
        handleKey('back');
      } else if (event.key === 'Escape') {
        event.preventDefault();
        handleKey('clear');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKey]);

  const displaySlots = challenge.digits.map((_, i) => input[i] || '');

  return (
    <OnboardingCard heading="Grown-ups only!" subheading="A quick check before we continue.">
      <div className="pg-layout">
        <div className="pg-challenge">
          <p className="pg-prompt">{words}</p>

          <div className="pg-slots" aria-live="polite">
            {displaySlots.map((digit, i) => (
              <span key={i} className="pg-slot">{digit}</span>
            ))}
          </div>

          <div className="pg-feedback-space">
            {feedback ? <p className="onb-error">{feedback}</p> : null}
          </div>

          {onBackToWelcome && (
            <button type="button" className="onb-link pg-back" onClick={onBackToWelcome}>
              ← Back
            </button>
          )}
        </div>

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
      </div>
    </OnboardingCard>
  );
};

export default ParentGate;
