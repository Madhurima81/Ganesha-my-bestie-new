import fs from "node:fs/promises";
import path from "node:path";

const baseDir = "C:/Users/Madhurima Agarwal/Downloads/prana-story-v10/prana-story-v10/libraries";
const files = [
  "childhoodSituations.json",
  "mainCharacters.json",
  "wisdomElements.json",
  "missions.json",
  "storyWorlds.json",
  "obstacles.json",
  "storyStructures.json",
  "emotionalArcs.json",
  "openings.json",
  "endings.json",
  "replayHooks.json",
  "readAloudDevices.json",
];

for (const file of files) {
  const fullPath = path.join(baseDir, file);
  const parsed = JSON.parse(await fs.readFile(fullPath, "utf8"));
  const sample = Array.isArray(parsed)
    ? parsed[0]
    : parsed && typeof parsed === "object"
      ? Object.fromEntries(Object.entries(parsed).slice(0, 5))
      : parsed;
  console.log(`FILE:${file}`);
  console.log(
    JSON.stringify(
      {
        isArray: Array.isArray(parsed),
        length: Array.isArray(parsed) ? parsed.length : undefined,
        keys: sample && typeof sample === "object" ? Object.keys(sample) : undefined,
        sample,
      },
      null,
      2,
    ),
  );
}
