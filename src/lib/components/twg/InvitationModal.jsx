// InvitationModal.jsx
// Soft fullscreen overlay — the emotional bridge between chat → doorway screen
// Triggered from TalkToGanesha chat OR directly from gameplay
// Props:
//   emotionTheme  — 'mountain' | 'river' | 'cave' | 'hut' | 'festival'
//   messageLine1  — first line of Ganesha's invitation text
//   messageLine2  — second line (call to action)
//   onAccept      — fired when child taps "Yes, let's try"
//   onDecline     — fired when child taps "Maybe later"

import React from 'react';
import './InvitationModal.css';

const THEME_TINTS = {
  mountain: 'rgba(255, 87, 34, 0.18)',
  river:    'rgba(46, 125, 50, 0.18)',
  cave:     'rgba(106, 27, 154, 0.22)',
  hut:      'rgba(121, 85, 72, 0.18)',
  festival: 'rgba(233, 30, 99, 0.18)',
  default:  'rgba(90, 60, 140, 0.30)',
};

export default function InvitationModal({
  emotionTheme = 'default',
  messageLine1 = 'Sometimes worries make our heart flutter.',
  messageLine2 = 'Shall we try something together?',
  onAccept,
  onDecline,
}) {
  const tint = THEME_TINTS[emotionTheme] || THEME_TINTS.default;

  return (
    <div className="invite-scene invite-scene-enter">

      {/* Background image */}
      <div
        className="invite-bg"
        style={{ backgroundImage: "url('/images/twg-bg.webp')" }}
      />

      {/* Soft mystical overlay — tint shifts per emotion theme */}
      <div
        className="invite-overlay"
        style={{
          background: `radial-gradient(
            circle at 50% 40%,
            rgba(255,240,200,0.22),
            ${tint}
          )`,
        }}
      />

      {/* Ganesha character — bottom left, floating */}
      <img
        className="invite-ganesha"
        src="/images/ganesha-character.webp"
        alt="Ganesha inviting"
        draggable={false}
      />

      {/* Text + buttons — centered right of Ganesha */}
      <div className="invite-content">

        <div className="invite-text">
          {messageLine1}<br />
          {messageLine2}
        </div>

        <button className="invite-btn-primary" onClick={onAccept}>
          Yes, let's try
        </button>

        <button className="invite-btn-secondary" onClick={onDecline}>
          Maybe later
        </button>

      </div>

    </div>
  );
}
