import React, { useState } from 'react';
import './DreamsWishesGame.css';
import AboutMeCompletion from "../components/Aboutmecompletion";
import DrawingPad from '../components/Drawingpad';

// Import images
import babyGaneshaImg from './assets/images/baby-ganesha.png';
import babyGaneshaSit from './assets/images/baby-ganesha-sit.png';
import dreamsBg from './assets/images/food-bg.png'; // Using food-bg as placeholder

const DreamsWishesGame = ({ onComplete, onBack, onNavigate }) => {
  const [gamePhase, setGamePhase] = useState('intro');
  // Phases: intro, wish1-intro, wish1-active, wish1-complete,
  // wish2-intro, wish2-active, wish2-complete,
  // wish3-intro, wish3-active, wish3-complete,
  // all-wishes-complete, dream-intro, dream-drawing, dream-clouded,
  // dream-clearing, dream-revealed, comparison-card, ending

  const [wish1Taps, setWish1Taps] = useState(0);
  const [wish2Taps, setWish2Taps] = useState(0);
  const [wish3Taps, setWish3Taps] = useState(0);
  const [trunkTaps, setTrunkTaps] = useState(0);
  const [childDreamDrawing, setChildDreamDrawing] = useState(null);
  const [showDrawingPad, setShowDrawingPad] = useState(false);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [gameState, setGameState] = useState({
    stars: 3,
    completed: false
  });

  // Handle wish 1 tap (Happiness - Earth)
  const handleWish1Tap = () => {
    const newTaps = wish1Taps + 1;
    setWish1Taps(newTaps);

    if (newTaps >= 3) {
      setTimeout(() => {
        setGamePhase('wish1-complete');
        setTimeout(() => setGamePhase('wish2-intro'), 2500);
      }, 500);
    }
  };

  // Handle wish 2 tap (Sharing - Bowls)
  const handleWish2Tap = () => {
    const newTaps = wish2Taps + 1;
    setWish2Taps(newTaps);

    if (newTaps >= 3) {
      setTimeout(() => {
        setGamePhase('wish2-complete');
        setTimeout(() => setGamePhase('wish3-intro'), 2500);
      }, 500);
    }
  };

  // Handle wish 3 tap (Nature - Park)
  const handleWish3Tap = () => {
    const newTaps = wish3Taps + 1;
    setWish3Taps(newTaps);

    if (newTaps >= 3) {
      setTimeout(() => {
        setGamePhase('wish3-complete');
        setTimeout(() => setGamePhase('all-wishes-complete'), 2500);
      }, 500);
    }
  };

  // Handle dream drawing save
  const handleDreamDrawingSave = (imageData) => {
    setChildDreamDrawing(imageData);
    setShowDrawingPad(false);
    setGamePhase('dream-clouded');
  };

  // Handle trunk tap to clear clouds
  const handleTrunkTap = () => {
    const newTaps = trunkTaps + 1;
    setTrunkTaps(newTaps);

    if (newTaps >= 3) {
      setTimeout(() => {
        setGamePhase('dream-revealed');
        setTimeout(() => setGamePhase('comparison-card'), 2500);
      }, 500);
    }
  };

  return (
    <div className="dreams-wishes-game">
      {/* Background */}
      <img src={dreamsBg} alt="Background" className="dreams-background" />

      {/* Back Button */}
      {gamePhase !== 'intro' && !showSceneCompletion && (
        <button className="back-btn" onClick={onBack}>← Back</button>
      )}

      {/* INTRO SCREEN */}
      {gamePhase === 'intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="intro-speech">
            <p className="intro-text">I have three giant wishes for the whole world!</p>
            <p className="intro-text">Will you help me make them come true? 🌟</p>
            <button className="start-btn" onClick={() => setGamePhase('wish1-intro')}>
              Yes! Let's Help Ganesha! ✨
            </button>
          </div>
        </div>
      )}

      {/* WISH 1 INTRO - HAPPINESS */}
      {gamePhase === 'wish1-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="intro-speech">
            <p className="intro-text">My first wish is for everyone to be happy!</p>
            <p className="intro-text">The world looks a little sad right now 😔</p>
            <button className="start-btn" onClick={() => setGamePhase('wish1-active')}>
              Let's Make Them Happy! 😊
            </button>
          </div>
        </div>
      )}

      {/* WISH 1 ACTIVE - TAP EARTH */}
      {gamePhase === 'wish1-active' && (
        <div className="wish-screen">
          <div className="ganesha-watching">
            <img src={babyGaneshaImg} alt="Ganesha" className="ganesha-small bounce-gentle" />
          </div>

          <div className="speech-bubble">
            Tap the earth 3 times to send smiles! ({wish1Taps}/3)
          </div>

          <div className="wish-interactive-container">
            <div
              className={`earth-icon ${wish1Taps >= 1 ? 'earth-tap1' : ''} ${wish1Taps >= 2 ? 'earth-tap2' : ''} ${wish1Taps >= 3 ? 'earth-tap3' : ''}`}
              onClick={handleWish1Tap}
            >
              <div className="earth-emoji">🌍</div>
              <div className="sad-faces">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`face-emoji ${wish1Taps >= 3 ? 'face-happy' : 'face-sad'}`}
                    style={{
                      transform: `rotate(${i * 60}deg) translateY(-80px)`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  >
                    {wish1Taps >= 3 ? '😊' : '😔'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WISH 1 COMPLETE */}
      {gamePhase === 'wish1-complete' && (
        <div className="wish-complete-screen">
          <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate celebrate-scale" />
          <div className="success-message-large">
            You helped spread happiness! 😊✨
          </div>
          <div className="wish-checkmark">✓ Happiness Wish Complete!</div>

          {/* Floating happy faces */}
          <div className="celebration-elements">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="floating-element"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              >
                😊
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WISH 2 INTRO - SHARING */}
      {gamePhase === 'wish2-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="intro-speech">
            <p className="intro-text">My second wish is that no one is hungry or lonely!</p>
            <p className="intro-text">Let's share with everyone! 🤝</p>
            <button className="start-btn" onClick={() => setGamePhase('wish2-active')}>
              Let's Share! 🍎
            </button>
          </div>
        </div>
      )}

      {/* WISH 2 ACTIVE - TAP BOWLS */}
      {gamePhase === 'wish2-active' && (
        <div className="wish-screen">
          <div className="ganesha-watching">
            <img src={babyGaneshaImg} alt="Ganesha" className="ganesha-small bounce-gentle" />
          </div>

          <div className="speech-bubble">
            Tap the bowls 3 times to fill them! ({wish2Taps}/3)
          </div>

          <div className="wish-interactive-container">
            <div className="bowls-container">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`bowl ${wish2Taps > i ? 'bowl-filled' : 'bowl-empty'}`}
                  onClick={handleWish2Tap}
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  <div className="bowl-emoji">🥣</div>
                  {wish2Taps > i && (
                    <div className="bowl-food pop-in">
                      🍎🥟🍊
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Hearts raining */}
          {wish2Taps >= 3 && (
            <div className="hearts-rain">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="heart-fall"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                >
                  ❤️
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WISH 2 COMPLETE */}
      {gamePhase === 'wish2-complete' && (
        <div className="wish-complete-screen">
          <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate celebrate-scale" />
          <div className="success-message-large">
            You helped spread sharing! 🤝✨
          </div>
          <div className="wish-checkmark">✓ Sharing Wish Complete!</div>

          {/* Floating hearts */}
          <div className="celebration-elements">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="floating-element"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              >
                ❤️
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WISH 3 INTRO - NATURE */}
      {gamePhase === 'wish3-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="intro-speech">
            <p className="intro-text">My last wish is for a beautiful green world!</p>
            <p className="intro-text">Where kids can play outside forever! 🌳</p>
            <button className="start-btn" onClick={() => setGamePhase('wish3-active')}>
              Let's Make It Green! 🌸
            </button>
          </div>
        </div>
      )}

      {/* WISH 3 ACTIVE - TAP PARK */}
      {gamePhase === 'wish3-active' && (
        <div className="wish-screen">
          <div className="ganesha-watching">
            <img src={babyGaneshaImg} alt="Ganesha" className="ganesha-small bounce-gentle" />
          </div>

          <div className="speech-bubble">
            Tap the park 3 times to make it bloom! ({wish3Taps}/3)
          </div>

          <div className="wish-interactive-container">
            <div
              className={`park-scene ${wish3Taps >= 1 ? 'park-tap1' : ''} ${wish3Taps >= 2 ? 'park-tap2' : ''} ${wish3Taps >= 3 ? 'park-tap3' : ''}`}
              onClick={handleWish3Tap}
            >
              {/* Park base */}
              <div className="park-ground"></div>

              {/* Flowers appear */}
              {wish3Taps >= 1 && (
                <div className="flowers-container">
                  {['🌸', '🌺', '🌼', '🌻', '🌷'].map((flower, i) => (
                    <div
                      key={i}
                      className="flower pop-in"
                      style={{
                        left: `${20 + i * 15}%`,
                        bottom: '10%',
                        animationDelay: `${i * 0.1}s`
                      }}
                    >
                      {flower}
                    </div>
                  ))}
                </div>
              )}

              {/* Butterflies appear */}
              {wish3Taps >= 2 && (
                <div className="butterflies-container">
                  {['🦋', '🦋', '🦋'].map((butterfly, i) => (
                    <div
                      key={i}
                      className="butterfly flutter"
                      style={{
                        left: `${30 + i * 25}%`,
                        top: `${20 + i * 15}%`,
                        animationDelay: `${i * 0.3}s`
                      }}
                    >
                      {butterfly}
                    </div>
                  ))}
                </div>
              )}

              {/* Playground appears */}
              {wish3Taps >= 3 && (
                <div className="playground pop-in">
                  <div className="playground-item">🛝</div>
                  <div className="playground-item">🌳</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WISH 3 COMPLETE */}
      {gamePhase === 'wish3-complete' && (
        <div className="wish-complete-screen">
          <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate celebrate-scale" />
          <div className="success-message-large">
            You made the world beautiful! 🌳✨
          </div>
          <div className="wish-checkmark">✓ Nature Wish Complete!</div>

          {/* Floating nature elements */}
          <div className="celebration-elements">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="floating-element"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              >
                {['🌸', '🦋', '🌳'][i % 3]}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALL WISHES COMPLETE */}
      {gamePhase === 'all-wishes-complete' && (
        <div className="intro-overlay">
          <img src={babyGaneshaSit} alt="Baby Ganesha" className="intro-ganesha celebrate-scale" />
          <div className="intro-speech">
            <p className="intro-text">WOW! You made the world perfect! 🌟</p>
            <p className="intro-text">Now it's YOUR turn! What is your biggest dream?</p>
            <button className="start-btn" onClick={() => setGamePhase('dream-intro')}>
              Tell You My Dream! 💭
            </button>
          </div>
        </div>
      )}

      {/* DREAM INTRO */}
      {gamePhase === 'dream-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="intro-speech">
            <p className="intro-text">Draw your biggest dream on this magic canvas!</p>
            <p className="intro-text">What do you want to be? 🎨</p>
            <button className="start-btn" onClick={() => {
              setShowDrawingPad(true);
              setGamePhase('dream-drawing');
            }}>
              Start Drawing! ✏️
            </button>
          </div>
        </div>
      )}

      {/* DRAWING PAD OVERLAY */}
      {showDrawingPad && gamePhase === 'dream-drawing' && (
        <div className="drawing-overlay">
          <DrawingPad
            prompt="Draw your biggest dream! What do you want to be? 🌟"
            onSave={handleDreamDrawingSave}
            onCancel={() => {
              setShowDrawingPad(false);
              setGamePhase('dream-intro');
            }}
          />
        </div>
      )}

      {/* DREAM CLOUDED */}
      {gamePhase === 'dream-clouded' && (
        <div className="dream-screen">
          <div className="dream-container">
            {/* Child's drawing */}
            <div className="dream-drawing-display">
              {childDreamDrawing && (
                <img src={childDreamDrawing} alt="Your dream" className="dream-image" />
              )}
            </div>

            {/* Clouds covering dream */}
            <div className="clouds-container">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`dream-cloud cloud-${i + 1}`}
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  ☁️
                </div>
              ))}
            </div>

            {/* Ganesha next to dream */}
            <div className="ganesha-helper">
              <img src={babyGaneshaImg} alt="Ganesha" className="ganesha-trunk bounce-gentle" />
            </div>
          </div>

          <div className="speech-bubble-large">
            Oh no! Hurdle Clouds are hiding your dream!<br />
            Don't worry, I am the Obstacle Remover!
          </div>

          <button
            className="trunk-tap-btn"
            onClick={() => setGamePhase('dream-clearing')}
          >
            Tap My Trunk to Blow Them Away! 🌬️
          </button>
        </div>
      )}

      {/* DREAM CLEARING - TAP TRUNK */}
      {gamePhase === 'dream-clearing' && (
        <div className="dream-screen">
          <div className="dream-container">
            {/* Child's drawing */}
            <div className="dream-drawing-display">
              {childDreamDrawing && (
                <img src={childDreamDrawing} alt="Your dream" className="dream-image" />
              )}
            </div>

            {/* Fading clouds */}
            <div className="clouds-container">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`dream-cloud cloud-${i + 1} ${trunkTaps > i ? 'cloud-fade' : ''}`}
                >
                  ☁️
                </div>
              ))}
            </div>

            {/* Tappable Ganesha */}
            <div
              className={`ganesha-helper ganesha-blowing ${trunkTaps >= 3 ? 'ganesha-blow-done' : ''}`}
              onClick={handleTrunkTap}
            >
              <img src={babyGaneshaImg} alt="Ganesha" className="ganesha-trunk" />
              {trunkTaps >= 3 && <div className="golden-puff">💨✨</div>}
            </div>
          </div>

          <div className="speech-bubble-large">
            Tap me 3 times! ({trunkTaps}/3) 🌬️
          </div>
        </div>
      )}

      {/* DREAM REVEALED */}
      {gamePhase === 'dream-revealed' && (
        <div className="dream-revealed-screen">
          <div className="dream-glow-container">
            {childDreamDrawing && (
              <img src={childDreamDrawing} alt="Your dream" className="dream-image-glowing" />
            )}

            {/* Sparkles around dream */}
            <div className="sparkles-container">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="sparkle-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                >
                  {['✨', '⭐', '💫'][i % 3]}
                </div>
              ))}
            </div>
          </div>

          <img src={babyGaneshaSit} alt="Ganesha" className="ganesha-proud celebrate-scale" />

          <div className="success-message-large">
            Your dream will come true!<br />
            I believe in you! Never give up! 🌟
          </div>
        </div>
      )}

      {/* COMPARISON CARD */}
      {gamePhase === 'comparison-card' && (
        <div className="dreams-comparison-screen">
          <div className="comparison-header">
            <h1 className="comparison-title glow-text">DREAMS CONNECTED! 🌟</h1>
            <div className="comparison-subtitle">Unstoppable Team</div>
          </div>

          <div className="dreams-comparison-grid">
            {/* GANESHA'S WISHES */}
            <div className="dreams-column ganesha-column">
              <div className="column-header">
                <img src={babyGaneshaSit} alt="Ganesha" className="column-avatar bounce-gentle" />
                <h2 className="column-name">GANESHA'S WISHES</h2>
              </div>

              <div className="wishes-list">
                <div className="wish-item pop-in" style={{ animationDelay: '0.1s' }}>
                  <div className="wish-icon">😊</div>
                  <div className="wish-text">Happiness</div>
                  <div className="wish-check">✓</div>
                </div>

                <div className="wish-item pop-in" style={{ animationDelay: '0.2s' }}>
                  <div className="wish-icon">🤝</div>
                  <div className="wish-text">Sharing</div>
                  <div className="wish-check">✓</div>
                </div>

                <div className="wish-item pop-in" style={{ animationDelay: '0.3s' }}>
                  <div className="wish-icon">🌳</div>
                  <div className="wish-text">Green World</div>
                  <div className="wish-check">✓</div>
                </div>
              </div>

              <div className="wishes-quote">
                "You helped the world smile!"
              </div>
            </div>

            {/* HEART DIVIDER */}
            <div className="comparison-divider">
              <div className="heart-connector pulse">❤️</div>
              <div className="divider-text">FRIENDS</div>
              <div className="heart-connector pulse">❤️</div>
            </div>

            {/* CHILD'S DREAM */}
            <div className="dreams-column child-column">
              <div className="column-header">
                <div className="child-dream-circle">
                  <div className="dream-sparkle">✨</div>
                </div>
                <h2 className="column-name">YOUR DREAM</h2>
              </div>

              <div className="dream-display-box pop-in" style={{ animationDelay: '0.4s' }}>
                {childDreamDrawing && (
                  <img src={childDreamDrawing} alt="Your dream" className="dream-thumbnail" />
                )}
              </div>

              <div className="wishes-quote">
                "I made sure your dream shines bright!"
              </div>
            </div>
          </div>

          {/* Final Message */}
          <div className="final-message-box">
            <p className="final-message-text">
              "No obstacle can stop us when we work together.<br />
              You are my best friend!"
            </p>
          </div>

          {/* Badge */}
          <div className="comparison-badge-container">
            <div className="comparison-badge celebrate-scale">
              🎖️ FRIENDSHIP POWER UNLOCKED! 🎖️
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
            {Array.from({ length: 30 }).map((_, i) => (
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

      {/* ENDING PLACEHOLDER */}
      {gamePhase === 'ending' && !showSceneCompletion && (
        <div className="ending-screen">
          <img src={babyGaneshaSit} alt="Ganesha" className="ganesha-final celebrate-scale" />
          <div className="final-title">Dreams Connected! 🌟</div>
        </div>
      )}

      {/* COMPLETION SCREEN */}
      {showSceneCompletion && (
        <AboutMeCompletion
          show={showSceneCompletion}
          sceneName="Dreams & Wishes"
          sceneNumber={4}
          totalScenes={4}
          starsEarned={gameState.stars}
          totalStars={3}
          discoveredBadges={['wish-maker', 'dream-helper', 'friendship-power']}
          badgeImages={{}}
          characterImages={{
            babyGanesha: babyGaneshaImg
          }}
          nextSceneName="Symbol Mountain"
          childName="dream maker"

          onContinue={() => {
            if (onNavigate) {
              onNavigate('zone-complete');
            } else if (onComplete) {
              onComplete();
            }
          }}

          onReplay={() => {
            setGamePhase('intro');
            setWish1Taps(0);
            setWish2Taps(0);
            setWish3Taps(0);
            setTrunkTaps(0);
            setChildDreamDrawing(null);
            setShowDrawingPad(false);
            setShowSceneCompletion(false);
            setGameState({ stars: 3, completed: false });
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

export default DreamsWishesGame;