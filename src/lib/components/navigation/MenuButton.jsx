// lib/components/navigation/MenuButton.jsx
// Dedicated button to open the slide menu

import React from 'react';
import './MenuButton.css';
import { getZoneTheme } from '../../config/ZoneThemes';

const MenuButton = ({ onClick, zoneId = 'symbol-mountain', showLabel = false }) => {
  const theme = getZoneTheme(zoneId);

  return (
    <div className="menu-button-wrapper">
      <button
        className="menu-button-trigger"
        onClick={onClick}
        aria-label="Open menu"
        style={{
          background: theme.accentColor,
          borderColor: theme.menuBorder,
          color: theme.textPrimary
        }}
      >
        <div className="menu-button-bars">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      {showLabel && (
        <span className="menu-button-label">Menu</span>
      )}
    </div>
  );
};

export default MenuButton;