# Voiceover script sheet

- `script.csv` — every spoken line, one row per unique line per zone (352 rows). Columns: file_name, zone, scene, type, exact_text, notes.
  `type` is auto-guessed from wording/key (instruction / feedback / story / shloka) — skim it before recording.
- `generate_script.py` — rebuilds `script.csv` and `src/lib/config/content/voClipMap.generated.js` (line -> file name).
- `build-manifest.mjs` — run after adding mp3s to `public/audio/`: writes `public/audio/vo-manifest.json` (which clips exist).
- `wiring.diff` — proposed wiring, NOT applied. Apply with `patch -p1 --dir=. < voiceover/wiring.diff` after review (paths are `a/`/`b/` rooted at repo, use `-p1`).
- Helper: `src/lib/audio/voClip.js` (no TTS, no placeholder audio; missing clip = returns null = caller behaves as today).

File naming: `<zone>-<scene>-NN.mp3` (hut, mountain, river, cave, festival); shloka-type lines use `<zone>-shloka-NN.mp3`. Drop files in `public/audio/`.

## Scope notes
- Cave of Secrets (obsolete) rows are tagged in notes; Festival Square (parked) has NO spoken text in code (its games only arm idle timers), so it has no rows.
- Name/Birthday game is not in sceneRegistry.js (not one of the 4 live Hut scenes) — not audited.
- Home, zone welcome, TalkToGanesha, ProgressPopup, intro story lines are outside the zone scenes — not audited.
- Extraction is static (string literals + scene voice constants). Lines assembled at runtime appear as DYNAMIC rows.
