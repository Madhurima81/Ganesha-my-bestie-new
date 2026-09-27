import React, { useEffect, useMemo, useState } from 'react';
import { getUnlockedLearnings } from '../../services/LearningProgress';
import { getLearningById } from '../../config/learningCatalog';
import { useGaneshaVoice } from '../../hooks/useGaneshaVoice';
import './DailyDarePopup.css';
import CloseButton from '../../../components/CloseButton';

// Local calendar date key (YYYY-MM-DD from local year/month/day) — never
// UTC toISOString(), which can flip to the wrong day near midnight for
// anyone not on UTC.
function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function previousDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return localDateKey(date);
}

const RECENCY_POOL_SIZE = 3;
const HISTORY_KEY = 'gmb_daily_dare_history';

// Heavily favour the most recently unlocked 1-3 learnings so the dare feels
// connected to what the child just experienced.
function pickLearning(unlockedLearnings) {
  const pool = unlockedLearnings.slice(0, Math.min(RECENCY_POOL_SIZE, unlockedLearnings.length));
  return pool[Math.floor(Math.random() * pool.length)];
}

// Rotate through the learning's dailyTries; avoid repeating the exact same
// prompt if it was also shown on the immediately preceding local calendar
// day (skipped days are fine to repeat).
function pickDareIndex(learningId, catalogEntry, todayKey) {
  const tries = catalogEntry.dailyTries || [];
  if (tries.length === 0) return -1;
  if (tries.length === 1) return 0;

  let history = null;
  try {
    history = JSON.parse(localStorage.getItem(HISTORY_KEY) || 'null');
  } catch (_) {
    history = null;
  }

  const avoidIndex =
    history && history.learningId === learningId && history.date === previousDateKey(todayKey)
      ? history.dareIndex
      : -1;

  let index = Math.floor(Math.random() * tries.length);
  while (index === avoidIndex) {
    index = Math.floor(Math.random() * tries.length);
  }
  return index;
}

export default function DailyDarePopup({ onClose }) {
  const { speak, stop } = useGaneshaVoice();
  const todayKey = useMemo(() => localDateKey(), []);
  const profileId = localStorage.getItem('activeProfileId');

  const dare = useMemo(() => {
    const unlockedLearnings = getUnlockedLearnings(profileId);
    if (unlockedLearnings.length === 0) return null;

    const learning = pickLearning(unlockedLearnings);
    const catalogEntry = getLearningById(learning.learningId);
    if (!catalogEntry) return null;

    const dareIndex = pickDareIndex(learning.learningId, catalogEntry, todayKey);
    if (dareIndex === -1) return null;

    return {
      learningId: learning.learningId,
      sourceSceneId: learning.sourceSceneId,
      title: catalogEntry.title,
      text: catalogEntry.dailyTries[dareIndex],
      dareIndex,
    };
  }, [profileId, todayKey]);

  const [accepted, setAccepted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // No unlocked learnings yet — hide/disable Daily Dare entirely rather than
  // falling back to a generic dare. Close immediately, nothing renders.
  useEffect(() => {
    if (!dare) onClose?.();
  }, [dare, onClose]);

  useEffect(() => {
    if (!dare) return undefined;

    const voKey = `gmb_daily_prompt_vo_${todayKey}`;
    if (!localStorage.getItem(voKey)) {
      speak(dare.text);
      localStorage.setItem(voKey, '1');
    }

    return () => {
      stop();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [dare, todayKey, speak, stop]);

  if (!dare) return null;

  const handleTry = () => {
    setAccepted(true);

    localStorage.setItem('gmb_last_dare_date', todayKey);
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify({ learningId: dare.learningId, dareIndex: dare.dareIndex, date: todayKey })
    );
    localStorage.setItem(
      `gmb_daily_dare_${todayKey}`,
      JSON.stringify({
        learningId: dare.learningId,
        dareText: dare.text,
        sourceSceneId: dare.sourceSceneId,
        shownAt: Date.now(),
        acceptedAt: Date.now(),
      })
    );

    setTimeout(() => setIsClosing(true), 700);
    setTimeout(() => onClose?.(), 1800);
  };

  return (
    <div className="dare-root dare-root--map" role="dialog" aria-modal="true">
      <div className={`dare-panel ${isClosing ? 'dare-panel--closing' : ''}`}>
        <CloseButton onClose={onClose} />

        <p className="dare-subtitle">Today's Dare</p>
        <h2 className="dare-title">{dare.title}</h2>
        <p className="dare-task">{dare.text}</p>

        <button
          className={`dare-primary-btn ${accepted ? 'success' : ''}`}
          onClick={handleTry}
          disabled={accepted}
          type="button"
        >
          {accepted ? 'Yay!' : "I'll try it"}
        </button>
        {accepted && (
          <span className="dare-sparkles" aria-hidden="true">
            <span className="dare-sparkle s1">✦</span>
            <span className="dare-sparkle s2">✧</span>
            <span className="dare-sparkle s3">✦</span>
          </span>
        )}
      </div>
    </div>
  );
}
