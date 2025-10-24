import React, { useState, useEffect } from 'react';

// Import gray and colored app icons
import appVakratundaGray from '../../assets/images/apps/app-gray-vakratunda.png';
import appVakratunda from '../../assets/images/apps/app-Vakratunda.png';
import appMahakayaGray from '../../assets/images/apps/app-gray-mahakaya.png';
import appMahakaya from '../../assets/images/apps/app-mahakaya.png';
import appKurumedevaGray from '../../assets/images/apps/app-gray-kurumedeva.png';
import appKurumedeva from '../../assets/images/apps/app-kurumedeva.png';
import appNirvighnamGray from '../../assets/images/apps/app-gray-nirvighnam.png';
import appNirvighnam from '../../assets/images/apps/app-nirvighnam.png';
import appSamaprabhaGray from '../../assets/images/apps/app-gray-samaprabha.png';
import appSamaprabha from '../../assets/images/apps/app-samaprabha.png';
import appSarvadaGray from '../../assets/images/apps/app-gray-sarvada.png';
import appSarvada from '../../assets/images/apps/app-sarvada.png';
import appSarvakaryeshuGray from '../../assets/images/apps/app-gray-sarvakaryeshu.png';
import appSarvakaryeshu from '../../assets/images/apps/app-sarvakaryeshu.png';
import appSuryakotiGray from '../../assets/images/apps/app-gray-suryakoti.png';
import appSuryakoti from '../../assets/images/apps/app-suryakoti.png';
import smartwatchScreen from '../../assets/images/smartwatch-screen.png';

// Add responsive scaling hook
const useResponsiveScaling = () => {
  const [metrics, setMetrics] = useState({
    scaleFactor: 1,
    breakpoint: 'mobile'
  });

  useEffect(() => {
    const updateMetrics = () => {
      const width = window.innerWidth;
      const MOBILE_REFERENCE = { width: 390 };
      const baseScale = Math.min(width / MOBILE_REFERENCE.width, window.innerHeight / 844);
      const scaleFactor = Math.max(0.7, Math.min(4.0, baseScale));
      
      let breakpoint = 'mobile';
      if (width >= 768) breakpoint = 'tablet';
      if (width >= 1024) breakpoint = 'desktop';
      
      setMetrics({ scaleFactor, breakpoint });
    };

    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, []);

  return metrics;
};

// App configuration similar to symbolInfo in SymbolSidebar
const appInfo = {
  vakratunda: {
    name: "Vakratunda - Curved Trunk",
    description: "The remover of obstacles with his curved trunk, guiding us through life's challenges.",
    colorIcon: appVakratunda,
    grayIcon: appVakratundaGray,
    syllables: ['VA', 'KRA', 'TUN', 'DA'],
    power: { name: 'Flexibility', icon: '🌟', color: '#FFD700' }
  },
  mahakaya: {
    name: "Mahakaya - Great Body",
    description: "The great cosmic form that contains the entire universe within.",
    colorIcon: appMahakaya,
    grayIcon: appMahakayaGray,
    syllables: ['MA', 'HA', 'KA', 'YA'],
    power: { name: 'Inner Strength', icon: '💪', color: '#FF6B35' }
  },
  kurumedeva: {
    name: "Kurumedeva - Divine Protector",
    description: "The divine protector who grants wisdom and removes fear.",
    colorIcon: appKurumedeva,
    grayIcon: appKurumedevaGray,
    syllables: ['KU', 'RU', 'ME', 'DEVA'],
    power: { name: 'Protection', icon: '🛡️', color: '#4CAF50' }
  },
  nirvighnam: {
    name: "Nirvighnam - Without Obstacles",
    description: "The one who ensures smooth completion of all endeavors.",
    colorIcon: appNirvighnam,
    grayIcon: appNirvighnamGray,
    syllables: ['NIR', 'VIGH', 'NAM'],
    power: { name: 'Clear Path', icon: '🌈', color: '#9C27B0' }
  },
  samaprabha: {
    name: "Samaprabha - Equal Radiance",
    description: "The equally radiant one who brings balance and harmony.",
    colorIcon: appSamaprabha,
    grayIcon: appSamaprabhaGray,
    syllables: ['SA', 'MA', 'PRA', 'BHA'],
    power: { name: 'Balance', icon: '⚖️', color: '#2196F3' }
  },
  sarvada: {
    name: "Sarvada - Always Giving",
    description: "The eternal giver who blesses devotees with abundance.",
    colorIcon: appSarvada,
    grayIcon: appSarvadaGray,
    syllables: ['SAR', 'VA', 'DA'],
    power: { name: 'Generosity', icon: '🎁', color: '#FF9800' }
  },
  sarvakaryeshu: {
    name: "Sarvakaryeshu - In All Tasks",
    description: "The one who ensures success in all undertaken tasks.",
    colorIcon: appSarvakaryeshu,
    grayIcon: appSarvakaryeshuGray,
    syllables: ['SAR', 'VA', 'KAR', 'YE', 'SHU'],
    power: { name: 'Success', icon: '🏆', color: '#795548' }
  },
  suryakoti: {
    name: "Suryakoti - Million Suns",
    description: "The brilliant one whose radiance equals a million suns.",
    colorIcon: appSuryakoti,
    grayIcon: appSuryakotiGray,
    syllables: ['SUR', 'YA', 'KO', 'TI'],
    power: { name: 'Brilliance', icon: '☀️', color: '#FFC107' }
  }
};

const SmartwatchWidget = ({ 
  unlockedApps = {},     // Like discoveredSymbols - parent controls this
  onAppClick,            // Like onSymbolClick - parent handles interaction
  position = { bottom: '20px', right: '20px' }
}) => {
  const [expanded, setExpanded] = useState(false);
  const [animatingApp, setAnimatingApp] = useState(null);
  
  // Add responsive scaling
  const { scaleFactor, breakpoint } = useResponsiveScaling();
  const uiScale = breakpoint === 'mobile' ? 1 : 
                breakpoint === 'tablet' ? 1.3 : 
                breakpoint === 'desktop' ? 1.6 : 1.8;

  // App order for display (matching scene progression)
  const appOrder = ['vakratunda', 'mahakaya', 'kurumedeva', 'nirvighnam', 'samaprabha', 'sarvada', 'sarvakaryeshu', 'suryakoti'];

  // Get count and latest unlocked app
  const unlockedCount = Object.values(unlockedApps).filter(Boolean).length;
  const latestUnlockedApp = appOrder.find(appId => unlockedApps[appId]);

  // Handle app click - only works for unlocked apps
  const handleAppClick = (appId, event) => {
    event.stopPropagation(); // Prevent triggering expand/collapse
    
    if (unlockedApps[appId]) {
      if (onAppClick) {
        onAppClick({
          id: appId,
          name: appInfo[appId].name,
          ...appInfo[appId]
        });
      }
    }
  };

  // Handle smartwatch tap to expand/collapse
  const handleSmartwatchClick = () => {
    if (unlockedCount > 0) {
      setExpanded(!expanded);
    }
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
      }, 2000);
    }
  }, [unlockedApps, animatingApp]);

  return (
    <div className="smartwatch-widget" style={{
      position: 'fixed',
      ...position,
      zIndex: 1000,
      transition: 'all 0.3s ease'
    }}>
      
      {/* Compact View */}
      {!expanded && (
        <div 
          className="smartwatch-compact"
          onClick={handleSmartwatchClick}
          style={{
            width: `${Math.round(80 * uiScale)}px`,
            height: `${Math.round(80 * uiScale)}px`,
            position: 'relative',
            cursor: unlockedCount > 0 ? 'pointer' : 'default',
            transition: 'transform 0.2s ease'
          }}
        >
          {/* Smartwatch Screen Background */}
          <img 
            src={smartwatchScreen} 
            alt="smartwatch screen" 
            className={`smartwatch-screen ${unlockedCount > 0 ? 'active' : ''}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
          
          {/* Progress Ring */}
          {unlockedCount > 0 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: `${Math.round(60 * uiScale)}px`,
              height: `${Math.round(60 * uiScale)}px`,
              borderRadius: '50%',
              background: `conic-gradient(#4CAF50 ${(unlockedCount/8)*360}deg, rgba(255,255,255,0.3) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Latest Unlocked App */}
              {latestUnlockedApp && (
                <img 
                  src={appInfo[latestUnlockedApp].colorIcon}
                  alt={appInfo[latestUnlockedApp].name}
                  className={animatingApp === latestUnlockedApp ? 'star-burst' : ''}
                  style={{
                    width: `${Math.round(35 * uiScale)}px`,
                    height: `${Math.round(35 * uiScale)}px`,
                    borderRadius: `${Math.round(8 * uiScale)}px`,
                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))'
                  }}
                />
              )}
            </div>
          )}
          
          {/* App Counter */}
          <div style={{
            position: 'absolute',
            top: `${Math.round(-8 * uiScale)}px`,
            right: `${Math.round(-8 * uiScale)}px`,
            background: '#FF6B6B',
            color: 'white',
            borderRadius: '50%',
            width: `${Math.round(24 * uiScale)}px`,
            height: `${Math.round(24 * uiScale)}px`,
            fontSize: `${Math.round(11 * uiScale)}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            border: '2px solid white'
          }}>
            {unlockedCount}
          </div>

          {/* Tap Hint */}
          {unlockedCount > 0 && (
            <div style={{
              position: 'absolute',
              bottom: `${Math.round(-25 * uiScale)}px`,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: `${Math.round(10 * uiScale)}px`,
              color: '#666',
              fontWeight: 'bold',
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}>
              Tap to expand
            </div>
          )}
        </div>
      )}

      {/* Expanded View */}
      {expanded && (
        <div 
          className="smartwatch-expanded"
          style={{
            width: `${Math.round(200 * uiScale)}px`,
            height: `${Math.round(280 * uiScale)}px`,
            background: 'rgba(0, 0, 0, 0.9)',
            borderRadius: `${Math.round(20 * uiScale)}px`,
            padding: `${Math.round(15 * uiScale)}px`,
            border: '3px solid #4CAF50',
            boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
            transform: 'translateX(-60%)',
            animation: 'expandIn 0.3s ease-out'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: `${Math.round(10 * uiScale)}px`,
            color: 'white'
          }}>
            <div style={{
              fontSize: `${Math.round(14 * uiScale)}px`,
              fontWeight: 'bold'
            }}>
              Sanskrit Powers
            </div>
            <button 
              onClick={handleSmartwatchClick}
              style={{
                background: 'none',
                border: 'none',
                color: '#FF6B6B',
                fontSize: `${Math.round(20 * uiScale)}px`,
                cursor: 'pointer',
                padding: 0
              }}
            >
              ×
            </button>
          </div>

          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: `${Math.round(8 * uiScale)}px`,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: `${Math.round(4 * uiScale)}px`,
            marginBottom: `${Math.round(15 * uiScale)}px`,
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(unlockedCount/8)*100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
              transition: 'width 0.5s ease'
            }} />
          </div>

          {/* App Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: `${Math.round(10 * uiScale)}px`,
            height: `${Math.round(200 * uiScale)}px`,
            overflowY: 'auto'
          }}>
            {appOrder.map((appId, index) => {
              const app = appInfo[appId];
              const isUnlocked = unlockedApps[appId];
              const isAnimating = animatingApp === appId;
              
              return (
                <div
                  key={appId}
                  className={`app-card ${isUnlocked ? 'unlocked' : 'locked'} ${isAnimating ? 'star-burst' : ''}`}
                  onClick={(e) => handleAppClick(appId, e)}
                  style={{
                    background: isUnlocked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                    borderRadius: `${Math.round(12 * uiScale)}px`,
                    padding: `${Math.round(8 * uiScale)}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                    border: isUnlocked ? '2px solid rgba(76, 175, 80, 0.5)' : '2px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                    minHeight: `${Math.round(80 * uiScale)}px`
                  }}
                  title={isUnlocked ? app.name : 'App not yet unlocked'}
                >
                  <img 
                    src={isUnlocked ? app.colorIcon : app.grayIcon}
                    alt={isUnlocked ? app.name : 'Locked app'}
                    style={{
                      width: `${Math.round(40 * uiScale)}px`,
                      height: `${Math.round(40 * uiScale)}px`,
                      borderRadius: `${Math.round(8 * uiScale)}px`,
                      filter: isUnlocked 
                        ? 'brightness(1) drop-shadow(0 2px 4px rgba(0,0,0,0.2))' 
                        : 'brightness(0.4) grayscale(1)',
                      opacity: isUnlocked ? 1 : 0.6,
                      marginBottom: `${Math.round(5 * uiScale)}px`
                    }}
                  />
                  <div style={{
                    fontSize: `${Math.round(9 * uiScale)}px`,
                    color: isUnlocked ? 'white' : '#888',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    lineHeight: 1.2
                  }}>
                    {isUnlocked ? app.name.split(' - ')[0] : '???'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            color: '#888',
            fontSize: `${Math.round(10 * uiScale)}px`,
            marginTop: `${Math.round(10 * uiScale)}px`
          }}>
            {unlockedCount}/8 Powers Unlocked
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style jsx>{`
        .smartwatch-compact:hover {
          transform: scale(1.05);
        }
        
        .app-card.unlocked:hover {
          background: rgba(255,255,255,0.2) !important;
          transform: scale(1.02);
        }
        
        .star-burst {
          animation: starBurst 2s ease-out;
        }
        
        .smartwatch-screen.active {
          filter: brightness(1.1) drop-shadow(0 0 15px rgba(76, 175, 80, 0.6));
        }
        
        @keyframes expandIn {
          from {
            transform: translateX(-60%) scale(0.8);
            opacity: 0;
          }
          to {
            transform: translateX(-60%) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes starBurst {
          0% {
            transform: scale(1);
            filter: brightness(1) drop-shadow(0 0 5px gold);
          }
          50% {
            transform: scale(1.2);
            filter: brightness(1.5) drop-shadow(0 0 20px gold);
          }
          100% {
            transform: scale(1);
            filter: brightness(1) drop-shadow(0 2px 4px rgba(0,0,0,0.2));
          }
        }
      `}</style>
    </div>
  );
};

export default SmartwatchWidget;