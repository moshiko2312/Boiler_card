export function buildTaskMetaText(attrs, {
  t,
  formatScheduleDays,
  normalizeConditionOperator,
  conditionOperatorLabel,
  hebcalTaskListCaption,
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

  if (attrs?.task_type === "timeline") {
    const timeline = String(attrs?.timeline_label || "").trim();
    return `${timeline || "--"}${daysLabel}${conditionLabel}${hebcalCaption}`;
  }
  return `${attrs?.start_time || "--:--"} - ${attrs?.end_time || "--:--"}${daysLabel}${conditionLabel}${hebcalCaption}`;
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
