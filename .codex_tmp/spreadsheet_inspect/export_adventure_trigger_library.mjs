import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/Madhurima Agarwal/Downloads/Prana_Kids_Full_Library_v11.xlsx";
const outputDir = "C:/Users/Madhurima Agarwal/ganesha-my-bestie/outputs/adventure-trigger-library";
const outputPath = `${outputDir}/Adventure_Trigger_Library_full_list.txt`;

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const table = await workbook.inspect({
  kind: "table",
  sheetId: "Adventure Trigger Library",
  range: "A1:B518",
  include: "values",
  tableMaxRows: 600,
  tableMaxCols: 5,
  maxChars: 120000,
});

const record = JSON.parse(String(table.ndjson).trim());
const rows = record.values;

let lines = [];
for (const row of rows) {
  const a = row[0] ?? "";
  const b = row[1] ?? "";
  if (a === "" && b === "") {
    lines.push("");
    continue;
  }
  if (typeof a === "string" && b === null) {
    lines.push(a);
    continue;
  }
  if (typeof a === "number") {
    lines.push(`${a}. ${b}`);
    continue;
  }
  lines.push(`${a}${b ? ` - ${b}` : ""}`);
}

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(outputPath, lines.join("\n"), "utf8");

console.log(`OUTPUT_PATH:${outputPath}`);
