import { useCallback, useEffect } from 'react';
import { useGaneshaVoice } from '../../hooks/useGaneshaVoice';
import { playUiTap } from '../../services/AudioService';
import './AffirmationCard.css';

/**
 * The one child-facing affirmation card used when a child REVIEWS something they earned:
 * Mandala petal tap, Symbol Mountain sidebar, Shloka River sidebar.
 * No progress is written here. The line is spoken only when the child taps the speaker.
 *
 * Props
 *   name         string   - "Mooshika"
 *   image        string   - icon src
 *   affirmation  string   - canonical text from learningCatalog
 *   backLabel    string   - no longer shown (no Back button); kept so existing callers still work
 *   onClose      function - a tap anywhere on the card or backdrop (also Escape)
 *   onChant      function - optional; shows a "Chant Now" button (Shloka River words only)
 */
export default function AffirmationCard({
  name,
  image,
  affirmation,
  // eslint-disable-next-line no-unused-vars
  backLabel,
  onClose,
  onChant,
}) {
  const { speak, stop } = useGaneshaVoice();

  useEffect(() => () => stop(), [stop]);

  const handleReplay = useCallback(() => {
    playUiTap();
    const clean = (affirmation || '').trim().replace(/\s+/g, ' ').replace(/[.!?]+$/, '');
    speak(clean ? `Say with me, ${clean}.` : `Say with me, ${name}.`, {
      age: 6,
      style: 'child',
      moment: 'encouragement',
    });
  }, [affirmation, name, speak]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="affCard-backdrop" onClick={onClose}>
      <div
        className="affCard"
        role="dialog"
        aria-modal="true"
        aria-label={`${name} affirmation`}
        onClick={onClose}
      >
        <button
          type="button"
          className="affCard-speaker"
          onClick={(e) => { e.stopPropagation(); handleReplay(); }}
          aria-label={`Hear ${name} again`}
        >
          <span aria-hidden="true">&#128266;</span>
        </button>

        {image && <img src={image} alt="" className="affCard-icon" />}
        <h2 className="affCard-name">{name}</h2>
        <p className="affCard-text">{affirmation}</p>

        {onChant && (
          <div className="affCard-actions">
            <button
              type="button"
              className="affCard-btn affCard-btn--chant"
              onClick={(e) => { e.stopPropagation(); onChant(); }}
            >
              Chant Now
            </button>
          </div>
        )}

        <p className="affCard-hint" aria-hidden="true">Tap anywhere to close</p>
      </div>
    </div>
  );
}
