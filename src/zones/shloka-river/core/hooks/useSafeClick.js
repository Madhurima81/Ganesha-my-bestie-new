// zones/shloka-river/core/hooks/useSafeClick.js
// Prevents rapid clicking, double-taps, and accidental spam

import { useRef, useCallback } from 'react';

/**
 * Safety hook to prevent rapid clicking and ensure clean game state
 * 
 * Used by: Developer (stability), Parent (no frustration), Child (clear feedback)
 * 
 * @param {number} minDelay - Minimum milliseconds between clicks (default: 300ms)
 * @returns {object} - { safeClick, lock, unlock, isLocked }
 * 
 * Example:
 * const { safeClick, lock, unlock } = useSafeClick(300);
 * 
 * const handleClick = () => {
 *   safeClick(() => {
 *     // Your click logic here
 *     console.log('Safe click executed!');
 *   });
 * };
 */
export const useSafeClick = (minDelay = 300) => {
  const lastClickTime = useRef(0);
  const isLocked = useRef(false);
  const lockTimeout = useRef(null);

  /**
   * Execute callback only if enough time has passed and not locked
   * @param {Function} callback - Function to execute if click is safe
   * @param {number} lockDuration - Optional duration to lock after execution (ms)
   * @returns {boolean} - true if click was accepted, false if blocked
   */
  const safeClick = useCallback((callback, lockDuration = 0) => {
    const now = Date.now();
    
    // Check if we're in a locked state (during countdown, transition, etc.)
    if (isLocked.current) {
      console.log('🔒 Click blocked - action in progress');
      return false;
    }
    
    // Check minimum delay between clicks (prevents rapid spam)
    if (now - lastClickTime.current < minDelay) {
      console.log('⚡ Click too fast - ignored (rapid click prevention)');
      return false;
    }

    // Click is safe - update timestamp
    lastClickTime.current = now;
    
    // Lock if duration specified (e.g., during sequence playback)
    if (lockDuration > 0) {
      lock();
      
      // Clear any existing timeout
      if (lockTimeout.current) {
        clearTimeout(lockTimeout.current);
      }
      
      // Auto-unlock after duration
      lockTimeout.current = setTimeout(() => {
        unlock();
      }, lockDuration);
    }
    
    // Execute the callback
    if (typeof callback === 'function') {
      callback();
    }
    
    return true;
  }, [minDelay]);

  /**
   * Manually lock clicks (useful during countdowns, transitions)
   */
  const lock = useCallback(() => {
    isLocked.current = true;
    console.log('🔒 Clicks locked');
  }, []);

  /**
   * Manually unlock clicks
   */
  const unlock = useCallback(() => {
    isLocked.current = false;
    console.log('🔓 Clicks unlocked');
  }, []);

  /**
   * Check if currently locked
   */
  const checkIsLocked = useCallback(() => {
    return isLocked.current;
  }, []);

  /**
   * Reset all state (useful for cleanup)
   */
  const reset = useCallback(() => {
    isLocked.current = false;
    lastClickTime.current = 0;
    if (lockTimeout.current) {
      clearTimeout(lockTimeout.current);
      lockTimeout.current = null;
    }
  }, []);

  return { 
    safeClick, 
    lock, 
    unlock, 
    isLocked: checkIsLocked,
    reset
  };
};

export default useSafeClick;