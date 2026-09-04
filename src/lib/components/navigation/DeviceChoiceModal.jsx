import React, { useEffect, useRef, useState } from 'react';
import { playUiTap } from '../../services/AudioService';
import './DeviceChoiceModal.css';

// White modal that opens over the landing page from "Start Free" / "Begin".
// Not the full scenic onboarding card — the onboarding screens after this
// (grown-up check, sign-in, name, age, install, hand-off) use OnboardingCard.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DeviceChoiceModal = ({ isOpen, onClose, onContinueHere }) => {
  const [parentEmail, setParentEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  const firstActionRef = useRef(null);
  const emailInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    setParentEmail('');
    setStatus('idle');
    setMessage('');
    setShowEmail(false);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => firstActionRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (showEmail) window.requestAnimationFrame(() => emailInputRef.current?.focus());
  }, [showEmail]);

  if (!isOpen) return null;

  const handleContinueHere = () => {
    playUiTap(0.24);
    onClose();
    onContinueHere();
  };

  const handleSendToIpad = async (event) => {
    event.preventDefault();

    const email = parentEmail.trim();
    if (!EMAIL_RE.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid parent email.');
      emailInputRef.current?.focus();
      return;
    }

    setStatus('sending');
    setMessage('');

    try {
      const response = await fetch('/.netlify/functions/send-continuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentEmail: email }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Unable to send continuation email.');
      }

      setStatus('sent');
      setMessage("Check your inbox — we've sent your continuation link.");
      setParentEmail('');
    } catch (error) {
      console.error('Continuation email failed:', error);
      setStatus('error');
      setMessage('We could not send the link. Please try again.');
    }
  };

  const isSending = status === 'sending';
  const isSent = status === 'sent';

  return (
    <div
      className="dcm-backdrop"
      role="presentation"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <section className="dcm-card" role="dialog" aria-modal="true" aria-labelledby="dcm-title">
        <h2 className="dcm-title" id="dcm-title">Where would you like to begin?</h2>

        {!showEmail && (
          <div className="dcm-rows">
            <button type="button" className="dcm-row" onClick={handleContinueHere} ref={firstActionRef}>
              <span className="dcm-row__icon" aria-hidden="true">
                <img src="/images/onboarding/icon-continue-here.webp" alt="" />
              </span>
              <span className="dcm-row__text">
                <span className="dcm-row__title">Continue here</span>
                <span className="dcm-row__sub">Start on this device now.</span>
              </span>
              <span className="dcm-row__chev" aria-hidden="true">›</span>
            </button>

            <button type="button" className="dcm-row" onClick={() => setShowEmail(true)}>
              <span className="dcm-row__icon" aria-hidden="true">
                <img src="/images/onboarding/icon-email.webp" alt="" />
              </span>
              <span className="dcm-row__text">
                <span className="dcm-row__title">Send to iPad</span>
                <span className="dcm-row__sub">Get a link by email.</span>
              </span>
              <span className="dcm-row__chev" aria-hidden="true">›</span>
            </button>
          </div>
        )}

        {showEmail && !isSent && (
          <form className="dcm-form" onSubmit={handleSendToIpad}>
            <p>GMB feels best on a bigger screen. We&rsquo;ll email a link so you can continue on an iPad.</p>
            <input
              ref={emailInputRef}
              className="dcm-input"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={parentEmail}
              onChange={(e) => {
                setParentEmail(e.target.value);
                if (status === 'error') {
                  setStatus('idle');
                  setMessage('');
                }
              }}
              placeholder="Parent email"
              disabled={isSending}
              required
            />
            {message && <p className={status === 'error' ? 'dcm-error' : ''} aria-live="polite">{message}</p>}
            <button type="submit" className="dcm-btn" disabled={isSending}>
              {isSending ? 'Sending…' : 'Email me the link'}
            </button>
            <button type="button" className="dcm-link" onClick={() => setShowEmail(false)}>← Back</button>
          </form>
        )}

        {showEmail && isSent && (
          <div className="dcm-form">
            <p aria-live="polite">{message}</p>
            <button type="button" className="dcm-btn" onClick={onClose}>Done</button>
          </div>
        )}

        {!showEmail && (
          <button type="button" className="dcm-link" onClick={onClose}>Maybe later</button>
        )}
      </section>
    </div>
  );
};

export default DeviceChoiceModal;
