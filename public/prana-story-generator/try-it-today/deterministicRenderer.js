import activityDatabase from "./activityDatabase.json" with { type: "json" };
import printableTemplateLibrary from "./printableTemplateLibrary.json" with { type: "json" };
import { buildPrintableRenderJob, inspectActivityBatch } from "./tryItTodayMvp.js";

const SAFETY_BANNED_PATTERN = /(hold your breath|breath hold|stop breathing|tell your biggest secret|share your secret|most embarrassing|confess|treats?|therapy|adhd|anxiety|depression|trauma|diagnos)/i;

const PRINTABLE_REQUIRED_FAMILIES = new Set(["play", "make"]);

function indexThemes(database) {
  return new Map((database.themes || []).map((theme) => [theme.id, theme]));
}

function indexActivities(database) {
  return new Map((database.activities || []).map((activity) => [activity.activity_id, activity]));
}

function templateExists(templateId) {
  if (!templateId) {
    return false;
  }
  return printableTemplateLibrary.some((template) => template.id === templateId);
}

function buildNarrativeSections(record, theme) {
  return {
    ganesha_connection: `${theme.symbol} teaches: ${theme.meaning}`,
    title: record.activity.title,
    hook: record.activity.hook,
    try_it: record.activity.steps,
    notice: record.activity.reflection,
    optional_affirmation: record.activity.affirmation || null,
    optional_try_this_today_action: record.activity.real_life_transfer || null,
    printable: record.printable.required
      ? {
          template_id: record.printable.template_id,
          title: record.printable.title,
          child_action: record.printable.child_action,
        }
      : null,
  };
}

function buildAppActivityJson(record, theme) {
  return {
    activity_id: record.activity_id,
    theme_id: theme.id,
    symbol: theme.symbol,
    belief: theme.belief,
    status: record.status,
    source: record.source,
    presentation_template: "ganesha_connection -> title -> hook -> try_it -> notice -> optional_affirmation -> optional_try_this_today_action -> printable",
    sections: buildNarrativeSections(record, theme),
  };
}

function buildCarouselJson(record, theme) {
  return {
    activity_id: record.activity_id,
    theme_id: theme.id,
    symbol: theme.symbol,
    title: record.activity.title,
    slides: [
      {
        role: "ganesha_connection",
        text: `${theme.symbol}: ${theme.meaning}`,
      },
      {
        role: "hook",
        text: record.activity.hook,
      },
      {
        role: "try_it",
        text: record.activity.steps.join(" "),
      },
      {
        role: "notice",
        text: record.activity.reflection,
      },
      {
        role: "affirmation",
        text: record.activity.affirmation || "",
      },
      {
        role: "try_this_today",
        text: record.activity.real_life_transfer || "",
      },
    ],
    printable: record.printable.required
      ? {
          template_id: record.printable.template_id,
          title: record.printable.title,
        }
      : null,
  };
}

function validateRequiredFields(record, theme) {
  const missing = [];
  if (!theme) missing.push("theme");
  if (!record.activity?.title) missing.push("activity.title");
  if (!record.activity?.hook) missing.push("activity.hook");
  if (!Array.isArray(record.activity?.steps) || record.activity.steps.length === 0) missing.push("activity.steps");
  if (!record.activity?.reflection) missing.push("activity.reflection");
  if (!record.activity?.real_life_transfer) missing.push("activity.real_life_transfer");
  return missing;
}

function validateNoStoryDependency(record) {
  const text = [
    record.activity?.hook,
    ...(record.activity?.steps || []),
    record.activity?.reflection,
    record.activity?.real_life_transfer,
  ]
    .filter(Boolean)
    .join(" ");

  return !/(previous story|earlier story|in the story you heard|remember the story|after reading)/i.test(text);
}

function validateNoUnnecessaryPrintable(record) {
  if (!record.printable?.required) {
    return true;
  }

  return PRINTABLE_REQUIRED_FAMILIES.has(record.activity?.family) || Boolean(record.printable?.child_action);
}

function validateSingleRecord(record, theme, seenIds) {
  const combinedText = [
    record.activity?.hook,
    ...(record.activity?.steps || []),
    record.activity?.reflection,
    record.activity?.real_life_transfer,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    activity_id: record.activity_id,
    rules: [
      {
        rule: "theme_belief_activity_consistency",
        passed: Boolean(theme) && theme.belief === record.theme?.belief && theme.symbol === record.theme?.symbol && theme.meaning === record.theme?.meaning,
      },
      {
        rule: "required_fields",
        passed: validateRequiredFields(record, theme).length === 0,
        details: validateRequiredFields(record, theme),
      },
      {
        rule: "no_duplicate_activity_ids",
        passed: !seenIds.has(record.activity_id),
      },
      {
        rule: "printable_template_exists",
        passed: !record.printable?.required || templateExists(record.printable?.template_id),
      },
      {
        rule: "safety_rules",
        passed: !SAFETY_BANNED_PATTERN.test(combinedText),
      },
      {
        rule: "no_unnecessary_printable",
        passed: validateNoUnnecessaryPrintable(record),
      },
      {
        rule: "no_story_dependency",
        passed: validateNoStoryDependency(record),
      },
    ],
  };
}

export function getThemeById(themeId, database = activityDatabase) {
  return indexThemes(database).get(themeId) || null;
}

export function getActivitiesByThemeId(themeId, database = activityDatabase) {
  const theme = getThemeById(themeId, database);
  return (database.activities || [])
    .filter((activity) => activity.theme_id === themeId)
    .map((activity) => ({
      ...activity,
      theme: theme
        ? {
            id: theme.id,
            symbol: theme.symbol,
            meaning: theme.meaning,
            belief: theme.belief,
          }
        : null,
    }));
}

export function renderActivityRecord(activityId, database = activityDatabase) {
  const themes = indexThemes(database);
  const activities = indexActivities(database);
  const record = activities.get(activityId);
  if (!record) {
    throw new Error(`Unknown activity_id: ${activityId}`);
  }
  const theme = themes.get(record.theme_id);
  if (!theme) {
    throw new Error(`Unknown theme_id for activity ${activityId}: ${record.theme_id}`);
  }

  const normalizedRecord = {
    ...record,
    theme: {
      id: theme.id,
      symbol: theme.symbol,
      meaning: theme.meaning,
      belief: theme.belief,
    },
  };

  return {
    record: normalizedRecord,
    activity_json: buildAppActivityJson(normalizedRecord, theme),
    carousel_json: buildCarouselJson(normalizedRecord, theme),
    printable_render_job: buildPrintableRenderJob(normalizedRecord),
  };
}

export function renderThemePack(themeId, database = activityDatabase) {
  const activities = getActivitiesByThemeId(themeId, database);
  const theme = getThemeById(themeId, database);
  if (!theme) {
    throw new Error(`Unknown theme_id: ${themeId}`);
  }

  const seenIds = new Set();
  const validation = [];
  activities.forEach((record) => {
    validation.push(validateSingleRecord(record, theme, seenIds));
    seenIds.add(record.activity_id);
  });

  const batchValidation = inspectActivityBatch(activities, theme);
  const allRulesPassed = validation.every((item) => item.rules.every((rule) => rule.passed)) && batchValidation.valid;

  const rendered = activities.map((record) => renderActivityRecord(record.activity_id, database));

  return {
    theme,
    activity_json: rendered.map((item) => item.activity_json),
    carousel_json: rendered.map((item) => item.carousel_json),
    printable_render_job_json: rendered.map((item) => item.printable_render_job).filter(Boolean),
    validation: {
      per_record: validation,
      batch: batchValidation,
      final_result: allRulesPassed ? "APPROVED" : "NEEDS_REVIEW",
    },
  };
}

export { activityDatabase, printableTemplateLibrary };
