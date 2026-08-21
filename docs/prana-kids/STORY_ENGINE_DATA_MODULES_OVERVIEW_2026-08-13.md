# Story Engine Data Modules Overview

Date: 2026-08-13
Scope: High-level map of the JSON/library data modules in `public/prana-story-generator`

## Story Pipeline Map

1. `situations.json`
   Defines the child's problem: what happened, what they want, what hurts.

2. `coreNeeds.json` + `beliefs.json`
   Explains the inner emotional engine: why the situation matters and what false belief is active.

3. `obstacles.json` + `storyConflicts.json`
   Defines what blocks the child and what kind of pressure the story must work through.

4. `storyTemplates.json` + `storyStructures.json` + `beats.json`
   Chooses the plot/mechanism shape and the beats the story should follow.

5. `characters.json` + `worlds.json`
   Decides who the story happens to and in what setting.

6. `missions.json` + `storyActions.json`
   Turns the emotional problem into visible actions and goals.

7. `openings.json` + `escalations.json` + `endings.json`
   Shapes how the story starts, intensifies, and lands.

8. `emotionalArcs.json`
   Helps the emotional resolution feel complete and appropriate.

9. `plannerKnowledge.json`
   Connects all of the above into a usable story-planning/resolution layer.

## Data Modules

| Category | Main files | What data it holds | How it contributes to the story |
|---|---|---|---|
| Core situation data | `phase6-data/situations.json`, `phase6-data/situations_v2_canonical_draft.json` | Situation seeds, child experience, want, obstacle, emotional tension, narrative summary | This is the starting problem of the story. It defines what happened to the child, what they want, what blocks them, and what emotional pressure the story must resolve. |
| Character data | `phase6-data/characters.json`, `phase6-data/ontology/characterRoles.json`, `phase6-data/ontology/characterTraits.json` | Protagonists, supporting roles, traits, character types | These files shape who the story happens to and how they behave. They influence tone, viewpoint, actions, and how a child's struggle is embodied in a character. |
| Emotion data | `phase6-data/ontology/emotionalStates.json`, `phase6-data/emotionalArcs.json` | Emotional labels and emotional progression patterns | These define how the feeling state is named and how it evolves. They help the system track whether the story moves from tension toward relief, clarity, courage, calm, or another emotional resolution. |
| World / setting data | `phase6-data/worlds.json`, `phase6-data/ontology/worldTypes.json`, `phase6-data/ontology/worldAttributes.json`, `phase6-data/ontology/worldFunctions.json` | Story worlds, setting types, atmosphere, world logic | These files decide where the story happens and what kind of symbolic or narrative role the setting plays. They influence imagery, atmosphere, metaphor, and sometimes the type of obstacle or action available. |
| Needs / belief / inner logic | `phase6-data/ontology/coreNeeds.json`, `phase6-data/ontology/beliefs.json`, `phase6-data/ontology/agencyTypes.json` | Psychological needs, false beliefs, true beliefs, agency styles | This is the inner engine of the story. It explains why the situation hurts, what mistaken interpretation drives the child's reaction, and what deeper truth the story is trying to reveal. |
| Obstacles / conflict data | `phase6-data/obstacles.json`, `phase6-data/storyConflicts.json`, `phase6-data/ontology/obstacleTypes.json`, `phase6-data/ontology/obstacleDomains.json`, `phase6-data/ontology/obstacleFunctions.json` | External blockers, pressure types, conflict structures | These define what kind of resistance the child faces. They help the engine pick whether the problem is social, physical, emotional, moral, logistical, or symbolic, and that affects the story's causal flow. |
| Story mechanics / structure | `phase6-data/storyStructures.json`, `phase6-data/beats.json`, `phase8-data/storyTemplates.json`, `phase6-data/ontology/logicFamilies.json` | Story forms, beat lists, template logic, mechanism families | This is the structural skeleton. It decides what kind of plot engine the story uses, what beats must appear, and how the child moves from the opening problem to the ending resolution. |
| Missions / action data | `phase6-data/missions.json`, `phase6-data/missionTypeMapping.json`, `phase6-data/ontology/missionTypes.json`, `phase6-data/ontology/storyActions.json` | Goals, action patterns, mission categories | These help turn the child's need into actual story movement. They shape what the protagonist tries to do, what kind of action sequence the story will follow, and how the resolution becomes visible in behavior. |
| Openings / escalations / endings | `phase6-data/openings.json`, `phase6-data/escalations.json`, `phase6-data/endings.json` | Scene-start patterns, tension-building patterns, closing patterns | These files help the story sound like a story. They provide reusable narrative shapes for how scenes begin, how pressure intensifies, and how the ending lands emotionally and structurally. |
| Symbol / theme data | `phase6-data/ontology/ganeshaSymbols.json`, `phase6-data/ontology/symbolThemes.json` | Symbolic motifs, thematic associations | These add metaphorical depth. They help the story world and objects carry meaning beyond the literal plot, often reinforcing the emotional or spiritual lesson. |
| Adventure / craft support | `phase6-data/adventureArchetypes.json`, `phase6-data/adventureTriggers.json`, `phase6-data/craftDefinitions.json` | Adventure flavor, trigger types, production/craft definitions | These support packaging and style. They help shape the outer form of the story experience, especially where the generator wants a particular adventure tone or presentation layer. |
| Planner / resolver data | `phase6-data/plannerKnowledge.json` | Combined resolver knowledge, mappings, planning helpers | This acts like a lookup/control layer for the engine. It helps the planner connect situation, need, belief, mission, structure, and world into one coherent story plan. |
| UI / configuration data | `phase6-data/settings.json`, `phase6-data/uiCategoryLifeDomainMap.json` | Config values, UI groupings, category mappings | These are less about story meaning and more about system behavior and presentation. They support how data is organized, surfaced, or configured in the app. |
| Bundled library package | `libraries/`, `libraries/library-bundle.json`, `libraries/manifest.json` | Exported/packaged copies of story datasets | This looks like the distributable or bundled version of the same content libraries. It supports runtime loading, packaging, or deployment rather than being the primary authoring source. |

## Importance Ranking

### Most Important

- `phase6-data/situations.json`
- `phase8-data/storyTemplates.json`
- `phase6-data/plannerKnowledge.json`
- `phase6-data/ontology/coreNeeds.json`
- `phase6-data/ontology/beliefs.json`
- `phase6-data/obstacles.json`
- `phase6-data/storyStructures.json`

Why:
These are the files that most directly determine what story gets told, why it matters, and what mechanism/structure the engine uses.

### Secondary

- `phase6-data/characters.json`
- `phase6-data/worlds.json`
- `phase6-data/beats.json`
- `phase6-data/missions.json`
- `phase6-data/storyConflicts.json`
- `phase6-data/emotionalArcs.json`
- `phase6-data/openings.json`
- `phase6-data/escalations.json`
- `phase6-data/endings.json`

Why:
These shape the form, tone, pacing, and embodiment of the story after the core problem/mechanism has already been chosen.

### Supporting / Reference

- `phase6-data/ontology/*.json`
- `phase6-data/missionTypeMapping.json`
- `phase6-data/uiCategoryLifeDomainMap.json`
- `phase6-data/settings.json`
- `libraries/`

Why:
These support categorization, lookup, packaging, and consistency, but usually do not by themselves decide the actual story outcome as directly as the top-tier files.

## Top 10 Files To Understand The Story Engine

1. `phase6-data/situations.json`
2. `phase8-data/storyTemplates.json`
3. `phase6-data/plannerKnowledge.json`
4. `phase6-data/ontology/coreNeeds.json`
5. `phase6-data/ontology/beliefs.json`
6. `phase6-data/obstacles.json`
7. `phase6-data/storyStructures.json`
8. `phase6-data/characters.json`
9. `phase6-data/worlds.json`
10. `phase6-data/beats.json`
