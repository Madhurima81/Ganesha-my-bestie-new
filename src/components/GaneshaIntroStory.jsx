import React, { useEffect, useMemo, useRef, useState } from 'react';
import './GaneshaIntroStory.css';
import { GANESHA_USAGE_SYSTEM } from '../lib/config/ganeshaUsageSystem';

const GaneshaIntroStory = ({ profileId, childName, onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showVideoIntro, setShowVideoIntro] = useState(true);
  const [showTapPuff, setShowTapPuff] = useState(false);
  const [tapPuffKey, setTapPuffKey] = useState(0);
  const videoIntroRef = useRef(null);
  const speechTimerRef = useRef(null);
  const tapPuffTimerRef = useRef(null);
  const introAdvanceTimerRef = useRef(null);
  const hasSpeechGestureRef = useRef(false);

  const slides = useMemo(
    () => [
      {
        image: '/intro-story/story1-open-pg.webp',
        title: 'Meet Ganesha',
        text: 'A magical story begins...',
        minimal: true,
        vo: "Are you ready? Let's meet Ganesha!"
      },
      {
        image: '/intro-story/story1-img1.webp',
        title: `Hi ${childName || 'friend'}!`,
        text: 'Come, let us begin a magical journey together.',
        vo: 'My mom Parvati made me with love and brought me to life!'
      },
      {
        image: '/intro-story/story1-img2.webp',
        title: 'Meet Ganesha',
        text: 'I am your bestie, here to guide you with joy and courage.',
        vo: 'Mom said, Guard the door! But uh-oh, the visitor was Dad Shiva!'
      },
      {
        image: '/intro-story/story1-img3.webp',
        title: 'Play and Learn',
        text: 'We will explore stories, symbols, and fun adventures.',
        vo: 'Mom felt very sad, so Dad gave me a magical elephant head!'
      },
      {
        image: '/intro-story/story1-img4.webp',
        title: 'Ready?',
        text: 'Let us start and shine together.',
        vo: 'Now we were together again, as one happy family!'
      },
      {
        title: "Let's explore my world!",
        text: 'Tap to start your adventure',
        endScreen: true,
        endMapImage: '/intro-story/map-new-2.webp',
        endGaneshaImage: GANESHA_USAGE_SYSTEM.startJourney.asset,
        vo: "And now, let's explore my world together!"
      }
    ],
    [childName]
  );

  const finishStory = () => {
    window.speechSynthesis?.cancel?.();
    if (profileId) {
      localStorage.setItem(`ganeshaStoryShown_${profileId}`, 'true');
    }
    onComplete?.();
  };

  const unlockSpeechFromGesture = () => {
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

  const speakSlide = (slideIndex) => {
    const audioEnabled = localStorage.getItem('ganesha_audio_enabled');
    if (audioEnabled === 'false') return false;
    if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') return false;
    if (!hasSpeechGestureRef.current) return false;

    const slide = slides[slideIndex];
    if (!slide) return false;

    const text = slide.vo || `${slide.title}. ${slide.text}`;
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
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume?.();
    window.speechSynthesis.speak(utterance);
    return true;
  };

  useEffect(() => {
    const slide = slides[currentSlide];
    if (!slide) return;
    speechTimerRef.current = setTimeout(() => {
      speakSlide(currentSlide);
    }, 120);

    return () => {
      if (speechTimerRef.current) {
        clearTimeout(speechTimerRef.current);
        speechTimerRef.current = null;
      }
      window.speechSynthesis?.cancel?.();
    };
  }, [currentSlide, slides]);

  useEffect(() => {
    return () => {
      if (speechTimerRef.current) {
        clearTimeout(speechTimerRef.current);
      }
      if (tapPuffTimerRef.current) {
        clearTimeout(tapPuffTimerRef.current);
      }
      if (introAdvanceTimerRef.current) {
        clearTimeout(introAdvanceTimerRef.current);
      }
      window.speechSynthesis?.cancel?.();
    };
  }, []);

  useEffect(() => {
    const nextSlide = slides[currentSlide + 1];
    if (!nextSlide?.image) return;
    const img = new Image();
    img.src = nextSlide.image;
  }, [currentSlide, slides]);

  const handleNext = (showPuff = false) => {
    unlockSpeechFromGesture();
    if (currentSlide === 0) {
      if (introAdvanceTimerRef.current) return;
      speakSlide(0);
      const audioEnabled = localStorage.getItem('ganesha_audio_enabled');
      introAdvanceTimerRef.current = setTimeout(() => {
        setCurrentSlide(1);
        introAdvanceTimerRef.current = null;
      }, audioEnabled === 'false' ? 1100 : 2800);
      return;
    }
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

  const handleReplayVo = (e) => {
    e.stopPropagation();
    unlockSpeechFromGesture();
    speakSlide(currentSlide);
  };

  const handleBack = (e) => {
    e.stopPropagation();
    if (currentSlide <= 1) return;
    window.speechSynthesis?.cancel?.();
    setCurrentSlide((prev) => prev - 1);
  };

  // Short Ganesha welcome video, before slide 0. Autoplays; advances to the
  // story on end / error / a hard 15s cap / the Skip button. The slide-0 VO
  // is gesture-gated so it can't talk over the video.
  useEffect(() => {
    if (!showVideoIntro) return undefined;
    const cap = setTimeout(() => setShowVideoIntro(false), 15000);
    const p = videoIntroRef.current?.play?.();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        /* autoplay blocked — the Skip button is still there */
      });
    }
    return () => clearTimeout(cap);
  }, [showVideoIntro]);

  if (showVideoIntro) {
    return (
      <div className="gis-overlay gis-video-intro">
        <video
          ref={videoIntroRef}
          className="gis-intro-video"
          autoPlay
          playsInline
          preload="auto"
          onEnded={() => setShowVideoIntro(false)}
          onError={() => setShowVideoIntro(false)}
        >
          <source src="/videos/ganeshawelcome-new.webm" type="video/webm" />
          <source src="/videos/ganeshawelcome-new.mp4" type="video/mp4" />
        </video>
        <button type="button" className="storySkip" onClick={() => setShowVideoIntro(false)}>
          Skip
        </button>
      </div>
    );
  }

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
            <button
              type="button"
              className="storyStageTap"
              onClick={() => handleNext(!slide.minimal)}
              aria-label={slide.minimal ? 'Tap to begin story' : 'Next slide'}
            >
              <img key={currentSlide} src={slide.image} alt={slide.title} className="gis-image storyScene active" />
            </button>
            {!slide.minimal && slide.vo && (
              <p className="storyCaption" key={`cap-${currentSlide}`}>{slide.vo}</p>
            )}

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
                  {currentSlide > 1 && (
                    <button type="button" className="storyBackArrow" onClick={handleBack} aria-label="Previous page" />
                  )}
                  <button type="button" className="storyReplayVo" onClick={handleReplayVo} aria-label="Hear this page again">
                    <img src="/images/icons/icon-sound-on.svg" alt="" className="storyReplayVoIcon" draggable={false} />
                  </button>
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
