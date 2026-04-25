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

export function holidayTimerPolicyForKind(kind, config, fallbackPolicy) {
  if (kind === "holiday_shabbat") {
    return normalizeHolidayPolicy(
      config?.holiday_shabbat_timer_policy ?? config?.yomtov_timer_policy
    );
  }
  if (kind === "holiday_regular") {
    return normalizeHolidayPolicy(config?.holiday_regular_timer_policy);
  }
  if (kind === "shabbat") {
    return normalizeHolidayPolicy(config?.shabbat_timer_policy);
  }
  return fallbackPolicy;
}

export function holidayTaskPolicyForKind(kind, config, fallbackPolicy) {
  if (kind === "holiday_shabbat") {
    return normalizeHolidayPolicy(
      config?.holiday_shabbat_task_policy ?? config?.yomtov_task_policy
    );
  }
  if (kind === "holiday_regular") {
    return normalizeHolidayPolicy(config?.holiday_regular_task_policy);
  }
  if (kind === "shabbat") {
    return normalizeHolidayPolicy(config?.shabbat_task_policy);
  }
  return fallbackPolicy;
}

export function shouldForceShutdown({ isOn, legacyTimerActive, builtInTimedActive, scheduleActive }) {
  return Boolean(isOn || builtInTimedActive || (!scheduleActive && legacyTimerActive));
}
