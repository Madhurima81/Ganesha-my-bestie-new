# SYMBOL MOUNTAIN � REFRESHED MASTER PRODUCTION FREEZE CHECKLIST
Date: 2026-04-28
Scope: Symbol Mountain scenes 01-04 (Modak, Pond, Symbol, Sacred Assembly)
Use: Final manual QA before zone freeze

## 0) Baseline Used
- `SYMBOL_MOUNTAIN_MASTER_FREEZE_CHECKLIST.md`
- `SYMBOL_MOUNTAIN_PRODUCTION_FREEZE_CHECKLIST.md`
- `ABOUT_ME_HUT_FREEZE_CHECKLIST_REFRESHED.md` (structure standard: blockers + tab/reload/voice/idle clarity)

## 1) MASTER GATE (ALL SCENES, MUST PASS)
- [ ] Opening modal appears exactly once on fresh scene start.
- [ ] Opening modal does not replay after tab-return resume.
- [ ] Completion modal appears only on actual win condition.
- [ ] Continue button routes correctly: `modak -> pond -> symbol -> final-scene -> zone completion path`.
- [ ] Replay fully resets that scene state.
- [ ] Home button confirmation flow works from intro, mid-game, and completion.
- [ ] Audio toggle OFF immediately stops Web Speech + VO + SFX.
- [ ] Audio toggle preference persists across reload and scene transitions.
- [ ] Idle hints run in 3-step ladder and clear on interaction.
- [ ] Tab hide/show pauses timers and resumes cleanly after 3-2-1 countdown.
- [ ] No duplicate VO on tab return.
- [ ] No duplicate celebratory timers/animations after tab return.
- [ ] Mid-phase reload restores safe state (no ghost overlays/cards).
- [ ] No blocking console errors.
- [ ] No critical missing assets in Network.

## 2) LOCKED COPY CHECKS (OPENING + COMPLETION)

### Scene 01 `modak`
Opening (from `openingModals.js`):
- [ ] Title: `Share the Modaks`
- [ ] Description: `Mooshika is hiding nearby. Find him and share the sweet modaks.`

Completion (from `completionModals.js`):
- [ ] Title: `You Shared the Modaks!`
- [ ] Subtitle: `You found Mooshika and shared the sweet modaks. Wonderful work, little friend.`

### Scene 02 `pond`
Opening:
- [ ] Title: `The Golden Lotus`
- [ ] Description: `A golden lotus is waiting to bloom.`

Completion:
- [ ] Title: `The Lotus Has Bloomed`
- [ ] Subtitle: `You helped it bloom. It opened for you.`

### Scene 03 `symbol`
Opening:
- [ ] Title: `Ganesha's Symbols`
- [ ] Description: `Look, listen, and find what awakens the tusk.`

Completion:
- [ ] Title: `Ganesha Shines`
- [ ] Subtitle: `You saw, you listened, and finished it.`

### Scene 04 `final-scene`
Opening:
- [ ] Title: `Shine Together`
- [ ] Description: `All the symbols are ready. Place them gently and watch them glow.`

Completion:
- [ ] Title: `The Symbols Shine as One!`
- [ ] Subtitle: `The mountain glows brighter because of you.`

## 3) SYMBOL AUTOREVEAL CONTENT (LOCKED)

### Scene 01 `NewModakSceneV7`
- [ ] Mooshika -> `I can focus.`
- [ ] Modak -> `I share with joy.`
- [ ] Big Belly -> `I feel safe inside.`

### Scene 02 `PondSceneSimplifiedV4`
- [ ] Lotus -> `I stay calm.`
- [ ] Trunk -> `I find my way.`

### Scene 03 `SymbolMountainSceneV3`
- [ ] Eyes -> `I see clearly.`
- [ ] Ears -> `I listen with care.`
- [ ] Tusk -> `I finish what I start.`

## 4) SIDEBAR POPUP CONTENT (LOCKED)
Source: `src/zones/symbol-mountain/shared/components/SymbolSidebar.jsx`
- [ ] Modak: `I share with joy.`
- [ ] Mooshika: `I can focus.`
- [ ] Big Belly: `I feel safe inside.`
- [ ] Lotus: `I stay calm and kind.`
- [ ] Trunk: `I am strong and gentle.`
- [ ] Eyes: `I notice the good.`
- [ ] Ears: `I listen with care.`
- [ ] Tusk: `I finish what I start.`
- [ ] Locked symbols are not interactive.
- [ ] Popup close (tap outside) restores active phase without state loss.

## 5) SCENE FLOW CHECKLIST

### Scene 01 � Modak
- [ ] Phase order: `mooshika_search -> modaks_unlocked -> rock_visible/feeding -> transformed -> complete`
- [ ] Mooshika discovery triggers reveal card and sidebar unlock.
- [ ] Collect phase supports 3 modaks correctly.
- [ ] Feed phase supports drag/drop to Ganesha correctly.
- [ ] Belly reveal triggers final reveal card.
- [ ] Scene completion celebration triggers once.

Idle/Reload/Tab:
- [ ] Idle ladder visible at ~10s/~18s/~26s.
- [ ] Reload safe in each major phase.
- [ ] Tab return resumes with countdown and no duplicate VO.

### Scene 02 � Pond
- [ ] Lotuses bloom sequence works (hold/bloom behavior active as implemented).
- [ ] Golden lotus step triggers correctly.
- [ ] Trunk/elephant reveal step triggers correctly.
- [ ] Lotus + Trunk reveal cards fly to sidebar correctly.
- [ ] Completion celebration triggers once.

Idle/Reload/Tab:
- [ ] Idle cues target lotus/golden/elephant correctly by phase.
- [ ] Reload preserves progression safely.
- [ ] Tab return resumes with no duplicated prompt or timers.

### Scene 03 � Symbol
- [ ] Order: Eyes game -> Ears rhythm -> Tusk notes.
- [ ] Each subgame unlocks matching symbol card and sidebar icon.
- [ ] Ears rhythm progression/state persistence works.
- [ ] Tusk note progression/state persistence works.
- [ ] Final celebration triggers once and continues to final-scene.

Idle/Reload/Tab:
- [ ] Idle ladder points to active target by sub-phase.
- [ ] Mid-subgame reload does not corrupt progression.
- [ ] Tab return does not replay old VO chain repeatedly.

### Scene 04 � Sacred Assembly
- [ ] 8 unique symbols queue without duplication/skips.
- [ ] Card lifecycle works: `appear -> flipped -> side -> play -> feedback`.
- [ ] Correct zone click places symbol and locks zone.
- [ ] Wrong zone gives soft feedback and resets to idle.
- [ ] Onboarding VO plays once.
- [ ] Per-card VO and per-hint VO map correctly.
- [ ] Final 8/8 celebration + completion modal + zone completion path works.

Idle/Reload/Tab:
- [ ] 3-level zone hint glow escalates in play phase.
- [ ] Mid-round reload restores round/placed zones/card state safely.
- [ ] Tab return resumes card phase correctly with no ghost card.

## 6) VO/VOICEOVER CHECKLIST

### Scene-level script presence
- [ ] `modak` VO lines present and triggered in phase order (welcome/find/found/focus/collect/share/feed/gratitude/complete).
- [ ] `pond` VO lines present and triggered in phase order (`opening`, `lotusRound`, `lotusBloomPower`, `goldenLotus`, `elephant`, `trunkRound`, `waterPathPower`, `complete`).
- [ ] `symbol` VO lines present and triggered in phase order (`opening`, `eyes`, `ears`, rhythm rounds, `tusk`, `complete`).
- [ ] `final-scene` VO keys present and mapped:
  - [ ] `openingModalPrompt`
  - [ ] `cardEyes`, `cardEars`, `cardTrunk`, `cardTusk`, `cardModak`, `cardLotus`, `cardBelly`, `cardMooshika`
  - [ ] `hintEyes`, `hintEars`, `hintTrunk`, `hintTusk`, `hintModak`, `hintLotus`, `hintBelly`, `hintMooshika`
  - [ ] `onboardingTapRightPart`
  - [ ] `correctYes`, `correctThatsRight`, `correctYouFoundIt`, `correctWellDone`
  - [ ] `wrongTryAgain`
  - [ ] `finalYouFoundAll`, `finalNowComplete`, `finalAlwaysWithYou`

### Audio behavior
- [ ] VO never overlaps into next phase after skip/rapid tap.
- [ ] Audio OFF immediately cancels speech.
- [ ] Audio ON resumes future cues only (no forced replay burst).

## 7) SFX COVERAGE CHECKLIST (TO FREEZE NOW, TUNE LATER)
Required presence per scene:
- [ ] `tap` for interactive taps.
- [ ] `correct/chime` on valid action.
- [ ] `wrong/oops` on invalid action (especially Sacred Assembly wrong zone).
- [ ] `sparkle` on reveal/placement moments.
- [ ] `powerUnlock` for symbol unlock moments.
- [ ] `celebration` for scene completion.
- [ ] Optional `whoosh/pop` for card movement and sidebar fly-ins.

Quality checks:
- [ ] No clipping/distortion.
- [ ] No missing audio file 404.
- [ ] SFX respect Audio Toggle OFF.

## 8) IMAGE AUDIT (JPG/PNG/SVG + CONSISTENCY)
Current Symbol Mountain image counts (repo scan):
- `.png`: 167
- `.jpg`: 4
- `.svg`: 19

### Mandatory checks
- [ ] No runtime 404 for required gameplay assets.
- [ ] No accidental load of backup/old asset variants.
- [ ] Sidebar icons use current `*-new` set consistently.
- [ ] Popups and reveal cards use same symbol art family.

### Ganesha consistency checks (critical)
- [ ] Scene 01, 02, 03 use a consistent Ganesha visual language (coach/character pose and style family agreed).
- [ ] Scene 04 uses one final approved Ganesha assembly style (`GaneshaIllustration.jsx` path).
- [ ] No mixed old/new Ganesha body-part assets in same scene.
- [ ] If intentional style transitions exist, they are documented and approved.

### Cleanup watchlist (non-blocking for freeze, but document)
- [ ] Backup assets detected in modak folder (`*.backup_before_download_replace_*`).
- [ ] Old-image folders exist; ensure they are not imported by active scenes.
- [ ] Duplicate golden lotus variants exist; confirm active file pair only.

## 9) TAB SWITCH + RELOAD MATRIX (MINIMUM MANUAL RUN)
For each scene (01-04), run all:
- [ ] Early phase tab away/back.
- [ ] Mid gameplay tab away/back.
- [ ] Just before reveal tab away/back.
- [ ] Mid reveal card tab away/back.
- [ ] Mid celebration tab away/back.
- [ ] Hard reload in intro.
- [ ] Hard reload in active gameplay.
- [ ] Hard reload during reveal/card state.
- [ ] Hard reload after completion.

Pass criteria:
- [ ] No stuck modal/overlay.
- [ ] No duplicate countdown/VO.
- [ ] No state rollback to wrong phase.

## 10) FINAL FREEZE SIGN-OFF
- [ ] Desktop pass complete.
- [ ] Mobile pass complete.
- [ ] Audio ON/OFF pass complete.
- [ ] Tab/reload matrix pass complete.
- [ ] Symbol content (autoreveal + sidebar + modal copy) exact-match pass complete.
- [ ] Asset audit pass complete.
- [ ] SFX coverage pass complete.

Approvals:
- [ ] QA Tester
- [ ] Scene Owner
- [ ] Product Owner
## 11) SCENE-WISE DETAILED CHECKLIST (A-H FORMAT)

### Scene 01 — Modak (`NewModakSceneV7.jsx`)

#### 01A · Phases
- [ ] `mooshika_search` starts only after opening modal CTA.
- [ ] Mooshika find -> collect modaks transition is clean.
- [ ] Collect phase gates at required count.
- [ ] Feed phase gates at required feed count.
- [ ] Belly reveal triggers SymbolAutoReveal.
- [ ] Completion celebration triggers once.

#### 01B · Tab Switch (Blocker)
- [ ] Hide stops active VO immediately.
- [ ] Hide pauses hint timers and clears transient hint visuals.
- [ ] Show displays 3-2-1 countdown.
- [ ] Return hint is phase-correct.
- [ ] No duplicate VO after repeated tab returns.
- [ ] No duplicate celebration timers after tab returns.

#### 01C · Reload / Continue (Blocker)
- [ ] Reload intro shows opening modal fresh.
- [ ] Reload in search/collect/feed is safe and phase-correct.
- [ ] Reload during reveal card avoids ghost overlay/card duplication.
- [ ] Reload after completion preserves completion state.

#### 01D · Idle Hints
- [ ] 3-level cadence works (~10s/~18s/~26s).
- [ ] Search hint points to mounds.
- [ ] Collect hint points to modaks.
- [ ] Feed hint points to drag target.
- [ ] Hints clear on interaction and phase change.

#### 01E · Content (Opening/Completion + AutoReveal + Sidebar)
- [ ] Opening title: `Share the Modaks`
- [ ] Opening description: `Mooshika is hiding nearby. Find him and share the sweet modaks.`
- [ ] Completion title: `You Shared the Modaks!`
- [ ] Completion subtitle: `You found Mooshika and shared the sweet modaks. Wonderful work, little friend.`
- [ ] AutoReveal Mooshika: `I can focus.`
- [ ] AutoReveal Modak: `I share with joy.`
- [ ] AutoReveal Big Belly: `I feel safe inside.`
- [ ] Sidebar popup copy matches locked values.

#### 01F · VO + SFX
- [ ] Modak VO order is correct: welcome/find/found/focus/collect/share/feed/gratitude/complete.
- [ ] VO does not overlap on rapid taps/skips.
- [ ] Audio OFF immediately stops VO and SFX.
- [ ] SFX present: tap/correct/wrong(if used)/sparkle/powerUnlock/celebration.

#### 01G · Images/Assets
- [ ] Required assets load: bg, overlay, mound, mooshika, modak, basket, Ganesha feed target.
- [ ] No runtime 404 for image/audio assets.
- [ ] No backup/old asset variants used in active imports.
- [ ] Symbol icons use current `*-new` family.

#### 01H · UX Polish
- [ ] Touch/drag targets are child-friendly.
- [ ] Feedback on correct/wrong actions is clear and gentle.
- [ ] Mobile layout has no clipping/overlap.

### Scene 02 — Pond (`PondSceneSimplifiedV4.jsx`)

#### 02A · Phases
- [ ] Opening -> lotus progression starts correctly.
- [ ] Lotus progression gates golden-lotus phase correctly.
- [ ] Golden-lotus phase gates trunk/elephant phase correctly.
- [ ] Trunk reveal triggers SymbolAutoReveal.
- [ ] Completion triggers once and routes correctly.

#### 02B · Tab Switch (Blocker)
- [ ] Hide stops VO and pauses timers.
- [ ] Show resumes with countdown and context prompt.
- [ ] No duplicated prompt chain after repeated returns.
- [ ] No duplicated celebration timers.

#### 02C · Reload / Continue (Blocker)
- [ ] Reload intro shows opening modal fresh.
- [ ] Reload mid-lotus/golden/trunk stages restores safe state.
- [ ] Reload during reveal card avoids ghost state.
- [ ] Reload post-completion preserves completed state.

#### 02D · Idle Hints
- [ ] 3-level cadence works.
- [ ] Hint targets correct object by phase (lotus -> golden -> trunk/elephant).
- [ ] Hint clears/resets correctly on interaction.

#### 02E · Content (Opening/Completion + AutoReveal + Sidebar)
- [ ] Opening title: `Wake the Lotus`
- [ ] Opening description: `The pond rests quietly. A golden lotus is waiting to bloom.`
- [ ] Completion title: `The Lotus Has Bloomed!`
- [ ] Completion subtitle: `The golden petals opened with your help.`
- [ ] AutoReveal Lotus: `I bloom in the mud!`
- [ ] AutoReveal Trunk: `Strong and gentle!`
- [ ] Sidebar popup copy matches locked values.

#### 02F · VO + SFX
- [ ] Phase VO sequence is consistent and non-overlapping.
- [ ] Audio OFF cancels speech immediately.
- [ ] SFX present and balanced for tap/correct/reveal/celebration.

#### 02G · Images/Assets
- [ ] Required assets load: pond bg/overlays, lotus states, golden lotus, elephant/trunk.
- [ ] Correct active golden-lotus variant is used.
- [ ] No 404 in full playthrough.
- [ ] No old-image leakage from backup folders.

#### 02H · UX Polish
- [ ] Hold/tap/drag actions are obvious to child users.
- [ ] Hitboxes are forgiving on mobile.
- [ ] No text or UI overlap on small screens.

### Scene 03 — Symbol (`SymbolMountainSceneV3.jsx`)

#### 03A · Phases
- [ ] Eyes game -> Ears game -> Tusk game order is strict.
- [ ] Each subgame unlocks its symbol and reveal card once.
- [ ] Final celebration triggers once and continues to final scene.

#### 03B · Tab Switch (Blocker)
- [ ] Hide halts VO and pauses timers.
- [ ] Show resumes with countdown and correct phase prompt.
- [ ] No duplicate VO/timers in repeated hide/show cycles.

#### 03C · Reload / Continue (Blocker)
- [ ] Reload in eyes subgame restores safely.
- [ ] Reload in ears rhythm restores safely.
- [ ] Reload in tusk progression restores safely.
- [ ] Reload during reveal card/completion avoids ghost states.

#### 03D · Idle Hints
- [ ] 3-level cadence works for each sub-phase.
- [ ] Hint target is phase-correct (eyes/ears/tusk note).
- [ ] Hints clear on interaction and reset on phase change.

#### 03E · Content (Opening/Completion + AutoReveal + Sidebar)
- [ ] Opening title: `Play the Notes`
- [ ] Opening description: `The mountain is listening. Follow the rhythm and see what awakens.`
- [ ] Completion title: `The Mountain Has Awakened!`
- [ ] Completion subtitle: `The rhythm echoed and the symbols stirred.`
- [ ] AutoReveal Eyes: `I notice the good.`
- [ ] AutoReveal Ears: `I listen with care.`
- [ ] AutoReveal Tusk: `I finish what I start.`
- [ ] Sidebar popup copy matches locked values.

#### 03F · VO + SFX
- [ ] Eyes/Ears/Tusk guidance VO maps correctly.
- [ ] No VO overlap under rapid user input.
- [ ] Audio OFF stops VO+SFX immediately.
- [ ] SFX present for correct/wrong/reveal/celebration.

#### 03G · Images/Assets
- [ ] Required assets load: mountain bg, symbol assets, notes/instruments, tusk visual set.
- [ ] `ear`/`ears` mapping displays correct icon content.
- [ ] No runtime 404 and no backup asset imports.

#### 03H · UX Polish
- [ ] Subgame transitions are understandable.
- [ ] Child always has a clear next action cue.
- [ ] Mobile layout remains stable.

### Scene 04 — Sacred Assembly (`SacredAssemblySceneV8.jsx`)

#### 04A · Phases
- [ ] 8-symbol queue runs with no duplication/skips.
- [ ] Card lifecycle works: `appear -> flipped -> side -> play -> feedback`.
- [ ] Correct placements lock zones.
- [ ] Wrong placements give soft feedback and recover to idle.
- [ ] Final 8/8 celebration and completion flow trigger once.

#### 04B · Tab Switch (Blocker)
- [ ] Hide stops VO and pauses timers.
- [ ] Show resumes with countdown and contextual prompt.
- [ ] Mid-card tab return preserves card phase safely.
- [ ] No ghost card/duplicate timers after return.

#### 04C · Reload / Continue (Blocker)
- [ ] Reload in mid-round restores round + placed zones + card state.
- [ ] Reload in completion preserves completion state and actions.
- [ ] Continue/Replay behave correctly after reload recovery.

#### 04D · Idle Hints
- [ ] Zone-hint escalation works (`hint` -> `hint-strong` -> `hint-final`).
- [ ] Hint targets active correct zone only.
- [ ] Hint resets correctly after interaction/round transition.

#### 04E · Content (Opening/Completion + Card/Hint VO Script)
- [ ] Opening title: `Shine Together`
- [ ] Opening description: `All the symbols are ready. Place them gently and watch them glow.`
- [ ] Completion title: `The Symbols Shine as One!`
- [ ] Completion subtitle: `The mountain glows brighter because of you.`
- [ ] Card VO keys mapped: `cardEyes`, `cardEars`, `cardTrunk`, `cardTusk`, `cardModak`, `cardLotus`, `cardBelly`, `cardMooshika`.
- [ ] Hint VO keys mapped: `hintEyes`, `hintEars`, `hintTrunk`, `hintTusk`, `hintModak`, `hintLotus`, `hintBelly`, `hintMooshika`.
- [ ] Final VO chain mapped: `finalYouFoundAll`, `finalNowComplete`, `finalAlwaysWithYou`.

#### 04F · VO + SFX
- [ ] Onboarding VO plays once.
- [ ] Card VO timing matches card phase.
- [ ] Correct/wrong VO feedback triggers in right moments only.
- [ ] Audio OFF immediately silences all speech and SFX.
- [ ] SFX present for tap/correct/wrong/sparkle/power/celebration.

#### 04G · Images/Assets
- [ ] Required assets load: final background, Ganesha illustration layers, symbol icons, celebration effects.
- [ ] Final scene uses approved `GaneshaIllustration.jsx` style consistently.
- [ ] No mixed old/new Ganesha part assets in active path.
- [ ] No image/audio 404 in full run.

#### 04H · UX Polish
- [ ] Card + canvas layout is readable on desktop/mobile.
- [ ] Progress (`x/8`) remains visible and accurate.
- [ ] Final celebration and completion CTA are clear and child-friendly.


## 12) DETAILED GAME MECHANICS + VO TRIGGER MAP (CODE-ALIGNED)

Use this section for final manual freeze validation of full interaction logic.

### Scene 01 ? Modak (`NewModakSceneV7.jsx`)

#### 12.01A ? Full Mechanics (exact flow)
- [ ] Opening modal CTA starts scene.
- [ ] Phase `mooshika_search` shows exactly 5 mounds.
- [ ] Wrong mound tap: wrong SFX + mound shake + small sparkle only; no lock/fade of mound.
- [ ] Correct mound tap: Mooshika reveal + sparkle + phase changes to `mooshika_found`.
- [ ] After reveal delay, SymbolAutoReveal opens for `mooshika`.
- [ ] Collect phase: exactly 3 modaks are collectible.
- [ ] Each modak tap adds one to basket and updates count.
- [ ] On collecting all 3, SymbolAutoReveal opens for `modak`.
- [ ] Feed phase: drag modak from basket to Ganesha target.
- [ ] Wrong/invalid drop: no feed increment.
- [ ] Correct drop: feed count increments; at 3 feeds -> transformed phase.
- [ ] Belly SymbolAutoReveal opens for `belly`.
- [ ] Final completion fireworks + completion modal trigger once.

#### 12.01B ? SymbolAutoReveal Card Content + VO
- [ ] Mooshika card content: `Mooshika` / `I can focus.`
- [ ] Modak card content: `Modak` / `I share with joy.`
- [ ] Belly card content: `Big Belly` / `I feel safe inside.`
- [ ] Card VO on reveal:
  - [ ] Mooshika -> `focusPower`
  - [ ] Modak -> `sharingPower`
  - [ ] Belly -> `gratitudePower`
- [ ] After card tap/complete, symbol flies to correct sidebar target.

#### 12.01C ? VO Trigger Map (phase-by-phase)
- [ ] Scene enter: `welcome`
- [ ] Search instruction: `findMooshika`
- [ ] Search idle (L2): `findMooshikaIdle`
- [ ] Correct mound success: `mooshikaFound`
- [ ] Collect start: `collectStart`
- [ ] Collect idle (L2): `collectIdleHint`
- [ ] Feed start: `feedGanesha`
- [ ] Feed idle (L2): `feedIdleHint`
- [ ] Final celebration VO: `sceneComplete`
- [ ] No VO duplication on tab return/reload.

### Scene 02 ? Pond (`PondSceneSimplifiedV4.jsx`)

#### 12.02A ? Full Mechanics (exact flow)
- [ ] Opening modal CTA starts scene.
- [ ] Lotus stage uses hold-to-bloom progression for 3 lotuses.
- [ ] Releasing hold early decays progress safely (no hard fail).
- [ ] After all 3 bloom, Lotus SymbolAutoReveal appears.
- [ ] Golden lotus stage: tap golden bud to continue.
- [ ] Elephant stage: tap elephant to activate trunk/water-drop path stage.
- [ ] Drag water drop along petal stepping stones.
- [ ] Off-path drag: drop fades and resets (soft fail), progression not corrupted.
- [ ] Reaching final target triggers golden bloom and Trunk SymbolAutoReveal.
- [ ] Completion celebration and modal fire once.

#### 12.02B ? SymbolAutoReveal Card Content + VO
- [ ] Lotus card content: `Lotus` / `I bloom in the mud!`
- [ ] Trunk card content: `Trunk` / `Strong and gentle!`
- [ ] Card fly-to-sidebar lands on correct icon.

#### 12.02C ? VO Trigger Map (phase-by-phase)
- [ ] Opening: `opening`
- [ ] Lotus gameplay prompt: `lotusRound`
- [ ] Golden bud prompt: `goldenLotus`
- [ ] Elephant/trunk prompt: `elephant`
- [ ] Trunk drag prompt: `trunkRound`
- [ ] Idle lotus: `idleLotus`
- [ ] Idle golden: `idleGolden`
- [ ] Idle elephant: `idleElephant`
- [ ] Completion: `complete`
- [ ] No VO stacking on rapid interactions.

### Scene 03 ? Symbol (`SymbolMountainSceneV3.jsx`)

#### 12.03A ? Full Mechanics (exact flow)
- [ ] Opening modal CTA starts scene.
- [ ] Eyes phase: child taps eyes and completes telescope discovery game.
- [ ] Eyes completion triggers Eyes SymbolAutoReveal.
- [ ] Ears phase unlocks after Eyes reveal completion.
- [ ] Ears rhythm game: 3 rounds/notes progress to golden notes.
- [ ] Wrong rhythm attempts allow retry; progression remains safe.
- [ ] Ears completion triggers Ears SymbolAutoReveal.
- [ ] Tusk phase unlocks after Ears reveal completion.
- [ ] Tusk phase: tap active golden notes; tusk power increments to completion.
- [ ] Tusk completion triggers Tusk SymbolAutoReveal.
- [ ] Final celebration + completion modal trigger once.

#### 12.03B ? SymbolAutoReveal Card Content + VO
- [ ] Eyes card: `Eyes` / `I notice the good.`
- [ ] Ears card: `Ears` / `I listen with care.`
- [ ] Tusk card: `Tusk` / `I finish what I start.`
- [ ] Card fly-to-sidebar lands on correct icon each time.

#### 12.03C ? VO Trigger Map (phase-by-phase)
- [ ] Opening: `opening`
- [ ] Eyes phase prompt: `eyes`
- [ ] Ears phase prompt: `ears`
- [ ] Tusk phase prompt: `tusk`
- [ ] Idle eyes: `idleEyes`
- [ ] Idle ears: `idleEars`
- [ ] Idle tusk: `idleTusk`
- [ ] Completion: `complete`
- [ ] Ears success rotation lines behave correctly.
- [ ] Wrong attempt lines do not spam.

### Scene 04 ? Sacred Assembly (`SacredAssemblySceneV8.jsx`)

#### 12.04A ? Full Mechanics (exact flow)
- [ ] Opening modal CTA starts scene.
- [ ] Symbol queue contains 8 unique symbols and starts round 1.
- [ ] Card phase order per round is exact: `appear -> flipped -> side -> play -> feedback`.
- [ ] In `play`, only correct body zone accepts current symbol.
- [ ] Wrong zone tap: wrong feedback + recovery to idle, no accidental placement.
- [ ] Correct zone tap: placement locks zone + sparkle + next round increments.
- [ ] Already placed zones remain protected.
- [ ] Round 8 completion triggers final celebration chain and completion modal.

#### 12.04B ? Card Content + Card VO + Hint VO
- [ ] Card text matches `SACRED_SYMBOLS.associationText` for each symbol:
  - [ ] Eyes: `My big eyes help me see everything clearly.`
  - [ ] Ears: `My big ears listen to everything you say.`
  - [ ] Trunk: `My trunk is strong and helps me move things.`
  - [ ] Tusk: `My tusk helps me stay strong and brave.`
  - [ ] Modak: `My modak reminds me to share sweetness.`
  - [ ] Lotus: `My lotus helps me stay calm and peaceful.`
  - [ ] Belly: `My big belly holds lots of love inside.`
  - [ ] Mooshika: `My little friend helps guide me on my path.`
- [ ] Card VO map key validation:
  - [ ] `cardEyes`, `cardEars`, `cardTrunk`, `cardTusk`, `cardModak`, `cardLotus`, `cardBelly`, `cardMooshika`
- [ ] Hint VO map key validation:
  - [ ] `hintEyes`, `hintEars`, `hintTrunk`, `hintTusk`, `hintModak`, `hintLotus`, `hintBelly`, `hintMooshika`
- [ ] Round-1 onboarding line: `onboardingTapRightPart` plays once.

#### 12.04C ? VO Trigger Map (phase-by-phase)
- [ ] Opening modal/entry: `openingModalPrompt`
- [ ] Card phase (`play` start): card VO for current symbol
- [ ] Idle escalation in play: symbol-specific hint VO
- [ ] Correct placement feedback rotates among:
  - [ ] `correctYes`
  - [ ] `correctThatsRight`
  - [ ] `correctYouFoundIt`
  - [ ] `correctWellDone`
- [ ] Wrong placement feedback: `wrongTryAgain`
- [ ] Final chain in order:
  - [ ] `finalYouFoundAll`
  - [ ] `finalNowComplete`
  - [ ] `finalAlwaysWithYou`
- [ ] No duplicate VO after tab return or mid-round reload.


## 13) IDLE HINT MATRIX (ALL PHASES, ALL 4 SCENES)

Use this as a strict manual QA grid so no phase ships without idle behavior validation.

Global idle rules (apply to every active gameplay phase):
- [ ] L1 hint starts around ~10s inactivity.
- [ ] L2 hint starts around ~18s inactivity.
- [ ] L3 hint starts around ~26s inactivity.
- [ ] Hint clears immediately on valid user interaction.
- [ ] Hint resets on phase change.
- [ ] Hint cadence restarts after tab return (post countdown).
- [ ] No duplicate idle VO in same phase cycle.

### 13A ? Scene 01 Modak (`NewModakSceneV7.jsx`)

#### Phase: `mooshika_search`
- [ ] L1 visual hint appears on mounds.
- [ ] L2 VO: `findMooshikaIdle`.
- [ ] L3 stronger visual/gesture appears.
- [ ] Wrong mound tap clears/restarts idle cadence correctly.
- [ ] Correct mound tap clears hint state and advances phase.

#### Phase: `modaks_unlocked` / `some_collected`
- [ ] L1 visual hint points to remaining modaks.
- [ ] L2 VO: `collectIdleHint`.
- [ ] L3 stronger visual cue appears.
- [ ] Each valid modak tap resets idle timer.
- [ ] On full collection, hints clear and do not leak into next phase.

#### Phase: `rock_visible` / `rock_feeding`
- [ ] L1 visual hint points basket -> target.
- [ ] L2 VO: `feedIdleHint`.
- [ ] L3 stronger drag cue/gesture appears.
- [ ] Successful drop resets idle timer.
- [ ] On transformation phase, feed hints fully clear.

#### Non-interactive phases (`mooshika_found`, reveal, final completion)
- [ ] No gameplay idle hints should appear.
- [ ] No stale idle VO from previous phase should fire.

### 13B ? Scene 02 Pond (`PondSceneSimplifiedV4.jsx`)

#### Phase: `initial` / `some_bloomed`
- [ ] L1 visual hint targets an unbloomed lotus.
- [ ] L2 VO: `idleLotus`.
- [ ] L3 stronger lotus cue/pointer appears.
- [ ] Hold interaction resets timer immediately.
- [ ] Bloomed lotuses are not hinted as primary targets.

#### Phase: `golden_visible`
- [ ] L1 visual hint highlights golden bud.
- [ ] L2 VO: `idleGolden`.
- [ ] L3 stronger golden-bud cue appears.
- [ ] Golden tap clears hint state and advances safely.

#### Phase: `elephant_visible`
- [ ] L1 visual hint highlights elephant interaction.
- [ ] L2 VO: `idleElephant`.
- [ ] L3 stronger cue appears.
- [ ] Elephant tap clears hint state and advances.

#### Phase: `elephant_transformed` (drag path)
- [ ] Idle behavior still nudges water-drop path interaction (if active in this phase).
- [ ] No lotus/golden stale hints appear.
- [ ] Interaction with drop/petals resets timer.

#### Non-interactive phases (`all_bloomed`, `golden_bloom`, `complete`)
- [ ] No stale gameplay idle hints should fire.

### 13C ? Scene 03 Symbol (`SymbolMountainSceneV3.jsx`)

#### Phase: `eyes_game`
- [ ] L1 visual hint targets eyes entry interaction.
- [ ] L2 VO: `idleEyes`.
- [ ] L3 stronger cue/pointer appears.
- [ ] Entering telescope game resets hint cycle.

#### Phase: `ears_game`
- [ ] L1 visual hint targets ears interaction.
- [ ] L2 VO: `idleEars`.
- [ ] L3 stronger cue/pointer appears.
- [ ] Rhythm interactions reset idle timer.
- [ ] No eyes-phase idle VO leaks here.

#### Phase: `tusk_game`
- [ ] L1 visual hint targets active golden note.
- [ ] L2 VO: `idleTusk`.
- [ ] L3 stronger cue/pointer appears.
- [ ] Note tap resets timer.
- [ ] No ears/eyes stale hints during tusk phase.

#### Non-interactive phases (`eyes_complete`, `ears_complete`, `tusk_complete`, `all_complete`)
- [ ] No gameplay idle hints should fire during reveal/celebration.

### 13D ? Scene 04 Sacred Assembly (`SacredAssemblySceneV8.jsx`)

#### Card phases (`appear`, `flipped`, `side`)
- [ ] No zone idle glow until active play begins.
- [ ] Card VO can play without idle hint overlap.

#### Phase: `play` (per round)
- [ ] L1 zone state moves to `hint` on current correct zone.
- [ ] L2 zone state moves to `hint-strong`.
- [ ] L2/L3 symbol-specific hint VO (from `HINT_VO_MAP`) fires once per round cycle.
- [ ] L3 zone state moves to `hint-final`.
- [ ] Any valid interaction resets hint ladder for that round.
- [ ] Wrong tap handling does not break subsequent idle hints.

#### Phase: `feedback`
- [ ] Idle hints pause/suppress while feedback animation/VO runs.
- [ ] Next round starts with clean hint state.

#### Round transitions
- [ ] Idle hint state fully resets each new round.
- [ ] No previous round hint VO repeats in new round.

#### Completion state
- [ ] After 8/8 completion, no play-phase idle hint should fire.

### 13E ? Stress Tests for Idle System
- [ ] Tab away at L1, return, ensure ladder restarts cleanly.
- [ ] Tab away at L2 during idle VO, return, no VO duplication.
- [ ] Tab away at L3, return, no stuck pointer/glow.
- [ ] Hard reload mid-idle in each scene, no stale hint artifacts.
- [ ] Rapid interactions do not leave orphan hint overlays.


## 14) CROSS-SCENE INTEGRATION + EDGE CASES (ABOUT-ME FORMAT)

### 14A ? Cross-Scene Integration
- [ ] Scene chain works: `modak -> pond -> symbol -> final-scene`.
- [ ] Continue CTA from each completion modal goes to the correct next scene.
- [ ] Replay resets only current scene and does not corrupt other scene progress.
- [ ] Sidebar unlock progression remains consistent across all 4 scenes.
- [ ] Audio preference persists across all 4 scenes.
- [ ] Zone progress/badge increments correctly across scene completion.

### 14B ? Symbol Continuity
- [ ] Scene 01 unlocks: `mooshika`, `modak`, `belly`.
- [ ] Scene 02 unlocks: `lotus`, `trunk`.
- [ ] Scene 03 unlocks: `eyes`, `ears`, `tusk`.
- [ ] Scene 04 starts with all required symbols available.
- [ ] No duplicate or missing symbol state after scene transitions.

### 14C ? Image Continuity
- [ ] Symbol icon style family stays consistent (`*-new` assets) across all scenes.
- [ ] No old/backup image variant appears during active gameplay.
- [ ] Ganesha visual language is consistent and approved across scenes.
- [ ] No runtime 404 image/audio across complete zone run.

### 14D ? Content Continuity
- [ ] Opening modal tone and level are age-appropriate and consistent.
- [ ] Completion modal tone and level are age-appropriate and consistent.
- [ ] SymbolAutoReveal affirmations stay consistent with sidebar popup copy.
- [ ] Sacred Assembly card text matches final approved association text.

### 14E ? Edge Cases (Rapid Interaction)
- [ ] Double-tap on key actions does not duplicate progression.
- [ ] Rapid tap during VO does not create overlapping VO queue.
- [ ] Rapid close/open of overlays does not create ghost modals/cards.
- [ ] Rapid scene interactions do not bypass required progression gates.

### 14F ? Edge Cases (Tab/Reload)
- [ ] Tab switch during intro, mid-phase, reveal, and completion is stable in all scenes.
- [ ] Reload during intro, mid-phase, reveal, and completion is stable in all scenes.
- [ ] No duplicate countdown overlays on repeated tab returns.
- [ ] No stale timers, stale VO, or stale hint overlays after return.

### 14G ? Audio Edge Cases
- [ ] Toggle OFF mid-VO stops immediately.
- [ ] Toggle OFF mid-SFX stops immediately.
- [ ] Toggle ON resumes future cues without replay burst.
- [ ] Tab hide during VO does not replay old VO incorrectly on return.
- [ ] Wrong/correct feedback audio does not clip under rapid actions.

### 14H ? Final Freeze Gate
- [ ] All blocker sections in Scenes 01-04 are marked pass.
- [ ] All content/image/VO/SFX checks are pass.
- [ ] All idle-hint matrix checks are pass.
- [ ] Cross-scene integration and edge-case checks are pass.
- [ ] QA + Scene Owner + Product Owner sign-off completed.


## 15) SFX CUE MATRIX (WHEN EACH SOUND IS USED)

Purpose: tune/replace SFX by exact interaction moment.
Legend: `tap` = UI tap sound, `correct/chime` = success feedback, `wrong/oops` = error feedback, `sparkle` = visual reward, `powerUnlock` = reveal unlock, `celebration` = end celebration, `whoosh/pop` = transitions.

### 15A ? Global SFX Rules
- [ ] Audio toggle OFF must mute all SFX immediately.
- [ ] No SFX clipping on rapid taps.
- [ ] No double-trigger SFX for single interaction.
- [ ] Celebration SFX should not overlap into next scene after Continue.

### 15B ? Scene 01 Modak (`NewModakSceneV7.jsx`)
- [ ] Button tap (opening CTA, UI buttons): `tap`
- [ ] Mound tap (any mound): `tap`
- [ ] Wrong mound tap: `wrong/oops` + wrong shake visual
- [ ] Correct mound (Mooshika found): `correct/chime` + sparkle
- [ ] Modak collect tap: `tap` + reward sparkle
- [ ] Collect threshold reached (3/3): `powerUnlock` / reveal cue
- [ ] Drag start from basket: optional `tap`/pickup cue
- [ ] Correct drop on Ganesha target: `correct/chime` + sparkle
- [ ] Wrong/invalid drop: `wrong/oops` (if used) or safe no-op
- [ ] SymbolAutoReveal card appears/flips: `whoosh/pop` or reveal cue
- [ ] SymbolAutoReveal card complete/fly-to-sidebar: `powerUnlock` or `chime`
- [ ] Sidebar icon tap (unlocked): `tap`
- [ ] Sidebar popup close (tap outside): `tap` (if configured)
- [ ] Final fireworks/completion: `celebration`

### 15C ? Scene 02 Pond (`PondSceneSimplifiedV4.jsx`)
- [ ] Button tap (opening CTA, UI buttons): `tap`
- [ ] Lotus hold/tap start: `tap`
- [ ] Lotus bloom success: `correct/chime` + sparkle
- [ ] All lotuses complete gate: `powerUnlock`
- [ ] Golden lotus tap: `tap` then `correct/chime`
- [ ] Elephant tap: `tap` then `correct/chime`
- [ ] Water drop drag start: `tap`/pickup cue
- [ ] Wrong/off-path drag reset: `wrong/oops` or soft reset cue
- [ ] Final path success to target: `correct/chime` + sparkle stream
- [ ] SymbolAutoReveal card appears/flips: `whoosh/pop` or reveal cue
- [ ] SymbolAutoReveal card complete/fly-to-sidebar: `powerUnlock` or `chime`
- [ ] Sidebar icon tap/popup close: `tap`
- [ ] Final celebration/completion: `celebration`

### 15D ? Scene 03 Symbol (`SymbolMountainSceneV3.jsx`)
- [ ] Button tap (opening CTA, UI buttons): `tap`
- [ ] Eyes symbol tap/start: `tap`
- [ ] Eyes game item discovery: `correct/chime` + sparkle
- [ ] Eyes game completion: `powerUnlock`
- [ ] Ears symbol tap/start: `tap`
- [ ] Ears correct rhythm note/round: `correct/chime`
- [ ] Ears wrong input: `wrong/oops`
- [ ] Ears full completion: `powerUnlock` + celebration sparkle
- [ ] Tusk active note tap: `tap` + correct progression cue
- [ ] Tusk wrong/inactive note tap: `wrong/oops` (if wired)
- [ ] Tusk completion: `powerUnlock`
- [ ] SymbolAutoReveal card appears/flips: `whoosh/pop` or reveal cue
- [ ] SymbolAutoReveal card complete/fly-to-sidebar: `powerUnlock` or `chime`
- [ ] Sidebar icon tap/popup close: `tap`
- [ ] Final scene completion: `celebration`

### 15E ? Scene 04 Sacred Assembly (`SacredAssemblySceneV8.jsx`)
- [ ] Button tap (opening CTA, UI buttons): `tap`
- [ ] Round card appear/flip/side transition: `whoosh/pop` cues
- [ ] Card VO moments: ensure SFX does not mask VO
- [ ] Tap during play phase (symbol/zone interaction): `tap`
- [ ] Wrong zone click: `wrong/oops`
- [ ] Correct zone placement: `correct/chime` + local sparkle
- [ ] Round feedback/advance to next card: `whoosh/pop` transition cue
- [ ] Idle hint visual escalation: optional subtle nudge SFX (if used)
- [ ] Round 8 completion fireworks/orbs: `celebration`
- [ ] Completion modal CTA actions: `tap`

### 15F ? Manual SFX Tuning Pass (What to Listen For)
- [ ] Button tap is soft, quick, not harsh.
- [ ] Wrong click is clear but gentle (no punishment feel).
- [ ] Correct click is rewarding and distinct from tap.
- [ ] Card flip sound matches animation timing.
- [ ] Card close/complete transition sound is satisfying and short.
- [ ] Celebration sound feels bigger than normal correct cues.
- [ ] SFX loudness is balanced across all 4 scenes.
- [ ] No VO masking (speech should remain intelligible over SFX).


## 16) VO CUE MATRIX (WHAT PLAYS WHEN)

Purpose: exact VO event mapping for review/rewrite/re-record.

### 16A ? Global VO Rules
- [ ] Opening VO plays once per fresh scene entry.
- [ ] Return-from-tab VO is contextual and non-duplicative.
- [ ] Idle VO plays only once per idle cycle level (no spam).
- [ ] VO stops immediately on Audio OFF.
- [ ] VO does not overlap with other VO.
- [ ] VO remains understandable over SFX.

### 16B ? Scene 01 Modak (`NewModakSceneV7.jsx`)

#### Entry + Core Progression VO
- [ ] `welcome` on opening start
- [ ] `findMooshika` when search phase begins
- [ ] `mooshikaFound` on correct mound success
- [ ] `collectStart` when modak collection phase starts
- [ ] `feedGanesha` when feed phase starts
- [ ] `sceneComplete` at final celebration

#### Idle VO
- [ ] `findMooshikaIdle` in `mooshika_search` idle L2
- [ ] `collectIdleHint` in collect phase idle L2
- [ ] `feedIdleHint` in feed phase idle L2

#### SymbolAutoReveal/Card VO
- [ ] Mooshika reveal: `focusPower`
- [ ] Modak reveal: `sharingPower`
- [ ] Belly reveal: `gratitudePower`

#### Manual rewrite slots
- [ ] Rewrite `welcome` line
- [ ] Rewrite `findMooshikaIdle` line
- [ ] Rewrite `sceneComplete` line

### 16C ? Scene 02 Pond (`PondSceneSimplifiedV4.jsx`)

#### Entry + Core Progression VO
- [ ] `opening` on scene entry
- [ ] `lotusRound` during lotus gameplay stage
- [ ] `goldenLotus` when golden lotus step activates
- [ ] `elephant` when elephant interaction starts
- [ ] `trunkRound` during water-drop drag path phase
- [ ] `complete` on completion

#### Idle VO
- [ ] `idleLotus` in lotus idle
- [ ] `idleGolden` in golden lotus idle
- [ ] `idleElephant` in elephant/drag stage idle

#### SymbolAutoReveal/Card VO
- [ ] Lotus reveal line timing feels right
- [ ] Trunk reveal line timing feels right

#### Manual rewrite slots
- [ ] Rewrite `lotusRound`
- [ ] Rewrite `idleGolden`
- [ ] Rewrite `complete`

### 16D ? Scene 03 Symbol (`SymbolMountainSceneV3.jsx`)

#### Entry + Core Progression VO
- [ ] `opening` on scene entry
- [ ] `eyes` when eyes phase is active
- [ ] `ears` when ears phase is active
- [ ] `tusk` when tusk phase is active
- [ ] `complete` when all 3 symbols are done

#### Idle VO
- [ ] `idleEyes` in eyes phase idle
- [ ] `idleEars` in ears phase idle
- [ ] `idleTusk` in tusk phase idle

#### Correct/Wrong feedback VO
- [ ] Ears success cues (round feedback) are clear and not repetitive
- [ ] Wrong-attempt cues are gentle and not spammy

#### SymbolAutoReveal/Card VO
- [ ] Eyes card affirmation timing
- [ ] Ears card affirmation timing
- [ ] Tusk card affirmation timing

#### Manual rewrite slots
- [ ] Rewrite `eyes`
- [ ] Rewrite `idleEars`
- [ ] Rewrite `complete`

### 16E ? Scene 04 Sacred Assembly (`SacredAssemblySceneV8.jsx`)

#### Opening + Onboarding VO
- [ ] `openingModalPrompt` on first entry
- [ ] `onboardingTapRightPart` in first-round guidance

#### Per-card VO (card identity cue)
- [ ] `cardEyes`
- [ ] `cardEars`
- [ ] `cardTrunk`
- [ ] `cardTusk`
- [ ] `cardModak`
- [ ] `cardLotus`
- [ ] `cardBelly`
- [ ] `cardMooshika`

#### Per-symbol hint VO (idle/play guidance)
- [ ] `hintEyes`
- [ ] `hintEars`
- [ ] `hintTrunk`
- [ ] `hintTusk`
- [ ] `hintModak`
- [ ] `hintLotus`
- [ ] `hintBelly`
- [ ] `hintMooshika`

#### Correct/Wrong feedback VO
- [ ] Correct rotation uses all four naturally:
  - [ ] `correctYes`
  - [ ] `correctThatsRight`
  - [ ] `correctYouFoundIt`
  - [ ] `correctWellDone`
- [ ] Wrong placement uses `wrongTryAgain`

#### Final completion VO chain
- [ ] `finalYouFoundAll`
- [ ] `finalNowComplete`
- [ ] `finalAlwaysWithYou`
- [ ] Final chain order/timing feels emotionally right

#### Manual rewrite slots
- [ ] Rewrite any `card*` label lines
- [ ] Rewrite any `hint*` affirmation lines
- [ ] Rewrite final 3-line chain

### 16F ? VO Editing Workflow Checklist
- [ ] Identify target key(s) to change.
- [ ] Update source text in VO config or scene VO object.
- [ ] Validate tab return/reload does not duplicate new line.
- [ ] Validate line length works for age 5-12 pacing.
- [ ] Validate SFX ducking/spacing around updated VO.
- [ ] Re-run one full scene manual pass after each VO batch change.
