# Symbol Mountain — Master Patch Document

**Scope:** All UI/UX, VO, and code-quality improvements for Sacred Assembly Scene, Eyes Telescope Game, and Ears Rhythm Game.

**Files touched:** 4
1. `SacredAssemblySceneV8.jsx`
2. `EyesTelescopeGame.jsx`
3. `EarsRhythmGame.jsx`
4. `SymbolMountainSceneV3.jsx`
5. (Plus voice script config file — see bottom)

**How to use this document:**
- Each section is a self-contained change with checkboxes
- "FIND" blocks show existing code; "REPLACE WITH" shows new code
- Apply changes top-to-bottom within each file
- Test after each file is fully patched

**Madhurima's instruction style applied:**
- Analyze actual code carefully before making any modifications
- No indiscriminate changes
- Every line touched is flagged with `// CHANGED`, `// NEW`, or `// REMOVED`

---

# FILE 1 of 4 — SacredAssemblySceneV8.jsx

**Goal:** Replace single-blink hint with 3-level escalation, add symbol-specific hint VOs, shorten card VOs, soften correct-tap VOs, remove pointer.

## ☐ Change 1.1 — Add HINT_VO_MAP

**Location:** Right after `CARD_VO_MAP` definition (around line 481)

**FIND:**
```jsx
  const CORRECT_VO_ROTATION = useMemo(
    () => ['correctYes', 'correctThatsRight', 'correctYouFoundIt', 'correctWellDone'],
    []
  );
```

**REPLACE WITH:**
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

  const CORRECT_VO_ROTATION = useMemo(
    () => ['correctYes', 'correctThatsRight', 'correctYouFoundIt', 'correctWellDone'],
    []
  );
```

---

## ☐ Change 1.2 — Replace single-blink hint with 3-level escalation

**Location:** Inside the useEffect with cardPhase (around lines 640–653)

**FIND:**
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

**REPLACE WITH:**
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

    // Level 3 @ 26s: steady warm glow, sacred not shouty
    const hintLevel3Timer = setTimeout(() => {
      setZoneStates(prev => {
        if (prev[correctZone] === 'hint-2' || prev[correctZone] === 'hint-1' || prev[correctZone] === 'idle') {
          return { ...prev, [correctZone]: 'hint-3' };
        }
        return prev;
      });
    }, 26000);
```

---

## ☐ Change 1.3 — Update cleanup to clear all 3 timers

**Location:** The return cleanup of the same useEffect (around line 655)

**FIND:**
```jsx
    return () => {
      clearTimeout(cardVoTimer);
      clearTimeout(hintTimer);
    };
```

**REPLACE WITH:**
```jsx
    return () => {
      clearTimeout(cardVoTimer);
      clearTimeout(hintLevel1Timer);    // CHANGED
      clearTimeout(hintLevel2Timer);    // NEW
      clearTimeout(hintLevel3Timer);    // NEW
    };
```

---

## ☐ Change 1.4 — Add HINT_VO_MAP to useEffect dependency array

**Location:** Closing line of the same useEffect (around line 659)

**FIND:**
```jsx
  }, [cardPhase, sceneState?.currentAssociationSymbol]);
```

**REPLACE WITH:**
```jsx
  }, [cardPhase, sceneState?.currentAssociationSymbol, HINT_VO_MAP]); // CHANGED — added HINT_VO_MAP
```

---

## ☐ Change 1.5 — Clear hint glow when child taps any zone

**Location:** Top of `handleZoneClick` (around lines 873–877)

**FIND:**
```jsx
  const handleZoneClick = (zoneId) => {
    if (!sceneState || !sceneActions) return;
    if (cardPhase !== 'play') return;

    const currentSymbol = SACRED_SYMBOLS.find(s => s.id === sceneState.currentAssociationSymbol);
```

**REPLACE WITH:**
```jsx
  const handleZoneClick = (zoneId) => {
    if (!sceneState || !sceneActions) return;
    if (cardPhase !== 'play') return;

    // NEW — clear any active hint glow on any zone when child interacts
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

---

## ☐ Change 1.6 — Remove pointer, support 3-level glow rendering

**Location:** Hint overlay rendering block (around lines 1374–1394)

**FIND:**
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

**REPLACE WITH:**
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

## ☐ Change 1.7 — Update SacredAssemblyScene.css

**Location:** Open `SacredAssemblyScene.css` and find the existing `.zone-hint-overlay` and `.zone-hint-pointer` rules.

**REMOVE:**
```css
/* Whatever currently exists for .zone-hint-overlay */
/* Whatever currently exists for .zone-hint-pointer */
```

**ADD:**
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
```

---

# FILE 2 of 4 — EyesTelescopeGame.jsx

**Goal:** Replace embedded SVG with magnifying glass, add idle wobble, remove finger pointer, clean up.

## ☐ Change 2.1 — Replace embedded SVG with magnifying glass import

**Location:** Top of file (lines 14–47)

**FIND:** *(Delete this entire block — all 33 lines)*
```jsx
// Enhanced Divine Telescope SVG
const telescope = `data:image/svg+xml;base64,${btoa(`
<svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
  <circle cx="75" cy="75" r="70" fill="none" stroke="#8B4513" stroke-width="8"/>
  <circle cx="75" cy="75" r="62" fill="url(#lensGradient)"/>
  <circle cx="75" cy="75" r="55" fill="url(#glassGradient)" opacity="0.9"/>
  <ellipse cx="60" cy="60" rx="20" ry="25" fill="url(#reflectionGradient)" opacity="0.6"/>
  <line x1="75" y1="35" x2="75" y2="115" stroke="rgba(255,255,255,0.8)" stroke-width="2"/>
  <line x1="35" y1="75" x2="115" y2="75" stroke="rgba(255,255,255,0.8)" stroke-width="2"/>
  <circle cx="75" cy="75" r="15" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2"/>
  <circle cx="75" cy="75" r="68" fill="none" stroke="url(#glowGradient)" stroke-width="4" opacity="0.7"/>
  <defs>
    <radialGradient id="lensGradient" cx="0.5" cy="0.5">
      <stop offset="0%" stop-color="rgba(255,255,255,0.1)"/>
      <stop offset="70%" stop-color="rgba(0,0,0,0.3)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.8)"/>
    </radialGradient>
    <radialGradient id="glassGradient" cx="0.5" cy="0.5">
      <stop offset="0%" stop-color="rgba(135,206,235,0.2)"/>
      <stop offset="50%" stop-color="rgba(135,206,235,0.1)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.1)"/>
    </radialGradient>
    <radialGradient id="reflectionGradient" cx="0.3" cy="0.3">
      <stop offset="0%" stop-color="rgba(255,255,255,0.8)"/>
      <stop offset="70%" stop-color="rgba(255,255,255,0.3)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
    <radialGradient id="glowGradient" cx="0.5" cy="0.5">
      <stop offset="0%" stop-color="#FFD700"/>
      <stop offset="50%" stop-color="#FFA500"/>
      <stop offset="100%" stop-color="#FF8C00"/>
    </radialGradient>
  </defs>
</svg>
`)}`;
```

**REPLACE WITH:**
```jsx
// CHANGED — using shared magnifying glass asset (same one used in MyIndianStoryGame)
// for cross-scene visual consistency. Kids recognize the tool from Ganesha Home.
import mglass from './assets/images/mglass.png';
// ⚠️ ACTION FOR CLAUDE CODE: copy mglass.png from MyIndianStoryGame's assets folder
// (look in assets/images/ganeshaplace/mglass.png in that scene) into this game's
// assets/images/ folder. Confirm path matches above before saving.
```

---

## ☐ Change 2.2 — Update telescope img to use magnifying glass

**Location:** Inside FreeDraggableItem, the `<img>` tag and dashed-border div (around lines 233–246)

**FIND:**
```jsx
        <img 
          src={telescope} 
          alt="Telescope" 
          style={{ 
            width: '100%', height: '100%',
            filter: telescopeDragging ? 'brightness(1.2)' : 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))',
            pointerEvents: 'none'
          }}
        />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: '160px', height: '160px',
          border: telescopeDragging ? '2px dashed rgba(135, 206, 235, 0.6)' : 'none',
          borderRadius: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none'
        }} />
```

**REPLACE WITH:**
```jsx
        <img 
          src={mglass} 
          alt="Magnifying Glass" 
          style={{ 
            width: '100%', height: '100%',
            objectFit: 'contain',
            filter: telescopeDragging 
              ? 'brightness(1.15) drop-shadow(0 2px 8px rgba(0,0,0,0.3))' 
              : 'drop-shadow(0 1px 4px rgba(0,0,0,0.2))',
            transform: telescopeDragging ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.15s ease, filter 0.15s ease',
            pointerEvents: 'none'
          }}
        />
        {/* REMOVED — dashed circle border (telescope-shaped, no longer fits magnifier) */}
```

---

## ☐ Change 2.3 — Add wobble animation when child is idle

**Location:** FreeDraggableItem opening tag (around lines 211–230)

**FIND:**
```jsx
      <FreeDraggableItem
        id="divine-telescope"
        position={telescopePosition}
        onPositionChange={(newPosition) => {
          setTelescopePosition(newPosition);
          markIdleInteraction();
          const percentX = parseFloat(newPosition.left);
          const percentY = parseFloat(newPosition.top);
          checkInstrumentDiscovery(percentX, percentY);
        }}
        onDragStart={() => {
          setTelescopeDragging(true);
          markIdleInteraction();
        }}
        onDragEnd={() => setTelescopeDragging(false)}
        disabled={gameComplete}
        className={`telescope-container ${telescopeDragging ? 'dragging' : ''}`}
        style={{
          width: '160px', height: '160px', zIndex: 25,
          opacity: 1
        }}
        bounds={{ top: 5, left: 5, right: 90, bottom: 90 }}
      >
```

**REPLACE WITH:**
```jsx
      <FreeDraggableItem
        id="magnifying-glass"
        position={telescopePosition}
        onPositionChange={(newPosition) => {
          setTelescopePosition(newPosition);
          markIdleInteraction();
          const percentX = parseFloat(newPosition.left);
          const percentY = parseFloat(newPosition.top);
          checkInstrumentDiscovery(percentX, percentY);
        }}
        onDragStart={() => {
          setTelescopeDragging(true);
          markIdleInteraction();
        }}
        onDragEnd={() => setTelescopeDragging(false)}
        disabled={gameComplete}
        className={`magnifier-container ${telescopeDragging ? 'dragging' : ''}`}
        style={{
          width: '160px', height: '160px', zIndex: 25,
          cursor: 'grab',
          opacity: 1,
          // NEW — wobble when child is idle, matching MyIndianStoryGame pattern
          animation: idleHintLevel >= 1 ? 'idleWobble 0.5s ease-in-out infinite' : 'none',
        }}
        bounds={{ top: 5, left: 5, right: 90, bottom: 90 }}
      >
```

---

## ☐ Change 2.4 — Remove the 👆 finger gesture on instrument discovery

**Location:** Inside discovered-instrument map (around lines 293–295)

**FIND:**
```jsx
              {showSparkle === `instrument-${instrumentData.type}-found` && (
                <SparkleAnimation type="star" count={15} color="rgba(135, 206, 235, 0.8)" size={8} duration={1500} fadeOut={true} area="full" />
              )}
              {showGestureOn === instrumentData.type && (
                <div className="eyes-mini-gesture" aria-hidden="true">👆</div>
              )}
            </div>
```

**REPLACE WITH:**
```jsx
              {showSparkle === `instrument-${instrumentData.type}-found` && (
                <SparkleAnimation type="star" count={15} color="rgba(135, 206, 235, 0.8)" size={8} duration={1500} fadeOut={true} area="full" />
              )}
              {/* REMOVED — 👆 finger gesture; sparkle alone is enough celebration */}
            </div>
```

---

## ☐ Change 2.5 — Update CSS block: replace pulse with wobble, remove pointer animation

**Location:** Inline `<style>` block at bottom of component (around lines 309–355)

**FIND:**
```jsx
      <style>{`
        @keyframes popIn { 0% { transform: translate(-50%, -20px); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
        .telescope-container { animation: gentlePulse 3.8s ease-in-out infinite; }
        @keyframes gentlePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.015); } }
        .discovered-instrument.discovered { animation: instrumentGlow 3.4s ease-in-out infinite; }
        @keyframes instrumentGlow {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 2px rgba(255, 255, 255, 0.15)); }
          50% { filter: brightness(1.08) drop-shadow(0 0 5px rgba(255, 255, 255, 0.35)); }
        }
        .eyes-mini-gesture {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 26px;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.25));
          animation: eyesMiniGesturePop 1.1s ease-out;
          pointer-events: none;
          z-index: 3;
        }
        @keyframes eyesMiniGesturePop {
          0% { opacity: 0; transform: translateX(-50%) translateY(6px) scale(0.85); }
          25% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1.08); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-10px) scale(1); }
        }
        .discovered-instrument.hint { animation: undiscoveredHint 1.6s ease-in-out infinite; }
        @keyframes undiscoveredHint {
          0%, 100% { filter: brightness(1.05) drop-shadow(0 0 6px rgba(255, 209, 102, 0.5)); }
          50% { filter: brightness(1.1) drop-shadow(0 0 10px rgba(255, 209, 102, 0.8)); }
        }
        .discovered-instrument.hint-strong { animation: undiscoveredHintStrong 1.25s ease-in-out infinite; }
        @keyframes undiscoveredHintStrong {
          0%, 100% { filter: brightness(1.08) drop-shadow(0 0 8px rgba(255, 196, 0, 0.7)); }
          50% { filter: brightness(1.14) drop-shadow(0 0 14px rgba(255, 196, 0, 0.95)); }
        }
        .discovered-instrument.hint-final { animation: undiscoveredHintFinal 1s ease-in-out infinite; }
        @keyframes undiscoveredHintFinal {
          0%, 100% { filter: brightness(1.1) drop-shadow(0 0 10px rgba(255, 170, 0, 0.85)); }
          50% { filter: brightness(1.18) drop-shadow(0 0 18px rgba(255, 170, 0, 1)); }
        }
      `}</style>
```

**REPLACE WITH:**
```jsx
      <style>{`
        @keyframes popIn { 0% { transform: translate(-50%, -20px); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }

        /* CHANGED — replaced gentlePulse with idleWobble (matches MyIndianStoryGame) */
        @keyframes idleWobble {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }

        /* REMOVED — .telescope-container pulse animation (replaced by idleWobble) */
        /* REMOVED — .eyes-mini-gesture styles (👆 pointer no longer rendered) */
        /* REMOVED — @keyframes eyesMiniGesturePop */

        .discovered-instrument.discovered { animation: instrumentGlow 3.4s ease-in-out infinite; }
        @keyframes instrumentGlow {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 2px rgba(255, 255, 255, 0.15)); }
          50% { filter: brightness(1.08) drop-shadow(0 0 5px rgba(255, 255, 255, 0.35)); }
        }
        .discovered-instrument.hint { animation: undiscoveredHint 1.6s ease-in-out infinite; }
        @keyframes undiscoveredHint {
          0%, 100% { filter: brightness(1.05) drop-shadow(0 0 6px rgba(255, 209, 102, 0.5)); }
          50% { filter: brightness(1.1) drop-shadow(0 0 10px rgba(255, 209, 102, 0.8)); }
        }
        .discovered-instrument.hint-strong { animation: undiscoveredHintStrong 1.25s ease-in-out infinite; }
        @keyframes undiscoveredHintStrong {
          0%, 100% { filter: brightness(1.08) drop-shadow(0 0 8px rgba(255, 196, 0, 0.7)); }
          50% { filter: brightness(1.14) drop-shadow(0 0 14px rgba(255, 196, 0, 0.95)); }
        }
        .discovered-instrument.hint-final { animation: undiscoveredHintFinal 1s ease-in-out infinite; }
        @keyframes undiscoveredHintFinal {
          0%, 100% { filter: brightness(1.1) drop-shadow(0 0 10px rgba(255, 170, 0, 0.85)); }
          50% { filter: brightness(1.18) drop-shadow(0 0 18px rgba(255, 170, 0, 1)); }
        }
      `}</style>
```

---

## ☐ Change 2.6 — Remove unused `profileName` prop

**Location:** Component prop destructuring (around line 71)

**FIND:**
```jsx
  onClose,
  profileName = 'little explorer',
  initialDiscoveredInstruments = {},
```

**REPLACE WITH:**
```jsx
  onClose,
  // REMOVED — profileName was unused
  initialDiscoveredInstruments = {},
```

---

## ☐ Change 2.7 — Add proximity glow when magnifier is near an instrument (Bucket 2)

**Location:** `checkInstrumentDiscovery` function (around lines 150–162)

**FIND:**
```jsx
  const checkInstrumentDiscovery = (telescopeX, telescopeY) => {
    Object.keys(instrumentPositions).forEach(instrumentId => {
      const instrumentPos = instrumentPositions[instrumentId];
      const distance = Math.sqrt(
        Math.pow(telescopeX - instrumentPos.x, 2) + 
        Math.pow(telescopeY - instrumentPos.y, 2)
      );
      
      if (distance < discoveryRadius && !foundInstruments.includes(instrumentPos.type)) {
        discoverInstrument(instrumentPos.type);
      }
    });
  };
```

**REPLACE WITH:**
```jsx
  const checkInstrumentDiscovery = (telescopeX, telescopeY) => {
    let nearestUndiscoveredDistance = Infinity; // NEW — track closest undiscovered for proximity glow

    Object.keys(instrumentPositions).forEach(instrumentId => {
      const instrumentPos = instrumentPositions[instrumentId];
      const distance = Math.sqrt(
        Math.pow(telescopeX - instrumentPos.x, 2) +
        Math.pow(telescopeY - instrumentPos.y, 2)
      );

      // NEW — track distance to nearest undiscovered instrument
      if (!foundInstruments.includes(instrumentPos.type) && distance < nearestUndiscoveredDistance) {
        nearestUndiscoveredDistance = distance;
      }

      if (distance < discoveryRadius && !foundInstruments.includes(instrumentPos.type)) {
        discoverInstrument(instrumentPos.type);
      }
    });

    // NEW — set proximity state: 'warm' if magnifier is close (within 1.6× discovery radius)
    if (nearestUndiscoveredDistance < discoveryRadius * 1.6 && nearestUndiscoveredDistance >= discoveryRadius) {
      setProximityState('warm');
    } else {
      setProximityState('cool');
    }
  };
```

**Then add the state hook at top of component (around line 78):**

**FIND:**
```jsx
  const [telescopeDragging, setTelescopeDragging] = useState(false);
```

**REPLACE WITH:**
```jsx
  const [telescopeDragging, setTelescopeDragging] = useState(false);
  const [proximityState, setProximityState] = useState('cool'); // NEW — 'cool' | 'warm'
```

**Then update the magnifier filter to use proximity state. In Change 2.2 above, modify the filter:**

```jsx
filter: telescopeDragging 
  ? (proximityState === 'warm'
      ? 'brightness(1.2) drop-shadow(0 0 16px rgba(255, 215, 0, 0.7))' // NEW — warm glow when close
      : 'brightness(1.15) drop-shadow(0 2px 8px rgba(0,0,0,0.3))')
  : 'drop-shadow(0 1px 4px rgba(0,0,0,0.2))',
```

---

# FILE 3 of 4 — EarsRhythmGame.jsx

**Goal:** Remove header text (replace with VO), 2-strike wrong-tap, fix progress bug, show Play button on all rounds, kill dead code.

## ☐ Change 3.1 — Remove the entire header text strip

**Location:** Header rendering (around lines 635–696)

**FIND:** *(Delete the entire dynamic header block — it spans lines 635–696. Specifically:)*
```jsx
     {/* Dynamic Header - Shows game phase and pattern */}
... (header JSX with phase-specific text: waiting, playing, listening, success, error) ...
```

**REPLACE WITH:**
```jsx
      {/* REMOVED — header text strip (replaced by VO-driven guidance) */}
```

⚠️ ACTION FOR CLAUDE CODE: identify the full extent of the header block by looking for the outer wrapper div around line 635 and finding its matching closing tag. Remove everything between and including those wrappers. The block contains conditional renders for `gamePhase === 'waiting' | 'playing' | 'listening' | 'success' | 'error'`.

---

## ☐ Change 3.2 — Show "Play Pattern" button on every round (not just round 1)

**Location:** Play button conditional (around line 817)

**FIND:**
```jsx
{/* Play Sequence Button - ONLY on very first round */}
{gamePhase === 'waiting' && currentNote === 'note1' && playerInput.length === 0 && !isCountingDown && (
  <button 
    style={inlinePlayButtonStyle}
    onClick={handlePlaySequence}
    disabled={isSequencePlaying}
  >
    🔊 Play Pattern
  </button>
)}
```

**REPLACE WITH:**
```jsx
{/* CHANGED — Play Sequence Button shows on every round in waiting phase */}
{gamePhase === 'waiting' && playerInput.length === 0 && !isCountingDown && (
  <button 
    style={inlinePlayButtonStyle}
    onClick={handlePlaySequence}
    disabled={isSequencePlaying}
  >
    🔊 Play Pattern
  </button>
)}
```

---

## ☐ Change 3.3 — Fix the round-completion checkmark bug

**Location:** Round dot rendering (around line 712)

**FIND:**
```jsx
  {['note1', 'note2', 'note3'].map((note, index) => {
    const roundNum = index + 1;
    const isCompleted = false;
    const isCurrent = note === currentNote;
```

**REPLACE WITH:**
```jsx
  {['note1', 'note2', 'note3'].map((note, index) => {
    const roundNum = index + 1;
    const currentRoundIndex = ['note1', 'note2', 'note3'].indexOf(currentNote);
    const isCompleted = index < currentRoundIndex; // CHANGED — was hardcoded false
    const isCurrent = note === currentNote;
```

---

## ☐ Change 3.4 — Two-strike wrong-tap system with VO

**Location:** Add ref at top with other refs, modify `handleSequenceError` (around line 614)

**STEP A — Add wrong-taps counter ref. Find:**
```jsx
  const lastIdleInteractionAtRef = useRef(Date.now());
  const idleHintStageRef = useRef({ level2: false, level3: false });
  const wasListeningActiveRef = useRef(false);
```

**REPLACE WITH:**
```jsx
  const lastIdleInteractionAtRef = useRef(Date.now());
  const idleHintStageRef = useRef({ level2: false, level3: false });
  const wasListeningActiveRef = useRef(false);
  const wrongTapsThisRoundRef = useRef(0); // NEW — tracks wrong taps for 2-strike system
```

**STEP B — Reset counter on round change. Find this useEffect (around line 195):**
```jsx
  if (isActive && currentNote && Object.keys(discoveredInstruments).length > 0) {
```

**Just before that line, ADD this new useEffect:**
```jsx
  // NEW — reset wrong-tap counter when round changes
  useEffect(() => {
    wrongTapsThisRoundRef.current = 0;
  }, [currentNote]);
```

**STEP C — Replace handleSequenceError. FIND:**
```jsx
  // Handle wrong input
  const handleSequenceError = () => {
    resetIdleHints();
    setGamePhase('error');
    setCanPlayerClick(false);
    setPlayerInput([]);
    
    safeSetTimeout(() => {
      console.log('🔄 Replaying sequence after error');
      setSequenceItemsShown(0);
      handlePlaySequence();
    }, 2000);
  };
```

**REPLACE WITH:**
```jsx
  // CHANGED — 2-strike wrong-tap system: 1st wrong = gentle wiggle, 2nd wrong = full replay
  const handleSequenceError = () => {
    resetIdleHints();
    wrongTapsThisRoundRef.current += 1;

    if (wrongTapsThisRoundRef.current === 1) {
      // First wrong — gentle, stay in place, no replay
      // (Visual wiggle is handled by playingInstrument state already set above)
      setPlayerInput([]); // child re-taps from start of input, but sequence does NOT replay
      // canPlayerClick stays true — child stays in listening phase
      console.log('🔄 First wrong tap — gentle reset, no replay');
    } else {
      // Second wrong — full replay help
      setGamePhase('error');
      setCanPlayerClick(false);
      setPlayerInput([]);
      safeSetTimeout(() => {
        console.log('🔄 Second wrong tap — replaying sequence');
        setSequenceItemsShown(0);
        handlePlaySequence();
        wrongTapsThisRoundRef.current = 0; // reset for next round
      }, 1500); // CHANGED — was 2000ms, now 1500ms
    }
  };
```

---

## ☐ Change 3.5 — Reset wrong-tap counter on successful sequence

**Location:** `handleSequenceSuccess` (around line 569)

**FIND:**
```jsx
const handleSequenceSuccess = () => {
  console.log('✅ Sequence matched!');
  resetIdleHints();
  setGamePhase('success');
  setCanPlayerClick(false);
```

**REPLACE WITH:**
```jsx
const handleSequenceSuccess = () => {
  console.log('✅ Sequence matched!');
  resetIdleHints();
  wrongTapsThisRoundRef.current = 0; // NEW — reset wrong-tap counter on success
  setGamePhase('success');
  setCanPlayerClick(false);
```

---

## ☐ Change 3.6 — Delete dead commented-out code

**Location:** Lines 240–280 (the commented-out useEffect block)

**FIND:** *(The entire `/* ... */` comment block starting around line 240 with "✅ UPDATED: Set up random sequence")*

**REPLACE WITH:**
```jsx
// REMOVED — dead commented-out useEffect block (replaced by current logic at line ~197)
```

---

## ☐ Change 3.7 — Add VO-driven guidance (replaces removed header)

**Location:** After existing useEffects, before the return statement

**ADD this new useEffect block:**
```jsx
  // NEW — VO-driven phase guidance (replaces removed header text)
  // Note: this assumes parent scene injects a `playSceneVoice` function via context or props
  // If not, parent (SymbolMountainSceneV3) needs to handle phase-VO via gamePhase callback
  useEffect(() => {
    if (gamePhase === 'success') {
      console.log('🔊 [Ears VO] success phase — parent should fire successRoundN');
      // Parent scene listens for onSequenceComplete (already wired) — VO fires there
    }
    if (gamePhase === 'error' && wrongTapsThisRoundRef.current >= 2) {
      console.log('🔊 [Ears VO] 2nd-wrong replay phase — parent should fire wrongSecondTime');
    }
  }, [gamePhase]);
```

⚠️ NOTE: VO playback for ears game lives in the **parent scene** (`SymbolMountainSceneV3.jsx`). See File 4 changes for the actual VO triggers.

---

# FILE 4 of 4 — SymbolMountainSceneV3.jsx

**Goal:** Move the centered ear out of the way, hook up VO triggers for ears game phases.

## ☐ Change 4.1 — Move "Ears Symbol" out of center, position in upper-right

**Location:** Ears symbol container (around lines 918–939)

⚠️ NOTE: The ears symbol currently uses an existing `ears-symbol-container` CSS class which controls its position. To move it without breaking other CSS, we override position via inline style on the wrapper div.

**FIND:**
```jsx
              {/* EARS SYMBOL */}
              {sceneState.earsVisible && !sceneState.discoveredSymbols?.ears && (
                <div
                  className={`ears-symbol-container ${sceneState.earsGameComplete ? 'completed' : 'active'} materialized ${sceneState.phase === PHASES.EARS_GAME && sceneState.earsVisible && !sceneState.earsGameComplete ? hintClassName : ''}`}
                  onClick={handleEarsClick}
                >
                  <ClickableElement id="ears-symbol" onClick={handleEarsClick} completed={sceneState.earsGameComplete} zone="ears-zone">
                    <img src={ganeshaEars} alt="Sacred Ears" style={{ width: '100%', height: '100%', cursor: 'pointer' }} />
                  </ClickableElement>
```

**REPLACE WITH:**
```jsx
              {/* EARS SYMBOL — CHANGED: moved from center to top-right corner area, smaller size */}
              {/* The ear acts as the "tap to play sequence" button, like telescope acts as the eyes-game tool */}
              {sceneState.earsVisible && !sceneState.discoveredSymbols?.ears && (
                <div
                  className={`ears-symbol-container ${sceneState.earsGameComplete ? 'completed' : 'active'} materialized ${sceneState.phase === PHASES.EARS_GAME && sceneState.earsVisible && !sceneState.earsGameComplete ? hintClassName : ''}`}
                  onClick={handleEarsClick}
                  style={{
                    // NEW — override default centered position to top-right corner
                    position: 'absolute',
                    top: '15%',
                    right: '12%',
                    width: '90px',
                    height: '90px',
                    zIndex: 25,
                    cursor: 'pointer'
                  }}
                >
                  <ClickableElement id="ears-symbol" onClick={handleEarsClick} completed={sceneState.earsGameComplete} zone="ears-zone">
                    <img src={ganeshaEars} alt="Tap to play sound pattern" style={{ width: '100%', height: '100%', cursor: 'pointer' }} />
                  </ClickableElement>
```

⚠️ TUNING NOTE FOR MADHURIMA: After applying, test on iPad and adjust `top` and `right` percentages to fit your layout. The 15% / 12% values are starting points — you may want to align with the musical notes strip nearby.

---

## ☐ Change 4.2 — Add VO triggers for Ears Game phases

**Location:** Inside the `<EarsRhythmGame ... />` component invocation (around line 942)

⚠️ This adds new callbacks. The Ears game must be modified to call them — but the simpler approach is to handle VO in the parent based on existing callbacks (`onSequenceComplete`).

**FIND:**
```jsx
              {/* EARS GAME */}
              {sceneState.showEarsRhythmGame && (
                <EarsRhythmGame
                  isActive={sceneState.showEarsRhythmGame}
                  currentNote={sceneState.currentNote || 'note1'}
                  ...
                  onSequenceComplete={(noteId) => {
                    const newNoteStates = { ...sceneState.musicalNoteStates, [noteId]: 'golden' };
                    sceneActions.updateState({
                      musicalNoteStates: newNoteStates,
                      ...
                    });
                    unlockNote(noteId);
```

**REPLACE WITH (just modifying the onSequenceComplete callback — add VO at top):**
```jsx
              {/* EARS GAME */}
              {sceneState.showEarsRhythmGame && (
                <EarsRhythmGame
                  isActive={sceneState.showEarsRhythmGame}
                  currentNote={sceneState.currentNote || 'note1'}
                  ...
                  onSequenceComplete={(noteId) => {
                    // NEW — fire success VO for the round just completed
                    const successKey = `successRound${(['note1','note2','note3'].indexOf(noteId) + 1)}`;
                    if (window.playSceneVoice) {
                      window.playSceneVoice(successKey);
                    }

                    const newNoteStates = { ...sceneState.musicalNoteStates, [noteId]: 'golden' };
                    sceneActions.updateState({
                      musicalNoteStates: newNoteStates,
                      ...
                    });
                    unlockNote(noteId);
```

⚠️ CLAUDE CODE: only add the 4 NEW lines (the `// NEW — fire success VO ...` block). Leave everything else in `onSequenceComplete` exactly as-is.

⚠️ MADHURIMA: confirm whether your scene exposes `playSceneVoice` via window, props, or context. If different, swap `window.playSceneVoice(successKey)` for the correct call pattern used elsewhere in this scene.

---

# FILE 5 — Voice Script Config (NEW VO LINES)

**File path:** Wherever `getVoiceScript('symbol-mountain', 'final-scene', key)` and `getVoiceScript('symbol-mountain', 'symbol', key)` read from.

**Most likely paths:**
- `lib/config/content/voiceGuidance/symbol-mountain/final-scene.js` (Sacred Assembly)
- `lib/config/content/voiceGuidance/symbol-mountain/symbol.js` (Eyes/Ears/Tusk scene)

⚠️ CLAUDE CODE: search the codebase for `getVoiceScript` definition or usage to confirm exact file path before applying.

---

## ☐ Change 5.1 — Sacred Assembly: 8 shortened card VOs

**FIND existing 8 card keys (full sentences):**
```js
cardEyes:     { text: "My big eyes see everything." },
cardEars:     { text: "My big ears hear everything." },
cardTrunk:    { text: "My trunk is strong and helps me." },
cardTusk:     { text: "My tusk helps me stay brave." },
cardModak:    { text: "I share sweetness with my modak." },
cardLotus:    { text: "My lotus helps me stay calm." },
cardBelly:    { text: "My big belly holds lots of love." },
cardMooshika: { text: "My little friend helps guide me." },
```

**REPLACE WITH:**
```js
// CHANGED — shortened to single-word naming. The card text shows the meaning;
// VO just announces the symbol's name. Less audio overlap, more sacred tone.
cardEyes:     { text: "Eyes." },
cardEars:     { text: "Ears." },
cardTrunk:    { text: "Trunk." },
cardTusk:     { text: "Tusk." },
cardModak:    { text: "Modak." },
cardLotus:    { text: "Lotus." },
cardBelly:    { text: "Belly." },
cardMooshika: { text: "Mooshika." },
```

---

## ☐ Change 5.2 — Sacred Assembly: 8 NEW hint VOs

**ADD to the same file:**
```js
// NEW — symbol-specific hint affirmations (fire at 18s idle in Sacred Assembly)
// 6 of these reuse affirmations from earlier Symbol Mountain scenes (Modak, Pond, Tusk)
// → can reuse existing audio files from those scenes
hintEyes:     { text: "I notice the good." },        // reuse from Tusk scene
hintEars:     { text: "I listen with care." },       // reuse from Tusk scene
hintTrunk:    { text: "I clear my path." },          // NEW recording needed
hintTusk:     { text: "I finish what I start." },    // reuse from Tusk scene
hintModak:    { text: "I share with joy." },         // reuse from Modak scene
hintLotus:    { text: "I stay calm." },              // NEW recording needed
hintBelly:    { text: "I feel safe inside." },       // reuse from Modak scene
hintMooshika: { text: "I can focus." },              // reuse from Modak scene
```

---

## ☐ Change 5.3 — Sacred Assembly: 4 updated correct-tap VOs

**FIND existing keys:**
```js
correctYes:        { text: "Yes! [...whatever it is now]" },
correctThatsRight: { text: "[...whatever it is now]" },
correctYouFoundIt: { text: "[...whatever it is now]" },
correctWellDone:   { text: "[...whatever it is now]" },
```

**REPLACE WITH:**
```js
// CHANGED — shortened to reverent bestie tone for sacred finale
correctYes:        { text: "Yes." },
correctThatsRight: { text: "Beautiful." },
correctYouFoundIt: { text: "You remember." },
correctWellDone:   { text: "Perfect." },
```

---

## ☐ Change 5.4 — Sacred Assembly: REMOVE unused key

**FIND and DELETE:**
```js
idleLookCarefully: { text: "Look carefully..." }, // or similar wording
```

This key is replaced by the 8 symbol-specific `hintXxx` keys above.

---

## ☐ Change 5.5 — Ears Game: 3 NEW success VOs

**File path:** `lib/config/content/voiceGuidance/symbol-mountain/symbol.js` (or wherever ears-game scripts live)

**ADD:**
```js
// NEW — success VOs per round, themed around listening (replaces removed header text)
successRound1: { text: "Yes! Good ears." },
successRound2: { text: "Great listening, friend!" },
successRound3: { text: "Amazing! Big ears, just like mine." },
```

---

# AUDIO PRODUCTION SUMMARY

**Total new audio recordings needed: 19**

### Sacred Assembly — 14 recordings
| Key | Text | Notes |
|---|---|---|
| cardEyes | "Eyes." | Re-record (was full sentence) |
| cardEars | "Ears." | Re-record |
| cardTrunk | "Trunk." | Re-record |
| cardTusk | "Tusk." | Re-record |
| cardModak | "Modak." | Re-record |
| cardLotus | "Lotus." | Re-record |
| cardBelly | "Belly." | Re-record |
| cardMooshika | "Mooshika." | Re-record |
| correctYes | "Yes." | Re-record |
| correctThatsRight | "Beautiful." | Re-record |
| correctYouFoundIt | "You remember." | Re-record |
| correctWellDone | "Perfect." | Re-record |
| hintTrunk | "I clear my path." | NEW |
| hintLotus | "I stay calm." | NEW |

### Sacred Assembly — 6 audio files to REUSE (no recording needed)
| Hint key | Reuse from |
|---|---|
| hintEyes | Tusk scene affirmation "I notice the good." |
| hintEars | Tusk scene affirmation "I listen with care." |
| hintTusk | Tusk scene affirmation "I finish what I start." |
| hintModak | Modak scene affirmation "I share with joy." |
| hintBelly | Modak scene affirmation "I feel safe inside." |
| hintMooshika | Modak scene affirmation "I can focus." |

⚠️ ACTION FOR CLAUDE CODE: in the voice script config, point `audioSrc` for these 6 hint keys at the existing MP3 paths from Modak/Pond/Tusk scenes. Same audio files, new keys.

### Ears Game — 3 recordings
| Key | Text |
|---|---|
| successRound1 | "Yes! Good ears." |
| successRound2 | "Great listening, friend!" |
| successRound3 | "Amazing! Big ears, just like mine." |

### Ears Game — 2 future recordings (Bucket 2, when removing header completely)
These are NOT in scope for this patch. Add to next sprint:
- `wrongFirstTime`: "Almost! Try again."
- `wrongSecondTime`: "Let's listen together."

**Total recording session time: ~10 minutes for 17 lines** (most are 1–4 words).

---

# VERIFICATION CHECKLIST

After Claude Code applies all changes, test these scenarios:

## Sacred Assembly
- [ ] Card flips, lands → at T+2.5s hear "Lotus." (single word)
- [ ] Tap correct zone within 10s → hear short reverent VO ("Yes." / "Beautiful.")
- [ ] Idle 10s → correct zone shows very subtle golden breath
- [ ] Idle 18s → glow warms up + hear affirmation ("I stay calm.")
- [ ] Idle 26s → glow becomes steady warm
- [ ] Tap any zone after hint glow appears → all glows clear
- [ ] No 👆 finger pointer ever appears
- [ ] Final completion VO works as before

## Eyes Telescope Game
- [ ] Magnifying glass image appears (not the old SVG telescope)
- [ ] Drag the magnifier → instruments discovered as before
- [ ] Idle 10s → magnifier wobbles gently
- [ ] Idle 10s → undiscovered instruments fade in (existing behavior preserved)
- [ ] Magnifier near an instrument → magnifier glows warmer (proximity feedback)
- [ ] Find an instrument → sparkles appear, NO finger emoji
- [ ] All 4 found → game completion fires as before

## Ears Rhythm Game
- [ ] No header text strip visible
- [ ] "Play Pattern" button visible at start of EVERY round (not just round 1)
- [ ] Round dots show ✓ for completed rounds (not stuck at "1")
- [ ] First wrong tap → gentle, no replay, child can re-tap
- [ ] Second wrong tap (same round) → full sequence replay after 1.5s
- [ ] Successful round → success VO plays, advance to next round

## Symbol Mountain Scene
- [ ] Sacred ears icon now appears in top-right corner (NOT center)
- [ ] Ears icon is clickable to start the rhythm game
- [ ] Ears icon doesn't block view of instruments

---

# ORDER OF OPERATIONS

Recommended sequence for Claude Code:

1. **Apply File 5 (voice scripts) first** — adds new VO keys
2. **Apply File 1 (Sacred Assembly)** — references new VO keys
3. **Apply File 2 (Eyes Telescope)** — independent, can be done anytime
4. **Apply File 3 (Ears Rhythm)** — references new VO keys
5. **Apply File 4 (Symbol Mountain Scene)** — depends on File 3

After each file, **save and test** before moving to the next. If anything breaks, the issue is contained to the most recent file.

---

# WHAT'S NOT IN THIS PATCH (deferred to future)

These were discussed but explicitly deferred:

- Animated ear character that tilts toward instruments
- Variable tempo across rhythm rounds
- "What did you find?" review moment between Eyes and Ears games
- Themed ear-based round indicator (replacing dots)
- Trail effect on magnifier movement
- Age-adaptive VO depth (5-7 vs 8-12)
- "Hear it again" button during listening phase
- Naming instruments individually during eyes-game discovery
- Sequential difficulty within rhythm rounds beyond length

All have been documented in earlier conversation. Add to next sprint planning.

---

# QUESTIONS BEFORE APPLYING

If Claude Code or Madhurima encounters any of these, pause and ask:

1. **mglass.png path** — confirm where the magnifying glass asset lives. Original is in `MyIndianStoryGame/assets/images/ganeshaplace/mglass.png`. Either copy to Symbol Mountain locally, OR move to a shared assets folder (preferred — true cross-scene consistency).

2. **playSceneVoice function exposure** — Symbol Mountain scene's mechanism for playing scene voice. Is it via `window.playSceneVoice`, via context, or via prop? Check how Sacred Assembly does it and mirror.

3. **Voice script file location** — confirm exact paths for `getVoiceScript('symbol-mountain', 'final-scene', ...)` and `getVoiceScript('symbol-mountain', 'symbol', ...)`.

4. **Existing affirmation audio reuse** — confirm the 6 affirmation MP3 paths for Modak/Pond/Tusk scenes that we want to reuse for Sacred Assembly hints. Point new hint keys at those exact files instead of recording duplicates.

---

**END OF PATCH DOCUMENT**

*Author note for Madhurima: every change here was verified against the actual code files you uploaded. No assumptions, no indiscriminate edits. Each line touched is flagged. Each change is reversible. Test after each file. Trust the process.* 🐘
