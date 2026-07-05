import React, { useState, useEffect } from 'react';

const DivineBlessingRain = ({ 
  show = false, 
  duration = 6000, 
  onComplete,
  discoveredSymbols = ['lotus', 'trunk', 'golden'],
  sceneTheme = 'pond' // pond, temple, garden, etc.
}) => {
  const [particles, setParticles] = useState([]);
  const [isActive, setIsActive] = useState(false);

  // Different blessing elements based on discovered symbols
  const getBlessingElements = () => {
    const elements = ['🕉️', '✨', '🪷']; // Om, sparkles, lotus
    
    if (discoveredSymbols.includes('lotus')) elements.push('🌸', '🪷');
    if (discoveredSymbols.includes('trunk')) elements.push('🐘', '💧');
    if (discoveredSymbols.includes('golden')) elements.push('⭐', '✨', '🌟');
    
    return elements;
  };

  const createBlessingParticle = (index) => {
    const elements = getBlessingElements();
    const element = elements[Math.floor(Math.random() * elements.length)];
    
    return {
      id: `blessing-${index}-${Date.now()}`,
      element,
      left: Math.random() * 100,
      animationDelay: Math.random() * 2,
      animationDuration: 3 + Math.random() * 2,
      size: 0.8 + Math.random() * 0.4,
      rotation: Math.random() * 360,
      opacity: 0.7 + Math.random() * 0.3
    };
  };

  useEffect(() => {
    if (!show) {
      setIsActive(false);
      setParticles([]);
      return;
    }

    setIsActive(true);
    
    // Create initial wave of particles
    const initialParticles = Array.from({ length: 25 }, (_, i) => createBlessingParticle(i));
    setParticles(initialParticles);

    // Continue creating particles during the blessing
    const particleInterval = setInterval(() => {
      setParticles(current => {
        const newParticles = Array.from({ length: 8 }, (_, i) => 
          createBlessingParticle(current.length + i)
        );
        
        // Keep only recent particles to prevent memory buildup
        const recentParticles = current.slice(-20);
        return [...recentParticles, ...newParticles];
      });
    }, 800);

    // End the blessing
    const endTimer = setTimeout(() => {
      setIsActive(false);
      clearInterval(particleInterval);
      
      setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 2000);
    }, duration);

    return () => {
      clearInterval(particleInterval);
      clearTimeout(endTimer);
    };
  }, [show, duration, onComplete]);

  if (!show) return null;

  return (
    <div className="divine-blessing-rain">
      {/* Sacred chanting background overlay */}
      <div className={`blessing-overlay ${isActive ? 'active' : 'fading'}`} />
      
      {/* Golden light rays from top */}
      <div className={`divine-light-rays ${isActive ? 'active' : ''}`}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div 
            key={i}
            className="light-ray"
            style={{
              left: `${15 + i * 12}%`,
              animationDelay: `${i * 0.3}s`
            }}
          />
        ))}
      </div>

      {/* Blessing particles falling */}
      <div className="blessing-particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="blessing-particle"
            style={{
              left: `${particle.left}%`,
              fontSize: `${particle.size * 2}rem`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`,
              transform: `rotate(${particle.rotation}deg)`,
              opacity: particle.opacity
            }}
          >
            {particle.element}
          </div>
        ))}
      </div>

      {/* Sacred water ripples on pond surface */}
      <div className="sacred-water-ripples">
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i}
            className="water-ripple"
            style={{
              left: `${20 + i * 15}%`,
              animationDelay: `${i * 0.8}s`
            }}
          />
        ))}
      </div>

      {/* Gentle om chanting visual */}
      <div className={`om-resonance ${isActive ? 'chanting' : ''}`}>
        <div className="om-symbol">🕉️</div>
        <div className="sound-waves">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`sound-wave wave-${i + 1}`} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .divine-blessing-rain {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: var(--app-height, 100vh);
          pointer-events: none;
          z-index: 9999;
          overflow: hidden;
        }

        .blessing-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            ellipse at top center,
            rgba(255, 215, 0, 0.1) 0%,
            rgba(255, 140, 0, 0.05) 30%,
            transparent 70%
          );
          opacity: 0;
          transition: opacity 1s ease;
        }

        .blessing-overlay.active {
          opacity: 1;
        }

        .blessing-overlay.fading {
          opacity: 0;
          transition: opacity 2s ease;
        }

        .divine-light-rays {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .light-ray {
          position: absolute;
          top: -50px;
          width: 3px;
          height: 200px;
          background: linear-gradient(
            to bottom,
            rgba(255, 215, 0, 0.8) 0%,
            rgba(255, 215, 0, 0.3) 50%,
            transparent 100%
          );
          opacity: 0;
          animation: lightRayDescend 3s ease-in-out;
        }

        .divine-light-rays.active .light-ray {
          animation: lightRayDescend 3s ease-in-out infinite;
        }

        @keyframes lightRayDescend {
          0% {
            opacity: 0;
            transform: translateY(-100px) scaleY(0.5);
          }
          30% {
            opacity: 1;
            transform: translateY(0) scaleY(1);
          }
          70% {
            opacity: 0.8;
            transform: translateY(100px) scaleY(1.2);
          }
          100% {
            opacity: 0;
            transform: translateY(200px) scaleY(0.8);
          }
        }

        .blessing-particle {
          position: absolute;
          top: -50px;
          pointer-events: none;
          animation: blessingFall linear;
          filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.5));
        }

        @keyframes blessingFall {
          0% {
            transform: translateY(-50px) rotateZ(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(var(--app-height, 100vh)) rotateZ(360deg);
            opacity: 0;
          }
        }

        .sacred-water-ripples {
          position: absolute;
          bottom: 20%;
          width: 100%;
          height: 200px;
        }

        .water-ripple {
          position: absolute;
          bottom: 0;
          width: 80px;
          height: 80px;
          border: 3px solid rgba(255, 215, 0, 0.6);
          border-radius: 50%;
          animation: sacredRipple 4s ease-out infinite;
        }

        @keyframes sacredRipple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }

        .om-resonance {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 1s ease;
        }

        .om-resonance.chanting {
          opacity: 1;
        }

        .om-symbol {
          font-size: 4rem;
          color: #FFD700;
          filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
          animation: omPulse 2s ease-in-out infinite;
          z-index: 10;
          position: relative;
        }

        @keyframes omPulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
          }
          50% {
            transform: scale(1.1);
            filter: drop-shadow(0 0 30px rgba(255, 215, 0, 1));
          }
        }

        .sound-waves {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .sound-wave {
          position: absolute;
          border: 2px solid rgba(255, 215, 0, 0.4);
          border-radius: 50%;
          animation: soundWaveExpand 2s ease-out infinite;
        }

        .wave-1 {
          width: 100px;
          height: 100px;
          margin: -50px 0 0 -50px;
          animation-delay: 0s;
        }

        .wave-2 {
          width: 150px;
          height: 150px;
          margin: -75px 0 0 -75px;
          animation-delay: 0.7s;
        }

        .wave-3 {
          width: 200px;
          height: 200px;
          margin: -100px 0 0 -100px;
          animation-delay: 1.4s;
        }

        @keyframes soundWaveExpand {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .om-symbol {
            font-size: 3rem;
          }
          
          .blessing-particle {
            font-size: 1.5rem;
          }
          
          .light-ray {
            width: 2px;
            height: 150px;
          }
        }
      `}</style>
    </div>
  );
};

export default DivineBlessingRain;