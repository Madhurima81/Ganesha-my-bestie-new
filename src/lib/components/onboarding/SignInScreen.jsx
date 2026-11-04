import React, { useState } from 'react';
import PrivacyPolicy from './PrivacyPolicy';
import OnboardingCard from './OnboardingCard';
import { getSupabaseClient } from '../../services/supabase';
import './SignInScreen.css';

// Google + email go through Supabase auth, LINKED to the existing anonymous
// session CloudSync creates (so the child's cloud progress is kept). Google
// needs the provider enabled + manual linking on in the Supabase dashboard.
// Apple is still a "coming soon" stub. Skipping proceeds with no account — the
// child plays fully on-device via ProgressManager / localStorage.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const SignInScreen = ({ onContinue, onSkip }) => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  if (showPrivacy) {
    return <PrivacyPolicy onBack={() => setShowPrivacy(false)} />;
  }

  const handleGoogle = async () => {
    if (busy) return;
    setMsg('');
    setBusy(true);
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) {
        setMsg("Sign-in isn't available right now. You can skip and sign in later.");
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      const options = { redirectTo: window.location.origin };
      try { sessionStorage.setItem('gmb_signin_return', '1'); } catch { /* ignore */ }
      // Anonymous session → link Google to it (keeps progress); else plain sign-in.
      const { error } = session?.user?.is_anonymous
        ? await supabase.auth.linkIdentity({ provider: 'google', options })
        : await supabase.auth.signInWithOAuth({ provider: 'google', options });
      if (error) throw error;
      // Browser is now redirecting to Google — nothing else to do.
    } catch (err) {
      try { sessionStorage.removeItem('gmb_signin_return'); } catch { /* ignore */ }
      console.warn('Google sign-in failed:', err);
      setMsg("Couldn't reach Google. Please try again, or skip for now.");
    } finally {
      setBusy(false);
    }
  };

  const handleEmailContinue = async () => {
    if (busy) return;
    const clean = email.trim();
    if (!clean) { setMsg('Please enter your email, or tap Skip for now.'); return; }
    if (!EMAIL_RE.test(clean)) { setMsg("That email doesn't look right. Please check it."); return; }
    setMsg('');
    setBusy(true);
    try { localStorage.setItem('parentEmail', clean); } catch { /* ignore */ }
    try {
      const supabase = await getSupabaseClient();
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        // Anonymous session → attach the email (Supabase sends a confirm link);
        // otherwise send a magic link. Failure never blocks the child.
        if (session?.user?.is_anonymous) await supabase.auth.updateUser({ email: clean });
        else await supabase.auth.signInWithOtp({ email: clean, options: { emailRedirectTo: window.location.origin } });
      }
    } catch (err) {
      console.warn('Email sign-in failed (continuing offline):', err);
    } finally {
      setBusy(false);
    }
    onContinue();
  };

  return (
    <OnboardingCard
      heading="Stay in the loop"
      subheading="Save your child's progress, get updates and new adventures."
    >
      <button type="button" className="onb-btn onb-btn--ghost si-oauth" onClick={handleGoogle} disabled={busy}>
        <img className="si-oauth-icon" src="/images/onboarding/google.svg" alt="" aria-hidden="true" />
        Continue with Google
      </button>
      <button type="button" className="onb-btn onb-btn--ghost si-oauth" onClick={() => setMsg('Apple sign-in is coming soon. Please use Google or email.')}>
        <img className="si-oauth-icon" src="/images/onboarding/apple.svg" alt="" aria-hidden="true" />
        Continue with Apple
      </button>

      <div className="onb-divider">or</div>

      <input
        className="onb-input"
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (msg) setMsg(''); }}
        placeholder="Enter your email"
        autoComplete="email"
        inputMode="email"
      />

      {msg && <p className="si-msg" role="alert">{msg}</p>}

      <button type="button" className="onb-btn" onClick={handleEmailContinue} disabled={busy}>
        {busy ? 'One moment…' : 'Continue'}
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
