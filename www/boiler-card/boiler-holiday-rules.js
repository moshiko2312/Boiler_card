const HOLIDAY_PROHIBITED_KEYS = [
  "work_prohibited",
  "yomtov",
  "is_yomtov",
  "is_yom_tov",
  "yom_tov",
  "issur_melacha",
  "melacha_forbidden",
  "forbid_work",
];

export function normalizeHolidayPolicy(value) {
  const normalized = String(value || "allow").trim().toLowerCase();
  if (normalized === "block" || normalized === "deny") {
    return "block";
  }
  if (normalized === "postpone" || normalized === "delay" || normalized === "defer") {
    return "postpone";
  }
  if (normalized === "force_off" || normalized === "off" || normalized === "turn_off" || normalized === "shutdown") {
    return "force_off";
  }
  return "allow";
}

export function holidayActiveStateList(raw) {
  const values = Array.isArray(raw)
    ? raw
    : String(raw || "")
        .split(/[,\s]+/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
  const normalized = values
    .map((item) => String(item || "").trim().toLowerCase())
    .filter((item) => item.length > 0);
  return normalized.length > 0 ? normalized : ["on", "home", "active", "true"];
}

export function isHolidaySourceActiveState(stateValue, activeStates) {
  const state = String(stateValue ?? "").trim().toLowerCase();
  if (!state) {
    return false;
  }
  if (activeStates.includes(state)) {
    return true;
  }
  const numericState = Number.parseFloat(state);
  if (Number.isFinite(numericState) && numericState !== 0) {
    return activeStates.includes("1")
      || activeStates.includes("true")
      || activeStates.includes("on")
      || activeStates.includes("active");
  }
  return false;
}

export function isTruthyHolidayFlag(value) {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) && value !== 0;
  }
  const normalized = String(value ?? "").trim().toLowerCase();
  return ["1", "true", "on", "yes", "y", "active"].includes(normalized);
}

export function holidayWorkProhibited(holidayStateObj) {
  const attrs = holidayStateObj?.attributes || {};
  return HOLIDAY_PROHIBITED_KEYS.some((key) => isTruthyHolidayFlag(attrs?.[key]));
}

export function resolveHolidayKind({
  managerHebcalActive,
  managerHebcalKind,
  managerWorkProhibited,
  holidayActive,
  shabbatActive,
  holidayLooksLikeYomTov,
}) {
  if (managerHebcalActive && (managerHebcalKind === "holiday" || managerHebcalKind === "shabbat")) {
    const isHolidayShabbat = managerHebcalKind === "shabbat" || (managerHebcalKind === "holiday" && managerWorkProhibited);
    const isShabbat = managerHebcalKind === "shabbat";
    const isHolidayRegular = managerHebcalKind === "holiday" && !managerWorkProhibited;
    const kind = isHolidayShabbat
      ? "holiday_shabbat"
      : isHolidayRegular
        ? "holiday_regular"
        : isShabbat
          ? "shabbat"
          : "none";
    return {
      kind,
      isHolidayRegular,
      isHolidayShabbat,
      active: kind !== "none",
    };
  }

  const isHolidayShabbat = Boolean((holidayActive && shabbatActive) || holidayLooksLikeYomTov);
  const isShabbat = Boolean(!holidayActive && shabbatActive);
  const isHolidayRegular = Boolean(holidayActive && !isHolidayShabbat);
  const kind = isHolidayShabbat
    ? "holiday_shabbat"
    : isHolidayRegular
      ? "holiday_regular"
      : isShabbat
        ? "shabbat"
        : "none";
  return {
    kind,
    isHolidayRegular,
    isHolidayShabbat,
    active: Boolean(holidayActive || shabbatActive),
  };
}

/**
 * Per-kind policy overrides the generic (fallback) policy only when it is an
 * actual restriction. "allow" / empty means "inherit", so the generic
 * `holiday_*_policy` really is the general rule and the "allow" defaults the
 * editor persists into card YAML cannot mask it.
 */
function resolveKindPolicy(rawKindPolicy, fallbackPolicy) {
  const kindPolicy = normalizeHolidayPolicy(rawKindPolicy);
  if (kindPolicy !== "allow") {
    return kindPolicy;
  }
  return normalizeHolidayPolicy(fallbackPolicy);
}

export function holidayTimerPolicyForKind(kind, config, fallbackPolicy) {
  if (kind === "holiday_shabbat") {
    return resolveKindPolicy(
      config?.holiday_shabbat_timer_policy ?? config?.yomtov_timer_policy,
      fallbackPolicy
    );
  }
  if (kind === "holiday_regular") {
    return resolveKindPolicy(config?.holiday_regular_timer_policy, fallbackPolicy);
  }
  if (kind === "shabbat") {
    return resolveKindPolicy(config?.shabbat_timer_policy, fallbackPolicy);
  }
  return fallbackPolicy;
}

export function holidayTaskPolicyForKind(kind, config, fallbackPolicy) {
  if (kind === "holiday_shabbat") {
    return resolveKindPolicy(
      config?.holiday_shabbat_task_policy ?? config?.yomtov_task_policy,
      fallbackPolicy
    );
  }
  if (kind === "holiday_regular") {
    return resolveKindPolicy(config?.holiday_regular_task_policy, fallbackPolicy);
  }
  if (kind === "shabbat") {
    return resolveKindPolicy(config?.shabbat_task_policy, fallbackPolicy);
  }
  return fallbackPolicy;
}

export function shouldForceShutdown({ isOn, legacyTimerActive, builtInTimedActive, scheduleActive }) {
  return Boolean(isOn || builtInTimedActive || (!scheduleActive && legacyTimerActive));
}

function normalizeHebcalWindowKind(value) {
  return String(value || "").toLowerCase() === "holiday" ? "holiday" : "shabbat";
}

/**
 * Windows from the Hebcal cache that have not ended yet, earliest first.
 * A window that is currently in progress counts as upcoming.
 */
export function upcomingHebcalWindows(windows, now = Date.now()) {
  const list = Array.isArray(windows) ? windows : [];
  return list
    .filter((w) => {
      const end = Date.parse(w?.ends_at);
      return Number.isFinite(end) && end > now;
    })
    .sort((a, b) => String(a?.starts_at || "").localeCompare(String(b?.starts_at || "")));
}

/**
 * Whether a cache window matches the task editor selection
 * (event kind + holiday subtype: all / yomtov / regular).
 */
export function hebcalWindowMatchesSelection(window, kind, holidaySubtype) {
  const want = normalizeHebcalWindowKind(kind);
  if (normalizeHebcalWindowKind(window?.kind) !== want) {
    return false;
  }
  if (want !== "holiday") {
    return true;
  }
  const mode = String(holidaySubtype || "").toLowerCase();
  const workProhibited = Boolean(window?.work_prohibited);
  if (mode === "yomtov") {
    return workProhibited;
  }
  if (mode === "regular") {
    return !workProhibited;
  }
  return true;
}

/** The next cache window a Hebcal task with this selection would fire on, or null. */
export function nextMatchingHebcalWindow(windows, { kind, holidaySubtype, now = Date.now() } = {}) {
  return upcomingHebcalWindows(windows, now).find((w) => hebcalWindowMatchesSelection(w, kind, holidaySubtype)) || null;
}

function parseClockHHMM(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value || "").trim());
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours <= 23 && minutes <= 59 ? [hours, minutes] : null;
}

/**
 * ISO instant at which a task on this window activates, or null.
 * Timed windows (candle lighting / havdalah): anchor by phase + offset.
 * All-day windows (no candle lighting): the task's own start clock on that
 * date (midnight when empty); phase and offset do not apply.
 */
export function hebcalWindowActivationIso(window, { phase, offsetMinutes = 0, startHHMM = "" } = {}) {
  if (window?.all_day) {
    const dayMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(window?.starts_at || ""));
    if (!dayMatch) {
      return null;
    }
    const clock = String(startHHMM || "").trim() ? parseClockHHMM(startHHMM) : [0, 0];
    if (!clock) {
      return null;
    }
    const local = new Date(Number(dayMatch[1]), Number(dayMatch[2]) - 1, Number(dayMatch[3]), clock[0], clock[1], 0, 0);
    return Number.isFinite(local.getTime()) ? local.toISOString() : null;
  }
  const anchorRaw = String(phase || "").toLowerCase() === "end" ? window?.ends_at : window?.starts_at;
  const anchor = Date.parse(anchorRaw);
  if (!Number.isFinite(anchor)) {
    return null;
  }
  const offset = Number.parseInt(String(offsetMinutes ?? 0), 10);
  return new Date(anchor + (Number.isFinite(offset) ? offset : 0) * 60000).toISOString();
}
