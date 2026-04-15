import React from 'react';
import './AboutMeComparisonCard.css';

function ComparisonItem({ item }) {
  if (item?.custom) {
    return (
      <div
        className={`aboutme-comparison-item ${item.wide ? 'is-wide' : ''} ${item.className || ''}`.trim()}
        style={item.style}
      >
        {item.custom}
      </div>
    );
  }

  return (
    <div
      className={`aboutme-comparison-item ${item?.wide ? 'is-wide' : ''} ${item?.className || ''}`.trim()}
      style={item?.style}
    >
      {item?.label ? <div className="aboutme-comparison-item-label">{item.label}</div> : null}

      {item?.media ? (
        <div className="aboutme-comparison-item-media">{item.media}</div>
      ) : item?.imageSrc ? (
        <img
          src={item.imageSrc}
          alt={item.imageAlt || item.text || item.label || 'comparison item'}
          className="aboutme-comparison-item-img"
        />
      ) : null}

      {item?.text ? <div className="aboutme-comparison-item-text">{item.text}</div> : null}
    </div>
  );
}

function ComparisonColumn({ column }) {
  return (
    <div className={`aboutme-comparison-column ${column?.className || ''}`.trim()} style={column?.style}>
      {column?.header ? <div className="aboutme-comparison-column-header">{column.header}</div> : null}
      {column?.title ? <div className="aboutme-comparison-column-title">{column.title}</div> : null}

      <div className="aboutme-comparison-items-grid">
        {(column?.items || []).map((item, index) => (
          <ComparisonItem key={item?.id || `${column?.title || 'column'}-${index}`} item={item} />
        ))}
      </div>

      {column?.footer ? <div className="aboutme-comparison-column-footer">{column.footer}</div> : null}
    </div>
  );
}

export default function AboutMeComparisonCard({
  title,
  subtitle,
  leftColumn,
  rightColumn,
  onContinue,
  continueLabel = 'Continue',
  className = ''
}) {
  return (
    <div className={`aboutme-comparison-overlay ${className}`.trim()}>
      {title ? <h1 className="aboutme-comparison-title">{title}</h1> : null}
      {subtitle ? <p className="aboutme-comparison-subtitle">{subtitle}</p> : null}

      <div className="aboutme-comparison-grid">
        <ComparisonColumn column={leftColumn} />
        <ComparisonColumn column={rightColumn} />
      </div>

      <button className="aboutme-comparison-continue-btn" onClick={onContinue}>
        {continueLabel}
      </button>
    </div>
  );
}

