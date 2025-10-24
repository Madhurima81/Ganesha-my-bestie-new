import React, { useState, useEffect } from 'react';
import smartwatchBase from '../assets/images/smartwatch-base.png';
import smartwatchScreen from '../assets/images/smartwatch-screen.png';

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

const SmartwatchWidget = ({ 
  profileId,
  onAppClick,
  position = { bottom: '20px', right: '20px' }
}) => {
  const [unlockedApps, setUnlockedApps] = useState([]);
  
  // Add responsive scaling
  const { scaleFactor, breakpoint } = useResponsiveScaling();
  const uiScale = breakpoint === 'mobile' ? 1 : 
                breakpoint === 'tablet' ? 1.3 : 
                breakpoint === 'desktop' ? 1.6 : 1.8;

  // ENHANCED: Load saved apps from localStorage with better error handling
  useEffect(() => {
    if (profileId) {
      try {
        const saved = localStorage.getItem(`smartwatch_apps_${profileId}`);
        if (saved) {
          const apps = JSON.parse(saved);
          console.log(`📱 Smartwatch: Loaded ${apps.length} saved apps for profile ${profileId}`);
          setUnlockedApps(apps);
        } else {
          console.log(`📱 Smartwatch: No saved apps found for profile ${profileId}`);
        }
      } catch (error) {
        console.error('📱 Smartwatch: Error loading saved apps:', error);
        setUnlockedApps([]);
      }
    }
  }, [profileId]);

  // ENHANCED: Save apps to localStorage with validation
  const saveApps = (apps) => {
    if (profileId && Array.isArray(apps)) {
      try {
        localStorage.setItem(`smartwatch_apps_${profileId}`, JSON.stringify(apps));
        console.log(`📱 Smartwatch: Saved ${apps.length} apps for profile ${profileId}`);
      } catch (error) {
        console.error('📱 Smartwatch: Error saving apps:', error);
      }
    }
  };

  // ENHANCED: Add app with cumulative logic
  const addApp = (appData) => {
    if (!appData || !appData.id) {
      console.error('📱 Smartwatch: Invalid app data:', appData);
      return;
    }

    setUnlockedApps(prev => {
      const exists = prev.find(app => app.id === appData.id);
      if (!exists) {
        console.log(`📱 Smartwatch: Adding new app: ${appData.id} (${appData.name})`);
        const newApps = [...prev, appData];
        saveApps(newApps);
        return newApps;
      } else {
        console.log(`📱 Smartwatch: App ${appData.id} already exists - keeping cumulative state`);
        return prev; // Keep existing apps (cumulative)
      }
    });
  };

  // ENHANCED: Clear apps (for testing/reset)
  const clearApps = () => {
    console.log('📱 Smartwatch: Clearing all apps');
    setUnlockedApps([]);
    if (profileId) {
      localStorage.removeItem(`smartwatch_apps_${profileId}`);
    }
  };

  // Expose functions to parent with enhanced API
  useEffect(() => {
    window.smartwatchWidget = { 
      addApp, 
      clearApps,
      getApps: () => unlockedApps,
      appCount: unlockedApps.length
    };
    
    return () => {
      if (window.smartwatchWidget) {
        delete window.smartwatchWidget;
      }
    };
  }, [unlockedApps]);

  return (
    <div className="smartwatch-widget" style={{
      position: 'fixed',
      ...position,
      zIndex: 1000,
      // Add responsive scaling to position
      bottom: `${Math.round(20 * uiScale)}px`,
      right: `${Math.round(20 * uiScale)}px`
    }}>
      <div className="smartwatch-apps-overlay" style={{
        // Add responsive scaling to container
        width: `${Math.round(80 * uiScale)}px`,
        height: `${Math.round(80 * uiScale)}px`,
        position: 'relative'
      }}>
        <img 
          src={smartwatchScreen} 
          alt="screen" 
          className={`smartwatch-screen ${unlockedApps.length > 0 ? 'active' : ''}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
        
        {unlockedApps.map((app, index) => (
          <img 
            key={`${app.id}-${app.sceneId || 'unknown'}`} // Better key for debugging
            src={app.image}
            alt={app.name}
            className={`smartwatch-app app-${index + 1} unlocked`}
            onClick={() => onAppClick?.(app)}
            style={{
              position: 'absolute',
              // Responsive app sizes
              width: `${Math.round(30 * uiScale)}px`,
              height: `${Math.round(30 * uiScale)}px`,
              borderRadius: `${Math.round(6 * uiScale)}px`,
              cursor: 'pointer',
              // Responsive positioning - grid layout
              left: `${Math.round((20 + (index % 2) * 35) * uiScale)}px`,
              top: `${Math.round((15 + Math.floor(index / 2) * 35) * uiScale)}px`,
              transition: 'all 0.3s ease',
              // Visual feedback
              filter: 'brightness(1) drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              ':hover': {
                transform: 'scale(1.1)',
                filter: 'brightness(1.1) drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
              }
            }}
          />
        ))}
        
        {/* App counter for debugging */}
        {unlockedApps.length > 0 && (
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
            {unlockedApps.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartwatchWidget;