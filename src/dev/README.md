# game-test.html — standalone Shloka River game harness

Mount any one of the 8 Shloka River games with **no main app**. Separate Vite
entry (`game-test.html` → `src/dev/gameTestMain.jsx`) that skips App.jsx, the
loading screen, profile init, PWA, analytics, Sentry, Supabase and the scene
registry — compiles in ~1s instead of ~18s.

```
npm run dev
# then open:
http://localhost:5173/game-test.html?game=vakratunda
```

Or click the **🧪 Game Test** pill on the map screen (dev builds only).
`game-test.html` is not in the production rollup input, so it never ships.

Games: `vakratunda`, `mahakaya`, `suryakoti`, `samaprabha`,
`nirvighnam`, `kurumedeva`, `sarvakaryeshu`, `sarvada`.

## Audio: mock (default) vs real

Toolbar button toggles it:

- **🔇 mock audio** (default) — no sound; `mockVoiceGuidance.js` logs each call
  (`[mockVO] playVoice …`) and fires the `onEnded` callback after ~350ms so the
  game still advances. Read the console to see the VO sequence.
- **🔊 real audio (TTS)** — matches how the real scenes sound:
  - guidance lines (`scene11_surya_intro`, `nirv_done`, …) → **Web Speech / TTS**,
    using the per-scene line maps copied into `webSpeechScripts.js`
  - syllables (`/audio/syllables/<word>-<syl>.mp3`) + full words
    (`/audio/words/<word>.mp3`) → real prerecorded MP3s via `useVoiceGuidance`
  - the scene's intro line is spoken on mount/remount (the parent scene normally
    does this; several game components don't trigger their own)

## What's mocked

The games consume **no** app providers directly — everything is props from the
scene wrapper. So the harness only supplies:

- `voiceGuidance` — fake `{ playVoice, playSfx, playSyllable, playWord, stopVoice }`
  from `mockVoiceGuidance.js`. `playVoice/playSyllable/playWord` fire their
  `onEnded` callback after ~350ms so phase transitions still advance; no real audio.
- callback props (`onMicroWin`, `onPhaseComplete`, `onGameComplete`, …) — log to
  console and flash the toolbar banner.

Toolbar toggles: `isActive`, `isPaused`, `hideElements`, `⟳ remount`.

## Annotate instead of screenshot

Click **✎ annotate**, pick a tool (pin / circle / arrow), mark the running game,
type comments in the right panel, then **💾 save**.

`viteAnnotationsPlugin.js` (dev server only) writes:

```
src/dev/annotations/<game>-<timestamp>.json
src/dev/annotations/latest.json
```

Each item stores coords as 0..1 fractions of the stage box, plus — for pins and
circles — a description of the DOM element underneath (tag, class, text, alt/src,
ancestor path, rect). Tell Claude Code "check the annotations" and it reads
`latest.json`. The folder is gitignored.
