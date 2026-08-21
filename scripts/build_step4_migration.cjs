// Step 4 — schema migration. Reads the frozen Step 3 draft + the live (old-schema)
// situations.json, produces a NEW file in the target schema, and runs a regression
// check proving every active situation's ontology fields (need/belief/severity/age/
// life_domain/story_family/ganesha symbols) survived unchanged from the source.
//
// Does NOT overwrite the live situations.json. That swap is a separate, explicit step
// once this file's regression results are reviewed — the live app (phase6-app.js) still
// reads the OLD schema today, so overwriting it now would break production.
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../public/prana-story-generator/phase6-data');
const step3Path = path.join(dataDir, 'situations_v2_step3_draft.json');
const sourcePath = path.join(dataDir, 'situations.json');
const outPath = path.join(dataDir, 'situations_v3_migrated.json');

const step3 = JSON.parse(fs.readFileSync(step3Path, 'utf8'));
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

const RETIRED = {
  SIT037: "Duplicate of SIT118 (stronger, more developed 'completely new school' version).",
  SIT041: "Climate anxiety — too abstract as framed, no rewrite salvaged it.",
  SIT047: "Duplicate of SIT086 (SIT086 gives an actual event; this was the same feeling without one).",
  SIT053: "Illness + lockdown + school break — unrelated things bundled, no coherent single event.",
  SIT058: "Duplicate of SIT121 (identical summer-ending scene; SIT121 is the stronger version).",
  SIT059: "Old photos — weak event potential, fails the 3-branch test.",
  SIT070: "'I can't do anything right' — belief, not an event.",
  SIT071: "Duplicate of SIT081/SIT004/SIT089 sibling-attention cluster.",
  SIT078: "'Feeling like a burden' — internal state, not an event.",
  SIT079: "'Not seen/valued' — too broad, duplicates concrete situations elsewhere.",
  SIT080: "'I am a bad kid' — explicitly a belief.",
  SIT081: "Duplicate of SIT071/SIT004/SIT089 sibling-attention cluster."
};

const sourceById = {};
source.forEach(s => { sourceById[s.id] = s; });
const step3ById = {};
step3.situations.forEach(s => { step3ById[s.id] = s; });

function buildOntology(src) {
  return {
    needId: src.hard.need_id,
    beliefIds: src.hard.belief_ids,
    severity: src.hard.severity,
    age: src.hard.age,
    lifeDomainIds: src.hard.life_domain_ids,
    falseBeliefText: src.false_belief_text,
    trueBeliefText: src.true_belief_text,
    storyFamily: src.soft_suggested.story_family,
    ganeshaSymbolPrimary: src.soft_suggested.ganesha_symbol_primary,
    ganeshaSymbolSecondary: src.soft_suggested.ganesha_symbol_secondary
  };
}

const migrated = [];
const regressionErrors = [];

// deterministic order: SIT001..SIT168
const allIds = source.map(s => s.id).sort((a,b) => parseInt(a.slice(3)) - parseInt(b.slice(3)));

allIds.forEach(id => {
  const src = sourceById[id];
  if (!src) { regressionErrors.push(`${id}: missing from source situations.json`); return; }
  const ontology = buildOntology(src);

  if (RETIRED[id]) {
    migrated.push({
      id,
      active: false,
      title: src.title,
      retiredReason: RETIRED[id],
      ontology
    });
    return;
  }

  const active = step3ById[id];
  if (!active) { regressionErrors.push(`${id}: active in source, missing from Step 3 draft`); return; }

  migrated.push({
    id,
    active: true,
    title: active.title,
    parentLabel: active.parentLabel,
    storySeed: active.storySeed,
    emotionIds: active.emotionIds,
    lifeDomainIds: active.lifeDomainIds,
    ontology
  });
});

// ---- REGRESSION CHECKS ----
console.log('=== REGRESSION CHECK ===');

// 1. counts
const activeCount = migrated.filter(s => s.active).length;
const retiredCount = migrated.filter(s => !s.active).length;
console.log(`Total: ${migrated.length} (expect 168) | active: ${activeCount} (expect 156) | retired: ${retiredCount} (expect 12)`);
if (migrated.length !== 168) regressionErrors.push(`Total count ${migrated.length} !== 168`);
if (activeCount !== 156) regressionErrors.push(`Active count ${activeCount} !== 156`);
if (retiredCount !== 12) regressionErrors.push(`Retired count ${retiredCount} !== 12`);

// 2. no duplicate ids
const idSet = new Set(migrated.map(s => s.id));
if (idSet.size !== migrated.length) regressionErrors.push('Duplicate IDs found');

// 3. ontology field-by-field diff against source, for EVERY record (active + retired)
let ontologyMismatches = 0;
migrated.forEach(s => {
  const src = sourceById[s.id];
  const o = s.ontology;
  const checks = [
    [o.needId, src.hard.need_id, 'needId'],
    [JSON.stringify(o.beliefIds), JSON.stringify(src.hard.belief_ids), 'beliefIds'],
    [o.severity, src.hard.severity, 'severity'],
    [o.age, src.hard.age, 'age'],
    [JSON.stringify(o.lifeDomainIds), JSON.stringify(src.hard.life_domain_ids), 'lifeDomainIds(ontology)'],
    [o.falseBeliefText, src.false_belief_text, 'falseBeliefText'],
    [o.trueBeliefText, src.true_belief_text, 'trueBeliefText'],
    [o.storyFamily, src.soft_suggested.story_family, 'storyFamily'],
    [o.ganeshaSymbolPrimary, src.soft_suggested.ganesha_symbol_primary, 'ganeshaSymbolPrimary'],
    [o.ganeshaSymbolSecondary, src.soft_suggested.ganesha_symbol_secondary, 'ganeshaSymbolSecondary']
  ];
  checks.forEach(([got, want, field]) => {
    if (got !== want) { regressionErrors.push(`${s.id}: ontology.${field} mismatch (got ${got}, want ${want})`); ontologyMismatches++; }
  });
});
console.log(`Ontology field diffs vs source: ${ontologyMismatches} mismatches (expect 0)`);

// 4. every active record's storySeed/parentLabel/emotionIds carried over unchanged from Step 3
let step3Mismatches = 0;
migrated.filter(s => s.active).forEach(s => {
  const s3 = step3ById[s.id];
  if (JSON.stringify(s.storySeed) !== JSON.stringify(s3.storySeed)) { regressionErrors.push(`${s.id}: storySeed diverged from Step 3 frozen draft`); step3Mismatches++; }
  if (JSON.stringify(s.emotionIds) !== JSON.stringify(s3.emotionIds)) { regressionErrors.push(`${s.id}: emotionIds diverged from Step 3 frozen draft`); step3Mismatches++; }
  if (s.parentLabel !== s3.parentLabel) { regressionErrors.push(`${s.id}: parentLabel diverged from Step 3 frozen draft`); step3Mismatches++; }
});
console.log(`Step 3 → migrated diffs: ${step3Mismatches} mismatches (expect 0)`);

// 5. emotionIds reference valid emotion taxonomy; lifeDomainIds non-empty
const validEmotionIds = new Set(step3.emotions.map(e => e.id));
migrated.filter(s => s.active).forEach(s => {
  s.emotionIds.forEach(e => { if (!validEmotionIds.has(e)) regressionErrors.push(`${s.id}: unknown emotionId ${e}`); });
  if (!s.lifeDomainIds || !s.lifeDomainIds.length) regressionErrors.push(`${s.id}: empty lifeDomainIds`);
});

console.log(`\nTotal regression errors: ${regressionErrors.length}`);
if (regressionErrors.length) {
  console.log('FAILURES:');
  regressionErrors.forEach(e => console.log(' -', e));
} else {
  console.log('REGRESSION PASSED — safe to review for the live-file swap.');
}

const out = {
  _meta: {
    status: regressionErrors.length ? 'MIGRATION FAILED REGRESSION — DO NOT USE' : 'MIGRATED — regression passed. NOT yet the live situations.json. Live file (situations.json) intentionally left untouched — phase6-app.js still reads the old schema and must be updated before this can replace it.',
    activeCount,
    retiredCount,
    totalCount: migrated.length,
    regressionErrorCount: regressionErrors.length,
    emotionTaxonomyVersion: "20 emotions + 7 primary groups, locked"
  },
  emotions: step3.emotions,
  primaryEmotions: step3.primaryEmotions,
  situations: migrated
};

fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
console.log(`\nWrote ${outPath}`);
