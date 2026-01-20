import React, { useState } from 'react';
import './ProgressPopup.css';

const ProgressPopup = ({ isOpen, onClose, title, items, completedItems, type }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  if (!isOpen) return null;

  // Check if an item is in the completed list
  const checkIsCompleted = (item) => {
    if (!completedItems || completedItems.length === 0) return false;
    return completedItems.some(completedId => 
      completedId === item.id || 
      completedId === item.name || 
      completedId === item.title ||
      (typeof completedId === 'string' && item.id && completedId.toLowerCase() === item.id.toLowerCase())
    );
  };

  const handleItemClick = (item, isCompleted) => {
    if (isCompleted) {
      setSelectedItem(item);
    }
  };

  const playAudio = (audioPath) => {
    if (!audioPath) return;
    const audio = new Audio(audioPath);
    audio.play().catch(e => console.log("Audio play error:", e));
  };

  return (
    <div className="pp-overlay" onClick={onClose}>
      
      {/* ===================================================
          1. MAIN GRID CARD
          =================================================== */}
      <div className={`pp-card ${selectedItem ? 'pp-card-blurred' : ''}`} onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER: Title Only (Removed the X button) */}
        <div className="pp-header">
          <h2 className="pp-title">{title}</h2>
        </div>
        
        {/* STATS BAR */}
        <div className="pp-stats">
          <span className="pp-count-highlight">{completedItems.length}</span>
          <span className="pp-count-total">/ {items.length} unlocked</span>
        </div>

        {/* ITEMS GRID */}
        <div className="pp-grid">
          {items.map((item, index) => {
            const isCompleted = checkIsCompleted(item);
            
            return (
              <div 
                key={index} 
                className={`pp-item-card ${isCompleted ? 'unlocked' : 'locked'}`}
                onClick={() => handleItemClick(item, isCompleted)}
              >
                <div className="pp-image-container">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="pp-item-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      // Fallback logic handled by CSS classes if needed
                    }} 
                  />
                </div>

                <div className="pp-text-content">
                  <h3 className="pp-item-name">{item.name}</h3>
                  {item.subtitle && <p className="pp-item-subtitle">{item.subtitle}</p>}
                </div>
                
                {isCompleted && <div className="pp-checkmark">✓</div>}
              </div>
            );
          })}
        </div>
        
        {/* CONTINUE BUTTON - The only way to close the main popup */}
        <button className="pp-action-btn" onClick={onClose}>Continue Journey ➜</button>
      </div>

      {/* ===================================================
          2. DETAIL POPUP (The "Card within Card")
          =================================================== */}
      {selectedItem && (
        <div className="pp-detail-overlay" onClick={(e) => { e.stopPropagation(); setSelectedItem(null); }}>
          <div className="pp-detail-card" onClick={(e) => e.stopPropagation()}>
            
            {/* Top Right X for the Detail Card (Kept for usability) */}
            <button className="pp-detail-close" onClick={() => setSelectedItem(null)}>×</button>
            
            <div className="pp-detail-image-wrapper">
              <img src={selectedItem.image} alt={selectedItem.name} className="pp-detail-image" />
            </div>

            <h2 className="pp-detail-title">{selectedItem.name}</h2>
            {selectedItem.subtitle && <h3 className="pp-detail-subtitle">{selectedItem.subtitle}</h3>}

            <p className="pp-detail-desc">
              {selectedItem.description || "You have discovered this sacred item! Keep exploring to learn more."}
            </p>

            <div className="pp-detail-actions">
              {selectedItem.audio && (
                <button className="pp-btn-audio" onClick={() => playAudio(selectedItem.audio)}>
                  <span>🎵</span> Play Sound
                </button>
              )}
              {/* REMOVED: The extra "Close" button that was here */}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ProgressPopup;