import React, { useState } from 'react';
import PrivacyPolicy from './PrivacyPolicy';
import './ParentGate.css';
import './SignInScreen.css';

// Same plain lavender card style as ParentGate, for visual consistency between the
// two adult-facing screens. Google/Apple are UI stubs only — no OAuth SDK is wired
// into this app yet, so those buttons are visual placeholders for now. Email/password
// are local-only: no backend account exists, so this only optionally remembers the
// parent's email the same way the old consent screen did. Skipping proceeds with no
// account — the child plays fully on-device via ProgressManager/localStorage.
const SignInScreen = ({ onContinue, onSkip }) => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (showPrivacy) {
    return <PrivacyPolicy onBack={() => setShowPrivacy(false)} />;
  }

  const handleEmailContinue = () => {
    if (email.trim()) localStorage.setItem('parentEmail', email.trim());
    onContinue();
  };

  return (
    <div className="parent-gate-screen">
      <div className="parent-gate-card">
        <div className="parent-gate-stage parent-gate-stage--consent">
          <p className="parent-gate-kicker">Parent account</p>
          <h1>Stay in the loop</h1>
          <p className="parent-gate-copy">
            Sign in to save progress across devices, or skip and play right on this one.
          </p>

          <button type="button" className="signin-oauth-btn signin-oauth-btn--google" onClick={onContinue}>
            <span className="signin-oauth-icon" aria-hidden="true">G</span>
            Continue with Google
          </button>
          <button type="button" className="signin-oauth-btn signin-oauth-btn--apple" onClick={onContinue}>
            <span className="signin-oauth-icon" aria-hidden="true">🍎</span>
            Continue with Apple
          </button>

          <div className="signin-divider"><span>or</span></div>

          <label className="parent-gate-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              inputMode="email"
            />
          </label>
          <label className="parent-gate-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          <button
            type="button"
            className="parent-gate-primary"
            onClick={handleEmailContinue}
          >
            Continue
          </button>

          <button type="button" className="signin-skip-link" onClick={onSkip}>
            Skip for now
          </button>

          <p className="signin-legal">
            By continuing, you agree to our{' '}
            <button type="button" className="signin-legal-link" onClick={() => setShowPrivacy(true)}>
              Terms of Service and Privacy Policy
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInScreen;
