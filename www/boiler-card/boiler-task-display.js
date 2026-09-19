export function buildTaskMetaText(attrs, {
  t,
  formatScheduleDays,
  normalizeConditionOperator,
  conditionOperatorLabel,
  hebcalTaskListCaption,
  formatTimeValue = (value) => value,
  formatTimelineLabel = (value) => value,
  targetsCaption = "",
}) {
  const localizedDays = formatScheduleDays(attrs?.days);
  const daysLabel = localizedDays ? ` · ${localizedDays}` : "";
  const conditionEntity = String(attrs?.condition_entity || "").trim();
  const conditionOperator = normalizeConditionOperator(attrs?.condition_operator);
  const conditionState = String(attrs?.skip_if_state || "").trim();
  const conditionValue = conditionState || (conditionOperator === "eq" ? "on" : "0");
  const conditionLabel = conditionEntity
    ? ` · ${t("condition_summary_prefix")} ${conditionEntity} ${conditionOperatorLabel(conditionOperator)} ${conditionValue}`
    : "";
  const hebcalCaption = hebcalTaskListCaption(attrs);
  const targetsLabel = targetsCaption ? ` · ${targetsCaption}` : "";

  if (attrs?.task_type === "timeline") {
    const timeline = formatTimelineLabel(String(attrs?.timeline_label || "").trim());
    return `${timeline || "--"}${daysLabel}${targetsLabel}${conditionLabel}${hebcalCaption}`;
  }
  const start = formatTimeValue(String(attrs?.start_time || "").trim()) || "--:--";
  const end = formatTimeValue(String(attrs?.end_time || "").trim()) || "--:--";
  return `${start} - ${end}${daysLabel}${targetsLabel}${conditionLabel}${hebcalCaption}`;
}

export function formatHistoryLocalDateTime(isoOrRaw) {
  const raw = String(isoOrRaw || "").trim();
  if (!raw) {
    return "--";
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }
  const pad = (n) => String(n).padStart(2, "0");
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(parsed.getSeconds())}`;
}
