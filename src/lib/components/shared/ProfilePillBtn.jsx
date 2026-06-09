import React from 'react';
import './ProfilePillBtn.css';

const ProfilePillBtn = ({
  label,
  onClick,
  disabled = false,
  fullWidth = true,
  size = 'md',
  style,
  className = '',
  ariaLabel,
}) => {
  return (
    <button
      type="button"
      className={`profile-cta-btn-unified profile-cta-btn-${size} ${fullWidth ? 'profile-cta-btn-full' : ''} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={style}
    >
      <span className="profile-cta-btn-text">{label}</span>
    </button>
  );
};

export default ProfilePillBtn;
