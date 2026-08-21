#!/usr/bin/env node

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(process.cwd(), "public", "prana-story-generator");
const OUT_PATH = path.resolve(process.cwd(), "tmp", "template_audit_data.json");
const PORT = Number(process.env.PORT || "0");
const EXCLUDED = new Set(["T03", "T16", "T21", "T22", "T23"]);

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { "Content-Type": CONTENT_TYPES[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

function createStaticServer() {
  return http.createServer((req, res) => {
    const requestPath = req.url === "/" ? "/index.html" : req.url || "/index.html";
    const filePath = path.join(ROOT, decodeURIComponent(requestPath.split("?")[0]));
    if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    sendFile(res, filePath);
  });
}

async function main() {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(PORT, resolve));
  const address = server.address();
  const activePort = address && typeof address === "object" ? address.port : PORT;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`http://127.0.0.1:${activePort}/index.html`, { waitUntil: "networkidle" });
    const data = await page.evaluate(async (excludedIds) => {
      const waitForReady = () => new Promise((resolve, reject) => {
        const started = Date.now();
        const tick = () => {
          if (window.__pranaDebug && window.__pranaState && window.__pranaState.libraries && window.__pranaState.storyTemplates) {
            resolve();
            return;
          }
          if (Date.now() - started > 20000) {
            reject(new Error("Boot timeout"));
            return;
          }
          setTimeout(tick, 100);
        };
        tick();
      });

      await waitForReady();

      const templates = (window.__pranaState.storyTemplates || [])
        .filter((template) => !excludedIds.includes(template.templateId))
        .map((template) => ({
          templateId: template.templateId,
          name: template.name,
          bestForNeeds: template.bestForNeeds || [],
          bestForLogicFamilies: template.bestForLogicFamilies || [],
          requiredBeats: template.requiredBeats || [],
          sceneStructure: template.sceneStructure || [],
          repetitionPattern: template.repetitionPattern || null,
          requiredBlueprintSlots: template.requiredBlueprintSlots || [],
          optionalBlueprintSlots: template.optionalBlueprintSlots || [],
          storyMechanic: template.storyMechanic,
          escalationPattern: template.escalationPattern,
          turningPoint: template.turningPoint,
          resolutionPattern: template.resolutionPattern,
        }));

      const situations = (window.__pranaState.libraries.situations || [])
        .filter((situation) => situation && situation.active)
        .map((situation) => {
          const request = { situationId: situation.id, characterId: null };
          const naturalResolved = window.__pranaDebug.resolvePhase6(window.__pranaState.libraries, request, {});
          const naturalArtifacts = window.__pranaDebug.buildStoryArtifacts(naturalResolved, request);
          return {
            id: situation.id,
            title: situation.title,
            parentLabel: situation.parentLabel,
            storySeed: situation.storySeed,
            ontology: situation.ontology,
            emotionIds: situation.emotionIds || [],
            lifeDomainIds: situation.lifeDomainIds || [],
            natural: {
              templateId: naturalArtifacts && naturalArtifacts.templateSelection && naturalArtifacts.templateSelection.templateId,
              templateName: naturalArtifacts && naturalArtifacts.templateSelection && naturalArtifacts.templateSelection.templateName,
              selectionReason: naturalArtifacts && naturalArtifacts.templateSelection && naturalArtifacts.templateSelection.selectionReason,
              preAssertion: naturalArtifacts && naturalArtifacts.templatePreAssertion,
              postAssertion: naturalArtifacts && naturalArtifacts.templatePostAssertion,
              completeStoryValidation: naturalArtifacts && naturalArtifacts.completeStoryValidation,
              completeStoryMaster: naturalArtifacts && naturalArtifacts.completeStoryMaster,
              storyQAReport: naturalArtifacts && naturalArtifacts.storyQAReport,
              productionQAReport: naturalArtifacts && naturalArtifacts.productionQAReport,
              lockedFinalStory: naturalArtifacts && naturalArtifacts.lockedFinalStory,
            },
          };
        });

      const selectedByTemplate = {};
      for (const template of templates) {
        const naturalMatches = situations.filter((situation) => situation.natural && situation.natural.templateId === template.templateId);
        const forcedRuns = naturalMatches.slice(0, 5).map((situation) => {
          const request = { situationId: situation.id, characterId: null };
          const resolved = window.__pranaDebug.resolvePhase6(window.__pranaState.libraries, request, {});
          const forced = window.__pranaDebug.buildStoryArtifactsWithTemplate
            ? window.__pranaDebug.buildStoryArtifactsWithTemplate(resolved, request, template.templateId)
            : null;
          return {
            situationId: situation.id,
            title: situation.title,
            storySeed: situation.storySeed,
            ontology: situation.ontology,
            naturalTemplateId: situation.natural.templateId,
            naturalTemplateName: situation.natural.templateName,
            forcedStory: forced ? {
              templateSelection: forced.templateSelection,
              templateFill: forced.templateFill,
              templatePreAssertion: forced.templatePreAssertion,
              templatePostAssertion: forced.templatePostAssertion,
              completeStoryValidation: forced.completeStoryValidation,
              completeStoryMaster: forced.completeStoryMaster,
              storyQAReport: forced.storyQAReport,
              productionQAReport: forced.productionQAReport,
              lockedFinalStory: forced.lockedFinalStory,
            } : null,
          };
        });
        selectedByTemplate[template.templateId] = {
          selectedSituationIds: naturalMatches.map((situation) => situation.id),
          selectedCount: naturalMatches.length,
          forcedRuns,
        };
      }

      return { templates, situations, selectedByTemplate };
    }, [...EXCLUDED]);

    fs.writeFileSync(OUT_PATH, JSON.stringify(data, null, 2), "utf8");
    console.log(`Wrote ${OUT_PATH}`);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
