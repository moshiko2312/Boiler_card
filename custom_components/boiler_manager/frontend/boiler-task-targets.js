/**
 * Multi-target task helpers. A task's `target_entities` is a list of entity ids;
 * an empty list means "the card's main boiler entity only" (mirrors the backend).
 */

function cleanEntityList(value) {
  const source = Array.isArray(value) ? value : [];
  const out = [];
  source.forEach((item) => {
    const id = String(item || "").trim();
    if (id && id.includes(".") && !out.includes(id)) {
      out.push(id);
    }
  });
  return out;
}

/** Entities a task may target for this entry: main entity first, then the integration's allowed extras. */
export function selectableTargets(modeAttrs, boilerEntity) {
  const main = String(boilerEntity || "").trim();
  const out = main ? [main] : [];
  cleanEntityList(modeAttrs?.allowed_entities).forEach((id) => {
    if (!out.includes(id)) {
      out.push(id);
    }
  });
  return out;
}

export function effectiveTargets(taskTargets, boilerEntity) {
  const list = cleanEntityList(taskTargets);
  if (list.length > 0) {
    return list;
  }
  const main = String(boilerEntity || "").trim();
  return main ? [main] : [];
}

/** Canonical form for saving: main-only becomes an empty list. */
export function normalizeSelectedTargets(selected, boilerEntity) {
  const list = cleanEntityList(selected);
  const main = String(boilerEntity || "").trim();
  if (list.length === 1 && list[0] === main) {
    return [];
  }
  return list;
}

/** "" for main-only tasks, otherwise friendly names (or ids) joined for the task list. */
export function targetsCaption(taskTargets, boilerEntity, states) {
  const effective = effectiveTargets(taskTargets, boilerEntity);
  const main = String(boilerEntity || "").trim();
  if (effective.length === 0 || (effective.length === 1 && effective[0] === main)) {
    return "";
  }
  return effective
    .map((id) => String(states?.[id]?.attributes?.friendly_name || "").trim() || id)
    .join(", ");
}

export function targetsDuplicateKey(taskTargets, boilerEntity) {
  return [...effectiveTargets(taskTargets, boilerEntity)].sort().join(",");
}
