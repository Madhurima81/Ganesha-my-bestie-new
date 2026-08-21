export function ensureRequiredObjectFields(errors, obj, fieldNames, label) {
  for (const fieldName of fieldNames) {
    if (obj[fieldName] === undefined || obj[fieldName] === null || obj[fieldName] === "") {
      errors.push(`Required ${label} field missing: ${fieldName}`);
    }
  }
}

export function validateCanonicalPrintableContract(manifest, inputData, options = {}) {
  const errors = [];
  const requiredTopLevel = manifest.data_contract?.required_top_level || [];

  ensureRequiredObjectFields(errors, inputData, requiredTopLevel, "top-level");

  if (inputData.template_id && inputData.template_id !== manifest.template_id) {
    errors.push(`Input template_id ${inputData.template_id} does not match manifest ${manifest.template_id}.`);
  }

  if (options.requiredContentFields) {
    ensureRequiredObjectFields(errors, inputData.content || {}, options.requiredContentFields, "content");
  }

  if (options.requiredAssetFields) {
    ensureRequiredObjectFields(errors, inputData.assets || {}, options.requiredAssetFields, "assets");
  }

  if (options.requiredGenerationFields) {
    ensureRequiredObjectFields(errors, inputData.generation || {}, options.requiredGenerationFields, "generation");
  }

  if (options.requiredWisdomFields) {
    ensureRequiredObjectFields(errors, inputData.wisdom || {}, options.requiredWisdomFields, "wisdom");
  }

  return errors;
}
