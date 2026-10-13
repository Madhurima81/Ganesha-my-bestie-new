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
  'todo-aboutme-step1': list('About Me Hut - Step 1 (voice + timer fixes, all 4 scenes)', [
    { text: leave('Family Tree: place 2 or 3 family members.'), expect: 'The scene resumes, the line plays, nothing freezes.' },
    { text: 'Family Tree: place all 4 members, leave, tap Continue.', expect: 'The all-placed sparkle shows (it used to be missing in dev).' },
    { text: 'Family Tree: tap Done, then tap the zone badge in the middle of "You met everyone in my family".', expect: 'Zone Welcome speaks alone; nothing from the scene speaks over it.' },
    { text: leave('Favourite Food: a question is showing.'), expect: 'The scene resumes about half a second after load and the question line plays. Not frozen or silent.' },
    { text: 'Favourite Food: leave by the back button (not the badge) while a line is playing.', expect: 'No timer advances the game after you left; Continue resumes where you were.' },
    { text: leave('Dreams: wish 1 or wish 3 active.'), expect: 'The scene resumes and the instruction line plays. Nothing frozen.' },
    { text: 'Dreams: tap the zone badge during the wish 1 (or wish 3) intro line.', expect: 'Zone Welcome speaks alone; the instruction line does NOT start after you left.' },
    { text: 'Indian Story: pick the correct language (or festival), then tap the zone badge during the success line.', expect: 'Zone Welcome speaks alone; the scene does not advance after you left.' },
    { text: leave('Indian Story: any step.'), expect: 'The entry line plays about half a second after load, once. A fresh start from the opening modal has no extra delay.' },
    { text: 'Any of the four: tap the zone badge, then Continue, a few times in a row.', expect: 'Never a frozen scene and never a line firing right after the badge tap.' },
    { text: 'Tab switch (Family Tree child-input step, and Favourite Food at a Ganesha question and a child question): leave the scene idle, switch to another tab for about 10 seconds, come back.', expect: 'No hint voice or glow while the tab was hidden. 3-2-1 countdown on return, then the hints work normally (Food re-asks the question first; hints start after it ends).' },
    { text: 'NOT fixed yet - expected to fail: Indian Story picks (places, languages, festivals) after Continue; Food/Dreams answers or taps made within 1 second of leaving.', expect: 'Step 2 and Step 3 of the About Me work fix these. Do not mark them as failures of Step 1.' },
  ]),

  'todo-aboutme-food-step2': list('Favourite Food - Step 2 (save at solve + success-line markers)', [
    { text: 'Ganesha food: tap Modak, then leave within 1 second and tap Continue.', expect: 'The food answer was saved at the tap: Continue shows the celebration, replays "Yes - I love modak!" once, then asks the colour question. Modak is in the header.' },
    { text: `Ganesha colour, activity, friend: ${DURING}`, expect: 'Continue shows the celebration state, replays that success line once, then moves to the next question. The header shows every answer found so far (Modak, Red...).' },
    { text: `Ganesha colour, activity, friend: ${AFTER}`, expect: 'Continue goes straight to the next question after about half a second. The success line is NOT replayed.' },
    { text: `Your food, colour, activity (pick, drawing or typed): ${DURING}`, expect: 'Continue keeps your choice (a drawing shows as your drawing in the header, not a pencil), replays the success line once ("Yummy!" etc.), then asks the next question. It is not asked again.' },
    { text: `Your food, colour, activity: ${AFTER}`, expect: 'Continue keeps your choice and goes straight to the next question with no replay.' },
    { text: `Your friend name: ${DURING}`, expect: 'Your typed name is kept, "Thanks for telling me!" replays once, then the comparison card shows.' },
    { text: 'Leave in the middle of a question you have NOT answered yet (Ganesha or yours).', expect: 'That question restarts cleanly and its line plays once (not twice, not cut off).' },
    { text: 'Continue on the comparison card.', expect: 'The comparison card shows with your food, colour, activity and friend, and "Now we know some things we each enjoy." plays.' },
    PLAY_AGAIN_ROW('answers'),
  ]),

  'todo-aboutme-tree-step2': list('Family Tree - Step 2 (Done tap saved at the tap)', [
    { text: 'Ganesha tree: all 4 placed, tap Done, then leave during "You met everyone in my family".', expect: 'Continue replays that line once (about half a second after load), then moves to "Now let\'s make your family tree". The Done button is not needed again.' },
    { text: 'Ganesha tree: tap Done, then leave within 1 second and tap Continue.', expect: 'Same as above: the Done tap was saved instantly.' },
    { text: 'Ganesha tree: tap Done, wait for the line to finish and the transition screen to show, then leave.', expect: 'Continue shows the transition screen. The "You met everyone" line is NOT replayed.' },
    { text: 'Ganesha tree: all 4 placed but Done NOT tapped, then leave.', expect: 'Continue shows the finished tree with the Done button. No line is replayed.' },
    { text: 'Your tree: add a family member, leave within 1 second, tap Continue.', expect: 'The member is still there with the name you gave it.' },
    { text: 'Your tree: tap Done to see both trees, then leave and Continue.', expect: 'Both trees show and "Our family trees are different..." plays.' },
    { text: 'Tap Done twice quickly, or tap Done then the zone badge immediately.', expect: 'Never a frozen scene; Continue does not skip the transition.' },
    PLAY_AGAIN_ROW('family members'),
  ]),

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
    OPENING_VO_ROW,
    { text: 'Open the scene and look at the syllable row (e.g. ma ha ka ya) in the top-left, under the zone badge.', expect: 'The row sits fully below the badge, not covered by it. Check an iPad size and a phone landscape size.' },
    { text: 'Sarvakaryeshu: stay idle until the strongest hint (L3) shows on the right symbol.', expect: 'The circle pulses 3 times and keeps a gold border; no jump.' },
    { text: 'Sarvakaryeshu: tap the zone badge in the middle of a spoken line.', expect: 'Zone Welcome is silent - no line carries on over it.' },
    { text: 'Sarvakaryeshu: answer a card correctly, then leave within 1 second and tap Continue.', expect: 'Starts at the NEXT card (never the one you just answered); the syllables lit so far stay lit.' },
    { text: 'Sarvakaryeshu: answer card 4, leave during the success line, then Continue.', expect: 'The word "sarvakaryeshu" and the success line play, then the card. Card 4 does not come back.' },
    { text: leave('Sarvakaryeshu card is showing.'), expect: 'Continue shows the Sarvakaryeshu card once, about 1 second after load.' },
    { text: 'Start Sarvada fresh and wait.', expect: 'The scene intro is spoken, then the first "find the symbol" round starts.' },
    { text: 'Sarvada: stay idle until the symbol ring hint shows.', expect: 'The ring glows with a gentle scale; no rectangle, no jump.' },
    { text: 'Sarvada: tap the zone badge in the middle of a spoken line.', expect: 'Zone Welcome is silent.' },
    { text: 'Sarvada: find a symbol, then leave within 1 second and tap Continue.', expect: 'Starts at the next time of day (never the one you just found).' },
    { text: leave('Sarvada: first time of day finished.'), expect: 'Continue starts the next round after about half a second, with its line audible, and the game does not freeze.' },
    { text: 'Play Sarvada through a time-of-day change without leaving.', expect: 'The next round starts; nothing stalls after the progress is saved (checks the callback-ref fix).' },
    { text: 'Sarvada: find the night symbol, leave during the ending, then Continue.', expect: 'The boat scene with Ganesha, the word "sarvada" and the success line play, then the card. Night does not come back.' },
    { text: 'Play both normally without leaving.', expect: 'Hints and the next lines still arrive; nothing stalls.' },
    { text: 'Play Sarvakaryeshu (4 cards) and Sarvada (3 times of day) normally without leaving.', expect: 'Normal play is unchanged: syllable, reveal line, next card or time of day; nothing skipped or doubled.' },
    ZONE_WELCOME_ROW,
    PLAY_AGAIN_ROW('some cards answered'),
  ]),

  'todo-finale': list('Shloka River Finale (Shloka River 5)', [
    OPENING_VO_ROW,
    { text: 'Finale: place 8 boats normally without leaving.', expect: 'Normal flow is unchanged ("choose the next one" / "Great! Keep choosing"); the resume line does NOT play.' },
    { text: leave('Finale: 1 to 7 boats placed.'), expect: 'Boats stay placed; you hear ONE line, "Keep putting the word boats in the right order" (no boat-specific line, no target-word audio). The hint cycle starts only after it ends.' },
    { text: 'Finale: after the last boat, watch the zone-completion fireworks and orbs.', expect: 'The zone badge is hidden while the fireworks and orbs play and comes back after; the badge is visible during normal play.' },
    { text: leave('Success: after the last word is placed, during the recap.'), expect: 'Continue plays the recap once, about half a second after load, then the celebration (checks the resume timer fix).' },
    { text: leave('Success: during the full-shloka recap.'), expect: 'The recap plays once (not twice, not skipped), then the orbs celebration.' },
    { text: 'Play the Finale normally, placing all words without leaving.', expect: 'The recap plays once and the scene finishes (normal flow still works).' },
    ZONE_WELCOME_ROW,
    PLAY_AGAIN_ROW('some words placed'),
  ]),
};

export const STILL_TO_TEST_GROUP_LABEL = 'Still to test - other scenes (About Me Step 1, Shloka River)';
