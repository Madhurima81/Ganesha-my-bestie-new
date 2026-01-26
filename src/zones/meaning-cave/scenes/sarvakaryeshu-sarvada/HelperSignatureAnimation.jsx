// ✨ HelperSignatureAnimation.jsx
// Individual signature animations for all 24 helpers
// Shows each helper's unique magical power flowing to help

import React, { useState, useEffect, useRef } from 'react';
import './HelperSignatureAnimation.css';

// ===== SIGNATURE ANIMATION CONFIGURATIONS =====
const SIGNATURE_ANIMATIONS = {
  // GRANDPARENTS MISSION - CALM DOWN HELPERS
  timmytime: {
    name: 'Gentle Time Flow',
    particles: 'golden-sand',
    color: '#FFD700',
    path: 'gentle-curve',
    effect: 'time-slow-glow',
    duration: 3500,
    description: 'Golden sand particles flow gently, time slows peacefully'
  },
  
  clearolens: {
    name: 'Clarity Waves',
    particles: 'blue-clarity-ripples',
    color: '#87CEEB',
    path: 'expanding-ripples',
    effect: 'screen-clarify',
    duration: 2800,
    description: 'Blue clarity waves spread, text becomes sharp and clear'
  },
  
  memoleaf: {
    name: 'Memory Leaves',
    particles: 'floating-green-leaves',
    color: '#90EE90',
    path: 'leaf-flutter',
    effect: 'memory-notes-appear',
    duration: 3200,
    description: 'Green leaves flutter and transform into memory notes'
  },
  
  snuggyshawl: {
    name: 'Comfort Embrace',
    particles: 'pink-warmth-wisps',
    color: '#FFB6C1',
    path: 'embracing-flow',
    effect: 'warm-comfort-glow',
    duration: 3800,
    description: 'Pink warmth wisps create a comforting embrace'
  },

  // DOG MISSION - COURAGE HELPERS
  snuggyblanket: {
    name: 'Protective Wrap',
    particles: 'purple-comfort-clouds',
    color: '#DDA0DD',
    path: 'gentle-wrap',
    effect: 'safety-cocoon',
    duration: 3600,
    description: 'Purple comfort clouds wrap around like a protective blanket'
  },
  
  aquabuddy: {
    name: 'Refreshing Stream',
    particles: 'blue-water-droplets',
    color: '#00CED1',
    path: 'flowing-stream',
    effect: 'refreshing-energy',
    duration: 3000,
    description: 'Blue water droplets flow like a refreshing stream'
  },
  
  happytail: {
    name: 'Joy Bounce',
    particles: 'golden-joy-sparks',
    color: '#F4A460',
    path: 'bouncy-zigzag',
    effect: 'happiness-burst',
    duration: 2800,
    description: 'Golden joy sparks bounce playfully, spreading happiness'
  },
  
  brighttorch: {
    name: 'Light Beam',
    particles: 'yellow-light-rays',
    color: '#FFFF00',
    path: 'straight-beam',
    effect: 'darkness-banish',
    duration: 2500,
    description: 'Yellow light rays banish darkness and fear'
  },

  // CONSTRUCTION MISSION - ENERGY HELPERS
  melodymug: {
    name: 'Musical Steam',
    particles: 'brown-music-notes',
    color: '#8B4513',
    path: 'musical-swirl',
    effect: 'rhythm-energy',
    duration: 3400,
    description: 'Brown musical notes swirl like steam, creating rhythm'
  },
  
  rhythmoradio: {
    name: 'Sound Waves',
    particles: 'red-sound-waves',
    color: '#FF6347',
    path: 'wave-pulses',
    effect: 'beat-synchronize',
    duration: 3100,
    description: 'Red sound waves pulse with energizing beats'
  },
  
  hammerhero: {
    name: 'Strength Sparks',
    particles: 'silver-power-sparks',
    color: '#C0C0C0',
    path: 'heroic-arc',
    effect: 'strength-boost',
    duration: 2900,
    description: 'Silver power sparks arc heroically, boosting strength'
  },
  
  sunnyspark: {
    name: 'Sunshine Burst',
    particles: 'orange-sun-rays',
    color: '#FFA500',
    path: 'radiating-burst',
    effect: 'energy-explosion',
    duration: 2700,
    description: 'Orange sun rays burst with pure energy'
  },

  // MOM MISSION - NURTURING HELPERS
  chefchintu: {
    name: 'Cooking Magic',
    particles: 'pink-steam-swirls',
    color: '#FF69B4',
    path: 'cooking-spiral',
    effect: 'culinary-harmony',
    duration: 3300,
    description: 'Pink steam swirls create culinary magic and harmony'
  },
  
  bubblybottle: {
    name: 'Energy Bubbles',
    particles: 'green-energy-bubbles',
    color: '#00FF7F',
    path: 'bubble-float',
    effect: 'vitality-restore',
    duration: 3000,
    description: 'Green energy bubbles float up, restoring vitality'
  },
  
  gigglesspoon: {
    name: 'Giggle Particles',
    particles: 'gold-giggle-stars',
    color: '#FFD700',
    path: 'playful-dance',
    effect: 'joy-infusion',
    duration: 2800,
    description: 'Golden giggle stars dance playfully, infusing joy'
  },
  
  peacemittens: {
    name: 'Calming Touch',
    particles: 'light-green-peace',
    color: '#98FB98',
    path: 'gentle-touch',
    effect: 'stress-dissolve',
    duration: 3500,
    description: 'Light green peace particles bring calming touch'
  },

  // SIBLINGS MISSION - HARMONY HELPERS
  gigglebox: {
    name: 'Fun Explosion',
    particles: 'rainbow-confetti',
    color: '#FF1493',
    path: 'explosion-scatter',
    effect: 'laughter-burst',
    duration: 2600,
    description: 'Rainbow confetti explodes with contagious fun'
  },
  
  peaceballoon: {
    name: 'Floating Peace',
    particles: 'blue-peace-bubbles',
    color: '#87CEFA',
    path: 'floating-up',
    effect: 'anger-lift-away',
    duration: 3400,
    description: 'Blue peace bubbles float up, lifting anger away'
  },
  
  huggypillow: {
    name: 'Comfort Fluff',
    particles: 'tan-comfort-puffs',
    color: '#DEB887',
    path: 'soft-settle',
    effect: 'sibling-bond',
    duration: 3600,
    description: 'Tan comfort puffs settle softly, bonding siblings'
  },
  
  sharebear: {
    name: 'Sharing Hearts',
    particles: 'brown-heart-sparkles',
    color: '#CD853F',
    path: 'heart-flow',
    effect: 'generosity-glow',
    duration: 3200,
    description: 'Brown heart sparkles flow, creating generosity'
  },

  // PARK MISSION - NATURE HELPERS
  leafyfriend: {
    name: 'Growth Spirals',
    particles: 'green-growth-spirals',
    color: '#228B22',
    path: 'spiral-growth',
    effect: 'nature-bloom',
    duration: 3800,
    description: 'Green growth spirals make nature bloom everywhere'
  },
  
  cleaniebucket: {
    name: 'Cleaning Sparkles',
    particles: 'blue-clean-sparkles',
    color: '#4169E1',
    path: 'cleaning-sweep',
    effect: 'pristine-shine',
    duration: 3100,
    description: 'Blue cleaning sparkles sweep, creating pristine shine'
  },
  
  bloomyflower: {
    name: 'Petal Dance',
    particles: 'pink-flower-petals',
    color: '#FF69B4',
    path: 'petal-swirl',
    effect: 'garden-bloom',
    duration: 3400,
    description: 'Pink flower petals swirl, blooming a beautiful garden'
  },
  
  sparklestar: {
    name: 'Stellar Magic',
    particles: 'gold-star-bursts',
    color: '#FFD700',
    path: 'star-burst',
    effect: 'magical-transformation',
    duration: 2900,
    description: 'Golden star bursts create magical transformation'
  }
};

// ===== MAIN COMPONENT =====
const HelperSignatureAnimation = ({ 
  helperId, 
  fromPosition = { x: 20, y: 20 },  // Helper position %
  toPosition = { x: 50, y: 50 },    // Target position %
  onAnimationComplete,
  onAnimationStart,
  containerRef
}) => {
  const [phase, setPhase] = useState('starting'); // starting -> flowing -> effecting -> completing
  const [particles, setParticles] = useState([]);
  const animationRef = useRef(null);
  const effectRef = useRef(null);
  
  // Get animation config
  const animation = SIGNATURE_ANIMATIONS[helperId];
  
  if (!animation) {
    console.error(`No signature animation found for helper: ${helperId}`);
    return null;
  }

  // ===== ANIMATION SEQUENCE =====
  
  useEffect(() => {
    if (!animation) return;
    
    console.log(`🎭 Starting signature animation: ${animation.name}`);
    onAnimationStart?.(helperId, animation.name);
    
    // Phase 1: Starting (0.5s)
    setTimeout(() => {
      setPhase('flowing');
      createParticleFlow();
    }, 500);
    
    // Phase 2: Flowing (60% of duration)
    const flowDuration = animation.duration * 0.6;
    setTimeout(() => {
      setPhase('effecting');
      createTargetEffect();
    }, 500 + flowDuration);
    
    // Phase 3: Effect completion (40% of duration)
    setTimeout(() => {
      setPhase('completing');
      completeAnimation();
    }, animation.duration);
    
    return () => {
      cleanup();
    };
  }, [helperId, animation]);

  // ===== PARTICLE SYSTEM =====
  
  const createParticleFlow = () => {
    const particleCount = getParticleCount(animation.path);
    const newParticles = [];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: `particle-${i}`,
        startX: fromPosition.x,
        startY: fromPosition.y,
        endX: toPosition.x,
        endY: toPosition.y,
        delay: (i * 100), // Stagger particles
        path: animation.path,
        color: animation.color,
        type: animation.particles
      });
    }
    
    setParticles(newParticles);
  };
  
  const getParticleCount = (path) => {
    const counts = {
      'gentle-curve': 20,
      'expanding-ripples': 30,
      'leaf-flutter': 25,
      'embracing-flow': 35,
      'flowing-stream': 40,
      'bouncy-zigzag': 15,
      'straight-beam': 50,
      'musical-swirl': 30,
      'wave-pulses': 25,
      'heroic-arc': 20,
      'radiating-burst': 45,
      'bubble-float': 35,
      'explosion-scatter': 60,
      'floating-up': 30,
      'spiral-growth': 40,
      'cleaning-sweep': 35,
      'petal-swirl': 45,
      'star-burst': 50
    };
    return counts[path] || 25;
  };

  // ===== TARGET EFFECTS =====
  
  const createTargetEffect = () => {
    const effectElement = document.createElement('div');
    effectElement.className = `signature-effect ${animation.effect}`;
    effectElement.style.cssText = `
      position: absolute;
      left: ${toPosition.x}%;
      top: ${toPosition.y}%;
      transform: translate(-50%, -50%);
      z-index: 20;
      pointer-events: none;
    `;
    
    if (containerRef?.current) {
      containerRef.current.appendChild(effectElement);
      effectRef.current = effectElement;
    }
  };

  // ===== COMPLETION =====
  
  const completeAnimation = () => {
    console.log(`✅ Signature animation completed: ${animation.name}`);
    setPhase('completing');
    
    setTimeout(() => {
      onAnimationComplete?.(helperId, animation);
    }, 500);
  };
  
  const cleanup = () => {
    if (effectRef.current && effectRef.current.parentNode) {
      effectRef.current.parentNode.removeChild(effectRef.current);
    }
    setParticles([]);
  };

  // ===== PATH CALCULATIONS =====
  
  const getParticlePath = (particle, progress) => {
    const startX = particle.startX;
    const startY = particle.startY; 
    const endX = particle.endX;
    const endY = particle.endY;
    
    switch (particle.path) {
      case 'gentle-curve':
        // Soft S-curve
        const curveOffset = Math.sin(progress * Math.PI) * 10;
        return {
          x: startX + (endX - startX) * progress + curveOffset,
          y: startY + (endY - startY) * progress
        };
        
      case 'expanding-ripples':
        // Ripple expansion from center
        const angle = (particle.id.split('-')[1] * 15) * (Math.PI / 180);
        const radius = progress * 30;
        return {
          x: startX + Math.cos(angle) * radius,
          y: startY + Math.sin(angle) * radius
        };
        
      case 'leaf-flutter':
        // Flutter like falling leaves
        const flutter = Math.sin(progress * Math.PI * 4) * 5;
        return {
          x: startX + (endX - startX) * progress + flutter,
          y: startY + (endY - startY) * progress * 0.8
        };
        
      case 'bouncy-zigzag':
        // Bouncy zigzag motion
        const bounce = Math.abs(Math.sin(progress * Math.PI * 6)) * 8;
        return {
          x: startX + (endX - startX) * progress,
          y: startY + (endY - startY) * progress + bounce
        };
        
      case 'flowing-stream':
        // Smooth flowing water
        const flow = Math.sin(progress * Math.PI * 2) * 3;
        return {
          x: startX + (endX - startX) * progress + flow,
          y: startY + (endY - startY) * progress
        };
        
      default:
        // Straight line
        return {
          x: startX + (endX - startX) * progress,
          y: startY + (endY - startY) * progress
        };
    }
  };

  // ===== RENDER =====
  
  return (
    <div 
      ref={animationRef}
      className={`signature-animation-container ${phase}`}
      data-helper={helperId}
      data-animation={animation.name}
    >
      {/* Particles */}
      {particles.map((particle, index) => (
        <div
          key={particle.id}
          className={`signature-particle ${particle.type} ${particle.path}`}
          style={{
            '--start-x': `${particle.startX}%`,
            '--start-y': `${particle.startY}%`,
            '--end-x': `${particle.endX}%`,
            '--end-y': `${particle.endY}%`,
            '--particle-color': particle.color,
            '--animation-delay': `${particle.delay}ms`,
            '--animation-duration': `${animation.duration}ms`
          }}
        />
      ))}
      
      {/* Animation Info (Debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="animation-debug">
          <p>🎭 {animation.name}</p>
          <p>⏱️ {animation.duration}ms</p>
          <p>🎨 {animation.description}</p>
          <p>📍 Phase: {phase}</p>
        </div>
      )}
    </div>
  );
};

// ===== USAGE EXAMPLE =====
const ExampleUsage = () => {
  const [currentHelper, setCurrentHelper] = useState('memoleaf');
  const containerRef = useRef(null);
  
  return (
    <div ref={containerRef} className="game-container">
      {/* Helper positioned at left */}
      <div style={{ position: 'absolute', left: '20%', top: '20%' }}>
        Helper Image
      </div>
      
      {/* Target person positioned at center */}
      <div style={{ position: 'absolute', left: '50%', top: '50%' }}>
        Target Person
      </div>
      
      {/* Signature Animation */}
      <HelperSignatureAnimation
        helperId={currentHelper}
        fromPosition={{ x: 20, y: 20 }}
        toPosition={{ x: 50, y: 50 }}
        containerRef={containerRef}
        onAnimationStart={(helperId, animationName) => {
          console.log(`🎭 Animation started: ${animationName}`);
        }}
        onAnimationComplete={(helperId, animation) => {
          console.log(`✅ Animation completed: ${animation.name}`);
          // Proceed to next phase (Ganesha blessing)
        }}
      />
    </div>
  );
};

export default HelperSignatureAnimation;