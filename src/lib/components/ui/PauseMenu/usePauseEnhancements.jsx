// usePauseEnhancements.jsx
// Reusable hook for ESC key + Auto-pause functionality
// Use this in ANY scene to get professional pause behavior

import { useEffect } from 'react';

/**
 * Adds ESC key and auto-pause enhancements to any scene
 * @param {boolean} showPauseMenu - Current pause menu state
 * @param {function} setShowPauseMenu - Function to toggle pause menu
 * @param {function} onPause - Callback when pause opens (stop VOs, timers, etc.)
 * @param {function} onResume - Callback when pause closes (resume game, restart timers)
 * @param {object} options - Configuration options
 * @param {boolean} options.gameActive - Is game in active state (not in menu/celebration)?
 * @param {boolean} options.allowEsc - Enable ESC key? Default: true
 * @param {boolean} options.allowAutoPause - Enable auto-pause on tab blur? Default: true
 */
export const usePauseEnhancements = (
  showPauseMenu,
  setShowPauseMenu,
  onPause,
  onResume,
  options = {}
) => {
  const {
    gameActive = true,
    allowEsc = true,
    allowAutoPause = true
  } = options;

  // ========================================
  // ESC KEY TO TOGGLE PAUSE
  // ========================================
  useEffect(() => {
    if (!allowEsc) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && gameActive) {
        e.preventDefault();

        if (!showPauseMenu) {
          // Open pause menu
          if (onPause) onPause();
          setShowPauseMenu(true);
        } else {
          // Close pause menu (resume)
          setShowPauseMenu(false);
          if (onResume) onResume();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPauseMenu, gameActive, allowEsc, onPause, onResume, setShowPauseMenu]);

  // ========================================
  // AUTO-PAUSE ON APP BLUR (Mobile/Tab Switch)
  // ========================================
  useEffect(() => {
    if (!allowAutoPause) return;

    const handleVisibilityChange = () => {
      if (document.hidden && gameActive && !showPauseMenu) {
        // Auto-pause when user switches tabs/apps
        if (onPause) onPause();
        setShowPauseMenu(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [gameActive, showPauseMenu, allowAutoPause, onPause, setShowPauseMenu]);
};

export default usePauseEnhancements;
