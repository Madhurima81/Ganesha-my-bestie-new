import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './GaneshaIntroStory.css';
import VOReplayButton from '../lib/components/feedback/VOReplayButton';
import { GANESHA_USAGE_SYSTEM } from '../lib/config/ganeshaUsageSystem';
import WelcomeLayers from '../lib/components/navigation/WelcomeLayers';

const GARDEN_BG = '/intro-story/story-garden-bg.webp';
const AUTO_ADVANCE_PAUSE_MS = 2500;     // breathing room after the voice ends
const AUTO_ADVANCE_SILENT_MS = 5500;    // muted / no speech: how long a page stays
const AUTO_ADVANCE_WATCHDOG_MS = 8000;  // voice never reported its end: advance anyway (+90ms per character)

const OPENING_VO = "Hi! I'm Ganesha. Come, let me tell you how my story began!";
const OPENING_TITLE = 'How My Story Began';
const TITLE_FADE_IN_MS = 5200;          // title appears near the end of the 8s sunray opening

const GaneshaIntroStory = ({ profileId, onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showVideoIntro, setShowVideoIntro] = useState(true);
  const [storyStarted, setStoryStarted] = useState(false);
  const [showTitle, setShowTitle] = useState(false);

  const videoIntroRef = useRef(null);
  const speechTimerRef = useRef(null);
  const hasSpeechGestureRef = useRef(false);
  // Bumped for every new voice line: a finished-callback from an older (cancelled/replaced) line is ignored.
  const speakTokenRef = useRef(0);
  // Page the child replayed by hand: auto-advance leaves it alone (they are in control now).
  const replayedSlideRef = useRef(-1);

  // Pages 1, 3 and 5 share ONE garden background with the characters laid over it. Layer positions
  // (l = left, t = top, w = width) are % of the background picture, so they stay put at any screen size.
  const slides = useMemo(
    () => [
      {
        bg: GARDEN_BG,
        layers: [{ src: '/intro-story/story-s1-parvati-creates-anim.webp', l: 35.1, t: 23.4, w: 24.6 }],
        alt: 'Parvati making young Ganesha from mud',
        vo: 'My mom, Parvati, made me from mud, with lots of love!'
      },
      {
        image: '/intro-story/story1-img2.webp',
        alt: 'Ganesha guarding the door as Shiva arrives',
        vo: "One day, Mom asked me to guard the door. I didn't know who Shiva was, so I stopped him."
      },
      {
        bg: GARDEN_BG,
        mudSpot: true,
        layers: [{ src: '/intro-story/story-s3-parvati-shiva.webp', l: 15.8, t: 8.5, w: 73.5 }],
        alt: 'Parvati and Shiva looking at the empty spot where Ganesha was',
        vo: "Oh no! Shiva didn't know who I was, and I got hurt."
      },
      {
        image: '/intro-story/story1-img3.webp',
        alt: 'Ganesha restored with his elephant head',
        vo: 'Shiva made things right, and brought me back with my elephant head!'
      },
      {
        bg: GARDEN_BG,
        layers: [{ src: '/intro-story/story-s5-family.gif', l: 29.3, t: 36.1, w: 36.2 }],
        alt: 'Ganesha together with Parvati and Shiva',
        vo: 'And soon, we were all together again!'
      },
      {
        endScreen: true,
        endMapImage: '/intro-story/map-new-2.webp',
        endGaneshaImage: GANESHA_USAGE_SYSTEM.startJourney.asset,
        vo: 'Now, come explore my world!'
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

  // onDone fires only when THIS line really finished (not when it was cancelled or replaced).
  const speakSlide = useCallback((slideIndex, onDone) => {
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

    const token = ++speakTokenRef.current;
    utterance.onend = () => {
      if (token === speakTokenRef.current) onDone?.();
    };
    utterance.onerror = (e) => {
      if (token !== speakTokenRef.current) return;
      if (e?.error === 'interrupted' || e?.error === 'canceled') return;
      onDone?.();
    };

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

    // Auto-advance: after this page's voice finishes, pause briefly, then turn the page.
    // The end screen never auto-advances (the child taps "Let's go"). Manual taps still work any time.
    let cancelled = false;
    let advanced = false;
    const timers = [];
    const advance = () => {
      if (cancelled || advanced || slide.endScreen || replayedSlideRef.current === currentSlide) return;
      advanced = true;
      timers.push(setTimeout(() => {
        if (!cancelled) setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      }, AUTO_ADVANCE_PAUSE_MS));
    };

    speechTimerRef.current = setTimeout(() => {
      const started = speakSlide(currentSlide, advance);
      if (slide.endScreen) return;
      // No voice (muted / Web Speech missing) -> read-time fallback. Voice that never reports
      // its end (iOS sometimes) -> watchdog sized to the line length.
      const fallbackMs = started
        ? AUTO_ADVANCE_WATCHDOG_MS + (slide.vo?.length || 0) * 90
        : AUTO_ADVANCE_SILENT_MS;
      timers.push(setTimeout(advance, fallbackMs));
    }, 150);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      if (speechTimerRef.current) {
        clearTimeout(speechTimerRef.current);
        speechTimerRef.current = null;
      }

      window.speechSynthesis?.cancel?.();
    };
  }, [currentSlide, slides, speakSlide, storyStarted]);

  useEffect(() => {
    const nextSlide = slides[currentSlide + 1];

    [nextSlide?.image, nextSlide?.bg, ...(nextSlide?.layers || []).map((l) => l.src)]
      .filter(Boolean)
      .forEach((src) => {
        const img = new Image();
        img.src = src;
      });
  }, [currentSlide, slides]);

  useEffect(() => {
    return () => {
      if (speechTimerRef.current) {
        clearTimeout(speechTimerRef.current);
      }

      window.speechSynthesis?.cancel?.();
    };
  }, []);

  // No "Tap to begin": once the sunray opening ends (or is skipped) page 1 starts by itself.
  // The child already tapped (profile icon / Mooshika ride / Skip), so voice is allowed.
  useEffect(() => {
    if (showVideoIntro || storyStarted) return;
    unlockSpeechFromGesture();
    setStoryStarted(true);
  }, [showVideoIntro, storyStarted]);

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
    replayedSlideRef.current = currentSlide;
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
        // Autoplay blocked: go straight to the story instead of a black screen.
        setShowVideoIntro(false);
      });
    }

    return () => clearTimeout(safetyCap);
  }, [showVideoIntro]);

  // Opening: Ganesha greets the child over the sunray video, then the title fades in near the end.
  useEffect(() => {
    if (!showVideoIntro) return undefined;
    const titleTimer = setTimeout(() => setShowTitle(true), TITLE_FADE_IN_MS);
    const voTimer = setTimeout(() => {
      try {
        if (localStorage.getItem('ganesha_audio_enabled') === 'false') return;
        if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') return;
        const u = new window.SpeechSynthesisUtterance(OPENING_VO);
        const voices = window.speechSynthesis.getVoices?.() || [];
        const v =
          voices.find((x) => /female|zira|samantha|veena/i.test(x.name)) ||
          voices.find((x) => /en-IN|en-GB|en-US/i.test(x.lang));
        if (v) u.voice = v;
        u.rate = 0.9;
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume?.();
        window.speechSynthesis.speak(u);
      } catch { /* the opening still plays silently */ }
    }, 400);
    return () => {
      clearTimeout(titleTimer);
      clearTimeout(voTimer);
    };
  }, [showVideoIntro]);

  if (showVideoIntro) {
    return (
      <div className="gis-overlay gis-video-intro">
        <WelcomeLayers
          videoRef={videoIntroRef}
          onEnded={() => setShowVideoIntro(false)}
          onError={() => setShowVideoIntro(false)}
        />

        {showTitle && <h1 className="gisOpeningTitle">{OPENING_TITLE}</h1>}

        <button type="button" className="storySkip" onClick={() => setShowVideoIntro(false)}>
          Skip
        </button>
      </div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div className="gis-overlay">
      {!slide.endScreen && (
        <button type="button" className="storySkip" onClick={finishStory}>
          Skip
        </button>
      )}

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
            {slide.bg ? (
              <div key={currentSlide} className="gis-layered storyScene active" role="img" aria-label={slide.alt}>
                <div className="gis-layered-box">
                  <img src={slide.bg} alt="" className="gis-layered-bg" draggable={false} />
                  {slide.mudSpot && <span className="gis-mud-spot" aria-hidden="true" />}
                  {slide.layers.map((layer) => (
                    <img
                      key={layer.src}
                      src={layer.src}
                      alt=""
                      className="gis-layer"
                      style={{ left: `${layer.l}%`, top: `${layer.t}%`, width: `${layer.w}%` }}
                      draggable={false}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <img
                key={currentSlide}
                src={slide.image}
                alt={slide.alt || 'Ganesha story'}
                className="gis-image storyScene active"
                draggable={false}
              />
            )}

            {storyStarted && (
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

                <VOReplayButton
                  variant="gameplay"
                  onReplay={handleReplayVo}
                  disabled={localStorage.getItem('ganesha_audio_enabled') === 'false'}
                />

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
