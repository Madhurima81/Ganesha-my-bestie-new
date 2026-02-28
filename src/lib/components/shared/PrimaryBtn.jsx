// PrimaryBtn — unified button used across all screens
// Matches the "Start Adventure!" purple pill style
import React from 'react';
import './PrimaryBtn.css';

const PrimaryBtn = ({ label, onClick, disabled = false, fullWidth = true, size = 'md', style }) => {
  return (
    <button
      className={`primary-btn-unified primary-btn-${size} ${fullWidth ? 'primary-btn-full' : ''}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      <span className="primary-btn-text">{label}</span>
    </button>
  );
};

export default PrimaryBtn;
