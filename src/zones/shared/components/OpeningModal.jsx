import React from 'react';
import './OpeningModal.css';
import { getOpeningModal } from '../../../lib/config/content';
import { getZoneTheme } from '../../../lib/config/ZoneThemes';

// Icon Mapping for Unified Style
import symbolMooshikaColored from '../../symbol-mountain/shared/images/icons/symbol-mooshika-colored.png';
import symbolModakColored from '../../symbol-mountain/shared/images/icons/symbol-modak-colored.png';
import symbolBellyColored from '../../symbol-mountain/shared/images/icons/symbol-belly-colored.png';
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
import siblingsPeaceballoon from '../../meaning cave/scenes/sarvakaryeshu-sarvada/assets/images/game 2/helpers/siblings_peaceballoon.png';

// Shloka River App Icons
import appVakratunda from '../../shloka-river/assets/images/apps/app-Vakratunda.png';
import appMahakaya from '../../shloka-river/assets/images/apps/app-mahakaya.png';
import appSuryakoti from '../../shloka-river/assets/images/apps/app-suryakoti.png';
import appSamaprabha from '../../shloka-river/assets/images/apps/app-samaprabha.png';
import appNirvighnam from '../../shloka-river/assets/images/apps/app-nirvighnam.png';
import appKurumedeva from '../../shloka-river/assets/images/apps/app-kurumedeva.png';
import appSarvakaryeshu from '../../shloka-river/assets/images/apps/app-sarvakaryeshu.png';
import appSarvada from '../../shloka-river/assets/images/apps/app-sarvada.png';
import stoneIcon from '../../shloka-river/scenes/Scene3/assets/images/nirvighnam/stone1.png';
import raftIcon from '../../shloka-river/scenes/scene5/assets/images/raft.png';

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
    'balloons': siblingsPeaceballoon,
    'birthday': '🎂', // Fallback to emoji if no high-quality cake found yet
    'wish-earth': wishIconEarth,
    'wish-share': wishIconShare,
    'wish-flower': wishIconFlower,

    // Shloka River Apps
    'vakratunda-app': appVakratunda,
    'mahakaya-app': appMahakaya,
    'suryakoti-app': appSuryakoti,
    'samaprabha-app': appSamaprabha,
    'nirvighnam-app': appNirvighnam,
    'kurumedeva-app': appKurumedeva,
    'sarvakaryeshu-app': appSarvakaryeshu,
    'sarvada-app': appSarvada,

    // Cave of Secrets Symbols
    'vakratunda': symbolVakratunda,
    'mahakaya': symbolMahakaya,
    'suryakoti': symbolSuryakoti,
    'samaprabha': symbolSamaprabha,
    'nirvighnam': symbolNirvighnam,
    'kurumedeva': symbolKurumedeva,
    'sarvakaryeshu': symbolSarvakaryeshu,
    'sarvada': symbolSarvada,
    'meaning': meaningJournal,

    // Shloka River Finale
    'build-words': stoneIcon,
    'arrange': raftIcon,
    'complete': symbolLotusColored,

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
};

const OpeningModal = ({
    zoneId,
    sceneId,
    onStart,
    characterImg,
    showButton = true
}) => {
    const content = getOpeningModal(zoneId, sceneId);
    if (!content) return null;

    const theme = getZoneTheme(zoneId);

    return (
        <div className="game-modal-overlay" style={{
            '--modal-card-bg': theme.parentBg,
            '--modal-text-primary': theme.textPrimary,
            '--modal-btn-bg': theme.buttonActiveBg,
            '--modal-btn-shadow': theme.glowColor
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
                        <button className="game-modal-button reveal" onClick={onStart}>
                            {content.buttonText || "Let's Explore"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OpeningModal;
