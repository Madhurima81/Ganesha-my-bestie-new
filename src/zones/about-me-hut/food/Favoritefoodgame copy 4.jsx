import React, { useState, useEffect } from 'react';
import './FavoriteFoodGame.css';
import AboutMeCompletion from "../components/Aboutmecompletion";
import DrawingPad from '../components/Drawingpad'; // ADD THIS LINE

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
const [gamePhase, setGamePhase] = useState('intro');
// Phases: intro, food-choice, food-correct, friend-intro, friend-choice, friend-correct,
// color-choice, color-correct, activity-choice, activity-correct,
// child-intro, child-food-choice, child-food-drawing, child-color-choice,
// child-activity-choice, child-activity-drawing, child-friend-intro, child-friend-input,
// comparison-card, ending

  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showShake, setShowShake] = useState(null);
  const [wrongChoices, setWrongChoices] = useState(new Set()); // Track wrong choices
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [gameState, setGameState] = useState({
    stars: 2, // Food + Friend = 2 stars
    completed: false
  });

// ADD THESE NEW STATES:
const [showDrawingPad, setShowDrawingPad] = useState(false);
const [drawingMode, setDrawingMode] = useState(null); // 'food' or 'activity'
const [childFoodDrawing, setChildFoodDrawing] = useState(null);
const [childActivityDrawing, setChildActivityDrawing] = useState(null);
const [childFoodChoice, setChildFoodChoice] = useState(null);
const [childActivityChoice, setChildActivityChoice] = useState(null);
const [childColor, setChildColor] = useState(null);
const [childColorName, setChildColorName] = useState('');
const [childFriendName, setChildFriendName] = useState('');
const [childFriendLetters, setChildFriendLetters] = useState([]);
const [ganeshaColor] = useState('red');
const [ganeshaActivity] = useState('eating-sweets');
// Add this near your other useState hooks
const [correctChoiceId, setCorrectChoiceId] = useState(null);

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

  // Ganesha's color choices
const colors = [
  { id: 'red', name: 'Red', color: '#FF0000', emoji: '❤️', correct: true },
  { id: 'orange', name: 'Orange', color: '#FFA500', emoji: '🧡', correct: false },
  { id: 'yellow', name: 'Yellow', color: '#FFFF00', emoji: '💛', correct: false },
  { id: 'green', name: 'Green', color: '#00FF00', emoji: '💚', correct: false }
];

// Ganesha's activity choices
const activities = [
  { id: 'eating-sweets', name: 'Eating Sweets', emoji: '🍬', correct: true },
  { id: 'dancing', name: 'Dancing', emoji: '💃', correct: false },
  { id: 'reading', name: 'Reading', emoji: '📚', correct: false },
  { id: 'playing', name: 'Playing', emoji: '🎮', correct: false }
];

// Kid's food choices
const kidFoods = [
  { id: 'pizza', name: 'Pizza', emoji: '🍕' },
  { id: 'burger', name: 'Burger', emoji: '🍔' },
  { id: 'ice-cream', name: 'Ice Cream', emoji: '🍦' },
  { id: 'dosa', name: 'Dosa', emoji: '🥞' },
  { id: 'noodles', name: 'Noodles', emoji: '🍜' },
  { id: 'fruit', name: 'Fruit', emoji: '🍎' },
  { id: 'rice', name: 'Rice', emoji: '🍚' },
  { id: 'pasta', name: 'Pasta', emoji: '🍝' }
];

// Kid's activity choices
const kidActivities = [
  { id: 'sports', name: 'Playing Sports', emoji: '⚽' },
  { id: 'reading', name: 'Reading', emoji: '📚' },
  { id: 'drawing', name: 'Drawing', emoji: '🎨' },
  { id: 'dancing', name: 'Dancing', emoji: '💃' },
  { id: 'tv', name: 'Watching TV', emoji: '📺' },
  { id: 'games', name: 'Playing Games', emoji: '🎮' }
];

// Kid's color palette
const kidColors = [
  { id: 'red', name: 'Red', color: '#FF0000', emoji: '❤️' },
  { id: 'orange', name: 'Orange', color: '#FFA500', emoji: '🧡' },
  { id: 'yellow', name: 'Yellow', color: '#FFFF00', emoji: '💛' },
  { id: 'green', name: 'Green', color: '#00FF00', emoji: '💚' },
  { id: 'blue', name: 'Blue', color: '#0000FF', emoji: '💙' },
  { id: 'purple', name: 'Purple', color: '#800080', emoji: '💜' },
  { id: 'pink', name: 'Pink', color: '#FFC0CB', emoji: '💗' },
  { id: 'brown', name: 'Brown', color: '#8B4513', emoji: '🤎' },
  { id: 'black', name: 'Black', color: '#000000', emoji: '🖤' },
  { id: 'white', name: 'White', color: '#FFFFFF', emoji: '🤍' },
  { id: 'gray', name: 'Gray', color: '#808080', emoji: '🩶' },
  { id: 'teal', name: 'Teal', color: '#4ECDC4', emoji: '💚' }
];

// Alphabet for friend name
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Start game after intro
  const handleStartGame = () => {
    setGamePhase('food-choice');
  };

  // Handle food selection
const handleFoodClick = (foodId) => {
    if (wrongChoices.has(foodId) || correctChoiceId) return; // Block clicks
    
    const food = foods.find(f => f.id === foodId);
    
    if (food.correct) {
      // 1. Trigger the "Pop" animation
      setCorrectChoiceId(foodId); 
      
      // 2. Wait 1 second for animation to play, THEN switch screens
      setTimeout(() => {
        setSelectedFood(foodId);
        setGamePhase('food-correct');
        setCorrectChoiceId(null); // Reset for next round
        
        // Move to friend intro after celebration
        setTimeout(() => {
          setGamePhase('friend-intro');
        }, 2500);
      }, 1000); // 1 second delay
      
    } else {
      // Wrong choice logic (keep existing)
      setShowShake(foodId);
      setTimeout(() => {
        setWrongChoices(prev => new Set([...prev, foodId]));
      }, 100);
      setTimeout(() => setShowShake(null), 500);
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
  setGamePhase('color-choice'); // Changed from 'ending'
  setWrongChoices(new Set()); // Reset for color phase
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

  // Handle Ganesha's color choice
const handleColorClick = (colorId) => {
  if (wrongChoices.has(colorId)) return;
  
  const color = colors.find(c => c.id === colorId);
  
  if (color.correct) {
    setGamePhase('color-correct');
    setTimeout(() => setGamePhase('activity-choice'), 2500);
  } else {
    setShowShake(colorId);
    setTimeout(() => {
      setWrongChoices(prev => new Set([...prev, colorId]));
    }, 100);
    setTimeout(() => setShowShake(null), 500);
  }
};

// Handle Ganesha's activity choice
const handleActivityClick = (activityId) => {
  if (wrongChoices.has(activityId)) return;
  
  const activity = activities.find(a => a.id === activityId);
  
  if (activity.correct) {
    setGamePhase('activity-correct');
    setTimeout(() => {
      setGamePhase('child-intro');
      setWrongChoices(new Set()); // Reset for kid's turn
    }, 2500);
  } else {
    setShowShake(activityId);
    setTimeout(() => {
      setWrongChoices(prev => new Set([...prev, activityId]));
    }, 100);
    setTimeout(() => setShowShake(null), 500);
  }
};

// Handle kid's food selection
const handleKidFoodClick = (foodId) => {
  setChildFoodChoice(foodId);
  setGamePhase('child-color-choice');
};

// Handle "Draw Food" button
const handleDrawFood = () => {
  setDrawingMode('food');
  setShowDrawingPad(true);
};

// Handle food drawing save
const handleFoodDrawingSave = (imageData) => {
  setChildFoodDrawing(imageData);
  setShowDrawingPad(false);
  setDrawingMode(null);
  setGamePhase('child-color-choice');
};

// Handle kid's color selection
const handleKidColorClick = (colorId) => {
  const selectedColor = kidColors.find(c => c.id === colorId);
  setChildColor(selectedColor.color);
  setChildColorName(selectedColor.name);
  setGamePhase('child-activity-choice');
};

// Handle kid's activity selection
const handleKidActivityClick = (activityId) => {
  setChildActivityChoice(activityId);
  setGamePhase('child-friend-intro');
};

// Handle "Draw Activity" button
const handleDrawActivity = () => {
  setDrawingMode('activity');
  setShowDrawingPad(true);
};

// Handle activity drawing save
const handleActivityDrawingSave = (imageData) => {
  setChildActivityDrawing(imageData);
  setShowDrawingPad(false);
  setDrawingMode(null);
  setGamePhase('child-friend-intro');
};

// Handle friend name letter click
const handleFriendLetterClick = (letter) => {
  setChildFriendLetters(prev => [...prev, letter]);
};

// Handle friend name backspace
const handleFriendBackspace = () => {
  setChildFriendLetters(prev => prev.slice(0, -1));
};

// Handle friend name confirm
const handleFriendConfirm = () => {
  const name = childFriendLetters.join('');
  if (name.length < 2) return;
  
  setChildFriendName(name);
  
  // Save to localStorage
  localStorage.setItem('childFavorites', JSON.stringify({
    food: childFoodChoice,
    foodDrawing: childFoodDrawing,
    color: childColor,
    colorName: childColorName,
    activity: childActivityChoice,
    activityDrawing: childActivityDrawing,
    friend: name
  }));
  
  setGamePhase('comparison-card');
};

// Handle drawing cancel
const handleDrawingCancel = () => {
  setShowDrawingPad(false);
  setDrawingMode(null);
  // Go back to previous phase
  if (drawingMode === 'food') {
    setGamePhase('child-food-choice');
  } else if (drawingMode === 'activity') {
    setGamePhase('child-activity-choice');
  }
};

  return (
    <div className="favorite-food-game">
      {/* Background Image */}
      <img src={foodBg} alt="Background" className="food-background" />

      {/* Intro Screen */}
{/* SHARED INTRO MODAL (Matches Family Tree Structure) */}
      {gamePhase === 'intro' && (
        <div className="game-modal-overlay" id="favorite-food-intro">
          <div className="game-modal-content">
            
            {/* Character */}
            <div className="game-modal-character">
              <img src={babyGaneshaImg} alt="Baby Ganesha" />
            </div>

            {/* Card */}
            <div className="game-modal-card">
              <h1 className="game-modal-title">The Favorites Match!</h1>
              
              <p className="game-modal-subtitle">
                I have some things I love more than anything!<br />
                Can you guess my favorites?<br />
                Then, I want to hear all about yours! 💛
              </p>

              {/* Icons Row */}
              <div className="game-modal-icons">
                
                {/* 1. Food (Image) */}
                <div className="game-modal-icon-item">
                  <div className="game-modal-icon-circle">
                    <img src={modakImg} alt="Modak" />
                  </div>
                  <span className="game-modal-icon-label">Food</span>
                </div>

                {/* 2. Color (Emoji) */}
                <div className="game-modal-icon-item">
                  <div className="game-modal-icon-circle" style={{background: '#FFF0F5', borderColor: '#FFC1E3'}}>
                    <span style={{fontSize: '2rem'}}>🎨</span>
                  </div>
                  <span className="game-modal-icon-label">Color</span>
                </div>

                {/* 3. Activity (Emoji) */}
                <div className="game-modal-icon-item">
                  <div className="game-modal-icon-circle" style={{background: '#F0F4C3', borderColor: '#E6EE9C'}}>
                     <span style={{fontSize: '2rem'}}>🍬</span>
                  </div>
                  <span className="game-modal-icon-label">Activity</span>
                </div>

              </div>

              <button className="game-modal-button" onClick={handleStartGame}>
                Let's Play Guessing! 🌟
              </button>
            </div>
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
  // ADD THE CHECK FOR 'correct' HERE 👇
  className={`choice-card ${showShake === food.id ? 'shake' : ''} ${wrongChoices.has(food.id) ? 'wrong' : ''} ${correctChoiceId === food.id ? 'correct' : ''} bounce-gentle`}
  onClick={() => handleFoodClick(food.id)}
  style={{ animationDelay: `${index * 0.2}s` }}
  // DISABLE IF CORRECT SEQUENCE IS PLAYING 👇
  disabled={wrongChoices.has(food.id) || correctChoiceId !== null}
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
{/* Friend Intro - WITH SEPARATE CLASSES */}
      {gamePhase === 'friend-intro' && (
        <div className="intro-overlay">
          {/* Keep the floating Ganesha */}
          <img 
            src={babyGaneshaImg} 
            alt="Baby Ganesha" 
            className="intro-ganesha bounce"
          />
          
          {/* New Specific Box Container */}
          <div className="friend-intro-box">
            <h2 className="friend-intro-text">Great! Now find my best friend!</h2>
            <button className="friend-intro-btn" onClick={handleStartFriendChoice}>
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
  // ADD THE CHECK FOR 'correct' HERE 👇
  className={`choice-card ${showShake === friend.id ? 'shake' : ''} ${wrongChoices.has(friend.id) ? 'wrong' : ''} ${correctChoiceId === friend.id ? 'correct' : ''} bounce-gentle`}
  onClick={() => handleFriendClick(friend.id)}
  style={{ animationDelay: `${index * 0.2}s` }}
  // DISABLE 👇
  disabled={wrongChoices.has(friend.id) || correctChoiceId !== null}
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

      {/* Ganesha's Color Choice - NEW! */}
      {gamePhase === 'color-choice' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          
          <div className="speech-bubble">
            What's my favorite color? 🎨
          </div>

          <div className="choices-container">
            {colors.map((color, index) => (
     <button
  key={color.id}
  // ADD THE CHECK FOR 'correct' HERE 👇
  className={`choice-card ${showShake === color.id ? 'shake' : ''} ${wrongChoices.has(color.id) ? 'wrong' : ''} ${correctChoiceId === color.id ? 'correct' : ''} bounce-gentle`}
  onClick={() => handleColorClick(color.id)}
  style={{ animationDelay: `${index * 0.2}s` }}
  // DISABLE 👇
  disabled={wrongChoices.has(color.id) || correctChoiceId !== null}
>
                <div className="choice-image-container">
                  <div className="color-circle" style={{ backgroundColor: color.color }}>
                    {color.emoji}
                  </div>
                </div>
                <div className="choice-name">{color.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Correct */}
      {gamePhase === 'color-correct' && (
        <div className="correct-screen">
          <div className="ganesha-happy">
            <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate" />
          </div>
          
          <div className="correct-food">
            <div className="color-circle-large" style={{ backgroundColor: '#FF0000' }}>
              ❤️
            </div>
          </div>

          <div className="celebration-sparkles">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="sparkle" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`
              }}>✨</div>
            ))}
          </div>

          <div className="success-message">
            Yes! Red is my favorite color! ❤️
          </div>
        </div>
      )}

      {/* Ganesha's Activity Choice - NEW! */}
      {gamePhase === 'activity-choice' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          
          <div className="speech-bubble">
            What do I love to do? 🤔
          </div>

          <div className="choices-container">
            {activities.map((activity, index) => (
         <button
  key={activity.id}
  // ADD THE CHECK FOR 'correct' HERE 👇
  className={`choice-card ${showShake === activity.id ? 'shake' : ''} ${wrongChoices.has(activity.id) ? 'wrong' : ''} ${correctChoiceId === activity.id ? 'correct' : ''} bounce-gentle`}
  onClick={() => handleActivityClick(activity.id)}
  style={{ animationDelay: `${index * 0.2}s` }}
  // DISABLE 👇
  disabled={wrongChoices.has(activity.id) || correctChoiceId !== null}
>
                <div className="choice-image-container">
                  <div className="activity-emoji">
                    {activity.emoji}
                  </div>
                </div>
                <div className="choice-name">{activity.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activity Correct */}
      {gamePhase === 'activity-correct' && (
        <div className="correct-screen">
          <div className="ganesha-happy">
            <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate" />
          </div>
          
          <div className="correct-food">
            <div className="activity-emoji-large">🍬</div>
          </div>

          <div className="celebration-sparkles">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="sparkle" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`
              }}>✨</div>
            ))}
          </div>

          <div className="success-message">
            Yes! I love eating sweets! 🍬✨
          </div>
        </div>
      )}

      {/* Child Intro */}
      {gamePhase === 'child-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="intro-speech">
            <p className="intro-text">Now I want to know about YOU!</p>
            <p className="intro-text">Tell me your favorites! 🌟</p>
            <button className="start-btn" onClick={() => setGamePhase('child-food-choice')}>
              Tell You About Me! ✨
            </button>
          </div>
        </div>
      )}

      {/* Child Food Choice */}
      {gamePhase === 'child-food-choice' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          
          <div className="speech-bubble">
            What's YOUR favorite food? 🍕
          </div>

          <div className="kid-choices-grid">
            {kidFoods.map((food, index) => (
              <button
                key={food.id}
                className="kid-choice-card bounce-gentle"
                onClick={() => handleKidFoodClick(food.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="kid-choice-emoji">{food.emoji}</div>
                <div className="kid-choice-name">{food.name}</div>
              </button>
            ))}
          </div>

          <button className="draw-button" onClick={handleDrawFood}>
            ✏️ Or Draw My Own!
          </button>
        </div>
      )}

      {/* Drawing Pad Overlay */}
      {showDrawingPad && (
        <div className="drawing-overlay">
          <DrawingPad
            prompt={drawingMode === 'food' ? "Draw your favorite food! 🍕" : "Draw your favorite activity! ⚽"}
            onSave={drawingMode === 'food' ? handleFoodDrawingSave : handleActivityDrawingSave}
            onCancel={handleDrawingCancel}
          />
        </div>
      )}

      {/* Child Color Choice */}
      {gamePhase === 'child-color-choice' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          
          <div className="speech-bubble">
            What's YOUR favorite color? 🎨
          </div>

          <div className="color-palette-grid">
            {kidColors.map((color, index) => (
              <button
                key={color.id}
                className="color-choice-button bounce-gentle"
                onClick={() => handleKidColorClick(color.id)}
                style={{ 
                  backgroundColor: color.color,
                  animationDelay: `${index * 0.05}s`
                }}
                title={color.name}
              >
                {color.emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Child Activity Choice */}
      {gamePhase === 'child-activity-choice' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          
          <div className="speech-bubble">
            What do YOU love to do? 🎮
          </div>

          <div className="kid-choices-grid">
            {kidActivities.map((activity, index) => (
              <button
                key={activity.id}
                className="kid-choice-card bounce-gentle"
                onClick={() => handleKidActivityClick(activity.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="kid-choice-emoji">{activity.emoji}</div>
                <div className="kid-choice-name">{activity.name}</div>
              </button>
            ))}
          </div>

          <button className="draw-button" onClick={handleDrawActivity}>
            ✏️ Or Draw My Activity!
          </button>
        </div>
      )}

      {/* Child Friend Intro */}
      {gamePhase === 'child-friend-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="intro-speech">
            <p className="intro-text">Who is YOUR best friend? 👫</p>
            <button className="start-btn" onClick={() => setGamePhase('child-friend-input')}>
              Tell You! 💕
            </button>
          </div>
        </div>
      )}

      {/* Child Friend Input */}
      {gamePhase === 'child-friend-input' && (
        <div className="friend-input-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          
          <div className="speech-bubble">
            Spell your friend's name! ✨
          </div>

          <div className="friend-name-display">
            {childFriendLetters.length === 0 ? (
              <div className="name-placeholder">Friend's Name</div>
            ) : (
              childFriendLetters.map((letter, index) => (
                <div key={index} className="friend-letter pop-in">{letter}</div>
              ))
            )}
          </div>

          <div className="friend-controls">
            <button 
              className="friend-backspace-btn"
              onClick={handleFriendBackspace}
              disabled={childFriendLetters.length === 0}
            >
              ⌫ Delete
            </button>
            <button 
              className="friend-confirm-btn"
              onClick={handleFriendConfirm}
              disabled={childFriendLetters.length < 2}
            >
              That's My Friend! ✓
            </button>
          </div>

          <div className="friend-keyboard">
            {alphabet.map((letter, index) => (
              <button
                key={index}
                className="friend-letter-tile bounce-gentle"
                onClick={() => handleFriendLetterClick(letter)}
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* COMPARISON CARD - Final Celebration */}
      {gamePhase === 'comparison-card' && (
        <div className="comparison-card-screen">
          <div className="comparison-header">
            <h1 className="comparison-title glow-text">WE'RE FRIENDS! 🎊</h1>
            <div className="comparison-subtitle">Look how much we have in common!</div>
          </div>

 <div className="comparison-grid">
            {/* GANESHA COLUMN */}
            <div className="comparison-column ganesha-column">
              <div className="column-header">
                <img src={babyGaneshaSit} alt="Ganesha" className="column-avatar bounce-gentle" />
                <h2 className="column-name">GANESHA</h2>
              </div>

              {/* 2x2 Grid for Ganesha */}
              <div className="comparison-boxes-grid">
                {/* Food Box */}
                <div className="comparison-box pop-in" style={{ animationDelay: '0.1s' }}>
                  <div className="box-label">Food</div>
                  <div className="box-content">
                    <img src={modakImg} alt="Modak" className="box-image-small" />
                    <div className="box-text-small">Modak</div>
                  </div>
                </div>

                {/* Color Box */}
                <div className="comparison-box pop-in" style={{ animationDelay: '0.2s' }}>
                  <div className="box-label">Color</div>
                  <div className="box-content">
                    <div className="color-display-small" style={{ backgroundColor: '#FF0000' }}>
                      ❤️
                    </div>
                    <div className="box-text-small">Red</div>
                  </div>
                </div>

                {/* Activity Box */}
                <div className="comparison-box pop-in" style={{ animationDelay: '0.3s' }}>
                  <div className="box-label">Activity</div>
                  <div className="box-content">
                    <div className="activity-display-small">🍬</div>
                    <div className="box-text-small">Sweets</div>
                  </div>
                </div>

                {/* Friend Box */}
                <div className="comparison-box pop-in" style={{ animationDelay: '0.4s' }}>
                  <div className="box-label">Friend</div>
                  <div className="box-content">
                    <img src={mouseImg} alt="Mushika" className="box-image-small" />
                    <div className="box-text-small">Mushika</div>
                  </div>
                </div>
              </div>
            </div>

            {/* HEART DIVIDER */}
            <div className="comparison-divider">
              <div className="heart-connector pulse">❤️</div>
              <div className="divider-text">FRIENDS</div>
              <div className="heart-connector pulse">❤️</div>
            </div>

            {/* CHILD COLUMN */}
            <div className="comparison-column child-column">
              <div className="column-header">
                <div className="child-avatar-circle">
                  <div className="child-avatar-initial">
                    {childFriendName.charAt(0) || '?'}
                  </div>
                </div>
                <h2 className="column-name">YOU</h2>
              </div>

              {/* 2x2 Grid for Child */}
              <div className="comparison-boxes-grid">
                {/* Food Box */}
                <div className="comparison-box pop-in" style={{ animationDelay: '0.5s' }}>
                  <div className="box-label">Food</div>
                  <div className="box-content">
                    {childFoodDrawing ? (
                      <img src={childFoodDrawing} alt="Your drawing" className="box-drawing-small" />
                    ) : (
                      <>
                        <div className="food-emoji-small">
                          {kidFoods.find(f => f.id === childFoodChoice)?.emoji}
                        </div>
                        <div className="box-text-small">
                          {kidFoods.find(f => f.id === childFoodChoice)?.name}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Color Box */}
                <div className="comparison-box pop-in" style={{ animationDelay: '0.6s' }}>
                  <div className="box-label">Color</div>
                  <div className="box-content">
                    <div className="color-display-small" style={{ backgroundColor: childColor }}>
                      {kidColors.find(c => c.color === childColor)?.emoji}
                    </div>
                    <div className="box-text-small">{childColorName}</div>
                  </div>
                </div>

                {/* Activity Box */}
                <div className="comparison-box pop-in" style={{ animationDelay: '0.7s' }}>
                  <div className="box-label">Activity</div>
                  <div className="box-content">
                    {childActivityDrawing ? (
                      <img src={childActivityDrawing} alt="Your drawing" className="box-drawing-small" />
                    ) : (
                      <>
                        <div className="activity-display-small">
                          {kidActivities.find(a => a.id === childActivityChoice)?.emoji}
                        </div>
                        <div className="box-text-small">
                          {kidActivities.find(a => a.id === childActivityChoice)?.name}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Friend Box */}
                <div className="comparison-box pop-in" style={{ animationDelay: '0.8s' }}>
                  <div className="box-label">Friend</div>
                  <div className="box-content">
                    <div className="friend-initial-circle-small">
                      {childFriendName.charAt(0)}
                    </div>
                    <div className="box-text-small">{childFriendName}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Badge */}
          <div className="comparison-badge-container">
            <div className="comparison-badge celebrate-scale">
              🎖️ FRIENDSHIP BADGE UNLOCKED! 🎖️
            </div>
          </div>

          {/* End Game Button */}
          <button 
            className="comparison-end-btn"
            onClick={() => {
              setGamePhase('ending');
              setGameState(prev => ({ ...prev, completed: true }));
              setTimeout(() => setShowSceneCompletion(true), 2000);
            }}
          >
            🎉 Finish Game
          </button>

          {/* Floating Confetti */}
          <div className="comparison-confetti">
            {Array.from({length: 30}).map((_, i) => (
              <div key={i} className="confetti-piece" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}>
                {['🎊', '🎉', '⭐', '💫', '🎈', '❤️'][Math.floor(Math.random() * 6)]}
              </div>
            ))}
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