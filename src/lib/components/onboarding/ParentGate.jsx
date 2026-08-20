import React, { useEffect, useRef, useState } from 'react';
import PrivacyPolicy from './PrivacyPolicy';
import './ParentGate.css';

const CONSENT_KEY = 'parentConsent';
const MIN_ADULT_AGE = 18;
const CURRENT_YEAR = new Date().getFullYear();

const ParentGate = ({ onComplete, onBackToWelcome }) => {
  const [stage, setStage] = useState('age');
  const [birthYear, setBirthYear] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const answerInputRef = useRef(null);
  const emailInputRef = useRef(null);

  useEffect(() => {
    try {
      const existingConsent = localStorage.getItem(CONSENT_KEY);
      if (existingConsent) {
        onComplete();
      }
    } catch (error) {
      console.warn('Unable to read parent consent:', error);
    }
  }, [onComplete]);

  useEffect(() => {
    if (stage === 'age') {
      answerInputRef.current?.focus();
    }
  }, [stage]);

  useEffect(() => {
    document.querySelector('.parent-gate-screen')?.scrollTo(0, 0);
  }, [stage]);

  const handleBirthYearChange = (event) => {
    const nextValue = event.target.value.replace(/\D/g, '');
    setBirthYear(nextValue.slice(0, 4));
  };

  const submitBirthYear = () => {
    const year = parseInt(birthYear, 10);
    const nextAttempts = attempts + 1;

    if (
      Number.isNaN(year) ||
      year < 1900 ||
      year > CURRENT_YEAR ||
      CURRENT_YEAR - year < MIN_ADULT_AGE
    ) {
      setAttempts(nextAttempts);

      if (nextAttempts >= 3) {
        onBackToWelcome();
        return;
      }

      setBirthYear('');
      setFeedback('Ask a grown-up to help!');
      return;
    }

    setFeedback('');
    setBirthYear('');
    setStage('consent');
  };

  const handleConsentContinue = () => {
    const payload = {
      parentConsentGiven: true,
      consentTimestamp: Date.now(),
      parentEmail: parentEmail.trim(),
    };

    localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
    onComplete();
  };

  if (stage === 'privacy') {
    return <PrivacyPolicy onBack={() => setStage('consent')} />;
  }

  return (
    <div className="parent-gate-screen">
      <div className="parent-gate-card">
        {stage === 'age' && (
          <div className="parent-gate-stage parent-gate-stage--age">
            <p className="parent-gate-kicker">Grown-ups only!</p>
            <h1>Time to get a grown-up!</h1>
            <p className="parent-gate-copy">
              Ganesha needs a quick grown-up check before a child profile is created.
            </p>

            <label className="parent-gate-field parent-gate-field--center">
              <span>What year were you born?</span>
              <input
                ref={answerInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint="done"
                value={birthYear}
                onChange={handleBirthYearChange}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    submitBirthYear();
                  }
                }}
                placeholder="e.g. 1990"
                aria-label="Enter your birth year"
              />
            </label>

            {feedback ? (
              <p className="parent-gate-feedback">{feedback}</p>
            ) : null}

            <button
              type="button"
              className="parent-gate-primary"
              onClick={submitBirthYear}
            >
              Continue
            </button>
          </div>
        )}

        {stage === 'consent' && (
          <div className="parent-gate-stage parent-gate-stage--consent">
            <p className="parent-gate-kicker">Parent consent</p>
            <h1>Before your child begins</h1>
            <p className="parent-gate-copy">
              A quick parent step before your child starts playing.
            </p>

            <label className="parent-gate-field">
              <span>Parent email (optional - for updates)</span>
              <input
                ref={emailInputRef}
                type="email"
                value={parentEmail}
                onChange={(event) => setParentEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                inputMode="email"
                enterKeyHint="done"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    event.currentTarget.blur();
                  }
                }}
              />
            </label>

            <label className="parent-gate-checkbox">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(event) => setIsChecked(event.target.checked)}
              />
              <span>
                I am the parent/guardian. I understand this app stores my child&apos;s
                first name, age, and game progress on this device only, and I agree to
                the Privacy Policy.
              </span>
            </label>

            <div className="parent-gate-actions parent-gate-actions--row">
              <button
                type="button"
                className="parent-gate-link parent-gate-link--text"
                onClick={() => {
                  emailInputRef.current?.blur();
                  setStage('privacy');
                }}
              >
                Privacy Policy
              </button>

              <button
                type="button"
                className="parent-gate-primary parent-gate-primary--auto"
                onClick={() => {
                  emailInputRef.current?.blur();
                  handleConsentContinue();
                }}
                disabled={!isChecked}
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentGate;
