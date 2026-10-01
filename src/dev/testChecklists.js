// Built-in test checklists for the dev harness (TestChecklistPanel).
// Keyed by the harness `?game=` key. Any checklist can also be pasted in from the
// panel ("＋ paste checklist"), so new test plans never need a code change.
//
// Item: { text, expect? }  — `expect` is the pass condition shown under the step.

export const TEST_CHECKLISTS = {
  'modak-game2-new': {
    title: 'Modak Game 2 — Branch phase: hints must ignore random touches',
    items: [
      { text: 'Play Bush phase to reach the Branch phase. Wait for the intro line to finish.' },
      {
        text: 'Do NOT touch the branch. Wait ~18s for L2. Tap sky / grass / empty space.',
        expect: 'L2 hand stays visible, L2 VO plays, background taps change nothing.',
      },
      {
        text: 'Keep waiting ~8s after L2 finishes for L3. Tap the background again.',
        expect: 'L3 hand stays visible; VO continues; nothing restarts.',
      },
      {
        text: 'At L3: pull the branch part-way down and let go.',
        expect: 'L3 hand stays up (a partial pull is not progress). Level does not reset.',
      },
      {
        text: 'At L2 (reload the phase): pull the branch part-way and let go.',
        expect: 'L2 hand stays up; no reset to L0. Wrong-direction pull (up) also keeps the hint.',
      },
      {
        text: 'At L3: do the REAL pull down + hold until it completes.',
        expect: 'Scene reacts, branch succeeds, hand disappears because the scene turned it off.',
      },
      {
        text: 'Reload the phase. While the FIRST teaching hand is playing, tap randomly.',
        expect: 'Hand finishes its pass instead of vanishing on the tap.',
      },
      {
        text: 'While a hand is on screen, open then close the sidebar.',
        expect: 'Hand hides while the sidebar is open; replays from the start on close.',
      },
      {
        text: 'With NO hint showing (first ~10s), do a partial pull and release.',
        expect: 'Idle clock restarts (L1 comes ~10s after the pull, not earlier).',
      },
    ],
  },
};

// Other harness keys that mount the same game share a checklist.
export const CHECKLIST_ALIASES = {
  'sm-modak-game2': 'modak-game2-new',
  'sm-modak': 'modak-game2-new',
};

export const GENERIC_CHECKLIST = {
  title: 'Scene hint smoke test',
  items: [
    { text: 'L1/L2/L3 visible then tap random background.', expect: 'Hint/gesture stays; timer does not restart.' },
    { text: 'L3 visible then do the real valid action.', expect: 'Scene reacts; hint clears.' },
    { text: 'Teaching hand then tap randomly.', expect: 'Hand finishes its pass.' },
    { text: 'Sidebar open/close during a hand.', expect: 'Hides while paused; replays on return.' },
  ],
};
