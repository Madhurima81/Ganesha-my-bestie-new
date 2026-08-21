import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbookPath = "C:/Users/Madhurima Agarwal/Downloads/Prana_Kids_Full_Library_v11.xlsx";
const input = await FileBlob.load(workbookPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const summary = await workbook.inspect({
  kind: "sheet",
  include: "id,name",
  maxChars: 20000,
});

console.log("SHEETS_START");
console.log(summary.ndjson);
console.log("SHEETS_END");

for (const line of String(summary.ndjson).split("\n")) {
  if (!line.trim()) continue;
  let rec;
  try {
    rec = JSON.parse(line);
  } catch {
    continue;
  }
  if (!rec.name) continue;
  const match = await workbook.inspect({
    kind: "match",
    sheetId: rec.name,
    searchTerm: "149|childhood situation|emotion|emotions",
    options: { useRegex: true, maxResults: 100 },
    maxChars: 20000,
  });
  if (String(match.ndjson).trim()) {
    console.log(`MATCHES_START:${rec.name}`);
    console.log(match.ndjson);
    console.log(`MATCHES_END:${rec.name}`);
  }
}

const detail = await workbook.inspect({
  kind: "table",
  sheetId: "149 Emotion Library",
  range: "A145:L153",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 20,
  maxChars: 20000,
});

console.log("DETAIL_START");
console.log(detail.ndjson);
console.log("DETAIL_END");

const categoryTable = await workbook.inspect({
  kind: "table",
  sheetId: "149 Emotion Library",
  range: "C1:C169",
  include: "values",
  tableMaxRows: 200,
  tableMaxCols: 5,
  maxChars: 20000,
});

console.log("CATEGORY_TABLE_START");
console.log(categoryTable.ndjson);
console.log("CATEGORY_TABLE_END");

const storyEngineMap = await workbook.inspect({
  kind: "table",
  sheetId: "Story Engine Map",
  range: "A1:B87",
  include: "values",
  tableMaxRows: 120,
  tableMaxCols: 5,
  maxChars: 20000,
});

console.log("STORY_ENGINE_MAP_START");
console.log(storyEngineMap.ndjson);
console.log("STORY_ENGINE_MAP_END");

const masterLibraryIndex = await workbook.inspect({
  kind: "table",
  sheetId: "Master Library Index",
  range: "A1:D32",
  include: "values",
  tableMaxRows: 50,
  tableMaxCols: 10,
  maxChars: 20000,
});

console.log("MASTER_LIBRARY_INDEX_START");
console.log(masterLibraryIndex.ndjson);
console.log("MASTER_LIBRARY_INDEX_END");

const adventureTriggerLibrary = await workbook.inspect({
  kind: "table",
  sheetId: "Adventure Trigger Library",
  range: "A1:B120",
  include: "values",
  tableMaxRows: 140,
  tableMaxCols: 5,
  maxChars: 24000,
});

console.log("ADVENTURE_TRIGGER_LIBRARY_START");
console.log(adventureTriggerLibrary.ndjson);
console.log("ADVENTURE_TRIGGER_LIBRARY_END");
