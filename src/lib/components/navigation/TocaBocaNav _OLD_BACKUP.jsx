import React, { useState, useEffect, useRef } from 'react';
import './TocaBocaNav.css';

const TocaBocaNav = ({
  onHome,
  onProgress,
  onHelp,
  onParentMenu,
  isAudioOn,
  onAudioToggle,
  onZonesClick,
    onStartFresh, // ← ADD THIS NEW PROP
  currentProgress = { stars: 0, completed: 0, total: 4 }
}) => {
  const [showLeftMenu, setShowLeftMenu] = useState(false);
  const [showParentAccess, setShowParentAccess] = useState(false);
  const [touchCount, setTouchCount] = useState(0);
  const [showFirstTimeHint, setShowFirstTimeHint] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const touchTimeoutRef = useRef(null);
  const hintTimeoutRef = useRef(null);

  // Check if user has discovered navigation before
  useEffect(() => {
    const hasDiscovered = localStorage.getItem('navigationDiscovered');
    if (!hasDiscovered) {
      // Show hint after 3 seconds
      hintTimeoutRef.current = setTimeout(() => {
        setShowFirstTimeHint(true);
      }, 3000);
    }
  }, []);

  // Hide hint after first menu open
  useEffect(() => {
    if (showLeftMenu) {
      setShowFirstTimeHint(false);
      localStorage.setItem('navigationDiscovered', 'true');
      clearTimeout(hintTimeoutRef.current);
    }
  }, [showLeftMenu]);

  // Touch handlers defined outside useEffect to be used by detection area
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    
    console.log('Touch start at:', startX); // Debug log
    
    // Store in ref to access in move handler
    touchStartRef.current = { x: startX, y: startY };
    
    // Show swipe hint on edge touch
    if (startX < 50) {
      setShowSwipeHint(true);
    }
    
    // Multi-touch detection for parent access
    const touches = e.touches.length;
    setTouchCount(touches);
    
    // Three-finger tap for parent access
    if (touches >= 3) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = setTimeout(() => {
        setShowParentAccess(true);
      }, 500);
    }
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return;
    
    const touch = e.touches[0];
    const currentX = touch.clientX;
    const currentY = touch.clientY;
    const diffX = currentX - touchStartRef.current.x;
    const diffY = Math.abs(currentY - touchStartRef.current.y);
    
    console.log('Touch move:', { startX: touchStartRef.current.x, currentX, diffX }); // Debug log
    
    // Detect left edge swipe - more lenient thresholds
    if (touchStartRef.current.x < 50 && diffX > 30 && diffY < 100) {
      console.log('Menu should open!'); // Debug log
      setShowLeftMenu(true);
      setShowSwipeHint(false);
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    setTouchCount(0);
    setShowSwipeHint(false);
    clearTimeout(touchTimeoutRef.current);
  };

  // Add ref for touch start position
  const touchStartRef = useRef(null);

  useEffect(() => {
    let hideMenuTimeout;

    // Auto-hide menu after inactivity
    const resetHideTimeout = () => {
      clearTimeout(hideMenuTimeout);
      if (showLeftMenu) {
        hideMenuTimeout = setTimeout(() => {
          setShowLeftMenu(false);
        }, 5000); // Hide after 5 seconds
      }
    };

    document.addEventListener('touchstart', resetHideTimeout);

    return () => {
      document.removeEventListener('touchstart', resetHideTimeout);
      clearTimeout(hideMenuTimeout);
      clearTimeout(touchTimeoutRef.current);
      clearTimeout(hintTimeoutRef.current);
    };
  }, [showLeftMenu]);

  const handleMenuAction = (action) => {
    action();
    setShowLeftMenu(false);
  };

  const handleParentVerification = () => {
    // Simple math problem for parent verification
    const num1 = Math.floor(Math.random() * 10) + 5;
    const num2 = Math.floor(Math.random() * 10) + 5;
    const answer = prompt(`Parent Verification: What is ${num1} + ${num2}?`);
    
    if (parseInt(answer) === num1 + num2) {
      onParentMenu('dashboard');
      setShowParentAccess(false);
    } else {
      alert('Incorrect answer. Please try again.');
    }
  };

  return (
    <>
      {/* Invisible left edge detection area */}
      <div 
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '50px',
          height: '100vh',
          zIndex: 98, // Higher than sidebar
          pointerEvents: 'auto',
          // Uncomment next line to see the touch area during testing
           background: 'rgba(255, 0, 0, 0.1)'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Edge indicator - only shows if navigation not discovered */}
      {!localStorage.getItem('navigationDiscovered') && (
        <div className="edge-indicator left" />
      )}
      
      {/* First time hint - DISABLED */}
{/* 
{showFirstTimeHint && (
  <div className="first-time-hint show">
    <div className="first-time-hint-hand">👉</div>
    <div className="first-time-hint-text">Swipe from edge</div>
  </div>
)}
*/}
      
      {/* Swipe hint - shows when touching edge */}
      <div className={`swipe-hint ${showSwipeHint ? 'visible' : ''}`} />
      
      {/* Menu overlay - click to close */}
      {showLeftMenu && (
        <div className="menu-overlay" onClick={() => setShowLeftMenu(false)} />
      )}
      
      {/* Left edge menu */}
      <div className={`side-menu ${showLeftMenu ? 'visible' : ''}`}>
        {/* Close button */}
        <button className="menu-close" onClick={() => setShowLeftMenu(false)}>
          ×
        </button>
        
        <div className="menu-content">
          <button 
            className="menu-button"
            onClick={() => handleMenuAction(onHome)}
          >
            <span className="menu-icon">🏠</span>
            <span className="menu-label">Home</span>
          </button>
          
          <button 
            className="menu-button"
            onClick={() => handleMenuAction(onProgress)}
          >
            <span className="menu-icon">⭐</span>
            <span className="menu-label">Progress</span>
            <span className="menu-badge">{currentProgress.stars}</span>
          </button>
          
          <button 
            className="menu-button"
            onClick={() => handleMenuAction(onZonesClick)}
          >
            <span className="menu-icon">🗺️</span>
            <span className="menu-label">Zones</span>
            <span className="menu-badge">{currentProgress.completed}/8</span>
          </button>
          
          <button 
            className="menu-button"
            onClick={() => handleMenuAction(onAudioToggle)}
          >
            <span className="menu-icon">{isAudioOn ? '🔊' : '🔇'}</span>
            <span className="menu-label">Sound</span>
          </button>
          
          <button 
            className="menu-button"
            onClick={() => handleMenuAction(onHelp)}
          >
            <span className="menu-icon">❓</span>
            <span className="menu-label">Help</span>
          </button>

          {/* ✨ ADD THIS NEW START FRESH BUTTON */}
<button 
  className="menu-button restart-button"
  onClick={() => handleMenuAction(() => {
    if (window.confirm('Start this scene fresh? You will lose current progress in this scene only.')) {
      onStartFresh();
    }
  })}
>
  <span className="menu-icon">🔄</span>
  <span className="menu-label">Start Fresh</span>
</button>
          
          <div className="menu-divider" />
          
          <button 
            className="menu-button parent-button"
            onClick={() => handleMenuAction(() => setShowParentAccess(true))}
          >
            <span className="menu-icon">👨‍👩‍👧</span>
            <span className="menu-label">Parent Zone</span>
          </button>
        </div>
      </div>
      
      {/* Parent access overlay */}
      {showParentAccess && (
        <div className="parent-overlay" onClick={() => setShowParentAccess(false)}>
          <div className="parent-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Parent Access</h2>
            <p>This area is for grown-ups only!</p>
            <button className="parent-button" onClick={handleParentVerification}>
              Enter Parent Zone
            </button>
            <button className="parent-button cancel" onClick={() => setShowParentAccess(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      
{/* Touch indicator for desktop testing */}
{/* 
{process.env.NODE_ENV === 'development' && (
  <div className="dev-touch-indicator">
    Touch Count: {touchCount}
  </div>
)}
*/}
      
    </>
  );
};

export default TocaBocaNav;