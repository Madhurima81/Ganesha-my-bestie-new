import React, { useState } from 'react';
import PrivacyPolicy from './PrivacyPolicy';
import OnboardingCard from './OnboardingCard';
import './SignInScreen.css';

// Google/Apple are UI stubs only — no OAuth SDK is wired into this app yet, so
// those buttons are visual placeholders. Email is local-only: no backend
// account exists, so this only optionally remembers the parent's email.
// Skipping proceeds with no account — the child plays fully on-device via
// ProgressManager / localStorage.
const SignInScreen = ({ onContinue, onSkip }) => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [email, setEmail] = useState('');

  if (showPrivacy) {
    return <PrivacyPolicy onBack={() => setShowPrivacy(false)} />;
  }

  const handleEmailContinue = () => {
    if (email.trim()) localStorage.setItem('parentEmail', email.trim());
    onContinue();
  };

  return (
    <OnboardingCard
      heading="Stay in the loop"
      subheading="Save your child's progress, get updates and new adventures."
    >
      <button type="button" className="onb-btn onb-btn--ghost si-oauth" onClick={onContinue}>
        <span className="si-oauth-icon" aria-hidden="true">G</span>
        Continue with Google
      </button>
      <button type="button" className="onb-btn onb-btn--ghost si-oauth" onClick={onContinue}>
        <span className="si-oauth-icon" aria-hidden="true">🍎</span>
        Continue with Apple
      </button>

      <div className="onb-divider">or</div>

      <input
        className="onb-input"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        autoComplete="email"
        inputMode="email"
      />

      <button type="button" className="onb-btn" onClick={handleEmailContinue}>
        Continue
      </button>

      <button type="button" className="onb-link" onClick={onSkip}>
        Skip for now
      </button>

      <p className="si-legal">
        By continuing, you agree to our{' '}
        <button type="button" className="si-legal-link" onClick={() => setShowPrivacy(true)}>
          Terms &amp; Privacy Policy
        </button>
        .
      </p>
    </OnboardingCard>
  );
};

export default SignInScreen;
