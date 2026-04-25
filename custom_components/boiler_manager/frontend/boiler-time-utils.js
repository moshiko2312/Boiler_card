export function parseDurationString(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const parts = value.split(":").map((part) => Number.parseInt(part, 10));
  if (parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  return null;
}

export function formatSeconds(seconds) {
  if (seconds === null) {
    return "--:--";
  }

  const safe = Math.max(0, Number.parseInt(seconds, 10));
  const hh = Math.floor(safe / 3600);
  const mm = Math.floor((safe % 3600) / 60);
  const ss = safe % 60;

  if (hh > 0) {
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  }

  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function isNoTimerOption(value) {
  if (typeof value !== "string") {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  const known = [
    "no timer",
    "без таймера",
    "ללא טיימר",
    "sans minuterie",
  ];
  return known.includes(normalized) || normalized.includes("ללא");
}

export function optionToMinutes(value) {
  if (typeof value !== "string") {
    return null;
  }

  if (isNoTimerOption(value)) {
    return null;
  }

  const match = value.match(/(\d+)/);
  if (!match) {
    return null;
  }

  return Number.parseInt(match[1], 10);
}

export function optionByMinutes(minutes, options) {
  if (!Number.isInteger(minutes) || minutes <= 0 || !Array.isArray(options)) {
    return null;
  }
  return options.find((option) => optionToMinutes(option) === minutes) || null;
}

export function optionToHhMmSs(value) {
  const totalMinutes = optionToMinutes(value);
  if (totalMinutes === null) {
    return null;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}
