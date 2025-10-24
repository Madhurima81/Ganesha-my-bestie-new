import React, { useState, useEffect } from 'react';
import smartwatchBase from '../assets/images/smartwatch-base.png';
import smartwatchScreen from '../assets/images/smartwatch-screen.png';

const SmartwatchWidget = ({ 
  profileId,
  onAppClick,
  position = { bottom: '20px', right: '20px' }
}) => {
  const [unlockedApps, setUnlockedApps] = useState([]);

// Load saved apps from localStorage
useEffect(() => {
  if (profileId) {
    const saved = localStorage.getItem(`smartwatch_apps_${profileId}`);
    if (saved) {
      try {
        const apps = JSON.parse(saved);
        console.log('Smartwatch: Loading apps for profile', profileId, ':', apps);
        setUnlockedApps(apps);
      } catch (error) {
        console.error('Error loading smartwatch apps:', error);
        setUnlockedApps([]);
      }
    } else {
      console.log('Smartwatch: No saved apps found for profile', profileId);
      setUnlockedApps([]);
    }
  }
}, [profileId]);

// Save apps to localStorage
const saveApps = (apps) => {
  if (profileId) {
    try {
      localStorage.setItem(`smartwatch_apps_${profileId}`, JSON.stringify(apps));
      console.log('Smartwatch: Apps saved for profile', profileId, ':', apps);
    } catch (error) {
      console.error('Error saving smartwatch apps:', error);
    }
  }
};

// Add app (called from scenes)
const addApp = (appData) => {
  console.log('Smartwatch: Adding app', appData);
  setUnlockedApps(prev => {
    const exists = prev.find(app => app.id === appData.id);
    if (!exists) {
      const newApps = [...prev, appData];
      console.log('Smartwatch: New app added, total apps:', newApps.length);
      saveApps(newApps);
      return newApps;
    } else {
      console.log('Smartwatch: App already exists:', appData.id);
    }
    return prev;
  });
};

// Clear all apps (for testing)
const clearApps = () => {
  if (profileId) {
    localStorage.removeItem(`smartwatch_apps_${profileId}`);
    setUnlockedApps([]);
    console.log('Smartwatch: All apps cleared for profile', profileId);
  }
};

// Expose functions to parent
useEffect(() => {
  window.smartwatchWidget = { 
    addApp,
    clearApps, // For testing
    getApps: () => unlockedApps
  };
}, [unlockedApps]);

  return (
    <div className="smartwatch-widget" style={{
      position: 'fixed',
      ...position,
      zIndex: 1000
    }}>
      <div className="smartwatch-apps-overlay">
        <img 
          src={smartwatchScreen} 
          alt="screen" 
          className={`smartwatch-screen ${unlockedApps.length > 0 ? 'active' : ''}`} 
        />
        
        {unlockedApps.map((app, index) => (
          <img 
            key={app.id}
            src={app.image}
            alt={app.name}
            className={`smartwatch-app app-${index + 1} unlocked`}
            onClick={() => onAppClick?.(app)}
            style={{
              position: 'absolute',
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              cursor: 'pointer',
              // Position apps in grid
              left: `${20 + (index % 2) * 35}px`,
              top: `${15 + Math.floor(index / 2) * 35}px`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SmartwatchWidget;