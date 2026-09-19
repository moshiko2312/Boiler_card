/**
 * Schedule time values: fixed "HH:MM" or solar "sunrise"/"sunset" with optional
 * "+N"/"-N" minute offset (same grammar as the Boiler Manager backend).
 */

export const SUN_TIME_MAX_OFFSET_MINUTES = 120;

const SUN_PATTERN = /^(sunrise|sunset)(?:\s*([+-])\s*(\d{1,3}))?$/i;
const HHMM_PATTERN = /^(\d{1,2}):(\d{2})$/;
const ESTIMATED_SUN_MINUTES = { sunrise: 360, sunset: 1080 };

function clampOffset(value) {
  const parsed = Number.parseInt(String(value ?? 0), 10);
  if (!Number.isInteger(parsed)) {
    return 0;
  }
  return Math.max(-SUN_TIME_MAX_OFFSET_MINUTES, Math.min(SUN_TIME_MAX_OFFSET_MINUTES, parsed));
}

function normalizeHhMm(value) {
  const match = String(value || "").trim().match(HHMM_PATTERN);
  if (!match) {
    return "";
  }
  const hh = Number.parseInt(match[1], 10);
  const mm = Number.parseInt(match[2], 10);
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) {
    return "";
  }
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function parseScheduleTimeValue(value) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return null;
  }

  const fixed = normalizeHhMm(raw);
  if (fixed) {
    return { mode: "fixed", time: fixed, offset: 0 };
  }

  const match = raw.match(SUN_PATTERN);
  if (!match) {
    return null;
  }
  const mode = match[1].toLowerCase();
  const magnitude = match[3] ? Number.parseInt(match[3], 10) : 0;
  const offset = match[2] === "-" ? -magnitude : magnitude;
  return { mode, time: "", offset };
}

export function formatScheduleTimeValue(parts) {
  if (!parts || typeof parts !== "object") {
    return "";
  }
  const mode = String(parts.mode || "fixed").toLowerCase();
  if (mode === "sunrise" || mode === "sunset") {
    const offset = clampOffset(parts.offset);
    if (offset === 0) {
      return mode;
    }
    return `${mode}${offset > 0 ? "+" : ""}${offset}`;
  }
  return normalizeHhMm(parts.time);
}

export function isSunTimeValue(value) {
  const parsed = parseScheduleTimeValue(value);
  return !!parsed && parsed.mode !== "fixed";
}

function localMinutesFromIso(iso) {
  const raw = String(iso || "").trim();
  if (!raw) {
    return null;
  }
  const date = new Date(raw);
  const ts = date.getTime();
  if (!Number.isFinite(ts)) {
    return null;
  }
  return (date.getHours() * 60) + date.getMinutes();
}

/**
 * Minutes since local midnight (0..1439) for a schedule value.
 * Sun values resolve from the `sun.sun` state object (`next_rising` / `next_setting`).
 */
export function scheduleTimeMinutesOfDay(value, sunState) {
  const parsed = parseScheduleTimeValue(value);
  if (!parsed) {
    return null;
  }
  if (parsed.mode === "fixed") {
    const [hh, mm] = parsed.time.split(":");
    return (Number.parseInt(hh, 10) * 60) + Number.parseInt(mm, 10);
  }

  const attrs = sunState?.attributes || {};
  const anchor = localMinutesFromIso(parsed.mode === "sunrise" ? attrs.next_rising : attrs.next_setting);
  if (anchor === null) {
    return null;
  }
  return (((anchor + parsed.offset) % 1440) + 1440) % 1440;
}

/** Stable ordering key without needing live sun data (mirrors backend estimate). */
export function scheduleTimeSortKey(value) {
  const parsed = parseScheduleTimeValue(value);
  if (!parsed) {
    return Number.MAX_SAFE_INTEGER;
  }
  if (parsed.mode === "fixed") {
    return scheduleTimeMinutesOfDay(parsed.time, null);
  }
  return ESTIMATED_SUN_MINUTES[parsed.mode] + parsed.offset;
}

/** Human label: "10:00" stays; "sunset-45" becomes "<Sunset>-45" using the translator. */
export function formatScheduleTimeLabel(value, t) {
  const parsed = parseScheduleTimeValue(value);
  if (!parsed) {
    return String(value ?? "").trim();
  }
  if (parsed.mode === "fixed") {
    return parsed.time;
  }
  const base = t(parsed.mode === "sunrise" ? "schedule_time_mode_sunrise" : "schedule_time_mode_sunset");
  if (parsed.offset === 0) {
    return base;
  }
  return `${base}${parsed.offset > 0 ? "+" : ""}${parsed.offset}`;
}
