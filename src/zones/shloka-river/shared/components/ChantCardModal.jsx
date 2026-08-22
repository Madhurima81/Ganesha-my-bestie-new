import { useEffect, useState } from 'react';
import { chantCardContent } from './chantCardContent';
import InvitationCue from './InvitationCue';
import './ChantCardModal.css';
import CloseButton from '../../../../components/CloseButton';

export default function ChantCardModal({ wordId, themeStyles = {}, onPracticeChant, onClose }) {
  const [isExiting, setIsExiting] = useState(false);
  const content = chantCardContent[wordId];

  const handleClose = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(onClose, 200);
  };

  const handlePractice = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(onPracticeChant, 200);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!content) {
    console.warn(`ChantCardModal: no content found for wordId="${wordId}"`);
    return null;
  }

  return (
    <div
      className={`chant-card-modal-backdrop ${isExiting ? 'exiting' : ''}`}
      style={themeStyles}
      onClick={handleClose}
    >
      <div
        className={`chant-card-modal ${isExiting ? 'exiting' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chant-card-title"
      >
        <CloseButton
          className="chant-card__close"
          onClose={handleClose}
          label="Close chant card"
        />

        <div className="chant-card__icon-wrap">
          <img src={content.icon} alt={content.label} className="chant-card__icon" />
        </div>

        <div className="chant-card__title-stack">
          <span className="chant-card__label">{content.label}</span>
          {content.ganeshaLines.map((line, index) => (
            <p
              key={line}
              className={`chant-card__line ${index === 0 ? 'is-hook' : 'is-teaching'}`}
              id={index === 0 ? 'chant-card-title' : undefined}
            >
              "{line}"
            </p>
          ))}
        </div>

        <div className="chant-card__invitation">
          <span className="chant-card__pointer" aria-hidden="true">{"\u27A1"}</span>
          <div className="chant-card__invitation-body">
            <InvitationCue symbolId={content.cueId} />
            <p>{content.invitation}</p>
          </div>
        </div>

        <p className="chant-card__gift">{content.gift}</p>

        <button type="button" className="chant-card__cta" onClick={handlePractice}>
          Practice Chanting
        </button>

        <p className="chant-card__footer">Tap anywhere to close</p>
      </div>
    </div>
  );
}
