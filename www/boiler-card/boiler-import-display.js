export function importTaskDisplayName(task, fallbackIndex, t) {
  const taskName = String(task?.task_name || task?.name || task?.friendly_name || "").trim();
  if (taskName) {
    return taskName;
  }
  const taskId = String(task?.task_id || "").trim();
  if (taskId) {
    return taskId;
  }
  return `${t("import_task_unnamed")} #${fallbackIndex}`;
}

export function importTaskDisplaySubtitle(task, t) {
  const taskType = String(task?.task_type || "window").toLowerCase() === "timeline" ? "timeline" : "window";
  if (taskType === "timeline") {
    const points = Array.isArray(task?.timeline_points) ? task.timeline_points.length : 0;
    return `${t("task_type_timeline")} • ${points} ${t("timeline_points")}`;
  }
  const start = String(task?.start_time || "--:--").trim() || "--:--";
  const end = String(task?.end_time || "--:--").trim() || "--:--";
  return `${start} - ${end}`;
}
