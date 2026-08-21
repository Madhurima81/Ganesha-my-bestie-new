# Try It Today MVP automation

This folder implements the conservative MVP automation layer from the locked spec dated August 10, 2026.

## What is locked

- Canonical symbol meaning and belief come from upstream library input.
- The generation prompt is fixed in `coreSystemPrompt.txt`.
- Printable design comes only from the locked template library in `printableTemplateLibrary.json`.
- Local validation rejects shallow symbol use, rewritten beliefs, duplicated mechanics, unsafe breathing, uncomfortable disclosure, and unnecessary printable drift.

## Files

- `coreSystemPrompt.txt`: the exact core system prompt for the activity generator.
- `printableTemplateLibrary.json`: the only printable templates AI is allowed to target.
- `tryItTodayMvp.js`: prompt builder, batch skeleton, printable normalization, validation, and printable render-job creation.
- `tryItTodayMvp.test.js`: regression tests for the locked rules.
- `activityDatabase.json`: deterministic activity database, the single source of truth for renderer output.
- `deterministicRenderer.js`: fixed-template renderer for app JSON, carousel JSON, and printable render jobs.

## Intended flow

Canonical Ganesha Library -> Activity Generator -> Activity JSON -> Validator -> Printable Renderer -> Human Approval -> Publishing

## Deterministic MVP engine

For the renderer milestone, the flow is:

Activity database record -> deterministic renderer -> `activity.json` + `carousel.json` + `printable-render-job.json`

This renderer does not generate content. It only fills the locked presentation template from database records and validates the records before output.
