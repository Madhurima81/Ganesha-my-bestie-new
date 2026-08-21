# Printable Engine POC Scope

Date: August 11, 2026

Status: Locked next scope for implementation

## Goal

Prove one deterministic printable template end-to-end before building the broader printable engine.

The proof target is:

Template master SVG + manifest + structured data + approved asset registry -> populated SVG -> PDF -> PNG preview -> render report

Do not build the full engine yet. Do not add OpenAI, Canva, pack composition, or multi-template orchestration.

## Source files

Use these exact source files:

- `C:\Users\Madhurima Agarwal\Downloads\PT02_KINDNESS_BAND_MASTER.svg`
- `C:\Users\Madhurima Agarwal\Downloads\PT02_KINDNESS_BAND.manifest.json`

These are the only template source artifacts needed for this POC.

## Scope boundary

Build only a single-template deterministic loop for `PT02_KINDNESS_BAND`.

Do:

- import the SVG master
- import the manifest
- build an asset registry
- build a renderer that resolves data + assets into the SVG
- validate before rendering
- output populated SVG, PDF, PNG preview, and render report
- prove three data variants can regenerate different finished printables without touching layout code

Do not do:

- OpenAI
- Canva integration
- 20 templates
- pack composer
- automatic PDF packs
- AI-generated artwork
- general template marketplace ideas

## Template contract

Treat the master SVG as fixed layout code.

Do not redesign or manually edit the layout during rendering.

The `{{...}}` placeholders are immutable template slots and must be filled by the renderer only.

The manifest is the renderer contract for:

- required and optional slots
- text limits
- asset slots
- print settings

## Manifest-derived slot contract

Template id:

- `PT02_KINDNESS_BAND`

Format and print rules:

- `A4`
- `portrait`
- `safe_margin_mm: 12`
- `scale: 100%`
- `cut_lines: dashed`

Slots present in the manifest:

- `TITLE`
- `SUBTITLE`
- `INSTRUCTION_1`
- `INSTRUCTION_1B`
- `INSTRUCTION_2`
- `INSTRUCTION_2B`
- `INSTRUCTION_3`
- `INSTRUCTION_3B`
- `INSTRUCTION_4`
- `INSTRUCTION_4B`
- `BAND_DECOR_TOP`
- `BAND_TEXT`
- `BAND_DECOR_BOTTOM`
- `CHARACTER_MAIN`
- `WISDOM_TEXT`
- `CLUE_TEXT`
- `FOOTER_PROMPT`
- `FOOTER_SMALL`

Important manifest constraints already present:

- `TITLE.max_chars = 34`
- `SUBTITLE.max_chars = 70`
- `BAND_TEXT.max_chars = 28`
- `WISDOM_TEXT.max_chars = 90`
- `CLUE_TEXT.max_chars = 100`
- `FOOTER_PROMPT.max_chars = 70`
- `FOOTER_SMALL.max_chars = 90`

The renderer must enforce these before output.

## SVG slot mapping

These IDs already exist in the master SVG and should be treated as the slot targets:

- `TITLE`
- `SUBTITLE`
- `INSTRUCTION_1`
- `INSTRUCTION_1B`
- `INSTRUCTION_2`
- `INSTRUCTION_2B`
- `INSTRUCTION_3`
- `INSTRUCTION_3B`
- `INSTRUCTION_4`
- `INSTRUCTION_4B`
- `BAND_DECOR_TOP`
- `BAND_TEXT`
- `BAND_DECOR_BOTTOM`
- `CHARACTER_MAIN`
- `WISDOM_TEXT`
- `CLUE_TEXT`
- `FOOTER_PROMPT`
- `FOOTER_SMALL`

Important implementation note:

`CHARACTER_MAIN` is currently represented in the master as a placeholder text node inside `slot-character-main`. The renderer must replace this placeholder with injected asset content, not print the literal asset ID string.

## Asset registry

Build an explicit asset registry where database/template data refers to `asset_id`, never raw file paths.

Example shape:

```json
{
  "mooshika_happy": "/assets/mooshika/mooshika_happy.svg",
  "heart": "/assets/decorations/heart.svg",
  "star": "/assets/decorations/star.svg",
  "lotus": "/assets/decorations/lotus.svg"
}
```

Rules:

- template data may contain asset IDs only
- renderer resolves asset IDs to approved asset files
- missing asset IDs must fail validation
- no hardcoded asset path strings inside printable data records

## Renderer API

Build a deterministic function with this contract:

`renderPrintableTemplate(input, options?)`

Input example:

```json
{
  "template_id": "PT02_KINDNESS_BAND",
  "data": {
    "TITLE": "My Tiny Helper Band",
    "SUBTITLE": "Make this for someone you care about.",
    "INSTRUCTION_1": "Colour your band",
    "INSTRUCTION_2": "Write your name",
    "INSTRUCTION_3": "Cut along the dotted line",
    "INSTRUCTION_4": "Join the ends and wear it",
    "BAND_TEXT": "I CAN BE A TINY HELPER",
    "CHARACTER_MAIN": "mooshika_happy",
    "WISDOM_TEXT": "Small steps can make a big difference.",
    "CLUE_TEXT": "",
    "FOOTER_PROMPT": "Who could you help today?",
    "FOOTER_SMALL": "Wear your band as a reminder."
  }
}
```

Output responsibilities:

- resolve template
- resolve manifest
- validate data against manifest
- resolve assets from registry
- inject text and asset content into the SVG
- export populated SVG
- export PDF
- export PNG preview
- emit render report

## Asset injection rules

For `CHARACTER_MAIN`:

- do not leave the literal asset ID in the SVG
- do not print `mooshika_happy` as visible text
- resolve the asset ID to the approved source asset
- inject that visual asset into the `CHARACTER_MAIN` slot area

Apply the same pattern to decorative asset slots if they are used.

## Text handling requirements

This part is required for the POC.

The renderer must:

- escape SVG/XML characters
- wrap text
- prevent overflow
- respect `max_chars`
- reject text that does not fit instead of silently clipping it

Failure is preferred over clipped or broken printable output.

## Validation requirements

Before generating output, validate:

- template exists
- manifest exists
- every required field exists
- optional fields are handled cleanly
- every asset ID exists in the asset registry
- text fits
- no unresolved `{{SLOT}}` remains
- no broken asset references
- A4 dimensions are correct
- safe margins are preserved

Result should be expressed as:

- `APPROVED`
- `NEEDS_REVIEW`

## Output layout

Produce output in this exact pattern:

```text
output/
  printable/
    PT02_KINDNESS_BAND/
      mooshika/
        source.svg
        printable.pdf
        preview.png
        render-report.json
```

For the full POC, generate three sibling variant folders under `PT02_KINDNESS_BAND`.

## First test set

Generate exactly three variants from the same master template:

1. `Mooshika` — Small Steps / Helping
2. `Ears` — Listening / Helpful Words
3. `Lotus` — Growth / Gratitude

This is the proof target:

One locked master SVG + different structured data records -> different finished printables

No layout edits should be needed between variants.

## Success criterion

The developer should be able to change one JSON record and regenerate a completely different finished printable without touching the SVG or layout code.

That is the key test for the POC.

## Recommended implementation order

1. Add the master SVG to the repo as a fixed template asset.
2. Add the manifest as the template contract.
3. Add the asset registry with approved asset IDs.
4. Implement deterministic slot validation.
5. Implement text escaping and fitting.
6. Implement asset resolution and injection.
7. Emit populated SVG.
8. Export PDF and PNG preview.
9. Generate render reports for the three test variants.
10. Review whether the resulting `render-report.json` and finished outputs are good enough before expanding beyond this template.

## Explicit non-goals for this checkpoint

- no UI work
- no generalized multi-template engine ambitions beyond what this template needs
- no AI-assisted slot filling
- no database-wide printable orchestration
- no automatic printable packs

Prove this one deterministic loop first.
