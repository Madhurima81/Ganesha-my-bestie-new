import React from 'react';
import './Header.css';

/**
 * Unified Header Component - Uses Zone-Current Colors
 *
 * The header background adapts to the zone (Layer A - the walls).
 * Can optionally include action buttons (which use Layer B - play colors).
 *
 * @param {Object} props
 * @param {string} props.title - Main header title
 * @param {string} props.subtitle - Optional subtitle text
 * @param {React.ReactNode} props.leftElement - Optional left side element (e.g., back button)
 * @param {React.ReactNode} props.rightElement - Optional right side element (e.g., settings icon)
 * @param {React.ReactNode} props.children - Optional content below title
 * @param {boolean} props.withShadow - Add shadow below header (default: true)
 * @param {string} props.align - Text alignment: 'left' | 'center' | 'right' (default: 'center')
 * @param {string} props.className - Additional CSS classes
 */
const Header = ({
  title,
  subtitle,
  leftElement,
  rightElement,
  children,
  withShadow = true,
  align = 'center',
  className = '',
  ...rest
}) => {
  const headerClasses = [
    'unified-header',
    withShadow ? 'unified-header--with-shadow' : '',
    `unified-header--align-${align}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <header className={headerClasses} {...rest}>
      <div className="unified-header__container">
        {/* Left Element (Back Button, etc.) */}
        {leftElement && (
          <div className="unified-header__left">
            {leftElement}
          </div>
        )}

        {/* Title Section */}
        <div className="unified-header__content">
          {title && (
            <h1 className="unified-header__title">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="unified-header__subtitle">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right Element (Settings, etc.) */}
        {rightElement && (
          <div className="unified-header__right">
            {rightElement}
          </div>
        )}
      </div>

      {/* Optional children content below title */}
      {children && (
        <div className="unified-header__extra">
          {children}
        </div>
      )}
    </header>
  );
};

export default Header;
