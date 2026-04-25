export function stateListFromConfig(value, fallback) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .map((item) => String(item || "").trim().toLowerCase())
    .filter((item) => item.length > 0);

  return normalized.length > 0 ? normalized : fallback;
}

export function isEntityOn(entity, { stateOnValues, stateOffValues }) {
  if (!entity || typeof entity.state !== "string") {
    return false;
  }

  const state = entity.state.trim().toLowerCase();
  const onStates = stateListFromConfig(stateOnValues, ["on"]);
  const offStates = stateListFromConfig(stateOffValues, [
    "off",
    "unavailable",
    "unknown",
  ]);

  if (onStates.includes(state)) {
    return true;
  }

  if (offStates.includes(state)) {
    return false;
  }

  return false;
}
