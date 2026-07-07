# Current Session Review Breakdown

This file lists the review bug lists you shared in this chat for the files we changed.

- `DONE` = already done in code or done in this session
- `NOT DONE` = not done / not fully done in this session

## Symbol Mountain

### SymbolAutoReveal

Files:
- [src/lib/components/reveal/SymbolAutoReveal.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/reveal/SymbolAutoReveal.jsx)
- [src/lib/components/reveal/SymbolAutoReveal.css](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/reveal/SymbolAutoReveal.css)

Bug list from review:
- `DONE` Particle burst was one-sided.
- `DONE` `sar-ready` was a dead class.
- `DONE` Duplicate Google Fonts `@import` in component CSS.
- `DONE` Possible VO collision path was addressed.
- `DONE` Missing fallback when `sidebarTargetRect` was absent.
- `DONE` Early taps being swallowed before ready.
- `DONE` Inconsistent instruction language between text and VO.
- `DONE` Missing tap SFX.
- `DONE` `enableVoicePrompts = true` default path update.
- `DONE` Empty CSS sections / duplicate `.sar-wrap--fly` cleanup.
- `DONE` Timing comments/header mismatch cleanup.

Extra observations:
- The timer bookkeeping itself was already solid before the patch set.

### SymbolSidebar

Files:
- [src/zones/symbol-mountain/shared/components/SymbolSidebar.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/symbol-mountain/shared/components/SymbolSidebar.jsx)
- [src/zones/symbol-mountain/shared/components/SymbolSidebar.css](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/symbol-mountain/shared/components/SymbolSidebar.css)
- [src/zones/symbol-mountain/shared/components/symbolCardContent.js](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/symbol-mountain/shared/components/symbolCardContent.js)

Bug list from review:
- `DONE` `eyes` / `eye` key mismatch that broke the Eyes card.
- `DONE` Dead `iconSrc` prop / misleading comment.
- `DONE` Locked icons swallowing taps with no feedback.
- `DONE` Touch target improvements on the rail.
- `DONE` Missing audio feedback on key taps.
- `DONE` Hover-only scale issue in center mode.
- `NOT DONE` `tappedSymbols` persistence across mounts.
- `NOT DONE` Center-mode text-only instruction for non-readers.
- `DONE` Duplicate Google Fonts `@import`.
- `DONE` Old commented `symbolInfo` cleanup.
- `DONE` Unused CSS / stale animation cleanup in the reviewed pass.

Extra observations:
- The Eyes mismatch was the clearest shipped child-facing bug in this group.

### Scene 1 - Modak

File:
- [src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx)

Bug list from review:
- `DONE` Debug UI is gated behind `MODAK_DEBUG_UI_ENABLED`.
- `DONE` Missing-phase backfill was moved out of render and into an effect.
- `DONE` Voice profile is aligned to `age: 7`.
- `DONE` Completion persistence path writes through `GameStateManager` and flows into the completion UI correctly.
- `DONE` `InnerMandala` uses the active profile name instead of a hardcoded child name.
- `DONE` Idle gesture hint is rendered in the live scene.
- `NOT DONE` Some raw `setTimeout` calls still remain in the scene; the timer cleanup is improved but not fully systemic.
- `NOT DONE` A few legacy / commented timing branches are still present and were not fully removed in this session.

Extra observations:
- This scene was already in better shape than Pond and Tusk by the time of the last pass.

### Scene 2 - Pond

File:
- [src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx)

Bug list from review:
- `DONE` Audio-off reload softlock in the restore effect was fixed.
- `DONE` Two-finger lotus stale-closure overwrite was fixed with live-state handling.
- `DONE` Missing-phase backfill was moved out of render and into an effect.
- `DONE` Voice profile is aligned to `age: 7`.
- `DONE` Finale persistence now goes through a shared `persistPondCompletion()` path, so `GameStateManager` and `ProgressManager` stay in sync.
- `DONE` `InnerMandala` now uses the profile name instead of hardcoded `Friend`.
- `DONE` Leftover `useGameCoach` usage was removed.
- `DONE` Completion VO collision around the trunk reveal was addressed by gating the generic completion prompt.
- `NOT DONE` Dead legacy mission/discovery scaffolding still remains in the file, including `showPowerMission`, `showResumePopup`, and the disabled discovery flip blocks.
- `NOT DONE` The unreachable dead-code cleanup for the old mission path was not fully finished in this session.

Extra observations:
- The highest-risk functional Pond bugs are fixed; what remains is mostly cleanup debt.

### Scene 3 - Tusk

File:
- [src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx)

Bug list from review:
- `DONE` Missing-phase backfill was moved out of render and into an effect.
- `DONE` Analytics hooks were added; the scene now records start / abandon / completion.
- `DONE` Voice profile is aligned to `age: 7`.
- `DONE` Idle gesture hint now renders in the live scene.
- `DONE` `InnerMandala` uses the profile name.
- `DONE` Completion persistence writes through `ProgressManager`.
- `NOT DONE` The bright `Test Tusk` button is still present in the live scene and is not gated behind a debug flag.
- `NOT DONE` Some raw `setTimeout` usage still remains around scene flow and sparkle timing.
- `NOT DONE` The broader cleanup of reveal / timer scheduling was not finished as a full systemic pass.

Extra observations:
- This scene improved a lot, but the visible `Test Tusk` button is still the biggest child-facing risk left in Symbol Mountain.

### Scene 4 - Sacred Assembly

Files:
- [src/zones/symbol-mountain/scenes/final scene/SacredAssemblySceneV8.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/symbol-mountain/scenes/final%20scene/SacredAssemblySceneV8.jsx)
- [src/zones/symbol-mountain/scenes/final scene/SacredAssemblyScene.css](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/symbol-mountain/scenes/final%20scene/SacredAssemblyScene.css)

Bug list from review:
- `DONE` The finale profile crash was already fixed in live code; `playerName` uses optional chaining/fallback.
- `DONE` Completion modal gating now waits for both the orbs/fireworks and the finale VO chain.
- `DONE` Play-phase card timers now pause correctly when the page is hidden instead of silently burning through hint escalation.
- `DONE` Remaining live-path micro-timers were moved onto the tracked timeout path in the scene.
- `DONE` Completion-screen exit now clears pending timers and stops VO before navigation.
- `DONE` Production debug log spam was reduced substantially.
- `DONE` Unused `MagicalCardFlip` import and stale `showMagicalCard` state were removed.
- `DONE` `OpeningModal` `isOpen` usage is valid against the shared component.
- `DONE` iOS `-webkit-backdrop-filter` is already present in the live CSS.
- `NOT DONE` Infinite placed-symbol sparkle loops (`fadeOut={false}`) are still present.
- `NOT DONE` Some debug / dead-code leftovers still remain, including the old `playSound` helper and a few dev-only console lines in disabled UI paths.

Extra observations:
- By the time this scene was patched, several of the originally reported review items were already fixed in the live file.

## Completion And Celebration

### SceneCompletionCelebration

Files:
- [src/lib/components/celebration/SceneCompletionCelebration.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/celebration/SceneCompletionCelebration.jsx)
- [src/lib/components/celebration/SceneCompletionCelebration.css](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/celebration/SceneCompletionCelebration.css)

Bug list from review:
- `DONE` Undefined `starsEarned` causing save failure.
- `DONE` Skip button dead because `onSkip` was missing.
- `DONE` Uncleaned staggered symbol timeouts.
- `DONE` Persistence effect missing `completionData` dependency handling.
- `DONE` Short-screen / iOS card clipping issue.
- `NOT DONE` Broader theme/update nuance around `resolvedZoneId` effect behavior.
- `DONE` Debug `console.log` cleanup.
- `NOT DONE` Theme adapter font-chain verification question was not part of the code pass.

Extra observations:
- You explicitly asked not to keep the old stars-earned fallback behavior.

### InnerMandala

Files:
- [src/lib/components/celebration/InnerMandala.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/celebration/InnerMandala.jsx)
- [src/lib/components/celebration/InnerMandala.css](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/celebration/InnerMandala.css)

Bug list from review:
- `DONE` Fixed 520px non-responsive sizing.
- `DONE` Auto-close killing interactive mode.
- `DONE` Tap-to-skip plus interactive conflict.
- `DONE` Empty center-disc / unfinished look.
- `DONE` Silent celebration moment.
- `DONE` Middle-petal tap-target weakness.
- `DONE` Subtitle readability / visibility issue.
- `DONE` Expensive filter animation / reduced-motion gap.
- `DONE` Dead outer-symbol machinery cleanup.
- `DONE` Dead related CSS cleanup.
- `NOT DONE` Dead SVG width/height attributes were harmless and not prioritized.

Extra observations:
- This was one of the broader UX + perf cleanup passes in the session.

## Shared Modals

### OpeningModal

Files:
- [src/zones/shared/components/OpeningModal.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shared/components/OpeningModal.jsx)
- [src/zones/shared/components/OpeningModal.css](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shared/components/OpeningModal.css)

Bug list from review:
- `DONE` Bundle-bomb asset import problem.
- `DONE` Invisible icon labels on tablets.
- `DONE` Weak / unreliable CTA hint behavior on iOS.
- `DONE` `stopAllOpeningVoAudio` pausing looped ambient too broadly.
- `DONE` Mobile portrait clipping / no-scroll risk.
- `DONE` Missing `-webkit-backdrop-filter`.
- `DONE` Breakpoint gap cleanup.
- `DONE` Dead `.game-modal-button` CSS / dead keyframes cleanup.
- `DONE` Duplicated VO-monitor logic cleanup.
- `NOT DONE` T11 / fade-out interpretation question was not the direct code target.

Extra observations:
- The biggest wins here were bundle cleanup and making the modal clearer on tablets.

## Entry And Welcome Flow

### MainWelcomeScreen

Files:
- [src/lib/components/navigation/MainWelcomeScreen.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/navigation/MainWelcomeScreen.jsx)
- [src/lib/components/navigation/MainWelcomeScreen.css](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/navigation/MainWelcomeScreen.css)

Bug list from review:
- `DONE` Force-unmute bug on the welcome screen.
- `DONE` Dead VO block cleanup.
- `DONE` Dead hint-arrow feature cleanup.
- `DONE` Invalid CSS in `floatUp`.
- `DONE` Timeout cleanup around start-adventure path.
- `DONE` Console-log / fake analytics cleanup.
- `DONE` Large dead CSS tied to commented-out JSX.
- `NOT DONE` Portrait-phone title clipping was not the core fix target.
- `NOT DONE` iPhone ambient-volume fade limitation not fully solved.
- `NOT DONE` Ambient `.wav` payload concern not addressed here.
- `NOT DONE` Reduced-motion/video behavior not fully reworked.

Extra observations:
- This pass focused on removing broken and misleading behavior first.

### GaneshaIntroStory

Files:
- [src/components/GaneshaIntroStory.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/components/GaneshaIntroStory.jsx)
- [src/components/GaneshaIntroStory.css](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/components/GaneshaIntroStory.css)

Bug list from review:
- `DONE` Slide 1 VO could never play.
- `DONE` Force-unmute on every tap.
- `DONE` Dead / mismatched on-screen story text path.
- `DONE` Double-speak race.
- `DONE` Only the small arrow advancing the story.
- `DONE` Font/body-text styling issue.
- `DONE` Dead CSS cleanup.
- `DONE` Missing `-webkit-` prefix on `storySkip`.
- `DONE` Hover-only affordance on next arrow.
- `NOT DONE` Image preloading for next slide was not the main implemented focus.
- `NOT DONE` Cultural/story bridge phrasing question was not a code fix.
- `NOT DONE` No back-navigation was not added.

Extra observations:
- This was mainly a speech-flow and progression cleanup pass.

### CleanProfileSelector

Files:
- [src/lib/components/navigation/CleanProfileSelector.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/navigation/CleanProfileSelector.jsx)
- [src/lib/components/navigation/CleanProfileSelector.css](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/navigation/CleanProfileSelector.css)

Bug list from review:
- `DONE` No escape from the create-profile modal.
- `DONE` Stale `initialProfiles` prop syncing.
- `DONE` Long-press timer leak / missing `onTouchCancel`.
- `DONE` Silent failure when `createProfile` returned null.
- `DONE` New `AudioContext` created per avatar tap.
- `DONE` Dead import cleanup.
- `DONE` Small destructive touch-target / related CSS cleanup.
- `DONE` Hover-heavy stale CSS and large dead CSS block cleanup.
- `DONE` Duplicate Google Fonts `@import`.
- `DONE` Minor dead animation/code cleanup tied to the old flow.
- `NOT DONE` No mute toggle on this screen.
- `NOT DONE` Silent disabled state / step-1 guidance was not fully redesigned.
- `NOT DONE` Zero feedback on profile-select tap was not the main fix.
- `NOT DONE` Long-press discoverability/help-copy issue was not the main code change.

Extra observations:
- The key win here was making accidental entry into create-profile escapable.

### CleanGameWelcomeScreen

File:
- [src/lib/components/navigation/CleanGameWelcomeScreen.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/navigation/CleanGameWelcomeScreen.jsx)

Bug list from review:
- `DONE` Ambient audio respected the global mute flag.
- `DONE` `checkProgress` About Me Hut temp-key coverage / scene-list drift issue.
- `DONE` Dead `onClose` prop assumption for `CleanProfileSelector`.
- `DONE` Dead `getContinueJourneyDebugTarget` QA helper.
- `DONE` Unstyled loading fallback.
- `DONE` Unused / mathematically wrong `percentage` in `getCulturalProgress`.
- `DONE` Minor duplicate-call / IIFE cleanup.
- `NOT DONE` Unreachable reset-progress dialog was not one of the later selected tasks here.
- `NOT DONE` Ambient `.wav` payload concern not addressed here.
- `NOT DONE` No mute button on this screen.

Extra observations:
- You specifically selected a subset of the review items for this file, and the work followed that scope.

## Zone And Router Flow

### ZoneWelcome

File:
- [src/lib/components/zone/ZoneWelcome.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/zone/ZoneWelcome.jsx)

Bug list from review:
- `DONE` Shipped `DEBUG STATUS` button removal.
- `DONE` Fake `GameStateManager.isMuted` mute check.
- `DONE` Continue-highlight stale-progress issue.
- `DONE` Missing `key` on the mapped fragment/root element.
- `NOT DONE` Temp-completed unlock fallback reconciliation not fully fixed.
- `NOT DONE` Dead `activeCardPopSceneId` feature not fully removed.
- `NOT DONE` Confetti replaying every visit not addressed.
- `NOT DONE` Whisper dead-state cleanup not fully done.
- `NOT DONE` localStorage churn / console spam / memoization refactor not fully done.

Extra observations:
- This was intentionally a targeted pass on the review’s priority items.

### App Router

File:
- [src/App.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/App.jsx)

Bug list from review:
- `DONE` `SceneLoader` / `PlaceholderScene` defined inside `App`.
- `DONE` Unguarded `JSON.parse` during render and render-time side effects.
- `DONE` Zero-star scene completions not saving.
- `DONE` Cave finale id mismatch between `final-meaning-scene` and `mantra-assembly`.
- `DONE` Early return before hooks for `?engine-test`.
- `NOT DONE` Broader duplicated progression logic / scene registry consolidation not fully refactored.
- `NOT DONE` Dead `handleProfileChange` not the focus of this pass.
- `NOT DONE` Fake loading-theater sequence not reworked.
- `NOT DONE` Vestigial `MushikaLoader` plumbing not cleaned.
- `NOT DONE` Console-spam cleanup was not the main router focus.

Extra observations:
- This was the highest-risk functional pass in the session, and the main player-facing bugs were fixed.

## About Me Hut

### Family Tree

Files:
- [src/zones/about-me-hut/family-tree/Familytreegame.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/about-me-hut/family-tree/Familytreegame.jsx)
- [src/zones/about-me-hut/family-tree/Familytreegame.css](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/about-me-hut/family-tree/Familytreegame.css)

Bug list from review:
- `DONE` Child could get permanently stuck on the Ganesha-tree `Continue` button if Web Speech `onEnd` never fired. A failsafe + retriable path was added.
- `DONE` Replay silently killed all audio by forcing audio off.
- `DONE` Pause-aware timer handle mismatch across `scheduleTimeout` refs. A shared cancel helper was added and applied to the main affected refs.
- `DONE` `sceneActions.updateState(...)` during render for missing `gamePhase` was moved into an effect.
- `NOT DONE` Progress-save concern was not changed because [SceneCompletionCelebration.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/celebration/SceneCompletionCelebration.jsx) already persists completion internally.
- `DONE` `Done!` could finish the child tree with only one member. It now requires at least 2 members.
- `DONE` Milestone VO math was off (`childProgressNearFull` at 7 / `childProgressMid` at 10). Thresholds were corrected to `6` and `15`.
- `DONE` Wrong-choice unblock was too fast and could overlap VO. The unblock delay was increased and spoken VO is stopped in the wrong branch too.
- `DONE` Desktop-style `"Press Enter to add to tree"` hint was removed.
- `DONE` Sparkle count was reduced from `100 + 45` to `30 + 20`.
- `DONE` Dead fun-fact flow was disabled on the logic side so it no longer schedules or auto-closes during the placement sequence.
- `NOT DONE` The unreachable fun-fact modal JSX / `handleCloseFunFact` cleanup is still left in the file as dead code.

Extra observations:
- The biggest live child-facing risk here was the one-shot `Continue` softlock, and that was fixed.

### Favorite Food

Files:
- [src/zones/about-me-hut/food/Favoritefoodgame.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/about-me-hut/food/Favoritefoodgame.jsx)
- [src/zones/about-me-hut/food/Favoritefoodgame.css](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/about-me-hut/food/Favoritefoodgame.css)
- [src/zones/about-me-hut/components/AboutMeComparisonCard.css](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/about-me-hut/components/AboutMeComparisonCard.css)

Bug list from review:
- `DONE` Reload during `friend-celebration` could permanently suppress later VO. The reload-suppression arming logic was tightened to only cover the restart/replay phases.
- `DONE` Stale-closure writes to `storyDiscoveries` / `childDiscoveries` on delayed callbacks. A latest-scene-state ref path was added for those updates.
- `DONE` Completion screen `Back to Map` / `Home` leaked scene audio.
- `DONE` `pagehide` support is present for mobile/unload cleanup.
- `DONE` Shuffle-on-mount could overwrite persisted random order during reload hydration. The mount shuffle now skips reload restores.
- `DONE` Shared About-Me comparison card got the relevant scroll/breakpoint treatment for shorter screens and portrait tablet overflow.
- `DONE` Landscape breakpoint coverage was extended to `max-height: 1024px`.
- `DONE` Hardcoded completion `childName` was replaced with the profile display name.
- `DONE` Emoji fallback rendering was sanitized in the live UI path so failed images no longer show mojibake.
- `NOT DONE` Full-file UTF-8 cleanup / source re-save was not completed. Corrupted literals and comments still exist in the file.
- `NOT DONE` The review’s `friend-celebration renders nothing` UX blank beat was not changed in this pass.
- `NOT DONE` Wrong-tap VO remains mostly option-name based in the Ganesha choice path; the richer non-reader redirect copy was not broadly rewritten there.
- `NOT DONE` Dead-code and dead-CSS cleanup from the larger review was only partially addressed.

Extra observations:
- Two review items were already effectively covered before or during verification: `pagehide` was already wired, and the shared comparison overlay already had `-webkit-backdrop-filter`.

### Dreams & Wishes

Files:
- [src/zones/about-me-hut/enjoy/ObstacleRemoverGame.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/about-me-hut/enjoy/ObstacleRemoverGame.jsx)
- [src/zones/about-me-hut/enjoy/DreamsWishesGame.css](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/about-me-hut/enjoy/DreamsWishesGame.css)

Bug list from review:
- `DONE` Stale `isAudioOn` closure in `queueCompletionWithCheer`. The callback now depends on the live `speakLine`.
- `DONE` Reload into legacy `wish2-intro` / `wish3-intro` could softlock on blank screens. Reload now migrates those steps into playable active phases.
- `DONE` Wish-1 double-tap race / duplicate completion scheduling. Refs were added to guard tap counting and one-shot completion.
- `DONE` Idle-hint ladders were incorrectly gated off when audio was muted. Visual hint ladders now still run with audio off.
- `DONE` Return-hint retry could double-speak too aggressively. The retry delay was lengthened.
- `DONE` Unkind-bubble feedback spoke the harmful word. It now gives a gentle redirect line.
- `DONE` Completion `childName` was hardcoded and now uses the profile display name.
- `DONE` Completion exits (`Continue`, `Explore`, `Back to Map`, `Home`) now hard-stop scene audio before navigation.
- `DONE` Comparison overlay now has a short-landscape overflow treatment with scrolling and compaction.
- `NOT DONE` Dead code noted in the review (`handleWish3Tap`, test helpers, commented screens, backup-file hygiene) was not fully cleaned.
- `NOT DONE` Broader content/design concerns like home-language festival/content choices were not part of the code fix pass.

Extra observations:
- The review’s `backdrop-filter without -webkit-` item was already resolved in the live overlay CSS by the time this pass happened.

### My Indian Story

Files:
- [src/zones/about-me-hut/indian-story/MyIndianStoryGame.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/about-me-hut/indian-story/MyIndianStoryGame.jsx)
- [src/zones/about-me-hut/indian-story/MyIndianStoryGame.css](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/about-me-hut/indian-story/MyIndianStoryGame.css)

Bug list from review:
- `NOT DONE` The quoted `ProgressManager` missing-import crash was already fixed in the current file before this breakdown update, so no new code change was needed there.
- `DONE` Reload mid-scene could erase earlier answers because restore only touched SceneManager state. Reload restore now also repopulates the local `useState` selections.
- `DONE` Correct Sanskrit guess could softlock if TTS callbacks never fired. A fallback timeout was added.
- `DONE` Audio toggle was wired to plain `toggleAudio` and did not stop current voice. It now uses `handleAudioToggle`.
- `DONE` Story temp save key is now profile-scoped instead of one global `gmb_indian_story`.
- `NOT DONE` Full mojibake / UTF-8 cleanup in the file was not completed.
- `NOT DONE` Dedupe timestamp logic (`wasStepVoSpokenRecently`) was not reworked.
- `NOT DONE` Production `console.log` cleanup was not part of this pass.
- `NOT DONE` Duplicate inline keyframes / broader dead-state cleanup were not fully addressed.
- `NOT DONE` iPhone-landscape map/festival layout risk was not fixed in this pass.

Extra observations:
- This scene already had an explicit `ProgressManager.updateSceneCompletion(...)` call in the current code when we checked it.

## Shloka River

### Shared Components

Files:
- [src/lib/components/audio/SanskritVoiceRecorder.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/audio/SanskritVoiceRecorder.jsx)
- [src/lib/components/audio/SanskritVoiceRecorder.css](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/audio/SanskritVoiceRecorder.css)
- [src/zones/shloka-river/shared/AppSidebar.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/shared/AppSidebar.jsx)
- [src/zones/shloka-river/shared/AppSidebar.css](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/shared/AppSidebar.css)

Bug list from review:
- `DONE` Blob-URL leak from stale cleanup and retry path in `SanskritVoiceRecorder`.
- `DONE` Side effect inside state updater in recorder timer/stop logic.
- `DONE` Missing-audio dead end in recorder flow.
- `DONE` Mic denial was silent.
- `DONE` Recorder card clipped on iPhone landscape due to height/overflow issues.
- `NOT DONE` iPad center-mode panel trap / larger discovery-panel overflow issue was not fully solved.
- `DONE` Recorder-start reliability before `MediaRecorder` construction.
- `DONE` AppSidebar bloom timeout cleanup.
- `NOT DONE` `glow-indicator` / locked-attention nudge is still broader UI debt.
- `NOT DONE` Touch targets under 60px across sidebar/panel/close affordances were not fully redesigned.
- `NOT DONE` `allowSkip={false}` / shy-kid graceful path / broader audio-nuke concerns were not fully reworked.
- `NOT DONE` Hover-only feedback / tiny `tap-indicator` / overlay polish / duplicate fonts cleanup were not the focus of the implemented fixes.

Extra observations:
- The most concrete shared correctness fixes were recorder blob/timer cleanup and AppSidebar timeout cleanup. The rest of this shared review was mostly broader UX debt.

### Scene 1

Files:
- [src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx)
- [src/zones/shloka-river/scenes/Scene1/VakratundaRescueGame.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/scenes/Scene1/VakratundaRescueGame.jsx)
- [src/zones/shloka-river/scenes/Scene1/MahakayaRescueGame.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/scenes/Scene1/MahakayaRescueGame.jsx)
- [src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.css](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.css)

Bug list from review:
- `DONE` Dev test buttons shipped in production UI.
- `DONE` Pause dropped completion timers in both games and could softlock the scene.
- `DONE` Mahakaya completion could double-fire.
- `DONE` Micro-win rewards never fired because the parent passed empty handlers.
- `DONE` Replay muted audio permanently and completion was missing `ProgressManager.updateSceneCompletion(...)`.
- `DONE` VO replay played the wrong-stage Vakratunda prompt.
- `NOT DONE` Wrong-slot drop is still light on feedback. The hard shipped blocker was fixed work, but this richer feedback polish was not fully redesigned.
- `NOT DONE` Dead resume plumbing (`vakratundaGameState` / `mahakayaGameState`) was not fully removed or reworked.
- `NOT DONE` Large dead-code mass in the parent was not fully cleaned in this pass.
- `NOT DONE` Mahakaya intro VO still does not have the fuller first-interaction cancel pattern from later scenes.
- `NOT DONE` Dead CSS / folder hygiene / orphaned Scene1 files were not fully cleaned yet.

Extra observations:
- The main kid-facing correctness bugs in Scene 1 were fixed. The remaining items are mostly cleanup debt and richer interaction polish.

### Scene 2

Files:
- [src/zones/shloka-river/scenes/Scene2/SuryakotiBankSimplified.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/scenes/Scene2/SuryakotiBankSimplified.jsx)
- [src/zones/shloka-river/scenes/Scene2/components/SuryakotiGame.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/scenes/Scene2/components/SuryakotiGame.jsx)
- [src/zones/shloka-river/scenes/Scene2/components/SamaprabhaGame.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/scenes/Scene2/components/SamaprabhaGame.jsx)
- [src/zones/shloka-river/scenes/Scene2/components/SamaprabhaGame.css](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/scenes/Scene2/components/SamaprabhaGame.css)

Bug list from review:
- `DONE` Resize wiped `SuryakotiGame` progress mid-play.
- `DONE` Possible completion stall on iOS in `SuryakotiGame`.
- `DONE` Toggling audio mid-game replayed intro VO over gameplay.
- `DONE` Samaprabha save/restore machinery was dead code. The dead plumbing was removed instead of pretending restore worked.
- `DONE` Duplicate `samaprabhaSetup` object key.
- `DONE` Uncancelled raw timeouts on reveal/phase transitions.
- `DONE` Samaprabha snap dots needed a bigger hit area.
- `DONE` Replay permanently muted audio.
- `DONE` Missing `ProgressManager.updateSceneCompletion(...)` on completion.
- `DONE` Dead state cluster (`showPowerOverlay`, `showCenteredWord`, `currentWord`, `showAppDiscovery`, `openingVoPlayedRef`, etc.) was substantially cleaned down.
- `DONE` Idle-hint cycle disabled in `SamaprabhaGame`.
- `DONE` Legacy Scene2 CSS clutter / stale file cleanup was already in progress and matches the review direction.

Extra observations:
- Scene 2 is a good example of "some changes were already done": by the time of the last pass, most review items were already fixed in code and only the intro-VO replay regression still needed fresh work.

### Scene 3

Files:
- [src/zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx)
- [src/zones/shloka-river/scenes/Scene3/NirvighnamGame.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/scenes/Scene3/NirvighnamGame.jsx)
- [src/zones/shloka-river/scenes/Scene3/KurumeDevaGame.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/scenes/Scene3/KurumeDevaGame.jsx)

Bug list from review:
- `DONE` `updateState` called during render in the parent.
- `DONE` Hint system was fully dead in both games.
- `DONE` iOS completion-stall fallback gap in both games.
- `DONE` Audio toggle replayed intro VO over gameplay, and scene-level intro handling was tightened.
- `DONE` Mid-scene resume plumbing was dead. Save/restore props were wired into both games.
- `DONE` Uncancelled raw timeouts in `handleRevealComplete` / `handlePhaseComplete`.
- `DONE` Drag interactions were improved with pointer-capture / cleaner interaction handling.
- `DONE` Duplicated VO map assignments in the parent.
- `DONE` Replay muted audio permanently.
- `DONE` Missing `ProgressManager.updateSceneCompletion(...)` on completion.
- `NOT DONE` Dead state cluster in the parent (`showPowerOverlay`, `showCenteredWord`, `currentWord`, `savedRecordings`, inline `useRef(null)`, stale comments) was not fully cleaned.
- `NOT DONE` Minor wording inconsistency around `scene12_nir_drag` vs `nirv_hint` was not the priority fix.
- `DONE` Legacy `NirvighnamChant.css` twin / stale file cleanup direction was followed.

Extra observations:
- Scene 3 got the biggest functional pass after Scene 2. The main remaining debt is parent cleanup, not the live child flow.

### Scene 4

Files:
- [src/zones/shloka-river/scenes/scene4/SarvakaryeshuChantSimplified.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/scenes/scene4/SarvakaryeshuChantSimplified.jsx)
- [src/zones/shloka-river/scenes/scene4/SarvakaryeshuGame.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/scenes/scene4/SarvakaryeshuGame.jsx)
- [src/zones/shloka-river/scenes/scene4/SarvadaGame.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/scenes/scene4/SarvadaGame.jsx)

Bug list from review:
- `DONE` Bike before/after images were swapped.
- `DONE` iOS VO stall fallback needed in the parent completion/reveal path.
- `DONE` VO replay button played the wrong prompt for the current card / current time-of-day phase.
- `DONE` `*_COMPLETE` / `*_POWER` phases were never set.
- `NOT DONE` Wrong-answer feedback is still not fully audio-rich; the review's "text-only" UX concern was not comprehensively redesigned.
- `NOT DONE` Hint escalation still leans too quickly toward revealing the right answer; the deeper pedagogy tweak was not fully redone.
- `NOT DONE` Option touch-target sizing was not comprehensively re-measured/redesigned.
- `DONE` `_forceUpdate: Date.now()` junk key on `OpeningModal onStart`.
- `DONE` Resume plumbing was dead. Save/restore props were wired into both games.
- `DONE` Sarvada intro/interaction flow was improved through stop-voice handling on interaction.
- `DONE` Replay muted audio permanently / missing `ProgressManager` / raw reveal timeouts / legacy CSS cleanup were addressed as part of the wider Scene 4 pass.

Extra observations:
- Scene 4 was already in better shape than Scenes 2 and 3, so the implemented work mostly tightened correctness and replay/guidance consistency.

### Scene 5

Files:
- [src/zones/shloka-river/scenes/scene5/ShlokaRiverFinale.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/scenes/scene5/ShlokaRiverFinale.jsx)
- [src/zones/shloka-river/scenes/scene5/ShlokaRiverFinale.css](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/scenes/scene5/ShlokaRiverFinale.css)

Bug list from review:
- `DONE` Debug button shipped in production UI.
- `DONE` Reload during `SUCCESS` or `RECAP` could softlock the scene.
- `DONE` `OpeningModal` got a nonexistent prop (`buttonVisible` instead of `showButton`).
- `DONE` Success-to-recap chain could stall if VO callbacks misbehaved.
- `DONE` Recap boats were desynced from the spoken shloka.
- `DONE` Hint timers were not pause-aware.
- `NOT DONE` Missing zone-standard chrome / drag-edge snapback polish was not fully redesigned.
- `NOT DONE` Static instruction copy was not fully reworked in this pass.
- `DONE` `ProgressManager.updateSceneCompletion(...)` is present here and remains the correct pattern.
- `DONE` Missing `-webkit-backdrop-filter` on the tray.
- `DONE` Legacy `RiverFinaleEnhanced.*` / stale Scene5 file cleanup direction was followed.

Extra observations:
- Scene 5's main correctness work was making the finale recover gracefully from reloads and VO failures instead of depending on perfect timing.
