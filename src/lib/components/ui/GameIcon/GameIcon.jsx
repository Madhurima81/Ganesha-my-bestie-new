import React from 'react';
import registry from './gameIconRegistry';
import './GameIcon.css';

/**
 * GameIcon — renders a custom image asset if available, otherwise the emoji fallback.
 *
 * Props:
 *   name      {string}  — key from gameIconRegistry (e.g. "refresh", "confirm")
 *   size      {number}  — width & height in px (default: 24)
 *   className {string}  — extra CSS classes
 *   style     {object}  — inline style overrides
 *   aria-label {string} — override the default alt text
 */
const GameIcon = ({
  name,
  size = 24,
  className = '',
  style = {},
  'aria-label': ariaLabel,
}) => {
  const entry = registry[name];

  if (!entry) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`GameIcon: unknown icon name "${name}"`);
    }
    return null;
  }

  const label = ariaLabel ?? entry.alt;

  if (entry.src) {
    return (
      <img
        src={entry.src}
        alt={label}
        width={size}
        height={size}
        className={`game-icon game-icon--img ${className}`}
        style={style}
        draggable={false}
      />
    );
  }

  return (
    <span
      className={`game-icon game-icon--emoji ${className}`}
      style={{ fontSize: size * 0.85, lineHeight: 1, ...style }}
      role="img"
      aria-label={label}
    >
      {entry.emoji}
    </span>
  );
};

export default GameIcon;
