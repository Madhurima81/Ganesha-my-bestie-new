# PT11 Mystery Detective Production Renderer Scope

Date: August 11, 2026

Status: Locked next implementation scope

## Goal

Implement `PT11_MYSTERY_DETECTIVE` as the first production renderer test for the printable engine.

The proof target is:

`JSON -> slot population -> asset injection -> SVG -> vector PDF`

Important:

- The SVG is the immutable master.
- The manifest defines the full slot contract.
- The sample Ears JSON is the data payload for the first success test.
- Do not use `SVG -> PNG -> PDF`.
- Text must remain vector in the final PDF.

## Source files

Use these exact source artifacts:

- `C:\Users\Madhurima Agarwal\Downloads\PT11_MYSTERY_DETECTIVE_MASTER.svg`
- `C:\Users\Madhurima Agarwal\Downloads\PT11_MYSTERY_DETECTIVE.manifest.json`
- `C:\Users\Madhurima Agarwal\Downloads\PT11_MYSTERY_DETECTIVE_EARS.sample.json`

## Core implementation rule

The layout code lives in the SVG master and must not be redesigned during rendering.

The renderer's job is:

- validate the JSON against the manifest
- resolve assets into the scene slot
- populate all text slots
- preserve vector text in the output SVG
- export a vector PDF from that populated SVG

## Why this is the right test

This template is materially closer to the real engine than the kindness band POC because it includes:

- variable text
- a scene/art slot
- hidden content
- sorting instructions
- clues
- an answer
- a wisdom section

If this works, it proves the core printable-engine architecture rather than only a lightweight bracelet worksheet flow.

## Template contract

Template id:

- `PT11_MYSTERY_DETECTIVE`

Manifest properties already define:

- `format: A4`
- `orientation: portrait`
- `render_contract: vector_svg_to_pdf`
- `vector_text_required: true`

This `render_contract` should be treated as authoritative.

## Required slots from the manifest

These slots are currently defined:

- `TITLE`
- `HOOK`
- `MISSION`
- `SCENE_INSTRUCTION`
- `SCENE_ART`
- `CHARACTER_LABEL`
- `HIDDEN_WORD_1`
- `HIDDEN_WORD_2`
- `HIDDEN_WORD_3`
- `HIDDEN_WORD_4`
- `SORT_PROMPT`
- `CLUE_1`
- `CLUE_2`
- `CLUE_3`
- `ANSWER`
- `WISDOM`
- `TODAY`
- `FOOTER`

Important manifest limits:

- `TITLE.max_chars = 38`
- `HOOK.max_chars = 85`
- `MISSION.max_chars = 180`
- `SCENE_INSTRUCTION.max_chars = 80`
- `CHARACTER_LABEL.max_chars = 30`
- `HIDDEN_WORD_1..4.max_chars = 18`
- `SORT_PROMPT.max_chars = 100`
- `CLUE_1..3.max_chars = 95`
- `ANSWER.max_chars = 20`
- `WISDOM.max_chars = 110`
- `TODAY.max_chars = 110`
- `FOOTER.max_chars = 100`

These limits must be enforced by the renderer before export.

## SVG slot mapping

The master SVG already contains these relevant IDs:

- `TITLE`
- `HOOK`
- `MISSION`
- `SCENE_INSTRUCTION`
- `SCENE_ART`
- `CHARACTER_LABEL`
- `HIDDEN_WORD_1`
- `HIDDEN_WORD_2`
- `HIDDEN_WORD_3`
- `HIDDEN_WORD_4`
- `SORT_PROMPT`
- `CLUE_1`
- `CLUE_2`
- `CLUE_3`
- `ANSWER`
- `WISDOM`
- `TODAY`
- `FOOTER`

This means the implementation should directly target the existing SVG IDs instead of creating a separate remapping layer unless absolutely necessary.

## Scene asset slot

`SCENE_ART` is the critical production slot.

Current SVG structure:

- it already contains a default vector scene block inside `<g id="SCENE_ART" ...>`
- it also includes `CHARACTER_LABEL` inside that scene group
- the hidden words are positioned elsewhere in the template using their own text slots

Implementation rule:

- treat `SCENE_ART` as an asset group slot
- inject approved scene/vector assets into this group
- do not print raw asset IDs into the SVG
- do not flatten text into bitmap imagery

## Renderer contract

Build a deterministic renderer with a contract like:

`renderPrintableTemplate({ template_id, data, assets })`

Minimum responsibilities:

1. Load template master.
2. Load manifest.
3. Validate required fields.
4. Validate text lengths.
5. Validate asset references for `SCENE_ART`.
6. Populate text slots.
7. Inject vector or approved scene assets into the `SCENE_ART` group.
8. Ensure no unresolved `{{...}}` placeholders remain.
9. Export:
   - populated `source.svg`
   - vector `printable.pdf`
   - `render-report.json`

Optional but acceptable for debug:

- a PNG preview may still be generated as a review artifact, but it must not be the source for the PDF.

The PDF path itself must remain vector-first.

## Validation requirements

Before generating:

- template exists
- manifest exists
- all required slots exist
- optional fields are handled cleanly
- all text respects `max_chars`
- all text fits
- all scene asset references resolve
- no unresolved `{{SLOT}}` remains
- A4 dimensions are correct
- vector text remains text in the SVG and PDF path

Result:

- `APPROVED`
- `NEEDS_REVIEW`

## First success test

Use the supplied Ears JSON exactly as the first production test.

Expected first successful output:

- populated `source.svg`
- vector `printable.pdf`
- `render-report.json`

This is the first real pass condition:

The Ears PDF generates from the supplied JSON without changing the layout code.

## Second proof test

After the Ears sample works, create a second variant by changing only the JSON payload.

No changes to:

- the SVG master
- layout logic
- slot mapping

Expected proof:

The same SVG master should produce a meaningfully different printable from different JSON alone.

## Non-goals for this checkpoint

- no OpenAI
- no Canva
- no batch pack composer
- no multi-template expansion
- no AI-generated artwork
- no printable catalog orchestration

This checkpoint is only about proving the production renderer path for `PT11_MYSTERY_DETECTIVE`.

## Success criterion

If the developer can:

1. generate the Ears PDF from the supplied JSON, and
2. generate a second distinct version by changing only the JSON,

then the core printable-engine architecture is proven.
