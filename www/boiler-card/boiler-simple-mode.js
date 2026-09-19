/** Simple mode: hide Holidays & Shabbat (Hebcal) features from the card UI. */

export function isSimpleModeEnabled(config) {
  const raw = config?.simple_mode;
  if (typeof raw === "boolean") {
    return raw;
  }
  const normalized = String(raw ?? "").trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "on" || normalized === "yes";
}

/**
 * Holiday/Shabbat controls stay visible when simple mode is off, and are
 * revealed in simple mode only while editing a task that already uses them.
 */
export function holidayUiVisible({ simpleMode, editingTaskTriggerMode }) {
  if (!simpleMode) {
    return true;
  }
  return String(editingTaskTriggerMode || "").trim().toLowerCase() === "hebcal_event";
}
