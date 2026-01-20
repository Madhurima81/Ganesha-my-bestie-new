// lib/components/navigation/MenuButton.jsx
// Dedicated button to open the slide menu

import React from 'react';
import './MenuButton.css';
import { getZoneTheme } from '../../config/ZoneThemes';

const MenuButton = ({ onClick, zoneId = 'symbol-mountain' }) => {
  const theme = getZoneTheme(zoneId);

  return (
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
  );
};

export default MenuButton;