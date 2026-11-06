import React, { useMemo, useState } from 'react';
import { LEARNING_IDS, getLearningById } from '../../config/learningCatalog';
import { PARENT_DISCOVERY_IMAGES } from './parentDiscoveryImages';
import SanskritVoiceRecorder from '../audio/SanskritVoiceRecorder';
import ChantCardModal from '../../../zones/shloka-river/shared/components/ChantCardModal';
import { chantCardContent } from '../../../zones/shloka-river/shared/components/chantCardContent';
import './ParentDiscoveries.css';

// Catalog id -> chantCardContent key (the two systems spell three words differently).
const CATALOG_TO_CHANT_ID = { mahakaay: 'mahakaya', kuruMeDeva: 'kurumedeva' };
const chantIdFor = (id) => CATALOG_TO_CHANT_ID[id] || id;

/**
 * Rendered inside the "For Parents" tab (not a modal).
 * Text comes from learningCatalog.js (the canonical source) so nothing is duplicated.
 *
 * unlockedIds: CATALOG ids earned by the CURRENT explorer (bigBelly / mahakaay / kuruMeDeva,
 *              not the progress keys belly / mahakaya / kurumedeva).
 * latestId:    most recently earned catalog id (optional).
 */
export default function ParentDiscoveries({ unlockedIds = [], latestId, images = PARENT_DISCOVERY_IMAGES }) {
  const unlocked = useMemo(() => {
    const earned = new Set(unlockedIds);
    return LEARNING_IDS.filter((id) => earned.has(id)).map(getLearningById);
  }, [unlockedIds]);

  const [selectedId, setSelectedId] = useState(null);
  const [chantStep, setChantStep] = useState(null); // null | 'card' | 'practice'
  // A selection that is not in this explorer's unlocked set is ignored.
  const effectiveSelectedId = unlocked.some((item) => item.id === selectedId)
    ? selectedId
    : (unlocked.find((item) => item.id === latestId)?.id || unlocked[0]?.id || null);
  const selected = unlocked.find((item) => item.id === effectiveSelectedId);

  const chantWordId = selected?.type === 'shloka' ? chantIdFor(selected.id) : null;
  const chantContent = chantWordId ? chantCardContent[chantWordId] : null;
  const closeChant = () => setChantStep(null);

  if (unlocked.length === 0) {
    return (
      <section className="gmb-parent-discoveries" aria-label="Your child's discoveries">
        <h2 className="gmb-parent-section-title">Their discoveries</h2>
        <p className="gmb-parent-empty">Their discoveries will appear here as they explore.</p>
      </section>
    );
  }

  return (
    <section className="gmb-parent-discoveries" aria-label="Your child's discoveries">
      <h2 className="gmb-parent-section-title">Their discoveries</h2>
      <div className="gmb-parent-thumbnails" role="group" aria-label="Choose a discovery">
        {unlocked.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`gmb-parent-thumb ${item.id === effectiveSelectedId ? 'is-selected' : ''}`}
            aria-pressed={item.id === effectiveSelectedId}
            onClick={() => setSelectedId(item.id)}
          >
            <span className="gmb-parent-thumb-art" aria-hidden="true">
              {images[item.id]
                ? <img src={images[item.id]} alt="" />
                : <span className="gmb-parent-thumb-fallback">{item.title.charAt(0)}</span>}
            </span>
            <span className="gmb-parent-thumb-label">{item.title}</span>
          </button>
        ))}
      </div>

      {selected && (
        <article className="gmb-parent-detail" aria-live="polite" aria-label={`${selected.title} parent guide`}>
          <header className="gmb-parent-detail-header">
            {images[selected.id] && <img src={images[selected.id]} alt="" className="gmb-parent-detail-art" />}
            <h3>{selected.title}</h3>
          </header>

          <div className="gmb-parent-content-section">
            <h4>What your child discovered</h4>
            <p>{selected.parent.explored}</p>
          </div>
          <div className="gmb-parent-content-section">
            <h4>Their words</h4>
            <p className="gmb-parent-affirmation">“{selected.affirmation}”</p>
          </div>
          <div className="gmb-parent-ask">
            <h4>Ask your child</h4>
            <p>{selected.parent.ask}</p>
          </div>
          {chantContent && (
            <button type="button" className="gmb-parent-chant-btn" onClick={() => setChantStep('card')}>
              Chant Now
            </button>
          )}
        </article>
      )}

      {chantContent && chantStep === 'card' && (
        <ChantCardModal
          wordId={chantWordId}
          onPracticeChant={() => setChantStep('practice')}
          onClose={closeChant}
        />
      )}
      {chantContent && chantStep === 'practice' && (
        <SanskritVoiceRecorder
          word={chantWordId}
          syllables={chantContent.syllables}
          chantResult={null}
          appIcon={images[selected.id]}
          savedRecordings={{}}
          allowSkip
          onSkip={closeChant}
          stopAudio={() => {
            document.querySelectorAll('audio').forEach((audio) => {
              audio.pause();
              audio.currentTime = 0;
            });
          }}
          title="Practice Chanting"
          prompt="Listen to the word and try saying"
          onComplete={closeChant}
        />
      )}
    </section>
  );
}
