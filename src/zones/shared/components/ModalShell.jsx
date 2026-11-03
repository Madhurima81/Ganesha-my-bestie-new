import React, { useLayoutEffect, useRef } from 'react';
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

// Keep a title on ONE line: shrink its font (never below MIN) until it fits the card; if it still does not
// fit at MIN, let it wrap rather than clip. Runs again when the window resizes and when the fonts finish loading.
const MIN_TITLE_PX = 20;
function useFitTitleOnOneLine(ref, enabled, dep) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return undefined;
    const fit = () => {
      el.style.removeProperty('font-size');
      el.style.whiteSpace = 'nowrap';
      let size = parseFloat(getComputedStyle(el).fontSize) || 36;
      while (el.scrollWidth > el.clientWidth + 1 && size > MIN_TITLE_PX) {
        size -= 1;
        el.style.setProperty('font-size', `${size}px`, 'important'); // the base rule uses !important
      }
      if (el.scrollWidth > el.clientWidth + 1) el.style.whiteSpace = 'normal';
    };
    fit();
    window.addEventListener('resize', fit);
    document.fonts?.ready?.then(fit);
    return () => window.removeEventListener('resize', fit);
  }, [ref, enabled, dep]);
}

const ModalShell = ({
  withOverlay = true,
  style,                 // CSS variables (getModalThemeVars) on the outermost element
  character,             // { src, alt } for the Ganesha picture
  title,
  subtitle,
  icons,                 // ReactNode(s) for the .game-modal-icons row
  contentClassName = '',
  cardClassName = '',
  fitTitle = false,      // closing modal: keep the title on one line
  children,              // below the icons: primary button, subtext, ghost links
}) => {
  const titleRef = useRef(null);
  useFitTitleOnOneLine(titleRef, fitTitle, title);
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
        <h1 className="game-modal-title" ref={titleRef}>{title}</h1>
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
