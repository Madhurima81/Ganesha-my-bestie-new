# Choice At The Crossroads Realization Contract

Status: archived legacy contract for `T19`.

Purpose:
Preserve the completed legacy realization findings for `T19` without continuing new legacy-template rollout work from this branch.

Coverage status:

- Natural selector coverage on August 12, 2026: **0 situations**
- Forced pilot cases used to validate the contract shape:
  - `SIT133`
  - `SIT137`

Pipeline status:

- This contract is preserved as a **legacy archival artifact**
- It is **not** the active starting point for new realization work
- All new realization work proceeds in **V2**

Template:

- `T19`
- Name: `Choice at the Crossroads`
- Logic family: `LOGIC_THRESHOLD_CROSSING`

Mechanism:

- The hero reaches one real crossroads.
- The old-belief option must feel genuinely tempting.
- The true-belief option must be harder, slower, or less immediately rewarding.
- The hero must choose deliberately.
- The consequence must arise from that exact choice.
- The resolution must demonstrate what the choice changed.

Beat responsibilities for `T19`:

- `APPROACH_CROSSROADS`: establish the live dilemma and why both paths feel available
- `OPTION_OLD_BELIEF`: make the tempting old-belief path plausible and situation-specific
- `OPTION_NEW_BELIEF`: show the harder true-belief path without turning the old path into a strawman
- `CHOICE`: make the decision conscious, deliberate, and explicitly owned by the hero
- `CONSEQUENCE`: show the cost or pressure that still remains after the choice
- `RESOLUTION`: show the concrete payoff or steadiness that follows from the chosen path

Grounding rules:

- Both options must be grounded in `childExperience`, `immediateWant`, `immediateObstacle`, and `emotionalTension`.
- The old path must remain attractive enough to count as a real temptation.
- The new path must not be rewarded instantly just for being morally preferable.
- The consequence must name what remains hard after the choice.
- The resolution must follow specifically from the exact choice made.

Prohibited fallbacks:

- No generic try/fail/try/fail scaffold.
- No fake crossroads where one option is obviously unserious.
- No generic praise ending that skips consequence.
- No manufacturing natural coverage from selector or taxonomy edits.

QA expectations:

- `CHOICE` must read as deliberate, not accidental.
- `CONSEQUENCE` must remain specific to the chosen path.
- `RESOLUTION` must demonstrate, not merely praise, the right choice.
- Cross-story phrasing must avoid fixed-sentence collapse.

Representative validated cases:

- `SIT133` — forced pilot coverage only
- `SIT137` — forced pilot coverage only

Archival note:

This contract preserves the completed legacy T19 pilot findings.
It should be used as a reference input for V2 only, not as a mandate to continue new legacy realization work.
