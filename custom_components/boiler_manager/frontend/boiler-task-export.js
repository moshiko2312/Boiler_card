const DEFAULT_DAYS = [0, 1, 2, 3, 4, 5, 6];
const DEFAULT_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export function normalizedDaysForExport(days) {
  if (!Array.isArray(days)) {
    return [...DEFAULT_DAYS];
  }
  const normalized = days
    .map((item) => Number.parseInt(item, 10))
    .filter((item) => Number.isInteger(item) && item >= 0 && item <= 6);
  return normalized.length > 0 ? [...new Set(normalized)].sort((a, b) => a - b) : [...DEFAULT_DAYS];
}

export function normalizedMonthsForExport(months) {
  if (!Array.isArray(months)) {
    return [...DEFAULT_MONTHS];
  }
  const normalized = months
    .map((item) => Number.parseInt(item, 10))
    .filter((item) => Number.isInteger(item) && item >= 1 && item <= 12);
  return normalized.length > 0 ? [...new Set(normalized)].sort((a, b) => a - b) : [...DEFAULT_MONTHS];
}

export function normalizedRecurrenceForExport(value) {
  const normalized = String(value || "forever").trim().toLowerCase();
  if (normalized === "once" || normalized === "range") {
    return normalized;
  }
  return "forever";
}

export function taskStateToExportTask(taskState, { optionToMinutes, normalizeConditionOperator }) {
  const attrs = taskState?.attributes || {};
  const taskType = String(attrs.task_type || "window").toLowerCase() === "timeline" ? "timeline" : "window";
  const name = String(attrs.task_name || attrs.friendly_name || "").trim();
  if (!name) {
    return null;
  }

  const days = normalizedDaysForExport(attrs.days);
  const months = normalizedMonthsForExport(attrs.months);
  const recurrence = normalizedRecurrenceForExport(attrs.recurrence);
  const enabled = String(taskState.state || "").toLowerCase() === "on";
  const conditionEntity = String(attrs.condition_entity || "").trim();
  const conditionOperator = normalizeConditionOperator(attrs.condition_operator);
  const skipIfState = String(attrs.skip_if_state || "").trim();

  const base = {
    name,
    task_type: taskType,
    days,
    months,
    recurrence,
    ...(attrs.start_date ? { start_date: String(attrs.start_date).trim() } : {}),
    ...(attrs.end_date ? { end_date: String(attrs.end_date).trim() } : {}),
    ...(conditionEntity ? { condition_entity: conditionEntity } : {}),
    ...(conditionEntity ? { condition_operator: conditionOperator } : {}),
    ...(conditionEntity && skipIfState ? { skip_if_state: skipIfState } : {}),
    enabled,
  };

  if (taskType === "timeline") {
    const timelinePoints = Array.isArray(attrs.timeline_points)
      ? attrs.timeline_points
          .map((point) => {
            const at = String(point?.at || "").trim();
            const durationOption = String(point?.duration_option || "").trim();
            const durationMinutes = Number.parseInt(point?.duration_minutes, 10);
            if (!at || (!durationOption && !Number.isInteger(durationMinutes))) {
              return null;
            }
            const minutes = Number.isInteger(durationMinutes) && durationMinutes > 0
              ? durationMinutes
              : optionToMinutes(durationOption);
            if (!minutes || minutes <= 0) {
              return null;
            }
            return {
              at,
              duration_option: durationOption || `${minutes}m`,
              duration_minutes: minutes,
            };
          })
          .filter((point) => !!point)
      : [];

    if (timelinePoints.length > 0) {
      return {
        ...base,
        timeline_points: timelinePoints,
      };
    }
  }

  const startTime = String(attrs.start_time || "").trim();
  const endTime = String(attrs.end_time || "").trim();
  if (!startTime || !endTime) {
    return null;
  }

  return {
    ...base,
    start_time: startTime,
    end_time: endTime,
  };
}
