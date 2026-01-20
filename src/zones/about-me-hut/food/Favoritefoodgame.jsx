import React, { useState, useEffect } from 'react';
import './FavoriteFoodGame.css';
import AboutMeCompletion from "../components/Aboutmecompletion";
import DrawingPad from '../components/Drawingpad';
import StoryProgressHeader from '../components/StoryProgressHeader';
import DrawOrWritePad from '../components/Draworwritepad';
import TextInputModal from '../components/Textinputmodal';
import LetterInputKeyboard from '../components/LetterInputKeyboard';

// --- EXISTING ASSETS ---
import foodBg from './assets/images/food-bg.png';
import babyGaneshaImg from './assets/images/baby-ganesha.png';
import babyGaneshaSit from './assets/images/baby-ganesha-sit.png';

// Food images
import modakImg from './assets/images/food/fav-modak.png';
import ladooImg from './assets/images/food/fav-ladoo.png';
import barfiImg from './assets/images/food/fav-barfi.png';

// Animal images
import mouseImg from './assets/images/animal/fav-mouse.png';
import cowImg from './assets/images/animal/fav-cow.png';
import peacockImg from './assets/images/animal/fav-peacock.png';

// ... existing imports ...

// NEW ICON IMPORTS
import favIconFood from './assets/images/fav-icon-food.png';
import favIconColor from './assets/images/fav-icon-color.png';
import favIconActivity from './assets/images/fav-icon-activity.png';

// ... rest of imports ...

// --- NEW IMPORTS (Based on your file tree) ---

// 1. Color Images
import redImg from './assets/images/color/fav-red.png';
import orangeImg from './assets/images/color/fav-orange.png';
import yellowImg from './assets/images/color/fav-yellow.png';
import greenImg from './assets/images/color/fav-green.png';
import blueImg from './assets/images/color/fav-blue.png';
import purpleImg from './assets/images/color/fav-purple.png';
import pinkImg from './assets/images/color/fav-pink.png';
import brownImg from './assets/images/color/fav-brown.png';

// 2. Activity Images
import actEatingImg from './assets/images/food/fav-sweets.png'; // Using sweets img for "Eating"
import actDancingImg from './assets/images/activity/fav-music.png'; // Music/Dancing
import actReadingImg from './assets/images/activity/fav-reading.png';
import actPlayingImg from './assets/images/activity/fav-playing.png';
import actTvImg from './assets/images/activity/fav-tv.png';
import actDrawImg from './assets/images/activity/fav-drawing.png';

// 3. Kid Food Images (Mapping existing ones + generic)
import pizzaImg from './assets/images/food/fav-pizza.png';
import burgerImg from './assets/images/food/fav-burger.png';
import icecreamImg from './assets/images/food/fav-icecream.png';
import noodlesImg from './assets/images/food/fav-noodles.png';
import fruitImg from './assets/images/food/fav-fruit.png';
import pastaImg from './assets/images/food/fav-pasta.png';
import dosaImg from './assets/images/food/fav-dosa.png';
import riceImg from './assets/images/food/fav-rice.png';




const FavoriteFoodGame = ({ onComplete, onBack, onNavigate }) => {
  const [gamePhase, setGamePhase] = useState('intro');

  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showShake, setShowShake] = useState(null);
  const [wrongChoices, setWrongChoices] = useState(new Set()); 
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [storyDiscoveries, setStoryDiscoveries] = useState([]); 
  const [childDiscoveries, setChildDiscoveries] = useState([]);

  const [gameState, setGameState] = useState({
    stars: 2,
    completed: false
  });

  const [showDrawingPad, setShowDrawingPad] = useState(false);
  const [drawingMode, setDrawingMode] = useState(null); 
  const [childFoodDrawing, setChildFoodDrawing] = useState(null);
  const [childActivityDrawing, setChildActivityDrawing] = useState(null);
  const [childFoodChoice, setChildFoodChoice] = useState(null);
  const [childActivityChoice, setChildActivityChoice] = useState(null);
  const [childColor, setChildColor] = useState(null); // Will store Image or Hex
  const [childColorName, setChildColorName] = useState('');
  const [childFriendName, setChildFriendName] = useState('');
  const [childFriendLetters, setChildFriendLetters] = useState([]);

  // States for text input
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputMode, setTextInputMode] = useState(null); 
  const [childFoodText, setChildFoodText] = useState(null);
  const [childActivityText, setChildActivityText] = useState(null);

  const [correctChoiceId, setCorrectChoiceId] = useState(null);


  // 1. ADD NEW STATES FOR RANDOMIZED OPTIONS
  const [randomFoods, setRandomFoods] = useState([]);
  const [randomFriends, setRandomFriends] = useState([]);
  const [randomColors, setRandomColors] = useState([]);
  const [randomActivities, setRandomActivities] = useState([]);

  // ... inside the component ...
const [feedbackMessage, setFeedbackMessage] = useState(""); // Stores the text
const [isFeedbackShaking, setIsFeedbackShaking] = useState(false); // Animations

  // 2. ADD THE SHUFFLE HELPER FUNCTION
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // ... existing data arrays (foods, friends, colors, activities) ...

  // --- DATA ARRAYS UPDATED WITH IMAGES ---

  const foods = [
    { id: 'modak', name: 'Modak', image: modakImg, emoji: '🥟', correct: true },
    { id: 'ladoo', name: 'Ladoo', image: ladooImg, emoji: '🍪', correct: false },
    { id: 'barfi', name: 'Barfi', image: barfiImg, emoji: '🥞', correct: false }
  ];

  const friends = [
    { id: 'mouse', name: 'Mushika', image: mouseImg, emoji: '🐭', correct: true },
    { id: 'cow', name: 'Cow', image: cowImg, emoji: '🐮', correct: false },
    { id: 'peacock', name: 'Peacock', image: peacockImg, emoji: '🦚', correct: false }
  ];

  // Ganesha's Color Choices (Now with Images)
  const colors = [
    { id: 'red', name: 'Red', image: redImg, correct: false },
    { id: 'orange', name: 'Orange', image: orangeImg, correct: true },
    { id: 'yellow', name: 'Yellow', image: yellowImg, correct: false },
    { id: 'green', name: 'Green', image: greenImg, correct: false }
  ];

  // Ganesha's Activity Choices (Now with Images)
  const activities = [
    { id: 'drawing', name: 'Drawing', image: actDrawImg, correct: false }, // ✅ Replaced Sweets
    { id: 'dancing', name: 'Dancing', image: actDancingImg, correct: true },
    { id: 'reading', name: 'Reading', image: actReadingImg, correct: false },
    { id: 'playing', name: 'Playing', image: actPlayingImg, correct: false }
  ];

  // Kid's Food Choices
  const kidFoods = [
    { id: 'pizza', name: 'Pizza', image: pizzaImg, emoji: '🍕' },
    { id: 'burger', name: 'Burger', image: burgerImg, emoji: '🍔' },
    { id: 'ice-cream', name: 'Ice Cream', image: icecreamImg, emoji: '🍦' },
    { id: 'dosa', name: 'Dosa', image: dosaImg, emoji: '🥞' },
    { id: 'noodles', name: 'Noodles', image: noodlesImg, emoji: '🍜' },
    { id: 'fruit', name: 'Fruit', image: fruitImg, emoji: '🍎' },
    { id: 'rice', name: 'Rice', image: riceImg, emoji: '🍚' }, // Fallback to modak/generic if rice img missing
    { id: 'pasta', name: 'Pasta', image: pastaImg, emoji: '🍝' }
  ];

  // Kid's Activity Choices
  const kidActivities = [
    { id: 'sports', name: 'Playing', image: actPlayingImg, emoji: '⚽' },
    { id: 'reading', name: 'Reading', image: actReadingImg, emoji: '📚' },
    { id: 'drawing', name: 'Drawing', image: actDrawImg, emoji: '🎨' },
    { id: 'dancing', name: 'Dancing', image: actDancingImg, emoji: '💃' },
    { id: 'tv', name: 'Watching TV', image: actTvImg, emoji: '📺' },
    { id: 'games', name: 'Video Games', image: actPlayingImg, emoji: '🎮' } // Reusing playing or need specific video game img
  ];

  // Kid's Color Palette (Mix of Images and Hex codes if image missing)
  const kidColors = [
    { id: 'red', name: 'Red', image: redImg, emoji: '❤️' },
    { id: 'orange', name: 'Orange', image: orangeImg, emoji: '🧡' },
    { id: 'yellow', name: 'Yellow', image: yellowImg, emoji: '💛' },
    { id: 'green', name: 'Green', image: greenImg, emoji: '💚' },
    { id: 'blue', name: 'Blue', image: blueImg, emoji: '💙' },
    { id: 'purple', name: 'Purple', image: purpleImg, emoji: '💜' },
    { id: 'pink', name: 'Pink', image: pinkImg, emoji: '💗' },
    { id: 'brown', name: 'Brown', image: brownImg, emoji: '🤎' },
    // Keep fallback colors for those without images
    //{ id: 'black', name: 'Black', color: '#000000', emoji: '🖤' },
    //{ id: 'white', name: 'White', color: '#FFFFFF', emoji: '🤍' },
  ];

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // ... (after const foods = [...], const friends = [...], etc.)

  // 3. ADD THIS USEEFFECT TO SHUFFLE ON START
  useEffect(() => {
    setRandomFoods(shuffleArray(foods));
    setRandomFriends(shuffleArray(friends));
    setRandomColors(shuffleArray(colors));
    setRandomActivities(shuffleArray(activities));
  }, []); // Runs once when component mounts

  // Start game after intro
  const handleStartGame = () => {
    setGamePhase('food-choice');
  };

  // Auto-advance
  useEffect(() => {
    if (gamePhase === 'friend-celebration') {
      const timer = setTimeout(() => {
        setGamePhase('comparison-card');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gamePhase]);

  // Handle food selection
// Handle food selection
  const handleFoodClick = (foodId) => {
    // If already wrong or currently celebrating, ignore click
    if (wrongChoices.has(foodId) || correctChoiceId) return;
    
    const food = foods.find(f => f.id === foodId);
    
    if (food.correct) {
      // --- CORRECT ---
      setCorrectChoiceId(foodId); 
      setFeedbackMessage(""); // Clear text
      
      setTimeout(() => {
        setSelectedFood(foodId);
        setStoryDiscoveries([{ image: modakImg, name: 'Modak' }]); 
        setGamePhase('food-correct');
        setCorrectChoiceId(null); 
        
        setTimeout(() => {
          setGamePhase('color-choice');
          setWrongChoices(new Set());
        }, 2500);
      }, 1000); 
      
    } else {
      // --- WRONG ---
      setShowShake(foodId);
      
      // 1. Set Feedback
      setFeedbackMessage("Oops! Try again! 🥟");
      setIsFeedbackShaking(true);

      setTimeout(() => {
        setWrongChoices(prev => new Set([...prev, foodId]));
      }, 100);
      
      setTimeout(() => {
        setShowShake(null);
        setIsFeedbackShaking(false);
      }, 500);

      // Clear text after 2s
      setTimeout(() => {
         setFeedbackMessage("");
      }, 2000);
    }
  };

  const handleStartFriendChoice = () => {
    setWrongChoices(new Set()); 
    setGamePhase('friend-choice');
  };

// Handle friend selection
  const handleFriendClick = (friendId) => {
    if (wrongChoices.has(friendId)) return;
    
    const friend = friends.find(f => f.id === friendId);
    
    if (friend.correct) {
      // --- CORRECT ---
      setSelectedFriend(friendId);
      setStoryDiscoveries(prev => [...prev, { image: mouseImg, name: 'Mushika' }]);
      setFeedbackMessage(""); // Clear text
      
      setGamePhase('friend-correct');
      
      setTimeout(() => {
        setGamePhase('child-intro'); 
        setWrongChoices(new Set());
      }, 2500);

    } else {
      // --- WRONG ---
      setShowShake(friendId);
      
      // 1. Set Feedback
      setFeedbackMessage("Not my best friend! Try again! 🐭");
      setIsFeedbackShaking(true);

      setTimeout(() => {
        setWrongChoices(prev => new Set([...prev, friendId]));
      }, 100);
      
      setTimeout(() => {
        setShowShake(null);
        setIsFeedbackShaking(false);
      }, 500);

      // Clear text after 2s
      setTimeout(() => {
         setFeedbackMessage("");
      }, 2000);
    }
  };

  // Handle Ganesha's color choice
// Handle Ganesha's color choice
  const handleColorClick = (colorId) => {
    // If already marked as wrong, ignore click
    if (wrongChoices.has(colorId)) return;
    
    const color = colors.find(c => c.id === colorId);
    
    if (color.correct) {
      // --- CORRECT CHOICE ---
      setStoryDiscoveries(prev => [...prev, { image: orangeImg, name: 'Orange' }]); 
      
      // 1. Clear any error messages immediately
      setFeedbackMessage(""); 
      
      setGamePhase('color-correct');
      setTimeout(() => setGamePhase('activity-choice'), 2500);
      
    } else {
      // --- WRONG CHOICE ---
      setShowShake(colorId);
      
      // 1. Set the Feedback Text & Shake it
      setFeedbackMessage("Oops! Not that one, try again! 🙈");
      setIsFeedbackShaking(true);

      // 2. Add to wrong choices list (Make button grey/unclickable)
      setTimeout(() => {
        setWrongChoices(prev => new Set([...prev, colorId]));
      }, 100);
      
      // 3. Stop shaking items & text after 0.5s
      setTimeout(() => {
        setShowShake(null);
        setIsFeedbackShaking(false); 
      }, 500);

      // 4. (Optional) Clear the text after 2 seconds
      setTimeout(() => {
         setFeedbackMessage("");
      }, 2000);
    }
  };

  // Handle Ganesha's activity choice
// Handle Ganesha's activity choice
  const handleActivityClick = (activityId) => {
    if (wrongChoices.has(activityId)) return;
    
    const activity = activities.find(a => a.id === activityId);
    
    if (activity.correct) {
      // --- CORRECT ---
      setStoryDiscoveries(prev => [...prev, { image: actDancingImg, name: 'Dancing' }]);
      
      setFeedbackMessage(""); // Clear text
      
      setGamePhase('activity-correct');
      setTimeout(() => {
        setGamePhase('friend-intro'); 
        setWrongChoices(new Set());
      }, 2500);
      
    } else {
      // --- WRONG ---
      setShowShake(activityId);
      
      // 1. Set Feedback Text
      setFeedbackMessage("Oops! Try again! 💃");
      setIsFeedbackShaking(true);

      setTimeout(() => {
        setWrongChoices(prev => new Set([...prev, activityId]));
      }, 100);
      
      setTimeout(() => {
        setShowShake(null);
        setIsFeedbackShaking(false);
      }, 500);

      // Clear text after 2s
      setTimeout(() => {
         setFeedbackMessage("");
      }, 2000);
    }
  };

  // Handle kid's food selection
  const handleKidFoodClick = (foodId) => {
    setChildFoodChoice(foodId);
    const selectedFood = kidFoods.find(f => f.id === foodId);
    // Use image for discovery
    setChildDiscoveries([{ image: selectedFood.image, name: selectedFood.name }]); 
    setGamePhase('child-color-choice');
  };

  // Handle food drawing save
  const handleFoodDrawingSave = (data) => {
    setChildFoodDrawing(data.image); 
    setChildDiscoveries([{ image: data.image, name: 'My Food' }]); 
    setShowDrawingPad(false);
    setDrawingMode(null);
    setGamePhase('child-color-choice');
  };

  const handleKidColorClick = (colorId) => {
    const selectedColor = kidColors.find(c => c.id === colorId);
    
    // Store image if available, else hex
    setChildColor(selectedColor.image || selectedColor.color);
    setChildColorName(selectedColor.name);
    
    // Discovery badge
    setChildDiscoveries(prev => [...prev, { 
      image: selectedColor.image, 
      emoji: selectedColor.emoji, // Fallback if no image
      name: selectedColor.name 
    }]); 
    
    setGamePhase('child-activity-choice');
  };

  // Handle kid's activity selection
  const handleKidActivityClick = (activityId) => {
    setChildActivityChoice(activityId);
    const selectedActivity = kidActivities.find(a => a.id === activityId);
    setChildDiscoveries(prev => [...prev, { image: selectedActivity.image, name: selectedActivity.name }]);
    setGamePhase('child-friend-intro');
  };

  // Handle activity drawing save
  const handleActivityDrawingSave = (data) => {
    setChildActivityDrawing(data.image);
    setChildDiscoveries(prev => {
      const withoutActivity = prev.slice(0, 2);
      return [...withoutActivity, { image: data.image, name: 'My Activity' }];
    });
    setShowDrawingPad(false);
    setDrawingMode(null);
    setGamePhase('child-friend-intro');
  };

  const handleFriendLetterClick = (letter) => {
    setChildFriendLetters(prev => [...prev, letter]);
  };

  const handleFriendBackspace = () => {
    setChildFriendLetters(prev => prev.slice(0, -1));
  };

  const handleFriendConfirm = () => {
    const name = childFriendLetters.join('');
    if (name.length < 2) return;
    
    setChildFriendName(name);
    setChildDiscoveries(prev => [...prev, { emoji: '👤', name: name }]); 

    localStorage.setItem('childFavorites', JSON.stringify({
      food: childFoodChoice,
      foodDrawing: childFoodDrawing,
      color: childColor,
      colorName: childColorName,
      activity: childActivityChoice,
      activityDrawing: childActivityDrawing,
      friend: name
    }));
    
    setGamePhase('friend-celebration'); 
  };

  const handleDrawingCancel = () => {
    setShowDrawingPad(false);
    setDrawingMode(null);
    if (drawingMode === 'food') {
      setGamePhase('child-food-choice');
    } else if (drawingMode === 'activity') {
      setGamePhase('child-activity-choice');
    }
  };

  return (
    <div className="favorite-food-game">
      <img src={foodBg} alt="Background" className="food-background" />

      {/* Story Progress Header */}
      {!gamePhase.includes('child') && gamePhase !== 'comparison-card' && gamePhase !== 'ending' && (
        <StoryProgressHeader discoveries={storyDiscoveries} />
      )}

      {(gamePhase.includes('child') || gamePhase === 'friend-celebration') && 
       gamePhase !== 'comparison-card' && 
       gamePhase !== 'ending' && (
        <StoryProgressHeader discoveries={childDiscoveries} isChildMode={true} />
      )}

      {/* Intro Screen */}
      {gamePhase === 'intro' && (
        <div className="game-modal-overlay" id="favorite-food-intro">
          <div className="game-modal-content">
            <div className="game-modal-character">
              <img src={babyGaneshaImg} alt="Baby Ganesha" />
            </div>
            <div className="game-modal-card">
              <h1 className="game-modal-title">The Favorites Match!</h1>
              <p className="game-modal-subtitle">
                I have some things I love more than anything!<br />
                Can you guess my favorites?<br />
              </p>

          {/* Icons Row */}
              <div className="game-modal-icons">
                
                {/* 1. Food Icon */}
                <div className="game-modal-icon-item">
                  <div className="game-modal-icon-circle">
                    {/* CHANGED HERE: Use favIconFood */}
                    <img src={favIconFood} alt="Food" />
                  </div>
                  <span className="game-modal-icon-label">Food</span>
                </div>

                {/* 2. Color Icon */}
                <div className="game-modal-icon-item">
                  <div className="game-modal-icon-circle">
                    {/* CHANGED HERE: Use favIconColor */}
                    <img src={favIconColor} alt="Color" />
                  </div>
                  <span className="game-modal-icon-label">Color</span>
                </div>

                {/* 3. Activity Icon */}
                <div className="game-modal-icon-item">
                  <div className="game-modal-icon-circle">
                    {/* CHANGED HERE: Use favIconActivity */}
                    <img src={favIconActivity} alt="Activity" />
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

      {/* Back Button */}
      {gamePhase !== 'intro' && !showSceneCompletion && (
        <button className="back-btn" onClick={onBack}>← Back</button>
      )}

      {/* Food Choice Screen */}
      {gamePhase === 'food-choice' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          <div className="fav-speech-bubble">
            Which one is my favorite? 🍬
          </div>

              {/* 👇 ADD THIS 👇 */}
          <div className={`feedback-message visible ${isFeedbackShaking ? 'shake-text' : ''}`}>
             {feedbackMessage || "Tap the food you think I love! 🥟"} 
          </div>

          <div className="choices-container food-scene">
            {randomFoods.map((food, index) => (
              <button
                key={food.id}
                className={`choice-card ${showShake === food.id ? 'shake' : ''} ${wrongChoices.has(food.id) ? 'wrong' : ''} ${correctChoiceId === food.id ? 'correct' : ''} bounce-gentle`}
                onClick={() => handleFoodClick(food.id)}
                style={{ animationDelay: `${index * 0.2}s` }}
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

      {/* Food Correct */}
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
              <div key={i} className="sparkle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}>✨</div>
            ))}
          </div>
          <div className="success-message">Yes! Modak is my favorite! 🎉</div>
        </div>
      )}

      {/* Friend Intro */}
      {gamePhase === 'friend-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce"/>
          <div className="friend-intro-box">
            <h2 className="friend-intro-text">Great! Now find my best friend!</h2>
            <button className="friend-intro-btn" onClick={handleStartFriendChoice}>Find Friend! 🌟</button>
          </div>
        </div>
      )}

      {/* Friend Choice Screen */}
      {gamePhase === 'friend-choice' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          <div className="fav-speech-bubble">Who is my best friend? 🤔</div>

          {/* 👇 ADD THIS 👇 */}
          <div className={`feedback-message visible ${isFeedbackShaking ? 'shake-text' : ''}`}>
             {feedbackMessage || "Tap my best friend! 🐭"} 
          </div>

          <div className="choices-container friend-scene">
            {randomFriends.map((friend, index) => (
              <button
                key={friend.id}
                className={`choice-card ${showShake === friend.id ? 'shake' : ''} ${wrongChoices.has(friend.id) ? 'wrong' : ''} ${correctChoiceId === friend.id ? 'correct' : ''} bounce-gentle`}
                onClick={() => handleFriendClick(friend.id)}
                style={{ animationDelay: `${index * 0.2}s` }}
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

      {/* Friend Correct */}
      {gamePhase === 'friend-correct' && (
        <div className="correct-screen">
          <div className="friends-together">
            <img src={babyGaneshaSit} alt="Ganesha" className="ganesha-with-friend" />
            <img src={friends.find(f => f.id === selectedFriend).image} alt="Mouse" className="friend-character pop-in" />
          </div>
          <div className="celebration-sparkles">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="sparkle heart" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}>💕</div>
            ))}
          </div>
          <div className="success-message">Yes! Mushika is my best friend! 🐭✨</div>
        </div>
      )}

      {/* Color Choice (Updated with Images) */}
      {gamePhase === 'color-choice' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          <div className="fav-speech-bubble">What's my favorite color? 🎨</div>

          {/* 👇 INSERT THIS NEW BLOCK HERE 👇 */}
          <div className={`feedback-message visible ${isFeedbackShaking ? 'shake-text' : ''}`}>
            {feedbackMessage || "Tap the color you think I love! 💛"} 
          </div>
          {/* 👆 END OF NEW BLOCK 👆 */}
          
          <div className="choices-container color-scene">
            {randomColors.map((color, index) => (
              <button
                key={color.id}
                className={`choice-card ${showShake === color.id ? 'shake' : ''} ${wrongChoices.has(color.id) ? 'wrong' : ''} ${correctChoiceId === color.id ? 'correct' : ''} bounce-gentle`}
                onClick={() => handleColorClick(color.id)}
                style={{ animationDelay: `${index * 0.2}s` }}
                disabled={wrongChoices.has(color.id) || correctChoiceId !== null}
              >
                <div className="choice-image-container">
                  {/* CHANGED: Render Image instead of Emoji/Color block */}
                  <img src={color.image} alt={color.name} className="choice-image" />
                </div>
                <div className="choice-name">{color.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Correct (Updated) */}
      {gamePhase === 'color-correct' && (
        <div className="correct-screen">
          <div className="ganesha-happy">
            <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate" />
          </div>
          <div className="correct-food">
                        <img src={orangeImg} alt="Orange" className="food-in-hand pop-in" style={{width:'180px', height:'180px'}}/>

          </div>
          <div className="celebration-sparkles">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="sparkle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}>✨</div>
            ))}
          </div>
          <div className="success-message">Yes! Orange is my favorite color! 🧡</div>
        </div>
      )}

      {/* Activity Choice (Updated with Images) */}
      {gamePhase === 'activity-choice' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          <div className="fav-speech-bubble">What do I love to do? 🤔</div>

          {/* 👇 INSERT THIS BLOCK 👇 */}
          <div className={`feedback-message visible ${isFeedbackShaking ? 'shake-text' : ''}`}>
             {feedbackMessage || "Tap the activity you think I love! 🎮"} 
          </div>
          {/* 👆 END BLOCK 👆 */}

          <div className="choices-container activity-scene">
            {randomActivities.map((activity, index) => (
              <button
                key={activity.id}
                className={`choice-card ${showShake === activity.id ? 'shake' : ''} ${wrongChoices.has(activity.id) ? 'wrong' : ''} ${correctChoiceId === activity.id ? 'correct' : ''} bounce-gentle`}
                onClick={() => handleActivityClick(activity.id)}
                style={{ animationDelay: `${index * 0.2}s` }}
                disabled={wrongChoices.has(activity.id) || correctChoiceId !== null}
              >
<div className="choice-image-container">
                  {/* CHANGED: Render Image */}
                  <img src={activity.image} alt={activity.name} className="choice-image" />
                </div>
                <div className="choice-name">{activity.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activity Correct (Updated) */}
      {gamePhase === 'activity-correct' && (
        <div className="correct-screen">
          <div className="ganesha-happy">
            <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate" />
          </div>
          <div className="correct-food">
<img src={actDancingImg} alt="Dancing" className="food-in-hand pop-in" style={{width:'180px', height:'180px'}}/>          </div>
          <div className="celebration-sparkles">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="sparkle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}>✨</div>
            ))}
          </div>
          <div className="success-message">Yes! I love Dancing! 💃✨</div>
        </div>
      )}

      {/* Child Intro */}
      {gamePhase === 'child-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="child-phase-modal">
            <h2 className="child-phase-title">Now it’s your turn! 😊</h2>
            <p className="child-phase-subtext">Tell me about you.</p>
            <button className="child-phase-button" onClick={() => setGamePhase('child-food-choice')}>
              Tell Me about You!✨
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
          <div className="fav-speech-bubble">What's YOUR favorite food? 🍕</div>
          
          <div className="kid-choices-grid">
            {kidFoods.map((food, index) => (
              <button
                key={food.id}
                className="kid-choice-card bounce-gentle"
                onClick={() => handleKidFoodClick(food.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* CHANGED: Use Image if available */}
                <img src={food.image} alt={food.name} className="choice-image" style={{width:'60px', height:'60px'}}/>
                <div className="kid-choice-name">{food.name}</div>
              </button>
            ))}
          </div>
          
          <div className="custom-input-options">
            <button className="draw-button" onClick={() => { setShowDrawingPad(true); setDrawingMode('food'); }}>🎨 Draw</button>
            <button className="type-button" onClick={() => { setShowTextInput(true); setTextInputMode('food'); }}>✏️ Type</button>
          </div>
        </div>
      )}

      {/* Drawing & Text Modals */}
      {showDrawingPad && (
        <div className="drawing-overlay">
          <DrawingPad
            prompt={drawingMode === 'food' ? "Draw your favorite food! 🍕" : "Draw your favorite activity! ⚽"}
            onSave={drawingMode === 'food' ? handleFoodDrawingSave : handleActivityDrawingSave}
            onCancel={handleDrawingCancel}
          />
        </div>
      )}
      
      {showTextInput && textInputMode === 'food' && (
        <TextInputModal
          prompt="What's YOUR favorite food?"
          onSave={(text) => {
            setChildFoodText(text);
            setShowTextInput(false);
            setTextInputMode(null);
            setChildDiscoveries([{ emoji: '✏️', name: text }]);
            setGamePhase('child-color-choice');
          }}
          onCancel={() => { setShowTextInput(false); setTextInputMode(null); }}
          maxLength={30}
        />
      )}

      {showTextInput && textInputMode === 'activity' && (
        <TextInputModal
          prompt="What's YOUR favorite activity?"
          onSave={(text) => {
            setChildActivityText(text);
            setShowTextInput(false);
            setTextInputMode(null);
            setChildDiscoveries(prev => {
              const withoutActivity = prev.slice(0, 2);
              return [...withoutActivity, { emoji: '✏️', name: text }];
            });
            setGamePhase('child-friend-intro');
          }}
          onCancel={() => { setShowTextInput(false); setTextInputMode(null); }}
          maxLength={30}
        />
      )}

      {/* Child Color Choice (Updated Grid) */}
      {gamePhase === 'child-color-choice' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          <div className="fav-speech-bubble">What's YOUR favorite color? 🎨</div>

          <div className="color-palette-grid">
            {kidColors.map((color, index) => (
              <button
                key={color.id}
                className="color-choice-button bounce-gentle"
                onClick={() => handleKidColorClick(color.id)}
                style={{ 
                  backgroundColor: color.image ? 'transparent' : color.color, // Transparent if img exists
                  border: color.image ? 'none' : '4px solid white',
                  animationDelay: `${index * 0.05}s`
                }}
                title={color.name}
              >
                {color.image ? (
                   <img src={color.image} alt={color.name} style={{width:'100%', height:'100%', objectFit:'contain'}} />
                ) : (
                   color.emoji
                )}
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
          <div className="fav-speech-bubble">What do YOU love to do? 🎮</div>

          <div className="kid-choices-grid child-activity-scene">
            {kidActivities.map((activity, index) => (
              <button
                key={activity.id}
                className="kid-choice-card bounce-gentle"
                onClick={() => handleKidActivityClick(activity.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* CHANGED: Use Image */}
                <img src={activity.image} alt={activity.name} className="choice-image" style={{width:'60px', height:'60px'}}/>
                <div className="kid-choice-name">{activity.name}</div>
              </button>
            ))}
          </div>

          <div className="custom-input-options">
            <button className="draw-button" onClick={() => { setShowDrawingPad(true); setDrawingMode('activity'); }}>🎨 Draw</button>
            <button className="type-button" onClick={() => { setShowTextInput(true); setTextInputMode('activity'); }}>✏️ Type</button>
          </div>
        </div>
      )}

      {/* Child Friend Intro */}
      {gamePhase === 'child-friend-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="child-card">
            <div className="child-card-text">My best friend is... 👫</div>
            <button className="child-card-button" onClick={() => setGamePhase('child-friend-input')}>Tap to tell! ✨</button>
          </div>
        </div>
      )}

      {/* Child Friend Input
      {gamePhase === 'child-friend-input' && (
        <div className="friend-input-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          {/*<div className="speech-bubble">Spell your friend's name! ✨</div>
          <div className="friend-name-display">
            {childFriendLetters.length === 0 ? (
              <div className="name-placeholder">Type your Friend's Name</div>
            ) : (
              childFriendLetters.map((letter, index) => (
                <div key={index} className="friend-letter pop-in">{letter}</div>
              ))
            )}
          </div>
          <div className="friend-controls">
            <button className="friend-backspace-btn" onClick={handleFriendBackspace} disabled={childFriendLetters.length === 0}>⌫ Delete</button>
            <button className="friend-confirm-btn" onClick={handleFriendConfirm} disabled={childFriendLetters.length < 2}>That's My Friend! ✓</button>
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

      {/* FRIEND NAME INPUT - Using Reusable Component */}
{gamePhase === 'child-friend-input' && (
  <div className="friend-input-screen">
    <div className="ganesha-waiting">
      <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
    </div>
    
    <LetterInputKeyboard
      onConfirm={(name) => {
        setChildFriendName(name);
        setChildFriendLetters(name.split(''));
        setChildDiscoveries(prev => [...prev, { emoji: '👤', name: name }]);
        
        localStorage.setItem('childFavorites', JSON.stringify({
          food: childFoodChoice,
          foodDrawing: childFoodDrawing,
          color: childColor,
          colorName: childColorName,
          activity: childActivityChoice,
          activityDrawing: childActivityDrawing,
          friend: name
        }));
        
        setGamePhase('friend-celebration');
      }}
      minLetters={2}
      maxLetters={20}
      placeholder="Type your Friend's Name"
      confirmButtonText="That's My Friend! ✓"
      deleteButtonText="⌫ Delete"
    />
  </div>
)}

      {/* Friend Celebration Phase */}
      {gamePhase === 'friend-celebration' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          <div className="fav-speech-bubble celebrate-pulse">
            Yay! {childFriendName} is your best friend! 🎉<br /> Let me show you something special 💛
          </div>
        </div>
      )}

      {/* COMPARISON CARD */}
      {gamePhase === 'comparison-card' && (
        <div className="friendship-overlay">
          <h1 className="friendship-title">You and Ganesha are friends forever! ✨</h1>
          <p className="friendship-subtitle">Ganesha loves knowing about you 💛</p>

          <div className="friendship-grid">
            {/* --- LEFT: GANESHA --- */}
            <div className="friend-column">
              <img src={babyGaneshaSit} alt="Ganesha" className="column-header-image" />
              <div className="column-label">GANESHA</div>
              <div className="friend-items-grid">
                <div className="friend-item">
                  <span className="friend-item-label">Food</span>
                  <img src={modakImg} alt="Modak" className="friend-item-img" />
                  <span className="friend-item-text">Modak</span>
                </div>
      {/* ✅ UPDATED COLOR: ORANGE */}
                <div className="friend-item">
                  <span className="friend-item-label">Color</span>
                  <img src={orangeImg} alt="Orange" className="friend-item-img" />
                  <span className="friend-item-text">Orange</span>
                </div>

                {/* ✅ UPDATED ACTIVITY: DANCING */}
                <div className="friend-item">
                  <span className="friend-item-label">Activity</span>
                  <img src={actDancingImg} alt="Dancing" className="friend-item-img" />
                  <span className="friend-item-text">Dancing</span>
                </div>
                <div className="friend-item">
                  <span className="friend-item-label">Friend</span>
                  <img src={mouseImg} alt="Mushika" className="friend-item-img" />
                  <span className="friend-item-text">Mushika</span>
                </div>
              </div>
            </div>

            {/* --- CENTER: CONNECTOR --- */}
            <div className="friend-connector">
              <div className="connector-heart">❤️</div>
              <div className="connector-text">FRIENDS</div>
              <div className="connector-heart">❤️</div>
            </div>

            {/* --- RIGHT: YOU --- */}
            <div className="friend-column">
              <div className="child-avatar-display">
                {childFriendName.charAt(0) || 'U'}
              </div>
              <div className="column-label">YOU</div>

              <div className="friend-items-grid">
                {/* Food */}
                <div className="friend-item">
                  <span className="friend-item-label">Food</span>
                  {childFoodText ? (
                    <div className="friend-item-typed-text">{childFoodText}</div>
                  ) : childFoodDrawing ? (
                    <img src={childFoodDrawing} alt="Draw" className="friend-item-img" style={{borderRadius:'4px'}} />
                  ) : childFoodChoice ? (
                    <img src={kidFoods.find(f => f.id === childFoodChoice)?.image} alt="Food" className="friend-item-img"/>
                  ) : (
                    <div style={{fontSize:'20px'}}>🤷</div>
                  )}
                  <span className="friend-item-text">
                    {childFoodText ? childFoodText : childFoodDrawing ? 'Drawing' : kidFoods.find(f => f.id === childFoodChoice)?.name}
                  </span>
                </div>
                {/* Color */}
                <div className="friend-item">
                  <span className="friend-item-label">Color</span>
                   {/* Handle Image or Hex */}
                   {childColor && childColor.startsWith('#') ? (
                     <div style={{width:'50px', height:'50px', borderRadius:'50%', background: childColor}}></div>
                   ) : (
                     <img src={childColor} alt={childColorName} className="friend-item-img" />
                   )}
                  <span className="friend-item-text">{childColorName}</span>
                </div>
                {/* Activity */}
                <div className="friend-item">
                  <span className="friend-item-label">Activity</span>
                  {childActivityText ? (
                    <div className="friend-item-typed-text">{childActivityText}</div>
                  ) : childActivityDrawing ? (
                    <img src={childActivityDrawing} alt="Draw" className="friend-item-img" style={{borderRadius:'4px'}} />
                  ) : childActivityChoice ? (
                    <img src={kidActivities.find(a => a.id === childActivityChoice)?.image} alt="Activity" className="friend-item-img"/>
                  ) : (
                    <div style={{fontSize:'20px'}}>🤷</div>
                  )}
                  <span className="friend-item-text">
                    {childActivityText ? childActivityText : childActivityDrawing ? 'Drawing' : kidActivities.find(a => a.id === childActivityChoice)?.name}
                  </span>
                </div>
                {/* Friend */}
                <div className="friend-item">
                  <span className="friend-item-label">Best Friend</span>
                  <div style={{fontSize:'24px', fontWeight:'bold', color:'#8B4513'}}>
                    {childFriendName.charAt(0)}
                  </div>
                  <span className="friend-item-text">{childFriendName}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="badge-strip">
            <span style={{fontSize:'24px'}}>🏆</span>
            <span className="badge-text">Friendship Badge Unlocked!</span>
            <span style={{fontSize:'24px'}}>🏆</span>
          </div>

          <button 
            className="primary-cta"
            onClick={() => {
              setGameState(prev => ({ ...prev, completed: true }));
              setShowSceneCompletion(true); 
            }}
          >
            🎉 Finish Game
          </button>
          <div className="celebration-sparkles">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="sparkle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }}>✨</div>
            ))}
          </div>
        </div>
      )}

      {/* Ending Screen */}
      {gamePhase === 'ending' && !showSceneCompletion && (
        <div className="ending-screen">
          <div className="final-display">
            <img src={babyGaneshaSit} alt="Ganesha" className="ganesha-final" />
            <img src={foods.find(f => f.id === selectedFood).image} alt="Modak" className="final-food" />
            <img src={friends.find(f => f.id === selectedFriend).image} alt="Mouse" className="final-friend" />
          </div>
          <div className="final-message">
            <h2 className="final-title">Perfect! 🌟</h2>
            <p className="final-text">This is my favourite food and my best friend!</p>
          </div>
          <div className="badge-container">
            <div className="badge-earned pop-in">🎖️ Super Finder!</div>
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
          characterImages={{ babyGanesha: babyGaneshaImg }}
          nextSceneName="Spell GANESHA"
          childName="super finder"
          
          onContinue={() => {
            setTimeout(() => {
              if (onNavigate) {
                onNavigate('game3');
              } else if (onComplete) {
                onComplete();
              }
            }, 100);
          }}
          
          onReplay={() => {
            // 4. ADD THESE LINES TO RESHUFFLE
            setRandomFoods(shuffleArray(foods));
            setRandomFriends(shuffleArray(friends));
            setRandomColors(shuffleArray(colors));
            setRandomActivities(shuffleArray(activities));

            setGamePhase('intro');
            setSelectedFood(null);
            setSelectedFriend(null);
            setShowShake(null);
            setWrongChoices(new Set()); 
            setStoryDiscoveries([]); 
            setChildDiscoveries([]);
            setShowDrawOrWrite(false); 
            setInputMode(null); 
            setChildFoodInput(null); 
            setChildActivityInput(null); 
            setShowSceneCompletion(false);
            setShowSceneCompletion(false);
            setGameState({ stars: 2, completed: false });
          }}
          
          onBackToMap={() => {
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