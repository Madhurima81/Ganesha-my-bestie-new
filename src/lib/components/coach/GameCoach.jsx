// GameCoach.jsx - Fixed version with all issues resolved
import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import './GameCoach.css';

// Create context for coach
const GameCoachContext = createContext();

// Coach Provider - Wrap your entire app with this
export const GameCoachProvider = ({ children, defaultConfig }) => {
  const [coachVisible, setCoachVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [messageQueue, setMessageQueue] = useState([]);
  const [manuallyClosedMessages, setManuallyClosedMessages] = useState(new Set()); // ← FIXED: Track manual closes
  const [coachConfig, setCoachConfig] = useState(defaultConfig || {
    name: 'Mooshika',
    image: '/images/mooshika-coach.png',
    position: 'top-right'
  });

  // Refs for timers to prevent closure issues
  const dismissTimerRef = useRef(null);
  const safetyTimerRef = useRef(null);
  const isProcessingRef = useRef(false);
  const debugInfoRef = useRef({
    lastMessage: '',
    lastShownAt: null,
    shouldHideAt: null,
    visibilityState: false
  });

  // 🎯 FIXED: Show a message with manual close tracking
  const showMessage = (message, options = {}) => {
    console.log(`GameCoach: Request to show message: "${message}" from source: ${options.source || 'unknown'}`);
    
    // Generate consistent message ID for tracking
    const messageId = options.id || `${options.source || 'scene'}-${message.substring(0, 20)}`;
    
    // FIXED: Check if this message was manually closed
    if (manuallyClosedMessages.has(messageId)) {
      console.log(`🚫 GameCoach: Message "${message}" was manually closed, not showing again`);
      return;
    }
    
    const messageData = {
      text: message,
      duration: options.duration || 6000,
      priority: options.priority || 0,
      animation: options.animation || 'bounce',
      source: options.source || 'scene',
      id: messageId, // Use consistent ID for tracking
        messageType: options.messageType || 'welcome'  // ← ADD THIS LINE

    };

    // Save debug info
    debugInfoRef.current.lastMessage = message;
    debugInfoRef.current.lastShownAt = new Date();
    debugInfoRef.current.shouldHideAt = new Date(Date.now() + messageData.duration);

    // Always clear any existing timers when showing a new message
    clearAllTimers();

    if (options.immediate) {
      console.log(`GameCoach: Showing message immediately: "${message}" for ${messageData.duration}ms (source: ${messageData.source})`);
      setCurrentMessage(messageData);
      setCoachVisible(true);
      debugInfoRef.current.visibilityState = true;
      
      // Set a timer for this immediate message
      scheduleMessageDismissal(messageData.duration);
    } else {
      console.log(`GameCoach: Queueing message: "${message}" (source: ${messageData.source})`);
      setMessageQueue(prev => [...prev, messageData]);
    }
  };

  // Helper function to clear all timers
  const clearAllTimers = () => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  };

  // Helper function to set dismissal timer
  const scheduleMessageDismissal = (duration) => {
    clearAllTimers();
    
    console.log(`GameCoach: Scheduling dismissal in ${duration}ms`);
    
    // Set new timer
    dismissTimerRef.current = setTimeout(() => {
      console.log('GameCoach: Primary timer fired - hiding coach');
      setCoachVisible(false);
      debugInfoRef.current.visibilityState = false;
      dismissTimerRef.current = null;
    }, duration);
    
    // Safety timer is always longer than the intended duration
    safetyTimerRef.current = setTimeout(() => {
      console.log('GameCoach: SAFETY timer fired - forcing coach hide');
      setCoachVisible(false);
      debugInfoRef.current.visibilityState = false;
      safetyTimerRef.current = null;
    }, duration + 2000);
  };

  // Process message queue - separate effect with fewer dependencies
  useEffect(() => {
    const processQueue = () => {
      if (!coachVisible && messageQueue.length > 0 && !isProcessingRef.current) {
        isProcessingRef.current = true;
        
        // Sort by priority and get the next message
        const sortedQueue = [...messageQueue].sort((a, b) => b.priority - a.priority);
        const nextMessage = sortedQueue[0];
        
        // FIXED: Check if this queued message was manually closed
        if (manuallyClosedMessages.has(nextMessage.id)) {
          console.log(`🚫 GameCoach: Queued message "${nextMessage.text}" was manually closed, skipping`);
          setMessageQueue(prev => prev.filter(msg => msg.id !== nextMessage.id));
          isProcessingRef.current = false;
          return;
        }
        
        console.log(`GameCoach: Processing queued message: "${nextMessage.text}" for ${nextMessage.duration}ms (source: ${nextMessage.source})`);
        
        // Update state
        setCurrentMessage(nextMessage);
        setCoachVisible(true);
        debugInfoRef.current.visibilityState = true;
        setMessageQueue(prev => prev.filter(msg => msg.id !== nextMessage.id));
        
        // Schedule auto-hide
        scheduleMessageDismissal(nextMessage.duration);
        
        // Reset processing flag after a small delay
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 100);
      }
    };
    
    processQueue();
  }, [messageQueue, coachVisible, manuallyClosedMessages]); // Added manuallyClosedMessages dependency

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  // 🎯 FIXED: SCREEN-AWARE CLEANUP with better navigation detection
  useEffect(() => {
    const handleNavigation = () => {
      // Get current location to determine screen type
      const currentPath = window.location.pathname + window.location.hash;
      
      // FIXED: More specific and accurate detection
      const isScene = currentPath.includes('/pond') || 
                     currentPath.includes('/modak') || 
                     currentPath.includes('/temple') ||
                     currentPath.includes('scene=') ||
                     currentPath.includes('scenes/');
      
      const isZoneWelcome = currentPath.includes('/zone-welcome') || 
                           currentPath.includes('symbol-mountain') ||
                           currentPath.includes('zone=') ||
                           currentPath.includes('zones/');
      
      const isMap = currentPath.includes('/map') || 
                   currentPath === '/' || 
                   currentPath.includes('home') ||
                   currentPath.includes('welcome');
      
      console.log('🧹 GAMECOACH: Smart navigation detected', {
        path: currentPath,
        isScene,
        isZoneWelcome,
        isMap,
        currentMessageSource: currentMessage?.source
      });
      
      // FIXED: Better cleanup logic - only clear conflicting messages
      if (currentMessage && currentMessage.source) {
        let shouldClear = false;
        let reason = '';
        
        if (isScene && currentMessage.source === 'zone') {
          shouldClear = true;
          reason = 'In scene, clearing zone messages';
        } else if (isZoneWelcome && currentMessage.source === 'scene') {
          shouldClear = true;
          reason = 'In zone welcome, clearing scene messages';
        } else if (isMap && (currentMessage.source === 'zone' || currentMessage.source === 'scene')) {
          shouldClear = true;
          reason = 'In map, clearing zone/scene messages';
        }
        
        if (shouldClear) {
          console.log(`🧹 GAMECOACH: ${reason}`);
          gracefulHide();
        }
      }
    };

    // FIXED: Graceful hide function - immediate cleanup
    const gracefulHide = () => {
      if (coachVisible) {
        console.log('🌅 GAMECOACH: Graceful hide initiated');
        
        // Immediate cleanup to prevent re-showing
        setCoachVisible(false);
        setCurrentMessage(null);
        setMessageQueue([]);
        clearAllTimers();
        isProcessingRef.current = false;
      }
    };

    // FIXED: Better navigation detection
    const checkNavigation = () => {
      setTimeout(handleNavigation, 100);
    };
    
    // Listen to various navigation events
    window.addEventListener('hashchange', checkNavigation);
    window.addEventListener('popstate', checkNavigation);
    
    // Intercept programmatic navigation
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      checkNavigation();
    };
    
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      checkNavigation();
    };
    
    return () => {
      window.removeEventListener('hashchange', checkNavigation);
      window.removeEventListener('popstate', checkNavigation);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [coachVisible, currentMessage]);

  // FIXED: Manual hide function with tracking
  const hideCoach = () => {
    console.log('GameCoach: Manual hide requested');
    
    // FIXED: Track that this message was manually closed
    if (currentMessage && currentMessage.id) {
      console.log(`🔒 GameCoach: Marking message "${currentMessage.id}" as manually closed`);
      setManuallyClosedMessages(prev => new Set([...prev, currentMessage.id]));
    }
    
    setCoachVisible(false);
    debugInfoRef.current.visibilityState = false;
    clearAllTimers();
  };

  // 🛡️ ENHANCED: Add force cleanup function
  const forceCleanup = () => {
    console.log('🧹 GAMECOACH: Force cleanup called');
    setCoachVisible(false);
    setCurrentMessage(null);
    setMessageQueue([]);
    clearAllTimers();
    isProcessingRef.current = false;
  };

  // FIXED: Add function to clear manual close tracking (for new zone visits)
  const clearManualCloseTracking = () => {
    console.log('🧹 GameCoach: Clearing manual close tracking for new zone visit');
    setManuallyClosedMessages(new Set());
  };

  // Debug function to check coach state
  const debugCoach = () => {
    return {
      ...debugInfoRef.current,
      currentVisibility: coachVisible,
      queueLength: messageQueue.length,
      manuallyClosedCount: manuallyClosedMessages.size,
      activeTimers: {
        dismissTimer: dismissTimerRef.current !== null,
        safetyTimer: safetyTimerRef.current !== null
      }
    };
  };

  return (
    <GameCoachContext.Provider value={{ 
      showMessage, 
      hideCoach, 
      forceCleanup,
      clearManualCloseTracking, // ← FIXED: Add to context
      setCoachConfig,
      isVisible: coachVisible,
      debugCoach
    }}>
      {children}
      <GameCoach 
        visible={coachVisible}
        message={currentMessage}
        config={coachConfig}
        onClose={hideCoach}
      />
    </GameCoachContext.Provider>
  );
};

// Hook to use coach in any component
export const useGameCoach = () => {
  const context = useContext(GameCoachContext);
  if (!context) {
    return {
      showMessage: () => {},
      hideCoach: () => {},
      forceCleanup: () => {},
      clearManualCloseTracking: () => {},
      setCoachConfig: () => {},
      isVisible: false,
      debugCoach: () => ({})
    };
  }
  return context;
};

const GameCoach = ({ visible, message, config, onClose }) => {
  // 💖 Heart Particles Function
  const createHeartParticles = () => {
    const hearts = ['💖', '💝', '💕', '💗', '🌟'];
    const container = document.querySelector('.coach-container');
    if (!container) return;

    for (let i = 0; i < 6; i++) {
      const heart = document.createElement('div');
      heart.className = 'heart';
      heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
      heart.style.left = Math.random() * 100 + '%';
      heart.style.animationDelay = (Math.random() * 2) + 's';
      
      container.appendChild(heart);
      
      setTimeout(() => {
        if (heart.parentNode) heart.parentNode.removeChild(heart);
      }, 3000);
    }
  };

  useEffect(() => {
  if (visible && message) {
    // Add bounce directly to character element
    setTimeout(() => {
      const character = document.querySelector('.coach-character');
      if (character) {
        character.style.animation = 'gentleFloat 4s ease-in-out infinite, excitedBounce 0.6s ease-out';
        
        // Reset to normal animation after bounce
        setTimeout(() => {
          character.style.animation = 'gentleFloat 4s ease-in-out infinite';
        }, 600);
      }
    }, 500);

    // Show hearts for positive messages
    if (message.text.includes('Amazing') || 
        message.text.includes('Wonderful') || 
        message.text.includes('Incredible')) {
      setTimeout(() => createHeartParticles(), 800);
    }
  }
}, [visible, message]);

  if (!visible || !message) return null;
return (
  <div className={`game-coach ${config.position} ${visible ? 'visible' : ''}`}>
    <div className={`coach-container ${message.animation}`}>
      <div className="coach-character">
        <img src={config.image} alt={config.name} />
        {/* ✨ MOVE HEARTS HERE - inside character div */}
        <div className="heart-particles"></div>
      </div>
      
      <div className="coach-message">
        <div className={`message-bubble ${message.messageType || 'welcome'}`}>
          {message.text}
        </div>
        <button className="close-btn" onClick={onClose}></button>
      </div>
    </div>
  </div>
);
};

// Pre-configured message sets
export const CoachMessages = {
  WELCOME: {
    pond: "Welcome to the magical pond! Click the lotus flowers to begin.",
    temple: "The ancient temple awaits! Solve its mysteries.",
    garden: "What a beautiful garden! Let's explore together."
  },
  
  ENCOURAGEMENT: [
    "You're doing great! Keep going!",
    "Almost there! Don't give up!",
    "Fantastic work! You're a natural!",
    "Wow! You're really getting the hang of this!",
    "Keep it up! You're making great progress!"
  ],
  
  HINTS: {
    stuck: "Hmm, looks like you might be stuck. Try looking around!",
    almostDone: "You're so close! Just a little more!",
    tryAgain: "Don't worry, everyone makes mistakes. Try again!",
    checkCarefully: "Take your time and look carefully."
  },
  
  COMPLETION: {
    scene: "Amazing! You've completed this scene!",
    zone: "Incredible! You've mastered this entire zone!",
    game: "Congratulations! You've completed the entire game!"
  },
  
  // 🎯 ZONE-SPECIFIC MESSAGES
  ZONE_WELCOME: {
    first_visit: (zoneName) => `Welcome to ${zoneName}! Your adventure begins here. Click on Scene 1 to start!`,
    returning: (zoneName, completed, total) => `Welcome back to ${zoneName}! You've completed ${completed} of ${total} scenes. Keep going!`,
    complete: (zoneName) => `Amazing! You've mastered all of ${zoneName}! You're ready for the next zone!`
  },
  
  // Added specific messages from your pond scene flow
  POND: {
    firstLotus: "Wonderful! You found your first lotus flower!",
    secondLotus: "Just one more lotus to find! You're doing great!",
    thirdLotus: "Great job! You found all the lotus flowers!",
    goldenLotusAppears: "Amazing! All the lotuses have bloomed and revealed a golden lotus!",
    goldenLotusPrompt: "The golden lotus is special - click it to learn more!",
    goldenLotusClicked: "The golden lotus is special in ancient traditions!",
    elephantAppears: "Look! An elephant has appeared! In Indian mythology, elephants are sacred animals.",
    elephantPrompt: "The elephant represents Lord Ganesha. Click it to see what happens!",
    elephantClicked: "The elephant's trunk represents Ganesha, who removes obstacles!",
    sceneComplete: "You've mastered the pond scene! On to the next adventure!"
  }
};

// Progress-based coach that shows messages automatically
export const ProgressCoach = ({ children, sceneId, sceneState }) => {
  const { showMessage, isVisible, debugCoach } = useGameCoach();
  const [shownMessages, setShownMessages] = useState({});
  const welcomeShownRef = useRef(false);
  
  // Track component mount status to prevent state updates after unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Set ref to track mount status
    isMountedRef.current = true;
    
    // Reset welcome shown flag when scene changes
    welcomeShownRef.current = false;
    
    return () => {
      isMountedRef.current = false;
    };
  }, [sceneId]);

  // Debug mechanism
  useEffect(() => {
    // Creates a reset mechanism if coach gets stuck visible
    const debugTimer = setInterval(() => {
      const debug = debugCoach();
      
      // If coach thinks it's visible but there are no active timers
      // and it's been more than 10 seconds since it should have hidden
      if (debug.visibilityState && 
          !debug.activeTimers.dismissTimer && 
          !debug.activeTimers.safetyTimer && 
          debug.shouldHideAt && 
          new Date() - debug.shouldHideAt > 10000) {
        
        console.log("ProgressCoach: DEBUG - Detected stuck coach, forcing hide");
        showMessage("", { duration: 0, immediate: true });
      }
    }, 5000);
    
    return () => clearInterval(debugTimer);
  }, [debugCoach, showMessage]);

  return children;
};

// Helper to trigger specific messages
export const TriggerCoach = ({ message, condition, once = true, options = {} }) => {
  const { showMessage, isVisible } = useGameCoach();
  const [shown, setShown] = useState(false);
  const prevConditionRef = useRef(false);
  const messageRef = useRef(message);
  
  // Update the messageRef if message changes
  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  useEffect(() => {
    // Only trigger when condition changes from false to true
    // and only if coach is not currently visible (to avoid message pileup)
    if (condition && !prevConditionRef.current && (!once || !shown) && !isVisible) {
      console.log(`TriggerCoach: Condition met for message: "${messageRef.current}"`);
      
      // Default duration is 3 seconds as per your flow
      const messageOptions = { 
        duration: 3000,
        priority: 4,
        source: 'scene', // Default to scene source
        ...options
      };
      
      showMessage(messageRef.current, messageOptions);
      
      if (once) {
        setShown(true);
      }
    }
    
    prevConditionRef.current = condition;
  }, [condition, once, shown, showMessage, options, isVisible]);

  return null;
};

export default GameCoachProvider;
