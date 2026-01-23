// zones/shloka-river/core/UnifiedButtonV2.jsx
// Unified 3D Toy Button V2 - Solid gradient with 3D shadow
// Green (Primary), Blue (Choice), Gold (Success), Red (Exit/Danger)

import React from 'react';
import './UnifiedButtonV2.css';

const UnifiedButtonV2 = ({
  children,
  onClick,
  variant = 'primary',  // 'primary' (green), 'secondary' (blue), 'success' (gold), 'danger' (red)
  size = 'default',     // 'small', 'default', 'large'
  heartbeat = false,    // Add heartbeat animation after 3 seconds
  disabled = false,
  className = '',
  ...props
}) => {
  const buttonClasses = [
    'btn-toy-3d',
    `btn-${variant}`,
    size !== 'default' ? `btn-${size}` : '',
    heartbeat ? 'btn-heartbeat' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default UnifiedButtonV2;
