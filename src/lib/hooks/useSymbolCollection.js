import { useState, useRef, useEffect } from 'react';

/**
 * useSymbolCollection
 *
 * Shared hook for the symbol flight → bloom → overlay animation flow.
 * Used by every scene across all zones (symbol-mountain, meaning-cave, shloka-river).
 *
 * Timing (locked):
 *   0ms   → flight clone appears at game element position
 *   0ms   → CSS transition flies it to sidebar icon (0.9s cubic-bezier)
 *   900ms → sidebar bloom animation + optional sound
 *   1200ms→ flight clone removed, overlay appears
 *
 * @param {function} [onCollectSound] - Optional callback to play chime at 900ms
 * @returns {object} { flyingSymbol, flightStyle, animatingSymbol, showOverlay, handleCollect, closeOverlay }
 */
const useSymbolCollection = ({ onCollectSound } = {}) => {
  // { symbolId: string, src: string } — the flying image clone
  const [flyingSymbol, setFlyingSymbol]     = useState(null);
  const [flightStyle, setFlightStyle]       = useState({});
  // symbolId string — which sidebar icon is currently blooming
  const [animatingSymbol, setAnimatingSymbol] = useState(null);
  const [showOverlay, setShowOverlay]       = useState(false);

  // Keep timer refs so we can clear on unmount
  const timersRef = useRef([]);

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  /**
   * handleCollect
   *
   * Call this when a symbol is collected in any scene.
   *
   * @param {string}   symbolId  - e.g. 'modak', 'vakratunda'
   * @param {DOMRect}  startRect - getBoundingClientRect() of the game element
   * @param {string}   imageSrc  - imported image URL for the flying clone
   */
  const handleCollect = (symbolId, startRect, imageSrc) => {
    const sidebarIcon = document.getElementById(`sidebar-${symbolId}`);
    if (!sidebarIcon) {
      console.warn(`useSymbolCollection: no element with id "sidebar-${symbolId}" found`);
      return;
    }
    const endRect = sidebarIcon.getBoundingClientRect();

    // ── Step 1: Render clone at the start position (no transform yet) ────────
    setFlyingSymbol({ symbolId, src: imageSrc });
    setFlightStyle({
      top:    startRect.top,
      left:   startRect.left,
      width:  startRect.width,
      height: startRect.height,
      transform: 'translate(0, 0) scale(1)',
    });

    // ── Step 2: Next frame — apply destination transform so CSS transition fires
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlightStyle({
          top:    startRect.top,
          left:   startRect.left,
          width:  startRect.width,
          height: startRect.height,
          transform: `translate(
            ${endRect.left - startRect.left}px,
            ${endRect.top  - startRect.top}px
          ) scale(0.6)`,
        });
      });
    });

    // ── Step 3: 900ms — flight lands → bloom + sound ──────────────────────────
    const t1 = setTimeout(() => {
      setAnimatingSymbol(symbolId);
      onCollectSound?.();
    }, 900);

    // ── Step 4: 1200ms — bloom settles → remove clone → show overlay ─────────
    const t2 = setTimeout(() => {
      setFlyingSymbol(null);
      setFlightStyle({});
      setAnimatingSymbol(null);
      setShowOverlay(true);
    }, 1200);

    timersRef.current = [t1, t2];
  };

  const closeOverlay = () => setShowOverlay(false);

  return {
    flyingSymbol,     // { symbolId, src } | null — render as <img className="flying-symbol" style={flightStyle} />
    flightStyle,      // inline styles for the flying clone
    animatingSymbol,  // string | null — pass to SymbolSidebar as animatingSymbol prop
    showOverlay,      // boolean — mount PowerUnlockOverlay when true
    handleCollect,    // (symbolId, startRect, imageSrc) => void
    closeOverlay,     // () => void — call from PowerUnlockOverlay onComplete
  };
};

export default useSymbolCollection;
