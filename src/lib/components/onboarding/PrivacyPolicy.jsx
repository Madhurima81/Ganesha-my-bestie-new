import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = ({ onBack }) => {
  return (
    <div className="privacy-policy-screen">
      <div className="privacy-policy-card">
        <div className="privacy-policy-header">
          <button
            type="button"
            className="privacy-policy-back"
            onClick={onBack}
          >
            Back
          </button>
          <h1>Privacy Policy</h1>
          <p>Simple privacy information for parents and guardians.</p>
        </div>

        <div className="privacy-policy-content">
          <section>
            <h2>What this app stores</h2>
            <p>
              Ganesha My Bestie stores a child&apos;s first name, age, avatar
              choice, and game progress so the adventure can continue on this
              device.
            </p>
          </section>

          <section>
            <h2>Where the information lives</h2>
            <p>
              This information is stored on this device only using browser
              local storage (`localStorage`).
            </p>
          </section>

          <section>
            <h2>What we do not do</h2>
            <p>
              We do not send this information to servers, share it with third
              parties, show ads, or use tracking for this local-only version.
            </p>
          </section>

          <section>
            <h2>How to delete data</h2>
            <p>
              A parent can delete all saved profiles, progress, and consent
              data from the Parent Dashboard, or clear browser/app site data on
              the device.
            </p>
          </section>

          <section>
            <h2>Parent contact</h2>
            <p>
              Questions? Contact: <a href="mailto:privacy@example.com">privacy@example.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
