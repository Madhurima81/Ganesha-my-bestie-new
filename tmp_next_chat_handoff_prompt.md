# Handoff prompt — paste into next chat

Context: Ganesha My Bestie — Prana Story Generator, at `public/prana-story-generator/` in this repo.

## Where things stand

The creative paper architecture for the story-generation pipeline is now **fully LOCKED**:

**Phase 6 (ingredients)** → **7A (Story Form F01–F05)** → **7B (Story Plan, 15-step sequence)** → **Template selection** → **Event Chain** → **Phase 8 (compression to 50–70 words)**.

All design/test work lives in root-level `tmp_phase7*.md` files (design docs and test evidence, not final deliverables — do not delete):
- `tmp_phase7b_expanded_story_plan_test.md` — 7B LOCKED spec: 15-step planning sequence (Form → Story Essence → Hero → Supporting Characters → Character Wants/Relationships → World/Setting → Key Object(s) → Opening State → Hero Want → Events → Turning Point → New Choice/Action → Emotional Change → Resolution/New State → Minimum Story Spine); belief(F03-only)/assumption(F04-only)/neither(F01,F02,F05) split; §3/§3a/§3b/§3c cast-is-Form-independent rules + solo-story QA + multi-character narrative-function QA + resolve-cast-before-events rule; §4/§4a ingredients-are-Form-independent + key-object narrative-function rule.
- `tmp_phase7c_template_mapping_and_compression.md`, `tmp_phase7d_template_layer_redesign.md`, `tmp_phase7e_locked_decisions.md` — template-layer design history (full re-audit of T01–T20, template ownership model, `productionInputs` for symbol/production assets, `no-hard-belief-requirement` lint rule concept, T21 "Disrupted Plan" 7-slot spec for F05).
- `tmp_phase7f_template_finalization_and_e2e_test.md` — **the final locked reference.** Contains the finalized specs for **T03** (F01, "Three Tries" — `variationRule` now checks ATTEMPT_1 against pre-story attempts too, not just 2/3 against each other), **T16** (F03, "Two Ways to See It" — `evidenceCited` + weight-parity rule, closed `evidenceSource` enum limited to `HERO_DIRECT_OBSERVATION | HERO_DIRECT_TEST | HERO_DIRECT_EXPERIENCE`, `contradictionMoment` with a materiality requirement — "must be materially capable of challenging INTERPRETATION_1, not merely incidental" — and `reassessmentIsHeroOwned` boolean), **T21** (F05, "Disrupted Plan" — closed `disruptionCategory` enum: SENSORY, SOCIAL, LOGISTICAL, EMOTIONAL_INTERNAL, PHYSICAL_SAFETY; DISRUPTION_1 and DISRUPTION_2 must differ at category level), **T22** (F02, "The Reframe Trail" — new purpose-built template, `reinterpretationFocus: "object"` required on the CONNECTED_DISCOVERY slot specifically, keeping payoff object-framed not relationship-framed), **T23** (F04, "The Assumption Bridge" — new purpose-built template, INITIAL_RESPONSE/REVEAL must be actored by a supporting character not the hero, with a narrow sanctioned passive-character-substitution exception requiring both (a) the passive character genuinely causes the situation and (b) an explicitly CAST-declared agentic proxy who corrects on their behalf).

All five templates were adversarially stress-tested against real `situations.json` data (not clean/representative cases) and passed after fixes: SIT005→T03, SIT067→T16, SIT111→T21 (plus earlier SIT148→T22, SIT089→T23). Every failure found and every fix applied is fully documented in Part 9–11 of `tmp_phase7f_...md` — read that history before touching anything, so you don't recreate a bug that was already found and fixed on paper.

**Four items are explicitly non-blocking / deferred implementation tracks — do NOT let them reopen 7F template design:**
1. Legacy-16-template belief-field migration (16 of the other T01–T20 templates still hard-require `belief.falseBelief`/`belief.trueBelief` from the old pre-7B Blueprint model — separate migration, not urgent)
2. Wiring the new paper-spec fields into actual code (this is exactly the next task, see below)
3. Untested legacy/secondary templates (the 15 not in active F01–F05 pipeline use)
4. Untested `productionInputs` integration (the symbol/production-asset handoff defined in `tmp_phase7e_locked_decisions.md`, sibling to the Story Plan, never touches emotional architecture)

## Next task — LOCKED sequence, execute in this exact order

**Do NOT start Event Planner yet.** The sequence is:

**1. Implement the locked 7F template architecture into `storyTemplates.json`** (located in `public/prana-story-generator/phase8-data/storyTemplates.json`)
   - Update **T03, T16, T21** (existing templates getting new structural constraints) and add **T22, T23** (new templates) as real JSON entries.
   - Encode every newly approved structural requirement, not just titles/metadata — e.g. T16 needs actual `evidenceCited`/weight-parity, `evidenceSource` enum, `contradictionMoment` materiality requirement, and `reassessmentIsHeroOwned` encoded as real checkable fields/rules, not prose comments. Same rigor for T21's `disruptionCategory` enum + differ-at-category-level rule, and T22's `reinterpretationFocus: "object"` requirement on CONNECTED_DISCOVERY specifically (not just anywhere in the template).
   - Do not touch the other 15 legacy templates in this task — that's the separate deferred migration.

**2. Build/run the template QA + lint layer**
   - This is where paper rules become mechanically enforceable, not just documented.
   - Specifically verify: T22's `CONNECTED_DISCOVERY → reinterpretationFocus: "object"` guardrail is actually enforced; required fields and closed enums are validated (reject free-text where a closed enum — `evidenceSource`, `disruptionCategory` — is required); slot mappings are complete; and a check for forbidden legacy belief dependencies exists (i.e. the `no-hard-belief-requirement` lint rule concept from `tmp_phase7e_locked_decisions.md`, scoped to the new/edited templates T03/T16/T21/T22/T23 only — the legacy 16 are exempted pending their own migration).

**3. Run regression tests** proving the JSON implementation behaves exactly like the locked paper spec:
   - SIT005 → T03
   - SIT067 → T16
   - SIT111 → T21
   - Plus re-validate the existing T22/T23 cases (SIT148→T22, SIT089→T23, plus the earlier clean dry-runs SIT131/SIT042 if useful for regression coverage)
   - These should reproduce the same PASS outcomes already proven on paper in `tmp_phase7f_...md` — if the code implementation produces a different result than the paper spec predicted, that's a real bug to report, not something to paper over.

**4. Only after 1–3 are done and passing: begin Event Planner architecture/implementation.** Not before.

This is a coding task (unlike all prior phases, which were paper-only) — actual `storyTemplates.json` changes and a QA/lint implementation are now in scope. Everything else (Phase 6 data, F01–F05 definitions, Phase 6 resolver, Phase 8/9 code) stays untouched. A full backup of `public/prana-story-generator/` exists at `public/prana-story-generator_backup_20260810_113746` for safety before this coding work begins.
