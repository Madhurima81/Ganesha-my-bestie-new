# CHANGELOG.md
Append one entry per work session. Newest on top.
## [2026-10-07] — Compact CTA modifier (phone landscape)
**Touched:** src/App.css, CleanProfileSelector.jsx, ProgressPopup.jsx + .css, ChantCardModal.jsx + .css.
**Changed:** New opt-in `.gmb-compact-cta` in App.css (phone landscape only): 36px painted pill, 13px text, `overflow: visible`, `::after` hit area (12px top/bottom, 6px sides = ~60px touch). NOT a global size — `PrimaryBtn` / `ProfilePillBtn` / `Button.css` / `.onb-btn` unchanged. Applied to Pick Friend "Let's go" (previously had no hit area), Practice Chanting, petal popup Continue + Play Sound (their duplicated size/::after rules removed). Rule of thumb locked with Madhurima: child compact CTA 36-40px visible, child one-clear-action CTA 48-60px, parent controls 44-48px+; touch target is separate from painted size. Keep >=12px between adjacent compact CTAs so hit areas don't overlap.
**Open:** ZoneWelcome keeps its own compact layout (not on the modifier). Verified at 740x360: popup Continue 90x36, Pick Friend 92x36, chant 140x36 (all 13px, hit area extends). The chant/game-test harness page does not import App.css (the real app does) — modal CSS now depends on the global modifier. Button audit rows (162 CSS rules) not written to a file.

## [2026-10-07] — Parent PIN + Parent Dashboard: phone landscape tune, final Help/About copy
**Touched:** src/lib/components/dashboard/PinScreen.jsx, src/lib/components/navigation/ParentDashboard.jsx + .css.
**Changed:** (phone = landscape, max-height 500, max-width 1023; iPad/desktop layout untouched)
- **PinScreen:** phone landscape is two-column (lock/title/subtitle/dots/error/"For parents only" left, 210px keypad right, 50px keys, no scroll). Info block wrapped in `.pin-screen__info`; error row reserves height so nothing jumps. PIN logic unchanged. Verified at 740x360: Create, Confirm, mismatch, Enter, wrong PIN.
- **ParentDashboard (minor tune, not a reflow):** header/tab/panel/setting-row padding moved from inline to `ParentDashboard.css` classes (`pd-*`). Short landscape: header subtitle hidden, tighter header/tabs/panel, tabs stick at 48px. Parent-facing touch targets: Close, tabs, setting actions, switches (hit area only; switch stays 46x26) and Help/About Back are >=44px. Scrolling kept (reading/settings content).
- **Help/About copy finalized:** new Help items (stale "Home button inside the scene" line removed), Help subtitle, About intro + Explore/Play/Remember/Use it, "let your child discover first" note, and a clearer on-device storage footer.
- Verified at 740x360 and 1024x768 with sample progress; screenshots in screenshots/mobile-parent-flow/ (not committed).
**Open:** `SUPPORT_EMAIL` in ParentDashboard.jsx is still the literal `[SUPPORT EMAIL]` — replace before release. Catalog title shows "Mahakaay" vs CLAUDE.md "Mahakaya" (content, not changed — needs Madhurima's call). Tabs `top: 48px` vs 49px header leaves a 1px overlap when scrolled. Parent Dashboard has no `.gmb-compact-cta`/button-audit changes (decided not to apply the 36px audit globally).

## [2026-10-07] — Phone-landscape modals: map profile popup + uniform modal size
**Touched:** CleanGameWelcomeScreen.jsx + .css, ProgressPopup.css, ChantCardModal.css, SymbolCardModal.css.
**Changed:** (phone = landscape, max-height 500, max-width 1023)
- **Map profile popup** (`displayMode="modal"`) now renders the same "Welcome back, X!" card as the fullscreen welcome (mandala, Continue Adventure / Home, Switch Explorer, Start Over) but stays an overlay (dim backdrop, map visible) with the shared small X. Old "Your Journey" title + popup-only layout removed; phone reflow selectors extended to `--modal`. Before, the modal overflowed at 740x360 (mandala cut off, Switch Explorer off-screen).
- **Petal-tap detail card** (`ProgressPopup` `.pp-detail-card`) had no phone-landscape rules (515px tall, X off-screen). Now image-left / text-right, 60px X inside the corner, small Continue pill.
- **Uniform modal size** on phone landscape: petal popup, ChantCardModal and SymbolCardModal are all 600px wide, min-height 240px. Chant was being shrunk by a `scale: .78` (max-height:900 rule) on phones; forced to scale 1 there. Practice Chanting / Continue / Play Sound are now 36px-high pills (like the Pick Friend CTA) with a ~60px invisible touch area (::after).
**Open:** 36px painted CTAs are under the 60px child rule (touch area covers it) — Madhurima asked for it; confirm on device. Map popup not checked over the real map; petal popup's non-direct list view and tablet/desktop not rechecked; Pond modal measured (600x240) but no clean screenshot. "Shloka River modal" assumed = chant modal. Dev harness (`onb-capture.html`, `src/dev/onbCaptureMain.jsx`, `screenshots/`) untracked. ParentDashboard.*, PinScreen.jsx and docs/GMB_MANUAL_QA_CHECKLIST.html have uncommitted changes that are not from this work.

## [2026-10-07] — Add Friend parent flow in phone landscape (Parent Gate, Name, Age, All Set)
**Touched:** src/lib/components/onboarding/ParentGate.jsx + .css, OnboardingCard.css, src/lib/components/navigation/CleanProfileSelector.jsx + .css (commit 971fc2da on staging).
**Changed:** (phone = landscape, max-height 500, max-width 1023; portrait first-run and Pick Friend untouched)
- **Parent Gate:** challenge is now always 4 digits (was random 3 or 4; stale comment fixed). Short landscape is two-column: prompt, digit boxes and Back on the left, 3x4 keypad on the right (50px keys, parent-only so under the 60px child rule on purpose). No scrolling.
- **OnboardingCard.css:** short-landscape shell (no scroll, shallow wide card, lotus hidden, `box-sizing: border-box` on input/buttons). Only Gate and Sign In use this shell.
- **Name / Age / All Set** are NOT on OnboardingCard — Name/Age render inline in CleanProfileSelector, All Set via `renderHandoffCard()`. Scoped with new classes `create-flow-screen` (while the create modal is open) and `allset-screen` (the three All Set variants). All three share one 600x234 card. Back is light/secondary at top-left (heading padded only when Back exists); CTA hierarchy: Name arrow 130x50, Age Next 230x50, Start Adventure 280x52 with ~60px touch area. Name input is centred; with the input focused the card stays centred and scrolls from the top if the keyboard leaves too little height (an earlier top-align version pinned the card to the top because the input is autoFocus).
- Verified at 740x360 in the browser with Baloo 2 + Nunito loaded (Gate, Name, Age, All Set: no scroll, controls inside card).
**Open:** install-steps and "Almost there" All Set variants not captured (tallest, likeliest to overflow); no real-phone software-keyboard test; portrait regression not checked in a browser; dev harness `onb-capture.html` + `src/dev/onbCaptureMain.jsx` left untracked; not pushed/merged (staging only).

## [2026-10-07] — Phone landscape: Intro story, Welcome screen, Profile selector (+ Add Friend flow audit)
**Touched:** src/components/GaneshaIntroStory.jsx + .css, src/App.jsx (preload path), public/intro-story/story1-img2-transition.webp (new), src/lib/components/navigation/CleanGameWelcomeScreen.jsx + .css, src/lib/components/navigation/CleanProfileSelector.jsx + .css.
**Changed:** (phone = landscape, max-height 500, max-width 1023; iPad/desktop untouched)
- **Intro story:** end-screen Ganesha capped by height (`max-height: clamp(110px, 42dvh, 420px)`) so the "Let's go" button is no longer pushed off a short screen. New short-landscape block (the old `max-width: 700px` rules never fire on a 740x360 phone): 60px next/back/begin buttons, safe-area insets on every control, enlarged invisible hit areas on Skip and Replay, lighter end-screen map blur. Video-intro autoplay failure now skips straight to the story. Skip hidden on the end screen. `story1-img2-transition.png` (1.6 MB) -> `.webp` (99 KB); the PNG is still in `public/intro-story/`, now unreferenced.
- **Welcome screen:** bright fullscreen background (overlay 0.25 -> 0.04; modal tint removed). Heading shortened to "Welcome, X!" / "Welcome back, X!", unused subtitle copy emptied. Petal tap + "Tap a petal…" hint only when the child has collected something (`hasMandalaCollection`). `getAnimalId` accepts any ASCII avatar id or `{id}` (was a 4-animal list; the picker offers 20). Phone landscape is a real two-column reflow (mandala left, actions right, cream card instead of the tall `welcomeback.svg`, no scrolling). Bigger mandala (`clamp(170px, 56dvh, 220px)`, lotus hidden), avatar slot 18% -> 24% (27% phone) scoped to `.profile-mandala` so `InnerMandala.css` is untouched, hint on one line inside the card.
- **Profile selector:** four slots in one row (was 2x2), 60px `?`/delete targets, slots ~47px lower, softer + lower "Add Friend" circles. The same commit carries earlier uncommitted work in those files: friend-picker avatars are real buttons, no default avatar, Create needs a choice, page dots non-interactive, `pick-friend-screen` class.
**Verified:** built-in browser at 740x360 (use the `zoom` action for true-framing captures; plain screenshots were cropped). Walked Welcome, Profile selector, intro story (start/page 1/end) and the whole Add Friend flow; screenshots saved in `screenshots/phone-landscape-740x360/` (untracked). Intro video autoplay fallback NOT verified (preview pane shows a blank frame). Nothing run on a real phone.
**Open:**
- **Add Friend steps do not fit on phone landscape (not fixed):** Grown-ups gate keypad bottom row (Clear/0/delete) is cut off and the card scrolls; name-step input, age-step Next button and handoff Start Adventure button are wider than their cream card; Cancel/Back overlap the headings. Friend picker step is fine.
- Stale "Test" profile in the `localhost` origin shows a broken avatar image (stale stored avatar value, not a code bug).
- Elephant edges slightly overspill the yellow avatar circle (slot is `overflow: visible`); shrink or re-clip if it looks off on device.
- Real-profile names sit ~17px higher than "Add Friend" labels; acceptable as secondary slots, align if preferred.
- Two Vite servers were running (localhost 404 vs 127.0.0.1 OK) and one restarted outside the session — preview now uses http://127.0.0.1:5173 (separate localStorage from localhost).

## [2026-10-07] — Zone Welcome: phone landscape row/carousel, compact CTAs, Replay logic
**Touched:** src/lib/components/zone/ZoneWelcome.jsx, src/lib/components/zone/ZoneWelcome.css
**Changed:** Phone landscape (canonical query) reflows the scene cards from the absolute pyramid into one centred row (4 scenes) or a snap-scroll carousel with 60px arrows (Shloka River, 5 scenes; reuses `scenes-horizontal-container`, no new component). Old phone `top` overrides removed; one final phone block at the end of the CSS. Ganesha guide and critters hidden on phone. CTAs are thin (36px painted, 2px press edge); Continue + small replay circle (60px hit area, 36px painted, negative margins so the row fits). Phone label `↻ Replay` (tablet keeps `↻ Play Again`). Logic: a permanently completed scene is always `completed` (Replay) even with a half-played replay session — no Continue once a zone is complete; Replay (pill and whole-card tap) always restarts fresh (`mode: 'replay'`). Replay styled quiet cream with a zone-coloured edge (not grey).
**Verified:** built-in browser at 740x360 — Modak 4/4 (all Replay) and Shloka River carousel/arrow. Replay-restart and the in-progress (one Continue) state NOT run in the browser.
**Open:** Replay restart + in-progress zone state still to check; 44->36px CTAs are under the 60px rule (whole card is tappable); iPad/desktop Zone Welcome unchecked after the Replay colour change.

## [2026-10-06] — Mobile: compact phone CTA (OpeningModal + Completion) and plain 'Tap to collect'
**Touched:** src/zones/shared/components/OpeningModal.css, src/lib/components/celebration/SceneCompletionCelebration.css, src/lib/components/reveal/SymbolAutoReveal.css (CSS only).
**Changed:** Phone-landscape primary button on the opening modal and completion screen is narrower and softer: 158px min width, 18px text, 52px painted pill in a 60px tap box, 3px base edge, tighter gaps. SymbolAutoReveal 'Tap to collect' is now plain quiet text on tablet and phone (the yellow pill is gone); the whole card remains the tap target. Replaced an in-progress 5px-edge variant left uncommitted by another session.
**Verified:** not run in a browser (Madhurima is testing). CSS-only; tablet CTA untouched.
**Open:** on-device look at both buttons and the reveal hint; Vakratunda Grove 4:3 stage (VakratundaGroveSimplified.css) still uncommitted pending her test.

## [2026-10-06] — Shloka River phone-landscape pass (Vakratunda, Mahakaya, Samaprabha, Finale) + Symbol Mountain 60px fixes
**Touched:** shloka-river/scenes/Scene1/VakratundaRescueGame.jsx, shloka-river/scenes/Scene1/MahakayaRescueGame.jsx, shloka-river/scenes/Scene2/components/SamaprabhaGame.jsx, shloka-river/scenes/scene5/ShlokaRiverFinale.jsx + .css, symbol-mountain/scenes/modak/GarlandGame3.jsx, symbol-mountain/scenes/tusk/EyesPopUpGame.jsx, symbol-mountain/scenes/final scene/SacredAssemblySceneV8.jsx.
**Changed:** (phone = landscape, max-height 500, max-width 1023 — the same query as the rest of the app; iPad/desktop untouched unless marked)
- **Vakratunda Rescue (phone only):** `PHONE_OBSTACLES` overrides applied in `cloneObstacles()`: stone l 36.45 / t 26.97 / w 26.6 (Madhurima's debug export); logpile w 30 -> 26.6; reeds l 53.59 / t 77.26 / w 15.3; reeds2 l 47.04 / t 77.65 / w 13.05 (swapped to the left of reeds); hit zones scaled with the art. Frog 6 -> 6.4 (`startFrogW()`).
- **Mahakaya Rescue (phone only):** `adaptLayoutForPhone()` builds `PHONE_PHASE_LAYOUTS` + `PHONE_CROSS_TARGET_RAFT` from the base layouts. Bridge (raft, logTarget*, waitingLog*) x0.85 x0.9, bridge nudged -1.5 l / -1.5 t; animals elephant x0.88, peacock x0.97, cow x0.9, monkey x0.95; animals on the bridge follow the shift and drop by half their shrink so feet stay on the logs. DROP_RX/RY unchanged.
- **Samaprabha (phone only):** `withPhoneMinHit()` floors each clue's hold zone at 31px half-axis (>= 62px); the old 5% x 6% zone was ~85x47px at 852x393.
- **Shloka Finale (ALL sizes, by request):** `placed` is now a horseshoe fleet; phone/iPad get slightly different outer positions (phone Vakratunda 14.5 / Sarvada 85.5; iPad-desktop 17/28/72/83), chosen once at load by `IS_PHONE_FINALE`. CSS: parade inset 10% 12% 18% 12%, boat width clamp(72px,8vw,104px), recap symbol left 50 / top 60, plus a phone block (inset 9% 7% 16% 7%, boats 64-74px, word 8-10px, recap top 66 / 125-155px).
- **Garland (all sizes):** removed the "Tap a flower to thread it" caption (VO covers it); `.g3g-instruction` CSS left in place. The dev preview `src/dev/modakGame3Preview/Game3Garland.jsx` still has its own copy.
- **Eyes (phone only):** hidden mango tap target gets `min-width: 62px` while not found (was 6% of width = ~51px at 852, ~40px at 667).
- **Sacred Assembly (phone only):** `PHONE_ZONE_OVERRIDES` (also feeds hint/sparkle anchors via `ANCHOR_ZONES` and seeds `zonePositionOverrides`): tusk box height 8.5% -> 12% on the same centre; Mooshika (base) target bottom 10% -> 22% so it is on screen.
**Verified:** read/measured only; no full playthroughs. Looked at Modak (3 games), Pond, Symbol (Eyes start) and Sacred Assembly opening at 844x390 in the in-app browser — nothing changed in Modak/Pond. Eslint: no new errors from these edits (old unused-var errors remain in SacredAssemblySceneV8.jsx and ShlokaRiverFinale.jsx; SamaprabhaGame.jsx has an old unused `effShowDoneline`). Checked by code: Ears hit zones, Tusk drag items/nest (all >= 60px at 667x375-932x430).
**Open:**
- Madhurima to re-check Mahakaya phases 1-4 (animals on the bridge, bridge position) and Vakratunda on screen after the final numbers.
- Sacred Assembly: the Mooshika ARTWORK (78-91% down the square Ganesha) is still off-screen on phone — only its tap target moved; fixing needs the whole Ganesha moved up on phone.
- Finale: saved tuner values in localStorage override the new boat positions (clear storage); `placed` position set is chosen at load, so rotating mid-scene does not re-apply it. Mark Shloka Finale DONE after Madhurima's phone + iPad check.
- Mahakaya/Vakratunda background: Madhurima is getting a new phone background; the shared Grove stage (VakratundaGroveSimplified.css, 4:3 width-fit) and the separate banyan image were left alone. Re-place objects when the new art lands.
- Modak/Pond/Symbol bottom-edge clipping seen in the harness is partly the harness (header + ~44px offset) — needs the real-device check. Ears tap zones are 59px tall at 740x360 (rock), Eyes 59px (min-height 60 covers it).
- Nothing committed. The other session's About Me Hut / Pond / Modak / Tusk edits are in the same working tree — stage by file when committing.
## [2026-10-06] — Symbol Mountain Tusk: nest-game phone layout + Ears elephant/cow tune
**Touched:** scenes/tusk/tuskNestFlow.json (unchanged vs HEAD), scenes/tusk/tuskNestFlowPhone.json (NEW), scenes/tusk/tuskNestFlowSelect.js (NEW), scenes/tusk/TuskBeatPlayerLive.jsx, scenes/tusk/TuskPathGame.css, src/dev/beatPlayerPreview/tuskNest/TuskNestBeatPlayerPreview.jsx, scenes/tusk/EarsSoundMatchGame.jsx.
**Changed:**
- **Nest game phone layout (phone only; iPad/desktop untouched).** Phone = short side <= 500 and long side <= 1023 (same rule as KURUMEDEVA_LAYOUT), chosen once at mount by `getTuskNestFlow()`. Phone gets `tuskNestFlowPhone.json` (same beats/VO as the default; only item layout differs): monkey 16.31/29.48, cow 82.23/66.87, elephant 65.95/40.08 @80, peacock 12.12/65.47, twig/grass/leaf/feather 20.3/41.96, 75.12/71.18, 64.79/50.16, 19.8/74.7, nest 50.17/58.32, sad bird 44.55/68.15, bunny 37.31/60.34. Every item has ONE position across all 5 beats x 3 states (no glide/jump on drop), drop target 50.53/53.89 in all four drag beats. Happy bird (beats 3-4) left at the iPad position 48/58 @24 — confirmed fine. Built from the layout-debug "Copy beat JSON" exports of beat 0.
- **Phone stage fill.** `.tusk-giving-game` was forced 4:3, taller than a ~2:1 phone stage, so everything below ~50% height was clipped. New phone-landscape block at the END of TuskPathGame.css: absolute, 100% x 100%, `aspect-ratio: auto` (like the Eyes/Ears games). The DEV layout-debug preview (`?game=sm-tusk-nest-debug`) had its own hard-coded 4:3 wrapper; it now uses the same `tusk-giving-game` class so the harness matches the live scene.
- **Ears sound-match (DEFAULT_LAYOUT, all screens):** elephant w 24 -> 21 (-12.5%), x 30.51 -> 28.5, y 73.53 -> 75; cow x 57.52 -> 60.5, same width. Sprites are non-interactive, hit zones untouched.
**Verified:** nest phone layout and stage fill seen by Madhurima in the harness at 740x360 (all animals/nest/bunny on screen). Not run by me: the live Symbol Mountain Tusk scene on a phone, the full 5-beat playthrough, iPad after the JSON split, Ears elephant/cow on screen.
**Open:**
- The phone stage now crops the background top/bottom (cover) — eyeball animals vs the dirt path in the live scene.
- Layout-debug edits at phone size land in tuskNestFlowPhone.json (iPad size -> tuskNestFlow.json); the harness picks the file at load, so remount after resizing.
- Ears layout editor: a saved `symbol_mountain_ears_layout_v2` in localStorage overrides the new defaults — clear it to see the change.
- Nothing committed; the prior commit 70c002cc does not include any of this.

## [2026-10-06] — Sacred Assembly: phone-landscape pass (Ganesha 560 -> ~420px, compact card)
**Touched:** scenes/final scene/SacredAssemblyScene.css (phone block appended at END), scenes/final scene/SacredAssemblySceneV8.jsx (SymbolFlipCard sizes + side-card `left`, both gated on `IS_PHONE_LAYOUT`).
**Changed:**
- Ganesha container `min(58vw, 96dvh, 420px)` at top 50% / left 65% on phones (was 560px from the 768px and 769-1023px rules). Sized to the screen height so the baked-in Mooshika at the bottom of the art is visible (740x360: 346px at y 7-353; base target 68px at y 251-319). Placed-symbol images scaled ~x0.64 (width + translate) to match. The phone `base` zone override was removed (art is no longer cropped); the tusk override stays.
- Phone card 190x200 (art 100px, title 20px, text 15px, padding 12px, radius 20px); side-card position 13% -> 5%. Flip kept (symbol -> meaning -> find it on Ganesha).
- iPad / desktop untouched. Phone Tusk/Mooshika zone overrides kept: they are percent-based so they scale with the art; base target still sits clear of the cropped bottom.
**Verified:** 740x360 in harness — Ganesha 420px at (271,-23) (~37px of transparent bottom cropped), all 9 tap zones inside the viewport (smallest 78x61), card 190x200 at left 37px; scene screenshot shows the whole figure with the card beside it.
**Open:** 667x375 / 844x390 / 932x430 not checked; placed-symbol positions not checked after placing all 8 (full playthrough); real-device `?hitzones` marker check for tusk vs trunk overlap (tusk 78x61 overlaps trunk/belly boxes by design).

## [2026-10-06] — Symbol Mountain (Modak, Garland, Pond): phone hierarchy pass at 740x360
**Touched:** scenes/modak/ModakScene.css, scenes/modak/FlowerJourneyGame2.css, scenes/modak/FlowerJourneyGame2.jsx (one className), scenes/modak/GarlandGame3.css, scenes/pond/PondScene.css.
**Changed:**
- **Mooshika art -11% in all four Modak phases** (calm/hold, marsh, bush+branch walking, belly) via `--mooshika-art-scale: 0.89` on the character IMAGE only — the button/wrapper is untouched, so the hold target, hold rings and marsh drag target keep full size (>=60px). Marsh and bush/branch scale from bottom-centre so feet stay planted; belly scales from centre. Applies at ALL screen sizes (not phone-gated). Grapes, background and the reaction keyframes untouched.
- **FlowerJourneyGame2 phone landscape:** bush wrapper `clamp(150px, 21vw, 165px)` (~155 vs 190px at 740, ~18% smaller; all phases). Root gets `fjg2--belly-focus` when `isBellyPhase`; in the belly beat the bush, tree/branch and marsh fade to `opacity .18 / saturate .55` (450ms) instead of staying full strength. `animation: none` is needed on those three because the reveal animation's `both` fill-mode would pin opacity at 1.
- **GarlandGame3 phone landscape (CSS only):** workspace `min(63vw, 470px)` centred at top 67% (was 76% wide at 72% — its bottom fell off a 360px screen); Ganesha `clamp(108px, 17vw, 126px)` at top 25%; Mooshika `clamp(72px, 11vw, 82px)`; string 58%, finished garland 54%, snapped flowers `clamp(44px, 6.5vw, 52px)`. Loose flowers stay 60px. Flower coordinates unchanged. `top` uses `!important` because position is an inline style from LAYOUT.
- **Pond phone landscape (CSS only):** rock `clamp(82px, 13.5vw, 108px)` (~100 vs 111), reeds `clamp(60px, 9.7vw, 78px)`, lotus `clamp(68px, 9.5vw, 82px)` with min 68x72, lotus hit zone `max(68px, 9.5vw)` (was 40px min). Turtle deliberately not touched (its width is an inline style, so a CSS rule would do nothing).
**Verified:** nothing run in a browser — CSS selectors and sizes were checked against the source only. Not seen on screen: any of the above at 740x360, 667x375, 844x390, 932x430.
**Open:**
- Eyeball at 740x360: bush/branch emoji badges (anchored by % of the full-size wrapper, may sit ~10% further from the smaller head); belly emotion arc looser around the smaller Mooshika; belly fade at 0.18 (try .12-.15 if the faded scenery still competes); Garland board vs Ganesha overlap.
- Phone overrides bypass layout-editor controls: Garland `top` on workspace/Ganesha (inline + !important) and Pond rock/reeds/lotus size (`--pond-*-size` vars) can't be edited on phones via the debug panels.
- The 11% Mooshika shrink is not phone-gated — confirm iPad/desktop are fine with it or gate it to the phone media query.
- Nothing committed; the working tree still holds earlier uncommitted work (incl. GarlandGame3.jsx, PondSceneSimplifiedV4.jsx).

## [2026-10-06] — Eyes (Symbol Mountain): calmer layout, iPad AND phone (by Madhurima's choice)
**Touched:** src/zones/symbol-mountain/scenes/tusk/EyesPopUpGame.jsx (DEFAULT_LAYOUT + LAYOUT_PRESET_VERSION only).
**Changed:** monkey w 12 -> 10.5 (x 17.2, y 40); peacock w 20.16 -> 16.5, y 43.58 -> 39.5, z 15 -> 13 (between the back bush z12 and the front bush z14, so greenery overlaps him); feather bushes 24/21.6 -> 20.5/18.5; mango bush 24 -> 20.5; yellow flowers 11.28 -> 9.5. Clue positions/sizes (feather, mango + found variants) and the phone minimum-target logic (PHONE_MIN_TARGET_PX = 62) untouched. LAYOUT_PRESET_VERSION bumped to 2026-10-06-eyes-mobile-depth-layout-8 so any saved debug layout in localStorage is dropped (otherwise the old saved layout wins and nothing seems to change).
**Verified:** 740x360 in the harness — peacock higher and partly behind the front bush, bushes smaller, monkey smaller. NOT viewed on an iPad size, and the child interaction (tapping the feather / mango) was not re-run.
- Follow-up (phone only): the two feather bushes + the hidden feather (and its found state) move 4% lower on small phones (short side <= 500, long side <= 1023 — orientation-independent) via BASE_LAYOUT -> DEFAULT_LAYOUT in EyesPopUpGame.jsx; peacock, mango bush and monkey unchanged. LAYOUT_PRESET_VERSION -> ...-layout-9. Measured at 740x360: bushes y 183/190 -> 198/204 (~+15px), peacock unchanged.
**Open:** check the iPad composition once (this one changes iPad); not re-run: tapping the feather after the bush move.

## [2026-10-06] — Sarvada (Shloka River): bigger hidden-symbol picture on phones
**Touched:** scenes/scene4/SarvadaGame.css (new phone block at the END, no JSX change).
**Changed (phone only):** the shorter-iPad cap (44vh, ~211px wide at 740x360) is replaced by `min(52vw, 62dvh * 4/3, 360px)` -> 298px wide at 740x360 (~40% larger). Frame padding 10 -> 6px, radius tightened; boat 128-155px wide (was 130-210), bottom 1%; boat-Ganesha 31-42px; picture top 5% so the frame clears the children's heads. Aspect ratio 4:3, `object-fit: cover` and the %-based tap coordinates are untouched, so tap zones still map 1:1.
**Verified:** 740x360 — frame 286x214 (ratio 1.336), children's faces visible above the boat, hint ring shows on the picture. Not run: an actual symbol tap, 667 / 844 / 932.

## [2026-10-06] — Sarvakaryeshu: slimmer answer rail on phones
**Touched:** scenes/scene4/SarvakaryeshuGame.css (edited the existing phone block, no duplicate block).
**Changed (phone only):** right rail 112 -> 104px, column gap 14 -> 10, card padding 8px 10px 8px 12px; visible symbol circles 58px (touch area kept at 64 x 76 min); labels 11px / line-height 1; feedback 12px. Picture size, right-aligned card position (beside the syllable strip) and boat-behind-card kept as before.
**Verified:** 740x360 — circles 58px, card 251px tall, picture unchanged, nothing clipped.

## [2026-10-06] — Syllable strip smaller on phones (all Shloka River scenes)
**Touched:** shloka-river/shared/SyllableHighlight.css (new phone block at the END), scenes/scene4/SarvakaryeshuGame.css.
**Changed (phone landscape only):** `.syl-row` / `.syl` — left 10, top 52, 13px text, 2px 7px pills, 3px gaps (shorter-iPad treatment is 15px / 3px 8px, untouched). Applies to every scene using SyllableHighlight (Vakratunda, Mahakaya, Suryakoti, Samaprabha, Nirvighnam, Kurumedeva, Sarvakaryeshu, Sarvada). Sarvakaryeshu: fly-to-syllable anchors moved to the same left/top/gap (34x24 each) and the card now reserves 185px instead of 215px beside the strip.
**Verified at 740x360 in the harness (13px text, strip 30px tall, at left 10 / top 52, nothing crowded):** Vakratunda 139px wide, Mahakaya 131, Suryakoti 128, Samaprabha 145, Nirvighnam 123, Kurumedeva 129, Sarvada 103, Sarvakaryeshu 159 (card widened). No other scene has anchors tied to the strip's position.
**Open:** none for the strip itself; not re-checked at 667 / 844 / 932.

## [2026-10-06] — Sarvakaryeshu (Shloka River): phone two-column card
**Touched:** src/zones/shloka-river/scenes/scene4/SarvakaryeshuGame.css (new phone block at the END; no JSX change).
**Changed (phone landscape only):** the situation card is now a 2-column grid — picture, "So much to do." and the question on the left, the 3 powers stacked on the right (60px circles, 76-83px hit rows). The iPad `zoom: 0.8` rescue is cancelled on phones (`zoom: 1`) because the content is laid out for the phone instead. Card is right-aligned beside the syllable chips (so the chips never cover the picture), boat is smaller and BEHIND the card (it used to sit in front of the text / middle option). When the options disappear the card collapses to one column via `:has()`. The flying-symbol animation measures the option's real rectangle, so it needed no change.
**Verified in the harness:** 740x360 — card y21-303 fully in view, picture ~185px tall, wrong pick keeps the layout and shows the gentle line, right pick flies the symbol from the right-hand option and shows the "After" image; 667x375 — card x203-655, y28-310, chips clear. Not measured: 844x390 / 932x430 (card is capped at 640px wide, right-aligned, so it only gets more room), later situations (Trunk / Tusk rounds), hint L1/L2/L3 on phone.
**Open:** the "after" state shows the same sentence twice (situation line + feedback) — existing behaviour, not layout; confirm the card height with the longest situation text.

## [2026-10-06] — Kurumedeva (Shloka River): phone layout tuned at 740x360
**Touched:** src/zones/shloka-river/scenes/Scene3/scene3LayoutConfig.js (KURUMEDEVA_LAYOUT is now DEFAULT + PHONE, chosen at load by short side <= 500 and long side <= 1023 — orientation-independent so a phone that loads in portrait still gets it; every iPad short side is >= 744).
**Changed (phone only):** finished bridge ~9% smaller (46.5 -> 42.3), 2% lower, 3% further left so it clears the beaver family on the right bank; elephant ~7% smaller (13 -> 12.1); beaver 5% smaller (10 -> 9.5); the two beaver-path points that walk on the bridge move with it (-3 l, +2 t). Monkey and baby beaver unchanged.
**Verified:** first state at 740x360 — elephant 90px (was 96), beaver 70px (was 74), monkey 70px, nothing clipped; module values confirmed in the browser.
**Not verified:** the FINISHED bridge on screen — the harness Layout Debug phase preview doesn't draw the bridge and Elephant taps don't advance the scene there. The 3% left shift is from the supplied completed-state screenshot (bridge end ~86% vs beaver family ~78-86%), so please eyeball one full playthrough at 740x360 and adjust `bridge` / `beaverPath` in KURUMEDEVA_LAYOUT_PHONE if needed.
**Open:** the Layout Debug panel stores its own layout in localStorage and overrides this — "clear storage" first.

## [2026-10-06] — Nirvighnam (Shloka River): obstacle cluster nudged left on phones
**Touched:** src/zones/shloka-river/scenes/Scene3/scene3LayoutConfig.js (new NIRVIGHNAM_LAYOUT_PHONE), Scene3/NirvighnamGame.jsx (picks it via the phone media query).
**Changed:** on phone landscape only, the stone / branch / reeds, their hit zones, the turtle's stepping nodes and the bank spots move 4% left (turtle start, nest, swim path unchanged), giving the turtle room beside the rock at 740x360. iPad/desktop use the original NIRVIGHNAM_LAYOUT. Hit-zone outlines only show with ?hitzones and the Layout Debug panel only in the harness / ?debug, so neither ships.
**Verified:** harness at 740x360 after clearing storage: objects stay on the river, ~30px gap rock -> turtle. NOT run: the full stone/branch/reed interaction and the hint ring after the shift; Replay/Sound aren't mounted in the harness (turtle's right edge touches the Replay hit box corner at 740 wide by ~9px).
**Open:** the harness "Layout Debug" panel saves a layout in localStorage that overrides this one — use "clear storage" before judging.

## [2026-10-06] — Suryakoti (Shloka River): phone regression check, no code changes
**Touched:** none (CHANGELOG only).
**Verified in the harness at 667x375, 740x360, 844x390:** stage + dark rub canvas fill the viewport; syllable chips (~37px tall, top-left), bunny (53-68px) and burrow (93-118px) stay inside the screen and don't overlap each other; rubbing the first patch clears the dark layer there (alpha ~232 -> ~0) while untouched areas stay dark. Layout call: keep as is, no phone changes.
**Not checked:** the 10-step hint checklist (hints are drawn on the canvas, not in the DOM) and the corner Replay/Sound/zone buttons (the harness does not mount them for this scene) — run the checklist on a real phone or in the full app.

## [2026-10-05] — My Indian Story: phone-landscape pass
**Touched:** src/zones/about-me-hut/indian-story/MyIndianStoryGame.css (new phone `@media` block at the end), MyIndianStoryGame.jsx (one className hook: `mis-language-child-phase` on the Language Child wrapper).
**Changed:** Inspected every phase in the harness first; Ganesha Home, Language Ganesha and Festivals Ganesha already fit, so only the broken screens were touched.
- Wrapper: 16/80px padding + each phase's own min-height made every screen ~100px taller than the viewport (it scrolled). On phone `.mis-wrapper` is exactly one screen, no padding.
- Child Home: map enlarged (0.84 x height), the 7 region pins nudged apart (they overlapped at any size; now 76x70, no overlaps), Continue moved to the right of the map instead of covering the bottom pins.
- Language Child + Festivals Child (12 cards each, bottom row was cut off): "most common" 2x2 beside "more" 4x2, centred; the fixed count line and Continue were overlapping, now stacked; every card >= 62px tall (single-line festival cards were 59px).
- Origin card: avatar + "<name>'s Story" on one line, shorter rows, title/subtitle compacted, Continue 60px (was 28px).
**Verified:** harness at 844x390, 667x375, 740x360 through all 8 phases (scripted checks: on-screen, >=60px taps, no overlaps). NOT run: 932x430, real device, shared opening/completion at phone sizes, iPad regression screenshot (everything is gated by max-height 500px).
**Open:** pins are moved from their geographic spots on phone only (e.g. West is further left) — Madhurima to confirm that's acceptable; changes uncommitted.

## [2026-10-05] — Dreams & Wishes: phone-landscape pass (plan: GMB_Dreams_Wishes_Mobile_Audit_and_Code_Plan.md)
**Touched:** src/zones/about-me-hut/enjoy/ObstacleRemoverGame.jsx, enjoy/DreamsWishesGame.css (new phone block at the END), enjoy/components/Wish2PlateDropGame.jsx, components/Drawingpad.css (shared; new phone block at the END), CHANGELOG.md.
**Changed (iPad/desktop untouched — every CSS change is inside the phone media query; JSX changes are class hooks or gated on the same phone query):**
- Wish 1: decorative face orbit hidden on phone, Earth ~203px, bubbles ~93px, max 4 live bubbles (phone only). Empty StoryProgressHeader hidden until a first discovery — PHONE ONLY for now (the plan calls it a general UX fix; iPad would also benefit, left for Madhurima's call).
- Wish 2: phone position maps + phone animal sizes inside Wish2PlateDropGame (foods 3 over plates 3, animals beside plates, nothing near Replay/Sound); drag verified end to end.
- Wish 3: reveal wrappers/art/butterfly/bird sized as % of the forest frame (inline px kept for iPad, overridden in the phone block); frame sized by height; hotspot tap areas grown to >= 60px with ::after.
- All Wishes Complete: Ganesha left + compact card right (copy unchanged — shortening it needs approval).
- DrawingPad (SHARED): phone layout = 3-column tool grid (56px cells), canvas at native 3:2, close / Done / Save column on the right, clear of Replay/Sound. An iPad `scale(0.8)` on the pad (Dreams, max-height 900) is cancelled on phone. Favorite Food uses the same pad — re-check it there.
- Dream clouds: canvas 445x296 fits, Ganesha moved to the lower-left (124px), away from the bottom-right audio buttons.
- Comparison: flat side-by-side, no scroll; had to beat base rules (grid flex:1, 768px column stack, dream box 259px).
**Verified:** harness at 844x390 through Wish 1, Wish 2 (drag), Wish 3 (all reveals), All Wishes Complete, drawing, dream clouds, comparison; comparison also at 667x375.
- Stress-size pass (667x375, 740x360, 932x430): Wish 1 phone spawner now re-rolls spots under the zone badge / Replay+Sound / Ganesha host (bubbleFloat replaces the inner centring transform, so the box is top-left-origin); Wish 2 plate drop zones are 0.5 x width on phone (were 58px tall at 740x360, now >= 60px).
**Verified at all four sizes:** Wish 1 (max 4 bubbles, 0 overlaps over ~150 samples per size, wrong bubble does not count, hint highlight on-screen), Wish 2 (miss drag returns, 3 correct drops = 3/3, nothing under audio buttons), Wish 3 (frame fits, hit areas extend ~9px, art within 7px of its hotspot, tap outside does nothing), drawing (fits, no scroll, controls clear of audio), dream clouds (taps on canvas / cloud / Replay clear nothing; one Ganesha tap = one cloud), reveal state, comparison (no scroll).
**Open:** not measured at 667/932: the "All Wishes Complete" card (its entrance animation was stalled in the hidden preview; width is capped at min(65vw, 480px) and fits by arithmetic; measured OK at 844 and 740); two Ganesha taps ~80ms apart clear two clouds (existing behaviour on every device — decide if it should be throttled); the first bubble right after Wish 1 mounts may ignore the avoid-zones (one 8-sample hit at 667, 190 clean samples after); Favorite Food + other DrawingPad users need a look; empty-StoryProgressHeader fix is phone-only (iPad decision pending); changes are uncommitted.

## [2026-10-05] — Favorite Food: phone-landscape pass (same approach as Family Tree)
**Touched:** src/zones/about-me-hut/food/Favoritefoodgame.css only (one new `@media (orientation: landscape) and (max-height: 500px) and (max-width: 1023px)` block appended at the end; no JSX change).
**Changed:** Built from GMB_Favorite_Food_Mobile_Audit_and_Exact_Code_Plan.md but adapted to the real DOM, which differs from the doc (e.g. "My own" is the 8th grid card, not a `+` button; Draw/Type is a popup; activity positions are inline styles).
- Ganesha rows: one compact row, nth-child offsets reset; reveal cluster re-spaced (mouse no longer overlaps Ganesha).
- "Your turn!": Ganesha left + card right (the card was falling off the bottom).
- Child food / activity: 4x2 grids (activity overrides the inline left/top with scoped !important, so iPad is untouched); colour: 4x2 grid replacing the 980x420 canvas (earlier `!important` width/height needed matching).
- Draw/Type popup on the bottom edge; DrawingPad (shared) recomposed *scoped to this scene* as [3-col tool rail | canvas | Done/Save] using `display: contents`, canvas out of flow so its intrinsic size can't size the row; strokes verified at both corners + centre.
- TextInputModal (shared, scoped here): wide + shallow grid, 60px Continue/Cancel; ~211px tall (was 342).
- Comparison card: avatar header is a row (was stacked ~90px), title/columns/Continue no longer overlap.
**Verified:** harness at 844x390, 667x375, 740x360 through every phase (script checks on-screen + >=60px taps + overlaps). NOT run: 932x430, real device + software keyboard (TextInputModal autofocus still on), shared opening/completion at phone sizes, iPad regression screenshot (rules are gated by max-height 500px).
**Open:** Done + Save both kept (Save = download to device; audit suggests Done only - Madhurima's call); changes uncommitted.

## [2026-10-05] — Family Tree: phone-landscape (844x390) verification + fixes
**Touched:** src/zones/about-me-hut/family-tree/Familytreegame.css, Familytreegame.jsx.
**Changed:** The Family Tree phone plan (GMB_Family_Tree_Mobile_Audit_and_Code_Plan.md) was already in the code from an earlier checkpoint; this session ran every phase in the harness at 667x375 / 844x390 / 932x430 and fixed what was off. All CSS is inside the phone media block (iPad untouched).
- Ganesha 2x2: an iPad `:nth-of-type` margin rule beat the phone `top/left`, pushing the top row off-screen. Phone rule now doubled-class (no !important). Continue lowered to the bottom edge (it covered the lower labels).
- Child tray: border-box (was ~312px wide), ends above Replay/Sound, rows flex 55-60px so all 10 fit at 360-430px high; toggle moves to the tray's left edge while open; tray now closes on member pick (it covered the name modal + its X) and reopens on cancel.
- Done button was unreachable: the transformed / backdrop-filter tray was its fixed-position containing block, so it rode off-screen. Tray now slides with `right` + `visibility`, no transform/backdrop-filter. Done at left 22%, Remove pill / Undo toast on the same bottom row.
- Child tree avatars sized from height (60-68px) so 3 rows + Done fit.
- Name modal: no autofocus on phone-landscape (keyboard no longer jumps up before the question is seen) via PHONE_LANDSCAPE_QUERY in the JSX.
- Our Families comparison: rebuilt phone layout (title + two panels + Continue fit, no scroll, names >= 11px, location chip top-right; header left-aligned <= 740px wide). Uses scoped !important only where the base rules pin the same property.
- Follow-ups (same day): info card on phone now closes on any tap (X removed, "Tap anywhere to close" hint back, card click bubbles to the overlay on phones only); Ganesha-phase Continue moved to the right side, vertically centred (a bottom placement is cut off whenever browser bars shrink the viewport); Sound was a 48px box (iPad `.audio-toggle` !important leaking into phones) so it sat off-centre from Replay — phone block restores the shared 60px hit / 22px icon.
- Child phase pass 2 (all inside the phone block, no iPad rule edited): Done and Remove pill smaller (46px) and stacked in the left column (Remove above Done, Undo toast in Remove's slot); child tree bigger/lower (an iPad rule was lifting it 100px and shrinking it to 78% on phones); "Tap a member to remove" hint moved off row 3. Checked with 10 members at 844x390.
**Verified:** harness at 667x375, 844x390, 932x430 through Ganesha tree, info card, transition, child tray, name modal, 6-member tree + remove pill, comparison. NOT run: real device + software keyboard, shared opening/completion regression, 8-10 member tree, 740x360.
**Open:** test the name modal with a real phone keyboard; check 8-10 members (rows can hold 4+); shared SceneCompletion at phone sizes; changes are uncommitted.

## [2026-10-05] — Zone 1 hint flows: Sacred Assembly fix, Eyes / Ears / Tusk nest simplified
**Touched:** src/zones/symbol-mountain/scenes/final scene/SacredAssemblySceneV8.jsx, tusk/EyesPopUpGame.jsx, tusk/EarsSoundMatchGame.jsx, tusk/tuskNestFlow.json, src/lib/beatPlayer/BeatPlayerGame.jsx + .css, src/dev/GameTestHarness.jsx, src/dev/testChecklists.js.
**Changed:**
- Sacred Assembly: hint ladder re-armed mid card-VO and stale timers from earlier cards fired on later cards (card 3+ went straight to the glow). The ladder effect no longer depends on playSceneVoice (read via ref) and every timer carries a per-card generation token.
- Eyes: 2 steps — ~13s clue + bush-only cue for the next object, then that one object glows (no VO). Misses: 3 = clue, 6 = glow. Wrong taps are visual only; removed the "interesting" and "Tap the glowing bushes" lines.
- Ears: kept replay-all (10s) and clue + target sound (18s); final glow replays the target sound with no spoken line. Wrong taps: 1st = "Listen again" + all three sounds, 2nd = clue, 3rd = glow. Removed the 1/2/3 source numbers. Fixed the choosing clock holding a stale time during "Now choose the sound." (the clue fired at once and skipped the 10s replay).
- Tusk nest (BeatPlayer drag-to-target): reminder line "Add the X to the nest." at ~12s with an item nudge, then a persistent nest glow (new, raw-zone targets); no L3 VO; no hand after a real drag; 2nd wrong drop brings the glow early.
- Harness: clear storage now keeps checklist results. Checklists rewritten for sm-eyes, sm-ears, sm-tusk-live-v2.
**Verified:** vite build passes; Ears trace in the harness shows replay at ~10s, clue ~18s. Eyes and Tusk nest checked by Madhurima; the Sacred Assembly timer fix was not run live.
**Open:** BeatPlayer 12s two-step timing applies to every structured drag-to-target beat (only Tusk uses it today); Ears rapid wrong taps during replay-all may overlap replays; unused .ears-source-number CSS left in place; Modak files (FlowerJourneyGame2, GarlandGame3, NewModakSceneV7) show edits not made this session — left uncommitted.

## [2026-10-05] — Symbol Mountain Modak/Pond hint model recorded; Modak checklists split by game
**Touched:** CHANGELOG.md, src/dev/testChecklists.js, src/zones/symbol-mountain/scenes/modak/FlowerJourneyGame2.jsx.
**Changed:** Recorded the Symbol Mountain Modak/Pond teach-once hint pass in the 13-scene hint status table below. Split Modak QA into three harness checklists: `modak-calm` for Game 1 / Calm Mooshika, `modak-game2-new` for Game 2 / Bush-Branch-Marsh, and `modak-garland` for Game 3 / Garland. Harness aliases now route `sm-modak-game1`, `sm-modak-game2`, and `sm-modak-game3` to those specific checklists; the full `sm-modak` scene starts on the Calm checklist. Also reduced the Marsh emotion emoji default size from 100 to 72.
**Verified:** Madhurima confirmed all three Modak game checklists are fine. `git diff --check` passed on the changed files. Full build was not rerun for this small follow-up; the earlier build attempt reached Vite transform and then hung during chunk rendering.
**Open:** Pond code changes were already in the working history before this small follow-up; this entry records the status/table/checklist side rather than changing Pond code.

## [2026-10-05] — Hint simplification: two-step / teach-once model (Samaprabha, Finale, Favorite Food, Dreams & Wishes, My Indian Story)
**Touched:** SamaprabhaGame.jsx/.css, ShlokaRiverFinale.jsx/.css, Favoritefoodgame.jsx/.css, ObstacleRemoverGame.jsx, components/Wish2PlateDropGame.jsx, DreamsWishesGame.css, MyIndianStoryGame.jsx, GameTestHarness.jsx, webSpeechScripts.js, SuryakotiBankSimplified.jsx, voiceGuidance.js, testChecklists.js.
**The model (replaces the 10s/18s/26s notice → understand → do ladder where a child already knows the mechanic):** teach HOW once, never again after the child has done it; after that the hint answers WHERE/WHICH. Recognition/recall games have no "wobble everything" step: one meaning-clue VO at ~12-13s, then ~10s after the clue ENDS the correct answer glows and stays lit, no second VO. A wrong answer never clears or restarts the hint clock and never cuts a playing clue (it shakes; the option name is spoken only BEFORE the clue starts). Personal/reflection questions keep one prompt repeat at ~10s and nothing else.
**Changed (by scene):**
- Samaprabha: 3 states — teach (clue 1 until ring >=22%: pulse -> "Press and hold on the shadow." -> one full hold hand), find (clues 2-4: 12s pulse + "Look for another part of the shadow.", 25s exact region held quietly, no hand), keep-holding (held >=10% then released: 9s "Keep holding." + soft glow). Hand only in teach. Added the missing `scene11_sama_find_another` / `_hint_find` / `_hint_keep` lines to both Web Speech maps (find_another was silent in the harness).
- Shloka River Finale: ~13s meaning clue -> ~25s correct boat glows + word spoken once, stays lit; no all-boats nudge, no hand. A 2nd wrong answer on a slot plays the clue early (the hook's own escalation would have jumped to the rescue, so it is bypassed). Wrong taps/drops no longer stop voice; voice stops only on a correct answer. Layout: boats follow the left of the river in a wider zig-zag (top boats spaced apart), and each word's symbol shows large in the open water during the "say it together" recap.
- Favorite Food (Ganesha questions): ~13s semantic clue -> glow ~10s after the clue ends; choice wobble removed. Wrong tap speaks the option name only before the clue. Rescue glow redone as a deep-gold edge + orange glow (white / pale yellow were invisible or muddy on the cream table). Child questions unchanged (one repeat at 10s).
- Dreams & Wishes: Wish 1 clue at 13s -> kind bubbles glow (no all-bubble pulse, the 4-answer read-out removed; unkind bubbles shake only). Wish 2: hand once before the first food; after it "There's still an empty plate." + one food nudge + plate ring, never a hand. Wish 3: dashed oval hit-boxes removed (tap zones large and invisible, small golden marker per spot), one spot pulses then glows. Dream clouds: "Tap me to clear the clouds." / "Keep tapping." then Ganesha glow. Drawing: no ladder.
- My Indian Story: Ganesha Home by what the child knows (never dragged: one hand, "Move the magnifying glass around the map." + 3-wobble nudge, hand replays once; has dragged: ONE undiscovered spot glows at 12s then a ring at ~25s, no voice). Sanskrit + festival guesses: clue at ~12s, glow ~10s after it ends, card wobble removed; the card onClicks no longer clear the hint timers (a wrong tap used to kill the help for good) and wrong taps are shake-only once the clue starts. Play button pulses twice then repeats the line once at ~11s. Language reminder now "use or hear". Personal phases unchanged.
- Test harness: Suryakoti/Samaprabha teaching hand is gated on the intro line's action word (the harness mounted the game directly, so the hand showed immediately); Web Speech helper now passes the speech cue through.
**Scene-by-scene status (13 live scenes):**

| Scene | Zone | Two-step / teach-once hints? | Where recorded |
|---|---|---|---|
| Symbol Mountain Scene 1 — Modak (Calm Mooshika, Flower Journey, Garland) | Symbol Mountain | YES (teach each new gesture once; later hints point where/which; garland final rescue is visual) | 10-05 Symbol Mountain follow-up entry |
| Symbol Mountain — Pond | Symbol Mountain | YES (teach hold once, teach drag once, lotus uses reminders only) | 10-05 Symbol Mountain follow-up entry |
| Symbol Mountain — Tusk (Eyes, Ears, nest) | Symbol Mountain | Not recorded here; Eyes/Ears checklists rewritten (clue -> one exact object; replay -> clue + sound -> glow), uncommitted | checklist only |
| Symbol Mountain — Sacred Assembly (final) | Symbol Mountain | Not recorded here; checklist rewritten, uncommitted | checklist only |
| Shloka River 1 — Vakratunda / Mahakaya | Shloka River | NO — still the 09-22 ladder (Mahakaya got a new ladder on 09-26) | not in this entry |
| Shloka River 2 — Suryakoti | Shloka River | YES (teach first, remind once) | 10-05 earlier entry |
| Shloka River 2 — Samaprabha | Shloka River | YES | this entry |
| Shloka River 3 — Nirvighnam / Kurumedeva | Shloka River | NO — still the 09-22 ladder | not in this entry |
| Shloka River 4 — Sarvakaryeshu | Shloka River | NO — 10-02 settled-L3 only | 10-02 entry |
| Shloka River 4 — Sarvada | Shloka River | YES (12s clue + broad glow, 25s exact ring) | commit b4cbe56a, no changelog entry yet |
| Shloka River 5 — Finale | Shloka River | YES | this entry |
| About Me Hut — Family Tree | About Me Hut | NO | not in this entry |
| About Me Hut — Favorite Food | About Me Hut | YES (Ganesha questions) | this entry |
| About Me Hut — Dreams & Wishes | About Me Hut | YES | this entry |
| About Me Hut — My Indian Story | About Me Hut | YES | this entry |

**Verified:** syntax-checked with esbuild after each change; Madhurima ran the harness checklists — Samaprabha 13/14 (item 7, "find another" silent, fixed), Favorite Food 9/11 (glow fixed; item 5 awaiting a fresh-question retest), Dreams & Wishes passed ("fine"). Finale layout, My Indian Story, and the harness cue wiring were NOT confirmed in a browser. Commits: 9131ce91, 26ada340, 9002c4ee (Samaprabha/harness), 886b77ea, 81516942, 0a15aecd (Finale + Favorite Food), 122b853a (glow), cba21a73 (Dreams & Wishes), f5382500 (My Indian Story).
**Open:** run the Finale, My Indian Story and Samaprabha-opening checklists; retest Favorite Food item 5; My Indian Story still silently replaces the oldest pick on a 4th language / 5th festival (disable-at-limit proposed, undecided); Dreams & Wishes still carries unused `wish*Level2/3` flags; "Not recorded here" Symbol Mountain rows need their own entries once those uncommitted edits are committed; Vakratunda/Mahakaya, Nirvighnam/Kurumedeva, Sarvakaryeshu, Family Tree not yet reviewed against this model.

## [2026-10-05] — iPad Safari / iPad Pro sizing: which scenes and shared components were changed (index of the 10-04 / 10-05 entries)
**What this is:** a lookup table built from the iPad entries already in this file; nothing new was changed for it. "Shorter iPads" = landscape, up to ~900px tall (1024x670 harness size, iPad mini). "Pro" = `min-height: 901px` (iPad Pro 13). Real-device iPad checks have NOT been done for any row — all checks were in the dev harness.

| Scene / component | Zone | Files | Shorter iPads (<=900px tall) | iPad Pro | Checked (harness) |
|---|---|---|---|---|---|
| Opening + closing/celebration cards (shared) | Shared | OpeningModal.css, SceneCompletionCelebration.css | card zoom 0.8, Ganesha max 180px | unchanged | Pond, Modak, Symbol, Sacred Assembly: fine |
| Tusk nest game (cow) | Symbol Mountain | BeatPlayerGame.css, tuskNestFlow.json | cow `scale: 1.2` (stopgap) | — | cow size/position still open |
| Ears sound-match | Symbol Mountain | EarsSoundMatchGame.jsx | DEFAULT_LAYOUT from the Visual Flow Editor JSON (centerRock, rightSource, hit zones, cow) | — | a saved browser layout overrides the new defaults |
| Symbol card (all Symbol Mountain scenes) | Symbol Mountain | SymbolCardModal.css | scaled 0.85 | scaled 1.15 | from screenshots; not re-checked |
| Symbol Mountain sidebar | Symbol Mountain | SymbolSidebar.css | tap 56->50px, icon 42->38px, gap 6->4px | unchanged | from screenshots; tap area is under the 60px rule by choice |
| Shloka River sidebar rail | Shloka River (all scenes) | AppSidebar.css | icons 60->44px, gap 4px, pill 62px | unchanged | fine |
| Chant card | Shloka River | ChantCardModal.css | scale 0.78 | unchanged | fine |
| Syllable strip (shared) | Shloka River (all scenes) | SyllableHighlight.css | text 15px, tighter padding, top 56px | unchanged | NOT re-checked after the edit |
| Sarvada (picture + boat) | Shloka River | SarvadaGame.css | picture frame 52vh->44vh, boat clamp(130px,20vw,210px), Ganesha clamp(32px,4.6vw,54px) | unchanged | from screenshots; tap accuracy on the smaller picture to confirm |
| Sarvakaryeshu (card + boat) | Shloka River | SarvakaryeshuGame.css | card `zoom: 0.8`, top 38%, boat clamp(220px,24vw,300px) | unchanged | clearance calculated, not measured; other screens not looked at |
| Family Tree | About Me Hut | Familytreegame.css | tree + circles scaled together; build rows/tree/circles resized; Remove/Done lowered; Ganesha on Kartikeya's row | tree/circles +10%, bigger Continue (fixed its jump on press), bigger fact card + tray, "Our Families" cards +25% | 1024x670, mini, Pro 13: fine, FROZEN |
| My Indian Story | About Me Hut | MyIndianStoryGame.jsx/.css, AboutMeComparisonCard.css | map ~14% bigger, guess/choice/final screens re-sized in the `--u` unit | same `--u` sizing (all iPads) | Home, guess screens, language choice, final compare card on all 3 iPads: good |
| Favorite Food | About Me Hut | Favoritefoodgame.css | choice rows 21% up; child food/activity Draw+Type lifted | Ganesha rows x1.25, child grids/hearts/ring enlarged, cards/titles 1.15-1.3 | several screens, not all on every iPad; NOT frozen; child colour screen on short iPads open |
| Dreams & Wishes | About Me Hut | DreamsWishesGame.css | Draw-your-dream pad 0.8; dream-clouded card 480x320 and Ganesha up/in | Wish 1 globe 378px, faces x1.5, bubbles +50%, pad 1.3 | all three iPads: fine |

**Still open on a real iPad (not just the harness):** the comparison screen for all 4 About Me Hut scenes (Family Tree, Favorite Food, Dreams & Wishes, My Indian Story).

**Not yet iPad-passed (T20 open):** Shloka River Grove, Bank (Suryakoti/Samaprabha), Chant and Finale (scenes 05-09 not individually passed); Zone 1 and Zone 2 real-device checks. The harness lays the game out ~44px below the visible area, so bottom-edge cut-offs seen there are partly an artifact.

## [2026-10-05] — Zone 1 iPad pass done in harness; opening/closing cards, nest cow, Ears layout, Dreams tweaks
**Touched (uncommitted at time of writing):** src/zones/shared/components/OpeningModal.css, src/lib/components/celebration/SceneCompletionCelebration.css, src/lib/beatPlayer/BeatPlayerGame.css, src/zones/about-me-hut/enjoy/DreamsWishesGame.css, src/zones/symbol-mountain/scenes/tusk/EarsSoundMatchGame.jsx.
**Changed:** shared opening + closing cards on shorter iPads — card zoom 0.8, Ganesha max 180px (Pro unchanged); nest-game cow `scale: 1.2` (stopgap, the breathing animation owns transform so `scale` is used); Ears DEFAULT_LAYOUT updated from Madhurima's Visual Flow Editor JSON (centerRock, rightSource, their hit zones, cow); Dreams dream-clouded card 480x320 and Ganesha moved up/in on shorter iPads.
**Verified:** Madhurima checked Pond, Modak, Symbol, Sacred Assembly in the harness: fine. Real-device check is next (the harness lays the game out ~44px below the visible area, so bottom-edge cut-offs there are partly an artifact).
**Open:** nest cow size/position (use the layout debug `?game=sm-tusk-nest-debug`, then paste into tuskNestFlow.json); a saved Ears layout in the browser overrides the new defaults; real-device iPad checks for all three zones; Zone 2 scenes 05-09 not individually passed.

## [2026-10-05] — Shloka River: Sarvada picture + boat sized for shorter iPads
**Touched:** src/zones/shloka-river/scenes/scene4/SarvadaGame.css.
**Changed:** landscape up to 900px tall — find-the-symbol picture frame width limit 52vh -> 44vh (width changed, not zoom, so tap coordinates still map 1:1 onto the picture); boat width clamp(130px, 20vw, 210px) (was 160-280px) and the seated Ganesha clamp(32px, 4.6vw, 54px). iPad Pro unchanged.
**Verified:** from Madhurima's screenshots; not re-checked after the edit. Tap accuracy on the smaller picture to be confirmed.
**Open:** rest of Zone 2 T20 (Grove, Bank, Chant, Finale).

## [2026-10-05] — Shloka River: Sarvakaryeshu card + syllable strip sized for shorter iPads
**Touched:** src/zones/shloka-river/scenes/scene4/SarvakaryeshuGame.css, src/zones/shloka-river/shared/SyllableHighlight.css.
**Changed:** landscape up to 900px tall — Sarvakaryeshu scenario card `zoom: 0.8` and `top: 38%`, boat width clamp(220px, 24vw, 300px) (the boat sat in front of the middle option); shared syllable strip (Sar va kar yeshu / Sur ya ko ti) text 15px, tighter padding, top 56px for every Shloka River scene. iPad Pro unchanged; phones keep their own rule.
**Verified:** from Madhurima's screenshots; the card/boat clearance was calculated, not measured, and the syllable strip was not re-checked after the edit.
**Open:** other Sarvakaryeshu screens (correct answer, rescue) not looked at; rest of Zone 2 T20 (scenes 05-09).


## [2026-10-05] — Suryakoti hints simplified: teach first, then remind once (25s "can't find it" cue still open)
**Touched:** src/zones/shloka-river/scenes/Scene2/components/SuryakotiGame.jsx + .css; src/zones/shloka-river/scenes/Scene2/SuryakotiBankSimplified.jsx; src/lib/config/content/voiceGuidance.js; src/dev/testChecklists.js.
**Changed:**
- Model: DON'T KNOW HOW (nothing rubbed on the first patch) -> the first-time teaching ladder: ~10s a clearly visible small glow spot (no voice), ~18s short scratch hand + "Rub the glowing spot.", ~8s after that line the longer 2-pass hand with NO voice (the "Rub right here." line was tried and dropped). ALREADY KNOWS HOW (any rubbing on this patch, or a patch already finished) -> no more hands/glow spot: ~10s idle one short reminder — "Keep rubbing.", or "Almost there!" once the WHOLE game is ~75% done (3 of 4 patches finished, counting this patch's progress toward its 42% completion target); it is said once and re-armed only after the child rubs again; ~25s idle a quiet cue for the remaining dark area, no voice, then stop.
- Bug fix: the hint clock never restarted after a partial rub (enabled was read from a ref, so lifting the finger caused no re-render); now tracked in state (isRubbing).
- The glow/hand target now aims at the deepest uncleared point (farthest from any cleared cell), not the average of all dark cells (which landed inside the already-rubbed area once the rub bands became broad). L1 glow was ~7-13% alpha on a near-black layer (invisible); now clearly visible, ~half the patch width (max 16%), 3 pulses.
- Voice content: removed surya_hint_here / surya_hint_continue; added surya_hint_almost ("Almost there!"); "Keep rubbing." (surya_hint_keep) reused.
- Checklist: 10 steps for the above.
**Verified:** Madhurima ran the checklist in the harness (10/10 ticked). eslint clean; CSS compiles.
**Open:** the ~25s "can't find the rest" cue is NOT showing properly (checklist steps 5 and 6: "leave this — not showing", "same as before"). Tried in order: a small spot at the densest dark cluster (cut off in the top-left corner), a spot at the deepest dark point sized to fit (faint ring on the screen edge), and finally a screen-blended warm light wash over the whole active band (not visible enough). Madhurima parked it to do later. Ideas for later: fade the dark canvas (opacity pulse) while the patch is active instead of an overlay, or shimmer sparkles over the uncleared cells, or drop the visual and rely on the reminder voice. Also still undecided: whether the reminder should have a middle line (e.g. "You're doing great!") by overall progress.

## [2026-10-05] — Symbol Mountain: symbol card + sidebar sized for iPads
**Touched:** src/zones/symbol-mountain/shared/components/SymbolCardModal.css, SymbolSidebar.css.
**Changed:** symbol card ("Do you know why I ride Mooshika?") scaled 0.85 on shorter iPads (landscape, >=1000px wide, <=900px tall) and 1.15 on the Pro, via the `scale` property (its animation owns transform). Sidebar rail on shorter iPads: tap areas 56->50px, icon 42->38px, gap 6->4px, so it no longer reaches the replay button (~510px -> ~440px tall). Pro unchanged.
**Verified:** from Madhurima's screenshots; she asked for both changes. Not re-checked after the edit at the time of commit.
**Open:** sidebar tap area is 50px (under the 60px rule) by choice for fit; revisit if tapping is hard on a real iPad.

## [2026-10-05] — Shloka River: sidebar rail + chant card sized for shorter iPads
**Touched:** src/zones/shloka-river/shared/AppSidebar.css, src/zones/shloka-river/shared/components/ChantCardModal.css.
**Changed:** landscape under 900px tall — the 8-icon rail overflowed past the top (icons 60px -> 44px, gap 4px, pill 62px); the chant card ("My great form can hold a lot") was taller than the screen (scale 0.78 via the `scale` property, since its animation owns transform). iPad Pro unchanged.
**Verified:** Madhurima checked on the shorter iPads: fine.
**Open:** rest of Zone 2 T20 (scenes 05-09).

## [2026-10-05] — Dreams & Wishes: iPad sizing pass
**Touched:** src/zones/about-me-hut/enjoy/DreamsWishesGame.css (blocks appended at the end).
**Changed:** iPad Pro — Wish 1 globe 378px, faces ring x1.5, bubbles +50% (inline sizes overridden with !important); "Draw your dream" pad (shared Drawingpad, scoped to this scene) scaled 0.8 on shorter iPads and 1.3 on the Pro via transform (not zoom, so touch mapping stays right); "We Both Have Wishes" Continue pinned to the bottom of the overlay with 92px reserved.
**Verified:** Madhurima checked the screens on all three iPads in the harness: fine.
**Open:** Zone 2 (Shloka River) T20 passes. NOTE for testing: the harness lays the game out ~44px below the visible area (toolbar), so bottom-edge cut-offs there are partly a harness artifact (left unchanged by choice).

## [2026-10-05] — Favorite Food: iPad sizing pass (Pro enlargements, shorter-iPad lifts)
**Touched:** src/zones/about-me-hut/food/Favoritefoodgame.css (blocks appended at the end).
**Changed:** iPad Pro (`min-height: 901px`) — Ganesha choice rows (sweets 22->18% up, colours/activities/friends) scaled 1.25 with the centring translate kept in the transform; child food grid 1.25, colour hearts 1.2, activity ring 1.25 (17% up); "Your turn" card + Ganesha 1.15; celebration Ganesha/food bigger; Draw/Type 1.3x; friend-name box zoom 1.3; story header zoom 1.25; picked icon zoom 1.3; "We're Friends Now!" card/title/Continue zoom 1.3. Choice-name gap tightened (-14px, colours -24px, Pro -20/-30px). Shorter iPads (`max-height: 900px`) — choice rows 21% up; child food Draw/Type 13% up; child activity ring 29% and Draw/Type 13% up (clipped before).\n**Verified:** CSS written from Madhurima's screenshots; she checked several screens, not all on every iPad. Browser could not open localhost this session, so no direct run.\n**Open:** child colour screen on short iPads; Dreams \& Wishes and Zone 2 T20 passes; Favorite Food NOT frozen.\n

## [2026-10-04] — Symbol Mountain hint pass complete (Eyes prompt, Tusk nest hand/zone/voice) + checklist status panel
**Touched:** src/lib/beatPlayer/BeatPlayerGame.jsx; src/lib/components/feedback/GestureDemo.jsx; src/zones/symbol-mountain/scenes/tusk/tuskNestFlow.json + EyesPopUpGame.jsx; src/dev/TestChecklistPanel.jsx + testChecklists.js.
**Changed:**
- Tusk nest: the demo hand never travelled — BeatPlayer's gestureDemoFromTo looked the target up as an item, but the nest target is a raw {x,y,w} zone, so from === to and the hand sat on its start spot (teaching, L1, L2, L3). Now uses the zone position. Nest drop zone width 16 -> 12. From the 2nd wrong drop the current hint line is spoken again (unless it is still speaking), so a line cut by the next grab is not lost.
- GestureDemo: keyframe injection is keyed on the coordinate values, not object identity (a parent re-render with fresh {x,y} literals used to restart the hand).
- Eyes: tapping the second object while the first one's found-line was speaking cut that line and its end callback said "Now find the X" over the found line; the prompt (and the idle clock it arms) now skips an already-found object.
- Checklist panel: the picker shows each checklist's status (green dot + passed, red dot + failed, "Done" only with zero failures, red "Bugs" otherwise).
**Verified:** Madhurima ran all seven Symbol Mountain checklists in the harness — all Done, 0 failures (Branch 9, Bush+Marsh 8, Garland 7, Pond 5, Eyes 6, Ears 5, nest 9). eslint clean on changed files; not otherwise automated.
**Open:** Shloka River + About Me Hut checklists still to run (Mahakaya, Samaprabha, Kurumedeva, Nirvighnam, Sarvakaryeshu, Sarvada, Finale, Suryakoti, Vakratunda, Favorite Food, Dreams & Wishes, My Indian Story, sidebar check); Madhurima's tuned nest drop-zone position (50.95, 55.2) not saved; full build before pushing.

## [2026-10-05] — Family Tree: iPad sizing pass (frozen)
**Touched:** src/zones/about-me-hut/family-tree/Familytreegame.css (iPad blocks appended at the end of the file).
**Changed:** shorter iPads — tree + circles scaled together, build-your-tree rows/tree/circles resized, Remove/Done lowered; iPad Pro — tree/circles +10%, bigger Continue (also fixed the Continue jumping right on press: the shared pill hover/active transform dropped translateX(-50%)), bigger fact card and tray, "Our Families" cards +25%; Ganesha moved onto Kartikeya's row in "Our Families" on every iPad.
**Verified:** checked by Madhurima on 1024x670, iPad mini and iPad Pro 13 in the harness; frozen.
**Open:** Favorite Food, Dreams & Wishes and Zone 2 still need the T20 iPad pass. Not committed yet.

## [2026-10-04] — Indian Story: iPad sizing pass (--u unit) on map, guess, choice and final screens
**Touched:** src/zones/about-me-hut/indian-story/MyIndianStoryGame.jsx + .css; src/zones/about-me-hut/components/AboutMeComparisonCard.css.
**Changed:** Ganesha Home and Child Home now share identical wrapper spacing; map ~14% bigger (65% of app height) and its pins/labels/glow scale from the map width (`--mis-map-w`) so they match on every iPad. Language guess and Festival guess screens (cut off at 1024x670) re-sized from `--u` instead of vh/vw clamps; removed the `!important` fest-card size override. Language choice: cards ~12% shorter, counter text moved down, block lifted (paddingBottom 20u) so the text no longer overlaps the bottom row. Final "My Indian Story" compare card sized entirely in `--u` (scoped to `--story-connect`, rules last in AboutMeComparisonCard.css); child-column icons/gaps in the JSX moved to `--u`.
**Verified:** vite build passes; Madhurima checked Ganesha/Child Home, guess screens and language choice in the harness; final compare card re-checked by Madhurima on all 3 iPads: good.
**Open:** T20 for Family Tree / Favorite Food / Dreams and Zone 2. Other uncommitted work in the tree (Garland DECISIONS entry, Tusk, Pond, BeatPlayer, GestureDemo, testChecklists) is not part of this commit.


## [2026-10-04] — Garland carry hints finally start (clock bug), visible L1 lift, 4s Modak gap
**Touched:** src/zones/symbol-mountain/scenes/modak/GarlandGame3.jsx + .css.
**Changed:**
- BUG FIX: in the carry step (drag the garland to Ganesha) no hint ever appeared after the teaching hand. The carry 10/18/26 clock started after `await speakAsync(VO.ready)`, guarded by the effect-scoped `cancelled` flag; `setPhase(READY)` flips `isBuild`, re-running the effect and firing its cleanup (cancelled = true) while the line was still speaking, so the clock never started. Now guarded by `isActiveRef` (stops only if the game is deactivated). The guard dates from the original carry-hint commit e3e23144, so this probably never worked. The build-phase intro uses a similar guard; it passed testing and was left alone.
- Carry L1: the 4px garland lift was too subtle to notice; now 3 clear lifts (12px, slight grow, soft gold glow) then stops.
- After the garland lands on Ganesha, the golden Modak above Mooshika now stays ~4s before the symbol reveal (was ~2.1s: glow at 1.1s, reveal at 3.2s -> now 5.1s).
**Verified:** Madhurima re-tested Garland in the harness after the fix: working. eslint clean on GarlandGame3.jsx.
**Open:** Garland carry L3 Ganesha glow still pulses forever (not yet moved to the settled-L3 standard); Garland checklist step "Carry: miss 3 times quickly" still to run.

## [2026-10-04] — Garland (Modak Game 3) build hints: L2 wording, L3 tap hand
**Touched:** src/zones/symbol-mountain/scenes/modak/GarlandGame3.jsx + .css; src/dev/testChecklists.js.
**Changed:** Build phase (tap the six flowers). L2 line was "Tap another flower." — wrong for a child who has tapped nothing — now "Tap any flower." L3 (8s after the L2 line ends) now shows a tap GestureDemo on the first remaining flower (rendered inside the garland workspace so the flower's own % position lines up) plus ONE short line "Tap this flower." (L2 and L3 no longer say almost the same thing). The golden ripple ring on that flower now runs 3 ripples (in step with the 2-pass hand) then stays as a quiet static ring until the child taps (was an endless ripple). Carry phase unchanged: its L3 Ganesha glow still pulses forever (not yet moved to the settled-L3 standard).
**Verified:** eslint clean on GarlandGame3.jsx; GarlandGame3.css compiles (esbuild); NOT browser-tested — hand position over the flower not yet confirmed by eye.
**Open:** run the Garland checklist (build-phase L1/L2/L3, and L2 with no flower tapped); confirm the hand lands on the flower at iPad sizes; decide whether the carry-phase L3 glow should also settle (DECISIONS 2026-10-02 settled-L3).

## [2026-10-04] — Interaction boundary audit complete across active scenes
**Touched:** INPUT_AUDIT.md; docs/INTERACTION_BOUNDARY_AUDIT_PROCESS.md; docs/ACTIVE_GAME_MECHANICS.md.
**Changed:** Marked the input-boundary audit done across Symbol Mountain, Shloka River, and About Me Hut. Added the About Me Hut scene rows to the audit table, clarified that the Shloka River Finale boat choices now use polygon hit zones, and converted the handoff doc from a remaining-work list into a completed-audit process note. About Me Hut completion is recorded from the separate AI pass; current working-tree code changes for My Indian Story were left untouched.
**Verified:** Git history shows the interaction-boundary overlay commit (`ba1ecdfd`) and finale polygon commit (`ddd74412`). Current status still has only the separate About Me Indian Story code changes outside this documentation update.
**Open:** none for the interaction-boundary audit.

## [2026-10-02] — Voice + Replay controls: soft halo, smaller, equal size
**Touched:** src/App.css (size variables), src/lib/components/ui/AudioToggle/AudioToggle.css, src/lib/components/feedback/VOReplayButton.css.
**Changed:** Voice (mute) and Replay no longer sit in a hard white / lavender-bordered circle. They are now a small icon in a soft translucent cream halo (no border, no shadow), subtle (88% opacity) until tapped, hovered or playing. Gameplay variant (live scenes, iPad + phone): halo 36px for BOTH controls (was 42 / 40), Voice icon 20px, Replay icon 24px (its PNG has transparent padding, so it needs a bigger box to look the same weight). Tap area stays 60px (CLAUDE.md touch rule + Mobile Step 1 decision) — the critic's 44-48px suggestion was not followed. Legacy variant: icons 26-32px (were 36-48) inside the halo; replay wave rings changed from white to soft lavender so they show on the halo.
**Verified:** the three CSS files compile (esbuild). NOT checked visually in a browser; halo may be faint on cream/pink scenes.
**Open:** eyeball Family Tree + one Symbol Mountain scene on iPad/phone sizes; if the halo is too faint raise it from 60% to ~70%; tune the 24px replay icon if it still looks small/large next to the speaker.

## [2026-10-02] — Choice-game hint ladders: settled L3, wrong taps keep the ladder (My Indian Story, Favorite Food, Sarvakaryeshu)
**Touched:** src/zones/about-me-hut/indian-story/MyIndianStoryGame.jsx + .css; src/zones/about-me-hut/food/Favoritefoodgame.css; src/zones/shloka-river/scenes/scene4/SarvakaryeshuGame.css; src/dev/testChecklists.js.
**Changed:**
- Ganesha Home (magnifier): L3 now rings every spot not yet found (3 at the start) for ~8s, then the rings end and the ladder stays quiet until the child moves the magnifier (fresh 10/18/26). No pointing emoji existed in code (only a stale log line). Dragging the magnifier no longer clears a visible hint; finding a spot resets the ladder.
- Language Ganesha: L2 is ONE line, "Think of the language many shlokas are in." (chant no longer replayed); removed the standalone "Tap play." line (fallbacks use "Tap play and listen carefully."). L3: Sanskrit card pulses 3x (~8s) then a quiet static gold highlight; no VO.
- Festival Ganesha: L2 "Think of the festival that celebrates Ganesha." (was "...my favorite sweet"); L3 same settled treatment on Ganesh Chaturthi.
- A wrong tap no longer ends/restarts the Language/Festival ladders (shake state removed from the effect gate + deps); after L3 the answer stays highlighted. L3 also arms after a 7s limit if the L2 line is cut or its "ended" never arrives.
- Favorite Food L3 and Sarvakaryeshu L3: 3 pulses (~8s) then static highlight (were pulsing forever). Favorite Food L3 stays visual-only; Sarvakaryeshu keeps its single "Remember? ..." line (spoken once).
- Same day: the three My Indian Story idle ladders no longer list their own level as an effect dependency (it restarted 10/18/26 on every level change).
- Checklists: Ganesha Home, Language, Festival, Favorite Food, Sarvakaryeshu steps.
**Verified:** the game file compiles (esbuild) and the checklist file lints clean; NOT browser-tested.
**Open:** run the My Indian Story / Favorite Food / Sarvakaryeshu checklists; Ganesha Home L3 currently ends after ~8s — critic suggested a quiet static ring may remain (DECISIONS PENDING 2026-10-02); Family Tree / Dreams & Wishes ladders not reviewed against the settled-L3 standard; full build before pushing.

## [2026-10-02] — Mobile Step 3E: InnerMandala phone-landscape treatment (Step 3 complete)
**Touched:** src/lib/components/celebration/InnerMandala.css + .jsx (middle-ring hit disc + tap router).
**Changed:** Overlay mandala sized to 66dvh with message and hint below it (hint no longer overlaps the message), safe-area padding, no scroll; invisible middle-ring hit disc routes taps by angle to the nearest of the 8 symbol petals (active only on phone landscape).
**Verified:** headless Chrome with the REAL InnerMandala at 667x375 and 844x390: mandala/message/hint inside viewport, overflow hidden, 24/24 simulated middle-ring taps routed to the correct petal, 0 wrongly routed to the outer ring, outer tip tap still reaches the outer ring. The hint-under-message offset was applied after the last run (arithmetic check only). Not on a physical device.
**Open:** on-device pass of all Step 3 modals; delete untracked __*_test.html / src/dev/__*TestMain.jsx harness files; Step 3 then done -> next: per-scene object composition (one hard scene first).

## [2026-10-02] — Mobile Step 3D: SymbolCardModal + ChantCardModal phone layouts
**Touched:** src/zones/symbol-mountain/shared/components/SymbolCardModal.css + .jsx (hidden-by-default close X); src/zones/shloka-river/shared/components/ChantCardModal.css.
**Changed:** Wide two-column panel on phone landscape (icon left, text right), visible 60px close X on the symbol card, Practice Chanting on a full-width 60px row, chant close button pulled inside the card (60px hit / 42px visible), helper + footer lines hidden on phone. Tablet/desktop unchanged.
**Verified:** headless Chrome with the REAL components, all 8 symbol cards + all 8 chant cards at 667x375 and 844x390 (symbol) / 667x375 (chant re-check after the close-button fix): card inside viewport, all parts inside card, no internal scroll, close >= 60px, chant CTA 60px; screenshots reviewed. Madhurima is testing on device.
**Open:** Step 3E InnerMandala (CSS written, being measured); on-device pass of all Step 3 modals; delete the untracked __*_test.html / src/dev/__*TestMain.jsx harness files.

## [2026-10-02] — Mobile Step 3B + 3C: completion screen and SymbolAutoReveal phone layouts
**Touched:** src/lib/components/celebration/SceneCompletionCelebration.css; src/lib/components/reveal/SymbolAutoReveal.css + .jsx (markup: hidden back-icon + text wrapper).
**Changed:** Completion — phone-landscape shell like OpeningModal (small Ganesha, cream card, one 60px primary button, quiet Home/Play Again links with 60px hit areas, trophies/badge scaled, no scroll, no lotus). SymbolAutoReveal — horizontal flip card: symbol front; symbol + name + affirmation + 'Tap to collect' pill on the back. Tablet/desktop unchanged.
**Verified:** headless Chrome with the REAL components: completion in 6 live variants at 667x375 and 844x390 (card inside viewport, CTA 60px, quiet-action hit boxes 60px and not overlapping the CTA, trophies + bridge line fit, no clipped child, overflow hidden, no VO replay); SymbolAutoReveal with short/long names and affirmations at 667x375 and 844x390 (card + all parts inside, no overflow, 24/20/16px type). Screenshots reviewed. Not yet on a physical device.
**Open:** Step 3D SymbolCardModal/ChantCardModal phone layout; Step 3E InnerMandala; on-device check of the reveal fly animation.

## [2026-10-01] — Mobile Step 3A: OpeningModal phone-landscape layout
**Touched:** src/zones/shared/components/OpeningModal.css (CSS only).
**Changed:** New block under the canonical phone condition: wide/shallow card, small Ganesha left, one icon row, no lotus/connector, 60px CTA, no scroll, clamp()/dvh sizing (no new fixed-px !important). Card is a plain rounded cream card on phone instead of the aspect-locked organic SVG. The pre-existing 568-1023px landscape block is now limited to height > 500px so tablets keep their look.
**Verified:** headless Chrome with the real OpeningModal for all 13 live scenes at 667x375, 844x390, 932x430: card inside viewport, CTA fully visible and 60px, no scroll, no clipped child, one icon row, lotus hidden; screenshots reviewed at 667 and 844. Tablet/desktop CSS untouched. Not yet checked on a physical device.
**Open:** Step 3B completion screen, then SymbolAutoReveal, SymbolCardModal/ChantCardModal, InnerMandala.

## [2026-10-01] — Hint system: only meaningful progress clears hints + floating test checklist
**Touched:** src/lib/hooks/useRepeatedHintCycle.js; src/lib/components/feedback/GestureDemo.jsx; src/lib/beatPlayer/BeatPlayerGame.jsx; Modak (FlowerJourneyGame2, GarlandGame3); Symbol Mountain (EyesPopUpGame, EarsSoundMatchGame, PondSceneSimplifiedV4); Shloka River (SuryakotiGame, SamaprabhaGame, KurumedevaGame, MahakayaRescueGame, NirvighnamGame, SarvakaryeshuGame, ShlokaRiverFinale); About Me (ObstacleRemoverGame, MyIndianStoryGame); NEW src/dev/TestChecklistPanel.jsx, src/dev/testChecklists.js, src/dev/TEST_CHECKLISTS.md; GameTestHarness.jsx (mounts the panel).
**Changed:**
- Hook: `markProgress` / `markAttempt` / `markWrongAttempt` / `markContinuousProgress` (700ms throttle); `markInteraction` kept as a temporary alias of `markProgress`. A wrong attempt never clears a visible hint; 2nd wrong → L2, L3 only from L2 and never cuts a speaking L2 line. A cut/never-ended L2 line no longer gates L3 forever (12s limit; same idea in Flower Journey, Garland, Eyes, Ears).
- `GestureDemo` is display-only: no longer dismisses on any pointerdown (`dismissOnAnyPointer` opts back in).
- Partial attempts keep a visible hint (Flower Journey bush/branch/marsh, BeatPlayer nest, Garland, Pond, Mahakaya, Nirvighnam, Finale, Kurumedeva). Wrong attempts now escalate (Kurumedeva, Finale, Sarvakaryeshu). Samaprabha: only a touch ON the clue cuts VO / dismisses the teaching hand. Dreams & Wishes: a wrong bubble no longer resets hints. Pond: partial tries no longer wipe the failed-attempt streak.
- Flower Journey: hint VO replays each ladder cycle (was once per phase); new Marsh line "Good jump! Now the next safe spot." after the first jump.
- Sidebar: reopening within the 400ms replay window used to drop the interrupted line (intro never finished → hint clock never armed → frozen hints). Fixed in Garland, Flower Journey, Eyes, Ears. Ears tab-switch now uses the same tracked interrupt/replay (no early advance, no stale replay).
- My Indian Story: the three idle ladders listed their own level as an effect dependency, restarting the 10/18/26 chain on every level change; removed.
- Dev harness: floating step-by-step test checklist (Pass/Fail, notes, screenshots, pop-out window, HTML/markdown report), one list per game grouped by zone.
**Verified:** eslint on changed files (new code clean; remaining errors/warnings pre-existing); one full `vite build` passed mid-session. NOT browser-tested: Samaprabha/Kurumedeva/Mahakaya/Nirvighnam/Sarvakaryeshu/Finale/Pond/Indian Story/Garland/Eyes/Ears/nest changes. Flower Journey branch (9 steps) and generic gesture checks passed in the harness; Bush/Marsh 7 of 8 passed (step 7 failed before the L3 fix).
**Open:** run the per-game checklists; final full build → staging → Netlify preview → prod; Ears/other `markInteraction` callers still on the alias; TASKS T62. Several scene files carry earlier uncommitted sidebar-pause work that was committed along with these changes (noted in the commit messages).

## [2026-10-01] — Mobile Step 1: phone gameplay chrome foundation + Home removed from 13 live scenes
**Touched:** App.css, ZoneBadgeButton.jsx/.css, AudioToggle.css, VOReplayButton.css, SymbolSidebar.css, ZoneWelcome.css, and the 13 live scene files (NewModakSceneV7, PondSceneSimplifiedV4, SymbolMountainSceneV3, SacredAssemblySceneV8, VakratundaGroveSimplified, SuryakotiBankSimplified, NirvighnamChantSimplified, SarvakaryeshuChantSimplified, ShlokaRiverFinale, Familytreegame, Favoritefoodgame, ObstacleRemoverGame, MyIndianStoryGame).
**Changed:** Revised the external Step 1 pack before applying (see DECISIONS 2026-10-01): scoped `variant="gameplay"` Zone, 60px hit / 46px visible controls, canonical 500px phone breakpoint (480px rules migrated), fixed-position VOReplay on phone, no safe bands, OFF-state dimming preserved. HomeButton import + render removed from the 13 scenes; Zone kept with `variant="gameplay"`. Parked zones untouched. Not committed.
## [2026-10-01] — Mobile Step 2: phone collection drawer (rosette) for Symbol Mountain + Shloka River
**Touched:** NEW src/lib/components/collection/PhoneCollectionDrawer.jsx/.css, src/lib/utils/collectionTarget.js, public/images/icons/symbol-collection-rosette.png; EDITED SymbolSidebar.jsx, AppSidebar.jsx, SymbolAutoReveal.jsx, useSymbolCollection.js, SymbolCardModal.css, ChantCardModal.css, and the 7 scenes that computed a flight target (Modak, Pond, Tusk, Vakratunda, Suryakoti, Nirvighnam, Sarvakaryeshu); GestureDemo.jsx (exemption — already landed inside 712618be).
**Changed:** Phone landscape hides the rail and shows a rosette button + 4x2 symbols-only drawer; `getCollectionTarget` makes symbols fly to the rosette on phone and to the exact rail slot elsewhere; drawer owns the sidebar pause (cards inside it do not end it); locked taps are neutral (tap + pulse); cards raised to z 2100 above the drawer (2050).
**Verified:** headless Chrome with the REAL SymbolSidebar / AppSidebar + SymbolAutoReveal + useSidebarPause at 844x390 (both) and 667x375 (SymbolSidebar): rail hidden, flight delta = rosette centre, gold bloom on rosette, new symbol unlocked in the drawer, 4 columns / 8 items / no text, card above drawer, scene stays paused after closing a card, resumes after closing the drawer. NOT run through full Pond/Vakratunda gameplay or on a physical device.
**Open:** SymbolCardModal / ChantCardModal phone layout (Step 3); OpeningModal + completion phone layouts (Step 3); on-device check of flight + bloom in a real scene; do not merge/ship Step 1+2 together until QA'd.

**Verified:** eslint clean on changed JSX; no HomeButton refs left in the 13 files. NOT yet checked visually at 667x375 / 844x390 / 932x430.
**Open:** visual QA at the 3 phone sizes; Step 2 Wisdom button + drawer (reusing useSidebarPause, generic collectionTarget); do not merge/ship before Step 2. Other 480px rules (CleanProfileSelector, Enhanced.css) belong to the later non-gameplay phase. Tablet Voice/Replay still 36px (pre-existing, below the 60px rule) — decide separately.

## [2026-09-30] — Suryakoti: broad percentage rub bands replace small scratch targets
**Touched:** src/zones/shloka-river/scenes/Scene2/components/SuryakotiGame.jsx, SuryakotiGame.css.
**Changed:** Suryakoti now tracks progress with four overlapping normalized rectangle bands (`sur`, `ya`,
`ko`, `ti`) instead of small circular/ellipse targets. Rubbing anywhere still visibly clears the dark
canvas, while progress counts inside the current broad left-to-right band (`0–90%` height, bottom
10% excluded). Completion threshold lowered to `0.42`, grid is `10 x 16`, and the L1 hint is a soft
band-sized glow instead of a permanent circular ring.
**Verified:** focused `npx eslint src/zones/shloka-river/scenes/Scene2/components/SuryakotiGame.jsx`
passed.

## [2026-09-30] — Samaprabha: press-and-hold switched to the Pond hold behaviour
**Touched:** src/zones/shloka-river/scenes/Scene2/components/SamaprabhaGame.jsx, SamaprabhaGame.css (uncommitted).
**Changed:** Hold now works like the Pond lotus/rock hold. The progress ring is a gold ring drawn on the
current shadow target (`.sama-hold-ring`), not a tiny ring inside the moving light beam. Early release
shrinks the ring at 2x speed; re-pressing within 1s resumes from the current value; after 1s it resets
to 0 (`HOLD_DECAY_MULTIPLIER`, `HOLD_RESET_GRACE_MS`; `HOLD_MS` still 1150). Removed `HOLD_DRAIN_MS` and
the old `.sama-hold-progress/track/fill` CSS. Cause of the reported "ring only ~5%" was not reproduced;
best guess: every press reset the ring to 0 and release drained it in 260ms.
**Open:** Madhurima tested it and confirmed ("fine, done"). Not committed — waiting for go-ahead.

## [2026-09-30] — Tusk: parent idle ladder switched off during the nest game; L2 -> L3 audit of other zones
**Touched:** src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx (uncommitted).
**Changed:** The scene-level 10/18/26s idle ladder no longer runs while the tusk nest game
(`TuskBeatPlayerLive` / BeatPlayerGame) is showing (`!sceneState?.showTuskAssemblyGame` added to
`isHintPhase`, plus the effect dependency). Before, it kept counting from game start (the child's
drags never reach the parent) and spoke the old `idleTusk` line ("Look at the obstacle...") at ~18s
on top of the beat player's own per-beat L2/L3 lines. Removed the now-unused `idleTusk` line and
its branch. Eyes/Ears ladders unchanged.
**Audited, no change needed:** other zones' L2 -> L3 timing. Symbol Mountain (Modak, Pond, Tusk) and
About Me Hut (Family Tree, Favorite Food, Obstacle Remover, My Indian Story) build their own inline
ladders (not `useRepeatedHintCycle`) and already wait for the L2 VO to end; the end callback also
fires when muted / key missing (traced by reading). `DreamsWishesGame.jsx` (About Me Hut) was the
only other `useRepeatedHintCycle` caller — it is an old unused scene (not imported anywhere) and was
left alone. Sacred Assembly (final scene) has no L1-L3 ladder, only the shared idle timer (skimmed).
**Left to test (not verified in a browser):**
1. Full Symbol Mountain Tusk scene: play Eyes and Ears, reach the nest game, leave it idle ~30s ->
   only the beat player's lines ("Drag the twig to the nest." etc.) play, no "Look at the
   obstacle" line, no parent hint visuals over the nest game.
2. Eyes and Ears games still get their scene-level L1-L3 hints after the change.
3. Nest game -> tusk reveal -> completion: parent ladder resumes/stays off correctly afterwards.
4. Beat player alone (harness `game=sm-tusk-live-v2`, checked): loads, no console errors, L2 spoke
   once at idle. NOT checked: L3 arriving 8s after L2, hints during real drags, all 4 beats.
5. Whether the parent's `speak` and the beat player's `speechSynthesis` really interrupt each other
   (inferred from the Shloka River dual-speech fix, not observed).
**Open:** The full-scene harness (`game=sm-symbol`) sat on "loading" >20s so the scene itself was
not exercised; my own dev server on 5174 was unreachable, the check used the server already on
5173 (assumed to serve this folder). Change not committed — waiting for Madhurima's go-ahead.

## [2026-09-30] — Voice-mute: hook-level test result + what is left to test
**Touched:** none in the app (temporary test page and a temporary launch.json entry were
added and removed; nothing left behind).

**Tested (13/13 PASS, real `useGaneshaVoice` + `useVoiceGuidance` in the browser pane, fake
TTS/Audio, timings approximate because the pane runs timers slowly):**
voice on speaks + `onEnd` once; voice off = no speech/audio, `onStart` fires, `onEnd` NOT
instant and fires once after ~line length (spoken line, `playWord` ~1s, `playSyllable`
~0.7s, `playVoice` with text); mute mid-spoken-line cancels at once, callback fires once ~when
the line would have ended, no second callback; mute mid-MP3 pauses at once, callback fires
once at ~full length, no second callback; unmute starts nothing by itself; a new line
supersedes a pending silent line (old one ends right away, once); SFX still plays with voice
off.

**Left to test (needs a real browser/device — none of this is covered above):**
1. Every one of the 13 live scenes: mute mid-line -> game moves on at its normal pace (no
   skip), unmute -> nothing old resumes, Replay -> plays the current line, Replay disabled
   while muted.
2. Mute -> open sidebar -> close sidebar -> unmute while a line is active (Sarvakaryeshu/
   Sarvada, Vakratunda, Suryakoti, Nirvighnam). Traced by reading only.
3. Scene wrappers I rewrote: Shloka scenes' own Web Speech (`muteWebSpeech`), Family Tree
   (placement sequences, child-start line, tree-done transition), My Indian Story (13
   branches now wait the line's length when muted — check the pacing feels right; opening
   line plays once and never on unmute), Pond/Tusk/Modak/Favourite Food/Dreams.
4. Sarvada replay: intro during the intro, morning/afternoon/night prompt on images 1-3,
   "find the hidden symbol" in the search stage.
5. SFX stays on with voice off; `SanskritVoiceRecorder` reference/playback still works muted.
6. iOS Safari (speech priming + hidden-tab behaviour), and a slow/low-end device.
Not reachable in this sandbox: the real app stalled on its loading screen with a hand-made
test profile, and the game harness mocks the voice hook, so neither tested the scenes.

## [2026-09-30] — Sidebar = true pause across Shloka River + Symbol Mountain; teaching hand cued to the action word
**New shared files:** src/lib/hooks/useSidebarPause.js; src/lib/hooks/usePausableTimers.js; src/lib/utils/speechCue.js; src/lib/config/content/voiceCues.js.
**Touched (shared):** src/lib/hooks/usePauseAwareTimeout.js (freeze/thaw); src/lib/hooks/useRepeatedHintCycle.js (`paused` + resume pin); src/lib/hooks/useGaneshaVoice.js, useVoiceGuidance.js (`cue` option); src/lib/components/feedback/GestureDemo.jsx (`paused` prop, ignores sidebar taps); src/lib/components/reveal/SymbolAutoReveal.jsx/.css (only a card tap collects; sidebar dims while the card is up); src/lib/beatPlayer/BeatPlayerGame.jsx/.css (sidebar pause, hint/VO replay rules, teaching-gesture cue).
**Touched (Shloka River):** Scene1 VakratundaGroveSimplified, MahakayaRescueGame, VakratundaRescueGame; Scene2 SuryakotiBankSimplified, components/SuryakotiGame, SamaprabhaGame; Scene3 NirvighnamChantSimplified, NirvighnamGame, KurumedevaGame; scene4 SarvakaryeshuChantSimplified, SarvakaryeshuGame, SarvadaGame (+ .css for each game root).
**Touched (Symbol Mountain):** modak/NewModakSceneV7, FlowerJourneyGame2, GarlandGame3 (+ .css); pond/PondSceneSimplifiedV4, PondScene.css; tusk/SymbolMountainSceneV3, EyesPopUpGame, EarsSoundMatchGame, TuskBeatPlayerLive, tuskNestFlow.json (+ .css).
**Changed:** Opening the symbol sidebar is now a TRUE pause of the playable scene. Open: the in-flight VO is captured and stopped WITHOUT firing its onEnded (so nothing advances behind the panel), game timers freeze with their remaining time (usePausableTimers / usePauseAwareTimeout freeze()), animations freeze, hint state is held. Close: after ~400ms only the INTERRUPTED line is replayed once from its start (never mid-sentence), then a fresh 10/18/26 hint clock starts from L0 — if nothing was interrupted the child just gets a fresh 10s and no hint fires. A replayed hint keeps its gesture for ~3.5s (useRepeatedHintCycle `paused` pin). Also: the "finish anyway if audio drops" fallback timers were made pausable so a scene can't complete behind the sidebar; Garland's ready-step no longer cancels itself on pause; Pond/Tusk scene handlers replay only the interrupted line; Eyes/Ears/nest game gained isPaused support. The Pond/Tusk sidebar-card flicker was the pause CSS freezing the card's own animations — the freeze is now scoped to the pond stage. Family Tree unchanged (only verified modal/background-tap behaviour). Affirmation card (SymbolAutoReveal): only a tap on the card collects, backdrop/sidebar taps do nothing, sidebar icons dim while it is up (the fun-fact card keeps "tap anywhere to close").
**Also:** Teaching-hand timing is now cued to the ACTION WORD of the instruction instead of a guessed delay. speechCue.js uses Web Speech word-boundary events (estimate fallback, also used when muted); voiceCues.js registers word (+ `cueMs` for the future recorded MP3s) per line; `cue` option added to useGaneshaVoice / useVoiceGuidance; BeatPlayerGame reads `hints.teachingGestureCue` from the flow JSON. Dev helper `markCue('/audio/….mp3')` in the console prints the cueMs when you press Space at the word. Flower Journey belly emotions now land on their words.
**Commit state:** the first wave — useSidebarPause / usePausableTimers, the Shloka River games + wrappers, SymbolAutoReveal, GestureDemo, useRepeatedHintCycle — is in `09d7fd7c` ("Checkpoint Shloka River current flow"). UNCOMMITTED: the Symbol Mountain sidebar pause (Modak Flower Journey/Garland/scene, Pond, Tusk scene + Eyes/Ears/nest game), the word-cue work (speechCue.js, voiceCues.js, `cue` in useGaneshaVoice/useVoiceGuidance, BeatPlayerGame + tuskNestFlow.json), the `paused` resume-pin in useRepeatedHintCycle, and these docs.
**Mute interplay:** no special case needed — muted lines already run on a silent timer and fire their callbacks on schedule (2026-09-29 voice-mute entry), so the pause captures/replays them the same way; the hand cue falls back to the same character estimate when muted.
**Open:** Not all browser-tested — Madhurima has verified Sarvada, Mahakaya, Flower Journey, Garland, Pond, and the Tusk nest game; Suryakoti, Samaprabha, Nirvighnam, Kurumedeva, Sarvakaryeshu, Eyes, Ears, Modak Mooshika-hold and the word-cued hands still need a pass. `cueMs` values are empty until the MP3s exist. About Me Hut scenes have no sidebar and were not touched. BeatPlayerGame.test.jsx uses jest.mock and can't run under vitest (pre-existing). CHANGELOG/TASKS still carry earlier uncommitted edits.

## [2026-09-30] — Working-tree changes found while reconciling git history (documented from the diff, NOT built/verified by me)
**Touched:** src/lib/components/navigation/ParentDashboard.jsx; src/App.jsx; src/zones/about-me-hut/indian-story/MyIndianStoryGame.jsx; src/zones/symbol-mountain/scenes/modak/ModakScene.css, modak-flow-editor.html; src/dev/modakGame2Preview/ModakGame2Preview.jsx; TASKS.md (T61).
**Changed:** ParentDashboard: sound settings became ON/OFF toggles (Ambience / Voice & pronunciation / Effects) instead of volume sliders — the existing `gmb_parent_sound_*` keys keep storing a number, read as ON for any value > 0 and OFF only for an explicit 0 (no new storage key, old slider values migrate); added a PWA "install app" button with manual install steps (`PwaInstallManager`), Help and About screens, and the active child's age; App.jsx passes `onOpenChildProfile` → profile selector. MyIndianStoryGame: the opening VO is tracked as "played once per mount" so a muted child who unmutes later never gets the opening line resurrected (matches the 2026-09-29 voice-mute rule). Modak dev preview + flow editor: emotion art references switched from `.webp` to `.png`; ModakScene.css gained `aspect-ratio: 1` / `object-fit: contain` for the emotion images. TASKS.md: T61 (voice-mute standardization) added.
**Open:** All uncommitted. ParentDashboard's sound toggles and the install flow need a manual pass (especially that Voice OFF actually silences the game after a reload); the .webp→.png switch assumes the .png files exist next to the .webp ones.

## [2026-09-30] — Shloka River: rebuild finale as symbol-boat flow
**Touched:** src/lib/config/content/voiceGuidance.js;
src/zones/shloka-river/scenes/scene5/ShlokaRiverFinale.css;
src/zones/shloka-river/scenes/scene5/ShlokaRiverFinale.jsx;
src/zones/shloka-river/scenes/scene5/assets/images/choice-boat.png.

**Changed:** Reworked the finale into the new three-boat symbol choice flow.
The opening now plays the full Shloka while each symbol appears in sequence,
then asks the child to choose the first symbol boat. Correct choices sail into
the river, reveal the Sanskrit word only after placement, play the word audio,
and use only two early scaffold lines: "Now, choose the next one." after
Vakratunda and "Great! Keep choosing." after Mahakaay. Later turns rely on boat
movement, sparkle, word audio, and hints instead of extra instruction VO. Added
the new neutral boat asset, enlarged the boat presence, anchored symbols into
the right sail panel, and added a dev-only finale boat tuner for adjusting symbol
placement/scale and placed-boat positions.

**Verified:** `npm run build` passed. Existing build warnings remain for
duplicate object keys, unresolved runtime character image references, and stale
Browserslist data.

## [2026-09-30] — Shloka River: Sarvada refresh, hint timing, and success cleanup
**Touched:** src/lib/hooks/useRepeatedHintCycle.js;
src/lib/config/content/voiceGuidance.js;
src/zones/shloka-river/scenes/Scene1/MahakayaRescueGame.jsx;
src/zones/shloka-river/scenes/Scene1/VakratundaRescueGame.jsx;
src/zones/shloka-river/scenes/Scene2/components/SuryakotiGame.jsx;
src/zones/shloka-river/scenes/Scene2/components/SamaprabhaGame.jsx;
src/zones/shloka-river/scenes/Scene3/NirvighnamGame.jsx;
src/zones/shloka-river/scenes/Scene3/KurumedevaGame.jsx;
src/zones/shloka-river/scenes/scene4/SarvakaryeshuGame.jsx;
src/zones/shloka-river/scenes/scene4/SarvadaGame.jsx;
src/zones/shloka-river/scenes/scene4/SarvadaGame.css;
src/zones/shloka-river/scenes/scene4/assets/images/sarvada/morning-scene.webp;
src/zones/shloka-river/scenes/scene5/ShlokaRiverFinale.jsx.

**Changed:** Refreshed Sarvada with the new morning scene art, revised daily-round
VO/hints, removed the repeated morning/afternoon/night chooser flow after the
one-time intro, strengthened L1/L2 search-area glow and the L3 exact-zone ring,
and kept Scene 4 functional text while removing only decorative success captions.
Shared Shloka River hint timing now waits for L2 VO to actually finish before
starting the L2-to-L3 gap across active scenes. Mahakaya success no longer repeats
the word after the full-word MP3 because the success line now strips the matching
"Mahakaay" spelling.

**Verified:** `rg` checks confirmed active Shloka River hint-cycle callers are
wired for the L2-finished timing and that decorative success caption nodes were
removed from the active mini-games. `git diff --check` passed for the touched
files, with only normal CRLF warnings. Full Vite build was not completed in this
session; an earlier build attempt hung at chunk rendering after transforming
modules.

## [2026-09-30] — Shloka River: clarify Sarvada mute and replay behavior
**Touched:** src/zones/shloka-river/scenes/scene4/SarvadaGame.jsx;
src/zones/shloka-river/scenes/scene4/SarvakaryeshuChantSimplified.jsx.

**Changed:** Clarified the audio rule for Sarvada replay: muting stops any
currently playing VO, unmuting only enables future audio and does not auto-resume
or resurrect an old line, and the replay button now plays the current contextual
line for the Sarvada mini-game. Sarvada publishes its live replay key from the
current intro/image/search state, so unmuting on the second or third image and
pressing replay no longer falls back to the first intro line.

**Verified:** `npm run build` passed. Focused ESLint still reports pre-existing
unused imports/vars and an empty catch in `SarvakaryeshuChantSimplified.jsx`.

## [2026-09-30] — Shloka River: simplify Samaprabha hold and teach Nirvighnam obstacles
**Touched:** src/lib/components/feedback/GestureDemo.css;
src/lib/components/feedback/GestureDemo.jsx;
src/zones/shloka-river/scenes/Scene2/components/SamaprabhaGame.css;
src/zones/shloka-river/scenes/Scene2/components/SamaprabhaGame.jsx;
src/zones/shloka-river/scenes/Scene3/NirvighnamGame.jsx.

**Changed:** Simplified Samaprabha to one mechanic: press and hold directly on
the shadow to inspect it. The old drag-light/hold combination was removed, the
active inspection point is now shown as a smaller soft light with inactive lights
faded, and child action stops active VO immediately. Samaprabha hint demos now
use the same hold-progress teaching pattern as Nirvighnam's rock. Nirvighnam now
plays immediate task VO as each obstacle becomes active, starts each obstacle's
hint timer only after that intro VO finishes, and avoids treating a branch tap as
a drag until there is meaningful movement.

**Verified:** Targeted ESLint passed for SamaprabhaGame, NirvighnamGame,
voiceGuidance, and webSpeechScripts during the work session. Broader targeted
lint still reports pre-existing unused imports/vars and hook warnings in scene
wrapper files.

## [2026-09-30] — Hold demos: show full progress on first teaching cue
**Touched:** src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx;
src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx;
src/zones/shloka-river/scenes/Scene3/NirvighnamGame.jsx.

**Changed:** Removed the repeated Pond VO after the trunk reveal so the lotus
phase now says only "Hold the bud to help it bloom." The water-reaching-lotus
line remains before the trunk symbol reveal. Updated intro hold teaching demos
in Pond, Modak, and Nirvighnam to use the full `hold-progress-l3` ring so hold
teaching shows the complete action, matching drag/swipe demos. Samaprabha was
checked and already used `hold-progress-l3` for its first hold teaching cue.

**Verified:** Targeted `rg` checks confirmed no remaining `introGesture ?
'hold'` or `pondIntroGesture ? 'hold'` branches in the checked scenes, and
confirmed Samaprabha/Nirvighnam intro hold demo mappings.

## [2026-09-30] — Symbol Mountain: align final-scene completion VO after orbs
**Touched:** src/zones/symbol-mountain/scenes/final scene/SacredAssemblySceneV8.jsx.

**Changed:** Moved the final assembly closing VO chain out of the initial
fireworks/orbs trigger. The orbs finish first, then the two closing lines play,
then the completion modal opens. Pond and Tusk were checked and already hand off
fireworks to mandala/completion without an early `sceneComplete` VO call; Modak
remains unchanged as the reference flow.

**Verified:** `git diff --check` passed for the final scene file.

## [2026-09-30] — Shloka River: defer completion VO until after fireworks
**Touched:** src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx;
src/zones/shloka-river/scenes/Scene2/SuryakotiBankSimplified.jsx;
src/zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx;
src/zones/shloka-river/scenes/scene4/SarvakaryeshuChantSimplified.jsx.

**Changed:** Removed the early `sceneComplete` VO calls from the final
app-discovery/fireworks trigger. The completion line now waits for the existing
completion-display path instead of starting during the fireworks, matching the
Modak-style flow where the fireworks hand off into the mandala/completion reveal.

**Verified:** `git diff --check` passed for the touched Shloka River scene files.
Targeted ESLint still reports pre-existing unused imports/vars, empty blocks, and
hook dependency warnings in these scene wrappers.

## [2026-09-30] — Symbol Mountain: remove duplicate eyes/ears success VO and captions
**Touched:** src/zones/symbol-mountain/scenes/tusk/EyesPopUpGame.jsx;
src/zones/symbol-mountain/scenes/tusk/EarsSoundMatchGame.jsx;
src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx;
src/zones/symbol-mountain/scenes/tusk/tuskNestFlow.json.

**Changed:** Removed the parent reveal success VO for Eyes and Ears so the mini-game
completion line does not get followed by a second "found them all/every sound" line.
Eyes no longer shows found/completion feedback text. Ears keeps the spoken listening
guidance ("Listen for the water/grass", "Now choose the sound", hints, and success VO)
but removes the visible feedback captions for those moments. Tusk nest no longer plays
the affirmation as a flow VO, leaving the "say it with me" affirmation as the only
affirmation line.

**Verified:** `git diff --check` passed for the touched Symbol Mountain files. Targeted
ESLint was run and still reports the existing `setTuskTestRunKey` unused error plus
pre-existing hook warnings in `SymbolMountainSceneV3.jsx`; the edited ears game file
had no new lint errors.

## [2026-09-30] — Shloka River: child actions interrupt intro/hint VO
**Touched:** src/zones/shloka-river/scenes/Scene2/SuryakotiBankSimplified.jsx;
src/zones/shloka-river/scenes/Scene2/components/SuryakotiGame.jsx;
src/zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx;
src/zones/shloka-river/scenes/scene4/SarvakaryeshuGame.jsx;
src/zones/shloka-river/scenes/scene4/SarvadaGame.jsx;
src/zones/shloka-river/scenes/scene5/ShlokaRiverFinale.jsx.

**Changed:** Matched the Calm Mooshika/Flower Journey interaction rule in
Shloka River: a meaningful child action takes over immediately, even while an
intro line, scene VO, or hint VO is still speaking. The game should not force
the child to wait for VO to finish before acting, and active VO/hints should
stop as soon as the action begins.

- **Suryakoti, Samaprabha, Nirvighnam, Kurumedeva:** mini-game actions are now
  live from phase start instead of treating intro VO completion as the action
  gate. Existing `introVoStarted` timing remains in place for teaching-hand
  alignment.
- **Suryakoti:** scratch start now always stops active VO, so later scratches
  during L2/L3 hint VO interrupt the hint instead of letting it continue.
- **Sarvada:** any search tap, correct or miss, stops active scene/hint VO
  before showing the found result or neutral miss ripple.
- **Sarvakaryeshu:** any symbol pick stops active VO. If the pick interrupts
  an L2 clue, the L2 hint clock is marked ended; if it interrupts an L3 clue,
  the correct symbol is still revealed so stopping the VO cannot strand the
  rescue hint state.
- **Shloka River Finale:** boat drag/choice starts stop active VO before the
  boat interaction proceeds.

**Verified:** `git diff --check` passed for touched files. Targeted ESLint was
run and still reports existing cleanup issues in these files (unused imports/
vars, empty blocks, and current Finale redesign unused-handler warnings); no
new whitespace issues from this pass. Not yet live-tested in browser.

## [2026-09-29] — Voice-mute standardization (a VOICE mute, not an audio mute)
**Touched:** src/lib/hooks/useVoiceGuidance.js; src/lib/hooks/useGaneshaVoice.js;
src/zones/shloka-river/scenes/{Scene1/VakratundaGroveSimplified,Scene2/SuryakotiBankSimplified,
Scene3/NirvighnamChantSimplified,scene4/SarvakaryeshuChantSimplified,scene4/SarvadaGame}.jsx;
src/zones/symbol-mountain/scenes/{pond/PondSceneSimplifiedV4,tusk/SymbolMountainSceneV3,
modak/NewModakSceneV7,final scene/SacredAssemblySceneV8}.jsx;
src/zones/about-me-hut/{food/Favoritefoodgame,enjoy/ObstacleRemoverGame,
family-tree/Familytreegame,indian-story/MyIndianStoryGame}.jsx; DECISIONS.md.

**Changed:** Locked the rule (DECISIONS.md 2026-09-29, keeps TASKS T55): the toggle is a
**voice** mute. Voice OFF = scene VO, hint VO, Sanskrit words and syllables are silent; **SFX
stay ON**. Muted voice runs on a silent timer matching the line's length and fires `onEnded`
once, on schedule — never instantly, so mute never skips/compresses pacing. Mute mid-line
silences now but the callback still fires on schedule (`muteVoicePlayback` in
`useVoiceGuidance`, `mute()` in `useGaneshaVoice`). Unmuting never resumes or auto-plays an
old line. Shared hooks now hold the rule; Shloka River scenes' own Web Speech gets the same
treatment (`muteWebSpeech`). Removed the "muted = instantly done" shortcuts in Pond, Tusk,
Modak, Favourite Food, Dreams, Family Tree (placement sequences, child-start line, tree-done
transition) and My Indian Story (13 advance/prompt-ready branches — muted children now wait
the line's length, slower than before). Favourite Food's "pause + resume mid-sentence" mute
removed. Sarvada: replay key now returns the intro during the intro (was the morning prompt);
image 2/3 contextual replay was Madhurima's earlier fix, untouched. My Indian Story opening
line now plays once per mount, so unmuting can't resurrect it. Stale "never muted by toggle"
comments in `useVoiceGuidance` corrected. `npm run build` passes; lint shows no new errors.

**Open:** NOT live-tested — please test on each scene: mute mid-line (game moves on at normal
pace, no skip), unmute (nothing old resumes), Replay (current line), and mute → sidebar open →
close → unmute while a line is active (two systems control interrupted audio; traced by
reading only). Deliberately left: `SanskritVoiceRecorder` reference pronunciation/playback
still plays when muted (child-triggered); Sacred Assembly onboarding-hint bookkeeping
unchanged (muted = not consumed, so it can play if unmuted while that beat still applies);
Family Tree's remaining `isAudioOn` checks only gate optional hints. Not audited: coReg/twg
components and legacy files. Pre-existing lint errors in touched files untouched.

## [2026-09-29] — Kurumedeva: bridge flow tuned, beaver crossing trimmed to 4 steps
**Touched:** src/zones/shloka-river/scenes/Scene3/KurumedevaGame.jsx/.css, scene3LayoutConfig.js; src/lib/config/content/voiceGuidance.js; src/dev/webSpeechScripts.js. Commits `0315722d` (2026-09-28, "Tune Kurumedeva bridge flow") and `56da677e` (2026-09-29).
**Changed:** Reworked the Kurumedeva bridge flow (game logic + CSS + its VO lines and dev speech scripts), then trimmed the beaver's crossing path from 7 to 4 waypoints (debug-panel phases updated to match), rebalanced sizes (bigger Mother Beaver, smaller Baby Beaver) and applied the latest layout-debug export for the beaver path positions.
**Open:** Not re-verified in this reconciliation pass — spot-check the crossing on a real device.

## [2026-09-29] — VO cleanup: same dual-speech-source race, inside Symbol Mountain's mini-games
**Touched:** src/zones/symbol-mountain/scenes/modak/FlowerJourneyGame2.jsx;
src/zones/symbol-mountain/scenes/modak/GarlandGame3.jsx;
src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx;
src/zones/symbol-mountain/scenes/tusk/EyesPopUpGame.jsx;
src/zones/symbol-mountain/scenes/tusk/EarsSoundMatchGame.jsx;
src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx.

**Changed:** Madhurima asked to check Symbol Mountain for the same
mini-game-vs-main-scene VO overlap already fixed in Shloka River/About Me
Hut yesterday. Found it: 4 mini-games (`FlowerJourneyGame2`, `GarlandGame3`
in Modak; `EyesPopUpGame`, `EarsSoundMatchGame` in the Tusk/Symbol scene)
each run their own independent `window.speechSynthesis` engine for idle
hints/story beats, fully unwired from the parent scene's `useVoiceGuidance`
(the dev's own comment in `FlowerJourneyGame2.jsx` already flagged this as
a bypass). Unlike Shloka River's mini-games — which get a `voiceGuidance`
prop bundle from the parent, so there's effectively one owner shared via
props — these 4 got no VO props at all: two fully separate engines.

Risk was one-directional: the parent's own `playVoice()` already calls
`window.speechSynthesis.cancel()` unconditionally, so parent → mini-game was
already safe (shared browser API). But a mini-game's `speak()` only
cancelled its own utterance — it never touched the parent's MP3 `Audio`
element — so mini-game → parent was not safe: a still-playing parent MP3
line could keep going under a mini-game's new line. `TuskBeatPlayerLive`
doesn't touch speech at all — clean, no change needed.

Fixed by adding a `stopVoice` prop to each of the 4 mini-games, called at
the single funnel each one already uses for all its speech (`startUtterance`
in the Modak pair, `speak` in the Tusk pair), and wiring it from the parent:
`NewModakSceneV7.jsx` already had a combined `stopVoice()`, just passed it
through; `SymbolMountainSceneV3.jsx` didn't destructure the hook's `stopVoice`
at all, so added it (`stopHookVoice`) plus a new combined `stopVoice` that
also calls `stopSpokenVoice()`, then passed that down to both mini-games.

No content, layout, or game-logic changes — same stop-both-engines guard
pattern as the rest of this VO cleanup.

**Open:** Not yet live-tested. Discussed with Madhurima that this is a
reactive fix (stop the other engine right before speaking), not a
preventive one — if a parent's idle-hint timer fires while a mini-game is
still mid-line, the mini-game's own line can still get cut short (no
overlap, but a possible early cutoff). A deeper fix would make the parent
go fully silent for the whole time a mini-game is mounted (one owner per
phase, not mutual stopping) — not done in this pass, flagged as a possible
follow-up if premature-cutoff reports come up.

## [2026-09-28] — VO cleanup: dual-speech-source race across 6 scenes
**Touched:** src/zones/about-me-hut/family-tree/Familytreegame.jsx;
src/zones/about-me-hut/enjoy/ObstacleRemoverGame.jsx;
src/zones/about-me-hut/food/Favoritefoodgame.jsx;
src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx;
src/zones/shloka-river/scenes/Scene2/SuryakotiBankSimplified.jsx;
src/zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx.

**Changed:** Root-caused Madhurima's report of old VO lines still playing/
overlapping in some scenes to a repeated pattern: 7 of the 13 live scenes run
**two independent speech engines** — `useVoiceGuidance` (MP3 + TTS-fallback,
touches `window.speechSynthesis`) and either a second `useGaneshaVoice()`
instance or a scene-local `speechSynthRef`/Web-Speech wrapper (also touches
`window.speechSynthesis`) — and one engine wasn't always stopping the other
before speaking. Audited all 13 live scenes for every VO mechanism
(`useVoiceGuidance`, raw `speechSynthesis`, `new Audio()`, `VOReplayButton`);
Symbol Mountain (all 4 scenes) + Finale + My Indian Story were already clean.
Fixed by adding `stopVoice()`+`stopSpokenVoice()` (or the scene's
`stopVoice()`+`stopWebSpeech()` equivalent) immediately before every
call site that was missing it:
- **Family Tree**: 8 sites — the entire `replayCurrentVoice`/VOReplayButton
  handler (all 5 branches), the intro-modal welcome VO, the flip-card
  "tap anywhere to close" hint, and the "And that's me, Ganesha!" auto-fill
  line. File already had the correct pattern in ~10 other places and even a
  comment documenting the two-speech-source risk — these were the gaps in it.
- **Vakratunda Grove, Suryakoti Bank, Nirvighnam Chant**: single fix each,
  at the shared `playGuidanceVoice` gatekeeper function — it already stopped
  both channels when routing to the MP3/hook path, but not when routing to
  the raw Web-Speech path. One addition per file covers every call site.
- **Dreams & Wishes, Favorite Food**: single fix each, at the shared
  `speakLine` gatekeeper — `useVoiceGuidance`'s own idle timer can fire a
  hook-driven `playVoice()` independently of `speakLine`'s Web-Speech calls;
  now `speakLine` stops both first.
- **Sarvakaryeshu Chant**: audited, already correct — its `playGuidanceVoice`
  uses a `guidanceVoiceActiveRef` gate that queues a new line to play after
  the current one finishes instead of overlapping, and every `stopVoice()`
  call already goes through one `stopAllVoice()` that resets that ref. No
  change needed. (The `new Audio(FULL_SHLOKA_WORD_AUDIO...)` bypass flagged
  in an earlier pass of this file is no longer present — already cleaned up
  before this session.)
- Also confirmed, separately: a stale hardcoded Kuru Me Deva intro line
  ("Beaver can't build the bridge alone...") that Madhurima reported hearing
  after a hard refresh was coming from `src/dev/webSpeechScripts.js`, the
  **dev test harness only** (`src/dev/` is non-production per CLAUDE.md,
  consumed only by `GameTestHarness.jsx`) — not the live Kurumedeva scene,
  and not this dual-engine bug. Madhurima fixed that file directly; no code
  change needed from this pass.

No content, layout, or game-logic changes — only the stop-both-engines guard,
matching the convention the codebase's own comments already prescribed.

**Open:** Not yet live-tested by Madhurima. Remaining scope not touched in
this pass: T07 (simplify audio hints), T10 (first-time vs returning VO),
T14–T16 (new audio files), T36 (VO vs Web Speech usage policy).

## [2026-09-28] — QA checklist pass: today's full change set (not just VO)
**Touched:** docs/GMB_HARNESS_QA_CHECKLIST.html; docs/GMB_MANUAL_QA_CHECKLIST.html.

**Changed:** Went through today's git history (commit `d0df04bb` and the
"Mahakaya QA defect fixes" session below) plus this session's own VO work,
and added `⚠️ FIXED/CHANGED/NEW` flow rows (harness doc) and matching
`known[]` entries (manual doc) for every behavior change found, not only
the voiceover sequencing items. Covers:
- **Vakratunda Grove**: intro no longer waits 700ms before the drag course
  starts; VO stops immediately on frog grab.
- **Mahakaya**: intro VO copy corrected (3 previously-out-of-sync copies
  now match); Log 1 teaching-demo timing now VO-onStart-gated instead of a
  blind fixed delay; L3 gesture-demo regression (missing `replayKey`)
  restored; drop-zone forgiveness widened (`DROP_DIST` 12→16); logs 2-4
  stuck/undraggable bug fixed (pointer-capture-before-unmount + pile
  pointer-events:none + VO-gate removed from log-1 draggability); join-scene
  animal drift on each log placed fixed.
- **Sarvada**: game now enters "playing" immediately instead of after an
  800ms wait.
- **Shloka River Finale**: a word-boat is now draggable/placeable on the
  very first touch instead of being gated on a `buildReady` flag.
- **Tusk (Symbol Mountain)**: child can now act during Beat 0's intro VO
  instead of waiting ~3.6s for it to finish; VO now stops on interaction.
- **My Indian Story**: VO now stops immediately on every interaction
  (magnifying-glass move, region/language/festival select, guesses) instead
  of potentially talking over the next action.
- Confirmed **`Namebirthdaygame.jsx` is dead code** (per Madhurima) — its
  VO-stop fixes in the same commit were NOT added to the Family Tree
  checklist section, which is backed by the live `Familytreegame.jsx`
  instead.
- Added `🔎 VERIFY` rows (not yet fixed, just flagged) to Vakratunda,
  Sarvakaryeshu/Sarvada, and the Finale for the VO-race/gesture-timing bug
  class found in Nirvighnam/Kuru — those scenes weren't specifically
  retested for it.

**Open:** None of today's fixes beyond Nirvighnam/Kuru Me Deva have been
live-tested by Madhurima yet in this pass (Mahakaya's 4 items were
separately verified per the QA-defect-fixes entry below). Kuru Me Deva's
bridge rebuild (asset swap, no-solo-fail redesign) bundled into `d0df04bb`
was already accurately described in both checklists before this pass — no
changes needed there.

## [2026-09-28] — Shloka River VO sequencing + gesture-timing standardization
**Touched:** src/lib/config/content/voiceGuidance.js;
src/zones/shloka-river/scenes/Scene1/MahakayaRescueGame.jsx;
src/zones/shloka-river/scenes/Scene2/SuryakotiBankSimplified.jsx;
src/zones/shloka-river/scenes/Scene2/components/SuryakotiGame.jsx;
src/zones/shloka-river/scenes/Scene2/components/SamaprabhaGame.jsx;
src/zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx;
src/zones/shloka-river/scenes/Scene3/NirvighnamGame.jsx;
src/zones/shloka-river/scenes/Scene3/KurumedevaGame.jsx.

**Changed:** Standardized the VO pattern across all 5 Shloka River scenes per
Madhurima's spec (opening VO once; syllable after every success; transition
VO only when the mechanic changes; at most one continuation cue when the
same mechanic continues to a non-obvious next target; otherwise visual +
gesture carry it). Found and fixed real bugs uncovered along the way, not
just content gaps:

- **Missing VO fallback (Suryakoti, Nirvighnam):** both scenes' local
  `playGuidanceVoice` maps were missing the `getVoiceScript` + hook
  `playVoice` fallback that `VakratundaGroveSimplified.jsx` already had —
  any key not in the local hardcoded map (even if correctly defined in
  `voiceGuidance.js`) silently played nothing. Added the same fallback to
  both, unblocking Nirvighnam's branch/reed intro lines and all of Kuru Me
  Deva's ask/plank/hint/done lines (content for these already existed
  correctly in `voiceGuidance.js`, just unreachable).
- **VO race condition (Nirvighnam, Kuru Me Deva):** the next-obstacle intro
  VO and the just-cleared obstacle's syllable VO both fired off the same
  state change (`cleared.length`/`litCount`), sharing one audio channel —
  whichever started second cut the first off via `stopVoice()`. Fixed by
  chaining the next VO onto the syllable's `onEnded` in both
  `NirvighnamGame.jsx` (stone→branch→reed) and `KurumedevaGame.jsx`
  (`kuru_logs_after`/`kuru_rope_after` now play after "Kuru"/"me" instead of
  alongside them).
- **Gesture demo timing (Nirvighnam, Kuru Me Deva):** the teaching gesture
  for branch/reed/elephant-ask/plank was gated only on `nextObstacleId`
  changing, so it appeared immediately — before the obstacle's own intro VO
  even started, let alone reached its action clause. Now gated on that VO's
  `onStart`, plus a flat 500ms delay (approximates "story clause has ended,
  action clause has begun" without needing to split each line's audio into
  two separate playbacks).
- **Gesture demo playing twice:** per Madhurima's call — a single teaching
  pass, then immediate control, then the 10/18/26 hint ladder only if
  stuck (no automatic replay). Mahakaya's log-drag teaching and Suryakoti's
  initial scratch teaching were both `iterations={2}` (Suryakoti's own code
  comment already said "one pass", the value just didn't match); both now
  `iterations={1}` for the auto-teaching pass only — their L2/L3 hint-ladder
  escalations (shown only if the child is stuck) are untouched. Nirvighnam's
  hold gesture (the one case Madhurima flagged worth a longer single pass
  instead of two) was already a single 2.8s loop — no change needed.
- **New content in `voiceGuidance.js`:** `scene10_maha_keep_adding` ("Keep
  adding logs to the raft.") — one-time cue after the first log only;
  `scene11_surya_keep_rubbing` ("Keep rubbing to bring back more light.") —
  one-time cue after the first patch only; `scene11_sama_find_another`
  ("Look and hold another part of the shadow.") — one-time cue after the
  first shadow reveal only, wired into `SamaprabhaGame.jsx`. Vakratunda,
  Sarvakaryeshu, and Sarvada were left as-is per Madhurima's call (syllable +
  visual already carry them).

**Open:** Not yet retested end-to-end on Suryakoti/Mahakaya/Samaprabha's new
continuation cues or the `iterations={1}` change (only Nirvighnam and Kuru Me
Deva were live-tested this session, across two fix rounds). Also observed —
NOT authored by me this session — Madhurima's own manual fix in
`NirvighnamGame.jsx` for a branch-drag threshold/jitter issue
(`BRANCH_DRAG_START_THRESHOLD`, `branchDragActive`) and a debug-panel
default change, picked up while re-reading the file after her live testing.
Checklist items for all of the above added to `TEST.md` (Scenes 10, 11, 12).

## [2026-09-28] — Mahakaya QA defect fixes (GMB_QA_Defect_Report_Vakratunda_Grove_2026-09-28)
**Touched:** src/lib/config/content/voiceGuidance.js;
src/zones/shloka-river/scenes/Scene1/MahakayaRescueGame.jsx;
src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx;
src/dev/webSpeechScripts.js.

**Changed:** Fixed all 4 actionable items from Madhurima's Mahakaya harness QA pass.

- **Intro VO copy:** `scene10_maha_intro` changed to "Everyone wants to cross
  the river. Drag the logs to build a raft." — updated in `voiceGuidance.js`,
  the live scene's inline `webSpeechMap` fallback, and the dev harness's
  `webSpeechScripts.js` (all three copies were out of sync; the harness copy
  still had older "raft is too small" wording).
- **Log-1 teaching-demo timing (FAIL: was showing at scene start):** the
  one-time drag gesture demo for log 1 was on a blind fixed delay counted
  from component mount, unrelated to when the intro VO actually started
  speaking (browser TTS has variable startup lag after cancel()+speak()).
  Wired a real `onStart` callback through the VO chain (`speakWebSpeech` in
  both `VakratundaGroveSimplified.jsx` and the dev harness's
  `webSpeechScripts.js` now call `utterance.onstart`), so the teaching demo
  now waits for the intro VO to actually begin, plus a 600ms buffer on top —
  with a 1200ms fallback timer in case speech never starts (muted/no
  `speechSynthesis` support).
- **L3 gesture demo not showing (FAIL/BUG):** root cause was the same
  `GestureDemo` replay bug fixed elsewhere on 2026-09-24 (`replayKey` needed
  whenever one `active` condition spans multiple escalating hint levels) —
  Mahakaya's 2026-09-26 rope-to-drag rebuild recreated the `GestureDemo` call
  site from scratch and dropped that fix. Restored by adding
  `replayKey={needsInitialTeaching && !teachingComplete ? 'teaching' : effectiveHintLevel}`,
  so the full-path L3 demo now replays instead of only ever showing once at L2.
- **Drop zone too strict ("even leaving half the log on the dropzone bounces
  it back"):** `DROP_DIST` raised from `12` to `16` (roughly the log's own
  half-width, ~15.9%), so a roughly-half-overlapping drop now registers as a
  successful placement.

**Not changed (confirmed out of scope this pass):** L1→L2 finish-gating
(waiting for L1's visual pulse to finish before arming L2, mirroring the
existing L2→L3 VO-end gating) — Madhurima confirmed to leave this alone for
now; only L3's gesture-demo regression needed fixing.

**Verified:** All 4 fixes re-tested in the game-test harness (`?game=mahakaya`)
by Madhurima — intro VO, teaching-demo timing, L3 gesture demo, and drop-zone
forgiveness all confirmed working. Mahakaya is ready for device testing.

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

## [2026-09-30]
**Touched:** src/zones/symbol-mountain/scenes/modak/FlowerJourneyGame2.jsx/.css, GarlandGame3.jsx; src/lib/beatPlayer/BeatPlayerGame.jsx
**Changed:** "Action starts the moment the stage starts" extended to Flower Journey (bush/branch/marsh no longer locked until intro VO ends; the wordless reaction runs alongside the VO) and Garland/Tusk-nest beat player (a grab/tap now cuts the narration and lets the timeline/hint clock move on). Pond and Eyes already conformed; Ears is intentionally listen-first. Added a dev-only "Emoji tuner" panel to Flower Journey (x/y/size for all 9 emojis, phase jump, Copy JSON). Commits d71492bd (beat player), adb94027 (Modak).
**Also:** Tusk nest flow — removed standalone non-interactive story beat 0, merged its line into the twig beat (beats renumbered 0-4; saved layout-editor overrides keyed by old beat index will be off).
**Open:** Not browser-tested. Paste tuned emoji JSON back to lock in `DEFAULT_EMOJI_LAYOUT`. BeatPlayerGame is shared (Kurumedeva etc.) — spot-check one. CHANGELOG/TASKS still carry earlier uncommitted edits, so this entry is uncommitted.

## [2026-10-05]
**Touched:** SamaprabhaGame.jsx/.css, voiceGuidance.js, SuryakotiBankSimplified.jsx, webSpeechScripts.js
**Changed:** Samaprabha hints split into 3 states instead of one 10/18/26 ladder per clue. Teach (clue 1 until ring ≥22%): pulse → "Press and hold on the shadow." → one full hold hand. Find (clues 2–4): 12s pulse + "Look for another part of the shadow.", 25s exact region held quietly, no hand. Keep (started holding this clue, released): 9s "Keep holding." + soft glow. GestureDemo only in teach; old L2 partial hand and per-clue "scene11_sama_hint_hold" VO removed.
**Open:** Not browser-tested. New VO keys scene11_sama_hint_find / _keep are Web Speech only until recorded (T14).

## [2026-10-06]
**Touched:** src/pages/CleanMapZone.jsx, src/pages/CleanMapZone.css
**Changed:** Home/Map phone-landscape reflow (≤500px tall, <1024px wide). Same map layers recomposed via `PHONE_MAP_ZONE_ART` / `PHONE_MAP_OVERLAYS` / `PHONE_ZONE_MUSHIKA_POS`, applied only when `isPhoneLandscape` (matchMedia) — tablet/desktop positions unchanged. Ganesha and Mushika follow the phone positions. New phone CSS block: compact zone labels (locked/coming-soon at 30% opacity), Lodge pill ~10% lighter, profile chip keeps a 60px hit area with a smaller visible ::before pill, smaller Ganesha/Mushika, dust hidden. Parent icon kept (it opens Parent Corner).
**Also:** `getAnimalId` now accepts any avatar id from the expanded library (fish, elephant, lion…) — fixes the literal "fish" showing in the profile chip on ALL devices. All avatar ids have images in public/images.
**Open:** Browser-checked at 844×390 only (screenshots/map-phone-landscape-844x390.jpg); try 667×375 and 932×430. Not committed. Phone coordinates are first-pass; Shloka River label slightly overlaps the waterfall (left as-is by decision).

## [2026-10-07]
**Touched:** modak/FlowerJourneyGame2.jsx, modak/GarlandGame3.jsx, modak/NewModakSceneV7.jsx, tusk/EyesPopUpGame.jsx, tusk/EarsSoundMatchGame.jsx, tusk/SymbolMountainSceneV3.jsx, final scene/SacredAssemblySceneV8.jsx
**Changed:** Replay/mute audit across the 13 live scenes' mini-games. (1) Modak Flower Journey + Garland speak via their own speechSynthesis, so Replay repeated a stale scene line — games now report each line through `onLineSpoken` and the scene stores it in `lastVoRef`. (2) Symbol Mountain Eyes/Ears: Replay was disabled for the whole game (prompt key is null while `showEyesTelescopeGame`/`showEarsRhythmGame`) — same `onLineSpoken` pattern, scene `gameLineRef` replays the active game's current line. (3) Sacred Assembly: Replay was tappable but silent while a card appears/flips/moves aside (no VO exists yet) — button now disabled in those phases. Audit result: Pond, Shloka River 10–14, About Me Hut ×4 replay/mute OK. Vite build passes.
**Also:** Garland, Eyes and Sacred Assembly files carried earlier uncommitted edits (idle/hint/pause work); those hunks are included in this commit's whole-file diff.
**Open:** Not browser-tested — play Modak games 2/3 and Eyes/Ears, tap Replay mid-game, and mute mid-line. Minor, left as-is: Mahakaya Replay always repeats "drag the water" (never the intro); Suryakoti Replay always repeats one hint line.
