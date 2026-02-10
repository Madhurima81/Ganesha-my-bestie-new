import React, { useState, useEffect, useRef } from 'react';
import './AppSidebar.css';
import SanskritVoiceRecorder from '../../../lib/components/audio/SanskritVoiceRecorder.jsx';


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

const AppSidebar = ({ unlockedApps = {}, onAppClick, className = '', savedRecordings = {}, onSaveRecording, onPopupOpen, onPopupClose }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [animatingApp, setAnimatingApp] = useState(null);
  const [tappedApps, setTappedApps] = useState({});
  const prevUnlockedRef = useRef({});

  // App order for display (matching scene progression)
  const appOrder = ['vakratunda', 'mahakaya', 'suryakoti', 'samaprabha', 'nirvighnam', 'kurumedeva','sarvakaryeshu', 'sarvada'];

  const handleAppClick = (appId) => {
    if (unlockedApps[appId]) {
      setTappedApps(prev => ({ ...prev, [appId]: true }));
      setSelectedApp(appId);
      setShowPopup(true);
      onPopupOpen?.(); // Tell parent to pause game/voice
      if (onAppClick) {
        onAppClick(appId);
      }
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedApp(null);
    onPopupClose?.(); // Tell parent to resume game/voice
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

  return (
    <>
      <div className={`app-sidebar ${className}`}>
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
        <div className="app-popup-overlay" onClick={closePopup}>
          <div className="app-popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close-btn" onClick={closePopup}>×</button>
            
            <div className="popup-app-icon">
              <img 
                src={appInfo[selectedApp].colorIcon} 
                alt={appInfo[selectedApp].title}
                className="popup-app-image"
              />
            </div>
            
            <h2 className="popup-title">{appInfo[selectedApp].title}</h2>
            <p className="popup-description">{appInfo[selectedApp].description}</p>
            
            {/* Voice Recorder Component - replaces old syllable practice buttons */}
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
          </div>
        </div>
      )}
    </>
  );
};

export default AppSidebar;
