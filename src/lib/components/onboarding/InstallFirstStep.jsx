import React from 'react';
import OnboardingCard from './OnboardingCard';
import { getInstallGuide } from '../../services/PwaInstallManager';

// iPhone/iPad only: the Home Screen app gets its OWN storage, separate from the Safari tab, so a profile made
// in Safari is not there when the installed app opens (the parent sees the setup start again). Ask the parent
// to add the app first and set up inside it. "Continue here instead" keeps the browser path working.
const InstallFirstStep = ({ onContinue }) => {
  const guide = getInstallGuide();

  return (
    <OnboardingCard
      heading="Add to Home Screen first"
      subheading="Set up inside the app on your Home Screen. Anything you set up here in the browser won't carry over to it."
    >
      <ul className="install-steps">
        {guide.steps.map((step, i) => (
          <li className="install-step" key={i}>
            <span className="install-step-icon" aria-hidden="true">{step.icon}</span>
            <span className="install-step-text">{step.text}</span>
          </li>
        ))}
        <li className="install-step">
          <span className="install-step-icon" aria-hidden="true">🐘</span>
          <span className="install-step-text">Then open Ganesha from your Home Screen and set up your child there.</span>
        </li>
      </ul>

      <button type="button" className="onb-link" onClick={onContinue}>
        Continue here instead
      </button>
    </OnboardingCard>
  );
};

export default InstallFirstStep;
