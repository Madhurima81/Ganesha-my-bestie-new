# Image audit B — Group 1: shared images (Phase 1, read-only), 16 October 2026

Read-only. No code, image, import or build was touched. Sizes are source-file bytes (decimal KB/MB), not measured network transfer; nothing here was timed in a browser, and savings are **estimates** (based on session A's q85 lossy-WebP result of about 95 % on similar art) until a candidate set is built and measured. Scope: live app only (main.jsx → App.jsx, lazily imported shared views, `zones/shared`, `symbol-mountain/shared`, `shloka-river/shared`). Obsolete/parked code (Cave of Secrets, Festival Square, ZonePreviewModal, dev harnesses, `.bak`/backup files) is ignored. Method: static import/reference scan (script in the session scratchpad), then checked each large file's real render site in the JSX/CSS.

## 0. Findings that need NO new art (reference-only fixes, biggest sure wins)

| # | Finding | Evidence | Size wasted | Fix (reference/preload line only) |
|---|---|---|---|---|
| A | Loading screen **blocks** on three images that no screen ever displays: `welcome-board.webp` 238 KB, `welcome-ganesha.webp` 168 KB, `welcome-mooshika.webp` 141 KB (all 1536×1024) | `App.jsx:823-826` awaits them (`Promise.all`); `grep` finds no other use in src/CSS. Welcome screen uses `welcome-opening-bg.webp` (44 KB, CSS) + `ganesha-welcome-poster.webp` (23 KB, video poster) | **547 KB** on the first-ever critical path | Replace the three entries with the two images the welcome screen really shows (already small) — or drop them. Needs your OK because it changes what the loader waits for |
| B | Profile-welcome preload fetches the **PNG** map critters (`butterflyyellow.png` 48, `butterflyblue.png` 40, `birdnew.png` 45, `lock.png` 48 KB) but the map and Zone Welcome draw the **WebP** versions (21, 19, 25, 18 KB) | `App.jsx:659-662` vs `CleanMapZone.jsx:384-386, 625-645`, `ZoneWelcome.jsx` | **181 KB wasted**, and the real WebPs are not warmed | Point the 4 preload lines at the `.webp` (new bytes: 83 KB, actually used) |
| C | `avatarImagePaths()` preloads each avatar twice (`.webp` + `.png`); PNG is only the fallback | `preloadImages.js` (called with 4 ids on the loader, also from the profile screens) | 4 PNGs = **238 KB** wasted (tiger 61, squirrel 52, monkey 51, peacock 75) | Preload `.webp` only. `avatarImagePaths` is shared — I would check its other callers first |
| D | `welcome-background-recent.png` **2.93 MB** and `welcome-background1.png` **2.81 MB** (also `-old`, `3`) | Zero references in src, CSS, index.html, vite config. Not in the service-worker precache (shell only) | 0 MB of first load. 5.7 MB of deploy folder only | Nothing to optimize in-app. Your call whether to move them out of `public/` (I will not delete) |
| E | OpeningModal tries `*.webp` then the `*.png` only if the webp fails to load (`OPENING_BG_MAP` + `tryLoad`) | `OpeningModal.jsx:69-73, 250-262` | 0 on a normal load (PNG backgrounds 0.8–2.9 MB are fallback only) | None needed |

## 1. Ranked by real first-load cost (new art needed; each needs a comparison page + your approval)

"When" = how early the file is requested. All files are public/ unless noted.

| Rank | File(s) | Size now | Native → CSS display | Where it appears / when requested | Est. after | Est. saving |
|---|---|---|---|---|---|---|
| 1 | `map/shloka-stream.png` 914 KB (887×1774), `shloka-waterfall.png` 1,551 KB (1536×1024), `shloka-bridge.png` 1,451 KB (1536×1024), all PNG with alpha | **3.92 MB** | stream box 25 % × 79 % of the viewport; waterfall 19 % × 24 %; bridge 13 % × 15 % (`.map-zone-art`, `object-fit: contain`). On a 1024×768 tablet that is about 256×512, 195×130 and 133×89 CSS px. Waterfall and bridge are 4–8× oversampled even at DPR 2 | `CleanMapZone.jsx:1511` — rendered on **every map visit**, all three together, after the lazy CleanMapZone chunk loads (next screen after profile/welcome) | ~0.15–0.25 MB (lossy WebP + alpha, DPR2 +35 % margin as in scene 3) | **≈ 3.7 MB** |
| 2 | `welcome-back-bg.png` | **1.39 MB** (1448×1086, no alpha) | full-screen background, cover | `CleanGameWelcomeScreen.css:1953`, only when viewport ≥ 900×600 (tablet landscape / desktop = the main target devices) — the returning-child "welcome back" overlay. Every other size uses `profile-bg.webp` (65 KB) | ~0.07–0.10 MB (same look as the existing 2048×1536 WebP backgrounds) | **≈ 1.3 MB** |
| 3 | `src/zones/symbol-mountain/shared/images/icons/symbol-{belly,lotus,ears,trunk}-new.webp` (lossless): 445 + 408 + 356 + 294 KB; the other four (`eyes`, `mooshika`, `modak`, `broken-tusk`) are 22/19/13/12 KB | **1.50 MB** (+0.07 for the small four) | all 1254×1254 lossless. Shown at about 34–140 px (sidebar, cards, opening modal) | Bundled assets (hashed `/assets/`), shared by Modak, Pond, Tusk, Sacred Assembly, Sarvada/Sarvakaryeshu via `SymbolSidebar` and `OpeningModal`; requested when a Symbol Mountain scene mounts its sidebar (all 8 in the sidebar). Downloaded once, then cached by the service worker | ~0.12 MB (512 px lossy WebP + alpha; belly/lotus detail is the risk, flagged first) | **≈ 1.4 MB** |
| 4 | `ganesha-final-new.svg` 1,567 KB (gzip ≈ 966 KB) — vector, hand-traced Inkscape paths, no raster | **1.57 MB / ~0.97 MB gz** | drawn at 72–320 px (TalkToGanesha 72, TWG hub 320, whisper) | `GaneshaCharacter.jsx` fetches it as text; `App.jsx:78` also warms it with `new Image()` when the **About Me Hut** zone is selected. Not requested at app start or on the map | Needs a vector method (path-precision reduction), not WebP. **Risk:** the component edits expression parts by id; ids must survive. Unmeasured | up to ~0.5–1 MB, **unproven**; I would test this last |
| 5 | `images/icons/symbol-{belly,lotus,ears,trunk,modak,mooshika,eyes}-new.png`: 713, 640, 580, 479, 50, 32, 30 KB | **2.52 MB** | 130 px-high image in ProgressPopup / SymbolCardModal | `symbolCardContent.js` `icon:` paths; only when the child **opens a symbol card / progress detail** (on demand, not first load) | ~0.10 MB total. Easiest: new `.webp` files next to them, update 7 lines in `symbolCardContent.js` | ≈ 2.4 MB (on demand) |
| 6 | Avatars `new-explorer-*.webp` (26 files, 1.45 MB; the `…1` variants are up to 266 KB) | the 4 preloaded are only 13–17 KB each | 256×256 shown at 40–145 px | Profile selector (all avatars when the picker opens) | the picker's 1-variants are the only heavy ones; not checked which are shown | small; look in a later pass |
| 7 | Ganesha pose WebPs `ganesha-poses/*.webp` (41–78 KB, 1000×1000 alpha, `ganeshaUsageSystem.js`) | ~0.5 MB across ~8 poses, only the used one loads per screen | not measured per screen | scene opening modals | ≈ 0.2–0.3 MB | optional |

Already fine (no action): zone and Zone Welcome backgrounds (`modakmtn-bg`, `hut-bg`, `shlokariver-bg`, `profile-bg`, `pan-bg`, `welcome-opening-bg` are lossy WebP, 30–67 KB); intro-story slides (84–104 KB, lossy); map WebPs (`mapbg-meadow` 40 KB, zone art 13–84 KB); zone/scene icons (11–18 KB); gesture hand PNGs (30 + 35 KB); hand SVGs (13 KB). `about-me-hut-bg.webp` 248 KB and `mooshika-coach.webp` 198 KB (the latter only in unrendered `GameCoach`/`CulturalCelebrationModal`) are the only mid-size lossy files left; `about-me-hut-bg.webp` is warmed when the hut is selected, a candidate in a later pass.

Not rendered although reachable (pitfall 59, ignored): `ZonePreviewModal` and its `zone-art-*.webp` (5 files ≈ 0.6 MB) — the import in `CleanMapZone.jsx` is commented out; `GameCoach` (`mooshika-coach.webp`); `CulturalCelebrationModal` (`symbol-backpack.webp`); Cave of Secrets assets (`meanings-caveofsecrets/*`, `apps-shlokariver/*` shown only in the cave/chant lists of `CleanGameWelcomeScreen` — not checked further as that is outside the live scope); Festival Square icons.

## 2. Totals

| | MB |
|---|---|
| Reference-only fixes A + B + C (no new art) | **≈ 0.97** saved (0.55 loader block + 0.18 + 0.24), plus the loader no longer waits on unused images |
| Rank 1 + 2 (map PNGs, welcome-back background) | ≈ 5.0 MB saved on the paths every returning tablet child hits |
| Rank 3 (Symbol Mountain sidebar icons) | ≈ 1.4 MB saved the first time a Symbol Mountain scene loads |
| Rank 5 (symbol card PNGs) | ≈ 2.4 MB, on demand |
| Rank 4 (SVG) | unproven |

## 3. Proposed order and what changes (nothing started)

1. You OK items A–C (reference-only). I change 3 files: `App.jsx` (loader list and 4 preload lines), `preloadImages.js` (avatar helper).
2. I prepare Phase 2 candidates in **new files only** (e.g. `map/shloka-stream.opt.webp`, `welcome-back-bg.webp`, new-named WebPs for the symbol icons), SSIM/PSNR + alpha-edge gate, and one comparison page for ranks 1, 2, 3, 5 (flagged first). No same-name overwrites, so no `ganesha-images-v2` bump is needed. The three map images and `welcome-back-bg` would be new names under `public/images/`; the rank 3 icons would be new names under the bundled `images-opt/` pattern session A used.
3. After your approval I switch the references and list every changed file/line so you can pass-check map, Zone Welcome and one scene per zone.

Questions for you: (a) OK to remove the three never-shown welcome images from the loader (finding A)? (b) Rank 4: do you want the SVG tested at all, given the expression-id risk?

## Phase 2 (Group 1) - candidates prepared 2026-10-16, approval pending
Reference-only fixes A-C applied (not committed): `App.jsx` loader list (welcome-board/ganesha/mooshika removed; `welcome-opening-bg.webp` + `ganesha-welcome-poster.webp` added), 4 map critter preload lines `.png` -> `.webp`; `preloadImages.js` `avatarImagePaths` now webp only.
15 new lossy WebP files (q85, alpha preserved, new names, originals byte-unchanged, nothing imported yet): map `shloka-{stream,waterfall,bridge}-opt.webp`, `welcome-back-bg.webp`, 4 sidebar `symbol-*-new-opt.webp` (symbol-mountain/shared/images/icons), 7 card `icons/symbol-*-new-opt.webp`. Comparison page: docs/Group1-Comparison.html (flagged first). Gate: SSIM 0.98 / PSNR 38 / alpha-edge 5, at 1x/2x of the 1024 and 1366 stages.

## Group 1 import switch - 2026-10-16 (approved by Madhurima, all 15 candidates)
Originals untouched; only reference/import lines changed (no same-name overwrite, so no `ganesha-images-v2` bump).

| File | Line(s) | Before -> after |
|---|---|---|
| src/pages/CleanMapZone.jsx | 740, 746, 752 | `/images/map/shloka-{stream,waterfall,bridge}.png` -> `...-opt.webp` |
| src/lib/components/navigation/CleanGameWelcomeScreen.css | 1953 | `/images/welcome-back-bg.png` -> `welcome-back-bg.webp` (>=900x600 only) |
| src/zones/shared/components/OpeningModal.jsx | 11, 12, 13, 15 | `symbol-{belly,lotus,trunk,ears}-new.webp` -> `...-new-opt.webp` |
| src/zones/symbol-mountain/shared/components/SymbolSidebar.jsx | 12, 13, 15, 18 | same 4 icons -> `-opt.webp` |
| src/zones/symbol-mountain/shared/components/symbolCardContent.js | 9, 22, 36, 49, 62, 75, 88 | `/images/icons/symbol-{eyes,ears,modak,mooshika,belly,lotus,trunk}-new.png` -> `-new-opt.webp` |
| scene4/SarvadaGame.jsx | 15, 16 | ears, belly -> `-opt.webp` |
| scene4/SarvakaryeshuGame.jsx | 22, 27 | trunk, ears -> `-opt.webp` |
| scene5/ShlokaRiverFinale.jsx | 35 | trunk -> `-opt.webp` |
| modak/NewModakSceneV7.jsx | 99 | belly -> `-opt.webp` |
| pond/PondSceneSimplifiedV4.jsx | 78-80 | belly, lotus, trunk -> `-opt.webp` |
| final scene/SacredAssemblySceneV8.jsx | 54-56, 58 | belly, lotus, trunk, ears -> `-opt.webp` |

Reference-only fixes A-C (test in the same pass): `App.jsx` ~lines 659-662 (profile-welcome preload `.png` -> `.webp`: butterflyyellow, butterflyblue, birdnew, lock); `App.jsx` ~lines 823-826 (loader `criticalImages`: welcome-board/ganesha/mooshika removed, `welcome-opening-bg.webp` + `ganesha-welcome-poster.webp` added); `preloadImages.js` `avatarImagePaths` (webp only).

NOT switched (session A's folders): Shloka Scene1 `VakratundaGroveSimplified.jsx:69` (trunk) and Tusk `SymbolMountainSceneV3.jsx:79,83-85` (ears, belly, lotus, trunk) still import the old lossless icons, so in Symbol Mountain the Tusk scene will fetch both versions until session A switches them. Not switched either: `ParentDashboardV1.jsx` (not rendered), `SacredAssemblySceneV8.jsx:109` fallback string (public `/images/icons/symbol-belly-new.webp`, unchanged).
Known edge: `CleanMapZone` merges a locally saved map-editor layout (`gmb_map_zone_art`) over the defaults; a device that saved a layout with the old PNG paths would keep requesting the PNGs.

Measurement (one private production build, built alone with the lock, deleted afterwards; headless Chromium 1024x768 DPR2, cache disabled, service worker blocked, no throttling; local server): images requested, unique URLs, completed-response bytes, seeded returning profile, audio off.
| Stage | Unique images | MB now | Same requests with the old map PNGs |
|---|---|---|---|
| Loader + welcome (page idle) | 26 | 1.203 | 1.203 (map not requested here) |
| Tap Start Adventure -> map | 19 | 0.564 | about 4.31 (computed by substituting the 3 original PNG sizes) |
| Tap Modak Mountain -> Zone Welcome | 19 | 0.879 (includes the next scene's own background/preloads) | unchanged |
The "before" is computed from file sizes, not a second build. Fix A (547 KB of unused welcome images) and fix C (238 KB of PNG avatars) are not in the 1.203 MB figure's "before"; they would have added about 0.78 MB, also computed, not measured. The map screenshot (new WebPs) was checked by eye: river, waterfall and bridge look intact. No timing/speedup claimed: no throttled fully-drawn run was done. Welcome-back overlay (>=900x600 only) and the symbol card popup were not exercised.

Update: SymbolMountainSceneV3.jsx lines 79,83-85 (ears, belly, lotus, trunk) now import `-new-opt.webp` (Madhurima asked; import lines only). Remaining old import: Shloka Scene1 VakratundaGroveSimplified.jsx:69 (session A).

Update: shloka-river/shared/AppSidebar.jsx:11 and components/chantCardContent.js:1 trunk icon PNG (479 KB) -> symbol-trunk-new-opt.webp.

# Group 2 - Modak (Phase 1, read-only), 16 October 2026
Scope: images reachable from `NewModakSceneV7.jsx` (+ `FlowerJourneyGame2`, `GarlandGame3`, shared `SymbolSidebar`/`OpeningModal`). Old `NewModakScene*` variants, backups and unused files in `assets/images` (basket*, belly-*, forest-background, ganesha-character, fj-leafy-*, fj-mud-crossing, fj-tree/branch (non-new), PNG twins of webps) are NOT imported and ignored. No file changed.

## Scene-own art really imported (source bytes, decimal)
| File(s) | Bytes | Native | Display (CSS) | Format now | Notes |
|---|---|---|---|---|---|
| `emotion-{angry,sad,worried,happy}-game3.png` (V7) + `excited,pleased,relieved` (Game 2) | 7 PNGs = **0.99 MB** (113-162 KB each) | 1000x1000 alpha | 48-72 px (`.fjg2-emotion`, `clamp(48px,4.5vw,72px)`) | **PNG**, lossless | A lossy `.webp` twin of every one already exists in the same folder (43-69 KB each, 0.41 MB total) but is not imported. At 72 px a 256 px sprite is enough (est. 6-10 KB each) |
| `ganesha-game3-new.webp` | 77 KB | 1000x1000 | 125-200 px (`.g3g-ganesha`) | lossy webp | ~2.5x oversampled at DPR2 |
| `fj-bush-open-new` 120, `fj-bush-closed-new` 104, `fj-tree-new` 95, `fj-branch-new` 83, `fj-marsh-clump` 65, `fj-mud-plain` 58 KB | 0.53 MB | 1254-1394 sq | bush 190-320 px; tree/branch/marsh 23-24 % of stage (~235-330 px) | lossy webp | 1254 px source vs ~300-650 px needed (DPR2 +35 %) |
| `fj-garland-complete` 103, `fj-garland-empty` 65, `fj-flower-cream` 42, `fj-flower-coral` 28 KB | 0.24 MB | 1001-1254 | garland ~58-72 % of its panel; flowers 50-84 px | lossy webp | flowers are 10x oversampled |
| `mooshika-turned-game2.webp` 64 KB | | 1254 sq | 82-140 px (`.g3g-mooshika`) | lossy webp | |
| `journey-{feather,berry,acorn}.webp` 23/38/25 KB | 0.09 MB | 1000 sq | small tokens | lossy webp | |
| `modak-fj-bg.webp` | 30 KB | 1448x1086 | full stage | lossy | fine |
Scene-own total: **2.42 MB** (1.43 MB lossy webp + 0.99 MB PNG).
Shared, already done in Group 1: sidebar/opening-modal icons (`-opt`), `modakmtn-bg.webp` 30 KB.

## Findings
1. **PNG emotions (0.99 MB) are the single clear win**: webp twins already exist. Option A (no new art, just import the twins) saves 0.58 MB; option B (new 256 px lossy WebP) would be about 0.06 MB total, saving ~0.93 MB. Needs your visual OK either way (twins are lossy; compare edges).
2. The remaining scene art is already lossy WebP but 2-10x oversampled. Display-sized q85 candidates (DPR2 +35 % margin, as scene 3) estimate 1.43 MB -> about 0.5 MB (saving ~0.9 MB). Needs a comparison page; bushes/tree/branch (soft green edges) would be flagged first.
3. `App.jsx:98` preloads `.../modak/assets/images/newmodakbg.webp`, a file that does not exist (glob miss, silent no-op); the scene's real background is `modak-fj-bg.webp` (30 KB). Impact is small; fixing the path is a one-line change if you want it.
4. When it loads: every import is a bundled hashed asset; the browser only requests an image when it is first rendered/preloaded (Game 2 art when Flower Journey mounts, Game 3 art later). I did not trace each game's preload hook or time a run; no loading-speed claim.

## Estimate if all approved
| | MB |
|---|---|
| now (scene-own) | 2.42 |
| A only: emotions -> existing webp twins | 1.84 (-0.58) |
| B: new display-sized candidates for everything | about 0.6 (-1.8) |
Estimates from session A's ratios; not measured.

Proposed next: you choose A (twins, no new files) or B (new candidates, one comparison page, flagged first). I will not touch Modak imports until you decide.

## Modak emotion sprites - Phase 2 candidates (approval pending)
7 new files `emotion-{angry,sad,worried,happy,excited,pleased,relieved}-game3-opt.webp` in `scenes/modak/assets/images/` (320 px wide, q85 lossy, alpha kept; originals and the existing twins untouched; nothing imported yet). 0.99 MB PNG -> 0.09 MB. Gate (SSIM 0.98 / PSNR 38 / alpha-edge 5, checked at 72/108/144/216 px): new set passes 5/7; happy and relieved sit at PSNR 38.0 (borderline flag). The existing twins fail the gate on 5/7. Comparison page (original / twin / new): docs/Modak-Emotions-Comparison.html. Happy and relieved PNGs are byte-identical copies.

Modak emotions switched (approved): NewModakSceneV7.jsx 91-94 (worried, sad, angry, happy) and FlowerJourneyGame2.jsx 31-36 (angry, sad, worried, pleased, excited, relieved): `emotion-*-game3.png` -> `emotion-*-game3-opt.webp`. Imports only.

## Modak remaining art - Phase 2 candidates (approval pending)
Only 5 files were safe to size from CSS alone; 5 new files `ganesha-game3-new-opt`, `fj-flower-cream-opt`, `fj-flower-coral-opt`, `fj-tree-new-opt`, `fj-branch-new-opt` (.webp, q85, alpha kept) in `scenes/modak/assets/images/`. 0.325 MB -> 0.168 MB (saving only ~0.16 MB: these sources are already lossy WebP, so re-encoding gains little and adds a second generation of loss). Gate: 4/5 pass; `ganesha-game3-new` flagged (PSNR 36.9, edge 11.3 - soft edges). Page: docs/Modak-Art-Comparison.html. Nothing imported.
NOT prepared (display size depends on layout scales set in JS/CSS that I cannot read statically, and estimates show little to gain): bushes (display up to ~450 css px after the 140 % layout scale, so about native size already), marsh clump, mud plain, garland pieces, mooshika-turned, journey tokens. If you want these, the right method is measuring their rendered size in a live Flower Journey / Garland run first.

# Group 3 - About Me Hut (Phase 1, read-only), 16 October 2026
Method: import scan from the four live entries (`Familytreegame`, `Favoritefoodgame`, `ObstacleRemoverGame`, `MyIndianStoryGame`); old variants, `old-images/`, `FavoritefoodgameV1`, `DreamsWishesGame` and unused files ignored. Sizes are source bytes. Nothing changed.

## Headline
1. **`food-bg.png` (3.8 MB) is NOT loaded by the live app.** It is imported only by `FavoritefoodgameV1.jsx` and `DreamsWishesGame.jsx` (not live). The live Favourite Food scene uses `fav_background.webp` (29 KB). No action needed.
2. **The one big item is shared: `/images/ganesha-final-new.svg`, 1,567 KB (gzip about 966 KB), imported as a plain `<img>` by all four games** (`Familytreegame.jsx:46`, `Favoritefoodgame.jsx:31-32`, `ObstacleRemoverGame.jsx:43-44`, `MyIndianStoryGame.jsx:25`), and also pre-warmed when the hut zone is selected (`App.jsx:78`). It is hand-traced vector art drawn at about 200 px (Dreams `.ganesha-final` 200 px). The games use it as a plain image (no expression editing, unlike the `GaneshaCharacter` component, which I would not touch). Rasterised as lossy WebP with alpha (test render, not saved to the repo): **512 px = 17 KB, 800 px = 27 KB**. Estimated saving about **1.5 MB per hut scene's first load** (after first fetch it is cached). This changes vector to raster art, so it needs your visual approval.
3. Everything else in these scenes is already lossy WebP and modest.

## Real image weight per scene (source bytes, excluding the SVG and the shared sidebar icons)
| Scene | Images | MB | Largest items |
|---|---|---|---|
| Family Tree | 18 | 0.36 | family-kartikeya 86, family-shiva 59, family-parvati 55 KB (512 px, shown small) |
| Favourite Food | 42 | 0.60 | fav-peacock 49, fav-cow 43, fav-noodles 41, fav-mouse 37 KB; bg 29 KB lossy |
| Dreams / Obstacle Remover | 45 | 1.50 | `cloud.webp` 164 KB (1024 px, shown at about 128x90 px), wish-images flower 104, bush 102, plate 101, tree 83, wish-forest-4 75, butterfly 71, earth-happy 71 KB; bg 31 KB |
| My Indian Story | 43 | 0.65 | india-map 74 KB (1600 px), language icons 20-25 KB each; bg 29 KB |

## Ranked candidates (new files only; not started)
| Rank | Item | Now | Est. after | Est. saving | Note |
|---|---|---|---|---|---|
| 1 | `ganesha-final-new.svg` -> `ganesha-final-new-512.webp` (or 800) used by the 4 games + App.jsx preload | 1.57 MB per scene | 0.017-0.027 MB | about 1.5 MB per scene | vector to raster; you approve; no same-name overwrite |
| 2 | Dreams `cloud.webp` 164 KB at 128x90 px | 0.16 MB | about 0.01 MB | about 0.15 MB | tiny display size, 1024 px source |
| 3 | Dreams wish-images (flower/bush/plate/tree/butterfly ~0.46 MB, shown 190-300 px) | 0.46 MB | about 0.2 MB | about 0.25 MB | display sizes known for the 3 reveals; others to confirm |
| 4 | Family Tree / Food / Story sprites (512-1600 px shown small) | about 0.9 MB | about 0.35 MB | about 0.5 MB | needs measured sizes first |
| Total | | | | about 1.5 MB per scene (SVG) + about 0.9 MB scene art | estimates, not measured |

## Not loaded / ignore
`food-bg.png`, `food-bg1/2`, `old-images/*`, `FavoritefoodgameV1`, `DreamsWishesGame`, `Namebirthdaygame` (`name/` is a separate tester, not an About Me live entry; I did not audit it).

Next (after your OK): Phase 2 for rank 1 first (one page: SVG vs 512/800 WebP at display size on light and dark), then 2-4 with measured display sizes.

## About Me Hut - Ganesha SVG candidates (approval pending)
New files `public/images/ganesha-final-new-512.webp` (17 KB) and `ganesha-final-new-800.webp` (27 KB), q85, alpha kept, rendered from the SVG; the SVG is untouched and still used by `GaneshaCharacter`. Gate vs the SVG rendered at 200/400/540 px: both flagged on alpha-edge (512: edge 13.7, SSIM 0.989, PSNR 38.5; 800: edge 11.3, SSIM 0.994, PSNR 41.0) - the thin outlines are anti-aliased differently from vector rendering. Page: docs/AboutMeHut-Ganesha-Comparison.html. Nothing imported. Would change 4 import lines (+ `App.jsx:78` preload).

Decision (Madhurima, 2026-10-16): Modak other-art candidates (5 files, 0.16 MB) skipped, not worth the risk; Modak CLOSED (emotion sprites approved and committed). Ganesha SVG/WebP for About Me Hut: NEITHER (GaneshaCharacter injects the SVG and animates blink/mouth); the two ganesha-final-new-{512,800}.webp files stay unused.

## About Me Hut - measured sizes (Madhurima's run, Dreams opening only, 1024 stage) and cloud candidate
Rendered: `cloud.webp` 116x82 px (source 1024 px, 164 KB); header icons 52 px (256 px source, small); `replay-icon.png` 24 px (256 px, 21 KB, shared by VOReplayButton: converting saves only about 15 KB and the 128 px test failed the gate, so dropped); background 1024 px wide (2048 source, 31 KB, fine). The wish images were not reached in that run, so their sizes are still unmeasured.
New file `src/zones/about-me-hut/enjoy/assets/images/cloud-opt.webp` (420 px, 14 KB, saves about 150 KB; SSIM 0.982, PSNR 39.3, edge 2.8: passes). Page: docs/AboutMeHut-Cloud-Comparison.html. Not imported. Import to change after approval: `ObstacleRemoverGame.jsx:89`.

## Dreams reveal images (sizes read from code, not measured live; approval pending)
The runtime recorder only caught the opening screen twice, so I used the inline sizes in `ObstacleRemoverGame.jsx` (flower 190 px, bush 210 px, tree 300 px). New files in `enjoy/assets/images/wish-images/`: `flower-opt.webp` 104 -> 27 KB (flagged: PSNR 37.9, edge 5.3), `bush-opt.webp` 102 -> 34 KB (ok), `tree-opt.webp` 83 -> 49 KB (ok). With the cloud: 0.45 MB -> 0.12 MB (saving about 0.33 MB). Combined page: docs/AboutMeHut-Cloud-Comparison.html (flagged first). Imports to change after approval: `ObstacleRemoverGame.jsx` lines 76-78, 89. Other wish images, Family Tree and Food sprites are unmeasured and not prepared.
