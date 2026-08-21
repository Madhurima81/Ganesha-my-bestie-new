# Event Planner Audit

## Scope

Inspected the active implementation in `public/prana-story-generator/phase6-app.js` on August 10, 2026, with the locked linter and regression specs in `public/prana-story-generator/phase8-tools/`.

## 1. What it already does correctly

- There is already a real Event Planner path: `buildStoryArtifactsWithEventPlanner()` calls an event-chain builder, validation step, prose writer, then the unchanged Phase 8B-9 tail.
- Template selection is already deterministic and happens before Event Planner.
- Situation realization already uses authored `storySeed` content rather than title parsing, which is the right source for concrete event detail.
- The downstream production path is already isolated, so Event Planner can change without redesigning 8B-9.

## 2. What must change to consume the new 7B/7F structures

- Event Planner must emit template-specific beat labels and metadata, not one generic six-event arc.
- It must treat 7B Story Plan as locked architecture and translate that plan into causal events rather than inventing a new shape.
- The planner output needs a linter-facing structure for T03, T16, T21, T22, and T23 so the 7F constraints can be enforced on generated data.

## 3. What fields it currently expects that no longer exist

- The old pilot assumed a generic `purpose` sequence like `setup`, `attempt_1`, `turning_point`, `resolution`.
- It did not produce the 7F-specific fields now required by the linter, such as:
  - `INTERPRETATION_1.evidenceCited`
  - `EVIDENCE_GATHERING.evidenceSource`
  - `DISRUPTION_1.disruptionCategory`
  - `CONNECTED_DISCOVERY.reinterpretationFocus`
  - T23 cast / actor-role fields

## 4. How productionInputs enter the event chain

- `productionInputs` do not currently shape the event chain directly.
- The active flow is:
  - Blueprint -> Story Plan -> Template selection -> Event Planner / writer
  - Then the unchanged production tail derives prompt packs, illustration assets, layout, and final production QA.
- So Event Planner currently consumes Blueprint + Story Plan + selected template context, while production inputs appear downstream during packaging and production QA.

## 5. Where template constraints are invoked

- Locked template constraints live in `public/prana-story-generator/phase8-tools/templateQaLinter.js`.
- Before this pass, those constraints were only exercised against static fixtures in `runRegressionTests.js`, not against Event Planner output.
- After this pass, a generated regression runner now invokes the real Event Planner and then lints the generated plan.

## 6. Where the final Event Chain is validated

- In-app validation still runs through `validateEventChain()` before prose writing.
- Locked 7F structural validation is externalized in `TemplateQaLinter`.
- The new acceptance path is:
  - actual Event Planner generation
  - generated plan extraction
  - `TemplateQaLinter` validation of generated output
