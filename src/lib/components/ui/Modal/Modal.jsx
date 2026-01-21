import React, { useEffect, useRef } from 'react';
import Button from '../Button/Button';
import './Modal.css';

/**
 * Unified Modal Component - Uses Zone-Current Colors
 *
 * The modal BACKGROUND adapts to the zone (Layer A - the walls),
 * but BUTTONS inside always use Global Play Palette (Layer B - the toys).
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Function called when modal closes
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.confirmText - Confirm button text (default: 'Okay')
 * @param {Function} props.onConfirm - Confirm button handler (default: onClose)
 * @param {string} props.cancelText - Cancel button text (optional)
 * @param {Function} props.onCancel - Cancel button handler
 * @param {boolean} props.showCloseButton - Show X button in corner (default: true)
 * @param {boolean} props.closeOnOverlayClick - Close when clicking outside (default: true)
 * @param {string} props.size - Modal size: 'small' | 'medium' | 'large' (default: 'medium')
 * @param {string} props.className - Additional CSS classes
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  confirmText = 'Okay',
  onConfirm,
  cancelText,
  onCancel,
  showCloseButton = true,
  closeOnOverlayClick = true,
  size = 'medium',
  className = '',
  ...rest
}) => {
  const modalRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  // Handle confirm
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else if (onClose) {
      onClose();
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalClasses = [
    'unified-modal',
    `unified-modal--${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className="unified-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div ref={modalRef} className={modalClasses} {...rest}>
        {/* Close Button (X) */}
        {showCloseButton && onClose && (
          <button
            className="unified-modal__close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        )}

        {/* Title */}
        {title && (
          <h2 id="modal-title" className="unified-modal__title">
            {title}
          </h2>
        )}

        {/* Content */}
        <div className="unified-modal__content">
          {children}
        </div>

        {/* Action Buttons */}
        <div className="unified-modal__actions">
          {cancelText && (
            <Button
              variant="secondary"
              size="medium"
              onClick={handleCancel}
            >
              {cancelText}
            </Button>
          )}
          <Button
            variant="primary"
            size="medium"
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
