/**
 * DareView.jsx
 * ─────────────
 * Shows today's dare inside the TWG Hub.
 * No gratitude check-in. No Ganesha illustration.
 * Just the dare — category, text, action buttons.
 * Sits as a modal overlay on the hub.
 */
import React, { useEffect } from 'react';
import PrimaryBtn from '../shared/PrimaryBtn';
import { getTodaysDare } from '../../config/dareBank';
import { useGaneshaVoice } from '../../hooks/useGaneshaVoice';
import './DareView.css';

const CATEGORY_CONFIG = {
  kindness:   { label: 'Kindness Dare' },
  compassion: { label: 'Compassion Dare' },
  gratitude:  { label: 'Gratitude Dare' },
  cultural:   { label: 'Cultural Dare' },
  courage:    { label: 'Courage Dare' },
};

export default function DareView({ childName, childAge = 7, onClose }) {
  const { speak, stop } = useGaneshaVoice();
  const dare         = getTodaysDare(childAge);
  const categoryInfo = CATEGORY_CONFIG[dare?.category] || { label: "Today's Dare" };
  const dareText     = dare?.text || "Do one kind thing for someone today — and don't tell them it was you.";

  const stopDareVoice = () => {
    stop();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const handleAccept = () => {
    stopDareVoice();
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('gmb_last_dare_date', today);
    if (dare) {
      localStorage.setItem('gmb_today_dare_id', dare.id);
      localStorage.setItem('gmb_today_dare_category', dare.category);
    }
    onClose();
  };

  const handleLater = () => {
    stopDareVoice();
    localStorage.setItem('gmb_last_dare_date', new Date().toISOString().split('T')[0]);
    onClose();
  };

  // Ganesha reads the dare aloud — user tap opened this, so audio is allowed
  useEffect(() => {
    const timer = setTimeout(() => {
      speak(`Here is today's dare, ${childName}.  ${dareText}`, {
        age: childAge,
        moment: 'dare',
      });
    }, 300);
    return () => { clearTimeout(timer); stopDareVoice(); };
  }, []);

  return (
    <div className="dare-view-backdrop" onClick={() => { stopDareVoice(); onClose(); }}>
      <div className="dare-view-card" onClick={e => e.stopPropagation()}>

        <p className="dare-view-eyebrow">Today's dare</p>

        <div className="dare-view-badge">
          <span className="dare-view-badge-label">{categoryInfo.label}</span>
        </div>

        <p className="dare-view-text">{dareText}</p>

        <div className="dare-view-actions">
          <PrimaryBtn
            label="I'll do it"
            onClick={handleAccept}
            size="md"
            fullWidth
          />
          <button className="dare-view-secondary" onClick={handleLater}>
            Remind me later
          </button>
        </div>

      </div>
    </div>
  );
}
