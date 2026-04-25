export function normalizeHistoryRows(rows) {
  const source = Array.isArray(rows) ? rows : [];
  return source
    .filter((row) => row && typeof row === "object")
    .map((row) => ({
      ts: String(row.ts || "").trim(),
      action: String(row.action || "").trim(),
      details: String(row.details || "").trim(),
      user: String(row.user || "").trim(),
    }));
}

export function historyExportPayload(taskHistoryRows) {
  return {
    version: 1,
    exported_at: new Date().toISOString(),
    source: "boiler-manager-card",
    task_history: normalizeHistoryRows(taskHistoryRows),
  };
}
