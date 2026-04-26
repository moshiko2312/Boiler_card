import { I18N, SUPPORTED_LANGUAGES } from "./boiler-i18n.js";
import { registerBoilerCardEditor } from "./boiler-editor.js";
import { buildThemeCss, normalizeCardTheme } from "./boiler-themes.js";
import { HEBCAL_CITY_META, DEFAULT_CONFIG } from "./boiler-config.js";
import { buildBoilerShellHtml } from "./boiler-shell.js";
import {
  normalizedDaysForExport,
  normalizedMonthsForExport,
  normalizedRecurrenceForExport,
  taskStateToExportTask,
} from "./boiler-task-export.js";
import { timerPageCount, timerPageIndexForOption } from "./boiler-timer-paging.js";
import {
  holidayActiveStateList,
  holidayTaskPolicyForKind,
  holidayTimerPolicyForKind,
  holidayWorkProhibited,
  isHolidaySourceActiveState,
  isTruthyHolidayFlag,
  normalizeHolidayPolicy,
  resolveHolidayKind,
  shouldForceShutdown,
} from "./boiler-holiday-rules.js";
import {
  effectiveHeatupMinutes,
  formatTemperatureDisplay,
  parseNumericEntityState,
  stagedHeatGradient,
  temperatureProgressFromCelsius,
  timedHeatColorProgress,
  toCelsius,
} from "./boiler-heat-utils.js";
import { importTaskDisplayName, importTaskDisplaySubtitle } from "./boiler-import-display.js";
import {
  formatSeconds,
  isNoTimerOption,
  optionByMinutes,
  optionToHhMmSs,
  optionToMinutes,
  parseDurationString,
} from "./boiler-time-utils.js";
import { dayLabel, dayOrderForLanguage, formatScheduleDays } from "./boiler-schedule-days.js";
import { allConditionEntitiesFromStates, matchingConditionEntities } from "./boiler-entity-search.js";
import { buildTaskMetaText, formatHistoryLocalDateTime } from "./boiler-task-display.js";
import { historyExportPayload, normalizeHistoryRows } from "./boiler-history-utils.js";
import { callServiceRef, isServiceAvailable, isServiceRef, safeServiceData } from "./boiler-service-utils.js";
import {
  builtInServiceBaseData,
  controlServiceBaseData,
  isBoilerManagerService,
  isKnownEntryId,
  resolveControlService,
} from "./boiler-control-services.js";
import { isEntityOn, stateListFromConfig } from "./boiler-entity-state-utils.js";

const DEFAULT_DURATION_OPTIONS = [
  "15m",
  "30m",
  "45m",
  "60m",
  "75m",
  "90m",
  "105m",
  "120m",
  "135m",
  "150m",
  "165m",
  "180m",
  "195m",
  "210m",
  "225m",
  "240m",
  "No Timer",
];


class BoilerWaterCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = { ...DEFAULT_CONFIG };
    this._hass = null;
    this._elements = {};
    this._ticker = null;
    this._timerPageIndex = 0;
    this._timerPageSize = 6;
    this._timerGridRenderKey = "";
    this._quickTimersRenderKey = "";
    this._tasksListRenderKey = "";
    this._historyListRenderKey = "";
    this._menuMode = "timer";
    this._importMode = "merge";
    this._confirmResolver = null;
    this._importSelectionResolver = null;
    this._pendingImportTasks = null;
    this._schedulePanel = "recurrence";
    this._editingTaskId = null;
    this._offPendingUntil = 0;
    this._lastVacationForceOffAt = 0;
    this._lastHolidayForceOffAt = 0;
    this._lastHolidayTasksOffAt = 0;
    this._selectedDurationOptionLocal = "30m";
    this._lastLegacyTimerCancelAt = 0;
    this._lastLegacyTimerCancelEntity = "";
    this._lastResolvedScheduleSegment = null;
    this._lastResolvedManualTimedSegment = null;
    this._postScheduleRunHint = null;
    this._guideModalTab = "manual";
    this._guideHebcalPayload = null;
    this._guideHebcalFilter = "all";
    this._hebcalCacheInFlight = null;
    this._lastHebcalAutoRefreshAt = 0;
    this._handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        this._closeTimerModal();
        this._closeScheduleModal();
        this._closeConfirmModal(false);
        this._closeImportSelectionModal(false);
        this._closeGuideModal();
        this._closeSmarthomeBoostModal();
        this._closeSmarthomeSettingsModal();
      }
    };
  }

  connectedCallback() {
    if (!this._ticker) {
      this._ticker = window.setInterval(() => this._refreshLiveCountdown(), 1000);
    }
    if (this._resolveIntegrationEntryId()) {
      void this._fetchAndStoreHebcalCachePayload().then(() => this._refreshAfterHebcalCacheLoaded());
    }
  }

  disconnectedCallback() {
    if (this._ticker) {
      window.clearInterval(this._ticker);
      this._ticker = null;
    }
    this._resolveConfirmDialog(false);
    this._resolveImportSelectionDialog(null);
    window.removeEventListener("keydown", this._handleEscapeKey);
  }

  setConfig(config) {
    this._config = { ...DEFAULT_CONFIG, ...(config || {}) };
    this._renderShell();
    this._sync();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.shadowRoot.querySelector("ha-card")) {
      this._renderShell();
    }
    this._sync();
  }

  getCardSize() {
    return 2;
  }

  static async getConfigElement() {
    return document.createElement("boiler-water-card-editor");
  }

  static getStubConfig() {
    return {
      ...DEFAULT_CONFIG,
      title: I18N.he.default_title,
    };
  }

  _renderShell() {
    window.removeEventListener("keydown", this._handleEscapeKey);
    this._timerGridRenderKey = "";
    this._quickTimersRenderKey = "";
    this._tasksListRenderKey = "";
    this._historyListRenderKey = "";
    const cardTheme = normalizeCardTheme(this._config?.card_theme);
    this.setAttribute("data-card-theme", cardTheme);
    this.setAttribute("data-device-profile", this._deviceProfile());
    this.setAttribute("data-mobile-popup-fullscreen", this._isMobilePopupFullscreenEnabled() ? "true" : "false");
    this.shadowRoot.innerHTML = buildBoilerShellHtml({
      cardTheme,
      themeCss: buildThemeCss(),
    });

    this._elements = {
      title: this.shadowRoot.getElementById("title"),
      subtitle: this.shadowRoot.getElementById("subtitle"),
      childLockIndicator: this.shadowRoot.getElementById("child-lock-indicator"),
      boilerVisual: this.shadowRoot.getElementById("boiler-visual"),
      boilerMainImage: this.shadowRoot.getElementById("boiler-main-image"),
      boilerStage: this.shadowRoot.getElementById("boiler-stage"),
      upcomingTaskNotice: this.shadowRoot.getElementById("upcoming-task-notice"),
      activeTaskNotice: this.shadowRoot.getElementById("active-task-notice"),
      vacationNotice: this.shadowRoot.getElementById("vacation-notice"),
      boilerStageSub: this.shadowRoot.getElementById("boiler-stage-sub"),
      boilerProgressFill: this.shadowRoot.getElementById("boiler-progress-fill"),
      boilerProgressHint: this.shadowRoot.getElementById("boiler-progress-hint"),
      countdownLabel: this.shadowRoot.getElementById("countdown-label"),
      countdownValue: this.shadowRoot.getElementById("countdown-value"),
      sensorsRow: this.shadowRoot.getElementById("sensors-row"),
      quickTimers: this.shadowRoot.getElementById("quick-timers"),
      smarthomeTopActions: this.shadowRoot.getElementById("smarthome-top-actions"),
      smarthomeBoostBtn: this.shadowRoot.getElementById("smarthome-boost-btn"),
      smarthomeSettingsBtn: this.shadowRoot.getElementById("smarthome-settings-btn"),
      quickTimerBtns: [],
      quickOffBtn: null,
      tasksTitle: this.shadowRoot.getElementById("tasks-title"),
      importExportTitle: this.shadowRoot.getElementById("import-export-title"),
      tasksAddBtn: this.shadowRoot.getElementById("tasks-add-btn"),
      tasksVacationBtn: this.shadowRoot.getElementById("tasks-vacation-btn"),
      tasksImportBtn: this.shadowRoot.getElementById("tasks-import-btn"),
      tasksExportBtn: this.shadowRoot.getElementById("tasks-export-btn"),
      tasksModeMergeBtn: this.shadowRoot.getElementById("tasks-mode-merge-btn"),
      tasksModeReplaceBtn: this.shadowRoot.getElementById("tasks-mode-replace-btn"),
      tasksImportFile: this.shadowRoot.getElementById("tasks-import-file"),
      tasksList: this.shadowRoot.getElementById("tasks-list"),
      timerMenuBtn: this.shadowRoot.getElementById("timer-menu-btn"),
      error: this.shadowRoot.getElementById("error"),
      timerModal: this.shadowRoot.getElementById("timer-modal"),
      timerModalBackdrop: this.shadowRoot.getElementById("timer-modal-backdrop"),
      timerModalPanel: this.shadowRoot.getElementById("timer-modal-panel"),
      timerCloseBtn: this.shadowRoot.getElementById("timer-close-btn"),
      timerHistoryBtn: this.shadowRoot.getElementById("timer-history-btn"),
      timerGuideBtn: this.shadowRoot.getElementById("timer-guide-btn"),
      timerModalTitle: this.shadowRoot.getElementById("timer-modal-title"),
      timerPageControls: this.shadowRoot.getElementById("timer-page-controls"),
      timerPagePrevBtn: this.shadowRoot.getElementById("timer-page-prev-btn"),
      timerPageNextBtn: this.shadowRoot.getElementById("timer-page-next-btn"),
      timerPageIndicator: this.shadowRoot.getElementById("timer-page-indicator"),
      modalModeTimerBtn: this.shadowRoot.getElementById("modal-mode-timer-btn"),
      modalModeTasksBtn: this.shadowRoot.getElementById("modal-mode-tasks-btn"),
      modalModeImportExportBtn: this.shadowRoot.getElementById("modal-mode-import-export-btn"),
      modalTimerView: this.shadowRoot.getElementById("modal-timer-view"),
      modalTasksView: this.shadowRoot.getElementById("modal-tasks-view"),
      modalImportExportView: this.shadowRoot.getElementById("modal-import-export-view"),
      modalHistoryView: this.shadowRoot.getElementById("modal-history-view"),
      historyTitle: this.shadowRoot.getElementById("history-title"),
      historyClearBtn: this.shadowRoot.getElementById("history-clear-btn"),
      historyExportBtn: this.shadowRoot.getElementById("history-export-btn"),
      historyExportLabel: this.shadowRoot.getElementById("history-export-label"),
      historyList: this.shadowRoot.getElementById("history-list"),
      timerGrid: this.shadowRoot.getElementById("timer-grid"),
      scheduleModal: this.shadowRoot.getElementById("schedule-modal"),
      scheduleModalBackdrop: this.shadowRoot.getElementById("schedule-modal-backdrop"),
      scheduleModalPanel: this.shadowRoot.getElementById("schedule-modal-panel"),
      scheduleModalTitle: this.shadowRoot.getElementById("schedule-modal-title"),
      scheduleCloseBtn: this.shadowRoot.getElementById("schedule-close-btn"),
      scheduleForm: this.shadowRoot.getElementById("schedule-form"),
      scheduleFormScroll: this.shadowRoot.getElementById("schedule-form-scroll"),
      scheduleCategorySwitch: this.shadowRoot.getElementById("schedule-category-switch"),
      scheduleCategoryTimeBtn: this.shadowRoot.getElementById("schedule-category-time-btn"),
      scheduleCategoryRecurrenceBtn: this.shadowRoot.getElementById("schedule-category-recurrence-btn"),
      scheduleCategoryConditionsBtn: this.shadowRoot.getElementById("schedule-category-conditions-btn"),
      scheduleCategoryHolidaysBtn: this.shadowRoot.getElementById("schedule-category-holidays-btn"),
      scheduleNameLabel: this.shadowRoot.getElementById("schedule-name-label"),
      scheduleTypeLabel: this.shadowRoot.getElementById("schedule-type-label"),
      scheduleTypeField: this.shadowRoot.getElementById("schedule-type-field"),
      scheduleTypeToggle: this.shadowRoot.getElementById("schedule-type-toggle"),
      scheduleTypeWindowBtn: this.shadowRoot.getElementById("schedule-type-window-btn"),
      scheduleTypeHolidayBtn: this.shadowRoot.getElementById("schedule-type-holiday-btn"),
      scheduleTypeTimelineBtn: this.shadowRoot.getElementById("schedule-type-timeline-btn"),
      schedulePanelRecurrenceBtn: this.shadowRoot.getElementById("schedule-panel-recurrence-btn"),
      schedulePanelDaysBtn: this.shadowRoot.getElementById("schedule-panel-days-btn"),
      schedulePanelMonthsBtn: this.shadowRoot.getElementById("schedule-panel-months-btn"),
      schedulePanelRecurrence: this.shadowRoot.getElementById("schedule-panel-recurrence"),
      schedulePanelDays: this.shadowRoot.getElementById("schedule-panel-days"),
      schedulePanelMonths: this.shadowRoot.getElementById("schedule-panel-months"),
      scheduleStartLabel: this.shadowRoot.getElementById("schedule-start-label"),
      scheduleEndLabel: this.shadowRoot.getElementById("schedule-end-label"),
      scheduleDaysLabel: this.shadowRoot.getElementById("schedule-days-label"),
      scheduleMonthsLabel: this.shadowRoot.getElementById("schedule-months-label"),
      scheduleRecurrenceLabel: this.shadowRoot.getElementById("schedule-recurrence-label"),
      scheduleRecurrenceToggle: this.shadowRoot.getElementById("schedule-recurrence-toggle"),
      scheduleRecurrenceForeverBtn: this.shadowRoot.getElementById("schedule-recurrence-forever-btn"),
      scheduleRecurrenceOnceBtn: this.shadowRoot.getElementById("schedule-recurrence-once-btn"),
      scheduleRecurrenceRangeBtn: this.shadowRoot.getElementById("schedule-recurrence-range-btn"),
      scheduleDateStartLabel: this.shadowRoot.getElementById("schedule-date-start-label"),
      scheduleDateEndLabel: this.shadowRoot.getElementById("schedule-date-end-label"),
      scheduleConditionEntityLabel: this.shadowRoot.getElementById("schedule-condition-entity-label"),
      scheduleConditionLabel: this.shadowRoot.getElementById("schedule-condition-label"),
      scheduleConditionRow: this.shadowRoot.getElementById("schedule-condition-row"),
      scheduleRecurrenceGroup: this.shadowRoot.getElementById("schedule-recurrence-group"),
      scheduleConditionGroup: this.shadowRoot.getElementById("schedule-condition-group"),
      scheduleHolidayGroup: this.shadowRoot.getElementById("schedule-holiday-group"),
      scheduleHolidayNote: this.shadowRoot.getElementById("schedule-holiday-note"),
      scheduleHolidayRowPrimary: this.shadowRoot.getElementById("schedule-holiday-row-primary"),
      scheduleHolidayRowSecondary: this.shadowRoot.getElementById("schedule-holiday-row-secondary"),
      scheduleHolidayOffsetField: this.shadowRoot.getElementById("schedule-holiday-offset-field"),
      scheduleHolidayKindField: this.shadowRoot.getElementById("schedule-holiday-kind-field"),
      scheduleHolidayTriggerModeLabel: this.shadowRoot.getElementById("schedule-holiday-trigger-mode-label"),
      scheduleHolidayTriggerModeInput: this.shadowRoot.getElementById("schedule-holiday-trigger-mode-input"),
      scheduleHolidayTriggerModeOptSchedule: this.shadowRoot.getElementById("schedule-holiday-trigger-mode-opt-schedule"),
      scheduleHolidayTriggerModeOptHebcal: this.shadowRoot.getElementById("schedule-holiday-trigger-mode-opt-hebcal"),
      scheduleHolidayKindLabel: this.shadowRoot.getElementById("schedule-holiday-kind-label"),
      scheduleHolidayKindToggle: this.shadowRoot.getElementById("schedule-holiday-kind-toggle"),
      scheduleHolidayKindInput: this.shadowRoot.getElementById("schedule-holiday-kind-input"),
      scheduleHolidayKindOptShabbat: this.shadowRoot.getElementById("schedule-holiday-kind-opt-shabbat"),
      scheduleHolidayKindOptHoliday: this.shadowRoot.getElementById("schedule-holiday-kind-opt-holiday"),
      scheduleHolidayPhaseLabel: this.shadowRoot.getElementById("schedule-holiday-phase-label"),
      scheduleHolidayPhaseToggle: this.shadowRoot.getElementById("schedule-holiday-phase-toggle"),
      scheduleHolidayPhaseInput: this.shadowRoot.getElementById("schedule-holiday-phase-input"),
      scheduleHolidayPhaseOptStart: this.shadowRoot.getElementById("schedule-holiday-phase-opt-start"),
      scheduleHolidayPhaseOptEnd: this.shadowRoot.getElementById("schedule-holiday-phase-opt-end"),
      scheduleHolidaySubtypeField: this.shadowRoot.getElementById("schedule-holiday-subtype-field"),
      scheduleHolidaySubtypeLabel: this.shadowRoot.getElementById("schedule-holiday-subtype-label"),
      scheduleHolidaySubtypeToggle: this.shadowRoot.getElementById("schedule-holiday-subtype-toggle"),
      scheduleHolidaySubtypeInput: this.shadowRoot.getElementById("schedule-holiday-subtype-input"),
      scheduleHolidaySubtypeOptAll: this.shadowRoot.getElementById("schedule-holiday-subtype-opt-all"),
      scheduleHolidaySubtypeOptYomtov: this.shadowRoot.getElementById("schedule-holiday-subtype-opt-yomtov"),
      scheduleHolidaySubtypeOptRegular: this.shadowRoot.getElementById("schedule-holiday-subtype-opt-regular"),
      scheduleHolidayOffsetLabel: this.shadowRoot.getElementById("schedule-holiday-offset-label"),
      scheduleHolidayOffsetInput: this.shadowRoot.getElementById("schedule-holiday-offset-input"),
      scheduleHolidayOffsetSignBtn: this.shadowRoot.getElementById("schedule-holiday-offset-sign-btn"),
      scheduleHolidayOffsetMagInput: this.shadowRoot.getElementById("schedule-holiday-offset-mag-input"),
      scheduleHolidayOffsetEquiv: this.shadowRoot.getElementById("schedule-holiday-offset-equiv"),
      scheduleEndTimerSelect: this.shadowRoot.getElementById("schedule-end-timer-select"),
      scheduleConditionStateLabel: this.shadowRoot.getElementById("schedule-condition-state-label"),
      timelinePointsLabel: this.shadowRoot.getElementById("timeline-points-label"),
      scheduleNameInput: this.shadowRoot.getElementById("schedule-name-input"),
      scheduleNameClearBtn: this.shadowRoot.getElementById("schedule-name-clear-btn"),
      scheduleTypeInput: this.shadowRoot.getElementById("schedule-type-input"),
      scheduleSectionSwitch: this.shadowRoot.getElementById("schedule-section-switch"),
      scheduleWindowFields: this.shadowRoot.getElementById("schedule-window-fields"),
      scheduleTimelineFields: this.shadowRoot.getElementById("schedule-timeline-fields"),
      scheduleStartInput: this.shadowRoot.getElementById("schedule-start-input"),
      scheduleStartClearBtn: this.shadowRoot.getElementById("schedule-start-clear-btn"),
      scheduleEndInput: this.shadowRoot.getElementById("schedule-end-input"),
      scheduleEndClearBtn: this.shadowRoot.getElementById("schedule-end-clear-btn"),
      scheduleRecurrenceInput: this.shadowRoot.getElementById("schedule-recurrence-input"),
      scheduleDateRow: this.shadowRoot.getElementById("schedule-date-row"),
      scheduleStartDateInput: this.shadowRoot.getElementById("schedule-start-date-input"),
      scheduleStartDateClearBtn: this.shadowRoot.getElementById("schedule-start-date-clear-btn"),
      scheduleEndDateInput: this.shadowRoot.getElementById("schedule-end-date-input"),
      scheduleEndDateClearBtn: this.shadowRoot.getElementById("schedule-end-date-clear-btn"),
      scheduleConditionEntityInput: this.shadowRoot.getElementById("schedule-condition-entity-input"),
      scheduleConditionEntityClearBtn: this.shadowRoot.getElementById("schedule-condition-entity-clear-btn"),
      scheduleConditionOperatorInput: this.shadowRoot.getElementById("schedule-condition-operator-input"),
      scheduleConditionOperatorClearBtn: this.shadowRoot.getElementById("schedule-condition-operator-clear-btn"),
      scheduleConditionStateInput: this.shadowRoot.getElementById("schedule-condition-state-input"),
      scheduleConditionStateClearBtn: this.shadowRoot.getElementById("schedule-condition-state-clear-btn"),
      scheduleConditionStateList: this.shadowRoot.getElementById("schedule-condition-state-list"),
      scheduleConditionEntityList: this.shadowRoot.getElementById("schedule-condition-entity-list"),
      scheduleDays: this.shadowRoot.getElementById("schedule-days"),
      scheduleMonths: this.shadowRoot.getElementById("schedule-months"),
      timelinePoints: this.shadowRoot.getElementById("timeline-points"),
      timelinePointAddBtn: this.shadowRoot.getElementById("timeline-point-add-btn"),
      scheduleCancelBtn: this.shadowRoot.getElementById("schedule-cancel-btn"),
      scheduleSaveBtn: this.shadowRoot.getElementById("schedule-save-btn"),
      confirmModal: this.shadowRoot.getElementById("confirm-modal"),
      confirmModalBackdrop: this.shadowRoot.getElementById("confirm-modal-backdrop"),
      confirmModalPanel: this.shadowRoot.getElementById("confirm-modal-panel"),
      confirmModalTitle: this.shadowRoot.getElementById("confirm-modal-title"),
      confirmModalMessage: this.shadowRoot.getElementById("confirm-modal-message"),
      confirmCancelBtn: this.shadowRoot.getElementById("confirm-cancel-btn"),
      confirmOkBtn: this.shadowRoot.getElementById("confirm-ok-btn"),
      importSelectModal: this.shadowRoot.getElementById("import-select-modal"),
      importSelectModalBackdrop: this.shadowRoot.getElementById("import-select-modal-backdrop"),
      importSelectModalPanel: this.shadowRoot.getElementById("import-select-modal-panel"),
      importSelectTitle: this.shadowRoot.getElementById("import-select-title"),
      importSelectMessage: this.shadowRoot.getElementById("import-select-message"),
      importSelectAllBtn: this.shadowRoot.getElementById("import-select-all-btn"),
      importClearAllBtn: this.shadowRoot.getElementById("import-clear-all-btn"),
      importSelectList: this.shadowRoot.getElementById("import-select-list"),
      importSelectCancelBtn: this.shadowRoot.getElementById("import-select-cancel-btn"),
      importSelectOkBtn: this.shadowRoot.getElementById("import-select-ok-btn"),
      guideModal: this.shadowRoot.getElementById("guide-modal"),
      guideModalBackdrop: this.shadowRoot.getElementById("guide-modal-backdrop"),
      guideModalPanel: this.shadowRoot.getElementById("guide-modal-panel"),
      guideModalTitle: this.shadowRoot.getElementById("guide-modal-title"),
      guideModalCloseBtn: this.shadowRoot.getElementById("guide-modal-close-btn"),
      guideModalOkBtn: this.shadowRoot.getElementById("guide-modal-ok-btn"),
      guideTabManualBtn: this.shadowRoot.getElementById("guide-tab-manual-btn"),
      guideTabHebcalBtn: this.shadowRoot.getElementById("guide-tab-hebcal-btn"),
      guidePanelManual: this.shadowRoot.getElementById("guide-panel-manual"),
      guideProfileGrid: this.shadowRoot.getElementById("guide-profile-grid"),
      guidePanelManualText: this.shadowRoot.getElementById("guide-panel-manual-text"),
      guidePanelHebcal: this.shadowRoot.getElementById("guide-panel-hebcal"),
      guideHebcalCity: this.shadowRoot.getElementById("guide-hebcal-city"),
      guideHebcalFilterAll: this.shadowRoot.getElementById("guide-hebcal-filter-all"),
      guideHebcalFilterHoliday: this.shadowRoot.getElementById("guide-hebcal-filter-holiday"),
      guideHebcalFilterShabbat: this.shadowRoot.getElementById("guide-hebcal-filter-shabbat"),
      guideHebcalList: this.shadowRoot.getElementById("guide-hebcal-list"),
      guideHebcalStatus: this.shadowRoot.getElementById("guide-hebcal-status"),
      smarthomeBoostModal: this.shadowRoot.getElementById("smarthome-boost-modal"),
      smarthomeBoostModalBackdrop: this.shadowRoot.getElementById("smarthome-boost-modal-backdrop"),
      smarthomeBoostModalPanel: this.shadowRoot.getElementById("smarthome-boost-modal-panel"),
      smarthomeBoostModalTitle: this.shadowRoot.getElementById("smarthome-boost-modal-title"),
      smarthomeBoostModalLabel: this.shadowRoot.getElementById("smarthome-boost-modal-label"),
      smarthomeBoostModalInput: this.shadowRoot.getElementById("smarthome-boost-modal-input"),
      smarthomeBoostDownBtn: this.shadowRoot.getElementById("smarthome-boost-down-btn"),
      smarthomeBoostUpBtn: this.shadowRoot.getElementById("smarthome-boost-up-btn"),
      smarthomeBoostModalCloseBtn: this.shadowRoot.getElementById("smarthome-boost-modal-close-btn"),
      smarthomeBoostModalCancelBtn: this.shadowRoot.getElementById("smarthome-boost-modal-cancel-btn"),
      smarthomeBoostModalSaveBtn: this.shadowRoot.getElementById("smarthome-boost-modal-save-btn"),
      smarthomeSettingsModal: this.shadowRoot.getElementById("smarthome-settings-modal"),
      smarthomeSettingsModalBackdrop: this.shadowRoot.getElementById("smarthome-settings-modal-backdrop"),
      smarthomeSettingsModalPanel: this.shadowRoot.getElementById("smarthome-settings-modal-panel"),
      smarthomeSettingsModalTitle: this.shadowRoot.getElementById("smarthome-settings-modal-title"),
      smarthomeSettingsModalCloseBtn: this.shadowRoot.getElementById("smarthome-settings-modal-close-btn"),
      smarthomeSettingsModalCancelBtn: this.shadowRoot.getElementById("smarthome-settings-modal-cancel-btn"),
      smarthomeSettingsModalSaveBtn: this.shadowRoot.getElementById("smarthome-settings-modal-save-btn"),
      smarthomeBacklightLabel: this.shadowRoot.getElementById("smarthome-backlight-label"),
      smarthomeBacklightToggleBtn: this.shadowRoot.getElementById("smarthome-backlight-toggle-btn"),
      smarthomeBacklightSelect: this.shadowRoot.getElementById("smarthome-backlight-select"),
      smarthomeChildLockLabel: this.shadowRoot.getElementById("smarthome-child-lock-label"),
      smarthomeChildLockToggleBtn: this.shadowRoot.getElementById("smarthome-child-lock-toggle-btn"),
      smarthomeChildLockSelect: this.shadowRoot.getElementById("smarthome-child-lock-select"),
      smarthomePowerOnLabel: this.shadowRoot.getElementById("smarthome-power-on-label"),
      smarthomePowerOnOptions: this.shadowRoot.getElementById("smarthome-power-on-options"),
      smarthomePowerOnSelect: this.shadowRoot.getElementById("smarthome-power-on-select"),
    };

    this._elements.timerMenuBtn.addEventListener("click", () => this._openTimerModal());
    this._elements.timerCloseBtn.addEventListener("click", () => this._closeTimerModal());
    this._elements.timerHistoryBtn?.addEventListener("click", () => this._setMenuMode("history"));
    this._elements.timerGuideBtn?.addEventListener("click", () => this._openGuideModal());
    this._elements.timerModalBackdrop.addEventListener("click", () => this._closeTimerModal());
    this._elements.smarthomeBoostBtn?.addEventListener("click", () => this._openSmarthomeBoostModal());
    this._elements.smarthomeSettingsBtn?.addEventListener("click", () => this._openSmarthomeSettingsModal());
    this._elements.smarthomeBoostModalBackdrop?.addEventListener("click", () => this._closeSmarthomeBoostModal());
    this._elements.smarthomeBoostModalCloseBtn?.addEventListener("click", () => this._closeSmarthomeBoostModal());
    this._elements.smarthomeBoostModalCancelBtn?.addEventListener("click", () => this._closeSmarthomeBoostModal());
    this._elements.smarthomeBoostModalSaveBtn?.addEventListener("click", () => this._saveSmarthomeBoostModal());
    this._elements.smarthomeBoostDownBtn?.addEventListener("click", () => this._stepSmarthomeBoostModal(-1));
    this._elements.smarthomeBoostUpBtn?.addEventListener("click", () => this._stepSmarthomeBoostModal(1));
    this._elements.smarthomeSettingsModalBackdrop?.addEventListener("click", () => this._closeSmarthomeSettingsModal());
    this._elements.smarthomeSettingsModalCloseBtn?.addEventListener("click", () => this._closeSmarthomeSettingsModal());
    this._elements.smarthomeSettingsModalCancelBtn?.addEventListener("click", () => this._closeSmarthomeSettingsModal());
    this._elements.smarthomeSettingsModalSaveBtn?.addEventListener("click", () => this._saveSmarthomeSettingsModal());
    this._elements.smarthomeBacklightToggleBtn?.addEventListener("click", () => this._toggleSmarthomeBinaryInput("backlight"));
    this._elements.smarthomeChildLockToggleBtn?.addEventListener("click", () => this._toggleSmarthomeBinaryInput("child_lock"));
    this._elements.timerPagePrevBtn.addEventListener("click", () => this._changeTimerPage(-1));
    this._elements.timerPageNextBtn.addEventListener("click", () => this._changeTimerPage(1));
    this._elements.modalModeTimerBtn?.addEventListener("click", () => this._setMenuMode("timer"));
    this._elements.modalModeTasksBtn?.addEventListener("click", () => this._setMenuMode("tasks"));
    this._elements.modalModeImportExportBtn?.addEventListener("click", () => this._setMenuMode("import_export"));
    this._elements.tasksAddBtn.addEventListener("click", () => this._openScheduleModal());
    this._elements.tasksVacationBtn?.addEventListener("click", () => this._toggleVacationMode());
    this._elements.tasksImportBtn?.addEventListener("click", () => this._openImportTasksFilePicker());
    this._elements.tasksExportBtn?.addEventListener("click", () => this._exportTasksFromCard());
    this._elements.historyExportBtn?.addEventListener("click", () => this._exportHistoryLog());
    this._elements.historyClearBtn?.addEventListener("click", () => this._confirmClearHistoryLog());
    this._elements.guideHebcalFilterAll?.addEventListener("click", () => this._setGuideHebcalFilter("all"));
    this._elements.guideHebcalFilterHoliday?.addEventListener("click", () => this._setGuideHebcalFilter("holiday"));
    this._elements.guideHebcalFilterShabbat?.addEventListener("click", () => this._setGuideHebcalFilter("shabbat"));
    this._elements.tasksModeMergeBtn?.addEventListener("click", () => this._setImportMode("merge"));
    this._elements.tasksModeReplaceBtn?.addEventListener("click", () => this._setImportMode("replace"));
    this._elements.tasksImportFile?.addEventListener("change", (event) => this._handleImportTasksFile(event));
    this._elements.scheduleCloseBtn.addEventListener("click", () => this._closeScheduleModal());
    this._elements.scheduleCancelBtn.addEventListener("click", () => this._closeScheduleModal());
    this._elements.scheduleModalBackdrop.addEventListener("click", () => this._closeScheduleModal());
    this._elements.confirmModalBackdrop?.addEventListener("click", () => this._closeConfirmModal(false));
    this._elements.confirmCancelBtn?.addEventListener("click", () => this._closeConfirmModal(false));
    this._elements.confirmOkBtn?.addEventListener("click", () => this._closeConfirmModal(true));
    this._elements.importSelectModalBackdrop?.addEventListener("click", () => this._closeImportSelectionModal(false));
    this._elements.importSelectCancelBtn?.addEventListener("click", () => this._closeImportSelectionModal(false));
    this._elements.importSelectOkBtn?.addEventListener("click", () => this._closeImportSelectionModal(true));
    this._elements.importSelectAllBtn?.addEventListener("click", () => this._setImportSelectionChecked(true));
    this._elements.importClearAllBtn?.addEventListener("click", () => this._setImportSelectionChecked(false));
    this._elements.guideModalBackdrop?.addEventListener("click", () => this._closeGuideModal());
    this._elements.guideModalCloseBtn?.addEventListener("click", () => this._closeGuideModal());
    this._elements.guideModalOkBtn?.addEventListener("click", () => this._closeGuideModal());
    this._elements.guideTabManualBtn?.addEventListener("click", () => this._setGuideModalTab("manual"));
    this._elements.guideTabHebcalBtn?.addEventListener("click", () => this._setGuideModalTab("hebcal"));
    this._elements.scheduleTypeWindowBtn?.addEventListener("click", () => this._setScheduleType("window"));
    this._elements.scheduleTypeHolidayBtn?.addEventListener("click", () => this._setScheduleType("holiday"));
    this._elements.scheduleTypeTimelineBtn?.addEventListener("click", () => this._setScheduleType("timeline"));
    this._elements.scheduleCategoryTimeBtn?.addEventListener("click", () => this._setScheduleEditorCategory("time"));
    this._elements.scheduleCategoryRecurrenceBtn?.addEventListener("click", () => this._setScheduleEditorCategory("recurrence"));
    this._elements.scheduleCategoryConditionsBtn?.addEventListener("click", () => this._setScheduleEditorCategory("conditions"));
    this._elements.scheduleCategoryHolidaysBtn?.addEventListener("click", () => this._setScheduleEditorCategory("holidays_shabbat"));
    this._elements.schedulePanelRecurrenceBtn?.addEventListener("click", () => this._setSchedulePanel("recurrence"));
    this._elements.schedulePanelDaysBtn?.addEventListener("click", () => this._setSchedulePanel("days"));
    this._elements.schedulePanelMonthsBtn?.addEventListener("click", () => this._setSchedulePanel("months"));
    this._elements.scheduleRecurrenceForeverBtn?.addEventListener("click", () => this._setScheduleRecurrence("forever"));
    this._elements.scheduleRecurrenceOnceBtn?.addEventListener("click", () => this._setScheduleRecurrence("once"));
    this._elements.scheduleRecurrenceRangeBtn?.addEventListener("click", () => this._setScheduleRecurrence("range"));
    this._elements.scheduleConditionEntityInput?.addEventListener("input", () => this._onConditionEntityInputChanged());
    this._elements.scheduleConditionEntityInput?.addEventListener("change", () => this._onConditionEntityChanged());
    this._elements.scheduleConditionOperatorInput?.addEventListener("change", () => this._onConditionOperatorChanged());
    this._elements.scheduleHolidayTriggerModeInput?.addEventListener("change", () => this._syncScheduleHolidayFields());
    this._elements.scheduleHolidayKindOptShabbat?.addEventListener("click", () => this._setScheduleHolidayKind("shabbat"));
    this._elements.scheduleHolidayKindOptHoliday?.addEventListener("click", () => this._setScheduleHolidayKind("holiday"));
    this._elements.scheduleHolidayPhaseOptStart?.addEventListener("click", () => this._setScheduleHolidayPhase("start"));
    this._elements.scheduleHolidayPhaseOptEnd?.addEventListener("click", () => this._setScheduleHolidayPhase("end"));
    this._elements.scheduleHolidaySubtypeOptAll?.addEventListener("click", () => this._setScheduleHolidaySubtype("all"));
    this._elements.scheduleHolidaySubtypeOptYomtov?.addEventListener("click", () => this._setScheduleHolidaySubtype("yomtov"));
    this._elements.scheduleHolidaySubtypeOptRegular?.addEventListener("click", () => this._setScheduleHolidaySubtype("regular"));
    this._elements.scheduleEndTimerSelect?.addEventListener("change", () => this._syncScheduleHolidayFields());
    const onHebcalOffsetMagChanged = () => {
      this._syncHebcalOffsetHiddenFromParts();
      this._syncScheduleHolidayFields();
    };
    this._elements.scheduleHolidayOffsetSignBtn?.addEventListener("click", () => {
      const nowPos = this._elements.scheduleHolidayOffsetSignBtn?.getAttribute("data-offset-positive") !== "0";
      this._setHebcalOffsetSignBtnFromPositive(!nowPos);
      onHebcalOffsetMagChanged();
    });
    this._elements.scheduleHolidayOffsetMagInput?.addEventListener("input", onHebcalOffsetMagChanged);
    this._elements.scheduleHolidayOffsetMagInput?.addEventListener("change", onHebcalOffsetMagChanged);
    this._wireScheduleClearButtons();
    this._elements.timelinePointAddBtn?.addEventListener("click", () => this._addTimelinePointRow());
    this._elements.scheduleForm.addEventListener("submit", (event) => {
      event.preventDefault();
      this._submitScheduleTask();
    });
    this._elements.quickTimers?.addEventListener("click", (event) => {
      const target = event?.target;
      if (!(target instanceof Element)) {
        return;
      }
      const button = target.closest(".quick-timer-btn");
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }
      this._handleQuickTimerClick(button);
    });
    this._renderScheduleDayButtons();
    this._renderScheduleMonthButtons();
    this._resetTimelinePoints();
    this._setSchedulePanel(this._schedulePanel);
    this._syncScheduleEditorCategoryUi();
    this._syncScheduleSectionToggles();
    this._setImportMode(this._importMode);
    this._setMenuMode(this._menuMode);
  }

  _sync() {
    if (!this._hass || !this._elements.title) {
      return;
    }

    const cfg = this._config;
    this._applyUiScaleSettings();
    const boiler = this._hass.states[cfg.boiler_entity];
    const duration = this._hass.states[cfg.duration_entity];
    const timer = this._hass.states[cfg.timer_entity];
    const managerMode = this._boilerManagerModeEntity();
    this._maybeCancelLegacyTimerForSchedule(managerMode);
    this._maybeEnforceVacationShutdown(managerMode, boiler, timer);
    this._maybeEnforceHolidayRules(managerMode, boiler, timer);

    const hasExplicitTitle = typeof cfg.title === "string";
    const title = hasExplicitTitle
      ? cfg.title.trim()
      : this._t("default_title");
    this._elements.title.textContent = title;
    this._elements.title.hidden = hasExplicitTitle && title.length === 0;
    if (this._elements.timerModalPanel) {
      this._elements.timerModalPanel.setAttribute("dir", this._lang() === "he" ? "rtl" : "ltr");
    }
    this._elements.timerModalTitle.textContent = this._t("timer_select");
    if (this._elements.quickOffBtn) {
      this._elements.quickOffBtn.textContent = this._t("turn_off");
    }
    if (this._elements.timerPagePrevBtn) {
      this._elements.timerPagePrevBtn.setAttribute("aria-label", this._t("timer_prev_page"));
      this._elements.timerPagePrevBtn.setAttribute("title", this._t("timer_prev_page"));
    }
    if (this._elements.timerPageNextBtn) {
      this._elements.timerPageNextBtn.setAttribute("aria-label", this._t("timer_next_page"));
      this._elements.timerPageNextBtn.setAttribute("title", this._t("timer_next_page"));
    }
    if (this._elements.timerMenuBtn) {
      this._elements.timerMenuBtn.setAttribute("aria-label", this._t("timer_menu"));
      this._elements.timerMenuBtn.setAttribute("title", this._t("timer_menu"));
    }
    if (this._elements.timerGuideBtn) {
      this._elements.timerGuideBtn.setAttribute("aria-label", this._t("timer_guide"));
      this._elements.timerGuideBtn.setAttribute("title", this._t("timer_guide"));
    }
    if (this._elements.timerHistoryBtn) {
      this._elements.timerHistoryBtn.setAttribute("aria-label", this._t("menu_history"));
      this._elements.timerHistoryBtn.setAttribute("title", this._t("menu_history"));
    }
    if (this._elements.tasksTitle) {
      this._elements.tasksTitle.textContent = this._t("tasks_title");
    }
    if (this._elements.importExportTitle) {
      this._elements.importExportTitle.textContent = this._t("menu_import_export");
    }
    if (this._elements.historyTitle) {
      this._elements.historyTitle.textContent = this._t("menu_history");
    }
    if (this._elements.historyClearBtn) {
      const clearLabel = this._t("history_clear_log");
      this._elements.historyClearBtn.setAttribute("aria-label", clearLabel);
      this._elements.historyClearBtn.setAttribute("title", clearLabel);
    }
    const hasTasksView = this._hasTasksView();
    const hasImportExportView = this._hasImportExportView();
    if (this._elements.tasksAddBtn) {
      this._elements.tasksAddBtn.textContent = this._t("tasks_add");
      this._elements.tasksAddBtn.disabled = !this._hasAnyTaskCreateService();
    }
    if (this._elements.tasksVacationBtn) {
      const vacationEnabled = this._isVacationModeEnabled(managerMode);
      this._elements.tasksVacationBtn.textContent = vacationEnabled
        ? this._t("vacation_mode_disable")
        : this._t("vacation_mode_enable");
      this._elements.tasksVacationBtn.classList.toggle("active", vacationEnabled);
      this._elements.tasksVacationBtn.setAttribute("aria-pressed", vacationEnabled ? "true" : "false");
      this._elements.tasksVacationBtn.disabled = !this._hasVacationModeService();
    }
    if (this._elements.tasksImportBtn) {
      this._elements.tasksImportBtn.textContent = this._t("tasks_import");
      this._elements.tasksImportBtn.disabled = !this._hasTaskImportService();
    }
    if (this._elements.tasksExportBtn) {
      this._elements.tasksExportBtn.textContent = this._t("tasks_export");
      this._elements.tasksExportBtn.disabled = this._taskSwitchEntities().length === 0;
    }
    if (this._elements.tasksModeMergeBtn) {
      this._elements.tasksModeMergeBtn.textContent = this._t("import_mode_merge");
      this._elements.tasksModeMergeBtn.disabled = !this._hasTaskImportService();
    }
    if (this._elements.tasksModeReplaceBtn) {
      this._elements.tasksModeReplaceBtn.textContent = this._t("import_mode_replace");
      this._elements.tasksModeReplaceBtn.disabled = !this._hasTaskImportService();
    }
    if (this._elements.confirmModalPanel) {
      this._elements.confirmModalPanel.setAttribute("dir", this._lang() === "he" ? "rtl" : "ltr");
    }
    if (this._elements.confirmModalTitle) {
      this._elements.confirmModalTitle.textContent = this._t("dialog_title");
    }
    if (this._elements.confirmCancelBtn) {
      this._elements.confirmCancelBtn.textContent = this._t("task_cancel");
    }
    if (this._elements.confirmOkBtn) {
      this._elements.confirmOkBtn.textContent = this._t("dialog_ok");
    }
    if (this._elements.importSelectModalPanel) {
      this._elements.importSelectModalPanel.setAttribute("dir", this._lang() === "he" ? "rtl" : "ltr");
    }
    if (this._elements.importSelectTitle) {
      this._elements.importSelectTitle.textContent = this._t("import_select_tasks_title");
    }
    if (this._elements.importSelectMessage) {
      this._elements.importSelectMessage.textContent = this._t("import_select_tasks_message");
    }
    if (this._elements.importSelectAllBtn) {
      this._elements.importSelectAllBtn.textContent = this._t("import_select_all");
    }
    if (this._elements.importClearAllBtn) {
      this._elements.importClearAllBtn.textContent = this._t("import_clear_all");
    }
    if (this._elements.importSelectCancelBtn) {
      this._elements.importSelectCancelBtn.textContent = this._t("task_cancel");
    }
    if (this._elements.importSelectOkBtn) {
      this._elements.importSelectOkBtn.textContent = this._t("tasks_import");
    }
    if (this._elements.guideModalPanel) {
      this._elements.guideModalPanel.setAttribute("dir", this._lang() === "he" ? "rtl" : "ltr");
    }
    if (this._elements.guideTabManualBtn) {
      this._elements.guideTabManualBtn.textContent = this._t("guide_tab_manual");
    }
    if (this._elements.guideTabHebcalBtn) {
      this._elements.guideTabHebcalBtn.textContent = this._t("guide_tab_calendar");
    }
    if (this._elements.guideHebcalFilterAll) {
      this._elements.guideHebcalFilterAll.textContent = this._t("guide_hebcal_filter_all");
    }
    if (this._elements.guideHebcalFilterHoliday) {
      this._elements.guideHebcalFilterHoliday.textContent = this._t("guide_hebcal_filter_holidays");
    }
    if (this._elements.guideHebcalFilterShabbat) {
      this._elements.guideHebcalFilterShabbat.textContent = this._t("guide_hebcal_filter_shabbat");
    }
    if (this._elements.guideModalOkBtn) {
      this._elements.guideModalOkBtn.textContent = this._t("dialog_ok");
    }
    if (this._elements.guideModal && !this._elements.guideModal.hidden) {
      if (this._elements.guideModalTitle) {
        this._elements.guideModalTitle.textContent = this._t("guide_title");
      }
      if (this._guideModalTab === "manual" && this._elements.guidePanelManualText) {
        this._renderGuideProfileCards();
        this._elements.guidePanelManualText.textContent = this._t("guide_content");
      }
      if (this._guideModalTab === "hebcal" && this._guideHebcalPayload) {
        this._renderGuideHebcalList(this._guideHebcalPayload);
        this._syncGuideHebcalFilterButtons();
      }
    }
    this._setImportMode(this._importMode);
    if (this._elements.modalModeTimerBtn) {
      this._elements.modalModeTimerBtn.textContent = this._t("menu_timers");
    }
    if (this._elements.modalModeTasksBtn) {
      this._elements.modalModeTasksBtn.textContent = this._t("menu_tasks");
      this._elements.modalModeTasksBtn.hidden = !hasTasksView;
    }
    if (this._elements.modalModeImportExportBtn) {
      this._elements.modalModeImportExportBtn.textContent = this._t("menu_import_export");
      this._elements.modalModeImportExportBtn.hidden = !hasImportExportView;
    }
    if (this._elements.historyExportLabel) {
      this._elements.historyExportLabel.textContent = this._t("history_export_log");
    }
    if (this._elements.historyExportBtn) {
      const exportLabel = this._t("history_export_log");
      this._elements.historyExportBtn.setAttribute("aria-label", exportLabel);
      this._elements.historyExportBtn.setAttribute("title", exportLabel);
    }
    const scheduleModalOpen = !!(this._elements.scheduleModal && !this._elements.scheduleModal.hidden);
    if (!scheduleModalOpen) {
      if (this._elements.scheduleModalPanel) {
        this._elements.scheduleModalPanel.setAttribute("dir", this._lang() === "he" ? "rtl" : "ltr");
      }
      if (this._elements.scheduleModalTitle) {
        this._elements.scheduleModalTitle.textContent = this._t("tasks_add");
      }
      if (this._elements.scheduleNameLabel) {
        this._elements.scheduleNameLabel.textContent = this._t("task_name");
      }
      if (this._elements.scheduleTypeLabel) {
        this._elements.scheduleTypeLabel.textContent = this._t("task_type");
      }
      if (this._elements.scheduleTypeWindowBtn) {
        this._elements.scheduleTypeWindowBtn.textContent = this._t("task_type_window");
      }
      if (this._elements.scheduleTypeHolidayBtn) {
        this._elements.scheduleTypeHolidayBtn.textContent = this._t("task_type_holiday_shabbat");
      }
      if (this._elements.scheduleTypeTimelineBtn) {
        this._elements.scheduleTypeTimelineBtn.textContent = this._t("task_type_timeline");
      }
      if (this._elements.schedulePanelRecurrenceBtn) {
        this._elements.schedulePanelRecurrenceBtn.textContent = this._t("recurrence_label");
      }
      if (this._elements.schedulePanelDaysBtn) {
        this._elements.schedulePanelDaysBtn.textContent = this._t("task_days");
      }
      if (this._elements.schedulePanelMonthsBtn) {
        this._elements.schedulePanelMonthsBtn.textContent = this._t("months_label");
      }
      if (this._elements.scheduleStartLabel) {
        this._elements.scheduleStartLabel.textContent = this._t("task_start");
      }
      if (this._elements.scheduleEndLabel) {
        this._elements.scheduleEndLabel.textContent = this._t("task_end");
      }
      if (this._elements.scheduleDaysLabel) {
        this._elements.scheduleDaysLabel.textContent = this._t("task_days");
      }
      if (this._elements.scheduleMonthsLabel) {
        this._elements.scheduleMonthsLabel.textContent = this._t("months_label");
      }
      if (this._elements.scheduleRecurrenceLabel) {
        this._elements.scheduleRecurrenceLabel.textContent = this._t("recurrence_label");
      }
      if (this._elements.scheduleRecurrenceForeverBtn) {
        this._elements.scheduleRecurrenceForeverBtn.textContent = this._t("recurrence_forever");
      }
      if (this._elements.scheduleRecurrenceOnceBtn) {
        this._elements.scheduleRecurrenceOnceBtn.textContent = this._t("recurrence_once");
      }
      if (this._elements.scheduleRecurrenceRangeBtn) {
        this._elements.scheduleRecurrenceRangeBtn.textContent = this._t("recurrence_range");
      }
      if (this._elements.scheduleDateStartLabel) {
        this._elements.scheduleDateStartLabel.textContent = this._t("date_start");
      }
      if (this._elements.scheduleDateEndLabel) {
        this._elements.scheduleDateEndLabel.textContent = this._t("date_end");
      }
      if (this._elements.scheduleConditionEntityLabel) {
        this._elements.scheduleConditionEntityLabel.textContent = this._t("condition_entity_label");
      }
      if (this._elements.scheduleConditionLabel) {
        this._elements.scheduleConditionLabel.textContent = this._t("condition_state_label");
      }
      if (this._elements.scheduleCategoryTimeBtn) {
        this._elements.scheduleCategoryTimeBtn.textContent = this._t("schedule_category_time");
      }
      if (this._elements.scheduleCategoryRecurrenceBtn) {
        this._elements.scheduleCategoryRecurrenceBtn.textContent = this._t("schedule_category_recurrence");
      }
      if (this._elements.scheduleCategoryConditionsBtn) {
        this._elements.scheduleCategoryConditionsBtn.textContent = this._t("schedule_category_conditions");
      }
      if (this._elements.scheduleCategoryHolidaysBtn) {
        this._elements.scheduleCategoryHolidaysBtn.textContent = this._t("schedule_category_holidays_shabbat");
      }
      if (this._elements.scheduleHolidayNote) {
        this._elements.scheduleHolidayNote.textContent = this._t("schedule_holiday_note");
      }
      if (this._elements.scheduleHolidayTriggerModeLabel) {
        this._elements.scheduleHolidayTriggerModeLabel.textContent = this._t("schedule_holiday_trigger_mode");
      }
      if (this._elements.scheduleHolidayTriggerModeOptSchedule) {
        this._elements.scheduleHolidayTriggerModeOptSchedule.textContent = this._t("schedule_holiday_trigger_mode_schedule");
      }
      if (this._elements.scheduleHolidayTriggerModeOptHebcal) {
        this._elements.scheduleHolidayTriggerModeOptHebcal.textContent = this._t("schedule_holiday_trigger_mode_hebcal");
      }
      if (this._elements.scheduleHolidayKindLabel) {
        this._elements.scheduleHolidayKindLabel.textContent = this._t("schedule_holiday_kind");
      }
      if (this._elements.scheduleHolidayKindOptShabbat) {
        this._elements.scheduleHolidayKindOptShabbat.textContent = this._t("schedule_holiday_kind_shabbat");
      }
      if (this._elements.scheduleHolidayKindOptHoliday) {
        this._elements.scheduleHolidayKindOptHoliday.textContent = this._t("schedule_holiday_kind_holiday");
      }
      if (this._elements.scheduleHolidayPhaseLabel) {
        this._elements.scheduleHolidayPhaseLabel.textContent = this._t("schedule_holiday_phase");
      }
      if (this._elements.scheduleHolidayPhaseOptStart) {
        this._elements.scheduleHolidayPhaseOptStart.textContent = this._t("schedule_holiday_phase_start");
      }
      if (this._elements.scheduleHolidayPhaseOptEnd) {
        this._elements.scheduleHolidayPhaseOptEnd.textContent = this._t("schedule_holiday_phase_end");
      }
      if (this._elements.scheduleHolidaySubtypeLabel) {
        this._elements.scheduleHolidaySubtypeLabel.textContent = this._t("schedule_holiday_subtype");
      }
      if (this._elements.scheduleHolidaySubtypeOptAll) {
        this._elements.scheduleHolidaySubtypeOptAll.textContent = this._t("schedule_holiday_subtype_all");
      }
      if (this._elements.scheduleHolidaySubtypeOptYomtov) {
        this._elements.scheduleHolidaySubtypeOptYomtov.textContent = this._t("schedule_holiday_subtype_yomtov");
      }
      if (this._elements.scheduleHolidaySubtypeOptRegular) {
        this._elements.scheduleHolidaySubtypeOptRegular.textContent = this._t("schedule_holiday_subtype_regular");
      }
      if (this._elements.scheduleHolidayOffsetLabel) {
        this._elements.scheduleHolidayOffsetLabel.textContent = this._t("schedule_holiday_offset");
      }
      this._updateHebcalOffsetEquivLine();
      if (this._elements.scheduleConditionStateLabel) {
        this._elements.scheduleConditionStateLabel.textContent = this._t("condition_state_label");
      }
      if (this._elements.scheduleConditionOperatorInput) {
        this._elements.scheduleConditionOperatorInput.setAttribute("aria-label", this._t("condition_operator_label"));
        this._elements.scheduleConditionOperatorInput.setAttribute("title", this._t("condition_operator_label"));
      }
      if (this._elements.timelinePointsLabel) {
        this._elements.timelinePointsLabel.textContent = this._t("timeline_points");
      }
      if (this._elements.timelinePointAddBtn) {
        this._elements.timelinePointAddBtn.textContent = this._t("timeline_add_point");
      }
      if (this._elements.scheduleCancelBtn) {
        this._elements.scheduleCancelBtn.textContent = this._t("task_cancel");
      }
      if (this._elements.scheduleSaveBtn) {
        this._elements.scheduleSaveBtn.textContent = this._t("task_save");
      }
      this._syncScheduleSectionToggles();
      const clearLabel = this._t("clear_value");
      [
        this._elements.scheduleNameClearBtn,
        this._elements.scheduleStartClearBtn,
        this._elements.scheduleEndClearBtn,
        this._elements.scheduleStartDateClearBtn,
        this._elements.scheduleEndDateClearBtn,
        this._elements.scheduleConditionEntityClearBtn,
        this._elements.scheduleConditionOperatorClearBtn,
        this._elements.scheduleConditionStateClearBtn,
      ].forEach((button) => {
        if (!button) {
          return;
        }
        button.setAttribute("aria-label", clearLabel);
        button.setAttribute("title", clearLabel);
      });
      this._updateScheduleDayLabels();
      this._updateScheduleMonthLabels();
      this._syncScheduleTypeFields({ refreshTimelineOptions: true });
      this._syncScheduleRecurrenceFields();
      this._syncScheduleHolidayFields();
      this._setSchedulePanel(this._schedulePanel);
    }
    this._setMenuMode(this._menuMode);
    const flowImage = cfg.boiler_flow_image || this._profileDefaultFlowImage();
    if (this._elements.boilerMainImage?.getAttribute("src") !== flowImage) {
      this._elements.boilerMainImage.setAttribute("src", flowImage);
    }
    if (this._elements.boilerVisual) {
      this._elements.boilerVisual.classList.toggle("hide-boiler-flow-image", this._asTruthy(cfg.hide_boiler_flow_image));
    }
    this._syncTimerPicker(duration, boiler, timer, managerMode);
    this._updatePostScheduleRunHintFromTasks();
    this._syncHeatingVisual(boiler, timer, duration, managerMode);
    this._syncStatus(boiler, timer, managerMode);
    this._syncCountdown(timer, boiler, managerMode);
    this._syncVacationNotice(managerMode);
    this._syncSensors();
    this._syncActiveTaskNotice();
    this._syncUpcomingTaskNotice();
    this._syncError(boiler);
    this._syncControls(boiler, managerMode);
    this._syncChildLockIndicator();
    this._syncSmarthome4uControls();
    this._syncScheduleList();
    this._syncHistoryList(managerMode);
  }

  _syncTimerPicker(durationEntity, boilerEntity, timerEntity, managerMode = null) {
    const options = this._durationOptions(durationEntity);
    const selected = this._selectedDurationOption(durationEntity, options, managerMode);
    this._timerPageIndex = this._clamp(this._timerPageIndex, 0, this._timerPageCount(options) - 1);

    if (this._elements.timerMenuBtn) {
      this._elements.timerMenuBtn.setAttribute(
        "title",
        `${this._t("timer_label")}: ${this._renderOptionLabel(selected)}`
      );
    }
    this._syncQuickTimerButtons(options, selected, boilerEntity, timerEntity, managerMode);
    this._renderTimerGrid(options, selected);
  }

  _syncQuickTimerButtons(options, selected, boilerEntity, timerEntity, managerMode = null) {
    this._syncQuickTimerButtonPresets(options);

    const isBoilerOn = this._isEntityOn(boilerEntity);
    const scheduleActive = this._isBuiltInScheduleMode(managerMode);
    const timerActive = !scheduleActive && (timerEntity?.state === "active" || timerEntity?.state === "paused");
    const builtInTimedActive = this._isBuiltInTimedMode(managerMode);
    const timedActive = timerActive || builtInTimedActive;
    const pendingOff = this._offPendingUntil > Date.now();
    const offSelected = pendingOff || (!isBoilerOn && !timedActive);
    const noTimerSelected = this._isNoTimerOption(selected);
    // Highlight timed quick buttons only while a timer is actually running/paused.
    // This prevents false "30m selected" visual state after restart when boiler is ON in continuous mode.
    const allowSelectedState = timedActive;
    const buttons = this._elements.quickTimerBtns || [];
    buttons.forEach((button) => {
      if (button.dataset.action === "off") {
        button.dataset.option = "";
        button.classList.toggle("selected", offSelected);
        return;
      }
      const presetOption = String(button.dataset.option || "").trim();
      const minutes = Number.parseInt(button.dataset.minutes || "", 10);
      const option = presetOption || this._optionByMinutes(minutes, options);
      button.dataset.option = option || "";
      button.classList.toggle(
        "selected",
        !offSelected && !noTimerSelected && allowSelectedState && !!option && option === selected
      );
    });
  }

  _syncQuickTimerButtonPresets(options) {
    const container = this._elements.quickTimers;
    if (!container) {
      return;
    }

    const timedOptions = (Array.isArray(options) ? options : [])
      .map((option) => String(option || "").trim())
      .filter((option) => !!option && !this._isNoTimerOption(option));
    const totalButtons = timedOptions.length + 1; // + off button
    container.classList.toggle("has-overflow", totalButtons > 4);
    const renderKey = JSON.stringify({
      lang: this._lang(),
      options: timedOptions,
    });
    if (renderKey === this._quickTimersRenderKey && (this._elements.quickTimerBtns || []).length > 0) {
      return;
    }
    this._quickTimersRenderKey = renderKey;

    container.innerHTML = "";
    timedOptions.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quick-timer-btn";
      const minutes = this._optionToMinutes(option);
      button.dataset.option = option;
      button.dataset.minutes = Number.isInteger(minutes) && minutes > 0 ? String(minutes) : "";
      button.textContent = Number.isInteger(minutes) && minutes > 0
        ? String(minutes)
        : this._renderOptionLabel(option);
      container.appendChild(button);
    });

    const offButton = document.createElement("button");
    offButton.type = "button";
    offButton.className = "quick-timer-btn off-action";
    offButton.id = "quick-off-btn";
    offButton.dataset.action = "off";
    offButton.textContent = this._t("turn_off");
    container.appendChild(offButton);

    this._elements.quickTimerBtns = Array.from(container.querySelectorAll(".quick-timer-btn"));
    this._elements.quickOffBtn = offButton;
  }

  _selectedDurationOption(durationEntity, options, managerMode = null) {
    if (this._isBuiltInTimedMode(managerMode)) {
      const timedSeconds = this._managerManualDurationSeconds(managerMode);
      if (timedSeconds) {
        const optionFromTimed = this._optionByMinutes(Math.max(1, Math.round(timedSeconds / 60)), options);
        if (optionFromTimed) {
          this._selectedDurationOptionLocal = optionFromTimed;
          return optionFromTimed;
        }
      }
    }

    const selected = String(durationEntity?.state || this._selectedDurationOptionLocal || "30m").trim();
    if (options.includes(selected)) {
      this._selectedDurationOptionLocal = selected;
      return selected;
    }
    if (options.includes(this._selectedDurationOptionLocal)) {
      return this._selectedDurationOptionLocal;
    }
    if (options.includes("30m")) {
      this._selectedDurationOptionLocal = "30m";
      return "30m";
    }
    const fallback = options[0] || "30m";
    this._selectedDurationOptionLocal = fallback;
    return fallback;
  }

  _renderTimerGrid(options, selected) {
    const grid = this._elements.timerGrid;
    if (!grid) {
      return;
    }

    const pageCount = this._timerPageCount(options);
    this._timerPageIndex = this._clamp(this._timerPageIndex, 0, pageCount - 1);
    const start = this._timerPageIndex * this._timerPageSize;
    const end = start + this._timerPageSize;
    const pageOptions = options.slice(start, end);
    const renderKey = JSON.stringify({
      lang: this._lang(),
      page: this._timerPageIndex,
      selected,
      options: pageOptions,
    });

    if (renderKey === this._timerGridRenderKey) {
      this._syncTimerPagerControls(pageCount);
      return;
    }
    this._timerGridRenderKey = renderKey;

    grid.innerHTML = "";
    const timerSelectionBlocked = this._isVacationModeEnabled(this._boilerManagerModeEntity())
      || this._timerActionBlockedByHoliday();
    pageOptions.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "timer-option-btn";
      button.disabled = timerSelectionBlocked;
      if (option === selected) {
        button.classList.add("selected");
      }
      button.textContent = this._renderOptionLabel(option);
      button.addEventListener("click", () => {
        this._selectDurationOption(option);
        this._closeTimerModal();
      });
      grid.appendChild(button);
    });

    this._syncTimerPagerControls(pageCount);
  }

  _syncStatus(boiler, timer, managerMode = null) {
    if (!boiler) {
      this._elements.subtitle.textContent = this._t("subtitle_check_entity");
      return;
    }

    if (this._isVacationModeEnabled(managerMode)) {
      this._elements.subtitle.textContent = this._t("subtitle_ready");
      return;
    }

    if (this._usesExtendedTimerUi()) {
      this._elements.subtitle.textContent = this._switcherStatusLine(boiler);
      return;
    }

    const isOn = this._isEntityOn(boiler);
    const scheduleActive = this._isBuiltInScheduleMode(managerMode);
    const builtInTimedActive = this._isBuiltInTimedMode(managerMode);
    const legacyTimerActive = !scheduleActive && timer?.state === "active";

    let line;
    if (legacyTimerActive || builtInTimedActive) {
      line = this._t("subtitle_heating_timer");
    } else if (isOn) {
      line = this._t("subtitle_heating_continuous");
    } else {
      line = this._t("subtitle_ready");
    }
    const calLine = this._calendarLineForActiveHebcalTask(this._currentActiveTask(), managerMode);
    if (calLine) {
      line = `${calLine} • ${line}`;
    }
    this._elements.subtitle.textContent = line;
  }

  _syncCountdown(timer, boiler, managerMode = null) {
    if (this._isVacationModeEnabled(managerMode)) {
      this._elements.countdownLabel.textContent = this._t("countdown_remaining");
      this._elements.countdownValue.textContent = "--:--";
      this._elements.countdownValue.classList.remove("continuous-active");
      return;
    }

    if (this._usesExtendedTimerUi()) {
      const isOn = this._isEntityOn(boiler);
      const timeLeftValue = this._switcherSensorDisplayValue(this._config.switcher_time_left_sensor, {
        withUnit: false,
      });
      this._elements.countdownLabel.textContent = this._t("countdown_remaining");
      this._elements.countdownValue.textContent = isOn
        ? (timeLeftValue || "--:--")
        : "--:--";
      this._elements.countdownValue.classList.remove("continuous-active");
      return;
    }

    const scheduleActive = this._isBuiltInScheduleMode(managerMode);
    if (!scheduleActive && (timer?.state === "active" || timer?.state === "paused")) {
      const seconds = this._remainingSeconds(timer);
      this._elements.countdownLabel.textContent =
        timer.state === "paused"
          ? this._t("countdown_paused")
          : this._t("countdown_remaining");
      this._elements.countdownValue.textContent = this._formatSeconds(seconds);
      this._elements.countdownValue.classList.remove("continuous-active");
      return;
    }

    if (scheduleActive) {
      const activeTask = this._currentActiveTask();
      if (activeTask && Number.isFinite(activeTask.endTs)) {
        const remaining = Math.max(0, Math.ceil((activeTask.endTs - Date.now()) / 1000));
        this._elements.countdownLabel.textContent = this._t("countdown_remaining");
        this._elements.countdownValue.textContent = this._formatSeconds(remaining);
        this._elements.countdownValue.classList.remove("continuous-active");
        return;
      }
    }

    if (this._isBuiltInTimedMode(managerMode)) {
      this._elements.countdownLabel.textContent = this._t("countdown_remaining");
      this._elements.countdownValue.textContent = this._formatSeconds(this._managerTimedRemainingSeconds(managerMode));
      this._elements.countdownValue.classList.remove("continuous-active");
      return;
    }

    if (this._isEntityOn(boiler)) {
      const elapsed = this._managerContinuousElapsedSeconds(managerMode);
      if (elapsed !== null) {
        this._elements.countdownLabel.textContent = this._t("countdown_elapsed");
        this._elements.countdownValue.textContent = this._formatSeconds(elapsed);
        this._elements.countdownValue.classList.remove("continuous-active");
        return;
      }
      this._elements.countdownLabel.textContent = this._t("no_timer");
      this._elements.countdownValue.textContent = "∞";
      this._elements.countdownValue.classList.remove("continuous-active");
      return;
    }

    this._elements.countdownLabel.textContent = this._t("countdown_remaining");
    this._elements.countdownValue.textContent = "--:--";
    this._elements.countdownValue.classList.remove("continuous-active");
  }

  _syncSensors() {
    const row = this._elements.sensorsRow;
    if (!row || !this._hass) {
      return;
    }

    const sensors = this._configuredSensors();
    const visibleSensors = sensors
      .map(({ label, entityId }) => ({ label, entity: this._hass.states[entityId] }))
      .filter(({ entity }) => this._hasAvailableSensorValue(entity));

    if (visibleSensors.length === 0) {
      row.hidden = true;
      row.innerHTML = "";
      row.style.removeProperty("--sensor-columns");
      return;
    }

    row.hidden = false;
    row.style.setProperty("--sensor-columns", String(Math.min(3, Math.max(1, visibleSensors.length))));
    row.innerHTML = "";
    visibleSensors.forEach(({ label, entity }) => {
      const pill = document.createElement("div");
      pill.className = "sensor-pill";

      const labelEl = document.createElement("span");
      labelEl.className = "sensor-label";
      labelEl.textContent = label;

      const valueEl = document.createElement("span");
      valueEl.className = "sensor-value";
      valueEl.textContent = this._formatSensorValue(entity);
      valueEl.title = valueEl.textContent;

      pill.appendChild(labelEl);
      pill.appendChild(valueEl);
      row.appendChild(pill);
    });
  }

  _configuredSensors() {
    if (this._isSwitcherMode()) {
      const isOn = this._isEntityOn(this._hass?.states?.[this._config.boiler_entity]);
      const defs = [
        ...(isOn ? [{
          key: "switcher_sensor_1",
          fallbackLabel: this._t("sensor_switcher_on"),
        }] : []),
        {
          key: "switcher_sensor_2",
          fallbackLabel: this._t("sensor_switcher_always"),
        },
      ];

      return defs
        .map(({ key, fallbackLabel }) => {
          const entityId = String(this._config?.[key] || "").trim();
          return { label: fallbackLabel, entityId };
        })
        .filter(({ entityId }) => this._isConfiguredSensorEntity(entityId));
    }

    if (this._isSmarthome4uProfile()) {
      const defs = [
        {
          key: "power_sensor",
          fallbackLabel: this._t("sensor_power"),
        },
        {
          key: "current_sensor",
          fallbackLabel: this._t("sensor_current"),
        },
        {
          key: "voltage_sensor",
          fallbackLabel: this._t("sensor_voltage"),
        },
        {
          key: "total_time_entity",
          fallbackLabel: this._t("sensor_total_time"),
        },
        {
          key: "work_time_entity",
          fallbackLabel: this._t("sensor_work_time"),
        },
      ];

      return defs
        .map(({ key, fallbackLabel }) => {
          const entityId = String(this._config?.[key] || "").trim();
          return { label: fallbackLabel, entityId };
        })
        .filter(({ entityId }) => this._isConfiguredSensorEntity(entityId));
    }

    const defs = [
      {
        key: "power_sensor",
        fallbackLabel: this._t("sensor_power"),
      },
      {
        key: "current_sensor",
        fallbackLabel: this._t("sensor_current"),
      },
      {
        key: "voltage_sensor",
        fallbackLabel: this._t("sensor_voltage"),
      },
    ];

    return defs
      .map(({ key, fallbackLabel }) => {
        const entityId = String(this._config?.[key] || "").trim();
        return { label: fallbackLabel, entityId };
      })
      .filter(({ entityId }) => this._isConfiguredSensorEntity(entityId));
  }

  _isConfiguredSensorEntity(entityId) {
    if (!entityId || typeof entityId !== "string") {
      return false;
    }

    const normalized = entityId.trim().toLowerCase();
    if (!normalized || normalized === "none" || normalized === "null" || normalized === "undefined") {
      return false;
    }

    return normalized.includes(".");
  }

  _hasAvailableSensorValue(entity) {
    const state = String(entity?.state || "").trim().toLowerCase();
    if (!state) {
      return false;
    }
    return !["unknown", "unavailable", "none", "null", "undefined"].includes(state);
  }

  _formatSensorValue(entity) {
    const rawState = String(entity?.state || "").trim();
    if (!rawState || rawState === "unknown" || rawState === "unavailable" || rawState === "none") {
      return this._t("sensor_unavailable");
    }

    const unit = String(entity?.attributes?.unit_of_measurement || "").trim();
    if (!unit) {
      return rawState;
    }

    return `${rawState} ${unit}`;
  }

  _syncError(boiler) {
    const missing = [];
    const hasBuiltIn = this._hasBuiltInControlServices();
    const runTimedService = this._resolvedControlService(
      this._config.service_run_timed,
      "service_run_timed"
    );
    const onContinuousService = this._resolvedControlService(
      this._config.service_on_continuous,
      "service_on_continuous"
    );
    const offService = this._resolvedControlService(
      this._config.service_off,
      "service_off"
    );

    if (!boiler) {
      missing.push(this._config.boiler_entity);
    }
    if (this._isSmarthome4uProfile()) {
      const boostEntity = String(this._config?.boost_time_entity || "").trim();
      if (!boostEntity || !boostEntity.startsWith("number.")) {
        missing.push(boostEntity || "boost_time_entity");
      }
    }
    if (!hasBuiltIn) {
      if (!this._isServiceAvailable(runTimedService)) {
        missing.push(runTimedService || this._config.service_run_timed);
      }
      if (!this._isServiceAvailable(onContinuousService)) {
        missing.push(onContinuousService || this._config.service_on_continuous);
      }
      if (!this._isServiceAvailable(offService)) {
        missing.push(offService || this._config.service_off);
      }
    }

    if (missing.length === 0) {
      this._elements.error.hidden = true;
      this._elements.error.textContent = "";
      return;
    }

    this._elements.error.hidden = false;
    this._elements.error.textContent = `${this._t("missing_entity")}: ${missing.join(", ")}`;
  }

  _syncControls(boiler, managerMode = null) {
    const hasHass = !!this._hass;
    const hasBuiltIn = this._hasBuiltInControlServices();
    const canUseBuiltIn = hasBuiltIn && !!boiler;
    const hasDuration = hasBuiltIn;
    const vacationEnabled = this._isVacationModeEnabled(managerMode || this._boilerManagerModeEntity());
    const holidayTimerBlocked = this._timerActionBlockedByHoliday();

    const timedButtonsDisabled = !hasHass || !canUseBuiltIn;
    const offButtonDisabled = !hasHass || !boiler;
    // Keep hamburger/menu available during vacation so user can disable vacation mode.
    // Actual heating actions remain blocked by dedicated vacation guards.
    this._elements.timerMenuBtn.disabled = !hasHass || !hasDuration || !boiler;
    this._elements.quickTimerBtns.forEach((button) => {
      const hasOption = !!button.dataset.option;
      const isOffAction = button.dataset.action === "off";
      if (isOffAction) {
        button.disabled = offButtonDisabled;
        return;
      }
      button.disabled = timedButtonsDisabled || !hasOption || vacationEnabled || holidayTimerBlocked;
    });
    if (this._elements.timerMenuBtn.disabled) {
      this._closeTimerModal();
    }
  }

  _syncSmarthome4uControls() {
    const isProfile = this._isSmarthome4uProfile();
    if (this._elements.smarthomeTopActions) {
      this._elements.smarthomeTopActions.hidden = !isProfile;
    }
    if (!isProfile || !this._hass) {
      if (this._elements.smarthomeBoostBtn) this._elements.smarthomeBoostBtn.disabled = true;
      if (this._elements.smarthomeSettingsBtn) this._elements.smarthomeSettingsBtn.disabled = true;
      this._closeSmarthomeBoostModal();
      this._closeSmarthomeSettingsModal();
      return;
    }
    if (this._elements.smarthomeBoostBtn) this._elements.smarthomeBoostBtn.disabled = false;
    if (this._elements.smarthomeSettingsBtn) this._elements.smarthomeSettingsBtn.disabled = false;

    if (this._elements.smarthomeBoostBtn) {
      this._elements.smarthomeBoostBtn.title = this._t("boost_time_edit");
      this._elements.smarthomeBoostBtn.setAttribute("aria-label", this._t("boost_time_edit"));
    }
    if (this._elements.smarthomeSettingsBtn) {
      this._elements.smarthomeSettingsBtn.title = this._t("smarthome_settings_open");
      this._elements.smarthomeSettingsBtn.setAttribute("aria-label", this._t("smarthome_settings_open"));
    }
    if (this._elements.smarthomeBoostModalPanel) {
      this._elements.smarthomeBoostModalPanel.setAttribute("dir", this._lang() === "he" ? "rtl" : "ltr");
    }
    if (this._elements.smarthomeSettingsModalPanel) {
      this._elements.smarthomeSettingsModalPanel.setAttribute("dir", this._lang() === "he" ? "rtl" : "ltr");
    }
    if (this._elements.smarthomeBoostModalTitle) {
      this._elements.smarthomeBoostModalTitle.textContent = this._t("boost_time_label");
    }
    if (this._elements.smarthomeBoostModalLabel) {
      this._elements.smarthomeBoostModalLabel.textContent = this._t("minutes_label");
    }
    if (this._elements.smarthomeBoostModalCancelBtn) {
      this._elements.smarthomeBoostModalCancelBtn.textContent = this._t("task_cancel");
    }
    if (this._elements.smarthomeBoostModalSaveBtn) {
      this._elements.smarthomeBoostModalSaveBtn.textContent = this._t("task_save");
    }
    if (this._elements.smarthomeSettingsModalTitle) {
      this._elements.smarthomeSettingsModalTitle.textContent = this._t("smarthome_settings_title");
    }
    if (this._elements.smarthomeBacklightLabel) {
      this._elements.smarthomeBacklightLabel.textContent = this._t("backlight_mode_label");
    }
    if (this._elements.smarthomeChildLockLabel) {
      this._elements.smarthomeChildLockLabel.textContent = this._t("child_lock_label");
    }
    if (this._elements.smarthomePowerOnLabel) {
      this._elements.smarthomePowerOnLabel.textContent = this._t("power_on_behavior_label");
    }
    if (this._elements.smarthomeSettingsModalCancelBtn) {
      this._elements.smarthomeSettingsModalCancelBtn.textContent = this._t("task_cancel");
    }
    if (this._elements.smarthomeSettingsModalSaveBtn) {
      this._elements.smarthomeSettingsModalSaveBtn.textContent = this._t("task_save");
    }
  }

  _syncChildLockIndicator() {
    const indicator = this._elements.childLockIndicator;
    if (!indicator) {
      return;
    }
    if (!this._isSmarthome4uProfile() || !this._hass) {
      indicator.hidden = true;
      return;
    }
    const childLockId = String(this._config?.child_lock_entity || "").trim();
    const childLockState = this._hass.states?.[childLockId];
    const isLocked = this._asTruthy(childLockState?.state);
    indicator.hidden = !isLocked;
    indicator.title = this._t("child_lock_label");
    indicator.setAttribute("aria-label", this._t("child_lock_label"));
  }

  _openSmarthomeBoostModal() {
    if (!this._isSmarthome4uProfile() || !this._elements.smarthomeBoostModal) {
      return;
    }
    const boostEntity = this._hass?.states?.[String(this._config?.boost_time_entity || "").trim()];
    const raw = Number.parseInt(String(boostEntity?.state || this._smarthome4uOffBoostMinutes()), 10);
    if (this._elements.smarthomeBoostModalInput) {
      this._elements.smarthomeBoostModalInput.value = String(Number.isInteger(raw) && raw > 0 ? raw : this._smarthome4uOffBoostMinutes());
    }
    this._elements.smarthomeBoostModal.hidden = false;
    this._attachEscapeListener();
  }

  _stepSmarthomeBoostModal(delta) {
    const current = Number.parseInt(String(this._elements.smarthomeBoostModalInput?.value || "0"), 10);
    const next = Number.isInteger(current) ? Math.max(1, current + delta) : this._smarthome4uOffBoostMinutes();
    if (this._elements.smarthomeBoostModalInput) {
      this._elements.smarthomeBoostModalInput.value = String(next);
    }
  }

  _closeSmarthomeBoostModal() {
    if (this._elements.smarthomeBoostModal) {
      this._elements.smarthomeBoostModal.hidden = true;
    }
  }

  _saveSmarthomeBoostModal() {
    const raw = Number.parseInt(String(this._elements.smarthomeBoostModalInput?.value || ""), 10);
    if (!Number.isInteger(raw) || raw <= 0) {
      return;
    }
    this._setSmarthome4uBoostMinutes(raw);
    this._closeSmarthomeBoostModal();
  }

  _openSmarthomeSettingsModal() {
    if (!this._isSmarthome4uProfile() || !this._elements.smarthomeSettingsModal || !this._hass) {
      return;
    }
    const backlightEntity = this._hass.states?.[String(this._config?.backlight_mode_entity || "").trim()];
    const backlightOn = this._asTruthy(backlightEntity?.state);
    if (this._elements.smarthomeBacklightSelect) {
      this._elements.smarthomeBacklightSelect.value = backlightOn ? "on" : "off";
    }
    this._syncSmarthomeBinaryToggleButton("backlight");

    const childLockEntity = this._hass.states?.[String(this._config?.child_lock_entity || "").trim()];
    const childLockOn = this._asTruthy(childLockEntity?.state);
    if (this._elements.smarthomeChildLockSelect) {
      this._elements.smarthomeChildLockSelect.value = childLockOn ? "on" : "off";
    }
    this._syncSmarthomeBinaryToggleButton("child_lock");

    const powerEntityId = String(this._config?.power_on_behavior_entity || "").trim();
    const powerEntity = this._hass.states?.[powerEntityId];
    const options = Array.isArray(powerEntity?.attributes?.options)
      ? powerEntity.attributes.options.map((item) => String(item || "").trim()).filter((item) => item.length > 0)
      : ["off", "previous", "on"];
    const currentValue = String(powerEntity?.state || options[0] || "").trim();
    if (this._elements.smarthomePowerOnSelect) {
      this._elements.smarthomePowerOnSelect.value = options.includes(currentValue) ? currentValue : (options[0] || "");
    }
    this._renderSmarthomePowerOnOptions(options);

    this._elements.smarthomeSettingsModal.hidden = false;
    this._attachEscapeListener();
  }

  _toggleSmarthomeBinaryInput(kind) {
    const input = kind === "backlight"
      ? this._elements.smarthomeBacklightSelect
      : this._elements.smarthomeChildLockSelect;
    if (!input) {
      return;
    }
    input.value = String(input.value || "").toLowerCase() === "on" ? "off" : "on";
    this._syncSmarthomeBinaryToggleButton(kind);
  }

  _syncSmarthomeBinaryToggleButton(kind) {
    const isBacklight = kind === "backlight";
    const input = isBacklight
      ? this._elements.smarthomeBacklightSelect
      : this._elements.smarthomeChildLockSelect;
    const button = isBacklight
      ? this._elements.smarthomeBacklightToggleBtn
      : this._elements.smarthomeChildLockToggleBtn;
    if (!input || !button) {
      return;
    }
    const on = String(input.value || "").toLowerCase() === "on";
    button.dataset.active = on ? "true" : "false";
    if (kind === "backlight") {
      button.textContent = "💡";
      button.style.filter = on ? "none" : "grayscale(1) opacity(0.6)";
    } else {
      button.textContent = on ? "🔒" : "🔓";
      button.style.filter = "none";
    }
  }

  _renderSmarthomePowerOnOptions(options) {
    if (!this._elements.smarthomePowerOnOptions) {
      return;
    }
    const current = String(this._elements.smarthomePowerOnSelect?.value || "").trim();
    this._elements.smarthomePowerOnOptions.innerHTML = "";
    options.forEach((option) => {
      const normalized = String(option || "").trim();
      if (!normalized) {
        return;
      }
      const button = document.createElement("button");
      button.type = "button";
      button.className = "settings-icon-chip";
      button.dataset.active = current === normalized ? "true" : "false";
      button.dataset.powerState = normalized;
      const icon = normalized === "on" ? "⏻" : normalized === "previous" ? "↺" : "⭘";
      button.innerHTML = `<span>${icon}</span>`;
      button.title = normalized;
      button.setAttribute("aria-label", normalized);
      button.addEventListener("click", () => {
        if (this._elements.smarthomePowerOnSelect) {
          this._elements.smarthomePowerOnSelect.value = normalized;
        }
        this._renderSmarthomePowerOnOptions(options);
      });
      this._elements.smarthomePowerOnOptions.appendChild(button);
    });
  }

  _closeSmarthomeSettingsModal() {
    if (this._elements.smarthomeSettingsModal) {
      this._elements.smarthomeSettingsModal.hidden = true;
    }
  }

  _saveSmarthomeSettingsModal() {
    if (!this._hass) {
      return;
    }
    const backlightEntity = String(this._config?.backlight_mode_entity || "").trim();
    if (backlightEntity && this._isConfiguredSensorEntity(backlightEntity)) {
      const desired = String(this._elements.smarthomeBacklightSelect?.value || "off").toLowerCase();
      const action = desired === "on" ? "homeassistant.turn_on" : "homeassistant.turn_off";
      this._callEntityAction(action, backlightEntity, null);
    }
    const childLockEntity = String(this._config?.child_lock_entity || "").trim();
    if (childLockEntity && this._isConfiguredSensorEntity(childLockEntity)) {
      const desired = String(this._elements.smarthomeChildLockSelect?.value || "off").toLowerCase();
      const action = desired === "on" ? "homeassistant.turn_on" : "homeassistant.turn_off";
      this._callEntityAction(action, childLockEntity, null);
    }

    const powerEntityId = String(this._config?.power_on_behavior_entity || "").trim();
    const powerOption = String(this._elements.smarthomePowerOnSelect?.value || "").trim();
    if (powerEntityId && powerOption && this._isServiceAvailable("select.select_option")) {
      this._hass.callService("select", "select_option", {
        entity_id: powerEntityId,
        option: powerOption,
      });
    }
    this._closeSmarthomeSettingsModal();
  }

  _refreshLiveCountdown() {
    if (!this._hass || !this._elements.countdownValue) {
      return;
    }

    const timer = this._hass.states[this._config.timer_entity];
    const boiler = this._hass.states[this._config.boiler_entity];
    const duration = this._hass.states[this._config.duration_entity];
    const managerMode = this._boilerManagerModeEntity();
    this._maybeCancelLegacyTimerForSchedule(managerMode);
    this._syncCountdown(timer, boiler, managerMode);
    this._syncVacationNotice(managerMode);
    this._syncActiveTaskNotice();
    this._syncUpcomingTaskNotice();
    this._updatePostScheduleRunHintFromTasks();
    this._syncHeatingVisual(boiler, timer, duration, managerMode);
  }

  _syncHeatingVisual(boiler, timer, durationEntity, managerMode = null) {
    if (!this._elements.boilerVisual) {
      return;
    }

    const isOn = this._isEntityOn(boiler);
    const profile = this._heatingProfile(boiler, timer, durationEntity, managerMode);
    this._elements.boilerVisual.classList.toggle("off", !isOn);
    this._elements.boilerVisual.classList.toggle("temp-driven", !!profile.isTemperatureDriven);
    this._elements.boilerVisual.style.setProperty("--heat-primary", profile.primaryColor);
    this._elements.boilerVisual.style.setProperty("--heat-secondary", profile.secondaryColor);
    this._elements.boilerVisual.style.setProperty("--heat-glow", profile.glowColor);
    this._elements.boilerVisual.style.setProperty(
      "--heat-gradient",
      profile.gradient || "linear-gradient(90deg, #2b7fff, #2b7fff)"
    );
    this._elements.boilerVisual.style.setProperty("--heat-progress", `${Math.round(profile.progress * 100)}%`);
    this._elements.boilerStage.textContent = profile.label;
    this._elements.boilerStageSub.textContent = profile.subLabel;
    this._applyBoilerProgressHint(boiler, timer, durationEntity, managerMode);
  }

  _applyBoilerProgressHint(boiler, timer, durationEntity, managerMode = null) {
    const hintEl = this._elements.boilerProgressHint;
    if (!hintEl) {
      return;
    }

    const isOn = this._isEntityOn(boiler);
    const hint = this._postScheduleRunHint;
    const showHint =
      !isOn &&
      !this._isVacationModeEnabled(managerMode || this._boilerManagerModeEntity()) &&
      !this._liveTemperatureReading() &&
      hint &&
      Date.now() < hint.validUntil;

    if (showHint) {
      hintEl.textContent = this._t("post_schedule_run_hint").replace("{time}", hint.startClock);
      hintEl.hidden = false;
      if (this._elements.boilerStageSub) {
        this._elements.boilerStageSub.textContent = "";
      }
      return;
    }

    hintEl.hidden = true;
    hintEl.textContent = "";
  }

  _heatingProfile(boiler, timer, durationEntity, managerMode = null) {
    const turnOffPending = this._offPendingUntil > Date.now();
    if (this._isVacationModeEnabled(managerMode)) {
      return {
        progress: 0,
        label: this._t("stage_off"),
        subLabel: this._t("no_heating"),
        primaryColor: "#c7d0dd",
        secondaryColor: "#dde4ee",
        glowColor: "rgba(0, 0, 0, 0)",
        gradient: "linear-gradient(90deg, #c7d0dd, #dde4ee)",
        isTemperatureDriven: false,
      };
    }

    const isOn = this._isEntityOn(boiler);
    const scheduleActive = this._isBuiltInScheduleMode(managerMode);
    const timerActive = !scheduleActive && (timer?.state === "active" || timer?.state === "paused");
    const builtInTimedActive = this._isBuiltInTimedMode(managerMode);
    const timedActive = timerActive || builtInTimedActive;
    const liveTemp = this._liveTemperatureReading();

    if (liveTemp) {
      return this._temperatureDrivenProfile(liveTemp);
    }

    if (turnOffPending || !isOn) {
      return {
        progress: 0,
        label: this._t("stage_off"),
        subLabel: this._t("no_heating"),
        primaryColor: "#c7d0dd",
        secondaryColor: "#dde4ee",
        glowColor: "rgba(0, 0, 0, 0)",
        gradient: "linear-gradient(90deg, #c7d0dd, #dde4ee)",
        isTemperatureDriven: false,
      };
    }

    if (!timedActive) {
      // In continuous/no-timer mode, show a full bar while ON.
      // This keeps switch/light behavior consistent even when a temp sensor exists
      // but doesn't currently provide a valid reading.
      const profile = this._buildHeatingProfile(
        1,
        this._t("stage_continuous"),
        this._t("no_timer_mode")
      );
      profile.isTemperatureDriven = false;
      return profile;
    }

    const remaining = timerActive
      ? this._remainingSeconds(timer)
      : this._managerTimedRemainingSeconds(managerMode);
    const total = this._timerTotalSeconds(timer, durationEntity, managerMode);
    const progress = total > 0 && remaining !== null ? this._clamp(1 - remaining / total, 0, 1) : 0;
    const colorProgress = this._timedHeatColorProgress(progress, total);
    const percent = Math.round(progress * 100);

    if (colorProgress < 0.3) {
      const profile = this._buildHeatingProfile(
        progress,
        this._t("stage_cool"),
        this._formatWarmedPercent(percent),
        { colorProgress }
      );
      profile.isTemperatureDriven = false;
      return profile;
    }
    if (colorProgress < 0.5) {
      const profile = this._buildHeatingProfile(
        progress,
        this._t("stage_warm"),
        this._formatWarmedPercent(percent),
        { colorProgress }
      );
      profile.isTemperatureDriven = false;
      return profile;
    }
    const profile = this._buildHeatingProfile(
      progress,
      this._t("stage_hot"),
      this._formatWarmedPercent(percent),
      { colorProgress }
    );
    profile.isTemperatureDriven = false;
    return profile;
  }

  _buildHeatingProfile(progress, label, subLabel, { colorProgress = null } = {}) {
    const clamped = this._clamp(progress, 0, 1);
    const heatColorProgress = Number.isFinite(colorProgress)
      ? this._clamp(colorProgress, 0, 1)
      : clamped;
    const primary = this._colorByHeat(heatColorProgress);
    const secondary = this._mixColors(primary, "#e2f4ff", 0.35);
    const glow = this._hexToRgba(primary, 0.33);

    return {
      progress: clamped,
      label,
      subLabel,
      primaryColor: primary,
      secondaryColor: secondary,
      glowColor: glow,
      gradient: this._stagedHeatGradient(heatColorProgress),
      isTemperatureDriven: false,
    };
  }

  _timedHeatColorProgress(timerProgress, totalSeconds) {
    return timedHeatColorProgress(timerProgress, totalSeconds, this._clamp.bind(this));
  }

  _effectiveHeatupMinutes(totalMinutes) {
    return effectiveHeatupMinutes(totalMinutes, this._clamp.bind(this));
  }

  _stagedHeatGradient(colorProgress) {
    return stagedHeatGradient(colorProgress, this._clamp.bind(this));
  }

  _temperatureDrivenProfile(liveTemp) {
    const band = this._temperatureColorBand(liveTemp.celsiusValue);
    return {
      progress: this._clamp(liveTemp.progress, 0, 1),
      label: band.label,
      subLabel: liveTemp.displayLabel,
      primaryColor: band.primaryColor,
      secondaryColor: band.secondaryColor,
      glowColor: band.glowColor,
      gradient: `linear-gradient(90deg, ${band.secondaryColor}, ${band.primaryColor})`,
      isTemperatureDriven: true,
    };
  }

  _temperatureColorBand(celsiusValue) {
    if (celsiusValue <= 30) {
      const primary = "#2b7fff";
      return {
        label: this._t("stage_cool"),
        primaryColor: primary,
        secondaryColor: this._mixColors(primary, "#e2f4ff", 0.35),
        glowColor: this._hexToRgba(primary, 0.33),
      };
    }

    if (celsiusValue <= 40) {
      const primary = "#f3d34f";
      return {
        label: this._t("stage_warm"),
        primaryColor: primary,
        secondaryColor: this._mixColors(primary, "#fff6cf", 0.35),
        glowColor: this._hexToRgba(primary, 0.33),
      };
    }

    if (celsiusValue < 50) {
      const primary = "#f97316";
      return {
        label: this._t("stage_hot"),
        primaryColor: primary,
        secondaryColor: this._mixColors(primary, "#ffe2c7", 0.35),
        glowColor: this._hexToRgba(primary, 0.33),
      };
    }

    const primary = "#dc2626";
    return {
      label: this._t("stage_hot"),
      primaryColor: primary,
      secondaryColor: this._mixColors(primary, "#ffd7d7", 0.35),
      glowColor: this._hexToRgba(primary, 0.33),
    };
  }

  _liveTemperatureReading() {
    if (!this._hass) {
      return null;
    }

    const sensorEntityId = this._temperatureSensorEntityId();
    if (!this._isConfiguredSensorEntity(sensorEntityId)) {
      return null;
    }

    const sensor = this._hass.states[sensorEntityId];
    const parsed = this._parseNumericEntityState(sensor);
    if (!parsed) {
      return null;
    }

    const celsiusValue = this._toCelsius(parsed.value, parsed.unit);
    if (!Number.isFinite(celsiusValue)) {
      return null;
    }
    const progress = this._temperatureProgressFromCelsius(celsiusValue);

    return {
      progress,
      celsiusValue,
      displayLabel: this._formatTemperatureDisplay(parsed.rawState, parsed.unit, celsiusValue),
    };
  }

  _parseNumericEntityState(entity) {
    return parseNumericEntityState(entity);
  }

  _temperatureProgressFromCelsius(celsiusValue) {
    return temperatureProgressFromCelsius(celsiusValue, this._clamp.bind(this));
  }

  _toCelsius(value, unit) {
    return toCelsius(value, unit);
  }

  _formatTemperatureDisplay(rawState, unit, celsiusValue) {
    return formatTemperatureDisplay(rawState, unit, celsiusValue, this._t("sensor_unavailable"));
  }

  _timerTotalSeconds(timer, durationEntity, managerMode = null) {
    const fromTimer = this._parseDurationString(timer?.attributes?.duration);
    if (fromTimer !== null && fromTimer > 0) {
      return fromTimer;
    }

    const fromManager = this._managerManualDurationSeconds(managerMode);
    if (fromManager !== null && fromManager > 0) {
      return fromManager;
    }

    const selected = String(durationEntity?.state || this._selectedDurationOptionLocal || "30m").trim();
    const minutes = this._optionToMinutes(selected);
    if (minutes !== null && minutes > 0) {
      return minutes * 60;
    }

    return 0;
  }

  _durationOptions(durationEntity) {
    if (this._isSmarthome4uProfile()) {
      const configured = this._smarthome4uTimerOptionsFromConfig();
      if (configured.length > 0) {
        return configured;
      }
      return ["15m", "30m", "60m", "90m"];
    }

    if (this._usesExtendedTimerUi()) {
      const configured = this._switcherTimerOptionsFromConfig();
      if (configured.length > 0) {
        return configured;
      }
      return ["15m", "30m", "45m", "60m", "No Timer"];
    }

    const configured = this._regularTimerOptionsFromConfig();
    if (configured.length > 0) {
      return configured;
    }

    const fromEntity = durationEntity?.attributes?.options;
    if (Array.isArray(fromEntity) && fromEntity.length > 0) {
      return fromEntity;
    }
    return DEFAULT_DURATION_OPTIONS;
  }

  _renderOptionLabel(option) {
    if (this._isNoTimerOption(option)) {
      return this._t("no_timer");
    }

    const minutes = this._optionToMinutes(option);
    if (minutes === null) {
      return option;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours} ${this._t("hours_short")} ${mins} ${this._t("minutes_short")}`;
    }
    if (hours > 0) {
      return `${hours} ${this._t("hours_short")}`;
    }
    return `${minutes} ${this._t("minutes_short")}`;
  }

  _selectDurationOption(option) {
    if (!this._hass) {
      return;
    }
    if (this._isVacationModeEnabled(this._boilerManagerModeEntity())) {
      return;
    }
    if (this._timerActionBlockedByHoliday()) {
      return;
    }

    this._selectedDurationOptionLocal = option;
    this._activateSelectedDuration(option);
  }

  _handleQuickTimerClick(button) {
    if (!button) {
      return;
    }

    if (button.dataset.action === "off") {
      this._handleTurnOff();
      return;
    }
    if (this._isVacationModeEnabled(this._boilerManagerModeEntity())) {
      return;
    }
    if (this._timerActionBlockedByHoliday()) {
      return;
    }
    this._offPendingUntil = 0;

    const option = button.dataset.option;
    if (!option) {
      return;
    }

    this._selectDurationOption(option);
  }

  _activateSelectedDuration(option) {
    if (!this._hass) {
      return;
    }
    if (this._isVacationModeEnabled(this._boilerManagerModeEntity())) {
      return;
    }
    if (this._timerActionBlockedByHoliday()) {
      return;
    }

    const canUseBuiltIn = this._hasBuiltInControlServices();
    const runTimedService = this._resolvedControlService(
      this._config.service_run_timed,
      "service_run_timed"
    );
    const onContinuousService = this._resolvedControlService(
      this._config.service_on_continuous,
      "service_on_continuous"
    );

    if (this._isSmarthome4uProfile()) {
      const selectedMinutes = this._isNoTimerOption(option)
        ? this._smarthome4uOffBoostMinutes()
        : this._optionToMinutes(option);
      if (!Number.isInteger(selectedMinutes) || selectedMinutes <= 0) {
        return;
      }

      this._forceOnConfiguredEntity();
      if (canUseBuiltIn) {
        this._callConfiguredService(
          onContinuousService,
          this._controlServiceBaseData(onContinuousService)
        );
      }
      this._setSmarthome4uBoostMinutes(selectedMinutes);
      return;
    }

    if (this._isNoTimerOption(option)) {
      if (canUseBuiltIn) {
        this._callConfiguredService(
          onContinuousService,
          this._controlServiceBaseData(onContinuousService)
        );
      }
      return;
    }

    if (canUseBuiltIn) {
      const minutes = this._optionToMinutes(option);
      if (this._isSwitcherMode()) {
        if (this._isBoilerManagerService(runTimedService)) {
          this._callConfiguredService(runTimedService, {
            ...this._controlServiceBaseData(runTimedService),
            duration: this._optionToHhMmSs(option) || "00:30:00",
            ...(minutes ? { minutes } : {}),
          });
        } else {
          this._callConfiguredService(runTimedService, {
            ...this._controlServiceBaseData(runTimedService),
            timer_minutes: minutes || 30,
          });
        }
      } else {
        this._callConfiguredService(runTimedService, {
          ...this._controlServiceBaseData(runTimedService),
          duration: this._optionToHhMmSs(option) || "00:30:00",
          ...(minutes ? { minutes } : {}),
        });
      }
    }
  }

  _openTimerModal() {
    if (!this._elements.timerModal || this._elements.timerMenuBtn.disabled) {
      return;
    }

    const duration = this._hass?.states[this._config.duration_entity];
    const options = this._durationOptions(duration);
    const selected = this._selectedDurationOption(duration, options);
    this._setTimerPageToOption(options, selected);
    this._renderTimerGrid(options, selected);
    this._elements.timerModal.hidden = false;
    this._setMenuMode("timer");
    this._attachEscapeListener();
  }

  _hasTasksView() {
    return this._hasAnyTaskCreateService()
      || this._hasScheduleUpdateService()
      || this._hasScheduleDeleteService()
      || this._hasVacationModeService()
      || this._taskSwitchEntities().length > 0;
  }

  _hasImportExportView() {
    return this._hasTaskImportService() || this._taskSwitchEntities().length > 0;
  }

  _availableMenuModes() {
    const modes = ["timer", "history"];
    if (this._hasTasksView()) {
      modes.push("tasks");
    }
    if (this._hasImportExportView()) {
      modes.push("import_export");
    }
    return modes;
  }

  _setMenuMode(mode) {
    const requested = mode === "tasks" || mode === "import_export" || mode === "history" ? mode : "timer";
    const availableModes = this._availableMenuModes();
    const normalized = availableModes.includes(requested) ? requested : "timer";
    this._menuMode = normalized;
    const isTimer = this._menuMode === "timer";
    const isTasks = this._menuMode === "tasks";
    const isImportExport = this._menuMode === "import_export";
    const isHistory = this._menuMode === "history";
    if (this._elements.timerModalPanel) {
      this._elements.timerModalPanel.classList.toggle("menu-mode-tasks", isTasks);
      this._elements.timerModalPanel.classList.toggle("menu-mode-import-export", isImportExport);
      this._elements.timerModalPanel.classList.toggle("menu-mode-history", isHistory);
      this._elements.timerModalPanel.classList.toggle("menu-mode-timer", isTimer);
    }
    if (this._elements.modalTimerView) {
      this._elements.modalTimerView.hidden = !isTimer;
    }
    if (this._elements.modalTasksView) {
      this._elements.modalTasksView.hidden = !isTasks;
    }
    if (this._elements.modalImportExportView) {
      this._elements.modalImportExportView.hidden = !isImportExport;
    }
    if (this._elements.modalHistoryView) {
      this._elements.modalHistoryView.hidden = !isHistory;
    }
    if (this._elements.modalModeTimerBtn) {
      this._elements.modalModeTimerBtn.classList.toggle("active", isTimer);
    }
    if (this._elements.modalModeTasksBtn) {
      this._elements.modalModeTasksBtn.classList.toggle("active", isTasks);
    }
    if (this._elements.modalModeImportExportBtn) {
      this._elements.modalModeImportExportBtn.classList.toggle("active", isImportExport);
    }
    if (this._elements.timerHistoryBtn) {
      this._elements.timerHistoryBtn.classList.toggle("active", isHistory);
    }
    if (this._elements.timerPageControls) {
      const duration = this._hass?.states[this._config.duration_entity];
      const options = this._durationOptions(duration);
      const pageCount = this._timerPageCount(options);
      this._elements.timerPageControls.hidden = !isTimer || pageCount <= 1;
    }
  }

  _setImportMode(mode) {
    const normalized = String(mode || "").toLowerCase() === "replace" ? "replace" : "merge";
    this._importMode = normalized;

    if (this._elements.tasksModeMergeBtn) {
      const active = normalized === "merge";
      this._elements.tasksModeMergeBtn.classList.toggle("active", active);
      this._elements.tasksModeMergeBtn.setAttribute("aria-pressed", active ? "true" : "false");
    }
    if (this._elements.tasksModeReplaceBtn) {
      const active = normalized === "replace";
      this._elements.tasksModeReplaceBtn.classList.toggle("active", active);
      this._elements.tasksModeReplaceBtn.setAttribute("aria-pressed", active ? "true" : "false");
    }
  }

  _toggleVacationMode() {
    if (!this._hasVacationModeService()) {
      return;
    }
    const managerMode = this._boilerManagerModeEntity();
    const currentlyEnabled = this._isVacationModeEnabled(managerMode);
    if (!currentlyEnabled) {
      this._forceVacationShutdown();
    }
    this._callConfiguredService(this._config.service_set_vacation_mode, {
      ...this._builtInServiceBaseData(),
      vacation_mode: !currentlyEnabled,
    });
  }

  _forceVacationShutdown() {
    const now = Date.now();
    if (now - this._lastVacationForceOffAt < 1500) {
      return;
    }
    this._lastVacationForceOffAt = now;
    // Keep menu/modal open so user can disable vacation mode if needed.
    // Only enforce OFF actions here.
    this._handleTurnOff();
  }

  _maybeEnforceVacationShutdown(managerMode, boiler, timer) {
    if (!this._isVacationModeEnabled(managerMode)) {
      return;
    }
    const isOn = this._isEntityOn(boiler);
    const legacyTimerActive = timer?.state === "active" || timer?.state === "paused";
    const builtInTimedActive = this._isBuiltInTimedMode(managerMode);
    const scheduleActive = this._isBuiltInScheduleMode(managerMode);
    const shouldForceOff = shouldForceShutdown({
      isOn,
      legacyTimerActive,
      builtInTimedActive,
      scheduleActive,
    });
    if (!shouldForceOff) {
      return;
    }
    this._forceVacationShutdown();
  }

  _normalizeHolidayPolicy(value) {
    return normalizeHolidayPolicy(value);
  }

  _holidayTimerPolicy() {
    return this._normalizeHolidayPolicy(this._config?.holiday_timer_policy);
  }

  _holidayTaskPolicy() {
    return this._normalizeHolidayPolicy(this._config?.holiday_task_policy);
  }

  _holidayActiveStateList() {
    return holidayActiveStateList(this._config?.holiday_active_states);
  }

  _isHolidaySourceActiveState(stateValue) {
    return isHolidaySourceActiveState(stateValue, this._holidayActiveStateList());
  }

  _holidaySourceStatus(entityId) {
    const normalizedId = String(entityId || "").trim();
    if (!normalizedId) {
      return {
        configured: false,
        entityId: "",
        stateObj: null,
        active: false,
      };
    }
    const stateObj = this._hass?.states?.[normalizedId] || null;
    return {
      configured: true,
      entityId: normalizedId,
      stateObj,
      active: this._isHolidaySourceActiveState(stateObj?.state),
    };
  }

  _isTruthyHolidayFlag(value) {
    return isTruthyHolidayFlag(value);
  }

  _holidayWorkProhibited(holidayStateObj) {
    return holidayWorkProhibited(holidayStateObj);
  }

  _holidayShabbatStatus() {
    const managerMode = this._boilerManagerModeEntity();
    const managerAttrs = managerMode?.attributes || {};
    const managerHebcalActive = this._asTruthy(managerAttrs.hebcal_active);
    const managerHebcalKind = String(managerAttrs.hebcal_kind || "").trim().toLowerCase();
    const managerWorkProhibited = this._asTruthy(managerAttrs.hebcal_work_prohibited);
    if (managerHebcalActive && (managerHebcalKind === "holiday" || managerHebcalKind === "shabbat")) {
      const resolved = resolveHolidayKind({
        managerHebcalActive,
        managerHebcalKind,
        managerWorkProhibited,
        holidayActive: false,
        shabbatActive: false,
        holidayLooksLikeYomTov: false,
      });
      return {
        holiday: this._holidaySourceStatus(this._config?.holiday_entity),
        shabbat: this._holidaySourceStatus(this._config?.shabbat_entity),
        ...resolved,
      };
    }

    const holiday = this._holidaySourceStatus(this._config?.holiday_entity);
    const shabbat = this._holidaySourceStatus(this._config?.shabbat_entity);
    const holidayLooksLikeYomTov = Boolean(holiday.active && this._holidayWorkProhibited(holiday.stateObj));
    const resolved = resolveHolidayKind({
      managerHebcalActive: false,
      managerHebcalKind: "none",
      managerWorkProhibited: false,
      holidayActive: holiday.active,
      shabbatActive: shabbat.active,
      holidayLooksLikeYomTov,
    });
    return {
      holiday,
      shabbat,
      ...resolved,
    };
  }

  _holidayTimerPolicyForStatus(status = null) {
    const sourceStatus = status || this._holidayShabbatStatus();
    const kind = String(sourceStatus?.kind || "none");
    return holidayTimerPolicyForKind(kind, this._config, this._holidayTimerPolicy());
  }

  _holidayTaskPolicyForStatus(status = null) {
    const sourceStatus = status || this._holidayShabbatStatus();
    const kind = String(sourceStatus?.kind || "none");
    return holidayTaskPolicyForKind(kind, this._config, this._holidayTaskPolicy());
  }

  _timerActionBlockedByHoliday() {
    const status = this._holidayShabbatStatus();
    if (!status.active) {
      return false;
    }
    const policy = this._holidayTimerPolicyForStatus(status);
    if (policy === "allow") {
      return false;
    }
    if (policy === "force_off") {
      const boiler = this._hass?.states?.[this._config?.boiler_entity];
      const timer = this._hass?.states?.[this._config?.timer_entity];
      const managerMode = this._boilerManagerModeEntity();
      this._forceHolidayShutdown(boiler, timer, managerMode);
    }
    return true;
  }

  _maybeEnforceHolidayRules(managerMode, boiler, timer) {
    const status = this._holidayShabbatStatus();
    if (!status.active) {
      return;
    }
    const timerPolicy = this._holidayTimerPolicyForStatus(status);
    const taskPolicy = this._holidayTaskPolicyForStatus(status);
    if (timerPolicy === "force_off" || taskPolicy === "force_off") {
      this._forceHolidayShutdown(boiler, timer, managerMode);
    }
    if (taskPolicy !== "allow") {
      this._forceHolidayTasksOff();
    }
  }

  _forceHolidayShutdown(boiler, timer, managerMode = null) {
    const now = Date.now();
    if (now - this._lastHolidayForceOffAt < 2500) {
      return;
    }
    const isOn = this._isEntityOn(boiler);
    const legacyTimerActive = timer?.state === "active" || timer?.state === "paused";
    const builtInTimedActive = this._isBuiltInTimedMode(managerMode);
    const scheduleActive = this._isBuiltInScheduleMode(managerMode);
    const shouldForceOff = shouldForceShutdown({
      isOn,
      legacyTimerActive,
      builtInTimedActive,
      scheduleActive,
    });
    if (!shouldForceOff) {
      return;
    }
    this._lastHolidayForceOffAt = now;
    this._handleTurnOff();
  }

  _forceHolidayTasksOff() {
    const now = Date.now();
    if (now - this._lastHolidayTasksOffAt < 4000) {
      return;
    }
    const activeTaskEntities = this._taskSwitchEntities()
      .filter((taskState) => String(taskState?.state || "").toLowerCase() === "on")
      .map((taskState) => String(taskState?.entity_id || "").trim())
      .filter((entityId) => !!entityId);
    if (activeTaskEntities.length === 0) {
      return;
    }
    this._lastHolidayTasksOffAt = now;
    activeTaskEntities.forEach((entityId) => {
      this._callEntityAction("homeassistant.turn_off", entityId, null);
    });
  }

  _openImportTasksFilePicker() {
    if (!this._hasTaskImportService()) {
      return;
    }
    const input = this._elements.tasksImportFile;
    if (!input) {
      return;
    }
    input.value = "";
    // Mobile Safari/Chrome: showPicker is more reliable when available.
    try {
      if (typeof input.showPicker === "function") {
        input.showPicker();
        return;
      }
    } catch (_error) {
      // Fallback to click when showPicker is unsupported or blocked.
    }
    input.click();
  }

  async _handleImportTasksFile(event) {
    const input = event?.target;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const tasks = Array.isArray(parsed)
        ? parsed
        : (Array.isArray(parsed?.tasks) ? parsed.tasks : null);

      if (!Array.isArray(tasks)) {
        await this._showInfoModal(this._t("import_invalid_file"));
        return;
      }

      const selectedTasks = await this._openImportSelectionModal(tasks);
      if (!Array.isArray(selectedTasks)) {
        return;
      }
      if (selectedTasks.length === 0) {
        await this._showInfoModal(this._t("import_no_tasks_selected"));
        return;
      }
      const preparedImport = this._prepareImportTasks(
        selectedTasks,
        { againstExisting: this._importMode === "merge" },
      );
      if (preparedImport.tasks.length === 0) {
        await this._showInfoModal(this._t("import_no_new_tasks"));
        return;
      }

      if (this._importMode === "replace") {
        const approved = await this._openConfirmModal(this._t("import_replace_confirm"));
        if (!approved) {
          return;
        }
      }

      this._callConfiguredService(this._config.service_import_tasks, {
        ...this._builtInServiceBaseData(),
        mode: this._importMode,
        tasks: preparedImport.tasks,
      });
    } catch (_error) {
      await this._showInfoModal(this._t("import_invalid_file"));
    }
  }

  _exportTasksFromCard() {
    const tasks = this._taskSwitchEntities()
      .map((taskState) => this._taskStateToExportTask(taskState))
      .filter((task) => !!task);
    if (tasks.length === 0) {
      return;
    }

    const payload = {
      version: 1,
      exported_at: new Date().toISOString(),
      source: "boiler-water-card",
      tasks,
    };

    const jsonText = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonText], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = `boiler_tasks_${stamp}.json`;
    document.body.appendChild(link);
    try {
      link.click();
    } catch (_error) {
      // iOS fallback: open blob URL in a new tab if direct download is blocked.
      window.open(url, "_blank", "noopener");
    }
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  _taskStateToExportTask(taskState) {
    return taskStateToExportTask(taskState, {
      optionToMinutes: (option) => this._optionToMinutes(option),
      normalizeConditionOperator: (value) => this._normalizeConditionOperator(value),
    });
  }

  _normalizedDaysForExport(days) {
    return normalizedDaysForExport(days);
  }

  _normalizedMonthsForExport(months) {
    return normalizedMonthsForExport(months);
  }

  _normalizedRecurrenceForExport(value) {
    return normalizedRecurrenceForExport(value);
  }

  _changeTimerPage(direction) {
    const duration = this._hass?.states[this._config.duration_entity];
    const options = this._durationOptions(duration);
    const pageCount = this._timerPageCount(options);
    const nextPage = this._clamp(this._timerPageIndex + direction, 0, pageCount - 1);
    if (nextPage === this._timerPageIndex) {
      return;
    }

    this._timerPageIndex = nextPage;
    const selected = this._selectedDurationOption(duration, options);
    this._renderTimerGrid(options, selected);
  }

  _timerPageCount(options) {
    return timerPageCount(options, this._timerPageSize);
  }

  _setTimerPageToOption(options, option) {
    this._timerPageIndex = timerPageIndexForOption(options, option, this._timerPageSize);
  }

  _syncTimerPagerControls(pageCount) {
    if (!this._elements.timerPageControls) {
      return;
    }

    const multiPage = pageCount > 1;
    const showPager = this._menuMode === "timer" && multiPage;
    this._elements.timerPageControls.hidden = !showPager;
    if (this._elements.timerPageIndicator) {
      this._elements.timerPageIndicator.textContent = `${this._timerPageIndex + 1} / ${pageCount}`;
    }
    if (this._elements.timerPagePrevBtn) {
      this._elements.timerPagePrevBtn.disabled = !multiPage || this._timerPageIndex <= 0;
    }
    if (this._elements.timerPageNextBtn) {
      this._elements.timerPageNextBtn.disabled = !multiPage || this._timerPageIndex >= pageCount - 1;
    }
  }

  _closeTimerModal() {
    if (!this._elements.timerModal) {
      return;
    }

    this._elements.timerModal.hidden = true;
    if (!this._isAnyModalOpen()) {
      window.removeEventListener("keydown", this._handleEscapeKey);
    }
  }

  _openScheduleModal() {
    if (!this._elements.scheduleModal || !this._hasAnyTaskCreateService()) {
      return;
    }

    this._editingTaskId = null;
    this._resetScheduleForm();
    this._refreshConditionEntityOptions();
    this._refreshConditionOperatorOptions("");
    this._refreshConditionStateOptions("");
    if (this._elements.scheduleModalTitle) {
      this._elements.scheduleModalTitle.textContent = this._t("task_add_title");
    }
    this._elements.scheduleModal.hidden = false;
    this._attachEscapeListener();
    void this._fetchAndStoreHebcalCachePayload().then(() => this._refreshAfterHebcalCacheLoaded());
  }

  _closeScheduleModal() {
    if (!this._elements.scheduleModal) {
      return;
    }
    this._elements.scheduleModal.hidden = true;
    this._editingTaskId = null;
    if (!this._isAnyModalOpen()) {
      window.removeEventListener("keydown", this._handleEscapeKey);
    }
  }

  _openConfirmModal(message, { title = null, okOnly = false } = {}) {
    if (!this._elements.confirmModal) {
      return Promise.resolve(false);
    }

    this._resolveConfirmDialog(false);
    this._elements.confirmModal.hidden = false;

    if (this._elements.confirmModalTitle) {
      this._elements.confirmModalTitle.textContent = title || this._t("dialog_title");
    }
    if (this._elements.confirmModalMessage) {
      this._elements.confirmModalMessage.textContent = String(message || "");
    }
    if (this._elements.confirmCancelBtn) {
      this._elements.confirmCancelBtn.hidden = !!okOnly;
    }
    if (this._elements.confirmOkBtn) {
      this._elements.confirmOkBtn.focus({ preventScroll: true });
    }

    this._attachEscapeListener();
    return new Promise((resolve) => {
      this._confirmResolver = resolve;
    });
  }

  _resolveConfirmDialog(result) {
    if (typeof this._confirmResolver !== "function") {
      return;
    }
    const resolver = this._confirmResolver;
    this._confirmResolver = null;
    resolver(!!result);
  }

  async _showInfoModal(message, title = null) {
    await this._openConfirmModal(message, { title, okOnly: true });
  }

  _guideLocaleTag() {
    const lang = this._lang();
    if (lang === "en") {
      return "en-US";
    }
    if (lang === "ru") {
      return "ru-RU";
    }
    if (lang === "fr") {
      return "fr-FR";
    }
    return "he-IL";
  }

  _resolveIntegrationEntryId() {
    const fromConfig = String(this._config?.integration_entry_id || "").trim();
    if (fromConfig) {
      return fromConfig;
    }
    const defs = this._integrationDefaultsFromStates();
    return String(defs?.integration_entry_id || "").trim();
  }

  _integrationDefaultsFromStates() {
    const managerMode = this._boilerManagerModeEntity();
    if (!managerMode) {
      return null;
    }
    const attrs = managerMode?.attributes || {};
    const boilerEntity = String(attrs?.boiler_entity || "").trim();
    const entryId = String(attrs?.entry_id || "").trim();
    return {
      ...(boilerEntity ? { boiler_entity: boilerEntity } : {}),
      ...(entryId ? { integration_entry_id: entryId } : {}),
    };
  }

  _hebcalCacheUrl() {
    const entryId = this._resolveIntegrationEntryId();
    if (!entryId) {
      return null;
    }
    const path = `/local/boiler-card/hebcal-${encodeURIComponent(entryId)}.json`;
    try {
      return new URL(path, window.location.origin).toString();
    } catch {
      return path;
    }
  }

  async _triggerHebcalAutoRefreshIfNeeded() {
    if (!this._hass || !this._isServiceAvailable("boiler_manager.refresh_hebcal")) {
      return false;
    }
    const entryId = this._resolveIntegrationEntryId();
    if (!entryId) {
      return false;
    }
    const now = Date.now();
    if (now - this._lastHebcalAutoRefreshAt < 30000) {
      return false;
    }
    this._lastHebcalAutoRefreshAt = now;
    try {
      await this._hass.callService("boiler_manager", "refresh_hebcal", { entry_id: entryId });
      return true;
    } catch {
      return false;
    }
  }

  _sortedUpcomingHebcalWindowsFromPayload() {
    const payload = this._guideHebcalPayload;
    const windows = Array.isArray(payload?.windows) ? payload.windows : [];
    const now = Date.now();
    return windows
      .filter((w) => {
        const end = Date.parse(w?.ends_at);
        return Number.isFinite(end) && end > now;
      })
      .sort((a, b) => String(a.starts_at).localeCompare(String(b.starts_at)));
  }

  _hebcalHolidayWindowMatchesSubtype(window, holidaySubtype) {
    const mode = this._normalizeHebcalHolidayMode(holidaySubtype);
    const wp = !!window?.work_prohibited;
    if (mode === "yomtov") {
      return wp;
    }
    if (mode === "regular") {
      return !wp;
    }
    return true;
  }

  _firstListAnchorHebcalWindow(kind, holidaySubtype) {
    const want = String(kind || "").toLowerCase() === "holiday" ? "holiday" : "shabbat";
    const upcoming = this._sortedUpcomingHebcalWindowsFromPayload();
    for (const w of upcoming) {
      const wKind = String(w?.kind || "").toLowerCase() === "holiday" ? "holiday" : "shabbat";
      if (wKind !== want) {
        continue;
      }
      if (want === "holiday" && !this._hebcalHolidayWindowMatchesSubtype(w, holidaySubtype)) {
        continue;
      }
      return w;
    }
    return null;
  }

  _hebcalWindowPrimaryLabel(window) {
    const hebrew = String(window?.hebrew || "").trim();
    if (hebrew) {
      return hebrew;
    }
    const label = String(window?.label || "").trim();
    if (label) {
      return label;
    }
    const kind = String(window?.kind || "").toLowerCase() === "holiday" ? "holiday" : "shabbat";
    return kind === "holiday" ? this._t("schedule_holiday_kind_holiday") : this._t("schedule_holiday_kind_shabbat");
  }

  _hebcalTaskListHebcalCaption(attrs) {
    if (this._normalizeHebcalTriggerMode(attrs?.trigger_mode) !== "hebcal_event") {
      return "";
    }
    const eventKind = this._normalizeHebcalEventKind(attrs?.hebcal_event_kind);
    const subtype = this._normalizeHebcalHolidayMode(attrs?.hebcal_holiday_mode);
    const w =
      eventKind === "holiday"
        ? this._firstListAnchorHebcalWindow("holiday", subtype)
        : this._firstListAnchorHebcalWindow("shabbat", "all");
    const label = w ? this._hebcalWindowPrimaryLabel(w) : "";
    return label ? ` · ${label}` : "";
  }

  async _fetchAndStoreHebcalCachePayload() {
    if (this._guideHebcalPayload) {
      return this._guideHebcalPayload;
    }
    if (this._hebcalCacheInFlight) {
      return this._hebcalCacheInFlight;
    }
    const url = this._hebcalCacheUrl();
    if (!url) {
      return null;
    }
    this._hebcalCacheInFlight = (async () => {
      const fetchPayload = async () => {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          return null;
        }
        const payload = await res.json();
        return payload && typeof payload === "object" ? payload : null;
      };
      try {
        let payload = await fetchPayload();
        if (!payload) {
          const refreshed = await this._triggerHebcalAutoRefreshIfNeeded();
          if (refreshed) {
            payload = await fetchPayload();
          }
        }
        if (!payload) {
          throw new Error("hebcal_fetch_failed");
        }
        this._guideHebcalPayload = payload;
        return payload;
      } catch {
        return null;
      } finally {
        this._hebcalCacheInFlight = null;
      }
    })();
    return this._hebcalCacheInFlight;
  }

  _refreshAfterHebcalCacheLoaded() {
    this._tasksListRenderKey = "";
    if (this._elements.scheduleModal && !this._elements.scheduleModal.hidden) {
      this._syncScheduleHolidayFields();
    }
    this._syncScheduleList();
  }

  _formatHebcalInstant(iso, { withTime = true } = {}) {
    if (!iso) {
      return "—";
    }
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) {
      return "—";
    }
    const locale = this._guideLocaleTag();
    const opts = withTime
      ? { dateStyle: "medium", timeStyle: "short" }
      : { dateStyle: "medium" };
    return new Intl.DateTimeFormat(locale, opts).format(d);
  }

  _syncGuideHebcalFilterButtons() {
    const v = this._guideHebcalFilter || "all";
    const pairs = [
      ["all", this._elements.guideHebcalFilterAll],
      ["holiday", this._elements.guideHebcalFilterHoliday],
      ["shabbat", this._elements.guideHebcalFilterShabbat],
    ];
    pairs.forEach(([mode, btn]) => {
      if (!btn) {
        return;
      }
      const active = mode === v;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  _setGuideHebcalFilter(value) {
    const raw = String(value || "").toLowerCase();
    const next = raw === "holiday" || raw === "shabbat" ? raw : "all";
    this._guideHebcalFilter = next;
    this._syncGuideHebcalFilterButtons();
    if (this._guideHebcalPayload) {
      this._renderGuideHebcalList(this._guideHebcalPayload);
    }
  }

  _renderGuideHebcalList(payload) {
    const listEl = this._elements.guideHebcalList;
    if (!listEl) {
      return;
    }
    listEl.innerHTML = "";
    const now = Date.now();
    const windows = Array.isArray(payload?.windows) ? payload.windows : [];
    const sortedWindows = [...windows]
      .filter((w) => Number.isFinite(Date.parse(w?.starts_at)))
      .sort((a, b) => String(a.starts_at).localeCompare(String(b.starts_at)));
    const upcoming = sortedWindows
      .filter((w) => {
        const end = Date.parse(w?.ends_at);
        return Number.isFinite(end) && end > now;
      });
    const usingPastFallback = upcoming.length === 0 && sortedWindows.length > 0;
    const sourceRows = upcoming.length > 0 ? upcoming : sortedWindows;
    const filter = this._guideHebcalFilter || "all";
    const rows =
      filter === "all"
        ? sourceRows
        : sourceRows.filter((w) => {
            const k = String(w?.kind || "").toLowerCase() === "holiday" ? "holiday" : "shabbat";
            return filter === "holiday" ? k === "holiday" : k === "shabbat";
          });

    const statusEl = this._elements.guideHebcalStatus;
    const cityEl = this._elements.guideHebcalCity;
    if (cityEl) {
      const city = String(payload?.city || "").trim();
      if (city) {
        cityEl.textContent = this._t("guide_hebcal_city").replace("{city}", city);
        cityEl.hidden = false;
      } else {
        cityEl.textContent = "";
        cityEl.hidden = true;
      }
    }

    if (rows.length === 0) {
      if (statusEl) {
        statusEl.textContent = this._t("guide_hebcal_empty");
        statusEl.hidden = false;
      }
      this._syncGuideHebcalFilterButtons();
      return;
    }

    if (statusEl) {
      if (usingPastFallback) {
        statusEl.textContent = this._t("guide_hebcal_using_history");
        statusEl.hidden = false;
      } else {
        statusEl.hidden = true;
        statusEl.textContent = "";
      }
    }

    rows.forEach((w) => {
      const kind = String(w?.kind || "").toLowerCase() === "holiday" ? "holiday" : "shabbat";
      const row = document.createElement("div");
      row.className = "guide-hebcal-row";

      const badge = document.createElement("span");
      badge.className = `guide-hebcal-badge kind-${kind}`;
      badge.textContent = kind === "holiday"
        ? this._t("schedule_holiday_kind_holiday")
        : this._t("schedule_holiday_kind_shabbat");

      const title = document.createElement("div");
      title.className = "guide-hebcal-row-title";
      title.textContent = String(w?.label || "").trim()
        || (kind === "holiday" ? this._t("schedule_holiday_kind_holiday") : this._t("schedule_holiday_kind_shabbat"));

      row.appendChild(badge);
      row.appendChild(title);

      const hebrew = String(w?.hebrew || "").trim();
      if (hebrew) {
        const hEl = document.createElement("div");
        hEl.className = "guide-hebcal-row-hebrew";
        hEl.textContent = hebrew;
        row.appendChild(hEl);
      }

      const dates = document.createElement("div");
      dates.className = "guide-hebcal-row-dates";
      const withTime = kind === "shabbat";
      const start = this._formatHebcalInstant(w?.starts_at, { withTime });
      const end = this._formatHebcalInstant(w?.ends_at, { withTime });
      dates.textContent = `${this._t("task_start")}: ${start}\n${this._t("task_end")}: ${end}`;

      row.appendChild(dates);
      listEl.appendChild(row);
    });
    this._syncGuideHebcalFilterButtons();
  }

  async _loadGuideHebcalPanel() {
    const listEl = this._elements.guideHebcalList;
    const statusEl = this._elements.guideHebcalStatus;
    if (!listEl) {
      return;
    }
    const url = this._hebcalCacheUrl();
    if (!url) {
      if (statusEl) {
        statusEl.textContent = this._t("guide_hebcal_no_entry");
        statusEl.hidden = false;
      }
      listEl.innerHTML = "";
      if (this._elements.guideHebcalCity) {
        this._elements.guideHebcalCity.hidden = true;
        this._elements.guideHebcalCity.textContent = "";
      }
      this._guideHebcalPayload = null;
      return;
    }
    if (this._guideHebcalPayload) {
      if (statusEl) {
        statusEl.hidden = true;
        statusEl.textContent = "";
      }
      this._renderGuideHebcalList(this._guideHebcalPayload);
      return;
    }
    if (statusEl) {
      statusEl.textContent = this._t("guide_hebcal_loading");
      statusEl.hidden = false;
    }
    listEl.innerHTML = "";
    if (this._elements.guideHebcalCity) {
      this._elements.guideHebcalCity.hidden = true;
      this._elements.guideHebcalCity.textContent = "";
    }
    const payload = await this._fetchAndStoreHebcalCachePayload();
    if (this._guideModalTab !== "hebcal") {
      return;
    }
    if (payload) {
      if (statusEl) {
        statusEl.hidden = true;
        statusEl.textContent = "";
      }
      this._renderGuideHebcalList(payload);
      this._refreshAfterHebcalCacheLoaded();
    } else {
      this._guideHebcalPayload = null;
      if (statusEl) {
        statusEl.textContent = this._t("guide_hebcal_fetch_error");
        statusEl.hidden = false;
      }
      listEl.innerHTML = "";
      if (this._elements.guideHebcalCity) {
        this._elements.guideHebcalCity.hidden = true;
      }
    }
  }

  _setGuideModalTab(tab) {
    const next = tab === "hebcal" ? "hebcal" : "manual";
    this._guideModalTab = next;
    const manualPanel = this._elements.guidePanelManual;
    const hebcalPanel = this._elements.guidePanelHebcal;
    const manualBtn = this._elements.guideTabManualBtn;
    const hebcalBtn = this._elements.guideTabHebcalBtn;
    if (manualPanel) {
      manualPanel.hidden = next !== "manual";
    }
    if (hebcalPanel) {
      hebcalPanel.hidden = next !== "hebcal";
    }
    manualBtn?.classList.toggle("active", next === "manual");
    hebcalBtn?.classList.toggle("active", next === "hebcal");
    if (next === "manual") {
      this._renderGuideProfileCards();
    }
    if (next === "hebcal") {
      this._loadGuideHebcalPanel();
    }
  }

  _openGuideModal() {
    if (!this._elements.guideModal) {
      return;
    }
    this._elements.guideModal.hidden = false;
    this._renderGuideProfileCards();
    if (this._elements.guidePanelManualText) {
      this._elements.guidePanelManualText.textContent = this._t("guide_content");
    }
    if (this._elements.guideModalTitle) {
      this._elements.guideModalTitle.textContent = this._t("guide_title");
    }
    this._setGuideModalTab("manual");
    this._attachEscapeListener();
  }

  _closeGuideModal() {
    if (!this._elements.guideModal) {
      return;
    }
    this._elements.guideModal.hidden = true;
    if (!this._isAnyModalOpen()) {
      window.removeEventListener("keydown", this._handleEscapeKey);
    }
  }

  _renderGuideProfileCards() {
    const mount = this._elements.guideProfileGrid;
    if (!mount) {
      return;
    }
    const cards = [
      {
        image: "/local/boiler-card/boiler-flow.png",
        title: this._t("guide_profile_standard_title"),
        desc: this._t("guide_profile_standard_desc"),
      },
      {
        image: "/local/boiler-card/switcher-touch.png",
        title: this._t("guide_profile_switcher_title"),
        desc: this._t("guide_profile_switcher_desc"),
      },
      {
        image: "/local/boiler-card/boiler-smarthome4u.png",
        title: this._t("guide_profile_smarthome_title"),
        desc: this._t("guide_profile_smarthome_desc"),
      },
    ];
    mount.innerHTML = cards.map((item) => `
      <div class="guide-profile-card">
        <span class="guide-profile-thumb" aria-hidden="true"><img src="${item.image}" alt=""></span>
        <span>
          <p class="guide-profile-title">${item.title}</p>
          <p class="guide-profile-desc">${item.desc}</p>
        </span>
      </div>
    `).join("");
  }

  _closeConfirmModal(result = false) {
    if (!this._elements.confirmModal) {
      return;
    }
    this._elements.confirmModal.hidden = true;
    this._resolveConfirmDialog(result);
    if (!this._isAnyModalOpen()) {
      window.removeEventListener("keydown", this._handleEscapeKey);
    }
  }

  _openImportSelectionModal(tasks) {
    if (!this._elements.importSelectModal || !this._elements.importSelectList) {
      return Promise.resolve(Array.isArray(tasks) ? tasks : null);
    }

    this._resolveImportSelectionDialog(null);
    const normalizedTasks = Array.isArray(tasks) ? tasks : [];
    this._pendingImportTasks = normalizedTasks;
    this._elements.importSelectList.innerHTML = "";

    normalizedTasks.forEach((task, index) => {
      const row = document.createElement("label");
      row.className = "import-select-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "import-select-checkbox";
      checkbox.checked = true;
      checkbox.dataset.importIndex = String(index);

      const textWrap = document.createElement("div");
      const title = document.createElement("div");
      title.className = "import-select-item-title";
      title.textContent = this._importTaskDisplayName(task, index + 1);

      const subtitle = document.createElement("div");
      subtitle.className = "import-select-item-subtitle";
      subtitle.textContent = this._importTaskDisplaySubtitle(task);

      textWrap.appendChild(title);
      textWrap.appendChild(subtitle);
      row.appendChild(checkbox);
      row.appendChild(textWrap);
      this._elements.importSelectList.appendChild(row);
    });

    this._elements.importSelectModal.hidden = false;
    this._attachEscapeListener();
    this._elements.importSelectOkBtn?.focus({ preventScroll: true });
    return new Promise((resolve) => {
      this._importSelectionResolver = resolve;
    });
  }

  _importTaskDisplayName(task, fallbackIndex) {
    return importTaskDisplayName(task, fallbackIndex, this._t.bind(this));
  }

  _importTaskDisplaySubtitle(task) {
    return importTaskDisplaySubtitle(task, this._t.bind(this));
  }

  _setImportSelectionChecked(checked) {
    const list = this._elements.importSelectList;
    if (!list) {
      return;
    }
    const boxes = list.querySelectorAll("input.import-select-checkbox[type=\"checkbox\"]");
    boxes.forEach((box) => {
      box.checked = !!checked;
    });
  }

  _closeImportSelectionModal(approved = false) {
    if (!this._elements.importSelectModal) {
      return;
    }
    this._elements.importSelectModal.hidden = true;
    if (!approved) {
      this._resolveImportSelectionDialog(null);
    } else {
      const list = this._elements.importSelectList;
      const selectedIndexes = Array.from(
        list?.querySelectorAll("input.import-select-checkbox[type=\"checkbox\"]:checked") || [],
      ).map((el) => Number.parseInt(el.dataset.importIndex || "-1", 10))
        .filter((index) => Number.isInteger(index) && index >= 0);
      this._resolveImportSelectionDialog(selectedIndexes);
    }

    if (!this._isAnyModalOpen()) {
      window.removeEventListener("keydown", this._handleEscapeKey);
    }
  }

  _resolveImportSelectionDialog(selectedIndexes) {
    if (typeof this._importSelectionResolver !== "function") {
      this._pendingImportTasks = null;
      return;
    }
    const resolver = this._importSelectionResolver;
    this._importSelectionResolver = null;
    if (!Array.isArray(selectedIndexes)) {
      this._pendingImportTasks = null;
      resolver(null);
      return;
    }

    const selectedSet = new Set(selectedIndexes);
    const selectedTasks = Array.isArray(this._pendingImportTasks)
      ? this._pendingImportTasks.filter((_task, index) => selectedSet.has(index))
      : [];
    this._pendingImportTasks = null;
    resolver(selectedTasks);
  }

  _prepareImportTasks(tasks, { againstExisting = false } = {}) {
    const inputTasks = Array.isArray(tasks) ? tasks : [];
    const existingKeys = new Set();
    if (againstExisting) {
      this._taskSwitchEntities().forEach((taskState) => {
        const key = this._taskDuplicateKeyFromPayload(taskState?.attributes || {});
        if (key) {
          existingKeys.add(key);
        }
      });
    }

    const importKeys = new Set();
    const filteredTasks = [];
    inputTasks.forEach((task) => {
      const key = this._taskDuplicateKeyFromPayload(task);
      if (!key) {
        filteredTasks.push(task);
        return;
      }
      if (existingKeys.has(key) || importKeys.has(key)) {
        return;
      }
      importKeys.add(key);
      filteredTasks.push(task);
    });

    return { tasks: filteredTasks };
  }

  _isAnyModalOpen() {
    return !!(
      (this._elements.timerModal && !this._elements.timerModal.hidden)
      || (this._elements.scheduleModal && !this._elements.scheduleModal.hidden)
      || (this._elements.confirmModal && !this._elements.confirmModal.hidden)
      || (this._elements.importSelectModal && !this._elements.importSelectModal.hidden)
      || (this._elements.guideModal && !this._elements.guideModal.hidden)
    );
  }

  _attachEscapeListener() {
    window.removeEventListener("keydown", this._handleEscapeKey);
    window.addEventListener("keydown", this._handleEscapeKey);
  }

  _wireScheduleClearButtons() {
    const bindClear = (button, field) => {
      button?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this._clearScheduleField(field);
      });
    };

    bindClear(this._elements.scheduleNameClearBtn, "name");
    bindClear(this._elements.scheduleStartClearBtn, "start_time");
    bindClear(this._elements.scheduleEndClearBtn, "end_time");
    bindClear(this._elements.scheduleStartDateClearBtn, "start_date");
    bindClear(this._elements.scheduleEndDateClearBtn, "end_date");
    bindClear(this._elements.scheduleConditionEntityClearBtn, "condition_entity");
    bindClear(this._elements.scheduleConditionOperatorClearBtn, "condition_operator");
    bindClear(this._elements.scheduleConditionStateClearBtn, "condition_state");
  }

  _clearScheduleField(field) {
    const key = String(field || "").trim().toLowerCase();

    if (key === "name" && this._elements.scheduleNameInput) {
      this._elements.scheduleNameInput.value = "";
      this._elements.scheduleNameInput.focus({ preventScroll: true });
      return;
    }

    if (key === "start_time" && this._elements.scheduleStartInput) {
      this._elements.scheduleStartInput.value = "";
      this._elements.scheduleStartInput.focus({ preventScroll: true });
      return;
    }

    if (key === "end_time" && this._elements.scheduleEndInput) {
      this._elements.scheduleEndInput.value = "";
      this._elements.scheduleEndInput.focus({ preventScroll: true });
      return;
    }

    if (key === "start_date" && this._elements.scheduleStartDateInput) {
      this._elements.scheduleStartDateInput.value = "";
      this._elements.scheduleStartDateInput.focus({ preventScroll: true });
      return;
    }

    if (key === "end_date" && this._elements.scheduleEndDateInput) {
      this._elements.scheduleEndDateInput.value = "";
      this._elements.scheduleEndDateInput.focus({ preventScroll: true });
      return;
    }

    if (key === "condition_entity" && this._elements.scheduleConditionEntityInput) {
      this._elements.scheduleConditionEntityInput.value = "";
      if (this._elements.scheduleConditionOperatorInput) {
        this._elements.scheduleConditionOperatorInput.value = "eq";
      }
      if (this._elements.scheduleConditionStateInput) {
        this._elements.scheduleConditionStateInput.value = "";
      }
      this._refreshConditionEntityOptions("");
      this._refreshConditionOperatorOptions("");
      this._refreshConditionStateOptions("");
      this._elements.scheduleConditionEntityInput.focus({ preventScroll: true });
      return;
    }

    if (key === "condition_operator" && this._elements.scheduleConditionOperatorInput) {
      this._elements.scheduleConditionOperatorInput.value = "eq";
      this._refreshConditionOperatorOptions();
      this._refreshConditionStateOptions();
      this._elements.scheduleConditionOperatorInput.focus({ preventScroll: true });
      return;
    }

    if (key === "condition_state" && this._elements.scheduleConditionStateInput) {
      this._elements.scheduleConditionStateInput.value = "";
      this._elements.scheduleConditionStateInput.focus({ preventScroll: true });
    }
  }

  _renderScheduleDayButtons() {
    const container = this._elements.scheduleDays;
    if (!container) {
      return;
    }

    container.innerHTML = "";
    this._dayOrder().forEach((day) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "schedule-day";
      button.dataset.day = String(day);
      button.addEventListener("click", () => button.classList.toggle("selected"));
      container.appendChild(button);
    });
    this._updateScheduleDayLabels();
  }

  _renderScheduleMonthButtons() {
    const container = this._elements.scheduleMonths;
    if (!container) {
      return;
    }

    container.innerHTML = "";
    for (let month = 1; month <= 12; month += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "schedule-month";
      button.dataset.month = String(month);
      button.addEventListener("click", () => button.classList.toggle("selected"));
      container.appendChild(button);
    }
    this._updateScheduleMonthLabels();
  }

  _updateScheduleDayLabels() {
    const dayButtons = Array.from(this.shadowRoot.querySelectorAll(".schedule-day"));
    dayButtons.forEach((button) => {
      const day = Number.parseInt(button.dataset.day || "", 10);
      button.textContent = this._dayLabel(day);
    });
  }

  _formatScheduleDays(days) {
    return formatScheduleDays(days, this._lang(), this._t.bind(this));
  }

  _dayOrder() {
    return dayOrderForLanguage(this._lang());
  }

  _dayLabel(day) {
    return dayLabel(day, this._t.bind(this));
  }

  _updateScheduleMonthLabels() {
    const monthButtons = Array.from(this.shadowRoot.querySelectorAll(".schedule-month"));
    monthButtons.forEach((button, index) => {
      button.textContent = String(index + 1);
    });
  }

  _refreshConditionEntityOptions(query = null) {
    const list = this._elements.scheduleConditionEntityList;
    if (!list || !this._hass?.states) {
      return;
    }

    const resolvedQuery = String(
      query ?? this._elements.scheduleConditionEntityInput?.value ?? ""
    ).trim();
    const options = this._matchingConditionEntities(resolvedQuery);

    list.innerHTML = "";
    options.forEach((entityId) => {
      const option = document.createElement("option");
      option.value = entityId;
      list.appendChild(option);
    });
  }

  _allConditionEntities() {
    return allConditionEntitiesFromStates(this._hass?.states);
  }

  _matchingConditionEntities(query = "") {
    return matchingConditionEntities(this._allConditionEntities(), query);
  }

  _onConditionEntityInputChanged() {
    const input = this._elements.scheduleConditionEntityInput;
    if (!input) {
      return;
    }

    const rawValue = String(input.value || "").trim();
    this._refreshConditionEntityOptions(rawValue);

    if (rawValue) {
      const matches = this._matchingConditionEntities(rawValue);
      if (matches.length === 1) {
        const match = matches[0];
        const rawLower = rawValue.toLowerCase();
        if (match.toLowerCase().startsWith(rawLower) && match.length > rawValue.length) {
          input.value = match;
          try {
            input.setSelectionRange(rawValue.length, match.length);
          } catch (_error) {
            // Selection range may fail on some mobile browsers; autocomplete text still helps.
          }
        }
      }
    }

    const entityId = String(input.value || "").trim();
    this._refreshConditionOperatorOptions(entityId);
    this._refreshConditionStateOptions(entityId);
  }

  _onConditionEntityChanged() {
    const input = this._elements.scheduleConditionEntityInput;
    const entityId = String(input?.value || "").trim();
    const matches = this._matchingConditionEntities(entityId);
    const exact = matches.find((candidate) => candidate.toLowerCase() === entityId.toLowerCase()) || null;
    const bestMatch = exact || (matches.length === 1 ? matches[0] : null);
    if (bestMatch && input) {
      input.value = bestMatch;
    }

    const resolvedEntity = bestMatch || entityId;
    this._refreshConditionEntityOptions(resolvedEntity);
    this._refreshConditionOperatorOptions(resolvedEntity);
    this._refreshConditionStateOptions(resolvedEntity);
    const stateInput = this._elements.scheduleConditionStateInput;
    if (!stateInput) {
      return;
    }

    const hasEntity = entityId.includes(".");
    const currentState = String(stateInput.value || "").trim();
    if (hasEntity && !currentState) {
      const operator = this._normalizeConditionOperator(this._elements.scheduleConditionOperatorInput?.value);
      const suggestions = this._conditionStateSuggestionsForEntity(entityId, operator);
      stateInput.value = suggestions[0] || (operator === "eq" ? "on" : "0");
    }
  }

  _onConditionOperatorChanged() {
    this._refreshConditionStateOptions();
  }

  _refreshConditionOperatorOptions(entityId = null) {
    const select = this._elements.scheduleConditionOperatorInput;
    if (!select) {
      return;
    }

    const resolvedEntityId = String(
      entityId ?? this._elements.scheduleConditionEntityInput?.value ?? ""
    ).trim();
    const operatorOptions = this._conditionOperatorOptionsForEntity(resolvedEntityId);
    const currentValue = this._normalizeConditionOperator(select.value);
    const nextValue = operatorOptions.includes(currentValue) ? currentValue : operatorOptions[0];

    select.innerHTML = "";
    operatorOptions.forEach((operator) => {
      const option = document.createElement("option");
      option.value = operator;
      option.textContent = this._conditionOperatorLabel(operator);
      if (operator === nextValue) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    if (select.options.length > 0 && select.selectedIndex < 0) {
      select.selectedIndex = 0;
    }
  }

  _refreshConditionStateOptions(entityId = null) {
    const input = this._elements.scheduleConditionStateInput;
    const list = this._elements.scheduleConditionStateList;
    if (!input || !list) {
      return;
    }

    const resolvedEntityId = String(
      entityId ?? this._elements.scheduleConditionEntityInput?.value ?? ""
    ).trim();
    const operator = this._normalizeConditionOperator(this._elements.scheduleConditionOperatorInput?.value);
    const suggestions = this._conditionStateSuggestionsForEntity(resolvedEntityId, operator);
    const currentValue = String(input.value || "").trim();
    const options = [...suggestions];
    if (currentValue && !options.includes(currentValue)) {
      options.unshift(currentValue);
    }
    if (options.length === 0) {
      options.push(operator === "eq" ? "on" : "0");
    }

    list.innerHTML = "";
    options.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      list.appendChild(option);
    });

    if (!currentValue && resolvedEntityId.includes(".")) {
      input.value = options[0] || (operator === "eq" ? "on" : "0");
    }
    input.placeholder = options[0] || this._t("condition_state_placeholder");
  }

  _normalizeConditionOperator(value) {
    const normalized = String(value || "").trim().toLowerCase();
    const aliases = {
      "": "eq",
      "=": "eq",
      "==": "eq",
      eq: "eq",
      ">": "gt",
      gt: "gt",
      "<": "lt",
      lt: "lt",
      ">=": "gte",
      gte: "gte",
      "<=": "lte",
      lte: "lte",
    };
    return aliases[normalized] || "eq";
  }

  _conditionOperatorLabel(operator) {
    const normalized = this._normalizeConditionOperator(operator);
    const map = {
      eq: this._t("condition_op_eq"),
      gt: this._t("condition_op_gt"),
      lt: this._t("condition_op_lt"),
      gte: this._t("condition_op_gte"),
      lte: this._t("condition_op_lte"),
    };
    return map[normalized] || this._t("condition_op_eq");
  }

  _conditionOperatorOptionsForEntity(entityId) {
    if (!this._isNumericConditionEntity(entityId)) {
      return ["eq"];
    }
    return ["eq", "gt", "lt", "gte", "lte"];
  }

  _isNumericConditionEntity(entityId) {
    const normalizedEntityId = String(entityId || "").trim();
    if (!normalizedEntityId || !normalizedEntityId.includes(".")) {
      return false;
    }

    const [domain] = normalizedEntityId.split(".", 1);
    const normalizedDomain = String(domain || "").toLowerCase();
    if (["sensor", "number", "input_number"].includes(normalizedDomain)) {
      return true;
    }

    const state = String(this._hass?.states?.[normalizedEntityId]?.state || "").trim();
    const numeric = Number.parseFloat(state);
    return Number.isFinite(numeric);
  }

  _conditionStateSuggestionsForEntity(entityId, operator = null) {
    const normalizedOperator = this._normalizeConditionOperator(operator);
    const normalizedEntityId = String(entityId || "").trim();
    if (!normalizedEntityId || !normalizedEntityId.includes(".")) {
      return normalizedOperator === "eq" ? ["on", "off"] : ["0"];
    }

    const [domain] = normalizedEntityId.split(".", 1);
    const normalizedDomain = String(domain || "").toLowerCase();
    const entity = this._hass?.states?.[normalizedEntityId] || null;
    const attrs = entity?.attributes || {};
    const suggestions = [];
    const seen = new Set();
    const add = (value) => {
      const normalizedValue = String(value || "").trim();
      if (!normalizedValue || seen.has(normalizedValue)) {
        return;
      }
      seen.add(normalizedValue);
      suggestions.push(normalizedValue);
    };

    if (normalizedOperator !== "eq") {
      const currentNumeric = Number.parseFloat(String(entity?.state || "").trim());
      if (Number.isFinite(currentNumeric)) {
        add(String(currentNumeric));
      }
      const min = Number.parseFloat(String(attrs?.min ?? ""));
      const max = Number.parseFloat(String(attrs?.max ?? ""));
      if (Number.isFinite(min)) {
        add(String(min));
      }
      if (Number.isFinite(max)) {
        add(String(max));
      }
      return suggestions.length > 0 ? suggestions : ["0"];
    }

    const domainDefaults = {
      light: ["on", "off"],
      switch: ["on", "off"],
      input_boolean: ["on", "off"],
      binary_sensor: ["on", "off"],
      fan: ["on", "off"],
      humidifier: ["on", "off"],
      timer: ["active", "paused", "idle"],
      cover: ["open", "closed", "opening", "closing"],
      lock: ["locked", "unlocked", "locking", "unlocking"],
      person: ["home", "not_home"],
      device_tracker: ["home", "not_home"],
      sun: ["above_horizon", "below_horizon"],
      media_player: ["on", "off", "playing", "paused", "idle", "standby"],
      vacuum: ["cleaning", "docked", "idle", "paused", "error", "returning"],
      climate: ["off", "heat", "cool", "heat_cool", "auto", "dry", "fan_only"],
      alarm_control_panel: [
        "disarmed",
        "armed_home",
        "armed_away",
        "armed_night",
        "armed_vacation",
        "arming",
        "pending",
        "triggered",
      ],
    };
    (domainDefaults[normalizedDomain] || []).forEach(add);

    add(entity?.state);

    [
      "options",
      "hvac_modes",
      "preset_modes",
      "fan_modes",
      "swing_modes",
      "operation_list",
      "effect_list",
      "source_list",
    ].forEach((attrKey) => {
      const values = attrs?.[attrKey];
      if (!Array.isArray(values)) {
        return;
      }
      values.forEach(add);
    });

    return suggestions;
  }

  _availableTimelineDurationOptions() {
    const durationEntity = this._hass?.states?.[this._config.duration_entity];
    return this._durationOptions(durationEntity)
      .filter((option) => !this._isNoTimerOption(option))
      .filter((option) => (this._optionToMinutes(option) || 0) > 0);
  }

  _fillTimelineDurationSelect(select, selectedOption = null) {
    if (!select) {
      return;
    }

    const options = this._availableTimelineDurationOptions();
    select.innerHTML = "";
    options.forEach((option) => {
      const item = document.createElement("option");
      item.value = option;
      item.textContent = this._renderOptionLabel(option);
      if (selectedOption && selectedOption === option) {
        item.selected = true;
      }
      select.appendChild(item);
    });
    if (select.options.length > 0 && select.selectedIndex < 0) {
      select.selectedIndex = 0;
    }
  }

  _resetTimelinePoints() {
    const container = this._elements.timelinePoints;
    if (!container) {
      return;
    }
    container.innerHTML = "";
    this._addTimelinePointRow();
  }

  _setTimelinePoints(points) {
    const container = this._elements.timelinePoints;
    if (!container) {
      return;
    }
    container.innerHTML = "";
    if (!Array.isArray(points) || points.length === 0) {
      this._addTimelinePointRow();
      return;
    }
    points.forEach((point) => this._addTimelinePointRow(point));
  }

  _addTimelinePointRow(point = null) {
    const container = this._elements.timelinePoints;
    if (!container) {
      return;
    }

    const row = document.createElement("div");
    row.className = "timeline-point-row";

    const atInput = document.createElement("input");
    atInput.type = "time";
    atInput.className = "schedule-input schedule-time-input timeline-point-time";
    atInput.setAttribute("dir", "ltr");
    atInput.value = point?.at || "06:00";

    const durationSelect = document.createElement("select");
    durationSelect.className = "schedule-select timeline-point-duration";
    this._fillTimelineDurationSelect(durationSelect, point?.duration_option || null);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "timeline-point-remove";
    removeBtn.textContent = this._t("timeline_remove_point");
    removeBtn.addEventListener("click", () => {
      const rows = Array.from(container.querySelectorAll(".timeline-point-row"));
      if (rows.length <= 1) {
        return;
      }
      row.remove();
    });

    row.appendChild(atInput);
    row.appendChild(durationSelect);
    row.appendChild(removeBtn);
    container.appendChild(row);
  }

  _collectTimelinePoints() {
    const rows = Array.from(this.shadowRoot.querySelectorAll(".timeline-point-row"));
    return rows
      .map((row) => {
        const at = String(row.querySelector(".timeline-point-time")?.value || "").trim();
        const durationOption = String(row.querySelector(".timeline-point-duration")?.value || "").trim();
        const durationMinutes = this._optionToMinutes(durationOption);
        if (!at || !durationOption || !durationMinutes || durationMinutes <= 0) {
          return null;
        }
        return {
          at,
          duration_option: durationOption,
          duration_minutes: durationMinutes,
        };
      })
      .filter((item) => !!item)
      .sort((a, b) => a.at.localeCompare(b.at));
  }

  _setSelectedScheduleDays(days) {
    const selected = new Set(
      Array.isArray(days)
        ? days
            .map((day) => Number.parseInt(day, 10))
            .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
        : [0, 1, 2, 3, 4, 5, 6]
    );
    const dayButtons = Array.from(this.shadowRoot.querySelectorAll(".schedule-day"));
    dayButtons.forEach((button) => {
      const day = Number.parseInt(button.dataset.day || "", 10);
      button.classList.toggle("selected", selected.has(day));
    });
  }

  _setSelectedScheduleMonths(months) {
    const selected = new Set(
      Array.isArray(months)
        ? months
            .map((month) => Number.parseInt(month, 10))
            .filter((month) => Number.isInteger(month) && month >= 1 && month <= 12)
        : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    );
    const monthButtons = Array.from(this.shadowRoot.querySelectorAll(".schedule-month"));
    monthButtons.forEach((button) => {
      const month = Number.parseInt(button.dataset.month || "", 10);
      button.classList.toggle("selected", selected.has(month));
    });
  }

  _openScheduleModalForTask(taskState) {
    if (!this._elements.scheduleModal || !this._hasScheduleUpdateService()) {
      return;
    }
    const attrs = taskState?.attributes || {};
    const taskId = String(attrs.task_id || "").trim();
    if (!taskId) {
      return;
    }

    this._editingTaskId = taskId;
    this._resetScheduleForm();
    this._refreshConditionEntityOptions();

    if (this._elements.scheduleModalTitle) {
      this._elements.scheduleModalTitle.textContent = this._t("task_edit_title");
    }
    if (this._elements.scheduleNameInput) {
      this._elements.scheduleNameInput.value = String(attrs.task_name || attrs.friendly_name || "").trim();
    }

    const taskType = String(attrs.task_type || "window").toLowerCase() === "timeline" ? "timeline" : "window";
    this._setScheduleType(taskType);

    if (taskType === "timeline") {
      this._setTimelinePoints(Array.isArray(attrs.timeline_points) ? attrs.timeline_points : []);
    } else {
      if (this._elements.scheduleStartInput) {
        this._elements.scheduleStartInput.value = String(attrs.start_time || "10:00");
      }
      if (this._elements.scheduleEndInput) {
        this._elements.scheduleEndInput.value = String(attrs.end_time || "12:00");
      }
    }

    this._setScheduleRecurrence(String(attrs.recurrence || "forever").toLowerCase());
    if (this._elements.scheduleStartDateInput) {
      this._elements.scheduleStartDateInput.value = String(attrs.start_date || "");
    }
    if (this._elements.scheduleEndDateInput) {
      this._elements.scheduleEndDateInput.value = String(attrs.end_date || "");
    }
    if (this._elements.scheduleConditionEntityInput) {
      this._elements.scheduleConditionEntityInput.value = String(attrs.condition_entity || "").trim();
    }
    if (this._elements.scheduleConditionOperatorInput) {
      this._elements.scheduleConditionOperatorInput.value = this._normalizeConditionOperator(attrs.condition_operator);
    }
    this._refreshConditionOperatorOptions(String(attrs.condition_entity || "").trim());
    if (this._elements.scheduleConditionStateInput) {
      this._elements.scheduleConditionStateInput.value = String(attrs.skip_if_state || "").trim();
    }
    if (this._elements.scheduleHolidayTriggerModeInput) {
      this._elements.scheduleHolidayTriggerModeInput.value = this._normalizeHebcalTriggerMode(attrs.trigger_mode);
    }
    if (this._elements.scheduleHolidayKindInput) {
      this._elements.scheduleHolidayKindInput.value = this._normalizeHebcalEventKind(attrs.hebcal_event_kind);
    }
    if (this._elements.scheduleHolidayPhaseInput) {
      this._elements.scheduleHolidayPhaseInput.value = this._normalizeHebcalEventPhase(attrs.hebcal_event_phase);
    }
    if (this._elements.scheduleHolidaySubtypeInput) {
      this._elements.scheduleHolidaySubtypeInput.value = this._normalizeHebcalHolidayMode(attrs.hebcal_holiday_mode);
    }
    this._applyHebcalOffsetUiFromTotalMinutes(attrs.hebcal_offset_minutes);
    if (this._elements.scheduleEndTimerSelect) {
      const startForDuration = String(attrs.start_time || "").trim();
      const endForDuration = String(attrs.end_time || "").trim();
      const startMatch = startForDuration.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
      const endMatch = endForDuration.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
      if (startMatch && endMatch) {
        const startTotal = Number.parseInt(startMatch[1], 10) * 60 + Number.parseInt(startMatch[2], 10);
        let endTotal = Number.parseInt(endMatch[1], 10) * 60 + Number.parseInt(endMatch[2], 10);
        if (endTotal <= startTotal) {
          endTotal += 24 * 60;
        }
        const durationMinutes = endTotal - startTotal;
        const durationOption = this._optionByMinutes(durationMinutes, this._availableTimelineDurationOptions());
        if (durationOption) {
          this._elements.scheduleEndTimerSelect.value = durationOption;
        }
      }
    }
    this._refreshConditionStateOptions(String(attrs.condition_entity || "").trim());

    this._setSelectedScheduleDays(attrs.days);
    this._setSelectedScheduleMonths(attrs.months);
    this._syncScheduleRecurrenceFields();
    this._syncScheduleHolidayFields();
    this._syncScheduleEditorCategoryUi();
    this._syncScheduleSectionToggles();
    this._elements.scheduleModal.hidden = false;
    this._attachEscapeListener();
    void this._fetchAndStoreHebcalCachePayload().then(() => this._refreshAfterHebcalCacheLoaded());
  }

  _setScheduleType(type) {
    const normalizedInput = String(type || "window").toLowerCase();
    const normalizedType = normalizedInput === "timeline" ? "timeline" : "window";
    if (this._elements.scheduleTypeInput) {
      this._elements.scheduleTypeInput.value = normalizedType;
    }
    if (this._elements.scheduleHolidayTriggerModeInput) {
      this._elements.scheduleHolidayTriggerModeInput.value = normalizedInput === "holiday" ? "hebcal_event" : "schedule";
    }
    this._syncScheduleTypeFields();
  }

  _setSchedulePanel(panel) {
    const normalized = ["recurrence", "days", "months"].includes(String(panel || "").toLowerCase())
      ? String(panel).toLowerCase()
      : "recurrence";
    this._schedulePanel = normalized;

    if (this._elements.schedulePanelRecurrenceBtn) {
      const active = normalized === "recurrence";
      this._elements.schedulePanelRecurrenceBtn.classList.toggle("active", active);
      this._elements.schedulePanelRecurrenceBtn.setAttribute("aria-pressed", active ? "true" : "false");
    }
    if (this._elements.schedulePanelDaysBtn) {
      const active = normalized === "days";
      this._elements.schedulePanelDaysBtn.classList.toggle("active", active);
      this._elements.schedulePanelDaysBtn.setAttribute("aria-pressed", active ? "true" : "false");
    }
    if (this._elements.schedulePanelMonthsBtn) {
      const active = normalized === "months";
      this._elements.schedulePanelMonthsBtn.classList.toggle("active", active);
      this._elements.schedulePanelMonthsBtn.setAttribute("aria-pressed", active ? "true" : "false");
    }

    if (this._elements.schedulePanelRecurrence) {
      this._elements.schedulePanelRecurrence.hidden = normalized !== "recurrence";
    }
    if (this._elements.schedulePanelDays) {
      this._elements.schedulePanelDays.hidden = normalized !== "days";
    }
    if (this._elements.schedulePanelMonths) {
      this._elements.schedulePanelMonths.hidden = normalized !== "months";
    }
    this._syncScheduleEditorCategoryUi();
  }

  _setScheduleEditorCategory(category) {
    const normalized = ["time", "recurrence", "conditions"].includes(String(category || "").toLowerCase())
      ? String(category).toLowerCase()
      : "time";
    this._scheduleEditorCategory = normalized;
    if (normalized === "conditions") {
      this._setSchedulePanel("recurrence");
    }
    if (normalized === "recurrence") {
      this._setSchedulePanel(this._schedulePanel === "months" ? "months" : "days");
    } else if (normalized === "time") {
      this._setSchedulePanel("recurrence");
    } else if (normalized === "conditions") {
      this._setSchedulePanel("recurrence");
    }
    if (normalized === "time") {
    }
    this._syncScheduleEditorCategoryUi();
    this._syncScheduleSectionToggles();
    this._syncScheduleHolidayFields();
  }

  _normalizeHebcalTriggerMode(value) {
    return String(value || "").toLowerCase() === "hebcal_event" ? "hebcal_event" : "schedule";
  }

  _normalizeHebcalEventKind(value) {
    return String(value || "").toLowerCase() === "holiday" ? "holiday" : "shabbat";
  }

  _normalizeHebcalHolidayMode(value) {
    const normalized = String(value || "").toLowerCase();
    if (normalized === "regular" || normalized === "yomtov") {
      return normalized;
    }
    return "all";
  }

  _normalizeHebcalEventPhase(value) {
    return String(value || "").toLowerCase() === "end" ? "end" : "start";
  }

  _normalizeHebcalOffsetMinutes(value) {
    const parsed = Number.parseInt(String(value ?? "0"), 10);
    if (!Number.isFinite(parsed)) {
      return 0;
    }
    const maxAbs = 24 * 60;
    return Math.max(-maxAbs, Math.min(maxAbs, parsed));
  }

  _setHebcalOffsetSignBtnFromPositive(isPositive) {
    const btn = this._elements.scheduleHolidayOffsetSignBtn;
    if (!btn) {
      return;
    }
    btn.setAttribute("data-offset-positive", isPositive ? "1" : "0");
    btn.textContent = isPositive ? "+" : "−";
  }

  _formatHebcalOffsetMagnitudeHuman(totalMinutesAbs) {
    const n = Math.max(0, Math.floor(Number(totalMinutesAbs) || 0));
    if (n === 0) {
      return `0 ${this._t("minutes_short")}`;
    }
    const h = Math.floor(n / 60);
    const m = n % 60;
    const hs = this._t("hours_short");
    const ms = this._t("minutes_short");
    if (h === 0) {
      return `${m} ${ms}`;
    }
    if (m === 0) {
      return `${h} ${hs}`;
    }
    return `${h} ${hs} ${m} ${ms}`;
  }

  _updateHebcalOffsetEquivLine() {
    const out = this._elements.scheduleHolidayOffsetEquiv;
    if (!out) {
      return;
    }
    const magEl = this._elements.scheduleHolidayOffsetMagInput;
    let mag = Number.parseInt(String(magEl?.value ?? "0"), 10);
    if (!Number.isFinite(mag)) {
      mag = 0;
    }
    mag = Math.max(0, Math.min(24 * 60, mag));
    if (mag === 0) {
      out.textContent = "";
      return;
    }
    const equiv = this._formatHebcalOffsetMagnitudeHuman(mag);
    out.textContent = this._t("schedule_holiday_offset_equiv").replace("{equiv}", equiv);
  }

  _applyHebcalOffsetUiFromTotalMinutes(totalMinutes) {
    const hidden = this._elements.scheduleHolidayOffsetInput;
    const magEl = this._elements.scheduleHolidayOffsetMagInput;
    const n = this._normalizeHebcalOffsetMinutes(Number.parseInt(String(totalMinutes ?? "0"), 10) || 0);
    if (hidden) {
      hidden.value = String(n);
    }
    if (magEl) {
      magEl.value = String(Math.abs(n));
    }
    this._setHebcalOffsetSignBtnFromPositive(n >= 0);
    this._updateHebcalOffsetEquivLine();
  }

  _syncHebcalOffsetHiddenFromParts() {
    const magEl = this._elements.scheduleHolidayOffsetMagInput;
    const hidden = this._elements.scheduleHolidayOffsetInput;
    if (!magEl || !hidden) {
      return 0;
    }
    let mag = Number.parseInt(String(magEl.value ?? "0"), 10);
    if (!Number.isFinite(mag)) {
      mag = 0;
    }
    mag = Math.max(0, Math.min(24 * 60, mag));
    magEl.value = String(mag);
    const positive = this._elements.scheduleHolidayOffsetSignBtn?.getAttribute("data-offset-positive") !== "0";
    const raw = (positive ? 1 : -1) * mag;
    const n = this._normalizeHebcalOffsetMinutes(raw);
    hidden.value = String(n);
    if (n !== raw) {
      magEl.value = String(Math.abs(n));
      this._setHebcalOffsetSignBtnFromPositive(n >= 0);
    }
    this._updateHebcalOffsetEquivLine();
    return n;
  }

  _extractEventTimeToHHMM(value) {
    if (value == null) {
      return "";
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      const epochMs = value > 1e12 ? value : value * 1000;
      const dateFromEpoch = new Date(epochMs);
      if (!Number.isNaN(dateFromEpoch.getTime())) {
        const hours = String(dateFromEpoch.getHours()).padStart(2, "0");
        const minutes = String(dateFromEpoch.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
      }
    }
    const raw = String(value).trim();
    if (!raw) {
      return "";
    }
    const hhmmMatch = raw.match(/^([01]?\d|2[0-3]):([0-5]\d)/);
    if (hhmmMatch) {
      return `${hhmmMatch[1].padStart(2, "0")}:${hhmmMatch[2]}`;
    }
    const parsedDate = new Date(raw);
    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }
    const hours = String(parsedDate.getHours()).padStart(2, "0");
    const minutes = String(parsedDate.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  _shabbatEntryTimeFromEntity() {
    const fromList = this._firstListAnchorHebcalWindow("shabbat", "all");
    if (fromList) {
      const hhmm = this._extractEventTimeToHHMM(fromList.starts_at);
      if (hhmm) {
        return hhmm;
      }
    }
    const managerMode = this._boilerManagerModeEntity();
    const managerAttrs = managerMode?.attributes || {};
    const stateObj = this._hass?.states?.[String(this._config?.shabbat_entity || "").trim()];
    const attrs = stateObj?.attributes || {};
    const candidates = [
      managerAttrs.hebcal_next_shabbat_start,
      stateObj?.state,
      attrs.next_start,
      attrs.next_shabbat_start,
      attrs.next_candle_lighting,
      attrs.start,
      attrs.starts_at,
      attrs.shabbat_start,
      attrs.candle_lighting,
      attrs.candleLighting,
      attrs.candle_lighting_time,
      attrs.candleLightingTime,
      attrs.entry_time,
      attrs.start_time,
      attrs.start_timestamp,
      attrs.next_start_timestamp,
    ];
    for (const candidate of candidates) {
      const hhmm = this._extractEventTimeToHHMM(candidate);
      if (hhmm) {
        return hhmm;
      }
    }
    return "";
  }

  _holidayHebcalAnchorStartHHMM(holidaySubtype) {
    const subtype = this._normalizeHebcalHolidayMode(holidaySubtype);
    const fromList = this._firstListAnchorHebcalWindow("holiday", subtype);
    if (fromList) {
      const hhmm = this._extractEventTimeToHHMM(fromList.starts_at);
      if (hhmm) {
        return hhmm;
      }
    }
    const managerMode = this._boilerManagerModeEntity();
    const managerAttrs = managerMode?.attributes || {};
    let preferred = [];
    if (subtype === "yomtov") {
      preferred = [managerAttrs.hebcal_next_yomtov_start, managerAttrs.hebcal_next_holiday_start];
    } else if (subtype === "regular") {
      preferred = [
        managerAttrs.hebcal_next_holiday_regular_start,
        managerAttrs.hebcal_next_holiday_start,
        managerAttrs.hebcal_next_yomtov_start,
      ];
    } else {
      preferred = [managerAttrs.hebcal_next_holiday_start, managerAttrs.hebcal_next_yomtov_start];
    }
    const stateObj = this._hass?.states?.[String(this._config?.holiday_entity || "").trim()];
    const attrs = stateObj?.attributes || {};
    const candidates = [
      ...preferred,
      stateObj?.state,
      attrs.next_start,
      attrs.next_holiday_start,
      attrs.start,
      attrs.starts_at,
      attrs.holiday_start,
      attrs.entry_time,
      attrs.start_time,
      attrs.start_timestamp,
      attrs.next_start_timestamp,
    ];
    for (const candidate of candidates) {
      const hhmm = this._extractEventTimeToHHMM(candidate);
      if (hhmm) {
        return hhmm;
      }
    }
    return "";
  }

  _holidayHebcalAnchorEndHHMM(holidaySubtype) {
    const subtype = this._normalizeHebcalHolidayMode(holidaySubtype);
    const fromList = this._firstListAnchorHebcalWindow("holiday", subtype);
    if (fromList) {
      const hhmm = this._extractEventTimeToHHMM(fromList.ends_at);
      if (hhmm) {
        return hhmm;
      }
    }
    const managerMode = this._boilerManagerModeEntity();
    const managerAttrs = managerMode?.attributes || {};
    let preferred = [];
    if (subtype === "yomtov") {
      preferred = [managerAttrs.hebcal_next_yomtov_end, managerAttrs.hebcal_next_holiday_end];
    } else if (subtype === "regular") {
      preferred = [
        managerAttrs.hebcal_next_holiday_regular_end,
        managerAttrs.hebcal_next_holiday_end,
        managerAttrs.hebcal_next_yomtov_end,
      ];
    } else {
      preferred = [managerAttrs.hebcal_next_holiday_end, managerAttrs.hebcal_next_yomtov_end];
    }
    const stateObj = this._hass?.states?.[String(this._config?.holiday_entity || "").trim()];
    const attrs = stateObj?.attributes || {};
    const candidates = [
      ...preferred,
      attrs.next_end,
      attrs.next_holiday_end,
      attrs.end,
      attrs.ends_at,
      attrs.holiday_end,
      attrs.exit_time,
      attrs.end_time,
      attrs.end_timestamp,
      attrs.next_end_timestamp,
    ];
    for (const candidate of candidates) {
      const hhmm = this._extractEventTimeToHHMM(candidate);
      if (hhmm) {
        return hhmm;
      }
    }
    return "";
  }

  _shabbatExitTimeFromEntity() {
    const fromList = this._firstListAnchorHebcalWindow("shabbat", "all");
    if (fromList) {
      const hhmm = this._extractEventTimeToHHMM(fromList.ends_at);
      if (hhmm) {
        return hhmm;
      }
    }
    const managerMode = this._boilerManagerModeEntity();
    const managerAttrs = managerMode?.attributes || {};
    const stateObj = this._hass?.states?.[String(this._config?.shabbat_entity || "").trim()];
    const attrs = stateObj?.attributes || {};
    const candidates = [
      managerAttrs.hebcal_next_shabbat_end,
      attrs.next_end,
      attrs.next_shabbat_end,
      attrs.next_havdalah,
      attrs.end,
      attrs.ends_at,
      attrs.shabbat_end,
      attrs.havdalah,
      attrs.havdalah_time,
      attrs.exit_time,
      attrs.end_time,
      attrs.end_timestamp,
      attrs.next_end_timestamp,
    ];
    for (const candidate of candidates) {
      const hhmm = this._extractEventTimeToHHMM(candidate);
      if (hhmm) {
        return hhmm;
      }
    }
    return "";
  }

  _setScheduleHolidayKind(value) {
    if (this._elements.scheduleHolidayKindInput) {
      this._elements.scheduleHolidayKindInput.value = this._normalizeHebcalEventKind(value);
    }
    this._syncScheduleHolidayFields();
  }

  _setScheduleHolidayPhase(value) {
    if (this._elements.scheduleHolidayPhaseInput) {
      this._elements.scheduleHolidayPhaseInput.value = this._normalizeHebcalEventPhase(value);
    }
    this._syncScheduleHolidayFields();
  }

  _setScheduleHolidaySubtype(value) {
    if (this._elements.scheduleHolidaySubtypeInput) {
      this._elements.scheduleHolidaySubtypeInput.value = this._normalizeHebcalHolidayMode(value);
    }
    this._syncScheduleHolidayFields();
  }

  _minusMinutesHHMM(hhmm, minutes) {
    const parsed = String(hhmm || "").match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    const mins = Number.parseInt(String(minutes ?? ""), 10);
    if (!parsed || !Number.isInteger(mins) || mins <= 0) {
      return "";
    }
    const total = (Number.parseInt(parsed[1], 10) * 60 + Number.parseInt(parsed[2], 10) - mins + (24 * 60)) % (24 * 60);
    const hours = String(Math.floor(total / 60)).padStart(2, "0");
    const rem = String(total % 60).padStart(2, "0");
    return `${hours}:${rem}`;
  }

  _plusMinutesHHMM(hhmm, minutes) {
    const parsed = String(hhmm || "").match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    const mins = Number.parseInt(String(minutes ?? ""), 10);
    if (!parsed || !Number.isFinite(mins)) {
      return "";
    }
    const base = Number.parseInt(parsed[1], 10) * 60 + Number.parseInt(parsed[2], 10);
    const total = (((base + mins) % (24 * 60)) + (24 * 60)) % (24 * 60);
    const hours = String(Math.floor(total / 60)).padStart(2, "0");
    const rem = String(total % 60).padStart(2, "0");
    return `${hours}:${rem}`;
  }

  _minutesDeltaHHMM(start, end) {
    const parse = (hhmm) => {
      const m = String(hhmm || "").trim().match(/^([01]\d|2[0-3]):([0-5]\d)$/);
      if (!m) {
        return null;
      }
      return Number.parseInt(m[1], 10) * 60 + Number.parseInt(m[2], 10);
    };
    const sm = parse(start);
    const em = parse(end);
    if (sm == null || em == null) {
      return NaN;
    }
    let diff = em - sm;
    if (diff <= 0) {
      diff += 24 * 60;
    }
    return diff;
  }

  _hebcalRunDurationMinutesFromInputs(defaultMinutes = 60) {
    const start = String(this._elements?.scheduleStartInput?.value || "").trim();
    const end = String(this._elements?.scheduleEndInput?.value || "").trim();
    const delta = this._minutesDeltaHHMM(start, end);
    if (Number.isFinite(delta) && delta > 0) {
      return delta;
    }
    return defaultMinutes;
  }

  _syncScheduleHolidayFields() {
    const triggerMode = this._normalizeHebcalTriggerMode(this._elements.scheduleHolidayTriggerModeInput?.value);
    const kind = this._normalizeHebcalEventKind(this._elements.scheduleHolidayKindInput?.value);
    const phase = this._normalizeHebcalEventPhase(this._elements.scheduleHolidayPhaseInput?.value);
    const hebcalActive = triggerMode === "hebcal_event";
    const shabbatHebcalMode = hebcalActive && kind === "shabbat";
    const holidaySubtype = this._normalizeHebcalHolidayMode(this._elements.scheduleHolidaySubtypeInput?.value);
    const shabbatLikeHoliday = hebcalActive && kind === "holiday" && holidaySubtype === "yomtov";
    const shabbatLikeEndMode = (shabbatHebcalMode || shabbatLikeHoliday) && phase === "end";
    const holidayKindSelected = kind === "holiday";
    const showSubtype = hebcalActive && holidayKindSelected;
    if (this._elements.scheduleHolidayOffsetMagInput) {
      this._syncHebcalOffsetHiddenFromParts();
    }
    if (shabbatHebcalMode && String(this._elements.scheduleTypeInput?.value || "").toLowerCase() === "timeline") {
      if (this._elements.scheduleTypeInput) {
        this._elements.scheduleTypeInput.value = "window";
      }
      this._syncScheduleTypeFields();
      return;
    }
    if (this._elements.scheduleHolidayKindInput) {
      this._elements.scheduleHolidayKindInput.disabled = !hebcalActive;
    }
    if (this._elements.scheduleHolidayPhaseInput) {
      this._elements.scheduleHolidayPhaseInput.disabled = !hebcalActive;
    }
    const offsetControlsBlocked = !hebcalActive;
    [this._elements.scheduleHolidayOffsetSignBtn, this._elements.scheduleHolidayOffsetMagInput].forEach((el) => {
      if (el) {
        el.disabled = offsetControlsBlocked;
      }
    });
    if (this._elements.scheduleHolidayKindField) {
      this._elements.scheduleHolidayKindField.hidden = !hebcalActive;
      this._elements.scheduleHolidayKindField.style.display = hebcalActive ? "" : "none";
    }
    if (this._elements.scheduleHolidayRowSecondary) {
      this._elements.scheduleHolidayRowSecondary.hidden = !hebcalActive;
      this._elements.scheduleHolidayRowSecondary.style.display = hebcalActive ? "" : "none";
    }
    if (this._elements.scheduleHolidayOffsetField) {
      this._elements.scheduleHolidayOffsetField.hidden = !hebcalActive;
      this._elements.scheduleHolidayOffsetField.style.display = hebcalActive ? "" : "none";
    }
    if (this._elements.scheduleEndTimerSelect) {
      this._fillTimelineDurationSelect(this._elements.scheduleEndTimerSelect, this._elements.scheduleEndTimerSelect.value || null);
      this._elements.scheduleEndTimerSelect.hidden = !shabbatLikeEndMode;
      this._elements.scheduleEndTimerSelect.style.display = shabbatLikeEndMode ? "" : "none";
      this._elements.scheduleEndTimerSelect.disabled = !shabbatLikeEndMode;
    }
    if (this._elements.scheduleTypeWindowBtn) {
      this._elements.scheduleTypeWindowBtn.disabled = false;
    }
    if (this._elements.scheduleTypeTimelineBtn) {
      this._elements.scheduleTypeTimelineBtn.disabled = false;
    }
    if (this._elements.scheduleStartInput) {
      const offsetMinutes = this._normalizeHebcalOffsetMinutes(this._elements.scheduleHolidayOffsetInput?.value);
      const runDuration = this._hebcalRunDurationMinutesFromInputs(60);

      if (shabbatHebcalMode) {
        if (phase === "start") {
          const base = this._shabbatEntryTimeFromEntity();
          const activation = base ? this._plusMinutesHHMM(base, offsetMinutes) : "";
          if (activation) {
            this._elements.scheduleStartInput.value = activation;
            const newEnd = this._plusMinutesHHMM(activation, runDuration);
            if (newEnd && this._elements.scheduleEndInput) {
              this._elements.scheduleEndInput.value = newEnd;
            }
          }
        } else {
          const base = this._shabbatExitTimeFromEntity();
          const activationEnd = base ? this._plusMinutesHHMM(base, offsetMinutes) : "";
          if (activationEnd && this._elements.scheduleEndInput) {
            this._elements.scheduleEndInput.value = activationEnd;
          }
        }
      } else if (hebcalActive && holidayKindSelected) {
        if (phase === "start") {
          const base = this._holidayHebcalAnchorStartHHMM(holidaySubtype);
          const activation = base ? this._plusMinutesHHMM(base, offsetMinutes) : "";
          if (activation) {
            this._elements.scheduleStartInput.value = activation;
            const newEnd = this._plusMinutesHHMM(activation, runDuration);
            if (newEnd && this._elements.scheduleEndInput) {
              this._elements.scheduleEndInput.value = newEnd;
            }
          }
        } else {
          const baseEnd = this._holidayHebcalAnchorEndHHMM(holidaySubtype);
          const activationEnd = baseEnd ? this._plusMinutesHHMM(baseEnd, offsetMinutes) : "";
          if (activationEnd && this._elements.scheduleEndInput) {
            this._elements.scheduleEndInput.value = activationEnd;
          }
          if (!shabbatLikeEndMode && activationEnd) {
            const newStart = this._minusMinutesHHMM(activationEnd, runDuration);
            if (newStart) {
              this._elements.scheduleStartInput.value = newStart;
            }
          }
        }
      }
      if (shabbatLikeEndMode) {
        const endAnchor = String(this._elements.scheduleEndInput?.value || "").trim();
        const durationOption = String(this._elements.scheduleEndTimerSelect?.value || "").trim();
        const durationMinutes = this._optionToMinutes(durationOption);
        const derivedStart = this._minusMinutesHHMM(endAnchor, durationMinutes);
        if (derivedStart) {
          this._elements.scheduleStartInput.value = derivedStart;
        }
      }
      const hebcalHolidayPhaseStart = hebcalActive && holidayKindSelected && phase === "start";
      const hebcalHolidayPhaseEndAnchor =
        hebcalActive && holidayKindSelected && phase === "end" && !shabbatLikeEndMode;
      this._elements.scheduleStartInput.disabled =
        (shabbatHebcalMode && phase === "start")
        || hebcalHolidayPhaseStart
        || hebcalHolidayPhaseEndAnchor
        || shabbatLikeEndMode;
    }
    if (this._elements.scheduleEndInput) {
      this._elements.scheduleEndInput.hidden = shabbatLikeEndMode;
      this._elements.scheduleEndInput.style.display = shabbatLikeEndMode ? "none" : "";
      const hebcalHolidayPhaseEndAnchor =
        hebcalActive && holidayKindSelected && phase === "end" && !shabbatLikeEndMode;
      this._elements.scheduleEndInput.disabled =
        (shabbatHebcalMode && phase === "end")
        || hebcalHolidayPhaseEndAnchor;
    }
    if (this._elements.scheduleStartClearBtn) {
      const hebcalHolidayPhaseEndAnchor =
        hebcalActive && holidayKindSelected && phase === "end" && !shabbatLikeEndMode;
      this._elements.scheduleStartClearBtn.disabled =
        (shabbatHebcalMode && phase === "start")
        || (hebcalActive && holidayKindSelected && phase === "start")
        || hebcalHolidayPhaseEndAnchor
        || shabbatLikeEndMode;
    }
    if (this._elements.scheduleEndClearBtn) {
      this._elements.scheduleEndClearBtn.hidden = shabbatLikeEndMode;
      this._elements.scheduleEndClearBtn.style.display = shabbatLikeEndMode ? "none" : "";
      const hebcalHolidayPhaseEndAnchor =
        hebcalActive && holidayKindSelected && phase === "end" && !shabbatLikeEndMode;
      this._elements.scheduleEndClearBtn.disabled =
        (shabbatHebcalMode && phase === "end")
        || hebcalHolidayPhaseEndAnchor;
    }
    if (this._elements.schedulePanelDaysBtn) {
      this._elements.schedulePanelDaysBtn.disabled = shabbatHebcalMode;
    }
    const dayButtons = Array.from(this.shadowRoot.querySelectorAll(".schedule-day"));
    dayButtons.forEach((button) => {
      button.disabled = shabbatHebcalMode;
    });
    if (shabbatHebcalMode && this._schedulePanel === "days") {
      this._setSchedulePanel("recurrence");
      return;
    }
    if (this._elements.scheduleHolidaySubtypeField) {
      this._elements.scheduleHolidaySubtypeField.hidden = !showSubtype;
      this._elements.scheduleHolidaySubtypeField.style.display = showSubtype ? "" : "none";
    }
    if (this._elements.scheduleHolidaySubtypeInput) {
      this._elements.scheduleHolidaySubtypeInput.disabled = !showSubtype || !holidayKindSelected;
    }
    if (this._elements.scheduleHolidayKindOptShabbat) {
      const active = kind === "shabbat";
      this._elements.scheduleHolidayKindOptShabbat.classList.toggle("active", active);
      this._elements.scheduleHolidayKindOptShabbat.setAttribute("aria-pressed", active ? "true" : "false");
      this._elements.scheduleHolidayKindOptShabbat.disabled = !hebcalActive;
    }
    if (this._elements.scheduleHolidayKindOptHoliday) {
      const active = kind === "holiday";
      this._elements.scheduleHolidayKindOptHoliday.classList.toggle("active", active);
      this._elements.scheduleHolidayKindOptHoliday.setAttribute("aria-pressed", active ? "true" : "false");
      this._elements.scheduleHolidayKindOptHoliday.disabled = !hebcalActive;
    }
    if (this._elements.scheduleHolidayPhaseOptStart) {
      const active = phase === "start";
      this._elements.scheduleHolidayPhaseOptStart.classList.toggle("active", active);
      this._elements.scheduleHolidayPhaseOptStart.setAttribute("aria-pressed", active ? "true" : "false");
      this._elements.scheduleHolidayPhaseOptStart.disabled = !hebcalActive;
    }
    if (this._elements.scheduleHolidayPhaseOptEnd) {
      const active = phase === "end";
      this._elements.scheduleHolidayPhaseOptEnd.classList.toggle("active", active);
      this._elements.scheduleHolidayPhaseOptEnd.setAttribute("aria-pressed", active ? "true" : "false");
      this._elements.scheduleHolidayPhaseOptEnd.disabled = !hebcalActive;
    }
    if (this._elements.scheduleHolidaySubtypeOptAll) {
      const active = holidaySubtype === "all";
      this._elements.scheduleHolidaySubtypeOptAll.classList.toggle("active", active);
      this._elements.scheduleHolidaySubtypeOptAll.setAttribute("aria-pressed", active ? "true" : "false");
      this._elements.scheduleHolidaySubtypeOptAll.disabled = !hebcalActive || !holidayKindSelected;
    }
    if (this._elements.scheduleHolidaySubtypeOptYomtov) {
      const active = holidaySubtype === "yomtov";
      this._elements.scheduleHolidaySubtypeOptYomtov.classList.toggle("active", active);
      this._elements.scheduleHolidaySubtypeOptYomtov.setAttribute("aria-pressed", active ? "true" : "false");
      this._elements.scheduleHolidaySubtypeOptYomtov.disabled = !hebcalActive || !holidayKindSelected;
    }
    if (this._elements.scheduleHolidaySubtypeOptRegular) {
      const active = holidaySubtype === "regular";
      this._elements.scheduleHolidaySubtypeOptRegular.classList.toggle("active", active);
      this._elements.scheduleHolidaySubtypeOptRegular.setAttribute("aria-pressed", active ? "true" : "false");
      this._elements.scheduleHolidaySubtypeOptRegular.disabled = !hebcalActive || !holidayKindSelected;
    }
    if (this._elements.scheduleTypeHolidayBtn) {
      const isTimeline = String(this._elements.scheduleTypeInput?.value || "window").toLowerCase() === "timeline";
      const isHolidayMode = !isTimeline && hebcalActive;
      const isWindowMode = !isTimeline && !hebcalActive;
      if (this._elements.scheduleTypeWindowBtn) {
        this._elements.scheduleTypeWindowBtn.classList.toggle("active", isWindowMode);
        this._elements.scheduleTypeWindowBtn.setAttribute("aria-pressed", isWindowMode ? "true" : "false");
      }
      this._elements.scheduleTypeHolidayBtn.classList.toggle("active", isHolidayMode);
      this._elements.scheduleTypeHolidayBtn.setAttribute("aria-pressed", isHolidayMode ? "true" : "false");
      if (this._elements.scheduleTypeTimelineBtn) {
        this._elements.scheduleTypeTimelineBtn.classList.toggle("active", isTimeline);
        this._elements.scheduleTypeTimelineBtn.setAttribute("aria-pressed", isTimeline ? "true" : "false");
      }
    }
  }

  _syncScheduleEditorCategoryUi() {
    const category = ["time", "recurrence", "conditions"].includes(this._scheduleEditorCategory)
      ? this._scheduleEditorCategory
      : "time";
    const isTime = category === "time";
    const isRecurrence = category === "recurrence";
    const isConditions = category === "conditions";
    const isTimeline = String(this._elements.scheduleTypeInput?.value || "window").toLowerCase() === "timeline";
    const setVisible = (el, visible) => {
      if (!el) {
        return;
      }
      el.hidden = !visible;
      el.style.display = visible ? "" : "none";
    };

    if (this._elements.scheduleCategoryTimeBtn) {
      this._elements.scheduleCategoryTimeBtn.classList.toggle("active", isTime);
    }
    if (this._elements.scheduleCategoryRecurrenceBtn) {
      this._elements.scheduleCategoryRecurrenceBtn.classList.toggle("active", isRecurrence);
    }
    if (this._elements.scheduleCategoryConditionsBtn) {
      this._elements.scheduleCategoryConditionsBtn.classList.toggle("active", isConditions);
    }
    setVisible(this._elements.scheduleTypeField, isTime);
    setVisible(this._elements.scheduleWindowFields, isTime && !isTimeline);
    setVisible(this._elements.scheduleTimelineFields, isTime && isTimeline);
    setVisible(this._elements.scheduleSectionSwitch, isRecurrence);
    if (this._elements.scheduleSectionSwitch) {
      this._elements.scheduleSectionSwitch.style.gridTemplateColumns = isRecurrence
        ? "repeat(2, minmax(0, 1fr))"
        : "repeat(3, minmax(0, 1fr))";
    }
    setVisible(this._elements.schedulePanelRecurrenceBtn, false);
    setVisible(this._elements.schedulePanelDaysBtn, isRecurrence);
    setVisible(this._elements.schedulePanelMonthsBtn, isRecurrence);

    const showRecurrencePanel = isTime || isConditions;
    if (this._elements.schedulePanelRecurrence) {
      this._elements.schedulePanelRecurrence.hidden = !showRecurrencePanel;
      this._elements.schedulePanelRecurrence.style.display = showRecurrencePanel ? "" : "none";
    }
    if (this._elements.schedulePanelDays) {
      this._elements.schedulePanelDays.hidden = !isRecurrence || this._schedulePanel !== "days";
      this._elements.schedulePanelDays.style.display = (!isRecurrence || this._schedulePanel !== "days") ? "none" : "";
    }
    if (this._elements.schedulePanelMonths) {
      this._elements.schedulePanelMonths.hidden = !isRecurrence || this._schedulePanel !== "months";
      this._elements.schedulePanelMonths.style.display = (!isRecurrence || this._schedulePanel !== "months") ? "none" : "";
    }

    setVisible(this._elements.scheduleRecurrenceGroup, isTime);
    setVisible(this._elements.scheduleConditionGroup, isConditions);
    setVisible(this._elements.scheduleHolidayGroup, isTime);
    this._syncScheduleHolidayFields();
  }

  _syncScheduleTypeFields({ refreshTimelineOptions = true } = {}) {
    const type = String(this._elements.scheduleTypeInput?.value || "window").toLowerCase();
    const isTimeline = type === "timeline";
    const triggerMode = this._normalizeHebcalTriggerMode(this._elements.scheduleHolidayTriggerModeInput?.value);
    const isHolidayMode = !isTimeline && triggerMode === "hebcal_event";

    if (this._elements.scheduleTypeWindowBtn) {
      const isWindow = !isTimeline && !isHolidayMode;
      this._elements.scheduleTypeWindowBtn.classList.toggle("active", isWindow);
      this._elements.scheduleTypeWindowBtn.setAttribute("aria-pressed", isWindow ? "true" : "false");
    }
    if (this._elements.scheduleTypeHolidayBtn) {
      this._elements.scheduleTypeHolidayBtn.classList.toggle("active", isHolidayMode);
      this._elements.scheduleTypeHolidayBtn.setAttribute("aria-pressed", isHolidayMode ? "true" : "false");
    }
    if (this._elements.scheduleTypeTimelineBtn) {
      this._elements.scheduleTypeTimelineBtn.classList.toggle("active", isTimeline);
      this._elements.scheduleTypeTimelineBtn.setAttribute("aria-pressed", isTimeline ? "true" : "false");
    }

    if (this._elements.scheduleWindowFields) {
      this._elements.scheduleWindowFields.hidden = isTimeline;
    }
    if (this._elements.scheduleTimelineFields) {
      this._elements.scheduleTimelineFields.hidden = !isTimeline;
    }
    this._syncScheduleEditorCategoryUi();
    if (isTimeline && refreshTimelineOptions) {
      const selects = Array.from(this.shadowRoot.querySelectorAll(".timeline-point-duration"));
      selects.forEach((select) => this._fillTimelineDurationSelect(select, select.value));
    }
  }

  _setScheduleRecurrence(value) {
    const normalized = ["forever", "once", "range"].includes(String(value || "").toLowerCase())
      ? String(value).toLowerCase()
      : "forever";
    if (this._elements.scheduleRecurrenceInput) {
      this._elements.scheduleRecurrenceInput.value = normalized;
    }
    this._syncScheduleRecurrenceFields();
  }

  _syncScheduleSectionToggles() {
    const recurrenceExpanded = this._scheduleEditorCategory === "recurrence" || this._scheduleEditorCategory === "time";
    const conditionExpanded = this._scheduleEditorCategory === "conditions";
    const setVisible = (el, visible) => {
      if (!el) {
        return;
      }
      el.hidden = !visible;
      el.style.display = visible ? "" : "none";
    };
    if (this._elements.scheduleRecurrenceToggle) {
      setVisible(this._elements.scheduleRecurrenceToggle, recurrenceExpanded);
    }
    if (this._elements.scheduleDateRow) {
      const recurrence = String(this._elements.scheduleRecurrenceInput?.value || "forever").toLowerCase();
      setVisible(this._elements.scheduleDateRow, recurrenceExpanded && recurrence === "range");
    }
    if (this._elements.scheduleConditionRow) {
      setVisible(this._elements.scheduleConditionRow, conditionExpanded);
    }
    if (this._elements.schedulePanelRecurrence) {
      this._elements.schedulePanelRecurrence.classList.toggle("recurrence-collapsed", !recurrenceExpanded);
      this._elements.schedulePanelRecurrence.classList.toggle("condition-collapsed", !conditionExpanded);
    }
    this._syncScheduleEditorCategoryUi();
  }

  _syncScheduleRecurrenceFields() {
    const recurrence = String(this._elements.scheduleRecurrenceInput?.value || "forever").toLowerCase();

    if (this._elements.scheduleRecurrenceForeverBtn) {
      const active = recurrence === "forever";
      this._elements.scheduleRecurrenceForeverBtn.classList.toggle("active", active);
      this._elements.scheduleRecurrenceForeverBtn.setAttribute("aria-pressed", active ? "true" : "false");
    }
    if (this._elements.scheduleRecurrenceOnceBtn) {
      const active = recurrence === "once";
      this._elements.scheduleRecurrenceOnceBtn.classList.toggle("active", active);
      this._elements.scheduleRecurrenceOnceBtn.setAttribute("aria-pressed", active ? "true" : "false");
    }
    if (this._elements.scheduleRecurrenceRangeBtn) {
      const active = recurrence === "range";
      this._elements.scheduleRecurrenceRangeBtn.classList.toggle("active", active);
      this._elements.scheduleRecurrenceRangeBtn.setAttribute("aria-pressed", active ? "true" : "false");
    }

    this._syncScheduleSectionToggles();
  }

  _resetScheduleForm() {
    if (this._elements.scheduleNameInput) {
      this._elements.scheduleNameInput.value = "";
    }
    this._setScheduleType("window");
    if (this._elements.scheduleStartInput) {
      this._elements.scheduleStartInput.value = "10:00";
    }
    if (this._elements.scheduleEndInput) {
      this._elements.scheduleEndInput.value = "12:00";
    }
    this._setScheduleRecurrence("forever");
    if (this._elements.scheduleStartDateInput) {
      this._elements.scheduleStartDateInput.value = "";
    }
    if (this._elements.scheduleEndDateInput) {
      this._elements.scheduleEndDateInput.value = "";
    }
    if (this._elements.scheduleConditionEntityInput) {
      this._elements.scheduleConditionEntityInput.value = "";
    }
    if (this._elements.scheduleConditionOperatorInput) {
      this._elements.scheduleConditionOperatorInput.value = "eq";
    }
    if (this._elements.scheduleConditionStateInput) {
      this._elements.scheduleConditionStateInput.value = "";
    }
    if (this._elements.scheduleHolidayTriggerModeInput) {
      this._elements.scheduleHolidayTriggerModeInput.value = "schedule";
    }
    if (this._elements.scheduleHolidayKindInput) {
      this._elements.scheduleHolidayKindInput.value = "shabbat";
    }
    if (this._elements.scheduleHolidayPhaseInput) {
      this._elements.scheduleHolidayPhaseInput.value = "start";
    }
    if (this._elements.scheduleHolidaySubtypeInput) {
      this._elements.scheduleHolidaySubtypeInput.value = "all";
    }
    this._applyHebcalOffsetUiFromTotalMinutes(0);
    this._scheduleEditorCategory = "time";
    this._refreshConditionOperatorOptions("");
    this._refreshConditionStateOptions("");
    const dayButtons = Array.from(this.shadowRoot.querySelectorAll(".schedule-day"));
    dayButtons.forEach((button) => {
      button.classList.add("selected");
    });
    const monthButtons = Array.from(this.shadowRoot.querySelectorAll(".schedule-month"));
    monthButtons.forEach((button) => button.classList.add("selected"));
    this._resetTimelinePoints();
    this._syncScheduleRecurrenceFields();
    this._syncScheduleHolidayFields();
    this._setSchedulePanel("recurrence");
    this._syncScheduleEditorCategoryUi();
    this._syncScheduleSectionToggles();
  }

  _submitScheduleTask() {
    if (!this._hass) {
      return;
    }

    const name = String(this._elements.scheduleNameInput?.value || "").trim();
    const taskType = String(this._elements.scheduleTypeInput?.value || "window").toLowerCase();
    const days = Array.from(this.shadowRoot.querySelectorAll(".schedule-day.selected"))
      .map((button) => Number.parseInt(button.dataset.day || "", 10))
      .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6);
    const months = Array.from(this.shadowRoot.querySelectorAll(".schedule-month.selected"))
      .map((button) => Number.parseInt(button.dataset.month || "", 10))
      .filter((month) => Number.isInteger(month) && month >= 1 && month <= 12);
    const recurrence = String(this._elements.scheduleRecurrenceInput?.value || "forever").trim().toLowerCase();
    const startDate = String(this._elements.scheduleStartDateInput?.value || "").trim();
    const endDate = String(this._elements.scheduleEndDateInput?.value || "").trim();
    const conditionEntity = String(this._elements.scheduleConditionEntityInput?.value || "").trim();
    let conditionOperator = this._normalizeConditionOperator(
      this._elements.scheduleConditionOperatorInput?.value || "eq"
    );
    let skipIfState = String(this._elements.scheduleConditionStateInput?.value || "").trim();
    if (conditionEntity && !skipIfState) {
      skipIfState = conditionOperator === "eq" ? "on" : "0";
    }
    if (!conditionEntity) {
      conditionOperator = "eq";
      skipIfState = "";
    }
    const includeDateRange = recurrence === "range";
    const triggerMode = this._normalizeHebcalTriggerMode(this._elements.scheduleHolidayTriggerModeInput?.value);
    const hebcalEventKind = this._normalizeHebcalEventKind(this._elements.scheduleHolidayKindInput?.value);
    const hebcalEventPhase = this._normalizeHebcalEventPhase(this._elements.scheduleHolidayPhaseInput?.value);
    const hebcalHolidayMode = this._normalizeHebcalHolidayMode(this._elements.scheduleHolidaySubtypeInput?.value);
    this._syncHebcalOffsetHiddenFromParts();
    const hebcalOffsetMinutes = this._normalizeHebcalOffsetMinutes(this._elements.scheduleHolidayOffsetInput?.value);
    const hebcalEnabled = triggerMode === "hebcal_event";

    const baseData = {
      ...this._builtInServiceBaseData(),
      name,
      days,
      months,
      recurrence,
      ...(includeDateRange && startDate ? { start_date: startDate } : {}),
      ...(includeDateRange && endDate ? { end_date: endDate } : {}),
      condition_entity: conditionEntity,
      condition_operator: conditionOperator,
      skip_if_state: skipIfState,
      trigger_mode: hebcalEnabled ? "hebcal_event" : "schedule",
      ...(hebcalEnabled ? { hebcal_event_kind: hebcalEventKind } : {}),
      ...(hebcalEnabled ? { hebcal_event_phase: hebcalEventPhase } : {}),
      ...(hebcalEnabled && hebcalEventKind === "holiday" ? { hebcal_holiday_mode: hebcalHolidayMode } : {}),
      ...(hebcalEnabled && hebcalOffsetMinutes ? { hebcal_offset_minutes: hebcalOffsetMinutes } : {}),
      enabled: true,
    };

    const isEdit = !!this._editingTaskId;

    if (taskType === "timeline") {
      if (isEdit ? !this._hasScheduleUpdateService() : !this._hasTimelineCreateService()) {
        return;
      }
      const timelinePoints = this._collectTimelinePoints();
      if (timelinePoints.length === 0) {
        return;
      }
      const duplicateMatches = this._findDuplicateTaskConflicts(
        {
          task_type: "timeline",
          timeline_points: timelinePoints,
          days,
          months,
          recurrence,
          start_date: includeDateRange ? startDate : "",
          end_date: includeDateRange ? endDate : "",
        },
        this._editingTaskId
      );
      if (duplicateMatches.length > 0) {
        const details = duplicateMatches.map((item) => `• ${item.name}: ${item.summary}`).join("\n");
        this._showInfoModal(
          `${this._t("duplicate_task_message_intro")}\n${details}`,
          this._t("duplicate_task_title")
        );
        return;
      }
      if (isEdit) {
        this._callConfiguredService(this._config.service_update_schedule, {
          ...baseData,
          task_id: this._editingTaskId,
          task_type: "timeline",
          timeline_points: timelinePoints,
        });
      } else {
        this._callConfiguredService(this._config.service_create_timeline, {
          ...baseData,
          timeline_points: timelinePoints,
        });
      }
      this._closeScheduleModal();
      return;
    }

    let startTime = String(this._elements.scheduleStartInput?.value || "").trim();
    let endTime = String(this._elements.scheduleEndInput?.value || "").trim();
    const shabbatLikeEndMode = hebcalEnabled
      && hebcalEventPhase === "end"
      && (hebcalEventKind === "shabbat" || (hebcalEventKind === "holiday" && hebcalHolidayMode === "yomtov"));
    if (shabbatLikeEndMode) {
      const durationOption = String(this._elements.scheduleEndTimerSelect?.value || "").trim();
      const durationMinutes = this._optionToMinutes(durationOption);
      const derivedStart = this._minusMinutesHHMM(endTime, durationMinutes);
      if (!derivedStart) {
        return;
      }
      startTime = derivedStart;
    }
    if (!startTime || !endTime) {
      return;
    }
    const duplicateMatches = this._findDuplicateTaskConflicts(
      {
        task_type: "window",
        start_time: startTime,
        end_time: endTime,
        days,
        months,
        recurrence,
        start_date: includeDateRange ? startDate : "",
        end_date: includeDateRange ? endDate : "",
      },
      this._editingTaskId
    );
    if (duplicateMatches.length > 0) {
      const details = duplicateMatches.map((item) => `• ${item.name}: ${item.summary}`).join("\n");
      this._showInfoModal(
        `${this._t("duplicate_task_message_intro")}\n${details}`,
        this._t("duplicate_task_title")
      );
      return;
    }

    if (isEdit) {
      if (!this._hasScheduleUpdateService()) {
        return;
      }
      this._callConfiguredService(this._config.service_update_schedule, {
        ...baseData,
        task_id: this._editingTaskId,
        task_type: "window",
        start_time: startTime,
        end_time: endTime,
      });
    } else {
      if (!this._hasScheduleCreateService()) {
        return;
      }
      this._callConfiguredService(this._config.service_create_schedule, {
        ...baseData,
        start_time: startTime,
        end_time: endTime,
      });
    }
    this._closeScheduleModal();
  }

  _taskSwitchEntities() {
    if (!this._hass?.states) {
      return [];
    }

    const desiredEntryId = String(this._config.integration_entry_id || "").trim();
    const desiredBoiler = String(this._config.boiler_entity || "").trim().toLowerCase();

    const entities = Object.values(this._hass.states)
      .filter((state) => state?.entity_id?.startsWith("switch."))
      .filter((state) => state?.attributes?.task_id)
      .filter((state) => {
        const attrs = state.attributes || {};
        if (desiredEntryId && attrs.entry_id === desiredEntryId) {
          return true;
        }
        if (desiredBoiler && String(attrs.boiler_entity || "").trim().toLowerCase() === desiredBoiler) {
          return true;
        }
        return !desiredEntryId && !desiredBoiler;
      })
      .sort((a, b) => {
        const byStart = String(a.attributes?.start_time || "").localeCompare(String(b.attributes?.start_time || ""));
        if (byStart !== 0) {
          return byStart;
        }
        const aName = String(a.attributes?.task_name || a.attributes?.friendly_name || "").trim();
        const bName = String(b.attributes?.task_name || b.attributes?.friendly_name || "").trim();
        const byName = aName.localeCompare(bName);
        if (byName !== 0) {
          return byName;
        }
        const aTaskId = String(a.attributes?.task_id || a.entity_id || "").trim();
        const bTaskId = String(b.attributes?.task_id || b.entity_id || "").trim();
        return aTaskId.localeCompare(bTaskId);
      });

    return entities;
  }

  _findDuplicateTaskConflicts(candidatePayload, excludeTaskId = null) {
    const candidateKey = this._taskDuplicateKeyFromPayload(candidatePayload);
    if (!candidateKey) {
      return [];
    }

    const exclude = String(excludeTaskId || "").trim();
    const matches = [];
    this._taskSwitchEntities().forEach((taskState) => {
      const attrs = taskState?.attributes || {};
      const taskId = String(attrs.task_id || "").trim();
      if (exclude && taskId && taskId === exclude) {
        return;
      }
      const taskKey = this._taskDuplicateKeyFromPayload(attrs);
      if (taskKey !== candidateKey) {
        return;
      }
      matches.push({
        taskId: taskId || taskState.entity_id,
        name: String(attrs.task_name || attrs.friendly_name || taskId || taskState.entity_id),
        summary: this._taskDuplicateSummary(attrs),
      });
    });
    return matches;
  }

  _taskDuplicateKeyFromPayload(raw) {
    const payload = raw || {};
    const taskType = String(payload.task_type || "window").toLowerCase() === "timeline" ? "timeline" : "window";
    const recurrence = this._normalizedRecurrenceForExport(payload.recurrence);
    const normalizedDates = this._normalizedDateRangeForDuplicate(
      recurrence,
      payload.start_date,
      payload.end_date
    );
    const days = this._normalizedDaysForExport(payload.days).join(",");
    const months = this._normalizedMonthsForExport(payload.months).join(",");

    if (taskType === "timeline") {
      const points = this._normalizedTimelinePointsForDuplicate(payload.timeline_points);
      if (!points) {
        return null;
      }
      return [
        "timeline",
        points,
        days,
        months,
        recurrence,
        normalizedDates.startDate,
        normalizedDates.endDate,
      ].join("|");
    }

    const startTime = this._normalizeHhMm(payload.start_time);
    const endTime = this._normalizeHhMm(payload.end_time);
    if (!startTime || !endTime) {
      return null;
    }
    return [
      "window",
      startTime,
      endTime,
      days,
      months,
      recurrence,
      normalizedDates.startDate,
      normalizedDates.endDate,
    ].join("|");
  }

  _normalizedTimelinePointsForDuplicate(points) {
    if (!Array.isArray(points) || points.length === 0) {
      return null;
    }
    const normalized = points
      .map((point) => {
        const at = this._normalizeHhMm(point?.at);
        const minutesRaw = Number.parseInt(point?.duration_minutes, 10);
        const minutes = Number.isInteger(minutesRaw) && minutesRaw > 0
          ? minutesRaw
          : this._optionToMinutes(String(point?.duration_option || ""));
        if (!at || !minutes || minutes <= 0) {
          return null;
        }
        return `${at}>${minutes}`;
      })
      .filter((item) => !!item)
      .sort((a, b) => a.localeCompare(b));

    if (normalized.length === 0) {
      return null;
    }
    return normalized.join(",");
  }

  _normalizeHhMm(value) {
    if (typeof value !== "string") {
      return null;
    }
    const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
    if (!match) {
      return null;
    }
    const hh = Number.parseInt(match[1], 10);
    const mm = Number.parseInt(match[2], 10);
    if (!Number.isInteger(hh) || !Number.isInteger(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) {
      return null;
    }
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }

  _normalizedDateRangeForDuplicate(recurrence, startDate, endDate) {
    const start = this._validDateKey(startDate) || "";
    const end = this._validDateKey(endDate) || "";
    if (recurrence === "range") {
      return { startDate: start, endDate: end };
    }
    if (recurrence === "once") {
      const oneDay = start || end || "";
      return { startDate: oneDay, endDate: oneDay };
    }
    return { startDate: "", endDate: "" };
  }

  _taskDuplicateSummary(attrs) {
    const taskType = String(attrs?.task_type || "window").toLowerCase() === "timeline" ? "timeline" : "window";
    const localizedDays = this._formatScheduleDays(attrs.days);
    const dayText = localizedDays ? ` · ${localizedDays}` : "";
    if (taskType === "timeline") {
      const timeline = String(attrs.timeline_label || "").trim();
      return `${timeline || "--"}${dayText}`;
    }
    return `${attrs.start_time || "--:--"} - ${attrs.end_time || "--:--"}${dayText}`;
  }

  _syncVacationNotice(managerMode = null) {
    const notice = this._elements.vacationNotice;
    if (!notice) {
      return;
    }
    const enabled = this._isVacationModeEnabled(managerMode || this._boilerManagerModeEntity());
    notice.hidden = !enabled;
    notice.textContent = enabled ? this._t("vacation_mode_notice") : "";
  }

  _syncActiveTaskNotice() {
    const notice = this._elements.activeTaskNotice;
    if (!notice) {
      return;
    }

    if (this._isVacationModeEnabled(this._boilerManagerModeEntity())) {
      notice.hidden = true;
      notice.textContent = "";
      return;
    }

    const active = this._currentActiveTask();
    if (!active) {
      notice.hidden = true;
      notice.textContent = "";
      return;
    }

    const label = active.name || this._t("tasks_title");
    const calLine = this._calendarLineForActiveHebcalTask(active, this._boilerManagerModeEntity());
    const parts = [];
    if (calLine) {
      parts.push(calLine);
    }
    parts.push(label);
    parts.push(`${this._t("active_task_ends_at")} ${this._formatClockTime(active.endTs)}`);
    notice.textContent = parts.join(" • ");
    notice.hidden = false;
  }

  _calendarLineForActiveHebcalTask(active, managerMode = null) {
    if (!active) {
      return "";
    }
    const triggerMode = String(active.triggerMode || "").trim().toLowerCase();
    if (triggerMode !== "hebcal_event") {
      return "";
    }
    const kind = String(active.hebcalEventKind || "").trim().toLowerCase();
    if (kind === "shabbat") {
      return this._t("card_status_shabbat_mode");
    }
    if (kind === "holiday") {
      const managerAttrs = managerMode?.attributes || {};
      const fromManager = String(managerAttrs.hebcal_label || "").trim();
      if (fromManager) {
        return fromManager;
      }
      const name = String(active.name || "").trim();
      return name || "";
    }
    return "";
  }

  _currentActiveTask() {
    const nowTs = Date.now();
    let nearest = null;

    this._taskSwitchEntities().forEach((taskState) => {
      const enabled = String(taskState?.state || "").toLowerCase() === "on";
      if (!enabled) {
        return;
      }

      const attrs = taskState?.attributes || {};
      if (!this._asTruthy(attrs.active_now)) {
        return;
      }

      const bounds = this._taskCurrentActiveSegmentBounds(attrs, nowTs);
      if (!bounds || !Number.isFinite(bounds.endTs) || bounds.endTs <= nowTs) {
        return;
      }

      if (!nearest || bounds.endTs < nearest.endTs) {
        nearest = {
          endTs: bounds.endTs,
          startTs: bounds.startTs,
          name: String(attrs.task_name || attrs.friendly_name || attrs.task_id || "").trim(),
          triggerMode: String(attrs.trigger_mode || "schedule").trim().toLowerCase(),
          hebcalEventKind: String(attrs.hebcal_event_kind || "").trim().toLowerCase(),
        };
      }
    });

    return nearest;
  }

  _taskCurrentActiveSegmentBounds(attrs, nowTs) {
    const now = new Date(nowTs);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const taskType = String(attrs?.task_type || "window").toLowerCase() === "timeline" ? "timeline" : "window";

    if (taskType === "timeline" && Array.isArray(attrs?.timeline_points)) {
      let best = null;
      const candidates = [yesterday, today];
      candidates.forEach((dateRef) => {
        if (!this._taskMatchesDate(attrs, dateRef)) {
          return;
        }
        attrs.timeline_points.forEach((point) => {
          const startMinutes = this._timeToMinutes(point?.at);
          const durationMinutes = this._timelinePointDurationMinutes(point);
          if (startMinutes === null || durationMinutes === null || durationMinutes <= 0) {
            return;
          }

          const start = new Date(dateRef);
          start.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
          const startTs = start.getTime();
          const endTs = startTs + (durationMinutes * 60 * 1000);
          if (nowTs >= startTs && nowTs < endTs) {
            if (!best || endTs < best.endTs) {
              best = { startTs, endTs };
            }
          }
        });
      });
      return best;
    }

    const startMinutes = this._timeToMinutes(attrs?.start_time);
    const endMinutes = this._timeToMinutes(attrs?.end_time);
    if (startMinutes === null || endMinutes === null) {
      return null;
    }

    const candidates = [yesterday, today];
    for (const dateRef of candidates) {
      if (!this._taskMatchesDate(attrs, dateRef)) {
        continue;
      }

      const start = new Date(dateRef);
      start.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
      const end = new Date(dateRef);
      if (endMinutes <= startMinutes) {
        end.setDate(end.getDate() + 1);
      }
      end.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);

      const startTs = start.getTime();
      const endTs = end.getTime();
      if (nowTs >= startTs && nowTs < endTs) {
        return { startTs, endTs };
      }
    }

    return null;
  }

  _taskCurrentEndTimestamp(attrs, nowTs) {
    const bounds = this._taskCurrentActiveSegmentBounds(attrs, nowTs);
    return bounds ? bounds.endTs : null;
  }

  _updatePostScheduleRunHintFromTasks() {
    const managerMode = this._boilerManagerModeEntity();
    if (this._isVacationModeEnabled(managerMode)) {
      this._lastResolvedScheduleSegment = null;
      this._lastResolvedManualTimedSegment = null;
      this._postScheduleRunHint = null;
      this._clearPersistedHeatHint();
      return;
    }

    const now = Date.now();
    const windowMs = 30 * 60 * 1000;

    if (this._postScheduleRunHint && now >= this._postScheduleRunHint.validUntil) {
      this._postScheduleRunHint = null;
      this._clearPersistedHeatHint();
    }

    const boilerId = String(this._config?.boiler_entity || "").trim();
    const boilerState = boilerId ? this._hass?.states?.[boilerId] : null;
    const heatingNow =
      this._isEntityOn(boilerState) ||
      this._isBuiltInTimedMode(managerMode) ||
      !!this._currentActiveTask();
    if (heatingNow) {
      this._postScheduleRunHint = null;
      this._clearPersistedHeatHint();
    } else if (!this._postScheduleRunHint) {
      const loaded = this._loadPersistedHeatHint();
      if (loaded && now < loaded.validUntil) {
        this._postScheduleRunHint = loaded;
      } else if (loaded) {
        this._clearPersistedHeatHint();
      }
    }

    if (this._isBuiltInTimedMode(managerMode)) {
      const manualBounds = this._manualTimedSegmentBounds(managerMode);
      if (manualBounds) {
        this._lastResolvedManualTimedSegment = manualBounds;
      }
    }

    const current = this._currentActiveTask();
    if (current) {
      this._lastResolvedScheduleSegment = {
        startTs: current.startTs,
        endTs: current.endTs,
      };
      this._postScheduleRunHint = null;
      return;
    }

    const seg = this._lastResolvedScheduleSegment;
    if (seg) {
      if (now < seg.endTs) {
        return;
      }

      if (now < seg.endTs + windowMs) {
        this._postScheduleRunHint = {
          startClock: this._formatClockTime(seg.startTs),
          validUntil: seg.endTs + windowMs,
        };
        this._savePersistedHeatHint(this._postScheduleRunHint);
        return;
      }

      this._lastResolvedScheduleSegment = null;
    }

    const mseg = this._lastResolvedManualTimedSegment;
    if (mseg && !this._isBuiltInTimedMode(managerMode)) {
      const earlyStopMs = 500;
      if (now < mseg.endTs - earlyStopMs) {
        this._lastResolvedManualTimedSegment = null;
      } else if (now >= mseg.endTs && now < mseg.endTs + windowMs) {
        this._postScheduleRunHint = {
          startClock: this._formatClockTime(mseg.startTs),
          validUntil: mseg.endTs + windowMs,
        };
        this._savePersistedHeatHint(this._postScheduleRunHint);
        return;
      } else if (now >= mseg.endTs + windowMs) {
        this._lastResolvedManualTimedSegment = null;
      }
    }
  }

  _manualTimedSegmentBounds(managerMode) {
    if (!this._isBuiltInTimedMode(managerMode)) {
      return null;
    }
    const raw = String(managerMode?.attributes?.manual_until || "").trim();
    if (!raw) {
      return null;
    }
    const endTs = new Date(raw).getTime();
    if (!Number.isFinite(endTs)) {
      return null;
    }
    const durSec = this._managerManualDurationSeconds(managerMode);
    if (!Number.isInteger(durSec) || durSec <= 0) {
      return null;
    }
    const startTs = endTs - durSec * 1000;
    if (!Number.isFinite(startTs)) {
      return null;
    }
    return { startTs, endTs };
  }

  _heatHintStorageKey() {
    const mode = this._boilerManagerModeEntity();
    const entryId = String(mode?.attributes?.entry_id || "").trim();
    if (!entryId) {
      return null;
    }
    return `boiler-card:heat-hint:${entryId}`;
  }

  _loadPersistedHeatHint() {
    const key = this._heatHintStorageKey();
    if (!key || typeof localStorage === "undefined") {
      return null;
    }
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return null;
      }
      const obj = JSON.parse(raw);
      const validUntil = Number(obj?.validUntil);
      const startClock = String(obj?.startClock || "").trim();
      if (!Number.isFinite(validUntil) || !startClock) {
        return null;
      }
      return { startClock, validUntil };
    } catch (_error) {
      return null;
    }
  }

  _savePersistedHeatHint(hint) {
    const key = this._heatHintStorageKey();
    if (!key || !hint || typeof localStorage === "undefined") {
      return;
    }
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          startClock: String(hint.startClock || "").trim(),
          validUntil: Number(hint.validUntil),
        })
      );
    } catch (_error) {
      /* quota / private mode */
    }
  }

  _clearPersistedHeatHint() {
    const key = this._heatHintStorageKey();
    if (!key || typeof localStorage === "undefined") {
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch (_error) {
      /* ignore */
    }
  }

  _timelinePointDurationMinutes(point) {
    const minutesRaw = Number.parseInt(String(point?.duration_minutes ?? ""), 10);
    if (Number.isInteger(minutesRaw) && minutesRaw > 0) {
      return minutesRaw;
    }

    const fromOption = this._optionToMinutes(point?.duration_option);
    if (Number.isInteger(fromOption) && fromOption > 0) {
      return fromOption;
    }

    return null;
  }

  _formatClockTime(ts) {
    if (!Number.isFinite(ts)) {
      return "--:--";
    }
    const date = new Date(ts);
    if (!Number.isFinite(date.getTime())) {
      return "--:--";
    }
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  _syncUpcomingTaskNotice() {
    const notice = this._elements.upcomingTaskNotice;
    if (!notice) {
      return;
    }

    if (this._isVacationModeEnabled(this._boilerManagerModeEntity())) {
      notice.hidden = true;
      notice.textContent = "";
      return;
    }

    const upcoming = this._nextUpcomingTask(300);
    if (!upcoming) {
      notice.hidden = true;
      notice.textContent = "";
      return;
    }

    const label = upcoming.name || this._t("tasks_title");
    notice.textContent = `${label} • ${this._t("upcoming_task_starts_in")} ${this._formatSeconds(upcoming.secondsLeft)}`;
    notice.hidden = false;
  }

  _nextUpcomingTask(withinSeconds = 300) {
    const nowTs = Date.now();
    const maxSeconds = Math.max(0, Number.parseInt(withinSeconds, 10) || 0);
    let nearest = null;

    this._taskSwitchEntities().forEach((taskState) => {
      const enabled = String(taskState?.state || "").toLowerCase() === "on";
      if (!enabled) {
        return;
      }
      const attrs = taskState?.attributes || {};
      if (this._asTruthy(attrs.active_now)) {
        return;
      }

      const startTs = this._nextTaskStartTimestamp(attrs, nowTs);
      if (startTs === null) {
        return;
      }
      const secondsLeft = Math.ceil((startTs - nowTs) / 1000);
      if (secondsLeft < 0 || secondsLeft > maxSeconds) {
        return;
      }

      if (!nearest || secondsLeft < nearest.secondsLeft) {
        nearest = {
          secondsLeft,
          name: String(attrs.task_name || attrs.friendly_name || attrs.task_id || "").trim(),
        };
      }
    });

    return nearest;
  }

  _nextTaskStartTimestamp(attrs, nowTs) {
    const startMinutes = this._taskStartMinutes(attrs).sort((a, b) => a - b);
    if (startMinutes.length === 0) {
      return null;
    }

    const now = new Date(nowTs);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lookAheadDays = 370;

    for (let dayOffset = 0; dayOffset <= lookAheadDays; dayOffset += 1) {
      const dayDate = new Date(today);
      dayDate.setDate(today.getDate() + dayOffset);
      if (!this._taskMatchesDate(attrs, dayDate)) {
        continue;
      }
      for (const minutes of startMinutes) {
        const candidate = new Date(dayDate);
        candidate.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
        const ts = candidate.getTime();
        if (ts >= nowTs) {
          return ts;
        }
      }
    }

    return null;
  }

  _taskStartMinutes(attrs) {
    const taskType = String(attrs?.task_type || "window").toLowerCase();
    if (taskType === "timeline" && Array.isArray(attrs?.timeline_points)) {
      return attrs.timeline_points
        .map((point) => this._timeToMinutes(point?.at))
        .filter((value) => value !== null);
    }

    const single = this._timeToMinutes(attrs?.start_time);
    return single === null ? [] : [single];
  }

  _timeToMinutes(value) {
    if (typeof value !== "string") {
      return null;
    }
    const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
    if (!match) {
      return null;
    }
    const hh = Number.parseInt(match[1], 10);
    const mm = Number.parseInt(match[2], 10);
    if (!Number.isInteger(hh) || !Number.isInteger(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) {
      return null;
    }
    return (hh * 60) + mm;
  }

  _taskMatchesDate(attrs, dateObj) {
    const weekday = (dateObj.getDay() + 6) % 7;
    const month = dateObj.getMonth() + 1;
    const days = Array.isArray(attrs?.days)
      ? attrs.days.map((item) => Number.parseInt(item, 10)).filter((item) => Number.isInteger(item) && item >= 0 && item <= 6)
      : [0, 1, 2, 3, 4, 5, 6];
    const months = Array.isArray(attrs?.months)
      ? attrs.months.map((item) => Number.parseInt(item, 10)).filter((item) => Number.isInteger(item) && item >= 1 && item <= 12)
      : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    if (!days.includes(weekday) || !months.includes(month)) {
      return false;
    }

    const recurrence = String(attrs?.recurrence || "forever").toLowerCase();
    const key = this._dateToKey(dateObj);
    const startDate = this._validDateKey(attrs?.start_date);
    const endDate = this._validDateKey(attrs?.end_date);

    if (recurrence === "once") {
      if (startDate && key < startDate) {
        return false;
      }
      if (endDate && key > endDate) {
        return false;
      }
      return true;
    }

    if (startDate && key < startDate) {
      return false;
    }
    if (endDate && key > endDate) {
      return false;
    }
    return true;
  }

  _validDateKey(value) {
    if (typeof value !== "string") {
      return null;
    }
    const normalized = value.trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : null;
  }

  _dateToKey(dateObj) {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  _asTruthy(value) {
    if (typeof value === "boolean") {
      return value;
    }
    const normalized = String(value || "").trim().toLowerCase();
    return ["1", "true", "yes", "on", "active"].includes(normalized);
  }

  _syncScheduleList() {
    const list = this._elements.tasksList;
    if (!list) {
      return;
    }

    const tasks = this._taskSwitchEntities();
    const hebcalStamp = String(this._guideHebcalPayload?.fetched_at || "");
    const renderKey = JSON.stringify({
      lang: this._lang(),
      hebcal_stamp: hebcalStamp,
      tasks: tasks.map((taskState) => ({
        entity_id: taskState.entity_id,
        state: taskState.state,
        task_id: taskState.attributes?.task_id || "",
        task_name: taskState.attributes?.task_name || "",
        start_time: taskState.attributes?.start_time || "",
        end_time: taskState.attributes?.end_time || "",
        task_type: taskState.attributes?.task_type || "",
        timeline_label: taskState.attributes?.timeline_label || "",
        days: Array.isArray(taskState.attributes?.days) ? taskState.attributes.days : [],
        condition_entity: taskState.attributes?.condition_entity || "",
        condition_operator: taskState.attributes?.condition_operator || "",
        skip_if_state: taskState.attributes?.skip_if_state || "",
        trigger_mode: taskState.attributes?.trigger_mode || "",
        hebcal_event_kind: taskState.attributes?.hebcal_event_kind || "",
        hebcal_holiday_mode: taskState.attributes?.hebcal_holiday_mode || "",
      })),
    });
    if (renderKey === this._tasksListRenderKey) {
      return;
    }
    this._tasksListRenderKey = renderKey;

    list.innerHTML = "";

    if (tasks.length === 0) {
      const empty = document.createElement("p");
      empty.className = "tasks-empty";
      empty.textContent = this._t("tasks_empty");
      list.appendChild(empty);
      return;
    }

    tasks.forEach((taskState) => {
      const attrs = taskState.attributes || {};
      const item = document.createElement("div");
      item.className = "task-item";

      const main = document.createElement("div");
      main.className = "task-main";

      const name = document.createElement("p");
      name.className = "task-name";
      name.textContent = attrs.task_name || attrs.friendly_name || attrs.task_id || taskState.entity_id;
      main.appendChild(name);

      const meta = document.createElement("p");
      meta.className = "task-meta";
      meta.textContent = buildTaskMetaText(attrs, {
        t: this._t.bind(this),
        formatScheduleDays: (days) => this._formatScheduleDays(days),
        normalizeConditionOperator: (value) => this._normalizeConditionOperator(value),
        conditionOperatorLabel: (value) => this._conditionOperatorLabel(value),
        hebcalTaskListCaption: (taskAttrs) => this._hebcalTaskListHebcalCaption(taskAttrs),
      });
      main.appendChild(meta);

      const actions = document.createElement("div");
      actions.className = "task-actions";
      actions.dataset.taskEntityId = String(taskState.entity_id || "");
      actions.dataset.taskId = String(attrs.task_id || "");

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "task-toggle-btn";
      toggle.dataset.action = "toggle";
      const isOn = String(taskState.state || "").toLowerCase() === "on";
      toggle.classList.toggle("on", isOn);
      toggle.textContent = isOn ? this._t("task_disable") : this._t("task_enable");
      actions.appendChild(toggle);

      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "task-edit-btn";
      edit.dataset.action = "edit";
      edit.textContent = this._t("task_edit");
      edit.disabled = !this._hasScheduleUpdateService();
      actions.appendChild(edit);

      const del = document.createElement("button");
      del.type = "button";
      del.className = "task-delete-btn";
      del.dataset.action = "delete";
      del.textContent = this._t("task_delete");
      actions.appendChild(del);

      actions.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const target = event?.target;
        if (!(target instanceof Element)) {
          return;
        }
        const button = target.closest("button[data-action]");
        if (!(button instanceof HTMLButtonElement) || button.disabled) {
          return;
        }
        const action = String(button.dataset.action || "").trim().toLowerCase();
        const taskEntityId = String(actions.dataset.taskEntityId || "").trim();
        const taskId = String(actions.dataset.taskId || "").trim();

        if (action === "toggle") {
          if (!taskEntityId) {
            return;
          }
          const currentState = String(this._hass?.states?.[taskEntityId]?.state || "").toLowerCase();
          const shouldTurnOff = currentState === "on";
          const [domain] = taskEntityId.split(".", 1);
          this._hass?.callService(domain || "homeassistant", shouldTurnOff ? "turn_off" : "turn_on", { entity_id: taskEntityId });
          return;
        }

        if (action === "edit") {
          this._openScheduleModalForTask(taskState);
          return;
        }

        if (action === "delete") {
          if (!taskId || !this._hasScheduleDeleteService()) {
            return;
          }
          this._callConfiguredService(this._config.service_delete_schedule, {
            ...this._builtInServiceBaseData(),
            task_id: taskId,
          });
        }
      });

      item.appendChild(main);
      item.appendChild(actions);
      list.appendChild(item);
    });
  }

  _formatHistoryLocalDateTime(isoOrRaw) {
    return formatHistoryLocalDateTime(isoOrRaw);
  }

  _exportHistoryLog() {
    const managerMode = this._boilerManagerModeEntity();
    const raw = Array.isArray(managerMode?.attributes?.task_history)
      ? managerMode.attributes.task_history
      : [];
    const taskHistory = normalizeHistoryRows(raw);
    if (taskHistory.length === 0) {
      return;
    }

    const payload = historyExportPayload(taskHistory);
    const jsonText = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonText], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = `boiler_task_history_${stamp}.json`;
    document.body.appendChild(link);
    try {
      link.click();
    } catch (_error) {
      window.open(url, "_blank", "noopener");
    }
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  _syncHistoryList(managerMode = null) {
    const list = this._elements.historyList;
    if (!list) {
      return;
    }
    const rows = Array.isArray(managerMode?.attributes?.task_history)
      ? managerMode.attributes.task_history
      : [];
    const normalized = normalizeHistoryRows(rows)
      .slice(-100)
      .reverse();
    const fullCount = rows.filter((row) => row && typeof row === "object").length;
    if (this._elements.historyExportBtn) {
      this._elements.historyExportBtn.disabled = fullCount === 0;
    }
    if (this._elements.historyClearBtn) {
      this._elements.historyClearBtn.disabled = fullCount === 0 || !this._hasClearHistoryService();
    }

    const renderKey = JSON.stringify({ lang: this._lang(), rows: normalized });
    if (renderKey === this._historyListRenderKey) {
      return;
    }
    this._historyListRenderKey = renderKey;

    list.innerHTML = "";
    if (normalized.length === 0) {
      const empty = document.createElement("p");
      empty.className = "tasks-empty";
      empty.textContent = this._t("history_empty");
      list.appendChild(empty);
      return;
    }

    normalized.forEach((row) => {
      const item = document.createElement("div");
      item.className = "history-item";

      const head = document.createElement("p");
      head.className = "history-item-head";
      head.textContent = this._formatHistoryLocalDateTime(row.ts);

      const meta = document.createElement("p");
      meta.className = "history-item-meta";
      const base = row.details ? `${row.action}: ${row.details}` : row.action || "--";
      meta.textContent = row.user ? `${base} · ${row.user}` : base;

      item.appendChild(head);
      item.appendChild(meta);
      list.appendChild(item);
    });
  }

  _handleTurnOff() {
    const buttons = this._elements.quickTimerBtns || [];
    this._offPendingUntil = Date.now() + 12000;
    let offButton = null;
    buttons.forEach((button) => {
      const isOffButton = button.dataset.action === "off";
      button.classList.toggle("selected", isOffButton);
      if (isOffButton) {
        offButton = button;
      }
    });
    offButton?.focus({ preventScroll: true });
    this._sync();

    this._forceOffConfiguredEntity();

    const offService = this._resolvedControlService(
      this._config.service_off,
      "service_off"
    );
    const servicePayload = this._isSwitcherMode()
      ? this._controlServiceBaseData(offService)
      : this._builtInServiceBaseData();
    // Then call integration off flow for cleanup.
    this._callConfiguredService(offService, servicePayload);

    if (this._isSmarthome4uProfile()) {
      this._setSmarthome4uBoostMinutes(this._smarthome4uOffBoostMinutes());
    }

    if (this._config.timer_entity) {
      this._hass?.callService("timer", "cancel", {
        entity_id: this._config.timer_entity,
      });
    }
  }

  _forceOffConfiguredEntity() {
    if (!this._hass) {
      return;
    }
    const entityId = String(this._config.boiler_entity || "").trim();
    if (!entityId || !entityId.includes(".")) {
      return;
    }

    const [entityDomain] = entityId.split(".", 1);
    if (entityDomain) {
      this._callEntityAction(`${entityDomain}.turn_off`, entityId, null);
    }
    this._callEntityAction("homeassistant.turn_off", entityId, null);

    const entityState = this._hass.states?.[entityId];
    if (entityDomain === "climate") {
      const hvacModes = Array.isArray(entityState?.attributes?.hvac_modes)
        ? entityState.attributes.hvac_modes.map((item) => String(item || "").trim().toLowerCase())
        : [];
      if (hvacModes.includes("off") && this._isServiceAvailable("climate.set_hvac_mode")) {
        this._hass.callService("climate", "set_hvac_mode", {
          entity_id: entityId,
          hvac_mode: "off",
        });
      }
    }

    if (entityDomain === "water_heater") {
      const operationModesRaw = entityState?.attributes?.operation_list || entityState?.attributes?.operation_modes;
      const operationModes = Array.isArray(operationModesRaw)
        ? operationModesRaw.map((item) => String(item || "").trim().toLowerCase())
        : [];
      if (operationModes.includes("off") && this._isServiceAvailable("water_heater.set_operation_mode")) {
        this._hass.callService("water_heater", "set_operation_mode", {
          entity_id: entityId,
          operation_mode: "off",
        });
      }
    }
  }

  _forceOnConfiguredEntity() {
    if (!this._hass) {
      return;
    }
    const entityId = String(this._config.boiler_entity || "").trim();
    if (!entityId || !entityId.includes(".")) {
      return;
    }

    const [entityDomain] = entityId.split(".", 1);
    if (entityDomain) {
      this._callEntityAction(`${entityDomain}.turn_on`, entityId, null);
    }
    this._callEntityAction("homeassistant.turn_on", entityId, null);
  }

  _callConfiguredService(serviceRef, data = null) {
    return callServiceRef(this._hass, serviceRef, data);
  }

  _builtInServiceBaseData() {
    return builtInServiceBaseData(this._config, this._hass?.states);
  }

  _isKnownEntryId(entryId) {
    return isKnownEntryId(entryId, this._hass?.states);
  }

  _controlServiceBaseData(serviceRef = "") {
    return controlServiceBaseData({
      isSwitcherMode: this._isSwitcherMode(),
      serviceRef,
      config: this._config,
      hassStates: this._hass?.states,
    });
  }

  _resolvedControlService(serviceRef, serviceKey = "") {
    return resolveControlService({
      serviceRef,
      serviceKey,
      isSwitcherMode: this._isSwitcherMode(),
      isServiceAvailable: (ref) => this._isServiceAvailable(ref),
      defaultConfig: DEFAULT_CONFIG,
    });
  }

  _isBoilerManagerService(serviceRef) {
    return isBoilerManagerService(serviceRef);
  }

  _hasBuiltInControlServices() {
    const runTimedService = this._resolvedControlService(
      this._config.service_run_timed,
      "service_run_timed"
    );
    const onContinuousService = this._resolvedControlService(
      this._config.service_on_continuous,
      "service_on_continuous"
    );
    const offService = this._resolvedControlService(
      this._config.service_off,
      "service_off"
    );
    return this._isServiceAvailable(runTimedService)
      && this._isServiceAvailable(onContinuousService)
      && this._isServiceAvailable(offService);
  }

  _hasScheduleCreateService() {
    return this._isServiceAvailable(this._config.service_create_schedule);
  }

  _hasTimelineCreateService() {
    return this._isServiceAvailable(this._config.service_create_timeline);
  }

  _hasAnyTaskCreateService() {
    return this._hasScheduleCreateService() || this._hasTimelineCreateService();
  }

  _hasScheduleUpdateService() {
    return this._isServiceAvailable(this._config.service_update_schedule);
  }

  _hasScheduleDeleteService() {
    return this._isServiceAvailable(this._config.service_delete_schedule);
  }

  _hasTaskImportService() {
    return this._isServiceAvailable(this._config.service_import_tasks);
  }

  _hasVacationModeService() {
    return this._isServiceAvailable(this._config.service_set_vacation_mode);
  }

  _hasClearHistoryService() {
    return this._isServiceAvailable(this._config.service_clear_task_history);
  }

  async _confirmClearHistoryLog() {
    if (!this._hass || !this._hasClearHistoryService()) {
      return;
    }
    const managerMode = this._boilerManagerModeEntity();
    const raw = Array.isArray(managerMode?.attributes?.task_history)
      ? managerMode.attributes.task_history
      : [];
    const fullCount = raw.filter((row) => row && typeof row === "object").length;
    if (fullCount === 0) {
      return;
    }
    const ok = await this._openConfirmModal(this._t("history_clear_confirm"), {
      title: this._t("history_clear_log"),
    });
    if (!ok) {
      return;
    }
    this._callConfiguredService(this._config.service_clear_task_history, this._builtInServiceBaseData());
    this._historyListRenderKey = "";
    this._syncHistoryList(this._boilerManagerModeEntity());
  }

  _isServiceRef(value) {
    return isServiceRef(value);
  }

  _isServiceAvailable(serviceRef) {
    return isServiceAvailable(this._hass, serviceRef);
  }

  _callEntityAction(action, entityId, data = null) {
    if (!this._hass || !entityId) {
      return;
    }

    const normalizedAction = String(action || "").trim().toLowerCase();
    const [domain, service] = normalizedAction.includes(".")
      ? normalizedAction.split(".", 2)
      : ["homeassistant", normalizedAction || "turn_off"];

    if (!domain || !service) {
      return;
    }

    this._hass.callService(domain, service, {
      ...this._safeServiceData(data),
      entity_id: entityId,
    });
  }

  _remainingSeconds(timer) {
    const attrs = timer?.attributes || {};

    if (attrs.finishes_at) {
      const finishTs = new Date(attrs.finishes_at).getTime();
      if (Number.isFinite(finishTs)) {
        return Math.max(0, Math.ceil((finishTs - Date.now()) / 1000));
      }
    }

    const remaining = this._parseDurationString(attrs.remaining);
    if (remaining !== null) {
      return remaining;
    }

    const duration = this._parseDurationString(attrs.duration);
    if (duration !== null) {
      return duration;
    }

    return null;
  }

  _parseDurationString(value) {
    return parseDurationString(value);
  }

  _formatSeconds(seconds) {
    return formatSeconds(seconds);
  }

  _isNoTimerOption(value) {
    return isNoTimerOption(value);
  }

  _optionToMinutes(value) {
    return optionToMinutes(value);
  }

  _optionByMinutes(minutes, options) {
    return optionByMinutes(minutes, options);
  }

  _optionToHhMmSs(value) {
    return optionToHhMmSs(value);
  }

  _clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  _colorByHeat(progress) {
    const cool = "#2b7fff";
    const warm = "#f3d34f";
    const hot = "#f97316";
    const veryHot = "#dc2626";
    const p = this._clamp(progress, 0, 1);

    if (p < 0.3) {
      return cool;
    }
    if (p < 0.5) {
      return warm;
    }
    if (p < 0.7) {
      return hot;
    }
    return veryHot;
  }

  _mixColors(hexA, hexB, weight) {
    const a = this._hexToRgb(hexA);
    const b = this._hexToRgb(hexB);
    const t = this._clamp(weight, 0, 1);

    const mix = {
      r: Math.round(a.r + (b.r - a.r) * t),
      g: Math.round(a.g + (b.g - a.g) * t),
      b: Math.round(a.b + (b.b - a.b) * t),
    };
    return this._rgbToHex(mix.r, mix.g, mix.b);
  }

  _hexToRgb(hex) {
    const normalized = String(hex).replace("#", "").trim();
    const full = normalized.length === 3
      ? normalized.split("").map((char) => `${char}${char}`).join("")
      : normalized;

    const num = Number.parseInt(full, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }

  _hexToRgba(hex, alpha) {
    const rgb = this._hexToRgb(hex);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this._clamp(alpha, 0, 1)})`;
  }

  _rgbToHex(r, g, b) {
    const toHex = (value) => this._clamp(value, 0, 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  _lang() {
    const configured = String(this._config?.language || "").trim().toLowerCase();
    if (SUPPORTED_LANGUAGES.includes(configured)) {
      return configured;
    }
    return "he";
  }

  _t(key) {
    const lang = this._lang();
    return I18N[lang]?.[key] ?? I18N.he[key] ?? key;
  }

  _formatWarmedPercent(percent) {
    return `${percent}% ${this._t("warmed_suffix")}`;
  }

  _safeServiceData(value) {
    return safeServiceData(value);
  }

  _stateListFromConfig(value, fallback) {
    return stateListFromConfig(value, fallback);
  }

  _isEntityOn(entity) {
    return isEntityOn(entity, {
      stateOnValues: this._config.state_on_values,
      stateOffValues: this._config.state_off_values,
    });
  }

  _boilerManagerModeEntity() {
    if (!this._hass?.states) {
      return null;
    }

    const desiredEntryId = String(this._config.integration_entry_id || "").trim();
    const desiredBoiler = String(this._config.boiler_entity || "").trim().toLowerCase();
    const candidates = Object.values(this._hass.states)
      .filter((state) => state?.entity_id?.startsWith("sensor."))
      .filter((state) => {
        const attrs = state?.attributes || {};
        const boilerEntity = String(attrs.boiler_entity || "").trim();
        if (!boilerEntity || !boilerEntity.includes(".")) {
          return false;
        }
        return attrs.active_tasks_count !== undefined;
      });

    if (candidates.length === 0) {
      return null;
    }

    if (desiredEntryId) {
      return candidates.find((state) => String(state?.attributes?.entry_id || "").trim() === desiredEntryId) || null;
    }

    if (desiredBoiler) {
      return candidates.find(
        (state) => String(state?.attributes?.boiler_entity || "").trim().toLowerCase() === desiredBoiler
      ) || null;
    }

    return candidates[0] || null;
  }

  _isBuiltInTimedMode(managerMode) {
    const mode = String(managerMode?.state || "").trim().toLowerCase();
    return mode === "manual_timed";
  }

  _isBuiltInScheduleMode(managerMode) {
    const mode = String(managerMode?.state || "").trim().toLowerCase();
    return mode === "schedule";
  }

  _maybeCancelLegacyTimerForSchedule(managerMode) {
    if (!this._hass || !this._isBuiltInScheduleMode(managerMode)) {
      return;
    }

    const timerEntityId = String(this._config?.timer_entity || "").trim();
    if (!timerEntityId) {
      return;
    }

    const timerState = this._hass.states?.[timerEntityId];
    if (timerState?.state !== "active" && timerState?.state !== "paused") {
      return;
    }

    const now = Date.now();
    if (
      this._lastLegacyTimerCancelEntity === timerEntityId
      && now - this._lastLegacyTimerCancelAt < 1500
    ) {
      return;
    }

    this._lastLegacyTimerCancelEntity = timerEntityId;
    this._lastLegacyTimerCancelAt = now;
    this._hass.callService("timer", "cancel", { entity_id: timerEntityId });
  }

  _managerTimedRemainingSeconds(managerMode) {
    const raw = String(managerMode?.attributes?.manual_until || "").trim();
    if (!raw) {
      return null;
    }

    const finishTs = new Date(raw).getTime();
    if (!Number.isFinite(finishTs)) {
      return null;
    }
    return Math.max(0, Math.ceil((finishTs - Date.now()) / 1000));
  }

  _managerContinuousElapsedSeconds(managerMode) {
    if (!managerMode) {
      return null;
    }
    if (String(managerMode.state || "").trim().toLowerCase() !== "manual_continuous") {
      return null;
    }
    const raw = String(managerMode.attributes?.manual_continuous_started_at || "").trim();
    if (!raw) {
      return null;
    }
    const startTs = new Date(raw).getTime();
    if (!Number.isFinite(startTs)) {
      return null;
    }
    return Math.max(0, Math.floor((Date.now() - startTs) / 1000));
  }

  _managerManualDurationSeconds(managerMode) {
    const raw = Number.parseInt(String(managerMode?.attributes?.manual_duration_seconds ?? ""), 10);
    if (!Number.isInteger(raw) || raw <= 0) {
      return null;
    }
    return raw;
  }

  _isVacationModeEnabled(managerMode) {
    return this._asTruthy(managerMode?.attributes?.vacation_mode);
  }

  _deviceProfile() {
    const raw = String(this._config?.device_profile || "").trim().toLowerCase();
    if (raw === "switcher_touch" || raw === "boiler_smarthome4u" || raw === "standard") {
      return raw;
    }
    if (this._asTruthy(this._config?.switcher_mode)) {
      return "switcher_touch";
    }
    return "standard";
  }

  _normalizeUiScalePercent(value) {
    const parsed = Number.parseInt(String(value ?? this._config?.ui_scale_percent ?? 100), 10);
    if (!Number.isFinite(parsed)) {
      return 100;
    }
    return Math.min(130, Math.max(90, parsed));
  }

  _isMobilePopupFullscreenEnabled() {
    const raw = this._config?.mobile_popup_fullscreen;
    if (raw === undefined || raw === null || raw === "") {
      return true;
    }
    return this._asTruthy(raw);
  }

  _applyUiScaleSettings() {
    const scalePercent = this._normalizeUiScalePercent(this._config?.ui_scale_percent);
    const scale = scalePercent / 100;
    this.style.setProperty("--boiler-ui-scale", scale.toFixed(2));
    this.style.setProperty("--boiler-popup-scale", scale.toFixed(2));
    this.setAttribute("data-mobile-popup-fullscreen", this._isMobilePopupFullscreenEnabled() ? "true" : "false");
  }

  _profileDefaultFlowImage() {
    const profile = this._deviceProfile();
    if (profile === "switcher_touch") {
      return "/local/boiler-card/switcher-touch.png";
    }
    if (profile === "boiler_smarthome4u") {
      return "/local/boiler-card/boiler-smarthome4u.png";
    }
    return "/local/boiler-card/boiler-flow.png";
  }

  _usesExtendedTimerUi() {
    return this._deviceProfile() === "switcher_touch";
  }

  _isSmarthome4uProfile() {
    return this._deviceProfile() === "boiler_smarthome4u";
  }

  /** Switcher Touch only: alternate control services and sensor row layout. */
  _isSwitcherMode() {
    return this._deviceProfile() === "switcher_touch";
  }

  _temperatureSensorEntityId() {
    if (this._isSwitcherMode() && this._isConfiguredSensorEntity(this._config?.switcher_icon_sensor)) {
      return String(this._config.switcher_icon_sensor).trim();
    }
    return String(this._config?.temperature_sensor || "").trim();
  }

  _switcherStatusLine(boiler) {
    const isOn = this._isEntityOn(boiler);
    const parts = [];
    if (isOn) {
      const timeLeft = this._switcherSensorDisplayValue(this._config.switcher_time_left_sensor, { withUnit: false });
      const sensor1 = this._switcherSensorDisplayValue(this._config.switcher_sensor_1);
      const sensor2 = this._switcherSensorDisplayValue(this._config.switcher_sensor_2);
      if (timeLeft) {
        parts.push(timeLeft);
      }
      if (sensor1) {
        parts.push(sensor1);
      }
      if (sensor2) {
        parts.push(sensor2);
      }
      if (parts.length === 0) {
        parts.push(this._t("status_on"));
      }
      return parts.join(" • ");
    }

    parts.push(this._t("status_off"));
    const sensor2 = this._switcherSensorDisplayValue(this._config.switcher_sensor_2);
    if (sensor2) {
      parts.push(sensor2);
    }
    return parts.join(" • ");
  }

  _switcherSensorDisplayValue(entityId, options = null) {
    if (!this._hass || !this._isConfiguredSensorEntity(entityId)) {
      return "";
    }
    const entity = this._hass.states?.[entityId];
    if (!this._hasAvailableSensorValue(entity)) {
      return "";
    }

    const withUnit = options?.withUnit !== false;
    if (!withUnit) {
      return String(entity?.state || "").trim();
    }
    return this._formatSensorValue(entity);
  }

  _switcherTimerOptionsFromConfig() {
    return this._timerOptionsFromConfigValues(this._config?.switcher_timer_values, 150);
  }

  _smarthome4uTimerOptionsFromConfig() {
    const source = this._config?.boost_timer_values || DEFAULT_CONFIG.boost_timer_values;
    return this._timerOptionsFromConfigValues(source, 240, false);
  }

  _regularTimerOptionsFromConfig() {
    const raw = String(this._config?.timer_values || "").trim();
    const source = raw || DEFAULT_CONFIG.timer_values;
    return this._timerOptionsFromConfigValues(source, 1440);
  }

  _smarthome4uOffBoostMinutes() {
    const raw = Number.parseInt(String(this._config?.off_boost_minutes ?? DEFAULT_CONFIG.off_boost_minutes), 10);
    if (!Number.isInteger(raw) || raw <= 0) {
      return 90;
    }
    return raw;
  }

  _setSmarthome4uBoostMinutes(minutes) {
    if (!this._hass) {
      return;
    }
    const entityId = String(this._config?.boost_time_entity || "").trim();
    if (!this._isConfiguredSensorEntity(entityId) || !entityId.startsWith("number.")) {
      return;
    }
    const safeMinutes = Number.parseInt(String(minutes), 10);
    if (!Number.isInteger(safeMinutes) || safeMinutes <= 0) {
      return;
    }
    if (this._isServiceAvailable("number.set_value")) {
      this._hass.callService("number", "set_value", {
        entity_id: entityId,
        value: safeMinutes,
      });
    }
  }

  _timerOptionsFromConfigValues(raw, maxMinutes = 240, includeNoTimer = true) {
    const values = Array.isArray(raw)
      ? raw
      : String(raw || "")
        .split(/[,\s]+/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

    const safeMax = Number.isInteger(maxMinutes) && maxMinutes > 0 ? maxMinutes : 240;
    const minutes = Array.from(new Set(values
      .map((item) => Number.parseInt(String(item), 10))
      .filter((item) => Number.isInteger(item) && item > 0 && item <= safeMax)))
      .sort((a, b) => a - b);

    if (minutes.length === 0) {
      return [];
    }

    const options = minutes.map((value) => `${value}m`);
    if (includeNoTimer) {
      options.push("No Timer");
    }
    return options;
  }

}

if (!customElements.get("boiler-water-card")) {
  customElements.define("boiler-water-card", BoilerWaterCard);
}

registerBoilerCardEditor({
  DEFAULT_CONFIG,
  HEBCAL_CITY_META,
  I18N,
  SUPPORTED_LANGUAGES,
});


window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "boiler-water-card")) {
  window.customCards.push({
    type: "boiler-water-card",
    name: "Boiler Water Card",
    description: "Styled control card for boiler On/Off and timer selection.",
  });
}
