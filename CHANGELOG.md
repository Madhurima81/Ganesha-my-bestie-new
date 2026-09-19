# CHANGELOG.md
Append one entry per work session. Newest on top.

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
