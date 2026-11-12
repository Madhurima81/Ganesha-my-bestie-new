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
 *   backLabel    string   - "Back" (sidebar) / "Back to Mandala"
 *   onClose      function - back button and backdrop tap
 *   onChant      function - optional; shows a "Chant Now" button (Shloka River words only)
 */
export default function AffirmationCard({
  name,
  image,
  affirmation,
  backLabel = 'Back',
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
        onClick={(e) => e.stopPropagation()}
      >
        {image && <img src={image} alt="" className="affCard-icon" />}
        <h2 className="affCard-name">{name}</h2>
        <div className="affCard-line">
          <p className="affCard-text">{affirmation}</p>
          <button
            type="button"
            className="affCard-speaker"
            onClick={handleReplay}
            aria-label={`Hear ${name} again`}
          >
            <span aria-hidden="true">&#128266;</span>
          </button>
        </div>

        <div className="affCard-actions">
          {onChant && (
            <button type="button" className="affCard-btn affCard-btn--chant" onClick={onChant}>
              Chant Now
            </button>
          )}
          <button type="button" className="affCard-btn" onClick={onClose}>
            {backLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
