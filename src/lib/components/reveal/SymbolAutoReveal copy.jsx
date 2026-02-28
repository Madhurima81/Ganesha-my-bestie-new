import React, { useEffect, useRef, useState } from "react";
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
  onComplete,
}) {
  // 'icon' → 'card' → 'flip' → 'ready' → 'fly'
  const [phase, setPhase] = useState("icon");
  const timers = useRef([]);

  const after = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };

  useEffect(() => {
    after(() => setPhase("card"),  500);               // step 2 — card materialises
    after(() => setPhase("flip"),  500 + 700);         // step 3+4 — pause then flip
    after(() => setPhase("ready"), 500 + 700 + 750);   // step 5 — flip done, await tap
    return () => timers.current.forEach(clearTimeout);
  }, []);

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
    setPhase("fly");
    after(() => onComplete?.(), 900);
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
          <div className="sar-ring sar-ring--1" />
          <div className="sar-ring sar-ring--2" />
          <div className="sar-particle sar-p1" />
          <div className="sar-particle sar-p2" />
          <div className="sar-particle sar-p3" />
          <div className="sar-particle sar-p4" />
          <div className="sar-particle sar-p5" />
          <div className="sar-particle sar-p6" />
          <div className="sar-particle sar-p7" />
          <div className="sar-particle sar-p8" />
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
              <span className={`sar-hint${phase === "ready" ? " sar-hint--pulse" : ""}`}>
                Tap to collect
              </span>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
