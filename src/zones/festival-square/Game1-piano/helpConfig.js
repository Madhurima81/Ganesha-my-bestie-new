// zones/festival-square/scenes/Game1-piano/helpConfig.js
// Help menu configuration for Piano Game (Festival Square)

// Import images (adjust paths as needed)
import bellsIcon from './assets/images/bells-icon.png';
import cymbalsIcon from './assets/images/cymbals-icon.png';
import recordIcon from './assets/images/record-icon.png';
import songIcon from './assets/images/song-icon.png';
import ganeshaMusician from './assets/images/ganesha-musician.png';
import musicBadge from './assets/images/music-badge.png';

// Game modes
const GAME_MODES = {
  INTRO: 'intro',
  SELECTION: 'selection',
  FREE_PLAY: 'freePlay',
  CHALLENGE: 'challenge'
};

// Phase constants
const PHASES = {
  DISCOVERY: 'discovery',
  CELEBRATION: 'celebration',
  COMPLETE: 'complete'
};

export const festivalPianoHelpConfig = {
  sceneId: 'game1-piano',
  sceneName: 'Festival Piano',
  zoneId: 'festival-square',
  
  // Dynamic hints based on game mode and phase
  getHints: (sceneState) => {
    const hints = [];
    
    // ==================== INTRO ====================
    if (sceneState.currentMode === GAME_MODES.INTRO) {
      hints.push({
        image: ganeshaMusician,
        name: 'Welcome to Music Time!',
        description: 'Learn Indian musical notes and play Ganesh songs!',
        priority: 1
      });
      
      hints.push({
        image: bellsIcon,
        name: 'Indian Music Notes',
        description: 'Discover Sa (सा), Re (रे), Ga (ग), Ma (म), Pa (प) - the building blocks of Indian music!',
        priority: 2
      });
    }
    
    // ==================== MODE SELECTION ====================
    if (sceneState.currentMode === GAME_MODES.SELECTION) {
      hints.push({
        image: musicBadge,
        name: 'Choose Your Mode',
        description: 'Free Play: Create any music! | Challenge: Complete Ganesh songs!',
        priority: 1
      });
      
      hints.push({
        image: recordIcon,
        name: 'Free Play Mode',
        description: 'Tap any keys, record your music, and play it back!',
        priority: 2
      });
      
      hints.push({
        image: songIcon,
        name: 'Challenge Mode',
        description: 'Learn 4 Ganesh songs: Jai Ganesh Deva, Gajanana, Shendur Lal, Sukh Karta!',
        priority: 3
      });
    }
    
    // ==================== FREE PLAY MODE ====================
    if (sceneState.currentMode === GAME_MODES.FREE_PLAY) {
      hints.push({
        image: bellsIcon,
        name: 'Free Play Mode',
        description: 'Tap any colored keys to create music! No wrong notes here!',
        priority: 1
      });
      
      hints.push({
        image: recordIcon,
        name: 'Record Your Music',
        description: 'Tap 🔴 to start recording. Play some notes. Tap 🔴 again to stop!',
        priority: 2
      });
      
      // If currently recording
      if (sceneState.isRecording) {
        hints.push({
          image: recordIcon,
          name: 'Recording... 🔴',
          description: 'Keep playing! Tap 🔴 again when you\'re done creating.',
          priority: 3
        });
      }
      
      // If has a recording
      if (sceneState.hasRecording) {
        hints.push({
          image: recordIcon,
          name: 'Play Your Song',
          description: 'Tap ▶️ to hear your recorded music!',
          priority: 4
        });
      }
      
      hints.push({
        image: cymbalsIcon,
        name: 'Dancing Animals',
        description: 'Watch the animals dance when you play their instruments!',
        priority: 5
      });
    }
    
    // ==================== CHALLENGE MODE ====================
    if (sceneState.currentMode === GAME_MODES.CHALLENGE) {
      
      // No song selected yet
      if (!sceneState.currentSong) {
        hints.push({
          image: songIcon,
          name: 'Challenge Mode',
          description: 'Select a Ganesh song to learn! Start with "Jai Ganesh Deva".',
          priority: 1
        });
        
        hints.push({
          image: musicBadge,
          name: '4 Ganesh Songs',
          description: 'Complete songs to unlock new ones! Each song teaches Indian music.',
          priority: 2
        });
      }
      
      // Song selected - show current song info
      if (sceneState.currentSong) {
        hints.push({
          image: songIcon,
          name: `Learning: ${sceneState.currentSong.name}`,
          description: sceneState.currentSong.culturalNote || sceneState.currentSong.description,
          priority: 1
        });
        
        // Demo is playing
        if (sceneState.isDemoPlaying) {
          hints.push({
            image: bellsIcon,
            name: 'Listen Carefully! 👂',
            description: 'Watch which colored keys light up - you\'ll need to repeat this melody!',
            priority: 2
          });
        }
        
        // User is playing
        if (sceneState.isRecording && !sceneState.isDemoPlaying) {
          const progress = sceneState.currentStep || 0;
          const total = sceneState.currentSong.melody?.length || 0;
          
          hints.push({
            image: bellsIcon,
            name: `Playing: ${progress}/${total} notes`,
            description: 'Tap the colored keys in the same order as the demo!',
            priority: 2
          });
          
          if (progress > 0 && progress < total) {
            hints.push({
              image: cymbalsIcon,
              name: 'Keep Going!',
              description: `${total - progress} more note${total - progress > 1 ? 's' : ''} to complete the song!`,
              priority: 3
            });
          }
        }
        
        hints.push({
          image: recordIcon,
          name: 'Need Help?',
          description: 'Tap 🔊 to hear the demo again!',
          priority: 4
        });
      }
      
      // Song completion
      if (sceneState.showSongComplete) {
        hints.push({
          image: musicBadge,
          name: 'Song Complete! 🎵',
          description: 'You learned a Ganesh song! Try another or play this one again!',
          priority: 1
        });
      }
    }
    
    return hints;
  },
  
  // General tips (always shown)
  generalTips: [
    'Each colored key plays a different Indian musical note!',
    'Free Play: Create and record any music you like!',
    'Challenge: Watch the demo, then repeat the melody!',
    'Complete 4 Ganesh songs to master Indian music!',
    'Animals dance when you play their instruments!'
  ]
};