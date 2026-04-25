export function isBoilerManagerService(serviceRef) {
  return String(serviceRef || "").trim().toLowerCase().startsWith("boiler_manager.");
}

export function isKnownEntryId(entryId, hassStates) {
  const target = String(entryId || "").trim();
  if (!target || !hassStates) {
    return false;
  }
  return Object.values(hassStates).some((state) => {
    const candidate = String(state?.attributes?.entry_id || "").trim();
    return candidate === target;
  });
}

export function builtInServiceBaseData(config, hassStates) {
  const data = {};
  const configuredEntryId = String(config?.integration_entry_id || "").trim();
  if (configuredEntryId && isKnownEntryId(configuredEntryId, hassStates)) {
    data.entry_id = configuredEntryId;
  }
  if (config?.boiler_entity) {
    data.boiler_entity = config.boiler_entity;
  }
  return data;
}

export function controlServiceBaseData({ isSwitcherMode, serviceRef, config, hassStates }) {
  if (isSwitcherMode) {
    if (isBoilerManagerService(serviceRef)) {
      return builtInServiceBaseData(config, hassStates);
    }
    return config?.boiler_entity
      ? { entity_id: config.boiler_entity }
      : {};
  }
  return builtInServiceBaseData(config, hassStates);
}

export function resolveControlService({
  serviceRef,
  serviceKey = "",
  isSwitcherMode,
  isServiceAvailable,
  defaultConfig,
}) {
  const raw = String(serviceRef || "").trim();
  const normalized = raw.toLowerCase();

  if (
    !isSwitcherMode
    && serviceKey === "service_run_timed"
    && normalized === "switcher_kis.turn_on_with_timer"
    && isServiceAvailable("boiler_manager.run_timed")
  ) {
    return "boiler_manager.run_timed";
  }

  if (!isSwitcherMode) {
    return raw;
  }

  if (
    serviceKey === "service_run_timed"
    && (
      !normalized
      || normalized === "switcher_kis.turn_on_with_timer"
      || normalized === String(defaultConfig?.service_run_timed || "").toLowerCase()
    )
  ) {
    if (isServiceAvailable("switcher_kis.turn_on_with_timer")) {
      return "switcher_kis.turn_on_with_timer";
    }
    if (isServiceAvailable("boiler_manager.run_timed")) {
      return "boiler_manager.run_timed";
    }
  }

  if (
    serviceKey === "service_on_continuous"
    && (
      !normalized
      || normalized === "homeassistant.turn_on"
      || normalized === String(defaultConfig?.service_on_continuous || "").toLowerCase()
    )
    && isServiceAvailable("boiler_manager.turn_on_continuous")
  ) {
    return "boiler_manager.turn_on_continuous";
  }

  if (
    serviceKey === "service_off"
    && (
      !normalized
      || normalized === "homeassistant.turn_off"
      || normalized === String(defaultConfig?.service_off || "").toLowerCase()
    )
    && isServiceAvailable("boiler_manager.turn_off")
  ) {
    return "boiler_manager.turn_off";
  }

  return raw;
}
