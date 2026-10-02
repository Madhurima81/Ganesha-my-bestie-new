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

TEST_CHECKLISTS['modak-game2-bush-marsh'] = {
  title: 'Modak Game 2 - Bush and Marsh: partial attempts keep the hint',
  items: [
    { text: 'Bush phase: wait ~18s for L2 (hand + VO). Do a short or vertical swipe and let go.', expect: 'L2 hand stays up; the bush springs back; no reset to L0.' },
    { text: 'Bush phase at L3: do a short swipe again.', expect: 'L3 hand stays up.' },
    { text: 'Bush phase with NO hint showing (first ~10s): do a short swipe.', expect: 'Idle clock restarts; L1 comes ~10s after the swipe.' },
    { text: 'Bush phase: do the real sideways swipe.', expect: 'Bush opens, flowers collect, game moves to the Branch phase.' },
    { text: 'Marsh phase: wait for L2, then start dragging Mooshika but drop on the wrong spot.', expect: 'L2 hand stays up while you drag and after the wrong drop.' },
    { text: 'Marsh phase at L3: drag part-way and let go.', expect: 'L3 hand stays up; no reset.' },
    { text: 'Marsh phase: tap the sky / grass at L2 and L3.', expect: 'Nothing changes; hand and VO continue.' },
    { text: 'Marsh phase: drop Mooshika on the correct safe spot.', expect: 'Hint clears, the next spot pulses, and a fresh idle clock starts.' },
  ],
};

TEST_CHECKLISTS.samaprabha = {
  title: 'Samaprabha: random taps must not cut hint VO or the hand',
  items: [
    { text: 'First-time teaching hand is playing. Tap empty sky / ground (not on the shadow).', expect: 'Hand finishes its pass; intro VO is not cut.' },
    { text: 'Do nothing ~18s for L2 (hand + VO). Tap empty areas repeatedly.', expect: 'L2 VO plays to the end; hand stays; nothing restarts.' },
    { text: 'Keep waiting for L3 (about 8s after L2 ends). Tap empty areas again.', expect: 'L3 hand and VO still arrive.' },
    { text: 'At L2 or L3: press and hold the shadow, then let go early.', expect: 'Ring fills while held; the idle clock restarts on release.' },
    { text: 'Hold the shadow until the ring completes.', expect: 'Clue lights, hint clears, next clue starts a fresh clock.' },
    { text: 'During the L2 line, press on the shadow (cuts the line). Wait.', expect: 'L3 still comes on time (no stuck L2).' },
  ],
};

TEST_CHECKLISTS.kurumedeva = {
  title: 'Kurumedeva: wrong drops and grabs keep or escalate hints',
  items: [
    { text: 'Drag the help token and drop it far from the friend, twice.', expect: 'Token returns each time; after the 2nd miss L2 help starts.' },
    { text: 'At L2 or L3: drop the token away from the friend again.', expect: 'Hint and hand stay; the L2 line is not cut off by L3.' },
    { text: 'Do nothing for L2 and L3. Tap empty areas.', expect: 'Hints keep playing; background taps change nothing.' },
    { text: 'Drag the help token onto the friend.', expect: 'Friend helps, hint clears, next step starts a fresh clock.' },
    { text: 'Plank round: with a hint showing, grab a plank and let go in the wrong place.', expect: 'Hint stays up; plank returns.' },
    { text: 'Plank round: drop a plank in the gap.', expect: 'Plank placed, hint clears, fresh idle clock.' },
  ],
};

TEST_CHECKLISTS.mahakaya = {
  title: 'Mahakaya: grabbing the log keeps a visible hint',
  items: [
    { text: 'Wait for L2 (hand + VO). Grab the log and let go without finishing.', expect: 'L2 hand stays up; no reset to L0.' },
    { text: 'With NO hint showing (first ~10s): grab the log and release.', expect: 'Idle clock restarts (L1 about 10s later).' },
    { text: 'Tap empty sky/ground at L2 and L3.', expect: 'Hints keep playing; nothing restarts.' },
    { text: 'Drag the log to finish.', expect: 'Stage completes; hint clears.' },
  ],
};

TEST_CHECKLISTS.nirvighnam = {
  title: 'Nirvighnam: grabbing an obstacle keeps a visible hint',
  items: [
    { text: 'Wait for L2 on the rock. Press the rock briefly and let go.', expect: 'L2 hand stays up.' },
    { text: 'Repeat for the branch and the reed at L2 or L3.', expect: 'Hand stays up each time; teaching hand is gone after a real touch.' },
    { text: 'Tap empty areas at L2 and L3.', expect: 'Hints keep playing; nothing restarts.' },
    { text: 'Clear each obstacle for real.', expect: 'Hint clears; next obstacle starts a fresh clock.' },
  ],
};

TEST_CHECKLISTS.sarvakaryeshu = {
  title: 'Sarvakaryeshu: wrong picks escalate help, never clear it',
  items: [
    { text: 'Pick a wrong symbol once.', expect: 'Gentle "Try another symbol"; hints not cleared.' },
    { text: 'Pick a wrong symbol a 2nd time.', expect: 'L2 help starts early.' },
    { text: 'At L2: pick wrong again.', expect: 'L3 follows only after the L2 line finishes.' },
    { text: 'Pick the correct symbol.', expect: 'Success; fresh clock for the next card.' },
  ],
};

TEST_CHECKLISTS['sr-finale'] = {
  title: 'Shloka River Finale: boat grabs and wrong boats',
  items: [
    { text: 'With L2 or L3 showing: tap a wrong boat.', expect: 'Soft wrong sound; hint stays; a 2nd wrong boat earns L2 early.' },
    { text: 'With a hint showing: tap or grab the correct boat but do not place it.', expect: 'Hint stays until it is placed.' },
    { text: 'Place the correct boat.', expect: 'Success; hint clears; fresh clock.' },
  ],
};

TEST_CHECKLISTS['sm-pond'] = {
  title: 'Pond: partial holds and drags keep a visible hint',
  items: [
    { text: 'Rock: wait for L2. Hold the rock about a third of the way, then let go. Repeat.', expect: 'Hand stays; the 2nd short hold earns L2/L3 help early.' },
    { text: 'Rock with no hint showing: hold briefly and release.', expect: 'Idle clock restarts.' },
    { text: 'Reeds and lotus: do a partial drag/hold at L2.', expect: 'Hand stays up each time.' },
    { text: 'Tap empty areas while the intro hand plays.', expect: 'Hand finishes (it hides only when you really hold or drag).' },
    { text: 'Complete rock, reeds and lotus.', expect: 'Each step clears its hint.' },
  ],
};

TEST_CHECKLISTS['amh-indian-story'] = {
  title: 'My Indian Story: hint timing 10s / 18s / 26s',
  items: [
    { text: 'Ganesha Home: do nothing after the prompt. Time L1, L2 (with VO), L3.', expect: 'L1 about 10s, L2 about 18s, L3 about 8s after the L2 line ends. No dropping back to L1.' },
    { text: 'Ganesha Home at L3: look at the map.', expect: 'A clear ring on EVERY spot not yet found (3 at the start); no pointing emoji, no extra voice.' },
    { text: 'Ganesha Home at L3: do nothing for about 8 more seconds.', expect: 'The rings fade out and the hints stop (no endless pulsing). Moving the magnifier then starts a fresh 10/18/26.' },
    { text: 'Ganesha Home at L3: drag the magnifier around without finding anything.', expect: 'The rings stay on while you drag; dragging does not clear them.' },
    { text: 'Ganesha Home: find one spot.', expect: 'All hints clear and a fresh 10/18/26 starts; the found spot never shows a ring again.' },
    { text: 'Language guess: do nothing after pressing play. Time the same three levels.', expect: 'Same timing; the level never falls back.' },
    { text: 'Festival guess: do nothing. Time the three levels.', expect: 'Same timing.' },
    { text: 'Make a guess in each phase.', expect: 'Hints clear and the phase moves on.' },
  ],
};

TEST_CHECKLISTS['modak-garland'] = {
  title: 'Modak Game 3 (Garland): carry hints, L3 waits for L2, sidebar in intro',
  items: [
    { text: 'Intro line is playing: open and close the sidebar 3-4 times quickly.', expect: 'Intro replays once; hints still start afterwards (no freeze).' },
    { text: 'Build: tap flowers one by one; do nothing at the end for L2/L3.', expect: 'Hints come on time (about 10s / 18s / 26s).' },
    { text: 'Carry: wait for L2 (hand + VO). Start dragging the garland and drop it away from Ganesha.', expect: 'Hand stays up; no reset to L0.' },
    { text: 'Carry: miss 3 times quickly.', expect: 'L3 starts only after the L2 line finishes (no cut-off).' },
    { text: 'Carry with no hint showing: drag part-way and drop it away.', expect: 'Idle clock restarts.' },
    { text: 'Drop the garland on Ganesha.', expect: 'Success; hint clears.' },
  ],
};

TEST_CHECKLISTS['sm-eyes'] = {
  title: 'Symbol Mountain, Eyes game: misses, L3 after L2, sidebar',
  items: [
    { text: 'Intro line playing: open and close the sidebar several times quickly.', expect: 'Intro replays; the game and hints continue (no freeze).' },
    { text: 'Tap empty space 3 or more times.', expect: 'Help comes earlier (L2, then L3 after more misses).' },
    { text: 'Misses until L3 is due while the L2 line is speaking.', expect: 'L3 waits for the L2 line to finish.' },
    { text: 'Do nothing: time L1 / L2 (VO) / L3.', expect: 'About 10s / 18s / 8s after the L2 line.' },
    { text: 'Find the feather, then the mango.', expect: 'Each find clears the hint; next target starts a fresh clock.' },
  ],
};

TEST_CHECKLISTS['sm-ears'] = {
  title: 'Symbol Mountain, Ears sound-match: tab switch, sidebar, L2/L3',
  items: [
    { text: 'During the intro or a prompt line, switch to another tab and come back.', expect: 'The round does not advance while you are away; the line replays once on return.' },
    { text: 'Open and close the sidebar several times quickly during a line.', expect: 'Line replays; round and hints continue.' },
    { text: 'On the choosing screen do nothing: L1 replay, L2 clue, then L3 reveal.', expect: 'L3 comes only after the L2 clue and sound finish.' },
    { text: 'Tap a wrong zone.', expect: 'Gentle "listen again"; no stuck state.' },
    { text: 'Tap the right zone.', expect: 'Reveal plays; next round starts.' },
  ],
};

TEST_CHECKLISTS['sm-tusk-live-v2'] = {
  title: 'Symbol Mountain, Tusk nest (BeatPlayer): drags and hints',
  items: [
    { text: 'Wait for L2 on a nest item. Drag it part-way and let go.', expect: 'L2 hand stays up; no reset.' },
    { text: 'Drop the item on the wrong place 3 times quickly.', expect: 'L3 starts only after the L2 line finishes (no cut-off).' },
    { text: 'With no hint showing: drag part-way and release.', expect: 'Idle clock restarts.' },
    { text: 'Tap empty areas at L2 and L3.', expect: 'Hints keep playing; nothing restarts.' },
    { text: 'Open and close the sidebar during a line.', expect: 'Replays once; hints restart fresh.' },
    { text: 'Drop the item in the nest.', expect: 'Success; next item starts a fresh clock.' },
  ],
};

TEST_CHECKLISTS['suryakoti'] = {
  title: 'Suryakoti (rub): only real clearing counts',
  items: [
    { text: 'First-time teaching hand plays. Rub somewhere else on screen.', expect: 'Hand finishes its pass; nothing restarts.' },
    { text: 'Wait for L2 / L3. Rub where no darkness remains.', expect: 'Hints stay.' },
    { text: 'Rub the dark area for real.', expect: 'Hint clears while you clear darkness; the clock restarts roughly every 0.7s of real rubbing.' },
    { text: 'Open and close the sidebar mid-rub.', expect: 'Rub stops cleanly; hints restart fresh.' },
  ],
};

TEST_CHECKLISTS['vakratunda'] = {
  title: 'Vakratunda (frog): start-drag hint and stuck help',
  items: [
    { text: 'After the intro do nothing.', expect: 'Start-drag hint ladder arrives about 10s / 18s / 26s.' },
    { text: 'Start dragging the frog.', expect: 'Start-drag hint stops for good.' },
    { text: 'Push the frog into a blocked spot repeatedly.', expect: 'Stuck help escalates after repeated real bumps.' },
    { text: 'Tap empty areas during hints.', expect: 'Nothing restarts.' },
  ],
};

TEST_CHECKLISTS['sarvada'] = {
  title: 'Sarvada (find the hidden symbol)',
  items: [
    { text: 'Do nothing for the hint ladder.', expect: 'L2 and L3 arrive on time; L3 after the L2 line.' },
    { text: 'Tap around the scene (not the symbol).', expect: 'Hints keep playing; nothing restarts.' },
    { text: 'Find the symbol.', expect: 'Success; next phase starts a fresh clock.' },
  ],
};

TEST_CHECKLISTS['amh-dreams-wishes'] = {
  title: 'Dreams and Wishes: wrong bubble does not reset hints',
  items: [
    { text: 'Wish 1: wait for the hints. Tap an unkind bubble.', expect: 'Shake and gentle redirect; the hint ladder is NOT reset.' },
    { text: 'Tap kind bubbles.', expect: 'Progress advances; hints reset only on kind taps.' },
    { text: 'Complete the three wishes and the trunk taps.', expect: 'Each step works; no stuck hint.' },
    { text: 'Tap empty background during hints.', expect: 'Nothing restarts.' },
  ],
};

TEST_CHECKLISTS['sidebar-general'] = {
  title: 'Sidebar check (any scene that has a sidebar)',
  items: [
    { text: 'While an intro line is speaking, open and close the sidebar 3-4 times quickly.', expect: 'The line replays once from the start; the scene then carries on.' },
    { text: 'While a hint line (L2) is speaking, open the sidebar then close it.', expect: 'The line replays once; hints restart fresh (about 10s / 18s / 26s).' },
    { text: 'Open the sidebar and leave it open for 30s.', expect: 'Nothing advances or speaks behind it; timers are frozen.' },
    { text: 'Switch to another browser tab and back during a line.', expect: 'The game does not advance while away; the line replays on return.' },
  ],
};

// Other harness keys that mount the same game share a checklist.
export const CHECKLIST_ALIASES = {
  'sm-modak-game2': 'modak-game2-new',
  'sm-modak': 'modak-game2-new',
  'sm-modak-game3': 'modak-garland',
  'sm-eyes': 'sm-eyes',
  'sm-ears': 'sm-ears',
  'sm-tusk-beatplayer': 'sm-tusk-live-v2',
  'sm-tusk-nest-debug': 'sm-tusk-live-v2',
  'sm-symbol': 'sm-eyes',
  'sr-vakratunda': 'vakratunda',
  'sr-suryakoti': 'suryakoti',
  'sr-nirvighnam': 'nirvighnam',
  'sr-sarvakaryeshu': 'sarvakaryeshu',
};

// Dropdown grouping (zone -> games). Any checklist not listed here still appears under "Other".
export const TEST_CHECKLIST_GROUPS = {
  'Symbol Mountain': ['modak-game2-new', 'modak-game2-bush-marsh', 'modak-garland', 'sm-pond', 'sm-eyes', 'sm-ears', 'sm-tusk-live-v2'],
  'Shloka River': ['vakratunda', 'mahakaya', 'suryakoti', 'samaprabha', 'nirvighnam', 'kurumedeva', 'sarvakaryeshu', 'sarvada', 'sr-finale'],
  'About Me Hut': ['amh-dreams-wishes', 'amh-indian-story'],
  General: ['sidebar-general'],
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
