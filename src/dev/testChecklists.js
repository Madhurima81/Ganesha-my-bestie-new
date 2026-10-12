// Built-in test checklists for the dev panel (TestChecklistPanel).
// Keyed by checklist id. Any checklist can also be pasted in from the panel
// ("+ paste checklist"), so new test plans never need a code change.
//
// Item: { text, expect? }  - `expect` is the pass condition shown under the step.
//
// The panel now lists ONLY the About Me Hut "Continue after leaving to map" checklists
// (continueChecklists.js). Finished checklists + the sound checks are archived (see TEST_CHECKLISTS.md). Run them in the MAIN app: /?checklist=1 (dev builds only).
// The earlier per-game checklists (hints, sidebar, etc.) were moved, in full, into
// TEST_CHECKLISTS.md ("Built-in checklists (moved out of the panel)").

import { CONTINUE_CHECKLISTS, CONTINUE_GROUP_LABEL } from './continueChecklists';
import { STILL_TO_TEST_CHECKLISTS, STILL_TO_TEST_GROUP_LABEL } from './stillToTestChecklists';

export const TEST_CHECKLISTS = { ...STILL_TO_TEST_CHECKLISTS, ...CONTINUE_CHECKLISTS };

// Other harness keys that mount the same game share a checklist (none right now).
export const CHECKLIST_ALIASES = {};

// Dropdown grouping. Any checklist not listed here still appears under "Other".
export const TEST_CHECKLIST_GROUPS = {
  [STILL_TO_TEST_GROUP_LABEL]: Object.keys(STILL_TO_TEST_CHECKLISTS),
  [CONTINUE_GROUP_LABEL]: Object.keys(CONTINUE_CHECKLISTS),
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
