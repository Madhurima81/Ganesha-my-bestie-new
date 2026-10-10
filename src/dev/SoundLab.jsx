// SoundLab.jsx — dev-only page: hear and inspect the WHOLE sound system in one place.
//   npm run dev  →  http://localhost:<port>/sound-lab.html     (Vite prints the port)
// Not in the production rollup input, so it never ships.
//
//   1. Hear a whole scene   – the fastest way to judge the system by ear
//   2. The sounds           – every sound, grouped by what it is FOR, with a Play button
//   3. Check the rules      – one-click proofs of the rules between sounds
//   4. Background music     – every ambience bed + a live readout
//   5. Which scenes use what – for each sound, the live scenes that play it
//   Settings & voice        – the real Parent Settings switches + "voice is speaking" ducking

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { sfx, ROLES } from '../lib/audio/sfx';
import { ROLE_IDS } from '../lib/audio/sfxNames';
import { ambience, BEDS } from '../lib/audio/ambience';
import { isSfxOn, isAmbientOn, setSoundPref, subscribeSoundPrefs } from '../lib/utils/soundPrefs';
import usageData from './soundUsage.generated.json';

const SAMPLE_LINE = "Let's find the modak together!";

// What each sound is FOR, in plain words. Grouped so 15 sounds read as 6 ideas.
const GROUPS = [
  { title: 'Touch', blurb: 'Small sounds for the hands.', roles: [
    ['tap', 'Tap', 'Any button or touch.'],
    ['select', 'Pick up', 'Choose or grab an item.'],
    ['place', 'Place', 'An item lands in its spot: food on the plate, a log on the raft, a lily pad.'],
  ] },
  { title: 'Right and wrong', blurb: 'Feedback on an answer. Never a buzzer.', roles: [
    ['correct', 'Right answer', 'The main "yes" chime.'],
    ['softWrong', 'Not quite', 'A gentle wrong try: the approved soft wooden tap. Never punishing. Silent during Sanskrit.'],
  ] },
  { title: 'Discoveries', blurb: 'Something appears or is found.', roles: [
    ['discovery', 'Found something', 'A sparkle when something is found or revealed.'],
    ['bloom', 'Bloom', 'A flower opens or a symbol appears.'],
    ['emotionalGlow', 'Warm glow', 'A tender, emotional moment.'],
  ] },
  { title: 'Big moments', blurb: 'The rewards. Only one plays at a time.', roles: [
    ['powerUnlock', 'Power unlocked', 'A Ganesha power or symbol is earned.'],
    ['celebration', 'Scene complete', 'The scene is finished.'],
    ['zoneComplete', 'Zone complete', 'A whole zone is finished (biggest).'],
  ] },
  { title: 'Helpers', blurb: 'Guide the child without words.', roles: [
    ['idleHint', 'Look here', 'SILENT by design (sound-design patch, 2026-10-09): idle guidance is the visual hint plus the spoken hint, with no chime. Playing it here makes no sound.'],
    ['transition', 'Whoosh', 'Moving between parts of a scene.'],
  ] },
  { title: 'Frog scene', blurb: 'Only the Vakratunda frog rescue.', roles: [
    ['frogHop', 'Frog hop', 'The frog hops.'],
    ['frogReunion', 'Frog reunion', 'The frog reaches its family.'],
  ] },
];
const LABEL = Object.fromEntries(GROUPS.flatMap((g) => g.roles.map(([id, label]) => [id, label])));

// Friendly names for the files the scanner finds. Anything missing falls back to the file name.
const SCENE_NAMES = {
  NewModakSceneV7: 'Modak', PondSceneSimplifiedV4: 'Pond', SymbolMountainSceneV3: 'Tusk',
  SacredAssemblySceneV8: 'Sacred Assembly',
  VakratundaGroveSimplified: 'Vakratunda (Shloka 1)', VakratundaGroveSimplifiedV2: 'Vakratunda Grove v2',
  VakratundaRescueGame: 'Vakratunda Rescue', MahakayaRescueGame: 'Mahakaya Rescue',
  SuryakotiBankSimplified: 'Suryakoti (Shloka 2)', NirvighnamChantSimplified: 'Nirvighnam (Shloka 3)',
  SarvakaryeshuChantSimplified: 'Sarvakaryeshu (Shloka 4)', ShlokaRiverFinale: 'Shloka Finale',
  Familytreegame: 'Family Tree', Favoritefoodgame: 'Favourite Food', Namebirthdaygame: 'Name & Birthday',
  MyIndianStoryGame: 'My Indian Story', ObstacleRemoverGame: 'Dreams (Obstacle Remover)',
  CleanGameWelcomeScreen: 'Home screen', MainWelcomeScreen: 'Welcome screen', ZoneWelcome: 'Zone welcome',
  CleanProfileSelector: 'Profile picker', DeviceChoiceModal: 'Device choice', AppSidebar: 'Sidebar (Shloka)',
  SymbolSidebar: 'Sidebar (Symbol)', InnerMandala: 'Mandala', SymbolAutoReveal: 'Symbol reveal',
};
const sceneName = (file) => {
  const base = file.split('/').pop().replace('.jsx', '');
  return SCENE_NAMES[base] || base.replace(/([a-z])([A-Z])/g, '$1 $2');
};

const css = `
  .sl{font-family:'Nunito',system-ui,sans-serif;color:#2b2118;background:#FFF8E7;min-height:100vh;padding:16px 16px 80px;max-width:1100px;margin:0 auto}
  .sl h1,.sl h2,.sl h3{font-family:'Baloo 2',system-ui,sans-serif;margin:0}
  .sl h1{font-size:30px;color:#FF5722}
  .sl h2{font-size:22px;margin:30px 0 4px;border-bottom:3px solid #FFD700;padding-bottom:4px}
  .sl h3{font-size:17px;margin:14px 0 2px;color:#795548}
  .sl p.note{margin:4px 0 10px;font-size:14px;color:#6b5a48;line-height:1.45}
  .sl .card{background:#fff;border:1px solid #ecd9b3;border-radius:14px;padding:12px 14px;margin-bottom:10px}
  .sl .start{background:#fff3d0;border-color:#FFD700}
  .sl .start ol{margin:6px 0 0 18px;padding:0;line-height:1.6}
  .sl .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
  .sl button{font-family:'Baloo 2',system-ui,sans-serif;font-size:16px;min-height:48px;min-width:60px;padding:6px 16px;border-radius:12px;border:2px solid #FF5722;background:#fff;color:#c2410c;cursor:pointer}
  .sl button.go{background:#FF5722;color:#fff}
  .sl button.on{background:#FFD700;border-color:#b8860b;color:#3b2a00}
  .sl button.sm{min-height:44px;font-size:14px;padding:4px 12px}
  .sl code{background:#f6ecd5;border-radius:6px;padding:1px 6px;font-size:12px}
  .sl .ok{color:#2E7D32;font-weight:700}.sl .bad{color:#c62828;font-weight:700}.sl .warn{color:#b45309;font-weight:700}
  .sl .exp{font-size:13px;color:#6b5a48;flex:1;min-width:200px}
  .sl .log div{padding:3px 8px;border-radius:8px;font-size:14px}
  .sl .log div.now{background:#FFD700;font-weight:700}
  .sl .sound{display:flex;gap:12px;align-items:center;padding:8px 0;border-bottom:1px solid #f4e8cc}
  .sl .sound:last-child{border-bottom:0}
  .sl .sound .name{min-width:150px;font-family:'Baloo 2',sans-serif;font-size:17px}
  .sl .sound .when{flex:1;font-size:14px;color:#4a3a2a}
  .sl .badge{font-size:12px;border-radius:999px;padding:2px 10px;background:#e8f5e9;color:#2E7D32;white-space:nowrap}
  .sl .badge.none{background:#fff1e0;color:#b45309}
  .sl .tech{font-size:12px;color:#8a7a68;margin-top:2px}
  .sl .chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
  .sl .chip{background:#fff3d0;border:1px solid #f0dca0;border-radius:999px;padding:3px 10px;font-size:13px}
  .sl .chip b{color:#c2410c}
  .sl .usage-row{padding:10px 0;border-bottom:1px solid #f4e8cc}
  .sl .usage-row:last-child{border-bottom:0}
`;

export default function SoundLab() {
  const [sfxOn, setSfxOn] = useState(isSfxOn);
  const [ambOn, setAmbOn] = useState(isAmbientOn);
  const [voManual, setVoManual] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [tick, setTick] = useState(0);
  const [bed, setBed] = useState(null);
  const [log, setLog] = useState([]);
  const [nowStep, setNowStep] = useState(-1);
  const [tech, setTech] = useState(false);
  const releaseRef = useRef(null);
  const timersRef = useRef([]);

  const voiceActive = voManual || speaking;

  useEffect(() => subscribeSoundPrefs((kind, on) => {
    if (kind === 'sfx') setSfxOn(on);
    if (kind === 'ambience') setAmbOn(on);
  }), []);

  useEffect(() => {
    sfx.setVoiceActive(voiceActive);
    ambience.setVoiceActive(voiceActive);
  }, [voiceActive]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { sfx.preload(); }, []);
  useEffect(() => () => { timersRef.current.forEach(clearTimeout); releaseRef.current?.(); sfx.setVoiceActive(false); ambience.setVoiceActive(false); }, []);

  const roles = useMemo(() => sfx.roles(), []);
  const amb = ambience.debug(); // re-read every render; `tick` re-renders us 4x a second
  void tick;

  const say = (msg) => setLog((l) => [`${new Date().toLocaleTimeString()}  ${msg}`, ...l].slice(0, 40));
  const at = (ms, fn) => { const id = setTimeout(fn, ms); timersRef.current.push(id); };
  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };

  const play = (role) => { sfx.play(role); say(`played "${LABEL[role] || role}"`); };
  const playSynth = (role) => { const d = ROLES[role]; d.fallback(d.vol * 0.85); say(`built-in stand-in for "${LABEL[role] || role}"`); };

  const speak = () => {
    if (!('speechSynthesis' in window)) { say('speechSynthesis not available in this browser'); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(SAMPLE_LINE);
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    say('voice speaking: effects drop 30%, background music halves while it talks');
  };

  const chooseBed = (id) => {
    releaseRef.current?.();
    releaseRef.current = ambience.play(id);
    setBed(id);
    say(`background music: ${id}`);
  };
  const stopBed = () => { releaseRef.current?.(); releaseRef.current = null; setBed(null); say('background music released'); };

  // ── Rule tests ─────────────────────────────────────────────────────────────
  const tests = [
    {
      name: 'Sparkle then chime, 80 ms apart',
      expect: 'ONE sound: the sparkle. The weaker chime is dropped. (Used to be two sounds stacked.)',
      run: () => { play('discovery'); at(80, () => play('correct')); },
    },
    {
      name: 'Small reward then big reward, 100 ms apart',
      expect: 'The chime fades out fast and the celebration takes over. No pile-up.',
      run: () => { play('correct'); at(100, () => play('celebration')); },
    },
    {
      name: 'Two rewards 600 ms apart',
      expect: 'BOTH play in full. The "one at a time" window is only 0.4 s.',
      run: () => { play('correct'); at(600, () => play('discovery')); },
    },
    {
      name: 'Wrong, then right',
      expect: 'Soft "not quite", then the right-answer chime. A wrong sound is never blocked.',
      run: () => { play('softWrong'); at(700, () => play('correct')); },
    },
    {
      name: 'Sanskrit guard: tap + place while a syllable speaks',
      expect: 'The syllable ("tunda") plays alone. The tap at 0.3 s is dropped. The place at 0.5 s is held and plays just AFTER the syllable ends.',
      run: () => {
        const a = new Audio('/audio/syllables/tunda-vakratunda.mp3');
        sfx.guardAudio(a);
        a.play().catch(() => say('syllable file could not play'));
        at(300, () => sfx.play('tap'));
        at(500, () => sfx.play('place'));
        say('syllable started; tap at 0.3 s, place at 0.5 s');
      },
    },
    {
      name: 'Tap spam: 6 taps in 150 ms',
      expect: 'About 2 taps heard, not 6.',
      run: () => { [0, 25, 50, 75, 100, 125].forEach((ms) => at(ms, () => sfx.play('tap'))); say('6 taps fired'); },
    },
  ];

  // ── Mock scene ─────────────────────────────────────────────────────────────
  const scene = [
    [0,     'ARRIVE: whoosh + scene music fades in', () => { sfx.play('transition'); releaseRef.current?.(); releaseRef.current = ambience.play('scene', { volume: 0.1 }); setBed('scene'); }],
    [1800,  'Opening voice (music and effects duck)', () => { speak(); }],
    [5200,  'EXPLORE: tap', () => sfx.play('tap')],
    [6000,  'EXPLORE: tap', () => sfx.play('tap')],
    [7000,  'ACT: wrong answer (soft)', () => sfx.play('softWrong')],
    [8200,  'ACT: right answer', () => sfx.play('correct')],
    [9400,  'ACT: right answer again', () => sfx.play('correct')],
    [11000, 'PROGRESS: something found', () => sfx.play('discovery')],
    [12800, 'PROGRESS: bloom', () => sfx.play('bloom')],
    [15000, 'EARN: power unlocked', () => sfx.play('powerUnlock')],
    [17200, 'COMPLETE: celebration', () => sfx.play('celebration')],
    [21000, 'EXIT: whoosh, back to the map music', () => { sfx.play('transition'); releaseRef.current?.(); releaseRef.current = ambience.play('map'); setBed('map'); }],
  ];
  const runScene = () => {
    clearTimers();
    setNowStep(-1);
    scene.forEach(([ms, label, fn], i) => at(ms, () => { setNowStep(i); say(label); fn(); }));
    at(24000, () => setNowStep(-1));
  };
  const stopScene = () => { clearTimers(); window.speechSynthesis?.cancel(); setSpeaking(false); setNowStep(-1); say('mock scene stopped'); };

  // ── Usage (generated by scripts/sound-usage.mjs) ────────────────────────────
  const usage = usageData.rows;
  const scenesFor = (role) => usage
    .filter((r) => r.counts[role])
    .map((r) => ({ name: sceneName(r.file), n: r.counts[role] }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const unusedRoles = roles.filter((r) => !usage.some((u) => u.counts[r]));
  const rolesMismatch = ROLE_IDS.join() !== roles.join();

  const status = (role) => {
    const s = sfx.isLoaded(role);
    if (s === true) return <span className="ok">file ready</span>;
    if (s === false) return <span className="bad">file missing → stand-in plays</span>;
    return <span className="warn">loading…</span>;
  };

  return (
    <div className="sl">
      <style>{css}</style>
      <h1>🔊 Sound Lab</h1>
      <p className="note">A dev-only page to hear every sound in the app, check the rules between them, and see which scenes use what. Tap anything to hear it. Turn your volume up first: browsers stay silent until you tap.</p>

      <div className="card start">
        <h3 style={{ marginTop: 0 }}>Start here (about 3 minutes)</h3>
        <ol>
          <li>Press <b>▶ Run a whole scene</b> in section 1 and listen from start to finish.</li>
          <li>Skim <b>2 · The sounds</b> and press Play on anything that surprised you.</li>
          <li>Press <b>▶ Run</b> on each line in <b>3 · Check the rules</b> and compare with the “Expect” text.</li>
        </ol>
      </div>

      <h2>1 · Hear a whole scene</h2>
      <p className="note">A 24-second pretend scene using the real sounds in the real order. Listen for: calm start, quiet music under the voice, a gentle “not quite”, one clean reward at a time, a bigger moment for the unlock, then the celebration.</p>
      <div className="card">
        <div className="row"><button className="go" onClick={runScene}>▶ Run a whole scene</button><button onClick={stopScene}>■ Stop</button></div>
        <div className="log" style={{ marginTop: 8 }}>
          {scene.map(([ms, label], i) => <div key={ms + label} className={i === nowStep ? 'now' : ''}>{(ms / 1000).toFixed(1)}s · {label}</div>)}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Settings and voice</h3>
        <p className="note" style={{ margin: '2px 0 8px' }}>The same switches parents use in Settings. Turn effects off, then play anything: it must stay silent.</p>
        <div className="row">
          <button className={sfxOn ? 'on' : ''} onClick={() => setSoundPref('sfx', !sfxOn)}>Sound effects: {sfxOn ? 'ON' : 'OFF'}</button>
          <button className={ambOn ? 'on' : ''} onClick={() => setSoundPref('ambience', !ambOn)}>Background music: {ambOn ? 'ON' : 'OFF'}</button>
          <button className={voManual ? 'on' : ''} onClick={() => setVoManual((v) => !v)}>Pretend a voice is speaking: {voManual ? 'YES' : 'no'}</button>
          <button className="go" onClick={speak}>🗣 Speak a sample line</button>
          <span className="exp">Voice quieting now: <b>{voiceActive ? 'ACTIVE' : 'off'}</b></span>
        </div>
      </div>

      <h2>2 · The sounds</h2>
      <p className="note">{roles.length} sounds in 6 groups. “Used in” counts the live scenes and screens that play each one (see section 5).</p>
      <div className="row" style={{ marginBottom: 8 }}>
        <button className="sm" onClick={() => setTech((t) => !t)}>{tech ? 'Hide' : 'Show'} technical details</button>
      </div>
      {GROUPS.map((g) => (
        <div className="card" key={g.title}>
          <h3 style={{ marginTop: 0 }}>{g.title} <span className="exp" style={{ fontWeight: 400 }}>· {g.blurb}</span></h3>
          {g.roles.map(([id, label, when]) => {
            const used = scenesFor(id).length;
            return (
              <div className="sound" key={id}>
                <button className="go sm" onClick={() => play(id)}>▶ Play</button>
                <div className="name">{label}</div>
                <div className="when">
                  {when}
                  {tech && (
                    <div className="tech">
                      <code>{id}</code> · file <code>{ROLES[id].src.replace('/audio/', '')}</code> · level {ROLES[id].vol} · reward rank {ROLES[id].priority} · {status(id)}{' '}
                      <button className="sm" onClick={() => playSynth(id)} style={{ minHeight: 32, padding: '0 10px' }}>hear built-in stand-in</button>
                    </div>
                  )}
                </div>
                <span className={`badge ${used ? '' : 'none'}`}>{used ? `used in ${used}` : 'not used yet'}</span>
              </div>
            );
          })}
        </div>
      ))}

      <h2>3 · Check the rules</h2>
      <p className="note">Each button fires a tricky combination. Read the “Expect” text, press Run, and confirm your ears agree.</p>
      <div className="card">
        {tests.map((t) => (
          <div className="row" key={t.name} style={{ marginBottom: 8 }}>
            <button className="sm go" onClick={t.run}>▶ Run</button>
            <b style={{ minWidth: 260 }}>{t.name}</b>
            <span className="exp">Expect: {t.expect}</span>
          </div>
        ))}
      </div>

      <h2>4 · Background music</h2>
      <p className="note">Only one background track plays at a time. Switch between them and watch the line under the buttons.</p>
      <div className="card">
        <div className="row">
          {Object.keys(BEDS).map((id) => (
            <button key={id} className={bed === id ? 'on' : ''} onClick={() => chooseBed(id)}>{id}</button>
          ))}
          <button onClick={stopBed}>■ Stop music</button>
        </div>
        <p className="note">
          Now playing: <code>{amb.src ? decodeURIComponent(amb.src).replace('/audio/', '') : 'nothing'}</code> ·{' '}
          {amb.paused ? <span className="warn">paused</span> : <span className="ok">playing</span>} · volume <b>{amb.volume}</b>
          {amb.wantedVol != null && <> (aiming for {amb.wantedVol}{amb.voiceActive ? ', halved while a voice speaks' : ''})</>}
        </p>
        <p className="note">Try: <b>welcome → scene</b> (same track: it should glide, not restart) · <b>welcome → map</b> (different tracks: should cross-fade) · turn Background music OFF above (fades out) and ON (returns) · switch to another browser tab (it pauses).</p>
      </div>

      <h2>5 · Which scenes use what</h2>
      <p className="note">
        For each sound, the live scenes and screens that play it, with the number of times each calls it.
        Use it to spot an action that sounds different from scene to scene: for example, if “Right answer” is missing from a scene that has answers, that scene is using a different sound for the same thing.
        {' '}{usageData.scanned} files scanned, {usage.length} play sounds · updated {new Date(usageData.generatedAt).toLocaleString()} · refresh with <code>npm run sound-usage</code> then reload. Backups, copies, parked and obsolete zones are left out.
      </p>
      {rolesMismatch && <p className="bad">sfxNames.js ROLE_IDS no longer matches ROLES in sfx.js: fix one of them.</p>}
      <div className="card">
        {GROUPS.flatMap((g) => g.roles).map(([id, label]) => {
          const list = scenesFor(id);
          return (
            <div className="usage-row" key={id}>
              <b style={{ fontFamily: "'Baloo 2',sans-serif" }}>{label}</b>{' '}
              {list.length === 0
                ? <span className="badge none">no live scene plays this yet</span>
                : <span className="badge">{list.length} {list.length === 1 ? 'place' : 'places'}</span>}
              {list.length > 0 && (
                <div className="chips">
                  {list.map((s) => <span className="chip" key={s.name}>{s.name}{s.n > 1 && <b> ×{s.n}</b>}</span>)}
                </div>
              )}
            </div>
          );
        })}
        {unusedRoles.length > 0 && <p className="note" style={{ marginTop: 10 }}><b>Not used anywhere yet:</b> {unusedRoles.map((r) => LABEL[r] || r).join(', ')}</p>}
      </div>

      <h2>Log</h2>
      <div className="card log">{log.length ? log.map((l, i) => <div key={i}>{l}</div>) : <div>Nothing yet. Tap something.</div>}</div>
    </div>
  );
}
