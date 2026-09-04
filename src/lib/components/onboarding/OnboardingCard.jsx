// OnboardingCard.jsx
// ---------------------------------------------------------------------------
// The shared "scroll-card" skin for the onboarding flow — the same scalloped
// cream card on a scenic lavender background used by the child-profile create
// screens (CleanProfileSelector). Extracted so DeviceChoiceModal, ParentGate
// and SignInScreen all render the same way.
//
// Palette is purple-only. Card art: src/assets/cards/createprofile.svg,
// lotus: src/assets/cards/lotus-iconnew.svg, background: /images/profile-bg.webp
// (all already in the repo).
//
// Usage:
//   <OnboardingCard heading="Grown-ups only!" subheading="A quick check…">
//     …fields / buttons / ghost links go here…
//   </OnboardingCard>
// ---------------------------------------------------------------------------

import React from 'react';
import './OnboardingCard.css';

export default function OnboardingCard({ heading, subheading, children, className = '' }) {
  return (
    <div className={`onb-overlay ${className}`.trim()}>
      <div className="onb-bg" aria-hidden="true">
        <span className="onb-bg-twinkle" />
        <span className="onb-bg-vignette" />
      </div>

      <div className="onb-card">
        <div className="onb-card-inner">
          <span className="onb-lotus" aria-hidden="true" />
          {heading && <h2 className="onb-heading">{heading}</h2>}
          {subheading && <p className="onb-sub">{subheading}</p>}
          <div className="onb-content">{children}</div>
        </div>
      </div>
    </div>
  );
}
