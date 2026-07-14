import React, { useEffect, useMemo, useRef, useState } from 'react';
import PrivacyPolicy from './PrivacyPolicy';
import './ParentGate.css';

const CONSENT_KEY = 'parentConsent';

function randomQuestion() {
  const prompts = [
    { left: 7, right: 4, operator: 'x', answer: 28 },
    { left: 8, right: 3, operator: 'x', answer: 24 },
    { left: 9, right: 5, operator: '-', answer: 4 },
    { left: 6, right: 7, operator: '+', answer: 13 },
  ];

  return prompts[Math.floor(Math.random() * prompts.length)];
}

const ParentGate = ({ onComplete, onBackToWelcome }) => {
  const [stage, setStage] = useState('math');
  const [question, setQuestion] = useState(() => randomQuestion());
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const answerInputRef = useRef(null);

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

  const mathPrompt = useMemo(
    () => `${question.left} ${question.operator} ${question.right}`,
    [question]
  );

  const resetQuestion = (message) => {
    setAnswer('');
    setFeedback(message);
    setQuestion(randomQuestion());
  };

  const handleDigit = (digit) => {
    setAnswer((current) => {
      if (digit === 'del') return current.slice(0, -1);
      if (digit === '-' && current.length === 0) return '-';
      if (current.length >= 4) return current;
      return `${current}${digit}`;
    });
  };

  const handleAnswerChange = (event) => {
    const nextValue = event.target.value.replace(/[^\d-]/g, '');
    const normalizedValue = nextValue.startsWith('-')
      ? `-${nextValue.slice(1).replace(/-/g, '')}`
      : nextValue.replace(/-/g, '');
    setAnswer(normalizedValue.slice(0, 4));
  };

  const submitMathAnswer = () => {
    const numericAnswer = parseInt(answer, 10);
    if (Number.isNaN(numericAnswer)) {
      setFeedback('Ask a grown-up to help!');
      return;
    }

    if (numericAnswer === question.answer) {
      setFeedback('');
      setAnswer('');
      setStage('consent');
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (nextAttempts >= 3) {
      onBackToWelcome();
      return;
    }

    resetQuestion('Ask a grown-up to help!');
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
        <div className="parent-gate-ganesha" aria-hidden="true">
          <img src="/images/ganesha-hi-stand.webp" alt="" />
        </div>

        {stage === 'math' && (
          <div className="parent-gate-stage">
            <p className="parent-gate-kicker">Grown-ups only!</p>
            <h1>Time to get a grown-up!</h1>
            <p className="parent-gate-copy">
              Ganesha needs a quick grown-up check before a child profile is created.
            </p>

            <div className="parent-gate-math-box">
              <span className="parent-gate-math-label">What is</span>
              <strong>{mathPrompt}?</strong>
            </div>

            <label className="parent-gate-answer" aria-live="polite">
              <input
                ref={answerInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint="done"
                value={answer}
                onChange={handleAnswerChange}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    submitMathAnswer();
                  }
                }}
                placeholder="Enter answer"
                aria-label={`Enter answer for ${mathPrompt}`}
              />
            </label>

            {feedback ? (
              <p className="parent-gate-feedback">{feedback}</p>
            ) : (
              <p className="parent-gate-subtle">
                Friendly check only. After 3 misses, we return to the welcome screen.
              </p>
            )}

            <div className="parent-gate-pad">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'del'].map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`parent-gate-key ${key === 'del' ? 'delete' : ''}`}
                  onClick={() => {
                    handleDigit(key);
                    answerInputRef.current?.focus();
                  }}
                >
                  {key === 'del' ? 'Delete' : key}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="parent-gate-primary"
              onClick={submitMathAnswer}
            >
              Check answer
            </button>
          </div>
        )}

        {stage === 'consent' && (
          <div className="parent-gate-stage">
            <p className="parent-gate-kicker">Parent consent</p>
            <h1>Before your child begins</h1>
            <p className="parent-gate-copy">
              This local-only version stores a child&apos;s first name, age, avatar
              choice, and game progress on this device.
            </p>

            <label className="parent-gate-field">
              <span>Parent email - for updates &amp; account recovery</span>
              <input
                type="email"
                value={parentEmail}
                onChange={(event) => setParentEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
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

            <button
              type="button"
              className="parent-gate-link"
              onClick={() => setStage('privacy')}
            >
              Read Privacy Policy
            </button>

            <button
              type="button"
              className="parent-gate-primary"
              onClick={handleConsentContinue}
              disabled={!isChecked}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentGate;
