// lib/components/layout/GameLayout.jsx

import React, { useState } from 'react';
import './GameLayout.css';

// Import your 3 existing components
// (Adjust paths if your folders are different)
import MenuButton from '../navigation/MenuButton';
import TocaBocaNav from '../navigation/TocaBocaNav';
import HelpMenu from '../help/HelpMenu';             

const GameLayout = ({
  children,           // 1. The Game Content (Canvas, etc.)

  // 2. Configuration Props
  zoneId,             // 'symbol-mountain', 'river', etc.
  helpConfig,         // The help text/images file
  sceneState,         // Current game phase (for dynamic hints)

  // 3. Action Props
  onHome,             // Function to go back to map
  onReplay,           // Function to restart level
  isAudioOn,          // Boolean
  onAudioToggle,      // Function to toggle audio

  // 4. UI Options
  showMenuLabel = false,  // Show "Menu" label under hamburger
  showMenu = true,        // Show menu button + nav + help
  showPauseButton = false, // Show pause button in top-left
  onPause             // Function to handle pause
}) => {
  const [showNav, setShowNav] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Logic: Switch from Nav Menu to Help Menu smoothly
  const handleOpenHelp = () => {
    setShowNav(false);
    setTimeout(() => setShowHelp(true), 100);
  };

  return (
    <div 
      className="game-layout-wrapper" 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: 'var(--app-height, 100vh)', 
        overflow: 'hidden' 
      }}
    >
      
      {/* A. RENDER THE GAME SCENE FIRST (So UI floats on top) */}
      {children}

      {/* B. THE MENU BUTTON (Floating Top Right) */}
      {showMenu && (
        <MenuButton
          onClick={() => setShowNav(true)}
          zoneId={zoneId}
          showLabel={showMenuLabel}
        />
      )}

      {/* C. THE PAUSE BUTTON (Floating Top Left) - Optional */}
      {showPauseButton && onPause && (
        <div className="pause-button-wrapper">
          <button
            className="pause-button-trigger"
            onClick={onPause}
            aria-label="Pause game"
          >
            ⏸️
          </button>
          <span className="pause-button-label">Pause</span>
        </div>
      )}

      {/* D. THE NAVIGATION DRAWER */}
      {showMenu && (
        <TocaBocaNav
          show={showNav}
          onClose={() => setShowNav(false)}
          onHelp={handleOpenHelp}
          onHome={onHome}
          onStartFresh={onReplay}
          isAudioOn={isAudioOn}
          onAudioToggle={onAudioToggle}
          zoneId={zoneId}
        />
      )}

      {/* E. THE HELP POPUP */}
      {showMenu && (
        <HelpMenu
          show={showHelp}
          onClose={() => setShowHelp(false)}
          helpConfig={helpConfig}
          sceneState={sceneState}
          zoneId={zoneId}
        />
      )}
      
    </div>
  );
};

export default GameLayout;
