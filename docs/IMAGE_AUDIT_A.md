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
