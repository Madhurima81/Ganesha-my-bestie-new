import React, { useState, useEffect } from 'react';
import './AppSidebar.css';
import SanskritVoiceRecorder from '../../../lib/components/audio/SanskritVoiceRecorder';

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

const AppSidebar = ({ unlockedApps = {}, onAppClick, className = '', savedRecordings = {}, onSaveRecording, onDeleteRecording }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [animatingApp, setAnimatingApp] = useState(null);
  const [animatedApps, setAnimatedApps] = useState(new Set()); // Track which apps have animated
  const [showRecorder, setShowRecorder] = useState(false); // NEW: Control recorder modal

  // App order for display (matching scene progression)
  const appOrder = ['vakratunda', 'mahakaya', 'suryakoti', 'samaprabha', 'nirvighnam', 'kurumedeva','sarvakaryeshu', 'sarvada'];

  const handleAppClick = (appId) => {
    if (unlockedApps[appId]) {
      setSelectedApp(appId);
      setShowPopup(true);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedApp(null);
    setShowRecorder(false); // Close recorder too
  };

  const openRecorder = () => {
    setShowRecorder(true);
  };

  const closeRecorder = () => {
    setShowRecorder(false);
  };

  // Play audio with safe click protection
  const playAudio = (audioPath) => {
    try {
      const audio = new Audio(audioPath);
      audio.volume = 0.8;
      audio.play().catch(e => {
        console.log(`Audio not found: ${audioPath}`);
      });
    } catch (error) {
      console.log(`Audio error: ${error.message}`);
    }
  };

  // Trigger animation when an app is newly unlocked (only once per app)
  useEffect(() => {
    const newlyUnlocked = appOrder.find(app => 
      unlockedApps[app] && !animatedApps.has(app)
    );
    
    if (newlyUnlocked) {
      setAnimatingApp(newlyUnlocked);
      setAnimatedApps(prev => new Set([...prev, newlyUnlocked]));
      
      setTimeout(() => {
        setAnimatingApp(null);
      }, 1000);
    }
  }, [unlockedApps]); // Only depend on unlockedApps, not animatingApp

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

      {/* App Information Popup - Simple Clean Layout (Image 2 Style) */}
      {showPopup && selectedApp && !showRecorder && (
        <div className="app-popup-overlay" onClick={closePopup}>
          <div 
            className="app-popup-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 100%)',
              border: '3px solid #FFD700',
              borderRadius: '20px',
              padding: '30px',
              maxWidth: '450px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}
          >
            <button 
              className="popup-close-btn" 
              onClick={closePopup}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: '#E55934',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '35px',
                height: '35px',
                fontSize: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
            
            {/* App Icon on LEFT side with Title */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '20px',
              gap: '15px'
            }}>
              <img 
                src={appInfo[selectedApp].colorIcon} 
                alt={appInfo[selectedApp].title}
                style={{
                  width: '80px',
                  height: '80px',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                }}
              />
              
              <div style={{ textAlign: 'left', flex: 1 }}>
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: 'bold',
                  color: '#FF6B35',
                  margin: '0 0 5px 0',
                  textTransform: 'uppercase'
                }}>
                  {selectedApp} - {appInfo[selectedApp].power.name}
                </h2>
                
                <p style={{
                  fontSize: '16px',
                  color: '#8B4513',
                  margin: '0',
                  fontWeight: '500'
                }}>
                  Practice saying {selectedApp.toUpperCase()}
                </p>
              </div>
            </div>
            
            {/* Syllable Buttons - Single Row, No Box */}
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '15px'
            }}>
              {appInfo[selectedApp].syllables.map((syllable, index) => (
                <button
                  key={index}
                  onClick={() => playAudio(`/audio/syllables/${selectedApp.toLowerCase()}-${syllable.toLowerCase()}.mp3`)}
                  style={{
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 18px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.2)'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                  {syllable}
                </button>
              ))}
            </div>
            
            {/* Hear Complete Word Button */}
            <button
              onClick={() => playAudio(`/audio/words/${selectedApp.toLowerCase()}.mp3`)}
              style={{
                background: '#FFD700',
                color: '#8B4513',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 25px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                marginBottom: '15px',
                display: 'inline-block'
              }}
              onMouseOver={(e) => e.target.style.background = '#FFC107'}
              onMouseOut={(e) => e.target.style.background = '#FFD700'}
            >
              🎵 {selectedApp.toUpperCase()}
            </button>
            
            {/* Start Recording Button */}
            <button
              onClick={openRecorder}
              style={{
                background: '#FF6B35',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 25px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                marginLeft: '10px',
                display: 'inline-block'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              🎤 Start Recording
            </button>
            
            {/* Show Saved Recordings Count */}
            {savedRecordings[selectedApp]?.length > 0 && (
              <p style={{
                fontSize: '13px',
                color: '#4CAF50',
                fontWeight: 'bold',
                margin: '15px 0 0 0',
                textAlign: 'center'
              }}>
                ✅ You have {savedRecordings[selectedApp].length} saved recording{savedRecordings[selectedApp].length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Voice Recorder Modal - Opens when "Start Recording" clicked */}
      {showRecorder && selectedApp && (
        <SanskritVoiceRecorder 
          word={selectedApp}
          syllables={appInfo[selectedApp].syllables}
          appIcon={appInfo[selectedApp].colorIcon}
          appColor={appInfo[selectedApp].power.color}
          savedRecordings={savedRecordings}
          onSaveRecording={onSaveRecording}
          onDeleteRecording={onDeleteRecording}
          allowSkip={true}
          title="Practice Chanting"
          prompt={`Try saying ${selectedApp.toUpperCase()}`}
          onComplete={closeRecorder}
          onSkip={closeRecorder}
        />
      )}
    </>
  );
};

export default AppSidebar;