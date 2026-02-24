// ScreenHeader — unified title block for all screens
// glowColor: 'purple' (profile/welcome) | 'gold' (zone screens)
import React from 'react';
import './ScreenHeader.css';

const ScreenHeader = ({ title, subtitle, glowColor = 'purple', icon = null }) => {
  return (
    <div className={`screen-header screen-header--${glowColor}`}>
      <div className="screen-header-halo-wrap">
        {icon && <span className="screen-header-icon">{icon}</span>}
        <h1 className="screen-header-title">{title}</h1>
      </div>
      {subtitle && (
        <p className="screen-header-subtitle">{subtitle}</p>
      )}
    </div>
  );
};

export default ScreenHeader;
