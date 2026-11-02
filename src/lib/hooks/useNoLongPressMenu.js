import { useEffect } from 'react';

// Press-and-hold games: iOS/Chrome-iOS open "Save to Photos / Search inside image / Copy" when a
// finger rests on a picture or CSS background — right where the child must hold. The menu steals the
// touch and the hold never finishes (Samaprabha got stuck this way). CSS -webkit-touch-callout alone
// is not enough on Chrome iOS, so also cancel the touchstart default and the contextmenu event.
// Real controls (buttons, links, fields) keep working. See KNOWN_PITFALLS 66.
const KEEP = 'button, a, input, select, textarea, label, [data-allow-touch-default]';

export default function useNoLongPressMenu(ref, enabled = true) {
  useEffect(() => {
    const el = ref?.current;
    if (!el || !enabled) return undefined;

    const onTouchStart = (e) => {
      if (e.target?.closest?.(KEEP)) return;
      if (e.cancelable) e.preventDefault();
    };
    const onContextMenu = (e) => e.preventDefault();

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('contextmenu', onContextMenu);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('contextmenu', onContextMenu);
    };
  }, [ref, enabled]);
}
