
    const state = {
      libraries: null,
      seedMode: "situation",
      seed: null,
      recipe: null,
      selectedOutput: "story",
    };

    const seedModes = [
      { id: "situation", label: "Childhood Situation" },
      { id: "wisdom", label: "Wisdom Element" },
      { id: "world", label: "Story World" },
      { id: "surprise", label: "Surprise Me" },
    ];

    const outputTypes = [
      { id: "story", label: "Generate Story" },
      { id: "beatSheet", label: "Beat Sheet" },
      { id: "illustrationBible", label: "Illustration Bible" },
      { id: "illustrationPrompts", label: "Illustration Prompts" },
      { id: "parentNote", label: "Parent Note" },
      { id: "activity", label: "Activity" },
    ];

    const byId = (id) => document.getElementById(id);

    function normalize(value) {
      return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
    }

    function words(value) {
      return normalize(value).split(/\s+/).filter(Boolean);
    }

    function scoreText(targetText, tokens) {
      const hay = normalize(targetText);
      return tokens.reduce((score, token) => score + (hay.includes(token) ? 1 : 0), 0);
    }

    function fieldText(item) {
      return Object.values(item || {})
        .flatMap((value) => Array.isArray(value) ? value : [value])
        .filter(Boolean)
        .join(" ");
    }

    function uniqueByName(items) {
      const seen = new Set();
      return items.filter((item) => {
        const key = item && item.name;
        if (!key || seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
    }

    function findByName(list, name) {
      return (list || []).find((item) => item.name === name) || null;
    }

    function createOptions(selectId, items, valueKey = "name") {
      const select = byId(selectId);
      select.innerHTML = items
        .map((item) => `<option value="${escapeHtml(item[valueKey])}">${escapeHtml(item.name)}</option>`)
        .join("");
    }

    function createSeedModeButtons() {
      const root = byId("seedModes");
      root.innerHTML = seedModes
        .map((mode) => `<button class="chip${mode.id === state.seedMode ? " active" : ""}" data-mode="${mode.id}" type="button">${escapeHtml(mode.label)}</button>`)
        .join("");
      root.querySelectorAll("[data-mode]").forEach((button) => {
        button.addEventListener("click", () => {
          state.seedMode = button.dataset.mode;
          if (state.seedMode === "surprise") {
            state.seed = pickSurpriseSituation();
          }
          updateSeedPanels();
          recompute();
        });
      });
    }

    function updateSeedPanels() {
      document.querySelectorAll("[data-mode-panel]").forEach((panel) => {
        panel.classList.toggle("hidden", panel.dataset.modePanel !== state.seedMode);
      });
      createSeedModeButtons();
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;");
    }

    function getSituationMatches(query) {
      const situations = state.libraries.childhoodSituations;
      if (!query) {
        return situations.slice(0, 30);
      }
      const queryWords = words(query);
      return situations
        .map((item) => ({ item, score: scoreText(fieldText(item), queryWords) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score || a.item.id - b.item.id)
        .slice(0, 40)
        .map((entry) => entry.item);
    }

    function populateSituationSelect(query) {
      const matches = getSituationMatches(query);
      createOptions("situationSelect", matches, "id");
      if (matches.length) {
        if (!state.seed || state.seed.type !== "situation") {
          state.seed = { type: "situation", value: matches[0].id };
        }
      }
    }

    function pickSurpriseSituation() {
      const situations = state.libraries.childhoodSituations;
      const highPriority = situations.filter((item) => normalize(item.priority).includes("high"));
      const pool = highPriority.length ? highPriority : situations;
      return { type: "situation", value: pool[Math.floor(Math.random() * pool.length)].id };
    }

    function getCurrentSituation() {
      if (!state.libraries) {
        return null;
      }
      if (state.seedMode === "situation" || state.seedMode === "surprise") {
        return state.libraries.childhoodSituations.find((item) => item.id === Number(state.seed && state.seed.value)) || null;
      }
      if (state.seedMode === "wisdom") {
        const wisdom = findByName(state.libraries.wisdomElements, state.seed && state.seed.value);
        return recommendSituationFromWisdom(wisdom);
      }
      if (state.seedMode === "world") {
        const world = findByName(state.libraries.storyWorldPacks, state.seed && state.seed.value) || findByName(state.libraries.storyWorlds, state.seed && state.seed.value);
        return recommendSituationFromWorld(world);
      }
      return null;
    }

    function recommendSituationFromWisdom(wisdom) {
      if (!wisdom) {
        return state.libraries.childhoodSituations[0];
      }
      const tokens = words([wisdom.name, wisdom.coreMeaning, ...(wisdom.bestCoreNeeds || []), ...(wisdom.bestChallenges || [])].join(" "));
      return state.libraries.childhoodSituations
        .map((item) => {
          let score = scoreText(fieldText(item), tokens);
          if (item.wisdomElement === wisdom.name || item.secondaryWisdomElement === wisdom.name) {
            score += 5;
          }
          return { item, score };
        })
        .sort((a, b) => b.score - a.score || a.item.id - b.item.id)[0].item;
    }

    function recommendSituationFromWorld(world) {
      if (!world) {
        return state.libraries.childhoodSituations[0];
      }
      const tokens = words([world.name, world.theme, ...(world.bestLifeDomains || []), ...(world.bestWisdomElements || []), ...(world.bestAdventureArchetypes || [])].join(" "));
      return state.libraries.childhoodSituations
        .map((item) => {
          let score = scoreText(fieldText(item), tokens);
          score += (world.bestWisdomElements || []).includes(item.wisdomElement) ? 4 : 0;
          score += (item.lifeDomains || []).filter((domain) => (world.bestLifeDomains || []).includes(domain)).length * 2;
          return { item, score };
        })
        .sort((a, b) => b.score - a.score || a.item.id - b.item.id)[0].item;
    }

    function topMatches(list, tokens, options = {}) {
      const { bonus = () => 0, limit = 3 } = options;
      return uniqueByName(
        list
          .map((item) => ({ item, score: scoreText(fieldText(item), tokens) + bonus(item) }))
          .sort((a, b) => b.score - a.score || String(a.item.name).localeCompare(String(b.item.name)))
          .slice(0, limit * 3)
          .map((entry) => entry.item)
      ).slice(0, limit);
    }

    function resolveRecipe() {
      const situation = getCurrentSituation();
      if (!situation) {
        return null;
      }

      const wisdom = findByName(state.libraries.wisdomElements, situation.wisdomElement) || state.libraries.wisdomElements[0];
      const userCharacter = findByName(state.libraries.mainCharacters, byId("characterSelect").value);
      const coreTokens = words([
        situation.name,
        situation.category,
        situation.coreNeed,
        situation.falseBelief,
        situation.trueBelief,
        situation.wisdomElement,
        situation.secondaryWisdomElement,
        ...(situation.lifeDomains || []),
        wisdom && wisdom.coreMeaning,
      ].join(" "));

      const lifeDomain = state.libraries.lifeDomains.find((item) => (situation.lifeDomains || []).includes(item.name))
        || topMatches(state.libraries.lifeDomains, coreTokens, { limit: 1 })[0];

      const storyAction = topMatches(state.libraries.storyActions, coreTokens, {
        limit: 1,
        bonus: (item) => (item.bestLifeDomains || []).includes(lifeDomain && lifeDomain.name) ? 4 : 0,
      })[0];

      const character = userCharacter || topMatches(state.libraries.mainCharacters, coreTokens, {
        limit: 1,
        bonus: (item) => (item.bestCoreNeeds || []).includes(situation.coreNeed) ? 3 : 0,
      })[0];

      const archetypeRecommendations = topMatches(state.libraries.adventureArchetypes, coreTokens, {
        limit: 3,
        bonus: (item) => (item.bestAdventureArchetypes || []).includes(storyAction && storyAction.name) ? 2 : 0,
      });

      const worldRecommendations = topMatches(state.libraries.storyWorldPacks, coreTokens, {
        limit: 3,
        bonus: (item) =>
          ((item.bestWisdomElements || []).includes(situation.wisdomElement) ? 4 : 0)
          + (item.bestLifeDomains || []).filter((domain) => (situation.lifeDomains || []).includes(domain)).length * 2
          + (item.bestAdventureArchetypes || []).filter((name) => archetypeRecommendations.some((entry) => entry.name === name)).length * 2,
      });

      const selectedWorld = findByName(worldRecommendations, byId("recipeWorld").value) || worldRecommendations[0];

      const missionRecommendations = topMatches(state.libraries.missions, coreTokens.concat(words(selectedWorld && selectedWorld.name)), {
        limit: 3,
        bonus: (item) =>
          ((item.bestStoryWorlds || []).includes(selectedWorld && selectedWorld.name) ? 4 : 0)
          + ((item.bestStoryActions || []).includes(storyAction && storyAction.name) ? 3 : 0)
          + ((item.bestLifeDomains || []).includes(lifeDomain && lifeDomain.name) ? 2 : 0),
      });

      const selectedMission = findByName(missionRecommendations, byId("recipeMission").value) || missionRecommendations[0];

      const structureRecommendations = topMatches(state.libraries.storyStructures, coreTokens.concat(words(selectedMission && selectedMission.name)), {
        limit: 3,
        bonus: (item) => (item.bestAdventureArchetypes || []).filter((name) => archetypeRecommendations.some((entry) => entry.name === name)).length * 3,
      });

      const selectedStructure = findByName(structureRecommendations, byId("recipeStructure").value) || structureRecommendations[0];

      const emotionalArc = topMatches(state.libraries.emotionalArcs, coreTokens.concat(words(selectedStructure && selectedStructure.name)), {
        limit: 1,
        bonus: (item) => normalize(item.shortForm).includes(normalize(situation.category)) ? 2 : 0,
      })[0];

      const openingRecommendations = topMatches(state.libraries.openings, coreTokens.concat(words(selectedStructure && selectedStructure.name)), {
        limit: 3,
        bonus: (item) => (item.bestStoryStructures || []).includes(selectedStructure && selectedStructure.name) ? 4 : 0,
      });

      const endingRecommendations = topMatches(state.libraries.endings, coreTokens.concat(words(selectedStructure && selectedStructure.name)), {
        limit: 3,
        bonus: (item) => (item.bestStoryStructures || []).includes(selectedStructure && selectedStructure.name) ? 4 : 0,
      });

      const selectedOpening = findByName(openingRecommendations, byId("recipeOpening").value) || openingRecommendations[0];
      const selectedEnding = findByName(endingRecommendations, byId("recipeEnding").value) || endingRecommendations[0];

      const obstacle = topMatches(state.libraries.obstacles, coreTokens.concat(words(selectedWorld && selectedWorld.name), words(selectedMission && selectedMission.name)), {
        limit: 1,
        bonus: (item) => (item.bestStoryWorlds || []).includes(selectedWorld && selectedWorld.name) ? 4 : 0,
      })[0];

      const conflict = topMatches(state.libraries.storyConflicts, coreTokens.concat(words(selectedMission && selectedMission.name), words(obstacle && obstacle.name)), { limit: 1 })[0];
      const escalation = findByName(state.libraries.escalations, obstacle && obstacle.escalationType) || state.libraries.escalations[0];
      const replayHook = topMatches(state.libraries.replayHooks, coreTokens.concat(words(selectedStructure && selectedStructure.name)), { limit: 1 })[0];
      const readAloud = topMatches(state.libraries.readAloudDevices, coreTokens.concat(words(selectedStructure && selectedStructure.name)), { limit: 1 })[0];
      const titleFormula = topMatches(state.libraries.titleFormulas, coreTokens.concat(words(selectedStructure && selectedStructure.name)), { limit: 1 })[0];
      const trigger = topMatches(state.libraries.adventureTriggers, words((archetypeRecommendations[0] && archetypeRecommendations[0].name) || ""), { limit: 1 })[0];

      return {
        situation,
        coreNeed: situation.coreNeed,
        falseBelief: situation.falseBelief,
        trueBelief: situation.trueBelief,
        wisdomElement: wisdom,
        mainCharacter: character,
        lifeDomain,
        storyAction,
        adventureArchetype: archetypeRecommendations[0],
        adventureTrigger: trigger,
        storyWorld: selectedWorld,
        storyWorldPack: selectedWorld,
        mission: selectedMission,
        obstacle,
        storyConflict: conflict,
        escalation,
        storyStructure: selectedStructure,
        emotionalArc,
        opening: selectedOpening,
        replayHook,
        readAloud,
        ending: selectedEnding,
        titleFormula,
        writingLayer: {
          age: "5-8",
          slideCount: 7,
          tone: "Warm, emotionally honest, child-centered",
        },
        recommendations: {
          worlds: worldRecommendations,
          missions: missionRecommendations,
          openings: openingRecommendations,
          endings: endingRecommendations,
          structures: structureRecommendations,
        },
      };
    }

    function renderRecipeSelectors(recipe) {
      createOptions("recipeWorld", recipe.recommendations.worlds);
      createOptions("recipeMission", recipe.recommendations.missions);
      createOptions("recipeOpening", recipe.recommendations.openings);
      createOptions("recipeEnding", recipe.recommendations.endings);
      createOptions("recipeStructure", recipe.recommendations.structures);

      byId("recipeWorld").value = recipe.storyWorld.name;
      byId("recipeMission").value = recipe.mission.name;
      byId("recipeOpening").value = recipe.opening.name;
      byId("recipeEnding").value = recipe.ending.name;
      byId("recipeStructure").value = recipe.storyStructure.name;
    }

    function renderRecipeCards(recipe) {
      const items = [
        ["Need", recipe.coreNeed],
        ["False Belief", recipe.falseBelief],
        ["Wisdom Element", recipe.wisdomElement && recipe.wisdomElement.name],
        ["Main Character", recipe.mainCharacter && recipe.mainCharacter.name],
        ["Life Domain", recipe.lifeDomain && recipe.lifeDomain.name],
        ["Story Action", recipe.storyAction && recipe.storyAction.name],
        ["Adventure Archetype", recipe.adventureArchetype && recipe.adventureArchetype.name],
        ["Trigger", recipe.adventureTrigger && recipe.adventureTrigger.name],
      ];

      byId("recipeGrid").innerHTML = items.map(([label, value]) => (
        `<div class="recipe-item"><b>${escapeHtml(label)}</b>${escapeHtml(value || "")}</div>`
      )).join("");
    }

    function renderPreview(recipe) {
      const nodes = [
        ["Situation", recipe.situation.name],
        ["Need", recipe.coreNeed],
        ["Adventure", [recipe.storyAction && recipe.storyAction.name, recipe.adventureArchetype && recipe.adventureArchetype.name].filter(Boolean).join(" / ")],
        ["Mission", recipe.mission && recipe.mission.name],
        ["Ending", recipe.ending && recipe.ending.name],
      ];
      byId("previewFlow").innerHTML = nodes.map(([label, value]) => (
        `<div class="preview-node"><span>${escapeHtml(label)}</span>${escapeHtml(value || "")}</div>`
      )).join("");
    }

    function renderResolvedRecipe(recipe) {
      const items = [
        ["Situation", recipe.situation.name],
        ["Core Need", recipe.coreNeed],
        ["False Belief", recipe.falseBelief],
        ["Wisdom", recipe.wisdomElement && recipe.wisdomElement.name],
        ["Hero", recipe.mainCharacter && recipe.mainCharacter.name],
        ["World", recipe.storyWorld && recipe.storyWorld.name],
        ["Mission", recipe.mission && recipe.mission.name],
        ["Obstacle", recipe.obstacle && recipe.obstacle.name],
        ["Conflict", recipe.storyConflict && recipe.storyConflict.name],
        ["Escalation", recipe.escalation && recipe.escalation.name],
        ["Structure", recipe.storyStructure && recipe.storyStructure.name],
        ["Arc", recipe.emotionalArc && recipe.emotionalArc.name],
        ["Opening", recipe.opening && recipe.opening.name],
        ["Replay Hook", recipe.replayHook && recipe.replayHook.name],
        ["Read Aloud", recipe.readAloud && recipe.readAloud.name],
        ["Ending", recipe.ending && recipe.ending.name],
        ["Title Formula", recipe.titleFormula && recipe.titleFormula.name],
      ];
      byId("resolvedRecipeGrid").innerHTML = items.map(([label, value]) => (
        `<div class="recipe-item"><b>${escapeHtml(label)}</b>${escapeHtml(value || "")}</div>`
      )).join("");
    }

    function renderResolverNotes(recipe) {
      const notes = [
        `Seed mode: ${state.seedMode}`,
        `Seed situation resolved to: ${recipe.situation.name}`,
        `Life domain came from situation domains first, then text scoring fallback.`,
        `Story world, mission, opening, and ending each show top 3 recommendations.`,
        `Prompt builder uses the resolved recipe only. Library lists are never injected into outputs.`,
      ];
      byId("resolverNotes").innerHTML = `<div class="list-card"><strong>Current Resolver Path</strong>${notes.map((note) => `<p class="muted-note">${escapeHtml(note)}</p>`).join("")}</div>`;
    }

    function renderSeedSummary(recipe) {
      const summary = [
        recipe.situation.name,
        recipe.wisdomElement && recipe.wisdomElement.name,
        recipe.storyWorld && recipe.storyWorld.name,
      ].filter(Boolean).join(" / ");
      byId("seedSummary").value = summary;
      byId("seedExplain").innerHTML = [
        `<p class="muted-note"><strong>Situation:</strong> ${escapeHtml(recipe.situation.name)}</p>`,
        `<p class="muted-note"><strong>Need:</strong> ${escapeHtml(recipe.coreNeed)}</p>`,
        `<p class="muted-note"><strong>Belief shift:</strong> ${escapeHtml(recipe.falseBelief)} -> ${escapeHtml(recipe.trueBelief)}</p>`,
        `<p class="muted-note"><strong>Hidden mapping:</strong> ${escapeHtml(recipe.lifeDomain && recipe.lifeDomain.name)} -> ${escapeHtml(recipe.storyAction && recipe.storyAction.name)} -> ${escapeHtml(recipe.adventureArchetype && recipe.adventureArchetype.name)}</p>`,
      ].join("");
    }

    function buildResolvedRecipePayload(recipe) {
      return {
        situationId: recipe.situation.id,
        characterId: recipe.mainCharacter && recipe.mainCharacter.id,
        worldId: recipe.storyWorld && recipe.storyWorld.id,
        missionId: recipe.mission && recipe.mission.id,
        openingId: recipe.opening && recipe.opening.id,
        endingId: recipe.ending && recipe.ending.id,
        coreNeed: recipe.coreNeed,
        falseBelief: recipe.falseBelief,
        trueBelief: recipe.trueBelief,
        wisdom: recipe.wisdomElement && recipe.wisdomElement.name,
        lifeDomain: recipe.lifeDomain && recipe.lifeDomain.name,
        storyAction: recipe.storyAction && recipe.storyAction.name,
        archetype: recipe.adventureArchetype && recipe.adventureArchetype.name,
        trigger: recipe.adventureTrigger && recipe.adventureTrigger.name,
        world: recipe.storyWorld && recipe.storyWorld.name,
        mission: recipe.mission && recipe.mission.name,
        obstacle: recipe.obstacle && recipe.obstacle.name,
        conflict: recipe.storyConflict && recipe.storyConflict.name,
        escalation: recipe.escalation && recipe.escalation.name,
        structure: recipe.storyStructure && recipe.storyStructure.name,
        emotionalArc: recipe.emotionalArc && recipe.emotionalArc.name,
        replayHook: recipe.replayHook && recipe.replayHook.name,
        readAloud: recipe.readAloud && recipe.readAloud.name,
        ending: recipe.ending && recipe.ending.name,
        titleFormula: recipe.titleFormula && recipe.titleFormula.name,
        writingLayer: recipe.writingLayer,
      };
    }

    function buildOutputText(recipe, outputType) {
      const payload = buildResolvedRecipePayload(recipe);
      const recipeText = [
        `Age: ${recipe.writingLayer.age}`,
        `Slides: ${recipe.writingLayer.slideCount}`,
        `Situation: ${recipe.situation.name}`,
        `Core Need: ${recipe.coreNeed}`,
        `False Belief: ${recipe.falseBelief}`,
        `True Belief: ${recipe.trueBelief}`,
        `Wisdom: ${recipe.wisdomElement && recipe.wisdomElement.name}`,
        `Hero: ${recipe.mainCharacter && recipe.mainCharacter.name}`,
        `Story World: ${recipe.storyWorld && recipe.storyWorld.name}`,
        `Mission: ${recipe.mission && recipe.mission.name}`,
        `Obstacle: ${recipe.obstacle && recipe.obstacle.name}`,
        `Story Structure: ${recipe.storyStructure && recipe.storyStructure.name}`,
        `Emotional Arc: ${recipe.emotionalArc && recipe.emotionalArc.name}`,
        `Replay Hook: ${recipe.replayHook && recipe.replayHook.name}`,
        `Read Aloud: ${recipe.readAloud && recipe.readAloud.name}`,
        `Ending: ${recipe.ending && recipe.ending.name}`,
      ].join("\n");

      const instructions = {
        story: "Write the final 7-page picture-book story. Keep the locked recipe unchanged. Let the child solve the problem; Ganesha may guide but never solve.",
        beatSheet: "Write a concise 7-beat story beat sheet from the locked recipe. One beat per page turn.",
        illustrationBible: "Create a slide-by-slide illustration bible with composition, mood, expressions, symbol placement, and hidden replay detail.",
        illustrationPrompts: "Create seven illustration prompts, one per slide, consistent in character design and story world.",
        parentNote: "Write a short parent note explaining the emotional lesson and one gentle follow-up question.",
        activity: "Design one age-appropriate offline activity tied directly to the situation, wisdom element, and mission.",
      };

      return [
        `Output Type: ${outputType}`,
        "",
        instructions[outputType],
        "",
        "Locked Story Recipe",
        recipeText,
        "",
        "Structured Recipe JSON",
        JSON.stringify(payload, null, 2),
      ].join("\n");
    }

    function renderOutputButtons() {
      byId("outputButtons").innerHTML = outputTypes
        .map((item) => `<button type="button" class="secondary output-btn${item.id === state.selectedOutput ? " active" : ""}" data-output="${item.id}">${escapeHtml(item.label)}</button>`)
        .join("");
      byId("outputButtons").querySelectorAll("[data-output]").forEach((button) => {
        button.addEventListener("click", () => {
          state.selectedOutput = button.dataset.output;
          renderOutputButtons();
          byId("generatedOutput").value = buildOutputText(state.recipe, state.selectedOutput);
        });
      });
    }

    function recompute() {
      if (!state.libraries) {
        return;
      }
      if (state.seedMode === "surprise" && (!state.seed || !state.seed.value)) {
        state.seed = pickSurpriseSituation();
      }
      const recipe = resolveRecipe();
      if (!recipe) {
        return;
      }
      state.recipe = recipe;
      renderRecipeSelectors(recipe);
      renderRecipeCards(recipe);
      renderPreview(recipe);
      renderResolvedRecipe(recipe);
      renderResolverNotes(recipe);
      renderSeedSummary(recipe);
      renderOutputButtons();
      byId("generatedOutput").value = buildOutputText(recipe, state.selectedOutput);
    }

    async function loadLibraries() {
      const response = await fetch("./libraries/library-bundle.json");
      const bundle = await response.json();
      state.libraries = bundle.libraries;
      byId("libraryStatus").textContent = `Loaded ${bundle.libraryCount} libraries from ${bundle.sourceWorkbook.split("\\").pop()}.`;

      createOptions("wisdomSelect", state.libraries.wisdomElements);
      createOptions("worldSelect", state.libraries.storyWorldPacks);
      createOptions("characterSelect", [{ name: "Auto-pick", id: "" }, ...state.libraries.mainCharacters], "name");
      populateSituationSelect("");

      state.seed = { type: "situation", value: Number(byId("situationSelect").value) };
      updateSeedPanels();
      wireEvents();
      recompute();
    }

    function wireEvents() {
      byId("situationSearch").addEventListener("input", (event) => {
        populateSituationSelect(event.target.value);
      });

      byId("situationSelect").addEventListener("change", () => {
        state.seed = { type: "situation", value: Number(byId("situationSelect").value) };
        recompute();
      });

      byId("wisdomSelect").addEventListener("change", () => {
        state.seed = { type: "wisdom", value: byId("wisdomSelect").value };
        recompute();
      });

      byId("worldSelect").addEventListener("change", () => {
        state.seed = { type: "world", value: byId("worldSelect").value };
        recompute();
      });

      byId("characterSelect").addEventListener("change", recompute);
      byId("recipeWorld").addEventListener("change", recompute);
      byId("recipeMission").addEventListener("change", recompute);
      byId("recipeOpening").addEventListener("change", recompute);
      byId("recipeEnding").addEventListener("change", recompute);
      byId("recipeStructure").addEventListener("change", recompute);

      byId("copyOutputBtn").addEventListener("click", async () => {
        await navigator.clipboard.writeText(byId("generatedOutput").value);
      });

      byId("copyRecipeBtn").addEventListener("click", async () => {
        await navigator.clipboard.writeText(JSON.stringify(buildResolvedRecipePayload(state.recipe), null, 2));
      });
    }

    loadLibraries().catch((error) => {
      byId("libraryStatus").textContent = `Failed to load libraries: ${error.message}`;
    });
  
