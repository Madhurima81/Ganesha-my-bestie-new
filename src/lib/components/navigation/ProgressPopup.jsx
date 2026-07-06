import React, { useEffect, useRef, useState } from 'react';
import './ProgressPopup.css';
import { symbolCardContent } from '../../../zones/symbol-mountain/shared/components/symbolCardContent';

const AUDIO_PREF_KEY = 'ganesha_audio_enabled';

const GRID_OPEN_VO = 'These are your Ganesha powers. Tap any one to remember.';

const GRID_TAP_VO = {
  modak: 'Modak... I am full of joy.',
  mooshika: 'Mooshika... I can focus.',
  belly: 'Belly... I feel safe inside.',
  lotus: 'Lotus... I stay calm.',
  trunk: 'Trunk... I find my way.',
  eye: 'Eyes... I see clearly.',
  ear: 'Ears... I listen with care.',
  tusk: 'Tusk... I finish what I start.',
};

const DETAIL_VO = {
  modak: 'Think of one small moment that made you smile today.',
  mooshika: 'Pick one tiny thing. Look at it for 3 seconds.',
  belly: 'Hand on belly. Breathe in... breathe out.',
  lotus: 'Close your eyes. One slow breath in... and out.',
  trunk: "Think of something hard today. What's another way?",
  eye: 'Look around. Find one beautiful thing.',
  ear: 'Close your eyes. Find the quietest sound.',
  tusk: 'Pick one small thing you can finish today.',
};

const normalizeSymbolId = (item) => {
  const raw = (item?.id || item?.name || '').toString().toLowerCase().trim();
  if (raw === 'ears') return 'ear';
  if (raw === 'eyes') return 'eye';
  return raw;
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

const DetailCard = ({
  item,
  type,
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
        <button
          className="pp-detail-close"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close"
        >
          &times;
        </button>
      ) : null}

      <div className={`symbol-content ${cardClassName.includes('open') || cardClassName.includes('instant') ? 'open' : ''}`}>
        <div className={`pp-detail-image-wrapper ${isBreathingCueActive ? 'breathe' : ''}`}>
          <img src={item.image} alt={getDisplayName(item.name)} className="pp-detail-image" />
        </div>

        <h2 className="pp-detail-title">{getDisplayName(item.name)}</h2>

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
      </div>

      <div className="pp-detail-actions">
        {item.audio ? (
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
    if (!isOpen || !directItemId || type !== 'symbols' || selectedItem || directOpenedRef.current) return;
    const directItem = (items || []).find((item) => normalizeSymbolId(item) === normalizeSymbolId({ id: directItemId }));
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
    setAudioError('');
    onClose?.();
  };

  if (!isOpen) return null;

  if (directItemId) {
    if (!selectedItem) return null;
    return (
      <DetailCard
        item={selectedItem}
        type={type}
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

      {selectedItem ? (
        <DetailCard
          item={selectedItem}
          type={type}
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
