// ZonePreviewModal.jsx - Matches Image 1 Design exactly
import React from 'react';
import './ZonePreviewModal.css';

// 🎨 Zone Configuration: Specific Accent Colors from Table
const zoneContent = {
  'symbol-mountain': {
    tagline: "Where Sacred Symbols Come to Life",
    theme: {
      '--primary': '#4A90E2', // Blue
      '--accent': '#4A90E2',
      '--light-bg': '#EBF5FF' // Very light blue for list bg
    },
    image: '/images/zone-art-symbol-mountain.png',
    activities: [
      { icon: '🔎', title: 'Discover symbols', sub: 'Tap each symbol to learn' },
      { icon: '🧭', title: 'Mini-quests', sub: 'Short playful challenges' },
      { icon: '🏆', title: 'Rewards & badges', sub: 'Collect stickers' }
    ]
  },
  'cave-of-secrets': {
    tagline: "Where Words Become Wisdom",
    theme: {
      '--primary': '#9163D0', // Purple
      '--accent': '#9163D0',
      '--light-bg': '#F6EFFF' // Very light purple
    },
    image: '/images/zone-art-cave.png',
    activities: [
      { icon: '🕯️', title: 'Light the lantern', sub: 'Follow the glow' },
      { icon: '🧩', title: 'Puzzle paths', sub: 'Simple matching games' },
      { icon: '🔔', title: 'Hear the verse', sub: 'Listen to the revealed line' }
    ]
  },
  'shloka-river': {
    tagline: "Where Celebration Feels Like",
    theme: {
      '--primary': '#3BA6FF', // Cyan/Blue
      '--accent': '#3BA6FF',
      '--light-bg': '#EAF6FF' // Light cyan
    },
    image: '/images/zone-art-shloka-river.png',
    activities: [
      { icon: '🎧', title: 'Listen to shlokas', sub: 'Hear the divine sounds' },
      { icon: '🧘', title: 'Practice meditation', sub: 'Calm your mind' },
      { icon: '🐘', title: 'Memory games', sub: 'Help the animals remember' }
    ]
  },
  'festival-square': {
    tagline: "Where Celebration Feels Like Home",
    theme: {
      '--primary': '#FF9933', // Orange
      '--accent': '#FF9933',
      '--light-bg': '#FFF5EB' // Light orange
    },
    image: '/images/zone-art-festival.png',
    activities: [
      { icon: '🎨', title: 'Make rangoli', sub: 'Easy drag-and-fill art' },
      { icon: '🎵', title: 'Play festival music', sub: 'Tap instruments to play' },
      { icon: '🎉', title: 'Party games', sub: 'Quick mini-games' }
    ]
  },
  'about-me-hut': {
    tagline: "Where Your Story Begins",
    theme: {
      '--primary': '#F4B73A', // Warm Yellow
      '--accent': '#F4B73A',
      '--light-bg': '#FFFBEB' // Light yellow
    },
    image: '/images/zone-art-hut.png',
    activities: [
      { icon: '🖍️', title: 'Choose avatar', sub: 'Pick your forest friend' },
      { icon: '🎨', title: 'Decorate hut', sub: 'Stickers & colours' },
      { icon: '📜', title: 'Short bio', sub: 'Add your name & favourite thing' }
    ]
  }
};

// ... (Keep the imports and const zoneContent part exactly the same) ...

const ZonePreviewModal = ({ zone, onClose, onStartZone }) => {
  if (!zone) return null;

  const content = zoneContent[zone.id] || zoneContent['symbol-mountain'];
  const styleVars = content.theme;

  return (
    <div className="zone-modal-overlay" onClick={onClose}>
      <div className="zone-modal-card" style={styleVars} onClick={(e) => e.stopPropagation()}>
        
        <div className="zone-art">
          <img 
            src={content.image} 
            alt={zone.name}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.style.background = 'var(--accent)';
              e.target.parentNode.innerHTML = '<span style="font-size:50px">✨</span>';
            }}
          />
        </div>

        <h2 className="title">{zone.name}</h2>
        <p className="subtitle">{content.tagline}</p>

        <div className="activities">
          {content.activities.map((item, index) => (
            <div key={index} className="activity">
              <span className="ico" style={{color: 'var(--primary)'}}>{item.icon}</span>
              <span><strong>{item.title}</strong></span>
            </div>
          ))}
        </div>

        {/* 🟢 CHANGED: Row layout for buttons */}
        <div className="btn-row">
          <button 
            className="btn-primary"
            onClick={() => {
              onStartZone(zone);
              onClose();
            }}
          >
            Let's Play
          </button>
          
          <button 
            className="btn-secondary"
            onClick={onClose}
          >
            Back
          </button>
        </div>

      </div>
    </div>
  );
};

export default ZonePreviewModal;