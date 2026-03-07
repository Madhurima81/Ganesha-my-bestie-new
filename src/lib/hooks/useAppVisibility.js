import { useEffect } from 'react';

/**
 * useAppVisibility - Fires callbacks when the app is hidden (tab switch, phone call, etc.)
 * or becomes visible again. State is preserved in-memory automatically.
 *
 * @param {function} onHide - Called when the app loses focus
 * @param {function} onShow - Called when the app regains focus
 */
const useAppVisibility = (onHide, onShow) => {
  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        onHide?.();
      } else {
        onShow?.();
      }
    };

    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [onHide, onShow]);
};

export default useAppVisibility;
