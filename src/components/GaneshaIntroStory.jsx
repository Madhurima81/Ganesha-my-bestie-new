import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './GaneshaIntroStory.css';
import { GANESHA_USAGE_SYSTEM } from '../lib/config/ganeshaUsageSystem';

const GaneshaIntroStory = ({ profileId, onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showVideoIntro, setShowVideoIntro] = useState(true);
  const [storyStarted, setStoryStarted] = useState(false);

  const videoIntroRef = useRef(null);
  const speechTimerRef = useRef(null);
  const hasSpeechGestureRef = useRef(false);

  const slides = useMemo(
    () => [
      {
        image: '/intro-story/story1-img1.webp',
        alt: 'Parvati with young Ganesha',
        vo: 'My mom, Parvati, made me with love.'
      },
      {
        image: '/intro-story/story1-img2.webp',
        alt: 'Ganesha guarding the door as Shiva arrives',
        vo: "Mom asked me to guard the door. When Shiva came, I wouldn't let him in."
      },
      {
        image: '/intro-story/story1-img2-transition.webp',
        alt: 'Parvati and Shiva after something has gone wrong',
        vo: 'Uh-oh... something went very wrong.'
      },
      {
        image: '/intro-story/story1-img3.webp',
        alt: 'Ganesha restored with his elephant head',
        vo: 'Shiva made things right, and I came back with my elephant head.'
      },
      {
        image: '/intro-story/story1-img4.webp',
        alt: 'Ganesha together with his family',
        vo: 'Soon, we were together again.'
      },
      {
        endScreen: true,
        endMapImage: '/intro-story/map-new-2.webp',
        endGaneshaImage: GANESHA_USAGE_SYSTEM.startJourney.asset,
        vo: 'Now come explore my world!'
      }
    ],
    []
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
      if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') {
        return;
      }

      const unlockUtterance = new window.SpeechSynthesisUtterance('');
      unlockUtterance.volume = 0;

      window.speechSynthesis.cancel();
      window.speechSynthesis.resume?.();
      window.speechSynthesis.speak(unlockUtterance);

      hasSpeechGestureRef.current = true;
    } catch {
      // The story remains usable visually if Web Speech is unavailable.
    }
  };

  const speakSlide = useCallback((slideIndex) => {
    const audioEnabled = localStorage.getItem('ganesha_audio_enabled');

    if (audioEnabled === 'false') return false;
    if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') return false;
    if (!hasSpeechGestureRef.current) return false;

    const slide = slides[slideIndex];

    if (!slide?.vo) return false;

    const utterance = new window.SpeechSynthesisUtterance(slide.vo);
    const voices = window.speechSynthesis.getVoices?.() || [];
    const preferredVoice =
      voices.find((v) => /female|zira|samantha|veena/i.test(v.name)) ||
      voices.find((v) => /en-IN|en-GB|en-US/i.test(v.lang)) ||
      null;

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.resume?.();
    window.speechSynthesis.speak(utterance);

    return true;
  }, [slides]);

  useEffect(() => {
    if (!storyStarted) return undefined;

    const slide = slides[currentSlide];
    if (!slide) return undefined;

    speechTimerRef.current = setTimeout(() => {
      speakSlide(currentSlide);
    }, 150);

    return () => {
      if (speechTimerRef.current) {
        clearTimeout(speechTimerRef.current);
        speechTimerRef.current = null;
      }

      window.speechSynthesis?.cancel?.();
    };
  }, [currentSlide, slides, speakSlide, storyStarted]);

  useEffect(() => {
    const nextSlide = slides[currentSlide + 1];

    if (!nextSlide?.image) return;

    const img = new Image();
    img.src = nextSlide.image;
  }, [currentSlide, slides]);

  useEffect(() => {
    return () => {
      if (speechTimerRef.current) {
        clearTimeout(speechTimerRef.current);
      }

      window.speechSynthesis?.cancel?.();
    };
  }, []);

  const beginStory = () => {
    unlockSpeechFromGesture();
    setStoryStarted(true);
  };

  const handleNext = () => {
    unlockSpeechFromGesture();

    if (currentSlide >= slides.length - 1) {
      finishStory();
      return;
    }

    setCurrentSlide((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentSlide <= 0) return;

    window.speechSynthesis?.cancel?.();
    setCurrentSlide((prev) => prev - 1);
  };

  const handleReplayVo = () => {
    unlockSpeechFromGesture();
    speakSlide(currentSlide);
  };

  useEffect(() => {
    if (!showVideoIntro) return undefined;

    const safetyCap = setTimeout(() => {
      setShowVideoIntro(false);
    }, 15000);

    const playback = videoIntroRef.current?.play?.();

    if (playback && typeof playback.catch === 'function') {
      playback.catch(() => {
        // Skip remains available if autoplay is blocked.
      });
    }

    return () => clearTimeout(safetyCap);
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
      <button type="button" className="storySkip" onClick={finishStory}>
        Skip
      </button>

      <div className="gis-stage">
        {slide.endScreen ? (
          <div className="storyEnd">
            <div
              className="endMapBg"
              style={{
                backgroundImage: `url('${slide.endMapImage}')`
              }}
            />

            <img src={slide.endGaneshaImage} alt="Ganesha" className="endGanesha" />

            <h2 className="endTitle">Let's explore my world!</h2>

            <button type="button" className="storyStartButton" onClick={finishStory}>
              Let's go
            </button>
          </div>
        ) : (
          <>
            <img
              key={currentSlide}
              src={slide.image}
              alt={slide.alt || 'Ganesha story'}
              className="gis-image storyScene active"
              draggable={false}
            />

            {!storyStarted ? (
              <button type="button" className="storyBeginButton" onClick={beginStory}>
                Tap to begin
              </button>
            ) : (
              <>
                <div className="gis-dots" aria-hidden="true">
                  {slides.map((item, index) =>
                    item.endScreen ? null : (
                      <span key={index} className={`gis-dot ${index === currentSlide ? 'active' : ''}`} />
                    )
                  )}
                </div>

                {currentSlide > 0 && (
                  <button
                    type="button"
                    className="storyBackArrow"
                    onClick={handleBack}
                    aria-label="Previous page"
                  />
                )}

                <button
                  type="button"
                  className="storyReplayVo"
                  onClick={handleReplayVo}
                  aria-label="Hear this page again"
                >
                  <img
                    src="/images/icons/icon-sound-on.svg"
                    alt=""
                    className="storyReplayVoIcon"
                    draggable={false}
                  />
                </button>

                <button type="button" className="storyNextArrow" onClick={handleNext} aria-label="Next page" />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GaneshaIntroStory;
