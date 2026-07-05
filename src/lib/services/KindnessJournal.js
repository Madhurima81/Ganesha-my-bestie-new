import { safeSetItem } from '../utils/safeStorage';
const JOURNAL_KEY = 'gmb_kindness_journal';

const todayIso = () => new Date().toISOString().split('T')[0];

const toIsoDate = (value) => new Date(value).toISOString().split('T')[0];

const defaultJournal = () => ({
  entries: [],
  streak: 0,
  lastCheckedDate: null,
  rewardsUnlocked: []
});

export const getKindnessJournal = () => {
  try {
    const raw = localStorage.getItem(JOURNAL_KEY);
    if (!raw) return defaultJournal();
    const parsed = JSON.parse(raw);
    return {
      ...defaultJournal(),
      ...parsed,
      entries: Array.isArray(parsed?.entries) ? parsed.entries : []
    };
  } catch (_) {
    return defaultJournal();
  }
};

export const saveKindnessJournal = (journal) => {
  safeSetItem(JOURNAL_KEY, JSON.stringify(journal));
};

export const saveTodayKindnessEntry = ({ gratitude, kindnessTask, dareId, dareCategory }) => {
  const journal = getKindnessJournal();
  const date = todayIso();
  const existingIndex = journal.entries.findIndex((e) => e.date === date);
  const entry = {
    date,
    gratitude: (gratitude || '').trim(),
    kindnessTask: (kindnessTask || '').trim(),
    dareId: dareId || null,
    dareCategory: dareCategory || null,
    status: 'pending',
    completedAt: null
  };

  if (existingIndex >= 0) {
    journal.entries[existingIndex] = { ...journal.entries[existingIndex], ...entry };
  } else {
    journal.entries.push(entry);
  }

  saveKindnessJournal(journal);
  return entry;
};

export const getPendingKindnessCheck = () => {
  const journal = getKindnessJournal();
  const today = todayIso();

  const pending = journal.entries
    .filter((e) => e?.status === 'pending' && e?.date && e.date < today)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return pending[0] || null;
};

export const resolveKindnessCheck = (date, completed) => {
  if (!date) return null;
  const journal = getKindnessJournal();
  const idx = journal.entries.findIndex((e) => e.date === date);
  if (idx < 0) return null;

  journal.entries[idx] = {
    ...journal.entries[idx],
    status: completed ? 'completed' : 'not-completed',
    completedAt: new Date().toISOString()
  };
  journal.lastCheckedDate = toIsoDate(new Date());
  saveKindnessJournal(journal);
  return journal.entries[idx];
};

