// src/zones/zone1-symbol-mountain/components/SymbolCardModal.jsx
//
// Voluntary symbol card — opens from sidebar after symbol is discovered.
// Re-enter point for "I want to remember/use this symbol again."
// Auto-reveal on first discovery is handled elsewhere; this is the revisit card.

import { useEffect, useState } from 'react';
import { symbolCardContent } from './symbolCardContent';
import './SymbolCardModal.css';

export default function SymbolCardModal({ symbolId, onClose }) {
  const [isExiting, setIsExiting] = useState(false);
  const content = symbolCardContent[symbolId];

  // Smooth exit: trigger animation, then unmount
  const handleClose = () => {
    if (isExiting) return; // prevent double-trigger
    setIsExiting(true);
    setTimeout(onClose, 200); // matches CSS exit duration
  };

  // Keyboard accessibility (parents using laptops; kids occasionally too)
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!content) {
    console.warn(`SymbolCardModal: no content found for symbolId="${symbolId}"`);
    return null;
  }

  return (
    <div
      className={`symbol-card-modal-backdrop ${isExiting ? 'exiting' : ''}`}
      onClick={handleClose}
    >
      <div
        className={`symbol-card-modal ${isExiting ? 'exiting' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="symbol-card-title"
        aria-modal="true"
      >
        {/* TOP — Icon with soft radial glow */}
        <div className="symbol-card__icon-wrap">
          <div className="symbol-card__icon-glow" />
          <img
            src={content.icon}
            alt={content.label}
            className="symbol-card__icon"
          />
        </div>

        {/* TITLE STACK — small label + Ganesha hook + teaching */}
        <div className="symbol-card__title-stack">
          <span className="symbol-card__label">{content.label}</span>
          {content.ganeshaLines.map((line, i) => (
            <p
              key={i}
              className={`symbol-card__ganesha-line ${
                i === 0 ? 'is-hook' : 'is-teaching'
              }`}
              id={i === 0 ? 'symbol-card-title' : undefined}
            >
              "{line}"
            </p>
          ))}
        </div>

        {/* INVITATION — left-aligned reflection block */}
        <div className="symbol-card__invitation">
          <span className="symbol-card__pointer" aria-hidden="true">👉</span>
          <p>{content.invitation}</p>
        </div>

        {/* GIFT LINE — soft whisper close */}
        <p className="symbol-card__gift">{content.gift}</p>

        {/* FOOTER — de-emphasized */}
        <p className="symbol-card__footer">Tap anywhere to close</p>
      </div>
    </div>
  );
}
