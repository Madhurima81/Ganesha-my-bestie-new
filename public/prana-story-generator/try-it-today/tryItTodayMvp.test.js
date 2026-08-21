import {
  buildGenerationPrompt,
  buildPrintableRenderJob,
  createActivityBatchSkeleton,
  deriveApprovalDecision,
  inspectActivityBatch,
  normalizePrintableSpec,
  validateActivityBatch,
  validateGenerationInput,
} from "./tryItTodayMvp";
import { renderThemePack } from "./deterministicRenderer";

const lockedInput = {
  theme_id: "GT01",
  symbol: "Ears",
  meaning: "Listen Like a Winnowing Basket - sift helpful words from noisy distractions.",
  belief: "I keep the words that help me grow.",
  activity_count: 5,
};

describe("Try It Today MVP automation", () => {
  test("accepts the locked generation input shape", () => {
    expect(validateGenerationInput(lockedInput)).toBe(true);
  });

  test("builds a prompt payload that preserves the locked meaning and belief", () => {
    const prompt = buildGenerationPrompt(lockedInput);
    expect(prompt.userPayload.meaning).toBe(lockedInput.meaning);
    expect(prompt.userPayload.belief).toBe(lockedInput.belief);
    expect(prompt.userPayload.required_variety_modes).toEqual(["calm", "play", "notice", "talk", "make"]);
  });

  test("creates distinct skeleton activities instead of same-family variants", () => {
    const batch = createActivityBatchSkeleton(lockedInput);
    expect(batch).toHaveLength(5);
    expect(batch.map((item) => item.activity.family)).toEqual(["calm", "play", "notice", "talk", "make"]);
  });

  test("rejects activities that rewrite the belief or repeat mechanics", () => {
    const batch = createActivityBatchSkeleton(lockedInput).map((item, index) => ({
      ...item,
      activity: {
        ...item.activity,
        title: `Activity ${index + 1}`,
        hook: "Try it.",
        duration_minutes: 4,
        steps: ["Step one", "Step two", "Step three"],
        reflection: "What helped?",
        real_life_transfer: "Use it again later.",
      },
    }));

    batch[1].activity.core_mechanic = batch[0].activity.core_mechanic;
    batch[2].theme.belief = "I should ignore every word.";

    const report = validateActivityBatch(batch, lockedInput);
    expect(report.valid).toBe(false);
    expect(report.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("repeats the same core mechanic"),
        expect.stringContaining("belief has changed"),
      ])
    );
  });

  test("rejects prohibited safety and clinical language", () => {
    const batch = createActivityBatchSkeleton({
      ...lockedInput,
      activity_count: 1,
    });

    batch[0].activity.title = "Unsafe";
    batch[0].activity.hook = "Hold your breath to treat anxiety.";
    batch[0].activity.duration_minutes = 3;
    batch[0].activity.steps = ["Hold your breath.", "Keep going.", "Tell your biggest secret."];
    batch[0].activity.reflection = "How anxious were you?";
    batch[0].activity.real_life_transfer = "Use this to treat ADHD.";

    const report = validateActivityBatch(batch, lockedInput);
    expect(report.valid).toBe(false);
    expect(report.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("clinical or therapeutic claim"),
        expect.stringContaining("breath-holding guidance"),
        expect.stringContaining("uncomfortable disclosure"),
      ])
    );
  });

  test("normalizes printable specs and builds render jobs from locked templates only", () => {
    const normalized = normalizePrintableSpec({
      required: true,
      template_id: "PT02",
      title: "Helpful Words / Noise",
      content: ["Try another way.", "You can't do it."],
      child_action: "Sort each card into KEEP or LET GO.",
    });

    expect(normalized.content_spec).toEqual(["Try another way.", "You can't do it."]);

    const renderJob = buildPrintableRenderJob({
      activity_id: "TIT-EAR-001",
      theme: { id: "GT01" },
      activity: { title: "Helpful Words / Noise" },
      printable: normalized,
    });

    expect(renderJob).toMatchObject({
      template_id: "PT02",
      renderer_family: "cut-cards",
      activity_id: "TIT-EAR-001",
    });
  });

  test("returns per-rule inspection output and approval status", () => {
    const batch = createActivityBatchSkeleton(lockedInput).map((item, index) => ({
      ...item,
      activity: {
        ...item.activity,
        title: `Activity ${index + 1}`,
        hook: "Listen first.",
        duration_minutes: 4,
        steps: ["Step one", "Step two", "Step three"],
        reflection: "What helped?",
        real_life_transfer: "Try it later.",
      },
    }));

    const report = inspectActivityBatch(batch, lockedInput);
    expect(report.perActivity).toHaveLength(5);
    expect(report.batchRules).toEqual(
      expect.arrayContaining([expect.objectContaining({ rule: "duplicate_mechanic_detection" })])
    );
    expect(deriveApprovalDecision(report)).toBe("APPROVED");
  });

  test("renders deterministic Ears pack into 5 activity records and 2 printable jobs", () => {
    const rendered = renderThemePack("GT01");
    expect(rendered.activity_json).toHaveLength(5);
    expect(rendered.carousel_json).toHaveLength(5);
    expect(rendered.printable_render_job_json).toHaveLength(2);
    expect(rendered.validation.final_result).toBe("APPROVED");
  });

  test("renders deterministic Eyes pack after Ears", () => {
    const rendered = renderThemePack("GT02");
    expect(rendered.activity_json).toHaveLength(5);
    expect(rendered.printable_render_job_json).toHaveLength(2);
    expect(rendered.validation.final_result).toBe("APPROVED");
  });
});
