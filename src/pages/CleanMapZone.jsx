// CleanMapZone.jsx - Clean map with zone states (locked/active/in-progress/completed)
import React, { useState, useEffect } from 'react';
import './CleanMapZone.css';
import GameStateManager from '../lib/services/GameStateManager';
import ZonePreviewModal from './components/ZonePreviewModal';

const ZONES_DATA = [
  {
    id: 'symbol-mountain',
    name: 'Symbol\nMountain',
    sequence: 1,
    unlockRequires: null,
    unlockNote: null, // always unlocked first
    scenes: [
      { id: 'scene1', name: 'Introduction' },
      { id: 'scene2', name: 'Symbol Quiz' },
      { id: 'scene3', name: 'Matching Game' },
      { id: 'scene4', name: 'Final Challenge' }
    ]
  },
  {
    id: 'cave-of-secrets',
    name: 'Cave of Secrets',
    sequence: 1,
    unlockRequires: null,
    unlockNote: null,
    scenes: [
      { id: 'scene1', name: 'Word Learning' },
      { id: 'scene2', name: 'Practice' },
      { id: 'scene3', name: 'Memory Game' },
      { id: 'scene4', name: 'Quiz' }
    ]
  },
  {
    id: 'shloka-river',
    name: 'Shloka\nRiver',
    sequence: 1,                               // always active like Symbol Mountain
    unlockRequires: null,
    unlockNote: null,
    scenes: [
      { id: 'shloka-river-intro', name: 'Introduction' },
      { id: 'shloka-river-learn', name: 'Learn Shloka' },
      { id: 'shloka-river-practice', name: 'Practice' },
      { id: 'shloka-river-finale', name: 'Final Performance' }
    ]
  },
  {
    id: 'festival-square',
    name: 'Festival\nSquare',
    sequence: 1,
    unlockRequires: null,
    unlockNote: null,
    scenes: [
      { id: 'piano', name: 'Piano Game' },
      { id: 'rangoli', name: 'Rangoli Art' },
      { id: 'modak', name: 'Modak Cooking' },
      { id: 'mandap', name: 'Mandap Decoration' }
    ]
  },
  {
    id: 'about-me-hut',
    name: 'About Me Hut',
    sequence: 1,                               // always accessible
    unlockRequires: null,
    unlockNote: null,
    scenes: [
      { id: 'game1', name: 'Family Tree' },
      { id: 'game2', name: 'Profile' },
      { id: 'game3', name: 'Avatar' }
    ]
  }
];

// Zone layout config: tap area + label position classes
const ZONE_LAYOUT = {
  'symbol-mountain': {
    wrapperClass: 'zone-wrapper shloka-mountain-wrapper',
    zoneClass:    'zone shloka-mountain',
    labelClass:   'label shloka-mountain-label',
  },
  'cave-of-secrets': {
    wrapperClass: 'zone-wrapper cave-secrets-wrapper',
    zoneClass:    'zone cave-secrets',
    labelClass:   'label cave-label',
  },
  'shloka-river': {
    wrapperClass: 'zone-wrapper shloka-river-wrapper',
    zoneClass:    'zone shloka-river',
    labelClass:   'label river-label',
  },
  'festival-square': {
    wrapperClass: 'zone-wrapper festival-square-wrapper',
    zoneClass:    'zone festival-square',
    labelClass:   'label festival-label',
  },
  'about-me-hut': {
    wrapperClass: 'zone-wrapper about-hut-wrapper',
    zoneClass:    'zone about-hut',
    labelClass:   'label hut-label',
  },
};

// Resolve avatar string/emoji → animal id for image path
const getAnimalId = (avatar) => {
  if (!avatar) return null;
  const KNOWN = ['monkey', 'peacock', 'squirrel', 'tiger'];
  if (KNOWN.includes(avatar)) return avatar;
  const emojiMap = { '🐵': 'monkey', '🦚': 'peacock', '🐿️': 'squirrel', '🐯': 'tiger' };
  return emojiMap[avatar] || null;
};

// Derive state for a zone given its progress and unlock requirements
const getZoneState = (zoneId, allProgress) => {
  const zoneDef = ZONES_DATA.find(z => z.id === zoneId);
  if (!zoneDef) return 'active';

  // Check if zone is locked by a prerequisite
  if (zoneDef.unlockRequires) {
    const reqZone = ZONES_DATA.find(z => z.id === zoneDef.unlockRequires);
    if (reqZone) {
      const reqP = allProgress[reqZone.id];
      const reqCompleted = reqP?.completedScenes || 0;
      if (reqCompleted < reqZone.scenes.length) return 'locked';
    }
  }

  const p = allProgress[zoneId];
  if (!p) return 'active'; // no progress data yet → treat as active (unlocked but not started)

  const { completedScenes, totalScenes } = p;
  if (completedScenes >= totalScenes && totalScenes > 0) return 'completed';
  if (completedScenes > 0) return 'in-progress';
  return 'active';
};

const CleanMapZone = ({ onZoneSelect, onBackToWelcome, onGoToProfiles }) => {
  const [zoneProgress, setZoneProgress] = useState({});
  const [selectedZone, setSelectedZone] = useState(null);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [activeProfile, setActiveProfile] = useState(null);

  useEffect(() => {
    const profile = GameStateManager.getActiveProfile();
    setActiveProfile(profile);
  }, []);

  useEffect(() => {
    loadBasicProgress();
  }, []);

  const loadBasicProgress = () => {
    try {
      const progressData = {};
      ZONES_DATA.forEach(zone => {
        let completedScenes = 0;
        let totalStars = 0;
        zone.scenes.forEach(scene => {
          const progress = GameStateManager.getSceneProgress(zone.id, scene.id);
          if (progress?.completed) {
            completedScenes++;
            totalStars += progress.stars || 0;
          }
        });
        progressData[zone.id] = {
          completedScenes,
          totalScenes: zone.scenes.length,
          stars: totalStars,
          percentage: Math.round((completedScenes / zone.scenes.length) * 100)
        };
      });
      setZoneProgress(progressData);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const handleZoneClick = (zone, state) => {
    if (state === 'locked') return;
    setSelectedZone(zone);
    setShowZoneModal(true);
  };

  const handleStartZone = (zone) => {
    if (onZoneSelect) onZoneSelect(zone.id);
  };

  return (
    <div className="map-container morning">

      {/* Background image */}
      <img
        src="/images/map-background.svg"
        alt="Map"
        className="map-bg-img"
      />

      {/* Drifting clouds — CSS shapes, no image needed */}
      <div className="map-cloud map-cloud-1" aria-hidden="true" />
      <div className="map-cloud map-cloud-2" aria-hidden="true" />
      <div className="map-cloud map-cloud-3" aria-hidden="true" />

      {/* Atmospheric overlay */}
      <div className="map-bg-overlay" aria-hidden="true" />
      {/* Cinematic vignette */}
      <div className="map-vignette" aria-hidden="true" />
      {/* Floating dust particles */}
      <div className="map-dust" aria-hidden="true">
        <span/><span/><span/><span/>
      </div>

      {/* ── Zone Wrappers (tap area + label grouped by state) ── */}
      {ZONES_DATA.map(zone => {
        const layout = ZONE_LAYOUT[zone.id];
        if (!layout) return null;
        const state = getZoneState(zone.id, zoneProgress);
        const isLocked = state === 'locked';

        return (
          <React.Fragment key={zone.id}>
            {/* Tap area */}
            <div
              className={`${layout.zoneClass} zone-state-${state}`}
              onClick={() => handleZoneClick(zone, state)}
              aria-disabled={isLocked}
            >
              {/* In-progress pulse ring */}
              {state === 'in-progress' && <div className="zone-pulse-ring" aria-hidden="true" />}
              {/* Completed gold outline + check badge */}
              {state === 'completed' && <div className="zone-completed-ring" aria-hidden="true" />}
              {state === 'completed' && <div className="zone-check-badge" aria-hidden="true">✓</div>}
            </div>

            {/* Label */}
            <div className={`${layout.labelClass} label-state-${state}`}>
              {zone.name.split('\n').map((line, i) => (
                <span key={i}>{line}{i < zone.name.split('\n').length - 1 && <br/>}</span>
              ))}
              {isLocked && zone.unlockNote && (
                <div className="unlock-note">{zone.unlockNote}</div>
              )}
            </div>
          </React.Fragment>
        );
      })}

      {/* Back Button */}
      <button className="map-back-button" onClick={onBackToWelcome}>
        ← Back
      </button>

      {/* Profile chip — top right */}
      {activeProfile && (() => {
        const animalId = getAnimalId(activeProfile.avatar);
        return (
          <button className="map-profile-chip" onClick={onGoToProfiles || onBackToWelcome} title="Switch Explorer">
            <span className="map-profile-avatar">
              {animalId ? (
                <img
                  src={`/images/new-explorer-${animalId}.png`}
                  alt={activeProfile.name}
                  className="map-profile-avatar-img"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                activeProfile.avatar || '🧒'
              )}
            </span>
            <span className="map-profile-name">{activeProfile.name}</span>
          </button>
        );
      })()}

      {/* Zone Preview Modal */}
      {showZoneModal && selectedZone && (
        <ZonePreviewModal
          zone={selectedZone}
          onClose={() => { setShowZoneModal(false); setSelectedZone(null); }}
          onStartZone={handleStartZone}
          progress={zoneProgress[selectedZone.id]}
        />
      )}
    </div>
  );
};

export default CleanMapZone;
