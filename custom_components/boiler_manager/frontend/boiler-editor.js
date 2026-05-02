export function registerBoilerCardEditor(deps) {
  const { DEFAULT_CONFIG, HEBCAL_CITY_META, I18N, SUPPORTED_LANGUAGES } = deps;

class BoilerWaterCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = { ...DEFAULT_CONFIG };
    this._hass = null;
    this._forms = {};
    this._editorRoot = null;
  }

  setConfig(config) {
    this._config = { ...DEFAULT_CONFIG, ...(config || {}) };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._maybeApplyIntegrationDefaults();
    this._maybeApplySwitcherDefaults();
    this._render();
  }

  _maybeApplyIntegrationDefaults() {
    if (this._deviceProfile() === "switcher_touch") {
      return;
    }

    if (!this._hass || !this._shouldAutofillBoilerEntity()) {
      return;
    }

    const defaults = this._integrationDefaultsFromStates();
    if (!defaults || !defaults.boiler_entity) {
      return;
    }

    const nextConfig = { ...this._config, ...defaults };
    const changed = JSON.stringify(nextConfig) !== JSON.stringify(this._config);
    if (!changed) {
      return;
    }

    this._config = nextConfig;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: nextConfig },
    }));
  }

  _maybeApplySwitcherDefaults() {
    if (!this._hass || this._deviceProfile() !== "switcher_touch") {
      return;
    }

    const nextConfig = this._withSwitcherModeDefaults(this._config, {
      preserveManualValues: true,
    });
    const changed = JSON.stringify(nextConfig) !== JSON.stringify(this._config);
    if (!changed) {
      return;
    }

    this._config = nextConfig;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: nextConfig },
    }));
  }

  _withSwitcherModeDefaults(sourceConfig, options = null) {
    const cfg = { ...(sourceConfig || {}) };
    const next = { ...cfg };
    const preserveManualValues = options?.preserveManualValues !== false;
    const selectedBoiler = String(cfg.boiler_entity || "").trim();
    const boilerEntity = selectedBoiler || this._guessSwitcherBoilerEntity();

    if (!selectedBoiler && boilerEntity) {
      next.boiler_entity = boilerEntity;
    }

    const applyIfEmpty = (key, value) => {
      if (!value) {
        return;
      }
      const current = String(next[key] || "").trim();
      if (!current || !preserveManualValues) {
        next[key] = value;
      }
    };

    const currentRunService = String(next.service_run_timed || "").trim().toLowerCase();
    const currentOnService = String(next.service_on_continuous || "").trim().toLowerCase();
    const currentOffService = String(next.service_off || "").trim().toLowerCase();
    const prefersManagerRunTimed = false;
    const prefersManagerContinuous = this._isServiceAvailable("boiler_manager.turn_on_continuous");
    const prefersManagerOff = this._isServiceAvailable("boiler_manager.turn_off");
    const desiredRunService = prefersManagerRunTimed
      ? "boiler_manager.run_timed"
      : "switcher_kis.turn_on_with_timer";
    const desiredOnService = prefersManagerContinuous
      ? "boiler_manager.turn_on_continuous"
      : "homeassistant.turn_on";
    const desiredOffService = prefersManagerOff
      ? "boiler_manager.turn_off"
      : "homeassistant.turn_off";

    if (
      !currentRunService
      || currentRunService === String(DEFAULT_CONFIG.service_run_timed).toLowerCase()
      || currentRunService === "switcher_kis.turn_on_with_timer"
    ) {
      next.service_run_timed = desiredRunService;
    }
    if (
      !currentOnService
      || currentOnService === String(DEFAULT_CONFIG.service_on_continuous).toLowerCase()
      || currentOnService === "homeassistant.turn_on"
    ) {
      next.service_on_continuous = desiredOnService;
    }
    if (
      !currentOffService
      || currentOffService === String(DEFAULT_CONFIG.service_off).toLowerCase()
      || currentOffService === "homeassistant.turn_off"
    ) {
      next.service_off = desiredOffService;
    }

    if (!String(next.switcher_timer_values || "").trim()) {
      next.switcher_timer_values = DEFAULT_CONFIG.switcher_timer_values;
    }

    const inferred = this._inferSwitcherEntities(boilerEntity);
    applyIfEmpty("switcher_time_left_sensor", inferred.timeLeft);
    applyIfEmpty("switcher_sensor_1", inferred.sensor1);
    applyIfEmpty("switcher_sensor_2", inferred.sensor2);
    applyIfEmpty("switcher_icon_sensor", inferred.iconSensor);

    return next;
  }

  _guessSwitcherBoilerEntity() {
    const states = this._hass?.states;
    if (!states) {
      return "";
    }

    const candidates = Object.keys(states).filter((entityId) => {
      if (!entityId.startsWith("switch.")) {
        return false;
      }
      const stateObj = states[entityId];
      const haystack = `${entityId} ${stateObj?.attributes?.friendly_name || ""}`.toLowerCase();
      return haystack.includes("switcher") || haystack.includes("kis");
    });

    if (candidates.length === 0) {
      return "";
    }
    return candidates[0];
  }

  _inferSwitcherEntities(boilerEntity) {
    const states = this._hass?.states || {};
    const objectId = String(boilerEntity || "").split(".")[1] || "";
    const escapedObjectId = objectId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const firstExisting = (candidates) => {
      for (const candidate of candidates) {
        if (states[candidate]) {
          return candidate;
        }
      }
      return "";
    };

    const matchByPattern = (pattern) => {
      const entries = Object.keys(states).filter((entityId) => {
        if (!entityId.startsWith("sensor.")) {
          return false;
        }
        const stateObj = states[entityId];
        const haystack = `${entityId} ${stateObj?.attributes?.friendly_name || ""}`.toLowerCase();
        if (escapedObjectId && !(new RegExp(escapedObjectId, "i").test(haystack))) {
          return false;
        }
        return pattern.test(haystack);
      });
      return entries[0] || "";
    };

    const timeLeft = firstExisting([
      `sensor.${objectId}_remaining_time`,
      `sensor.${objectId}_time_left`,
      `sensor.${objectId}_auto_off_time_left`,
    ]) || matchByPattern(/remaining|time[_\s-]?left|auto[_\s-]?off/i);

    const sensor1 = firstExisting([
      `sensor.${objectId}_current`,
      `sensor.${objectId}_electric_current`,
      `sensor.${objectId}_amp`,
    ]) || matchByPattern(/current|amp/i);

    const sensor2 = firstExisting([
      `sensor.${objectId}_power`,
      `sensor.${objectId}_electric_power`,
      `sensor.${objectId}_consumption`,
    ]) || matchByPattern(/power|consumption|watt/i);

    const iconSensor = firstExisting([
      `sensor.${objectId}_water_temperature`,
      `sensor.${objectId}_temperature`,
      `sensor.${objectId}_temp`,
    ]) || matchByPattern(/water[_\s-]?temp|temperature|boiler[_\s-]?temp|temp/i);

    return {
      timeLeft,
      sensor1,
      sensor2,
      iconSensor,
    };
  }

  _shouldAutofillBoilerEntity() {
    const configured = String(this._config?.boiler_entity || "").trim();
    if (!configured) {
      return true;
    }

    if (this._hass?.states?.[configured]) {
      return false;
    }

    return configured === DEFAULT_CONFIG.boiler_entity;
  }

  _integrationDefaultsFromStates() {
    const candidates = this._boilerManagerCandidates();
    if (candidates.length === 0) {
      return null;
    }

    const desiredEntryId = String(this._config?.integration_entry_id || "").trim();
    if (desiredEntryId) {
      const byEntry = candidates.find((candidate) => candidate.entryId === desiredEntryId);
      if (!byEntry) {
        return null;
      }
      return {
        boiler_entity: byEntry.boilerEntity,
        ...(byEntry.entryId ? { integration_entry_id: byEntry.entryId } : {}),
      };
    }

    if (candidates.length !== 1) {
      return null;
    }

    const [candidate] = candidates;
    return {
      boiler_entity: candidate.boilerEntity,
      ...(candidate.entryId ? { integration_entry_id: candidate.entryId } : {}),
    };
  }

  _boilerManagerCandidates() {
    const states = this._hass?.states;
    if (!states) {
      return [];
    }

    const candidates = new Map();
    Object.values(states).forEach((stateObj) => {
      const attrs = stateObj?.attributes || {};
      const boilerEntity = String(attrs.boiler_entity || "").trim();
      if (!boilerEntity || !boilerEntity.includes(".")) {
        return;
      }

      const hasBoilerManagerMarkers = (
        String(attrs.entry_id || "").trim()
        || attrs.task_id !== undefined
        || attrs.active_tasks_count !== undefined
      );
      if (!hasBoilerManagerMarkers) {
        return;
      }

      const entryId = String(attrs.entry_id || "").trim();
      const key = entryId ? `entry:${entryId}` : `boiler:${boilerEntity.toLowerCase()}`;
      if (!candidates.has(key)) {
        candidates.set(key, { entryId, boilerEntity });
      }
    });

    return Array.from(candidates.values());
  }

  _isServiceAvailable(serviceRef) {
    if (typeof serviceRef !== "string") {
      return false;
    }
    const normalized = serviceRef.trim().toLowerCase();
    if (!normalized.includes(".")) {
      return false;
    }
    const [domain, service] = normalized.split(".", 2);
    if (!domain || !service) {
      return false;
    }
    return !!(this._hass?.services?.[domain]?.[service]);
  }

  _render() {
    if (!this._hass) {
      return;
    }

    const labels = this._labels();
    const profile = this._deviceProfile();
    const usesExtendedTimerUi = this._usesExtendedTimerUi();
    const usesSwitcherBoilerPicker = profile === "switcher_touch" || profile === "boiler_smarthome4u";
    const usesClimateBoilerPicker = profile === "dolphin";
    this._ensureEditorLayout();

    const languageOptions = [
      { value: "he", label: labels.lang_option_he || "עברית" },
      { value: "en", label: labels.lang_option_en || "English" },
      { value: "ru", label: labels.lang_option_ru || "Русский" },
      { value: "fr", label: labels.lang_option_fr || "Français" },
    ];
    const cityOptions = [
      { value: "", label: labels.hebcal_city_keep_integration },
      ...HEBCAL_CITY_META.map((row) => {
        const lang = this._normalizeLanguage(this._config?.language);
        const label = row[lang] || row.en;
        return { value: row.value, label };
      }),
    ];
    const themeOptions = [
      { value: "classic", label: labels.card_theme_classic || "Classic" },
      { value: "dark_glass", label: labels.card_theme_dark_glass || "Dark Glass" },
      { value: "amber_glow", label: labels.card_theme_amber_glow || "Amber Glow" },
      { value: "smart_room_blue", label: labels.card_theme_smart_room_blue || "Smart Room Blue" },
      { value: "midnight_black", label: labels.card_theme_midnight_black || "Midnight Black" },
      { value: "gallery_neon", label: labels.card_theme_gallery_neon || "Gallery Neon" },
      { value: "slate_ice", label: labels.card_theme_slate_ice || "Slate Ice" },
      { value: "neo_contrast", label: labels.card_theme_neo_contrast || "Neo Contrast" },
      { value: "clear_frost", label: labels.card_theme_clear_frost || "Clear Frost" },
    ];

    const generalSchema = [
      {
        name: "title",
        label: labels.title,
        selector: { text: {} },
      },
      {
        name: "boiler_entity",
        label: labels.boiler_entity,
        required: true,
        selector: usesSwitcherBoilerPicker
          ? { entity: { domain: "switch" } }
          : usesClimateBoilerPicker
          ? { entity: { domain: "climate" } }
          : { entity: {} },
      },
    ];
    const integrationSchema = [
      {
        name: "integration_entry_id",
        label: labels.integration_entry_id || "Integration entry ID",
        selector: { text: {} },
      },
      {
        name: "hebcal_city",
        label: labels.hebcal_city,
        description: labels.hebcal_city_desc,
        selector: {
          select: {
            mode: "dropdown",
            options: cityOptions,
          },
        },
      },
    ];
    const regularModeSchema = [
      {
        name: "timer_values",
        label: labels.timer_values,
        selector: { text: {} },
      },
      {
        name: "temperature_sensor",
        label: labels.temperature_sensor,
        ...(profile === "dolphin"
          ? {
            description: labels.dolphin_temperature_sensor_desc,
            selector: { entity: {} },
          }
          : {
            selector: { entity: { domain: "sensor" } },
          }),
      },
      {
        name: "power_sensor",
        label: labels.power_sensor,
        selector: { entity: { domain: "sensor" } },
      },
      {
        name: "current_sensor",
        label: labels.current_sensor,
        ...(profile === "dolphin"
          ? { description: labels.dolphin_current_sensor_auto_desc }
          : {}),
        selector: { entity: { domain: "sensor" } },
      },
      {
        name: "voltage_sensor",
        label: labels.voltage_sensor,
        selector: { entity: { domain: "sensor" } },
      },
    ];
    const dolphinExtraModeSchema = [
      {
        name: "dolphin_sabbath_entity",
        label: labels.dolphin_sabbath_entity,
        description: labels.dolphin_sabbath_entity_desc,
        selector: { entity: {} },
      },
      {
        name: "dolphin_fixed_temperature_entity",
        label: labels.dolphin_fixed_temperature_entity,
        description: labels.dolphin_fixed_temperature_entity_desc,
        selector: { entity: {} },
      },
      {
        name: "dolphin_shower_entity",
        label: labels.dolphin_shower_entity,
        description: labels.dolphin_shower_entity_desc,
        selector: { entity: {} },
      },
      {
        name: "dolphin_shower_2_entity",
        label: labels.dolphin_shower_2_entity,
        description: labels.dolphin_shower_2_entity_desc,
        selector: { entity: {} },
      },
      {
        name: "dolphin_shower_3_entity",
        label: labels.dolphin_shower_3_entity,
        description: labels.dolphin_shower_3_entity_desc,
        selector: { entity: {} },
      },
      {
        name: "dolphin_shower_4_entity",
        label: labels.dolphin_shower_4_entity,
        description: labels.dolphin_shower_4_entity_desc,
        selector: { entity: {} },
      },
      {
        name: "dolphin_shower_5_entity",
        label: labels.dolphin_shower_5_entity,
        description: labels.dolphin_shower_5_entity_desc,
        selector: { entity: {} },
      },
      {
        name: "dolphin_shower_6_entity",
        label: labels.dolphin_shower_6_entity,
        description: labels.dolphin_shower_6_entity_desc,
        selector: { entity: {} },
      },
    ];
    const modeSchema = profile === "boiler_smarthome4u"
      ? [
        {
          name: "boost_time_entity",
          label: labels.boost_time_entity,
          selector: { entity: { domain: "number" } },
        },
        {
          name: "total_time_entity",
          label: labels.total_time_entity,
          selector: { entity: { domain: "number" } },
        },
        {
          name: "work_time_entity",
          label: labels.work_time_entity,
          selector: { entity: { domain: "number" } },
        },
        {
          name: "backlight_mode_entity",
          label: labels.backlight_mode_entity,
          selector: { entity: { domain: "switch" } },
        },
        {
          name: "child_lock_entity",
          label: labels.child_lock_entity,
          selector: { entity: { domain: "switch" } },
        },
        {
          name: "power_on_behavior_entity",
          label: labels.power_on_behavior_entity,
          selector: { entity: { domain: "select" } },
        },
        {
          name: "boost_timer_values",
          label: labels.boost_timer_values,
          selector: { text: {} },
        },
        {
          name: "off_boost_minutes",
          label: labels.off_boost_minutes,
          selector: { number: { min: 1, max: 360, step: 1, mode: "box" } },
        },
        {
          name: "power_sensor",
          label: labels.power_sensor,
          selector: { entity: { domain: "sensor" } },
        },
        {
          name: "current_sensor",
          label: labels.current_sensor,
          selector: { entity: { domain: "sensor" } },
        },
        {
          name: "voltage_sensor",
          label: labels.voltage_sensor,
          selector: { entity: { domain: "sensor" } },
        },
      ]
      : usesExtendedTimerUi
      ? [
        {
          name: "switcher_time_left_sensor",
          label: labels.switcher_time_left_sensor,
          selector: { entity: { domain: "sensor" } },
        },
        {
          name: "switcher_sensor_1",
          label: labels.switcher_sensor_1,
          selector: { entity: { domain: "sensor" } },
        },
        {
          name: "switcher_sensor_2",
          label: labels.switcher_sensor_2,
          selector: { entity: { domain: "sensor" } },
        },
        {
          name: "switcher_icon_sensor",
          label: labels.switcher_icon_sensor,
          selector: { entity: { domain: "sensor" } },
        },
        {
          name: "switcher_timer_values",
          label: labels.switcher_timer_values,
          selector: { text: {} },
        },
      ]
      : profile === "dolphin"
      ? [...regularModeSchema, ...dolphinExtraModeSchema]
      : regularModeSchema;
    const displaySchema = [
      {
        name: "card_theme",
        label: labels.card_theme || "Card theme",
        description: labels.card_theme_desc || "Dark Glass is the default. You can still switch to other themes anytime.",
        selector: {
          select: {
            mode: "dropdown",
            options: themeOptions,
          },
        },
      },
      {
        name: "ui_scale_percent",
        label: labels.ui_scale_percent || "Card size scale (%)",
        description: labels.ui_scale_percent_desc || "Increase card and popup size for better readability (recommended 110% on mobile).",
        selector: { number: { min: 90, max: 130, step: 5, mode: "slider" } },
      },
      {
        name: "mobile_popup_fullscreen",
        label: labels.mobile_popup_fullscreen || "Open popups in fullscreen on mobile",
        selector: { boolean: {} },
      },
      {
        name: "boiler_flow_image",
        label: labels.boiler_flow_image,
        selector: { text: {} },
      },
      {
        name: "hide_boiler_flow_image",
        label: labels.hide_boiler_flow_image,
        selector: { boolean: {} },
      },
      {
        name: "holiday_active_states",
        label: labels.holiday_active_states,
        description: labels.holiday_active_states_desc,
        selector: { text: {} },
      },
    ];

    this._setSectionForm("general", generalSchema);
    this._setSectionForm("integration", integrationSchema);
    this._setSectionForm("mode", modeSchema);
    this._setSectionForm("display", displaySchema);
    this._renderLanguageChips(languageOptions);
    this._renderDeviceProfiles();
  }

  _setSectionForm(sectionKey, schema) {
    const form = this._forms?.[sectionKey];
    if (!form) {
      return;
    }
    form.hass = this._hass;
    form.data = this._config;
    form.schema = schema;
  }

  _ensureEditorLayout() {
    const labels = this._labels();
    const profile = this._deviceProfile();
    let modeTitleText = labels.editor_mode_regular_title || "Regular mode settings";
    let modeDescText = labels.editor_mode_regular_desc || "Generic timer values and sensor entities used by the card.";
    if (profile === "switcher_touch") {
      modeTitleText = labels.editor_mode_switcher_title || "Switcher mode settings";
      modeDescText = labels.editor_mode_switcher_desc || "Auto-detected Switcher fields and timer profile.";
    } else if (profile === "boiler_smarthome4u") {
      modeTitleText = labels.editor_mode_smarthome4u_title || "boiler smarthome4u";
      modeDescText = labels.editor_mode_smarthome4u_desc || "Custom profile. Parameters will be configured separately.";
    } else if (profile === "dolphin") {
      modeTitleText = labels.editor_mode_dolphin_title || "Dolphin";
      modeDescText = labels.editor_mode_dolphin_desc || "Timers, sensors, and optional Dolphin switches (Sabbath, fixed temp, shower).";
    }
    if (this._editorRoot) {
      const modeTitle = this.querySelector("[data-editor-mode-title]");
      const modeDesc = this.querySelector("[data-editor-mode-desc]");
      if (modeTitle) {
        modeTitle.textContent = modeTitleText;
      }
      if (modeDesc) {
        modeDesc.textContent = modeDescText;
      }
      const sectionGeneralTitle = this.querySelector("[data-section-general-title]");
      const sectionGeneralDesc = this.querySelector("[data-section-general-desc]");
      const sectionHolidaysTitle = this.querySelector("[data-section-holidays-title]");
      const sectionHolidaysDesc = this.querySelector("[data-section-holidays-desc]");
      const sectionDisplayTitle = this.querySelector("[data-section-display-title]");
      const sectionDisplayDesc = this.querySelector("[data-section-display-desc]");
      if (sectionGeneralTitle) sectionGeneralTitle.textContent = labels.editor_section_general || "General";
      if (sectionGeneralDesc) sectionGeneralDesc.textContent = labels.editor_section_general_desc || "Core card identity and primary boiler entity selection.";
      if (sectionHolidaysTitle) sectionHolidaysTitle.textContent = labels.editor_section_holidays || "Holidays & Shabbat";
      if (sectionHolidaysDesc) sectionHolidaysDesc.textContent = labels.editor_section_holidays_desc || "Hebcal city synchronization through Boiler Manager options.";
      if (sectionDisplayTitle) sectionDisplayTitle.textContent = labels.editor_section_display || "Display & Compatibility";
      if (sectionDisplayDesc) sectionDisplayDesc.textContent = labels.editor_section_display_desc || "Flow image and optional active-state mapping for holiday entities.";
      this._syncSectionCollapseState();
      return;
    }

    this.innerHTML = `
      <style>
        .bm-editor-root {
          display: grid;
          gap: 12px;
          padding: 12px;
          border-radius: 16px;
          background:
            radial-gradient(120% 100% at 0% 0%, rgba(76, 141, 255, 0.16) 0%, rgba(76, 141, 255, 0) 55%),
            radial-gradient(120% 100% at 100% 0%, rgba(108, 92, 231, 0.14) 0%, rgba(108, 92, 231, 0) 52%),
            linear-gradient(180deg, rgba(20, 27, 45, 0.95) 0%, rgba(14, 20, 34, 0.9) 100%);
          border: 1px solid rgba(255, 255, 255, 0.09);
          box-shadow:
            0 10px 28px rgba(0, 0, 0, 0.32),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }
        .bm-editor-card {
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 14px;
          padding: 12px;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.04) 100%),
            rgba(10, 14, 24, 0.38);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.06),
            0 6px 16px rgba(0, 0, 0, 0.22);
          backdrop-filter: blur(8px);
        }
        .bm-editor-header {
          margin: -2px -2px 10px;
          width: calc(100% + 4px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          border: 0;
          background: transparent;
          cursor: pointer;
          color: inherit;
          padding: 0;
          text-align: start;
        }
        .bm-editor-header:focus-visible {
          outline: 2px solid var(--primary-color);
          outline-offset: 2px;
          border-radius: 10px;
        }
        .bm-editor-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .bm-editor-icon {
          font-size: 15px;
          opacity: 0.9;
          line-height: 1;
          width: 18px;
          text-align: center;
          flex: 0 0 auto;
        }
        .bm-editor-title {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          line-height: 1.3;
        }
        .bm-editor-chevron {
          color: var(--secondary-text-color);
          transition: transform 0.15s ease;
          transform: rotate(0deg);
          flex: 0 0 auto;
        }
        .bm-editor-card[data-collapsed="true"] .bm-editor-chevron {
          transform: rotate(-90deg);
        }
        .bm-editor-desc {
          margin: 0 0 8px;
          color: var(--secondary-text-color);
          font-size: 12px;
        }
        .bm-editor-lang-wrap {
          margin: 0 0 12px;
        }
        .bm-editor-profile-wrap {
          margin: 0 0 12px;
        }
        .bm-editor-profile-label {
          margin: 0 0 6px;
          font-size: 12px;
          color: var(--secondary-text-color);
        }
        .bm-editor-profile-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 8px;
        }
        .bm-editor-profile-card {
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          color: inherit;
          padding: 10px;
          cursor: pointer;
          text-align: start;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: transform 0.12s ease, border-color 0.12s ease, background 0.12s ease;
        }
        .bm-editor-profile-card:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.26);
          background: rgba(255, 255, 255, 0.06);
        }
        .bm-editor-profile-card[data-active="true"] {
          border-color: var(--primary-color);
          background:
            color-mix(in srgb, var(--primary-color) 22%, transparent);
          box-shadow: 0 0 0 1px color-mix(in srgb, var(--primary-color) 55%, transparent);
        }
        .bm-editor-profile-card:focus-visible {
          outline: 2px solid var(--primary-color);
          outline-offset: 1px;
        }
        .bm-editor-profile-thumb {
          width: 48px;
          height: 48px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.08);
          flex: 0 0 auto;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .bm-editor-profile-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .bm-editor-profile-name {
          font-size: 13px;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 2px;
        }
        .bm-editor-profile-subtitle {
          font-size: 11px;
          line-height: 1.3;
          color: var(--secondary-text-color);
        }
        .bm-editor-lang-label {
          margin: 0 0 6px;
          font-size: 12px;
          color: var(--secondary-text-color);
        }
        .bm-editor-lang-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .bm-editor-lang-chip {
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.02);
          color: inherit;
          padding: 6px 10px;
          font-size: 12px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: transform 0.12s ease, border-color 0.12s ease, background 0.12s ease;
        }
        .bm-editor-lang-chip:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.26);
          background: rgba(255, 255, 255, 0.06);
        }
        .bm-editor-lang-chip[data-active="true"] {
          border-color: var(--primary-color);
          background: color-mix(in srgb, var(--primary-color) 22%, transparent);
          font-weight: 600;
          box-shadow: 0 0 0 1px color-mix(in srgb, var(--primary-color) 55%, transparent);
        }
        .bm-editor-lang-chip:focus-visible {
          outline: 2px solid var(--primary-color);
          outline-offset: 1px;
        }
        .bm-editor-body[hidden] {
          display: none !important;
        }
      </style>
      <div class="bm-editor-root">
        <section class="bm-editor-card" data-section-key="general" data-collapsed="true">
          <button class="bm-editor-header" type="button" data-section-toggle="general" aria-expanded="false">
            <span class="bm-editor-title-wrap">
              <span class="bm-editor-icon" aria-hidden="true">⚙</span>
              <h3 class="bm-editor-title" data-section-general-title>${labels.editor_section_general || "General"}</h3>
            </span>
            <span class="bm-editor-chevron" aria-hidden="true">⌄</span>
          </button>
          <div class="bm-editor-body" data-section-body="general">
            <p class="bm-editor-desc" data-section-general-desc>${labels.editor_section_general_desc || "Core card identity and primary boiler entity selection."}</p>
            <div class="bm-editor-profile-wrap">
              <p class="bm-editor-profile-label" data-profile-label></p>
              <div class="bm-editor-profile-list" data-device-profiles></div>
            </div>
            <div class="bm-editor-lang-wrap">
              <p class="bm-editor-lang-label" data-language-label></p>
              <div class="bm-editor-lang-chips" data-language-chips></div>
            </div>
            <div data-section-form="general"></div>
          </div>
        </section>
        <section class="bm-editor-card" data-section-key="integration" data-collapsed="true">
          <button class="bm-editor-header" type="button" data-section-toggle="integration" aria-expanded="false">
            <span class="bm-editor-title-wrap">
              <span class="bm-editor-icon" aria-hidden="true">✡</span>
              <h3 class="bm-editor-title" data-section-holidays-title>${labels.editor_section_holidays || "Holidays & Shabbat"}</h3>
            </span>
            <span class="bm-editor-chevron" aria-hidden="true">⌄</span>
          </button>
          <div class="bm-editor-body" data-section-body="integration">
            <p class="bm-editor-desc" data-section-holidays-desc>${labels.editor_section_holidays_desc || "Hebcal city synchronization through Boiler Manager options."}</p>
            <div data-section-form="integration"></div>
          </div>
        </section>
        <section class="bm-editor-card" data-section-key="mode" data-collapsed="true">
          <button class="bm-editor-header" type="button" data-section-toggle="mode" aria-expanded="false">
            <span class="bm-editor-title-wrap">
              <span class="bm-editor-icon" aria-hidden="true">⏱</span>
              <h3 class="bm-editor-title" data-editor-mode-title>${modeTitleText}</h3>
            </span>
            <span class="bm-editor-chevron" aria-hidden="true">⌄</span>
          </button>
          <div class="bm-editor-body" data-section-body="mode">
            <p class="bm-editor-desc" data-editor-mode-desc>${modeDescText}</p>
            <div data-section-form="mode"></div>
          </div>
        </section>
        <section class="bm-editor-card" data-section-key="display" data-collapsed="true">
          <button class="bm-editor-header" type="button" data-section-toggle="display" aria-expanded="false">
            <span class="bm-editor-title-wrap">
              <span class="bm-editor-icon" aria-hidden="true">◈</span>
              <h3 class="bm-editor-title" data-section-display-title>${labels.editor_section_display || "Display & Compatibility"}</h3>
            </span>
            <span class="bm-editor-chevron" aria-hidden="true">⌄</span>
          </button>
          <div class="bm-editor-body" data-section-body="display">
            <p class="bm-editor-desc" data-section-display-desc>${labels.editor_section_display_desc || "Flow image and optional active-state mapping for holiday entities."}</p>
            <div data-section-form="display"></div>
          </div>
        </section>
      </div>
    `;
    this._editorRoot = this.querySelector(".bm-editor-root");
    this._forms = {};
    ["general", "integration", "mode", "display"].forEach((sectionKey) => {
      const mount = this.querySelector(`[data-section-form="${sectionKey}"]`);
      if (!mount) {
        return;
      }
      const form = document.createElement("ha-form");
      form.computeLabel = (schema) => schema.label;
      form.addEventListener("value-changed", (event) => this._onValueChanged(event));
      mount.appendChild(form);
      this._forms[sectionKey] = form;
    });
    this._bindSectionToggles();
    this._syncSectionCollapseState();
  }

  _renderLanguageChips(options) {
    const langMount = this.querySelector("[data-language-chips]");
    const langLabel = this.querySelector("[data-language-label]");
    if (!langMount || !langLabel) {
      return;
    }
    const labels = this._labels();
    langLabel.textContent = labels.language;
    const activeLang = this._normalizeLanguage(this._config?.language);
    const flagByLang = {
      he: "🇮🇱",
      en: "🇬🇧",
      ru: "🇷🇺",
      fr: "🇫🇷",
    };
    langMount.innerHTML = "";
    options.forEach((option) => {
      const value = this._normalizeLanguage(option.value);
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "bm-editor-lang-chip";
      chip.dataset.active = value === activeLang ? "true" : "false";
      chip.innerHTML = `<span>${flagByLang[value] || "🌐"}</span><span>${option.label}</span>`;
      chip.addEventListener("click", () => {
        if (value === activeLang) {
          return;
        }
        this._onValueChanged({ detail: { value: { language: value } } });
      });
      langMount.appendChild(chip);
    });
  }

  _renderDeviceProfiles() {
    const mount = this.querySelector("[data-device-profiles]");
    const label = this.querySelector("[data-profile-label]");
    if (!mount || !label) {
      return;
    }
    const labels = this._labels();
    label.textContent = labels.switcher_mode || "Device profile";
    const activeProfile = this._deviceProfile();
    const profiles = [
      {
        id: "standard",
        name: labels.profile_standard_name || "Standard Boiler",
        subtitle: labels.profile_standard_desc || "Generic profile for regular switch/light entities",
        image: "/local/boiler-card/boiler-flow.png",
        deviceProfile: "standard",
        switcherMode: false,
      },
      {
        id: "switcher_touch",
        name: labels.profile_switcher_name || "Switcher Touch",
        subtitle: labels.profile_switcher_desc || "Switcher-specific sensors, timer behavior and defaults",
        image: "/local/boiler-card/switcher-touch.png",
        deviceProfile: "switcher_touch",
        switcherMode: true,
      },
      {
        id: "boiler_smarthome4u",
        name: labels.profile_smarthome4u_name || "boiler smarthome4u",
        subtitle: labels.profile_smarthome4u_desc || "Custom boiler switch profile",
        image: "/local/boiler-card/boiler-smarthome4u.png",
        deviceProfile: "boiler_smarthome4u",
        switcherMode: false,
      },
      {
        id: "dolphin",
        name: labels.profile_dolphin_name || "Dolphin",
        subtitle: labels.profile_dolphin_desc || "Home Assistant Dolphin integration (climate entity)",
        image: "/local/boiler-card/boiler-dolphin.png",
        deviceProfile: "dolphin",
        switcherMode: false,
      },
    ];
    mount.innerHTML = "";
    profiles.forEach((profile) => {
      const active = activeProfile === profile.deviceProfile;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "bm-editor-profile-card";
      button.dataset.active = active ? "true" : "false";
      button.innerHTML = `
        <span class="bm-editor-profile-thumb" aria-hidden="true">
          <img src="${profile.image}" alt="${profile.name}">
        </span>
        <span>
          <span class="bm-editor-profile-name">${profile.name}</span>
          <span class="bm-editor-profile-subtitle">${profile.subtitle}</span>
        </span>
      `;
      button.addEventListener("click", () => {
        if (active) {
          return;
        }
        this._onValueChanged({
          detail: {
            value: {
              device_profile: profile.deviceProfile,
              switcher_mode: profile.switcherMode,
              boiler_flow_image: profile.image,
            },
          },
        });
      });
      mount.appendChild(button);
    });
  }

  _bindSectionToggles() {
    const toggles = this.querySelectorAll("[data-section-toggle]");
    toggles.forEach((toggleButton) => {
      toggleButton.addEventListener("click", () => {
        const sectionKey = String(toggleButton.dataset.sectionToggle || "").trim();
        if (!sectionKey) {
          return;
        }
        this._toggleSection(sectionKey);
      });
    });
  }

  _toggleSection(sectionKey) {
    const card = this.querySelector(`[data-section-key="${sectionKey}"]`);
    if (!card) {
      return;
    }
    const currentlyCollapsed = card.getAttribute("data-collapsed") === "true";
    card.setAttribute("data-collapsed", currentlyCollapsed ? "false" : "true");
    this._syncSectionCollapseState();
  }

  _syncSectionCollapseState() {
    const cards = this.querySelectorAll("[data-section-key]");
    cards.forEach((card) => {
      const sectionKey = String(card.getAttribute("data-section-key") || "").trim();
      if (!sectionKey) {
        return;
      }
      const collapsed = card.getAttribute("data-collapsed") === "true";
      const body = this.querySelector(`[data-section-body="${sectionKey}"]`);
      const toggleButton = this.querySelector(`[data-section-toggle="${sectionKey}"]`);
      if (body) {
        body.hidden = collapsed;
      }
      if (toggleButton) {
        toggleButton.setAttribute("aria-expanded", collapsed ? "false" : "true");
      }
    });
  }

  _onValueChanged(event) {
    const value = event?.detail?.value || {};
    const prevProfile = this._deviceProfile();
    const prevHebcalCity = String(this._config?.hebcal_city ?? "").trim();
    const prevLanguage = this._normalizeLanguage(this._config?.language);
    const hasLanguageChange = Object.prototype.hasOwnProperty.call(value, "language");
    const hasSwitcherModeChange = Object.prototype.hasOwnProperty.call(value, "switcher_mode");
    const hasDeviceProfileChange = Object.prototype.hasOwnProperty.call(value, "device_profile");
    const prevSwitcherMode = this._asTruthy(this._config?.switcher_mode);
    const nextLanguage = hasLanguageChange
      ? this._normalizeLanguage(value.language)
      : prevLanguage;
    let nextConfig = { ...this._config, ...value };
    if (hasDeviceProfileChange) {
      const dp = String(nextConfig.device_profile || "").trim().toLowerCase();
      nextConfig.switcher_mode = dp === "switcher_touch";
      const nextProfile = this._normalizeProfile(dp);
      const currentImage = String(this._config?.boiler_flow_image || "").trim();
      const incomingImage = String(value.boiler_flow_image || "").trim();
      const prevDefaultImage = this._profileDefaultImage(prevProfile);
      const nextDefaultImage = this._profileDefaultImage(nextProfile);
      if (!incomingImage && (!currentImage || currentImage === prevDefaultImage)) {
        nextConfig.boiler_flow_image = nextDefaultImage;
      }
    } else if (hasSwitcherModeChange) {
      const nextSwitcherMode = this._asTruthy(nextConfig?.switcher_mode);
      if (nextSwitcherMode) {
        nextConfig.device_profile = "switcher_touch";
      } else if (prevProfile === "switcher_touch") {
        nextConfig.device_profile = "standard";
      }
    }
    const nextSwitcherMode = this._asTruthy(nextConfig?.switcher_mode);
    nextConfig.ui_scale_percent = this._normalizeUiScalePercent(nextConfig?.ui_scale_percent);
    nextConfig.mobile_popup_fullscreen = this._asTruthy(nextConfig?.mobile_popup_fullscreen);

    if (hasLanguageChange && nextLanguage !== prevLanguage) {
      const titleFromCurrentConfig = typeof this._config?.title === "string"
        ? this._config.title
        : "";
      const titleFromNextConfig = typeof nextConfig?.title === "string"
        ? nextConfig.title
        : "";
      const shouldReplaceTitle = this._isAutoDefaultTitle(titleFromCurrentConfig)
        && this._isAutoDefaultTitle(titleFromNextConfig);

      if (shouldReplaceTitle) {
        nextConfig.title = this._defaultTitleForLanguage(nextLanguage);
      }
    }

    if (nextSwitcherMode) {
      nextConfig = this._withSwitcherModeDefaults(nextConfig, {
        preserveManualValues: true,
      });
    } else {
      const runService = String(nextConfig.service_run_timed || "").trim().toLowerCase();
      const onService = String(nextConfig.service_on_continuous || "").trim().toLowerCase();
      const offService = String(nextConfig.service_off || "").trim().toLowerCase();
      if (runService === "switcher_kis.turn_on_with_timer") {
        nextConfig.service_run_timed = DEFAULT_CONFIG.service_run_timed;
      }
      if (hasSwitcherModeChange && prevSwitcherMode && !nextSwitcherMode && onService === "homeassistant.turn_on") {
        nextConfig.service_on_continuous = DEFAULT_CONFIG.service_on_continuous;
      }
      if (hasSwitcherModeChange && prevSwitcherMode && !nextSwitcherMode && offService === "homeassistant.turn_off") {
        nextConfig.service_off = DEFAULT_CONFIG.service_off;
      }
    }

    const nextHebcalCity = String(nextConfig?.hebcal_city ?? "").trim();
    const hebcalEntryId = String(nextConfig?.integration_entry_id || "").trim();

    this._config = nextConfig;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: nextConfig },
    }));

    if (
      hebcalEntryId
      && prevHebcalCity !== nextHebcalCity
      && this._isServiceAvailable("boiler_manager.refresh_hebcal")
    ) {
      void this._hass.callService("boiler_manager", "refresh_hebcal", {
        entry_id: hebcalEntryId,
        hebcal_city: nextHebcalCity,
      }).catch(() => {});
    }

    // Keep editor stable so dropdown/entity selectors stay interactive.
    const profileChanged = hasDeviceProfileChange
      || (hasSwitcherModeChange && nextSwitcherMode !== prevSwitcherMode);
    if ((hasLanguageChange && nextLanguage !== prevLanguage) || profileChanged) {
      this._render();
    }
  }

  _deviceProfile() {
    const raw = String(this._config?.device_profile || "").trim().toLowerCase();
    if (
      raw === "switcher_touch"
      || raw === "boiler_smarthome4u"
      || raw === "standard"
      || raw === "dolphin"
    ) {
      return raw;
    }
    if (this._asTruthy(this._config?.switcher_mode)) {
      return "switcher_touch";
    }
    return "standard";
  }

  _normalizeProfile(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (
      raw === "switcher_touch"
      || raw === "boiler_smarthome4u"
      || raw === "standard"
      || raw === "dolphin"
    ) {
      return raw;
    }
    return "standard";
  }

  _normalizeUiScalePercent(value) {
    const parsed = Number.parseInt(String(value ?? DEFAULT_CONFIG.ui_scale_percent ?? 100), 10);
    if (!Number.isFinite(parsed)) {
      return 100;
    }
    return Math.min(130, Math.max(90, parsed));
  }

  _profileDefaultImage(profile) {
    const normalized = this._normalizeProfile(profile);
    if (normalized === "switcher_touch") {
      return "/local/boiler-card/switcher-touch.png";
    }
    if (normalized === "boiler_smarthome4u") {
      return "/local/boiler-card/boiler-smarthome4u.png";
    }
    if (normalized === "dolphin") {
      return "/local/boiler-card/boiler-dolphin.png";
    }
    return "/local/boiler-card/boiler-flow.png";
  }

  _usesExtendedTimerUi() {
    return this._deviceProfile() === "switcher_touch";
  }

  _asTruthy(value) {
    if (typeof value === "boolean") {
      return value;
    }
    const normalized = String(value ?? "").trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "on" || normalized === "yes";
  }

  _normalizeLanguage(language) {
    const normalized = String(language || "").trim().toLowerCase();
    return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : "he";
  }

  _defaultTitleForLanguage(language) {
    const lang = this._normalizeLanguage(language);
    return I18N[lang]?.default_title ?? I18N.he.default_title;
  }

  _isAutoDefaultTitle(title) {
    const normalized = String(title || "").trim();
    if (!normalized) {
      return false;
    }
    return SUPPORTED_LANGUAGES.some((lang) => {
      const candidate = String(I18N[lang]?.default_title || "").trim();
      return candidate && candidate === normalized;
    });
  }

  _labels() {
    const language = String(this._config?.language || "he").toLowerCase();
    const lang = SUPPORTED_LANGUAGES.includes(language) ? language : "he";
    const map = {
      he: {
        language: "שפה",
        title: "כותרת",
        switcher_mode: "פרופיל התקן",
        boiler_entity: "ישות דוד",
        temperature_sensor: "🌡️ סנסור טמפרטורה",
        power_sensor: "⚡ סנסור צריכה (W)",
        current_sensor: "🔌 סנסור זרם",
        voltage_sensor: "🔋 סנסור מתח",
        switcher_time_left_sensor: "חיישן זמן נותר (סוויצ'ר)",
        switcher_sensor_1: "חיישן 1 - מוצג רק כשהדוד דולק",
        switcher_sensor_2: "חיישן 2 - תמיד מוצג",
        switcher_icon_sensor: "חיישן טמפרטורה לאייקון ולהתקדמות",
        switcher_timer_values: "ערכי טיימר בדקות (לדוגמה: 15,30,45,60)",
        boost_time_entity: "⏱️ ישות Boost Time (number)",
        total_time_entity: "🕒 ישות Total Time (number)",
        work_time_entity: "⌛ ישות Work Time (number)",
        backlight_mode_entity: "💡 ישות מצב תאורה אחורית (switch)",
        child_lock_entity: "🔒 ישות נעילת ילדים (switch)",
        power_on_behavior_entity: "⚡ ישות התנהגות לאחר הפסקת חשמל (select)",
        boost_timer_values: "כפתורי טיימר בדקות (לדוגמה: 15,30,60,90)",
        off_boost_minutes: "ערך Boost לכיבוי (בדקות)",
        timer_values: "ערכי טיימר בדקות (גנרי, לדוגמה: 20,40,90)",
        card_theme: "ערכת נושא לכרטיס",
        card_theme_desc: "זכוכית כהה היא ברירת המחדל. תמיד אפשר לעבור לערכות נושא אחרות.",
        card_theme_classic: "קלאסי",
        card_theme_dark_glass: "זכוכית כהה",
        card_theme_amber_glow: "זוהר כתום",
        card_theme_smart_room_blue: "כחול סמארט רום",
        card_theme_midnight_black: "שחור חצות",
        card_theme_gallery_neon: "גלריה ניאון",
        card_theme_slate_ice: "צפחה קרה",
        card_theme_neo_contrast: "ניאו קונטרסט",
        card_theme_clear_frost: "זכוכית שקופה",
        ui_scale_percent: "הגדלת כרטיס ותפריטים (%)",
        ui_scale_percent_desc: "מגדיל את הכרטיס והפופאפים לקריאות טובה יותר (מומלץ 110% במובייל).",
        mobile_popup_fullscreen: "פתח פופאפים במסך מלא במובייל",
        lang_option_he: "עברית",
        lang_option_en: "אנגלית",
        lang_option_ru: "רוסית",
        lang_option_fr: "צרפתית",
        editor_section_general: "כללי",
        editor_section_general_desc: "זהות הכרטיס והגדרת ישות הדוד הראשית.",
        editor_section_holidays: "חגים ושבת",
        editor_section_holidays_desc: "סנכרון עיר לוח השנה דרך אפשרויות האינטגרציה.",
        editor_mode_regular_title: "הגדרות מצב רגיל",
        editor_mode_switcher_title: "הגדרות מצב סוויצ'ר",
        editor_mode_regular_desc: "ערכי טיימר כלליים וחיישנים לשימוש הכרטיס.",
        editor_mode_switcher_desc: "שדות סוויצ'ר שזוהו אוטומטית, כולל טיימרים וחיישנים ייעודיים.",
        editor_section_display: "תצוגה ותאימות",
        editor_section_display_desc: "תמונת זרימה ומיפוי מצבי חג/שבת לפי ישויות.",
        profile_standard_name: "בוילר סטנדרטי",
        profile_standard_desc: "פרופיל כללי לישויות רגילות מסוג מתג/תאורה",
        profile_switcher_name: "סוויצ'ר טאץ'",
        profile_switcher_desc: "חיישני סוויצ'ר ייעודיים, התנהגות טיימר וברירות מחדל מותאמות",
        profile_smarthome4u_name: "בוילר של סמארט הום 4 יו",
        profile_smarthome4u_desc: "פרופיל ייעודי למתג boiler smarthome4u. פרמטרים יוגדרו בנפרד.",
        profile_dolphin_name: "דולפין",
        profile_dolphin_desc: "אינטגרציית Dolphin ב-Home Assistant — בחרו ישות climate כדוד ראשי",
        editor_mode_dolphin_title: "דולפין",
        editor_mode_dolphin_desc: "טיימרים, חיישנים ומתגי Dolphin אופציונליים (שבת, טמפ' קבועה, מקלחת).",
        dolphin_temperature_sensor_desc: "אופציונלי. אם ריק — הכרטיס משתמש ב-current_temperature מישות ה-climate של הדוד.",
        dolphin_current_sensor_auto_desc: "אופציונלי. אם ריק — ניסיון להתאים אוטומטית ל-dolphin.*_electric_current לפי שם ישות ה-climate.",
        dolphin_sabbath_entity: "מתג מצב שבת (Dolphin)",
        dolphin_sabbath_entity_desc: "ישות dolphin.* — Sabbath mode מהאינטגרציה.",
        dolphin_fixed_temperature_entity: "מתג טמפרטורה קבועה (Dolphin)",
        dolphin_fixed_temperature_entity_desc: "ישות dolphin.* — Fixed temperature.",
        dolphin_shower_entity: "מקלחת 1 — מתג Dolphin (drop1)",
        dolphin_shower_entity_desc: "ישות dolphin.* — הריג׳׳ הראשונה. אופציונלי.",
        dolphin_shower_2_entity: "מקלחת 2 — מתג Dolphin (drop2)",
        dolphin_shower_2_entity_desc: "אופציונלי.",
        dolphin_shower_3_entity: "מקלחת 3 — מתג Dolphin (drop3)",
        dolphin_shower_3_entity_desc: "אופציונלי.",
        dolphin_shower_4_entity: "מקלחת 4 — מתג Dolphin (drop4)",
        dolphin_shower_4_entity_desc: "אופציונלי.",
        dolphin_shower_5_entity: "מקלחת 5 — מתג Dolphin (drop5)",
        dolphin_shower_5_entity_desc: "אופציונלי.",
        dolphin_shower_6_entity: "מקלחת 6 — מתג Dolphin (drop6)",
        dolphin_shower_6_entity_desc: "אופציונלי.",
        editor_mode_smarthome4u_title: "בוילר של סמארט הום 4 יו",
        editor_mode_smarthome4u_desc: "פרופיל מותאם אישית. הפרמטרים יוגדרו לפי הדרישות שלך.",
        boiler_flow_image: "תמונת זרימת מים (נתיב או כתובת)",
        hide_boiler_flow_image: "הסתר תמונה בכרטיס",
        integration_entry_id: "מזהה אינטגרציה (integration_entry_id)",
        hebcal_city: "עיר (חגים ושבת — לוח שנה)",
        hebcal_city_desc:
          "נשמר באפשרויות האינטגרציה ומעדכן את קובץ הלוח המקומי. נדרש מזהה אינטגרציה (integration_entry_id) בכרטיס. \"כמו באינטגרציה\" מסיר את העיר מהאפשרויות ומשתמש בערך מהגדרת האינטגרציה.",
        hebcal_city_keep_integration: "כמו באינטגרציה (אל תשנה עיר)",
        holiday_active_states: "חג/שבת — אילו ערכי מצב נחשבים \"פעיל\" (בעיקר עם holiday_entity / shabbat_entity בתצורת קוד)",
        holiday_active_states_desc:
          "רשימה מופרדת בפסיקים של ערכי מצב. כשמגדירים בתצורת קוד את holiday_entity ו/או shabbat_entity, הכרטיס משווה את המצב שלהן לרשימה — אם יש התאמה, המקור נחשב פעיל ללוגיקת חג/שבת (יחד עם כללי הטאב בתפריט). אם משתמשים רק בלוח השנה מהאינטגרציה בלי שני השדות האלה — אפשר להשאיר ברירת מחדל; השפעה מינימלית. דוגמה: on,home,active,true",
      },
      en: {
        language: "Language",
        title: "Title",
        switcher_mode: "Switcher Mode",
        boiler_entity: "Boiler Entity",
        temperature_sensor: "🌡️ Temperature Sensor",
        power_sensor: "⚡ Power Sensor (W)",
        current_sensor: "🔌 Current Sensor",
        voltage_sensor: "🔋 Voltage Sensor",
        switcher_time_left_sensor: "Switcher Time Left Sensor",
        switcher_sensor_1: "Switcher Sensor 1 (On only)",
        switcher_sensor_2: "Switcher Sensor 2 (Always)",
        switcher_icon_sensor: "Switcher Icon Temperature Sensor",
        switcher_timer_values: "Switcher Timer Values in minutes (e.g. 15,30,45,60)",
        boost_time_entity: "⏱️ Boost Time Entity (number)",
        total_time_entity: "🕒 Total Time Entity (number)",
        work_time_entity: "⌛ Work Time Entity (number)",
        backlight_mode_entity: "💡 Backlight mode entity (switch)",
        child_lock_entity: "🔒 Child lock entity (switch)",
        power_on_behavior_entity: "⚡ Power-on behavior entity (select)",
        boost_timer_values: "Timer button values in minutes (e.g. 15,30,60,90)",
        off_boost_minutes: "Boost value to set on OFF (minutes)",
        timer_values: "Timer Values in minutes (generic, e.g. 20,40,90)",
        card_theme: "Card Theme",
        card_theme_desc: "Dark Glass is the default. You can still switch to other themes anytime.",
        card_theme_classic: "Classic",
        card_theme_dark_glass: "Dark Glass",
        card_theme_amber_glow: "Amber Glow",
        card_theme_smart_room_blue: "Smart Room Blue",
        card_theme_midnight_black: "Midnight Black",
        card_theme_gallery_neon: "Gallery Neon",
        card_theme_slate_ice: "Slate Ice",
        card_theme_neo_contrast: "Neo Contrast",
        card_theme_clear_frost: "Clear Frost",
        ui_scale_percent: "Card and menu scale (%)",
        ui_scale_percent_desc: "Scales up the card and popups for readability (110% is recommended on mobile).",
        mobile_popup_fullscreen: "Open popups in fullscreen on mobile",
        lang_option_he: "Hebrew",
        lang_option_en: "English",
        lang_option_ru: "Russian",
        lang_option_fr: "French",
        editor_section_general: "General",
        editor_section_general_desc: "Core card identity and primary boiler entity selection.",
        editor_section_holidays: "Holidays & Shabbat",
        editor_section_holidays_desc: "Hebcal city synchronization through Boiler Manager options.",
        editor_mode_regular_title: "Regular mode settings",
        editor_mode_switcher_title: "Switcher mode settings",
        editor_mode_regular_desc: "Generic timer values and sensor entities used by the card.",
        editor_mode_switcher_desc: "Auto-detected Switcher fields and timer profile.",
        editor_section_display: "Display & Compatibility",
        editor_section_display_desc: "Flow image and optional active-state mapping for holiday entities.",
        profile_standard_name: "Standard Boiler",
        profile_standard_desc: "Generic profile for regular switch/light entities",
        profile_switcher_name: "Switcher Touch",
        profile_switcher_desc: "Switcher-specific sensors, timer behavior and defaults",
        profile_smarthome4u_name: "boiler smarthome4u",
        profile_smarthome4u_desc: "Dedicated profile for boiler smarthome4u. Parameters will be defined separately.",
        profile_dolphin_name: "Dolphin",
        profile_dolphin_desc: "Home Assistant Dolphin integration — pick a climate entity as the main boiler",
        editor_mode_dolphin_title: "Dolphin",
        editor_mode_dolphin_desc: "Timers, sensors, and optional Dolphin switches (Sabbath, fixed temperature, shower).",
        dolphin_temperature_sensor_desc: "Optional. If empty, the card uses current_temperature from the boiler climate entity.",
        dolphin_current_sensor_auto_desc: "Optional. If empty, the card tries to match dolphin.*_electric_current from the climate entity object id.",
        dolphin_sabbath_entity: "Sabbath mode entity (Dolphin)",
        dolphin_sabbath_entity_desc: "dolphin.* entity from the Dolphin integration (Sabbath mode).",
        dolphin_fixed_temperature_entity: "Fixed temperature entity (Dolphin)",
        dolphin_fixed_temperature_entity_desc: "dolphin.* entity — Fixed temperature mode.",
        dolphin_shower_entity: "Shower 1 entity (Dolphin drop1)",
        dolphin_shower_entity_desc: "dolphin.* shower rig 1. Optional.",
        dolphin_shower_2_entity: "Shower 2 entity (Dolphin drop2)",
        dolphin_shower_2_entity_desc: "Optional.",
        dolphin_shower_3_entity: "Shower 3 entity (Dolphin drop3)",
        dolphin_shower_3_entity_desc: "Optional.",
        dolphin_shower_4_entity: "Shower 4 entity (Dolphin drop4)",
        dolphin_shower_4_entity_desc: "Optional.",
        dolphin_shower_5_entity: "Shower 5 entity (Dolphin drop5)",
        dolphin_shower_5_entity_desc: "Optional.",
        dolphin_shower_6_entity: "Shower 6 entity (Dolphin drop6)",
        dolphin_shower_6_entity_desc: "Optional.",
        editor_mode_smarthome4u_title: "boiler smarthome4u",
        editor_mode_smarthome4u_desc: "Custom profile. Parameters will be defined per your exact device logic.",
        boiler_flow_image: "Water Flow Image (path / URL)",
        hide_boiler_flow_image: "Hide water flow image on card",
        integration_entry_id: "Integration entry ID (integration_entry_id)",
        hebcal_city: "City (holidays & Shabbat — Hebcal)",
        hebcal_city_desc:
          "Stored in Boiler Manager integration options and refreshes the local JSON cache. Requires integration_entry_id on the card. \"Match integration\" removes the city override and uses the value from the integration config.",
        hebcal_city_keep_integration: "Match integration (do not set city)",
        holiday_active_states: "Holiday/Shabbat — HA state values treated as active (mainly with YAML holiday_entity / shabbat_entity)",
        holiday_active_states_desc:
          "Comma-separated Home Assistant state strings. When holiday_entity and/or shabbat_entity are set in YAML, the card treats a source as active if its current state matches any entry (e.g. on for binary sensors, home for some device trackers). Hebcal-only setups without those entities can keep the default with little effect. Example: on,home,active,true",
      },
      ru: {
        language: "Язык",
        title: "Заголовок",
        switcher_mode: "Режим Switcher",
        boiler_entity: "Сущность бойлера",
        temperature_sensor: "🌡️ Датчик температуры",
        power_sensor: "⚡ Датчик мощности (W)",
        current_sensor: "🔌 Датчик тока",
        voltage_sensor: "🔋 Датчик напряжения",
        switcher_time_left_sensor: "Switcher датчик оставшегося времени",
        switcher_sensor_1: "Switcher датчик 1 (только ВКЛ)",
        switcher_sensor_2: "Switcher датчик 2 (всегда)",
        switcher_icon_sensor: "Switcher датчик температуры иконки",
        switcher_timer_values: "Значения таймера Switcher в минутах (например 15,30,45,60)",
        boost_time_entity: "⏱️ Сущность Boost Time (number)",
        total_time_entity: "🕒 Сущность Total Time (number)",
        work_time_entity: "⌛ Сущность Work Time (number)",
        backlight_mode_entity: "💡 Сущность подсветки (switch)",
        child_lock_entity: "🔒 Сущность блокировки от детей (switch)",
        power_on_behavior_entity: "⚡ Сущность поведения после питания (select)",
        boost_timer_values: "Кнопки таймера в минутах (например 15,30,60,90)",
        off_boost_minutes: "Значение Boost при выключении (минуты)",
        timer_values: "Значения таймера в минутах (общие, например 20,40,90)",
        card_theme: "Тема карточки",
        card_theme_desc: "Темное стекло — тема по умолчанию. При желании можно переключиться на другие темы.",
        card_theme_classic: "Классическая",
        card_theme_dark_glass: "Темное стекло",
        card_theme_amber_glow: "Янтарное свечение",
        card_theme_smart_room_blue: "Смарт-рум синий",
        card_theme_midnight_black: "Полуночный черный",
        card_theme_gallery_neon: "Неоновая галерея",
        card_theme_slate_ice: "Сланцевый лед",
        card_theme_neo_contrast: "Нео контраст",
        card_theme_clear_frost: "Прозрачный иней",
        ui_scale_percent: "Масштаб карты и меню (%)",
        ui_scale_percent_desc: "Увеличивает карту и всплывающие окна для лучшей читаемости (на мобильном рекомендуется 110%).",
        mobile_popup_fullscreen: "Открывать окна на весь экран в мобильном",
        lang_option_he: "Иврит",
        lang_option_en: "Английский",
        lang_option_ru: "Русский",
        lang_option_fr: "Французский",
        editor_section_general: "Общие",
        editor_section_general_desc: "Основные параметры карточки и выбор сущности бойлера.",
        editor_section_holidays: "Праздники и Шаббат",
        editor_section_holidays_desc: "Синхронизация города Hebcal через опции Boiler Manager.",
        editor_mode_regular_title: "Настройки обычного режима",
        editor_mode_switcher_title: "Настройки режима Switcher",
        editor_mode_regular_desc: "Общие значения таймера и датчики, используемые карточкой.",
        editor_mode_switcher_desc: "Автоопределенные поля Switcher и профиль таймера.",
        editor_section_display: "Отображение и совместимость",
        editor_section_display_desc: "Изображение потока и сопоставление активных состояний праздников/Шаббата.",
        profile_standard_name: "Стандартный бойлер",
        profile_standard_desc: "Общий профиль для обычных сущностей switch/light",
        profile_switcher_name: "Switcher Touch",
        profile_switcher_desc: "Поля датчиков Switcher, поведение таймера и специальные значения по умолчанию",
        profile_smarthome4u_name: "Бойлер Smart Home 4U",
        profile_smarthome4u_desc: "Специальный профиль для boiler smarthome4u. Параметры будут заданы отдельно.",
        profile_dolphin_name: "Dolphin",
        profile_dolphin_desc: "Интеграция Dolphin в Home Assistant — укажите сущность climate как основной бойлер",
        editor_mode_dolphin_title: "Dolphin",
        editor_mode_dolphin_desc: "Таймеры, датчики и опциональные переключатели Dolphin (Шаббат, фикс. температура, душ).",
        dolphin_temperature_sensor_desc: "Необязательно. Если пусто — карточка берёт current_temperature из climate бойлера.",
        dolphin_current_sensor_auto_desc: "Необязательно. Если пусто — карточка пытается сопоставить dolphin.*_electric_current по id climate.",
        dolphin_sabbath_entity: "Сущность режима Шаббат (Dolphin)",
        dolphin_sabbath_entity_desc: "Сущность dolphin.* — Sabbath mode интеграции.",
        dolphin_fixed_temperature_entity: "Сущность фикс. температуры (Dolphin)",
        dolphin_fixed_temperature_entity_desc: "Сущность dolphin.* — режим фиксированной температуры.",
        dolphin_shower_entity: "Душ 1 (Dolphin drop1)",
        dolphin_shower_entity_desc: "Сущность dolphin.*. Необязательно.",
        dolphin_shower_2_entity: "Душ 2 (Dolphin drop2)",
        dolphin_shower_2_entity_desc: "Необязательно.",
        dolphin_shower_3_entity: "Душ 3 (Dolphin drop3)",
        dolphin_shower_3_entity_desc: "Необязательно.",
        dolphin_shower_4_entity: "Душ 4 (Dolphin drop4)",
        dolphin_shower_4_entity_desc: "Необязательно.",
        dolphin_shower_5_entity: "Душ 5 (Dolphin drop5)",
        dolphin_shower_5_entity_desc: "Необязательно.",
        dolphin_shower_6_entity: "Душ 6 (Dolphin drop6)",
        dolphin_shower_6_entity_desc: "Необязательно.",
        editor_mode_smarthome4u_title: "Бойлер Smart Home 4U",
        editor_mode_smarthome4u_desc: "Пользовательский профиль. Параметры будут настроены по вашей точной логике.",
        boiler_flow_image: "Изображение потока (путь / URL)",
        hide_boiler_flow_image: "Скрыть изображение потока на карточке",
        integration_entry_id: "ID интеграции (integration_entry_id)",
        hebcal_city: "Город (праздники и Шаббат — Hebcal)",
        hebcal_city_desc:
          "Сохраняется в настройках интеграции Boiler Manager и обновляет локальный JSON. Нужен integration_entry_id в карточке. «Как в интеграции» снимает переопределение города.",
        hebcal_city_keep_integration: "Как в интеграции (не менять город)",
        holiday_active_states: "Праздник/Шаббат — значения state как «активно» (в основном при YAML holiday_entity / shabbat_entity)",
        holiday_active_states_desc:
          "Список значений state через запятую. Если в YAML заданы holiday_entity и/или shabbat_entity, карточка считает источник активным при совпадении state с любым из значений. Только Hebcal без этих сущностей — можно оставить по умолчанию. Пример: on,home,active,true",
      },
      fr: {
        language: "Langue",
        title: "Titre",
        switcher_mode: "Mode Switcher",
        boiler_entity: "Entité chauffe-eau",
        temperature_sensor: "🌡️ Capteur de température",
        power_sensor: "⚡ Capteur de puissance (W)",
        current_sensor: "🔌 Capteur de courant",
        voltage_sensor: "🔋 Capteur de tension",
        switcher_time_left_sensor: "Capteur temps restant Switcher",
        switcher_sensor_1: "Capteur Switcher 1 (marche)",
        switcher_sensor_2: "Capteur Switcher 2 (toujours)",
        switcher_icon_sensor: "Capteur température icône Switcher",
        switcher_timer_values: "Valeurs minuterie Switcher en minutes (ex: 15,30,45,60)",
        boost_time_entity: "⏱️ Entite Boost Time (number)",
        total_time_entity: "🕒 Entite Total Time (number)",
        work_time_entity: "⌛ Entite Work Time (number)",
        backlight_mode_entity: "💡 Entite mode retroeclairage (switch)",
        child_lock_entity: "🔒 Entite verrouillage enfant (switch)",
        power_on_behavior_entity: "⚡ Entite comportement au retour du courant (select)",
        boost_timer_values: "Valeurs des boutons minuterie en minutes (ex: 15,30,60,90)",
        off_boost_minutes: "Valeur Boost appliquee a l'arret (minutes)",
        timer_values: "Valeurs minuterie en minutes (générique, ex: 20,40,90)",
        card_theme: "Theme de la carte",
        card_theme_desc: "Le verre sombre est le theme par defaut. Vous pouvez toujours changer vers d'autres themes.",
        card_theme_classic: "Classique",
        card_theme_dark_glass: "Verre sombre",
        card_theme_amber_glow: "Lueur ambree",
        card_theme_smart_room_blue: "Bleu Smart Room",
        card_theme_midnight_black: "Noir Minuit",
        card_theme_gallery_neon: "Neon Galerie",
        card_theme_slate_ice: "Ardoise Glace",
        card_theme_neo_contrast: "Neo Contraste",
        card_theme_clear_frost: "Givre Transparent",
        ui_scale_percent: "Echelle carte et menus (%)",
        ui_scale_percent_desc: "Agrandit la carte et les popups pour une meilleure lisibilite (110% recommande sur mobile).",
        mobile_popup_fullscreen: "Ouvrir les popups en plein ecran sur mobile",
        lang_option_he: "Hebreu",
        lang_option_en: "Anglais",
        lang_option_ru: "Russe",
        lang_option_fr: "Francais",
        editor_section_general: "General",
        editor_section_general_desc: "Identite de base de la carte et selection de l'entite chauffe-eau principale.",
        editor_section_holidays: "Fetes & Chabbat",
        editor_section_holidays_desc: "Synchronisation de la ville Hebcal via les options Boiler Manager.",
        editor_mode_regular_title: "Parametres mode normal",
        editor_mode_switcher_title: "Parametres mode Switcher",
        editor_mode_regular_desc: "Valeurs de minuterie generiques et capteurs utilises par la carte.",
        editor_mode_switcher_desc: "Champs Switcher detectes automatiquement et profil minuterie.",
        editor_section_display: "Affichage et compatibilite",
        editor_section_display_desc: "Image de flux et mappage optionnel des etats actifs pour fetes/Chabbat.",
        profile_standard_name: "Boiler standard",
        profile_standard_desc: "Profil generique pour les entites switch/light standard",
        profile_switcher_name: "Switcher Touch",
        profile_switcher_desc: "Capteurs Switcher dedies, comportement minuterie et valeurs par defaut",
        profile_smarthome4u_name: "Boiler Smart Home 4U",
        profile_smarthome4u_desc: "Profil dedie pour boiler smarthome4u. Les parametres seront definis separement.",
        profile_dolphin_name: "Dolphin",
        profile_dolphin_desc: "Integration Dolphin pour Home Assistant — choisissez une entite climate comme chauffe-eau principal",
        editor_mode_dolphin_title: "Dolphin",
        editor_mode_dolphin_desc: "Minuteries, capteurs et interrupteurs Dolphin optionnels (Chabbat, temperature fixe, douche).",
        dolphin_temperature_sensor_desc: "Optionnel. Si vide, la carte utilise current_temperature de l'entite climate du chauffe-eau.",
        dolphin_current_sensor_auto_desc: "Optionnel. Si vide, la carte tente d'associer dolphin.*_electric_current selon l'id de l'entite climate.",
        dolphin_sabbath_entity: "Entite mode Chabbat (Dolphin)",
        dolphin_sabbath_entity_desc: "Entite dolphin.* — Sabbath mode de l'integration.",
        dolphin_fixed_temperature_entity: "Entite temperature fixe (Dolphin)",
        dolphin_fixed_temperature_entity_desc: "Entite dolphin.* — mode temperature fixe.",
        dolphin_shower_entity: "Douche 1 (Dolphin drop1)",
        dolphin_shower_entity_desc: "Entite dolphin.*. Optionnel.",
        dolphin_shower_2_entity: "Douche 2 (Dolphin drop2)",
        dolphin_shower_2_entity_desc: "Optionnel.",
        dolphin_shower_3_entity: "Douche 3 (Dolphin drop3)",
        dolphin_shower_3_entity_desc: "Optionnel.",
        dolphin_shower_4_entity: "Douche 4 (Dolphin drop4)",
        dolphin_shower_4_entity_desc: "Optionnel.",
        dolphin_shower_5_entity: "Douche 5 (Dolphin drop5)",
        dolphin_shower_5_entity_desc: "Optionnel.",
        dolphin_shower_6_entity: "Douche 6 (Dolphin drop6)",
        dolphin_shower_6_entity_desc: "Optionnel.",
        editor_mode_smarthome4u_title: "Boiler Smart Home 4U",
        editor_mode_smarthome4u_desc: "Profil personnalise. Les parametres seront definis selon votre logique exacte.",
        boiler_flow_image: "Image du flux d'eau (chemin / URL)",
        hide_boiler_flow_image: "Masquer l'image du flux sur la carte",
        integration_entry_id: "ID d'integration (integration_entry_id)",
        hebcal_city: "Ville (fêtes et Chabbat — Hebcal)",
        hebcal_city_desc:
          "Enregistré dans les options d'intégration Boiler Manager et rafraîchit le fichier JSON local. Nécessite integration_entry_id sur la carte. «Comme l'intégration» retire la ville des options.",
        hebcal_city_keep_integration: "Comme l'intégration (ne pas définir la ville)",
        holiday_active_states: "Fête/Chabbat — états HA considérés actifs (surtout avec YAML holiday_entity / shabbat_entity)",
        holiday_active_states_desc:
          "Liste d'états Home Assistant séparés par des virgules. Si holiday_entity et/ou shabbat_entity sont définis dans le YAML, la carte considère la source active quand l'état courant correspond. Hebcal seul sans ces entités : la valeur par défaut suffit. Ex. : on,home,active,true",
      },
    };

    return map[lang];
  }
}

  if (!customElements.get("boiler-water-card-editor")) {
    customElements.define("boiler-water-card-editor", BoilerWaterCardEditor);
  }
}
