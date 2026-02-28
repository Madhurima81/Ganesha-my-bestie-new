import React, { useState, useEffect, useRef } from 'react';
import './AppSidebar.css';
import SanskritVoiceRecorder from '../../../lib/components/audio/SanskritVoiceRecorder.jsx';
import { getZoneTheme } from '../../../lib/config/ZoneThemes';
import { applyRecorderTheme } from '../../../lib/theme/RecorderThemeAdapter';


import appVakratundaGray from '../scenes/assets/images/apps/app-gray-vakratunda.png';
import appVakratunda from '../scenes/assets/images/apps/app-Vakratunda.png';
import appMahakayaGray from '../scenes/assets/images/apps/app-gray-mahakaya.png';
import appMahakaya from '../scenes/assets/images/apps/app-mahakaya.png';
import appKurumedevaGray from '../scenes/assets/images/apps/app-gray-kurumedeva.png';
import appKurumedeva from '../scenes/assets/images/apps/app-kurumedeva.png';
import appNirvighnamGray from '../scenes/assets/images/apps/app-gray-nirvighnam.png';
import appNirvighnam from '../scenes/assets/images/apps/app-nirvighnam.png';
import appSamaprabhaGray from '../scenes/assets/images/apps/app-gray-samaprabha.png';
import appSamaprabha from '../scenes/assets/images/apps/app-samaprabha.png';
import appSarvadaGray from '../scenes/assets/images/apps/app-gray-sarvada.png';
import appSarvada from '../scenes/assets/images/apps/app-sarvada.png';
import appSarvakaryeshuGray from '../scenes/assets/images/apps/app-gray-sarvakaryeshu.png';
import appSarvakaryeshu from '../scenes/assets/images/apps/app-sarvakaryeshu.png';
import appSuryakotiGray from '../scenes/assets/images/apps/app-gray-suryakoti.png';
import appSuryakoti from '../scenes/assets/images/apps/app-suryakoti.png';

// App information for popups (like symbolInfo in SymbolSidebar)
const appInfo = {
  vakratunda: {
    title: "Vakratunda - Curved Trunk",
    description: "The remover of obstacles with his curved trunk, guiding us through life's challenges. Practice the sacred sounds: VA-KRA-TUN-DA",
    colorIcon: appVakratunda,
    grayIcon: appVakratundaGray,
    syllables: ['VA', 'KRA', 'TUN', 'DA'],
    power: { name: 'Flexibility', icon: '🌟', color: '#FFD700' }
  },
  mahakaya: {
    title: "Mahakaya - Great Body",
    description: "The great cosmic form that contains the entire universe within. Practice the sacred sounds: MA-HA-KA-YA",
    colorIcon: appMahakaya,
    grayIcon: appMahakayaGray,
    syllables: ['MA', 'HA', 'KA', 'YA'],
    power: { name: 'Inner Strength', icon: '💪', color: '#FF6B35' }
  },
  kurumedeva: {
    title: "Kurumedeva - Divine Protector",
    description: "The divine protector who grants wisdom and removes fear. Practice the sacred sounds: KU-RU-ME-DEVA",
    colorIcon: appKurumedeva,
    grayIcon: appKurumedevaGray,
    syllables: ['KU', 'RU', 'ME', 'DEVA'],
    power: { name: 'Protection', icon: '🛡️', color: '#4CAF50' }
  },
  nirvighnam: {
    title: "Nirvighnam - Without Obstacles",
    description: "The one who ensures smooth completion of all endeavors. Practice the sacred sounds: NIR-VIGH-NAM",
    colorIcon: appNirvighnam,
    grayIcon: appNirvighnamGray,
    syllables: ['NIR', 'VIGH', 'NAM'],
    power: { name: 'Clear Path', icon: '🌈', color: '#9C27B0' }
  },
  samaprabha: {
    title: "Samaprabha - Equal Radiance",
    description: "The equally radiant one who brings balance and harmony. Practice the sacred sounds: SA-MA-PRA-BHA",
    colorIcon: appSamaprabha,
    grayIcon: appSamaprabhaGray,
    syllables: ['SA', 'MA', 'PRA', 'BHA'],
    power: { name: 'Balance', icon: '⚖️', color: '#2196F3' }
  },
  sarvada: {
    title: "Sarvada - Always Giving",
    description: "The eternal giver who blesses devotees with abundance. Practice the sacred sounds: SAR-VA-DA",
    colorIcon: appSarvada,
    grayIcon: appSarvadaGray,
    syllables: ['SAR', 'VA', 'DA'],
    power: { name: 'Generosity', icon: '🎁', color: '#FF9800' }
  },
  sarvakaryeshu: {
    title: "Sarvakaryeshu - In All Tasks",
    description: "The one who ensures success in all undertaken tasks. Practice the sacred sounds: SAR-VA-KAR-YE-SHU",
    colorIcon: appSarvakaryeshu,
    grayIcon: appSarvakaryeshuGray,
    syllables: ['SAR', 'VA', 'KAR', 'YE', 'SHU'],
    power: { name: 'Success', icon: '🏆', color: '#795548' }
  },
  suryakoti: {
    title: "Suryakoti - Million Suns",
    description: "The brilliant one whose radiance equals a million suns. Practice the sacred sounds: SUR-YA-KO-TI",
    colorIcon: appSuryakoti,
    grayIcon: appSuryakotiGray,
    syllables: ['SUR', 'YA', 'KO', 'TI'],
    power: { name: 'Brilliance', icon: '☀️', color: '#FFC107' }
  }
};

const AppSidebar = ({
  unlockedApps = {},
  onAppClick,
  className = '',
  savedRecordings = {},
  onSaveRecording,
  onPopupOpen,
  onPopupClose,
  zoneId = 'shloka-river',
  // Center mode props (like SymbolSidebar centerMode)
  centerMode = false,
  highlightApps = [],
  onCelebrate
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [animatingApp, setAnimatingApp] = useState(null);
  const [tappedApps, setTappedApps] = useState({});
  const prevUnlockedRef = useRef({});
  const theme = getZoneTheme(zoneId);
  const zoneThemeVars = {
    '--zone-accent-color': theme.accentColor,
    '--zone-glow-color': theme.glowColor
  };

  // App order for display (matching scene progression)
  const appOrder = ['vakratunda', 'mahakaya', 'suryakoti', 'samaprabha', 'nirvighnam', 'kurumedeva','sarvakaryeshu', 'sarvada'];

  // In centerMode, only show unlocked apps
  const displayApps = centerMode
    ? appOrder.filter(id => unlockedApps[id])
    : appOrder;

  const handleAppClick = (appId) => {
    if (centerMode || unlockedApps[appId]) {
      applyRecorderTheme(zoneId);
      setTappedApps(prev => ({ ...prev, [appId]: true }));
      setSelectedApp(appId);
      setShowPopup(true);
      onPopupOpen?.();
      if (onAppClick) {
        onAppClick(appId);
      }
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedApp(null);
    onPopupClose?.();
  };

  // Trigger animation when an app is newly unlocked
  useEffect(() => {
    const prevUnlocked = prevUnlockedRef.current || {};
    const newlyUnlocked = appOrder.find(app =>
      unlockedApps[app] && !prevUnlocked[app]
    );

    if (newlyUnlocked && !animatingApp) {
      setAnimatingApp(newlyUnlocked);
      setTimeout(() => {
        setAnimatingApp(null);
      }, 1000);
    }

    prevUnlockedRef.current = { ...unlockedApps };
  }, [unlockedApps, animatingApp]);

  // CENTER MODE (App Discovery Screen)
  if (centerMode) {
    return (
      <>
        <div className="app-discovery-overlay">
          <div className="app-discovery-panel" style={zoneThemeVars}>
            <h2 className="app-discovery-title">You Learned 2 Sacred Words!</h2>
            <p className="app-discovery-subtitle">Tap each word to practice chanting it!</p>

            <div className="app-discovery-grid">
              {displayApps.map((appId, index) => {
                const app = appInfo[appId];
                const isHighlighted = highlightApps.includes(appId);
                const hasTapped = tappedApps[appId];
                return (
                  <div
                    key={appId}
                    className={`app-discovery-icon ${isHighlighted ? 'app-discovery-pulse' : ''}`}
                    onClick={() => handleAppClick(appId)}
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    <img
                      src={app.colorIcon}
                      alt={app.title}
                      className="app-discovery-img"
                    />
                    <div className={`tap-indicator ${hasTapped ? 'tap-indicator-done' : ''}`}>
                      {hasTapped ? 'Done' : 'TAP!'}
                    </div>
                    <p className="app-discovery-name">
                      {appId.charAt(0).toUpperCase() + appId.slice(1)}
                    </p>
                  </div>
                );
              })}
            </div>

            <button
              className="app-discovery-celebrate-btn"
              onClick={onCelebrate}
            >
              Celebrate!
            </button>
          </div>
        </div>

        {/* Recorder popup in center mode */}
        {showPopup && selectedApp && (
          <SanskritVoiceRecorder
            word={selectedApp}
            syllables={appInfo[selectedApp].syllables}
            appIcon={appInfo[selectedApp].colorIcon}
            appColor={appInfo[selectedApp].power.color}
            savedRecordings={savedRecordings}
            onSaveRecording={onSaveRecording}
            allowSkip={false}
            title="Practice Chanting"
            prompt={`Try saying ${selectedApp.toUpperCase()}`}
            onComplete={closePopup}
          />
        )}
      </>
    );
  }

  // SIDE RAIL MODE (default)
  return (
    <>
      <div className={`app-sidebar ${className}`} style={zoneThemeVars}>
        {appOrder.map((appId) => {
          const app = appInfo[appId];
          const isUnlocked = unlockedApps[appId];
          const isAnimating = animatingApp === appId;
          const needsTap = isUnlocked && !tappedApps[appId];

          return (
            <div
              key={appId}
              className={`app-icon ${isUnlocked ? 'unlocked' : 'locked'} ${isAnimating ? 'star-burst' : ''}`}
              onClick={() => handleAppClick(appId)}
              style={{
                backgroundImage: `url(${isUnlocked ? app.colorIcon : app.grayIcon})`,
                cursor: isUnlocked ? 'pointer' : 'not-allowed'
              }}
              title={isUnlocked ? app.title : 'App not yet unlocked'}
            >
              {needsTap && (
                <div className="tap-indicator">TAP!</div>
              )}
            </div>
          );
        })}
      </div>

      {/* App Information Popup with Voice Recorder */}
      {showPopup && selectedApp && (
        <SanskritVoiceRecorder
          word={selectedApp}
          syllables={appInfo[selectedApp].syllables}
          appIcon={appInfo[selectedApp].colorIcon}
          appColor={appInfo[selectedApp].power.color}
          savedRecordings={savedRecordings}
          onSaveRecording={onSaveRecording}
          allowSkip={false}
          title="Practice Chanting"
          prompt={`Try saying ${selectedApp.toUpperCase()}`}
          onComplete={closePopup}
        />
      )}
    </>
  );
};

export default AppSidebar;
