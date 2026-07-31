import React, { useState } from 'react';
import './ZonePreviewModal.css';
import CloseButton from '../../components/CloseButton';
import ProfilePillBtn from '../../lib/components/shared/ProfilePillBtn';
import { getProfilePillBtnStyle } from '../../lib/config/ZoneThemes';
import GaneshaCharacter from '../../lib/components/character/GaneshaCharacter';

const zoneContent = {
  'symbol-mountain': {
    tagline: "Find What Makes Ganesha Special",
    primaryAction: "Find the First Symbol",
    image: '/images/zone-art-symbol-mountain.webp',
    featuresBg: 'rgba(244, 196, 48, 0.15)',
    accentColor: '#F4C430',
    titleColor: '#6B4D00',
    shadowColor: 'rgba(244, 196, 48, 0.32)',
    activities: [
      { icon: '🔍', title: 'Search for 8 hidden symbols.' },
      { icon: '✅', title: 'Place each one correctly.' },
      { icon: '✨', title: 'Wake Ganesha to life.' }
    ]
  },
  'cave-of-secrets': {
    tagline: "Be a Word Detective",
    primaryAction: "Solve the First Word",
    image: '/images/zone-art-cave.webp',
    featuresBg: 'rgba(200, 90, 46, 0.12)',
    accentColor: '#C85A2E',
    titleColor: '#7A2E0A',
    shadowColor: 'rgba(200, 90, 46, 0.30)',
    activities: [
      { icon: '🧱', title: 'Build each hidden word.' },
      { icon: '🧩', title: 'Solve the cave challenges.' },
      { icon: '💡', title: 'Discover what it means.' }
    ]
  },
  'shloka-river': {
    tagline: "See What Your Voice Can Do",
    primaryAction: "Try the First Word",
    image: '/images/zone-art-shloka-river.webp',
    featuresBg: 'rgba(74, 155, 135, 0.12)',
    accentColor: '#4A9B87',
    titleColor: '#1A5E50',
    shadowColor: 'rgba(74, 155, 135, 0.30)',
    activities: [
      { icon: '🎧', title: 'Hear each Sanskrit word.' },
      { icon: '🎙️', title: 'Say it and watch things happen.' },
      { icon: '⭐', title: 'Chant the full shloka.' }
    ]
  },
  'festival-square': {
    tagline: "Celebrate Ganesh Chaturthi Your Way",
    primaryAction: "Start the Celebration",
    image: '/images/zone-art-festival.webp',
    featuresBg: 'rgba(230, 126, 34, 0.12)',
    accentColor: '#E67E22',
    titleColor: '#7A3A00',
    shadowColor: 'rgba(230, 126, 34, 0.30)',
    activities: [
      { icon: '🎹', title: 'Play music for the celebration.' },
      { icon: '🎨', title: 'Design your own rangoli.' },
      { icon: '🍬', title: 'Make sweet modaks.' }
    ]
  },
  'about-me-hut': {
    tagline: "Create Your Place in Ganesha's World",
    primaryAction: "Step Inside",
    image: '/images/zone-art-hut.webp',
    featuresBg: 'rgba(216, 149, 102, 0.15)',
    accentColor: '#D89566',
    titleColor: '#6B3A0A',
    shadowColor: 'rgba(216, 149, 102, 0.32)',
    activities: [
      { icon: '🐘', title: 'Meet Ganesha.' },
      { icon: '🤗', title: 'Tell him about you.' },
      { icon: '🌟', title: 'Share your biggest dream.' }
    ]
  }
};

const ZonePreviewModal = ({ zone, onClose, onStartZone }) => {
  const [closing, setClosing] = useState(false);
  const [opening, setOpening] = useState(false);

  if (!zone) return null;

  const content = zoneContent[zone.id] || zoneContent['symbol-mountain'];

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 600);
  };

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
        style={{
          '--zone-modal-accent': content.accentColor,
          '--zone-modal-title': content.titleColor,
          '--zone-modal-shadow': content.shadowColor,
        }}
      >
        <CloseButton onClose={handleClose} />

        <GaneshaCharacter
          className="portal-mascot portal-ganesha"
          expression="happy"
          size={220}
          aria-label="Ganesha"
        />

        <h2 className="portal-title">{zone.name}</h2>
        <p className="portal-subtitle">{content.tagline}</p>

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

        <div className="portal-actions">
          <ProfilePillBtn
            label={content.primaryAction}
            onClick={handlePlay}
            size="md"
            fullWidth={false}
            className="portal-primary-pill-btn"
            style={getProfilePillBtnStyle(zone.id)}
          />
        </div>
      </div>
    </div>
  );
};

export default ZonePreviewModal;
