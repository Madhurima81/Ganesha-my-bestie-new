import React, { useState } from 'react';
import './HamburgerNav.css';

const HamburgerNav = ({
  onHome,
  onProgress,
  onHelp,
  onParentMenu,
  isAudioOn,
  onAudioToggle,
  currentProgress = { stars: 0, completed: 0, total: 4 }
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleAction = (action) => {
    action();
    setIsOpen(false);
  };

  const handleParentAction = () => {
    if (onParentMenu) {
      onParentMenu('dashboard'); // Default to dashboard
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button 
        className={`hamburger-button ${isOpen ? 'open' : ''}`}
        onClick={toggleMenu}
        aria-label="Menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* Side Menu */}
      {isOpen && (
        <div className="menu-overlay" onClick={toggleMenu}>
          <div className="side-menu" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button className="menu-close" onClick={toggleMenu}>
              ×
            </button>

            <button 
              className="menu-item home"
              onClick={() => handleAction(onHome)}
            >
              <span className="menu-icon">🏠</span>
              <span className="menu-label">Home</span>
            </button>

            <button 
              className="menu-item progress"
              onClick={() => handleAction(onProgress)}
            >
              <span className="menu-icon">⭐</span>
              <span className="menu-label">Progress</span>
              <span className="menu-badge">{currentProgress.stars}</span>
            </button>

            <button 
              className="menu-item sound"
              onClick={() => handleAction(onAudioToggle)}
            >
              <span className="menu-icon">{isAudioOn ? '🔊' : '🔇'}</span>
              <span className="menu-label">{isAudioOn ? 'Sound On' : 'Sound Off'}</span>
            </button>

            <button 
              className="menu-item help"
              onClick={() => handleAction(onHelp)}
            >
              <span className="menu-icon">❓</span>
              <span className="menu-label">Help</span>
            </button>

            <div className="menu-divider"></div>

            <button 
              className="menu-item parent"
              onClick={handleParentAction}
            >
              <span className="menu-icon">👨‍👩‍👧</span>
              <span className="menu-label">Parent Zone</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default HamburgerNav;
