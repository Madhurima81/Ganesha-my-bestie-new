# CHANGELOG.md
Append one entry per work session. Newest on top.

## [2026-09-26] — Shloka River wrong-action polish: Sarvada tap ripple + Finale drag miss/soften
**Touched:** src/zones/shloka-river/scenes/scene4/SarvadaGame.jsx,
SarvadaGame.css; src/zones/shloka-river/scenes/scene5/ShlokaRiverFinale.jsx,
ShlokaRiverFinale.css.

**Changed:** Two small wrong-action reviews, no redesign of either scene's
hint ladders (left untouched in both).

Sarvada (tap-to-find symbol game): a missed tap used to do nothing, so the
child couldn't tell if the tap registered or was ignored. Added a tiny
neutral ripple exactly at the tap point on a miss — no shake, VO, red, or
penalty, just confirmation the tap landed.

Shloka River Finale (drag-the-boat-into-slot game): two changes.
1. Wrong boat into the active slot: sound softened from `playSfx('wrong')`
   to the existing `playSfx('softWrong')` sfx key — wobble-then-clear
   behavior unchanged, since this is a memory-order game, not a failure
   state.
2. Drop released outside the target slot (the actual gap): previously the
   drag ghost just vanished with no feedback. Now it briefly "lands" at the
   release point with a small bounce, then shrinks/fades back — no VO, no
   red, no penalty. The tray boat was never removed on pickup, so it's
   already available again; repeated misses are still handled by the
   existing hint ladder.

**Open:** Not yet visually tested in-browser by Madhurima.

## [2026-09-26] — Shloka River polish: Vakratunda, Samaprabha, Nirvighnam
**Touched:** src/dev/webSpeechScripts.js;
src/lib/config/content/voiceGuidance.js;
src/zones/shloka-river/scenes/Scene1/VakratundaRescueGame.jsx;
src/zones/shloka-river/scenes/Scene2/components/SamaprabhaGame.jsx/.css;
src/zones/shloka-river/scenes/Scene2/assets/images/Samaprabha/fawn-walk-new.png;
src/zones/shloka-river/scenes/Scene2/assets/images/Samaprabha/reveal-branch-new.png;
src/zones/shloka-river/scenes/Scene2/assets/images/Samaprabha/reveal-rock-new.png;
src/zones/shloka-river/scenes/Scene3/NirvighnamGame.jsx/.css.

**Changed:** Kept the existing scene architectures and made only targeted
interaction/asset polish updates.

- **Vakratunda:** shortened the stuck L2 hint line to "Try going around it."
  in both canonical voice guidance and the Web Speech fallback; changed the
  passive no-interaction frog nudge from 18s to 10s while leaving the
  collision system, three-bump trigger, `softWrong`-only blocked response,
  and 6s/12s reactive stuck escalation intact.
- **Samaprabha hold feedback:** incomplete clue holds now drain the visible
  hold ring smoothly when the child leaves early, instead of vanishing
  instantly. No wrong counter, wrong VO, shake, or rejection state was added.
- **Samaprabha assets/layout:** replaced the branch reveal, rock reveal, and
  walking deer images with the new downloaded assets. Added editable layout
  controls for `Reveal: Branch`, `Reveal: Rock`, `Fawn Start`, and `Fawn Walk
  Target` so position, size, rotation/flip (where applicable), and walking
  deer scale can be tuned in the layout panel. Removed the hardcoded walking
  deer CSS position so the panel controls it.
- **Nirvighnam:** wrong branch drops now visibly land, pause briefly, then
  return smoothly; repeated wrong branch drops trigger the existing branch
  hint. Mostly vertical reeds swipes now get a gentle resistance nudge, and
  repeated vertical swipes trigger the existing reeds hint. Rock behavior and
  all generic wrong-SFX/VO behavior were left unchanged.

**Verified:** Focused ESLint checks passed for the edited Samaprabha and
Nirvighnam components; `git diff --check` passed for the edited files, with
only existing Windows CRLF warnings.

## [2026-09-26] — Mahakaya Rescue: rope-pull → direct drag-and-drop mechanic + new hint ladder
**Touched:** src/zones/shloka-river/scenes/Scene1/MahakayaRescueGame.jsx,
MahakayaRescueGame.css; src/lib/config/content/voiceGuidance.js;
src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx.

**Changed:** Replaced the two-step rope rig (drag knob to attach → pull handle
down) with a single direct drag: the child now drags each waiting log
straight into a soft water dropzone at its raft position. Removed the
pulley/knob/pull-handle rig entirely (state, layout keys, debug entries,
`RopeGripSvg`/`RopeLine`, related CSS) and collapsed the two teaching
`GestureDemo`s (attach + pull) into one `drag` demo from log to dropzone.
Rebuilt the idle-hint ladder for the new mechanic per spec: 10s/18s/26s per
log, restarting fresh each round (already automatic — hint-cycle is keyed on
`activeLog`); immediate teaching cue on Log 1 only (one drag gesture, no VO);
L1 is visual-only (log nudge + a **broad, blurred, breathing** dropzone —
deliberately not the exact spot, and hidden entirely before L1 so there's
never a permanent strong dropzone from the start); L2 sharpens the dropzone
to its exact "clear" shape + VO "Drag the log into the water."; L3 shows the
full gesture + VO "Put the log here." Wrong drops bounce the log briefly in
place then slide it back to the bank — no sound, no VO, no red X; the first
1-2 misses are visual-only, and from the 2nd consecutive miss the
dropzone/gesture jump to L2-style clarity early (independent of the timer,
without pulling the spoken lines forward). Added the two new VO keys
(`scene10_maha_drag_water`, `scene10_maha_place_here`) to voiceGuidance.js
and removed the obsolete rope-era keys (`scene10_maha_blocking`,
`scene10_maha_drag_rope`, `scene10_maha_pull_down`); updated the parent
VakratundaGroveSimplified scene's Web-Speech fallback map and replay-button
reference to match, so its "replay voice" button doesn't call a dead key.

**Open:** Not yet visually tested in-browser by Madhurima (lint + full
production build both pass clean, but drop-distance threshold and the
broad→clear dropzone feel need her eyes on the live game-test harness at
`?game=mahakaya`). The new entry/hint VO lines are wired to text-only content
entries — no recorded MP3s yet, so they'll currently fall back to TTS/Web
Speech until real audio is recorded (folds into existing T14).

## [2026-09-26] — About Me Hut: My Indian Story Ganesha host placement
**Touched:** src/zones/about-me-hut/indian-story/MyIndianStoryGame.jsx;
src/zones/about-me-hut/indian-story/MyIndianStoryGame.css.

**Changed:** Fixed Ganesha visibility and placement consistency across the
My Indian Story Ganesha-led phases in the game-test harness.

- Added explicit phase wrapper classes for **Ganesha Home** and **Festival
  Ganesha** so the shared Ganesha host anchors to the active phase area.
- Kept **Language Ganesha** as the reference placement and aligned Ganesha
  Home + Festival to the same `about-me-ganesha-host--left-middle` position.
- Added a shared positioning context for Ganesha Home, Language, and Festival
  phases, and raised the host z-index so it renders above phase content.

## [2026-09-26] — About Me Hut QA pass: Favorite Things and My Indian Story fixes
**Touched:** src/lib/config/content/voiceGuidance.js;
src/zones/about-me-hut/food/Favoritefoodgame.jsx/.css;
src/zones/about-me-hut/indian-story/MyIndianStoryGame.jsx/.css;
src/zones/about-me-hut/components/AboutMeComparisonCard.css.

**Changed:** QA fixes from Madhurima's visual pass across Favorite Things and My Indian Story.

- **Color hint VO:** changed the color-round hint to "What color is an apple?"
- **Activity choice content:** kept the activity as Nature, reverted the "Draw another" label, and left the activity icon positions in their intended layout.
- **Favorite Things food round spacing:** spread the crowded tap targets in the Ganesha food round.
- **Drawing flow:** fixed the Draw button so it opens the drawing component.
- **White blank card/modal artifact:** adjusted the blank white card/box behavior so it does not remain visible through the scene.
- **Region selection VO:** the region name and confirmation line now play when the region card is tapped, not on Continue.
- **Region Continue visibility:** adjusted the region Continue button so it remains visible after selection.
- **Child language layout:** adjusted language cards and the Continue area so the Continue button remains visible.
- **Child language replay:** removed the play button from the child language selection phase.
- **Ganesha language replay:** kept the large play button visible throughout the Ganesha language phase, including while and after the audio plays.
- **Language card stability:** prevented the language cards from shifting after the third selection.
- **Language/festival flicker:** reduced the selected-card/header flicker behavior in the child language and festival selection screens.
- **Festival tap VO:** festival cards now speak their own name when tapped.
- **Festival correct feedback:** the correct festival tap speaks "Ganesh Chaturthi" first, then the correct feedback.
- **Festival labels:** added visible festival labels under icons, styled like the Ganesha language cards with the same Baloo/Nunito typography.
- **Festival selection layout:** matched the language selection layout with "Most Common Festivals" and "More Festivals" sections.
- **Festival card sizing:** enlarged festival cards to match the language card feel.
- **Festival selection count:** supports up to 4 selected festivals and shows the selected count above the button.
- **Story button copy/style:** removed the emoji from "See Our Story" and changed the buttons in this scene to the brown Family Tree/opening-modal style.
- **Festival count placement:** moved the festival count text so it does not get covered by the button.
- **Language count placement:** moved the language count text down so it sits just above the Continue button.
- **Final My Indian Story comparison:** moved the comparison cards up so the Continue button is visible, using Dreams/Wishes as the layout reference.

**Verified:** Ran `git diff --check` on the touched CSS during the pass; only existing Windows line-ending warnings were reported.

## [2026-09-24] — Symbol Mountain QA pass: hint timing, gesture accuracy, wrong-action feedback
**Touched:** src/lib/components/feedback/GestureDemo.jsx/.css; src/lib/hooks/useRepeatedHintCycle.js;
src/lib/beatPlayer/BeatPlayerGame.jsx/.css; src/dev/GameTestHarness.jsx;
src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx, FlowerJourneyGame2.jsx, GarlandGame3.jsx/.css;
src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx;
src/zones/symbol-mountain/scenes/tusk/EyesPopUpGame.jsx/.css, EarsSoundMatchGame.jsx/.css, SymbolMountainSceneV3.jsx;
src/zones/symbol-mountain/scenes/final scene/SacredAssemblyScene.css;
src/zones/symbol-mountain/shared/components/SymbolSidebar.jsx;
src/zones/shloka-river/scenes/Scene1/MahakayaRescueGame.jsx, Scene1/VakratundaRescueGame.jsx,
Scene2/components/SuryakotiGame.jsx, Scene2/components/SamaprabhaGame.jsx, Scene3/NirvighnamGame.jsx,
Scene3/KurumedevaGame.jsx, scene4/SarvakaryeshuGame.jsx, scene4/SarvadaGame.jsx, scene5/ShlokaRiverFinale.jsx;
src/zones/about-me-hut/food/Favoritefoodgame.jsx, enjoy/ObstacleRemoverGame.jsx, indian-story/MyIndianStoryGame.jsx,
enjoy/components/Wish2PlateDropGame.jsx;
src/zones/symbol-mountain/scenes/tusk/assets/images/ears-game-v2/cow_happy_chewing_new.png (new asset).

**Changed:** A full pass driven by a harness QA report, working scene by scene.

- **L3-fixed-offset bug (root cause, fixed in the shared `useRepeatedHintCycle`
  hook + every scene with its own inline ladder):** L3 was always a flat 26s
  from when the idle clock armed, regardless of whether the L2 line had
  actually finished speaking — a slow L2 line could cut into or overlap L3.
  Now L3 counts an 8s gap from when L2's own voice line ends (`markLevel2VoiceEnded`
  in the shared hook; equivalent inline fix in Modak/Pond/Eyes/Ears/Sacred
  Assembly/About Me Hut/all 8 `useRepeatedHintCycle` consumers in Shloka River).
- **GestureDemo L3 replay bug (shared component):** the demo's idle-timer
  effect only re-armed on an `active` `false→true` transition; since the
  trigger condition (`effectiveHintLevel >= 2`) is already `true` at L2, it
  never replayed at L3. Added a `replayKey` prop, wired into every hold/drag
  teaching-gesture call site across Modak, Pond, and Tusk's BeatPlayer.
- **New GestureDemo types `hold-progress-l2`/`hold-progress-l3`:** an actual
  filling progress ring (partial at L2, full at L3) for hold mechanics,
  replacing the plain teaching-demo ring at every escalation level. Wired
  into Calm Mooshika, Pond Rock/Lotus, Samaprabha's hold track, Nirvighnam's
  stone obstacle, Kurumedeva's log-try obstacle.
- **Modak Bush/Branch teaching timing + emotion sync:** the "action word"
  delay estimates assumed a one-clause VO; the real lines are full sentences,
  so the teaching hand and angry/sad emoji were firing before the VO even
  reached the relevant word. Recomputed against actual VO text.
- **Modak Branch gesture location:** `.fjg2-branch` has no centering
  transform (unlike bush/marsh), so the hand was anchored at the box's
  top-left corner, not the branch artwork. Re-anchored via live DOM
  measurement.
- **Modak affirmation spoken twice:** `FlowerJourneyGame2`'s own closing line
  and the parent's SymbolAutoReveal "say it with me" card spoke the identical
  sentence back to back. Removed the duplicate from FlowerJourneyGame2.
- **Modak emotion-trace persistence:** the small "memory" emoji left near a
  solved challenge was unconditionally rendered ("stays visible for the rest
  of the game"), so Branch's emoji stayed up through Marsh. Now gated to its
  own phase.
- **Pond Rock/Lotus double-ring:** the scene's own static L1 hint-ring
  rendered continuously through L2/L3 *alongside* GestureDemo's own internal
  ring — two overlapping rings pulsing at different rates. Ring now only
  shows at L1; GestureDemo owns L2/L3.
- **Pond teaching timing:** same one-clause-vs-full-sentence miscalibration
  as Modak, recomputed for Rock/Reeds/Lotus.
- **Pond Lotus gesture location:** hardcoded `LOTUS_HOLD_POINT` was off by
  6-7% from the actual rendered lotus center; fixed via live measurement.
- **Pond reveal-card-cuts-VO (trunk reveal + lotus bloom):** both used fixed
  timers shorter than their own success VO lines; now wait for the VO to
  finish + a buffer before opening the reveal card.
- **Pond symbol order:** `SymbolSidebar.jsx`'s fixed order listed lotus
  before trunk, but trunk (reeds) is solved before lotus (bloom) in actual
  play. Swapped in the sidebar; the analogous mandala `earnedSymbols` array
  in Pond's own completion sequence was corrected too.
- **Eyes (Tusk scene) generic hint:** only the first unfound target (feather)
  pulsed/spoke by name at L2/L3; now both remaining bushes pulse together
  with a generic "Tap the glowing bushes." line. Pulse intensity increased.
  Fixed the mango-tap completion sequence racing ahead of its own fly-to-target
  animation and cutting off the completion VO; added a self-managed fade-out
  before the parent unmounts the scene (was a sudden cut to background).
- **Ears (Tusk scene):** guarded the intro effect against firing twice
  (was audibly playing the round-1 sounds twice on start); "Listen again."
  on a wrong tap now actually replays the target sound; completion VO no
  longer cut by a fixed auto-advance timer; added a success-pulse on a
  correct tap (previously nothing acknowledged it before jumping to the
  reveal); L3's hint glow was applying correctly per computed style but was
  visually imperceptible against the busy art — strengthened to a double
  drop-shadow + animated ring. Swapped in a better-cropped cow reveal image.
- **Tusk completion cue:** removed an actual Ganesha character image that
  faded in and stayed visible over the tusk symbol reveal (per Madhurima:
  show just the tusk fading in, then the symbol). Added a small hop
  animation to the baby bird once happy, and a shared idle "breathe" loop
  to every animal sprite across Eyes/Ears/Tusk and Modak's BeatPlayer items.
- **L1 pulse-repetition (design pass):** per a design review, most L1 hint
  cues (a physical object visibly moving) were looping for the full 8s
  10s→18s window, reading as a mini-demo of the action rather than an
  attention cue. Capped to 2-3 repetitions then settle, everywhere except
  hold-type "ring" affordances (Calm Mooshika, Pond Rock/Lotus — explicitly
  exempt, meant to breathe continuously) and Ears' sound replay (already
  correctly single-shot).
- **Tiered wrong-action feedback (design pass, Symbol Mountain only —
  Sacred Assembly excluded, in-progress elsewhere):** a genuine wrong
  attempt used to be either silently ignored (Bush's vertical swipe, Branch's
  upward pull) or get one generic "try again" line forever. New rule, per
  distinct error type: 1st occurrence → physical feedback + a short
  corrective VO specific to what went wrong; 2nd → physical feedback only;
  3rd → physical feedback + re-shown gesture demo + the VO again. Applied to
  Bush (wrong-direction vs. too-short, tracked separately), Branch
  (wrong-direction vs. released-early), Calm Mooshika and Pond Rock/Lotus
  (released-early). Drag mechanics (Marsh/Reeds/Garland) and tap mechanics
  (Eyes/Ears) were left as-is per the same review — snap-back/wobble is
  already sufficient feedback there.

**Open:**
- Sacred Assembly: hearts-progress-bar → 8-slot symbol-progress-row swap,
  sparkle-burst removal, and Ganesha-character removal were implemented and
  build-verified earlier in this session, but the file is being edited
  concurrently elsewhere — by the time of this entry `SacredAssemblySceneV8.jsx`
  matches HEAD exactly (git status: unmodified), meaning those three JSX
  changes did not survive and need to be redone once the concurrent edit
  settles. The `SacredAssemblyScene.css` L1-pulse-cap fix (unrelated, from
  the design-pass item above) did survive and is included in this commit.
- Two flagged items still need Madhurima's input, not code: About Me Hut
  Dreams-and-Wishes "no answer stuck-safe-spot" hint clarity, and a Tusk flow
  content edit (an old "obstacle overview" VO line playing before the
  twig-specific line — content call, not touched here).
- Device-tested only via the in-app harness (`game-test.html`) and live
  browser checks this session; no real iOS/Android/laptop pass yet.

## [2026-09-22] — App-level VO cleanup documented and applied
**Touched:** src/lib/components/navigation/CleanProfileSelector.jsx,
src/lib/components/navigation/MooshikaRideTransition.jsx,
src/components/GaneshaIntroStory.jsx,
src/pages/CleanMapZone.jsx,
src/lib/components/zone/ZoneWelcome.jsx,
VO_FLOW.md,
CHANGELOG.md

**Changed:** Applied Madhurima's non-scene VO pass: removed the spoken "Nice choice!" from
profile avatar selection, shortened the Mooshika ride transition to "Hold on tight, {name}!
Let's go!", tightened the intro-story Web Speech lines, changed map unlock VO from
"ready to explore" to "is waiting for you", and removed redundant zone-welcome instruction
copy plus repeated generic "I'm so proud of you" zone-completion praise. Added an app-level /
non-scene VO rule section to `VO_FLOW.md` so future app shell copy stays warm, short, specific,
and non-redundant.

**Verified:** Searched the touched files for the old target phrases (`Nice choice`,
`ready to explore`, `Tap a card to begin`, `I'm so proud of you`, and the older intro/ride
lines); no matches remain in those files. Ran `git diff --check` on the touched implementation
files cleanly.

## [2026-09-21] — Intro story flow simplified and bridge image added
**Touched:** src/components/GaneshaIntroStory.jsx, src/components/GaneshaIntroStory.css, src/App.jsx, public/intro-story/story1-img2-transition.png
**Changed:** Reworked the Ganesha intro story after the welcome video into a shorter five-beat
story flow. Removed the separate `story1-open-pg` / "Meet Ganesha" slide, moved the required
Web Speech unlock onto the first real story image, added the new `story1-img2-transition.png`
bridge artwork, and updated the VO lines to: Parvati made Ganesha with love; Ganesha guarded
the door; something went wrong; Shiva made things right; the family was together again; then
"Now come explore my world." Simplified the presentation by removing permanent captions,
whole-image tap navigation, decorative sparkles, tap puff animation, continuous image floating,
and the old pulsing end screen. The story now uses the image, progress dots, replay VO, back/
next arrows, and a single final "Let's go" button.
**Verified:** Added the new transition image to the intro-story preload list and ran
`npx eslint src/components/GaneshaIntroStory.jsx` cleanly. `npm run build` was attempted; the
sandboxed run hit the known Windows parent-folder `EPERM`, and the escalated Vite build reached
chunk rendering but hung with no new error, so it was stopped.

## [2026-09-21] — Dev test harness: fixed stale Sarvakaryeshu VO script, added Scene 4 full-scene entry
**Touched:** src/dev/webSpeechScripts.js, src/dev/GameTestHarness.jsx
**Changed:** While live-testing Scene 4 (Sarvakaryeshu) in the game-test harness, the spoken
"real audio" lines didn't match what's on screen or what the live scene actually says — traced
to `src/dev/webSpeechScripts.js` (the harness's standalone TTS script, kept separately from each
scene's own `playGuidanceVoice` map for "real audio" test mode) having a stale, out-of-date copy
of the `sarvakaryeshu-chant` lines (old "painting splat / Trunk" situations instead of the
current "So much to do... / Mooshika" ones). Re-synced that whole section to match
`SarvakaryeshuChantSimplified.jsx`'s current local map exactly, and dropped the dead
`scene13_meaning`/`scene14_meaning` keys that no longer exist in production. Verified live —
harness audio now matches the on-screen situation text.
Also added a proper `isScene` entry (`sr-sarvakaryeshu`) to `GameTestHarness.jsx` so Scene 4 can
be tested end-to-end (opening modal → both mini-games → completion) the same way Scenes 1, 2,
and 5 already can — previously only the two standalone mini-games were wired in, with no way to
exercise the full scene wrapper. Verified live: opening modal renders correctly.
Added Scene 3 (`sr-nirvighnam` → `nirvighnam-chant`) the same way, per Madhurima's follow-up ask
— verified live, opening modal renders correctly. All 5 Shloka River scenes now have full-scene
harness entries.
**Open:** None — full-scene coverage now matches all 5 live Shloka River scenes.

## [2026-09-21] — Global VO format locked and Shloka/Symbol VO pass marked complete
**Touched:** VO_FLOW.md, CHANGELOG.md

**Changed:** Locked the global future-scene VO format in `VO_FLOW.md` so the source of truth is:

1. Opening modal VO.
2. Scene-start instruction VO using **what + why + action**.
3. Hint / idle VO only when needed, keeping useful element-specific hints.
4. One success VO per mini-scene beat.
5. One reveal-card affirmation / “Say it with me” VO.
6. One final fireworks VO for the full scene.

Also documented the negative rules from the current pass: no generic second gameplay intro between
the opening modal and the first task prompt, no dictionary-style spoken “X means…” line after
success unless explicitly approved, and no VO in completion modals.

**Status:** The current VO tightening pass is now marked complete across Symbol Mountain, Shloka
River Scenes 1–5, and the About Me Hut opening-modal pass. Scene-specific changes from this pass
remain documented below in the 2026-09-20/2026-09-21 entries.

## [2026-09-21] — Shloka River Finale (Scene 5) final-fireworks line updated
**Touched:** src/lib/config/content/voiceGuidance.js
**Changed:** Madhurima reviewed Scene 5 (Shloka River Finale) end to end — opening, arrange-start,
hints, success, and recap-start lines were all approved as-is, no changes. Only the final
fireworks/celebration line was updated per her note that "all eight words travel with you" reads
poetic but abstract for a child: `finalCelebration` now reads "You remembered the whole Ganesha
Shloka. Now you can carry it with you." Confirmed this is the only copy of that line in the
codebase (no local scene override), and that `ShlokaRiverFinale.jsx` reads it via the shared
`finalCelebration` key.
**Open:** Not yet live-tested; text-only change to an already-wired VO key.

## [2026-09-21] — Modak Game 2 entry VO trimmed to one line, GameStateManager crash fix
**Touched:** src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx,
src/zones/symbol-mountain/scenes/modak/FlowerJourneyGame2.jsx,
src/lib/services/GameStateManager.js
**Changed:**
- **Modak Game 2 VO:** Madhurima flagged (via live playtest) that 2-3 VO lines were playing
  back to back when Game 2 (Flower Journey: bush → branch → marsh) started, one of which
  ("Guide Mooshika from safe spot to safe spot") got misheard as unrelated. Traced it to 3
  separate lines firing in sequence: the parent scene's `mudStart` line (played right after the
  Mooshika reveal card, itself wrongly describing "mud" when the first challenge is the bush),
  then `FlowerJourneyGame2`'s own generic `VO.open` ("Mooshika has more challenges ahead..."),
  then the actual `bushStart` instruction. Per Madhurima's fix: each challenge should open
  directly on what's-happening → why it matters → action, with no separate transition line.
  Removed `mudStart` (call site + dead VO/moment entries) from `NewModakSceneV7.jsx` and removed
  `VO.open` from `FlowerJourneyGame2.jsx` — Game 2 now starts straight on `bushStart`, matching
  the already-correct `branchStart`/marsh lines. Verified live in the game-test harness
  (`sm-modak-game2`) by patching `speechSynthesis.speak` to log every utterance — confirmed
  exactly one VO fires on entry.
- **Branch VO bug found + fixed during that same live test:** the branch challenge's instruction
  line ("Two flowers are too high for Mooshika. Pull the branch down.") was never playing —
  only the generic idle hint fired, ~15-20s later. Root cause: the intro effect in
  `FlowerJourneyGame2.jsx` used `branchIntroFailed` (a state var) both as its own dependency and
  as something it set mid-flight; `setBranchIntroFailed(true)` triggered a re-render that
  re-ran/cancelled the effect before its `speakAsync(VO.branchStart)` call, self-cancelling every
  time. Fixed by guarding with a `branchIntroStartedRef` instead, dropping `branchIntroFailed`
  from the dependency array. Reverified live — the branch line now plays correctly.
- **GameStateManager crash fix:** live-tested Pond completion in the game-test harness and hit
  an uncaught `TypeError: Cannot read properties of undefined (reading 'symbol-mountain')` in
  `unlockNextScene()` — a saved `_gameProgress` object in localStorage was missing its `zones`
  key (stale/partial progress data), and the function read `progress.zones[zoneId]` without a
  guard. Made it self-heal: fills in any missing `zones`/zone/scene entries instead of crashing,
  both for the next-scene-in-zone path and the next-zone-unlock path.
**Open:** Modak Game 2 entry VO and the branch-line fix both confirmed live in-browser this
session. GameStateManager fix verified by code read + lint only — not yet re-triggered live.
Madhurima to spot-check the full Game 2 flow (bush → branch → marsh) and the completion/
auto-unlock path in her own browser when convenient.

## [2026-09-20] — Shortened opening-modal VO and locked future-scene VO format
**Touched:** src/lib/config/content/openingModals.js,
src/lib/config/content/voiceGuidance.js,
src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx,
src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx,
src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx,
src/zones/shloka-river/scenes/Scene2/SuryakotiBankSimplified.jsx,
src/zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx,
src/zones/shloka-river/scenes/scene4/SarvakaryeshuChantSimplified.jsx,
src/zones/about-me-hut/indian-story/MyIndianStoryGame.jsx,
src/zones/about-me-hut/food/Favoritefoodgame.jsx,
src/zones/about-me-hut/enjoy/ObstacleRemoverGame.jsx,
VO_FLOW.md

**Changed:** Applied Madhurima's shortened opening-modal VO pass across the active Symbol
Mountain, Shloka River, and About Me Hut scenes. Kept the story function intact, but made the
modal VO shorter and cleaner:

- Symbol Mountain
  - Modak: "Mooshika has a journey ahead. Let’s help him."
  - Pond: "The lotus needs water to bloom. Let’s help the water reach it."
  - Eyes / Ears / Tusk: "Let’s look, listen, and find what can help."
  - Final Symbol Challenge: "You found all eight symbols. Let’s see what you remember."
- Shloka River
  - Vakratunda Grove: "Our river friends need a way across. Let’s help."
  - Suryakoti Bank: "The river is dark. Let’s bring back some light."
  - Nirvighnam Chant: "The way ahead is tricky. Let’s help our friends through."
  - Sarvakaryeshu Chant: "Let’s see where Ganesha is with you today."
  - Shloka River Finale: "You found all eight words. Now let’s put them together."
- About Me Hut
  - My Indian Story: "Let’s explore my India story, then yours."
  - Family Tree: "Let’s meet my family, then make your family tree."
  - Favorite Food: "Let’s find my favorites, then yours."
  - Dreams & Wishes: "I have a few wishes for the world. Will you help?"

Also removed the duplicate config-level `voiceover` from Symbol Mountain `final-scene`, leaving
that scene with one opening VO source (`openingModalPrompt`) instead of both shared modal config
and scene-level VO. This avoids the final challenge being double-wired.

**Future scene VO format:** The first voiceover belongs in the opening modal. When the scene
begins, it starts with instructions. There is one success voiceover and one affirmation, and
then there is the final scene voiceover. There is no voiceover in the completion modal.

**Follow-up Pond VO lock:** Updated the live Pond scene to the final shorter "why + action"
set: rock start/idle, flowers start/idle, trunk success ("The water reached the lotus."),
lotus start/idle, lotus success ("The lotus bloomed, even in the muddy pond."), and the same
final fireworks VO ("You used strength, then gentleness, and helped the lotus bloom.").

**Follow-up Modak VO lock:** Applied the 3-game Modak tightening pass. Game 1 now says
"Mooshika’s thoughts keep jumping around. Press and hold to help him focus." Game 2 now
combines the tree setup/action into "Two flowers are too high for Mooshika. Pull the branch
down." with idle "Keep holding the branch," and the separate Big Belly meaning VO was removed
so "You made it! All six flowers." goes directly into "I can have lots of feelings and keep
going." Game 3 now starts garland-making with "You found all six flowers. Tap them to make a
garland for Ganesha," and combines the garland offering + Modak reveal into "You brought the
garland to Ganesha — and look, a sweet Modak!"

**Follow-up Shloka River Scene 1 lock:** Updated Vakratunda Grove to the final Scene 1 VO.
Vakratunda start is now "Frog’s way to his family is blocked. Drag Frog to find another way."
The local and shared Vakratunda success line both stay on "Vakratunda! You found another way,
and Frog reached his family" instead of the shared-config curved-trunk alternative. Removed the
reveal-card `meaningKey` wiring for Vakratunda/Mahakaay so the flow is success VO → affirmation
VO, with no separate literal meaning VO between them.

**Follow-up Shloka River success/meaning VO lock:** Locked all 8 Shloka River word success lines to the tighter success VO → affirmation VO structure. Updated success text for Vakratunda, Suryakoti, Samaprabha, Nirvighnam, Kuru Me Deva, Sarvakaryeshu, and Sarvada to the story-beat lines Madhurima approved; Mahakaay already matched. Removed remaining live reveal `meaningKey` wiring and unused local/shared spoken meaning entries (`... means ...`) from Scenes 2–4, so literal Sanskrit meanings stay in card/sidebar/text instead of playing as separate VO. Dropped the extra Sarvada reflection-line path by leaving only success → affirmation, with the scene fireworks VO handling final wrap.

**Follow-up Shloka River Scene 2 lock:** Updated Suryakoti Bank to the final shorter VO + hint set.
Suryakoti now starts with "Bunny can’t find home. Rub the glow to bring back the light," uses
"Rub the glowing spot" / "Keep rubbing" as hints, and closes with "Suryakoti! You brought
back the light and helped Bunny home" → "I can find hope inside me." Samaprabha now starts
with "A little deer sees a strange shadow. Move the light and look closely," uses "Move the
light and look closely" / "Look again — what is really there?" as hints, and closes with
"Samaprabha! You looked closely and helped Deer feel safe" → "I can see what is really
there." The Scene 2 fireworks VO remains "You brought back the light and saw what was really
there."

**Follow-up Shloka River Scene 3 lock:** Updated Nirvighnam Chant to the final tighter
what/why/action structure while keeping the existing element-specific hints. Nirvighnam now
starts with "Turtle’s way home is blocked. Press and hold the rock to move it," keeps
"Something’s still blocking Turtle’s way" plus the rock/branch/reed-specific hint lines, and
closes with "Nirvighnam! You cleared the way and helped Turtle through" → "I can solve one
thing at a time." Kuru Me Deva now starts with "Baby Beaver is across the broken bridge.
Press and hold to lift the logs and help rebuild it," keeps the logs/rope helper hints, and
closes with "Kuru Me Deva! You asked for help and finished the bridge" → "I can ask for help
when I need it." Scene 3 fireworks VO is now "You cleared the path and asked for help when
things got hard."

**Follow-up Shloka River Scene 4 lock:** Updated Sarvakaryeshu + Sarvada to the final VO and
symbol-choice set. Sarvakaryeshu now uses the new four task cards from Downloads:
Mooshika/start-small, Eyes/focus, Trunk/strength+gentleness, and Tusk/broken-but-useful. The
decoys are the approved plausible sets: Mooshika vs Modak/Eyes, Eyes vs Mooshika/Ears, Trunk
vs Tusk/Mooshika, and Tusk vs Modak/Trunk. Updated all task prompts, after-success lines,
wrong-choice VO, Sarvakaryeshu success/affirmation, Sarvada day prompts, Sarvada success/
affirmation, and the final fireworks VO ("From morning to night, Ganesha was with you.").

**Open:** Build was attempted. The sandboxed build failed with the known Windows `EPERM`
parent-folder issue; the escalated build passed transform and reached chunk rendering, then
hung for several minutes with no new error, so it was stopped. Targeted text scans confirmed
the old long opening-modal lines are gone from the active opening spots.

## [2026-09-20] — Pond water-flow visual redesign + Shloka River success/meaning/affirmation VO cleanup
**Touched:** src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx,
src/zones/symbol-mountain/scenes/pond/PondScene.css,
src/lib/config/content/voiceGuidance.js,
src/zones/shloka-river/scenes/Scene2/SuryakotiBankSimplified.jsx,
src/zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx,
src/zones/shloka-river/scenes/scene4/SarvakaryeshuChantSimplified.jsx,
src/zones/shloka-river/scenes/scene4/SarvadaGame.jsx
**Changed:**
- **Pond water flow:** the water-reaching-the-lotus visual looked wrong in two ways — it
  reached the lotus instantly even when only the rock (not the flowers) was cleared, and the
  glint effect looked scattered rather than like water. Iterated through a few CSS approaches
  (percentage-travel glints, then a tiled-SVG wave-band background) before landing on a single
  non-repeating `linear-gradient` sweep anchored to the previously-unused `pondLayout.water`
  coordinate, gated by a `--blocked`/`--flowing` width modifier so it stops short until the
  flowers are cleared. The tiled-SVG version had rendered as 3 disconnected blobs because
  `background-repeat: repeat-x` stamped a 160px tile multiple times across the wider box —
  fixed by dropping tiling entirely.
- Also fixed two Pond gameplay bugs found while relaying out the scene: flowers/pebbles were
  unmounting (vanishing) instead of settling in place after being swept aside, and the
  invisible flower-swipe hit-zone had gone out of alignment with the visible flower art after
  a coordinate update — both now correct. Removed two now-dead "meaning" VO lines
  (`waterPathPower`/`lotusBloomPower`) that were playing between the success moment and the
  reveal card's affirmation — see below, same fix applied scene-wide.
- **Shloka River VO flow:** Madhurima flagged that symbol success felt "stitched together"
  rather than like one natural line — investigation found each of the 8 words playing up to 3
  VO beats back to back (Sanskrit word pronunciation → a generic success sentence → in one
  live case, `SarvadaGame.jsx`, a *third* separate dictionary-style "meaning" line — e.g.
  "Sarvada means always" — before handing off to the card's affirmation VO). Fixed per
  Madhurima's new pattern: one success line with the literal meaning folded naturally into the
  sentence (e.g. "Vakratunda! You found another way — just like Ganesha's curved trunk."),
  followed directly by the affirmation — no separate glossary-style meaning line. Updated the
  live success-line text for all 8 words (Vakratunda, Mahakaya, Suryakoti, Samaprabha,
  Nirvighnam, Kuru Me Deva, Sarvakaryeshu — already matched, Sarvada) and removed the extra
  `scene14_meaning` VO chain in `SarvadaGame.jsx`, which was the only scene actually playing a
  3rd VO live (the other 7 scenes pass an unused `meaningKey` prop into `SymbolAutoReveal`,
  which doesn't read it — dead code, left as-is, not a live 3rd VO).
**Open:** Water-flow fix confirmed via my own browser screenshot; Madhurima to confirm it reads
correctly on her end. Shloka River VO text updated in code but not yet live-tested per scene.

## [2026-09-19] — Sarvakaryeshu distinct in-game opening VO
**Touched:** src/zones/shloka-river/scenes/scene4/SarvakaryeshuChantSimplified.jsx,
src/lib/config/content/voiceGuidance.js, GMB_AUDIT_PUNCHLIST.md
**Changed:** Fixed the minor mismatch flagged in the earlier content pass: the opening-modal
VO ("Let's see where Ganesha is with you today.") and the in-game opening VO ("Let's see
which Ganesha symbol can help.") were both scripted as separate lines, but the scene only had
one `welcome` slot, so gameplay start silently repeated the modal line instead of playing the
second one. Added a new `gameplayIntro` VO key (local map + `voiceGuidance.js`), and gated
`SarvakaryeshuGame`'s `isActive` prop on a new `sarvaIntroReady` state so the child game's own
first-card VO (which fires 500ms after activation) can't cut `gameplayIntro` off mid-sentence.
Falls back to ready-immediately if audio is off, resuming mid-game, or after a 3s timeout so a
VO failure can't soft-lock the scene.
**Open:** Not yet live-tested in-browser.

## [2026-09-19] — Modak Big Belly emotion redesign (3 new success-beat emojis)
**Touched:** src/zones/symbol-mountain/scenes/modak/FlowerJourneyGame2.jsx,
src/zones/symbol-mountain/scenes/modak/assets/images/emotion-pleased-game3.{png,webp},
src/zones/symbol-mountain/scenes/modak/assets/images/emotion-excited-game3.{png,webp},
src/zones/symbol-mountain/scenes/modak/assets/images/emotion-relieved-game3.{png,webp},
TASKS.md
**Changed:** Madhurima's redesign note: Mooshika's Big Belly challenges (leaves/branch/marsh)
should read as "hard feeling → success feeling → next challenge," not "get rid of the bad
feeling" — the game previously cleared the emotion to neutral the instant a challenge was
solved, with no beat to feel the positive outcome. Sourced 3 new emoji assets from Madhurima
(iterated live on style — compared a plain "excited" vs. one with hands-together "pleased" vs.
a brand-new "relieved" exhale pose — kept the more distinct-from-existing-"happy" option for
each), downscaled from ~1MB/1254px PNGs to the existing 500px/~15-20KB webp convention via
ffmpeg. Wired `setEmotion('pleased'|'excited'|'relieved')` for ~700-900ms after each challenge
succeeds, before clearing and advancing — leaves→pleased, branch→excited, marsh→relieved
(replaces the plan to reuse `happy`, which is reserved for the modak-reveal ending). The
"during" struggle emotions (angry/sad/worried) and the existing belly-reflection VO/meaning/
affirmation text were already correct — not touched. See TASKS.md T58.
**Open:** Branch and marsh full-success beats need a sustained ~900ms press-hold to trigger —
couldn't be automated in the browser-testing tooling used this session (no mousedown-wait-
mouseup primitive), so only verified by code review + confirming the assets load cleanly.
Recommend a manual playthrough to confirm timing feels right, not just functionally correct.

## [2026-09-19] — Symbol Mountain Pond (Trunk + Lotus) final VO/content pass + dead-code cleanup
**Touched:** src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx,
src/zones/symbol-mountain/shared/components/symbolCardContent.js,
src/lib/config/content/openingModals.js,
src/lib/config/content/completionModals.js,
src/lib/config/content/discoveryContent.js,
TASKS.md
**Changed:** Applied Madhurima's finalized Trunk + Lotus script — opening modal, gameplay hint
VO (rock/flowers), meaning VO, affirmations, sidebar Ganesha lines/invitation/gift, and
completion modal. Renamed all child-facing "reeds" wording to "flowers" (the live hint bubble
text, the drag-zone `aria-label`, and the VO lines) while leaving internal names (`reedsRound`,
`REEDS_ACTIVE`, `pond-trunk-reeds`, etc.) untouched per instruction, to avoid unnecessary code
churn. Removed `powerConfig` and `discoveryConfig` — two unused config objects still holding
the retired "Divine Blessing"/"Sacred Purity" labels; confirmed zero references anywhere else
in the file before deleting. Found and fixed 2 real content-wiring gaps in the same pass: the
Lotus "success" VO line and both Trunk/Lotus "meaning" VO lines existed as content but had no
live trigger on a normal playthrough (meaning was only reachable via a narrow audio-toggle
edge case) — added a new `lotusBloomed` key and wired `speakPondPrompt` calls at the actual
reveal-card moments so all of it plays automatically now. See TASKS.md T59.
**Open:** Not yet re-verified in-browser after this pass (Kuru Me Deva/Modak testing took
priority this session) — recommend a playthrough before considering this fully closed.

## [2026-09-19] — Kuru Me Deva & Nirvighnam granular hint VO (T53/T57 fix)
**Touched:** src/zones/shloka-river/scenes/Scene3/NirvighnamGame.jsx,
src/zones/shloka-river/scenes/Scene3/KurumedevaGame.jsx,
src/zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx,
src/zones/shloka-river/scenes/Scene2/components/SamaprabhaGame.jsx,
TASKS.md
**Changed:** Closed the game-logic gap flagged (but deliberately not fixed) in the same day's
earlier Shloka River content pass. `NirvighnamGame.jsx` gained a level-3 "keep going"
idle-progress hint per obstacle (`nirv_hint_keep_stone/branch/reed` — "Keep holding," "Drag
the branch aside," "Swipe the reeds apart"), mirroring the rub/keep pattern already used in
Suryakoti Bank. `KurumedevaGame.jsx` gained 5 new `playSceneLine` calls per helper round (logs
and rope): a round-start prompt, a fail line after the timed hold, an idle "who can help"
hint, an escalated "drag the help bubble to X" hint, and an after-help confirmation line —
previously only `kuru_done` (the final success line) was wired to any voice line at all, so
all of this copy existed in content only. Added the matching keys to
`NirvighnamChantSimplified.jsx`'s local `webSpeechMap`. Also gave `SamaprabhaGame.jsx` its
missing level-3 "Move the light and look closely" escalation (previously capped at level 2,
"Look closely").
**Open:** Verified in-browser that the Kuru Me Deva phase renders cleanly with the new hooks
active (no console errors, round-intro VO fires on phase entry) but could not click-test the
specific timed press-and-hold beats (logs fail, rope fail) — the automation tooling has no
way to hold a pointer down for a set duration. Recommend a manual playthrough of both helper
rounds.

## [2026-09-19] — Shloka River final VO/content pass (all 5 scenes)
**Touched:** src/lib/config/content/openingModals.js,
src/lib/config/content/completionModals.js,
src/lib/config/content/voiceGuidance.js,
src/lib/config/content/discoveryContent.js,
src/zones/shloka-river/shared/components/chantCardContent.js,
src/zones/shloka-river/scenes/Scene2/SuryakotiBankSimplified.jsx,
src/zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx,
src/zones/shloka-river/scenes/scene4/SarvakaryeshuChantSimplified.jsx,
src/zones/shloka-river/scenes/scene4/SarvadaGame.jsx,
TASKS.md
**Changed:** Applied Madhurima's finalized script pass across all 5 live Shloka
River scenes — Suryakoti Bank, Nirvighnam Chant, Sarvakaryeshu/Sarvada, and the
Shloka River Finale (Vakratunda Grove content had already landed in an earlier
session). Every layer of content is now final and wired into the live path:
1. Opening modal — title, subtitle, and opening VO for each scene.
2. Closing/completion modal — title and subtitle for each scene's win screen.
3. Sidebar content (chantCardContent.js) — Ganesha Line 1 & 2, invitation, and
   gift text for all 8 shloka words.
4. Affirmations — the auto-reveal "I ..." affirmation for all 8 words
   (discoveryContent.js).
5. Voiceover — welcome/opening lines, in-game intros, gameplay hints, success
   lines, and meaning lines for every word, rewired through voiceGuidance.js
   and each scene's local VO fallback map where one exists.
6. Fireworks/finale VO — the finale's `finalCelebration` orbs/fireworks line
   ("You remembered the whole Ganesha Shloka...").
**Open:**
- T53 (new, in TASKS.md): Nirvighnam Chant's per-obstacle hint VO now plays
  (fixed a real gap — `nirv_hint_stone/branch/reed` had no content before this
  pass), but the finer idle-progress tier ("Keep holding," "Keep rubbing") and
  all of Kuru Me Deva's per-step hints (logs vs. rope, before/after
  Elephant/Monkey) are copy-only — the game components don't yet fire
  `playSceneLine` at those points. Needs new calls added inside
  `NirvighnamGame.jsx` / `KurumedevaGame.jsx`, not just content. Deferred,
  scoped for later.
- Sarvakaryeshu's "In-Game Opening VO" line ("Let's see which Ganesha symbol
  can help.") has no dedicated slot in the current wiring — the scene reuses
  the single `welcome` key for both the opening-modal VO and phase entry, so
  the opening-modal line was kept there instead. Minor, not blocking.

## [2026-09-19] — About Me Hut final VO/content pass + Ganesha host presentation
**Touched:** src/lib/config/content/openingModals.js,
src/lib/config/content/completionModals.js,
src/lib/config/content/voiceGuidance.js,
src/zones/about-me-hut/family-tree/Familytreegame.jsx,
src/zones/about-me-hut/food/Favoritefoodgame.jsx,
src/zones/about-me-hut/enjoy/ObstacleRemoverGame.jsx,
src/zones/about-me-hut/indian-story/MyIndianStoryGame.jsx,
src/zones/about-me-hut/components/AboutMeGaneshaHost.jsx,
src/zones/about-me-hut/components/AboutMeGaneshaHost.css
**Changed:** Applied the final Lambodara Lodge / About Me Hut script pass across
the four current scenes.
1. Opening modal content now carries the opening VO line alongside title,
   subtitle, button, icons, and character metadata for Our Families, Our
   Favorite Things, Our Wishes & Dreams, and My Indian Story.
2. Closing modal subtitles were aligned to the final sheet: family-story copy
   for Our Families, "learned a little more" for Favorite Things, existing
   dream-special copy for Wishes & Dreams, and "Families can connect to India
   in many different ways" for My Indian Story.
3. Scene VO constants were updated to the final wording: softer Favorite
   Things prompts, revised Wishes & Dreams food/dream-cloud lines, My Indian
   Story festival/comparison wording, and Family Tree relationship reveals
   ("This is my father, Shiva", etc.).
4. Final completion-modal VO is now intentionally silent where the script says
   "Closing VO: None" by guarding empty completion VO strings.
5. Added reusable `AboutMeGaneshaHost` presentation component and placed baby
   Ganesha as an in-scene host on Favorite Things choice screens, Wishes &
   Dreams wish screens, and My Indian Story map/language/festival phases.
   This keeps the existing GestureDemo/GaneshaGestureCue/idle-hint/sparkle
   systems intact while making Ganesha visually present during the active
   tasks.
**Open:** Not build-verified or visually verified in-browser yet. Current
working tree also includes pre-existing unrelated dirty docs/CSS from earlier
passes; commit staging should be path-scoped.

## [2026-09-18] — Shared-layer audio fixes from checklist review
**Touched:** src/lib/hooks/useVoiceGuidance.js, src/lib/audio/SoundManager.js,
src/lib/components/celebration/SceneCompletionCelebration.jsx
**Changed:** Review of GMB_SCENE_LAUNCH_CHECKLIST.md against the shared layers
(not the 13 scene files) found bugs the per-scene sweeps could not see. Fixed 4:
0. `SceneCompletionCelebration` — no double-tap guard on any action button; a
   fast second tap on the next-scene pill during the 700ms exit animation
   queued a second `onComplete` + navigation. Added `actionLockRef` (mirrors
   HomeButton's `isNavigating`): first action wins, lock resets when `show`
   flips back on. Covers next-scene pill, Home, Play Again, and primaryAction.
1. `useVoiceGuidance` — the 2s tab-return replay timer was a bare setTimeout,
   never cleared on stop/unmount, so a quick Home tap after returning to the
   tab let the old scene's VO start over Zone Welcome. Now tracked in
   `replayTimeoutRef`, cleared by `stopVoice()` and on unmount (pending/
   interrupted refs also nulled on unmount).
2. `useVoiceGuidance` — TTS fallback path left `voiceRef` null, so `handleHide`
   never cancelled speech nor stored it for replay; TTS kept talking in a hidden
   tab and its onend advanced the phase while hidden. Added `ttsUtteranceRef`;
   hide/stop now detach onend/onerror before `speechSynthesis.cancel()` and the
   interrupted line is stored for the normal replay-on-return.
3. `SoundManager.getCtx()` — only resumed a `suspended` AudioContext; iOS Safari
   reports `interrupted` after Siri/phone-call/Control Center, with no
   visibilitychange, so all Web Audio SFX stayed silent until reload. Now
   resumes on either state.
Build-verified (`vite build` clean). Lint: 1 pre-existing error (`sfxRef`
unused) and 1 pre-existing hook-deps warning in useVoiceGuidance.js, not
introduced here. Committed on `staging`.
**Open:** Step 4 resolved by Madhurima — replay always starts fresh, map/ZoneWelcome
keep showing done; verified that is already the behaviour, so the Continue-clears-
next-scene `_state` item is downgraded to internal inconsistency, no child-visible
effect, no change. Step 5 done — see next entry. Full findings + checklist gaps
list in the session transcript, not yet folded into GMB_AUDIT_PUNCHLIST.md.

## [2026-09-18] — DEV-gate console output in the 3 shared files the scene sweeps missed
**Touched:** src/App.jsx, src/lib/services/GameStateManager.js,
src/lib/services/ProgressManager.jsx
**Changed:** The "no ungated console.log" checklist rule was applied to the 13
scene files but never to the shared app/state layer. Prefixed every line-start
`console.log/warn/debug(` with `if (import.meta.env.DEV)` via a one-off script
(App.jsx 61, GameStateManager.js 52, ProgressManager.jsx 12) and hand-gated the
2 mid-line calls in App.jsx's next-scene preloader (:595-596). The 10 remaining
matches in App.jsx are inside commented-out code blocks (:732, :951, :1031,
:1837) and were correctly left alone. `console.error` untouched by design.
Side benefit: `GameStateManager.saveGameState`'s `new Error().stack` caller
trace (:395-410) now only runs in dev instead of on every progress write.
No behaviour change. Build-verified. Pushed to `origin/staging` (merge `6bcd5b1`).
**Open:** Live-browser pass (checklist §17) still to run.

## [2026-09-18] — Celebration re-save dedupe + tab-hide TTS safety in 3 direct-speech mini-games
**Touched:** src/lib/components/celebration/SceneCompletionCelebration.jsx,
src/zones/symbol-mountain/scenes/modak/GarlandGame3.jsx,
src/zones/symbol-mountain/scenes/modak/FlowerJourneyGame2.jsx,
src/zones/symbol-mountain/scenes/tusk/EarsSoundMatchGame.jsx
**Changed:**
1. `SceneCompletionCelebration` — the temp-session stamp + permanent
   `GameStateManager.saveGameState` effect keyed on `completionData` identity;
   11 of 13 scenes pass it as an inline object literal, so it re-ran on every
   parent re-render while the modal was open. Now dedupes on
   `JSON.stringify(completionData)` per show cycle (reset when `show` flips
   off). Same semantics, one write per distinct payload.
2. Garland / Flower Journey / Ears — these three live mini-games call
   `window.speechSynthesis` directly, bypassing `useVoiceGuidance`, so the
   earlier tab-hide fix in the hook didn't cover them. Each now uses
   `useAppVisibility`: on hide, cancel speech and remember the interrupted
   line; on return, re-speak it from the start after 2s (matches the hook);
   pending replay cleared on unmount. Flower Journey's `speakAsync` (awaited by
   its story-beat sequences) detaches onend/onerror BEFORE cancel so the beat
   doesn't advance while hidden, and resolves the same promise after the
   replay so the sequence continues naturally. Unmount deliberately does NOT
   call `cancel()` — the parent scene may have just started its next VO line in
   the same commit; scene navigation teardown already cancels globally.
   `TuskPathGame.jsx` also speaks directly but is not imported by the live
   Tusk scene (`TuskBeatPlayerLive` is) — left alone.
Build-verified. Lint: only pre-existing errors/warnings remain in these files.
**Open:** Not committed yet. Modal-open (`isPaused`) pause still doesn't stop
these games' TTS — only tab-hide is covered; scope for a later pass.

## [2026-09-18] — Tusk zone: Ganesha gesture cue was dead code, fixed
**Touched:** src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx
**Changed:** Follow-up to "does sparkle + Ganesha gesture show on completion"
check across all 13 live scenes. 10 of 13 already correctly fire both
together via the shared `useMiniGesture`/`GaneshaGestureCue`. The two
"finale" scenes (SacredAssemblySceneV8, ShlokaRiverFinale) intentionally skip
the small per-round gesture in favor of their bigger end-of-zone
`SceneCompletionCelebration` + fireworks (which has its own Ganesha pose) —
confirmed as by-design, not a gap.
Found a real bug in the Tusk zone (Eyes/Ears/Tusk mini-games):
`triggerMiniGesture(...)` was called 5 times (on eyes-complete, ears-complete,
tusk-reveal) into a local hand-rolled `miniGesture` state — but that state was
never rendered anywhere in the file. The shared `GaneshaGestureCue` import
was even commented out ("inline gesture used") but no inline render existed
either — confirmed dead via ESLint flagging `miniGesture` as unused. Sparkles
fired correctly on these moments; Ganesha's gesture never did.
Fix: replaced the local state/callback with the real shared `useMiniGesture`
hook + `GaneshaGestureCue` component (same pattern as every other live
scene), converted all 5 call sites to the shared `(type, position,
durationMs)` signature — `victory` for tusk/ears-complete, `ok` for the
eyes→ears and ears→tusk transitions (the icons already chosen, hand-victory/
hand-ok, map 1:1 to the shared component's icon set) — and removed the
now-orphaned icon-path constants and manual timer cleanup.
**Open:** Not yet visually verified in-browser — Madhurima should spot-check
the Eyes/Ears/Tusk completions next playthrough.

## [2026-09-18] — Voice-mute clarity + ShlokaRiverFinale replay button
**Touched:** src/lib/components/ui/AudioToggle/AudioToggle.jsx,
src/zones/shloka-river/scenes/scene5/ShlokaRiverFinale.jsx
**Changed:** Follow-up to "check mute/replay across all 13 scenes." Findings:
`AudioToggle` (mute) present and correctly wired in all 13; `VOReplayButton`
present in 12 of 13, missing entirely from `ShlokaRiverFinale`. Also found
mute only ever silences narration/music, never SFX (`useVoiceGuidance.js`'s
`playSfx` and `AudioService.js` have no mute-awareness at all, by an existing
deliberate comment — "always full volume — game audio, never muted by
toggle"). Discussed with Madhurima: since this app-wide mute button lives
in-game specifically for repeat players skipping narration they've already
heard (not a general "silence everything" control, and there's no separate
parent-settings mute), decided to keep it **voice-only** — muting SFX too
would flatten the fun feedback loop (taps/chimes/sparkles) that makes replay
still enjoyable. No SFX-gating code changed as a result.
What WAS changed:
1. `AudioToggle.jsx` — the icon is a generic speaker/soundwave glyph and the
   old labels ("Mute" / "Turn off sound") implied a whole-app mute, which
   doesn't match the actual voice-only behavior. Relabeled aria-label/title
   to "Turn off voice narration" / "Turn off voice", and added a doc comment
   explaining the voice-only decision so a future pass doesn't "fix" this
   into muting SFX by mistake.
2. `ShlokaRiverFinale.jsx` — added the missing `VOReplayButton`, wired to a
   new `replayCurrentVoice` callback that maps each of the scene's 6 phases
   (INITIAL/ARRANGE/SUCCESS/RECAP/FINALE/COMPLETE) to its correct VO line,
   matching the "one replay button per scene" pattern used everywhere else.
   RECAP replays just its intro line rather than restarting the full
   word-by-word shloka sequence (which has its own completion timers already
   running — re-firing it risked overlapping audio and duplicate finale
   transitions).
**Open:** Not yet visually verified in-browser. A future ask could be a
"voice on by default" preference in Parent Dashboard for first launch,
without removing the in-scene toggle — discussed but not built.

## [2026-09-18] — Idle-hint timing fix + orphan file cleanup
**Touched:** src/zones/shloka-river/scenes/scene5/ShlokaRiverFinale.jsx
**Deleted:** src/zones/about-me-hut/enjoy/Wish2PlateDropGame.jsx (orphan duplicate)
**Changed:** Follow-up to the idle-hint audit two entries below — fixed the
two remaining flagged inconsistencies (the third, VakratundaRescueGame's
failed-attempt-triggered model, is confirmed intentional by Madhurima and
left as-is):
1. `ShlokaRiverFinale`'s hint ladder escalated at 20s/35s instead of the
   ~16-18s/24-26s norm used everywhere else in the app — changed to 18000ms/
   26000ms to match.
2. Confirmed via `ObstacleRemoverGame.jsx`'s actual import
   (`./components/Wish2PlateDropGame`) that only the copy under
   `enjoy/components/Wish2PlateDropGame.jsx` is live; the other copy at
   `enjoy/Wish2PlateDropGame.jsx` (last touched 2026-04-20, only referenced
   by dead backup/copy scene files, not by anything in sceneRegistry.js) was
   an orphan duplicate. Verified it was already committed/clean in git
   before deleting, per the "commit before deletion" rule.
**Open:** Not visually verified in-browser.

## [2026-09-18] — 3-level idle-hint audit + fixes: closed every "no hint at all" gap
**Touched:** src/zones/symbol-mountain/scenes/tusk/EyesPopUpGame.jsx,
src/zones/symbol-mountain/scenes/tusk/EyesPopUpGame.css,
src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx,
src/lib/beatPlayer/BeatPlayerGame.jsx (shared engine),
src/lib/beatPlayer/BeatPlayerGame.css,
src/zones/symbol-mountain/scenes/modak/GarlandGame3.jsx,
src/zones/symbol-mountain/scenes/modak/GarlandGame3.css
**Changed:** Audited the "3-level idle hint" ladder (the app-wide pattern of
L1 gentle pulse ~9s → L2 stronger pulse/VO ~16s → L3 most explicit hint
~24s, canonicalized in `useRepeatedHintCycle.js`) across all 13 live scenes
and their mini-games. Most already implement this correctly (either via the
shared hook or a hand-rolled equivalent with the same 9-10s/16-18s/24-26s
timing) — confirmed clean: SuryakotiGame, SamaprabhaGame, NirvighnamGame,
KurumedevaGame, SarvakaryeshuGame, SarvadaGame, Familytreegame,
Favoritefoodgame, ObstacleRemoverGame (4 parallel ladders), MyIndianStoryGame
(3 parallel ladders), Pond, Modak's main phase, Sacred Assembly,
EarsSoundMatchGame (already had a complete replay→text-hint→highlight-target
ladder the first audit pass had missed).
Fixed the genuine "zero guidance if stuck" gaps found in Tusk + Modak:
1. **EyesPopUpGame** (tap, find-the-hidden-object) — had only a single-level
   hint (pulse at 9s, no escalation). Added L2 (~17s: pulse continues + one-
   time VO "Look near the bushes — something is hiding there.") and L3
   (~25s: stronger/faster glow-pulse via new `.hinting-strong` class). Tap
   mechanic, so no gesture demo needed.
2. **BeatPlayerGame** (shared engine behind Tusk's `TuskBeatPlayerLive`,
   drag/hold) — previously only showed its gesture demo for the first 2
   interactive beats, then went completely silent for the rest of the flow.
   Added a real per-beat idle ladder: L1/L2 pulse the interactive item
   (9s/16s, new `.beat-player-hint-pulse`/`.beat-player-hint-strong`
   classes, glow-only so they don't clobber an item's own rotation/flip
   transform), L3 (24s) re-shows the same GestureDemo regardless of beat
   count.
3. **GarlandGame3** (drag the finished garland to Ganesha) — previously a
   single one-shot 6s intro demo with nothing after. Replaced with a real
   ladder: L1 pulse (9s, new `.g3g-hint-pulse`), L2 stronger pulse + one-time
   VO "Carry the garland to Ganesha!" (16s, new `.g3g-hint-strong`), L3
   re-shows the drag demo (24s). Resets on drag start or a failed drop (not
   dropped on Ganesha) so it doesn't immediately nag right after a try.
4. **SymbolMountainSceneV3** — removed the dead `showIdleGestureHint` state:
   it computed a level-3 flag that was never rendered anywhere (no
   `GestureDemo` in that file) — pure cleanup, no behavior change.
**Open — NOT all 13 scenes are fully consistent, only the "zero hint" gaps
are closed:**
- `ShlokaRiverFinale` — its own hint ladder escalates at 20s/35s instead of
  the ~16s/24s norm everywhere else in the app. Not touched this pass.
- `VakratundaRescueGame` — uses a different model entirely (3 failed drag
  attempts trigger the ladder, not idle time). Possibly intentional
  ("frustration"-triggered vs. idle-triggered), left as-is pending a call.
- Two files named `Wish2PlateDropGame.jsx` exist
  (`enjoy/Wish2PlateDropGame.jsx` and the live one at
  `enjoy/components/Wish2PlateDropGame.jsx`) — the orphan hasn't been
  deleted yet.
None of this was visually confirmed in-browser — Madhurima should spot-check
Tusk's Eyes game and Modak's garland-carry step, plus Tusk's beat-player
sub-games generally, on next playthrough.

## [2026-09-18] — GestureDemo coverage pass: every non-tap mini-game now shows its demo at the start
**Touched:** src/lib/beatPlayer/BeatPlayerGame.jsx (shared engine),
src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx,
src/zones/symbol-mountain/scenes/modak/GarlandGame3.jsx,
src/zones/shloka-river/scenes/Scene1/MahakayaRescueGame.jsx,
src/zones/shloka-river/scenes/Scene2/components/SuryakotiGame.jsx,
src/zones/shloka-river/scenes/Scene2/components/SamaprabhaGame.jsx,
src/zones/shloka-river/scenes/Scene3/KurumedevaGame.jsx,
src/zones/shloka-river/scenes/Scene3/NirvighnamGame.jsx,
src/zones/about-me-hut/indian-story/MyIndianStoryGame.jsx,
src/zones/about-me-hut/enjoy/components/Wish2PlateDropGame.jsx,
src/zones/about-me-hut/components/Drawingpad.jsx (shared, used by Favoritefoodgame + ObstacleRemoverGame)
**Changed:** Audited every mini-game across the 13 live scenes for `GestureDemo`
(the "animated hand" tutorial overlay) coverage on non-tap mechanics
(drag/hold/scratch/swipe/pull-down). Madhurima's rule: tap is self-explanatory
so it stays on the idle-hint ladder only; drag/hold/scratch etc. should show
the demo immediately at the start of the mini-game, then back off so it
doesn't repeat forever.
1. **Missing entirely → added:**
   - Tusk's `TuskBeatPlayerLive` (drag, via the shared `BeatPlayerGame` engine)
     had no gesture teaching at all — added a demo derived from each beat's
     `interaction` (drag-drop/rope-drag/press-hold/drag-path/try-fail all map
     to drag or hold), shown only for the **first 2 beats that need input**
     per Madhurima's "let kids get it" note, never again after that.
   - `GarlandGame3` (Modak) — carrying the finished garland to Ganesha is a
     drag; the flower-threading step stays tap-only (matches its own "Tap a
     flower to thread it" VO). Added a drag demo for the carry step only.
   - `Drawingpad.jsx` (shared "draw your dream" component) had zero drawing
     guidance — added a one-time "move your finger to draw" demo that
     dismisses on the first stroke; fixing it once here covers both
     Favoritefoodgame and ObstacleRemoverGame.
   - Confirmed tap-only, nothing to add: Familytreegame (no drag mechanic at
     all), SacredAssemblySceneV8, SarvakaryeshuGame, SarvadaGame,
     ShlokaRiverFinale, EyesPopUpGame, EarsSoundMatchGame.
2. **Idle-only → now also shown at start:**
   - Pond scene (hold-rock / drag-reeds / hold-lotus) was gated on
     `idleHintLevel >= 3` (real idle escalation only) — added an
     `introGesture` flag (same pattern as FlowerJourneyGame2) so each phase's
     demo fires immediately on entry, auto-clears after 6s or on first touch.
   - `KurumedevaGame` was gated on `hintLevel >= 1` — added a per-step
     `kuruIntroGesture` flag for its non-tap hints; its `tap`-type hint stays
     idle-only as intended.
   - `MyIndianStoryGame`'s magnifying-glass drag demo already fired near the
     start (no idle-escalation gate) but waited a flat 1800ms — tightened to
     300ms.
3. **Shown at start but with a multi-second fixed delay → tightened to ~150ms:**
   `MahakayaRescueGame` (drag + pull-down, was 3000ms), `SuryakotiGame`
   (scratch, was 3000ms), `SamaprabhaGame` (drag, was 1000ms),
   `NirvighnamGame` (drag/hold/swipe, was 1000ms), `Wish2PlateDropGame`
   (drag, was 1800ms). Each of these keeps its existing "first encounter
   only" gate and its separate idle-escalation "rescue" demo (`idleDelay=0`)
   for real later idling — only the first-encounter delay changed.
**Open:** None of this was visually confirmed in-browser yet (dev-server
navigation requires playing through onboarding to reach each mini-game) —
Madhurima should spot-check Tusk, Pond, Garland, and the Shloka River
rescue/bank/chant scenes on next playthrough. `npx eslint` run on every
touched file — zero new errors introduced (pre-existing unused-var warnings
in Pond/MyIndianStoryGame are unrelated to this change).

## [2026-09-18] — PNG → WebP conversion pass (13 live scenes + onboarding)
**Touched:** src/App.jsx, src/lib/components/navigation/CleanGameWelcomeScreen.jsx,
src/lib/components/navigation/ParentDashboard.jsx, src/lib/components/navigation/ParentDashboardV1.jsx,
src/lib/components/navigation/ZoneBadgeButton.jsx,
src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx,
src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx,
src/zones/shloka-river/scenes/Scene2/SuryakotiBankSimplified.jsx,
src/zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx,
src/zones/shloka-river/scenes/scene4/SarvakaryeshuChantSimplified.jsx,
src/zones/shloka-river/scenes/scene5/ShlokaRiverFinale.jsx
**Changed:** Audited all `.png` references actually loaded by the 13 live scenes
plus onboarding/navigation chrome (App.jsx, ParentDashboard, ZoneBadgeButton,
CleanGameWelcomeScreen) — excluded the hundreds of PNGs sitting in unused
backup/copy/`VN` scene files and the obsolete Cave of Secrets / parked Festival
Square zones. Converted the 32 still-PNG files actually in use to `.webp` via
`sharp` (quality 90) and updated every import/path to point at the new `.webp`:
- Pond scene assets (pond-bg-fixed, pond-big-rock, pond-pebble, pond-flower)
- 8 shloka symbol icons the live Shloka River scenes pull from
  `src/zones/meaning cave/assets/images/symbols/` — flagged as a dependency on
  the obsolete Cave of Secrets folder, not fixed (out of scope for this pass)
- Onboarding/dashboard icons: zone map icons (modak, vakratunda-grove,
  family-tree), CleanGameWelcomeScreen's 7 "meanings" symbol images,
  ParentDashboard's 8 symbol icons, and 3 ZoneBadgeButton icons
Original `.png` files were left in place (not deleted) as a safety fallback.
**Open:** Cave-of-secrets and Festival Square PNGs left untouched (parked/obsolete,
per CLAUDE.md scope). Old backup/copy scene files still reference `.png` but
aren't in sceneRegistry.js so weren't touched. Consider a follow-up to delete
the now-unused source PNGs once Madhurima confirms the webp swap looks correct
in-browser, and to move the shloka-river symbol icons out of the obsolete
`meaning cave` folder into a proper shared location.

## [2026-09-18] — Pre-reveal sparkle: fixed wrong-glow-color bug, standardized to gold star
**Touched:** src/lib/components/animation/SparkleAnimation.jsx (shared),
src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx,
src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx,
src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx
**Changed:** Madhurima reported "red round sparkles" appearing right before
the SymbolAutoReveal card in the Eyes mini-game (Tusk scene), vs. the correct
yellow star sparkle in Vakratunda.
Root cause found in the SHARED `SparkleAnimation.jsx`/.css component: the
`color` prop is only ever applied to `backgroundColor` - it's never written
to the `--sparkle-color` CSS custom property that `.sparkle-star` and
`.sparkle-magic`'s glow (`box-shadow`) actually read. So the glow silently
falls back to the CSS defaults (gold for star, PURPLE for magic) no matter
what color prop the caller passes. Tusk's eyes/ears-complete-final burst used
`type="magic"` with color="#ffd54f" (gold) - so it rendered as a gold-filled
circle with a purple glow, which read as a muddy reddish blob to the eye.
Fix:
1. SparkleAnimation.jsx now sets `--sparkle-color: color` inline (one-line
   fix), so every sparkle type correctly picks up whatever color prop is
   passed, for every scene that uses it - prevents this class of
   wrong-glow-color bug recurring anywhere else.
2. Standardized the 3 "before SymbolAutoReveal" celebration bursts that were
   using the buggy `type="magic"` to `type="star"` (matching Vakratunda's
   canonical gold star), keeping their existing count/size/duration/color:
   Tusk (eyes-complete-final/ears-complete-final), Modak (mooshika-calm),
   Pond (lotus-wake).
Confirmed already correct, no change needed: Vakratunda Grove (canonical
reference), Suryakoti Bank, Nirvighnam Chant, Sarvakaryeshu Chant - all
already used `type="star"` + gold for their pre-reveal burst.
Out of scope: Sacred Assembly (final scene) doesn't use SymbolAutoReveal at
all (different "place symbols on Ganesha" mechanic) - its sparkle usage
(including one deliberate combined star+magic layered "celebration" effect)
was left untouched. About Me Hut's decorative sparkles (wish-granted, food
selection, etc.) also left untouched - different mechanic, not part of the
reported bug.
**Open:** Not visually verified in-browser (dev server nav requires playing
through onboarding + the actual eyes mini-game to trigger the moment) -
Madhurima should confirm the Tusk eyes-game sparkle looks right next time she
tests. Next up in the plan: still on the VO/visual-consistency work before
moving to the content pass.

## [2026-09-18] — VO audit across all 13 live scenes + guard comments
**Touched:** src/zones/about-me-hut/family-tree/Familytreegame.jsx,
src/zones/about-me-hut/indian-story/MyIndianStoryGame.jsx (comments only, no
logic changes)
**Changed:** Kicked off the "rightsizing all 13 scenes" plan (theme-wise, not
scene-wise: VO pass first, then content, then checklist compliance, then
CSS/clamp audit, then T21 tests). This session = the VO pass.
Audited all 13 live scenes for the same class of bug as the Modak/Pond VO fix
(two `speak()`-family calls landing close enough together that
`speechSynthesis.cancel()` chops the first one mid-line). Result: no other
scene has a confirmed live instance of this bug. Two files flagged LOW
confidence as maintainability risk only (not currently broken) and given
guard comments so a future edit doesn't reintroduce the bug class:
1. Familytreegame.jsx - mixes two independent TTS hook instances
   (useVoiceGuidance's playVoice/stopVoice + a separate useGaneshaVoice()'s
   speakHint/stopSpokenVoice). Every current call site correctly stops both
   before speaking, so nothing is broken today - comment flags the pairing
   that must be preserved.
2. MyIndianStoryGame.jsx - LANGUAGE_GANESHA phase has two VO effects
   (language_play_first on phase entry, language_guess on cards-revealed)
   that are currently safe only because showLanguageCards is gated behind
   explicit user action - comment flags the race if that timing ever changes.
**Open:** Next up in the plan is the content pass (opening/completion modal +
affirmation suggestions for all 13 scenes, per the CLAUDE.md Content
Generation protocol) - not started yet.

## [2026-09-18] — Symbol reveal VO cutoff/repeat fix (Modak, Pond)
**Touched:** src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx,
src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx
**Changed:** Madhurima reported the symbol-reveal VO cutting off and repeating
("I can guide" then "Say with me, I can guide my busy thoughts."). Root cause:
both scenes fired their own `playVoice`/`speakPondPrompt` call ~400ms after
the reveal card appeared, speaking the raw affirmation text, while the
SHARED `SymbolAutoReveal` component (used by all 13 live scenes) independently
speaks "Say with me, <affirmation>" ~450ms after its own card-ready state.
Both use the same `useGaneshaVoice` hook, which calls `speechSynthesis.cancel()`
on every new `speak()` — so the second call always chopped the first mid-line.
Fix (option 2, chosen by Madhurima): removed the duplicate scene-level VO
effect in both Modak and Pond; `SymbolAutoReveal`'s own line is now the single
source of truth for every symbol reveal. `SymbolAutoReveal.jsx` itself needed
no change - it was already doing the right thing.
Checked all other live scenes for the same pattern:
- Tusk (SymbolMountainSceneV3.jsx) - already safe: distinct wording for its
  eyes/ears setup lines + `sayWithMeDelayMs: 3200` gives enough separation
  from SymbolAutoReveal's own line. No change needed.
- All 5 live Shloka River scenes - none had a duplicate reveal-VO effect;
  already relied solely on SymbolAutoReveal. No change needed.
- Eyes/Ears subgames (EyesPopUpGame.jsx, EarsSoundMatchGame.jsx) - don't
  render SymbolAutoReveal themselves, hand off to the parent scene. No
  duplication.
**Open:** none - fix is scoped and verified complete for all 13 live scenes.

## [2026-09-09] — Modak game 2: prop visibility, follow-tray, ghost-drag fix, Belly/Modak sequencing
**Touched:** src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx,
src/zones/symbol-mountain/scenes/modak/ModakScene.css,
src/lib/components/interactive/KidsDraggable.jsx (shared component)
**Changed:** Four fixes to the Flower Journey game (game 2 of Modak scene),
driven by Madhurima's design-review feedback:
1. Mud/leaf/branch backdrop props + their flower pairs now render from the
   start of the challenge sequence (`showChallengeProps` flag) instead of
   phase-by-phase, so the child sees the whole layout upfront. Actual
   interactions still gate to their own phase.
2. Flower counter ("tray") now tracks Mooshika's live position
   (`modak-fj-flower-tray--follow`) instead of a fixed top-of-screen bar.
3. Ghost/duplicate Mooshika during the mud-crossing drag: root cause was in
   the SHARED `KidsDraggable.jsx` component — its floating drag-clone was
   never accompanied by dimming the source element (a stale comment
   ("// Restore original") implied it used to). Fixed at the shared-component
   level in `onPointerDown` (`el.style.opacity = '0.35'`), so this also fixes
   ghosting in every other scene that uses KidsDraggable, not just here.
4. Belly/Modak sequencing locked per design: worried/angry/sad emotion icons
   now fade over ~900ms instead of vanishing instantly (so all three are
   visible together at the pause before Belly reveals), confirmed Belly only
   triggers on explicit garland-drop-on-Ganesha (never proximity), and
   confirmed MODAK_PAUSE already holds ~1.65s+ between the Belly reveal and
   the Modak reveal after the garland is offered.
Verified live via a temporary local-only preview route in main.jsx
(`?preview=modakv7`, reverted before commit — never pushed) driven with
Playwright: screenshotted all-props-visible state, the follow-tray, the
drag with no ghost, all three emotion icons together at the Belly pause, and
the Belly→pause→Modak reveal sequence. Commits: b2480ec (scene fixes),
5d8e579 (KidsDraggable ghost fix). Pushed to origin/staging.
**Open:** Leaves-swipe and branch-pull challenges were only exercised via
debug-jump states, not driven end-to-end by simulated swipe/pull gestures —
worth a manual pass to confirm angry/sad icons fire correctly from those
specific interactions (not just that they're renderable).

## [2026-09-06] — Modak scene: Flower Journey + Garland rework
**Touched:** src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx (full body
rewrite), ModakScene.css (new `modak-fj-` / `modak-garland-` section appended),
assets/images/fj-*.png (10 new assets from modak_scene_new_assets.zip)
**Changed:** Replaced the old 3-game Modak scene (mound search → offering drag-collect
→ belly journey) with the 7-beat Flower Journey. Interaction vocabulary:
HOLD (calm Mooshika) → GUIDE across mud → SWIPE leaves apart (2 swipes) →
PULL+HOLD branch → DRAG+SNAP 6 flowers into a garland (full-screen overlay) →
GUIDE garland to Ganesha → REVEAL Modak (no mechanic). Symbols now unlock in
order mooshika → belly → modak (modak is the final sweet reveal). Preserved the
whole shell: useVoiceGuidance, pause/idle-ladder/reload plumbing, SymbolAutoReveal,
FireworksCompletion + CalmGoldenFireworks + InnerMandala + SceneCompletionCelebration,
SymbolSidebar, HomeButton/ZoneBadge/AudioToggle/VOReplay, GestureDemo hints per beat.
New web-speech VO map (MODAK_VO) as TTS scaffolding — MP3s later. Debug jump
buttons rescoped to Beat 1 / Beat 5 / Beat 6. Git: checkpoint commit 83ecbcf +
backup branch backup/modak-pre-rework-20260906 + dated .backup files.
**Open:**
- NOT playtested in-app yet — needs a full run of all 7 beats + reload mid-beat +
  tab-switch/resume + audio toggle. Build compiles clean (esbuild resolve check).
- Beat-position %s (mud/leaves/branch/Ganesha anchors) are first-pass guesses vs
  the new background art — will need visual tuning against newmodakbg.webp.
- New fj-*.png assets are large (mud 1.1MB, leafy-closed 919KB, flower-cream 604KB)
  — compress / convert to webp before prod.
- OpeningModal + completion copy still pull old text from content configs
  (discoveryContent.js / voiceGuidance.js) — needs Madhurima's approval to update.
- Old `modak-game-*` CSS for the retired games left in place (unused, harmless).

## [2026-09-04] — Meet Ganesha welcome video + onboarding icons
**Touched:** src/components/GaneshaIntroStory.jsx + .css,
src/lib/components/onboarding/SignInScreen.jsx + .css + OnboardingCard.css,
src/lib/components/navigation/DeviceChoiceModal.jsx + CleanProfileSelector.jsx + .css,
public/images/onboarding/ (google.svg, apple.svg, icon-name/-continue-here/-email/-install.webp — new)
**Changed:**
- `/videos/ganeshawelcome-new.webm` (mp4 fallback) now plays full-screen and
  autoplays as the first beat of the Meet Ganesha screen, before slide 0.
  Advances on `ended` / `error` / a 15s hard cap / the existing Skip button.
  Slide-0 VO is already gesture-gated so it can't talk over the video.
  `showVideoIntro` state + one effect; early return after all existing hooks.
- Real icons wired into the onboarding screens (PNGs from Downloads, resized
  to 160px WebP via sharp): Google + Apple logos on the sign-in buttons;
  devices icon on device-choice "Continue here", envelope on "Send to iPad";
  person icon on the child's-name screen; phone+lotus+sparkles on the
  "Almost there!" install screen. Replaced the inline-SVG / emoji stand-ins.
- Fixed `.onb-row__title/sub` to stack (were running together).
**Verified:** build green; lint clean. Device-choice icons checked in the
preview.


## [2026-09-04] — Onboarding: unified card skin across all setup screens
**Touched:** src/lib/components/onboarding/OnboardingCard.jsx + .css (new),
ParentGate.jsx + .css, SignInScreen.jsx + .css,
src/lib/components/navigation/DeviceChoiceModal.jsx (DeviceChoiceModal.css deleted)
**Changed:** Extracted the child-profile "scroll-card" look into a shared
`<OnboardingCard heading subheading>` (scenic lavender bg + scalloped cream
card + lotus, self-contained CSS, `.onb-*` namespace, purple-only) and put
every setup screen on it:
- **DeviceChoiceModal** → card. "Where would you like to begin?" with two
  tap rows (Continue here / Send to iPad → reveals the email field) +
  "Maybe later". Same send-continuation logic, just restyled.
- **ParentGate** → card. "Grown-ups only! / A quick check before we
  continue." + purple keypad + digit slots. Challenge logic unchanged.
  ParentGate.css trimmed from 477 lines to ~55 (keypad only).
- **SignInScreen** → card. "Stay in the loop / Save your child's progress,
  get updates and new adventures." Dropped the password field to match the
  mockup (email-only). OAuth buttons still stubs.
The card hugs its content (SVG frame stretches) instead of a fixed aspect
ratio, and drops to a plain rounded card under `max-height:560px` /
`max-width:380px` so the keypad / sign-in form always fit.
CleanProfileSelector already had this look natively — left as-is; it could
migrate onto OnboardingCard later for a single source.
**Verified:** production build green; lint clean. Walked device-choice →
parent-gate → sign-in in the dev preview — all three render on the card.
**Open:** at exactly ~640px height the sign-in card scrolls ~20px; fine on
real phone-landscape (plain-card path) and tablet+. `DeviceChoiceModal.css`
was fully orphaned so it was deleted.


## [2026-09-04] — Onboarding: install nudge + child hand-off restructured
**Touched:** src/lib/components/navigation/CleanProfileSelector.jsx + .css,
src/lib/services/PwaInstallManager.js, src/App.jsx, src/pages/LandingPage.jsx
**Changed:** Reworked the post–parent-gate onboarding into:
`Name → Age → All Set (install) → Hand-off → Pick Your Friend → Mooshika ride
→ Meet Ganesha → map`.
- **Name** and **Age** are now two separate parent screens (avatar dropped from
  the age step). After Age, name+age are stashed to localStorage
  (`gmb_onboarding_name` / `_age`) so an installed-PWA relaunch can resume.
- **One "All set" scene, two states** (content swap, no page load): *install*
  ("Add GMB to your Home Screen", `[Show me how]` → browser-specific in-card
  steps, `Maybe later`) and *hand-off* ("Ready for an adventure? … Hand them
  the device", `[Start Adventure]`). Skips straight to hand-off when there's
  nothing to install. Ganesha figure beside the card: `sit-hi` pose in install,
  `celebrate` pose in hand-off.
- **Pick Your Friend** is now its own child-facing screen after the hand-off
  (was bundled into the parent's create step). Picking creates the profile
  (name+age+avatar), clears the onboarding crumbs, sets `gmb_handoff_done`,
  then → Mooshika ride → Meet Ganesha → map (that tail unchanged).
- **PwaInstallManager**: new `detectPlatform()`, `isAndroid()`, and
  `getInstallGuide()` returning `{os, browser, canNativePrompt, title, steps[]}`
  for iOS Safari / iOS Chrome / Android Chromium / Android other / desktop.
- **App.jsx**: installed-PWA relaunch mid-setup (name+age saved, no profile
  yet, `display-mode: standalone`) → boots straight to the Pick Your Friend
  screen via `CleanProfileSelector bootStage="pick-character"`. New `handoff`
  currentView. Also: the top-level `<Suspense>` fallback now shows the Ganesha
  loader instead of a blank scene; LandingPage "Continue here" strips
  `?view=landing` from the URL before entering the app.
**Verified:** production build green; lint clean (no new errors). Walked the
full flow in the dev preview screen-by-screen through "Meet Ganesha". Not
live-verified: final map paint after the intro story (unchanged code) and the
standalone-relaunch boot (can't emulate `display-mode: standalone` in-preview).
**Open:** on real iOS/Android the *install* state of the All-set scene shows;
give it a device pass. Ganesha figure sits a touch low on the card — nudge if
it bugs you.


## [2026-09-03] — Delayed beta feedback-email automation (backend only)
**Touched:** netlify/functions/send-feedback-emails.js (new),
netlify/functions/send-continuation.js, netlify.toml (new),
netlify/functions/_sql/beta_signups.sql (new)
**Changed:** Nothing was persisted for signups before — send-continuation.js only
fired the Resend continuation email. Added a minimal `beta_signups` table
(id, parent_email unique, signed_up_at, feedback_email_sent_at nullable);
send-continuation.js now best-effort inserts a row after a successful send
(ignore-duplicates, never blocks the user). New Netlify scheduled function
send-feedback-emails.js runs daily (netlify.toml `schedule = "0 8 * * *"`),
selects rows 3+ days old with feedback_email_sent_at null, sends the verbatim
feedback email via Resend, stamps feedback_email_sent_at, and continues the
batch on per-email failure. No UI change.
**Open:** (1) Run beta_signups.sql in Supabase SQL Editor — could not run it here
(Supabase MCP not authorized). (2) Add Netlify env vars SUPABASE_URL +
SUPABASE_SERVICE_ROLE_KEY (RESEND_API_KEY already set). (3) Paste real Google
Form URL into FEEDBACK_FORM_URL in send-feedback-emails.js (function no-ops
while it's still PLACEHOLDER_GOOGLE_FORM_URL).


## [2026-09-03] — Marketing landing page: merged 11 mockups into one React page
**Touched:** src/pages/LandingPage.jsx (new), src/pages/LandingPage.css (new),
src/App.jsx, index.html, public/images/landing/* (19 extracted assets),
LANDING_PAGE_MERGE_NOTES.md (new)
**Changed:** Merged the 11 standalone GMB landing mockups (gmb_landing_screens.zip)
into one React page. Base64 images extracted to public/images/landing/ as real
files. ONE consolidated design-token block, ONE shared sticky header (per-section
headers from screens 1/2/3/3b removed), ONE shared sticky bottom "Start Free" bar
(appears past the hero, hides when Screen 10's CTA is on screen via
IntersectionObserver). All three "Start Free" buttons reuse the existing
DeviceChoiceModal. Per-section CSS scoped under .lp-<name> prefixes to kill the
.cta / .icon-circle / h2 / .curve-top / .dot collisions. Routed in App.jsx as
currentView 'landing', opt-in via ?view=landing. index.html font load extended to
include Nunito italic (founder note). LandingPage.jsx lints clean; App.jsx's
pre-existing lint errors untouched.
**Follow-up (same day, per Madhurima):** zone names CONFIRMED as the new marketing
names (map alt text aligned); Start Free flow CONFIRMED (device-choice modal);
landing stays OPT-IN (?view=landing) — not the default first-run view; all 17 PNGs
converted to WebP via sharp (public/images/landing ~13 MB → ~0.9 MB, map 2.7 MB →
83 KB), refs updated, email assets untouched; header hamburger REMOVED (no menu
behind it — re-add with a real menu later). Also fixed live in preview: screen5
symbol icons were rotated in the mockup (ear label → lotus art etc.) — icon files
renamed to match; and `.landing-page` made its own `position:fixed` scroll
container since the app locks body/#root to `overflow:hidden`.
Also per Madhurima: all eyebrow labels unified to the pill style (added to
"See how GMB works" / "Explore GMB"); section-7 "For parents" strip removed
(Family bridge section already says it); all placeholder emoji removed (📱 strip,
🐘 founder mark, 🌱 first-families note); landing page now paints immediately
instead of showing the kids-app loading scene (App init still runs in the
background so Start Free works).
**Open:** add a real nav menu + trigger before wider launch — TASKS.md T50.

## [2026-09-02] — Zone 1 phone-landscape CSS pilot (Scene 1 + shared chrome)
**Touched:** DECISIONS.md,
src/zones/symbol-mountain/shared/components/SymbolSidebar.css,
src/lib/components/zone/ZoneWelcome.css,
src/zones/shared/components/OpeningModal.css
**Changed:** Pilot pass of a Zone 1 (Symbol Mountain) mobile-CSS audit, fix-in-place
(no SceneStage — deliberately dropped earlier for layout issues; recorded under
DECISIONS.md #7 so the stale 1280x800 decision stops resurfacing). Tested Scene 1
(Modak) in the in-app browser at phone-landscape 915x412 and 640x360; portrait out
of scope (rotate-device overlay). Three shared-component fixes, so this also
previews the change for Pond / Symbol / Sacred Assembly. Complements the same-day
pre-Zone-1 onboarding sweep below (no file overlap).
- **SymbolSidebar** — new `@media (max-height: 480px)` block. The vertically-centred
  8-slot strip was taller than the viewport: top+bottom slots clipped off both
  edges and it overlapped the bottom-right mute button. Now anchored `top:6px /
  bottom:72px` (not centred), slots 38px hitarea / 30px icon, `gap:4px`,
  `overflow-y:auto` + hidden scrollbar as safety net. Verified: no edge clip, mute
  clear.
- **ZoneWelcome** — new `@media (max-height: 480px)` block. 4-card pyramid + "N/4
  Scenes" pill together taller than the viewport (top badge clipped, bottom card
  overlapped the pill). Compressed rows (`.zone-4` 29% / mid 50% / `.zone-1` 73%),
  lower card min-height floor, `stats-bottom-bar` bottom 8px, tighter journey-panel
  padding, `zone-title-top` top 4px, `floatSoftShort` keyframe (±5px bob). Same
  compression for the 5-card Shloka/Cave rows. Verified: pill/bottom-card overlap
  gone.
- **OpeningModal** — MOBILE LANDSCAPE block (568-1023 landscape) now cancels the base
  `translateY(-42px)` lift (was pushing card top + lotus icon off-screen), shrinks
  the lotus, tightens card padding / title+subtitle margins / icon circle so
  "Let's Begin" stays on-screen at 360px height. Verified at 915x412 and 640x360.
**Open:**
- Fix 2 (`.modak-game-background` `100% 100%` -> `cover`) NOT applied — stretch keeps
  the `%`-positioned game elements mapped to the art at every aspect ratio; `cover`
  would crop and drift them. Recommend leaving as-is.
- Fix 3 (fixed-`px !important` overrides in ModakScene.css media queries ~L760-886)
  NOT applied — already dead code (the `--modak-size` "Final lock" at L883-886
  overrides them). Per-scene, not shared; sweep during the per-scene rollout.
- Residual: at <=360px height the ZoneWelcome top card's number badge still rides
  close under the zone title.
**Rollout (same session):** verified the 3 shared fixes on Pond / Symbol / Sacred
Assembly via `/game-test.html` at 915x412. All 3 import the identical shared
SymbolSidebar + OpeningModal, and grep confirmed no per-scene CSS touches
`.ganesha-sidebar` / `.ganesha-icon` / `.game-modal-*` — so no new edits needed.
OpeningModal (lotus + button) checked clean on all 4 SM scenes; SymbolSidebar (no
edge clip, mute clear) checked on Modak/Pond/Symbol (Sacred Assembly's sidebar
phase wouldn't drive in the harness, but same component + zero override).
TASKS.md T20 marked [x] for scenes 01-04; new **T49** logged for the
CleanGameWelcomeScreen short-landscape overflow (deferred by two sweeps now).

## [2026-09-02] — Pre-Zone-1 onboarding chrome: mobile landscape CSS audit + fixes
**Touched:** src/Enhanced.css, src/lib/components/navigation/MainWelcomeScreen.css,
src/lib/components/onboarding/ParentGate.css,
src/lib/components/navigation/CleanProfileSelector.css,
src/lib/components/onboarding/InstallPromptBanner.jsx
**Changed:** Extended the Scene 1 mobile-landscape CSS approach (clamp/%, `@media
(max-height: 480px)` compression, no new fixed-px `!important`) to the six
pre-Zone-1 onboarding screens. Audited at 915×412 and 640×360.
- **ParentGate (HIGH):** `.parent-gate-card` `min-height` floor of 520px exceeded
  short-landscape viewports and centered content (incl. Continue button) off
  screen with no in-card scroll. The one relaxing query was width-bound at 900px
  so 915-wide phones missed it. Fix: added `(min-height: 481px)` to that query;
  new `max-height: 480px` block unlocks the floor, top-aligns, compresses type +
  checkbox, makes `.parent-gate-actions` a sticky footer, card scrolls internally.
- **CleanProfileSelector create flow (HIGH):** `.scroll-card` `aspect-ratio: 0.72`
  computed ~833px tall at 915w; `.clean-modal-overlay.scroll-overlay` had no
  `overflow-y`. New `max-height: 480px` block drops the aspect lock (card hugs
  content), scrolls the overlay, kills the fixed 146px `padding-top`, hides the
  decorative lotus, compresses name input / age stepper / friend grid / buttons.
  Button height overrides keep `!important` only to match the pre-existing
  PrimaryBtn override specificity.
- **Splash loader (LOW):** added `max-height: 480px` shrink for
  `.loading-ganesha-container` + loader track.
- **MainWelcomeScreen (LOW):** trimmed `.welcome-content-overlay` padding in the
  existing short-landscape block.
- **InstallPromptBanner (LOW):** ellipsis guards on banner title/subtitle;
  `maxHeight: 46vh` + scroll on the iOS steps sheet; **z-index 2000 → 10000** so
  the PWA nudge actually renders above the MooshikaRideTransition (z 9999) during
  the profile-create → handoff moment, as the code comments intend.
**Open:** CleanGameWelcomeScreen (returning-user welcome/continue screen)
deliberately not swept — outside first-run scope; revisit before wider beta since
returning families hit it every session. Fixes are code-verified only, not yet
tested on a physical landscape phone.

## [2026-08-29] — Shloka River reward ladder
**Touched:** src/lib/components/animation/SparkleAnimation.jsx + .css,
src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx + .css,
src/zones/shloka-river/scenes/Scene2/SuryakotiBankSimplified.jsx + .css,
src/zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx + .css,
src/zones/shloka-river/scenes/scene4/SarvakaryeshuChantSimplified.jsx
**Changed:** Locked a three-tier reward ladder so interactions stop competing at
the same volume.
- Root cause of the "red dots": `SparkleAnimation type="magic"` forces a
  transparent fill and a `var(--sparkle-color, purple)` glow — the passed gold
  colour was ignored. Added a new `dust` type (small gold motes that rise + fade)
  and switched the micro-win bursts to it; `star` (real gold clip-path star) is
  now the discovery burst.
- Micro-action (syllable lit / correct tap): local **Rising Dust** only, in the
  centred 46%×42% play-area box, 1600ms window. Removed the per-action
  `triggerMiniGesture('thumbsup')` from `handleMicroWin` in all four wrappers.
- Word/symbol discovery (`handlePhaseComplete`): one **Golden Star** (new
  `showWordStar` state + `.<scene>-word-star` centred 72%×60% overlay, z-index
  140) + the existing single `blessing` Ganesha gesture. Kept `blessing` rather
  than swapping to `thumbsup` — it's the purpose-built Sanskrit-moment cue per
  useMiniGesture's tier map; flag if you want it literally thumbs-up.
- Power/symbol overlay: no extra major FX added (word-complete already celebrated).
- Scene complete: existing `final-fireworks` / SceneCompletionCelebration
  untouched.
- Exception — Sarvakaryeshu & Sarvada (scene4 wrapper): each correct answer *is*
  the discovery, so `handleMicroWin` there fires **Golden Star** per correct
  answer (not dust), gesture still once at `handlePhaseComplete`.
- Wrong actions: no celebratory FX (unchanged).
**Point-of-finger localisation (done):** each wrapper now records the last
pointer-down position as a % of the `*-scene-background` / `river-background`
div (`onPointerDownCapture` + `fxBgRef` + `recordPoint`), and `handleMicroWin`
stashes it into `sparklePos`. The `*-tap-sparkles` div then gets an inline
`left/top` at that point (32% box, 42% for the scene4 star) instead of the
centred fallback; `sparklePos` null (keyboard / autoplay) keeps the centred box.
No changes needed in the game components — the pointer-down that drove the
micro-win is the same gesture, milliseconds earlier.
**Open:** Sarvada's small `sarvada-found-burst` local ring left in place
alongside the new Golden Star. Pre-existing `no-empty` lint in
NirvighnamChantSimplified is not from this work.

## [2026-08-29]
**Touched:** src/dev/webSpeechScripts.js, src/dev/GameTestHarness.jsx,
src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx,
src/zones/shloka-river/scenes/Scene1/MahakayaRescueGame.jsx,
src/zones/shloka-river/scenes/Scene2/SuryakotiBankSimplified.jsx,
src/zones/shloka-river/scenes/Scene2/components/SamaprabhaGame.jsx,
src/zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx,
src/zones/shloka-river/scenes/scene4/SarvakaryeshuChantSimplified.jsx,
src/zones/shloka-river/scenes/scene4/SarvadaGame.jsx
**Changed:** Shloka River VO cleanup, two phases. Locked system rule: opening VO =
problem + goal; on-screen hint / GestureDemo = how; idle VO = reminder of what's
still unsolved; never narrate an animation the child can already see.
- Phase 1 — one spoken setup line per game. Rewrote all 8 opening VOs (Vakratunda,
  Mahakaya, Suryakoti, Samaprabha, Nirvighnam, Kurumedeva, Sarvakaryeshu, Sarvada)
  in both the scene-wrapper `playGuidanceVoice` maps and the harness copy. Added a
  real `scene11_sama_intro` key (Samaprabha slot previously misfired
  `samaprabhaSetup`, the ending line) and repointed harness INTRO_VO to it.
  Removed the auto-chained second instruction VO after every intro: Mahakaya
  (`scene10_maha_drag_rope`), Suryakoti (`scene11_surya_rub`), Nirvighnam
  (`scene12_nir_drag`), Kurumedeva (`scene12_kuru_tap`), Sarvada
  (`scene14_morning`). Vakratunda's duplicate setup lines
  (`scene10_vak_frog_cross`, `scene10_vak_make_path`) collapsed to the single
  intro text. Added the missing on-screen `.sama-hint` element to SamaprabhaGame
  (CSS already existed) so softening its VO doesn't leave a stuck child with only
  a glow. Also deleted a stray `))}` at MahakayaRescueGame ~L951 (leftover from an
  earlier uncommitted rewrite) that was a hard parse error.
- Phase 2 — stripped gesture narration from idle-hint VO across the 5 scenes,
  replaced with goal reminders (e.g. "Drag it to the glowing circle" →
  "See the glow? That's the way around"; "Rub the darkness away" → "The bunny's
  still lost — light the next spot"; "Drag the obstacle away" → "Something's still
  blocking the turtle's way"; "Drag the help bubble to the glowing friend" →
  "Who can Beaver ask for help next?"). Mahakaya `scene10_maha_pull_down` VO cut
  entirely (call removed + key emptied); `scene10_maha_log_moving` emptied.
  Sarvakaryeshu VO left as-is (already goal-framed). `scene14_find_symbol` kept.
**Open:** Docs NAVIGATION.md / CONTENT_AUDIT.md not refreshed for these VO edits.
GestureDemo is wired in 6/8 Shloka games — missing from SarvakaryeshuGame and
SarvadaGame (both rely on useRepeatedHintCycle + a rescue glow-ring instead);
ShlokaRiverFinale has no mechanic so needs none. All 8 touched files parse clean;
remaining eslint errors are pre-existing unused-var noise.

## [2026-08-28]
**Touched:** src/zones/shloka-river/scenes/Scene2/components/SamaprabhaGame.jsx,
src/zones/shloka-river/scenes/Scene2/components/SamaprabhaGame.css
**Changed:** Reworked the Samaprabha game per annotate pin
(samaprabha-2026-08-28T09-49-39-963Z.json). Mechanic is now tap, not drag: the
child taps the next glowing circle in sequence, which slides the sun onto it and
plays that syllable. Circles now map 1:1 to the four syllable sounds
(Sa / ma / pra / bha) — added the 4th, removed the separate start dot; sun starts
off to the side at START_BALANCE. Snap dots are real `<button>`s (styled reset,
64px hit area kept). Dropped all pointer drag handlers / drag state / sama-handle-hit;
GestureDemo switched from "drag" to "tap" on the first circle.
**Open:** INTRO_VO for samaprabha in GameTestHarness still points at
`samaprabhaSetup` (off the sceneNN_<word>_intro naming pattern) — verify it's a
real registered VO line.

## [2026-08-26]
**Touched:** src/zones/shloka-river/scenes/scene4/SarvadaGame.jsx, src/zones/shloka-river/scenes/scene4/SarvadaGame.css
**Changed:** Rebuilt the Sarvada find-symbol phase. Memory image now renders in a
true 4:3 frame (no letterbox, tap coords map 1:1 to the picture). Removed the
pre-placed "mouse marker" — the child taps anywhere on the image; a tap inside the
per-phase circular zone flies the symbol up to the syllable tile and plays the
syllable. Off-zone taps do a gentle shake, no punish; rescue glow-ring still fires
after the 3rd hint. Added a "Tap Zone Debug" panel (bottom-left) with X/Y/Size
sliders per phase, live dashed-circle overlay, and Copy symbolSpot config.
Addressed all annotate pins (sarvada latest.json):
- Fly slowed to 1.5s; syllable sound now fires on tile-touch (fly onAnimationEnd),
  matching Sarvakaryeshu.
- Boat-Ganesha moved to the bow (front) of the boat, z-index above the hull.
- Preload all 3 phase bgs + warmer base colour (#241a33) so crossfades don't
  flash blue between morning/afternoon/night.
- Harness bg for the Sarvada entry was importing sarvada/night.webp — pointed it
  at morning.webp, which is why the stage flashed night before the scene painted.
- End reveal adds the house story line "Morning, afternoon, night — always."
  under SARVADA / Always (copy from powerConfig.sarvada in the parent scene).
**Open:** Zone coords still at old guessed values — tune each phase via the
debug panel, paste copied config into PHASES_CONFIG.

---

Marked Meaning Cave / Cave of Secrets scenes obsolete in `src/App.jsx`.
- Current mantra gameplay, including Nirvighnam, lives under Shloka River.
- Meaning Cave scene files are retained only as history and should not be edited for current gameplay.

## [2026-08-29]
**Touched:** NewModakSceneV7.jsx, PondSceneSimplifiedV4.jsx, SymbolMountainSceneV3.jsx, SacredAssemblySceneV8.jsx, voiceGuidance.js
**Changed:** Rewrote all Symbol Mountain VO to the "problem -> mechanic (2nd sentence) -> child acts -> symbol meaning" rule. Idle hints now restate the goal only, no mechanic repeat. Retargeted affirmations to match each mechanic: Modak "I can feel peaceful inside", Belly "I have room for all my feelings", Trunk "I can find another way", Eyes "I notice what's around me". Scene 04 opening/onboarding/correct/wrong lines simplified; final fireworks chain cut from 3 lines to 2 (recap + meaning, 700ms gap) in triggerFinalCelebration(). Scene 04 changed keys had their `file:` .wav refs stripped to force TTS until re-cut.
**Open:** Scene 03 has no `correct` VO key — per-obstacle correct feedback in the Tusk sub-game is sound-only (playChime); adding "Yes — that was the right choice." needs an onCorrect callback prop on the Tusk game component. Scene 04 `finalNowComplete` key now unused (kept in config, out of the chain). Recorded .wav files for Scene 04 are stale and need re-recording to the new script.

## [2026-08-29]
**Touched:** VO_FLOW.md (new), src/lib/config/content/voiceGuidance.js,
src/zones/about-me-hut/family-tree/Familytreegame.jsx,
src/zones/about-me-hut/food/Favoritefoodgame.jsx,
src/zones/about-me-hut/enjoy/ObstacleRemoverGame.jsx,
src/zones/about-me-hut/indian-story/MyIndianStoryGame.jsx
**Changed:** Added VO_FLOW.md — the locked four-beat VO rule (setup = what's
happening + why it matters / mechanic = one short action sentence / idle = goal
reminder, not repeated instructions / completion = what the child discovered or
made happen) plus the full About Me Hut rewrite tables and locked completion VOs.
Applied the rewrite to all 4 About Me Hut scenes:
- Family Tree: `voiceGuidance.js` about-me-hut/family-tree (welcome, tapCircle,
  correct*, fact*, hintTap, allPlaced, transition, childStart, childHint,
  childProgress* all collapsed to "Your family tree is growing.",
  childProgressComplete, sceneComplete) + inline `FINAL_VO`. Facts trimmed to one
  clause each; removed "gives the best hugs". Per-spot `IDLE_HINT_VO` clues
  (trident / golden sari / peacock / elephant head) kept — they name the person,
  not the mechanic.
- Favorite Things: inline `VOICE_LINES`. "best friend" -> "a friend you care
  about"; "We like so many fun things!" -> connection-through-sharing line.
- Dreams & Wishes: inline `VOICE_LINES`. Wishes reframed as "things we hope to
  make better"; killed "Let's make the world smile!" and "Keep dreaming!";
  garden used consistently for wish 3; ending now ties both halves together.
- My Indian Story: inline `VOICE`. Removed "feels right" (implied correct
  emotion); "languages you speak" -> "languages you use or hear"; finale states
  what the child did instead of generic "special".
- Stripped `file:` refs on every changed voiceGuidance.js key (family-tree +
  the 3 opening lines) to force TTS to the new script until re-cut.
**Open:** All recorded .wav/.mp3 for About Me Hut VO are now stale vs the new
script and need re-recording. Family Tree `childProgressStart/Small/Mid/NearFull`
are intentionally identical now — if variety is wanted later, write 4 distinct
goal-framed lines. Docs NAVIGATION.md / CONTENT_AUDIT.md not refreshed.

## [2026-08-25]
Checked and frozen:
- Replay button
- Audio toggle
- Home and zone badge
- Sparkles gesture
- Demo cue
- Hint SFX
- The game welcome screen
- Inner mandala

## [2026-08-31]
**Touched:** src/lib/services/sceneAnalytics.js (new), src/lib/services/CloudSync.js, src/App.jsx, src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx
**Changed:** Added internal-only scene/mini-game replay-frequency analytics, fully
decoupled from ProgressManager (no shared state, no imports). New module
`sceneAnalytics.js` dedupes (4s) + debounces (2s) entries and calls a Supabase
`increment_scene_play` RPC (atomic upsert-increment) on a NEW `scene_plays` table
keyed (user_id, child_id, scene_id, game_id). Reuses CloudSync's anonymous auth
identity via two new read-only accessors on CloudSync (`whenReady()`,
`getUserId()`); `init()` is now memoised. Fails silently (console.warn only),
never blocks gameplay. Data is NOT surfaced in any app UI — query via Supabase
dashboard. App.jsx fires one whole-scene `_scene` ping per scene load; per-mini-game
wiring done as a reference on NewModakSceneV7 (findMooshika / collectModaks /
shareWithGanesha).
**Open:**
- SQL not yet run — table + RLS policy + `increment_scene_play()` function are in a
  comment block at the top of `sceneAnalytics.js`; must be pasted into the Supabase
  SQL Editor before any rows are written.
- Column naming: spec asked camelCase; implemented snake_case to match existing
  `profiles`/`progress` tables. Logical mapping documented in the module header.
- Per-mini-game wiring is done only for Modak (scene 1). Remaining 21 scenes still
  fire only the whole-scene `_scene` ping from App.jsx — extend per scene using
  each scene's own phase model (Modak useEffect is the template).

<!-- Example entry — delete once real entries start
## [2026-08-22]
**Touched:** DailyDarePopup.jsx, dareTracker.js
**Changed:** Fixed hint cycle gating bug on Tier 2 list; added maxLocked guard
**Open:** pause-mid-pull sink still pending on Mahakaya scene
-->

## [2026-09-04]
**Touched:** CleanProfileSelector.jsx, CleanProfileSelector.css, MooshikaRideTransition.jsx, public/images/new-explorer-*.{webp,png} (20 animals)
**Changed:** Pick-your-friend screen now offers 20 explorer characters instead of 4.
New paged carousel (2×4 grid, ‹ › arrows + page dots, 8 per page → 3 pages, last
page padded with invisible filler cards to keep height stable). New ids: squirrel,
crane, fish, camel, buffalo, owl, rabbit, swan, cobra, horse, lion, monkey,
elephant, peacock, mouse, turtle, fox, crow, deer, tiger (tiger art refreshed,
old peacock/squirrel/monkey/owl/mouse overwritten). Source PNGs from ChatGPT,
downscaled to 256² + alpha-floor pass (≥60) to strip speckle noise, emitted as
webp + png at the app's existing `new-explorer-<id>` naming so the profile grid,
ProfileChip, CleanMapZone and the 4 About Me Hut games pick them up unchanged.
MooshikaRideTransition rider img switched to .webp with .png onError fallback.
**Open:**
- Not device-tested on real iOS/Android; verified in-browser at 1440×900 only
  (portrait-lock overlay blocks the automated flow, hidden via injected CSS for
  the check). Confirm carousel arrow spacing on short-landscape phones.
- `charPage` state resets to 0 on re-entry; selectedAvatar still defaults to
  'monkey' if a child taps "Let's go" without picking (pre-existing behaviour).

## [2026-09-22]
**Touched:** src/lib/components/feedback/GestureDemo.jsx; src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx, FlowerJourneyGame2.jsx; src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx; src/zones/symbol-mountain/scenes/final scene/SacredAssemblySceneV8.jsx, GaneshaIllustration.jsx, SacredAssemblyScene.css; src/zones/about-me-hut/indian-story/MyIndianStoryGame.jsx; src/zones/about-me-hut/enjoy/ObstacleRemoverGame.jsx, DreamsWishesGame.css, enjoy/components/Wish2PlateDropGame.jsx; src/zones/about-me-hut/family-tree/Familytreegame.jsx/.css; src/zones/about-me-hut/food/Favoritefoodgame.jsx/.css
**Changed:** Completed the full 13-scene idle-hint standardization pass (10s/18s/26s notice→understand→do ladder, VO-completion-gated, replacing generic pulse escalation) — Shloka River's 5 scenes and Symbol Mountain/About Me Hut's remaining scenes were finished across this and prior sessions, with Sacred Assembly (finale) as the last of the 13. Also did a GestureDemo shared-component audit across Symbol Mountain's teaching-gesture call sites: added a new `pull-down-hold` compound gesture type (collapses Flower Branch's separate pull-down + hold demos, which could render two overlapping hands, into one); fixed Flower Bush's `swipe-left` misuse (that config ignores `to` and always sweeps ±15% of scene width) by switching to explicit `drag` with real anchored coordinates; froze Calm Mooshika's teaching-gesture target position at trigger time instead of passing the live-tracked (moving) position, which could regenerate GestureDemo's keyframes mid-animation; set `idleDelay={0}` + explicit `iterations={1}` at every Symbol Mountain GestureDemo call site now that gestures are VO-onStart-synced instead of mount-delayed (the animation already has its own ~250-300ms fade-in, and the shared default of 2 iterations is wrong for an immediate one-shot teaching demo); removed a dead `onPointerDown={dismiss}` handler on `.gesture-demo-overlay` (that element has `pointer-events: none`, so it could never fire — real dismissal is the window-level pointerdown listener); added immediate teaching-gesture dismissal in Calm Mooshika's press-down handler, separate from the later "meaningful hold" idle-clock reset.
**Open:** Large batch of work across About Me Hut (4 scenes), Sacred Assembly, and this GestureDemo audit is implemented and build-verified but NOT YET COMMITTED — awaiting explicit go-ahead to commit (one commit per scene/feature, per standing convention). All 13 scenes' hint passes are now functionally complete; no scenes remain in the original scope.

**Addendum [2026-09-23]:** Committed the next morning after go-ahead — Symbol Mountain (incl. all 6 GestureDemo audit items above) in `406a3215`, the shared `pull-down-hold` type + dead-handler removal in `898531c3`, and About Me Hut in `58df7df5`. Verified line-by-line against this entry; nothing was lost.
