import React, { useEffect, useState } from 'react';
import './SimpleZoneCompletionCelebration.css';

const SimpleZoneCompletionCelebration = ({
  show = false,
  zoneId = 'shloka-river',
  playerName = 'little explorer',
  collectedApps = [],
  onComplete,
  onContinueExploring,
  ganeshaImage,
  smartwatchScreen,
}) => {
  const [showCard, setShowCard] = useState(false);

  const zoneConfigs = {
    'shloka-river': {
      title: 'Voice of Sacred Songs',
      subtitle: 'Shloka River Complete!',
      icon: '🌊',
      message: `${playerName}, you have mastered the sacred chants! Your divine voice flows like a river!`,
    },
    'symbol-mountain': {
      title: 'Guardian of Sacred Symbols',
      subtitle: 'Symbol Mountain Complete!',
      icon: '⛰️',
      message: `${playerName}, you are now a guardian of ancient wisdom!`,
    },
  };

  const config = zoneConfigs[zoneId] || zoneConfigs['shloka-river'];

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setShowCard(true), 500);
      return () => clearTimeout(timer);
    }

    setShowCard(false);
    return undefined;
  }, [show]);

  if (!show) return null;

  return (
    <div className="simple-zone-completion">
      <div className="simple-backdrop" />

      {showCard && (
        <div className="simple-completion-card">
          <div className="simple-zone-header">
            <div className="zone-icon">{config.icon}</div>
            <h2 className="zone-title">{config.title}</h2>
            <p className="zone-subtitle">{config.subtitle}</p>
          </div>

          <div className="completion-ganesha">
            <img
              src={ganeshaImage}
              alt="Ganesha celebrating"
              className="ganesha-celebration breathing-animation"
            />

            <div className="ganesha-completion-speech">
              <div className="speech-content">{config.message}</div>
            </div>
          </div>

          <div className="collected-apps-section">
            <h3>Powers Gained:</h3>

            <div className="completion-smartwatch-screen">
              <img src={smartwatchScreen} alt="Smartwatch Screen" className="screen-only" />

              <div className="completion-apps">
                {collectedApps.map((app, index) => (
                  <div
                    key={app.id}
                    className="completion-app"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <img src={app.image} alt={app.name} />
                    <div className="app-power-name">{app.power?.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="completion-stats">
            <div className="stat-item">
              <span className="stat-icon">📱</span>
              <span>8 Powers Gained</span>
            </div>
          </div>

          <div className="simple-action-buttons">
            <button className="primary-btn" onClick={onContinueExploring}>
              🌟 Next Adventure
            </button>

            <button className="secondary-btn" onClick={onComplete}>
              🏠 Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleZoneCompletionCelebration;
