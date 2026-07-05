// lib/components/coach/EnhancedGameCoach.jsx
import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import './EnhancedGameCoach.css';

const GameCoachContext = createContext();

// Zone-specific character configurations
const ZONE_CHARACTERS = {
  'symbol-mountain': {
    //name: 'Mooshika',
  baseImage: '/images/ganesha-character.webp',  // ← NEW IMAGE
    emotions: {
      happy: '/images/mooshika-happy.png',
      excited: '/images/mooshika-excited.png',
      thinking: '/images/mooshika-thinking.png',
      encouraging: '/images/mooshika-encouraging.png',
      celebrating: '/images/mooshika-celebrating.png'
    },
    personality: 'playful',
    position: 'top-right',
    culturalGreeting: 'Namaste! I\'m Mooshika, Ganesha\'s faithful companion!'
  }
};

// Message types with emotions
const MESSAGE_TYPES = {
  WELCOME: { emotion: 'happy', animation: 'bounce', priority: 5, color: '#FFD700' },
  ENCOURAGEMENT: { emotion: 'encouraging', animation: 'cheer', priority: 3, color: '#32CD32' },
  HINT: { emotion: 'thinking', animation: 'gentle', priority: 4, color: '#20B2AA' },
  CELEBRATION: { emotion: 'celebrating', animation: 'dance', priority: 6, color: '#FF6B6B' },
  WISDOM: { emotion: 'happy', animation: 'glow', priority: 5, color: '#4ECDC4' },
  GUIDANCE: { emotion: 'encouraging', animation: 'point', priority: 4, color: '#9370DB' }
};

export const GameCoachProvider = ({ children, currentZone = 'symbol-mountain' }) => {
  const [coachVisible, setCoachVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [messageQueue, setMessageQueue] = useState([]);
  const [currentEmotion, setCurrentEmotion] = useState('happy');
  const [characterAnimation, setCharacterAnimation] = useState('idle');
  const [manuallyClosedMessages, setManuallyClosedMessages] = useState(new Set());
  
  // Character configuration based on current zone
  const [coachConfig, setCoachConfig] = useState(ZONE_CHARACTERS[currentZone] || ZONE_CHARACTERS['symbol-mountain']);
  
  const dismissTimerRef = useRef(null);
  const emotionTimerRef = useRef(null);

  // Enhanced show message with character reactions
  const showMessage = (message, options = {}) => {
    const messageType = MESSAGE_TYPES[options.type] || MESSAGE_TYPES.GUIDANCE;
    const messageId = options.id || `${options.source || 'scene'}-${message.substring(0, 20)}`;
    
    // Check if manually closed
    if (manuallyClosedMessages.has(messageId)) {
      console.log(`GameCoach: Message "${message}" was manually closed, skipping`);
      return;
    }
    
    const messageData = {
      text: message,
      duration: options.duration || 6000,
      priority: messageType.priority,
      emotion: messageType.emotion,
      animation: messageType.animation,
      color: messageType.color,
      source: options.source || 'scene',
      type: options.type || 'GUIDANCE',
      id: messageId
    };

    // Set character emotion and animation immediately
    setCurrentEmotion(messageData.emotion);
    setCharacterAnimation(messageData.animation);
    
    clearAllTimers();

    if (options.immediate) {
      displayMessage(messageData);
    } else {
      setMessageQueue(prev => [...prev, messageData]);
    }
  };

  const displayMessage = (messageData) => {
    setCurrentMessage(messageData);
    setCoachVisible(true);
    
    // Character reaction sequence
    triggerCharacterReaction(messageData);
    
    // Auto-dismiss timer
    dismissTimerRef.current = setTimeout(() => {
      hideCoach();
    }, messageData.duration);
  };

  // Character reaction system
  const triggerCharacterReaction = (messageData) => {
    setCurrentEmotion(messageData.emotion);
    setCharacterAnimation(messageData.animation);
    
    // Return to base emotion after message
    emotionTimerRef.current = setTimeout(() => {
      setCurrentEmotion('happy');
      setCharacterAnimation('idle');
    }, messageData.duration - 1000);
  };

  const hideCoach = () => {
    if (currentMessage && currentMessage.id) {
      setManuallyClosedMessages(prev => new Set([...prev, currentMessage.id]));
    }
    
    setCoachVisible(false);
    clearAllTimers();
  };

  const clearAllTimers = () => {
    [dismissTimerRef, emotionTimerRef].forEach(ref => {
      if (ref.current) {
        clearTimeout(ref.current);
        ref.current = null;
      }
    });
  };

  // Process message queue
  useEffect(() => {
    if (!coachVisible && messageQueue.length > 0) {
      const sortedQueue = [...messageQueue].sort((a, b) => b.priority - a.priority);
      const nextMessage = sortedQueue[0];
      
      if (!manuallyClosedMessages.has(nextMessage.id)) {
        displayMessage(nextMessage);
        setMessageQueue(prev => prev.filter(msg => msg.id !== nextMessage.id));
      }
    }
  }, [messageQueue, coachVisible, manuallyClosedMessages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  // Smart navigation cleanup
  useEffect(() => {
    const handleNavigation = () => {
      const currentPath = window.location.pathname + window.location.hash;
      
      const isScene = currentPath.includes('/pond') || 
                     currentPath.includes('/modak') || 
                     currentPath.includes('/temple') ||
                     currentPath.includes('scene=');
      
      const isZoneWelcome = currentPath.includes('/zone-welcome') || 
                           currentPath.includes('symbol-mountain');
      
      const isMap = currentPath.includes('/map') || 
                   currentPath === '/' || 
                   currentPath.includes('home');
      
      // Clear conflicting messages
      if (currentMessage && currentMessage.source) {
        let shouldClear = false;
        
        if (isScene && currentMessage.source === 'zone') {
          shouldClear = true;
        } else if (isZoneWelcome && currentMessage.source === 'scene') {
          shouldClear = true;
        } else if (isMap && (currentMessage.source === 'zone' || currentMessage.source === 'scene')) {
          shouldClear = true;
        }
        
        if (shouldClear) {
          setCoachVisible(false);
          setCurrentMessage(null);
          setMessageQueue([]);
          clearAllTimers();
        }
      }
    };

    const checkNavigation = () => setTimeout(handleNavigation, 100);
    
    window.addEventListener('hashchange', checkNavigation);
    window.addEventListener('popstate', checkNavigation);
    
    return () => {
      window.removeEventListener('hashchange', checkNavigation);
      window.removeEventListener('popstate', checkNavigation);
    };
  }, [coachVisible, currentMessage]);

  return (
    <GameCoachContext.Provider value={{ 
      showMessage,
      hideCoach,
      setCoachConfig,
      isVisible: coachVisible,
      currentEmotion,
      characterAnimation,
      coachConfig
    }}>
      {children}
      <EnhancedGameCoach 
        visible={coachVisible}
        message={currentMessage}
        config={coachConfig}
        emotion={currentEmotion}
        animation={characterAnimation}
        onClose={hideCoach}
      />
    </GameCoachContext.Provider>
  );
};

// Enhanced coach component
const EnhancedGameCoach = ({ 
  visible, 
  message, 
  config, 
  emotion, 
  animation,
  onClose
}) => {
  if (!visible || !message) return null;

  // Get current character image based on emotion
  const getCharacterImage = () => {
    return config.emotions[emotion] || config.baseImage;
  };

  return (
    <div className={`enhanced-game-coach ${config.position} ${visible ? 'visible' : ''}`}>
      <div className={`coach-container ${animation}`}>
        
        {/* Enhanced Character */}
        <div className={`coach-character ${emotion} ${animation}`}>
          <img 
            src={getCharacterImage()} 
            alt={`${config.name} - ${emotion}`}
            className="character-image"
          />
          
          {/* Character celebration effects */}
          {emotion === 'celebrating' && (
            <div className="celebration-effects">✨🎉✨</div>
          )}
        </div>

        {/* Speech Bubble - Styled like Scene Completion */}
        <div className="coach-message">
          <div 
            className="message-bubble"
            style={{
              '--bubble-color': message.color || '#4ECDC4',
              '--bubble-border': message.color || '#45B7D1'
            }}
          >
            <div className="message-text">{message.text}</div>
          </div>
          
          {/* Enhanced close button */}
          <button className="enhanced-close-btn" onClick={onClose}>
            <span className="close-icon">×</span>
          </button>
        </div>
      </div>
      
      {/* Character name tag */}
      <div className="character-nametag">{config.name}</div>
    </div>
  );
};

// Hook to use enhanced coach
export const useGameCoach = () => {
  const context = useContext(GameCoachContext);
  if (!context) {
    throw new Error('useGameCoach must be used within GameCoachProvider');
  }
  return context;
};

// Helper components for easy usage
export const TriggerCoach = ({ message, condition, once = true, options = {} }) => {
  const { showMessage, isVisible } = useGameCoach();
  const [shown, setShown] = useState(false);
  const prevConditionRef = useRef(false);

  useEffect(() => {
    if (condition && !prevConditionRef.current && (!once || !shown) && !isVisible) {
      const messageOptions = { 
        duration: 3000,
        priority: 4,
        source: 'scene',
        ...options
      };
      
      showMessage(message, messageOptions);
      
      if (once) {
        setShown(true);
      }
    }
    
    prevConditionRef.current = condition;
  }, [condition, once, shown, showMessage, options, isVisible]);

  return null;
};

export default GameCoachProvider;