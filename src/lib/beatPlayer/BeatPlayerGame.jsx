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
 * Per-item `activePath` (optional): a second pose that swaps in the instant
 * the child starts touching that item — pressed-and-holding for press-hold,
 * or mid-drag for any drag mechanic — instead of waiting for the gesture to
 * resolve into the next state. `path` stays the item's resting/idle pose;
 * `activePath` is what it becomes the moment they touch it. Skip it and the
 * item just keeps showing `path` throughout, same as before this existed.
 *
 * Per-item `appearDelayMs` (optional): keeps that item invisible and
 * non-interactive for N ms after this state is entered, then fades it in.
 * For a beat where two things shouldn't appear in the exact same instant —
 * e.g. a help bubble popping in a beat after the pose it's reacting to,
 * not simultaneously with it.
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
 *   - 'rope-drag'          — drag the `drag` gameKey (its own item — no
 *                            separate visual) onto `target`; while dragging
 *                            (and at rest), a bendable rope curve renders
 *                            from `fixedPoint` to the item's current
 *                            position, using the exact same quadratic-
 *                            bezier sag formula as MahakayaRescueGame's
 *                            RopeLine. Pointer/hit-test logic is identical
 *                            to drag-drop — only the visual differs.
 *   - 'try-fail'           — a "child tries alone and it doesn't work" beat.
 *                            `gesture` picks press-hold or drag on the
 *                            `drag` gameKey (holdMs for press-hold); the
 *                            attempt ALWAYS ends in the gentle "wrong"
 *                            shake, never a hit-test or success — the point
 *                            of the beat is the fail, then the story moves
 *                            on to the next beat on its own. Matches the
 *                            real "solo rope try always slips" behavior
 *                            that used to be hand-coded per game. Add a
 *                            `fixedPoint` (same shape as rope-drag) to get
 *                            the same bendable rope-curve visual on a
 *                            gesture:'drag' try-fail — no separate rope
 *                            image needed, it's the same procedural curve.
 */

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const speakAndWait = (text, enabled = true) => {
  return new Promise((resolve) => {
    if (
      !enabled ||
      !text ||
      typeof window === 'undefined' ||
      !window.speechSynthesis
    ) {
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.94;
      utterance.pitch = 1.02;

      let finished = false;

      const finish = () => {
        if (finished) return;
        finished = true;
        clearTimeout(safetyTimer);
        resolve();
      };

      // Real-device speechSynthesis doesn't reliably fire onend/onerror —
      // voices not loaded yet, the tab losing focus, a rapid cancel() right
      // before speak(), etc. Without a fallback, a dropped event freezes the
      // whole beat forever (the timeline awaits this promise before it's
      // allowed to move on). Cap the wait at a generous estimate of how long
      // the line could take to say, plus headroom, so a flaky event can
      // never permanently stall the story.
      const safetyTimer = setTimeout(finish, Math.max(4000, text.length * 110));

      utterance.onend = finish;
      utterance.onerror = finish;

      window.speechSynthesis.speak(utterance);
    } catch {
      resolve();
    }
  });
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
  autoAdvanceMs = 700,
  movementMs = 450,
  reactionPauseMs = 550,
  isActive = true,
  isPaused = false,
  isAudioOn = true,
  hideElements = false,
  className = '',
  onComplete,
  onMissingAsset,
  // Layout Debug — same drag-to-reposition + numeric-field + "copy JSON"
  // pattern already used in the hand-coded live scenes (KurumedevaGame.jsx,
  // MahakayaRescueGame.jsx, NewModakSceneV7.jsx etc.), ported here so a
  // BeatPlayerGame-driven beat can be nudged visually too instead of only
  // through the external Visual Flow Editor or hand-edited JSON. Purely
  // additive and local (React state, never mutates flowJson) — turning it
  // off leaves the beat exactly as authored.
  layoutDebug = false,
}) {
  const beatKeys = useMemo(
    () => Object.keys(flowJson?.beats || {}).sort((a, b) => Number(a) - Number(b)),
    [flowJson]
  );

  const sceneRef = useRef(null);
  const advanceTimer = useRef(null);
  const holdTimer = useRef(null);
  const holdRaf = useRef(null);
  const holdReleaseRaf = useRef(null);
  const holdProgressRef = useRef(0);
  const warnedPaths = useRef(new Set());

  const [beatPos, setBeatPos] = useState(0);
  const [stateName, setStateName] = useState('before');
  const [drag, setDrag] = useState(null); // { gameKey, x, y }
  const [selectedGameKey, setSelectedGameKey] = useState(null);
  // 0-1 fill for the press-hold progress ring — same pattern as the Pond
  // scene's lotus/rock hold (rAF-driven fill while held, quick decay on
  // release) so a press-hold reads as "something is happening", not vague.
  const [holdProgress, setHoldProgress] = useState(0);
  const [feedback, setFeedback] = useState('idle'); // idle | wrong | holding
  // center-tie: which of the two rope ends (left/right) has reached the
  // shared target and locked there. Reset whenever the beat/state changes.
  const [centerTieLocked, setCenterTieLocked] = useState({});

  // drag-path interaction state (tap trigger -> reveal drop -> drag through
  // waypoints). Kept separate from the single-target `drag` state above
  // since the shapes differ (a running waypoint index, not a hit-test).
  const [dropRevealed, setDropRevealed] = useState(false);
  const [dropPos, setDropPos] = useState(null); // {x,y} in %
  const [pathIndex, setPathIndex] = useState(-1);
  const [dropDragging, setDropDragging] = useState(false);

  // Layout Debug — local-only overrides, never written back to flowJson.
  // Keyed [beatIndex][stateName][itemKey] = {x,y,scale,rotation,flip}, plus
  // [beatIndex].fixedPoint = {x,y} for the rope anchor. itemKey is the
  // item's gameKey when it has one, else `${name}#${index}` (two items can
  // share a blank gameKey — e.g. the decorative duplicate in a dedup pair).
  const [debugOverrides, setDebugOverrides] = useState({});
  const [debugSelectedKey, setDebugSelectedKey] = useState(null);
  const [debugCopyStatus, setDebugCopyStatus] = useState('');
  const debugDragRef = useRef(null); // { mode: 'item' | 'fixedPoint', key, offsetX, offsetY }

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

  // Clear the layout-debug panel's selection when switching beats — a
  // selected key from one beat has no guaranteed match in the next.
  useEffect(() => { setDebugSelectedKey(null); }, [beatIndex]);

  // Per-item `appearDelayMs` (optional): hides that item until N ms after
  // this state is entered, then fades it in — e.g. a help bubble that
  // shouldn't appear in the same instant as the pose it's reacting to.
  // Re-armed on every state/beat entry.
  const [pendingReveal, setPendingReveal] = useState(() => new Set());
  useEffect(() => {
    const delayed = items.filter((it) => it.appearDelayMs > 0);
    if (!delayed.length) {
      setPendingReveal(new Set());
      return undefined;
    }
    const keyOf = (it) => it.gameKey || it.name;
    setPendingReveal(new Set(delayed.map(keyOf)));
    const timers = delayed.map((it) => setTimeout(() => {
      setPendingReveal((prev) => {
        if (!prev.has(keyOf(it))) return prev;
        const next = new Set(prev);
        next.delete(keyOf(it));
        return next;
      });
    }, it.appearDelayMs));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

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
    if (holdRaf.current) cancelAnimationFrame(holdRaf.current);
    if (holdReleaseRaf.current) cancelAnimationFrame(holdReleaseRaf.current);
  }, []);

  const goToState = useCallback((next) => {
    // A state change can turn a currently-focused item non-interactive
    // (aria-hidden on the next render) — e.g. right after completing a
    // drag, the item that was just grabbed still holds keyboard focus.
    // Browsers block aria-hidden on an element with retained focus and
    // log a console warning; blur first so the transition is clean.
    if (typeof document !== 'undefined' && sceneRef.current?.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    setDrag(null);
    setSelectedGameKey(null);
    setFeedback('idle');
    setDropRevealed(false);
    setDropPos(null);
    setPathIndex(-1);
    setDropDragging(false);
    setCenterTieLocked({});
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
    // layoutDebug freezes the timeline too — nothing should keep advancing
    // out from under a beat you're actively repositioning.
    if (!isActive || isPaused || layoutDebug || !beat) return undefined;

    let cancelled = false;

    const runState = async () => {
      const voText = stateBlock?.audio?.voText || '';

      // Let the narration finish before progressing.
      await speakAndWait(voText, isAudioOn);

      if (cancelled) return;

      // Interactive "before" states now stay on screen after the story VO.
      // The child acts when ready.
      if (needsInput(stateName)) return;

      let holdFor = autoAdvanceMs;

      if (stateName === 'movement') {
        holdFor = movementMs;
      }

      if (stateName === 'after') {
        // Small breathing space after the reaction/narration
        // before introducing the next story beat.
        holdFor = reactionPauseMs;
      }

      advanceTimer.current = setTimeout(() => {
        if (cancelled) return;

        if (stateName === 'before') {
          goToState('movement');
        } else if (stateName === 'movement') {
          goToState('after');
        } else {
          advanceBeat();
        }
      }, holdFor);
    };

    runState();

    return () => {
      cancelled = true;

      if (advanceTimer.current) {
        clearTimeout(advanceTimer.current);
        advanceTimer.current = null;
      }

      // Only cancel speech when we're genuinely leaving this state.
      if (
        typeof window !== 'undefined' &&
        window.speechSynthesis
      ) {
        window.speechSynthesis.cancel();
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isActive,
    isPaused,
    layoutDebug,
    beatIndex,
    stateName,
    isAudioOn,
    autoAdvanceMs,
    movementMs,
    reactionPauseMs,
  ]);

  useEffect(() => clearTimers, [clearTimers]);

  const findItem = useCallback((gameKey) => items.find((it) => it.gameKey === gameKey), [items]);

  // ---- Layout Debug ---------------------------------------------------
  const itemKeyOf = (item, i) => item.gameKey || `${item.name}#${i}`;

  const debugItemOverride = useCallback(
    (key) => debugOverrides[beatIndex]?.[stateName]?.[key],
    [debugOverrides, beatIndex, stateName]
  );

  const withDebugOverride = (item, key) => {
    const ov = debugItemOverride(key);
    return ov ? { ...item, ...ov } : item;
  };

  // Generic named-point overrides — for any interaction field that's a raw
  // {x,y} authored point with no item of its own to grab (a rope anchor, a
  // lock position, etc). Keyed by field name so any number of these can
  // coexist per beat (e.g. center-tie's anchorLeft/anchorRight/lockLeft/
  // lockRight all use this same mechanism).
  const debugPoint = (name) => debugOverrides[beatIndex]?.points?.[name];
  // Same idea, for a drag-drop `target` authored as a raw {x,y,w} zone
  // instead of another item's gameKey — that zone has no item of its own
  // to grab either, so it gets its own debug handle.
  const debugTargetZone = debugOverrides[beatIndex]?.targetZone;

  const stagePctFromEvent = (e) => {
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100),
    };
  };

  const startDebugItemDrag = useCallback((e, key, item) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const pt = stagePctFromEvent(e);
    if (!pt) return;
    debugDragRef.current = { mode: 'item', key, offsetX: pt.x - item.x, offsetY: pt.y - item.y };
    setDebugSelectedKey(key);
  }, []);

  const startDebugPointDrag = useCallback((e, name, currentPoint) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const pt = stagePctFromEvent(e);
    if (!pt || !currentPoint) return;
    debugDragRef.current = { mode: 'point', name, offsetX: pt.x - currentPoint.x, offsetY: pt.y - currentPoint.y };
    setDebugSelectedKey(`__point_${name}__`);
  }, []);

  const startDebugTargetZoneDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const pt = stagePctFromEvent(e);
    const zone = debugTargetZone || interaction?.target;
    if (!pt || !zone) return;
    debugDragRef.current = { mode: 'targetZone', offsetX: pt.x - zone.x, offsetY: pt.y - zone.y };
    setDebugSelectedKey('__targetZone__');
  }, [debugTargetZone, interaction]);

  const onDebugPointerMove = useCallback((e) => {
    const d = debugDragRef.current;
    if (!d) return;
    const pt = stagePctFromEvent(e);
    if (!pt) return;
    const x = Number((pt.x - d.offsetX).toFixed(2));
    const y = Number((pt.y - d.offsetY).toFixed(2));
    if (d.mode === 'point') {
      setDebugOverrides((cur) => ({
        ...cur,
        [beatIndex]: {
          ...cur[beatIndex],
          points: { ...cur[beatIndex]?.points, [d.name]: { x, y } },
        },
      }));
      return;
    }
    if (d.mode === 'targetZone') {
      setDebugOverrides((cur) => ({
        ...cur,
        [beatIndex]: {
          ...cur[beatIndex],
          targetZone: { ...(cur[beatIndex]?.targetZone || interaction?.target), x, y },
        },
      }));
      return;
    }
    setDebugOverrides((cur) => ({
      ...cur,
      [beatIndex]: {
        ...cur[beatIndex],
        [stateName]: {
          ...cur[beatIndex]?.[stateName],
          [d.key]: { ...cur[beatIndex]?.[stateName]?.[d.key], x, y },
        },
      },
    }));
  }, [beatIndex, stateName, interaction]);

  const endDebugDrag = useCallback(() => { debugDragRef.current = null; }, []);

  const updateDebugField = (field, value) => {
    if (!debugSelectedKey) return;
    const next = field === 'flip' ? value : Number(value);
    if (field !== 'flip' && Number.isNaN(next)) return;
    if (debugSelectedKey.startsWith('__point_')) {
      if (field !== 'x' && field !== 'y') return;
      const name = debugSelectedKey.slice('__point_'.length, -2);
      setDebugOverrides((cur) => ({
        ...cur,
        [beatIndex]: {
          ...cur[beatIndex],
          points: {
            ...cur[beatIndex]?.points,
            [name]: { ...(cur[beatIndex]?.points?.[name] || interaction?.[name]), [field]: next },
          },
        },
      }));
      return;
    }
    if (debugSelectedKey === '__targetZone__') {
      if (field !== 'x' && field !== 'y' && field !== 'w') return;
      setDebugOverrides((cur) => ({
        ...cur,
        [beatIndex]: {
          ...cur[beatIndex],
          targetZone: { ...(cur[beatIndex]?.targetZone || interaction?.target), [field]: next },
        },
      }));
      return;
    }
    setDebugOverrides((cur) => ({
      ...cur,
      [beatIndex]: {
        ...cur[beatIndex],
        [stateName]: {
          ...cur[beatIndex]?.[stateName],
          [debugSelectedKey]: { ...cur[beatIndex]?.[stateName]?.[debugSelectedKey], [field]: next },
        },
      },
    }));
  };

  const resetDebugForBeat = () => {
    setDebugOverrides((cur) => {
      const next = { ...cur };
      delete next[beatIndex];
      return next;
    });
    setDebugSelectedKey(null);
  };

  // Exports the CURRENT beat's before/movement/after (all items, overrides
  // merged in) as JSON matching the flow-editor schema — paste back into
  // the sample JSON or the external Visual Flow Editor.
  const copyDebugBeatJson = async () => {
    const beatOverrides = debugOverrides[beatIndex] || {};
    const mergeState = (name) => {
      const raw = beat?.[name]?.items || [];
      const stateOv = beatOverrides[name] || {};
      return {
        ...beat[name],
        items: raw.map((it, i) => {
          const ov = stateOv[itemKeyOf(it, i)];
          return ov ? { ...it, ...ov } : it;
        }),
      };
    };
    let mergedInteraction = interaction;
    if (beatOverrides.points) mergedInteraction = { ...mergedInteraction, ...beatOverrides.points };
    if (beatOverrides.targetZone) mergedInteraction = { ...mergedInteraction, target: beatOverrides.targetZone };
    const payload = {
      meta: beat.meta,
      before: mergeState('before'),
      movement: mergeState('movement'),
      after: mergeState('after'),
      interaction: mergedInteraction,
    };
    const text = JSON.stringify(payload, null, 2);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setDebugCopyStatus('Copied');
      } else if (typeof window !== 'undefined' && window.prompt) {
        window.prompt('Copy beat JSON', text);
        setDebugCopyStatus('Shown');
      }
    } catch {
      if (typeof window !== 'undefined' && window.prompt) {
        window.prompt('Copy beat JSON', text);
        setDebugCopyStatus('Shown');
      }
    }
    setTimeout(() => setDebugCopyStatus(''), 2000);
  };

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
      // A little forgiveness on either side — a child's finger dropping a few
      // pixels short of a character shouldn't read as a miss. Zone targets
      // already get their own tolerance via `w`; this gives gameKey targets
      // the same courtesy.
      const padX = r.width * 0.2;
      const padY = r.height * 0.2;
      return (
        clientX >= r.left - padX && clientX <= r.right + padX &&
        clientY >= r.top - padY && clientY <= r.bottom + padY
      );
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

  const isTryFailHold = (it) => it?.type === 'try-fail' && it?.gesture === 'press-hold';
  const isTryFailDrag = (it) => it?.type === 'try-fail' && it?.gesture !== 'press-hold';
  const isCenterTieInteraction = (it) => it?.type === 'center-tie'
    || (it?.type === 'try-fail' && it?.gesture === 'center-tie');
  const isTryFailCenterTieInteraction = (it) => it?.type === 'try-fail' && it?.gesture === 'center-tie';
  const centerTieSideFor = (it, gameKey) => (
    gameKey === it?.dragLeft ? 'left' : gameKey === it?.dragRight ? 'right' : null
  );

  const failThenAdvance = useCallback(() => {
    setDrag(null);
    setFeedback('wrong');
    setTimeout(() => {
      setFeedback('idle');
      completeInteraction();
    }, 420);
  }, [completeInteraction]);

  const onPointerDown = useCallback((e, gameKey) => {
    if (!needsInput(stateName) || interaction.type === 'press-hold' || isTryFailHold(interaction)) return;
    if (isCenterTieInteraction(interaction)) {
      const side = centerTieSideFor(interaction, gameKey);
      if (!side || centerTieLocked[side]) return;
    } else if (interaction.drag !== gameKey) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSelectedGameKey(gameKey);
    setDrag({
      gameKey,
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, [stateName, interaction, centerTieLocked]);

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
    if (isCenterTieInteraction(interaction)) {
      const side = centerTieSideFor(interaction, drag.gameKey);
      const ok = side && hitTest(e.clientX, e.clientY, interaction.target);
      setDrag(null);
      if (!ok) return; // misses just spring back to start (no lock, no fail)
      setCenterTieLocked((cur) => {
        const next = { ...cur, [side]: true };
        if (next.left && next.right) {
          // Both arrived — hold briefly so the child sees it "almost
          // worked" before resolving, matching the locked spec's timing.
          setTimeout(() => {
            if (isTryFailCenterTieInteraction(interaction)) {
              setFeedback('wrong');
              setCenterTieLocked({});
              setTimeout(() => {
                setFeedback('idle');
                completeInteraction();
              }, 450);
            } else {
              setTimeout(() => completeInteraction(), 300);
            }
          }, 250);
        }
        return next;
      });
      return;
    }
    if (isTryFailDrag(interaction)) {
      failThenAdvance();
      return;
    }
    const ok = hitTest(e.clientX, e.clientY, interaction.target);
    if (ok) completeInteraction();
    else rejectInteraction();
  }, [drag, interaction, hitTest, completeInteraction, rejectInteraction, failThenAdvance]);

  // Tap-to-select-then-tap-target — always available as an accessibility
  // fallback for drag-drop, and the primary path for tap-select-tap-target.
  const onTapItem = useCallback((gameKey) => {
    if (!needsInput(stateName)) return;
    if (interaction.type === 'press-hold' || interaction.type === 'try-fail') return;
    if (gameKey === interaction.drag) {
      setSelectedGameKey(gameKey);
      return;
    }
    if (gameKey === interaction.target && selectedGameKey === interaction.drag) {
      completeInteraction();
    }
  }, [stateName, interaction, selectedGameKey, completeInteraction]);

  // Eases holdProgress back down to 0 instead of snapping — used both when
  // the child releases early (cancelHold) and when a try-fail-hold reaches
  // full and has to spring back open (e.g. the tie-knot visual: snapping
  // the gap shut then instantly popping it back open read as a glitch, not
  // a fail; this makes it visibly "spring loose" instead).
  const decayHoldProgress = useCallback((decayMs = 250) => {
    if (holdReleaseRaf.current) {
      cancelAnimationFrame(holdReleaseRaf.current);
      holdReleaseRaf.current = null;
    }
    const startProgress = holdProgressRef.current;
    if (startProgress <= 0) return;
    const startTime = performance.now();
    const decayTick = (now) => {
      const elapsed = now - startTime;
      const next = Math.max(0, startProgress * (1 - elapsed / decayMs));
      holdProgressRef.current = next;
      setHoldProgress(next);
      if (next <= 0) {
        holdReleaseRaf.current = null;
        return;
      }
      holdReleaseRaf.current = requestAnimationFrame(decayTick);
    };
    holdReleaseRaf.current = requestAnimationFrame(decayTick);
  }, []);

  const startHold = useCallback((gameKey) => {
    if (!needsInput(stateName) || interaction.drag !== gameKey) return;
    if (interaction.type !== 'press-hold' && !isTryFailHold(interaction)) return;
    setFeedback('holding');

    if (holdReleaseRaf.current) {
      cancelAnimationFrame(holdReleaseRaf.current);
      holdReleaseRaf.current = null;
    }

    const holdMs = interaction.holdMs || 900;
    const startProgress = holdProgressRef.current; // resume from wherever it decayed to
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const next = Math.min(1, startProgress + elapsed / holdMs);
      holdProgressRef.current = next;
      setHoldProgress(next);

      if (next >= 1) {
        holdRaf.current = null;
        if (isTryFailHold(interaction)) {
          failThenAdvance();
          // Hold the full pose for a beat so the child sees it "almost
          // worked", then spring the gap back open before the shake ends.
          setTimeout(() => decayHoldProgress(220), 120);
        } else {
          setFeedback('idle');
          completeInteraction();
          setTimeout(() => {
            holdProgressRef.current = 0;
            setHoldProgress(0);
          }, 300);
        }
        return;
      }
      holdRaf.current = requestAnimationFrame(tick);
    };
    holdRaf.current = requestAnimationFrame(tick);
  }, [stateName, interaction, completeInteraction, failThenAdvance, decayHoldProgress]);

  const cancelHold = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (holdRaf.current) {
      cancelAnimationFrame(holdRaf.current);
      holdRaf.current = null;
    }
    setFeedback((f) => (f === 'holding' ? 'idle' : f));
    decayHoldProgress(250);
  }, [decayHoldProgress]);

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

  // center-tie's rope-end curve: from a fixed anchor near the log to the
  // end's current point (its rest/lock position, or live drag.x/y).
  const ropeEndCurveD = (anchor, pt) => {
    const dir = pt.x > anchor.x ? 1 : -1;
    const c1x = anchor.x + dir * 4.6, c1y = anchor.y + 4.6;
    const c2x = pt.x - dir * 4.0, c2y = pt.y + 2.2;
    return `M ${anchor.x} ${anchor.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${pt.x} ${pt.y}`;
  };

  const isDragPath = interaction?.type === 'drag-path';
  // Center-tie: two rope ends (dragLeft/dragRight), each dragged
  // independently toward a shared `target` zone. Locked positions
  // (lockLeft/lockRight) and visual anchors (anchorLeft/anchorRight) are
  // named points — see the generic debugPoint/startDebugPointDrag system.
  // A 'try-fail' center-tie locks both briefly then springs apart; a plain
  // 'center-tie' locks and stays, resolving into the knot artwork.
  const isCenterTie = isCenterTieInteraction(interaction);
  const isTryFailCenterTie = isTryFailCenterTieInteraction(interaction);
  // True the instant any hold/drag is in flight — only one can be at once.
  // 'wrong' is included so a try-fail's shake window doesn't drop the pose
  // back to idle before the state actually advances — without it, the
  // active pose flickered off for the ~420ms between the hold completing
  // and failThenAdvance's setTimeout actually calling completeInteraction.
  const isInteracting = feedback === 'holding' || feedback === 'wrong' || !!drag;

  // Ghost preview of the drop target while a plain drag-drop is in flight —
  // a translucent copy of the dragged item's own art sitting at its actual
  // destination, so the child sees exactly where to align it instead of
  // dropping roughly nearby and watching it snap somewhere else.
  let dropGhost = null;
  if (drag && interaction?.type === 'drag-drop') {
    const draggedItem = findItem(interaction.drag);
    if (draggedItem) {
      let ghostPos = null;
      if (typeof interaction.target === 'string') {
        const targetItem = findItem(interaction.target);
        if (targetItem) ghostPos = { x: targetItem.x, y: targetItem.y };
      } else if (interaction.target) {
        const zone = debugTargetZone || interaction.target;
        ghostPos = { x: zone.x, y: zone.y };
      }
      if (ghostPos) dropGhost = { item: draggedItem, pos: ghostPos };
    }
  }

  const effectivePoint = (name) => debugPoint(name) || interaction?.[name];
  const effectiveTargetZone = debugTargetZone
    || (interaction?.target && typeof interaction.target === 'object' ? interaction.target : null);

  const debugSelectedItem = layoutDebug && debugSelectedKey
    && !debugSelectedKey.startsWith('__point_') && debugSelectedKey !== '__targetZone__'
    ? withDebugOverride(items.find((it, i) => itemKeyOf(it, i) === debugSelectedKey) || {}, debugSelectedKey)
    : null;
  const debugSelectedPointName = layoutDebug && debugSelectedKey?.startsWith('__point_')
    ? debugSelectedKey.slice('__point_'.length, -2) : null;
  const debugSelectedPoint = debugSelectedPointName ? effectivePoint(debugSelectedPointName) : null;
  const debugSelectedTargetZone = layoutDebug && debugSelectedKey === '__targetZone__' ? effectiveTargetZone : null;

  return (
    <>
    <div
      ref={sceneRef}
      className={`
        beat-player-stage
        beat-player-state-${stateName}
        ${className}
        ${feedback === 'wrong' ? 'beat-player-wrong' : ''}
      `}
      onPointerMove={(e) => { onPointerMove(e); onDropPointerMove(e); onDebugPointerMove(e); }}
      onPointerUp={(e) => { onPointerUp(e); onDropPointerUp(); endDebugDrag(); }}
      onPointerCancel={() => { setDrag(null); onDropPointerUp(); endDebugDrag(); }}
    >
      {dropGhost && (() => {
        const src = resolveSrc(dropGhost.item.path);
        if (!src) return null;
        return (
          <div
            className="beat-player-drop-ghost"
            aria-hidden="true"
            style={styleFromItem({ ...dropGhost.item, x: dropGhost.pos.x, y: dropGhost.pos.y }, { zIndex: 5 })}
          >
            <img src={src} alt="" draggable={false} />
          </div>
        );
      })()}

      {/* Layout Debug: a drag-drop `target` authored as a raw {x,y,w} zone
          (not another item's gameKey) has no item of its own to grab or see
          — give it a persistent visible/draggable marker here so it can be
          positioned independently of whatever item happens to share that
          area (e.g. the bridge image, which a plank drop zone sits on top
          of but isn't actually the same point as). */}
      {layoutDebug && effectiveTargetZone && (
        <div
          className="beat-player-debug-target-zone"
          style={{
            position: 'absolute',
            left: `${effectiveTargetZone.x}%`,
            top: `${effectiveTargetZone.y}%`,
            width: `${effectiveTargetZone.w ?? 12}%`,
            aspectRatio: '1 / 1',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: '2px dashed #FF5722',
            background: 'rgba(255, 87, 34, 0.18)',
            zIndex: 56,
            cursor: 'grab',
          }}
          onPointerDown={startDebugTargetZoneDrag}
        />
      )}

      {items.map((item, i) => {
        const debugKey = itemKeyOf(item, i);
        const rawItem = item;
        item = layoutDebug ? withDebugOverride(item, debugKey) : item;
        const isDragKey = interaction?.drag === rawItem.gameKey;
        const isCenterTieDragKey = isCenterTie
          && (rawItem.gameKey === interaction?.dragLeft || rawItem.gameKey === interaction?.dragRight);
        const isTargetKey = interaction?.target === rawItem.gameKey;
        const isTriggerKey = isDragPath && interaction?.trigger === rawItem.gameKey && !dropRevealed;
        const isBeingDragged = !layoutDebug && drag?.gameKey === rawItem.gameKey;
        // A center-tie rope end has no static image at all, ever — it's
        // purely the SVG rope curve + handle rendered separately below.
        // The item still exists in the data purely for findItem/gameKey
        // bookkeeping (start position), it just never renders as a
        // generic image button.
        if (isCenterTieDragKey) return null;
        // Optional per-item "active" pose (item.activePath) swaps in the instant
        // ANY interaction starts — pressed-and-holding, or mid-drag — instead of
        // waiting for the gesture to resolve into the next state. Not limited to
        // the touched item itself: a bystander (e.g. the beaver reacting the
        // moment the child grabs the log) can carry activePath too, since only
        // one hold/drag can be in flight at once. Makes the scene feel
        // responsive rather than a slideshow.
        const src = resolveSrc(isInteracting && item.activePath ? item.activePath : item.path);
        if (!src) return null;
        const style = isBeingDragged
          ? styleFromItem(item, { left: `${drag.x}%`, top: `${drag.y}%`, zIndex: 60 })
          : styleFromItem(item);

        const isPendingReveal = !layoutDebug && item.appearDelayMs > 0 && pendingReveal.has(item.gameKey || item.name);
        const interactive = layoutDebug || (!isPendingReveal && needsInput(stateName) && (isDragKey || isTargetKey || isTriggerKey));
        const isDebugSelected = layoutDebug && debugSelectedKey === debugKey;

        return (
          <button
            key={`${item.gameKey || item.name}-${i}`}
            type="button"
            data-beat-key={item.gameKey || undefined}
            className={`beat-player-item${interactive ? ' is-interactive' : ''}${isDragKey && selectedGameKey === item.gameKey ? ' is-selected' : ''}${isBeingDragged ? ' is-dragging' : ''}${isDragKey && feedback === 'holding' ? ' is-holding' : ''}${isDebugSelected ? ' is-debug-selected' : ''}`}
            style={{ ...style, pointerEvents: interactive ? 'auto' : 'none', opacity: isPendingReveal ? 0 : style.opacity, outline: isDebugSelected ? '2px dashed #03A9F4' : undefined }}
            tabIndex={interactive ? 0 : -1}
            aria-hidden={!interactive}
            onPointerDown={layoutDebug
              ? (e) => startDebugItemDrag(e, debugKey, item)
              : (isDragKey ? (e) => { onPointerDown(e, item.gameKey); startHold(item.gameKey); } : undefined)}
            onPointerUp={!layoutDebug && isDragKey ? cancelHold : undefined}
            onPointerLeave={!layoutDebug && isDragKey ? cancelHold : undefined}
            onClick={layoutDebug ? undefined : (isTriggerKey ? () => onTriggerTap(item.gameKey) : interactive ? () => onTapItem(item.gameKey) : undefined)}
          >
            <img src={src} alt="" draggable={false} />
            {!layoutDebug && isDragKey && holdProgress > 0 && (
              <svg viewBox="0 0 100 100" className="beat-player-hold-ring" aria-hidden="true">
                <circle
                  cx="50" cy="50" r="46" fill="none" stroke="#FFD86B" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 46}
                  strokeDashoffset={2 * Math.PI * 46 * (1 - holdProgress)}
                  transform="rotate(-90 50 50)"
                  style={{
                    filter: `drop-shadow(0 0 ${4 + holdProgress * 8}px rgba(255, 216, 107, ${0.5 + holdProgress * 0.4}))`,
                  }}
                />
              </svg>
            )}
          </button>
        );
      })}

      {isCenterTie && (() => {
        const leftItem = findItem(interaction.dragLeft);
        const rightItem = findItem(interaction.dragRight);
        if (!leftItem || !rightItem) return null;
        const leftKey = itemKeyOf(leftItem, items.indexOf(leftItem));
        const rightKey = itemKeyOf(rightItem, items.indexOf(rightItem));
        const effLeftStart = layoutDebug ? withDebugOverride(leftItem, leftKey) : leftItem;
        const effRightStart = layoutDebug ? withDebugOverride(rightItem, rightKey) : rightItem;
        const anchorLeft = effectivePoint('anchorLeft') || effLeftStart;
        const anchorRight = effectivePoint('anchorRight') || effRightStart;
        const lockLeft = effectivePoint('lockLeft') || effectiveTargetZone || effLeftStart;
        const lockRight = effectivePoint('lockRight') || effectiveTargetZone || effRightStart;

        const posFor = (side, start, key, lockPos) => {
          if (drag?.gameKey === key) return { x: drag.x, y: drag.y };
          if (centerTieLocked[side]) return lockPos;
          return start;
        };
        const leftPos = posFor('left', effLeftStart, leftKey, lockLeft);
        const rightPos = posFor('right', effRightStart, rightKey, lockRight);

        const resolved = !needsInput(stateName);
        const showKnot = resolved && !isTryFailCenterTie;
        const nearGlow = drag && effectiveTargetZone
          && pctDistance({ x: drag.x, y: drag.y }, effectiveTargetZone) < (effectiveTargetZone.w ?? 10) * 1.6;

        const dark = feedback === 'wrong' ? '#c2564a' : '#976239';
        const main = feedback === 'wrong' ? '#e8a599' : '#e9b86e';
        // Visible/grabbable during normal play (while the beat needs input
        // and that side isn't already locked) AND in Layout Debug — the
        // rope-end's own rest position ("where the loose end starts,
        // controlling how long the dangling rope looks") had no handle in
        // debug mode at all before this, only the anchor/lock points did.
        const canGrab = (side) => layoutDebug || (needsInput(stateName) && !centerTieLocked[side]);
        const easeStyle = { transition: 'd 380ms cubic-bezier(.2,.8,.3,1)' };

        return (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 55 }}>
            {/* No permanent target marker — a glow only while a rope end is
                actively near the center, strengthening on approach. On the
                successful beat it resolves into the knot instead of fading. */}
            {nearGlow && effectiveTargetZone && (
              <circle cx={effectiveTargetZone.x} cy={effectiveTargetZone.y} r={(effectiveTargetZone.w ?? 10) * 0.9} fill="rgba(233,184,110,0.35)" />
            )}
            {!showKnot && (
              <>
                <path d={ropeEndCurveD(anchorLeft, leftPos)} fill="none" stroke={dark} strokeWidth="1.5" strokeLinecap="round" style={easeStyle} />
                <path d={ropeEndCurveD(anchorLeft, leftPos)} fill="none" stroke={main} strokeWidth="0.95" strokeLinecap="round" style={easeStyle} />
                <path d={ropeEndCurveD(anchorRight, rightPos)} fill="none" stroke={dark} strokeWidth="1.5" strokeLinecap="round" style={easeStyle} />
                <path d={ropeEndCurveD(anchorRight, rightPos)} fill="none" stroke={main} strokeWidth="0.95" strokeLinecap="round" style={easeStyle} />
              </>
            )}
            {showKnot && effectiveTargetZone && (
              // Exact knot artwork from the locked center-tie prototype —
              // authored in 1000x560 local coords, scaled+placed at the
              // target. A bow loop + two hanging tails, not a plain dot.
              <g transform={`translate(${effectiveTargetZone.x - 50.5}, ${effectiveTargetZone.y - 30.2}) scale(0.1)`}>
                <path d="M472 292 C492 267 522 269 538 292 C551 312 532 332 505 326 C477 320 462 305 472 292" fill="none" stroke="#976239" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M472 292 C492 267 522 269 538 292 C551 312 532 332 505 326 C477 320 462 305 472 292" fill="none" stroke="#e9b86e" strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M479 290 C494 276 516 277 530 292" fill="none" stroke="#f4cf93" strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
                <path d="M490 321 L476 348 M516 321 L530 348" fill="none" stroke="#976239" strokeWidth="15" strokeLinecap="round" />
                <path d="M490 321 L476 348 M516 321 L530 348" fill="none" stroke="#e9b86e" strokeWidth="9.5" strokeLinecap="round" />
              </g>
            )}
            {canGrab('left') && (
              <ellipse
                cx={leftPos.x} cy={leftPos.y} rx="2.6" ry="3.0"
                fill="#f4c477" stroke="#8f5b33" strokeWidth="0.35"
                style={{ pointerEvents: 'auto', cursor: drag?.gameKey === leftKey ? 'grabbing' : 'grab' }}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture?.(e.pointerId);
                  if (layoutDebug) { startDebugItemDrag(e, leftKey, effLeftStart); return; }
                  onPointerDown(e, leftKey);
                }}
              />
            )}
            {canGrab('right') && (
              <ellipse
                cx={rightPos.x} cy={rightPos.y} rx="2.6" ry="3.0"
                fill="#f4c477" stroke="#8f5b33" strokeWidth="0.35"
                style={{ pointerEvents: 'auto', cursor: drag?.gameKey === rightKey ? 'grabbing' : 'grab' }}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture?.(e.pointerId);
                  if (layoutDebug) { startDebugItemDrag(e, rightKey, effRightStart); return; }
                  onPointerDown(e, rightKey);
                }}
              />
            )}
            {/* Layout Debug: anchors and lock points have no item of their
                own to grab, so each gets a dedicated handle via the
                generic named-point system. */}
            {layoutDebug && ['anchorLeft', 'anchorRight', 'lockLeft', 'lockRight'].map((name) => {
              const p = effectivePoint(name);
              if (!p) return null;
              return (
                <circle
                  key={name} cx={p.x} cy={p.y} r="1.6"
                  fill="#FF5722" stroke="#fff" strokeWidth="0.3"
                  style={{ pointerEvents: 'auto', cursor: 'grab' }}
                  onPointerDown={(e) => startDebugPointDrag(e, name, p)}
                />
              );
            })}
          </svg>
        );
      })()}

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

    {layoutDebug && (
      <div className="beat-player-debug-panel">
        <div className="beat-player-debug-panel-row">
          <strong>Layout Debug</strong> — beat {beatIndex} / {stateName}
        </div>
        {debugSelectedItem ? (
          <>
            <div className="beat-player-debug-panel-row">{debugSelectedItem.gameKey || debugSelectedItem.name}</div>
            <label>X<input type="number" step="0.1" value={debugSelectedItem.x} onChange={(e) => updateDebugField('x', e.target.value)} /></label>
            <label>Y<input type="number" step="0.1" value={debugSelectedItem.y} onChange={(e) => updateDebugField('y', e.target.value)} /></label>
            <label>Scale<input type="number" step="1" value={debugSelectedItem.scale} onChange={(e) => updateDebugField('scale', e.target.value)} /></label>
            <label>Rotation<input type="number" step="1" value={debugSelectedItem.rotation || 0} onChange={(e) => updateDebugField('rotation', e.target.value)} /></label>
            <label>
              Flip
              <button type="button" onClick={() => updateDebugField('flip', (debugSelectedItem.flip ?? 1) * -1)}>
                {(debugSelectedItem.flip ?? 1) === 1 ? 'normal' : 'flipped'}
              </button>
            </label>
          </>
        ) : debugSelectedPoint ? (
          <>
            <div className="beat-player-debug-panel-row">{debugSelectedPointName}</div>
            <label>X<input type="number" step="0.1" value={debugSelectedPoint.x} onChange={(e) => updateDebugField('x', e.target.value)} /></label>
            <label>Y<input type="number" step="0.1" value={debugSelectedPoint.y} onChange={(e) => updateDebugField('y', e.target.value)} /></label>
          </>
        ) : debugSelectedTargetZone ? (
          <>
            <div className="beat-player-debug-panel-row">drop target zone</div>
            <label>X<input type="number" step="0.1" value={debugSelectedTargetZone.x} onChange={(e) => updateDebugField('x', e.target.value)} /></label>
            <label>Y<input type="number" step="0.1" value={debugSelectedTargetZone.y} onChange={(e) => updateDebugField('y', e.target.value)} /></label>
            <label>W<input type="number" step="0.5" value={debugSelectedTargetZone.w ?? 12} onChange={(e) => updateDebugField('w', e.target.value)} /></label>
          </>
        ) : (
          <div className="beat-player-debug-panel-row">Drag any element to select it.</div>
        )}
        <div className="beat-player-debug-panel-row beat-player-debug-panel-actions">
          <button type="button" onClick={copyDebugBeatJson}>{debugCopyStatus || 'Copy beat JSON'}</button>
          <button type="button" onClick={resetDebugForBeat}>Reset beat</button>
        </div>
      </div>
    )}
    </>
  );
}

export default BeatPlayerGame;
