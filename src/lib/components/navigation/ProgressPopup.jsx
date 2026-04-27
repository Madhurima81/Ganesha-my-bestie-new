import React, { useState } from 'react';
import './ProgressPopup.css';

const SYMBOL_SIDEBAR_META = {
  modak: {
    name: 'Modak',
    image: '/images/symbols-symbolmountain/symbol-modak-new.png',
    description: 'I share with joy.',
  },
  mooshika: {
    name: 'Mooshika',
    image: '/images/symbols-symbolmountain/symbol-mooshika-new.png',
    description: 'I can focus.',
  },
  belly: {
    name: 'Big Belly',
    image: '/images/symbols-symbolmountain/symbol-belly-new.png',
    description: 'I feel safe inside.',
  },
  lotus: {
    name: 'Lotus',
    image: '/images/symbols-symbolmountain/symbol-lotus-new.png',
    description: 'I stay calm and kind.',
  },
  trunk: {
    name: 'Trunk',
    image: '/images/symbols-symbolmountain/symbol-trunk-new.png',
    description: 'I am strong and gentle.',
  },
  eyes: {
    name: 'Eyes',
    image: '/images/symbols-symbolmountain/symbol-eyes-new.png',
    description: 'I notice the good.',
  },
  ear: {
    name: 'Ears',
    image: '/images/symbols-symbolmountain/symbol-ears-new.png',
    description: 'I listen with care.',
  },
  tusk: {
    name: 'Tusk',
    image: '/images/symbols-symbolmountain/symbol-tusk-new.png',
    description: 'I finish what I start.',
  },
};

const normalizeSymbolId = (item) => {
  const raw = (item?.id || item?.name || '').toString().toLowerCase().trim();
  if (raw === 'ears') return 'ear';
  return raw;
};

const ProgressPopup = ({ isOpen, onClose, title, items, completedItems, type }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const displayTitle = title === 'Meanings Learned' ? 'My Meanings' : title;

  if (!isOpen) return null;

  // Check if an item is in the completed list
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
    if (type === 'symbols') {
      const symbolId = normalizeSymbolId(item);
      const sidebarMeta = SYMBOL_SIDEBAR_META[symbolId];
      if (sidebarMeta) {
        setSelectedItem({
          ...item,
          id: symbolId,
          name: sidebarMeta.name,
          image: sidebarMeta.image,
          description: sidebarMeta.description,
        });
        return;
      }
    }
    setSelectedItem(item);
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

  return (
    <div className="pp-overlay" onClick={onClose}>
      <div className={`pp-card ${selectedItem ? 'pp-card-blurred' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="pp-header">
          <h2 className="pp-title">{displayTitle}</h2>
        </div>

        <div className="pp-grid">
          {items.map((symbol, index) => {
            const symbolId = normalizeSymbolId(symbol);
            const sidebarMeta = type === 'symbols' ? SYMBOL_SIDEBAR_META[symbolId] : null;
            const displayItem = sidebarMeta
              ? { ...symbol, id: symbolId, name: sidebarMeta.name, image: sidebarMeta.image, description: sidebarMeta.description }
              : symbol;
            const isUnlocked = checkIsCompleted(displayItem);

            return (
              <div
                key={index}
                className={`pp-item-card ${isUnlocked ? 'unlocked' : 'locked'}`}
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
              </div>
            );
          })}
        </div>

        <button className="pp-action-btn" onClick={onClose}>Close</button>
      </div>

      {selectedItem && (
        <div className="pp-detail-overlay" onClick={(e) => { e.stopPropagation(); setSelectedItem(null); }}>
          <div className="pp-detail-card" onClick={(e) => e.stopPropagation()}>
            <button className="pp-detail-close" onClick={() => setSelectedItem(null)}>×</button>

            <div className="pp-detail-image-wrapper">
              <img src={selectedItem.image} alt={getDisplayName(selectedItem.name)} className="pp-detail-image" />
            </div>

            <h2 className="pp-detail-title">{getDisplayName(selectedItem.name)}</h2>

            <p className="pp-detail-desc">
              {selectedItem.description || 'You have discovered this sacred item! Keep exploring to learn more.'}
            </p>

            <div className="pp-detail-actions">
              {selectedItem.audio && (
                <button className="pp-btn-audio" onClick={() => playAudio(selectedItem.audio)}>
                  <span>🎵</span> Play Sound
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressPopup;



