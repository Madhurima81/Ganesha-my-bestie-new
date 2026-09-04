import React, { useEffect, useState } from 'react';

const LevelProgressionPortal = ({
  show = false,
  currentLevel = 'Symbol Mountain',
  nextLevel = 'Cave of Secrets',
  onContinue,
  onReplay,
  discoveredSymbols = ['lotus', 'trunk', 'golden'],
  symbolImages = {},
  levelImages = {},
}) => {
  const [stage, setStage] = useState('hidden');
  const [portalParticles, setPortalParticles] = useState([]);

  const symbolEmojis = {
    lotus: '🪷',
    trunk: '🐘',
    golden: '⭐',
    om: '🕉️',
    temple: '🛕',
    garden: '🌺',
    water: '💧',
  };

  const levelEmojis = {
    'Symbol Mountain': '🏔️',
    'Cave of Secrets': '🌈',
    'Obstacle Forest': '🌊',
    'Shloka River': '☁️',
    'Lambodara Lodge': '🌲',
    'Story Treehouse': '🏜️',
    'Festival Square': '❄️',
  };

  const getSymbolDisplay = (symbolKey) => {
    if (symbolImages[symbolKey]) {
      return <img src={symbolImages[symbolKey]} alt={symbolKey} className="symbol-image" />;
    }
    return symbolEmojis[symbolKey] || '✨';
  };

  const getLevelDisplay = (levelName) => {
    if (levelImages[levelName]) {
      return <img src={levelImages[levelName]} alt={levelName} className="level-image" />;
    }
    return levelEmojis[levelName] || '🏔️';
  };

  const createPortalParticle = (index) => ({
    id: `portal-${index}-${Date.now()}`,
    angle: (index / 20) * Math.PI * 2,
    radius: 50 + Math.random() * 100,
    speed: 0.02 + Math.random() * 0.03,
    size: 0.5 + Math.random() * 0.5,
    symbol:
      Object.values(symbolEmojis)[Math.floor(Math.random() * Object.values(symbolEmojis).length)],
    opacity: 0.6 + Math.random() * 0.4,
  });

  useEffect(() => {
    if (!show) {
      setStage('hidden');
      setPortalParticles([]);
      return;
    }

    setStage('portal');
    setPortalParticles(Array.from({ length: 20 }, (_, i) => createPortalParticle(i)));

    const particleAnimation = setInterval(() => {
      setPortalParticles((current) =>
        current.map((particle) => ({
          ...particle,
          angle: particle.angle + particle.speed,
          radius: particle.radius + Math.sin(particle.angle * 4) * 2,
        }))
      );
    }, 50);

    const celebrationTimer = setTimeout(() => {
      setStage('celebration');
    }, 2000);

    const choiceTimer = setTimeout(() => {
      setStage('choice');
    }, 4000);

    return () => {
      clearInterval(particleAnimation);
      clearTimeout(celebrationTimer);
      clearTimeout(choiceTimer);
    };
  }, [show]);

  const handleContinue = () => {
    setStage('exiting');
    setTimeout(() => {
      onContinue?.();
    }, 1000);
  };

  const handleReplay = () => {
    setStage('exiting');
    setTimeout(() => {
      onReplay?.();
    }, 1000);
  };

  if (stage === 'hidden') return null;

  return (
    <div className={`level-progression-portal stage-${stage}`}>
      <div className="portal-background">
        <div className="portal-overlay" />

        <div className="portal-ring">
          <div className="portal-inner">
            <div className="portal-core">
              <div className="next-level-preview">
                <div className="level-emoji">{levelEmojis[nextLevel]}</div>
                <div className="level-name">{nextLevel}</div>
              </div>
            </div>
          </div>

          <div className="portal-particles">
            {portalParticles.map((particle) => (
              <div
                key={particle.id}
                className="portal-particle"
                style={{
                  transform: `rotate(${particle.angle}rad) translateX(${particle.radius}px)`,
                  fontSize: `${particle.size * 1.5}rem`,
                  opacity: particle.opacity,
                }}
              >
                {particle.symbol}
              </div>
            ))}
          </div>
        </div>
      </div>

      {(stage === 'celebration' || stage === 'choice') && (
        <div className="celebration-content">
          <div className="achievement-card">
            <div className="card-header">
              <h2>🎉 Level Complete! 🎉</h2>
              <div className="current-level">
                <div className="level-display">{getLevelDisplay(currentLevel)}</div>
                <div className="level-text">{currentLevel}</div>
              </div>
            </div>

            <div className="achievement-details">
              <div className="symbols-discovered">
                <h4>Symbols Mastered:</h4>
                <div className="symbol-collection">
                  {discoveredSymbols.map((symbol, i) => (
                    <div
                      key={symbol}
                      className="discovered-symbol"
                      style={{ animationDelay: `${i * 0.3 + 1}s` }}
                    >
                      <div className="symbol-icon">{getSymbolDisplay(symbol)}</div>
                      <div className="symbol-name">{symbol}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {stage === 'choice' && (
        <div className="action-buttons">
          <button className="continue-btn" onClick={handleContinue}>
            <div className="btn-content">
              <span className="btn-icon">✨</span>
              <span className="btn-text">Continue to {nextLevel}</span>
              <span className="btn-emoji">{getLevelDisplay(nextLevel)}</span>
            </div>
          </button>

          <button className="replay-btn" onClick={handleReplay}>
            <div className="btn-content">
              <span className="btn-icon">🔄</span>
              <span className="btn-text">Play Again</span>
              <span className="btn-emoji">🎮</span>
            </div>
          </button>
        </div>
      )}

      <style jsx>{`
        .level-progression-portal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: var(--app-height, 100vh);
          z-index: 10000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 1s ease;
        }

        .stage-portal, .stage-celebration, .stage-choice {
          opacity: 1;
        }

        .stage-exiting {
          opacity: 0;
          transform: scale(0.8);
          transition: all 1s ease;
        }

        .portal-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            circle at center,
            rgba(138, 43, 226, 0.3) 0%,
            rgba(75, 0, 130, 0.6) 50%,
            rgba(25, 25, 112, 0.9) 100%
          );
        }

        .portal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background:
            radial-gradient(circle at 30% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(255, 20, 147, 0.1) 0%, transparent 50%);
          animation: portalShimmer 4s ease-in-out infinite;
        }

        @keyframes portalShimmer {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .portal-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 300px;
          height: 300px;
          border: 5px solid rgba(255, 215, 0, 0.8);
          border-radius: 50%;
          animation: portalRotate 8s linear infinite;
          box-shadow:
            0 0 50px rgba(255, 215, 0, 0.6),
            inset 0 0 50px rgba(255, 215, 0, 0.3);
        }

        @keyframes portalRotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .portal-inner {
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          bottom: 10px;
          border: 3px solid rgba(255, 20, 147, 0.6);
          border-radius: 50%;
          animation: portalRotate 6s linear infinite reverse;
        }

        .portal-core {
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          bottom: 20px;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 215, 0, 0.3) 30%,
            transparent 70%
          );
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .next-level-preview {
          text-align: center;
          color: #4b0082;
          animation: levelPreviewFloat 2s ease-in-out infinite;
        }

        .level-emoji {
          font-size: 3rem;
          margin-bottom: 0.5rem;
          filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));
        }

        .level-name {
          font-family: 'Comic Sans MS', cursive;
          font-size: 1.2rem;
          font-weight: bold;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        @keyframes levelPreviewFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .portal-particles {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
        }

        .portal-particle {
          position: absolute;
          transform-origin: 0 0;
          animation: particleGlow 2s ease-in-out infinite;
          filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.8));
        }

        @keyframes particleGlow {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.8)); }
          50% { filter: drop-shadow(0 0 15px rgba(255, 20, 147, 1)); }
        }

        .celebration-content {
          position: relative;
          z-index: 10;
          animation: celebrationEnter 1s ease-out;
        }

        @keyframes celebrationEnter {
          0% {
            opacity: 0;
            transform: scale(0.5) translateY(50px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .achievement-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 248, 220, 0.95));
          border: 4px solid #ffd700;
          border-radius: 25px;
          padding: 2rem;
          box-shadow:
            0 20px 40px rgba(0, 0, 0, 0.3),
            inset 0 0 20px rgba(255, 215, 0, 0.2);
          text-align: center;
          backdrop-filter: blur(10px);
          max-width: 500px;
          max-height: 70vh;
          overflow-y: auto;
        }

        .card-header h2 {
          color: #8b4513;
          font-family: 'Comic Sans MS', cursive;
          font-size: 2rem;
          margin: 0 0 1rem 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .current-level {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          font-size: 1.5rem;
          color: #4b0082;
          font-weight: bold;
          margin-bottom: 1.5rem;
        }

        .level-display {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .level-text {
          font-size: 1.3rem;
        }

        .symbols-discovered h4 {
          color: #4b0082;
          margin: 1rem 0 0.5rem 0;
          font-size: 1.3rem;
        }

        .symbol-collection {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .discovered-symbol {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          animation: symbolReveal 0.8s ease-out;
        }

        .symbol-icon {
          font-size: 2.5rem;
          filter: drop-shadow(0 0 10px rgba(255, 20, 147, 0.6));
        }

        .symbol-name {
          color: #8b4513;
          font-size: 0.9rem;
          font-weight: bold;
          text-transform: capitalize;
        }

        @keyframes symbolReveal {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.5);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .action-buttons {
          position: relative;
          z-index: 10;
          display: flex;
          gap: 1.5rem;
          margin-top: 1rem;
          animation: buttonsSlideUp 1s ease-out 0.5s both;
          padding-bottom: 1rem;
        }

        @keyframes buttonsSlideUp {
          0% {
            opacity: 0;
            transform: translateY(50px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .continue-btn, .replay-btn {
          padding: 1rem 2rem;
          border: none;
          border-radius: 20px;
          font-family: 'Comic Sans MS', cursive;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .continue-btn {
          background: linear-gradient(135deg, #32cd32, #228b22);
          color: white;
        }

        .continue-btn:hover {
          background: linear-gradient(135deg, #228b22, #006400);
          transform: translateY(-3px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
        }

        .replay-btn {
          background: linear-gradient(135deg, #ff6347, #dc143c);
          color: white;
        }

        .replay-btn:hover {
          background: linear-gradient(135deg, #dc143c, #b22222);
          transform: translateY(-3px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
        }

        .btn-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-icon, .btn-emoji {
          font-size: 1.3rem;
        }

        .symbol-image, .level-image {
          width: 40px;
          height: 40px;
          object-fit: contain;
          border-radius: 8px;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
        }

        .level-emoji .level-image {
          width: 60px;
          height: 60px;
        }

        .symbol-icon .symbol-image {
          width: 50px;
          height: 50px;
        }

        .btn-emoji .level-image {
          width: 24px;
          height: 24px;
        }

        .btn-text {
          flex: 1;
        }

        @media (max-width: 768px) {
          .portal-ring {
            width: 250px;
            height: 250px;
          }

          .level-emoji {
            font-size: 2.5rem;
          }

          .level-name {
            font-size: 1rem;
          }

          .achievement-card {
            max-width: 90vw;
            padding: 1.5rem;
          }

          .card-header h2 {
            font-size: 1.5rem;
          }

          .current-level {
            font-size: 1.2rem;
          }

          .action-buttons {
            flex-direction: column;
            gap: 1rem;
          }

          .continue-btn, .replay-btn {
            width: 100%;
            padding: 1rem;
          }

          .symbol-collection {
            gap: 0.5rem;
          }

          .discovered-symbol .symbol-icon {
            font-size: 2rem;
          }
        }

        @media (orientation: portrait) {
          .portal-ring {
            width: 200px;
            height: 200px;
          }

          .achievement-card {
            max-width: 85vw;
          }
        }
      `}</style>
    </div>
  );
};

export default LevelProgressionPortal;
