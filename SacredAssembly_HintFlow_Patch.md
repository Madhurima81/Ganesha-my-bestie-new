# Sacred Assembly — Hint Flow Patch

**Scope:** Update card VO + hint VO + correct VO + glow escalation + remove pointer
**Files touched:** 3 (voice script config, scene file, CSS)
**Lines that touch existing code:** flagged with `// CHANGED` or `// REMOVED`
**New lines:** flagged with `// NEW`

---

## PART 1 — Voice Script Config

**File:** `lib/config/content/voiceGuidance/symbol-mountain/final-scene.js`
*(or wherever `getVoiceScript('symbol-mountain', 'final-scene', key)` reads from — your existing card VOs live here)*

### 1A. Shorten the 8 card VOs (replace existing text)

```js
// CHANGED — shortened from full sentences to single-word naming
cardEyes:     { text: "Eyes." },
cardEars:     { text: "Ears." },
cardTrunk:    { text: "Trunk." },
cardTusk:     { text: "Tusk." },
cardModak:    { text: "Modak." },
cardLotus:    { text: "Lotus." },
cardBelly:    { text: "Belly." },
cardMooshika: { text: "Mooshika." },
```

### 1B. Add 8 NEW hint VOs (affirmations from earlier scenes)

```js
// NEW — symbol-specific hint affirmations, fired at 18s idle
// 6 of these reuse affirmations from Modak/Pond/Tusk scenes — same audio files can be referenced
hintEyes:     { text: "I notice the good." },
hintEars:     { text: "I listen with care." },
hintTrunk:    { text: "I clear my path." },        // NEW recording needed
hintTusk:     { text: "I finish what I start." },
hintModak:    { text: "I share with joy." },
hintLotus:    { text: "I stay calm." },             // NEW recording needed
hintBelly:    { text: "I feel safe inside." },
hintMooshika: { text: "I can focus." },
```

### 1C. Update the 4 correct VOs (replace existing text)

```js
// CHANGED — shortened to reverent bestie tone for sacred finale
correctYes:        { text: "Yes." },
correctThatsRight: { text: "Beautiful." },
correctYouFoundIt: { text: "You remember." },
correctWellDone:   { text: "Perfect." },
```

### 1D. Remove the now-unused idle key

```js
// REMOVED — replaced by symbol-specific hintXxx keys above
// idleLookCarefully: { text: "Look carefully..." },
```

---

## PART 2 — SacredAssemblySceneV8.jsx

### 2A. Add HINT_VO_MAP (next to existing CARD_VO_MAP, around line 482)

Insert immediately after the `CARD_VO_MAP` block (between line 481 and 482):

```jsx
  // NEW — maps each symbol to its hint VO key for 18s idle escalation
  const HINT_VO_MAP = useMemo(() => ({
    eyes: 'hintEyes',
    ears: 'hintEars',
    trunk: 'hintTrunk',
    tusk: 'hintTusk',
    modak: 'hintModak',
    lotus: 'hintLotus',
    belly: 'hintBelly',
    mooshika: 'hintMooshika'
  }), []);
```

### 2B. Replace the existing hintTimer block (lines 640–653)

**Find this existing block:**

```jsx
    // Idle hint — 10s of no tap → one visual blink + VO
    const hintTimer = setTimeout(() => {
      if (!idleNudgePlayedRef.current) {
        playSceneVoice('idleLookCarefully', null, { replayOnReturn: false });
        idleNudgePlayedRef.current = true;
      }
      setZoneStates(prev => {
        if (prev[correctZone] === 'idle') return { ...prev, [correctZone]: 'hint' };
        return prev;
      });
      setTimeout(() => {
        setZoneStates(prev => (prev[correctZone] === 'hint' ? { ...prev, [correctZone]: 'idle' } : prev));
      }, 700);
    }, 10000);
```

**Replace with:**

```jsx
    // CHANGED — 3-level idle hint escalation (10s pulse, 18s glow + affirmation, 26s steady)
    // Glow PERSISTS until child taps (cleared in handleZoneClick or on new symbol)
    // Level 1 @ 10s: very subtle golden breath on correct zone
    const hintLevel1Timer = setTimeout(() => {
      setZoneStates(prev => {
        if (prev[correctZone] === 'idle') return { ...prev, [correctZone]: 'hint-1' };
        return prev;
      });
    }, 10000);

    // Level 2 @ 18s: warmer glow + symbol-specific affirmation VO
    const hintLevel2Timer = setTimeout(() => {
      setZoneStates(prev => {
        if (prev[correctZone] === 'hint-1' || prev[correctZone] === 'idle') {
          return { ...prev, [correctZone]: 'hint-2' };
        }
        return prev;
      });
      if (!idleNudgePlayedRef.current) {
        const hintVoKey = HINT_VO_MAP[currentSymbol.id];
        if (hintVoKey) {
          playSceneVoice(hintVoKey, null, { replayOnReturn: false });
          idleNudgePlayedRef.current = true;
        }
      }
    }, 18000);

    // Level 3 @ 26s: steady warm glow, never harsh
    const hintLevel3Timer = setTimeout(() => {
      setZoneStates(prev => {
        if (prev[correctZone] === 'hint-2' || prev[correctZone] === 'hint-1' || prev[correctZone] === 'idle') {
          return { ...prev, [correctZone]: 'hint-3' };
        }
        return prev;
      });
    }, 26000);
```

### 2C. Update the cleanup return (lines 655–658)

**Find:**

```jsx
    return () => {
      clearTimeout(cardVoTimer);
      clearTimeout(hintTimer);
    };
```

**Replace with:**

```jsx
    return () => {
      clearTimeout(cardVoTimer);
      clearTimeout(hintLevel1Timer);    // CHANGED
      clearTimeout(hintLevel2Timer);    // NEW
      clearTimeout(hintLevel3Timer);    // NEW
    };
```

### 2D. Update useEffect dependency array (line 659)

**Find:**

```jsx
  }, [cardPhase, sceneState?.currentAssociationSymbol]);
```

**Replace with:**

```jsx
  }, [cardPhase, sceneState?.currentAssociationSymbol, HINT_VO_MAP]); // CHANGED — added HINT_VO_MAP
```

### 2E. Clear hint glows on any tap — add to handleZoneClick (after line 875)

**Find:**

```jsx
  const handleZoneClick = (zoneId) => {
    if (!sceneState || !sceneActions) return;
    if (cardPhase !== 'play') return;

    const currentSymbol = SACRED_SYMBOLS.find(s => s.id === sceneState.currentAssociationSymbol);
```

**Replace with:**

```jsx
  const handleZoneClick = (zoneId) => {
    if (!sceneState || !sceneActions) return;
    if (cardPhase !== 'play') return;

    // NEW — clear any active hint glow on any zone when child taps anywhere
    setZoneStates(prev => {
      const next = { ...prev };
      let changed = false;
      Object.keys(next).forEach(z => {
        if (typeof next[z] === 'string' && next[z].startsWith('hint-')) {
          next[z] = 'idle';
          changed = true;
        }
      });
      return changed ? next : prev;
    });

    const currentSymbol = SACRED_SYMBOLS.find(s => s.id === sceneState.currentAssociationSymbol);
```

### 2F. Update hint overlay rendering — REMOVE pointer, support 3 levels (lines 1374–1394)

**Find:**

```jsx
              {/* Hint glow + tap pointer — pure divs on top, never touches SVG */}
              {Object.entries(zoneStates).map(([zoneId, state]) => {
                if (state !== 'hint') return null;
                const pos = ZONE_HINT_POSITIONS[zoneId];
                if (!pos) return null;
                return (
                  <React.Fragment key={`hint-${zoneId}`}>
                    <div
                      className="zone-hint-overlay"
                      style={{ top: pos.top, left: pos.left }}
                    />
                    <div
                      className="zone-hint-pointer"
                      style={{ top: pos.top, left: pos.left }}
                      aria-hidden="true"
                    >
                      👆
                    </div>
                  </React.Fragment>
                );
              })}
```

**Replace with:**

```jsx
              {/* CHANGED — soft ambient glow only, no pointer; 3 intensity levels */}
              {Object.entries(zoneStates).map(([zoneId, state]) => {
                if (typeof state !== 'string' || !state.startsWith('hint-')) return null;
                const pos = ZONE_HINT_POSITIONS[zoneId];
                if (!pos) return null;
                return (
                  <div
                    key={`hint-${zoneId}`}
                    className="zone-hint-overlay"
                    data-hint-level={state}
                    style={{ top: pos.top, left: pos.left }}
                  />
                );
              })}
```

---

## PART 3 — SacredAssemblyScene.css

### 3A. Replace existing `.zone-hint-overlay` and remove `.zone-hint-pointer`

**Find existing `.zone-hint-overlay` and `.zone-hint-pointer` rules** (whatever they currently are) and **replace with:**

```css
/* CHANGED — soft ambient golden glow, 3 intensity levels, no pointer */
.zone-hint-overlay {
  position: absolute;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  animation: gentleBreath 2.4s ease-in-out infinite;
  z-index: 5;
}

/* Level 1 @ 10s — barely-there pulse */
.zone-hint-overlay[data-hint-level="hint-1"] {
  background: radial-gradient(circle,
    rgba(255, 215, 0, 0.18) 0%,
    rgba(255, 215, 0, 0.07) 45%,
    transparent 72%);
  opacity: 0.55;
}

/* Level 2 @ 18s — warm glow paired with affirmation VO */
.zone-hint-overlay[data-hint-level="hint-2"] {
  background: radial-gradient(circle,
    rgba(255, 215, 0, 0.30) 0%,
    rgba(255, 215, 0, 0.13) 45%,
    transparent 72%);
  opacity: 0.85;
}

/* Level 3 @ 26s — steady warm glow, sacred not shouty */
.zone-hint-overlay[data-hint-level="hint-3"] {
  background: radial-gradient(circle,
    rgba(255, 215, 0, 0.42) 0%,
    rgba(255, 215, 0, 0.20) 45%,
    transparent 75%);
  opacity: 1;
  animation: gentleBreath 1.9s ease-in-out infinite;
}

@keyframes gentleBreath {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50%      { transform: translate(-50%, -50%) scale(1.1); }
}

/* REMOVED — .zone-hint-pointer is no longer rendered */
```

---

## VERIFICATION CHECKLIST

After applying, test these scenarios:

| Test | Expected behavior |
|---|---|
| Card flips and lands | At T+2.5s: hear "Lotus." (single word), card text visible |
| Tap correct zone within 10s | Hear "Yes." or "Beautiful." or "You remember." or "Perfect." (rotating) |
| Idle for 10s | Right hand starts very subtle golden breath |
| Idle for 18s | Glow warms up + hear "I stay calm." |
| Idle for 26s | Glow becomes steady, brighter (still soft) |
| Tap any zone after hint glow appears | All hint glows clear instantly |
| Tap wrong zone | Wiggle + "Try again!" — hint timer keeps running on correct zone |
| New symbol appears | All hint timers reset, idleNudgePlayedRef resets |
| Whole scene complete | Final VO plays as before (untouched) |

---

## AUDIO PRODUCTION SUMMARY

**To re-record (8):** all card VOs as single words ("Eyes." / "Ears." / etc.)
**To record new (2):** `hintTrunk` ("I clear my path.") and `hintLotus` ("I stay calm.")
**To re-record (4):** correct VOs ("Yes." / "Beautiful." / "You remember." / "Perfect.")
**To reuse from earlier scenes (6):** hintEyes, hintEars, hintTusk, hintModak, hintBelly, hintMooshika — these affirmations already exist as MP3s in Modak Scene, Pond Scene, Tusk Scene. Point the new hint keys at those same audio paths.

**Total new recording session: 14 lines.** All very short (1–4 words each except the 2 hints which are 4 words).

---

## WHAT'S NOT TOUCHED

These existing systems are preserved exactly as-is:
- `currentAssociationSymbol` flow & symbol rotation
- `SACRED_SYMBOLS` data (only correct zones unchanged)
- `ZONE_HINT_POSITIONS` (still used, just rendered without pointer)
- `handleCorrectPlacement` and `handleWrongPlacement`
- Card flip animation (`MagicalCardFlip`)
- Final completion VO and celebration
- Onboarding modal VO
- All zone state values OTHER than `hint` → now `hint-1`, `hint-2`, `hint-3`
- `idleNudgePlayedRef` is reused (still gates one VO per symbol)
