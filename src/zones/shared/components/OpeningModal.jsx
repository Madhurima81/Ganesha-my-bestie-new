import React, { useEffect, useRef, useState } from 'react';
import './OpeningModal.css';
import { getOpeningModal } from '../../../lib/config/content';
import { getZoneTheme } from '../../../lib/config/ZoneThemes';
import { GANESHA_POSE_ASSETS } from '../../../lib/config/ganeshaUsageSystem';
import useAppVisibility from '../../../lib/hooks/useAppVisibility';

// Icon Mapping for Unified Style
import symbolMooshikaColored from '../../symbol-mountain/shared/images/icons/symbol-mooshika-new.png';
import symbolModakColored from '../../symbol-mountain/shared/images/icons/symbol-modak-new.png';
import symbolBellyColored from '../../symbol-mountain/shared/images/icons/symbol-belly-new.png';
import symbolLotusColored from '../../symbol-mountain/shared/images/icons/symbol-lotus-new.png';
import symbolTrunkColored from '../../symbol-mountain/shared/images/icons/symbol-trunk-new.png';
import symbolEyesColored from '../../symbol-mountain/shared/images/icons/symbol-eyes-new.png';
import symbolEarsColored from '../../symbol-mountain/shared/images/icons/symbol-ears-new.png';
import symbolTuskColored from '../../symbol-mountain/shared/images/icons/broken-tusk-symbol.png';
import banyanFullMahakaya from '../../shloka-river/scenes/Scene1/assets/images/banyan-full-from-download.png';

// About Me Icons
import shivaImg from '../../about-me-hut/family-tree/assets/images/ganesha/family-shiva.png';
import parvatiImg from '../../about-me-hut/family-tree/assets/images/ganesha/family-parvati.png';
import kartikeyaImg from '../../about-me-hut/family-tree/assets/images/ganesha/family-kartkeya.png';
import favFoodImg from '../../about-me-hut/food/assets/images/food-icon.png';
import favColorImg from '../../about-me-hut/food/assets/images/color-icon.png';
import favActivityImg from '../../about-me-hut/food/assets/images/sports-icon.png';
import familyIconImg from '../../about-me-hut/family-tree/assets/images/family-icon.png';
import heartIconImg from '../../about-me-hut/family-tree/assets/images/heart-icon.png';
import homeIconImg from '../../about-me-hut/family-tree/assets/images/house-icon.png';
import indianStoryHouseIcon from '../../about-me-hut/indian-story/assets/images/house-icon.png';
import indianStoryLanguageIcon from '../../about-me-hut/indian-story/assets/images/language-icon.png';
import indianStoryFestivalIcon from '../../about-me-hut/indian-story/assets/images/festival-icon.png';

// Dreams & Wishes Icons
import wishIconEarth from '../../about-me-hut/enjoy/assets/images/wish-icon-earth.png';
import wishIconShare from '../../about-me-hut/enjoy/assets/images/wish-icon-share.png';
import wishIconFlower from '../../about-me-hut/enjoy/assets/images/wish-icon-flower.png';
import wishHeartIcon from '../../about-me-hut/enjoy/assets/images/heart-icon.png';
import wishStarIcon from '../../about-me-hut/enjoy/assets/images/shootingstar-icon.png';
import wishWorldIcon from '../../about-me-hut/enjoy/assets/images/world-icon.png';
import symbolMountainBgWebp from '../../symbol-mountain/scenes/tusk/assets/images/symbolmtn_background.webp';
import symbolMountainBgJpg from '../../symbol-mountain/scenes/tusk/assets/images/symbolmtn_background.jpg';
import aboutFamilyBgWebp from '../../about-me-hut/family-tree/assets/images/family_background.webp';
import aboutFamilyBgJpg from '../../about-me-hut/family-tree/assets/images/family_background.jpg';
import aboutFoodBgWebp from '../../about-me-hut/food/assets/images/fav_background.webp';
import aboutFoodBgJpg from '../../about-me-hut/food/assets/images/fav_background.jpg';
import aboutNameBgWebp from '../../about-me-hut/name/assets/images/name_background.webp';
import aboutNameBgJpg from '../../about-me-hut/name/assets/images/name_background.jpg';
import aboutDreamBgWebp from '../../about-me-hut/enjoy/assets/images/dream_background.webp';
import aboutDreamBgJpg from '../../about-me-hut/enjoy/assets/images/dream_background.jpg';

// Shared / Fallback
import birthdayIcon from '../../festival-square/Game1-piano/assets/images/name-birthday-icon.png';
import balloonsIcon from '../../festival-square/Game4-mandapdecor/assets/images/fun_balloons_cluster.png';


// Cave of Secrets (Meaning Cave) Symbols
import symbolSuryakoti from '../../meaning cave/assets/images/symbols/suryakoti-symbol.png';
import symbolSamaprabha from '../../meaning cave/assets/images/symbols/samaprabha-symbol.png';
import symbolNirvighnam from '../../meaning cave/assets/images/symbols/nirvighnam-symbol.png';
import symbolKurumedeva from '../../meaning cave/assets/images/symbols/kurumedeva-symbol.png';
import symbolSarvakaryeshu from '../../meaning cave/assets/images/symbols/sarvakaryeshu-symbol.png';
import symbolSarvada from '../../meaning cave/assets/images/symbols/sarvada-symbol.png';
import meaningJournal from '../../meaning cave/assets/images/meaning-journal.png';
// Festival Square Icons
import listenIcon from '../../festival-square/assets/images/icons/listen-icon.png';
import playIcon from '../../festival-square/assets/images/icons/play-icon.png';
import createIcon from '../../festival-square/assets/images/icons/create-icon.png';
import cookIcon from '../../festival-square/assets/images/icons/cook-icon.png';
import designIcon from '../../festival-square/assets/images/icons/design-icon.png';
import drawIcon from '../../festival-square/assets/images/icons/draw-icon.png';
import learnIcon from '../../festival-square/assets/images/icons/learn-icon.png';
import coconutIcon from '../../festival-square/assets/images/icons/mandap-coconut-icon.png';
import diyaIcon from '../../festival-square/assets/images/icons/mandap-diya-icon.png';
import flowerIcon from '../../festival-square/assets/images/icons/mandap-flower-icon.png';
import recipeIcon from '../../festival-square/assets/images/icons/recipe-icon.png';
import serveIcon from '../../festival-square/assets/images/icons/serve-icon.png';

const CTA_POST_VO_GAP_MS = 5000;
const CTA_FALLBACK_TOTAL_MS = 12000;
const CTA_VO_POLL_INTERVAL_MS = 250;
const CTA_HINT_TEXT = 'Tap the button to begin!';
const AUDIO_PREF_KEY = 'ganesha_audio_enabled';

const isGlobalAudioEnabled = () => {
    try {
        const saved = localStorage.getItem(AUDIO_PREF_KEY);
        return saved === null ? true : saved === 'true';
    } catch {
        return true;
    }
};

const playOpeningCtaHint = () => {
    if (typeof window === 'undefined') return;
    if (!isGlobalAudioEnabled()) return;
    if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') return;

    try {
        const utterance = new window.SpeechSynthesisUtterance(CTA_HINT_TEXT);
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.volume = 1;
        window.speechSynthesis.speak(utterance);
    } catch {
        // Ignore speech API errors on unsupported devices/browsers.
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
    // Stop <audio> elements (scene VO, effects, etc.) universally.
    if (typeof document !== 'undefined') {
        document.querySelectorAll('audio').forEach((audioEl) => {
            try {
                audioEl.pause();
                audioEl.currentTime = 0;
            } catch {
                // Best-effort stop: ignore individual media errors.
            }
        });
    }

    // Stop Web Speech utterances if any scene uses speechSynthesis.
    if (typeof window !== 'undefined' && window.speechSynthesis?.cancel) {
        window.speechSynthesis.cancel();
    }

    // Stop Howler audio globally when available.
    if (typeof window !== 'undefined' && window.Howler?.stop) {
        try {
            window.Howler.stop();
        } catch {
            // Ignore if Howler is not initialized yet.
        }
    }

    // Let scene-specific audio managers opt-in to this global stop signal.
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ganesha:stop-all-audio', {
            detail: { source: 'OpeningModal', reason: 'lets-explore-click' }
        }));
    }
};

const ICON_MAP = {
    // Symbol Mountain
    'mooshika': symbolMooshikaColored,
    'modak': symbolModakColored,
    'belly': symbolBellyColored,
    'lotus': symbolLotusColored,
    'trunk': symbolTrunkColored,
    'eyes': symbolEyesColored,
    'ears': symbolEarsColored,
    'tusk': symbolTuskColored,

    // About Me HUT
    'shiva': shivaImg,
    'parvati': parvatiImg,
    'kartikeya': kartikeyaImg,
    'food': favFoodImg,
    'color': favColorImg,
    'activity': favActivityImg,
    'family': familyIconImg,
    'heart': heartIconImg,
    'home': homeIconImg,
    'story-home': indianStoryHouseIcon,
    'story-language': indianStoryLanguageIcon,
    'story-festival': indianStoryFestivalIcon,
    'balloons': balloonsIcon,
    'birthday': birthdayIcon,
    'wish-earth': wishIconEarth,
    'wish-share': wishIconShare,
    'wish-flower': wishIconFlower,
    'wish-heart': wishHeartIcon,
    'wish-star': wishStarIcon,
    'wish-world': wishWorldIcon,

    // Cave of Secrets Symbols (also used for Shloka River)
    'vakratunda': symbolTrunkColored,
    'mahakaya': banyanFullMahakaya,
    'suryakoti': symbolSuryakoti,
    'samaprabha': symbolSamaprabha,
    'nirvighnam': symbolNirvighnam,
    'kurumedeva': symbolKurumedeva,
    'sarvakaryeshu': symbolSarvakaryeshu,
    'sarvada': symbolSarvada,
    'meaning': meaningJournal,

    // Festival Square
    'listen-icon': listenIcon,
    'play-icon': playIcon,
    'create-icon': createIcon,
    'cook-icon': cookIcon,
    'design-icon': designIcon,
    'draw-icon': drawIcon,
    'learn-icon': learnIcon,
    'mandap-coconut-icon': coconutIcon,
    'mandap-diya-icon': diyaIcon,
    'mandap-flower-icon': flowerIcon,
    'recipe-icon': recipeIcon,
    'serve-icon': serveIcon,

    // Mandap Icons (Temporary Emojis)
    'mandap-learn-icon': '📚',
    'mandap-build-icon': '🔨',
    'mandap-decorate-icon': '✨',
};

const OPENING_BG_MAP = {
    'symbol-mountain:modak': [symbolMountainBgWebp, symbolMountainBgJpg],
    'symbol-mountain:pond': [symbolMountainBgWebp, symbolMountainBgJpg],
    'symbol-mountain:symbol': [symbolMountainBgWebp, symbolMountainBgJpg],
    'symbol-mountain:final-scene': [symbolMountainBgWebp, symbolMountainBgJpg],
    'symbol-mountain': [symbolMountainBgWebp, symbolMountainBgJpg],
    'about-me-hut:family-tree': [aboutFamilyBgWebp, aboutFamilyBgJpg],
    'about-me-hut:favorite-food': [aboutFoodBgWebp, aboutFoodBgJpg],
    'about-me-hut:name-birthday': [aboutNameBgWebp, aboutNameBgJpg],
    'about-me-hut:indian-story': [aboutNameBgWebp, aboutNameBgJpg],
    'about-me-hut:dreams-wishes': [aboutDreamBgWebp, aboutDreamBgJpg],
    'about-me-hut': [aboutNameBgWebp, aboutNameBgJpg],
};

const OpeningModal = ({
    zoneId,
    sceneId,
    onStart,
    characterImg,
    showButton = true,
    isOpen,
    // Direct content props — use these when not using zoneId+sceneId config lookup
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
    const configContent = (zoneId && sceneId) ? getOpeningModal(zoneId, sceneId) : null;

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

    const clearCtaHintTimers = () => {
        if (voMonitorTimerRef.current) {
            clearInterval(voMonitorTimerRef.current);
            voMonitorTimerRef.current = null;
        }
    };

    useEffect(() => {
        if (!visible) return undefined;

        const sceneKey = zoneId && sceneId ? `${zoneId}:${sceneId}` : null;
        const candidates = (sceneKey && OPENING_BG_MAP[sceneKey]) || (zoneId && OPENING_BG_MAP[zoneId]) || [];
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
    }, [visible, zoneId, sceneId]);

    // Tab visibility: reset hint timer on tab switch (matching idle hint behavior in scenes)
    useAppVisibility(
        () => {
            // onHide: clear the hint timer
            clearCtaHintTimers();
            setShowIdleCtaHint(false);
        },
        () => {
            // onShow: restart monitoring from fresh state
            if (hasContent && visible && showButton && !hintTriggeredRef.current) {
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
                        hintTriggeredRef.current = true;
                        setShowIdleCtaHint(true);
                        playOpeningCtaHint();
                        clearCtaHintTimers();
                        return;
                    }

                    if (!sawOpeningVoRef.current && now - monitorStartedAtRef.current >= CTA_FALLBACK_TOTAL_MS) {
                        hintTriggeredRef.current = true;
                        setShowIdleCtaHint(true);
                        playOpeningCtaHint();
                        clearCtaHintTimers();
                    }
                }, CTA_VO_POLL_INTERVAL_MS);
            }
        }
    );

    useEffect(() => {
        // Modal closed: kill timers and prevent any delayed CTA hint from firing mid-scene.
        if (!visible) {
            clearCtaHintTimers();
            setShowIdleCtaHint(false);
            hintTriggeredRef.current = true;
            return undefined;
        }

        setShowIdleCtaHint(false);
        hintTriggeredRef.current = false;
        clearCtaHintTimers();

        if (!hasContent || !visible || !showButton) return undefined;

        const triggerHint = () => {
            if (hintTriggeredRef.current) return;
            if (!visibleRef.current) return;
            hintTriggeredRef.current = true;
            setShowIdleCtaHint(true);
            playOpeningCtaHint();
            clearCtaHintTimers();
        };

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

            // Normal path: Intro VO played, then stayed idle for desired gap.
            if (sawOpeningVoRef.current && now - lastVoActiveAtRef.current >= CTA_POST_VO_GAP_MS) {
                triggerHint();
                return;
            }

            // Fallback: no VO detected at all on this device/scene.
            if (!sawOpeningVoRef.current && now - monitorStartedAtRef.current >= CTA_FALLBACK_TOTAL_MS) {
                triggerHint();
            }
        }, CTA_VO_POLL_INTERVAL_MS);

        return () => {
            clearCtaHintTimers();
        };
    }, [hasContent, visible, showButton, zoneId, sceneId]);

    if (!hasContent) return null;
    if (!visible) return null;

    const openingGaneshaAsset = zoneId === 'about-me-hut'
        ? GANESHA_POSE_ASSETS.sitHi
        : GANESHA_POSE_ASSETS.standPoint;

    return (
        <div className="game-modal-overlay" style={{
            '--modal-card-bg': theme.parentBg,
            '--modal-text-primary': theme.textPrimary,
            '--modal-btn-bg': theme.buttonModalOpeningBg || theme.buttonActiveBg,
            '--modal-btn-shadow': theme.glowColor,
            '--modal-btn-border': theme.buttonBorder || 'transparent',
            '--modal-btn-bg-hover': theme.buttonModalOpeningBg || theme.buttonHoverBg || theme.buttonActiveBg,
            '--modal-btn-text': '#FFFFFF',
            '--modal-scene-bg': overlayBgImage ? `url(${overlayBgImage})` : 'none'
        }}>
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
                    <h1 className="game-modal-title">{content.title}</h1>
                    <p className="game-modal-subtitle">
                        {content.description}
                    </p>

                    <div className="game-modal-icons">
                        {content.icons?.map((iconKey, index) => (
                            <div className="game-modal-icon-item" key={index}>
                                <div className="game-modal-icon-circle">
                                    {ICON_MAP[iconKey] ? (
                                        typeof ICON_MAP[iconKey] === 'string' && ICON_MAP[iconKey].length < 4 ? (
                                            <span style={{ fontSize: '70px' }}>{ICON_MAP[iconKey]}</span>
                                        ) : (
                                            <img src={ICON_MAP[iconKey]} alt={content.iconLabels?.[index] || iconKey} />
                                        )
                                    ) : typeof iconKey === 'string' && iconKey.length < 4 ? (
                                        <span style={{ fontSize: '70px' }}>{iconKey}</span>
                                    ) : iconKey?.startsWith?.('http') || iconKey?.startsWith?.('/') || iconKey?.startsWith?.('data:') ? (
                                        <img src={iconKey} alt={content.iconLabels?.[index] || ''} />
                                    ) : (
                                        <span style={{ fontSize: '70px' }}>✨</span>
                                    )}
                                </div>
                                <span className="game-modal-icon-label">
                                    {content.iconLabels?.[index] || iconKey}
                                </span>
                            </div>
                        ))}
                    </div>

                    {showButton && (
                        <button
                            className={`game-modal-button reveal ${showIdleCtaHint ? 'cta-idle-prompt' : ''}`}
                            onClick={() => {
                                hintTriggeredRef.current = true;
                                clearCtaHintTimers();
                                setShowIdleCtaHint(false);
                                stopAllOpeningVoAudio();
                                if (typeof isOpen !== 'boolean') setInternalOpen(false);
                                if (onStart) onStart();
                            }}
                        >
                            {content.buttonText || "Let's Explore"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OpeningModal;


