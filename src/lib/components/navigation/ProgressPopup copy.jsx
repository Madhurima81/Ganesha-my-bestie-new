import React from 'react';
import './ProgressPopup.css';

const ProgressPopup = ({ isOpen, onClose, title, items, completedItems, type }) => {
  if (!isOpen) return null;

  const getItemIcon = (item, isCompleted) => {
    // For symbols, show the actual symbol
    if (type === 'symbols') {
      return (
        <div className={`item-icon ${isCompleted ? 'completed' : 'locked'}`}>
          <span className="symbol-text">{item.symbol || item.name}</span>
          {isCompleted && <div className="checkmark">✓</div>}
        </div>
      );
    }
    
    // For meanings/chants, show text-based cards
    return (
      <div className={`item-icon ${isCompleted ? 'completed' : 'locked'}`}>
        <span className="item-name">{item.name || item.title}</span>
        {isCompleted && <div className="checkmark">✓</div>}
        {!isCompleted && <div className="lock-icon">🔒</div>}
      </div>
    );
  };

  return (
    <div className="progress-popup-overlay" onClick={onClose}>
      <div className="progress-popup-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <h2 className="popup-title">{title}</h2>
        
        <div className="progress-summary">
          <span className="completed-count">{completedItems.length}</span>
          <span className="total-count">/ {items.length}</span>
          <span className="summary-text">completed</span>
        </div>

        <div className="items-grid">
          {items.map((item, index) => {
            const isCompleted = completedItems.includes(item.id || item.name || item.title);
            return (
              <div key={index} className="grid-item">
                {getItemIcon(item, isCompleted)}
                <p className="item-label">{item.name || item.title}</p>
              </div>
            );
          })}
        </div>

        <button className="continue-button" onClick={onClose}>
          Continue Learning!
        </button>
      </div>
    </div>
  );
};

export default ProgressPopup;