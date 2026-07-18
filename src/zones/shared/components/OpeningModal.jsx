import React, { useCallback, useEffect, useRef, useState } from 'react';
import './OpeningModal.css';
import { getOpeningModal } from '../../../lib/config/content';
import { getZoneTheme, getProfilePillBtnStyle } from '../../../lib/config/ZoneThemes';
import { GANESHA_POSE_ASSETS } from '../../../lib/config/ganeshaUsageSystem';
import useAppVisibility from '../../../lib/hooks/useAppVisibility';
import ProfilePillBtn from '../../../lib/components/shared/ProfilePillBtn';

const CTA_POST_VO_GAP_MS = 5000;
const CTA_FALLBACK_TOTAL_MS = 12000;
const CTA_VO_POLL_INTERVAL_MS = 250;
const CTA_HINT_TEXT = 'Tap the button to begin!';
const AUDIO_PREF_KEY = 'ganesha_audio_enabled';
const FALLBACK_SPARKLE = '\u2728';

const PUBLIC_ICON_MAP = {
  mooshika: '/images/icons/symbol-mooshika-new.png',
  modak: '/images/icons/symbol-modak-new.png',
  belly: '/images/icons/symbol-belly-new.png',
  lotus: '/images/icons/symbol-lotus-new.png',
  trunk: '/images/icons/symbol-trunk-new.png',
  eyes: '/images/icons/symbol-eyes-new.png',
  ears: '/images/icons/symbol-ears-new.png',
  tusk: '/images/icons/broken-tusk-symbol.png',
  vakratunda: '/images/meanings-caveofsecrets/vakratunda-symbol.png',
  mahakaya: '/images/meanings-caveofsecrets/mahakaya-symbol.png',
  suryakoti: '/images/meanings-caveofsecrets/suryakoti-symbol.png',
  samaprabha: '/images/meanings-caveofsecrets/samaprabha-symbol.png',
  nirvighnam: '/images/meanings-caveofsecrets/nirvighnam-symbol.png',
  kurumedeva: '/images/meanings-caveofsecrets/kurumedeva-symbol.png',
  sarvakaryeshu: '/images/meanings-caveofsecrets/sarvakaryeshu-symbol.png',
  sarvada: '/images/meanings-caveofsecrets/sarvada-symbol.png',
  meaning: '/images/icons/meanings-icon.png',
  'story-home': '\u{1F3E0}',
  'story-language': '\u{1F5E3}\uFE0F',
  'story-festival': '\u{1F389}',
  home: '\u{1F3E0}',
  heart: '\u{1F49B}',
  family: '/images/zones/about-me-hut/family-tree-icon.png',
  food: '\u{1F34E}',
  color: '\u{1F3A8}',
  activity: '\u26BD',
  'wish-heart': '\u{1F49B}',
  'wish-star': '\u2B50',
  'wish-world': '\u{1F30D}',
  'listen-icon': '\u{1F3A7}',
  'play-icon': '\u{1F3B9}',
  'create-icon': '\u2728',
  'learn-icon': '\u{1F4DA}',
  'draw-icon': '\u{1F3A8}',
  'design-icon': '\u{1FAA1}',
  'recipe-icon': '\u{1F4D6}',
  'cook-icon': '\u{1F372}',
  'serve-icon': '\u{1F37D}\uFE0F',
  'mandap-learn-icon': '\u{1F4DA}',
  'mandap-build-icon': '\u{1F528}',
  'mandap-decorate-icon': '\u2728',
};

const OPENING_BG_MAP = {
  'symbol-mountain': ['/images/symbol-mountain-bg.webp', '/images/symbol-mountain-bg.png'],
  'shloka-river': ['/images/shloka-river-bg.webp', '/images/shloka-river-bg.png'],
  'about-me-hut': ['/images/about-me-hut-bg.webp', '/images/about-me-hut-bg.png'],
  'festival-square': ['/images/festivalsquare-bg.webp', '/images/festivalsquare-bg.png'],
  'cave-of-secrets': ['/images/cave-of-secrets-background.webp', '/images/cave-of-secrets-background.png'],
};

const isGlobalAudioEnabled = () => {
  try {
    const saved = localStorage.getItem(AUDIO_PREF_KEY);
    return saved === null ? true : saved === 'true';
  } catch {
    return true;
  }
};

const canUseTimedSpeechHint = () => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator?.userAgent || '';
  return !/iPad|iPhone|iPod/i.test(ua);
};

const playOpeningCtaHint = () => {
  if (typeof window === 'undefined') return false;
  if (!isGlobalAudioEnabled() || !canUseTimedSpeechHint()) return false;
  if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') return false;

  try {
    const utterance = new window.SpeechSynthesisUtterance(CTA_HINT_TEXT);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
};

const isOpeningVoActive = () => {
  if (typeof window === 'undefined') return false;

  const webSpeechSpeaking = Boolean(window.speechSynthesis?.speaking);
  const activeAudioElements =
    typeof document !== 'undefined'
      ? Array.from(document.querySelectorAll('audio')).filter(
          (audioEl) =>
            !audioEl.paused &&
            !audioEl.ended &&
            !audioEl.loop &&
            !audioEl.muted &&
            audioEl.volume > 0
        )
      : [];

  return webSpeechSpeaking || activeAudioElements.length > 0;
};

const stopAllOpeningVoAudio = () => {
  if (typeof document !== 'undefined') {
    document.querySelectorAll('audio').forEach((audioEl) => {
      if (audioEl.loop) return;
      try {
        audioEl.pause();
        audioEl.currentTime = 0;
      } catch {}
    });
  }

  if (typeof window !== 'undefined' && window.speechSynthesis?.cancel) {
    window.speechSynthesis.cancel();
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('ganesha:stop-all-audio', {
        detail: { source: 'OpeningModal', reason: 'lets-explore-click' },
      })
    );
  }
};

const OpeningModal = ({
  zoneId,
  sceneId,
  onStart,
  showButton = true,
  isOpen,
  title: titleProp,
  description: descriptionProp,
  icons: iconsProp,
  iconLabels: iconLabelsProp,
  buttonText: buttonTextProp,
}) => {
  const [internalOpen, setInternalOpen] = useState(true);
  const [showIdleCtaHint, setShowIdleCtaHint] = useState(false);
  const [overlayBgImage, setOverlayBgImage] = useState('');
  const voMonitorTimerRef = useRef(null);
  const hintTriggeredRef = useRef(false);
  const sawOpeningVoRef = useRef(false);
  const lastVoActiveAtRef = useRef(0);
  const monitorStartedAtRef = useRef(0);
  const visibleRef = useRef(false);
  const configContent = zoneId && sceneId ? getOpeningModal(zoneId, sceneId) : null;

  const content = {
    title: titleProp ?? configContent?.title,
    description: descriptionProp ?? configContent?.description,
    icons: iconsProp ?? configContent?.icons,
    iconLabels: iconLabelsProp ?? configContent?.iconLabels,
    buttonText: buttonTextProp ?? configContent?.buttonText,
  };
  const hasContent = Boolean(content.title || content.description);
  const visible = typeof isOpen === 'boolean' ? isOpen : internalOpen;
  visibleRef.current = visible;
  const theme = zoneId ? getZoneTheme(zoneId) : {};

  const clearCtaHintTimers = useCallback(() => {
    if (voMonitorTimerRef.current) {
      clearInterval(voMonitorTimerRef.current);
      voMonitorTimerRef.current = null;
    }
  }, []);

  const triggerHint = useCallback(() => {
    if (hintTriggeredRef.current || !visibleRef.current) return;
    hintTriggeredRef.current = true;
    setShowIdleCtaHint(true);
    playOpeningCtaHint();
    clearCtaHintTimers();
  }, [clearCtaHintTimers]);

  const startVoMonitor = useCallback(() => {
    if (!hasContent || !visibleRef.current || !showButton || hintTriggeredRef.current) return;
    clearCtaHintTimers();

    sawOpeningVoRef.current = false;
    monitorStartedAtRef.current = Date.now();
    lastVoActiveAtRef.current = monitorStartedAtRef.current;

    voMonitorTimerRef.current = setInterval(() => {
      if (hintTriggeredRef.current) return;

      const now = Date.now();
      const voActive = isOpeningVoActive();

      if (voActive) {
        sawOpeningVoRef.current = true;
        lastVoActiveAtRef.current = now;
        return;
      }

      if (sawOpeningVoRef.current && now - lastVoActiveAtRef.current >= CTA_POST_VO_GAP_MS) {
        triggerHint();
        return;
      }

      if (!sawOpeningVoRef.current && now - monitorStartedAtRef.current >= CTA_FALLBACK_TOTAL_MS) {
        triggerHint();
      }
    }, CTA_VO_POLL_INTERVAL_MS);
  }, [clearCtaHintTimers, hasContent, showButton, triggerHint]);

  useEffect(() => {
    if (!visible) return undefined;

    const candidates = (zoneId && OPENING_BG_MAP[zoneId]) || [];
    if (!candidates.length) {
      setOverlayBgImage('');
      return undefined;
    }

    let cancelled = false;
    let idx = 0;

    const tryLoad = () => {
      if (cancelled || idx >= candidates.length) return;
      const img = new Image();
      const src = candidates[idx];
      img.onload = () => {
        if (!cancelled) setOverlayBgImage(src);
      };
      img.onerror = () => {
        idx += 1;
        tryLoad();
      };
      img.src = src;
    };

    setOverlayBgImage('');
    tryLoad();

    return () => {
      cancelled = true;
    };
  }, [visible, zoneId]);

  useAppVisibility(
    () => {
      clearCtaHintTimers();
      setShowIdleCtaHint(false);
    },
    () => {
      if (hasContent && visible && showButton && !hintTriggeredRef.current) {
        startVoMonitor();
      }
    }
  );

  useEffect(() => {
    if (!visible) {
      clearCtaHintTimers();
      setShowIdleCtaHint(false);
      hintTriggeredRef.current = true;
      return undefined;
    }

    setShowIdleCtaHint(false);
    hintTriggeredRef.current = false;

    if (!hasContent || !showButton) return undefined;

    startVoMonitor();
    return () => {
      clearCtaHintTimers();
    };
  }, [clearCtaHintTimers, hasContent, showButton, startVoMonitor, visible]);

  if (!hasContent || !visible) return null;

  const openingGaneshaAsset =
    zoneId === 'about-me-hut' ? GANESHA_POSE_ASSETS.sitHi : GANESHA_POSE_ASSETS.standPoint;

  return (
    <div
      className="game-modal-overlay"
      style={{
        '--modal-card-bg': theme.parentBg,
        '--modal-text-primary': theme.textPrimary,
        '--modal-btn-bg': theme.buttonModalOpeningBg || theme.buttonActiveBg,
        '--modal-btn-shadow': theme.glowColor,
        '--modal-btn-border': theme.buttonBorder || 'transparent',
        '--modal-btn-bg-hover':
          theme.buttonModalOpeningBg || theme.buttonHoverBg || theme.buttonActiveBg,
        '--modal-btn-text': '#FFFFFF',
        '--modal-scene-bg': overlayBgImage ? `url(${overlayBgImage})` : 'none',
      }}
    >
      <div className="game-modal-content">
        <div className="game-modal-character">
          <img
            className="game-modal-ganesha"
            src={openingGaneshaAsset}
            alt="Ganesha"
            style={{
              width: 'min(520px, 100%)',
              height: 'auto',
              aspectRatio: '1 / 1',
              flexShrink: 1,
            }}
          />
        </div>
        <div className="game-modal-card">
          <span className="game-modal-lotus-top" aria-hidden="true" />
          <h1 className="game-modal-title">{content.title}</h1>
          <p className="game-modal-subtitle">{content.description}</p>

          <div className="game-modal-icons">
            {content.icons?.map((iconKey, index) => {
              const iconValue = PUBLIC_ICON_MAP[iconKey] || iconKey;
              const label = content.iconLabels?.[index] || iconKey;

              return (
                <div className="game-modal-icon-item" key={`${iconKey}-${index}`}>
                  <div className="game-modal-icon-circle">
                    {typeof iconValue === 'string' && iconValue.length < 4 ? (
                      <span>{iconValue}</span>
                    ) : typeof iconValue === 'string' &&
                      (iconValue.startsWith('http') || iconValue.startsWith('/')) ? (
                      <img src={iconValue} alt={label} />
                    ) : (
                      <span>{FALLBACK_SPARKLE}</span>
                    )}
                  </div>
                  <span className="game-modal-icon-label">{label}</span>
                </div>
              );
            })}
          </div>

          {showButton && (
            <>
              <ProfilePillBtn
                label={content.buttonText || "Let's Explore"}
                onClick={() => {
                  hintTriggeredRef.current = true;
                  clearCtaHintTimers();
                  setShowIdleCtaHint(false);
                  stopAllOpeningVoAudio();
                  if (typeof isOpen !== 'boolean') setInternalOpen(false);
                  onStart?.();
                }}
                size="lg"
                fullWidth={false}
                className={`reveal opening-modal-cta ${showIdleCtaHint ? 'cta-idle-prompt' : ''}`}
                style={getProfilePillBtnStyle(zoneId)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpeningModal;
