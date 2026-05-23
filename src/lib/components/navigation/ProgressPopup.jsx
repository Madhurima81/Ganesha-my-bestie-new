import React, { useEffect, useRef, useState } from 'react';
import './ProgressPopup.css';
import { symbolCardContent } from '../../../zones/symbol-mountain/shared/components/symbolCardContent';

const SYMBOL_AFFIRMATIONS = {
  modak: 'I am full of joy.',
  mooshika: 'I can focus.',
  belly: 'I feel safe inside.',
  lotus: 'I stay calm.',
  trunk: 'I find my way.',
  eye: 'I see clearly.',
  ear: 'I listen with care.',
  tusk: 'I finish what I start.'
};

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

// Action-only VO after popup opens
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

const SYMBOL_SIDEBAR_META = Object.entries(symbolCardContent).reduce((acc, [id, data]) => {
  acc[id] = {
    name: data.label || data.title || id,
    image: data.icon || data.image,
    affirmation: data.affirmation || SYMBOL_AFFIRMATIONS[id] || '',
    description: data.description || data.gift || '',
    ganeshaLines: data.ganeshaLines || [],
    invitation: data.invitation || '',
    gift: data.gift || '',
  };
  return acc;
}, {});

const normalizeSymbolId = (item) => {
  const raw = (item?.id || item?.name || '').toString().toLowerCase().trim();
  if (raw === 'ears') return 'ear';
  if (raw === 'eyes') return 'eye';
  return raw;
};

const ProgressPopup = ({ isOpen, onClose, title, items, completedItems, type, directItemId = null }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBreathingCueActive, setIsBreathingCueActive] = useState(false);
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
    } catch (e) {
      // no-op
    }
  };

  const speakLine = (text, onEnd) => {
    if (!text || !speechEnabledRef.current) return;
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
    if (!actionLine) return;

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
      openVoPlayedRef.current = false;
      directOpenedRef.current = false;
      speechEnabledRef.current = true;
      return;
    }

    if (type === 'symbols' && !directItemId && !openVoPlayedRef.current) {
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

    if (type === 'symbols') {
      const symbolId = normalizeSymbolId(item);
      const sidebarMeta = SYMBOL_SIDEBAR_META[symbolId];
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

        // 1) Tap VO during opening transition
        // 2) Action VO starts only after tap VO completes + modal settle
        if (quickVo) {
          speakLine(quickVo, () => {
            if (!speechEnabledRef.current) return;
            setIsSpeaking(false);
            const elapsed = Date.now() - tapStartMs;
            const waitMs = Math.max(150, 900 - elapsed);
            const voTimer = setTimeout(() => playDetailVo(symbolId), waitMs);
            voTimersRef.current.push(voTimer);
          });
        } else {
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

  const closeDetail = () => {
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
      // Skippable on tap
      stopVoice();
    }
  };

  const getDisplayName = (name) => {
    if (!name) return '';
    return String(name).trim();
  };

  const playAudio = (audioPath) => {
    if (!audioPath) return;
    const audio = new Audio(audioPath);
    audio.play().catch((e) => console.log('Audio play error:', e));
  };

  const handleCloseAll = () => {
    stopVoice();
    onClose?.();
  };

  if (!isOpen) return null;

  // DIRECT MODE — opened from mandala tap. Skip grid entirely, render only detail popup.
  if (directItemId) {
    if (!selectedItem) return null;
    return (
      <div className="pp-detail-overlay pp-detail-overlay-light" onClick={closeDetail}>
        <div className="pp-detail-card pp-detail-card-instant" onClick={handleDetailCardTap}>
          <button className="pp-detail-close" onClick={(e) => { e.stopPropagation(); closeDetail(); }} aria-label="Close">×</button>
          <div className="symbol-content open">
            <div className={`pp-detail-image-wrapper ${isBreathingCueActive ? 'breathe' : ''}`}>
              <img src={selectedItem.image} alt={getDisplayName(selectedItem.name)} className="pp-detail-image" />
            </div>

            <h2 className="pp-detail-title">{getDisplayName(selectedItem.name)}</h2>

            {type === 'symbols' && selectedItem.affirmation ? (
              <p className="pp-detail-affirmation">"{selectedItem.affirmation}"</p>
            ) : null}

            {type === 'symbols' && selectedItem.ganeshaLines?.length ? (
              <div className="pp-detail-ganesha-lines">
                {selectedItem.ganeshaLines.map((line, idx) => (
                  <p key={`${selectedItem.id}-line-${idx}`} className="pp-detail-ganesha-line">{line}</p>
                ))}
              </div>
            ) : null}

            {type === 'symbols' && selectedItem.invitation ? (
              <div className="pp-detail-invitation">{selectedItem.invitation}</div>
            ) : null}

            <p className="pp-detail-desc">
              {type === 'symbols'
                ? (selectedItem.gift || selectedItem.description || 'You have discovered this sacred item! Keep exploring to learn more.')
                : (selectedItem.description || 'You have discovered this sacred item! Keep exploring to learn more.')}
            </p>
          </div>

          <div className="pp-detail-actions">
            {selectedItem.audio && (
              <button className="pp-btn-audio" onClick={() => playAudio(selectedItem.audio)}>
                <span>??</span> Play Sound
              </button>
            )}
            <button className="pp-action-btn pp-action-btn-detail" onClick={(e) => { e.stopPropagation(); closeDetail(); }}>
              Continue
            </button>
          </div>
        </div>
      </div>
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
            const sidebarMeta = type === 'symbols' ? SYMBOL_SIDEBAR_META[symbolId] : null;
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
                  gift: sidebarMeta.gift
                }
              : symbol;
            const isUnlocked = checkIsCompleted(displayItem);

            return (
              <div
                key={index}
                className={`pp-item-card symbol-tile ${isUnlocked ? 'unlocked' : 'locked'}`}
                onClick={isUnlocked ? () => openDetail(displayItem) : undefined}
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

        <button className="pp-action-btn" onClick={handleCloseAll}>Continue</button>
      </div>

      {selectedItem && (
        <div className={`pp-detail-overlay modal-backdrop ${detailOpen ? 'open' : ''}`} onClick={closeDetail}>
          <div className={`pp-detail-card symbol-card-modal ${detailOpen ? 'open' : ''}`} onClick={handleDetailCardTap}>
            <div className={`symbol-content ${detailOpen ? 'open' : ''}`}>
              <div className={`pp-detail-image-wrapper ${isBreathingCueActive ? 'breathe' : ''}`}>
                <img src={selectedItem.image} alt={getDisplayName(selectedItem.name)} className="pp-detail-image" />
              </div>

              <h2 className="pp-detail-title">{getDisplayName(selectedItem.name)}</h2>

              {type === 'symbols' && selectedItem.affirmation ? (
                <p className="pp-detail-affirmation">"{selectedItem.affirmation}"</p>
              ) : null}

              {type === 'symbols' && selectedItem.ganeshaLines?.length ? (
                <div className="pp-detail-ganesha-lines">
                  {selectedItem.ganeshaLines.map((line, idx) => (
                    <p key={`${selectedItem.id}-line-${idx}`} className="pp-detail-ganesha-line">{line}</p>
                  ))}
                </div>
              ) : null}

              {type === 'symbols' && selectedItem.invitation ? (
                <div className="pp-detail-invitation">{selectedItem.invitation}</div>
              ) : null}

              <p className="pp-detail-desc">
                {type === 'symbols'
                  ? (selectedItem.gift || selectedItem.description || 'You have discovered this sacred item! Keep exploring to learn more.')
                  : (selectedItem.description || 'You have discovered this sacred item! Keep exploring to learn more.')}
              </p>
            </div>

            <div className="pp-detail-actions">
              {selectedItem.audio && (
                <button className="pp-btn-audio" onClick={() => playAudio(selectedItem.audio)}>
                  <span>??</span> Play Sound
                </button>
              )}
              <button className="pp-action-btn pp-action-btn-detail" onClick={(e) => { e.stopPropagation(); closeDetail(); }}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressPopup;
