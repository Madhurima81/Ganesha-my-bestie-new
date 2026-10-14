# Release readiness: staging -> prod (2026-10-14)

Read-only pass. No source, config, CHANGELOG, DECISIONS or pitfalls were edited; nothing committed, merged, pushed or deployed.
Checked: `HEAD 07ee96fc` (build 1 was `6bf67223`, rebuilt after another session committed "Harden Eyes voice start handling"). Production branch = `prod` (`origin/prod df9bb7bb`, 2026-08-21). `main` is a stale January branch and is NOT production.

## 1. Verdict: NO-GO to merge today. GO-WITH-CONDITIONS once the "must fix" list is done.

Why not today:
- `origin/staging` is at 2026-09-23. Local `staging` is **220 commits ahead and unpushed**, so no Netlify preview of this code exists yet.
- `prod` is **544 commits / 1408 files** behind. This is a near-total replacement, not an incremental release.
- The build itself is healthy (clean, no new warnings) and map plus one scene per zone load with no new errors.
- There is real uncommitted work-in-progress (Section 2b), including a +204-line watchdog adoption in `SymbolMountainSceneV3.jsx`. It must not ship half-tested.
- Large parts of the recent work are untested (Section 8).
- Installed PWAs will hit a broken first load on update (Section 4).

## 2. Branch state

### 2a. Commits not on prod (544), by area (a commit can count in several)
| Area | Commits | Notes |
|---|---|---|
| Shloka River | 154 | Continue/resume, syllable sequencer, Nirvighnam stall watchdog, Kurumedeva/Sarvakaryeshu/Samaprabha/Finale fixes |
| Symbol Mountain | 147 | Pond/Sacred Assembly Play Again, Flower Journey, Eyes/Ears/Tusk fixes, Ears voice gate |
| Shared engine / UI / map | 109 | `useGaneshaVoice` start-watchdog, OpeningModal, SceneCompletionCelebration, ZoneWelcome, sfx.js, CleanMapZone |
| About Me Hut | 67 | Continue/Replay, Food voice, sparkle cleanup 1-4, My Indian Story Step 3 |
| Docs / dev tools / screenshots | ~280 (overlapping) | Not shipped logic, but screenshots add build weight |
| Images / audio | 14 / 3 | 38 modified images with unchanged filenames (see Section 4) |

Commits per day peak at 9-11 Sep and 5 Oct, and 12-14 Oct has 64 commits. The last three days are the least settled.

### 2b. Uncommitted files (at the time of the check) and likely owner
| File(s) | Likely owner session (from CHANGELOG) |
|---|---|
| `CHANGELOG.md`, `DECISIONS.md`, `docs/KNOWN_PITFALLS.md` | shared docs, several sessions |
| `scripts/css-clash-triage.cjs`, `SymbolSidebar.css/.jsx`, `AppSidebar.css/.jsx` (new root classes), `NewModakSceneV7.jsx` (unused `UnifiedModal` import), `docs/DEAD_CODE_REPORT.md`, `docs/DEAD_FILE_CANDIDATES.md` | CSS clash batch 1b (symbolBloom), marked untested |
| `OpeningModal.css/.jsx`, `SceneCompletionCelebration.css`, `ResumeCountdown.css`, `Familytreegame.jsx` and `Namebirthdaygame.jsx` (`openingButtonVisible` removal), `SacredAssemblySceneV8.jsx` (`fireworksFinished` removal) | "Opening CTA agency / completion modal scale / Sacred Assembly final VO" session (10-13) |
| `FlowerJourneyGame2.jsx` (intro gate removed so the game is live during VO) | Shloka audit / Flower Journey "live-during-VO" session; CHANGELOG says not browser-tested |
| `SymbolMountainSceneV3.jsx` (+204: `useSceneWatchdog`, `SceneStallPrompt`, reveal guards) | Eyes/Ears watchdog adoption (DECISIONS PENDING item 2), in progress |
| `ZoneConfig.js` (moves `my-indian-story` entry) | About Me Hut / Indian Story session (unclear) |
| `src/dev/stillToTestChecklists.js`, `docs/PITFALL_SWEEP.md` (new), `screenshots/*`, `__pycache__/` | dev docs / screenshot tooling |

Resolved while I worked: a staged deletion of `speechStartWatch.js` plus an untracked copy (Eyes imports it) would have broken a `commit -a`. Another session has since committed both files, and `git ls-files` now tracks them.

### 2c. Other branches (nothing deleted)
| Branch | Status | Can delete later? |
|---|---|---|
| `backup/checklists-before-archive-2026-10-12`, `backup/modak-pre-rework-20260906` | fully inside staging | yes |
| `codex/t02-pilot`, `codex/v2-02-*`, `codex/v2-06-*`, `worktree-agent-a097365126b2b9850` | 0 unique commits | yes (remove worktrees first) |
| `backup/sparkle-dreams-bad-tip` (1 unique), `backup/sparkle-tip-broken-ft` (3) | 10-14 safety copies | after sparkle cleanup is signed off |
| `backup/onboarding-landscape-css-096fb5d` (2), `backup/onboarding-local-0904-1640` (11), `backup/vakratunda-dashed-wave-recovered` (21) | unique work | keep until confirmed merged or abandoned |
| `claude/*` x3, `main`, `worktree-agent-a5821...`, `worktree-agent-aa6612...`, `codex/v2-07-countdown-pressure` | old January/August branches; 2-13 unique commits | review, then delete |

There are also 10 extra worktrees under `.claude/worktrees` and `.codex/worktrees`, and `.git` is 1.6 GB.

## 3. Clean build of HEAD (private folders, `dist/` untouched)
| Item | Result |
|---|---|
| `vite build` (HEAD archive, node_modules junction) | **OK**, 2874 modules, 4m14s for the rebuild (7m09s first run; slow image optimizer) |
| Warnings | Only the known ones: 5x "Duplicate key" (`ScribbleExperience`, `AffirmationExperience`, `MindfulnessExperience`, `GratitudeHighFive`, `GuidedExperienceScene`), unresolved `ganesha-small.png` / `mooshika-small.png` (ScrollUnfurlAnimation.css), Browserslist 18 months old. **No new warnings.** |
| Output | 475 MB `dist`, 1871 JS/CSS chunks (4.0 MB total), 1555 files in `assets/` (319 MB) |
| Top chunks (KB) | lazy-sentry 444, index 381, vendor-react 182, lazy-posthog 178, lazy-supabase 170, useGaneshaEngine 162, TimeWithGaneshaHub 136, SymbolMountainSceneV3 127, Familytreegame.css 87, NewModakSceneV7 72 |
| Precache | 16 entries, 635 KiB (app shell only) |
| Over 1 MB | 51 files. Worst: three `banyan-*.svg` at 7.8 MB each, `ganesha-welcome-new.mp4` 7.7 MB, five `lotus-*.svg` and `elephant.svg` at 7.5 MB, `map ambient sound.wav` 5.2 MB, five `vakratundachant-bg*.svg` at 3.6 MB, Modak/belly/mooshika SVGs 2.6-3.0 MB. A dead file, `mooshika.backup_before_download_replace_*.svg` (2.6 MB), is bundled. |

## 4. PWA / service worker
| Check | Finding |
|---|---|
| Config | `registerType: 'autoUpdate'`; generated `sw.js` has `skipWaiting`, `clientsClaim`, `cleanupOutdatedCaches`. Precache is only index.html, offline.html, `index-*`, `vendor-*`, icons. |
| Runtime caching | chunks and scene images: StaleWhileRevalidate / CacheFirst (hashed names, safe). **Audio: CacheFirst, 300 entries, no expiry. `/images/**`: CacheFirst 30 days, 150 entries.** Fixed names are never revalidated. |
| Tested in headless Chromium (own instance) | SW activates, a reload under SW control shows the app (no offline.html hijack). |
| **Update test** (v1 build installed, then "deployed" v2) | Reload #1 still serves the OLD shell; reload #2 serves the new one. **During reload #1 a lazy chunk (`MainWelcomeScreen-*.js`) failed with "Failed to fetch dynamically imported module"** because the old shell asks for a hashed chunk the new deploy no longer has. The `UpdateManager` "Refresh" banner **did not appear** in this test. |
| Stale fixed-name assets | `sfx-soft-wrong.wav` (2 copies) changed with the same name. Installed devices keep the old sound. 38 images were modified in place (explorer avatars, symbol icons, app-* icons, meanings-caveofsecrets). Devices with them cached for under 30 days keep the old art. Audio under `public/audio/words` was renamed Mahakaya.mp3 -> mahakaya.mp3 etc. (lowercase now; no capitalised references remain). |
| No `vite:preloadError` handler, no Netlify redirects or `_headers` | A stale shell has no recovery path. |

Impact is limited to devices that already have the old app installed (testers). Fresh browsers are unaffected. A new deploy does update installed PWAs, but only after two reloads and with one broken load.

## 5. Assets (13 live scenes, case-sensitive check against the HEAD tree)
- 342 reachable source files and 748 asset references were scanned. **0 case mismatches** (Linux-safe). The vite plugin also enforces case on imports.
- Missing files referenced from reachable code (most are in legacy or obsolete paths):
  - `symbolCardContent.js:107` Tusk icon `/images/icons/broken-tusk-symbol.webp` is missing (only the `.png` exists there). Verify the Tusk card shows its image.
  - `SceneCompletionCelebration.jsx:310,330` `/images/smartwatch-screen.png` and `/images/meaning-journal.png` (only for the `smartwatch` or `journal` container types).
  - `CleanGameWelcomeScreen.jsx` `/audio/meanings/*.mp3`, `/audio/chants/*_full.mp3`, `SanskritSidebar.jsx` `/audio/<word>.mp3` (Cave-era), `openingModals.js` festival-square icons, `ZoneConfig.js` cave finale icon, `SoundManager.js` `/audio/fx/*` (dead module). Not live-scene paths.
- `abtmehut2.png` was deleted but code uses `abtmehut2.webp` (exists). OK.

## 6. Risk list: shared files and what they touch
| Shared file | Commits since prod / last change | Scenes affected | Tested? |
|---|---|---|---|
| `useGaneshaVoice.js` | 4 / 10-14 (start-watchdog) | Modak, Pond, Tusk, Sacred Assembly, all About Me Hut | Family Tree, Food, Indian Story tested. **Others not spot-checked** (CHANGELOG says so). |
| `OpeningModal.jsx/.css` | 3 / 10-09 + uncommitted | all 13 | Uncommitted edits (same Ganesha pose in every zone, short-iPad scale variable) have no recorded test. OpeningModal speaks through raw `speechSynthesis` with no watchdog. |
| `SceneCompletionCelebration` | 7 / 10-10 + uncommitted CSS | all 13 | Completion modal scale: "whitespace checks only". |
| `ZoneWelcome.jsx` | 10 / 10-13 | all zones | Continue/Replay lists partly tested. |
| `SceneManager.jsx`, `sfx.js` | 3 / 10-09, 10-10 | all | `place` dropped during Sanskrit: Mahakaya harness only. Soft-wrong levels: **tablet listen never done**. |
| `CleanMapZone.jsx`, `App.jsx` | 18, 20 | map, routing | Map and zone loads OK in my preview. |

Signed-off scenes touched after sign-off without a recorded test:
- **Symbol Mountain** was signed off 10-12, then: Flower Journey live-during-VO (10-13, "not browser-tested after final patch", uncommitted), Sacred Assembly final VO timing (10-13, no browser test), CSS clash batch 1 keyframe renames in Pond/Tusk/Assembly/Modak (untested), `symbolBloom` sidebar rename (untested, uncommitted), Eyes/Ears start-watchdog (Ears tested; Eyes just committed, untested).
- **My Indian Story** was signed off 10-13, then the sparkle cleanup (untested).

## 7. Console / runtime sanity (production-style preview, built dist, own private server, then stopped)
- Pages: welcome, map, Modak Mountain (opened the Modak scene opening modal), Shloka River (opened Finale opening modal), About Me Hut (opened Family Tree opening modal). I seeded a throwaway test profile in that local preview's localStorage to reach the map.
- Console: **no application errors or warnings**. The only error, on every load in the built-in browser, is "Failed to register a ServiceWorker ... unknown error fetching the script". `sw.js` serves 200 and the SW activates fine in headless Chromium, so this looks like a limitation of the pane, not the app. Confirm on the Netlify preview.
- Cold load of a returning profile showed a blank screen for roughly 10 seconds before "Welcome back" (this was a production build on a loaded machine, and the Browser pane has no cache). It matches the never-run "slow first load" row.
- Audio can't be judged headless.

## 8. Test coverage by scene (from CHANGELOG, DECISIONS, `stillToTestChecklists.js`)
The four never-run rows (tab switch ~10 s, F5, voice off, slow first load) are **untested in every scene**.

| # | Scene | Tested by Madhurima | Still untested |
|---|---|---|---|
| 1 | Modak (Flower Journey, Garland) | Continue checklist 14 pass / 2 fixed (10-10); Flower Journey rows 1,2,3,5,6,7 pass | Row 4 (leave within 1 s of bush solve) left FAIL; live-during-VO fix (uncommitted); Garland gap timing; CSS batch; the 4 never-run rows |
| 2 | Pond | 7 pass (10-10); signed off 10-12 | CSS batch 1 check; Play Again after later shared changes |
| 3 | Eyes / Ears / Tusk | Ears 7 rows pass (10-14); Ears intro and card timing pass | Eyes hardening (07ee96fc), Eyes Continue spill and hand cue; Tusk rows; watchdog adoption (WIP); CSS batch |
| 4 | Sacred Assembly | Play Again fix signed off 10-12 | Final VO timing (10-13), fireworks removal (uncommitted), CSS batch |
| 5 | Vakratunda + Mahakaya | Sequencer verified in harness; stuck-help verified in harness | Tablet listen; Mahakaya still clips "ma" (decision pending); Mahakaya resume lines; `todo-vakratunda` list |
| 6 | Suryakoti + Samaprabha | Suryakoti freeze fix confirmed | Reveal-card guard; Samaprabha checkpoints and hold; `todo-suryakoti` list |
| 7 | Nirvighnam + Kurumedeva | none recorded since the 10-12 and 10-13 fixes | **Stall watchdog `1d8cdfc1` untested**; reeds resume; Kurumedeva plank VO, glow, "deva"; `todo-nirvighnam` list |
| 8 | Sarvakaryeshu + Sarvada | none recorded | Checkpoints, shuffle, last-item resume; "browser/tablet pass still needed"; `todo-sarvakaryeshu` list |
| 9 | Shloka River Finale | played through in harness (10-10) | Continue after opening show; zone badge hiding; recap pause; word-placement change checked by compile only |
| 10 | Family Tree | Step 1 round tested (10-13) | Step 2, Continue button, member lines (third member verified, others not), Done needing two presses (not reproduced), tab-hide hints, Play Again, sparkle rows |
| 11 | Favourite Food | Opening fix, voice fixes | Step 2 save-at-solve, Play Again (repeated comparison line, twice, not reproduced), drawing pad, sparkle rows |
| 12 | Dreams | Success-line fix | Comparison-card Continue, Play Again, sparkle rows |
| 13 | My Indian Story | Step 3 signed off 10-13 | Continue panel rows not ticked, sparkle rows, `ZoneConfig.js` order change (uncommitted) |

DECISIONS "PENDING - THINGS LEFT TO TEST / DO" (10-14): items 1 (Nirvighnam watchdog), 3 (Food Play Again), 4 (never-run rows), 5 (sparkle) and 7 (tab-hide hints) are unconfirmed. Item 8 is partly resolved by commit. Items 2, 9, 10 (watch) and 11 are deferred. Also open: 10-09/10-10 audio items (tablet listen for softWrong and reunion cue; Mahakaya sequencer decision), the 09-19 map-dots question, and the About Me Hut Continue/Replay PENDING (10-14, items a-g).

## 9. Must fix before prod
1. **Push `staging` and get a Netlify preview of the real branch.** Nothing from 09-24 onward has had a production-style check on Netlify.
2. **Land or park the uncommitted work** (Section 2b): especially `SymbolMountainSceneV3.jsx` watchdog WIP, `FlowerJourneyGame2.jsx`, the OpeningModal and completion-modal edits. Make sure the commit includes each file's dependencies.
3. **Run the Section 10 preview checklist**, including the four never-run rows on at least Modak, one Shloka scene and one About Me Hut scene.
4. **Decide the installed-PWA update story:** at minimum tell testers to hard-refresh or reinstall once, or add a `vite:preloadError` reload handler. Without it, installed devices see a broken first load.
5. Confirm the Tusk card image (`symbolCardContent.js:107` `.webp` missing).
6. Nirvighnam stall watchdog (`1d8cdfc1`) is shared-shaped and untested. Test it or revert it from this release.

## 10. Test on the Netlify preview (exact steps for Madhurima)
1. Push `staging`. Open the preview URL in a clean Chrome profile or incognito window, first on a laptop, then on the iPad.
2. **Cold load:** open the URL. Time to the welcome screen. If it is still blank after 20 s, mark FAIL.
3. **Install and update:** open it once, close, open again (SW active). After the next push, reload twice and check you get the new build. Note whether a "Refresh" banner shows.
4. **Per zone:** Symbol Mountain Modak, Eyes/Ears/Tusk and Sacred Assembly; Shloka River Nirvighnam, Sarvakaryeshu and Finale; About Me Hut Family Tree, Food, Dreams, Indian Story. In each: play through, then tap Play Again on the completion modal.
5. **The four never-run rows** in each scene above: switch tab 10 s and return; F5 mid-game; voice off then Continue; slow first load.
6. **Nirvighnam:** finish through "Next adventure"; the card must show, or the 12 s recovery or "Tap to keep going" must appear.
7. Open the Tusk symbol card and check its picture.
8. After Play Again in Food, Family Tree and Indian Story, check the first line is spoken (voice start-watchdog).
9. Check the console on the preview for red errors (note the SW message, if any).
10. Tablet listen: Pond and Vakratunda soft-wrong and reunion cue.

## 11. Can wait
- Dead bundled files: `mooshika.backup_before_download_replace_*.svg`, `map-background-old.png` and similar. Large SVGs (7.8 MB banyan, 7.5 MB lotus) and `ganesha-welcome-new.mp4` slow first loads.
- 1871 chunks and 319 MB of assets in `assets/`. Move large static art to optimised formats.
- Browserslist data, the 5 duplicate-key warnings, `ganesha-small.png` / `mooshika-small.png` runtime refs.
- Branch and worktree cleanup (Section 2c), 1.6 GB `.git`.
- Audio audit leftovers: Mahakaya sequencer, `softWrong` level tuning, `select` and `zoneComplete` sounds, `syllables/kurume -kuru.mp3` filename with a space.
- DECISIONS items 2, 9, 11; VO handoff PDF for the new About Me lines.
- SW audio and image cache versioning (fixed-name replacements).
