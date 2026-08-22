// ProgressModal.jsx - Simplified Version
import React from 'react';
import './ProgressModal.css';
import CloseButton from '../../../components/CloseButton';

const ProgressModal = ({ 
  progress, 
  onClose,
  zones = []
}) => {
  const totalStars = zones.reduce((total, zone) => total + zone.stars, 0);
  const completedZones = zones.filter(zone => zone.unlocked && zone.stars > 0).length;
  
  return (
    <div className="progress-modal-overlay" onClick={onClose}>
      <div className="progress-modal-content" onClick={(e) => e.stopPropagation()}>
        <CloseButton className="progress-close-btn" onClose={onClose} />
        
        <h2 className="progress-title">Your Adventure</h2>
        
        {/* Big Stats */}
        <div className="stats-section">
          <div className="big-stat">
            <div className="big-number">{totalStars}</div>
            <div className="stat-label">Stars ⭐</div>
          </div>
          
          <div className="big-stat">
            <div className="big-number">{completedZones}/8</div>
            <div className="stat-label">Zones 🗺️</div>
          </div>
        </div>
        
        {/* Zone Grid - Simple Icons */}
        <div className="zones-grid">
          {zones.map((zone) => (
            <div 
              key={zone.id} 
              className={`zone-box ${zone.unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="zone-icon">{zone.icon}</div>
              <div className="zone-stars">
                {zone.stars > 0 ? `${zone.stars} ⭐` : '🔒'}
              </div>
            </div>
          ))}
        </div>
        
        <button className="progress-close-button" onClick={onClose}>
          Let's Play! 🎮
        </button>
      </div>
    </div>
  );
};

export default ProgressModal;
