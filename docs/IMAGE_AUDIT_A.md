# Image audit — Session A

Scope: Scene 3 Tusk completed/approved; Shloka Scene2 → Scene1 → Scene3 → scene4. Shared/public images, Modak, About Me, Pond, Sacred Assembly and Finale belong to B.


## Shloka Phase 1 — Session A (awaiting report approval)
Read-only audit of the four live entries from App.jsx, in the requested order. No candidate files, import/preload changes, comparison pages, commits or pushes. Old variants/backups and unused imports are excluded. Shared files remain outside A’s conversion scope.

**Measured method:** one private production build (`../ganesha-shloka-A-phase1-20261016`), exclusive `%TEMP%/gmb-build.lock`, process check, 10-minute timeout, exit 0 in 414.4 s; lock released. Fresh Chromium contexts, 1024×768 DPR2, cache disabled for measurement only, service workers blocked, Slow 4G = 1.6 Mbps down / 750 Kbps up / 562.5 ms latency. Audio preference off equally. App shell loads first; timing starts at Continue into the scene. “Drawn” = opening’s real images/background loaded and stable 2 s; screenshots taken after timing and visually checked. “Settled” = entry image requests complete and no new image request for 2 s, including existing later-game preloads. Transfer includes all actual requests in that interval, shared/app warm-ups included; it is not a sum of folder sizes. Both child games also rendered and inspected; CSS sizes checked at 1024×768 and 1366×1024. One timed run per scene, so these are baselines, not statistically stable rankings of load time.

### Rank by measured image first-load MB

| Rank | Scene | Images now → estimated after | All transfer now | Opening drawn / image settle |
|---:|---|---:|---:|---:|
| 1 | Scene3 | 3.981 → ~3.534 MB | 4.835 MB | 14.7 / 17.1 s |
| 2 | scene4 | 3.943 → ~3.669 MB | 4.779 MB | 14.2 / 16.6 s |
| 3 | Scene2 | 3.120 → ~2.416 MB | 4.040 MB | 15.2 / 17.6 s |
| 4 | Scene1 | 2.868 → ~2.829 MB | 3.921 MB | 18.4 / 20.5 s |

Estimates are in-memory q83 WebP encodes, **not candidates or measured after results**. They replace only scene-owned image bytes; shared/repeat-request traffic is held constant. Keep backgrounds at the same source dimensions. For eligible oversized art, estimate ≥2× the larger sampled display plus 35% margin, capped at source size; unobserved poses keep original dimensions. Already-small lossy WebPs are left alone. No preload-deferral saving or load-time speedup is included in these estimates. A Phase 2 layout/quality gate may increase sizes.

### Shloka Scene2 — Suryakoti + Samaprabha

**18 scene-owned images requested on entry; source 7.008 MB → current production 1.793 MB → estimated optimized ~1.088 MB.** 4 WEBP lossy, 14 PNG lossless.

| Live heavy image (>300 KB source) | Source → production KB | Source px | Largest sampled CSS box px | Encoding |
|---|---:|---:|---:|---|
| saurakoti-bg.png | 802.1 → 367.9 | 2048×1536 | 1366×1024 | PNG lossless |
| Samaprabha/fawn-walk-new.png | 519.7 → 123.0 | 1254×1254 | ≈150×150 | PNG lossless |
| Samaprabha/reveal-branch-new.png | 1443.0 → 217.8 | 1536×1024 | 475×475 | PNG lossless |
| Samaprabha/reveal-reeds-leaves.png | 324.2 → 102.1 | 1254×1254 | 367×390 | PNG lossless |
| Samaprabha/reveal-rock-new.png | 1016.2 → 283.5 | 1254×1254 | 352×268 | PNG lossless |
| Samaprabha/shadow-branch.png | 480.9 → 46.2 | 1448×1086 | 635×326 | PNG lossless |
| Samaprabha/shadow-reed.png | 799.9 → 88.9 | 1448×1086 | 538×390 | PNG lossless |
| Samaprabha/shadow-stump.png | 474.2 → 53.9 | 1448×1086 | 467×566 | PNG lossless |
| Samaprabha/shadow-leaves.png | 400.9 → 43.8 | 1448×1086 | 566×382 | PNG lossless |

**Preload:** both children are already mounted by the parent; each calls usePreloadPoses before its inactive return. Entry requests include ~1.285 MB of unique scene-owned art referenced only by the later child (12 files). This is observed early loading, not a proposed hidden mount. Approval may allow a scene-local preload gate; no mounting/game logic change is proposed here.
Production already quantizes the live PNGs at configured q82: 7.008 MB source inventory is not 7.008 MB transferred. Most remaining conversion scope is Samaprabha PNG clues/shadows and the Suryakoti PNG backdrop. Fawn-walk size is inferred from its 11vw pose container; other table boxes include transforms and may be deliberately stretched by current CSS.

### Shloka Scene1 — Vakratunda + Mahakaya

**11 scene-owned images requested on entry; source 0.869 MB → current production 0.617 MB → estimated optimized ~0.579 MB.** 7 WEBP lossy, 4 PNG lossless.

| Live heavy image (>300 KB source) | Source → production KB | Source px | Largest sampled CSS box px | Encoding |
|---|---:|---:|---:|---|
| None | — | — | — | Existing small lossy art largely stays unchanged |

**Preload:** both children are already mounted by the parent; each calls usePreloadPoses before its inactive return. Entry requests include ~0.056 MB of unique scene-owned art referenced only by the later child (2 files). This is observed early loading, not a proposed hidden mount. Approval may allow a scene-local preload gate; no mounting/game logic change is proposed here.
No >300 KB owned file. The old elephant/bud/lotus/seed/flower imports do not load in this rescue flow; headphones/coach are unused too. Three Mahakaya animal PNGs come from Symbol Mountain and need separate shared-image approval; they are listed below and excluded from A’s estimate. Image-only benefit is small.

### Shloka Scene3 — Nirvighnam + Kurumedeva

**31 scene-owned images requested on entry; source 3.420 MB → current production 2.721 MB → estimated optimized ~2.274 MB.** 23 WEBP lossy, 8 PNG lossless.

| Live heavy image (>300 KB source) | Source → production KB | Source px | Largest sampled CSS box px | Encoding |
|---|---:|---:|---:|---|
| saurakoti-bg.png | 802.1 → 367.9 | 2048×1536 | 1366×1024 | PNG lossless |

**Preload:** both children are already mounted by the parent; each calls usePreloadPoses before its inactive return. Entry requests include ~2.044 MB of unique scene-owned art referenced only by the later child (22 files). This is observed early loading, not a proposed hidden mount. Approval may allow a scene-local preload gate; no mounting/game logic change is proposed here.
Main heavy owned image is the PNG backdrop; most bridge sprites are already small lossy WebPs and stay unchanged. Measured first-load includes the later Kurumedeva pose batch, explaining why its initial request weight is larger than its visible first game suggests.

### Shloka scene4 — Sarvakaryeshu + Sarvada

**17 scene-owned images requested on entry; source 2.413 MB → current production 2.413 MB → estimated optimized ~2.139 MB.** 17 WEBP lossy.

| Live heavy image (>300 KB source) | Source → production KB | Source px | Largest sampled CSS box px | Encoding |
|---|---:|---:|---:|---|
| boat.webp | 396.3 → 396.3 | 2048×1536 | 420×315 | WEBP lossy |

**Preload:** both children are already mounted by the parent; each calls usePreloadPoses before its inactive return. Entry requests include ~0.792 MB of unique scene-owned art referenced only by the later child (7 files). This is observed early loading, not a proposed hidden mount. Approval may allow a scene-local preload gate; no mounting/game logic change is proposed here.
The 396 KB Sarvakaryeshu boat is 2048×1536 but displayed up to 420×315 CSS px in the sampled desktop layout. Sarvada’s later parent backdrop `sarvada/night.webp` (41.4 KB, 1448×1086, already lossy) also really renders; it is not fetched at initial entry and is kept. Existing B-owned shared-icon import substitutions were preserved.

### Shared and excluded scope

Listed, not converted: `public/images/ganesha-poses/*`, `public/images/ganesha-hi-stand.webp`, `public/images/meanings-caveofsecrets/*` (shared icon files only), zone badges, zone/map/welcome/onboarding backgrounds, `public/intro-story/*`, Shloka AppSidebar app-* artwork, and Symbol Mountain shared icons. These are B’s/shared scope. All four entry traces include some app/onboarding/map warm-ups; their bytes remain in measured totals and are not credited to A’s estimates. No measured external shared image response exceeds 300 KB in this build.

Separate approval needed for Mahakaya’s reused `src/zones/symbol-mountain/scenes/tusk/assets/images/{monkey-new,cow-new,peacock-new}.png`; originals untouched. No Cave of Secrets/Festival Square scene was opened or edited.

PNG means lossless file encoding in the source; the existing production optimizer applies q82 palette quantization and keeps PNG output, so source KB and delivered KB differ. WebP RIFF chunks were checked for VP8 (lossy) vs VP8L (lossless). Tables use actual source files matched to observed production URLs/content; deduplicated output names can differ from source basenames. Unused headphones/coach and legacy imports, backups and variants do not contribute to the owned totals.

**Next:** Madhurima approves each Phase 1 report before any new image files. Then one small relative-path page per scene at `docs/Shloka-Scene2-Comparison.html`, `docs/Shloka-Scene1-Comparison.html`, `docs/Shloka-Scene3-Comparison.html`, `docs/Shloka-Scene4-Comparison.html`, matching Group1 layout with flagged-first SSIM/PSNR/alpha-edge metrics, real size, 3× zoom and light/dark control. Page approval precedes import switches and production remeasurement; Madhurima’s scene test follows. No commit without her explicit instruction.

**Evidence:** external `shloka-phase1-A` artifact folder contains import inventory, encoding/source hashes, production request traces, original production byte sizes, in-memory estimates, 12 visual endpoints/contact sheet, larger desktop and parent display measurements, build log/result and source verification. All 12 traced scene/layout/style file hashes still match the inventory snapshot. Private sibling build is removed after this audit; logs remain outside the repository.

## 2026-10-19 — Scene2 Phase 2 candidates (STOP for image approval)

Phase 1 approved. Revised order: **Scene2 → Scene3 → Scene4; Scene1 skipped** (about 0.04 MB benefit). Complete one scene through image approval, import-only switch, checks/build/measurement and Madhurima’s test before starting the next.

[Scene2 comparison page](Shloka-Scene2-Comparison.html): 35.6 KB HTML, relative image paths only, Group1-style cards, sizes/dimensions, SSIM/PSNR/alpha-edge, flagged first, sampled real display boxes, pannable centred 3× zoom, light/dark/checker and 1024/1366 controls. Opens straight from docs/. New files: 14 uniquely named -opt.webp under Scene2/assets/images-opt/; none overwrites a pre-existing file. No import or preload switch.

| Budget (decimal MB) | Before | Proposed after approval |
|---|---:|---:|
| Scene-owned production image files | 1.793 | 0.971 |
| Selected 10 replacements only | 1.282 | 0.460 |

These are static image budgets, not a new production first-load measurement. Saving ~0.821 MB. All 14 source comparison files total 6.701 MB; all 14 candidate files total 0.773 MB. Four candidates are **not proposed** because existing production PNGs are smaller (PNG build optimization matters). Their files remain for review; originals stay active.

| Image | Source KB / px | Candidate KB / px | SSIM / PSNR dB | Decision / flags |
|---|---:|---:|---:|---|
| Samaprabha/reveal-rock-new.png | 1016.2 / 1254×1254 | 106.7 / 952×952 | 0.9732 / 36.96 | SSIM <0.98; PSNR <38 dB |
| Suryakoti/bunny-happy-zip.png | 32.8 / 400×400 | 10.5 / 302×302 | 0.9839 / 39.29 | Alpha-edge >5/255 |
| Suryakoti/sun-zip.png | 89.4 / 700×700 | 31.1 / 518×518 | 0.9908 / 41.91 | Keep original; production 25.3 KB |
| Samaprabha/shadow-reed.png | 799.9 / 1448×1086 | 125.8 / 1448×1086 | 0.9952 / 48.95 | Keep original; production 88.9 KB |
| Samaprabha/shadow-leaves.png | 400.9 / 1448×1086 | 61.5 / 1448×1086 | 0.9974 / 51.95 | Keep original; production 43.8 KB |
| Samaprabha/shadow-branch.png | 480.9 / 1448×1086 | 94.6 / 1448×1086 | 0.9978 / 52.18 | Keep original; production 46.2 KB |
| saurakoti-bg.png | 802.1 / 2048×1536 | 36.1 / 2048×1536 | 0.9819 / 44.15 | Proposed; gate passes |
| Suryakoti/bunny-sad-zip.png | 33.4 / 400×400 | 11.2 / 302×302 | 0.9850 / 39.46 | Proposed; gate passes |
| Samaprabha/reveal-branch-new.png | 1443.0 / 1536×1024 | 115.0 / 1284×856 | 0.9850 / 40.99 | Proposed; gate passes |
| Suryakoti/burrow-zip.png | 91.4 / 700×700 | 21.4 / 518×518 | 0.9870 / 41.71 | Proposed; gate passes |
| Samaprabha/fawn-walk-new.png | 519.7 / 1254×1254 | 21.6 / 406×406 | 0.9927 / 40.83 | Proposed; gate passes |
| Samaprabha/reveal-reeds-leaves.png | 324.2 / 1254×1254 | 62.2 / 992×992 | 0.9958 / 44.78 | Proposed; gate passes |
| Samaprabha/shadow-stump.png | 474.2 / 1448×1086 | 45.1 / 1260×945 | 0.9966 / 49.57 | Proposed; gate passes |
| Samaprabha/reveal-stump.png | 192.4 / 1254×1254 | 30.1 / 1254×1254 | 0.9976 / 49.44 | Proposed; gate passes |

**Gate:** lossy WebP q85, alphaQuality 100; alpha channels retained. Background remains 2048×1536. Eligible oversized sprites retain ≥DPR2 +35% over the larger sampled target, capped at original size; original aspect ratio preserved. Sun uses CSS 14% of 1366, and alternate poses use their established containers. Same SSIM ≥0.98, PSNR ≥38 dB, edge MAE ≤5/255, alpha MAE ≤1/255 thresholds as before; equal-grid CSS/DPR2 for 1024/1366, black/white composites, worst result. Scores normalize natural aspect; page contain boxes match sampled dimensions without the game’s rotation/skew.

**Visual check:** every converted sprite inspected beside its original at display size on white/black; background gradients and landscape inspected at 1024×768, bunny/fawn faces and edges at 3×. No obvious new solid halo or strong new gradient banding at display size. Zoom softens faces/leaf details. Rock reveal (SSIM/PSNR) and happy bunny (edge error) remain flagged for Madhurima’s close review; no blanket quality pass claimed. Sun, shadow-branch, shadow-reed and shadow-leaves remain original for production byte size. Existing small lossy scene WebPs and all shared artwork remain unchanged.

**Verification:** all 18 original scene-owned image hashes and 14 candidate hashes verified; traced Scene2 source/style hashes unchanged. Comparison tested via file URL: 14 cards, 56 loaded images, six flagged cards first (two quality flags + four keep-original decisions), no page errors; stage/background/filter/zoom controls pass. No runtime source, voice, timer, resume, Play Again or shared-code edits. No production build needed for an unreferenced candidate-only step; no timing/speedup claimed. ESLint/build and cache-disabled production measurement follow the approved import-only switch. Untick Disable cache before crossfade/voice timing checks.

**Deferred, outside Phase 2:** Samaprabha (~1.29 MB) and Kurumedeva (~2.04 MB) later-game preloads remain exactly as they are. After Scene2, Scene3 and Scene4 Phase 2 are finished, send a separate proposal for scene-local warm-up; do not implement it during this rollout. No Scene3/Scene4 candidates yet; no commit/push.


## Scene2 approved rollout — 10 imports switched; Madhurima test pending

All 10 replacements approved, including rock and happy bunny. Changed 4 image-import lines in components/SuryakotiGame.jsx and 6 in components/SamaprabhaGame.jsx only. Sun, shadow-branch, shadow-reed and shadow-leaves stay original. No preload-list shape/timing changes: all 10 entries already reference their import variables, now resolving to the approved -opt.webp URLs. Static AST/import checks and the production request trace verify all ten new URLs fetched and no corresponding old production-image URL fetched. Existing later-game preloads remain untouched.

**Checks:** default-format ESLint no-undef filter produced **no output**. Full lint exits 1 with exactly the pre-existing effShowDoneline unused-variable error and one unused-eslint-disable warning; before/after findings match. Focused esbuild passes; git diff --check passes. One exclusive-lock private production build, exit 0 in 430.7 s, 10-minute timeout; lock released; sibling output deleted after measurement, external logs retained. Original/candidate hashes and import-only scope pass.

| Matched production Scene2 opening | Image transfer MB | All transfer MB | Fully drawn / image settle |
|---|---:|---:|---:|
| Reconstructed original-production-PNG payload baseline | 3.062 | 4.050 | 15.3 / 18.0 s |
| Approved optimized payloads | 2.299 | 3.415 | 16.9 / 21.5 s |

Same production build in both arms; local baseline serves the original q82 production PNG bytes for the 10 approved URLs (each byte size verified against Phase 1). This is a matched image-payload baseline, **not an old-source build**. 1024×768 DPR2, cache disabled, service workers blocked, Slow 4G 1.6Mbps/562.5ms, audio preference off equally; shell loaded before Continue timing. Opening images/background stable 2 s; image-settle includes unchanged later-game preload requests. Screenshots visually checked after timing. One pair, not a statistical speedup claim; shared app warm-ups remain in the totals. Scene-owned file budget 1.792624 → 0.971145 MB.

[Short Scene2 pass-check](IMAGE_PASSCHECK_A.md): rock and happy bunny first; then opening/Suryakoti, remaining Samaprabha art, Continue, Play Again and spoken timing. Untick Disable cache for transition/voice judgement. No commit/push; Madhurima tests and says commit. Per her explicit direction, proceed to Scene3 candidates while she tests Scene2; Scene3 import approval remains separate. Scene1 skipped; Scene4 follows Scene3. No voice/timer/shared/gameplay edits.


## Scene3 Phase 2 — comparison ready; STOP for image approval

[Scene3 comparison page](Shloka-Scene3-Comparison.html), 21.8 KB HTML, relative paths only; 8 comparison cards, originals/candidates with KB/dimensions and SSIM/PSNR/alpha-edge, retained/flagged cards first, real sampled contain boxes plus 3× pannable zoom, light/dark/checker and 1024/1366 controls. Group1-style layout. **No Scene3 import/preload changes.**

Eight new uniquely named -opt.webp files in Scene3/assets/images-opt/, originals untouched. Proposed **4 replacements**: background, sad turtle, happy turtle, nest. Keep stone and branch originals because their production PNGs are smaller; keep branch and both reed poses because their alpha-edge score exceeds the conservative 5/255 gate. The branch has both reasons. All 23 existing small lossy WebPs, including Kurumedeva art, remain unchanged. Failed alpha candidates are shown for transparency, not proposed for switching.

| Production image file budget (decimal MB) | Before | Proposed after image approval |
|---|---:|---:|
| Scene-owned files | 2.721 | 2.369 |
| Selected four files only | 0.429 | 0.076 |

Potential saving ~0.353 MB; static file budget only, not a measured first-load/timing result. All 8 source comparison files 1.344 MB; all 8 candidates 0.204 MB. Retained originals are included in the proposed runtime budget.

| Image | Source KB / px | Candidate KB / px | SSIM / PSNR dB | Alpha-edge MAE | Proposed decision |
|---|---:|---:|---:|---:|---|
| nirvighnam/reeds-open.png | 200.0 / 1000×1000 | 58.7 / 654×654 | 0.9834 / 39.78 | 5.40 | Keep original: alpha-edge gate |
| nirvighnam/reeds-closed.png | 144.9 / 1000×1000 | 43.9 / 654×654 | 0.9890 / 40.98 | 5.72 | Keep original: alpha-edge gate |
| nirvighnam/branch.png | 29.4 / 400×400 | 12.5 / 400×400 | 0.9921 / 43.44 | 5.87 | Keep original: production PNG smaller; alpha-edge gate |
| nirvighnam/stone.png | 34.0 / 400×400 | 12.7 / 400×400 | 0.9948 / 44.95 | 2.47 | Keep original: production PNG smaller |
| saurakoti-bg.png | 802.1 / 2048×1536 | 36.1 / 2048×1536 | 0.9819 / 44.15 | 0.00 | Proposed; gate passes |
| nirvighnam/nest.png | 37.2 / 400×400 | 12.3 / 400×400 | 0.9888 / 41.44 | 4.63 | Proposed; gate passes |
| nirvighnam/nir-turtle-happy.png | 50.1 / 400×400 | 14.3 / 338×338 | 0.9888 / 40.49 | 4.41 | Proposed; gate passes |
| nirvighnam/nir-turtle-sad.png | 46.5 / 400×400 | 13.7 / 338×338 | 0.9889 / 40.74 | 4.66 | Proposed; gate passes |

**Quality/visuals:** q85 lossy WebP, alphaQuality 100, original aspect ratio. Background stays 2048×1536; sprites resized only where >2× the larger sampled display, preserving DPR2+35% margin capped at source size. Same SSIM ≥0.98 / PSNR ≥38 dB / edge ≤5/255 / alpha MAE ≤1/255 gate at CSS and DPR2 for 1024/1366, black/white composites, worst result. Every sprite inspected on white/black at display size; turtle faces/edges and reeds also inspected zoomed. Proposed turtle/nest art shows no obvious new solid halo at display size; some softening is visible at 3×. Branch and both reed poses remain original rather than accept the edge-gate failure. The background candidate is byte-identical to the approved Scene2 background (verified SHA-256 match); its landscape/gradients were visually checked. No text in the converted art.

**Verification:** 8 candidate hashes and all 31 original scene-owned image hashes pass; Scene3 source/style/layout hashes unchanged. File-URL page test: 8 cards, 32 loaded images, 4 retained cards first, zero page errors; stage, light/dark, zoom and filter controls pass. No production build/timing at candidate stage, no speedup claimed, no hidden game or preload changes. No shared, voice, timer, resume, Play Again or gameplay changes. Scene4 not started.

**Next:** Madhurima approves the four proposed Scene3 images before import-only switch. Scene2 is already switched and awaits her [pass-check](IMAGE_PASSCHECK_A.md), with Disable cache UNTICKED for crossfades/voice. No commit/push. Samaprabha/Kurumedeva (~1.29/~2.04 MB) preload warm-up proposal remains separate and deferred until all Phase 2 scenes finish.


## Scene3 approved rollout — four imports switched; test pending

Madhurima approved background, sad turtle, happy turtle and nest. Exactly four import lines changed in NirvighnamGame.jsx. Stone, branch and both reed poses remain original; Kurumedeva, all preload timing/lists, voice, timer, resume and Play Again logic are untouched. Existing POSE_ASSETS variables now resolve to approved -opt.webp imports. Production trace confirms all four new URLs fetched and no corresponding old production URL fetched. Scene2 was tested and reported fine; no commit instruction received.

**Checks:** default-format ESLint exits 0, no findings; no-undef filter **no output**. Focused esbuild and git diff --check pass. Original/candidate hashes and import-only/preload-binding checks pass. One exclusive-lock private build exit 0 in 384.3 s, 10-minute timeout; lock released, sibling output deleted after measurement, logs outside repo.

| Matched production opening | Image transfer MB | All transfer MB | Opening drawn / image settle |
|---|---:|---:|---:|
| Reconstructed original-production-PNG payloads | 4.436 | 6.071 | 21.7 / 24.2 s |
| Approved optimized payloads | 3.687 | 4.607 | 14.8 / 17.2 s |

Both arms use the same production build; original q82 production PNG payloads reconstructed and byte sizes verified against Phase 1, not an old-source build. 1024×768 DPR2, Slow 4G 1.6Mbps/562.5ms, cache disabled, service workers blocked, audio preference off equally. Timing begins at Continue after shell load. Opening images/background loaded and stable 2 s; image settle includes unchanged later-game preloads. Screenshots visually checked. One pair only; no statistical speedup claim. Static scene-owned file budget 2.721306 → 2.368534 MB.

[Scene3 pass-check](IMAGE_PASSCHECK_A.md): both turtle poses/nest/background, obstacle sequence, Kurumedeva intro/art, Continue and Play Again. Untick Disable cache before crossfade/voice judgement. No commit/push. Per Madhurima’s request, prepare Scene4 comparison next, with no Scene4 import switches until image approval. Warm-up proposal stays separate until Phase 2 finishes.


## Scene4 Phase 2 — boat comparison ready; STOP for image approval

Madhurima requested Scene4 comparison preparation while Scene3 awaits her test. [Scene4 comparison](Shloka-Scene4-Comparison.html): one card, relative image paths, original/candidate side by side, KB/dimensions, quality metrics, sampled real size and 3× pannable zoom, light/dark/checker and 1024/1366 controls. Only new files: scene4/assets/images-opt/boat-opt.webp and the comparison page. No Scene4 import/preload or runtime changes.

| Sarvakaryeshu boat | Original | Candidate |
|---|---:|---:|
| File KB | 396.3 | 120.8 |
| Pixels | 2048×1536 | 1134×850 |
| Encoding | Lossy WebP + alpha | q85 WebP + alpha |

Static scene-owned production budget **2.413 → 2.137 MB** if approved (~0.276 MB saving). This is not a new first-load measurement. The original exceeds twice its largest sampled 420×315 CSS box; candidate preserves DPR2+35% margin (height rounds to 850 px). All backgrounds remain original at their existing dimensions. Other already-small lossy WebPs, shared assets and preload behaviour remain unchanged.

Gate at CSS/DPR2 on 1024/1366 stages, white/black composites: SSIM **0.9825**, PSNR **39.15 dB**, alpha-edge MAE **2.91/255**, alpha MAE **0.155/255**. Passes thresholds .98 /38 dB /5 /1. No flags. Display-size light/dark and 3× visual checks: no obvious new halo or banding; children's hair, mouse ears/tail and flower garland remain clear at display size, slight softening at zoom.

Verification: all 18 owned originals, candidate and protected Scene4 source/style hashes pass. File-URL page loads four images with zero page errors; relative paths, stage, light/dark, zoom and filters pass. HTML 6.1 KB, no embedded base64. Candidate filename was new and created exclusively; original untouched. No production build needed at unreferenced candidate stage. **Await boat-image approval before import-only switch.** No voice/timer/shared/game logic changes, no commit/push. Samaprabha/Kurumedeva warm-up proposal remains deferred until all Phase 2 scenes finish.


## Scene4 approved rollout — boat import switched; test pending

Madhurima approved the boat. Exactly one image-import line changed in scene4/SarvakaryeshuGame.jsx to assets/images-opt/boat-opt.webp. Existing POSE_ASSETS uses boatImg, so its preload resolves to the same new URL; no preload timing or list edits. Original remains; all other artwork, voice/timer/resume/Play Again/shared/game logic untouched. Production trace verifies optimized URL fetched and old URL not fetched.

Static scene-owned image budget **2.412796 →2.137286 MB**; boat **396276 →120766 bytes**, alpha kept. Default-format ESLint exit 0; no-undef filter output: **(no output)**. Focused esbuild, exact one-import scope, preload binding and git diff --check pass. Single locked private production build exit 0 in 485.7 s, 10-minute timeout; lock released, private sibling output deleted after measurement; logs outside repo.

| Matched Scene4 production opening | Image transfer MB | All transfer MB | Opening / image settle seconds |
|---|---:|---:|---:|
| Reconstructed original-WebP payload | 3.943 | 4.784 | 14.3 /16.8 |
| Approved optimized payload | 3.667 | 4.574 | 14.3 /17.3 |

Same build in both arms; baseline serves unchanged original WebP bytes at the candidate URL, not an old-source build. Cache disabled, SW blocked, Slow 4G 1.6Mbps/562.5ms, 1024×768 DPR2, audio off equally. Timed opening is the fully drawn welcome modal after Continue, not completed gameplay. Both game endpoints also captured and inspected. Totals include shared app warm-ups and request timing variation; only the isolated 0.276 MB boat saving is attributable to this import. One pair only, no statistical speedup claim.

[Scene4 pass-check](IMAGE_PASSCHECK_A.md): boat first on Sarvakaryeshu, then symbol before/after sequence, Sarvada morning/afternoon/night, Continue and Play Again. Disable cache UNTICKED for transitions/voice. No commit/push. Samaprabha/Kurumedeva preload warm-up remains a separate proposal, not implemented.

Lint detail: two existing hook-dependency warnings (cards at lines 279 and 601); zero errors and no no-undef output. No hook changes made.


Phase 1 clarification (append-only): encoding counts are 14 PNG lossless /4 WebP lossy for Scene2 and 8 PNG lossless /23 WebP lossy for Scene3. Poses without a measured or known container size keep original dimensions. Evidence covers 25 traced scene/layout/style snapshots.
