# GMB Scene Launch Checklist

Legend:

- 🟦 **Agent** = code/static/live-browser automation can check
- 🟧 **Manual** = real device or human judgment required
- 🟪 **Both** = agent can pre-check, manual should confirm

## 0. Audit Ground Rules
- 🟦 Read current `GMB_AUDIT_PUNCHLIST.md` before flagging anything.
- 🟦 Do not re-report items already marked fixed or documented as known judgment calls.
- 🟦 Confirm every finding by direct file read immediately before reporting.
- 🟦 Use `src/App.jsx` as the source of truth for live scene files.
- 🟦 Ignore backup/V1/old/copy files unless imported by `src/App.jsx`.
- 🟦 Cross-check absence against `NewModakSceneV7.jsx` before flagging missing patterns.
- 🟦 Do not assume missing `useSceneReset` or direct `GameStateManager.saveGameState` is a bug if the scene intentionally relies on `SceneManager` persistence.

## 1. Live Scene Source
- 🟦 Confirm live scene file from `src/App.jsx`.
- 🟦 Confirm child mini-games used by the live scene.
- 🟦 Confirm CSS files actually imported by the live scene/child game.

## 2. Required Scene UI
- 🟦 `HomeButton` present or intentionally replaced.
- 🟦 `ZoneBadgeButton` / back-to-zone control present or intentionally replaced.
- 🟦 `AudioToggle` present if scene has audio.
- 🟦 `VOReplayButton` present where VO guidance is used, unless scene pattern intentionally omits it.
- 🟦 `SceneCompletionCelebration` appears on scene completion.
- 🟪 Completion modal has correct scene name, symbols, stars, and next-scene text.

## 3. Completion & Progress
- 🟦 Completion saves immediately and only once.
- 🟦 Persistence path is present, either direct calls or verified `SceneManager`/shared component behavior.
- 🟦 `ProgressManager.updateSceneCompletion` or equivalent completion update happens.
- 🟦 Map/zone unlock state updates correctly after completion.
- 🟦 Replay resets the scene cleanly.
- 🟦 Continue routes to the correct next scene.
- 🟦 Reload after completion restores completion state correctly.
- 🟦 Absence of direct save calls is checked against benchmark/shared persistence before flagging.

## 4. Audio, VO, Timers
- 🟪 Audio toggle mutes VO, music, and SFX consistently.
- 🟪 VO replay button replays the correct current line.
- 🟪 No overlapping VO when tapping quickly.
- 🟦 No delayed/idle VO fires after phase change.
- 🟦 No delayed/idle VO fires after navigation.
- 🟦 Scene audio stops on unmount.
- 🟦 All timers, intervals, and RAF loops are cleared on unmount.
- 🟦 Active timers, intervals, and RAF loops pause or clean up on pause/modal interrupt.
- 🟪 Tab hidden/app background pauses active timers, RAF loops, and audio loops where relevant.

## 5. Modal Interrupt Behavior
- 🟦 Blocking modals pause gameplay/timers.
- 🟪 Blocking modals stop active VO immediately.
- 🟦 Closing the modal resumes gameplay.
- 🟪 Closing the modal replays the current relevant VO from the start.
- 🟪 Closing the modal does not replay VO if audio is muted.
- 🟪 Repeated modal open/close does not stack duplicate VO.
- 🟦 If phase changes while modal is open, resumed VO matches the current phase.
- 🟪 Symbol sidebar modals follow this rule.
- 🟪 Shloka River app/chant/practice modals follow this rule.
- 🟪 Opening/mode-selection/pause/completion modals follow this rule.
- 🟪 Agent pre-check means confirming pause/stop/replay calls exist; manual confirms no audible overlap.

## 6. Navigation Audio Teardown
- 🟪 `HomeButton` stops active VO/music/SFX before navigation.
- 🟪 `ZoneBadgeButton` stops active VO/music/SFX before navigation.
- 🟪 Completion `Continue` stops scene audio before navigation.
- 🟪 Completion `Replay` clears old audio/timers before restart.
- 🟪 Any custom back/close scene-exit control stops audio before navigation.
- 🟪 Previous-scene audio never leaks into Zone Welcome, Map, or next scene.
- 🟪 Agent pre-check means confirming teardown calls exist; manual confirms no audible leak.

## 7. Drag / Hold / Swipe Safety
- 🟦 Every drag/hold mechanic has `onPointerCancel`.
- 🟦 Every drag/hold mechanic cleans up active state when paused.
- 🟦 Drag handlers using `setPointerCapture()` release capture correctly on `pointerup` and `pointercancel`.
- 🟪 If drag is interrupted, item returns to a valid resting place.
- 🟪 Finger leaving the element does not soft-lock the game.
- 🟪 Rapid drag/tap does not double-complete or skip required steps.
- 🟪 Wrong interaction gives clear visual/audio feedback.

## 8. Phone-First Layout Gate
- 🟦 Scene is checked at `667 x 375` phone landscape.
- 🟦 Scene is checked at `844 x 390` phone landscape.
- 🟦 Scene is checked at `932 x 430` large-phone landscape.
- 🟦 Scene is checked at `1024 x 768` iPad landscape.
- 🟦 Scene is checked at `1366 x 1024` iPad Pro landscape.
- 🟦 Use browser automation viewport resizing plus screenshots for each size.
- 🟦 No clipped instructions.
- 🟦 No hidden Home/Zone/Audio controls.
- 🟦 No overlapping modals or completion screens.
- 🟪 Drag targets are reachable by finger.
- 🟦 Text fits inside buttons/cards/modals.
- 🟪 Browser safe-area/notch/home-indicator does not cover controls.

## 9. Touch Targets
- 🟦 All interactive controls are at least `60px` touch targets.
- 🟦 Mobile breakpoints do not shrink targets below `60px`.
- 🟦 Drag/drop targets are at least `60px`.
- 🟦 Icon-only buttons still have adequate hit area.
- 🟦 Disabled states are visually clear.

## 10. Visual Design / Palette
- 🟦 Symbol Mountain uses `#FF5722`, `#FFD700`, `#FFF8E7`.
- 🟦 Shloka River uses `#2E7D32`, `#03A9F4`, `#E8F5E9`.
- 🟦 About Me Hut uses `#795548`, `#FF6B6B`, `#FBE9E7`.
- 🟦 Actual visible backgrounds match zone palette, not just root CSS vars.
- 🟦 Stale/dead CSS vars are not reported as visual bugs unless used in rendered UI.
- 🟦 No visible placeholder/debug UI.
- 🟧 Scene looks polished on phone and iPad.

## 11. Fonts & CSS Hygiene
- 🟦 Headings/buttons use Baloo 2.
- 🟦 Body text uses Nunito.
- 🟦 No Arial/system/Georgia/Comic Sans in live scene UI unless intentional.
- 🟦 No fixed-px `!important` size overrides for key responsive elements.
- 🟦 Fixed sizes use `clamp()` or shared responsive tokens where needed.
- 🟦 No duplicate/conflicting CSS rules that affect live layout.

## 12. Console / Debug Hygiene
- 🟦 No ungated `console.log`.
- 🟦 No ungated `console.warn` / `console.debug`.
- 🟦 Debug panels gated behind `import.meta.env.DEV` or explicit debug flag.
- 🟦 No `GameCoach` usage in live scene.
- 🟦 Dead `GameCoach` state removed or documented as intentionally inert.
- 🟪 No production console errors during live scene play.

## 13. Assets
- 🟦 All live images load successfully.
- 🟦 No missing audio files.
- 🟦 Prefer WebP for scene images.
- 🟦 PNG/JPG/GIF usage is intentional and listed.
- 🟦 Production build has no broken asset paths.
- 🟪 Scene works after cache clear / slow network reload.

## 14. Content QA
- 🟪 Sanskrit/mantra spelling is correct.
- 🟪 Captions match VO.
- 🟪 Symbol names match across reveal, sidebar, and completion.
- 🟪 Symbol meanings/affirmations are consistent.
- 🟧 Instructions are child-clear.
- 🟦 No internal/debug copy visible to child.

## 15. Accessibility Basics
- 🟦 Buttons have useful accessible labels.
- 🟦 Image controls are actual buttons or keyboard-accessible controls.
- 🟦 Text contrast is readable over backgrounds.
- 🟪 Important information is not audio-only.
- 🟦 Reduced-motion settings do not break progress.

## 16. Fresh Profile / Saved Profile
- 🟦 Fresh profile can enter scene cleanly.
- 🟦 Opening modal appears at the right time.
- 🟦 Scene does not depend on stale localStorage.
- 🟦 Saved profile resumes/starts scene as intended.
- 🟦 Malformed localStorage does not break scene entry.

## 17. Agent Live-Browser Checks
- 🟦 Run scene in browser at required phone/iPad viewports.
- 🟦 Capture screenshot at each viewport.
- 🟦 Check console errors.
- 🟦 Check network asset failures.
- 🟦 Measure visible touch targets.
- 🟪 Open/close modals during VO.
- 🟪 Use Home/Zone/Continue during VO.
- 🟦 Complete scene enough to verify save/unlock/completion.
- 🟦 Re-read exact file/line before reporting any finding.

## 18. Manual Real-Device Checks
- 🟧 Real phone landscape playthrough.
- 🟧 Real iPad landscape playthrough.
- 🟧 Real finger drag/hold/swipe feel.
- 🟧 Lock screen / app switch / notification interruption.
- 🟧 Safari/iOS audio behavior.
- 🟧 Performance/jank on device.
- 🟧 Child understands what to do without adult explanation.
