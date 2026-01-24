// lib/components/navigation/TocaBocaNav.jsx
// Slide menu triggered by MenuButton (no swipe detection)

import React, { useState, useEffect } from 'react';
import './TocaBocaNav.css';
import { getZoneTheme } from '../../config/ZoneThemes';

// Helper functions for zone display
const getZoneName = (zoneId) => {
  const names = {
    'symbol-mountain': 'Symbol Mountain',
    'cave-of-secrets': 'Cave of Secrets',
    'festival-square': 'Festival Square',
    'shloka-river': 'Shloka River',
    'about-me-hut': 'About Me Hut'
  };
  return names[zoneId] || 'Game Zone';
};

const getZoneTagline = (zoneId) => {
  const taglines = {
    'symbol-mountain': 'Discover & Learn',
    'cave-of-secrets': 'Hidden Treasures',
    'festival-square': 'Celebrate & Create',
    'shloka-river': 'Flow & Chant',
    'about-me-hut': 'Your Story'
  };
  return taglines[zoneId] || 'Have Fun!';
};

const TocaBocaNav = ({
  show,           // ← Controlled by parent via MenuButton
  onClose,        // ← Close handler
  onHome,
  onHelp,
  onStartFresh,
  isAudioOn,
  onAudioToggle,
  onParentMenu,
  zoneId = 'symbol-mountain'
}) => {
  const [showParentAccess, setShowParentAccess] = useState(false);
  const theme = getZoneTheme(zoneId);

  // Auto-hide menu after inactivity (optional)
  useEffect(() => {
    if (!show) return;
    
    const hideTimer = setTimeout(() => {
      onClose?.();
    }, 8000); // Auto-close after 8 seconds
    
    return () => clearTimeout(hideTimer);
  }, [show, onClose]);

  const handleMenuAction = (action) => {
    action();
    onClose?.();
  };

  const handleParentVerification = () => {
    const num1 = Math.floor(Math.random() * 10) + 5;
    const num2 = Math.floor(Math.random() * 10) + 5;
    const answer = prompt(`Parent Verification: What is ${num1} + ${num2}?`);
    
    if (parseInt(answer) === num1 + num2) {
      onParentMenu?.('dashboard');
      setShowParentAccess(false);
      onClose?.();
    } else {
      alert('Incorrect answer. Please try again.');
    }
  };

  return (
    <>
      {/* Menu overlay */}
      {show && (
        <div className="menu-overlay" onClick={onClose} />
      )}
      
      {/* Left slide menu */}
      <div 
        className={`side-menu ${show ? 'visible' : ''}`}
        style={{
          background: theme.menuBg,
          backdropFilter: theme.blur,
          fontFamily: theme.fontFamilyBody
        }}
      >
        {/* Close button */}
        <button 
          className="menu-close" 
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.6)',
            color: theme.textPrimary
          }}
        >
          ×
        </button>
        
        {/* ZONE HEADER */}
        <div className="menu-zone-header">
          <h2 
            className="menu-zone-title"
            style={{ color: theme.textPrimary }}
          >
            {getZoneName(zoneId)}
          </h2>
          <p 
            className="menu-zone-subtitle"
            style={{ color: theme.textSecondary }}
          >
            {getZoneTagline(zoneId)}
          </p>
        </div>

        <div className="menu-content">
          
          {/* 1. BACK TO MAP */}
          <button 
            className="menu-button"
            onClick={() => handleMenuAction(onHome)}
            style={{
              background: 'rgba(255, 255, 255, 0.4)',
              color: theme.textPrimary
            }}
          >
            <span className="menu-icon">🏠</span>
            <span className="menu-label">Back to Map</span>
          </button>
          
          {/* 2. PLAY AGAIN */}
          <button 
            className="menu-button"
            onClick={() => handleMenuAction(() => {
              if (window.confirm('Start this scene fresh? You will lose current progress in this scene only.')) {
                onStartFresh?.();
              }
            })}
            style={{
              background: 'rgba(255, 255, 255, 0.4)',
              color: theme.textPrimary
            }}
          >
            <span className="menu-icon">🔄</span>
            <span className="menu-label">Play Again</span>
          </button>
          
          {/* 3. SOUND */}
          <button 
            className="menu-button"
            onClick={() => handleMenuAction(onAudioToggle)}
            style={{
              background: 'rgba(255, 255, 255, 0.4)',
              color: theme.textPrimary
            }}
          >
            <span className="menu-icon">{isAudioOn ? '🔊' : '🔇'}</span>
            <span className="menu-label">Sound</span>
          </button>
          
          {/* 4. HELP */}
          <button 
            className="menu-button"
            onClick={() => handleMenuAction(onHelp)}
            style={{
              background: 'rgba(255, 255, 255, 0.4)',
              color: theme.textPrimary
            }}
          >
            <span className="menu-icon">❓</span>
            <span className="menu-label">Help</span>
          </button>

          {/* DIVIDER */}
          <div 
            className="menu-divider"
            style={{
              background: `linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent)`
            }}
          />
          
          {/* GANESHA ICON - Long press for Parent Zone */}
          <button 
            className="menu-button ganesha-button"
            onTouchStart={(e) => {
              const longPressTimer = setTimeout(() => {
                setShowParentAccess(true);
              }, 1000);
              e.currentTarget.longPressTimer = longPressTimer;
            }}
            onTouchEnd={(e) => {
              clearTimeout(e.currentTarget.longPressTimer);
            }}
            onMouseDown={(e) => {
              const longPressTimer = setTimeout(() => {
                setShowParentAccess(true);
              }, 1000);
              e.currentTarget.longPressTimer = longPressTimer;
            }}
            onMouseUp={(e) => {
              clearTimeout(e.currentTarget.longPressTimer);
            }}
            onMouseLeave={(e) => {
              clearTimeout(e.currentTarget.longPressTimer);
            }}
            onClick={(e) => {
              e.preventDefault();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              color: theme.textPrimary
            }}
          >
            <span className="menu-icon" style={{ fontSize: '40px' }}>🐘</span>
          </button>
          
          <div 
            className="menu-hint-text"
            style={{
              color: theme.textSecondary
            }}
          >
            Long-press for grown-ups
          </div>
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
    </>
  );
};

export default TocaBocaNav;