import React from 'react';
import './OpeningModal.css';   // the card, title, icons and Ganesha styles live here: ONE source for both modals
import './ModalShell.css';
import { getZoneTheme } from '../../../lib/config/ZoneThemes';

// ModalShell: the card that the OPENING and the CLOSING modal both use (Ganesha, lotus, title, subtitle,
// icon row, then whatever goes below as children: the primary button, a subtext, ghost links).
// Opening: <OpeningModal> renders it inside its own full-screen overlay.
// Closing: <SceneCompletionCelebration sharedShell> renders it inside its translucent backdrop (withOverlay=false).
// Keep the DOM and class names exactly as the old OpeningModal had them: the iPad / phone CSS is keyed on them.

// The zone colours the card and button read (same variables the opening modal always set).
export const getModalThemeVars = (zoneId, overlayBgImage = '') => {
  const theme = zoneId ? getZoneTheme(zoneId) : {};
  return {
    '--modal-card-bg': theme.parentBg,
    '--modal-text-primary': theme.textPrimary,
    '--modal-btn-bg': theme.buttonModalOpeningBg || theme.buttonActiveBg,
    '--modal-btn-shadow': theme.glowColor,
    '--modal-btn-border': theme.buttonBorder || 'transparent',
    '--modal-btn-bg-hover': theme.buttonModalOpeningBg || theme.buttonHoverBg || theme.buttonActiveBg,
    '--modal-btn-text': '#FFFFFF',
    '--modal-scene-bg': overlayBgImage ? `url(${overlayBgImage})` : 'none',
  };
};

const ModalShell = ({
  withOverlay = true,
  style,                 // CSS variables (getModalThemeVars) on the outermost element
  character,             // { src, alt } for the Ganesha picture
  title,
  subtitle,
  icons,                 // ReactNode(s) for the .game-modal-icons row
  contentClassName = '',
  cardClassName = '',
  children,              // below the icons: primary button, subtext, ghost links
}) => {
  const content = (
    <div className={`game-modal-content ${contentClassName}`.trim()} style={withOverlay ? undefined : style}>
      <div className="game-modal-character">
        <img
          className="game-modal-ganesha"
          src={character?.src}
          alt={character?.alt || 'Ganesha'}
          style={{
            width: 'min(520px, 100%)',
            height: 'auto',
            aspectRatio: '1 / 1',
            flexShrink: 1,
          }}
        />
      </div>
      <div className={`game-modal-card ${cardClassName}`.trim()}>
        <span className="game-modal-lotus-top" aria-hidden="true" />
        <h1 className="game-modal-title">{title}</h1>
        <p className="game-modal-subtitle">{subtitle}</p>
        <div className="game-modal-icons">{icons}</div>
        {children}
      </div>
    </div>
  );

  if (!withOverlay) return content;
  return (
    <div className="game-modal-overlay" style={style}>
      {content}
    </div>
  );
};

// Two quiet text links under the primary button (closing modal: Home / Play Again).
export const ModalGhostLinks = ({ links = [] }) => (
  <div className="game-modal-ghost-row">
    {links.map((link, i) => (
      <React.Fragment key={link.label}>
        {i > 0 && <span className="game-modal-ghost-sep" aria-hidden="true">{'•'}</span>}
        <button type="button" className="game-modal-ghost-btn" onClick={link.onClick}>{link.label}</button>
      </React.Fragment>
    ))}
  </div>
);

export default ModalShell;
