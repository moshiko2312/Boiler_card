import { I18N, SUPPORTED_LANGUAGES } from "./boiler-i18n.js";
import { registerBoilerCardEditor } from "./boiler-editor.js";
import { buildThemeCss, normalizeCardTheme } from "./boiler-themes.js";
import { HEBCAL_CITY_META, DEFAULT_CONFIG } from "./boiler-config.js";

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
    this._handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        this._closeTimerModal();
        this._closeScheduleModal();
        this._closeConfirmModal(false);
        this._closeImportSelectionModal(false);
        this._closeGuideModal();
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
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --boiler-bg-a: var(--ha-card-background, var(--card-background-color, #fff7ec));
          --boiler-bg-b: var(--ha-card-background, var(--card-background-color, #f8fdff));
          --boiler-text: var(--primary-text-color, #192436);
          --boiler-muted: var(--secondary-text-color, #5a6880);
          --boiler-accent: #86d6ee;
          --boiler-accent-soft: #d8f5ff;
          --boiler-ok: #198754;
          --boiler-off: #64748b;
          --boiler-danger: var(--error-color, #c63d2f);
          display: block;
          width: 100%;
          box-sizing: border-box;
          font-family: "Heebo", "Rubik", "Noto Sans Hebrew", sans-serif;
        }

        ha-card {
          border-radius: 18px;
          overflow: hidden;
          background: var(--boiler-bg-a);
          border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(120, 140, 170, 0.25)));
          box-shadow: var(--ha-card-box-shadow, 0 12px 26px rgba(20, 40, 80, 0.1));
          animation: card-enter 260ms ease;
        }

        ${buildThemeCss()}
        .wrap {
          display: grid;
          gap: 8px;
          padding: 10px;
          color: var(--boiler-text);
        }

        .row {
          display: block;
        }

        .title {
          margin: 0;
          font-size: clamp(0.92rem, 1.95vw, 1.02rem);
          letter-spacing: 0.01em;
          line-height: 1.2;
          min-width: 0;
          text-align: center;
        }

        .subtitle {
          margin: 0;
          color: var(--boiler-muted);
          font-size: 0.8rem;
          text-align: center;
        }

        .boiler-visual {
          --heat-primary: #38bdf8;
          --heat-secondary: #93c5fd;
          --heat-glow: rgba(56, 189, 248, 0.35);
          --heat-progress: 0%;
          display: grid;
          grid-template-columns: 96px 1fr;
          align-items: center;
          gap: 8px;
          border-radius: 12px;
          padding: 6px 8px;
          border: 1px solid var(--divider-color, rgba(50, 88, 128, 0.12));
          background: linear-gradient(
            160deg,
            rgba(255, 255, 255, 0.3),
            rgba(255, 255, 255, 0.14)
          );
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
        }

        .boiler-icon {
          width: 90px;
          height: 60px;
          margin: 0 auto;
          border-radius: 10px;
          border: 2px solid #264160;
          background: linear-gradient(180deg, #f8fbff 0%, #e6eef8 100%);
          overflow: hidden;
          box-shadow: 0 0 0 0 var(--heat-glow);
          animation: boiler-glow 1.8s ease-in-out infinite;
        }

        .boiler-main-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: saturate(1.05) contrast(1.03);
          transition: filter 420ms ease;
        }

        .boiler-visual.hide-boiler-flow-image {
          grid-template-columns: 1fr;
          gap: 0;
        }

        .boiler-visual.hide-boiler-flow-image .boiler-icon {
          display: none;
        }

        .boiler-meta {
          display: grid;
          gap: 3px;
        }

        .boiler-stage {
          display: none;
        }

        .boiler-stage-sub {
          grid-area: stage;
          margin: 0;
          font-size: 0.72rem;
          font-weight: 800;
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.42);
          justify-self: stretch;
          align-self: end;
          margin-bottom: 1px;
          text-align: center;
        }

        .upcoming-task-notice {
          margin: 0 0 4px;
          padding: 4px 8px;
          border-radius: 8px;
          border: 1px solid rgba(165, 232, 255, 0.52);
          background: linear-gradient(165deg, rgba(69, 157, 212, 0.3), rgba(33, 107, 158, 0.26));
          color: #eef8ff;
          font-size: 0.72rem;
          font-weight: 800;
          text-align: center;
          text-shadow: 0 1px 1px rgba(8, 28, 48, 0.5);
        }

        .active-task-notice {
          margin: 0 0 4px;
          padding: 4px 8px;
          border-radius: 8px;
          border: 1px solid rgba(148, 224, 170, 0.58);
          background: linear-gradient(165deg, rgba(66, 157, 99, 0.32), rgba(30, 109, 63, 0.24));
          color: #eefef3;
          font-size: 0.72rem;
          font-weight: 800;
          text-align: center;
          text-shadow: 0 1px 1px rgba(12, 34, 18, 0.45);
        }

        .vacation-notice {
          margin: 0 0 4px;
          padding: 6px 10px;
          border-radius: 9px;
          border: 1px solid rgba(255, 191, 102, 0.8);
          background: linear-gradient(165deg, rgba(255, 187, 79, 0.3), rgba(210, 118, 22, 0.24));
          color: #fff8e8;
          font-size: 0.74rem;
          font-weight: 900;
          text-align: center;
          letter-spacing: 0.01em;
          text-shadow: 0 1px 1px rgba(56, 24, 2, 0.45);
        }

        .boiler-progress-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto auto;
          grid-template-rows: auto auto auto;
          grid-template-areas:
            "stage value menu"
            "track value menu"
            "track label menu";
          align-items: center;
          column-gap: 6px;
          row-gap: 2px;
        }

        .boiler-progress-track {
          grid-area: track;
          position: relative;
          height: 22px;
          border-radius: 3px;
          background: linear-gradient(
            90deg,
            rgba(245, 248, 252, 0.34),
            rgba(226, 233, 244, 0.2)
          );
          border: 1px solid rgba(196, 210, 228, 0.45);
          box-shadow: inset 0 1px 3px rgba(26, 40, 61, 0.1);
          overflow: hidden;
        }

        .boiler-progress-hint {
          position: absolute;
          inset: 0;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--boiler-muted);
          text-align: center;
          line-height: 1.2;
          padding: 0 5px;
          pointer-events: none;
          z-index: 2;
        }

        .boiler-progress-hint[hidden] {
          display: none !important;
        }

        .boiler-progress-fill {
          position: relative;
          z-index: 1;
          height: 100%;
          width: var(--heat-progress);
          border-radius: 2px;
          background: var(--heat-gradient, linear-gradient(90deg, #2b7fff, #2b7fff));
          box-shadow: 0 0 6px rgba(255, 84, 61, 0.35);
          transition: width 420ms ease;
        }

        .boiler-visual.off .boiler-icon {
          border-color: #6f7e93;
          background: linear-gradient(180deg, #eef2f7 0%, #d4dbe6 100%);
          box-shadow: none;
          animation: none;
        }

        .boiler-visual.off .boiler-main-image {
          filter: grayscale(1) brightness(0.86) contrast(0.95);
        }

        .boiler-visual.off .boiler-progress-track {
          background: linear-gradient(
            90deg,
            rgba(220, 229, 240, 0.24),
            rgba(206, 218, 233, 0.14)
          );
          border-color: rgba(188, 202, 220, 0.4);
        }

        .boiler-visual.off .boiler-progress-fill {
          width: 0 !important;
          background: transparent;
          box-shadow: none;
        }

        /* Post-task hint: theme text so dark/light dashboards both stay readable */
        .boiler-visual.off .boiler-progress-hint {
          color: var(--primary-text-color, var(--boiler-text));
          font-weight: 700;
          letter-spacing: 0.015em;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
        }

        .boiler-visual.off.temp-driven .boiler-progress-track {
          background: linear-gradient(
            90deg,
            rgba(245, 248, 252, 0.34),
            rgba(226, 233, 244, 0.2)
          );
          border-color: rgba(196, 210, 228, 0.45);
        }

        .boiler-visual.off.temp-driven .boiler-progress-fill {
          width: var(--heat-progress) !important;
          background: linear-gradient(90deg, var(--heat-secondary), var(--heat-primary));
          box-shadow: 0 0 8px var(--heat-glow);
        }

        .boiler-visual.temp-driven .boiler-progress-fill {
          background: linear-gradient(90deg, var(--heat-secondary), var(--heat-primary));
          box-shadow: 0 0 8px var(--heat-glow);
        }

        .boiler-visual.temp-driven .boiler-stage-sub {
          font-size: 0.98rem;
          font-weight: 900;
        }

        .countdown-label {
          color: var(--boiler-muted);
          font-size: 0.7rem;
          grid-area: label;
          justify-self: center;
          text-align: center;
        }

        .countdown-value {
          grid-area: value;
          font-size: 1.04rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          color: var(--boiler-text);
        }

        .boiler-progress-row .timer-menu-btn {
          grid-area: menu;
          align-self: center;
        }

        .quick-timers {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(86px, 1fr));
          gap: 6px;
        }

        .sensors-row {
          display: grid;
          grid-template-columns: repeat(var(--sensor-columns, 3), minmax(0, 1fr));
          align-items: stretch;
          justify-items: stretch;
          gap: 6px;
          margin-bottom: 2px;
          width: 100%;
        }

        .sensor-pill {
          border: 0;
          border-radius: 0;
          background: transparent;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 0;
          width: 100%;
          min-height: 0;
          box-shadow: none;
        }

        .sensor-label {
          display: none;
        }

        .sensor-value {
          font-size: 1rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.2;
          text-shadow: 0 1px 2px rgba(8, 26, 42, 0.45);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
          width: 100%;
        }

        .quick-timer-btn {
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 10px;
          min-height: 34px;
          padding: 6px 6px;
          background: linear-gradient(165deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.1));
          color: var(--primary-text-color, #1f2e44);
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
          backdrop-filter: blur(8px) saturate(125%);
          -webkit-backdrop-filter: blur(8px) saturate(125%);
          box-shadow:
            0 4px 10px rgba(20, 35, 58, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.32);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          line-height: 1.2;
          transition:
            transform 120ms ease,
            border-color 120ms ease,
            background 160ms ease,
            box-shadow 160ms ease;
        }

        .quick-timer-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(173, 204, 239, 0.8);
          background: linear-gradient(165deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.14));
          box-shadow:
            0 6px 14px rgba(20, 35, 58, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }

        .quick-timer-btn:focus-visible {
          outline: 2px solid rgba(165, 232, 255, 0.95);
          outline-offset: 2px;
        }

        .quick-timer-btn.selected {
          border-color: rgba(165, 232, 255, 0.95);
          background: linear-gradient(165deg, rgba(102, 190, 224, 0.92), rgba(49, 146, 186, 0.86));
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(12, 56, 78, 0.45);
          box-shadow:
            0 6px 14px rgba(68, 164, 196, 0.24),
            inset 0 1px 0 rgba(255, 255, 255, 0.36);
        }

        .quick-timer-btn.off-action {
          background: linear-gradient(165deg, rgba(210, 223, 239, 0.24), rgba(180, 197, 220, 0.14));
          color: var(--primary-text-color, #1f2e44);
        }

        .quick-timer-btn.off-action.selected {
          border-color: rgba(165, 232, 255, 0.95);
          background: linear-gradient(165deg, rgba(102, 190, 224, 0.92), rgba(49, 146, 186, 0.86));
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(12, 56, 78, 0.45);
          box-shadow:
            0 6px 14px rgba(68, 164, 196, 0.24),
            inset 0 1px 0 rgba(255, 255, 255, 0.36);
        }

        .timer-menu-btn {
          border: 1px solid #ced8e6;
          border-radius: 8px;
          width: 30px;
          height: 26px;
          background: #f4f8fd;
          color: #2b3f5a;
          font-size: 1rem;
          line-height: 1;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .timer-menu-btn:hover {
          background: #ebf3fb;
          border-color: #9ab8db;
        }

        .quick-timer-btn[disabled],
        .timer-menu-btn[disabled] {
          cursor: not-allowed;
          opacity: 0.56;
          transform: none;
        }

        .tasks-card {
          border: 1px solid rgba(165, 188, 214, 0.3);
          border-radius: 12px;
          padding: 8px;
          background: linear-gradient(165deg, #3f4a5d, #374255);
          display: grid;
          gap: 8px;
          min-width: 0;
          overflow-x: hidden;
        }

        .tasks-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tasks-title {
          margin: 0;
          font-size: 0.84rem;
          font-weight: 700;
          color: #edf4ff;
        }

        .tasks-head-actions {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .import-export-card {
          gap: 10px;
        }

        .import-export-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px;
          direction: ltr;
          width: min(100%, 66.6667%);
          margin-inline: auto;
        }

        .import-export-grid .tasks-mode-btn,
        .import-export-grid .tasks-import-btn,
        .import-export-grid .tasks-export-btn {
          min-height: 44px;
          border-radius: 11px;
          font-size: 0.9rem;
          padding: 10px 8px;
        }

        .tasks-import-mode {
          display: inline-grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 4px;
          padding: 3px;
          border-radius: 10px;
          border: 1px solid rgba(152, 175, 201, 0.45);
          background: linear-gradient(165deg, rgba(217, 228, 241, 0.22), rgba(151, 171, 196, 0.16));
        }

        .tasks-mode-btn {
          border: 1px solid rgba(148, 170, 198, 0.78);
          border-radius: 8px;
          background: linear-gradient(165deg, rgba(248, 252, 255, 0.95), rgba(234, 242, 251, 0.92));
          color: #1e3957;
          font-size: 0.73rem;
          font-weight: 800;
          min-height: 30px;
          padding: 4px 8px;
          cursor: pointer;
          box-shadow:
            0 2px 6px rgba(28, 53, 82, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }

        .tasks-mode-btn.active {
          border-color: rgba(245, 175, 52, 0.98);
          background: linear-gradient(165deg, #f7c56a, #dd8e12);
          color: #3d2400;
          text-shadow: 0 1px 0 rgba(255, 238, 201, 0.55);
          box-shadow:
            0 3px 10px rgba(181, 111, 11, 0.32),
            0 0 0 1px rgba(255, 205, 112, 0.4),
            inset 0 1px 0 rgba(255, 247, 224, 0.6);
        }

        .tasks-add-btn {
          border: 1px solid rgba(122, 183, 230, 0.95);
          border-radius: 10px;
          background: linear-gradient(165deg, #63b7ec, #3f93cc);
          color: #f7fbff;
          text-shadow: 0 1px 1px rgba(14, 45, 70, 0.35);
          font-size: 0.82rem;
          font-weight: 800;
          padding: 7px 12px;
          cursor: pointer;
          box-shadow:
            0 3px 8px rgba(34, 84, 120, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.28);
        }

        .tasks-vacation-btn {
          border: 1px solid rgba(245, 190, 104, 0.94);
          border-radius: 10px;
          background: linear-gradient(165deg, rgba(255, 242, 219, 0.95), rgba(255, 226, 184, 0.88));
          color: #6f3a00;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.35);
          font-size: 0.78rem;
          font-weight: 900;
          min-height: 34px;
          padding: 6px 10px;
          cursor: pointer;
          box-shadow:
            0 2px 6px rgba(82, 46, 11, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }

        .tasks-vacation-btn.active {
          border-color: rgba(255, 194, 102, 0.98);
          background: linear-gradient(165deg, #f7bc5a, #d8891a);
          color: #fff8ec;
          text-shadow: 0 1px 1px rgba(83, 39, 3, 0.45);
          box-shadow:
            0 3px 9px rgba(130, 73, 10, 0.3),
            inset 0 1px 0 rgba(255, 233, 198, 0.4);
        }

        .tasks-import-btn,
        .tasks-export-btn {
          border: 1px solid rgba(148, 170, 198, 0.78);
          border-radius: 10px;
          background: linear-gradient(165deg, rgba(250, 253, 255, 0.96), rgba(233, 242, 251, 0.92));
          color: #15334f;
          font-size: 0.78rem;
          font-weight: 800;
          min-height: 34px;
          padding: 6px 11px;
          cursor: pointer;
          box-shadow:
            0 2px 6px rgba(28, 53, 82, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }

        .tasks-add-btn:hover {
          filter: brightness(1.05);
        }

        .tasks-add-btn[disabled],
        .tasks-vacation-btn[disabled],
        .tasks-import-btn[disabled],
        .tasks-export-btn[disabled],
        .tasks-mode-btn[disabled],
        .history-clear-btn[disabled] {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .tasks-list {
          display: grid;
          gap: 6px;
          min-width: 0;
          overflow-x: hidden;
        }

        .history-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .history-head-actions {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .history-clear-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          padding: 0;
          border-radius: 12px;
          border: 1px solid rgba(180, 196, 217, 0.72);
          background: linear-gradient(165deg, rgba(248, 252, 255, 0.95), rgba(227, 237, 247, 0.92));
          color: #8b2f2f;
          cursor: pointer;
          box-shadow:
            0 2px 6px rgba(16, 30, 50, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.62);
        }

        .history-clear-btn:hover:not([disabled]) {
          filter: brightness(1.04);
        }

        .history-clear-btn[disabled] {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .history-clear-btn svg {
          width: 22px;
          height: 22px;
          fill: currentColor;
        }

        .history-export-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .history-export-btn svg {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          fill: currentColor;
        }

        .history-head .tasks-title {
          margin: 0;
          flex: 1;
          min-width: 0;
        }

        .history-list {
          display: grid;
          gap: 6px;
          min-width: 0;
          max-height: min(58dvh, 460px);
          overflow: auto;
          padding-inline-end: 2px;
        }

        .history-item {
          border: 1px solid rgba(176, 197, 219, 0.28);
          border-radius: 10px;
          padding: 7px 8px;
          display: grid;
          gap: 3px;
          background: linear-gradient(165deg, #586377, #4d586b);
        }

        .history-item-head {
          margin: 0;
          font-size: 0.72rem;
          color: #dce7f5;
          opacity: 0.95;
        }

        .history-item-meta {
          margin: 0;
          font-size: 0.78rem;
          color: #f5f9ff;
          font-weight: 700;
        }

        .task-item {
          border: 1px solid rgba(176, 197, 219, 0.28);
          border-radius: 10px;
          padding: 7px 8px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 6px;
          align-items: center;
          background: linear-gradient(165deg, #586377, #4d586b);
          min-width: 0;
          isolation: isolate;
        }

        .task-main {
          min-width: 0;
        }

        .task-name {
          margin: 0;
          font-size: 0.8rem;
          font-weight: 700;
          color: #f5f9ff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .task-meta {
          margin: 0;
          font-size: 0.72rem;
          color: #dce7f5;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .task-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          max-width: 100%;
          flex-wrap: nowrap;
          justify-content: flex-end;
        }

        .task-toggle-btn,
        .task-edit-btn,
        .task-delete-btn {
          border: 1px solid rgba(148, 170, 198, 0.78);
          border-radius: 10px;
          background: linear-gradient(165deg, rgba(250, 253, 255, 0.96), rgba(233, 242, 251, 0.92));
          color: #15334f;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
          font-size: 0.78rem;
          font-weight: 800;
          min-height: 34px;
          padding: 5px 10px;
          cursor: pointer;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          box-shadow:
            0 2px 6px rgba(28, 53, 82, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }

        .task-toggle-btn.on {
          border-color: #68c78f;
          background: linear-gradient(165deg, #46b975, #2f9460);
          color: #ffffff;
          text-shadow: 0 1px 1px rgba(8, 48, 28, 0.45);
        }

        .task-edit-btn {
          border-color: #7ab6e6;
          color: #113d63;
          background: linear-gradient(165deg, #d8ecfb, #bdddf6);
        }

        .task-delete-btn {
          border-color: #de8b8b;
          color: #781f1f;
          text-shadow: none;
          background: linear-gradient(165deg, #f7d8d8, #f1bebe);
        }

        .task-toggle-btn:focus-visible,
        .task-edit-btn:focus-visible,
        .task-delete-btn:focus-visible,
        .tasks-add-btn:focus-visible,
        .tasks-vacation-btn:focus-visible,
        .tasks-import-btn:focus-visible,
        .tasks-export-btn:focus-visible,
        .tasks-mode-btn:focus-visible {
          outline: 2px solid rgba(170, 225, 255, 0.95);
          outline-offset: 2px;
        }

        .tasks-empty {
          margin: 0;
          font-size: 0.76rem;
          color: #dce7f5;
        }

        .schedule-form {
          display: grid;
          gap: 10px;
          min-width: 0;
          grid-template-rows: minmax(0, 1fr) auto;
          min-height: 0;
          box-sizing: border-box;
        }

        .schedule-form-scroll {
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 2px;
          padding-bottom: 8px;
          -webkit-overflow-scrolling: touch;
        }

        .schedule-field {
          display: grid;
          gap: 4px;
          min-width: 0;
        }

        .schedule-control-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 6px;
          align-items: center;
          min-width: 0;
        }

        .schedule-label {
          font-size: 0.77rem;
          color: var(--boiler-muted);
          font-weight: 700;
        }

        .schedule-input {
          border: 1px solid rgba(154, 184, 219, 0.7);
          border-radius: 10px;
          background: rgba(248, 252, 255, 0.95);
          color: #1f2e44;
          min-height: 38px;
          padding: 8px 10px;
          font-size: 0.9rem;
          box-sizing: border-box;
          width: 100%;
        }

        .schedule-time-input {
          direction: ltr;
          text-align: left;
          unicode-bidi: isolate;
          font-variant-numeric: tabular-nums;
        }

        .schedule-time-input::-webkit-datetime-edit,
        .schedule-time-input::-webkit-datetime-edit-fields-wrapper,
        .schedule-time-input::-webkit-datetime-edit-hour-field,
        .schedule-time-input::-webkit-datetime-edit-minute-field,
        .schedule-time-input::-webkit-datetime-edit-text {
          direction: ltr;
        }

        .schedule-select {
          border: 1px solid rgba(154, 184, 219, 0.7);
          border-radius: 10px;
          background: rgba(248, 252, 255, 0.95);
          color: #1f2e44;
          min-height: 38px;
          padding: 8px 10px;
          font-size: 0.9rem;
          box-sizing: border-box;
          width: 100%;
        }

        .schedule-clear-btn {
          border: 1px solid rgba(180, 196, 217, 0.72);
          border-radius: 10px;
          width: 36px;
          min-width: 36px;
          height: 36px;
          min-height: 36px;
          background: linear-gradient(165deg, rgba(248, 252, 255, 0.95), rgba(227, 237, 247, 0.92));
          color: #2b3f5a;
          font-size: 1rem;
          font-weight: 900;
          line-height: 1;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 2px 6px rgba(16, 30, 50, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.62);
        }

        .schedule-clear-btn:hover {
          filter: brightness(1.04);
          transform: translateY(-1px);
        }

        .schedule-clear-btn:focus-visible {
          outline: 2px solid rgba(165, 232, 255, 0.95);
          outline-offset: 2px;
        }

        .schedule-type-toggle {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 6px;
          min-width: 0;
        }

        #schedule-holiday-row-primary,
        #schedule-holiday-row-secondary {
          grid-template-columns: minmax(0, 1fr);
          gap: 8px;
        }

        #schedule-holiday-row-primary {
          grid-template-columns: minmax(0, 1fr) minmax(180px, 0.72fr);
          align-items: start;
        }

        /* Same baseline for kind/shabbat toggles and offset row (equiv line must not pull controls up). */
        #schedule-holiday-row-primary .schedule-label {
          min-height: 3em;
          line-height: 1.35;
        }

        #schedule-holiday-kind-toggle,
        #schedule-holiday-phase-toggle {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }

        #schedule-holiday-subtype-toggle {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }

        #schedule-holiday-kind-toggle .schedule-type-btn,
        #schedule-holiday-phase-toggle .schedule-type-btn,
        #schedule-holiday-subtype-toggle .schedule-type-btn {
          min-height: 40px;
          font-size: 0.84rem;
        }

        .schedule-holiday-offset-inline {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: nowrap;
          max-width: 100%;
        }

        .schedule-offset-sign-solo {
          flex: 0 0 auto;
          width: 44px;
          height: 42px;
          border-radius: 10px;
          border: 1px solid rgba(165, 232, 255, 0.95);
          font-size: 1.2rem;
          font-weight: 800;
          line-height: 1;
          cursor: pointer;
          padding: 0;
          background: linear-gradient(165deg, rgba(102, 190, 224, 0.92), rgba(49, 146, 186, 0.86));
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(12, 56, 78, 0.45);
        }

        .schedule-offset-minutes-only {
          flex: 1 1 auto;
          min-width: 0;
          max-width: 14rem;
        }

        .schedule-offset-equiv {
          margin-top: 4px;
          font-size: 0.74rem;
          font-weight: 700;
          opacity: 0.82;
          line-height: 1.35;
        }

        .schedule-recurrence-toggle {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 6px;
          min-width: 0;
        }

        .schedule-type-btn {
          border: 1px solid rgba(156, 184, 216, 0.75);
          border-radius: 10px;
          min-height: 34px;
          padding: 6px 8px;
          background: rgba(245, 251, 255, 0.88);
          color: #23435f;
          font-size: 0.78rem;
          font-weight: 800;
          cursor: pointer;
        }

        .schedule-type-btn.active {
          border-color: rgba(165, 232, 255, 0.95);
          background: linear-gradient(165deg, rgba(102, 190, 224, 0.92), rgba(49, 146, 186, 0.86));
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(12, 56, 78, 0.45);
        }

        .schedule-section-switch {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 6px;
          min-width: 0;
          margin-top: 8px;
        }

        .schedule-category-switch {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 6px;
          min-width: 0;
          margin-top: 4px;
        }

        .schedule-section-btn {
          border: 1px solid rgba(156, 184, 216, 0.75);
          border-radius: 10px;
          min-height: 34px;
          padding: 6px 8px;
          background: rgba(245, 251, 255, 0.84);
          color: #23435f;
          font-size: 0.78rem;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .schedule-section-btn.active {
          border-color: rgba(165, 232, 255, 0.95);
          background: linear-gradient(165deg, rgba(102, 190, 224, 0.92), rgba(49, 146, 186, 0.86));
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(12, 56, 78, 0.45);
        }

        .schedule-time-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          min-width: 0;
        }

        .schedule-condition-row {
          grid-template-columns: minmax(0, 1fr);
        }

        .schedule-condition-state-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          align-items: center;
          min-width: 0;
        }

        .schedule-condition-state-row .schedule-select,
        .schedule-condition-state-row .schedule-input {
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .schedule-window-fields[hidden],
        .schedule-timeline-fields[hidden],
        .schedule-date-row[hidden] {
          display: none;
        }

        .schedule-section-panel[hidden] {
          display: none;
        }

        #schedule-panel-recurrence.recurrence-collapsed #schedule-recurrence-toggle,
        #schedule-panel-recurrence.recurrence-collapsed #schedule-date-row {
          display: none !important;
        }

        #schedule-panel-recurrence.condition-collapsed #schedule-condition-row {
          display: none !important;
        }

        .timeline-points {
          display: grid;
          gap: 7px;
          min-width: 0;
        }

        .timeline-point-row {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1fr) minmax(86px, 96px);
          gap: 6px;
          align-items: center;
          min-width: 0;
        }

        .timeline-point-time,
        .timeline-point-duration,
        .timeline-point-remove {
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .timeline-point-remove {
          border: 1px solid rgba(220, 161, 161, 0.85);
          border-radius: 8px;
          min-height: 36px;
          padding: 0 10px;
          font-size: 0.78rem;
          font-weight: 700;
          color: #7b2323;
          background: linear-gradient(165deg, #f7dddd, #f2c7c7);
          cursor: pointer;
        }

        .timeline-point-add {
          justify-self: flex-start;
          border: 1px solid rgba(122, 183, 230, 0.95);
          border-radius: 9px;
          background: linear-gradient(165deg, #63b7ec, #3f93cc);
          color: #f7fbff;
          text-shadow: 0 1px 1px rgba(14, 45, 70, 0.35);
          font-size: 0.8rem;
          font-weight: 800;
          min-height: 34px;
          padding: 5px 10px;
          cursor: pointer;
        }

        .schedule-days {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 5px;
        }

        .schedule-months {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 5px;
        }

        .schedule-day {
          border: 1px solid rgba(173, 196, 220, 0.55);
          border-radius: 8px;
          background: rgba(245, 251, 255, 0.75);
          color: #21405d;
          min-height: 30px;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
        }

        .schedule-day.selected,
        .schedule-month.selected {
          border-color: rgba(165, 232, 255, 0.95);
          background: linear-gradient(165deg, rgba(102, 190, 224, 0.92), rgba(49, 146, 186, 0.86));
          color: #fff;
        }

        .schedule-day:disabled,
        .schedule-month:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(0.12);
        }

        .schedule-month {
          border: 1px solid rgba(173, 196, 220, 0.55);
          border-radius: 8px;
          background: rgba(245, 251, 255, 0.75);
          color: #21405d;
          min-height: 30px;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
        }

        .schedule-modal-actions {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
          position: sticky;
          bottom: 0;
          z-index: 4;
          background: linear-gradient(
            180deg,
            rgba(68, 80, 101, 0.96),
            rgba(59, 70, 90, 0.98)
          );
          border-top: 1px solid rgba(166, 191, 219, 0.34);
          box-shadow: 0 -6px 18px rgba(18, 28, 44, 0.24);
          padding-top: 10px;
          padding-bottom: max(10px, env(safe-area-inset-bottom, 0px));
          padding-inline: 8px;
          box-sizing: border-box;
        }

        .schedule-collapse-toggle-btn {
          border: 1px solid rgba(156, 184, 216, 0.75);
          border-radius: 10px;
          min-height: 34px;
          padding: 6px 10px;
          background: rgba(245, 251, 255, 0.84);
          color: #23435f;
          font-size: 0.78rem;
          font-weight: 800;
          cursor: pointer;
        }

        .schedule-action-btn {
          border: 1px solid rgba(173, 196, 220, 0.72);
          border-radius: 12px;
          min-height: 46px;
          min-width: 150px;
          padding: 8px 16px;
          font-size: 0.92rem;
          font-weight: 800;
          cursor: pointer;
          background: rgba(245, 251, 255, 0.93);
          color: #1c3d5d;
          box-shadow:
            0 4px 10px rgba(17, 28, 46, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.55);
        }

        #schedule-cancel-btn {
          border-color: rgba(223, 157, 157, 0.92);
          background: linear-gradient(165deg, rgba(248, 224, 224, 0.95), rgba(241, 196, 196, 0.9));
          color: #7c2a2a;
        }

        .schedule-action-btn.primary,
        #schedule-save-btn {
          border-color: rgba(142, 211, 170, 0.9);
          background: linear-gradient(165deg, rgba(185, 233, 206, 0.94), rgba(143, 205, 171, 0.9));
          color: #184f34;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.35);
        }

        .schedule-action-btn:hover {
          filter: brightness(1.03);
          transform: translateY(-1px);
        }

        .error {
          margin: 0;
          color: var(--boiler-danger);
          background: #fff2ef;
          border: 1px solid #ffd2ca;
          border-radius: 10px;
          padding: 9px 11px;
          font-size: 0.82rem;
        }

        .timer-modal {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          isolation: isolate;
          pointer-events: none;
        }

        .timer-modal[hidden] {
          display: none;
        }

        .timer-modal-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(10, 20, 35, 0.5);
          backdrop-filter: blur(2px);
          z-index: 0;
          pointer-events: auto;
        }

        .timer-modal-panel {
          position: relative;
          width: min(560px, calc(100vw - 28px));
          max-height: min(80dvh, 620px);
          overflow: auto;
          overflow-x: hidden;
          border-radius: 18px;
          border: 1px solid rgba(80, 108, 140, 0.25);
          background: var(--ha-card-background, var(--card-background-color, #ffffff));
          box-shadow: 0 26px 60px rgba(14, 27, 51, 0.35);
          padding: 14px;
          animation: card-enter 180ms ease;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          z-index: 1;
          pointer-events: auto;
          touch-action: pan-y;
          box-sizing: border-box;
        }

        #schedule-modal-panel {
          width: min(500px, calc(100vw - 34px));
          max-height: min(88dvh, 700px);
          overflow: hidden;
          display: grid;
          grid-template-rows: auto minmax(0, 1fr);
          overflow-x: hidden;
        }

        .timer-modal button,
        .timer-modal input,
        .timer-modal select {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        #timer-modal {
          align-items: flex-start;
          padding: calc(10px + env(safe-area-inset-top, 0px)) 10px 10px;
        }

        .timer-modal-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          grid-template-areas:
            "title"
            "toggle"
            "actions";
          align-items: center;
          gap: 10px;
          margin: 0 0 10px;
          position: sticky;
          top: 0;
          z-index: 6;
          background: linear-gradient(
            165deg,
            rgba(63, 74, 93, 0.98),
            rgba(55, 66, 85, 0.96)
          );
          border-radius: 12px;
          padding: 8px 8px 10px;
          box-shadow: 0 2px 10px rgba(14, 27, 51, 0.24);
        }

        .timer-modal-title {
          grid-area: title;
          margin: 0;
          font-size: 1rem;
          color: var(--boiler-text);
          display: flex;
          align-items: center;
          min-height: 46px;
          min-width: 0;
          width: 100%;
          text-align: left;
          padding-left: 58px;
        }

        .timer-modal-actions {
          grid-area: actions;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-inline-start: 0;
          justify-self: stretch;
          width: 100%;
          justify-content: center;
          min-height: 50px;
        }

        .menu-mode-toggle {
          grid-area: toggle;
          display: inline-grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          align-items: stretch;
          gap: 4px;
          background: linear-gradient(165deg, rgba(114, 130, 156, 0.84), rgba(84, 99, 123, 0.78));
          border: 1px solid rgba(176, 197, 223, 0.6);
          border-radius: 14px;
          padding: 4px;
          width: 100%;
          min-width: 0;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.24);
        }

        .menu-mode-btn {
          border: 1px solid rgba(172, 197, 223, 0.55);
          border-radius: 10px;
          min-height: 42px;
          min-width: 0;
          box-sizing: border-box;
          padding: 7px 10px;
          font-size: 0.9rem;
          font-weight: 800;
          line-height: 1.2;
          white-space: normal !important;
          overflow-wrap: anywhere;
          overflow: hidden;
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(11, 28, 45, 0.5);
          background: linear-gradient(165deg, rgba(106, 125, 150, 0.9), rgba(86, 102, 126, 0.82));
          cursor: pointer;
          transition: filter 120ms ease, transform 120ms ease;
        }

        .menu-mode-btn:hover {
          filter: brightness(1.06);
          transform: translateY(-1px);
        }

        .menu-mode-btn.active {
          color: #fff;
          background: linear-gradient(165deg, rgba(102, 190, 224, 0.92), rgba(49, 146, 186, 0.86));
          border-color: rgba(171, 232, 255, 0.95);
          box-shadow: 0 3px 8px rgba(37, 111, 147, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.35);
        }

        .menu-view[hidden] {
          display: none;
        }

        .timer-page-controls {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .timer-page-controls[hidden] {
          display: none !important;
        }

        .timer-modal-panel.menu-mode-tasks .timer-page-controls {
          display: none !important;
        }

        .timer-modal-panel.menu-mode-timer {
          max-height: min(80dvh, 620px);
        }

        .timer-modal-panel.menu-mode-timer .timer-modal-head {
          grid-template-areas:
            "title"
            "toggle";
          row-gap: 6px;
          margin-bottom: 8px;
        }

        .timer-modal-panel.menu-mode-timer #modal-timer-view {
          padding-bottom: 0;
          margin-bottom: 0;
        }

        .timer-modal-panel.menu-mode-timer .timer-grid {
          align-content: start;
        }

        .timer-modal-panel.menu-mode-tasks .timer-modal-head,
        .timer-modal-panel.menu-mode-import-export .timer-modal-head,
        .timer-modal-panel.menu-mode-history .timer-modal-head {
          grid-template-areas:
            "title"
            "toggle";
          row-gap: 6px;
          margin-bottom: 8px;
        }

        .timer-modal-panel.menu-mode-timer .timer-modal-actions,
        .timer-modal-panel.menu-mode-tasks .timer-modal-actions,
        .timer-modal-panel.menu-mode-import-export .timer-modal-actions,
        .timer-modal-panel.menu-mode-history .timer-modal-actions {
          position: static;
          width: 100%;
          height: 0;
          min-height: 0;
          overflow: visible;
          padding: 0;
          margin: 0;
          pointer-events: none;
        }

        .timer-modal-panel.menu-mode-timer #timer-close-btn,
        .timer-modal-panel.menu-mode-tasks #timer-close-btn,
        .timer-modal-panel.menu-mode-import-export #timer-close-btn,
        .timer-modal-panel.menu-mode-history #timer-close-btn,
        .timer-modal-panel.menu-mode-timer #timer-history-btn,
        .timer-modal-panel.menu-mode-tasks #timer-history-btn,
        .timer-modal-panel.menu-mode-import-export #timer-history-btn,
        .timer-modal-panel.menu-mode-history #timer-history-btn,
        .timer-modal-panel.menu-mode-timer #timer-guide-btn,
        .timer-modal-panel.menu-mode-tasks #timer-guide-btn,
        .timer-modal-panel.menu-mode-import-export #timer-guide-btn,
        .timer-modal-panel.menu-mode-history #timer-guide-btn {
          pointer-events: auto;
        }

        .timer-page-btn,
        .timer-close-btn {
          border: 1px solid #9bb5d3;
          border-radius: 12px;
          background: linear-gradient(165deg, rgba(244, 248, 253, 0.96), rgba(215, 228, 244, 0.94));
          color: #243a55;
          box-shadow:
            0 4px 10px rgba(13, 27, 47, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.75);
          line-height: 1;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          font-weight: 900;
          transition:
            transform 120ms ease,
            filter 140ms ease,
            border-color 140ms ease,
            box-shadow 140ms ease;
        }

        .timer-page-btn {
          width: 44px;
          height: 44px;
          font-size: 1.35rem;
        }

        .timer-page-indicator {
          min-width: 48px;
          text-align: center;
          font-size: 0.96rem;
          color: var(--boiler-muted);
          font-weight: 700;
        }

        .timer-close-btn {
          width: 46px;
          height: 46px;
          font-size: 1.2rem;
        }

        .timer-page-btn:hover,
        .timer-close-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.06);
          border-color: #86a8cf;
          box-shadow:
            0 6px 14px rgba(13, 27, 47, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.82);
        }

        .timer-page-btn:active,
        .timer-close-btn:active {
          transform: translateY(0);
          filter: brightness(0.98);
        }

        .timer-page-btn:focus-visible,
        .timer-close-btn:focus-visible {
          outline: 2px solid rgba(165, 232, 255, 0.95);
          outline-offset: 2px;
        }

        .timer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 9px;
        }

        .timer-option-btn {
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 11px;
          background: linear-gradient(165deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.1));
          color: var(--primary-text-color, #1f2e44);
          font-weight: 700;
          font-size: 0.9rem;
          min-height: 44px;
          padding: 10px 8px;
          cursor: pointer;
          backdrop-filter: blur(8px) saturate(125%);
          -webkit-backdrop-filter: blur(8px) saturate(125%);
          box-shadow:
            0 4px 10px rgba(20, 35, 58, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.32);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          line-height: 1.2;
          transition:
            transform 120ms ease,
            border-color 120ms ease,
            background 160ms ease,
            box-shadow 160ms ease;
        }

        .timer-option-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(173, 204, 239, 0.8);
          background: linear-gradient(165deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.14));
          box-shadow:
            0 6px 14px rgba(20, 35, 58, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }

        .timer-option-btn.selected {
          border-color: rgba(165, 232, 255, 0.95);
          background: linear-gradient(165deg, rgba(102, 190, 224, 0.92), rgba(49, 146, 186, 0.86));
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(12, 56, 78, 0.45);
          box-shadow:
            0 6px 14px rgba(68, 164, 196, 0.24),
            inset 0 1px 0 rgba(255, 255, 255, 0.36);
        }

        .timer-modal-panel[dir="rtl"] {
          direction: rtl;
          text-align: right;
        }

        .timer-modal-panel[dir="rtl"] .timer-grid {
          direction: rtl;
        }

        .timer-modal-panel[dir="rtl"] .timer-option-btn {
          text-align: center;
        }

        .timer-modal-panel[dir="rtl"] .timer-modal-actions {
          margin-inline-start: 0;
          margin-inline-end: 0;
        }

        .timer-modal-panel[dir="rtl"] .timer-modal-title {
          text-align: right;
          padding-left: 0;
          padding-right: 0;
        }

        /* Keep Add/Edit Task modal header simple and isolated from timer-header grid layout */
        #schedule-modal .timer-modal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          grid-template-columns: none;
          grid-template-areas: none;
          row-gap: 0;
        }

        #schedule-modal .timer-modal-title {
          display: block;
          min-height: 0;
          width: auto;
          padding: 0;
          text-align: start;
        }

        #schedule-modal #schedule-close-btn {
          position: static;
          transform: none;
          margin-inline-start: auto;
          flex: 0 0 auto;
          width: 46px;
          height: 46px;
          font-size: 1.2rem;
        }

        #timer-close-btn {
          position: absolute;
          left: 8px;
          top: 8px;
          transform: none;
          z-index: 9;
        }

        #timer-guide-btn {
          position: absolute;
          left: 60px;
          top: 8px;
          transform: none;
          z-index: 9;
          font-size: 1rem;
        }

        #timer-history-btn {
          position: absolute;
          left: 112px;
          top: 8px;
          transform: none;
          z-index: 9;
          font-size: 1rem;
        }

        #timer-history-btn.active {
          border-color: rgba(165, 232, 255, 0.95);
          background: linear-gradient(165deg, rgba(102, 190, 224, 0.92), rgba(49, 146, 186, 0.86));
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(12, 56, 78, 0.45);
        }

        .confirm-modal-panel {
          position: relative;
          z-index: 1;
          pointer-events: auto;
          width: min(460px, calc(100vw - 24px));
          max-height: min(78dvh, 420px);
          overflow: auto;
          border-radius: 18px;
          border: 1px solid rgba(80, 108, 140, 0.3);
          background: linear-gradient(165deg, #4c5a71, #3f4d62);
          box-shadow:
            0 26px 60px rgba(14, 27, 51, 0.42),
            inset 0 1px 0 rgba(255, 255, 255, 0.12);
          color: #eef5ff;
          padding: 16px;
          animation: card-enter 180ms ease;
        }

        .confirm-modal-title {
          margin: 0 0 8px;
          font-size: 1rem;
          font-weight: 800;
          color: #ffffff;
        }

        .confirm-modal-message {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.5;
          color: #e4eeff;
          white-space: pre-wrap;
        }

        .confirm-modal-actions {
          margin-top: 16px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        .guide-modal-panel.confirm-modal-panel {
          display: flex;
          flex-direction: column;
          width: min(520px, calc(100vw - 24px));
          max-height: min(85dvh, 600px);
          overflow: hidden;
          box-sizing: border-box;
          padding-bottom: calc(16px + env(safe-area-inset-bottom, 12px));
        }

        .guide-modal-panel .guide-modal-head,
        .guide-modal-panel .guide-modal-tabs {
          flex-shrink: 0;
        }

        .guide-modal-panel .guide-modal-body {
          flex: 1 1 auto;
          min-height: 0;
          overflow-x: hidden;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }

        .guide-modal-panel .guide-tab-panel {
          min-height: 0;
        }

        .guide-modal-panel .confirm-modal-actions {
          flex-shrink: 0;
          margin-top: 10px;
          margin-bottom: 0;
          padding-top: 12px;
          border-top: 1px solid rgba(148, 170, 198, 0.28);
        }

        .guide-modal-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin: 0 0 6px;
        }

        .guide-modal-head .confirm-modal-title {
          margin: 0;
          flex: 1;
        }

        .guide-modal-head .timer-close-btn {
          flex-shrink: 0;
        }

        .guide-modal-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .guide-tab-btn {
          flex: 1;
          border: 1px solid rgba(148, 170, 198, 0.55);
          border-radius: 12px;
          background: rgba(14, 28, 46, 0.35);
          color: #dce8f8;
          font-size: 0.82rem;
          font-weight: 800;
          min-height: 40px;
          padding: 6px 10px;
          cursor: pointer;
        }

        .guide-tab-btn.active {
          border-color: rgba(122, 183, 230, 0.95);
          background: linear-gradient(165deg, #63b7ec, #3f93cc);
          color: #f7fbff;
          text-shadow: 0 1px 1px rgba(14, 45, 70, 0.35);
        }

        .guide-modal-body {
          min-height: 0;
        }

        .guide-hebcal-city {
          margin: 0 0 8px;
          font-size: 0.82rem;
          color: #c8daf6;
          opacity: 0.92;
        }

        .guide-hebcal-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 0 0 10px;
        }

        .guide-hebcal-filter-btn {
          flex: 1 1 auto;
          min-width: 0;
          border: 1px solid rgba(152, 184, 214, 0.45);
          border-radius: 999px;
          padding: 7px 10px;
          font-size: 0.78rem;
          font-weight: 800;
          cursor: pointer;
          background: rgba(14, 28, 46, 0.35);
          color: #d5e4fa;
        }

        .guide-hebcal-filter-btn.active {
          border-color: rgba(122, 183, 230, 0.95);
          background: linear-gradient(165deg, #63b7ec, #3f93cc);
          color: #f7fbff;
          text-shadow: 0 1px 1px rgba(14, 45, 70, 0.35);
        }

        .guide-hebcal-list {
          max-height: min(42dvh, 280px);
          overflow: auto;
          -webkit-overflow-scrolling: touch;
          border: 1px solid rgba(152, 184, 214, 0.28);
          border-radius: 12px;
          padding: 6px;
          background: rgba(14, 28, 46, 0.24);
        }

        .guide-hebcal-status {
          margin: 10px 0 0;
          font-size: 0.88rem;
          color: #ffd7b0;
          white-space: pre-wrap;
        }

        .guide-hebcal-row {
          padding: 10px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.06);
          margin-bottom: 6px;
        }

        .guide-hebcal-row:last-child {
          margin-bottom: 0;
        }

        .guide-hebcal-badge {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 900;
          letter-spacing: 0.02em;
          padding: 2px 8px;
          border-radius: 999px;
          margin-bottom: 4px;
        }

        .guide-hebcal-badge.kind-shabbat {
          background: rgba(129, 174, 255, 0.35);
          border: 1px solid rgba(160, 198, 255, 0.5);
          color: #eaf1ff;
        }

        .guide-hebcal-badge.kind-holiday {
          background: rgba(255, 191, 120, 0.28);
          border: 1px solid rgba(255, 210, 150, 0.45);
          color: #fff4e8;
        }

        .guide-hebcal-row-title {
          font-weight: 800;
          font-size: 0.92rem;
          line-height: 1.3;
        }

        .guide-hebcal-row-hebrew {
          margin-top: 2px;
          font-size: 0.85rem;
          color: #d5e4fa;
        }

        .guide-hebcal-row-dates {
          margin-top: 6px;
          font-size: 0.8rem;
          color: #c5d6ef;
          line-height: 1.35;
          white-space: pre-line;
        }

        .confirm-action-btn {
          border: 1px solid rgba(148, 170, 198, 0.78);
          border-radius: 12px;
          background: linear-gradient(165deg, rgba(248, 252, 255, 0.96), rgba(233, 242, 251, 0.92));
          color: #163553;
          font-size: 0.9rem;
          font-weight: 800;
          min-height: 42px;
          min-width: 112px;
          padding: 8px 14px;
          cursor: pointer;
          box-shadow:
            0 2px 6px rgba(28, 53, 82, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }

        .confirm-action-btn.primary {
          border-color: rgba(122, 183, 230, 0.95);
          background: linear-gradient(165deg, #63b7ec, #3f93cc);
          color: #f7fbff;
          text-shadow: 0 1px 1px rgba(14, 45, 70, 0.35);
        }

        .confirm-action-btn:focus-visible {
          outline: 2px solid rgba(170, 225, 255, 0.95);
          outline-offset: 2px;
        }

        .import-select-message {
          margin: 0 0 10px;
          font-size: 0.9rem;
          color: #dce8f8;
        }

        .import-select-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }

        .import-select-list {
          max-height: min(44dvh, 260px);
          overflow: auto;
          -webkit-overflow-scrolling: touch;
          border: 1px solid rgba(152, 184, 214, 0.28);
          border-radius: 12px;
          padding: 6px;
          background: rgba(14, 28, 46, 0.24);
        }

        .import-select-item {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 10px;
          align-items: start;
          padding: 8px;
          border-radius: 10px;
        }

        .import-select-item:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .import-select-item-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: #f7fbff;
          line-height: 1.35;
        }

        .import-select-item-subtitle {
          margin-top: 2px;
          font-size: 0.82rem;
          color: #c4d6ee;
          line-height: 1.3;
          word-break: break-word;
        }

        .import-select-checkbox {
          margin-top: 2px;
          width: 18px;
          height: 18px;
        }

        @media (max-width: 760px) {
          .boiler-visual {
            grid-template-columns: minmax(92px, 26vw) minmax(0, 1fr);
            gap: 10px;
            text-align: initial;
          }

          .boiler-visual.hide-boiler-flow-image {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .boiler-icon {
            width: clamp(92px, 26vw, 150px);
            height: auto;
            aspect-ratio: 3 / 2;
          }

          .boiler-meta {
            gap: 4px;
          }

          .timer-menu-btn {
            width: 44px;
            height: 44px;
            border-radius: 12px;
          }

          .quick-timers {
            grid-template-columns: repeat(auto-fit, minmax(82px, 1fr));
            gap: 6px;
          }

          .sensors-row {
            grid-template-columns: repeat(var(--sensor-columns, 3), minmax(0, 1fr));
          }

          .timer-modal {
            align-items: flex-end;
            padding: 6px;
          }

          #timer-modal {
            align-items: flex-start;
            padding: calc(8px + env(safe-area-inset-top, 0px)) 8px 8px;
          }

          #schedule-modal {
            align-items: center;
            justify-content: center;
            padding: 10px;
          }

          #confirm-modal,
          #guide-modal {
            align-items: center;
            padding: 10px;
          }

          .timer-modal-panel {
            width: calc(100vw - 12px);
            max-height: min(88dvh, 760px);
            border-radius: 18px;
            padding: 14px 14px calc(16px + env(safe-area-inset-bottom, 0px));
            animation: modal-sheet-up 190ms ease;
          }

          #timer-modal .timer-modal-panel {
            width: min(560px, calc(100vw - 14px));
            max-height: min(82dvh, 700px);
            border-radius: 18px;
            animation: card-enter 180ms ease;
          }

          #schedule-modal-panel {
            width: calc(100vw - 12px);
          }

          .confirm-modal-panel {
            width: min(460px, calc(100vw - 20px));
          }

          .guide-modal-panel.confirm-modal-panel {
            width: min(460px, calc(100vw - 20px));
            max-height: min(calc(100dvh - 28px - env(safe-area-inset-bottom, 0px)), 620px);
          }

          .timer-modal-head {
            position: sticky;
            top: 0;
            z-index: 8;
            padding: 8px 8px 10px;
            grid-template-columns: minmax(0, 1fr);
            grid-template-areas:
              "title"
              "toggle"
              "actions";
            row-gap: 8px;
          }

          .timer-modal-title {
            width: 100%;
            text-align: left;
            padding-left: 58px;
          }

          .menu-mode-toggle {
            width: 100%;
          }

          .menu-mode-btn {
            min-width: 0;
          }

          .import-export-grid {
            width: 100%;
          }

          .timer-modal-actions {
            width: 100%;
            margin-inline-start: 0;
            justify-content: center;
          }

          #schedule-modal .timer-modal-head {
            display: flex;
            grid-template-columns: none;
            grid-template-areas: none;
            row-gap: 0;
            padding: 8px 8px 10px;
          }

          #schedule-modal .timer-modal-title {
            width: auto;
            padding: 0;
            text-align: start;
          }

          .timer-modal-panel.menu-mode-tasks .timer-modal-head,
          .timer-modal-panel.menu-mode-import-export .timer-modal-head,
          .timer-modal-panel.menu-mode-history .timer-modal-head {
            row-gap: 6px;
            margin-bottom: 6px;
          }

          .timer-grid {
            grid-template-columns: repeat(auto-fit, minmax(118px, 1fr));
            gap: 10px;
          }

          .schedule-section-btn {
            min-height: 40px;
            font-size: 0.86rem;
          }

          .schedule-action-btn {
            min-height: 42px;
          }

          .schedule-input:not(.schedule-time-input),
          .schedule-select:not(.timeline-point-duration):not(#schedule-end-timer-select),
          .schedule-type-btn,
          .timeline-point-add {
            min-height: 44px;
            font-size: 16px;
          }

          /* Task modal only: smaller time / duration pickers; same grid as desktop */
          #schedule-modal input.schedule-time-input,
          #schedule-modal select#schedule-end-timer-select {
            min-height: 34px;
            padding: 2px 8px;
            font-size: 16px;
            max-width: min(10rem, 48vw);
            width: 100%;
            box-sizing: border-box;
            border-radius: 9px;
          }

          #schedule-modal .timeline-points input.schedule-time-input.timeline-point-time,
          #schedule-modal .timeline-points select.timeline-point-duration {
            min-height: 34px;
            padding: 2px 6px;
            font-size: 16px;
            max-width: min(8.5rem, 40vw);
            width: 100%;
            box-sizing: border-box;
            margin-inline: auto;
            border-radius: 9px;
          }

          .schedule-day,
          .schedule-month {
            min-height: 38px;
            font-size: 0.9rem;
          }

          .schedule-modal-actions {
            flex-direction: row;
            justify-content: center;
            gap: 10px;
            padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
          }

          .schedule-action-btn {
            min-height: 50px;
            font-size: 0.95rem;
          }

          .task-item {
            grid-template-columns: minmax(0, 1fr);
            gap: 8px;
          }

          .task-actions {
            justify-content: flex-start;
          }

          .tasks-head {
            align-items: flex-start;
          }

          .tasks-head-actions {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            width: 100%;
            justify-content: stretch;
            align-items: stretch;
            gap: 6px;
          }

          .tasks-import-mode {
            width: 100%;
            grid-column: 1 / -1;
          }

          .tasks-mode-btn {
            min-height: 40px;
            font-size: 0.82rem;
          }

          .tasks-import-btn,
          .tasks-export-btn,
          .tasks-add-btn,
          .tasks-vacation-btn {
            min-height: 42px;
            font-size: 0.82rem;
            width: 100%;
            padding: 6px 10px;
          }

          .tasks-head-actions .tasks-add-btn,
          .tasks-head-actions .tasks-vacation-btn {
            grid-column: 1 / -1;
          }

          #import-select-modal-panel {
            width: calc(100vw - 12px);
            max-height: min(90dvh, 760px);
            padding: 14px 12px calc(14px + env(safe-area-inset-bottom, 0px));
          }

          .import-select-actions {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }

          .import-select-actions .confirm-action-btn {
            min-width: 0;
            width: 100%;
            min-height: 46px;
          }

          .import-select-list {
            max-height: min(52dvh, 420px);
          }

          .import-select-item {
            padding: 10px 8px;
            gap: 12px;
          }

          .import-select-checkbox {
            width: 22px;
            height: 22px;
          }
        }

        @media (max-width: 520px) {
          .wrap {
            padding: 9px;
            gap: 7px;
          }

          .row {
            display: block;
          }

          .title {
            width: 100%;
            line-height: 1.25;
          }

          .subtitle {
            font-size: 0.8rem;
          }

          .countdown-value {
            font-size: 0.98rem;
          }

          .timer-grid {
            grid-template-columns: repeat(auto-fit, minmax(108px, 1fr));
          }

          #schedule-modal-panel {
            width: calc(100vw - 10px);
            max-height: min(90dvh, 860px);
            padding: 12px 10px calc(14px + env(safe-area-inset-bottom, 0px));
          }

          #schedule-modal input.schedule-time-input,
          #schedule-modal select#schedule-end-timer-select {
            min-height: 32px;
            max-width: min(9.25rem, 46vw);
            padding: 2px 6px;
          }

          #schedule-modal .timeline-points input.schedule-time-input.timeline-point-time,
          #schedule-modal .timeline-points select.timeline-point-duration {
            min-height: 32px;
            max-width: min(7.75rem, 36vw);
            padding: 2px 5px;
          }

          .confirm-modal-panel {
            width: calc(100vw - 16px);
            max-width: 420px;
            padding: 14px 12px;
            border-radius: 16px;
          }

          .confirm-modal-actions {
            justify-content: center;
          }

          .confirm-action-btn {
            min-width: min(46vw, 170px);
            min-height: 44px;
            font-size: 0.92rem;
          }

          #import-select-modal-panel {
            width: calc(100vw - 10px);
            max-height: min(92dvh, 760px);
            padding: 12px 10px calc(14px + env(safe-area-inset-bottom, 0px));
          }

          .import-select-actions {
            grid-template-columns: 1fr;
          }

          .import-select-actions .confirm-action-btn {
            min-height: 48px;
            font-size: 0.9rem;
          }

          .import-select-list {
            max-height: min(56dvh, 470px);
            padding: 5px;
          }

          .import-select-item-title {
            font-size: 0.9rem;
          }

          .import-select-item-subtitle {
            font-size: 0.8rem;
          }

          .schedule-section-switch {
            gap: 5px;
          }

          .schedule-section-btn {
            min-height: 38px;
            font-size: 0.78rem;
            padding: 5px 6px;
          }

          .schedule-recurrence-toggle {
            gap: 5px;
          }

          .schedule-type-btn {
            min-height: 42px;
            font-size: 0.84rem;
            padding: 6px 8px;
          }

          #schedule-holiday-kind-toggle .schedule-type-btn,
          #schedule-holiday-phase-toggle .schedule-type-btn,
          #schedule-holiday-subtype-toggle .schedule-type-btn {
            min-height: 40px;
            font-size: 0.82rem;
          }

          .schedule-form {
            min-height: 0;
          }

          .schedule-modal-actions {
            gap: 8px;
          }

          .schedule-action-btn {
            min-height: 52px;
            font-size: 0.92rem;
            padding: 8px 10px;
          }

          .tasks-head-actions {
            gap: 5px;
          }

          .tasks-import-btn,
          .tasks-export-btn,
          .tasks-add-btn,
          .tasks-vacation-btn {
            padding: 5px 8px;
            min-height: 44px;
            font-size: 0.84rem;
          }
          .timer-page-btn {
            width: 44px;
            height: 44px;
            font-size: 1.35rem;
          }

          .timer-close-btn {
            width: 46px;
            height: 46px;
            font-size: 1.2rem;
          }

          .quick-timers {
            grid-template-columns: repeat(auto-fit, minmax(76px, 1fr));
            gap: 5px;
          }

          .sensors-row {
            gap: 8px;
          }

          .sensor-pill {
            min-height: 0;
            padding: 0;
          }

          .sensor-label {
            display: none;
          }

          .sensor-value {
            font-size: 0.94rem;
          }

          .boiler-icon {
            width: clamp(84px, 24vw, 118px);
            height: auto;
          }

          .boiler-meta {
            gap: 4px;
          }

          .quick-timer-btn {
            min-height: 38px;
            padding: 4px 2px;
            font-size: 0.78rem;
          }
        }

        @media (pointer: coarse) {
          .quick-timer-btn {
            min-height: 42px;
            font-size: 0.9rem;
          }

          .timer-menu-btn {
            width: 40px;
            height: 40px;
          }

          .timer-option-btn {
            min-height: 50px;
          }
        }

        @media (pointer: coarse) and (max-width: 520px) {
          .quick-timer-btn {
            min-height: 38px;
            font-size: 0.78rem;
          }

          .timer-menu-btn {
            width: 44px;
            height: 44px;
          }
        }

        @keyframes card-enter {
          from {
            transform: translateY(4px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes boiler-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 var(--heat-glow);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(0, 0, 0, 0);
          }
        }

        @keyframes modal-sheet-up {
          from {
            transform: translateY(16px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

      </style>

      <ha-card class="theme-${cardTheme}">
        <div class="wrap">
          <div class="row">
            <h2 class="title" id="title"></h2>
          </div>

          <p class="subtitle" id="subtitle">Ready</p>

          <div class="boiler-visual" id="boiler-visual">
            <div class="boiler-icon" id="boiler-icon">
              <img class="boiler-main-image" id="boiler-main-image" alt="Boiler Water Flow" />
            </div>
            <div class="boiler-meta">
              <p class="boiler-stage" id="boiler-stage">Cool Stage</p>
              <p class="upcoming-task-notice" id="upcoming-task-notice" hidden></p>
              <p class="active-task-notice" id="active-task-notice" hidden></p>
              <p class="vacation-notice" id="vacation-notice" hidden></p>
              <div class="sensors-row" id="sensors-row" hidden></div>
              <div class="boiler-progress-row">
                <p class="boiler-stage-sub" id="boiler-stage-sub">0% warmed</p>
                <div class="boiler-progress-track">
                  <div class="boiler-progress-fill" id="boiler-progress-fill"></div>
                  <p class="boiler-progress-hint" id="boiler-progress-hint" hidden></p>
                </div>
                <span class="countdown-value" id="countdown-value">--:--</span>
                <span class="countdown-label" id="countdown-label">Remaining</span>
                <button type="button" class="timer-menu-btn" id="timer-menu-btn" aria-label="Timer menu">☰</button>
              </div>
            </div>
          </div>

          <div class="quick-timers" id="quick-timers"></div>

          <p class="error" id="error" hidden></p>
        </div>
      </ha-card>

      <div class="timer-modal" id="timer-modal" hidden>
        <div class="timer-modal-backdrop" id="timer-modal-backdrop"></div>
        <div class="timer-modal-panel" id="timer-modal-panel" role="dialog" aria-modal="true" aria-label="Timer Picker">
          <div class="timer-modal-head">
            <h3 class="timer-modal-title" id="timer-modal-title">Select Timer</h3>
            <div class="menu-mode-toggle">
              <button type="button" class="menu-mode-btn" id="modal-mode-timer-btn">Timer</button>
              <button type="button" class="menu-mode-btn" id="modal-mode-tasks-btn">Tasks</button>
              <button type="button" class="menu-mode-btn" id="modal-mode-import-export-btn">Import/Export</button>
            </div>
            <div class="timer-modal-actions">
              <div class="timer-page-controls" id="timer-page-controls">
                <button type="button" class="timer-page-btn" id="timer-page-prev-btn" aria-label="Previous page">‹</button>
                <span class="timer-page-indicator" id="timer-page-indicator">1 / 1</span>
                <button type="button" class="timer-page-btn" id="timer-page-next-btn" aria-label="Next page">›</button>
              </div>
              <button type="button" class="timer-close-btn" id="timer-history-btn" aria-label="History">👁</button>
              <button type="button" class="timer-close-btn" id="timer-guide-btn" aria-label="Guide">ℹ</button>
              <button type="button" class="timer-close-btn" id="timer-close-btn">✕</button>
            </div>
          </div>
          <div class="menu-view" id="modal-timer-view">
            <div class="timer-grid" id="timer-grid"></div>
          </div>
          <div class="menu-view" id="modal-tasks-view" hidden>
            <div class="tasks-card">
              <div class="tasks-head">
                <p class="tasks-title" id="tasks-title">Tasks</p>
                <div class="tasks-head-actions">
                  <button type="button" class="tasks-add-btn" id="tasks-add-btn">Add</button>
                  <button type="button" class="tasks-vacation-btn" id="tasks-vacation-btn">Vacation</button>
                </div>
              </div>
              <div class="tasks-list" id="tasks-list"></div>
            </div>
          </div>
          <div class="menu-view" id="modal-import-export-view" hidden>
            <div class="tasks-card import-export-card">
              <p class="tasks-title" id="import-export-title">Import/Export</p>
              <div class="import-export-grid">
                <button type="button" class="tasks-mode-btn" id="tasks-mode-replace-btn" data-import-mode="replace">Replace</button>
                <button type="button" class="tasks-mode-btn" id="tasks-mode-merge-btn" data-import-mode="merge">Merge</button>
                <button type="button" class="tasks-export-btn" id="tasks-export-btn">Export</button>
                <button type="button" class="tasks-import-btn" id="tasks-import-btn">Import</button>
              </div>
              <input type="file" id="tasks-import-file" accept="application/json,.json" hidden />
            </div>
          </div>
          <div class="menu-view" id="modal-history-view" hidden>
            <div class="tasks-card">
              <div class="history-head">
                <p class="tasks-title" id="history-title">History</p>
                <div class="history-head-actions">
                  <button type="button" class="history-clear-btn" id="history-clear-btn" aria-label="Clear log" title="Clear log">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4zM6 7v14a2 2 0 002 2h8a2 2 0 002-2V7H6zm3 2h2v10H9V9zm4 0h2v10h-2V9zm4 0h2v10h-2V9z"/></svg>
                  </button>
                  <button type="button" class="tasks-export-btn history-export-btn" id="history-export-btn">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8l-4-5zM8 5h4v4H8V5zm0 6h8v8H8v-8z"/></svg>
                    <span id="history-export-label">Export log</span>
                  </button>
                </div>
              </div>
              <div class="history-list" id="history-list"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="timer-modal" id="schedule-modal" hidden>
        <div class="timer-modal-backdrop" id="schedule-modal-backdrop"></div>
        <div class="timer-modal-panel" id="schedule-modal-panel" role="dialog" aria-modal="true" aria-label="Task Creator">
          <div class="timer-modal-head">
            <h3 class="timer-modal-title" id="schedule-modal-title">Add Task</h3>
            <button type="button" class="timer-close-btn" id="schedule-close-btn">✕</button>
          </div>
          <form class="schedule-form" id="schedule-form">
            <div class="schedule-form-scroll" id="schedule-form-scroll">
            <div class="schedule-field">
              <label class="schedule-label" for="schedule-name-input" id="schedule-name-label">Task Name</label>
              <div class="schedule-control-row">
                <input class="schedule-input" id="schedule-name-input" type="text" maxlength="80" />
                <button type="button" class="schedule-clear-btn" id="schedule-name-clear-btn" aria-label="Clear">✕</button>
              </div>
            </div>
            <div class="schedule-category-switch" id="schedule-category-switch">
              <button type="button" class="schedule-section-btn active" id="schedule-category-time-btn">Time</button>
              <button type="button" class="schedule-section-btn" id="schedule-category-recurrence-btn">Recurrence</button>
              <button type="button" class="schedule-section-btn" id="schedule-category-conditions-btn">Conditions</button>
            </div>
            <div class="schedule-field" id="schedule-type-field">
              <label class="schedule-label" id="schedule-type-label">Type</label>
              <div class="schedule-type-toggle" id="schedule-type-toggle">
                <button type="button" class="schedule-type-btn" id="schedule-type-window-btn" data-type="window">Time Window</button>
                <button type="button" class="schedule-type-btn" id="schedule-type-holiday-btn" data-type="holiday">Holidays/Shabbat</button>
                <button type="button" class="schedule-type-btn" id="schedule-type-timeline-btn" data-type="timeline">Timeline</button>
              </div>
              <input id="schedule-type-input" type="hidden" value="window" />
            </div>
            <div class="schedule-section-switch" id="schedule-section-switch">
              <button type="button" class="schedule-section-btn" id="schedule-panel-recurrence-btn" data-panel="recurrence">Recurrence</button>
              <button type="button" class="schedule-section-btn" id="schedule-panel-days-btn" data-panel="days">Days</button>
              <button type="button" class="schedule-section-btn" id="schedule-panel-months-btn" data-panel="months">Months</button>
            </div>
            <div id="schedule-window-fields" class="schedule-window-fields">
              <div class="schedule-time-row">
                <div class="schedule-field">
                  <label class="schedule-label" for="schedule-start-input" id="schedule-start-label">Start</label>
                  <div class="schedule-control-row">
                    <input class="schedule-input schedule-time-input" id="schedule-start-input" type="time" dir="ltr" />
                    <button type="button" class="schedule-clear-btn" id="schedule-start-clear-btn" aria-label="Clear">✕</button>
                  </div>
                </div>
                <div class="schedule-field">
                  <label class="schedule-label" for="schedule-end-input" id="schedule-end-label">End</label>
                  <div class="schedule-control-row">
                    <input class="schedule-input schedule-time-input" id="schedule-end-input" type="time" dir="ltr" />
                    <select class="schedule-select" id="schedule-end-timer-select" hidden></select>
                    <button type="button" class="schedule-clear-btn" id="schedule-end-clear-btn" aria-label="Clear">✕</button>
                  </div>
                </div>
              </div>
            </div>
            <div id="schedule-timeline-fields" class="schedule-timeline-fields" hidden>
              <div class="schedule-field">
                <span class="schedule-label" id="timeline-points-label">Timeline Points</span>
                <div class="timeline-points" id="timeline-points"></div>
              </div>
              <button type="button" class="timeline-point-add" id="timeline-point-add-btn">Add Point</button>
            </div>
            <div class="schedule-section-panel" id="schedule-panel-recurrence">
              <div id="schedule-recurrence-group">
              <div class="schedule-field">
                <label class="schedule-label" for="schedule-recurrence-input" id="schedule-recurrence-label">Recurrence</label>
                <div class="schedule-recurrence-toggle" id="schedule-recurrence-toggle">
                  <button type="button" class="schedule-type-btn" id="schedule-recurrence-forever-btn" data-recurrence="forever">Forever</button>
                  <button type="button" class="schedule-type-btn" id="schedule-recurrence-once-btn" data-recurrence="once">One Time</button>
                  <button type="button" class="schedule-type-btn" id="schedule-recurrence-range-btn" data-recurrence="range">Date Range</button>
                </div>
                <input id="schedule-recurrence-input" type="hidden" value="forever" />
              </div>
              <div class="schedule-time-row schedule-date-row" id="schedule-date-row">
                <div class="schedule-field">
                  <label class="schedule-label" for="schedule-start-date-input" id="schedule-date-start-label">From Date</label>
                  <div class="schedule-control-row">
                    <input class="schedule-input" id="schedule-start-date-input" type="date" />
                    <button type="button" class="schedule-clear-btn" id="schedule-start-date-clear-btn" aria-label="Clear">✕</button>
                  </div>
                </div>
                <div class="schedule-field">
                  <label class="schedule-label" for="schedule-end-date-input" id="schedule-date-end-label">To Date</label>
                  <div class="schedule-control-row">
                    <input class="schedule-input" id="schedule-end-date-input" type="date" />
                    <button type="button" class="schedule-clear-btn" id="schedule-end-date-clear-btn" aria-label="Clear">✕</button>
                  </div>
                </div>
              </div>
              </div>
              <div id="schedule-condition-group">
              <div class="schedule-field">
                <label class="schedule-label" id="schedule-condition-label">Condition</label>
              </div>
              <div class="schedule-time-row schedule-condition-row" id="schedule-condition-row">
                <div class="schedule-field">
                  <label class="schedule-label" for="schedule-condition-entity-input" id="schedule-condition-entity-label">Condition Entity</label>
                  <div class="schedule-control-row">
                    <input
                      class="schedule-input"
                      id="schedule-condition-entity-input"
                      type="text"
                      list="schedule-condition-entity-list"
                      placeholder="input_boolean.boiler_block"
                      autocomplete="off"
                    />
                    <button type="button" class="schedule-clear-btn" id="schedule-condition-entity-clear-btn" aria-label="Clear">✕</button>
                  </div>
                  <datalist id="schedule-condition-entity-list"></datalist>
                </div>
                <div class="schedule-field">
                  <label class="schedule-label" for="schedule-condition-state-input" id="schedule-condition-state-label">Skip If State</label>
                  <div class="schedule-condition-state-row">
                    <div class="schedule-control-row">
                      <select
                        class="schedule-select"
                        id="schedule-condition-operator-input"
                      ></select>
                      <button type="button" class="schedule-clear-btn" id="schedule-condition-operator-clear-btn" aria-label="Clear">✕</button>
                    </div>
                    <div class="schedule-control-row">
                      <input
                        class="schedule-input"
                        id="schedule-condition-state-input"
                        type="text"
                        list="schedule-condition-state-list"
                        autocomplete="off"
                      />
                      <button type="button" class="schedule-clear-btn" id="schedule-condition-state-clear-btn" aria-label="Clear">✕</button>
                    </div>
                  </div>
                  <datalist id="schedule-condition-state-list"></datalist>
                </div>
              </div>
              </div>
              <div class="schedule-field" id="schedule-holiday-group" hidden>
                <input id="schedule-holiday-trigger-mode-input" type="hidden" value="schedule" />
                <div class="schedule-time-row schedule-condition-row" id="schedule-holiday-row-primary">
                  <div class="schedule-field" id="schedule-holiday-kind-field">
                    <label class="schedule-label" for="schedule-holiday-kind-input" id="schedule-holiday-kind-label">Event type</label>
                    <div class="schedule-type-toggle" id="schedule-holiday-kind-toggle">
                      <button type="button" class="schedule-type-btn" id="schedule-holiday-kind-opt-shabbat" data-holiday-kind="shabbat">Shabbat</button>
                      <button type="button" class="schedule-type-btn" id="schedule-holiday-kind-opt-holiday" data-holiday-kind="holiday">Holiday</button>
                    </div>
                    <input id="schedule-holiday-kind-input" type="hidden" value="shabbat" />
                  </div>
                  <div class="schedule-field" id="schedule-holiday-offset-field">
                    <span class="schedule-label" id="schedule-holiday-offset-label">Offset</span>
                    <input type="hidden" id="schedule-holiday-offset-input" value="0" />
                    <div class="schedule-holiday-offset-inline">
                      <button type="button" class="schedule-offset-sign-solo" id="schedule-holiday-offset-sign-btn" data-offset-positive="1">+</button>
                      <input
                        class="schedule-input schedule-offset-minutes-only"
                        id="schedule-holiday-offset-mag-input"
                        type="number"
                        inputmode="numeric"
                        min="0"
                        max="1440"
                        step="1"
                        value="0"
                      />
                    </div>
                    <div class="schedule-offset-equiv" id="schedule-holiday-offset-equiv" aria-live="polite"></div>
                  </div>
                </div>
                <div class="schedule-time-row schedule-condition-row" id="schedule-holiday-row-secondary">
                  <div class="schedule-field">
                    <label class="schedule-label" for="schedule-holiday-phase-input" id="schedule-holiday-phase-label">Event phase</label>
                    <div class="schedule-type-toggle" id="schedule-holiday-phase-toggle">
                      <button type="button" class="schedule-type-btn" id="schedule-holiday-phase-opt-start" data-holiday-phase="start">Start</button>
                      <button type="button" class="schedule-type-btn" id="schedule-holiday-phase-opt-end" data-holiday-phase="end">End</button>
                    </div>
                    <input id="schedule-holiday-phase-input" type="hidden" value="start" />
                  </div>
                  <div class="schedule-field" id="schedule-holiday-subtype-field">
                    <label class="schedule-label" for="schedule-holiday-subtype-input" id="schedule-holiday-subtype-label">Holiday subtype</label>
                    <div class="schedule-type-toggle" id="schedule-holiday-subtype-toggle">
                      <button type="button" class="schedule-type-btn" id="schedule-holiday-subtype-opt-all" data-holiday-subtype="all">All holidays</button>
                      <button type="button" class="schedule-type-btn" id="schedule-holiday-subtype-opt-yomtov" data-holiday-subtype="yomtov">Yom Tov (Shabbat-like)</button>
                      <button type="button" class="schedule-type-btn" id="schedule-holiday-subtype-opt-regular" data-holiday-subtype="regular">Regular holiday</button>
                    </div>
                    <input id="schedule-holiday-subtype-input" type="hidden" value="all" />
                  </div>
                </div>
              </div>
            </div>
            <div class="schedule-section-panel" id="schedule-panel-days" hidden>
              <div class="schedule-field">
                <span class="schedule-label" id="schedule-days-label">Days</span>
                <div class="schedule-days" id="schedule-days"></div>
              </div>
            </div>
            <div class="schedule-section-panel" id="schedule-panel-months" hidden>
              <div class="schedule-field">
                <span class="schedule-label" id="schedule-months-label">Months</span>
                <div class="schedule-months" id="schedule-months"></div>
              </div>
            </div>
            </div>
            <div class="schedule-modal-actions">
              <button type="button" class="schedule-action-btn" id="schedule-cancel-btn">Cancel</button>
              <button type="submit" class="schedule-action-btn primary" id="schedule-save-btn">Save</button>
            </div>
          </form>
        </div>
      </div>

      <div class="timer-modal" id="confirm-modal" hidden>
        <div class="timer-modal-backdrop" id="confirm-modal-backdrop"></div>
        <div class="confirm-modal-panel" id="confirm-modal-panel" role="dialog" aria-modal="true" aria-label="Confirm">
          <h3 class="confirm-modal-title" id="confirm-modal-title">Confirm</h3>
          <p class="confirm-modal-message" id="confirm-modal-message"></p>
          <div class="confirm-modal-actions">
            <button type="button" class="confirm-action-btn" id="confirm-cancel-btn">Cancel</button>
            <button type="button" class="confirm-action-btn primary" id="confirm-ok-btn">OK</button>
          </div>
        </div>
      </div>

      <div class="timer-modal" id="import-select-modal" hidden>
        <div class="timer-modal-backdrop" id="import-select-modal-backdrop"></div>
        <div class="confirm-modal-panel" id="import-select-modal-panel" role="dialog" aria-modal="true" aria-label="Select Tasks">
          <h3 class="confirm-modal-title" id="import-select-title">Select Tasks to Import</h3>
          <p class="import-select-message" id="import-select-message">Choose which tasks to import:</p>
          <div class="import-select-actions">
            <button type="button" class="confirm-action-btn" id="import-select-all-btn">Select All</button>
            <button type="button" class="confirm-action-btn" id="import-clear-all-btn">Clear All</button>
          </div>
          <div class="import-select-list" id="import-select-list"></div>
          <div class="confirm-modal-actions">
            <button type="button" class="confirm-action-btn" id="import-select-cancel-btn">Cancel</button>
            <button type="button" class="confirm-action-btn primary" id="import-select-ok-btn">Import</button>
          </div>
        </div>
      </div>

      <div class="timer-modal" id="guide-modal" hidden>
        <div class="timer-modal-backdrop" id="guide-modal-backdrop"></div>
        <div class="confirm-modal-panel guide-modal-panel" id="guide-modal-panel" role="dialog" aria-modal="true" aria-label="Guide">
          <div class="guide-modal-head">
            <h3 class="confirm-modal-title" id="guide-modal-title">Guide</h3>
            <button type="button" class="timer-close-btn" id="guide-modal-close-btn">✕</button>
          </div>
          <div class="guide-modal-tabs">
            <button type="button" class="guide-tab-btn active" id="guide-tab-manual-btn" data-guide-tab="manual">Guide</button>
            <button type="button" class="guide-tab-btn" id="guide-tab-hebcal-btn" data-guide-tab="hebcal">Holidays</button>
          </div>
          <div class="guide-modal-body">
            <div id="guide-panel-manual" class="guide-tab-panel">
              <p class="confirm-modal-message" id="guide-panel-manual-text"></p>
            </div>
            <div id="guide-panel-hebcal" class="guide-tab-panel" hidden>
              <p class="guide-hebcal-city" id="guide-hebcal-city" hidden></p>
              <div class="guide-hebcal-filter" id="guide-hebcal-filter" role="group" aria-label="Hebcal list filter">
                <button type="button" class="guide-hebcal-filter-btn active" id="guide-hebcal-filter-all" data-hebcal-filter="all">All</button>
                <button type="button" class="guide-hebcal-filter-btn" id="guide-hebcal-filter-holiday" data-hebcal-filter="holiday">Holidays</button>
                <button type="button" class="guide-hebcal-filter-btn" id="guide-hebcal-filter-shabbat" data-hebcal-filter="shabbat">Shabbat</button>
              </div>
              <div class="guide-hebcal-list" id="guide-hebcal-list"></div>
              <p class="guide-hebcal-status" id="guide-hebcal-status" hidden></p>
            </div>
          </div>
          <div class="confirm-modal-actions">
            <button type="button" class="confirm-action-btn primary" id="guide-modal-ok-btn">OK</button>
          </div>
        </div>
      </div>
    `;

    this._elements = {
      title: this.shadowRoot.getElementById("title"),
      subtitle: this.shadowRoot.getElementById("subtitle"),
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
      guidePanelManualText: this.shadowRoot.getElementById("guide-panel-manual-text"),
      guidePanelHebcal: this.shadowRoot.getElementById("guide-panel-hebcal"),
      guideHebcalCity: this.shadowRoot.getElementById("guide-hebcal-city"),
      guideHebcalFilterAll: this.shadowRoot.getElementById("guide-hebcal-filter-all"),
      guideHebcalFilterHoliday: this.shadowRoot.getElementById("guide-hebcal-filter-holiday"),
      guideHebcalFilterShabbat: this.shadowRoot.getElementById("guide-hebcal-filter-shabbat"),
      guideHebcalList: this.shadowRoot.getElementById("guide-hebcal-list"),
      guideHebcalStatus: this.shadowRoot.getElementById("guide-hebcal-status"),
    };

    this._elements.timerMenuBtn.addEventListener("click", () => this._openTimerModal());
    this._elements.timerCloseBtn.addEventListener("click", () => this._closeTimerModal());
    this._elements.timerHistoryBtn?.addEventListener("click", () => this._setMenuMode("history"));
    this._elements.timerGuideBtn?.addEventListener("click", () => this._openGuideModal());
    this._elements.timerModalBackdrop.addEventListener("click", () => this._closeTimerModal());
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
    const flowImage = cfg.boiler_flow_image || "/local/boiler-card/boiler-flow.png";
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

    if (this._isSwitcherMode()) {
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

    if (this._isSwitcherMode()) {
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

    if (!isOn) {
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
    const progress = this._clamp(timerProgress, 0, 1);
    const totalMinutes = Number.isFinite(totalSeconds) && totalSeconds > 0 ? (totalSeconds / 60) : null;
    if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
      return progress;
    }

    const elapsedMinutes = progress * totalMinutes;
    const effectiveHeatMinutes = this._effectiveHeatupMinutes(totalMinutes);
    if (!Number.isFinite(effectiveHeatMinutes) || effectiveHeatMinutes <= 0) {
      return progress;
    }
    return this._clamp(elapsedMinutes / effectiveHeatMinutes, 0, 1);
  }

  _effectiveHeatupMinutes(totalMinutes) {
    // 15m timers stay literal. Longer timers increase heating pace sub-linearly
    // so visual heat-up remains believable and doesn't stay "blue" for too long.
    const minHeat = 15;
    const maxHeat = 55;
    const normalized = this._clamp((totalMinutes - minHeat) / 90, 0, 1);
    const curve = Math.pow(normalized, 0.7);
    return this._clamp(minHeat + (maxHeat - minHeat) * curve, minHeat, maxHeat);
  }

  _stagedHeatGradient(colorProgress) {
    const p = this._clamp(colorProgress, 0, 1);
    const blue = "#2b7fff";
    const yellow = "#f3d34f";
    const orange = "#f97316";
    const red = "#dc2626";

    if (p < 0.3) {
      return `linear-gradient(90deg, ${blue} 0%, ${blue} 100%)`;
    }

    const yellowBase = 35 * this._clamp((p - 0.3) / 0.2, 0, 1);
    const orangeWidth = 30 * this._clamp((p - 0.5) / 0.2, 0, 1);
    const redWidth = 30 * this._clamp((p - 0.7) / 0.3, 0, 1);
    const yellowWidth = this._clamp(yellowBase - (redWidth * 0.4), 0, 40);
    const blueWidth = this._clamp(100 - yellowWidth - orangeWidth - redWidth, 0, 100);

    const blueEnd = blueWidth;
    const yellowEnd = blueEnd + yellowWidth;
    const orangeEnd = yellowEnd + orangeWidth;
    const blend = 2.2;

    if (orangeWidth <= 0.01) {
      return `linear-gradient(90deg, ${blue} 0%, ${blue} ${Math.max(0, blueEnd - blend)}%, ${yellow} ${Math.min(100, blueEnd + blend)}%, ${yellow} 100%)`;
    }
    if (redWidth <= 0.01) {
      return `linear-gradient(90deg, ${blue} 0%, ${blue} ${Math.max(0, blueEnd - blend)}%, ${yellow} ${Math.min(100, blueEnd + blend)}%, ${yellow} ${Math.max(0, yellowEnd - blend)}%, ${orange} ${Math.min(100, yellowEnd + blend)}%, ${orange} 100%)`;
    }
    return `linear-gradient(90deg, ${blue} 0%, ${blue} ${Math.max(0, blueEnd - blend)}%, ${yellow} ${Math.min(100, blueEnd + blend)}%, ${yellow} ${Math.max(0, yellowEnd - blend)}%, ${orange} ${Math.min(100, yellowEnd + blend)}%, ${orange} ${Math.max(0, orangeEnd - blend)}%, ${red} ${Math.min(100, orangeEnd + blend)}%, ${red} 100%)`;
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
    const rawState = String(entity?.state || "").trim();
    if (!rawState) {
      return null;
    }

    const normalized = rawState.toLowerCase();
    if (normalized === "unknown" || normalized === "unavailable" || normalized === "none") {
      return null;
    }

    const value = Number.parseFloat(rawState.replace(",", "."));
    if (!Number.isFinite(value)) {
      return null;
    }

    const unit = String(entity?.attributes?.unit_of_measurement || "").trim();
    return { rawState, value, unit };
  }

  _temperatureProgressFromCelsius(celsiusValue) {
    // Explicit fixed bands from 0C so cold water (0-30C) is always represented as blue range.
    if (celsiusValue <= 0) {
      return 0;
    }
    if (celsiusValue <= 30) {
      return this._clamp((celsiusValue / 30) * 0.6, 0, 0.6);
    }
    if (celsiusValue <= 40) {
      return this._clamp(0.6 + ((celsiusValue - 30) / 10) * 0.2, 0.6, 0.8);
    }
    if (celsiusValue < 50) {
      return this._clamp(0.8 + ((celsiusValue - 40) / 10) * 0.2, 0.8, 1);
    }
    return 1;
  }

  _toCelsius(value, unit) {
    const temp = Number.parseFloat(String(value).replace(",", "."));
    if (!Number.isFinite(temp)) {
      return NaN;
    }

    const normalizedUnit = String(unit || "").trim().toLowerCase();
    if (normalizedUnit === "k" || normalizedUnit.includes("kelvin")) {
      return temp - 273.15;
    }
    if (
      normalizedUnit === "f"
      || normalizedUnit === "°f"
      || normalizedUnit.includes("fahrenheit")
      || normalizedUnit.includes("°f")
    ) {
      return (temp - 32) * (5 / 9);
    }
    return temp;
  }

  _formatTemperatureDisplay(rawState, unit, celsiusValue) {
    const cleanRaw = String(rawState || "").trim();
    const cleanUnit = String(unit || "").trim();
    if (cleanRaw && cleanUnit) {
      return `${cleanRaw} ${cleanUnit}`;
    }
    if (cleanRaw) {
      return cleanRaw;
    }
    if (Number.isFinite(celsiusValue)) {
      return `${Math.round(celsiusValue * 10) / 10} °C`;
    }
    return this._t("sensor_unavailable");
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
    if (this._isSwitcherMode()) {
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
    const shouldForceOff = isOn || builtInTimedActive || (!scheduleActive && legacyTimerActive);
    if (!shouldForceOff) {
      return;
    }
    this._forceVacationShutdown();
  }

  _normalizeHolidayPolicy(value) {
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

  _holidayTimerPolicy() {
    return this._normalizeHolidayPolicy(this._config?.holiday_timer_policy);
  }

  _holidayTaskPolicy() {
    return this._normalizeHolidayPolicy(this._config?.holiday_task_policy);
  }

  _holidayActiveStateList() {
    const raw = this._config?.holiday_active_states;
    const values = Array.isArray(raw)
      ? raw
      : String(raw || "")
          .split(/[,\s]+/)
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
    const normalized = values
      .map((item) => String(item || "").trim().toLowerCase())
      .filter((item) => item.length > 0);
    return normalized.length > 0
      ? normalized
      : ["on", "home", "active", "true"];
  }

  _isHolidaySourceActiveState(stateValue) {
    const activeStates = this._holidayActiveStateList();
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
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "number") {
      return Number.isFinite(value) && value !== 0;
    }
    const normalized = String(value ?? "").trim().toLowerCase();
    return ["1", "true", "on", "yes", "y", "active"].includes(normalized);
  }

  _holidayWorkProhibited(holidayStateObj) {
    const attrs = holidayStateObj?.attributes || {};
    const keys = [
      "work_prohibited",
      "yomtov",
      "is_yomtov",
      "is_yom_tov",
      "yom_tov",
      "issur_melacha",
      "melacha_forbidden",
      "forbid_work",
    ];
    return keys.some((key) => this._isTruthyHolidayFlag(attrs?.[key]));
  }

  _holidayShabbatStatus() {
    const managerMode = this._boilerManagerModeEntity();
    const managerAttrs = managerMode?.attributes || {};
    const managerHebcalActive = this._asTruthy(managerAttrs.hebcal_active);
    const managerHebcalKind = String(managerAttrs.hebcal_kind || "").trim().toLowerCase();
    const managerWorkProhibited = this._asTruthy(managerAttrs.hebcal_work_prohibited);
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
        holiday: this._holidaySourceStatus(this._config?.holiday_entity),
        shabbat: this._holidaySourceStatus(this._config?.shabbat_entity),
        kind,
        isHolidayRegular,
        isHolidayShabbat,
        active: kind !== "none",
      };
    }

    const holiday = this._holidaySourceStatus(this._config?.holiday_entity);
    const shabbat = this._holidaySourceStatus(this._config?.shabbat_entity);
    const holidayLooksLikeYomTov = Boolean(holiday.active && this._holidayWorkProhibited(holiday.stateObj));
    const isHolidayShabbat = Boolean((holiday.active && shabbat.active) || holidayLooksLikeYomTov);
    const isShabbat = Boolean(!holiday.active && shabbat.active);
    const isHolidayRegular = Boolean(holiday.active && !isHolidayShabbat);
    const kind = isHolidayShabbat
      ? "holiday_shabbat"
      : isHolidayRegular
        ? "holiday_regular"
        : isShabbat
          ? "shabbat"
          : "none";
    return {
      holiday,
      shabbat,
      kind,
      isHolidayRegular,
      isHolidayShabbat,
      active: Boolean(holiday.active || shabbat.active),
    };
  }

  _holidayTimerPolicyForStatus(status = null) {
    const sourceStatus = status || this._holidayShabbatStatus();
    const kind = String(sourceStatus?.kind || "none");
    if (kind === "holiday_shabbat") {
      return this._normalizeHolidayPolicy(
        this._config?.holiday_shabbat_timer_policy ?? this._config?.yomtov_timer_policy
      );
    }
    if (kind === "holiday_regular") {
      return this._normalizeHolidayPolicy(
        this._config?.holiday_regular_timer_policy
      );
    }
    if (kind === "shabbat") {
      return this._normalizeHolidayPolicy(
        this._config?.shabbat_timer_policy
      );
    }
    return this._holidayTimerPolicy();
  }

  _holidayTaskPolicyForStatus(status = null) {
    const sourceStatus = status || this._holidayShabbatStatus();
    const kind = String(sourceStatus?.kind || "none");
    if (kind === "holiday_shabbat") {
      return this._normalizeHolidayPolicy(
        this._config?.holiday_shabbat_task_policy ?? this._config?.yomtov_task_policy
      );
    }
    if (kind === "holiday_regular") {
      return this._normalizeHolidayPolicy(
        this._config?.holiday_regular_task_policy
      );
    }
    if (kind === "shabbat") {
      return this._normalizeHolidayPolicy(
        this._config?.shabbat_task_policy
      );
    }
    return this._holidayTaskPolicy();
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
    const shouldForceOff = isOn || builtInTimedActive || (!scheduleActive && legacyTimerActive);
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
    const attrs = taskState?.attributes || {};
    const taskType = String(attrs.task_type || "window").toLowerCase() === "timeline" ? "timeline" : "window";
    const name = String(attrs.task_name || attrs.friendly_name || "").trim();
    if (!name) {
      return null;
    }

    const days = this._normalizedDaysForExport(attrs.days);
    const months = this._normalizedMonthsForExport(attrs.months);
    const recurrence = this._normalizedRecurrenceForExport(attrs.recurrence);
    const enabled = String(taskState.state || "").toLowerCase() === "on";
    const conditionEntity = String(attrs.condition_entity || "").trim();
    const conditionOperator = this._normalizeConditionOperator(attrs.condition_operator);
    const skipIfState = String(attrs.skip_if_state || "").trim();

    const base = {
      name,
      task_type: taskType,
      days,
      months,
      recurrence,
      ...(attrs.start_date ? { start_date: String(attrs.start_date).trim() } : {}),
      ...(attrs.end_date ? { end_date: String(attrs.end_date).trim() } : {}),
      ...(conditionEntity ? { condition_entity: conditionEntity } : {}),
      ...(conditionEntity ? { condition_operator: conditionOperator } : {}),
      ...(conditionEntity && skipIfState ? { skip_if_state: skipIfState } : {}),
      enabled,
    };

    if (taskType === "timeline") {
      const timelinePoints = Array.isArray(attrs.timeline_points)
        ? attrs.timeline_points
            .map((point) => {
              const at = String(point?.at || "").trim();
              const durationOption = String(point?.duration_option || "").trim();
              const durationMinutes = Number.parseInt(point?.duration_minutes, 10);
              if (!at || (!durationOption && !Number.isInteger(durationMinutes))) {
                return null;
              }
              const minutes = Number.isInteger(durationMinutes) && durationMinutes > 0
                ? durationMinutes
                : this._optionToMinutes(durationOption);
              if (!minutes || minutes <= 0) {
                return null;
              }
              return {
                at,
                duration_option: durationOption || `${minutes}m`,
                duration_minutes: minutes,
              };
            })
            .filter((point) => !!point)
        : [];

      if (timelinePoints.length > 0) {
        return {
          ...base,
          timeline_points: timelinePoints,
        };
      }
    }

    const startTime = String(attrs.start_time || "").trim();
    const endTime = String(attrs.end_time || "").trim();
    if (!startTime || !endTime) {
      return null;
    }

    return {
      ...base,
      start_time: startTime,
      end_time: endTime,
    };
  }

  _normalizedDaysForExport(days) {
    if (!Array.isArray(days)) {
      return [0, 1, 2, 3, 4, 5, 6];
    }
    const normalized = days
      .map((item) => Number.parseInt(item, 10))
      .filter((item) => Number.isInteger(item) && item >= 0 && item <= 6);
    return normalized.length > 0 ? [...new Set(normalized)].sort((a, b) => a - b) : [0, 1, 2, 3, 4, 5, 6];
  }

  _normalizedMonthsForExport(months) {
    if (!Array.isArray(months)) {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    }
    const normalized = months
      .map((item) => Number.parseInt(item, 10))
      .filter((item) => Number.isInteger(item) && item >= 1 && item <= 12);
    return normalized.length > 0 ? [...new Set(normalized)].sort((a, b) => a - b) : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  }

  _normalizedRecurrenceForExport(value) {
    const normalized = String(value || "forever").trim().toLowerCase();
    if (normalized === "once" || normalized === "range") {
      return normalized;
    }
    return "forever";
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
    if (!Array.isArray(options) || options.length === 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(options.length / this._timerPageSize));
  }

  _setTimerPageToOption(options, option) {
    if (!Array.isArray(options) || options.length === 0) {
      this._timerPageIndex = 0;
      return;
    }
    const selectedIndex = options.indexOf(option);
    if (selectedIndex < 0) {
      this._timerPageIndex = 0;
      return;
    }
    this._timerPageIndex = Math.floor(selectedIndex / this._timerPageSize);
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
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          throw new Error("hebcal_fetch_failed");
        }
        const payload = await res.json();
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
    const upcoming = windows
      .filter((w) => {
        const end = Date.parse(w?.ends_at);
        return Number.isFinite(end) && end > now;
      })
      .sort((a, b) => String(a.starts_at).localeCompare(String(b.starts_at)));
    const filter = this._guideHebcalFilter || "all";
    const rows =
      filter === "all"
        ? upcoming
        : upcoming.filter((w) => {
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
      statusEl.hidden = true;
      statusEl.textContent = "";
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
    if (next === "hebcal") {
      this._loadGuideHebcalPanel();
    }
  }

  _openGuideModal() {
    if (!this._elements.guideModal) {
      return;
    }
    this._elements.guideModal.hidden = false;
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
    const taskName = String(task?.task_name || task?.name || task?.friendly_name || "").trim();
    if (taskName) {
      return taskName;
    }
    const taskId = String(task?.task_id || "").trim();
    if (taskId) {
      return taskId;
    }
    return `${this._t("import_task_unnamed")} #${fallbackIndex}`;
  }

  _importTaskDisplaySubtitle(task) {
    const taskType = String(task?.task_type || "window").toLowerCase() === "timeline" ? "timeline" : "window";
    if (taskType === "timeline") {
      const points = Array.isArray(task?.timeline_points) ? task.timeline_points.length : 0;
      return `${this._t("task_type_timeline")} • ${points} ${this._t("timeline_points")}`;
    }
    const start = String(task?.start_time || "--:--").trim() || "--:--";
    const end = String(task?.end_time || "--:--").trim() || "--:--";
    return `${start} - ${end}`;
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
    if (!Array.isArray(days) || days.length === 0) {
      return "";
    }
    const order = this._dayOrder();
    const rank = new Map(order.map((day, index) => [day, index]));
    const normalized = days
      .map((day) => Number.parseInt(day, 10))
      .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6);
    const sorted = [...new Set(normalized)].sort((a, b) => {
      const aRank = rank.has(a) ? rank.get(a) : 999;
      const bRank = rank.has(b) ? rank.get(b) : 999;
      return aRank - bRank;
    });

    return sorted
      .map((day) => this._dayLabel(day))
      .filter((label) => label.length > 0)
      .join(", ");
  }

  _dayOrder() {
    if (this._lang() === "he") {
      return [6, 0, 1, 2, 3, 4, 5];
    }
    return [0, 1, 2, 3, 4, 5, 6];
  }

  _dayLabel(day) {
    const map = {
      0: this._t("day_mon"),
      1: this._t("day_tue"),
      2: this._t("day_wed"),
      3: this._t("day_thu"),
      4: this._t("day_fri"),
      5: this._t("day_sat"),
      6: this._t("day_sun"),
    };
    return map[day] || String(day);
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
    if (!this._hass?.states) {
      return [];
    }
    return Object.keys(this._hass.states)
      .filter((entityId) => typeof entityId === "string" && entityId.includes("."))
      .sort((a, b) => a.localeCompare(b));
  }

  _matchingConditionEntities(query = "") {
    const all = this._allConditionEntities();
    const q = String(query || "").trim().toLowerCase();
    if (!q) {
      return all.slice(0, 250);
    }

    const starts = [];
    const includes = [];
    all.forEach((entityId) => {
      const normalized = entityId.toLowerCase();
      if (normalized.startsWith(q)) {
        starts.push(entityId);
      } else if (normalized.includes(q)) {
        includes.push(entityId);
      }
    });
    return [...starts, ...includes].slice(0, 250);
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
      const localizedDays = this._formatScheduleDays(attrs.days);
      const daysLabel = localizedDays ? ` · ${localizedDays}` : "";
      const conditionEntity = String(attrs.condition_entity || "").trim();
      const conditionOperator = this._normalizeConditionOperator(attrs.condition_operator);
      const conditionState = String(attrs.skip_if_state || "").trim();
      const conditionValue = conditionState || (conditionOperator === "eq" ? "on" : "0");
      const conditionLabel = conditionEntity
        ? ` · ${this._t("condition_summary_prefix")} ${conditionEntity} ${this._conditionOperatorLabel(conditionOperator)} ${conditionValue}`
        : "";
      const hebcalCaption = this._hebcalTaskListHebcalCaption(attrs);
      if (attrs.task_type === "timeline") {
        const timeline = String(attrs.timeline_label || "").trim();
        meta.textContent = `${timeline || "--"}${daysLabel}${conditionLabel}${hebcalCaption}`;
      } else {
        meta.textContent = `${attrs.start_time || "--:--"} - ${attrs.end_time || "--:--"}${daysLabel}${conditionLabel}${hebcalCaption}`;
      }
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
    const raw = String(isoOrRaw || "").trim();
    if (!raw) {
      return "--";
    }
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      return raw;
    }
    const pad = (n) => String(n).padStart(2, "0");
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(parsed.getSeconds())}`;
  }

  _exportHistoryLog() {
    const managerMode = this._boilerManagerModeEntity();
    const raw = Array.isArray(managerMode?.attributes?.task_history)
      ? managerMode.attributes.task_history
      : [];
    const taskHistory = raw
      .filter((row) => row && typeof row === "object")
      .map((row) => ({
        ts: String(row.ts || "").trim(),
        action: String(row.action || "").trim(),
        details: String(row.details || "").trim(),
        user: String(row.user || "").trim(),
      }));
    if (taskHistory.length === 0) {
      return;
    }

    const payload = {
      version: 1,
      exported_at: new Date().toISOString(),
      source: "boiler-manager-card",
      task_history: taskHistory,
    };
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
    const normalized = rows
      .filter((row) => row && typeof row === "object")
      .slice(-100)
      .reverse()
      .map((row) => ({
        ts: String(row.ts || "").trim(),
        action: String(row.action || "").trim(),
        details: String(row.details || "").trim(),
        user: String(row.user || "").trim(),
      }));
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

  _callConfiguredService(serviceRef, data = null) {
    if (!this._hass || typeof serviceRef !== "string") {
      return false;
    }

    const normalized = serviceRef.trim().toLowerCase();
    const [domain, service] = normalized.split(".", 2);
    if (!domain || !service) {
      return false;
    }
    if (!this._isServiceAvailable(serviceRef)) {
      return false;
    }

    this._hass.callService(domain, service, this._safeServiceData(data));
    return true;
  }

  _builtInServiceBaseData() {
    const data = {};
    const configuredEntryId = String(this._config.integration_entry_id || "").trim();
    if (configuredEntryId && this._isKnownEntryId(configuredEntryId)) {
      data.entry_id = configuredEntryId;
    }
    if (this._config.boiler_entity) {
      data.boiler_entity = this._config.boiler_entity;
    }
    return data;
  }

  _isKnownEntryId(entryId) {
    const target = String(entryId || "").trim();
    if (!target || !this._hass?.states) {
      return false;
    }

    return Object.values(this._hass.states).some((state) => {
      const candidate = String(state?.attributes?.entry_id || "").trim();
      return candidate === target;
    });
  }

  _controlServiceBaseData(serviceRef = "") {
    if (this._isSwitcherMode()) {
      if (this._isBoilerManagerService(serviceRef)) {
        return this._builtInServiceBaseData();
      }
      return this._config.boiler_entity
        ? { entity_id: this._config.boiler_entity }
        : {};
    }
    return this._builtInServiceBaseData();
  }

  _resolvedControlService(serviceRef, serviceKey = "") {
    const raw = String(serviceRef || "").trim();
    const normalized = raw.toLowerCase();

    if (
      !this._isSwitcherMode()
      && serviceKey === "service_run_timed"
      && normalized === "switcher_kis.turn_on_with_timer"
      && this._isServiceAvailable("boiler_manager.run_timed")
    ) {
      return "boiler_manager.run_timed";
    }

    if (!this._isSwitcherMode()) {
      return raw;
    }

    if (
      serviceKey === "service_run_timed"
      && (
        !normalized
        || normalized === "switcher_kis.turn_on_with_timer"
        || normalized === String(DEFAULT_CONFIG.service_run_timed).toLowerCase()
      )
    ) {
      if (this._isServiceAvailable("switcher_kis.turn_on_with_timer")) {
        return "switcher_kis.turn_on_with_timer";
      }
      if (this._isServiceAvailable("boiler_manager.run_timed")) {
        return "boiler_manager.run_timed";
      }
    }

    if (
      serviceKey === "service_on_continuous"
      && (
        !normalized
        || normalized === "homeassistant.turn_on"
        || normalized === String(DEFAULT_CONFIG.service_on_continuous).toLowerCase()
      )
      && this._isServiceAvailable("boiler_manager.turn_on_continuous")
    ) {
      return "boiler_manager.turn_on_continuous";
    }

    if (
      serviceKey === "service_off"
      && (
        !normalized
        || normalized === "homeassistant.turn_off"
        || normalized === String(DEFAULT_CONFIG.service_off).toLowerCase()
      )
      && this._isServiceAvailable("boiler_manager.turn_off")
    ) {
      return "boiler_manager.turn_off";
    }

    return raw;
  }

  _isBoilerManagerService(serviceRef) {
    return String(serviceRef || "").trim().toLowerCase().startsWith("boiler_manager.");
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
    if (typeof value !== "string") {
      return false;
    }
    const normalized = value.trim();
    if (!normalized.includes(".")) {
      return false;
    }
    const [domain, service] = normalized.split(".", 2);
    return !!domain && !!service;
  }

  _isServiceAvailable(serviceRef) {
    if (!this._hass || !this._isServiceRef(serviceRef)) {
      return false;
    }
    const normalized = String(serviceRef).trim().toLowerCase();
    const [domain, service] = normalized.split(".", 2);
    return !!(this._hass.services?.[domain]?.[service]);
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

  _formatSeconds(seconds) {
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

  _isNoTimerOption(value) {
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

  _optionToMinutes(value) {
    if (typeof value !== "string") {
      return null;
    }

    if (this._isNoTimerOption(value)) {
      return null;
    }

    const match = value.match(/(\d+)/);
    if (!match) {
      return null;
    }

    return Number.parseInt(match[1], 10);
  }

  _optionByMinutes(minutes, options) {
    if (!Number.isInteger(minutes) || minutes <= 0 || !Array.isArray(options)) {
      return null;
    }

    return options.find((option) => this._optionToMinutes(option) === minutes) || null;
  }

  _optionToHhMmSs(value) {
    const totalMinutes = this._optionToMinutes(value);
    if (totalMinutes === null) {
      return null;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
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
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }
    return value;
  }

  _stateListFromConfig(value, fallback) {
    if (!Array.isArray(value)) {
      return fallback;
    }

    const normalized = value
      .map((item) => String(item || "").trim().toLowerCase())
      .filter((item) => item.length > 0);

    return normalized.length > 0 ? normalized : fallback;
  }

  _isEntityOn(entity) {
    if (!entity || typeof entity.state !== "string") {
      return false;
    }

    const state = entity.state.trim().toLowerCase();
    const onStates = this._stateListFromConfig(this._config.state_on_values, ["on"]);
    const offStates = this._stateListFromConfig(this._config.state_off_values, [
      "off",
      "unavailable",
      "unknown",
    ]);

    if (onStates.includes(state)) {
      return true;
    }

    if (offStates.includes(state)) {
      return false;
    }

    return false;
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

  _isSwitcherMode() {
    return this._asTruthy(this._config?.switcher_mode);
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

  _regularTimerOptionsFromConfig() {
    const raw = String(this._config?.timer_values || "").trim();
    const source = raw || DEFAULT_CONFIG.timer_values;
    return this._timerOptionsFromConfigValues(source, 1440);
  }

  _timerOptionsFromConfigValues(raw, maxMinutes = 240) {
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
    options.push("No Timer");
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
