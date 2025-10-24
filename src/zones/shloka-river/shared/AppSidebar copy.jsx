import React, { useState, useEffect } from 'react';
import './AppSidebar.css';

// Import gray and colored app icons
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

const AppSidebar = ({ unlockedApps = {}, onAppClick, className = '' }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [animatingApp, setAnimatingApp] = useState(null);

  // App order for display (matching scene progression)
  const appOrder = ['vakratunda', 'mahakaya', 'suryakoti', 'samaprabha', 'nirvighnam', 'kurumedeva','sarvakaryeshu', 'sarvada'];

const handleAppClick = (appId) => {
  if (unlockedApps[appId]) {
    setSelectedApp(appId);
    setShowPopup(true);
    // Remove onAppClick to prevent second popup
  }
};

// Add these new functions (replace the placeholder ones):
const handleSyllableClick = (syllable, appId) => {
  console.log(`Playing syllable: ${syllable} for app: ${appId}`);
  
  // Use the same audio logic as VakratundaGrove
  const syllableFileMap = {
    'VA': 'vakratunda-va',
    'KRA': 'vakratunda-kra', 
    'TUN': 'vakratunda-tun',
    'DA': 'vakratunda-da',
    'MA': 'mahakaya-ma',
    'HA': 'mahakaya-ha',
    'KA': 'mahakaya-ka',
    'YA': 'mahakaya-ya',
    'SUR': 'suryakoti-sur',
    'YA': 'suryakoti-ya',
    'KO': 'suryakoti-ko',
    'TI': 'suryakoti-ti',
    'SA': 'samaprabha-sa',
    'MA': 'samaprabha-ma',
    'PRA': 'samaprabha-pra',
    'BHA': 'samaprabha-bha',
    'NIR': 'nirvighnam-nir',
    'VIGH': 'nirvighnam-vigh',
    'NAM': 'nirvighnam-nam',
    'KU': 'kurumedeva-ku',
    'RU': 'kurumedeva-ru',
    'ME': 'kurumedeva-me',
    'DEVA': 'kurumedeva-deva',
    'SAR': 'sarvada-sar',
    'VA': 'sarvada-va',
    'DA': 'sarvada-da',
    'KAR': 'sarvakaryeshu-kar',
    'YE': 'sarvakaryeshu-ye',
    'SHU': 'sarvakaryeshu-shu'
  };
  
  const fileName = syllableFileMap[syllable] || `${appId}-${syllable.toLowerCase()}`;
  playAudio(`/audio/syllables/${fileName}.mp3`);
};

const handleWordPlay = (appId) => {
  console.log(`Playing word: ${appId}`);
  playAudio(`/audio/words/${appId}.mp3`);
};

// Add the playAudio function (copy from VakratundaGrove):
const playAudio = (audioPath, volume = 1.0) => {
  try {
    const audio = new Audio(audioPath);
    audio.volume = volume;
    return audio.play().catch(e => {
      console.log(`Audio not found: ${audioPath}`);
      return Promise.resolve();
    });
  } catch (error) {
    console.log(`Audio error: ${error.message}`);
    return Promise.resolve();
  }
};

  const closePopup = () => {
    setShowPopup(false);
    setSelectedApp(null);
  };

  // Trigger animation when an app is newly unlocked
  useEffect(() => {
    const newlyUnlocked = appOrder.find(app => 
      unlockedApps[app] && !animatingApp
    );
    
    if (newlyUnlocked) {
      setAnimatingApp(newlyUnlocked);
      setTimeout(() => {
        setAnimatingApp(null);
      }, 1000);
    }
  }, [unlockedApps, animatingApp]);

  return (
    <>
      <div className={`app-sidebar ${className}`}>
        {appOrder.map((appId) => {
          const app = appInfo[appId];
          const isUnlocked = unlockedApps[appId];
          const isAnimating = animatingApp === appId;
          
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
            />
          );
        })}
      </div>

      {/* App Information Popup (like SymbolSidebar popup) */}
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
            
{/* Syllable Practice Buttons */}
<div className="syllable-practice">
  {appInfo[selectedApp].syllables.map(syllable => (
    <button 
      key={syllable} 
      className="syllable-btn"
      onClick={() => handleSyllableClick(syllable, selectedApp)}
    >
      {syllable}
    </button>
  ))}
</div>

{/* Add Word Practice Button */}
<button 
  className="word-practice-btn"
  onClick={() => handleWordPlay(selectedApp)}
>
  🎵 {selectedApp.toUpperCase()}
</button>
            
       <button className="popup-continue-btn" onClick={closePopup}>
  Close
</button>
          </div>
        </div>
      )}


    </>
  );
};

export default AppSidebar;