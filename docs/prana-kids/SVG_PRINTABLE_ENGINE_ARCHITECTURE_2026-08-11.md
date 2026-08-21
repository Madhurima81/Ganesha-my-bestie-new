# SVG Printable Engine Architecture

Date: August 11, 2026

Status: Locked architecture for the next printable-engine phase

## Goal

Lock the printable engine around SVG-first masters, manifest-driven slot contracts, asset-registry resolution, and vector-safe rendering.

This is the architecture to keep:

```text
Template SVG
      +
Template Manifest
      +
Theme/content JSON
      +
Approved SVG/PNG assets
      ->
SVG Renderer
      ->
Populated SVG
      ->
Vector PDF + PNG preview
```

Important:

- SVG is the core of the printable engine, not just an output format.
- The SVG master owns layout and design.
- The manifest owns the slot contract.
- JSON owns variable content, answer data, and generation settings.
- Assets are resolved only through the approved asset registry.
- PDF generation must preserve vector text and vector artwork wherever possible.

## Core rules

- Every printable master is an SVG.
- The SVG master is immutable during rendering.
- No LLM is required anywhere in this pipeline.
- The child PDF must not reveal the answer.
- The answer key is generated separately.
- Text must remain vector in the populated SVG and final PDF.
- No unresolved `{{SLOT}}` placeholders may remain.
- Overflow must be rejected, not silently clipped.
- A printable must reinforce the locked symbol belief, not merely decorate it.
- Every render ends with `APPROVED` or `NEEDS_REVIEW`.

## Canonical printable contract

Every printable should accept a contract in this shape:

```json
{
  "template_id": "PT01",
  "theme_id": "GT05",
  "belief": "...",
  "title": "...",
  "subtitle": "...",
  "assets": {},
  "content": {},
  "generation": {},
  "answer_key": {},
  "wisdom": {}
}
```

The template can extend this with template-specific fields, but the top-level structure stays consistent across the engine.

## SVG master pattern

Each printable template gets its own SVG master:

```text
PT03_SORT_DECODE_MASTER.svg
PT04_CRAFT_MASTER.svg
PT05_GIVE_GRATITUDE_MASTER.svg
PT06_CALM_MASTER.svg
PT02_CARDS_MASTER.svg
PT01_MYSTERY_MASTER.svg
```

The SVG contains fixed layout and named slots, for example:

```xml
<text id="TITLE">{{TITLE}}</text>
<g id="MAIN_ART">{{MAIN_ART}}</g>
<text id="INSTRUCTION">{{INSTRUCTION}}</text>
```

The renderer fills slots. It does not redesign layout.

## Manifest contract

Every SVG master is paired with a manifest that describes the slot system and print rules, for example:

```json
{
  "template_id": "PT04_CRAFT",
  "page": "A4",
  "slots": {
    "TITLE": {"type": "text", "required": true},
    "MAIN_ART": {"type": "asset", "required": true},
    "INSTRUCTION": {"type": "text", "required": true},
    "CRAFT_GEOMETRY": {"type": "vector_group", "required": true}
  }
}
```

The manifest is authoritative for:

- slot names
- required vs optional fields
- slot types
- text limits
- page size and orientation
- safe margins
- render contract
- validation rules

## Asset registry

Assets remain separate from the template and are referenced by `asset_id`, never by hardcoded file paths.

Example:

```json
{
  "mooshika_happy": "/assets/prana-printables/mooshika/mooshika_happy.svg",
  "heart": "/assets/prana-printables/decorations/heart.svg",
  "star": "/assets/prana-printables/decorations/star.svg"
}
```

If JSON contains:

```json
{
  "MAIN_ART": "mooshika_happy"
}
```

the renderer must resolve that id through the registry and inject the actual approved asset into the SVG slot.

## Rendering rules

The required rendering path is:

```text
SVG -> populated SVG -> PDF
```

Do not use:

```text
SVG -> PNG -> PDF
```

PNG preview generation is allowed as a separate derivative output, but not as the path used to create the printable PDF.

## Text fitting rules

Text handling is part of the core renderer, not a nice-to-have.

The renderer must:

- escape SVG/XML characters
- wrap text within slot boundaries
- respect `max_chars` and any manifest text rules
- reject overflow that does not fit
- never silently clip text
- never leave unresolved placeholders

If content does not fit, the render should fail validation and return `NEEDS_REVIEW`.

## Geometry is data

Craft and puzzle layout variants should be driven by structured JSON, not by hand-editing the SVG for each activity.

Example:

```json
{
  "template_id": "PT04_CRAFT",
  "craft_variant": "BAND",
  "geometry": {
    "bands": 3,
    "cut_lines": true,
    "fold_lines": false
  }
}
```

The SVG provides the visual skeleton. JSON controls what gets activated or inserted inside that skeleton.

## Template families

The engine should support these families:

- `PT01_MYSTERY`: flagship mystery / mini escape
- `PT02_CARDS`: cut-and-play cards
- `PT03_SORT_MATCH_DECODE`: sorting, matching, sequencing, decoding
- `PT04_CRAFT`: craft / make
- `PT05_GIVE_GRATITUDE`: gratitude and giving
- `PT06_CALM`: calm, breathing, and noticing

These remain fixed-layout template systems with variable content payloads.

## Composer architecture

The higher-level engine should assemble printable packs through composition rather than random selection:

```text
Theme database
      ->
Printable composer
      ->
Template selection + content data
      ->
Asset registry
      ->
Renderer
      ->
Child PDF + answer key
```

The composer should evaluate:

- belief fidelity
- modality variety
- child appeal
- thematic coherence
- printable usefulness

## Benchmark and next reusable template

Use `PT11_MYSTERY_DETECTIVE` as the benchmark proof that the SVG-based renderer path works for a serious template.

That benchmark has already proven the important architecture:

- JSON-driven slot population
- asset injection
- immutable master SVG
- vector PDF export
- different outputs from the same master by changing data only

Do not use `PT11` as the first reusable engine family. It is the benchmark stress test.

The next reusable production template to implement should be:

- `PT03_SORT_MATCH_DECODE`

This is the best next template because it is simpler, broadly reusable, and can later become a component inside more complex mystery printables.

## Recommended implementation order

Build in this order:

1. `PT03_SORT_MATCH_DECODE`
2. `PT04_CRAFT`
3. `PT05_GIVE_GRATITUDE`
4. `PT06_CALM`
5. `PT02_CARDS`
6. `PT01_MYSTERY`

Do not start with `PT01` now. The simpler reusable engines should be stabilized first, then consumed by the mystery layer.

## Success criterion

The key success test is:

Change only JSON data and asset ids, keep the same SVG master and manifest, and regenerate a different clean printable with no layout-code changes.

That is the printable-engine contract to lock for the MVP.
