import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './BeatPlayerGame.css';

/**
 * Generic "beat player" — renders a game directly from a Visual Flow Editor
 * export (`{ version, type, beats: { "0": {before, movement, after}, ... } }`)
 * instead of hand-transcribing every position/asset into bespoke JSX per game.
 *
 * The editor stays the source of truth: positions, poses, and VO text come
 * straight from its JSON. The only thing each game still supplies by hand is
 * a small assetMap (editor `path` string -> imported image) and, for beats
 * that need the child to actually do something, an `interactions` entry —
 * everything else (layout math, cross-fading before/movement/after, timing,
 * VO) is handled once, here.
 *
 * Interaction types (this is the fixed vocabulary a future editor "mechanic"
 * dropdown should write into beat.interaction.type — adding a new type here
 * is the only code change a new dropdown option needs):
 *   - undefined / 'none'   — beat auto-advances after a hold, no input needed
 *   - 'drag-drop'          — drag the `drag` gameKey onto the `target` gameKey
 *   - 'tap-select-tap-target' — same pairing, but by two taps (a11y/no-drag fallback,
 *                                also always available alongside drag-drop)
 *   - 'press-hold'         — press and hold the `drag` gameKey for `holdMs`
 *   - 'drag-path'          — tap `trigger` (e.g. the elephant) to reveal a
 *                            drop at `spawnAt`, then drag it through `path`
 *                            waypoints in order, snapping forward within
 *                            `snapRadius` of each; reaching the last one
 *                            completes the beat. Straying too far off every
 *                            waypoint resets the drop back to `spawnAt`.
 *                            Matches the real "drag water along the petal
 *                            path to the golden lotus" mechanic from the
 *                            Pond scene (prod commit 40f987a).
 */

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const speak = (text, enabled = true) => {
  if (!enabled || !text || typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.94;
    u.pitch = 1.02;
    window.speechSynthesis.speak(u);
  } catch {
    // Speech synthesis is optional.
  }
};

// Editor convention: rendered width % = item.w * (item.scale / 100).
// (Confirmed against real exports — e.g. peacock w:24 scale:80 -> 19.2%,
// matching the hand-placed DEFAULT_LAYOUT value from the same export.)
const styleFromItem = (item, extra = {}) => ({
  position: 'absolute',
  left: `${item.x}%`,
  top: `${item.y}%`,
  width: `${item.w * (item.scale / 100)}%`,
  transform: `translate(-50%, -50%) rotate(${item.rotation || 0}deg) scaleX(${item.flip ?? 1})`,
  opacity: (item.opacity ?? 100) / 100,
  zIndex: item.z ?? 10,
  ...extra
});

function BeatPlayerGame({
  flowJson,
  assetMap,
  interactions = {},
  autoAdvanceMs = 1600,
  isActive = true,
  isAudioOn = true,
  hideElements = false,
  className = '',
  onComplete,
  onMissingAsset,
}) {
  const beatKeys = useMemo(
    () => Object.keys(flowJson?.beats || {}).sort((a, b) => Number(a) - Number(b)),
    [flowJson]
  );

  const sceneRef = useRef(null);
  const advanceTimer = useRef(null);
  const holdTimer = useRef(null);
  const warnedPaths = useRef(new Set());

  const [beatPos, setBeatPos] = useState(0);
  const [stateName, setStateName] = useState('before');
  const [drag, setDrag] = useState(null); // { gameKey, x, y }
  const [selectedGameKey, setSelectedGameKey] = useState(null);
  const [feedback, setFeedback] = useState('idle'); // idle | wrong | holding

  // drag-path interaction state (tap trigger -> reveal drop -> drag through
  // waypoints). Kept separate from the single-target `drag` state above
  // since the shapes differ (a running waypoint index, not a hit-test).
  const [dropRevealed, setDropRevealed] = useState(false);
  const [dropPos, setDropPos] = useState(null); // {x,y} in %
  const [pathIndex, setPathIndex] = useState(-1);
  const [dropDragging, setDropDragging] = useState(false);

  const beatIndex = beatKeys[beatPos];
  const beat = flowJson?.beats?.[beatIndex];
  const stateBlock = beat?.[stateName];

  // A beat's items list can end up with two items sharing the same
  // gameKey — e.g. an old pose left in place when a new one was added on
  // top while editing (this happened for real: beat 2 of the Tusk sample
  // has both "Bunny — tired" and a leftover "bunny eat" both tagged
  // bunnySprite). Rather than render both, keep only the LAST occurrence
  // of each non-empty gameKey — that's the one actually meant to be there.
  const items = useMemo(() => {
    const raw = stateBlock?.items || [];
    const lastIndexForKey = new Map();
    raw.forEach((item, i) => {
      if (item.gameKey) lastIndexForKey.set(item.gameKey, i);
    });
    return raw.filter((item, i) => !item.gameKey || lastIndexForKey.get(item.gameKey) === i);
  }, [stateBlock]);

  const interaction = interactions[beatIndex] || beat?.interaction || null;
  const isLastBeat = beatPos === beatKeys.length - 1;

  const resolveSrc = useCallback((path) => {
    const src = assetMap?.[path];
    if (!src && !warnedPaths.current.has(path)) {
      warnedPaths.current.add(path);
      onMissingAsset?.(path);
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.warn(`[BeatPlayerGame] No asset mapped for path "${path}" — add it to assetMap.`);
      }
    }
    return src || null;
  }, [assetMap, onMissingAsset]);

  const clearTimers = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (holdTimer.current) clearTimeout(holdTimer.current);
  }, []);

  const goToState = useCallback((next) => {
    setDrag(null);
    setSelectedGameKey(null);
    setFeedback('idle');
    setDropRevealed(false);
    setDropPos(null);
    setPathIndex(-1);
    setDropDragging(false);
    setStateName(next);
  }, []);

  const advanceBeat = useCallback(() => {
    if (isLastBeat) {
      onComplete?.();
      return;
    }
    setBeatPos((p) => p + 1);
    goToState('before');
  }, [isLastBeat, onComplete, goToState]);

  const needsInput = (name) => name === 'before' && interaction && interaction.type && interaction.type !== 'none';

  // Drive the before -> movement -> after -> next timeline for every beat.
  // Beats with an interaction wait at "before" for the child; everything
  // else (including every beat once its need is met) advances on a timer.
  useEffect(() => {
    if (!isActive || !beat) return;
    speak(stateBlock?.audio?.voText, isAudioOn);

    if (needsInput(stateName)) return undefined; // wait for the drag/tap/hold

    const holdFor = stateName === 'before' ? autoAdvanceMs
      : stateName === 'movement' ? Math.min(700, autoAdvanceMs)
      : autoAdvanceMs;

    advanceTimer.current = setTimeout(() => {
      if (stateName === 'before') goToState('movement');
      else if (stateName === 'movement') goToState('after');
      else advanceBeat();
    }, holdFor);

    return () => clearTimeout(advanceTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, beatIndex, stateName, isAudioOn]);

  useEffect(() => clearTimers, [clearTimers]);

  const findItem = useCallback((gameKey) => items.find((it) => it.gameKey === gameKey), [items]);

  // `target` is usually another rendered item's gameKey (drag mango onto the
  // bunny), but some beats have no separate target object — the grass beat's
  // "resting spot" is just wherever the grass bundle is meant to land, not a
  // second thing on screen. For those, the adapter passes a raw {x,y,w} zone
  // (same % convention as everything else) instead of a gameKey string.
  const hitTest = useCallback((clientX, clientY, target) => {
    if (!sceneRef.current || !target) return false;
    const stageRect = sceneRef.current.getBoundingClientRect();

    if (typeof target === 'string') {
      const el = sceneRef.current.querySelector(`[data-beat-key="${target}"]`);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
    }

    const cx = stageRect.left + (target.x / 100) * stageRect.width;
    const cy = stageRect.top + (target.y / 100) * stageRect.height;
    const halfW = ((target.w ?? 12) / 100) * stageRect.width / 2;
    const halfH = halfW; // zones are treated as roughly circular/square hit areas
    return clientX >= cx - halfW && clientX <= cx + halfW && clientY >= cy - halfH && clientY <= cy + halfH;
  }, []);

  const completeInteraction = useCallback(() => {
    clearTimers();
    goToState('movement');
  }, [clearTimers, goToState]);

  const rejectInteraction = useCallback(() => {
    setDrag(null);
    setFeedback('wrong');
    setTimeout(() => setFeedback('idle'), 420);
  }, []);

  const onPointerDown = useCallback((e, gameKey) => {
    if (!needsInput(stateName) || interaction.type === 'press-hold') return;
    if (interaction.drag !== gameKey) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSelectedGameKey(gameKey);
    setDrag({
      gameKey,
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, [stateName, interaction]);

  const onPointerMove = useCallback((e) => {
    if (!drag || !sceneRef.current) return;
    const rect = sceneRef.current.getBoundingClientRect();
    setDrag((d) => d ? ({
      ...d,
      x: clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100),
    }) : null);
  }, [drag]);

  const onPointerUp = useCallback((e) => {
    if (!drag) return;
    const ok = hitTest(e.clientX, e.clientY, interaction.target);
    if (ok) completeInteraction();
    else rejectInteraction();
  }, [drag, interaction, hitTest, completeInteraction, rejectInteraction]);

  // Tap-to-select-then-tap-target — always available as an accessibility
  // fallback for drag-drop, and the primary path for tap-select-tap-target.
  const onTapItem = useCallback((gameKey) => {
    if (!needsInput(stateName)) return;
    if (interaction.type === 'press-hold') return;
    if (gameKey === interaction.drag) {
      setSelectedGameKey(gameKey);
      return;
    }
    if (gameKey === interaction.target && selectedGameKey === interaction.drag) {
      completeInteraction();
    }
  }, [stateName, interaction, selectedGameKey, completeInteraction]);

  const startHold = useCallback((gameKey) => {
    if (!needsInput(stateName) || interaction.type !== 'press-hold' || interaction.drag !== gameKey) return;
    setFeedback('holding');
    holdTimer.current = setTimeout(() => {
      setFeedback('idle');
      completeInteraction();
    }, interaction.holdMs || 900);
  }, [stateName, interaction, completeInteraction]);

  const cancelHold = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    setFeedback((f) => (f === 'holding' ? 'idle' : f));
  }, []);

  // ---- drag-path: tap trigger -> reveal drop -> drag through waypoints ----
  const pctDistance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  const onTriggerTap = useCallback((gameKey) => {
    if (!needsInput(stateName) || interaction.type !== 'drag-path') return;
    if (gameKey !== interaction.trigger || dropRevealed) return;
    setDropRevealed(true);
    setPathIndex(-1);
    setDropPos({ x: interaction.spawnAt.x, y: interaction.spawnAt.y });
  }, [stateName, interaction, dropRevealed]);

  const onDropPointerDown = useCallback((e) => {
    if (!needsInput(stateName) || interaction.type !== 'drag-path' || !dropRevealed) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDropDragging(true);
  }, [stateName, interaction, dropRevealed]);

  const onDropPointerMove = useCallback((e) => {
    if (!dropDragging || !sceneRef.current) return;
    const rect = sceneRef.current.getBoundingClientRect();
    const pct = {
      x: clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100),
    };
    setDropPos(pct);

    const path = interaction.path || [];
    const snapRadius = interaction.snapRadius ?? 8;
    const nextIdx = pathIndex + 1;

    if (nextIdx < path.length && pctDistance(pct, path[nextIdx]) < snapRadius) {
      setPathIndex(nextIdx);
      setDropPos({ x: path[nextIdx].x, y: path[nextIdx].y });
      if (nextIdx === path.length - 1) {
        completeInteraction();
      }
      return;
    }

    // Off-path: too far from the spawn point and every waypoint -> reset.
    const allPoints = [interaction.spawnAt, ...path];
    const minDist = Math.min(...allPoints.map((p) => pctDistance(pct, p)));
    if (minDist > snapRadius * 2.5) {
      setDropDragging(false);
      setPathIndex(-1);
      setDropPos({ x: interaction.spawnAt.x, y: interaction.spawnAt.y });
    }
  }, [dropDragging, interaction, pathIndex, completeInteraction]);

  const onDropPointerUp = useCallback(() => {
    if (!dropDragging) return;
    setDropDragging(false);
    const path = interaction.path || [];
    if (pathIndex === path.length - 1) {
      completeInteraction();
    } else {
      setPathIndex(-1);
      setDropPos({ x: interaction.spawnAt.x, y: interaction.spawnAt.y });
    }
  }, [dropDragging, interaction, pathIndex, completeInteraction]);

  if (hideElements || !isActive || !beat) return null;

  const isDragPath = interaction?.type === 'drag-path';

  return (
    <div
      ref={sceneRef}
      className={`beat-player-stage ${className} ${feedback === 'wrong' ? 'beat-player-wrong' : ''}`}
      onPointerMove={(e) => { onPointerMove(e); onDropPointerMove(e); }}
      onPointerUp={(e) => { onPointerUp(e); onDropPointerUp(); }}
      onPointerCancel={() => { setDrag(null); onDropPointerUp(); }}
    >
      {items.map((item, i) => {
        const src = resolveSrc(item.path);
        if (!src) return null;
        const isDragKey = interaction?.drag === item.gameKey;
        const isTargetKey = interaction?.target === item.gameKey;
        const isTriggerKey = isDragPath && interaction?.trigger === item.gameKey && !dropRevealed;
        const isBeingDragged = drag?.gameKey === item.gameKey;
        const style = isBeingDragged
          ? styleFromItem(item, { left: `${drag.x}%`, top: `${drag.y}%`, zIndex: 60 })
          : styleFromItem(item);

        const interactive = needsInput(stateName) && (isDragKey || isTargetKey || isTriggerKey);

        return (
          <button
            key={`${item.gameKey || item.name}-${i}`}
            type="button"
            data-beat-key={item.gameKey || undefined}
            className={`beat-player-item${interactive ? ' is-interactive' : ''}${isDragKey && selectedGameKey === item.gameKey ? ' is-selected' : ''}${isBeingDragged ? ' is-dragging' : ''}${isDragKey && feedback === 'holding' ? ' is-holding' : ''}`}
            style={{ ...style, pointerEvents: interactive ? 'auto' : 'none' }}
            tabIndex={interactive ? 0 : -1}
            aria-hidden={!interactive}
            onPointerDown={isDragKey ? (e) => { onPointerDown(e, item.gameKey); startHold(item.gameKey); } : undefined}
            onPointerUp={isDragKey ? cancelHold : undefined}
            onPointerLeave={isDragKey ? cancelHold : undefined}
            onClick={isTriggerKey ? () => onTriggerTap(item.gameKey) : interactive ? () => onTapItem(item.gameKey) : undefined}
          >
            <img src={src} alt="" draggable={false} />
          </button>
        );
      })}

      {/* drag-path's draggable drop — an SVG shape (matching the real Pond
          scene mechanic this was modeled on), not an image asset. */}
      {isDragPath && dropRevealed && dropPos && (
        <div
          className={`beat-player-drop${dropDragging ? ' is-dragging' : ''}`}
          style={{ left: `${dropPos.x}%`, top: `${dropPos.y}%` }}
          onPointerDown={onDropPointerDown}
        >
          <svg viewBox="0 0 46 52" className="beat-player-drop-svg">
            <path
              d="M 23 4 C 23 4, 8 22, 8 34 C 8 44, 15 50, 23 50 C 31 50, 38 44, 38 34 C 38 22, 23 4, 23 4 Z"
              fill="url(#beatPlayerDropGradient)"
              stroke="#5BB3E8"
              strokeWidth="1.5"
            />
            <ellipse cx="18" cy="22" rx="4" ry="6" fill="#FFFFFF" opacity="0.7" />
            <defs>
              <radialGradient id="beatPlayerDropGradient" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#B8E5FB" />
                <stop offset="60%" stopColor="#5BB3E8" />
                <stop offset="100%" stopColor="#3A8FCB" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      )}
    </div>
  );
}

export default BeatPlayerGame;
