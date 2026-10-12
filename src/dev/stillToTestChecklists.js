// "Still to test" checklists - one per scene, ONLY the changes that have not been tested yet
// (Shloka River only - Symbol Mountain is finished and signed off 2026-10-12; About Me Hut has its own Continue checklists in continueChecklists.js).
// Created 2026-10-12. When a row passes, delete it; when a list is empty, delete the list. The finished
// Continue/sound checklists are archived in TEST_CHECKLISTS.md ("Archive 2026-10-12").
//
// Run in the MAIN app:  npm run dev  ->  http://localhost:5173/?unlockall=1   (dev builds only)
// "Leave" = zone badge / back-to-map button, then tap the scene's Continue on Zone Welcome.

const leave = (where) => `${where} Then leave with the zone badge and tap this scene's Continue on Zone Welcome.`;

// Shared rows: the success-line rule (decided 2026-10-11) and the Zone Welcome card.
const DURING = 'Leave DURING the success line (right after solving).';
const AFTER = 'Wait until the success line has FINISHED, then leave.';

// Run in every scene: these four were never recorded as run in any scene.
const NEVER_RUN = [
  { text: 'Mid-game, switch to another browser tab for about 10 seconds, then come back.', expect: '3-2-1 countdown, then it picks up where it was. No double voice line, no restart from scratch.' },
  { text: 'Mid-game, press the browser refresh (F5).', expect: 'Same as Continue: the current beat restarts cleanly. Never a blank or frozen screen.' },
  { text: 'Turn voice off, then repeat one Continue.', expect: 'Resumes silently and correctly. Replay is disabled while muted.' },
  { text: 'Wait about 20 seconds on a Continue that looks blank (dev server first load only).', expect: 'The scene appears. If still blank after 30 seconds, mark Fail with a screenshot.' },
];

const PLAY_AGAIN_ROW = (what) => ({
  text: `With ${what} saved, tap Play Again on the completion modal (or Replay on Zone Welcome).`,
  expect: 'Starts fresh at the opening modal and the first beat. Nothing saved comes back (the new checkpoint and success-line fields are cleared).',
});

const OPENING_VO_ROW = {
  text: 'Tap Play Again (or Replay) and watch the opening modal.',
  expect: 'The opening line is spoken (shared OpeningModal fix: in dev it used to be silent after Play Again).',
};

const ZONE_WELCOME_ROW = {
  text: 'Finish the scene once. Replay it, play part-way, then leave with the zone badge.',
  expect: 'The card shows Continue + the replay arrow (not only Replay), the zone still counts as complete, and Continue resumes your replay.',
};

const list = (title, items) => ({ title: `Still to test - ${title}`, items: [...items, ...NEVER_RUN] });

export const STILL_TO_TEST_CHECKLISTS = {
  'todo-vakratunda': list('Vakratunda Grove + Mahakaya (Shloka River 1)', [
    { text: leave('Mahakaya: 1 log placed.'), expect: 'You hear "Keep adding logs to the raft" - NOT the intro.' },
    { text: leave('Mahakaya: 2 or 3 logs placed.'), expect: 'You hear "Drag the next log" - NOT the intro.' },
    { text: leave('Mahakaya: 0 logs placed.'), expect: 'The full intro plays, as before.' },
    { text: 'Vakratunda: stay idle until the hint glow shows on the frog/object.', expect: 'A soft glow that follows the shape of the object, with no rectangle and no jump.' },
    { text: leave('Vakratunda card is showing.'), expect: 'Continue shows the Vakratunda card once, about 1 second after the scene loads (it used to be missing in dev).' },
    { text: leave('Mahakaya card is showing.'), expect: 'Continue shows the Mahakaya card once, then the finale.' },
    { text: 'Play Vakratunda and Mahakaya start to finish without leaving.', expect: 'Both cards still appear once each after their games (the card fix must not break normal play).' },
    { text: 'Open the scene and look at the syllable row (e.g. ma ha ka ya) in the top-left, under the zone badge.', expect: 'The row sits fully below the badge, not covered by it. Check an iPad size and a phone landscape size.' },
    { text: 'Mahakaya: 1, 2 or 3 logs placed, then leave with the zone badge and tap Continue (do the 3 cases if you can).', expect: 'You hear ONE line, "Keep placing the logs on the raft" (never the intro, never log-specific). The hint cycle starts only after it ends: idle ~12s for the first nudge. (This replaces the older "Keep adding logs" / "Drag the next log" rows above.)' },
    { text: 'Mahakaya: play 4 logs normally without leaving; idle on log 2 or 3.', expect: 'The normal flow is unchanged: "Keep adding logs to the raft" after log 1, the "Drag the next log" nudge when idle, and NO resume line.' },
    OPENING_VO_ROW,
    ZONE_WELCOME_ROW,
    PLAY_AGAIN_ROW('some logs placed'),
  ]),

  'todo-suryakoti': list('Suryakoti + Samaprabha (Shloka River 2)', [
    { text: 'Samaprabha: tap the zone badge in the middle of a spoken line.', expect: 'Zone Welcome is silent - no line from Samaprabha carries on over it.' },
    { text: 'Suryakoti rub game: tap the zone badge in the middle of a spoken line.', expect: 'Zone Welcome is silent.' },
    { text: 'Play Samaprabha normally without leaving (several clues).', expect: 'Hints and the next lines still arrive; nothing stalls (the voice fix must not break normal play).' },
    { text: 'Finish the Suryakoti rub in normal play and watch the bunny.', expect: 'The bunny hops, then the Suryakoti card appears (the old freeze is gone).' },
    { text: leave('Suryakoti card is showing.'), expect: 'Continue shows the Suryakoti card once, about 1 second after load. (If the card does not appear, note whether the checklist window had focus.)' },
    { text: 'Start Suryakoti fresh (Start or Play Again) and wait.', expect: 'The intro line is spoken after a short pause and the rub game is usable.' },
    { text: 'Enter Samaprabha (after the Suryakoti card) and leave then Continue in it.', expect: 'The Samaprabha intro is spoken about half a second after it opens, both on first entry and on Continue.' },
    { text: 'Open the scene and look at the syllable row (e.g. ma ha ka ya) in the top-left, under the zone badge.', expect: 'The row sits fully below the badge, not covered by it. Check an iPad size and a phone landscape size.' },
    { text: leave('Samaprabha: 1 clue revealed, its line and "find another" finished.'), expect: 'Starts at clue 2; you hear ONE line, "Keep pressing and holding to look closely" (clue 1 line not replayed). Hints start only after it ends.' },
    { text: 'Samaprabha: hold clue 3 to the end, leave within 1 second (its line is playing), then Continue.', expect: 'Starts at clue 4; the clue 3 line replays once, then "Keep pressing and holding to look closely"; hints start fresh after it.' },
    { text: leave('Samaprabha: 2 of 4 clues revealed, line finished.'), expect: 'Starts at clue 3: 2 syllables lit, 2 shadows faded, no intro line, empty hold ring, the resume line plays.' },
    { text: 'Samaprabha: play all 4 clues normally without leaving.', expect: 'After clue 1 you still hear "Press and hold another part of the shadow"; NO resume line; the word and success line finish the game.' },
    OPENING_VO_ROW,
    ZONE_WELCOME_ROW,
    PLAY_AGAIN_ROW('Suryakoti progress'),
  ]),

  'todo-nirvighnam': list('Nirvighnam + Kurumedeva (Shloka River 3)', [
    { text: 'Kurumedeva: stay idle until the Elephant / Monkey friend glow shows.', expect: 'A soft glow that follows the animal shape; the animal does NOT jump right/down while it glows (CSS clash fix).' },
    { text: 'Kurumedeva: stay idle on the plank round until the plank pile and the drop pad pulse.', expect: 'The plank pile pulses and the dashed drop pad pulses; nothing jumps.' },
    { text: leave('Nirvighnam card is showing.'), expect: 'Continue shows the Nirvighnam card once, about 1 second after load.' },
    { text: leave('Nirvighnam: stone cleared.'), expect: 'The branch line is spoken (after about half a second), not silent and not the stone line.' },
    { text: 'Open Kurumedeva (after the Nirvighnam card) fresh, and again after a Continue.', expect: 'The Kurumedeva intro is spoken after a short pause; the game then works.' },
    { text: 'Open the scene and look at the syllable row (e.g. ma ha ka ya) in the top-left, under the zone badge.', expect: 'The row sits fully below the badge, not covered by it. Check an iPad size and a phone landscape size.' },
    { text: 'Nirvighnam: clear the stone, branch and reeds, then leave during the swim / "nam" / the word / the success line, and tap Continue.', expect: 'The reeds show open and the turtle swims to the nest; you hear "nirvighnam" and the success line, then the Nirvighnam card, then Kurumedeva. The reeds are NOT replayed.' },
    { text: 'Nirvighnam: after the reeds, wait until the success line has finished and the card shows, then leave and tap Continue.', expect: 'The card comes back once, then Kurumedeva (never the reeds).' },
    { text: 'Nirvighnam: play stone, branch and reeds normally without leaving.', expect: 'Plays as before: swim, word, success line, card. Also re-check leaving after the stone and after the branch still resumes at the next obstacle.' },
    OPENING_VO_ROW,
    ZONE_WELCOME_ROW,
    PLAY_AGAIN_ROW('Nirvighnam / Kurumedeva progress'),
  ]),

  'todo-sarvakaryeshu': list('Sarvakaryeshu + Sarvada (Shloka River 4)', [
    { text: 'Sarvakaryeshu: tap the zone badge in the middle of a spoken line.', expect: 'Zone Welcome is silent - no line carries on over it.' },
    { text: 'Sarvada: tap the zone badge in the middle of a spoken line.', expect: 'Zone Welcome is silent.' },
    { text: 'Sarvakaryeshu: stay idle until the strongest hint (L3) shows on the right symbol.', expect: 'The circle pulses 3 times and keeps a gold border; no jump.' },
    { text: 'Sarvada: stay idle until the symbol ring hint shows.', expect: 'The ring glows with a gentle scale; no rectangle, no jump.' },
    { text: 'Play both normally without leaving.', expect: 'Hints and the next lines still arrive; nothing stalls.' },
    { text: leave('Sarvakaryeshu card is showing.'), expect: 'Continue shows the Sarvakaryeshu card once, about 1 second after load.' },
    { text: 'Start Sarvada fresh and wait.', expect: 'The scene intro is spoken, then the first "find the symbol" round starts.' },
    { text: leave('Sarvada: first time of day finished.'), expect: 'Continue starts the next round after about half a second, with its line audible, and the game does not freeze.' },
    { text: 'Play Sarvada through a time-of-day change without leaving.', expect: 'The next round starts; nothing stalls after the progress is saved (checks the callback-ref fix).' },
    { text: 'Open the scene and look at the syllable row (e.g. ma ha ka ya) in the top-left, under the zone badge.', expect: 'The row sits fully below the badge, not covered by it. Check an iPad size and a phone landscape size.' },
    { text: 'Sarvakaryeshu: answer a card correctly, then leave within 1 second and tap Continue.', expect: 'Starts at the NEXT card (never the one you just answered); the syllables lit so far stay lit.' },
    { text: 'Sarvakaryeshu: answer card 4, leave during the success line, then Continue.', expect: 'The word "sarvakaryeshu" and the success line play, then the card. Card 4 does not come back.' },
    { text: 'Sarvada: find a symbol, then leave within 1 second and tap Continue.', expect: 'Starts at the next time of day (never the one you just found).' },
    { text: 'Sarvada: find the night symbol, leave during the ending, then Continue.', expect: 'The boat scene with Ganesha, the word "sarvada" and the success line play, then the card. Night does not come back.' },
    { text: 'Play Sarvakaryeshu (4 cards) and Sarvada (3 times of day) normally without leaving.', expect: 'Normal play is unchanged: syllable, reveal line, next card or time of day; nothing skipped or doubled.' },
    OPENING_VO_ROW,
    ZONE_WELCOME_ROW,
    PLAY_AGAIN_ROW('some cards answered'),
  ]),

  'todo-finale': list('Shloka River Finale (Shloka River 5)', [
    { text: leave('Success: during the full-shloka recap.'), expect: 'The recap plays once (not twice, not skipped), then the orbs celebration.' },
    { text: leave('Success: after the last word is placed, during the recap.'), expect: 'Continue plays the recap once, about half a second after load, then the celebration (checks the resume timer fix).' },
    { text: 'Play the Finale normally, placing all words without leaving.', expect: 'The recap plays once and the scene finishes (normal flow still works).' },
    { text: leave('Finale: 1 to 7 boats placed.'), expect: 'Boats stay placed; you hear ONE line, "Keep putting the word boats in the right order" (no boat-specific line, no target-word audio). The hint cycle starts only after it ends.' },
    { text: 'Finale: place 8 boats normally without leaving.', expect: 'Normal flow is unchanged ("choose the next one" / "Great! Keep choosing"); the resume line does NOT play.' },
    { text: 'Finale: after the last boat, watch the zone-completion fireworks and orbs.', expect: 'The zone badge is hidden while the fireworks and orbs play and comes back after; the badge is visible during normal play.' },
    OPENING_VO_ROW,
    ZONE_WELCOME_ROW,
    PLAY_AGAIN_ROW('some words placed'),
  ]),
};

export const STILL_TO_TEST_GROUP_LABEL = 'Still to test - other scenes (Shloka River)';
