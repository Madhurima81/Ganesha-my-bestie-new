// Enhanced DivineBlessingRain for Zone Completion
import React, { useState, useEffect } from 'react';

const EnhancedDivineBlessing = ({ 
  show = false, 
  duration = 8000, 
  onComplete,
  discoveredSymbols = [],
  zoneId = 'symbol-mountain',
  intensity = 'COSMIC', // 'SCENE' or 'COSMIC'
  playerName = 'little explorer'
}) => {
  const [particles, setParticles] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState(1); // 1: Cosmic Rain, 2: Recognition, 3: Scroll

  // Zone-specific configurations
  const ZONE_CONFIG = {
    'symbol-mountain': {
      title: 'Guardian of Sacred Symbols',
      blessing: `Divine Child ${playerName}, you have mastered the ancient symbols! You carry the wisdom of Symbol Mountain!`,
      elements: ['🕉️', '🐘', '🪷', '🦷', '👁️', '👂', '🍯', '🫄', '⭐'],
      colors: ['#FFD700', '#FF8C00', '#FFA500'],
      bgGradient: 'radial-gradient(ellipse at center, rgba(255,215,0,0.3) 0%, rgba(255,140,0,0.15) 50%, transparent 80%)'
    },
    'meaning-cave': {
      title: 'Keeper of Ancient Stories',
      blessing: `Wise ${playerName}, you have unlocked the sacred stories! The ancient tales live within you!`,
      elements: ['📜', '🏺', '💎', '🔥', '🌟', '📖', '🗿', '⚡'],
      colors: ['#8A2BE2', '#9370DB', '#BA55D3'],
      bgGradient: 'radial-gradient(ellipse at center, rgba(138,43,226,0.3) 0%, rgba(147,112,219,0.15) 50%, transparent 80%)'
    },
    'festival-square': {
      title: 'Master of Celebrations',
      blessing: `Joyful ${playerName}, you have learned the art of celebration! May every day be a festival in your heart!`,
      elements: ['🎉', '🎊', '🪔', '🎭', '🥳', '🎨', '🌈', '💃'],
      colors: ['#FF1493', '#FF69B4', '#FFB6C1'],
      bgGradient: 'radial-gradient(ellipse at center, rgba(255,20,147,0.3) 0%, rgba(255,105,180,0.15) 50%, transparent 80%)'
    },
    'shloka-river': {
      title: 'Voice of Sacred Songs',
      blessing: `Melodious ${playerName}, you have found your divine voice! The sacred songs flow through you like a river!`,
      elements: ['🎵', '🎶', '🌊', '🎤', '🔔', '📯', '🎼', '💫'],
      colors: ['#00CED1', '#20B2AA', '#48D1CC'],
      bgGradient: 'radial-gradient(ellipse at center, rgba(0,206,209,0.3) 0%, rgba(32,178,170,0.15) 50%, transparent 80%)'
    }
  };

  const config = ZONE_CONFIG[zoneId] || ZONE_CONFIG['symbol-mountain'];
  const isCosmicScale = intensity === 'COSMIC';

  // Enhanced particle creation for cosmic scale
  const createBlessingParticle = (index) => {
    const elements = config.elements;
    const element = elements[Math.floor(Math.random() * elements.length)];
    
    return {
      id: `cosmic-blessing-${index}-${Date.now()}`,
      element,
      left: Math.random() * 100,
      animationDelay: Math.random() * 2,
      animationDuration: isCosmicScale ? 4 + Math.random() * 3 : 3 + Math.random() * 2,
      size: isCosmicScale ? 1.2 + Math.random() * 0.8 : 0.8 + Math.random() * 0.4,
      rotation: Math.random() * 360,
      opacity: 0.8 + Math.random() * 0.2,
      trail: isCosmicScale, // Add trailing effect for cosmic
      color: config.colors[Math.floor(Math.random() * config.colors.length)]
    };
  };

  useEffect(() => {
    if (!show) {
      setIsActive(false);
      setParticles([]);
      setPhase(1);
      return;
    }

    console.log(`🌌 Starting ${intensity} Divine Blessing for ${zoneId}`);
    setIsActive(true);
    setPhase(1);
    
    // Create massive initial wave for cosmic scale
    const initialCount = isCosmicScale ? 50 : 25;
    const initialParticles = Array.from({ length: initialCount }, (_, i) => createBlessingParticle(i));
    setParticles(initialParticles);

    // More frequent particle creation for cosmic scale
    const particleInterval = setInterval(() => {
      setParticles(current => {
        const newCount = isCosmicScale ? 15 : 8;
        const newParticles = Array.from({ length: newCount }, (_, i) => 
          createBlessingParticle(current.length + i)
        );
        
        // Keep more particles for cosmic scale
        const keepCount = isCosmicScale ? 40 : 20;
        const recentParticles = current.slice(-keepCount);
        return [...recentParticles, ...newParticles];
      });
    }, isCosmicScale ? 500 : 800);

    // Phase transitions for cosmic scale
    if (isCosmicScale) {
      // Phase 2: Divine Recognition
      setTimeout(() => {
        setPhase(2);
      }, duration * 0.3);

      // Phase 3: Sacred Scroll
      setTimeout(() => {
        setPhase(3);
      }, duration * 0.6);
    }

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
  }, [show, duration, onComplete, isCosmicScale, zoneId]);

  if (!show) return null;

  return (
    <div className="enhanced-divine-blessing">
      {/* Enhanced cosmic overlay */}
      <div 
        className={`cosmic-blessing-overlay ${isActive ? 'active' : 'fading'}`}
        style={{ background: config.bgGradient }}
      />
      
      {/* Cosmic light rays - more and brighter for zone completion */}
      <div className={`cosmic-light-rays ${isActive ? 'active' : ''}`}>
        {Array.from({ length: isCosmicScale ? 12 : 7 }).map((_, i) => (
          <div 
            key={i}
            className="cosmic-light-ray"
            style={{
              left: `${8 + i * 7}%`,
              animationDelay: `${i * 0.2}s`,
              background: `linear-gradient(to bottom, ${config.colors[0]}CC 0%, ${config.colors[1]}80 50%, transparent 100%)`,
              width: isCosmicScale ? '5px' : '3px',
              height: isCosmicScale ? '300px' : '200px'
            }}
          />
        ))}
      </div>

      {/* Enhanced blessing particles with trails */}
      <div className="cosmic-blessing-particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className={`cosmic-blessing-particle ${particle.trail ? 'with-trail' : ''}`}
            style={{
              left: `${particle.left}%`,
              fontSize: `${particle.size * (isCosmicScale ? 2.5 : 2)}rem`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`,
              transform: `rotate(${particle.rotation}deg)`,
              opacity: particle.opacity,
              color: particle.color,
              filter: `drop-shadow(0 0 ${isCosmicScale ? 10 : 5}px ${particle.color}80)`
            }}
          >
            {particle.element}
          </div>
        ))}
      </div>

      {/* Cosmic water ripples - larger and more vibrant */}
      {isCosmicScale && (
        <div className="cosmic-water-ripples">
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i}
              className="cosmic-water-ripple"
              style={{
                left: `${10 + i * 10}%`,
                animationDelay: `${i * 0.6}s`,
                borderColor: `${config.colors[i % config.colors.length]}80`
              }}
            />
          ))}
        </div>
      )}

      {/* Enhanced Om resonance for cosmic scale */}
      <div className={`cosmic-om-resonance ${isActive ? 'chanting' : ''}`}>
        <div 
          className="cosmic-om-symbol"
          style={{ 
            fontSize: isCosmicScale ? '6rem' : '4rem',
            color: config.colors[0],
            filter: `drop-shadow(0 0 ${isCosmicScale ? 40 : 20}px ${config.colors[0]})`
          }}
        >
          🕉️
        </div>
        <div className="cosmic-sound-waves">
          {Array.from({ length: isCosmicScale ? 5 : 3 }).map((_, i) => (
            <div 
              key={i} 
              className={`cosmic-sound-wave wave-${i + 1}`}
              style={{
                borderColor: `${config.colors[0]}60`,
                width: `${(i + 1) * (isCosmicScale ? 80 : 50)}px`,
                height: `${(i + 1) * (isCosmicScale ? 80 : 50)}px`,
                margin: `${-(i + 1) * (isCosmicScale ? 40 : 25)}px 0 0 ${-(i + 1) * (isCosmicScale ? 40 : 25)}px`
              }}
            />
          ))}
        </div>
      </div>

      {/* Phase 2: Divine Recognition (Cosmic scale only) */}
      {isCosmicScale && phase >= 2 && (
        <div className="divine-recognition">
          <div className="ganesha-manifestation">
            <div className="divine-ganesha">🐘</div>
            <div className="divine-title">{config.title}</div>
            <div className="divine-blessing-text">{config.blessing}</div>
          </div>
        </div>
      )}

      {/* Phase 3: Sacred Scroll (Cosmic scale only) */}
      {isCosmicScale && phase >= 3 && (
        <div className="sacred-scroll-display">
          <div className="scroll-container">
            <div className="scroll-title">Sacred Wisdom Mastered</div>
            <div className="symbols-learned">
              {discoveredSymbols.map((symbol, i) => (
                <div key={i} className="learned-symbol">{symbol}</div>
              ))}
            </div>
            <div className="exploration-encouragement">
              Other sacred realms await your wisdom!
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .enhanced-divine-blessing {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: var(--app-height, 100vh);
          pointer-events: none;
          z-index: 9999;
          overflow: hidden;
        }

        .cosmic-blessing-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 1.5s ease;
        }

        .cosmic-blessing-overlay.active {
          opacity: 1;
        }

        .cosmic-blessing-overlay.fading {
          opacity: 0;
          transition: opacity 3s ease;
        }

        .cosmic-light-rays {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .cosmic-light-ray {
          position: absolute;
          top: -100px;
          opacity: 0;
          animation: cosmicLightRayDescend 4s ease-in-out;
        }

        .cosmic-light-rays.active .cosmic-light-ray {
          animation: cosmicLightRayDescend 4s ease-in-out infinite;
        }

        @keyframes cosmicLightRayDescend {
          0% {
            opacity: 0;
            transform: translateY(-200px) scaleY(0.3);
          }
          20% {
            opacity: 1;
            transform: translateY(-50px) scaleY(0.8);
          }
          50% {
            opacity: 1;
            transform: translateY(100px) scaleY(1.2);
          }
          80% {
            opacity: 0.8;
            transform: translateY(250px) scaleY(1.5);
          }
          100% {
            opacity: 0;
            transform: translateY(400px) scaleY(0.8);
          }
        }

        .cosmic-blessing-particle {
          position: absolute;
          top: -100px;
          pointer-events: none;
          animation: cosmicBlessingFall linear;
          font-weight: bold;
        }

        .cosmic-blessing-particle.with-trail {
          animation: cosmicBlessingFallWithTrail linear;
        }

        @keyframes cosmicBlessingFall {
          0% {
            transform: translateY(-100px) rotateZ(0deg) scale(0.5);
            opacity: 0;
          }
          15% {
            opacity: 1;
            transform: translateY(0) rotateZ(90deg) scale(1);
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translateY(120vh) rotateZ(720deg) scale(1.2);
            opacity: 0;
          }
        }

        @keyframes cosmicBlessingFallWithTrail {
          0% {
            transform: translateY(-100px) rotateZ(0deg) scale(0.3);
            opacity: 0;
            box-shadow: 0 0 0 transparent;
          }
          15% {
            opacity: 1;
            transform: translateY(0) rotateZ(90deg) scale(1);
            box-shadow: 0 -20px 40px currentColor;
          }
          85% {
            opacity: 1;
            box-shadow: 0 -30px 60px currentColor;
          }
          100% {
            transform: translateY(120vh) rotateZ(720deg) scale(1.5);
            opacity: 0;
            box-shadow: 0 -40px 80px transparent;
          }
        }

        .cosmic-water-ripples {
          position: absolute;
          bottom: 15%;
          width: 100%;
          height: 300px;
        }

        .cosmic-water-ripple {
          position: absolute;
          bottom: 0;
          width: 120px;
          height: 120px;
          border: 4px solid;
          border-radius: 50%;
          animation: cosmicSacredRipple 5s ease-out infinite;
        }

        @keyframes cosmicSacredRipple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }

        .cosmic-om-resonance {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 1.5s ease;
        }

        .cosmic-om-resonance.chanting {
          opacity: 1;
        }

        .cosmic-om-symbol {
          animation: cosmicOmPulse 2.5s ease-in-out infinite;
          z-index: 10;
          position: relative;
        }

        @keyframes cosmicOmPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }

        .cosmic-sound-waves {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .cosmic-sound-wave {
          position: absolute;
          border: 3px solid;
          border-radius: 50%;
          animation: cosmicSoundWaveExpand 2.5s ease-out infinite;
        }

        .wave-1 { animation-delay: 0s; }
        .wave-2 { animation-delay: 0.5s; }
        .wave-3 { animation-delay: 1s; }
        .wave-4 { animation-delay: 1.5s; }
        .wave-5 { animation-delay: 2s; }

        @keyframes cosmicSoundWaveExpand {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }

        /* Phase 2: Divine Recognition */
        .divine-recognition {
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          animation: divineRecognitionAppear 2s ease-out forwards;
          opacity: 0;
        }

        @keyframes divineRecognitionAppear {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-50px) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }

        .ganesha-manifestation {
          background: rgba(0, 0, 0, 0.8);
          padding: 30px;
          border-radius: 20px;
          border: 3px solid #FFD700;
          backdrop-filter: blur(10px);
        }

        .divine-ganesha {
          font-size: 4rem;
          margin-bottom: 15px;
          animation: cosmicOmPulse 2s ease-in-out infinite;
        }

        .divine-title {
          font-size: 2rem;
          color: #FFD700;
          font-weight: bold;
          margin-bottom: 15px;
          text-shadow: 0 0 20px #FFD700;
        }

        .divine-blessing-text {
          font-size: 1.3rem;
          color: white;
          line-height: 1.5;
          max-width: 600px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        }

        /* Phase 3: Sacred Scroll */
        .sacred-scroll-display {
          position: absolute;
          bottom: 10%;
          left: 50%;
          transform: translateX(-50%);
          animation: sacredScrollUnfurl 2s ease-out forwards;
          opacity: 0;
        }

        @keyframes sacredScrollUnfurl {
          0% {
            opacity: 0;
            transform: translateX(-50%) scaleY(0);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) scaleY(1);
          }
        }

        .scroll-container {
          background: linear-gradient(145deg, rgba(255, 248, 220, 0.95), rgba(255, 235, 205, 0.9));
          padding: 25px;
          border-radius: 15px;
          border: 3px solid #8B4513;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          text-align: center;
          color: #8B4513;
        }

        .scroll-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 15px;
          color: #8B4513;
        }

        .symbols-learned {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin: 15px 0;
        }

        .learned-symbol {
          font-size: 2rem;
          padding: 5px;
          background: rgba(255, 215, 0, 0.2);
          border-radius: 8px;
          border: 2px solid #FFD700;
        }

        .exploration-encouragement {
          font-size: 1.1rem;
          font-style: italic;
          color: #8B4513;
          margin-top: 15px;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .cosmic-om-symbol {
            font-size: 4rem;
          }
          
          .cosmic-blessing-particle {
            font-size: 1.5rem;
          }
          
          .divine-title {
            font-size: 1.5rem;
          }
          
          .divine-blessing-text {
            font-size: 1.1rem;
          }
          
          .ganesha-manifestation {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedDivineBlessing;