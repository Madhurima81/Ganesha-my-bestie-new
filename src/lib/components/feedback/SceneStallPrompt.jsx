// lib/components/feedback/SceneStallPrompt.jsx
//
// The child-facing end of useSceneWatchdog: if a scene is stuck even after the automatic recovery, show one
// gentle, big button instead of leaving the child on a frozen screen.
//
//   const { stall, resolveStall } = useSceneWatchdog({ ... });
//   <SceneStallPrompt show={!!stall} onTap={resolveStall} />

import React from 'react';

export default function SceneStallPrompt({ show, onTap, label = 'Tap to keep going' }) {
  if (!show) return null;
  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 'max(24px, env(safe-area-inset-bottom))',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 5000,
        pointerEvents: 'none',
      }}
    >
      <button
        type="button"
        onClick={onTap}
        style={{
          pointerEvents: 'auto',
          minHeight: 64,
          minWidth: 200,
          padding: '12px 28px',
          border: 'none',
          borderRadius: 999,
          background: 'linear-gradient(180deg, #FFD54F 0%, #FFB300 100%)',
          color: '#4E342E',
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(18px, 3vw, 24px)',
          boxShadow: '0 6px 0 #C68400, 0 10px 24px rgba(0,0,0,0.25)',
          cursor: 'pointer',
        }}
      >
        {label}
      </button>
    </div>
  );
}
