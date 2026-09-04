# CHANGELOG.md
Append one entry per work session. Newest on top.

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
