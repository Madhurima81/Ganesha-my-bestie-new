# CleanMapZone — Pending Code Changes

All edits go into **`CleanMapZone.jsx`** and **`CleanMapZone.css`** unless noted.
The coming-soon state and new unlock rules from the previous diff are already shipped — this doc covers everything still pending.

---

## Batch 2 — First-Time Experience

### 2.1 — Rewrite Symbol Mountain unlock VO line (directive, not descriptive)

**File:** `CleanMapZone.jsx`
**Find:**
```js
[ZONE_IDS.SYMBOL]: 'Look! Symbol Mountain is ready to explore!',
```
**Replace with:**
```js
[ZONE_IDS.SYMBOL]: "Tap Symbol Mountain — that's where we start!",
```

---

### 2.2 — Detect first-time map load + idle nudge

**File:** `CleanMapZone.jsx`
**Add near other refs at top of component (around line 421):**
```js
const isFirstTimeLoadRef = useRef(false);
const idleNudgeTimerRef = useRef(null);
const hasTappedRef = useRef(false);
```

**Inside the existing `prevZoneStatesRef.current = nextStates` block (around line 578-589), replace this block:**
```js
if (!prevZoneStatesRef.current) {
  prevZoneStatesRef.current = nextStates;

  const isBrandNewJourney = (zoneProgress[ZONE_IDS.SYMBOL]?.completedScenes || 0) === 0
    && Object.entries(zoneProgress).every(
      ([zoneId, p]) => zoneId === ZONE_IDS.SYMBOL || (p?.completedScenes || 0) === 0
    );
  if (isBrandNewJourney && !hasSeenZoneUnlockVo(ZONE_IDS.SYMBOL)) {
    speakMapVoEvents([{ text: MAP_ZONE_UNLOCK_VO[ZONE_IDS.SYMBOL], delay: 300 }]);
    markZoneUnlockVoSeen(ZONE_IDS.SYMBOL);
  }
  return;
}
```
**With:**
```js
if (!prevZoneStatesRef.current) {
  prevZoneStatesRef.current = nextStates;

  const isBrandNewJourney = (zoneProgress[ZONE_IDS.SYMBOL]?.completedScenes || 0) === 0
    && Object.entries(zoneProgress).every(
      ([zoneId, p]) => zoneId === ZONE_IDS.SYMBOL || (p?.completedScenes || 0) === 0
    );

  isFirstTimeLoadRef.current = isBrandNewJourney;

  if (isBrandNewJourney && !hasSeenZoneUnlockVo(ZONE_IDS.SYMBOL)) {
    speakMapVoEvents([{ text: MAP_ZONE_UNLOCK_VO[ZONE_IDS.SYMBOL], delay: 300 }]);
    markZoneUnlockVoSeen(ZONE_IDS.SYMBOL);

    // Idle nudge: if no tap after 7s, gently re-prompt
    idleNudgeTimerRef.current = setTimeout(() => {
      if (!hasTappedRef.current) {
        speakMapVoEvents([{
          text: 'Tap Symbol Mountain whenever you are ready!',
          delay: 0
        }]);
      }
    }, 7000);
  }
  return;
}
```

**Add cleanup in the existing unmount effect (find `voiceTimersRef.current.forEach(clearTimeout);` around line 483):**
```js
return () => {
  voiceTimersRef.current.forEach(clearTimeout);
  if (idleNudgeTimerRef.current) clearTimeout(idleNudgeTimerRef.current);
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};
```

---

### 2.3 — Symbol Mountain first-tap shortcut + locked tap response + idle clear

**File:** `CleanMapZone.jsx`
**Replace the entire `handleZoneClick` function with:**
```js
const handleZoneClick = (zone, state) => {
  // Clear idle nudge on any tap
  hasTappedRef.current = true;
  if (idleNudgeTimerRef.current) {
    clearTimeout(idleNudgeTimerRef.current);
    idleNudgeTimerRef.current = null;
  }

  // Coming-soon: friendly Mushika pop + VO, no navigation
  if (state === 'coming-soon') {
    if (mushikaPop) return;
    setMushikaPop({ zone, state, headshake: true });
    speakMapVoEvents([{
      text: `${zone.name.replace('\n', ' ')} is coming soon! We'll explore it together.`,
      delay: 200
    }]);
    mushikaTimerRef.current = setTimeout(() => {
      setMushikaPop(null);
    }, 1800);
    return;
  }

  // Locked: friendly Mushika headshake + redirect VO
  if (state === 'locked') {
    if (mushikaPop) return;
    setMushikaPop({ zone, state, headshake: true });
    speakMapVoEvents([{
      text: "Not yet! Let's start with Symbol Mountain.",
      delay: 200
    }]);
    mushikaTimerRef.current = setTimeout(() => {
      setMushikaPop(null);
    }, 1800);
    return;
  }

  if (state === 'unlocking') return;
  if (mushikaPop) return; // already mid-animation — block double-tap

  // First-ever Symbol Mountain tap: skip Mushika pop, skip zone welcome, go straight to modak
  const isFirstSymbolTap =
    zone.id === ZONE_IDS.SYMBOL &&
    isFirstTimeLoadRef.current &&
    !hasSeenMushikaPop(zone.id);

  if (isFirstSymbolTap) {
    markMushikaPopSeen(zone.id); // mark so future taps follow normal flow
    navigateToZone(zone, state);
    return;
  }

  // Show only first time per zone (scoped by active profile).
  if (hasSeenMushikaPop(zone.id)) {
    navigateToZone(zone, state);
    return;
  }

  markMushikaPopSeen(zone.id);

  // Show Mushika pop, then navigate after 1.4s
  setMushikaPop({ zone, state });
  mushikaTimerRef.current = setTimeout(() => {
    setMushikaPop(null);
    navigateToZone(zone, state);
  }, 1400);
};
```

---

### 2.4 — First-time pulse + hint text on Symbol Mountain

**File:** `CleanMapZone.jsx`
**In the zone render loop (around line 815), add this line near the top of the `.map` callback:**
```js
const isFirstTimeSymbol =
  isFirstTimeLoadRef.current &&
  zone.id === ZONE_IDS.SYMBOL &&
  baseState === 'active';
```

**Update the tap area `className` to include the first-time class:**
```jsx
<div
  className={`${layout.zoneClass} zone-state-${state} ${unlockClass} ${isSymbolMountainZone ? 'symbol-mountain-door' : ''} ${isFirstTimeSymbol ? 'zone-state-first-time' : ''}`.trim()}
  onClick={() => handleZoneClick(zone, state)}
  aria-disabled={isDisabled}
>
```

**Inside the label div (after the zone name `<span>`s, before the unlock-note), add:**
```jsx
{isFirstTimeSymbol && (
  <div className="first-time-hint">Tap to start!</div>
)}
```

---

### 2.5 — Append CSS for first-time state

**File:** `CleanMapZone.css`
**Append to end:**
```css
/* ── FIRST-TIME ACTIVE ────────────────────────────
   Symbol Mountain on very first map load — extra invitation.
   Gentle breathing scale + brightness lift to draw the eye.
──────────────────────────────────────────────── */
.zone.zone-state-first-time {
  animation: firstTimeBreathing 2.2s ease-in-out infinite;
}

@keyframes firstTimeBreathing {
  0%, 100% { transform: scale(1);    filter: brightness(1); }
  50%      { transform: scale(1.04); filter: brightness(1.08); }
}

.first-time-hint {
  display: block;
  margin-top: 4px;
  font-family: 'Baloo 2', cursive;
  font-weight: 600;
  font-size: clamp(11px, 1vw, 14px);
  color: #FF5722;
  animation: hintFade 2s ease-in-out infinite;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
}

@keyframes hintFade {
  0%, 100% { opacity: 0.7; }
  50%      { opacity: 1; }
}
```

---

### 2.6 — Symbol-only direct-to-scene; other zones open welcome screen

**File:** `CleanMapZone.jsx`
**Replace the existing `navigateToZone` function with:**
```js
const navigateToZone = (zone, state) => {
  if (DEBUG_ALWAYS_OPEN_ZONE_WELCOME) {
    if (onZoneSelect) onZoneSelect(zone.id);
    return;
  }
  // Symbol Mountain: skip welcome, go straight to first scene (modak)
  // Reason: very first zone for the child — no narrative shift needed, faster time-to-fun
  if (state === 'active' && zone.id === ZONE_IDS.SYMBOL) {
    const firstScene = ZONE_FIRST_SCENES[zone.id];
    if (onZoneSelect) onZoneSelect(zone.id, firstScene);
    return;
  }
  // All other zones: open zone welcome screen
  // Reason: each new zone is a new world (river, hut, cave, festival).
  // Child needs a moment to orient before being dropped into a scene.
  if (onZoneSelect) onZoneSelect(zone.id);
};
```

> Note: `onZoneSelect(zoneId)` without a scene arg should already trigger the zone welcome / map screen in your upstream router. If it doesn't, this won't break anything — child just lands wherever your router defaults to for that zone.

---

## Batch 3 — Ganesha Walk + Unlock Sequencing

### 3.1 — Add `walking` pose to GaneshaPresence

**File:** `GaneshaPresence.jsx`
**Replace `POSE_EXPRESSION_MAP` with:**
```js
const POSE_EXPRESSION_MAP = {
  blessing: 'happy',
  pointing: 'encouraging',
  thumbs_up: 'happy',
  okay: 'happy',
  celebration: 'excited',
  walking: 'happy',
};
```

> Note: Your underlying `GaneshaCharacter` component must also support `pose="walking"`. If it doesn't, fall back to `pointing` during walks — the position transition alone still reads as movement. Check `GaneshaCharacter.jsx` to confirm.

---

### 3.2 — Add CSS transition + walking class on Ganesha wrapper

**File:** `CleanMapZone.css`
**Find the existing rule for the Ganesha map wrapper** (search for `mapGaneshaState.position` styling — it's the `<div>` at line 863 in the JSX with `style={mapGaneshaState.position}`). If there's no class on it yet, add one in the JSX (see 3.3 below) and append this CSS:

```css
/* ── GANESHA MAP WRAPPER ──────────────────────────
   Smooth walk between zone positions instead of teleport
──────────────────────────────────────────────── */
.map-ganesha-wrapper {
  position: absolute;
  transition: left 1.2s cubic-bezier(0.4, 0.0, 0.2, 1),
              top 1.2s cubic-bezier(0.4, 0.0, 0.2, 1),
              right 1.2s cubic-bezier(0.4, 0.0, 0.2, 1),
              bottom 1.2s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.map-ganesha-wrapper.is-walking {
  animation: ganeshaWalkBob 0.4s ease-in-out infinite;
}

@keyframes ganeshaWalkBob {
  0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
  50%      { transform: translate(-50%, -50%) translateY(-3px); }
}
```

> ⚠️ The bob animation overrides the inline `transform: translate(-50%, -50%)`. If your existing `mapGaneshaState.position` already contains `transform`, remove `transform` from the inline style and let CSS handle it (see 3.3).

---

### 3.3 — Wire walk state in CleanMapZone.jsx

**File:** `CleanMapZone.jsx`

**Add state + position-tracking ref near other refs (around line 421):**
```js
const [isGaneshaWalking, setIsGaneshaWalking] = useState(false);
const prevGaneshaPosRef = useRef(null);
const walkTimerRef = useRef(null);
```

**Add an effect just below `mapGaneshaState` is computed (around line 734, after `const mapGaneshaState = getMapGaneshaState(...)`):**
```js
useEffect(() => {
  const newPos = JSON.stringify(mapGaneshaState.position);
  if (prevGaneshaPosRef.current && prevGaneshaPosRef.current !== newPos) {
    setIsGaneshaWalking(true);
    if (walkTimerRef.current) clearTimeout(walkTimerRef.current);
    walkTimerRef.current = setTimeout(() => {
      setIsGaneshaWalking(false);
    }, 1200);
  }
  prevGaneshaPosRef.current = newPos;

  return () => {
    if (walkTimerRef.current) clearTimeout(walkTimerRef.current);
  };
}, [mapGaneshaState.position]);
```

**Update the Ganesha wrapper JSX (around line 863). Find:**
```jsx
<div style={mapGaneshaState.position}>
  {/* ... */}
  <GaneshaPresence
    pose={mapGaneshaState.pose}
```
**Replace with:**
```jsx
<div
  className={`map-ganesha-wrapper ${isGaneshaWalking ? 'is-walking' : ''}`}
  style={(() => {
    // Strip transform from inline style — CSS handles it during walk bob
    const { transform, ...rest } = mapGaneshaState.position;
    return isGaneshaWalking ? rest : mapGaneshaState.position;
  })()}
>
  {/* ... existing children unchanged ... */}
  <GaneshaPresence
    pose={isGaneshaWalking ? 'walking' : mapGaneshaState.pose}
```

> If `GaneshaCharacter` doesn't support `walking`, swap `'walking'` above for `'pointing'`.

---

### 3.4 — Unlock celebration sequencing (delay → walk → VO → pulse)

**File:** `CleanMapZone.jsx`
**In the unlock detection block (around line 597-616), replace:**
```js
if (prevState === 'locked' && nextState === 'active') {
  newlyUnlockedZoneIds.push(zoneId);
  const unlockIntensity = zoneId === ZONE_IDS.CAVE ? 'master' : 'normal';

  if (unlockTimersRef.current[zoneId]) {
    clearTimeout(unlockTimersRef.current[zoneId]);
  }

  setUnlockingZones(prev => ({ ...prev, [zoneId]: unlockIntensity }));
  playUnlockChime(unlockIntensity);

  unlockTimersRef.current[zoneId] = setTimeout(() => {
    setUnlockingZones(prev => {
      const updated = { ...prev };
      delete updated[zoneId];
      return updated;
    });
    delete unlockTimersRef.current[zoneId];
  }, 1200);
}
```
**With:**
```js
if (prevState === 'locked' && nextState === 'active') {
  newlyUnlockedZoneIds.push(zoneId);
  const unlockIntensity = zoneId === ZONE_IDS.CAVE ? 'master' : 'normal';

  if (unlockTimersRef.current[zoneId]) {
    clearTimeout(unlockTimersRef.current[zoneId]);
  }

  // Sequenced unlock moment:
  // 0ms: chime fires immediately (audio cue child notices)
  // 800ms: pulse + Ganesha walk begins
  // 5000ms: pulse fades
  playUnlockChime(unlockIntensity);

  setTimeout(() => {
    setUnlockingZones(prev => ({ ...prev, [zoneId]: unlockIntensity }));
  }, 800);

  unlockTimersRef.current[zoneId] = setTimeout(() => {
    setUnlockingZones(prev => {
      const updated = { ...prev };
      delete updated[zoneId];
      return updated;
    });
    delete unlockTimersRef.current[zoneId];
  }, 5000);
}
```

**Then find the existing VO firing block (around line 623, the `unlockLines` block) and increase the VO delay so it fires AFTER the walk completes (2000ms instead of whatever's there):**
```js
const unlockLines = newlyUnlockedZoneIds
  .filter((zoneId) => !hasSeenZoneUnlockVo(zoneId))
  .map((zoneId) => {
    markZoneUnlockVoSeen(zoneId);
    return { text: MAP_ZONE_UNLOCK_VO[zoneId], delay: 2000 };
    //                                          ^^^^ updated from 300 (or whatever) to 2000
  });
```

> Find the actual `delay:` value currently used in that block and replace it with `2000`. The pulse appears at 800ms, walk takes 1.2s → finishes at ~2000ms → VO fires at 2000ms exactly when Ganesha arrives.

---

## Batch 4 — Mushika Headshake (Optional)

If your Mushika component reads the `headshake: true` prop I'm passing:

**File:** Wherever Mushika styles live (likely a CSS file alongside the Mushika component)
**Append:**
```css
.mushika-pop.is-headshake {
  animation: mushikaHeadshake 0.6s ease-in-out;
}

@keyframes mushikaHeadshake {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  20%      { transform: translateX(-6px) rotate(-4deg); }
  40%      { transform: translateX(6px)  rotate(4deg); }
  60%      { transform: translateX(-4px) rotate(-2deg); }
  80%      { transform: translateX(4px)  rotate(2deg); }
}
```

**In your Mushika component, apply the class conditionally:**
```jsx
<div className={`mushika-pop ${headshake ? 'is-headshake' : ''}`}>
```

If you don't add this, the coming-soon and locked taps still work — the child just gets a regular pop with VO instead of a shake. No errors.

---

## Order of Implementation

1. **Batch 2 first** — biggest UX impact, lowest risk, all in one file pair.
2. **Test on the actual map.** Confirm first-tap goes to modak, locked taps fire VO, idle nudge fires after 7s of inactivity.
3. **Batch 3 second** — only after 3.1 is verified (check `GaneshaCharacter.jsx` for walking pose support before wiring 3.3).
4. **Batch 4 last (optional)** — pure polish.

---

## Things I'm NOT changing (intentional)

- Existing `getMapGaneshaState` logic — the position rules already work correctly.
- Existing zone-state classes (`locked`, `active`, `in-progress`, `completed`, `unlocking`).
- Mushika pop component itself — just passing a new prop.
- Any other scene files — this is map-only.

---

## If something doesn't work

The most likely failure points:
- **3.1 walking pose:** `GaneshaCharacter` may not have a `walking` artwork set. Fall back to `pointing` and the position transition alone still reads as movement.
- **3.3 transform stripping:** if removing `transform` breaks the centered position, keep `transform: translate(-50%, -50%)` in the inline style and remove the `translate(-50%, -50%)` from the `@keyframes ganeshaWalkBob` keyframes — replace with just `translateY(0px)` / `translateY(-3px)`.
- **2.3 first-tap shortcut:** if `navigateToZone` expects pop animation to have run first, the direct call may bypass an animation init. Check `navigateToZone` for any prerequisites.
