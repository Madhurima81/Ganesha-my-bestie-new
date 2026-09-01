import React, { useEffect, useRef, useState } from 'react';
import './ProgressPopup.css';
import { symbolCardContent } from '../../../zones/symbol-mountain/shared/components/symbolCardContent';
import CloseButton from '../../../components/CloseButton';
import SanskritVoiceRecorder from '../audio/SanskritVoiceRecorder';
import ChantCardModal from '../../../zones/shloka-river/shared/components/ChantCardModal';
import { chantCardContent } from '../../../zones/shloka-river/shared/components/chantCardContent';

const AUDIO_PREF_KEY = 'ganesha_audio_enabled';

const GRID_OPEN_VO = 'These are your Ganesha powers. Tap any one to remember.';

const GRID_TAP_VO = {
  modak: 'Modak... I have joy inside me.',
  mooshika: 'Mooshika... I can guide my busy thoughts.',
  belly: 'Belly... I have room for all my feelings.',
  lotus: 'Lotus... I can stay calm when things get messy.',
  trunk: 'Trunk... I find my way.',
  eye: 'Eyes... I notice the good around me.',
  ear: 'Ears... I listen with care.',
  tusk: 'Tusk... I stay focused on what is true.',
};

const DETAIL_VO = {
  modak: 'Think of one small thing you did today that made you feel good inside.',
  mooshika: 'Pick one thing near you and give it all your attention for 3 seconds.',
  belly: 'Think of two feelings you had today. Can you make room for both?',
  lotus: 'Notice one calm feeling inside, even if things around you are busy.',
  trunk: "Think of something that didn't go your way. What is another way?",
  eye: 'Look around. Find one small thing that looks good or beautiful to you.',
  ear: 'Close your eyes. Find the quietest sound.',
  tusk: 'What is one small step that helps you stay focused on what matters?',
};

export const PETAL_TO_SCENE = {
  mooshika: 'Share the Modaks',
  modak: 'Share the Modaks',
  belly: 'Share the Modaks',
  lotus: 'The Golden Lotus',
  trunk: 'The Golden Lotus',
  eye: "Ganesha's Symbols",
  eyes: "Ganesha's Symbols",
  ear: "Ganesha's Symbols",
  ears: "Ganesha's Symbols",
  tusk: "Ganesha's Symbols",
  'vakratunda-chant': 'Your Journey Begins!',
  'mahakaya-chant': 'Your Journey Begins!',
  'suryakoti-chant': 'Bring Back the Light!',
  'samaprabha-chant': 'Bring Back the Light!',
  'nirvighnam-chant': 'The River Needs You!',
  'kurumedeva-chant': 'The River Needs You!',
  'sarvakaryeshu-chant': 'River Memories!',
  'sarvada-chant': 'River Memories!',
};

const SHLOKA_OUTER_PETAL_ORDER = [
  'vakratunda-chant',
  'mahakaya-chant',
  'suryakoti-chant',
  'samaprabha-chant',
  'nirvighnam-chant',
  'kurumedeva-chant',
  'sarvakaryeshu-chant',
  'sarvada-chant',
];

export const SCENE_TO_OUTER_PETAL_ID = Object.entries(PETAL_TO_SCENE).reduce((acc, [petalKey, sceneName]) => {
  const index = SHLOKA_OUTER_PETAL_ORDER.indexOf(petalKey);
  if (index !== -1) {
    acc[sceneName] = index + 1;
  }
  return acc;
}, {});

const normalizeSymbolId = (item) => {
  const raw = (item?.id || item?.name || '').toString().toLowerCase().trim();
  if (raw === 'ears') return 'ear';
  if (raw === 'eyes') return 'eye';
  return raw;
};

const getPetalSceneKey = (item, type) => {
  if (type === 'symbols') return normalizeSymbolId(item);
  return (item?.id || item?.name || '').toString().toLowerCase().trim();
};

const unlockHintFor = (item, type) => {
  const sceneName = PETAL_TO_SCENE[getPetalSceneKey(item, type)] || 'the scene';
  return `Complete "${sceneName}" to unlock this!`;
};

const isGlobalAudioEnabled = () => {
  try {
    const saved = localStorage.getItem(AUDIO_PREF_KEY);
    return saved === null ? true : saved === 'true';
  } catch {
    return true;
  }
};

const getSymbolMeta = (symbolId) => {
  const rawMeta = symbolCardContent[symbolId] || symbolCardContent[`${symbolId}s`];
  if (!rawMeta) return null;

  return {
    name: rawMeta.label || rawMeta.title || symbolId,
    image: rawMeta.icon || rawMeta.image,
    affirmation: rawMeta.affirmation || '',
    description: rawMeta.description || rawMeta.gift || '',
    ganeshaLines: rawMeta.ganeshaLines || [],
    invitation: rawMeta.invitation || '',
    gift: rawMeta.gift || '',
  };
};

const getDisplayName = (name) => {
  if (!name) return '';
  return String(name).trim();
};

const normalizeChantWordId = (value) => (
  (value?.id || value?.name || value || '')
    .toString()
    .toLowerCase()
    .replace(/-chant$/, '')
    .replace(/\s+/g, '')
    .trim()
);

const DetailCard = ({
  item,
  type,
  locked = false,
  unlockHint = '',
  isBreathingCueActive,
  onCardTap,
  onClose,
  onPlayAudio,
  audioError,
  showCloseButton = false,
  overlayClassName = '',
  cardClassName = '',
}) => (
  <div className={overlayClassName} onClick={onClose}>
    <div className={cardClassName} onClick={onCardTap}>
      {showCloseButton ? (
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <CloseButton
            className="pp-detail-close"
            onClose={onClose}
            label="Close"
          />
        </div>
      ) : null}

      <div className={`symbol-content ${cardClassName.includes('open') || cardClassName.includes('instant') ? 'open' : ''}`}>
        <div className={`pp-detail-image-wrapper ${isBreathingCueActive ? 'breathe' : ''} ${locked ? 'pp-locked' : ''}`}>
          <img src={item.image} alt={getDisplayName(item.name)} className="pp-detail-image" />
        </div>

        <h2 className="pp-detail-title">{getDisplayName(item.name)}</h2>

        {locked ? (
          <p className="pp-detail-unlock-hint">{unlockHint}</p>
        ) : (
          <>
            {type === 'symbols' && item.affirmation ? (
              <p className="pp-detail-affirmation">"{item.affirmation}"</p>
            ) : null}

            {type === 'symbols' && item.ganeshaLines?.length ? (
              <div className="pp-detail-ganesha-lines">
                {item.ganeshaLines.map((line, idx) => (
                  <p key={`${item.id}-line-${idx}`} className="pp-detail-ganesha-line">{line}</p>
                ))}
              </div>
            ) : null}

            {type === 'symbols' && item.invitation ? (
              <div className="pp-detail-invitation">{item.invitation}</div>
            ) : null}

            <p className="pp-detail-desc">
              {type === 'symbols'
                ? (item.gift || item.description || 'You have discovered this sacred item! Keep exploring to learn more.')
                : (item.description || 'You have discovered this sacred item! Keep exploring to learn more.')}
            </p>
          </>
        )}
      </div>

      <div className="pp-detail-actions">
        {!locked && item.audio ? (
          <button
            className="pp-btn-audio"
            onClick={(e) => {
              e.stopPropagation();
              onPlayAudio(item.audio);
            }}
          >
            <span aria-hidden="true">&#128266;</span> Play Sound
          </button>
        ) : null}
        <button
          className="pp-action-btn pp-action-btn-detail"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          Continue
        </button>
      </div>

      {audioError ? <p className="pp-audio-error">{audioError}</p> : null}
    </div>
  </div>
);

const ProgressPopup = ({ isOpen, onClose, title, items, completedItems, type, directItemId = null }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [showChantPractice, setShowChantPractice] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBreathingCueActive, setIsBreathingCueActive] = useState(false);
  const [audioError, setAudioError] = useState('');
  const [lockedHint, setLockedHint] = useState('');
  const [lockedTileId, setLockedTileId] = useState('');
  const displayTitle =
    title === 'Sacred Symbols'
      ? 'Your Ganesha Powers'
      : title === 'Meanings Learned'
        ? 'My Meanings'
        : title;

  const openVoPlayedRef = useRef(false);
  const voTimersRef = useRef([]);
  const speechEnabledRef = useRef(true);
  const directOpenedRef = useRef(false);

  const clearVoTimers = () => {
    voTimersRef.current.forEach((id) => clearTimeout(id));
    voTimersRef.current = [];
  };

  const stopVoice = () => {
    clearVoTimers();
    speechEnabledRef.current = false;
    setIsSpeaking(false);
    setIsBreathingCueActive(false);
    try {
      window.speechSynthesis?.cancel();
    } catch {
      // no-op
    }
  };

  const speakLine = (text, onEnd) => {
    if (!text || !speechEnabledRef.current || !isGlobalAudioEnabled()) return;
    if (!window?.speechSynthesis) {
      if (speechEnabledRef.current) onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      if (speechEnabledRef.current) onEnd?.();
    };
    utterance.onerror = () => {
      if (speechEnabledRef.current) onEnd?.();
    };

    setIsSpeaking(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const playDetailVo = (symbolId) => {
    const actionLine = DETAIL_VO[symbolId];
    if (!actionLine || !isGlobalAudioEnabled()) return;

    speechEnabledRef.current = true;
    clearVoTimers();
    setIsBreathingCueActive(false);

    const starter = setTimeout(() => {
      if (!speechEnabledRef.current) return;
      const isBreathLine =
        (symbolId === 'lotus' || symbolId === 'belly') &&
        /breath|rise and fall/i.test(actionLine);
      setIsBreathingCueActive(isBreathLine);

      speakLine(actionLine, () => {
        setIsBreathingCueActive(false);
        setIsSpeaking(false);
      });
    }, 1000);

    voTimersRef.current.push(starter);
  };

  useEffect(() => {
    if (!isOpen) {
      stopVoice();
      setSelectedItem(null);
      setDetailOpen(false);
      setShowChantPractice(false);
      setAudioError('');
      setLockedHint('');
      setLockedTileId('');
      openVoPlayedRef.current = false;
      directOpenedRef.current = false;
      speechEnabledRef.current = true;
      return;
    }

    if (type === 'symbols' && !directItemId && !openVoPlayedRef.current && isGlobalAudioEnabled()) {
      openVoPlayedRef.current = true;
      speechEnabledRef.current = true;
      const t = setTimeout(() => speakLine(GRID_OPEN_VO, () => setIsSpeaking(false)), 250);
      voTimersRef.current.push(t);
    }

    return () => {
      stopVoice();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, type, directItemId]);

  const checkIsCompleted = (item) => {
    if (!completedItems || completedItems.length === 0) return false;
    const itemId = normalizeSymbolId(item);
    return completedItems.some((completedId) =>
      completedId === item.id ||
      completedId === item.name ||
      completedId === item.title ||
      (typeof completedId === 'string' && item.id && completedId.toLowerCase() === item.id.toLowerCase()) ||
      (typeof completedId === 'string' && itemId && normalizeSymbolId({ id: completedId }) === itemId)
    );
  };

  const openDetail = (item) => {
    stopVoice();
    speechEnabledRef.current = true;
    setAudioError('');
    setLockedHint('');
    setLockedTileId('');
    const isCompleted = checkIsCompleted(item);

    if (type === 'chants') {
      const chantWordId = normalizeChantWordId(item);
      setShowChantPractice(false);
      setSelectedItem({
        ...item,
        chantWordId,
      });
      setDetailOpen(false);
      const openTimer = setTimeout(() => setDetailOpen(true), 0);
      voTimersRef.current.push(openTimer);
      if (!isCompleted) {
        return;
      }
      return;
    }

    if (type === 'symbols') {
      const symbolId = normalizeSymbolId(item);
      const sidebarMeta = getSymbolMeta(symbolId);
      const quickVo = GRID_TAP_VO[symbolId];
      const tapStartMs = Date.now();

      if (sidebarMeta) {
        const detailItem = {
          ...item,
          id: symbolId,
          name: sidebarMeta.name,
          image: sidebarMeta.image,
          affirmation: sidebarMeta.affirmation,
          description: sidebarMeta.description,
          ganeshaLines: sidebarMeta.ganeshaLines,
          invitation: sidebarMeta.invitation,
          gift: sidebarMeta.gift,
        };

        setSelectedItem(detailItem);
        setDetailOpen(false);
        const openTimer = setTimeout(() => setDetailOpen(true), 0);
        voTimersRef.current.push(openTimer);

        if (!isCompleted) {
          return;
        }

        if (quickVo && isGlobalAudioEnabled()) {
          speakLine(quickVo, () => {
            if (!speechEnabledRef.current) return;
            setIsSpeaking(false);
            const elapsed = Date.now() - tapStartMs;
            const waitMs = Math.max(150, 900 - elapsed);
            const voTimer = setTimeout(() => playDetailVo(symbolId), waitMs);
            voTimersRef.current.push(voTimer);
          });
        } else if (isGlobalAudioEnabled()) {
          const voTimer = setTimeout(() => playDetailVo(symbolId), 900);
          voTimersRef.current.push(voTimer);
        }
        return;
      }
    }

    setSelectedItem(item);
    setDetailOpen(false);
    const openTimer = setTimeout(() => setDetailOpen(true), 0);
    voTimersRef.current.push(openTimer);
  };

  useEffect(() => {
    if (!isOpen || !directItemId || selectedItem || directOpenedRef.current) return;
    const directItem = (items || []).find((item) =>
      type === 'symbols'
        ? normalizeSymbolId(item) === normalizeSymbolId({ id: directItemId })
        : item.id === directItemId
    );
    if (!directItem) return;
    directOpenedRef.current = true;
    openDetail(directItem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, directItemId, type, items, selectedItem]);

  useEffect(() => {
    if (!lockedHint) return undefined;
    const timer = setTimeout(() => {
      setLockedHint('');
      setLockedTileId('');
    }, 1800);

    return () => clearTimeout(timer);
  }, [lockedHint]);

  const closeDetail = () => {
    setAudioError('');
    setShowChantPractice(false);
    if (directItemId) {
      stopVoice();
      onClose?.();
      return;
    }
    stopVoice();
    setDetailOpen(false);
    setSelectedItem(null);
  };

  const handleDetailCardTap = (e) => {
    e.stopPropagation();
    if (isSpeaking) {
      stopVoice();
    }
  };

  const playAudio = (audioPath) => {
    if (!audioPath) return;
    setAudioError('');
    const audio = new Audio(audioPath);
    audio.play().catch(() => {
      setAudioError('That sound did not play this time. Try again.');
    });
  };

  const handleTileClick = (item, isUnlocked) => {
    if (isUnlocked) {
      openDetail(item);
      return;
    }

    const itemId = normalizeSymbolId(item);
    setLockedTileId(itemId);
    setLockedHint('Keep exploring to unlock this power.');
  };

  const handleTileKeyDown = (event, item, isUnlocked) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handleTileClick(item, isUnlocked);
  };

  const handleCloseAll = () => {
    stopVoice();
    setShowChantPractice(false);
    setAudioError('');
    onClose?.();
  };

  const renderChantFlow = () => {
    if (!selectedItem) return null;

    const chantWordId = selectedItem.chantWordId || normalizeChantWordId(selectedItem);
    const chantContent = chantCardContent[chantWordId];
    if (!chantContent) return null;

    if (showChantPractice) {
      return (
        <SanskritVoiceRecorder
          word={chantWordId}
          syllables={chantContent.syllables}
          chantResult={null}
          appIcon={selectedItem.image}
          savedRecordings={{}}
          allowSkip
          onSkip={closeDetail}
          stopAudio={() => {
            document.querySelectorAll('audio').forEach((audio) => {
              audio.pause();
              audio.currentTime = 0;
            });
          }}
          title="Practice Chanting"
          prompt="Listen to the word and try saying"
          onComplete={closeDetail}
        />
      );
    }

    return (
      <ChantCardModal
        wordId={chantWordId}
        onPracticeChant={() => setShowChantPractice(true)}
        onClose={closeDetail}
      />
    );
  };

  if (!isOpen) return null;

  if (directItemId) {
    if (!selectedItem) return null;
    if (type === 'chants') {
      return renderChantFlow();
    }
    const directLocked = !checkIsCompleted(selectedItem);
    return (
      <DetailCard
        item={selectedItem}
        type={type}
        locked={directLocked}
        unlockHint={unlockHintFor(selectedItem, type)}
        isBreathingCueActive={isBreathingCueActive}
        onCardTap={handleDetailCardTap}
        onClose={closeDetail}
        onPlayAudio={playAudio}
        audioError={audioError}
        showCloseButton
        overlayClassName="pp-detail-overlay pp-detail-overlay-light"
        cardClassName="pp-detail-card pp-detail-card-instant"
      />
    );
  }

  return (
    <div className={`pp-overlay modal-backdrop ${isOpen ? 'open' : ''}`} onClick={handleCloseAll}>
      <div className={`pp-card ${selectedItem ? 'pp-card-blurred' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="pp-header">
          <h2 className="pp-title">{displayTitle}</h2>
        </div>

        <div className="pp-grid">
          {items.map((symbol, index) => {
            const symbolId = normalizeSymbolId(symbol);
            const sidebarMeta = type === 'symbols' ? getSymbolMeta(symbolId) : null;
            const displayItem = sidebarMeta
              ? {
                  ...symbol,
                  id: symbolId,
                  name: sidebarMeta.name,
                  image: sidebarMeta.image,
                  affirmation: sidebarMeta.affirmation,
                  description: sidebarMeta.description,
                  ganeshaLines: sidebarMeta.ganeshaLines,
                  invitation: sidebarMeta.invitation,
                  gift: sidebarMeta.gift,
                }
              : symbol;
            const isUnlocked = checkIsCompleted(displayItem);
            const isLockedHintVisible = lockedTileId === symbolId;

            return (
              <div
                key={index}
                className={`pp-item-card symbol-tile ${isUnlocked ? 'unlocked' : 'locked'} ${isLockedHintVisible ? 'locked-nudge' : ''}`}
                onClick={() => handleTileClick(displayItem, isUnlocked)}
                onKeyDown={(event) => handleTileKeyDown(event, displayItem, isUnlocked)}
                role="button"
                tabIndex={0}
                aria-disabled={!isUnlocked}
              >
                <div className="pp-image-container">
                  <img
                    src={displayItem.image}
                    alt={getDisplayName(displayItem.name)}
                    className="pp-item-image"
                  />
                </div>

                <p className="pp-item-name">{getDisplayName(displayItem.name)}</p>
                {type === 'symbols' && displayItem.affirmation ? (
                  <p className="pp-item-affirmation">{displayItem.affirmation}</p>
                ) : null}
              </div>
            );
          })}
        </div>

        {lockedHint ? <p className="pp-locked-hint" aria-live="polite">{lockedHint}</p> : null}

        <button className="pp-action-btn" onClick={handleCloseAll}>Continue</button>
      </div>

      {selectedItem && type === 'chants' ? renderChantFlow() : null}

      {selectedItem && type !== 'chants' ? (
        <DetailCard
          item={selectedItem}
          type={type}
          locked={!checkIsCompleted(selectedItem)}
          unlockHint={unlockHintFor(selectedItem, type)}
          isBreathingCueActive={isBreathingCueActive}
          onCardTap={handleDetailCardTap}
          onClose={closeDetail}
          onPlayAudio={playAudio}
          audioError={audioError}
          showCloseButton
          overlayClassName={`pp-detail-overlay modal-backdrop ${detailOpen ? 'open' : ''}`}
          cardClassName={`pp-detail-card symbol-card-modal ${detailOpen ? 'open' : ''}`}
        />
      ) : null}
    </div>
  );
};

export default ProgressPopup;
