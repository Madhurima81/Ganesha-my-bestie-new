import React, { useEffect, useMemo, useRef, useState } from 'react';
import './GaneshaIntroStory.css';

const GaneshaIntroStory = ({ profileId, childName, onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showTapPuff, setShowTapPuff] = useState(false);
  const [tapPuffKey, setTapPuffKey] = useState(0);
  const speechTimerRef = useRef(null);
  const tapPuffTimerRef = useRef(null);
  const hasSpeechGestureRef = useRef(false);

  const slides = useMemo(
    () => [
      {
        image: '/intro-story/story1-open-pg.png',
        title: 'Meet Ganesha',
        text: 'A magical story begins...',
        minimal: true,
        vo: "Are you ready? Let's meet Ganesha!"
      },
      {
        image: '/intro-story/story1-img1.png',
        title: `Hi ${childName || 'friend'}!`,
        text: 'Come, let us begin a magical journey together.',
        vo: 'My mom Parvati made me with love and brought me to life!'
      },
      {
        image: '/intro-story/story1-img2.png',
        title: 'Meet Ganesha',
        text: 'I am your bestie, here to guide you with joy and courage.',
        vo: 'Mom said, Guard the door! But uh-oh, the visitor was Dad Shiva!'
      },
      {
        image: '/intro-story/story1-img3.png',
        title: 'Play and Learn',
        text: 'We will explore stories, symbols, and fun adventures.',
        vo: 'Mom felt very sad, so Dad gave me a magical elephant head!'
      },
      {
        image: '/intro-story/story1-img4.png',
        title: 'Ready?',
        text: 'Let us start and shine together.',
        vo: 'Now we were together again, as one happy family!'
      },
      {
        title: "Let's explore my world!",
        text: 'Tap to start your adventure',
        endScreen: true,
        endMapImage: '/intro-story/map-new-2.png',
        endGaneshaImage: '/intro-story/new-ganesha-stand-point.png',
        vo: "And now, let's explore my world together!"
      }
    ],
    [childName]
  );

  const finishStory = () => {
    if (profileId) {
      localStorage.setItem(`ganeshaStoryShown_${profileId}`, 'true');
    }
    onComplete?.();
  };

  const unlockSpeechFromGesture = () => {
    try {
      localStorage.setItem('ganesha_audio_enabled', 'true');
    } catch {}
    try {
      if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') return;
      const unlockUtterance = new window.SpeechSynthesisUtterance('');
      unlockUtterance.volume = 0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume?.();
      window.speechSynthesis.speak(unlockUtterance);
      hasSpeechGestureRef.current = true;
    } catch {}
  };

  useEffect(() => {
    const audioEnabled = localStorage.getItem('ganesha_audio_enabled');
    if (audioEnabled === 'false') return;
    if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') return;
    if (!hasSpeechGestureRef.current) return;

    const slide = slides[currentSlide];
    if (!slide) return;

    const speak = () => {
      const text = slide.vo || `${slide.title}. ${slide.text}`;
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume?.();
      const utterance = new window.SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices?.() || [];
      const preferredVoice =
        voices.find((v) => /female|zira|samantha|veena/i.test(v.name)) ||
        voices.find((v) => /en-IN|en-GB|en-US/i.test(v.lang)) ||
        null;
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    };

    speechTimerRef.current = setTimeout(speak, 120);
    window.speechSynthesis.addEventListener?.('voiceschanged', speak, { once: true });

    return () => {
      if (speechTimerRef.current) {
        clearTimeout(speechTimerRef.current);
        speechTimerRef.current = null;
      }
      window.speechSynthesis?.cancel?.();
      window.speechSynthesis?.removeEventListener?.('voiceschanged', speak);
    };
  }, [currentSlide, slides]);

  useEffect(() => {
    return () => {
      if (tapPuffTimerRef.current) {
        clearTimeout(tapPuffTimerRef.current);
      }
    };
  }, []);

  const handleNext = (showPuff = false) => {
    unlockSpeechFromGesture();
    if (showPuff) {
      setTapPuffKey((prev) => prev + 1);
      setShowTapPuff(true);
      if (tapPuffTimerRef.current) clearTimeout(tapPuffTimerRef.current);
      tapPuffTimerRef.current = setTimeout(() => setShowTapPuff(false), 420);
    }
    if (currentSlide >= slides.length - 1) {
      finishStory();
      return;
    }
    setCurrentSlide((prev) => prev + 1);
  };

  const slide = slides[currentSlide];

  return (
    <div className="gis-overlay">
      <span className="storySparkle" style={{ left: '14%', top: '20%', animationDelay: '0s' }} />
      <span className="storySparkle" style={{ left: '30%', top: '32%', animationDelay: '1.3s' }} />
      <span className="storySparkle" style={{ left: '64%', top: '24%', animationDelay: '2.1s' }} />
      <span className="storySparkle" style={{ left: '82%', top: '36%', animationDelay: '3.2s' }} />
      <span className="storySparkle" style={{ left: '48%', top: '16%', animationDelay: '4.1s' }} />
      <button type="button" className="storySkip" onClick={finishStory}>
        Skip
      </button>

      <div className="gis-stage">
        {slide.endScreen ? (
          <button type="button" className="storyEnd" onClick={finishStory} aria-label="Start your adventure">
            <div
              className="endMapBg"
              style={{ backgroundImage: `url('${slide.endMapImage}')` }}
            />
            <img src={slide.endGaneshaImage} alt="Ganesha" className="endGanesha" />
            <h2 className="endTitle">{slide.title}</h2>
            <p className="endSubtitle">{slide.text}</p>
            <div className="startPulse" aria-hidden="true" />
          </button>
        ) : (
          <>
            <img key={currentSlide} src={slide.image} alt={slide.title} className="gis-image storyScene active" />

            <div className="gis-bottom">
              {slide.minimal ? (
                <>
                  <h2 className="storyTitle">{slide.title}</h2>
                  <p className="storySubtitle">{slide.text}</p>
                </>
              ) : (
                <div className="gis-dots" aria-hidden="true">
                  {slides.map((item, index) =>
                    item.endScreen ? null : (
                      <span key={index} className={`gis-dot ${index === currentSlide ? 'active' : ''}`} />
                    )
                  )}
                </div>
              )}
            </div>

            {slide.minimal ? (
              <button type="button" className="storyTap" onClick={() => handleNext(false)}>
                Tap to begin
              </button>
            ) : (
              !slide.endScreen && (
                <>
                  <button type="button" className="storyNextArrow" onClick={() => handleNext(true)} aria-label="Next slide" />
                  {showTapPuff ? <span key={tapPuffKey} className="storyTapPuff" aria-hidden="true" /> : null}
                </>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GaneshaIntroStory;

