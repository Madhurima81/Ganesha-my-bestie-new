# Landing Page Merge — Judgment Calls & Open Items

Merged the 11 mockups in `gmb_landing_screens.zip` into:

- `src/pages/LandingPage.jsx` — one React page, sections in final order
- `src/pages/LandingPage.css` — consolidated styles
- `public/images/landing/` — 19 images extracted from the base64 blobs
- `src/App.jsx` — new `currentView === 'landing'`, opt-in via `?view=landing`
- `index.html` — font load extended with Nunito italic (founder note)

Nothing here is wired to a real signup destination. Not merged to staging.

---

## A. Decisions you already made (applied)

| Question | Your answer | What I did |
|---|---|---|
| Output format | React page + route in the app | `src/pages/LandingPage.jsx`, rendered from `App.jsx` |
| Duplicate headers (screens 1/2/3/3b) | One sticky header, remove duplicates | Single `.lp-header`, fixed, per-section headers deleted |
| Sticky bottom CTA bar | Hide near Screen 10 CTA | Appears once hero scrolls past the header; hides while Screen 10's CTA is in view (two `IntersectionObserver`s). Never shown on the hero itself. |
| Viewport / orientation | Portrait-mobile as designed | 390px centred column, `max-width:360px` tweaks kept, **no** rotate-device overlay on this page (that rule is in-app scenes only) |

---

## B. CSS collisions — how they were resolved

**Approach: consolidate tokens + scope each section.** One `:root`-level token
block on `.landing-page`; every section wrapped in `.lp-<name>` and all its
selectors prefixed. The genuinely-clashing names were:

- `.cta` — hero (280×55) vs screen10 (260×56, different shadow hex). → one
  shared `.lp-cta`; Screen 10 keeps its width/height via `.lp-final__cta-wrap .lp-cta`.
- `.icon-circle` — screen5 (static 72px badge) vs screen6 (absolute, top:-32).
  → `.lp-symbol-callout__circle` vs `.lp-beyond-card__circle`.
- `h2` — 22px–36px across files. → all scoped per section.
- `.curve-top` — screen6 and screen10. → `.lp-beyond__curve` / `.lp-final__curve`.
- `.dot` / `.carousel-dots` — screen3b and screen6. → scoped under
  `.lp-zones__dots` / `.lp-beyond__controls`.
- eyebrow pills — pill style (`.lp-eyebrow`) vs plain-text style
  (`.lp-eyebrow--plain`, used by screens 2 & 3).

### Token hex differences — canonical value picked, originals folded in

| Token | Canonical | Sources it overrode | Notes |
|---|---|---|---|
| purple | `#52306b` | 10 of 11 files already used this | — |
| — hero H1 ink | `#3a2a4a` → kept as `--gmb-ink` | hero `--plum` | Hero's H1 was a **darker** near-black plum, not the brand purple. Kept as a separate ink token so the hero headline still reads as designed. **Flag if you'd rather the hero H1 be `#52306b` like every other heading.** |
| accent | `#7a5ad9` | hero `--purple` `#6A4C9C` | hero's lighter purple folded in |
| — hero CTA/logo | `#5A3D8A` | folded into purple/`--gmb-purple-deep` (`#3d2350`, screen10's shadow value) | |
| — screen5 h2 accent | `#8a6fd8` → `--gmb-violet` | one-off, kept | |
| cream | `#fff9f1` | unanimous | |
| lavender-soft | `#f0e8fa` | screen5 `#f3ecfa`, screen8 `#efe7f8` | within a few %; folded. The screen5 SVG blob fill stays `#F3ECFA` inline (it's art). |
| muted greys | `--gmb-muted #6f6577` + `--gmb-text-soft #6f6380` | founder `#7a6d88`, screen3b `#776d7d`, hero `#6B5B7A`, body-grey `#6f6380` | two tokens instead of six near-identical greys |

No place had a color/font conflict that *couldn't* be reconciled — the palettes
were nearly identical. The only real design divergence is the hero (darker ink,
lighter accent, `cursive` fallback on Baloo 2). Flagged above.

---

## C. Open items — RESOLVED 2026-09-03

1. **Zone names** — CONFIRMED: use the new marketing names (*Modak Mountain,
   Shloka River, Lambodara Lodge, Lotus Square, Tusk Treehouse*). Kept in the
   `ZONES` array; the `.lp-map__frame` alt text was updated to match (was
   inconsistently saying "Mooshika's Hut").

2. **Placeholder emoji** — all removed per Madhurima:
   - section-7 "For parents" strip (held 👪) — removed entirely; the Family
     bridge section right after already carries that message.
   - `📱` strip icon, `🐘` founder mark, `🌱` first-families note — deleted
     (kept the text, dropped the glyphs). `⏱` in the hero "Under 5 min" pill
     is still there (reads as a unit with the copy) — say if that should go too.

3. **"Start Free" destination** — CONFIRMED: all three buttons open the shared
   `DeviceChoiceModal`. "Continue here" → `handleStartAdventure`; "Send to iPad"
   → existing `send-continuation` function. No marketing URL.

4. **Default first-run view** — CONFIRMED: landing stays **opt-in**
   (`?view=landing`). `main-welcome` remains the default so returning users go
   straight to their saved profile instead of back through the Start Free
   funnel. `App.jsx` comment updated to record this.

5. **Oversized images** — DONE. All 17 PNGs converted to WebP with `sharp`
   (q82) and the originals deleted. `public/images/landing/` went from ~13 MB
   to ~0.9 MB. Biggest wins: map 2.7 MB → 83 KB, Lambodara 2.4 MB → 59 KB.
   All 19 assets are now `.webp`; every `src=` in `LandingPage.jsx` updated.
   Email templates were **not** touched (they use their own assets) — the
   Outlook/WebP caution only applies there, and nothing there changed.

6. **Nav menu** — REMOVED (per Madhurima 2026-09-03). The mockups had a
   hamburger with nothing behind it; dropped until there's a real menu to open.
   Add the trigger + menu together — TASKS.md T50.

7. **Breakpoints confirmed against DECISIONS.md.** DECISIONS.md #6 says
   *"Portrait mode = rotate-device overlay, not a portrait layout"* — that's for
   **in-app scenes**. This marketing page is deliberately portrait-first (it's
   viewed on phones held normally), so it does **not** get the rotate overlay and
   introduces no new responsive system beyond the mockups' own
   `@media (max-width:360px)` tweaks. Flag if you want it to match in-app
   orientation handling instead.

---

## C2. Bugs found in the source mockups (fixed)

- **Symbols section (screen5) — icons were rotated.** The mockup's `<img src>`
  assignments didn't match the labels: the "Big ears" callout showed the lotus
  art, "Curved trunk" showed the ear, "Lotus" showed the trunk. Renamed the
  icon files to match their actual content so label ↔ icon now line up. Caught
  in the live preview.
- **App locks `html/body/#root` to `overflow:hidden`** (every other view is a
  single non-scrolling game screen). The landing page is the first scrolling
  view, so `.landing-page` is now `position:fixed; inset:0; overflow-y:auto` —
  its own full-viewport scroll container. Without this the page was clipped at
  one screen with no scroll.

## C3. Still visible in the preview — your call

- **The map artwork itself** (`ganesha-land-map.webp`) has "Mooshika's Hut"
  lettered *into the image*, while the zone carousel card says "Lambodara
  Lodge". Can't fix without new map art. The `<img alt>` was updated to the new
  names; the baked-in label can't be.
- **Sticky bottom bar vs hero CTA.** The bar appears the instant the hero's
  bottom passes under the header — at which point the hero's own "Start Free"
  is just leaving the viewport, so there's a brief moment both are on screen.
  Tighten by moving the sentinel up ~80px if that overlap bothers you.

## D. Things I changed that you should know about

- **`index.html` font URL** now also requests Nunito *italic* (0,400/500 +
  1,400/500). The founder note is set in italic Nunito; without this the browser
  was faux-italicising it. One-line, low-risk, but it's a shared file.
- **Carousels are now React**, not the mockup's inline `<script>`:
  - Zone carousel (screen 3b): CSS scroll-snap kept; dots now track scroll
    position via an `onScroll` handler.
  - "Beyond the game" (screen 6): prev/active/next state ported to `useState`;
    dots + tabs both drive it.
- FAQ uses native `<details>` (same as the mockup) — the first item is `open`.
