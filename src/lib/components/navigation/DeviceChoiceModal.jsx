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
  // main -> ipad (share / QR / copy / email) -> email | qr
  const [view, setView] = useState('main');
  const showEmail = view === 'email';
  const [qrSrc, setQrSrc] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const firstActionRef = useRef(null);
  const emailInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    setParentEmail('');
    setStatus('idle');
    setMessage('');
    setView('main');
    setQrSrc('');
    setCopied(false);
    setCopyFailed(false);

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

  // The same link the email carries, so every route lands on the grown-up check.
  const ipadLink = `${window.location.origin}/?start=parent-gate`;
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleShare = async () => {
    playUiTap(0.24);
    try {
      await navigator.share({ title: 'Ganesha My Bestie', text: 'Open Ganesha My Bestie on the iPad:', url: ipadLink });
    } catch {
      // Closing the share sheet throws AbortError; nothing to do.
    }
  };

  const handleCopy = async () => {
    playUiTap(0.24);
    try {
      await navigator.clipboard.writeText(ipadLink);
      setCopied(true);
      setCopyFailed(false);
    } catch {
      setCopied(false);
      setCopyFailed(true);
    }
  };

  // The QR library loads only when this view opens, so the landing page stays light.
  const handleShowQr = async () => {
    playUiTap(0.24);
    setView('qr');
    if (qrSrc) return;
    try {
      const mod = await import('qrcode-generator');
      const makeQr = mod.default || mod;
      const qr = makeQr(0, 'M');
      qr.addData(ipadLink);
      qr.make();
      setQrSrc(qr.createDataURL(8, 4));
    } catch (error) {
      console.error('QR code failed:', error);
      setCopyFailed(true);
    }
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

        {view === 'main' && (
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

            <button type="button" className="dcm-row" onClick={() => setView('ipad')}>
              <span className="dcm-row__icon" aria-hidden="true">
                <img src="/images/onboarding/icon-email.webp" alt="" />
              </span>
              <span className="dcm-row__text">
                <span className="dcm-row__title">Send to iPad</span>
                <span className="dcm-row__sub">Share a link, scan a code or get an email.</span>
              </span>
              <span className="dcm-row__chev" aria-hidden="true">›</span>
            </button>
          </div>
        )}

        {view === 'ipad' && (
          <div className="dcm-rows">
            {canShare && (
              <button type="button" className="dcm-row" onClick={handleShare}>
                <span className="dcm-row__text">
                  <span className="dcm-row__title">Share the link</span>
                  <span className="dcm-row__sub">Send it by AirDrop, WhatsApp or Messages.</span>
                </span>
                <span className="dcm-row__chev" aria-hidden="true">›</span>
              </button>
            )}
            <button type="button" className="dcm-row" onClick={handleShowQr}>
              <span className="dcm-row__text">
                <span className="dcm-row__title">Show a QR code</span>
                <span className="dcm-row__sub">Scan it with the iPad camera.</span>
              </span>
              <span className="dcm-row__chev" aria-hidden="true">›</span>
            </button>
            <button type="button" className="dcm-row" onClick={handleCopy}>
              <span className="dcm-row__text">
                <span className="dcm-row__title">{copied ? 'Link copied' : 'Copy the link'}</span>
                <span className="dcm-row__sub">Paste it anywhere you like.</span>
              </span>
              <span className="dcm-row__chev" aria-hidden="true">›</span>
            </button>
            <button type="button" className="dcm-row" onClick={() => setView('email')}>
              <span className="dcm-row__text">
                <span className="dcm-row__title">Email me the link</span>
                <span className="dcm-row__sub">We will send it to your inbox.</span>
              </span>
              <span className="dcm-row__chev" aria-hidden="true">›</span>
            </button>
            {copyFailed && (
              <input className="dcm-input dcm-linkbox" readOnly value={ipadLink} onFocus={(e) => e.target.select()} aria-label="Link to open on the iPad" />
            )}
            <button type="button" className="dcm-link" onClick={() => { setView('main'); setCopyFailed(false); }}>← Back</button>
          </div>
        )}

        {view === 'qr' && (
          <div className="dcm-form">
            <p>Open the camera on the iPad and point it at this code.</p>
            {qrSrc ? (
              <img className="dcm-qr" src={qrSrc} alt="QR code that opens Ganesha My Bestie on the iPad" />
            ) : copyFailed ? (
              <p className="dcm-error">We could not make the code. Please copy the link instead.</p>
            ) : (
              <p aria-live="polite">Making your code…</p>
            )}
            <button type="button" className="dcm-link" onClick={() => setView('ipad')}>← Back</button>
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
            <button type="button" className="dcm-link" onClick={() => setView('ipad')}>← Back</button>
          </form>
        )}

        {showEmail && isSent && (
          <div className="dcm-form">
            <p aria-live="polite">{message}</p>
            <button type="button" className="dcm-btn" onClick={onClose}>Done</button>
          </div>
        )}

        {view === 'main' && (
          <button type="button" className="dcm-link" onClick={onClose}>Maybe later</button>
        )}
      </section>
    </div>
  );
};

export default DeviceChoiceModal;
