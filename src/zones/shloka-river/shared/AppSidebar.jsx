import React, { useState, useEffect, useRef } from 'react';
import './AppSidebar.css';
import SanskritVoiceRecorder from '../../../lib/components/audio/SanskritVoiceRecorder.jsx';
import { getZoneTheme } from '../../../lib/config/ZoneThemes';
import { applyRecorderTheme } from '../../../lib/theme/RecorderThemeAdapter';

// Mantra icons — same images as Meaning Cave (colored only, no gray set)
import vakratundaIcon    from '../../symbol-mountain/shared/images/icons/symbol-trunk-new.png';
import mahakayaIcon      from '../scenes/Scene1/assets/images/banyan-full-from-download.png';
import suryakotiIcon     from '../../meaning cave/assets/images/symbols/suryakoti-symbol.png';
import samaprabhaIcon    from '../../meaning cave/assets/images/symbols/samaprabha-symbol.png';
import nirvighnamIcon    from '../../meaning cave/assets/images/symbols/nirvighnam-symbol.png';
import kurumedevaIcon    from '../../meaning cave/assets/images/symbols/kurumedeva-symbol.png';
import sarvakaryeshuIcon from '../../meaning cave/assets/images/symbols/sarvakaryeshu-symbol.png';
import sarvadaIcon       from '../../meaning cave/assets/images/symbols/sarvada-symbol.png';

const appInfo = {
  vakratunda:    { title: "Vakratunda",    description: "I adapt.",            icon: vakratundaIcon,    syllables: ['VA', 'KRA', 'TUN', 'DA'],        power: { color: '#FFD700' } },
  mahakaya:      { title: "Mahakaya",      description: "I am strong.",        icon: mahakayaIcon,      syllables: ['MA', 'HA', 'KA', 'YA'],           power: { color: '#FF6B35' } },
  suryakoti:     { title: "Suryakoti",     description: "I shine.",            icon: suryakotiIcon,     syllables: ['SUR', 'YA', 'KO', 'TI'],          power: { color: '#FFC107' } },
  samaprabha:    { title: "Samaprabha",    description: "I stay bright.",      icon: samaprabhaIcon,    syllables: ['SA', 'MA', 'PRA', 'BHA'],         power: { color: '#2196F3' } },
  kurumedeva:    { title: "Kurumedeva",    description: "I try again.",        icon: kurumedevaIcon,    syllables: ['KU', 'RU', 'ME', 'DEVA'],         power: { color: '#4CAF50' } },
  nirvighnam:    { title: "Nirvighnam",    description: "I move forward.",     icon: nirvighnamIcon,    syllables: ['NIR', 'VIGH', 'NAM'],             power: { color: '#9C27B0' } },
  sarvakaryeshu: { title: "Sarvakaryeshu", description: "I do my tasks.",      icon: sarvakaryeshuIcon, syllables: ['SAR', 'VA', 'KAR', 'YE', 'SHU'],  power: { color: '#795548' } },
  sarvada:       { title: "Sarvada",       description: "I do not give up.",   icon: sarvadaIcon,       syllables: ['SAR', 'VA', 'DA'],                power: { color: '#FF9800' } },
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
  // Center mode props (for future use)
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

  const appOrder = ['vakratunda', 'mahakaya', 'suryakoti', 'samaprabha', 'kurumedeva', 'nirvighnam', 'sarvakaryeshu', 'sarvada'];

  const displayApps = centerMode
    ? appOrder.filter(id => unlockedApps[id])
    : appOrder;

  const getIconClass = (appId) => {
    if (animatingApp === appId) return 'ganesha-icon animating';
    if (unlockedApps[appId])    return 'ganesha-icon symbol-unlocked';
    return 'ganesha-icon symbol-locked';
  };

  const handleAppClick = (appId) => {
    if (centerMode || unlockedApps[appId]) {
      applyRecorderTheme(zoneId);
      setTappedApps(prev => ({ ...prev, [appId]: true }));
      setSelectedApp(appId);
      setShowPopup(true);
      onPopupOpen?.();
      if (onAppClick) onAppClick(appId);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedApp(null);
    onPopupClose?.();
  };

  // Trigger bloom animation when an app is newly unlocked
  useEffect(() => {
    const prevUnlocked = prevUnlockedRef.current || {};
    const newlyUnlocked = appOrder.find(app =>
      unlockedApps[app] && !prevUnlocked[app]
    );
    if (newlyUnlocked && !animatingApp) {
      setAnimatingApp(newlyUnlocked);
      setTimeout(() => setAnimatingApp(null), 1000);
    }
    prevUnlockedRef.current = { ...unlockedApps };
  }, [unlockedApps, animatingApp]);

  // CENTER MODE (for future scenes)
  if (centerMode) {
    return (
      <>
        <div className="app-discovery-overlay">
          <div className="app-discovery-panel" style={zoneThemeVars}>
            <h2 className="app-discovery-title">You Learned Sacred Words!</h2>
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
                    <img src={app.icon} alt={app.title} className="app-discovery-img" />
                    <div className={`tap-indicator ${hasTapped ? 'tap-indicator-done' : ''}`}>
                      {hasTapped ? 'Done' : 'TAP!'}
                    </div>
                    <p className="app-discovery-name">{app.title}</p>
                  </div>
                );
              })}
            </div>

            <button className="app-discovery-celebrate-btn" onClick={onCelebrate}>
              Celebrate!
            </button>
          </div>
        </div>

        {showPopup && selectedApp && (
          <SanskritVoiceRecorder
            word={selectedApp}
            syllables={appInfo[selectedApp].syllables}
            chantResult={null}
            appIcon={appInfo[selectedApp].icon}
            appColor={appInfo[selectedApp].power.color}
            savedRecordings={savedRecordings}
            onSaveRecording={onSaveRecording}
            allowSkip={false}
            stopAudio={() => {
              document.querySelectorAll('audio').forEach((audio) => {
                audio.pause();
                audio.currentTime = 0;
              });
            }}
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
      <div className={`ganesha-sidebar ${className}`} style={zoneThemeVars}>
        {appOrder.map((appId) => {
          const app = appInfo[appId];
          const isUnlocked = unlockedApps[appId];
          const needsTap = isUnlocked && !tappedApps[appId];

          return (
            <div
              key={appId}
              id={`sidebar-${appId}`}
              className={getIconClass(appId)}
              onClick={() => handleAppClick(appId)}
              style={{
                backgroundImage: `url(${app.icon})`,
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
              }}
              title={isUnlocked ? app.title : 'Locked'}
            >
              {needsTap && <div className="glow-indicator" />}
            </div>
          );
        })}
      </div>

      {showPopup && selectedApp && (
        <SanskritVoiceRecorder
          word={selectedApp}
          syllables={appInfo[selectedApp].syllables}
          chantResult={null}
          appIcon={appInfo[selectedApp].icon}
          appColor={appInfo[selectedApp].power.color}
          savedRecordings={savedRecordings}
          onSaveRecording={onSaveRecording}
          allowSkip={false}
          stopAudio={() => {
            document.querySelectorAll('audio').forEach((audio) => {
              audio.pause();
              audio.currentTime = 0;
            });
          }}
          title="Practice Chanting"
          prompt={`Try saying ${selectedApp.toUpperCase()}`}
          onComplete={closePopup}
        />
      )}
    </>
  );
};

export default AppSidebar;
