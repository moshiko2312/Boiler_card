export function allConditionEntitiesFromStates(states) {
  if (!states || typeof states !== "object") {
    return [];
  }
  return Object.keys(states)
    .filter((entityId) => typeof entityId === "string" && entityId.includes("."))
    .sort((a, b) => a.localeCompare(b));
}

export function matchingConditionEntities(allEntities, query = "") {
  const all = Array.isArray(allEntities) ? allEntities : [];
  const q = String(query || "").trim().toLowerCase();
  if (!q) {
    return all.slice(0, 250);
  }

  const starts = [];
  const includes = [];
  all.forEach((entityId) => {
    const normalized = entityId.toLowerCase();
    if (normalized.startsWith(q)) {
      starts.push(entityId);
    } else if (normalized.includes(q)) {
      includes.push(entityId);
    }
  });
  return [...starts, ...includes].slice(0, 250);
}
