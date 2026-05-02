/**
 * Heuristics for Dolphin + Home Assistant entity naming.
 * @param {string} boilerEntityId
 * @param {Record<string, unknown>} [hassStates]
 * @returns {string}
 */
export function resolveDolphinElectricCurrentSensorId(boilerEntityId, hassStates) {
  if (!boilerEntityId || !hassStates || typeof hassStates !== "object") {
    return "";
  }

  const normalized = String(boilerEntityId).trim();
  if (!normalized.toLowerCase().startsWith("climate.")) {
    return "";
  }

  const stem = normalized.split(".", 2)[1]?.trim();
  if (!stem) {
    return "";
  }

  const candidates = Object.keys(hassStates).filter((id) => {
    const lower = id.toLowerCase();
    return lower.startsWith("dolphin.") && lower.includes("_electric_current");
  });

  if (candidates.length === 0) {
    return "";
  }

  const stemLower = stem.toLowerCase();
  const exact = `dolphin.${stemLower}_electric_current`;
  const exactHit = candidates.find((id) => id.toLowerCase() === exact);
  if (exactHit) {
    return exactHit;
  }

  const containsStem = candidates.filter((id) => id.toLowerCase().includes(stemLower));
  if (containsStem.length === 1) {
    return containsStem[0];
  }

  if (candidates.length === 1) {
    return candidates[0];
  }

  return "";
}
