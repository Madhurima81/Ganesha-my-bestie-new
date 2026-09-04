// OnboardingCard.jsx
// ---------------------------------------------------------------------------
// The shared onboarding card — renders the SAME markup + classes as the
// child-profile create screen (CleanProfileSelector) so every setup screen
// (grown-up check, sign-in, name, age, install, hand-off) looks identical to
// it. The card CSS is CleanProfileSelector.css; OnboardingCard.css only adds
// a few "hug the content" overrides (scoped to `.onb`) plus the small
// building-block classes the screens use (.onb-btn, .onb-row, .onb-input…).
// Purple-only.
// ---------------------------------------------------------------------------

import React from 'react';
import '../navigation/CleanProfileSelector.css';
import './OnboardingCard.css';

export default function OnboardingCard({ heading, subheading, children, className = '' }) {
  return (
    <div className={`clean-profile-overlay onb ${className}`.trim()}>
      <div className="clean-forest-background">
        <div className="profile-bg-overlay" />
        <div className="profile-vignette" />
      </div>

      <div className="clean-profile-container">
        <div className="clean-modal-overlay scroll-overlay">
          <div className="scroll-card">
            <div className="scroll-card-inner">
              <span className="create-card-lotus" aria-hidden="true" />
              {heading && <h2 className="create-step-heading">{heading}</h2>}
              {subheading && <p className="create-step-subheading">{subheading}</p>}
              <div className="onb-content">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
