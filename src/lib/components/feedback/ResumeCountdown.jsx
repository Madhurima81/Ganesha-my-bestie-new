import React from 'react';
import './ResumeCountdown.css';

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
    <div className="pause-overlay">
      <p className="pause-status">Getting ready…</p>
      {/* key re-mounts on each tick → CSS animation restarts */}
      <div key={value} className="countdown-number">
        {value}
      </div>
    </div>
  );
};

export default ResumeCountdown;
