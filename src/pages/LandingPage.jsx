// LandingPage.jsx — GMB marketing landing page
// -----------------------------------------------------------------------------
// Merged from 11 standalone HTML mockups (screens 1–10 + strip + founder + faq)
// into ONE React page. See LandingPage.css for the token-consolidation and
// per-section selector-scoping notes.
//
// Wiring: rendered by App.jsx when currentView === 'landing'. Every "Start
// Free" button (hero, sticky bottom bar, final CTA) opens the SAME shared
// DeviceChoiceModal used by MainWelcomeScreen — "Continue here" calls the
// onStartFree prop (App's handleStartAdventure); "Send to iPad" hits the
// existing /.netlify/functions/send-continuation endpoint inside the modal.
//
// STATUS (per Madhurima, 2026-09-03):
//   1. Zone names — CONFIRMED as the new marketing names (Modak Mountain /
//      Shloka River / Lambodara Lodge / Lotus Square / Tusk Treehouse). These
//      intentionally differ from the in-app zone names.
//   2. All placeholder emoji removed per Madhurima (📱 strip icon, 🐘 founder
//      mark, 🌱 first-families note). The section-7 "For parents" strip was
//      also removed — the Family bridge section already carries that message.
//   3. All "Start Free" buttons share one action: the shared DeviceChoiceModal.
//      CONFIRMED. No marketing href/destination.
//   4. This 'landing' view stays OPT-IN (?view=landing). CONFIRMED — the app's
//      'main-welcome' remains the default so returning users go straight to
//      their saved profile, not back through the Start Free funnel.
//   5. No hamburger / nav menu — removed until there's a real menu to open.
//      Add trigger + menu together (TASKS.md T50).
// -----------------------------------------------------------------------------

import React, { useCallback, useEffect, useRef, useState } from 'react';
import DeviceChoiceModal from '../lib/components/navigation/DeviceChoiceModal';
import './LandingPage.css';

const IMG = '/images/landing';

/* ---------------------------------------------------------------------------
   Section 5 — zone carousel (CSS scroll-snap; dots track scroll position)
   --------------------------------------------------------------------------- */
const ZONES = [
  { img: `${IMG}/zone-modak-mountain.webp`,  name: 'Modak Mountain',  copy: "Discover what Ganesha's symbols mean." },
  { img: `${IMG}/zone-shloka-river.webp`,   name: 'Shloka River',    copy: 'Hear, say and understand shlokas.' },
  { img: `${IMG}/zone-lambodara-lodge.webp`, name: 'Lambodara Lodge', copy: 'Get to know Ganesha better.' },
  { img: `${IMG}/zone-lotus-square.webp`,    name: 'Lotus Square',    copy: 'Celebrate through making, music and play.', comingSoon: true },
  { img: `${IMG}/zone-tusk-treehouse.webp`,  name: 'Tusk Treehouse',  copy: 'Explore Ganesha’s stories and create your own.', comingSoon: true },
];

function ZoneCarousel() {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = [...track.children];
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((card, i) => {
      const cardMid = card.offsetLeft + card.offsetWidth / 2;
      const d = Math.abs(cardMid - mid);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    setActive(best);
  }, []);

  return (
    <>
      <div
        className="lp-zones__carousel"
        ref={trackRef}
        onScroll={onScroll}
        aria-label="Ganesha Land destinations"
      >
        {ZONES.map((z) => (
          <article
            key={z.name}
            className={`lp-zone-card${z.comingSoon ? ' is-coming-soon' : ''}`}
          >
            <div className="lp-zone-card__image">
              <img src={z.img} alt={z.name} loading="lazy" />
              {z.comingSoon && <span className="lp-zone-card__badge">Coming soon</span>}
            </div>
            <div className="lp-zone-card__copy">
              <h3>{z.name}</h3>
              <p>{z.copy}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="lp-zones__dots" aria-hidden="true">
        {ZONES.map((z, i) => (
          <span key={z.name} className={`dot${i === active ? ' active' : ''}`} />
        ))}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------------
   Section 7 — "Beyond the game" carousel (JS-driven prev/active/next,
   ported from the mockup's inline <script>)
   --------------------------------------------------------------------------- */
const BEYOND = [
  {
    icon: `${IMG}/beyond-daily-dare.webp`,
    kicker: 'Try it',
    title: 'Daily Dare',
    main: 'Find another way today.',
    star: false,
  },
  {
    icon: `${IMG}/beyond-affirmation.webp`,
    kicker: 'A thought to remember',
    title: 'Affirmation',
    main: '“I can find another way.”',
    star: true,
  },
  {
    icon: `${IMG}/beyond-offline-tools.webp`,
    kicker: 'Do it together',
    title: 'Offline Tools',
    main: 'Table Talk • Mindful Moment • Try It Together',
    tools: true,
  },
];

function BeyondCarousel() {
  const [current, setCurrent] = useState(1);
  const n = BEYOND.length;
  const classFor = (i) => {
    if (i === current) return 'lp-beyond-card is-active';
    if (i === (current - 1 + n) % n) return 'lp-beyond-card is-prev';
    if (i === (current + 1) % n) return 'lp-beyond-card is-next';
    return 'lp-beyond-card';
  };

  return (
    <>
      <div className="lp-beyond__carousel">
        {BEYOND.map((c, i) => (
          <article key={c.title} className={classFor(i)} data-index={i}>
            <div className="lp-beyond-card__circle"><img src={c.icon} alt="" loading="lazy" /></div>
            <div className="lp-beyond-card__kicker-row">
              <span className="line" /><span className="lp-beyond-card__kicker">{c.kicker}</span><span className="line" />
            </div>
            <h3>{c.title}</h3>
            {c.star && <div className="lp-beyond-card__star">✦</div>}
            <p className={`lp-beyond-card__main${c.tools ? ' is-tools' : ''}`}>{c.main}</p>
          </article>
        ))}
      </div>

      <div className="lp-beyond__controls">
        {BEYOND.map((c, i) => (
          <button
            key={c.title}
            type="button"
            className={`dot${i === current ? ' active' : ''}`}
            aria-label={c.title}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>

      <div className="lp-beyond__tabs">
        {BEYOND.map((c, i) => (
          <button
            key={c.title}
            type="button"
            className={`lp-beyond__tab${i === current ? ' active' : ''}`}
            onClick={() => setCurrent(i)}
          >
            <img src={c.icon} alt="" loading="lazy" /> <span>{c.title}</span>
          </button>
        ))}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------------
   Section 10 — FAQ (native <details>; content from the faq mockup)
   --------------------------------------------------------------------------- */
const FAQS = [
  { q: 'Is Ganesha My Bestie free?', a: 'Yes — the beta is completely free for the first families joining us. No credit card, no hidden cost.', open: true },
  { q: 'What ages is it for?', a: 'GMB is designed for children ages 5–10. Games adjust in tone and complexity as your child grows.' },
  { q: 'Do I need to install anything?', a: "No app store needed. GMB runs right in the browser — tap Start Free and you're in." },
  { q: 'Does it work on phone and iPad?', a: "Yes, though GMB is designed to feel best on a bigger screen. We'll always let you continue on iPad if you'd like more room to play." },
  { q: "Is my child's data safe?", a: "We only ask for a parent email — never a child's. Nothing is shared with third parties, and you're always in control." },
  { q: 'What if my child gets stuck?', a: 'There are no fail states or timers in GMB. Every game gently guides your child toward trying again, at their own pace.' },
];

/* =========================================================================
   PAGE
   ========================================================================= */
export default function LandingPage({ onStartFree = () => {} }) {
  const [showDeviceChoice, setShowDeviceChoice] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [bottomBarVisible, setBottomBarVisible] = useState(false);

  const heroSentinelRef = useRef(null);   // bottom of hero — bar appears once past it
  const finalCtaRef = useRef(null);       // Screen 10 CTA — bar hides while it's on screen

  const openDeviceChoice = useCallback(() => setShowDeviceChoice(true), []);

  // Entering the app from the landing page: drop ?view=landing from the URL
  // first, so a later reload lands the user back in the app (their profile /
  // adventure) instead of bouncing to the marketing page again.
  const enterApp = useCallback(() => {
    try {
      window.history.replaceState({}, '', window.location.pathname + window.location.hash);
    } catch {
      /* history API unavailable — proceed anyway */
    }
    onStartFree();
  }, [onStartFree]);

  // Sticky-header shadow on scroll
  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Sticky bottom CTA bar visibility:
  //   show   = hero sentinel has scrolled out of view (user is past the hero)
  //   hide   = the final CTA is intersecting (don't compete with Screen 10)
  useEffect(() => {
    const state = { pastHero: false, finalVisible: false };
    const apply = () => setBottomBarVisible(state.pastHero && !state.finalVisible);

    const heroObs = new IntersectionObserver(
      ([e]) => { state.pastHero = !e.isIntersecting; apply(); },
      { rootMargin: '-64px 0px 0px 0px' } // account for the fixed header
    );
    const finalObs = new IntersectionObserver(
      ([e]) => { state.finalVisible = e.isIntersecting; apply(); },
      { threshold: 0.01 }
    );

    if (heroSentinelRef.current) heroObs.observe(heroSentinelRef.current);
    if (finalCtaRef.current) finalObs.observe(finalCtaRef.current);
    return () => { heroObs.disconnect(); finalObs.disconnect(); };
  }, []);

  const rootRef = useRef(null);
  const scrollTop = () => rootRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="landing-page" ref={rootRef}>
      {/* ---------- SHARED STICKY HEADER (replaces screens 1/2/3/3b headers) ----------
          No hamburger yet — there's no menu to put behind it. Add the menu +
          trigger together when it actually does something (TASKS.md T50). */}
      <header className={`lp-header${headerScrolled ? ' is-scrolled' : ''}`}>
        <div className="lp-header__inner">
          <button className="lp-header__logo" onClick={scrollTop}>Ganesha My Bestie</button>
        </div>
      </header>

      <div className="lp-shell">
        {/* ================= 1 — HERO ================= */}
        <section className="lp-hero">
          <h1>A playful way to<br />grow up with Ganesha.</h1>
          <p className="lp-hero__subline">Discover Ganesha's symbols and shlokas through play.</p>

          <div className="lp-hero__visual">
            <div className="lp-hero__blob" />
            <div className="lp-hero__device">
              <img src={`${IMG}/hero-gameplay.webp`} alt="GMB gameplay" />
            </div>
            <img className="lp-hero__ganesha" src={`${IMG}/ganesha-hero.webp`} alt="Ganesha" />
          </div>

          <div className="lp-hero__usp-row">
            <span className="lp-hero__usp">Little games. Big ideas.</span>
            <span className="lp-hero__pill">⏱ Under 5 min</span>
          </div>

          <div className="lp-hero__cta-wrap">
            <button className="lp-cta" type="button" onClick={openDeviceChoice}>Start Free</button>
          </div>

          <p className="lp-hero__trust">Early beta • Ages 5–10 • No ads</p>
        </section>

        {/* sentinel: once this scrolls above the header, the sticky bottom bar appears */}
        <div ref={heroSentinelRef} aria-hidden="true" style={{ height: 1 }} />

        {/* ================= 2 — NO APP STORE STRIP ================= */}
        <section className="lp-strip">
          <p><span>No app store needed</span> — just tap and play.</p>
        </section>

        {/* ================= 3 — VAKRATUNDA PROOF ================= */}
        <section className="lp-proof">
          <svg className="lp-proof__bg" viewBox="0 0 390 650" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 26 C38 10, 76 17, 112 14 C151 10, 186 20, 224 15 C270 9, 312 5, 350 14 C367 18, 379 14, 390 5 L390 608 C350 619, 315 615, 281 622 C240 630, 203 641, 163 635 C122 629, 87 616, 50 621 C30 624, 14 617, 0 610 Z" fill="#CDC1E3" />
          </svg>
          <div className="lp-proof__content">
            <div className="lp-eyebrow">✦ See how GMB works</div>
            <h2>The way is blocked.<br />What else could work?</h2>
            <p className="lp-proof__intro">Children play through the idea —<br />then discover what it means.</p>
            <div className="lp-proof__frame">
              <img src={`${IMG}/vakratunda-gameplay.webp`} alt="Vakratunda gameplay showing a blocked path" loading="lazy" />
            </div>
            <div className="lp-proof__method">Play. Discover. Try.</div>
            <div className="lp-proof__takeaway">
              <div className="lp-proof__takeaway-label">Vakratunda</div>
              <div className="lp-proof__takeaway-text">"I can find another way."</div>
            </div>
          </div>
        </section>

        {/* ================= 4 — GANESHA LAND MAP ================= */}
        <section className="lp-map">
          <div className="lp-map__copy">
            <h2>Go on an<br />adventure in<br />Ganesha Land</h2>
            <p>Explore different places and get to know<br />your Bestie Ganesha along the way.</p>
          </div>
          <div className="lp-map__visual">
            <svg className="lp-map__blob" viewBox="0 0 390 520" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 50 C35 26, 74 20, 111 29 C151 39, 182 28, 217 22 C258 16, 292 35, 327 27 C352 22, 373 16, 390 30 L390 435 C368 450, 345 456, 323 455 C290 453, 266 471, 239 487 C204 507, 165 502, 136 485 C107 467, 80 467, 53 477 C31 486, 13 478, 0 463 Z" fill="#CDC1E3" />
            </svg>
            <div className="lp-map__content">
              <div className="lp-map__frame">
                {/* NOTE: source PNG is ~2.6 MB — flagged for compression before staging */}
                <img src={`${IMG}/ganesha-land-map.webp`} alt="Ganesha Land map showing Modak Mountain, Shloka River, Lambodara Lodge, Lotus Square and Tusk Treehouse" loading="lazy" />
              </div>
              <p className="lp-map__closing">Every adventure helps your child<br />get to know their Bestie Ganesha<br />a little better.</p>
            </div>
          </div>
        </section>

        {/* ================= 5 — ZONE CAROUSEL ================= */}
        <section className="lp-zones">
          <div className="lp-zones__copy">
            <div className="lp-eyebrow">✦ Explore GMB</div>
            <h2>Pick a place to begin.</h2>
            <p>Each little adventure helps your child get to know their Bestie Ganesha better.</p>
          </div>
          {/* NOTE: zone names here do NOT match the live app — flagged, left as designed */}
          <ZoneCarousel />
        </section>

        {/* ================= 6 — SYMBOLS ================= */}
        <section className="lp-symbols">
          <div className="lp-symbols__copy">
            <div className="lp-eyebrow">✦ What children discover</div>
            <h2>Big ideas in Ganesha's<br /><span className="accent">symbols.</span></h2>
          </div>
          <div className="lp-symbols__stage">
            <svg className="lp-symbols__bg" viewBox="0 0 390 520" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 48 C42 22, 88 30, 128 24 C174 17, 212 30, 254 23 C298 16, 346 20, 390 43 L390 462 C350 478, 317 470, 280 481 C239 494, 205 503, 165 493 C126 483, 92 470, 57 480 C33 487, 14 479, 0 464 Z" fill="#F3ECFA" />
            </svg>
            <img className="lp-symbols__ganesha" src={`${IMG}/ganesha-main.webp`} alt="Ganesha" loading="lazy" />

            {/* NOTE: screen5 mockup had its icon `src`s rotated (ear label showed
                the lotus art, etc.). Icon files were renamed on disk to match
                their actual content, so label↔icon now line up correctly. */}
            {[
              { pos: 'pos-ears', icon: 'symbol-ears.webp', name: 'Big ears', quality: 'Listening' },
              { pos: 'pos-trunk', icon: 'symbol-trunk.webp', name: 'Curved trunk', quality: 'Flexible thinking' },
              { pos: 'pos-lotus', icon: 'symbol-lotus.webp', name: 'Lotus', quality: 'Calm' },
              { pos: 'pos-mooshika', icon: 'symbol-mooshika.webp', name: 'Mooshika', quality: 'Focus' },
              { pos: 'pos-modak', icon: 'symbol-modak.webp', name: 'Modak', quality: 'Sweetness' },
            ].map((s) => (
              <div key={s.name} className={`lp-symbol-callout ${s.pos}`}>
                <div className="lp-symbol-callout__circle"><img src={`${IMG}/${s.icon}`} alt="" loading="lazy" /></div>
                <div className="lp-symbol-callout__pill">
                  <div className="lp-symbol-callout__name">{s.name}</div>
                  <div className="lp-symbol-callout__quality">{s.quality}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= 7 — BEYOND THE GAME ================= */}
        <section className="lp-beyond">
          <div className="lp-beyond__copy">
            <span className="lp-beyond__sparkle s1">✦</span>
            <span className="lp-beyond__sparkle s2">✦</span>
            <span className="lp-beyond__sparkle s3">✦</span>
            <span className="lp-beyond__sparkle s4">✦</span>
            <div className="lp-eyebrow">✦ Beyond the game</div>
            <h2>The game doesn't end<br />when the screen does.</h2>
            <p>Each GMB adventure leaves children with something to remember, try or practise in everyday life.</p>
          </div>

          <div className="lp-beyond__stage">
            <svg className="lp-beyond__curve" viewBox="0 0 390 44" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0,44 C97,4 293,4 390,44 L390,0 L0,0 Z" fill="#fff9f1" />
            </svg>

            <div className="lp-beyond__ganesha-wrap">
              <img className="lp-beyond__ganesha" src={`${IMG}/ganesha-main.webp`} alt="Ganesha" loading="lazy" />
              <div className="lp-beyond__bubble">Big ideas.<br />Little steps.</div>
            </div>

            <BeyondCarousel />
            {/* "For parents" strip removed — the next section (Family bridge)
                already carries the same parent message. */}
          </div>
        </section>

        {/* ================= 8 — FAMILY BRIDGE ================= */}
        <section className="lp-family">
          <div className="lp-family__copy">
            <div className="lp-eyebrow">✦ Made for families</div>
            <h2>Built for children to explore.<br />Designed for parents to stay connected.</h2>
          </div>
          <div className="lp-family__stage">
            <svg className="lp-family__bg" viewBox="0 0 390 720" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 42 C46 24, 90 30, 132 24 C176 17, 214 29, 257 22 C302 16, 349 19, 390 39 L390 672 C350 684, 316 678, 280 688 C239 699, 204 706, 164 698 C125 690, 90 679, 55 688 C31 694, 13 685, 0 671 Z" fill="#EFE7F8" />
            </svg>
            <div className="lp-family__content">
              <article className="lp-family-card">
                <div className="lp-family-card__label">Mostly independent for children</div>
                <h3>Explore with confidence.</h3>
                <p>Voice guidance and simple hints help children move through GMB on their own.</p>
                <div className="lp-family__chips">
                  <span>Voice guidance</span><span>Simple hints</span><span>Safe &amp; ad-free</span>
                </div>
              </article>
              <article className="lp-family-card">
                <div className="lp-family-card__label">A simple bridge for parents</div>
                <h3>Continue the idea together.</h3>
                <p>See what your child explored and one simple way to continue it in everyday life.</p>
                <div className="lp-family__example">
                  <div className="lp-family__example-block">
                    <div className="lp-family__example-label">Today's takeaway</div>
                    <div className="lp-family__example-text">"I can find another way."</div>
                  </div>
                  <div className="lp-family__example-block">
                    <div className="lp-family__example-label">Try together</div>
                    <div className="lp-family__example-text">"What else could you try?"</div>
                  </div>
                </div>
              </article>
              <div className="lp-family__short-strip">
                <strong>Short by design</strong>
                <span>Most experiences under 5 minutes</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 9 — FOUNDER NOTE ================= */}
        <section className="lp-founder">
          <div className="lp-founder__divider" />
          <div className="lp-founder__kicker">The thought behind GMB</div>
          <h2>How Ganesha My Bestie was born</h2>
          <div className="lp-founder__body">
            <p>For more than 20 years, my work with children has focused on helping them experience an idea, think about what it means, and try it for themselves — rather than simply being told the answer.</p>
            <p>GMB grew from that same belief: bring the meaning behind Ganesha's symbols and shlokas to life through play, then give children a small way to carry it into everyday life.</p>
          </div>
          <div className="lp-founder__signature">
            <div className="lp-founder__label">— Founder, Ganesha My Bestie</div>
          </div>
          <div className="lp-founder__divider bottom" />
        </section>

        {/* ================= 10 — FAQ ================= */}
        <section className="lp-faq">
          <div className="lp-faq__copy">
            <div className="lp-faq__eyebrow">✦ Good to know</div>
            <h2>Questions parents ask us.</h2>
            <p>Quick answers before you start the beta with your child.</p>
          </div>
          <div className="lp-faq__list">
            {FAQS.map((f) => (
              <details key={f.q} className="lp-faq__item" open={f.open}>
                <summary>{f.q}<span className="lp-faq__icon">+</span></summary>
                <div className="lp-faq__answer">{f.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* ================= 11 — FIRST FAMILIES CTA ================= */}
        <section className="lp-final">
          <svg className="lp-final__curve" viewBox="0 0 390 44" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,44 C97,4 293,4 390,44 L390,0 L0,0 Z" fill="#fff9f1" />
          </svg>
          <div className="lp-final__eyebrow">✦ Join us early</div>
          <h2>Be one of our first GMB families.</h2>
          <p className="lp-final__copy">Try the beta with your child. Tell us what they love, where they get stuck, and what stays with them.</p>
          <img className="lp-final__ganesha" src={`${IMG}/ganesha-celebrate.webp`} alt="Ganesha celebrating" loading="lazy" />
          <div className="lp-final__cta-wrap" ref={finalCtaRef}>
            <button className="lp-cta" type="button" onClick={openDeviceChoice}>Start Free</button>
          </div>
          <p className="lp-final__trust">Early beta • Ages 5–10 • No ads</p>
          <div className="lp-final__spot-note">We're starting with a small circle of families</div>
        </section>
      </div>

      {/* ---------- SHARED STICKY BOTTOM CTA BAR ---------- */}
      <div className={`lp-bottombar${bottomBarVisible ? ' is-visible' : ''}`}>
        <div className="lp-bottombar__inner">
          <button className="lp-cta" type="button" onClick={openDeviceChoice}>Start Free</button>
        </div>
      </div>

      {/* ---------- SHARED DEVICE-CHOICE MODAL (same as MainWelcomeScreen) ---------- */}
      <DeviceChoiceModal
        isOpen={showDeviceChoice}
        onClose={() => setShowDeviceChoice(false)}
        onContinueHere={enterApp}
      />
    </div>
  );
}
