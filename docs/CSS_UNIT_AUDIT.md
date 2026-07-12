# CSS Unit Audit — vw/vh, Fixed-px, Media Queries

Scope: live files only, in the order given in `final-app-components-corrected.md`. Zones covered: Symbol Mountain, Shloka River, About Me Hut. Cave of Secrets and Festival Square skipped per instruction.

**Checks run per file:**
1. `vw|vh` count
2. Fixed-px hits on layout properties — `grep -nE "(width|height|top|left|bottom|right):\s*[0-9]{3,}px"` (excluding `@media (max-width: ...)` breakpoint declarations, which are not layout hits)
3. `@media` count

**Verdict rule:**
- **Bucket 1** = full-screen stage/scene file with fixed-px hits > 0 → needs conversion to % of its container
- **Bucket 2** = chrome (modal/sidebar/popup/button, self-sized, not stage-container-relative) OR a stage file with 0 fixed-px hits → no action needed

No files have been modified. This is an audit only.

---

## 1. App Flow

| Section | File | vw/vh | Fixed-px | Media | Verdict |
|---|---|---|---|---|---|
| Loading | `App.jsx` (inline, no dedicated CSS file) | — | — | — | N/A |
| Main opening | [MainWelcomeScreen.css](../src/lib/components/navigation/MainWelcomeScreen.css) | 7 | 0 | 3 | Bucket 2 — already clean |
| Profile create / select | [CleanProfileSelector.css](../src/lib/components/navigation/CleanProfileSelector.css) | 118 | 15 | 6 | **Bucket 1** |
| Profile welcome | [CleanGameWelcomeScreen.css](../src/lib/components/navigation/CleanGameWelcomeScreen.css) | 55 | 38 | 16 | **Bucket 1** |
| Intro story | [GaneshaIntroStory.css](../src/components/GaneshaIntroStory.css) | 11 | 0 | 1 | Bucket 2 — already clean |
| Map | [CleanMapZone.css](../src/pages/CleanMapZone.css) | 26 | 7 | 4 | **Bucket 1** |
| Zone welcome | [ZoneWelcome.css](../src/lib/components/zone/ZoneWelcome.css) | 62 | 3 | 4 | **Bucket 1 (minor)** |
| Parent dashboard | [ParentDashboard.css](../src/lib/components/navigation/ParentDashboard.css) | 0 | 0 | 14 | Bucket 2 — already clean |
| Daily dare popup | [DailyDarePopup.css](../src/lib/components/twg/DailyDarePopup.css) | 1 | 1 | 0 | Bucket 2 (chrome popup) |
| TWG hub | [TimeWithGaneshaHub.css](../src/lib/components/twg/TimeWithGaneshaHub.css) | 27 | 5 | 1 | Bucket 2 (chrome/hub overlay) |

---

## 2. Shared Components

| Component | File | vw/vh | Fixed-px | Media | Verdict |
|---|---|---|---|---|---|
| `OpeningModal` | [OpeningModal.css](../src/zones/shared/components/OpeningModal.css) | 12 | 13 | 4 | Bucket 2 (chrome) |
| `SceneCompletionCelebration` | [SceneCompletionCelebration.css](../src/lib/components/celebration/SceneCompletionCelebration.css) | 9 | 22 | 4 | Bucket 2 (chrome) |
| `SymbolAutoReveal` | [SymbolAutoReveal.css](../src/lib/components/reveal/SymbolAutoReveal.css) | 0 | 21 | 3 | Bucket 2 (chrome) |
| `InnerMandala` | [InnerMandala.css](../src/lib/components/celebration/InnerMandala.css) | 0 | 0 | 3 | Bucket 2 — already clean |
| `ProgressPopup` | [ProgressPopup.css](../src/lib/components/navigation/ProgressPopup.css) | 7 | 4 | 1 | Bucket 2 (chrome) |
| `AppSidebar` | [AppSidebar.css](../src/zones/shloka-river/shared/AppSidebar.css) | 18 | 7 | 6 | Bucket 2 (chrome) |
| `SanskritVoiceRecorder` | [SanskritVoiceRecorder.css](../src/lib/components/audio/SanskritVoiceRecorder.css) | 47 | 1 | 1 | Bucket 2 (chrome) |
| `SymbolSidebar` (Symbol Mountain) | [SymbolSidebar.css](../src/zones/symbol-mountain/shared/components/SymbolSidebar.css) | 0 | 3 | 4 | Bucket 2 (chrome) |
| `SymbolCardModal` | [SymbolCardModal.css](../src/zones/symbol-mountain/shared/components/SymbolCardModal.css) | 23 | 1 | 4 | Bucket 2 (chrome) |
| `SymbolSidebar` (Meaning Cave — zone out of scope, listed for completeness) | [SymbolSidebar.css](<../src/zones/meaning cave/components/SymbolSidebar.css>) | 6 | 4 | 4 | Bucket 2 (chrome) |

---

## 3. Clean Welcome Popup

Both files already covered above (`ProgressPopup` in §2, `CleanGameWelcomeScreen` in §1) — no separate entries needed.

---

## 4. Map Zones

Not a CSS audit target (config data, not a rendered stage) — skipped.

---

## 5. Zone-Wise Final Scenes

### Symbol Mountain

| Scene ID | Scene file | CSS file | vw/vh | Fixed-px | Media | Verdict |
|---|---|---|---|---|---|---|
| `modak` | [NewModakSceneV7.jsx](../src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx) | [ModakScene.css](../src/zones/symbol-mountain/scenes/modak/ModakScene.css) | 14 | 80 | 16 | **Bucket 1** |
| `pond` | [PondSceneSimplifiedV4.jsx](../src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx) | [PondScene.css](../src/zones/symbol-mountain/scenes/pond/PondScene.css) | 18 | 23 | 11 | **Bucket 1** |
| `symbol` | [SymbolMountainSceneV3.jsx](../src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx) | [SymbolMountainScene.css](../src/zones/symbol-mountain/scenes/tusk/SymbolMountainScene.css) | 8 | 27 | 9 | **Bucket 1** |
| `final-scene` | [SacredAssemblySceneV8.jsx](<../src/zones/symbol-mountain/scenes/final scene/SacredAssemblySceneV8.jsx>) | [SacredAssemblyScene.css](<../src/zones/symbol-mountain/scenes/final scene/SacredAssemblyScene.css>) | 5 | 43 | 8 | **Bucket 1** |

### Shloka River

| Scene ID | Scene file | CSS file | vw/vh | Fixed-px | Media | Verdict |
|---|---|---|---|---|---|---|
| `vakratunda-grove` | [VakratundaGroveSimplified.jsx](../src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx) | [VakratundaGroveSimplified.css](../src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.css) | 34 | 34 | 12 | **Bucket 1** |
| `suryakoti-bank` | [SuryakotiBankSimplified.jsx](../src/zones/shloka-river/scenes/Scene2/SuryakotiBankSimplified.jsx) | [SuryakotiBankSimplified.css](../src/zones/shloka-river/scenes/Scene2/SuryakotiBankSimplified.css) | 4 | 0 | 0 | Bucket 2 — already clean |
| `nirvighnam-chant` | [NirvighnamChantSimplified.jsx](../src/zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx) | [NirvighnamChantSimplified.css](../src/zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.css) | 4 | 0 | 0 | Bucket 2 — already clean |
| `sarvakaryeshu-chant` | [SarvakaryeshuChantSimplified.jsx](../src/zones/shloka-river/scenes/scene4/SarvakaryeshuChantSimplified.jsx) | [SarvakaryeshuChantSimplified.css](../src/zones/shloka-river/scenes/scene4/SarvakaryeshuChantSimplified.css) | 4 | 0 | 0 | Bucket 2 — already clean |
| `shloka-river-finale` | [ShlokaRiverFinale.jsx](../src/zones/shloka-river/scenes/scene5/ShlokaRiverFinale.jsx) | [ShlokaRiverFinale.css](../src/zones/shloka-river/scenes/scene5/ShlokaRiverFinale.css) | 30 | 2 | 2 | **Bucket 1 (minor)** |

### About Me Hut

| Scene ID | Scene file | CSS file | vw/vh | Fixed-px | Media | Verdict |
|---|---|---|---|---|---|---|
| `family-tree` | [Familytreegame.jsx](../src/zones/about-me-hut/family-tree/Familytreegame.jsx) | [Familytreegame.css](../src/zones/about-me-hut/family-tree/Familytreegame.css) | 125 | 52 | 7 | **Bucket 1** |
| `favorite-food` | [Favoritefoodgame.jsx](../src/zones/about-me-hut/food/Favoritefoodgame.jsx) | [Favoritefoodgame.css](../src/zones/about-me-hut/food/Favoritefoodgame.css) | 93 | 81 | 5 | **Bucket 1** |
| `dreams-wishes` | [ObstacleRemoverGame.jsx](../src/zones/about-me-hut/enjoy/ObstacleRemoverGame.jsx) | [DreamsWishesGame.css](../src/zones/about-me-hut/enjoy/DreamsWishesGame.css) | 85 | 63 | 8 | **Bucket 1** |
| `my-indian-story` | [MyIndianStoryGame.jsx](../src/zones/about-me-hut/indian-story/MyIndianStoryGame.jsx) | [MyIndianStoryGame.css](../src/zones/about-me-hut/indian-story/MyIndianStoryGame.css) | 15 | 11 | 5 | **Bucket 1** |

> Note: `dreams-wishes` scene file is named `ObstacleRemoverGame.jsx` but imports `DreamsWishesGame.css` — the similarly-named `ObstacleRemoverGame.css` in the same folder is dead/unused.

---

## 6. Shloka River Sidebar Correction

Already covered — `AppSidebar.css` is audited in §2 (Shared Components). Bucket 2.

---

## 7. Sanskrit Recorder

Already covered — `SanskritVoiceRecorder.css` is audited in §2 (Shared Components). Bucket 2.

---

## Summary

**Bucket 1 — needs conversion to % of stage container (14 files):**
1. CleanProfileSelector.css
2. CleanGameWelcomeScreen.css
3. CleanMapZone.css
4. ZoneWelcome.css (minor)
5. ModakScene.css
6. PondScene.css
7. SymbolMountainScene.css
8. SacredAssemblyScene.css
9. VakratundaGroveSimplified.css
10. ShlokaRiverFinale.css (minor)
11. Familytreegame.css
12. Favoritefoodgame.css
13. DreamsWishesGame.css
14. MyIndianStoryGame.css

**Bucket 2 — no action needed:** everything else audited (App Flow: MainWelcomeScreen, GaneshaIntroStory, ParentDashboard, DailyDarePopup, TimeWithGaneshaHub; all 10 Shared Components; Shloka River's SuryakotiBankSimplified/NirvighnamChantSimplified/SarvakaryeshuChantSimplified).

**Known dead/duplicate files spotted along the way (not part of this audit, flagged only):** `ModakScene copy.css`, `Familytreegame copy.css`, `SacredAssemblyScene original.css` / `drag and drop.css` / `-ORIGINAL-BACKUP.css`, `VakratundaGrove.css` (superseded by Simplified), `VakratundaGroveSimplified.backup_*.css`, `ObstacleRemoverGame.css` (unused — real file is DreamsWishesGame.css), `SceneCompletionCelebration.css` duplicate under `symbol-mountain/scenes/modak/`.
