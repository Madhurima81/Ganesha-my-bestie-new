import React, { useState, useEffect } from 'react';
import './FavoriteFoodGame.css';
import AboutMeCompletion from "../components/Aboutmecompletion";

// Import images
import foodBg from './assets/images/food-bg.png';
import foodBg1 from './assets/images/food-bg1.png';
import babyGaneshaImg from './assets/images/baby-ganesha.png';
import babyGaneshaSit from './assets/images/baby-ganesha-sit.png';

// Food images
import modakImg from './assets/images/modak-aboutme.png';
import ladooImg from './assets/images/ladoo.png';
import dosaImg from './assets/images/dosa.png';

// Animal images
import mouseImg from './assets/images/mouse.png';
import cowImg from './assets/images/cow.png';
import peacockImg from './assets/images/peacock.png';

const FavoriteFoodGame = ({ onComplete, onBack, onNavigate }) => {
  const [gamePhase, setGamePhase] = useState('intro'); // intro, food-choice, food-correct, friend-intro, friend-choice, friend-correct, ending
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showShake, setShowShake] = useState(null);
  const [wrongChoices, setWrongChoices] = useState(new Set()); // Track wrong choices
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [gameState, setGameState] = useState({
    stars: 2, // Food + Friend = 2 stars
    completed: false
  });

  const foods = [
    { id: 'modak', name: 'Modak', image: modakImg, emoji: '🥟', correct: true },
    { id: 'ladoo', name: 'Ladoo', image: ladooImg, emoji: '🍪', correct: false },
    { id: 'dosa', name: 'Dosa', image: dosaImg, emoji: '🥞', correct: false }
  ];

  const friends = [
    { id: 'mouse', name: 'Mushika', image: mouseImg, emoji: '🐭', correct: true },
    { id: 'cow', name: 'Cow', image: cowImg, emoji: '🐮', correct: false },
    { id: 'peacock', name: 'Peacock', image: peacockImg, emoji: '🦚', correct: false }
  ];

  // Start game after intro
  const handleStartGame = () => {
    setGamePhase('food-choice');
  };

  // Handle food selection
  const handleFoodClick = (foodId) => {
    // Don't allow clicking wrong choices again
    if (wrongChoices.has(foodId)) return;
    
    const food = foods.find(f => f.id === foodId);
    
    if (food.correct) {
      // Correct choice!
      setSelectedFood(foodId);
      setGamePhase('food-correct');
      
      // Move to friend intro after celebration
      setTimeout(() => {
        setGamePhase('friend-intro');
      }, 2500);
    } else {
      // Wrong choice - shake, show red X, fade out, and disable
      setShowShake(foodId);
      
      // Add to wrong choices after animation starts
      setTimeout(() => {
        setWrongChoices(prev => new Set([...prev, foodId]));
      }, 100);
      
      // Clear shake after animation
      setTimeout(() => {
        setShowShake(null);
      }, 500);
    }
  };

  // Start friend selection
  const handleStartFriendChoice = () => {
    setWrongChoices(new Set()); // Reset wrong choices for friend phase
    setGamePhase('friend-choice');
  };

  // Handle friend selection
  const handleFriendClick = (friendId) => {
    // Don't allow clicking wrong choices again
    if (wrongChoices.has(friendId)) return;
    
    const friend = friends.find(f => f.id === friendId);
    
    if (friend.correct) {
      // Correct choice!
      setSelectedFriend(friendId);
      setGamePhase('friend-correct');
      
      // Move to ending after celebration
      setTimeout(() => {
        setGamePhase('ending');
        setGameState(prev => ({ ...prev, completed: true }));
        
        // Show completion screen
        setTimeout(() => {
          setShowSceneCompletion(true);
        }, 3000);
      }, 2500);
    } else {
      // Wrong choice - shake, show red X, fade out, and disable
      setShowShake(friendId);
      
      // Add to wrong choices after animation starts
      setTimeout(() => {
        setWrongChoices(prev => new Set([...prev, friendId]));
      }, 100);
      
      // Clear shake after animation
      setTimeout(() => {
        setShowShake(null);
      }, 500);
    }
  };

  return (
    <div className="favorite-food-game">
      {/* Background Image */}
      <img src={foodBg} alt="Background" className="food-background" />

      {/* Intro Screen */}
      {gamePhase === 'intro' && (
        <div className="intro-overlay">
          <img 
            src={babyGaneshaImg} 
            alt="Baby Ganesha" 
            className="intro-ganesha bounce"
          />
          <div className="intro-speech">
            <p className="intro-text">Can you find my favourite food?</p>
            <button className="start-btn" onClick={handleStartGame}>
              Let's Find! 🌟
            </button>
          </div>
        </div>
      )}

      {/* Back Button (always visible during gameplay) */}
      {gamePhase !== 'intro' && !showSceneCompletion && (
        <button className="back-btn" onClick={onBack}>← Back</button>
      )}

      {/* Food Choice Screen */}
      {gamePhase === 'food-choice' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          
          <div className="speech-bubble">
            Which one is my favorite? 🍬
          </div>

          <div className="choices-container">
            {foods.map((food, index) => (
              <button
                key={food.id}
                className={`choice-card ${showShake === food.id ? 'shake' : ''} ${wrongChoices.has(food.id) ? 'wrong' : ''} bounce-gentle`}
                onClick={() => handleFoodClick(food.id)}
                style={{ animationDelay: `${index * 0.2}s` }}
                disabled={wrongChoices.has(food.id)}
              >
                <div className="choice-image-container">
                  <img src={food.image} alt={food.name} className="choice-image" />
                </div>
                <div className="choice-name">{food.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Food Correct - Celebration */}
      {gamePhase === 'food-correct' && (
        <div className="correct-screen">
          <div className="ganesha-happy">
            <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate" />
          </div>
          
          <div className="correct-food">
            <img 
              src={foods.find(f => f.id === selectedFood).image} 
              alt="Modak" 
              className="food-in-hand pop-in"
            />
          </div>

          <div className="celebration-sparkles">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="sparkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`
                }}
              >
                ✨
              </div>
            ))}
          </div>

          <div className="success-message">
            Yes! Modak is my favorite! 🎉
          </div>
        </div>
      )}

      {/* Friend Intro */}
      {gamePhase === 'friend-intro' && (
        <div className="intro-overlay">
          <img 
            src={babyGaneshaImg} 
            alt="Baby Ganesha" 
            className="intro-ganesha bounce"
          />
          <div className="intro-speech">
            <p className="intro-text">Great! Now find my best friend!</p>
            <button className="start-btn" onClick={handleStartFriendChoice}>
              Find Friend! 🌟
            </button>
          </div>
        </div>
      )}

      {/* Friend Choice Screen */}
      {gamePhase === 'friend-choice' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          
          <div className="speech-bubble">
            Who is my best friend? 🤔
          </div>

          <div className="choices-container">
            {friends.map((friend, index) => (
              <button
                key={friend.id}
                className={`choice-card ${showShake === friend.id ? 'shake' : ''} ${wrongChoices.has(friend.id) ? 'wrong' : ''} bounce-gentle`}
                onClick={() => handleFriendClick(friend.id)}
                style={{ animationDelay: `${index * 0.2}s` }}
                disabled={wrongChoices.has(friend.id)}
              >
                <div className="choice-image-container">
                  <img src={friend.image} alt={friend.name} className="choice-image" />
                </div>
                <div className="choice-name">{friend.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Friend Correct - Celebration */}
      {gamePhase === 'friend-correct' && (
        <div className="correct-screen">
          <div className="friends-together">
            <img src={babyGaneshaSit} alt="Ganesha" className="ganesha-with-friend" />
            <img 
              src={friends.find(f => f.id === selectedFriend).image} 
              alt="Mouse" 
              className="friend-character pop-in"
            />
          </div>

          <div className="celebration-sparkles">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="sparkle heart"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`
                }}
              >
                💕
              </div>
            ))}
          </div>

          <div className="success-message">
            Yes! Mushika is my best friend! 🐭✨
          </div>
        </div>
      )}

      {/* Ending Screen */}
      {gamePhase === 'ending' && !showSceneCompletion && (
        <div className="ending-screen">
          <div className="final-display">
            <img src={babyGaneshaSit} alt="Ganesha" className="ganesha-final" />
            <img 
              src={foods.find(f => f.id === selectedFood).image} 
              alt="Modak" 
              className="final-food"
            />
            <img 
              src={friends.find(f => f.id === selectedFriend).image} 
              alt="Mouse" 
              className="final-friend"
            />
          </div>

          <div className="final-message">
            <h2 className="final-title">Perfect! 🌟</h2>
            <p className="final-text">
              This is my favourite food and my best friend!
            </p>
          </div>

          <div className="badge-container">
            <div className="badge-earned pop-in">
              🎖️ Super Finder!
            </div>
          </div>
        </div>
      )}

      {/* About Me Completion Screen */}
      {showSceneCompletion && (
        <AboutMeCompletion
          show={showSceneCompletion}
          sceneName="My Favorite Things"
          sceneNumber={2}
          totalScenes={4}
          starsEarned={gameState.stars}
          totalStars={2}
          discoveredBadges={['food-finder', 'friend-finder', 'super-finder', 'memory-maker']}
          badgeImages={{}}
          characterImages={{
            babyGanesha: babyGaneshaImg
          }}
          nextSceneName="Spell GANESHA"
          childName="super finder"
          
          onContinue={() => {
            console.log('🍬 FAVORITE FOOD CONTINUE: Moving to next game');
            
            setTimeout(() => {
              if (onNavigate) {
                onNavigate('game3');
              } else if (onComplete) {
                onComplete();
              }
            }, 100);
          }}
          
          onReplay={() => {
            console.log('🎮 FAVORITE FOOD REPLAY: Play Again');
            
            setGamePhase('intro');
            setSelectedFood(null);
            setSelectedFriend(null);
            setShowShake(null);
            setWrongChoices(new Set()); // Reset wrong choices
            setShowSceneCompletion(false);
            setGameState({
              stars: 2,
              completed: false
            });
          }}
          
          onBackToMap={() => {
            console.log('🗺️ FAVORITE FOOD MAP: Back to About Me Hut');
            
            if (onNavigate) {
              onNavigate('zone-welcome');
            } else if (onBack) {
              onBack();
            }
          }}
          
          onHome={() => {
            if (onNavigate) {
              onNavigate('home');
            }
          }}
        />
      )}
    </div>
  );
};

export default FavoriteFoodGame;