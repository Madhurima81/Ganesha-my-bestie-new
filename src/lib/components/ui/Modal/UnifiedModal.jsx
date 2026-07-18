// lib/components/ui/Modal/UnifiedModal.jsx
// Universal modal component that adapts to zone colors
// Works across all 5 zones with consistent cream background

import React from 'react';
import './UnifiedModal.css';
import UnifiedButtonV2 from '../Button/UnifiedButtonV2';
import CloseButton from '../../../../components/CloseButton';

const UnifiedModal = ({
  isOpen,
  onClose,
  title,
  children,

  // Icon/Image
  iconImage,           // Image to show above title
  iconSize = '120px',  // Size of icon/image

  // Buttons
  confirmText = 'Continue',
  onConfirm,
  cancelText,
  onCancel,

  // Button variants
  confirmVariant = 'primary',  // 'primary', 'secondary', 'info'
  cancelVariant = 'secondary',

  // Control options
  showCloseButton = false,  // X button in corner
  closeOnOverlayClick = false,

  // Size
  size = 'medium',  // 'small', 'medium', 'large'

  // Custom className
  className = '',

  // Zone (optional - auto-detects from parent)
  zone,

  ...props
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else if (onClose) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  const modalClasses = [
    'unified-modal-container',
    `unified-modal-container--${size}`,
    zone ? `zone-${zone}` : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className="unified-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="unified-modal-title"
    >
      <div className={modalClasses} {...props}>
        {showCloseButton && onClose && <CloseButton onClose={onClose} />}

        {iconImage && (
          <div className="unified-modal__icon-container">
            <img
              src={iconImage}
              alt="modal icon"
              className="unified-modal__icon"
              style={{ width: iconSize, height: iconSize }}
            />
          </div>
        )}

        {title && (
          <h2 id="unified-modal-title" className="unified-modal__title">
            {title}
          </h2>
        )}

        <div className="unified-modal__content">
          {children}
        </div>

        <div className="unified-modal__actions">
          {cancelText && (
            <UnifiedButtonV2
              variant={cancelVariant}
              size="default"
              onClick={handleCancel}
              heartbeat={false}
            >
              {cancelText}
            </UnifiedButtonV2>
          )}
          <UnifiedButtonV2
            variant={confirmVariant}
            size="large"
            onClick={handleConfirm}
            heartbeat={false}
          >
            {confirmText}
          </UnifiedButtonV2>
        </div>
      </div>
    </div>
  );
};

export default UnifiedModal;
