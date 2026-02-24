// ZonePreviewModal.jsx — Sacred Portal design, scoped classes, closing animation
import React, { useState } from 'react';
import './ZonePreviewModal.css';
import PrimaryBtn from '../../lib/components/shared/PrimaryBtn';

const zoneContent = {
  'symbol-mountain': {
    tagline: "What's Hiding on the Mountain?",
    image: '/images/zone-art-symbol-mountain.png',
    featuresBg: 'rgba(210, 230, 255, 0.35)',
    activities: [
      { icon: '🐘', title: 'Find Ganesha\'s 8 clues' },
      { icon: '💡', title: 'Find out what each one means' },
      { icon: '🏆', title: 'Collect them all!' }
    ]
  },
  'cave-of-secrets': {
    tagline: "Crack the Code in the Cave",
    image: '/images/zone-art-cave.png',
    featuresBg: 'rgba(210, 190, 255, 0.3)',
    activities: [
      { icon: '🔍', title: 'Find out what words mean' },
      { icon: '🔤', title: 'Build words piece by piece' },
      { icon: '🐾', title: 'Save the animals inside!' }
    ]
  },
  'shloka-river': {
    tagline: "Say It Like Ganesha Does",
    image: '/images/zone-art-shloka-river.png',
    featuresBg: 'rgba(190, 230, 255, 0.3)',
    activities: [
      { icon: '🎧', title: 'Hear the words come alive' },
      { icon: '🎙️', title: 'Record your own voice' },
      { icon: '⭐', title: 'Chant the whole thing!' }
    ]
  },
  'festival-square': {
    tagline: "Party Time with Ganesha!",
    image: '/images/zone-art-festival.png',
    featuresBg: 'rgba(255, 230, 190, 0.35)',
    activities: [
      { icon: '🎹', title: 'Play songs on the piano' },
      { icon: '🎨', title: 'Make colourful rangoli' },
      { icon: '🍬', title: 'Cook modak for the feast!' }
    ]
  },
  'about-me-hut': {
    tagline: "Tell Ganesha All About You!",
    image: '/images/zone-art-hut.png',
    featuresBg: 'rgba(255, 245, 190, 0.35)',
    activities: [
      { icon: '🎂', title: 'Your name, your birthday' },
      { icon: '🌳', title: 'Who\'s in your family?' },
      { icon: '🌟', title: 'Draw your biggest dream!' }
    ]
  }
};

const ZonePreviewModal = ({ zone, onClose, onStartZone }) => {
  const [closing, setClosing] = useState(false);
  const [opening, setOpening] = useState(false);

  if (!zone) return null;

  const content = zoneContent[zone.id] || zoneContent['symbol-mountain'];

  // Return button — gentle close
  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 600);
  };

  // Enter button — sacred expansion into zone
  const handlePlay = () => {
    setOpening(true);
    setTimeout(() => {
      setOpening(false);
      onStartZone(zone);
      onClose();
    }, 800);
  };

  return (
    <div
      className={`portal-overlay ${closing ? 'closing' : ''} ${opening ? 'opening' : ''}`}
      onClick={!opening ? handleClose : undefined}
    >
      <div
        className="portal-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mascot */}
        <img
          src={content.image}
          alt={zone.name}
          className="portal-mascot"
          onError={(e) => { e.target.style.display = 'none'; }}
        />

        {/* Title */}
        <h2 className="portal-title">{zone.name}</h2>
        <p className="portal-subtitle">{content.tagline}</p>

        {/* Features */}
        <div
          className="portal-features"
          style={{ background: content.featuresBg }}
        >
          {content.activities.map((item, i) => (
            <div key={i} className="portal-feature-row">
              <span className="portal-feature-icon">{item.icon}</span>
              <span className="portal-feature-text">{item.title}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="portal-actions">
          <PrimaryBtn
            label="Enter"
            onClick={handlePlay}
            size="lg"
            fullWidth={false}
          />
          <button className="portal-ghost-btn" onClick={handleClose}>
            Return
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZonePreviewModal;
