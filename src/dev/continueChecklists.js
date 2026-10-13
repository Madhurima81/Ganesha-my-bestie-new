// "Continue after leaving to map" checklists - ABOUT ME HUT ONLY (4 scenes).
//
// The other 9 live scenes (Symbol Mountain 4, Shloka River 5) are finished and signed off: their full
// checklists, results and the bugs found are archived in src/dev/TEST_CHECKLISTS.md ("Archive 2026-10-12")
// and as code in src/dev/archive/continueChecklists.2026-10-12.js (restore from there if ever needed).
//
// Run these in the MAIN app, not the game-test harness: Continue lives on Zone Welcome.
//   npm run dev  ->  open http://localhost:5173/?unlockall=1  (dev builds only; opens every zone/scene + this panel)
// Every step: play to the state, leave with the back-to-map button (or the zone badge), then tap the scene's
// button on Zone Welcome. Rules: see docs/KNOWN_PITFALLS.md and DECISIONS.md (success-line rule).

const leave = (where) => `${where} Then leave with the back-to-map button (or zone badge) and tap this scene's Continue on Zone Welcome.`;

const COMMON = [
  {
    text: 'Finish the scene, leave on the completion screen, return to Zone Welcome.',
    expect: 'The button says Replay (never Continue). Replay starts fresh with the opening modal.',
  },
  {
    text: 'Mid-game, switch to another browser tab for about 10 seconds, then come back.',
    expect: '3-2-1 countdown, then the game picks up where it was. No double voice line, no restart from scratch.',
  },
  {
    text: 'Mid-game, press the browser refresh (F5).',
    expect: 'Same result as Continue: the current beat restarts cleanly. Never a blank or frozen screen.',
  },
  {
    text: 'Turn voice off, then repeat one Continue.',
    expect: 'Resumes silently and correctly. Replay is disabled while muted.',
  },
  {
    text: 'Wait about 20 seconds on a Continue that looks blank (dev server first load only).',
    expect: 'The scene appears. If it is still blank after 30 seconds, mark Fail with a screenshot.',
  },
];

const list = (title, items) => ({ title: `Continue after leaving to map - ${title}`, items: [...items, ...COMMON] });

export const CONTINUE_CHECKLISTS = {
  'continue-family-tree': list('Family Tree (About Me Hut 1)', [
    { text: 'Place a family member (Ganesha tree or your tree), then leave within 1 second and tap Continue.', expect: 'That member is still placed (saved instantly).' },
    { text: 'With members placed, tap Replay on Zone Welcome.', expect: 'Starts at the opening with an empty tree.' },
    { text: leave("Ganesha's tree: 2 of 4 members placed."), expect: 'Placed members stay; a resume message like "2/4" shows for a few seconds.' },
    { text: leave("Ganesha's tree: all 4 placed, before tapping Continue."), expect: 'A message says the tree is complete; the Continue button is available.' },
    { text: leave('Your tree: 1 family member added.'), expect: 'Added member stays; a message shows how many are added.' },
    { text: leave('A name modal is open (typing a name).'), expect: 'The modal is closed; the family built so far is kept. No stale text.' },
    { text: leave('Side-by-side trees showing.'), expect: 'Both trees show; completion works.' },
  ]),

  'continue-favorite-food': list('Favourite Food (About Me Hut 2)', [
    { text: leave('A Ganesha question is showing (food, colour, activity or friend).'), expect: 'That question restarts and its line replays.' },
    { text: leave('Right after a correct food answer (celebration).'), expect: 'Resumes at the NEXT question (colour) with Modak already collected. The food question is not asked again; no old cheer.' },
    { text: leave('Right after a correct colour answer, then after activity, then after friend.'), expect: 'Resumes at the next question each time (activity, friend, then your own intro). Never the question you just answered.' },
    { text: 'Answer a question correctly, then leave within 1 second and tap Continue.', expect: 'Continue is at the next question (the answer was saved instantly, never one step behind).' },
    { text: 'With answers saved, tap Replay on Zone Welcome.', expect: 'Starts at the opening modal and the food question; earlier answers are gone.' },
    { text: leave('Your food: the drawing pad is open with a few strokes.'), expect: 'The drawing pad comes back with Done and Save, not the food choices.' },
    { text: leave('Your food: the typing box is open.'), expect: 'The typing box comes back.' },
    { text: leave('Your colour / activity / friend name step.'), expect: 'The same step shows with your earlier choices kept.' },
    { text: leave('Comparison card is showing.'), expect: 'The comparison card comes back.' },
  ]),

  'continue-dreams': list('Dreams and Wishes (About Me Hut 3)', [
    { text: leave('Wish 1: after 2 taps.'), expect: 'Wish 1 restarts with taps reset; its line replays.' },
    { text: leave('Wish 1 finished (completion modal showing).'), expect: 'Resumes at wish 2 (bowls and plates visible, never an empty background). Wish 1 is not redone.' },
    { text: leave('Wish 2 finished (completion modal showing).'), expect: 'Resumes at wish 3, not wish 2.' },
    { text: leave('Wish 3 finished.'), expect: 'Resumes at the all-wishes celebration, then the dream drawing.' },
    { text: 'Finish a wish, then leave within 1 second and tap Continue.', expect: 'Continue is at the next wish (saved instantly).' },
    { text: 'With wishes saved, tap Replay on Zone Welcome.', expect: 'Starts at the opening modal and wish 1.' },
    { text: leave('Wish 3: part-way through.'), expect: 'Wish 3 restarts with items reset.' },
    { text: leave('Dream drawing: the pad is open.'), expect: 'The drawing pad comes back with Done and Save.' },
    { text: leave('Dream clearing (tapping the trunk).'), expect: 'Clearing restarts; the cloud line replays.' },
    { text: leave('Comparison card is showing.'), expect: 'The comparison card comes back.' },
  ]),

  'continue-indian-story': list('My Indian Story (About Me Hut 4) - in play order', [
    // 1. Ganesha's home
    { text: leave("Ganesha's home: after finding one or two places."), expect: 'Step restarts with the places reset; the magnifier is back; the line replays.' },
    { text: 'Find all the places in Ganesha home and do not touch anything.', expect: 'It moves to Your home. Within about 1 second the voice says "Now choose a place your family feels connected to." Never silent.' },
    // 2. Your home
    { text: leave('Your home: a region chosen.'), expect: 'Step restarts with the region cleared; you can choose again.' },
    { text: 'Choose a region, tap Continue, then leave within 1 second and tap Continue.', expect: 'Continue starts at the Ganesha language step, restarted fresh (saved instantly).' },
    // 3. Ganesha's language guess
    { text: leave('Ganesha language guess: tap Sanskrit and leave DURING the success line.'), expect: 'The solved card shows (Sanskrit selected, other cards visible); the success line replays once, then it moves on to your languages. The guess is not asked again.' },
    { text: leave('Ganesha language guess: tap Sanskrit, let the success line FINISH, then leave before the next step shows.'), expect: 'Goes straight on to your languages without replaying the line.' },
    // 4. Your languages
    { text: leave('Your languages: 1-3 languages picked.'), expect: 'The same step shows; your earlier choices are kept.' },
    { text: 'Tap Continue on your languages (watch the button after the tap).', expect: 'The shadow stays the normal soft grey. No purple shadow stays on the button.' },
    // 5. Ganesha's festival guess
    { text: leave('Ganesha festival guess: tap Ganesh Chaturthi and leave DURING the success line.'), expect: 'The solved card shows; only "Yes - Ganesh Chaturthi!" replays, then it moves on to your festivals.' },
    { text: leave('Ganesha festival guess: tap Ganesh Chaturthi, let the success line FINISH, then leave.'), expect: 'Goes straight on to your festivals without replaying the line.' },
    // 6. Your festivals
    { text: leave('Your festivals: 1-4 festivals picked.'), expect: 'The same step shows; choices are kept.' },
    { text: 'Tap See Our Story (watch the button after the tap).', expect: 'The shadow stays the normal soft grey. No purple shadow stays on the button.' },
    // 7. Origin card
    { text: leave('Origin card is showing after you picked a home, 1-3 languages and 1-4 festivals.'), expect: 'Your side shows the home icon, every language icon and every festival icon you picked. Never "?" or empty rows.' },
    { text: 'On the origin card, press the browser refresh (F5).', expect: 'The origin card comes back with all your picks. Never an empty "Your Story" side.' },
    // 8. Finish and replay
    { text: 'Finish a step, go to the next step, then leave within 1 second and tap Continue.', expect: 'Continue starts at the step you reached, restarted fresh (saved instantly).' },
    { text: 'Finish the scene, tap Play Again on the completion modal, then play through to each guess and the origin card.', expect: 'Opens at the opening modal. Both guesses are asked again, picks are empty, nothing from the old run comes back, and no completion modal re-opens by itself.' },
  ]),
};

export const CONTINUE_GROUP_LABEL = 'Continue after leaving to map (About Me Hut)';
