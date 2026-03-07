import React, { useState } from 'react';
import './OpeningModal.css';
import { getOpeningModal } from '../../../lib/config/content';
import { getZoneTheme } from '../../../lib/config/ZoneThemes';

// Icon Mapping for Unified Style
import symbolMooshikaColored from '../../symbol-mountain/shared/images/icons/symbol-mooshika-colored.svg';
import symbolModakColored from '../../symbol-mountain/shared/images/icons/symbol-modak-colored.svg';
import symbolBellyColored from '../../symbol-mountain/shared/images/icons/symbol-belly-colored.svg';
import symbolLotusColored from '../../symbol-mountain/shared/images/icons/symbol-lotus-colored.png';
import symbolTrunkColored from '../../symbol-mountain/shared/images/icons/symbol-trunk-colored.png';
import symbolEyesColored from '../../symbol-mountain/shared/images/icons/symbol-eyes-colored.png';
import symbolEarsColored from '../../symbol-mountain/shared/images/icons/symbol-ear-colored.png';
import symbolTuskColored from '../../symbol-mountain/shared/images/icons/symbol-tusk-colored.png';

// About Me Icons
import shivaImg from '../../about-me-hut/family-tree/assets/images/ganesha/family-shiva.png';
import parvatiImg from '../../about-me-hut/family-tree/assets/images/ganesha/family-parvati.png';
import kartikeyaImg from '../../about-me-hut/family-tree/assets/images/ganesha/family-kartkeya.png';
import favFoodImg from '../../about-me-hut/food/assets/images/fav-icon-food.png';
import favColorImg from '../../about-me-hut/food/assets/images/fav-icon-color.png';
import favActivityImg from '../../about-me-hut/food/assets/images/fav-icon-activity.png';

// Dreams & Wishes Icons
import wishIconEarth from '../../about-me-hut/enjoy/assets/images/wish-icon-earth.png';
import wishIconShare from '../../about-me-hut/enjoy/assets/images/wish-icon-share.png';
import wishIconFlower from '../../about-me-hut/enjoy/assets/images/wish-icon-flower.png';

// Shared / Fallback
import birthdayIcon from '../../festival-square/Game1-piano/assets/images/name-birthday-icon.png';
import balloonsIcon from '../../festival-square/Game4-mandapdecor/assets/images/fun_balloons_cluster.png';


// Cave of Secrets (Meaning Cave) Symbols
import symbolVakratunda from '../../meaning cave/assets/images/symbols/vakratunda-symbol.png';
import symbolMahakaya from '../../meaning cave/assets/images/symbols/mahakaya-symbol.png';
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
    'balloons': balloonsIcon,
    'birthday': birthdayIcon,
    'wish-earth': wishIconEarth,
    'wish-share': wishIconShare,
    'wish-flower': wishIconFlower,

    // Cave of Secrets Symbols (also used for Shloka River)
    'vakratunda': symbolVakratunda,
    'mahakaya': symbolMahakaya,
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
    const configContent = (zoneId && sceneId) ? getOpeningModal(zoneId, sceneId) : null;

    const content = {
        title: titleProp ?? configContent?.title,
        description: descriptionProp ?? configContent?.description,
        icons: iconsProp ?? configContent?.icons,
        iconLabels: iconLabelsProp ?? configContent?.iconLabels,
        buttonText: buttonTextProp ?? configContent?.buttonText,
    };

    if (!content.title && !content.description) return null;

    const visible = typeof isOpen === 'boolean' ? isOpen : internalOpen;
    if (!visible) return null;

    const theme = zoneId ? getZoneTheme(zoneId) : {};

    return (
        <div className="game-modal-overlay" style={{
            '--modal-card-bg': theme.parentBg,
            '--modal-text-primary': theme.textPrimary,
            '--modal-btn-bg': theme.buttonActiveBg,
            '--modal-btn-shadow': theme.glowColor,
            '--modal-btn-border': theme.buttonBorder || 'transparent',
            '--modal-btn-bg-hover': theme.buttonHoverBg || theme.buttonActiveBg,
            '--modal-btn-text': '#FFFFFF'
        }}>
            <div className="game-modal-content">
                <div className="game-modal-character">
                    <img src={characterImg} alt="Character" />
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
                            className="game-modal-button reveal"
                            onClick={() => {
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

