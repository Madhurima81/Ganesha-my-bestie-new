import React from 'react';

/**
 * ResumeCountdown
 *
 * Fullscreen overlay shown while the 3-2-1 resume buffer runs.
 * Rendered by any scene that uses useResumeCountdown().
 *
 * @param {number|null} value - Current countdown number (3, 2, 1) or null (hidden)
 */
const ResumeCountdown = ({ value }) => {
  if (value === null) return null;

  return (
    <div style={styles.overlay}>
      {/* Sleeping / waking Ganesha flavour text */}
      <p style={styles.label}>Getting ready…</p>

      {/* The big countdown number */}
      <div
        key={value}           /* re-mount on each tick → CSS animation restarts */
        style={styles.number}
      >
        {value}
      </div>

      <style>{`
        @keyframes pop-in {
          0%   { transform: scale(0.4); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(20, 10, 40, 0.82)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    userSelect: 'none',
    pointerEvents: 'none', // don't block underlying taps — overlay is informational only
  },
  label: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 'clamp(16px, 3vw, 24px)',
    margin: '0 0 16px',
    fontFamily: 'sans-serif',
    letterSpacing: '0.04em',
  },
  number: {
    fontSize: 'clamp(100px, 22vw, 180px)',
    fontWeight: 900,
    color: '#FFD700',
    textShadow: '0 6px 0 #B8860B, 0 12px 30px rgba(0,0,0,0.5)',
    lineHeight: 1,
    fontFamily: 'sans-serif',
    animation: 'pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
  },
};

export default ResumeCountdown;
