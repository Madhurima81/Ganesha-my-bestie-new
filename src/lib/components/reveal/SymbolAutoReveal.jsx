import React, { useEffect, useRef, useState } from "react";
import { useGaneshaVoice } from "../../hooks/useGaneshaVoice";
import "./SymbolAutoReveal.css";

/**
 * SymbolAutoReveal — reusable across all 13 scenes
 *
 * Step 1  Symbol icon soft-floats in + sparkle burst      (~500 ms)
 * Step 2  Card materialises around the icon               (~550 ms slow fade)
 * Step 3  Pause — let the card settle                      (700 ms)
 * Step 4  Card flips                                      (~750 ms)
 * Step 5  Back face shows affirmation — waits for tap
 * Step 6  User taps anywhere
 * Step 7  Card skin dissolves → icon flies to sidebar
 *         → sidebar icon blooms at ~680 ms → onComplete() at 900 ms
 *
 * Props
 *   symbolId          string   – e.g. 'mooshika' — enables sidebar bloom
 *   symbolImage       string   – coloured icon src
 *   symbolName        string   – e.g. "Mooshika"
 *   affirmation       string   – e.g. "I can focus."
 *   sidebarTargetRect {x, y}   – delta from viewport centre → sidebar icon centre
 *   onComplete        function – called 900 ms after user taps
 */
export default function SymbolAutoReveal({
  symbolId,
  symbolImage,
  symbolName,
  affirmation,
  sidebarTargetRect,
  enableVoicePrompts = false,
  enableTapHintPrompt = true,
  sayWithMeDelayMs = 450,
  onComplete,
}) {
  // 'icon' → 'card' → 'flip' → 'ready' → 'fly'
  const [phase, setPhase] = useState("icon");
  const timers = useRef([]);
  const { speak, stop: stopSpokenVoice } = useGaneshaVoice();
  const voPlayedRef = useRef(false);

  const after = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };

 useEffect(() => {
  // Step 1 → icon already visible by default

  // Step 2: card materialises
  after(() => setPhase("card"), 380);

  // Step 3 + 4: micro pause, then flip
  after(() => setPhase("flip"), 380 + 420 + 280);

  // Step 5: flip complete → ready state
  after(() => setPhase("ready"), 380 + 420 + 280 + 580);

  return () => {
    timers.current.forEach(clearTimeout);
    stopSpokenVoice();
  };
}, []);

  // ── VO: fires once when card reaches "ready" state ───────────────────────
  // 1.5s delay after ready lets the child see + read the affirmation first,
  // then the voice gently nudges them to tap. Plays once per reveal.
  useEffect(() => {
    if (phase !== "ready" || voPlayedRef.current) return;
    if (!enableVoicePrompts && !enableTapHintPrompt) return;
    voPlayedRef.current = true;

    const cleanAffirmation = (affirmation || "")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[.!?]+$/, "");
    const sayWithMeLine = cleanAffirmation
      ? `Say with me, ${cleanAffirmation}.`
      : `Say with me, ${symbolName}.`;

    let affirmationTimer = null;
    if (enableVoicePrompts) {
      affirmationTimer = setTimeout(() => {
        speak(sayWithMeLine, {
          age: 6,
          style: "child",
          moment: "encouragement"
        });
      }, sayWithMeDelayMs);
      timers.current.push(affirmationTimer);
    }

    let collectHintTimer = null;
    if (enableTapHintPrompt) {
      collectHintTimer = setTimeout(() => {
        speak("Tap anywhere to close.", {
          age: 6,
          style: "child",
          moment: "encouragement"
        });
      }, 5000);
      timers.current.push(collectHintTimer);
    }

  }, [phase, speak, affirmation, symbolName, enableVoicePrompts, enableTapHintPrompt, sayWithMeDelayMs]);

//What These Numbers Mean (So You Don’t Forget Later)

//380ms → icon float finishes

//420ms → card fade in

//280ms → micro anticipation pause

//580ms → flip duration

//Total before ready = ~1660ms

  // ── Sidebar bloom: fires ~680 ms into flight, just before icon lands ───────
  // Adds a class directly to the sidebar DOM element so it glows on arrival.
  // React will strip the class naturally when SymbolSidebar re-renders after
  // onComplete fires and discoveredSymbols is updated.
  useEffect(() => {
    if (phase !== "fly" || !symbolId) return;

    const t = setTimeout(() => {
      const el = document.getElementById(`sidebar-${symbolId}`);
      if (el) el.classList.add("sar-sidebar-bloom");
    }, 680);

    timers.current.push(t);
  }, [phase, symbolId]);

  const handleTap = () => {
    if (phase !== "ready") return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    stopSpokenVoice();           // cut VO immediately on tap so it doesn't trail
    setPhase("fly");
    after(() => onComplete?.(), 1150);
  };

  // Derived flags
  const cardVisible   = phase !== "icon";
  const flipped       = phase === "flip" || phase === "ready" || phase === "fly";
  const flying        = phase === "fly";
  const showParticles = phase === "icon" || phase === "card";

  return (
    <div
      className={`sar-overlay${cardVisible ? " sar-dimmed" : ""}`}
      onClick={handleTap}
    >

      {/* ── Sparkle burst: rings + particles (steps 1–2) ──────────────────── */}
      {showParticles && (
        <>
     
          <div className="sar-particle sar-p1" />
          <div className="sar-particle sar-p2" />
          <div className="sar-particle sar-p3" />
          <div className="sar-particle sar-p4" />
        
        </>
      )}

      {/* ── Step 1: solo icon floats in ───────────────────────────────────── */}
      <img
        src={symbolImage}
        alt=""
        className={`sar-solo sar-solo--${phase === "icon" ? "in" : "out"}`}
      />

      {/* ── Steps 2–7: flip card ──────────────────────────────────────────── */}
      {/*
          IMPORTANT — the transition on .sar-wrap is NEVER changed between states.
          This is intentional: if the transition property changes in the same render
          as the transform value, browsers skip the animation entirely. Keeping a
          single unified transition means the fly inline-style always animates. */}
      <div
        className={[
          "sar-wrap",
          cardVisible ? "sar-wrap--in"  : "",
          flying      ? "sar-wrap--fly" : "",
        ].filter(Boolean).join(" ")}
        style={
          flying && sidebarTargetRect
            ? { transform: `translate(${sidebarTargetRect.x}px, ${sidebarTargetRect.y}px) scale(0.3)` }
            : undefined
        }
      >
        <div
          className={[
            "sar-card",
            flipped ? "sar-flipped"    : "",
            phase === "ready" ? "sar-ready" : "",
            flying  ? "sar-collapsing" : "",
          ].filter(Boolean).join(" ")}
        >

          {/* FRONT — icon only */}
          <div className="sar-face sar-front">
            <img src={symbolImage} alt={symbolName} className="sar-icon" />
          </div>

          {/* BACK — affirmation + icon stand-in for fly phase */}
          <div className="sar-face sar-back">

            {/* Replaces text when flying so the card collapses visually to just the icon */}
            <img
              src={symbolImage}
              alt=""
              className={`sar-fly-icon${flying ? " sar-fly-icon--show" : ""}`}
            />

            {/* Text fades out the instant user taps */}
            <div className={`sar-back-body${flying ? " sar-back-body--gone" : ""}`}>
              <h3 className="sar-name">{symbolName}</h3>
              <p  className="sar-affirmation">{affirmation}</p>
              <span className="sar-hint">
                Tap to collect
              </span>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
