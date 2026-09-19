/**
 * Auto-fill helper for timeline tasks: "from 06:00 to 23:00, every 3 hours, run 30m"
 * expands into ordinary timeline points, so the backend needs no new task type.
 */
import { parseScheduleTimeValue } from "./boiler-sun-time.js";

export const INTERVAL_PRESET_MINUTES = [30, 45, 60, 90, 120, 180, 240, 360, 480, 720];
export const DEFAULT_MAX_GENERATED_POINTS = 48;

function fixedMinutesOfDay(value) {
  const parsed = parseScheduleTimeValue(value);
  if (!parsed || parsed.mode !== "fixed") {
    return null;
  }
  const [hh, mm] = parsed.time.split(":");
  return (Number.parseInt(hh, 10) * 60) + Number.parseInt(mm, 10);
}

function toHhMm(minutesOfDay) {
  const hh = Math.floor(minutesOfDay / 60) % 24;
  const mm = minutesOfDay % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/**
 * @returns {{points: Array<{at:string,duration_option:string,duration_minutes:number}>} | {error:string}}
 * Error codes: invalid_time, end_before_start, invalid_interval, invalid_duration, too_many_points.
 * The last activation starts at or before `end` (same day only).
 */
export function generateTimelinePoints({
  start,
  end,
  intervalMinutes,
  durationOption,
  durationMinutes,
  maxPoints = DEFAULT_MAX_GENERATED_POINTS,
}) {
  const startMinutes = fixedMinutesOfDay(start);
  const endMinutes = fixedMinutesOfDay(end);
  if (startMinutes === null || endMinutes === null) {
    return { error: "invalid_time" };
  }
  if (endMinutes < startMinutes) {
    return { error: "end_before_start" };
  }

  const interval = Number.parseInt(String(intervalMinutes ?? ""), 10);
  if (!Number.isInteger(interval) || interval <= 0) {
    return { error: "invalid_interval" };
  }

  const duration = Number.parseInt(String(durationMinutes ?? ""), 10);
  const option = String(durationOption || "").trim();
  if (!Number.isInteger(duration) || duration <= 0 || !option) {
    return { error: "invalid_duration" };
  }

  const count = Math.floor((endMinutes - startMinutes) / interval) + 1;
  if (count > maxPoints) {
    return { error: "too_many_points" };
  }

  const points = [];
  for (let index = 0; index < count; index += 1) {
    points.push({
      at: toHhMm(startMinutes + (index * interval)),
      duration_option: option,
      duration_minutes: duration,
    });
  }
  return { points };
}

/** "30 min" below an hour, otherwise hours with at most one decimal ("1.5 h"). */
export function formatIntervalLabel(minutes, t) {
  const safe = Number.parseInt(String(minutes ?? ""), 10) || 0;
  if (safe < 60) {
    return `${safe} ${t("minutes_short")}`;
  }
  const hours = safe / 60;
  const text = Number.isInteger(hours) ? String(hours) : String(Math.round(hours * 10) / 10);
  return `${text} ${t("hours_short")}`;
}
