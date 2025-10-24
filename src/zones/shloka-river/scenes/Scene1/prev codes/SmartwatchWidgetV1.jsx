import React, { useState, useEffect } from 'react';
import smartwatchScreen from '../../assets/images/smartwatch-screen.png';

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
  onAppUnlock,           // New callback when app should be unlocked
  position = { bottom: '20px', right: '20px' }
}) => {
  const [animatingApp, setAnimatingApp] = useState(null);
  
  // Add responsive scaling
  const { scaleFactor, breakpoint } = useResponsiveScaling();
  const uiScale = breakpoint === 'mobile' ? 1 : 
                breakpoint === 'tablet' ? 1.3 : 
                breakpoint === 'desktop' ? 1.6 : 1.8;

  // App order for display (matching scene progression)
  const appOrder = ['vakratunda', 'mahakaya', 'kurumedeva', 'nirvighnam', 'samaprabha', 'sarvada', 'sarvakaryeshu', 'suryakoti'];

  // Handle app click - only works for unlocked apps
  const handleAppClick = (appId) => {
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

  // Get count of unlocked apps
  const unlockedCount = Object.values(unlockedApps).filter(Boolean).length;

  return (
    <div className="smartwatch-widget" style={{
      position: 'fixed',
      ...position,
      zIndex: 1000,
      // Add responsive scaling to position
      bottom: `${Math.round(20 * uiScale)}px`,
      right: `${Math.round(20 * uiScale)}px`
    }}>
      <div className="smartwatch-container" style={{
        width: `${Math.round(80 * uiScale)}px`,
        height: `${Math.round(80 * uiScale)}px`,
        position: 'relative'
      }}>
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
        
        {/* App Icons Grid */}
        {appOrder.slice(0, 4).map((appId, index) => {
          const app = appInfo[appId];
          const isUnlocked = unlockedApps[appId];
          const isAnimating = animatingApp === appId;
          
          return (
            <img 
              key={`${appId}-${index}`}
              src={isUnlocked ? app.colorIcon : app.grayIcon}
              alt={isUnlocked ? app.name : 'Locked app'}
              className={`smartwatch-app app-${index + 1} ${isUnlocked ? 'unlocked' : 'locked'} ${isAnimating ? 'star-burst' : ''}`}
              onClick={() => handleAppClick(appId)}
              title={isUnlocked ? app.name : 'App not yet unlocked'}
              style={{
                position: 'absolute',
                width: `${Math.round(30 * uiScale)}px`,
                height: `${Math.round(30 * uiScale)}px`,
                borderRadius: `${Math.round(6 * uiScale)}px`,
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                // Responsive positioning - 2x2 grid layout
                left: `${Math.round((20 + (index % 2) * 35) * uiScale)}px`,
                top: `${Math.round((15 + Math.floor(index / 2) * 35) * uiScale)}px`,
                transition: 'all 0.3s ease',
                // Visual feedback
                filter: isUnlocked 
                  ? 'brightness(1) drop-shadow(0 2px 4px rgba(0,0,0,0.2))' 
                  : 'brightness(0.6) grayscale(1)',
                opacity: isUnlocked ? 1 : 0.7
              }}
            />
          );
        })}
        
        {/* App counter for unlocked apps */}
        {unlockedCount > 0 && (
          <div style={{
            position: 'absolute',
            top: `${Math.round(-10 * uiScale)}px`,
            right: `${Math.round(-10 * uiScale)}px`,
            background: '#FF6B6B',
            color: 'white',
            borderRadius: '50%',
            width: `${Math.round(20 * uiScale)}px`,
            height: `${Math.round(20 * uiScale)}px`,
            fontSize: `${Math.round(10 * uiScale)}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {unlockedCount}
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        .smartwatch-app.star-burst {
          animation: starBurst 1s ease-out;
        }
        
        .smartwatch-app.unlocked:hover {
          transform: scale(1.1);
          filter: brightness(1.1) drop-shadow(0 4px 8px rgba(0,0,0,0.3)) !important;
        }
        
        .smartwatch-screen.active {
          filter: brightness(1.1) drop-shadow(0 0 10px rgba(76, 175, 80, 0.5));
        }
        
        @keyframes starBurst {
          0% {
            transform: scale(1);
            filter: brightness(1) drop-shadow(0 0 5px gold);
          }
          50% {
            transform: scale(1.3);
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