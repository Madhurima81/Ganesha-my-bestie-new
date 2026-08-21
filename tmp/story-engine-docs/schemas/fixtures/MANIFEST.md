# Schema Fixtures Manifest

Version: 1.0

## Purpose

One valid fixture and 1–3 targeted invalid fixtures per schema. Every fixture has been self-checked against its schema with a Draft 2020-12 validator: all `valid/` fixtures pass, all `invalid/` fixtures are correctly rejected. Use these as the developer's regression suite — CI should run the same check on every schema change.

## Valid Fixtures (`fixtures/valid/`)

| File | Schema | Purpose |
|---|---|---|
| `storyBlueprint.valid.json` | storyBlueprint | Complete, realistic Phase 6 output including `blueprintId` |
| `storyPlan.valid.json` | storyPlan | Complete Phase 7 output; `pagePlan` entries carry guidance fields only, no prose |
| `illustrationPlan.valid.json` | illustrationPlan | Includes `illustrationBibleReference` |
| `illustrationBible.valid.json` | illustrationBible | Includes `illustrationPlanReference` |
| `promptPack.valid.json` | promptPack | Generation-ready prompts, no generated asset data |
| `layout.valid.json` | layout | Includes `finalStoryReference` and `illustrationAssetReferences` |
| `storyPackage.valid.json` | storyPackage | Full `sourceReferences` block; `story`/`layout` kept as lightweight summaries, not duplicated content |

## Invalid Fixtures (`fixtures/invalid/`)

| File | Violation Tested |
|---|---|
| `storyBlueprint.invalid-missing-blueprintId.json` | Omits the required `blueprintId` field — the field storyPlan.blueprintReference must trace back to |
| `storyBlueprint.invalid-bad-status-and-blocking-failures.json` | `status: "DRAFT"` (not in enum) and `plannerValidation.blockingFailures: 2` (const violation — must be 0) |
| `storyPlan.invalid-missing-pageTurnGoal.json` | Omits required `pageTurnGoal` on a page-plan entry |
| `storyPlan.invalid-page-prose-instead-of-guidance.json` | Adds a `finalText` field to a page-plan entry — proves the schema blocks pre-written prose from leaking into planning guidance, preserving the "8A writes complete story first, 8B paginates" boundary |
| `illustrationPlan.invalid-missing-illustrationBibleReference.json` | Omits the required cross-reference to the Illustration Bible produced alongside it |
| `illustrationBible.invalid-missing-illustrationPlanReference.json` | Omits the required cross-reference back to the Illustration Plan |
| `promptPack.invalid-empty-prompt.json` | `prompt: ""` violates `minLength: 1` |
| `layout.invalid-missing-finalStoryReference.json` | Omits the required reference to the Phase 8 Final Story artifact |
| `layout.invalid-empty-illustrationAssetReferences.json` | Empty array violates `minItems: 1` — a layout must reference at least one illustration asset |
| `storyPackage.invalid-missing-sourceReferences-field.json` | `sourceReferences` is missing `layoutReference` — one of the 7 required upstream traces |
| `storyPackage.invalid-duplicated-manuscript-content.json` | Adds a `manuscript` field back into the `story` summary object — proves the schema blocks the exact duplication pattern the consistency pass removed |

## Regenerating / Extending

If a schema changes, add a corresponding fixture update in the same PR. A schema change without a fixture change should be treated as a red flag during review — it likely means the change wasn't validated against a real payload shape.

## Validator Used

Python `jsonschema` library, `Draft202012Validator`, matching the `$schema` declared in every schema file (`https://json-schema.org/draft/2020-12/schema`).
