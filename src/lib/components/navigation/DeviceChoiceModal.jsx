import React, { useEffect, useRef, useState } from 'react';
import { playUiTap } from '../../services/AudioService';
import './DeviceChoiceModal.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DeviceChoiceModal = ({ isOpen, onClose, onContinueHere }) => {
  const [parentEmail, setParentEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const firstActionRef = useRef(null);
  const emailInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    setParentEmail('');
    setStatus('idle');
    setMessage('');

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => firstActionRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

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
      className="device-choice-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="device-choice-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="device-choice-title"
      >
        <button
          type="button"
          className="device-choice-close"
          onClick={onClose}
          aria-label="Close device choice"
        >
          &times;
        </button>

        <div className="device-choice-header">
          <p className="device-choice-kicker">Start free</p>
          <h2 id="device-choice-title">Where would you like to begin?</h2>
        </div>

        <div className="device-choice-options">
          <button
            type="button"
            className="device-choice-option device-choice-option--primary"
            onClick={handleContinueHere}
            ref={firstActionRef}
          >
            <span className="device-choice-option-title">Continue here</span>
            <span className="device-choice-option-copy">
              Start on this device now.
            </span>
          </button>

          <form className="device-choice-option device-choice-email" onSubmit={handleSendToIpad}>
            <div>
              <span className="device-choice-option-title">Send to iPad</span>
              <p className="device-choice-option-copy">
                GMB is designed for a bigger screen, with more room to play and discover.
              </p>
            </div>

            {isSent ? (
              <p className="device-choice-confirmation" aria-live="polite">
                {message}
              </p>
            ) : (
              <>
                <label className="device-choice-email-field">
                  <span>Parent email</span>
                  <input
                    ref={emailInputRef}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={parentEmail}
                    onChange={(event) => {
                      setParentEmail(event.target.value);
                      if (status === 'error') {
                        setStatus('idle');
                        setMessage('');
                      }
                    }}
                    placeholder="you@example.com"
                    disabled={isSending}
                    required
                  />
                </label>

                <button
                  type="submit"
                  className="device-choice-submit"
                  disabled={isSending}
                >
                  {isSending ? 'Sending...' : 'Email me the link'}
                </button>

                <p
                  className={`device-choice-status ${status === 'error' ? 'device-choice-status--error' : ''}`}
                  aria-live="polite"
                >
                  {message}
                </p>
              </>
            )}
          </form>
        </div>
      </section>
    </div>
  );
};

export default DeviceChoiceModal;
