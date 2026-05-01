// ═══════════════════════════════════════════════════════════════
// SCENE 3 — TUSK ACTIVATION → GANESHA REVEAL
// React trigger sequence (replaces the abrupt switch)
// ═══════════════════════════════════════════════════════════════


// ── 1. ADD STATE (top of component, with other useState) ─────────
const [tuskTransforming, setTuskTransforming] = useState(false);
const [showGoldenAura, setShowGoldenAura] = useState(false);
const [ganeshaRevealing, setGaneshaRevealing] = useState(false);


// ── 2. REPLACE THE ABRUPT SWITCH WITH THIS SEQUENCE ──────────────
// (find where you currently do: if (newTuskPower >= 3) { ... ganeshaComplete: true })

if (newTuskPower >= 3) {

  // T+0ms — tusk starts golden-fade in place
  setTuskTransforming(true);
  playGlow?.();  // soft rising chime (use your existing sound hook)

  // T+600ms — golden aura blooms behind tusk
  safeSetTimeout(() => {
    setShowGoldenAura(true);
  }, 600);

  // T+1200ms — Ganesha begins emerging through the aura
  safeSetTimeout(() => {
    setGaneshaRevealing(true);
    sceneActions.updateState({ ganeshaComplete: true });
    playTwinkle?.();  // soft celebration sound
  }, 1200);

  // T+2400ms — aura fades, settle into permanent soft pulse
  safeSetTimeout(() => {
    setShowGoldenAura(false);
    setTuskTransforming(false);  // tusk is now hidden
  }, 2400);

  // T+3000ms — trigger any "what tusk means" reveal card / next step
  safeSetTimeout(() => {
    // your existing logic — show meaning card, advance scene, etc.
    sceneActions.updateState({ phase: 'tusk-meaning-reveal' });
  }, 3000);
}


// ── 3. JSX — APPLY CLASSES CONDITIONALLY ─────────────────────────

{/* TUSK — applies golden fade animation when transforming */}
<img
  src={tuskImage}
  alt="tusk"
  className={`tusk ${tuskTransforming ? 'tusk-final-transform' : ''}`}
  style={{ /* your existing position styles */ }}
/>

{/* GOLDEN AURA — only visible during transition */}
{showGoldenAura && (
  <div
    className="golden-burst"
    style={{
      // position it where the tusk is / where Ganesha will appear
      left: '50%',
      top: '55%',
      zIndex: 5
    }}
  />
)}

{/* GANESHA — reveal animation on first appearance, then steady pulse */}
{sceneState.ganeshaComplete && (
  <img
    src={ganeshaDivineImage}
    alt="Ganesha"
    className={`ganesha-divine ${
      ganeshaRevealing ? 'ganesha-reveal' : ''
    } ${
      sceneState.ganeshaComplete && !ganeshaRevealing ? 'ganesha-glow' : ''
    }`}
    style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 10
    }}
    onAnimationEnd={() => {
      // once reveal animation finishes, swap to gentle pulse
      if (ganeshaRevealing) setGaneshaRevealing(false);
    }}
  />
)}

{/* OPTIONAL — golden dust particles after reveal */}
{sceneState.ganeshaComplete && !ganeshaRevealing && (
  <div className="golden-dust" />
)}
