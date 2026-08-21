import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/Madhurima Agarwal/Downloads/Prana_Kids_Full_Library_v12.xlsx";
const outputDir = "C:/Users/Madhurima Agarwal/ganesha-my-bestie/outputs/library-pdf-v12";

const requestedSheets = [
  { label: "Situation Library", sheetName: "149 Emotion Library" },
  { label: "Character Library", sheetName: "Main Character Library" },
  { label: "Symbol Library", sheetName: "Ganesha Wisdom Library" },
  { label: "Mission Library", sheetName: "Mission Library" },
  { label: "World Library", sheetName: "Story World Library" },
  { label: "Obstacle Library", sheetName: "Obstacle Library" },
  { label: "Story Structure Library", sheetName: "Story Structure Library (100)" },
  { label: "Emotional Arc Library", sheetName: "Emotional Arc Library" },
  { label: "Opening Library", sheetName: "Opening Library" },
  { label: "Ending Library", sheetName: "Ending Library" },
  { label: "Replay Hook Library", sheetName: "Replay Hook Library" },
  { label: "Read-Aloud Library", sheetName: "Read-Aloud Library" },
];

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

await fs.mkdir(outputDir, { recursive: true });

const sheetsSummary = await workbook.inspect({
  kind: "sheet",
  include: "id,name,index,range",
  maxChars: 20000,
});

const sheets = String(sheetsSummary.ndjson)
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line));

const byName = new Map(sheets.map((sheet) => [sheet.name, sheet]));
const extracted = [];

for (const item of requestedSheets) {
  const sheetMeta = byName.get(item.sheetName);
  if (!sheetMeta) {
    extracted.push({ ...item, missing: true });
    continue;
  }

  const inspect = await workbook.inspect({
    kind: "table",
    sheetId: item.sheetName,
    range: sheetMeta.range,
    include: "values",
    tableMaxRows: 600,
    tableMaxCols: 30,
    maxChars: 250000,
  });

  const parsed = JSON.parse(String(inspect.ndjson).trim());
  const out = {
    ...item,
    range: sheetMeta.range,
    rows: parsed.rows,
    cols: parsed.cols,
    values: parsed.values,
  };
  extracted.push(out);

  const safeName = item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  await fs.writeFile(
    path.join(outputDir, `${safeName}.json`),
    JSON.stringify(out, null, 2),
    "utf8",
  );
}

await fs.writeFile(
  path.join(outputDir, "requested_libraries.json"),
  JSON.stringify(extracted, null, 2),
  "utf8",
);

console.log(`OUTPUT_JSON:${path.join(outputDir, "requested_libraries.json")}`);
