// Built-in test checklists for the dev harness (TestChecklistPanel).
// Keyed by the harness `?game=` key. Any checklist can also be pasted in from the
// panel ("＋ paste checklist"), so new test plans never need a code change.
//
// Item: { text, expect? }  — `expect` is the pass condition shown under the step.

export const TEST_CHECKLISTS = {
  'modak-calm': {
    title: 'Modak Game 1 - Calm Mooshika: teach hold once',
    items: [
      {
        text: 'Calm Mooshika: hear the opening hold instruction.',
        expect: 'One hold teaching hand appears on the action phrase, then stops.',
      },
      {
        text: 'Calm Mooshika: hold meaningfully past about 20%, release, then wait.',
        expect: 'No teaching hand returns. Mooshika uses ring/pulse help only.',
      },
      {
        text: 'Calm Mooshika: quick-tap without holding a few times.',
        expect: 'First quick tap says "Keep holding."; later help can strengthen, but after a meaningful hold it does not replay the hand.',
      },
      {
        text: 'Open the sidebar mid-line or mid-hint, then close it.',
        expect: 'The line resumes cleanly; retired teaching hands do not come back just because of the sidebar.',
      },
    ],
  },
};

TEST_CHECKLISTS['modak-game2-new'] = {
  title: 'Modak Game 2 - Bush, Branch, Marsh: teach once, then point where',
  items: [
    { text: 'Bush phase: watch the intro.', expect: 'One sideways swipe hand appears with "Swipe", then retires.' },
    { text: 'Bush phase: wait ~18s for L2.', expect: 'Bush gives visual movement/pulse and the swipe clue plays. No hand demo returns.' },
    { text: 'Bush phase: do a short or vertical swipe and let go.', expect: 'The bush springs back and gives the relevant short/wrong-direction line once; later repeats are mostly visual.' },
    { text: 'Bush phase at L3: keep waiting.', expect: 'Bush help becomes stronger visually. No final hand demo.' },
    { text: 'Bush phase: do the real sideways swipe.', expect: 'Bush opens, flowers collect, game moves to the Branch phase.' },
    { text: 'Branch phase: watch the intro.', expect: 'One pull-and-hold teaching hand appears with "Pull", then retires.' },
    { text: 'Branch phase: do NOT touch the branch. Wait ~18s for L2.', expect: 'The branch pulses/glows and the placement/action hint plays. No hand demo returns.' },
    { text: 'Branch phase: keep waiting ~8s after L2 finishes for L3.', expect: 'Help becomes stronger visually; no repeated pull-and-hold demo and no repeated final rescue VO.' },
    { text: 'Branch phase: pull part-way and release, or pull upward.', expect: 'You get the specific corrective line for that error type; the branch keeps visual help and does not restart to L0.' },
    { text: 'Branch phase: do the real pull down + hold until it completes.', expect: 'Scene reacts, branch succeeds, hint clears, and Marsh starts fresh.' },
    { text: 'Marsh first step: watch the intro.', expect: 'One drag-to-first-safe-spot teaching hand appears, then retires.' },
    { text: 'Marsh first step: wait for help.', expect: 'The exact next safe spot glows/pulses; no second teaching hand appears.' },
    { text: 'Marsh: land on the first safe spot, then wait on steps 2-4.', expect: 'Only the next safe spot/Mooshika cue appears. No hand re-teaches dragging.' },
    { text: 'Marsh: drag Mooshika to a wrong place after the hand is retired.', expect: 'Mooshika returns, the target safe spot remains clear, and the drag hand does not come back.' },
    { text: 'Marsh: complete all four safe spots.', expect: 'Each correct landing clears the current cue and wakes the next spot.' },
  ],
};

TEST_CHECKLISTS.samaprabha = {
  title: 'Samaprabha: 3 hint states (teach / find / keep holding); hand only in clue 1',
  items: [
    { text: 'Clue 1: first-time teaching hand is playing. Tap empty sky / ground (not on the shadow).', expect: 'Hand finishes its pass; intro VO is not cut.' },
    { text: 'Clue 1, never touch the shadow: wait ~10s.', expect: 'Current shadow area pulses.' },
    { text: 'Clue 1: keep waiting to ~18s. Tap empty areas.', expect: '"Press and hold on the shadow." plays to the end; no hand yet; taps change nothing.' },
    { text: 'Clue 1: keep waiting to ~26s.', expect: 'One full hold hand demo plays (once).' },
    { text: 'Clue 1: hold only a sliver (under ~10% of the ring), release, wait.', expect: 'Still the TEACH ladder (pulse, then "Press and hold", then hand).' },
    { text: 'Clue 1: hold past ~25% of the ring, release early, wait ~9s.', expect: '"Keep holding." plays once with a soft glow. NO hand, no search hint.' },
    { text: 'Hold the shadow until the ring completes.', expect: 'Clue lights, "find another" plays, next clue starts a fresh clock.' },
    { text: 'Clue 2-4, do nothing for ~12s.', expect: 'Shadow area pulses and "Look for another part of the shadow." plays.' },
    { text: 'Clue 2-4, keep waiting to ~25s.', expect: 'Exact shadow region stays lit quietly. No extra VO. NO hand at any point.' },
    { text: 'Clue 2-4: wait 25s+ and tap empty areas.', expect: 'Nothing restarts or escalates; the lit region stays.' },
    { text: 'Clue 2-4: hold the correct region ~30%, release, wait ~9s.', expect: 'Only "Keep holding." plays once. No "look for another part", no hand.' },
    { text: 'Clue 2-4: press the correct shadow during the hint line.', expect: 'Line is cut, ring fills, no stuck hint after release.' },
    { text: 'Complete a clue, then reach the next clue and leave it idle.', expect: 'Hint states reset per clue: it is Find again, not Keep.' },
    { text: 'Open the sidebar mid-hint, then close it.', expect: 'Hint pauses and resumes cleanly; no hand appears after clue 1.' },
  ],
};

TEST_CHECKLISTS.kurumedeva = {
  title: 'Kurumedeva: teach the bubble and the first plank, then step back',
  items: [
    { text: 'Ask Elephant: hear the instruction.', expect: 'One teaching hand drags the bubble, timed to the action word.' },
    { text: 'Ask Elephant: drag the bubble a real distance and drop it far from Elephant.', expect: 'Bubble returns; Elephant glows (clearer helper); NO hand appears.' },
    { text: 'Ask Elephant: drag a little, open the sidebar, close it.', expect: 'The teaching hand does NOT come back.' },
    { text: 'Ask Elephant: drop the bubble on Elephant.', expect: 'Elephant helps; hint clears; next beat starts a fresh clock.' },
    { text: 'Ask Monkey: hear the question, then do nothing for ~12s.', expect: 'NO teaching hand. Bubble wiggles twice and "Who can help tie the rope?" plays once.' },
    { text: 'Ask Monkey: keep waiting to ~25s.', expect: 'Monkey glows quietly and stays. No hand, no further lines.' },
    { text: 'Ask Monkey: drop the bubble away from Monkey.', expect: 'Monkey glows right away; no hand; ladder does not restart.' },
    { text: 'Plank 1: hear the instruction.', expect: 'One teaching hand drags the plank to the slot.' },
    { text: 'Plank 1: drag a plank a real distance and drop it in the wrong place.', expect: 'Plank returns; the slot glows; NO hand appears.' },
    { text: 'Place plank 1.', expect: '"Good. Continue dragging the planks." plays once.' },
    { text: 'Planks 2-3: do nothing for ~12s.', expect: 'The top plank nudges twice. No hand, no new line.' },
    { text: 'Planks 2-3: keep waiting to ~25s.', expect: 'The slot glows quietly and stays. No hand, no L3 line.' },
    { text: 'Tap empty areas at any hint stage.', expect: 'Hints keep playing; nothing restarts.' },
    { text: 'Place planks 2 and 3.', expect: 'Bridge completes; crossing starts.' },
  ],
};

TEST_CHECKLISTS.mahakaya = {
  title: 'Mahakaya: teach on log 1, then step back',
  items: [
    { text: 'Log 1: do nothing. Wait for L2 (hand + "Drag the log into the water."). Grab the log and let go without finishing.', expect: 'Hand stays up; the L2 line plays again on release; no reset to L0.' },
    { text: 'Log 1: drag the log a real distance and miss the raft, twice.', expect: 'After the 2nd miss the exact spot shows and "Put the log here." plays once. No hand appears.' },
    { text: 'Log 1: drag a little (real movement), open the sidebar, close it.', expect: 'The teaching hand does NOT come back.' },
    { text: 'Log 1: place it. Hear "Keep adding logs to the raft."', expect: 'Plays once, not again on logs 2-4.' },
    { text: 'Logs 2-4: do nothing for ~12s.', expect: 'The log nudges twice and "Drag the next log." plays once. No hand.' },
    { text: 'Logs 2-4: keep waiting to ~25s.', expect: 'The exact spot glows quietly and stays. No hand, no further lines.' },
    { text: 'Logs 2-4: miss the raft twice.', expect: 'The exact spot shows early; "Put the log here." plays once; a pointing hand (not a drag) appears on the drop spot.' },
    { text: 'Tap empty sky/ground at any hint stage.', expect: 'Hints keep playing; nothing restarts.' },
    { text: 'Drag each log to finish.', expect: 'Stage completes; hint clears; next log starts a fresh clock.' },
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
    { text: 'Wait for L3 on any card.', expect: 'The correct symbol pulses 3 times (about 8s), then stays as a soft static gold highlight; ONE "Remember? ..." line plays once and does not repeat.' },
    { text: 'At L3: tap a wrong symbol.', expect: 'The correct symbol stays highlighted; the ladder does not restart; the "Remember?" line does not repeat.' },
    { text: 'Pick the correct symbol.', expect: 'Success; fresh clock for the next card.' },
  ],
};

TEST_CHECKLISTS['amh-favorite-food'] = {
  title: 'Favorite Things: Ganesha questions = clue (~13s) then correct-choice glow; child questions = one repeat',
  items: [
    { text: 'Ganesha question: after the question line, do nothing for ~10s.', expect: 'No wobble or movement on any choice.' },
    { text: 'Keep waiting to ~13s.', expect: 'One short meaning clue plays (e.g. "Look for the sweet I love."). Choices still do not move.' },
    { text: 'Keep waiting after the clue ENDS (~10s).', expect: 'The correct choice gets the strong gold glow and stays lit. No extra voice.' },
    { text: 'Wait longer. Tap empty areas.', expect: 'Glow stays; nothing repeats.' },
    { text: 'On a FRESH question (remount or a new question), within the first ~10s and before any clue: tap a wrong choice.', expect: 'Wrong sound, shake, the option name is spoken; the clue timer is NOT restarted.' },
    { text: 'While the clue is speaking: tap a wrong choice.', expect: 'Wrong sound and shake only. The clue is NOT interrupted and the option name is NOT read.' },
    { text: 'After the glow is showing: tap a wrong choice.', expect: 'Wrong sound and shake; the correct choice stays glowing.' },
    { text: 'Tap the correct choice (at any point).', expect: 'Success; hint clears; the next question starts a fresh clock.' },
    { text: 'Check all four Ganesha questions (food, color, activity, friend).', expect: 'Each has its own clue line and the same timing; no choice-wobble on any of them.' },
    { text: 'Activity question: count the choices.', expect: '7 activities plus "My own" (8). "Games" is not shown.' },
    { text: 'Child question (own favorite food/color/activity/friend): wait ~10s.', expect: 'The question repeats ONCE, then nothing. No glow, no answer rescue.' },
  ],
};

TEST_CHECKLISTS['sr-finale'] = {
  title: 'Shloka River Finale: 2-step recall hints (clue → rescue); wrong boats never cut or reset help',
  items: [
    { text: 'Wait for the opening shloka / reinforcement audio to finish, then do nothing for ~10s.', expect: 'No hint yet. The boats do NOT pulse or nudge at any point.' },
    { text: 'Keep waiting to ~13s.', expect: 'The meaning-clue VO plays once (describes the word, does not name it). No hand.' },
    { text: 'Keep waiting to ~25s.', expect: 'The correct boat glows gold and bobs, and the word is spoken once.' },
    { text: 'Keep waiting past ~40s. Tap empty areas.', expect: 'Correct boat stays lit; no new VO, no repeats.' },
    { text: 'After the rescue is showing: tap a wrong boat.', expect: 'Soft wrong sound; the correct boat stays lit; nothing restarts.' },
    { text: 'During the clue VO: tap a wrong boat.', expect: 'Clue keeps playing to the end (not cut).' },
    { text: 'During the clue VO: drag a wrong boat and drop it away from the slot.', expect: 'Clue keeps playing; boat settles back; no reset.' },
    { text: 'On a new slot with no hint showing: tap a wrong boat twice.', expect: 'The meaning clue plays early after the 2nd wrong (once); the correct boat does NOT glow yet.' },
    { text: 'After the early clue: wait.', expect: 'Clue does not repeat at ~13s; the rescue still arrives at ~25s from the slot start.' },
    { text: 'With a hint showing: grab the correct boat but do not place it.', expect: 'Hint stays until it is placed.' },
    { text: 'Tap or drag the correct boat while a clue is playing.', expect: 'Clue stops, success plays, the word audio is heard.' },
    { text: 'Move to the next slot and leave it idle.', expect: 'Ladder is fresh: nothing, then clue (~13s), then rescue (~25s). Clue is that slot\'s own word.' },
    { text: 'Place all 8 boats and look at the fleet (iPad 1024x670).', expect: 'Boats follow the LEFT of the river in a zig-zag; the top boats are spaced apart; no word label sits on another boat\'s sail; the new-boat ripple lands on each boat\'s spot.' },
    { text: 'Final "say it together" recap: watch each word being chanted.', expect: 'The chanted boat glows and comes to the front, and its symbol shows large in the open water to the right of the fleet (not hidden behind any boat). The symbol changes with each word and disappears at the end.' },
  ],
};

TEST_CHECKLISTS['sm-pond'] = {
  title: 'Pond: teach rock hold, flower drag, and lotus intro hold once',
  items: [
    { text: 'Rock: hear "Press and hold to move it."', expect: 'One hold teaching hand appears with the action phrase, then stops.' },
    { text: 'Rock: release very early once.', expect: 'Only "Keep holding." plays. The rock keeps useful hold-ring feedback.' },
    { text: 'Rock: hold meaningfully past about 20%, release, then wait.', expect: 'The teaching hand does not return. Around 12s the rock shows a subtle hold ring; around 25s the visual rescue strengthens only if hold was never meaningfully learned.' },
    { text: 'Flowers: hear "Gently move them aside."', expect: 'One drag teaching hand plays one iteration, not two.' },
    { text: 'Flowers: drag part-way but not far enough.', expect: 'The flowers settle back and "A little farther." plays once; later help is visual/directional, not a repeated drag VO.' },
    { text: 'Flowers: make a meaningful drag, then stall.', expect: 'No teaching hand returns. The flowers gently shift sideways as the reminder/rescue cue.' },
    { text: 'Lotus: reach "Hold the bud to help it bloom."', expect: 'One hold teaching hand appears with the action phrase, then stops.' },
    { text: 'Lotus: release early.', expect: '"Keep holding." plays. If idle, the bud uses ring/glow reminders only, with no repeated GestureDemo and no second VO.' },
    { text: 'Complete rock, flowers, and lotus.', expect: 'Each mechanic clears cleanly and the scene progresses without repeated tutorial hands.' },
  ],
};

TEST_CHECKLISTS['amh-indian-story'] = {
  title: 'My Indian Story: 2-step hints (clue → rescue); wrong answers never clear help; personal phases = one repeat',
  items: [
    { text: 'Ganesha Home: first time, wait for "Move the magnifying glass around the map…" to start.', expect: 'The teaching hand plays ONCE (one pass, not two), in sync with the line.' },
    { text: 'Ganesha Home: never touch the magnifier; wait ~12s.', expect: '"Move the magnifying glass around the map." plays and the magnifier gives a short nudge (3 quick wobbles, then still). It never wobbles forever.' },
    { text: 'Ganesha Home: keep waiting ~10s after that line.', expect: 'The teaching hand replays once. No spot glows yet.' },
    { text: 'Ganesha Home: drag the magnifier once (no find), then stop and wait ~12s.', expect: 'ONE undiscovered spot glows softly. No voice. The magnifier does NOT wobble. No hand.' },
    { text: 'Ganesha Home: keep waiting to ~25s from your last find/start.', expect: 'That same single spot gets a ring that stays until found. The other undiscovered spots are NOT highlighted.' },
    { text: 'Ganesha Home: drag around with the ring showing.', expect: 'The ring stays; dragging does not clear it.' },
    { text: 'Ganesha Home: find that spot.', expect: 'Hints clear; a fresh cycle starts and points at the next undiscovered spot.' },
    { text: 'Language guess: press Play. Does the Play button keep pulsing forever?', expect: 'It pulses twice then rests. If you do not press it for ~11s, "Tap play and listen carefully." repeats once and it pulses twice more.' },
    { text: 'Language guess: after the chant, wait ~10s.', expect: 'No wobble on the cards.' },
    { text: 'Language guess: wait to ~12s.', expect: '"Think of the language many shlokas are in." plays (once). Cards still do not move.' },
    { text: 'Language guess: wait ~10s after the clue ends.', expect: 'Sanskrit gets the strong persistent glow. No extra voice.' },
    { text: 'Language guess: tap a wrong card BEFORE the clue.', expect: 'Shakes and says its name. The clue timer is NOT restarted (the clue still arrives on schedule).' },
    { text: 'Language guess: tap a wrong card WHILE the clue is speaking.', expect: 'Shake only. The clue is NOT cut and the language name is not read.' },
    { text: 'Language guess: tap a wrong card once the Sanskrit glow is showing.', expect: 'Shake only; the Sanskrit glow stays.' },
    { text: 'Festival guess: same three checks (wait ~12s, then ~10s more).', expect: '"Think of the festival that celebrates Ganesha." at ~12s with no card wobble; then Ganesh Chaturthi gets the persistent glow. No extra voice.' },
    { text: 'Festival guess: tap a wrong card before, during and after the clue.', expect: 'Name spoken only BEFORE the clue; shake only after. The timers are never restarted; the glow stays once shown.' },
    { text: 'Child home / child languages / child festivals: wait ~10s on each.', expect: 'The prompt repeats ONCE, then nothing. No glow, no rescue.' },
    { text: 'Child languages: trigger the reminder (replay button).', expect: 'Says "Choose up to three languages you use or hear." (not "you speak").' },
    { text: 'Make the correct guess in each Ganesha phase.', expect: 'Hints clear and the phase moves on.' },
  ],
};

TEST_CHECKLISTS['modak-garland'] = {
  title: 'Modak Scene 1 (Garland): tap flowers, carry once, rescue is visual',
  items: [
    { text: 'Intro line is playing: open and close the sidebar 3-4 times quickly.', expect: 'Intro replays once; hints still start afterwards (no freeze).' },
    { text: 'Build: tap a few flowers, then stop and wait. Time L1, L2, L3.', expect: 'L1 about 10s: remaining flowers bob/pulse. L2 about 18s: voice says "Tap any flower." L3 about 8s after: one remaining flower gets the stronger glow. No tap hand and no "Tap this flower." VO.' },
    { text: 'Build with NO flower tapped yet: wait for L2.', expect: 'The voice says "Tap any flower." (never "another").' },
    { text: 'Carry: after the garland completes, listen to the ready line.', expect: 'One drag-to-Ganesha teaching hand appears with "Drag", then retires.' },
    { text: 'Carry: wait for L2, then start dragging the garland and drop it away from Ganesha.', expect: 'The carry clue plays and Ganesha can glow; the hand does not come back or reset to L0.' },
    { text: 'Carry: miss 3 times quickly.', expect: 'Help becomes visual on Ganesha. No "Drag the garland onto Ganesha." final rescue VO.' },
    { text: 'Carry with no hint showing: drag part-way and drop it away.', expect: 'Idle clock restarts quietly; later help is destination-focused.' },
    { text: 'Drop the garland on Ganesha.', expect: 'Success; hint clears.' },
  ],
};

TEST_CHECKLISTS['sm-eyes'] = {
  title: 'Symbol Mountain, Eyes game: 2-step hints (clue + bush cue -> one exact object), no wrong-tap voice',
  items: [
    { text: 'Intro line playing: open and close the sidebar several times quickly.', expect: 'Intro replays; the game and hints continue (no freeze).' },
    { text: 'After the intro ends, do nothing for ~10s.', expect: 'Nothing happens: no bush breathing, no voice.' },
    { text: 'Keep waiting to ~13s.', expect: '"Look near the bushes. Something is peeking out." plays and ONLY the bush(es) of the next remaining object pulse. The object itself does not glow.' },
    { text: 'Keep waiting ~9s after the clue ends.', expect: 'ONE remaining object gets the strong glow and keeps it until found. No voice (no "Tap the glowing bushes").' },
    { text: 'Tap empty space 3 times (fresh target).', expect: 'Only a shimmer each time, no voice. On the 3rd the clue + bush cue arrive early.' },
    { text: 'Keep missing to 6 taps.', expect: 'The exact object glow comes early; a clue still speaking is not cut.' },
    { text: 'Tap a wrong (distractor) item.', expect: 'Soft pulse only: no voice and no text line. The clock is not restarted.' },
    { text: 'Find the first object with neither object found yet.', expect: 'Only that object glowed (never both at once). Success line, then "Now find the ..." and a fresh cycle for the other object.' },
    { text: 'Find the feather and the mango.', expect: 'Each find clears the hint; next target starts a fresh clock.' },
    { text: 'Find the mango, then tap the feather quickly (while the mango line or "Now find the feather" is still speaking).', expect: 'The feather-found line plays; "Now find the feather" does NOT play afterwards, because the feather is already found.' },
  ],
};

TEST_CHECKLISTS['sm-ears'] = {
  title: 'Symbol Mountain, Ears sound-match: replay all -> clue + sound -> source glow; wrong taps escalate; no numbers',
  items: [
    { text: 'During the intro or a prompt line, switch to another tab and come back.', expect: 'The round does not advance while you are away; the line replays once on return.' },
    { text: 'Open and close the sidebar several times quickly during a line.', expect: 'Line replays; round and hints continue.' },
    { text: 'Look at the three sound sources.', expect: 'No 1/2/3 numbers on them; the playing source pulses.' },
    { text: 'On the choosing screen do nothing to ~10s.', expect: 'All three sounds replay once. No voice.' },
    { text: 'Keep waiting to ~18s.', expect: 'Clue (e.g. "Listen for the water drip.") then ONLY the target sound.' },
    { text: 'Keep waiting ~8s after the clue + sound finish.', expect: 'Correct source glows and stays; its sound replays once; NO "Tap the glowing place."' },
    { text: 'New round: tap a wrong zone once.', expect: 'Wobble, "Listen again.", then ALL three sounds replay (not the target alone).' },
    { text: 'Tap a wrong zone a 2nd time.', expect: 'Clue line plus the target sound.' },
    { text: 'Tap a wrong zone a 3rd time.', expect: 'Correct source glows persistently; no voice line (target sound once).' },
    { text: 'Tap the right zone.', expect: 'Reveal plays; next round starts with fresh hint state.' },
  ],
};

TEST_CHECKLISTS['sm-tusk-live-v2'] = {
  title: 'Symbol Mountain, Tusk nest (BeatPlayer): twig teaches how once; reminder line + nudge; nest glow rescue',
  items: [
    { text: 'Twig (first item): hear the opening line.', expect: 'The teaching hand appears ONCE on the word "Drag" and travels toward the nest.' },
    { text: 'Grass, leaf, feather openings ("What about the short grass?" etc.).', expect: 'No teaching hand on any of them.' },
    { text: 'Do nothing on an item, wait ~12s.', expect: '"Add the <item> to the nest." plays once and the item gives a small nudge. No hand, no glow yet.' },
    { text: 'Keep waiting ~8s after that line ends.', expect: 'The nest glows clearly and stays lit. No voice, no hand.' },
    { text: 'Drop the item just outside the nest, then just inside it.', expect: 'Just outside = a miss; just inside = success.' },
    { text: 'On a FRESH item, drop it wrong once.', expect: 'It springs back quietly; no voice, no hand, no glow.' },
    { text: 'Drop it wrong a 2nd time.', expect: 'The nest glow comes early and stays. No new voice line, no hand, the idle clock is not restarted.' },
    { text: 'Twig only: never drag it, wait for the nest glow.', expect: 'The hand may re-show once with the glow (never-dragged child only). It does NOT show after a real drag.' },
    { text: 'Drag part-way and release with no hint showing.', expect: 'Idle clock restarts.' },
    { text: 'Tap empty areas at the line and at the glow.', expect: 'Hints keep playing; nothing restarts.' },
    { text: 'Open and close the sidebar during a line.', expect: 'Replays once; hints restart fresh.' },
    { text: 'Drop all four items in the nest.', expect: 'Each success clears the glow; the next item starts a fresh clock; final line "You did it! All those little things helped rebuild the nest."' },
  ],
};

TEST_CHECKLISTS['sm-final'] = {
  title: 'Symbol Mountain, Sacred Assembly: small tap markers',
  items: [
    {
      text: 'Reach the first symbol card, let it slide/flip into play, then look at Ganesha before tapping.',
      expect: 'Small cream/gold circle markers appear on all available body-part choices. No large purple/white full-zone ovals or debug-looking hitbox fields are visible.',
    },
    {
      text: 'On round 1 only, watch the markers when play begins.',
      expect: 'All available markers pulse together twice, then settle into faint/static markers.',
    },
    {
      text: 'Complete round 1, then begin rounds 2 and 3.',
      expect: 'Markers appear during play but do not do the intro pulse again.',
    },
    {
      text: 'Before play begins for a round (card appearing, sliding, or flipping), watch Ganesha.',
      expect: 'No tap markers are visible until the scene is actually waiting for the child to choose.',
    },
    {
      text: 'Tap one wrong available body part.',
      expect: 'Only the tapped marker gives a short wobble/SFX. There is no "Try another place" VO and no full-zone glow.',
    },
    {
      text: 'On the same round, tap a second wrong body part.',
      expect: 'The placement clue comes forward early, using a body-part retrieval cue rather than repeating the affirmation.',
    },
    {
      text: 'Tap close to a marker but within the old large tappable area.',
      expect: 'The tap still works as a forgiving hit target; the visible marker remains small.',
    },
    {
      text: 'Tap the correct body part.',
      expect: 'The marker disappears as that part fills in, and markers hide during feedback/completion before the next card.',
    },
    {
      text: 'Leave a round idle until the clue plays.',
      expect: 'The clue is VO-only and helps with placement, e.g. "Which part helps you see what matters?" Markers remain neutral and no correct full-zone oval appears.',
    },
    {
      text: 'Keep waiting until the final rescue hint.',
      expect: 'Only the correct small marker gets a stronger gold halo/pulse. There is no extra final-rescue VO and no large target oval.',
    },
    {
      text: 'At final rescue, tap a wrong body part.',
      expect: 'The wrong marker wobbles locally and the correct small marker remains highlighted; the hint ladder does not restart.',
    },
    {
      text: 'Place the 3rd symbol and continue.',
      expect: 'No 3-symbol milestone VO plays; the next card flow stays smooth.',
    },
    {
      text: 'Place the 6th symbol.',
      expect: 'The only progress milestone VO plays: "Almost there — six symbols are back with Ganesha."',
    },
    {
      text: 'Open Hint Debug, select a zone, and drag/nudge its debug overlay.',
      expect: 'The red debug overlay is still available for tuning, and the visible marker follows the updated zone position.',
    },
    {
      text: 'Check a narrow/mobile viewport.',
      expect: 'Markers are slightly smaller, readable, and do not cover labels, art, or each other.',
    },
  ],
};

TEST_CHECKLISTS['suryakoti'] = {
  title: 'Suryakoti (rub): teach first, then remind once',
  items: [
    { text: 'First-time teaching hand plays on the first patch. Rub somewhere else on screen.', expect: 'The hand finishes its pass; nothing restarts.' },
    { text: 'First patch, NOTHING rubbed yet: do nothing and time L1 / L2 / L3.', expect: 'L1 about 10s: a clearly visible small glow spot, no voice. L2 about 18s: a short scratch hand + "Rub the glowing spot.". L3 about 8s after that line: the longer 2-pass hand with NO voice.' },
    { text: 'Rub a little of the first patch, then stop and do nothing.', expect: 'No hand and no glow spot. After about 10s a single "Keep rubbing." and nothing else repeats.' },
    { text: 'Finish the first three patches (Sur, ya, ko), then on the LAST patch (ti) rub a little and stop.', expect: 'After about 10s it says "Almost there!" (the whole game is about 75% done). On the first three patches the reminder is "Keep rubbing.", never "Almost there!".' },
    { text: 'After the reminder, keep doing nothing until about 25s.', expect: 'A soft warm light wash covers the active patch and pulses twice (about 5s), clearly lighting whatever is still dark in it, then stops. No voice. After that nothing more happens (no hand, no repeated lines).' },
    { text: 'Rub a big blob in the middle of a patch, then wait for the 25s wash.', expect: 'The wash covers the patch and visibly lights up the parts you have NOT rubbed; the cleared area just looks normal.' },
    { text: 'Finish a patch, then stop on the next patch without rubbing it.', expect: 'The same as step 3: about 10s a single "Keep rubbing.", about 25s the quiet glow. No hands on later patches.' },
    { text: 'Rub part of a patch, lift your finger, do nothing, then rub again and stop again.', expect: 'The reminder timing restarts after each rub (it never stays silent after a partial rub), and the reminder speaks again only after you have rubbed again.' },
    { text: 'Rub somewhere that has no darkness left, or tap the screen.', expect: 'The hint timing is not restarted by that.' },
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
  title: 'Sarvada: two-step search support (clue, then exact ring)',
  items: [
    { text: 'Each round: hear the instruction, then do nothing for ~12s.', expect: 'ONE meaning clue plays ("Think of the symbol that helps us listen." / "...hold lots of feelings." / "Think of the sweet that reminds us of joy.") with the broad glow. No hand.' },
    { text: 'Keep waiting to ~25s.', expect: 'The broad glow disappears and the exact ring appears with no voice, and it stays.' },
    { text: 'Keep waiting another 30s.', expect: 'Nothing else happens: no voice, no new animation.' },
    { text: 'While the clue is speaking, tap somewhere wrong.', expect: 'Tiny ripple only; the clue is NOT cut off; the timer does not restart.' },
    { text: 'Find the symbol.', expect: 'Symbol flies to the syllable; next phase starts a fresh clock.' },
  ],
};

TEST_CHECKLISTS['amh-dreams-wishes'] = {
  title: 'Dreams and Wishes: 2-step hints (reminder → rescue); no hand after the first drag; no visible hit-boxes',
  items: [
    { text: 'Wish 1: after the instruction ends, do nothing for ~10s.', expect: 'No pulse on any bubble.' },
    { text: 'Wish 1: keep waiting to ~13s.', expect: 'One clue plays: "Look for actions that help or care for someone." Bubbles still do not move.' },
    { text: 'Wish 1: wait ~10s after the clue ends.', expect: 'The remaining KIND bubbles glow and stay lit. No second voice line (the four answers are NOT read out).' },
    { text: 'Wish 1: tap an unkind bubble (before, during and after the clue).', expect: 'Shake + dim only. No spoken "that\'s not kind". A playing clue is NOT cut. Hint timing is not reset.' },
    { text: 'Wish 1: tap a kind bubble.', expect: 'Progress advances; the 2-step cycle restarts for the next kind action.' },
    { text: 'Wish 2: first time, wait for "Drag food…" to start.', expect: 'Teaching hand plays once, in sync with the line.' },
    { text: 'Wish 2: place NO food and wait ~12s.', expect: 'Reminder "Drag one food toward an empty plate." plus the hand once more; then the empty plate glows (~10s after the line).' },
    { text: 'Wish 2: place one food, then wait ~12s.', expect: 'Line is "There\'s still an empty plate." Only ONE remaining food nudges and the empty plate softly shows. NO hand.' },
    { text: 'Wish 2: keep waiting after that line.', expect: 'The exact empty plate gets the full glow and the food glows. No extra voice.' },
    { text: 'Wish 3: look at the garden before tapping anything.', expect: 'NO dashed ovals or pale fills. Each bare spot shows only a small golden twinkle. Tapping around the plant (large invisible zone) still works.' },
    { text: 'Wish 3: wait ~12s.', expect: '"There\'s still space for more to grow." plays; ONE remaining spot pulses (not all three).' },
    { text: 'Wish 3: wait ~10s more.', expect: 'That one spot glows stronger and stays lit. No extra voice.' },
    { text: 'Wish 3: tap a spot, then wait again.', expect: 'The hint restarts, points at a remaining spot, and never behaves as if tapping is new.' },
    { text: 'Dream clouds: do not tap for ~12s.', expect: '"Tap me to clear the clouds." plays; then Ganesha glows (~10s later). No arrow, no multi-stage nudges.' },
    { text: 'Dream clouds: clear one cloud, then stall ~12s.', expect: '"Keep tapping." plays, then the Ganesha glow.' },
    { text: 'Dream drawing: sit idle.', expect: 'No hint ladder at all.' },
    { text: 'Tap empty background during any hint.', expect: 'Nothing restarts.' },
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
  'sm-modak-game1': 'modak-calm',
  'sm-modak-game2': 'modak-game2-new',
  'sm-modak': 'modak-calm',
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
  'Symbol Mountain': ['modak-calm', 'modak-game2-new', 'modak-garland', 'sm-pond', 'sm-eyes', 'sm-ears', 'sm-tusk-live-v2', 'sm-final'],
  'Shloka River': ['vakratunda', 'mahakaya', 'suryakoti', 'samaprabha', 'nirvighnam', 'kurumedeva', 'sarvakaryeshu', 'sarvada', 'sr-finale'],
  'About Me Hut': ['amh-dreams-wishes', 'amh-favorite-food', 'amh-indian-story'],
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
