import React, { useEffect, useRef } from 'react';
import './Button.css';

/**
 * Unified Button Component - ALWAYS uses Global Play Palette
 *
 * This button looks THE SAME in all zones - only backgrounds change per zone.
 * Uses Layer B colors (the toys) - never zone-specific colors.
 *
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'info'} props.variant - Button style variant
 * @param {'small' | 'medium' | 'large'} props.size - Button size
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.withHeartbeat - Enable heartbeat animation on mount (default: true)
 */
const Button = ({
  variant = 'primary',
  size = 'medium',
  children,
  onClick,
  disabled = false,
  className = '',
  withHeartbeat = true,
  ...rest
}) => {
  const buttonRef = useRef(null);

  // Trigger heartbeat animation on mount (skip if using delayed heartbeat)
  useEffect(() => {
    const hasDelayedHeartbeat = className.includes('heartbeat-delayed') || className.includes('heartbeat-gentle');

    if (withHeartbeat && !hasDelayedHeartbeat && buttonRef.current) {
      buttonRef.current.classList.add('heartbeat-once');

      // Remove class after animation completes
      const timer = setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.classList.remove('heartbeat-once');
        }
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [withHeartbeat, className]);

  const buttonClasses = [
    'unified-button',
    `unified-button--${variant}`,
    `unified-button--${size}`,
    disabled ? 'unified-button--disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={buttonRef}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
