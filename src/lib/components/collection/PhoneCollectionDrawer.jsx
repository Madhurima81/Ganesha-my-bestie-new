import React, { useCallback, useEffect, useRef, useState } from 'react';
import './PhoneCollectionDrawer.css';
import { PHONE_COLLECTION_QUERY } from '../../utils/collectionTarget';

/**
 * PhoneCollectionDrawer — symbols only, no visible text (names are aria-labels).
 * phone-landscape replacement for the side rail.
 *
 * The sidebars (SymbolSidebar / AppSidebar) keep owning their symbols + state;
 * this only renders the collection button (top-right) and the drawer (4x2 grid).
 * On tablet/desktop the button is hidden by CSS and the rail is used as before.
 *
 * Pause ownership: the drawer reports open/close through `onOpenChange`; the
 * parent maps that to its existing onPopupOpen / onPopupClose (useSidebarPause).
 * While the drawer is open the parent must NOT end that pause when a card
 * inside it closes — only closing the drawer resumes the scene.
 *
 * Props
 *   items         [{ id, title, icon, locked, attention }]
 *   title         drawer heading / button label
 *   onItemSelect  (id) => void   — an unlocked item was tapped (parent opens its card)
 *   onLockedTap   (id) => void   — optional neutral sound for a locked item
 *   onOpenChange  (open) => void — drawer opened / closed
 *   bloom         boolean        — gentle gold bloom on the button (symbol landing)
 *   style         theme CSS vars for the drawer card
 */
const PhoneCollectionDrawer = ({
  items = [],
  title = 'Symbol collection', // accessibility label only — the UI shows symbols, no text
  onItemSelect,
  onLockedTap,
  onOpenChange,
  bloom = false,
  style,
}) => {
  const [open, setOpen] = useState(false);
  const [pulseId, setPulseId] = useState(null);
  const openRef = useRef(false);
  const pulseTimerRef = useRef(null);
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  const setDrawerOpen = useCallback((next) => {
    if (openRef.current === next) return;
    openRef.current = next;
    setOpen(next);
    onOpenChangeRef.current?.(next);
  }, []);

  // Rotating / resizing out of phone landscape hides the drawer — release the pause.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const mq = window.matchMedia(PHONE_COLLECTION_QUERY);
    const onChange = (e) => { if (!e.matches) setDrawerOpen(false); };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, [setDrawerOpen]);

  // Unmounting with the drawer open (scene change) must not leave the scene paused.
  useEffect(() => () => {
    window.clearTimeout(pulseTimerRef.current);
    if (openRef.current) {
      openRef.current = false;
      onOpenChangeRef.current?.(false);
    }
  }, []);

  const handleItem = (item) => {
    if (item.locked) {
      onLockedTap?.(item.id);
      setPulseId(item.id);
      window.clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = window.setTimeout(() => setPulseId(null), 380);
      return;
    }
    onItemSelect?.(item.id);
  };

  return (
    <>
      <button
        type="button"
        className={`pcd-button${bloom ? ' pcd-button--bloom' : ''}`}
        data-collection-ui="true"
        data-collection-button="true"
        aria-label={title}
        onClick={() => setDrawerOpen(true)}
      >
        <img
          className="pcd-button__icon"
          src="/images/icons/symbol-collection-rosette.png"
          alt=""
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          className="pcd-overlay"
          data-collection-ui="true"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="pcd-card"
            role="dialog"
            aria-label={title}
            style={style}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="pcd-close"
              aria-label="Close"
              onClick={() => setDrawerOpen(false)}
            >
              <span className="pcd-close__x" aria-hidden="true">✕</span>
            </button>

            <div className="pcd-grid">
              {items.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={[
                    'pcd-item',
                    item.locked ? 'pcd-item--locked' : '',
                    !item.locked && item.attention ? 'pcd-item--attention' : '',
                    pulseId === item.id ? 'pcd-item--pulse' : '',
                  ].filter(Boolean).join(' ')}
                  aria-label={item.locked ? `${item.title} not yet discovered` : item.title}
                  onClick={() => handleItem(item)}
                >
                  <img className="pcd-item__icon" src={item.icon} alt="" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhoneCollectionDrawer;
