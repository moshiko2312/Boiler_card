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

const SUPPORTED_LANGUAGES = ["he", "en", "ru"];

const I18N = {
  he: {
    default_title: "דוד מים חמים",
    status_on: "דולק",
    status_off: "כבוי",
    status_unavailable: "לא זמין",
    subtitle_ready: "מוכן להפעלה",
    subtitle_heating_timer: "חימום עם טיימר",
    subtitle_heating_continuous: "חימום רציף",
    subtitle_check_entity: "בדוק ישות דוד",
    countdown_remaining: "זמן נותר",
    countdown_paused: "מושהה",
    no_timer: "ללא טיימר",
    timer_label: "טיימר",
    timer_select: "בחר טיימר",
    timer_menu: "תפריט טיימר",
    turn_on: "הדלק",
    turn_off: "כיבוי",
    missing_entity: "ישות חסרה",
    no_heating: "ללא חימום",
    no_timer_mode: "מצב ללא טיימר",
    warmed_suffix: "התחממות",
    stage_cool: "שלב קר",
    stage_warm: "שלב חם",
    stage_hot: "שלב חם מאוד",
    stage_continuous: "חימום רציף",
    stage_off: "כבוי",
    minutes_short: "דק'",
    hours_short: "ש׳",
  },
  en: {
    default_title: "Boiler",
    status_on: "ON",
    status_off: "OFF",
    status_unavailable: "Unavailable",
    subtitle_ready: "Ready",
    subtitle_heating_timer: "Heating with timer",
    subtitle_heating_continuous: "Heating continuously",
    subtitle_check_entity: "Check boiler entity",
    countdown_remaining: "Remaining",
    countdown_paused: "Paused",
    no_timer: "No Timer",
    timer_label: "Timer",
    timer_select: "Select Timer",
    timer_menu: "Timer menu",
    turn_on: "Turn On",
    turn_off: "Turn Off",
    missing_entity: "Missing entity",
    no_heating: "No heating",
    no_timer_mode: "No timer mode",
    warmed_suffix: "warmed",
    stage_cool: "Cool Stage",
    stage_warm: "Warm Stage",
    stage_hot: "Hot Stage",
    stage_continuous: "Continuous Heat",
    stage_off: "Off",
    minutes_short: "m",
    hours_short: "h",
  },
  ru: {
    default_title: "Бойлер",
    status_on: "ВКЛ",
    status_off: "ВЫКЛ",
    status_unavailable: "Недоступно",
    subtitle_ready: "Готово к запуску",
    subtitle_heating_timer: "Нагрев по таймеру",
    subtitle_heating_continuous: "Непрерывный нагрев",
    subtitle_check_entity: "Проверьте сущность бойлера",
    countdown_remaining: "Осталось",
    countdown_paused: "Пауза",
    no_timer: "Без таймера",
    timer_label: "Таймер",
    timer_select: "Выбрать таймер",
    timer_menu: "Меню таймера",
    turn_on: "Включить",
    turn_off: "Выключить",
    missing_entity: "Отсутствует сущность",
    no_heating: "Нет нагрева",
    no_timer_mode: "Режим без таймера",
    warmed_suffix: "прогрева",
    stage_cool: "Холодный этап",
    stage_warm: "Тёплый этап",
    stage_hot: "Горячий этап",
    stage_continuous: "Непрерывный нагрев",
    stage_off: "Выключено",
    minutes_short: "мин",
    hours_short: "ч",
  },
};

const DEFAULT_CONFIG = {
  title: "דוד מים חמים",
  language: "he",
  boiler_entity: "switch.boiler",
  boiler_flow_image: "/local/boiler-card/boiler-flow.png",
  duration_entity: "input_select.boiler_duration",
  timer_entity: "timer.boiler_runtime",
  script_on_timed: "script.boiler_turn_on_timed",
  script_on_continuous: "script.boiler_turn_on_continuous",
  script_off: "script.boiler_turn_off",
  turn_on_action: "homeassistant.turn_on",
  turn_off_action: "homeassistant.turn_off",
  turn_on_data: {},
  turn_off_data: {},
  state_on_values: ["on"],
  state_off_values: ["off", "idle", "standby", "unavailable", "unknown"],
};

class BoilerWaterCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = { ...DEFAULT_CONFIG };
    this._hass = null;
    this._elements = {};
    this._ticker = null;
    this._handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        this._closeTimerModal();
      }
    };
  }

  connectedCallback() {
    if (!this._ticker) {
      this._ticker = window.setInterval(() => this._refreshLiveCountdown(), 1000);
    }
  }

  disconnectedCallback() {
    if (this._ticker) {
      window.clearInterval(this._ticker);
      this._ticker = null;
    }
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
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --boiler-bg-a: var(--ha-card-background, var(--card-background-color, #fff7ec));
          --boiler-bg-b: var(--ha-card-background, var(--card-background-color, #f8fdff));
          --boiler-text: var(--primary-text-color, #192436);
          --boiler-muted: var(--secondary-text-color, #5a6880);
          --boiler-accent: #ea7a20;
          --boiler-accent-soft: #ffd9bb;
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
          background: var(--secondary-background-color, rgba(255, 255, 255, 0.78));
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

        .boiler-meta {
          display: grid;
          gap: 3px;
        }

        .boiler-stage {
          display: none;
        }

        .boiler-stage-sub {
          margin: 0;
          font-size: 0.7rem;
          color: #5a6880;
        }

        .boiler-progress-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto auto;
          align-items: center;
          gap: 6px;
        }

        .boiler-progress-track {
          height: 8px;
          border-radius: 3px;
          background: #20242b;
          border: 1px solid rgba(255, 255, 255, 0.06);
          overflow: hidden;
        }

        .boiler-progress-fill {
          height: 100%;
          width: var(--heat-progress);
          border-radius: 2px;
          background: linear-gradient(
            90deg,
            #2a53ff 0%,
            #3f63ff 16%,
            #8790d6 24%,
            #d8bc63 36%,
            #f3d34f 50%,
            #efb04a 62%,
            #ed8b38 74%,
            #f05d33 86%,
            #ff3328 100%
          );
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
          background: #2a2f38;
          border-color: rgba(255, 255, 255, 0.04);
        }

        .boiler-visual.off .boiler-progress-fill {
          width: 0 !important;
          background: transparent;
          box-shadow: none;
        }

        .chip {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 4px 8px;
          font-size: 0.68rem;
          font-weight: 700;
          border: 1px solid transparent;
          white-space: nowrap;
        }

        .chip.on {
          color: #0d6c43;
          border-color: #bce8d2;
          background: #e9fff5;
          animation: pulse 1.6s ease-in-out infinite;
        }

        .chip.off {
          color: #475569;
          border-color: #d3dce8;
          background: #f8fafc;
        }

        .boiler-meta-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }

        .countdown-label {
          color: var(--boiler-muted);
          font-size: 0.7rem;
        }

        .countdown-value {
          font-size: 1.04rem;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .quick-timers {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 6px;
        }

        .quick-timer-btn {
          border: 1px solid #d4deeb;
          border-radius: 10px;
          min-height: 34px;
          padding: 6px 6px;
          background: #f8fbff;
          color: #24364d;
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform 120ms ease, border-color 120ms ease, background 120ms ease;
        }

        .quick-timer-btn:hover {
          transform: translateY(-1px);
          border-color: #93b7df;
          background: #f0f7ff;
        }

        .quick-timer-btn.selected {
          border-color: #e48a41;
          background: #ffefe1;
          color: #8d4718;
        }

        .quick-timer-btn.off-action {
          background: #eef3f8;
          color: #344963;
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

        .actions {
          display: grid;
          grid-template-columns: 1fr;
          gap: 6px;
        }

        .actions button {
          border: 0;
          border-radius: 12px;
          min-height: 40px;
          padding: 8px 8px;
          font-weight: 800;
          cursor: pointer;
          color: #fff;
          transition: transform 120ms ease, filter 120ms ease;
        }

        .actions button:active {
          transform: translateY(1px);
        }

        .actions button[disabled],
        .quick-timer-btn[disabled],
        .timer-menu-btn[disabled] {
          cursor: not-allowed;
          opacity: 0.56;
          transform: none;
        }

        .on-btn {
          background: linear-gradient(160deg, #f18b32, #e2651d);
        }

        .off-btn {
          background: linear-gradient(160deg, #45566f, #2f3b4f);
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
        }

        .timer-modal[hidden] {
          display: none;
        }

        .timer-modal-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(10, 20, 35, 0.5);
          backdrop-filter: blur(2px);
        }

        .timer-modal-panel {
          position: relative;
          width: min(560px, calc(100vw - 28px));
          max-height: min(80dvh, 620px);
          overflow: auto;
          border-radius: 18px;
          border: 1px solid rgba(80, 108, 140, 0.25);
          background: #ffffff;
          box-shadow: 0 26px 60px rgba(14, 27, 51, 0.35);
          padding: 14px;
          animation: card-enter 180ms ease;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }

        .timer-modal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }

        .timer-modal-title {
          margin: 0;
          font-size: 1rem;
          color: var(--boiler-text);
        }

        .timer-close-btn {
          border: 0;
          border-radius: 10px;
          width: 34px;
          height: 34px;
          font-size: 1rem;
          color: #2f3b4f;
          background: #edf3f8;
          cursor: pointer;
        }

        .timer-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(92px, 1fr));
          gap: 9px;
        }

        .timer-option-btn {
          border: 1px solid #d4deeb;
          border-radius: 11px;
          background: #f7fbff;
          color: #1f2e44;
          font-weight: 700;
          font-size: 0.9rem;
          min-height: 44px;
          padding: 10px 8px;
          cursor: pointer;
          transition: transform 120ms ease, border-color 120ms ease, background 120ms ease;
        }

        .timer-option-btn:hover {
          transform: translateY(-1px);
          border-color: #93b7df;
          background: #f0f7ff;
        }

        .timer-option-btn.selected {
          border-color: #e48a41;
          background: #ffefe1;
          color: #8d4718;
        }

        @media (max-width: 760px) {
          .timer-modal {
            align-items: flex-end;
          }

          .timer-modal-panel {
            width: 100vw;
            max-height: min(86dvh, 760px);
            border-radius: 20px 20px 0 0;
            border-left: 0;
            border-right: 0;
            border-bottom: 0;
            padding: 14px 14px calc(16px + env(safe-area-inset-bottom, 0px));
            animation: modal-sheet-up 190ms ease;
          }

          .timer-modal-head {
            position: sticky;
            top: 0;
            background: #ffffff;
            z-index: 1;
            padding-bottom: 6px;
          }

          .timer-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
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

          .chip {
            font-size: 0.66rem;
            padding: 3px 7px;
          }

          .subtitle {
            font-size: 0.8rem;
          }

          .actions {
            grid-template-columns: 1fr;
          }

          .actions button {
            min-height: 42px;
            font-size: 0.9rem;
          }

          .countdown-value {
            font-size: 0.98rem;
          }

          .timer-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .quick-timers {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .boiler-visual {
            grid-template-columns: 1fr;
            gap: 6px;
            text-align: center;
          }

          .boiler-icon {
            width: min(128px, 70vw);
            height: 82px;
          }

          .boiler-meta {
            gap: 4px;
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(21, 135, 84, 0.2);
          }
          50% {
            box-shadow: 0 0 0 7px rgba(21, 135, 84, 0);
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

      <ha-card>
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
              <p class="boiler-stage-sub" id="boiler-stage-sub">0% warmed</p>
              <div class="boiler-progress-row">
                <div class="boiler-progress-track">
                  <div class="boiler-progress-fill" id="boiler-progress-fill"></div>
                </div>
                <span class="countdown-value" id="countdown-value">--:--</span>
                <button type="button" class="timer-menu-btn" id="timer-menu-btn" aria-label="Timer menu">☰</button>
              </div>
              <div class="boiler-meta-foot">
                <span class="countdown-label" id="countdown-label">Remaining</span>
                <span class="chip off" id="status-chip">OFF</span>
              </div>
            </div>
          </div>

          <div class="quick-timers" id="quick-timers">
            <button type="button" class="quick-timer-btn" data-minutes="15">15</button>
            <button type="button" class="quick-timer-btn" data-minutes="30">30</button>
            <button type="button" class="quick-timer-btn" data-minutes="60">60</button>
            <button type="button" class="quick-timer-btn" data-minutes="90">90</button>
            <button type="button" class="quick-timer-btn off-action" id="quick-off-btn" data-action="off">Off</button>
          </div>

          <div class="actions">
            <button class="on-btn" id="power-btn">Turn On</button>
          </div>

          <p class="error" id="error" hidden></p>
        </div>
      </ha-card>

      <div class="timer-modal" id="timer-modal" hidden>
        <div class="timer-modal-backdrop" id="timer-modal-backdrop"></div>
        <div class="timer-modal-panel" role="dialog" aria-modal="true" aria-label="Timer Picker">
          <div class="timer-modal-head">
            <h3 class="timer-modal-title" id="timer-modal-title">Select Timer</h3>
            <button type="button" class="timer-close-btn" id="timer-close-btn">✕</button>
          </div>
          <div class="timer-grid" id="timer-grid"></div>
        </div>
      </div>
    `;

    this._elements = {
      title: this.shadowRoot.getElementById("title"),
      subtitle: this.shadowRoot.getElementById("subtitle"),
      boilerVisual: this.shadowRoot.getElementById("boiler-visual"),
      boilerMainImage: this.shadowRoot.getElementById("boiler-main-image"),
      boilerStage: this.shadowRoot.getElementById("boiler-stage"),
      boilerStageSub: this.shadowRoot.getElementById("boiler-stage-sub"),
      boilerProgressFill: this.shadowRoot.getElementById("boiler-progress-fill"),
      countdownLabel: this.shadowRoot.getElementById("countdown-label"),
      countdownValue: this.shadowRoot.getElementById("countdown-value"),
      statusChip: this.shadowRoot.getElementById("status-chip"),
      quickTimerBtns: Array.from(this.shadowRoot.querySelectorAll(".quick-timer-btn")),
      quickOffBtn: this.shadowRoot.getElementById("quick-off-btn"),
      timerMenuBtn: this.shadowRoot.getElementById("timer-menu-btn"),
      powerBtn: this.shadowRoot.getElementById("power-btn"),
      error: this.shadowRoot.getElementById("error"),
      timerModal: this.shadowRoot.getElementById("timer-modal"),
      timerModalBackdrop: this.shadowRoot.getElementById("timer-modal-backdrop"),
      timerCloseBtn: this.shadowRoot.getElementById("timer-close-btn"),
      timerModalTitle: this.shadowRoot.getElementById("timer-modal-title"),
      timerGrid: this.shadowRoot.getElementById("timer-grid"),
    };

    this._elements.timerMenuBtn.addEventListener("click", () => this._openTimerModal());
    this._elements.timerCloseBtn.addEventListener("click", () => this._closeTimerModal());
    this._elements.timerModalBackdrop.addEventListener("click", () => this._closeTimerModal());
    this._elements.quickTimerBtns.forEach((button) => {
      button.addEventListener("click", () => this._handleQuickTimerClick(button));
    });
    this._elements.powerBtn.addEventListener("click", () => this._handleTurnOn());
  }

  _sync() {
    if (!this._hass || !this._elements.title) {
      return;
    }

    const cfg = this._config;
    const boiler = this._hass.states[cfg.boiler_entity];
    const duration = this._hass.states[cfg.duration_entity];
    const timer = this._hass.states[cfg.timer_entity];
    const scripts = this._scriptEntities();

    const title = typeof cfg.title === "string" && cfg.title.trim()
      ? cfg.title.trim()
      : this._t("default_title");
    this._elements.title.textContent = title;
    this._elements.timerModalTitle.textContent = this._t("timer_select");
    if (this._elements.quickOffBtn) {
      this._elements.quickOffBtn.textContent = this._t("turn_off");
    }
    if (this._elements.timerMenuBtn) {
      this._elements.timerMenuBtn.setAttribute("aria-label", this._t("timer_menu"));
      this._elements.timerMenuBtn.setAttribute("title", this._t("timer_menu"));
    }
    const flowImage = cfg.boiler_flow_image || "/local/boiler-card/boiler-flow.png";
    if (this._elements.boilerMainImage?.getAttribute("src") !== flowImage) {
      this._elements.boilerMainImage.setAttribute("src", flowImage);
    }
    this._syncTimerPicker(duration);
    this._syncHeatingVisual(boiler, timer, duration);
    this._syncStatus(boiler, timer);
    this._syncCountdown(timer, boiler);
    this._syncError(boiler, duration, timer, scripts);
    this._syncButtons(boiler, duration, timer, scripts);
  }

  _syncTimerPicker(durationEntity) {
    const options = this._durationOptions(durationEntity);
    const selected = this._selectedDurationOption(durationEntity, options);

    if (this._elements.timerMenuBtn) {
      this._elements.timerMenuBtn.setAttribute(
        "title",
        `${this._t("timer_label")}: ${this._renderOptionLabel(selected)}`
      );
    }
    this._syncQuickTimerButtons(options, selected);
    this._renderTimerGrid(options, selected);
  }

  _syncQuickTimerButtons(options, selected) {
    const buttons = this._elements.quickTimerBtns || [];
    buttons.forEach((button) => {
      if (button.dataset.action === "off") {
        button.dataset.option = "";
        button.classList.remove("selected");
        return;
      }
      const minutes = Number.parseInt(button.dataset.minutes || "", 10);
      const option = this._optionByMinutes(minutes, options);
      button.dataset.option = option || "";
      button.classList.toggle("selected", !!option && option === selected);
    });
  }

  _selectedDurationOption(durationEntity, options) {
    const selected = durationEntity?.state || "30m";
    if (options.includes(selected)) {
      return selected;
    }
    if (options.includes("30m")) {
      return "30m";
    }
    return options[0] || "30m";
  }

  _renderTimerGrid(options, selected) {
    const grid = this._elements.timerGrid;
    if (!grid) {
      return;
    }

    grid.innerHTML = "";
    options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "timer-option-btn";
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
  }

  _syncStatus(boiler, timer) {
    if (!boiler) {
      this._elements.statusChip.textContent = this._t("status_unavailable");
      this._elements.statusChip.classList.remove("on");
      this._elements.statusChip.classList.add("off");
      this._elements.subtitle.textContent = this._t("subtitle_check_entity");
      return;
    }

    const isOn = this._isEntityOn(boiler);

    this._elements.statusChip.textContent = isOn ? this._t("status_on") : this._t("status_off");
    this._elements.statusChip.classList.toggle("on", isOn);
    this._elements.statusChip.classList.toggle("off", !isOn);

    if (timer?.state === "active") {
      this._elements.subtitle.textContent = this._t("subtitle_heating_timer");
    } else if (isOn) {
      this._elements.subtitle.textContent = this._t("subtitle_heating_continuous");
    } else {
      this._elements.subtitle.textContent = this._t("subtitle_ready");
    }
  }

  _syncCountdown(timer, boiler) {
    if (timer?.state === "active" || timer?.state === "paused") {
      const seconds = this._remainingSeconds(timer);
      this._elements.countdownLabel.textContent =
        timer.state === "paused"
          ? this._t("countdown_paused")
          : this._t("countdown_remaining");
      this._elements.countdownValue.textContent = this._formatSeconds(seconds);
      return;
    }

    if (this._isEntityOn(boiler)) {
      this._elements.countdownLabel.textContent = this._t("no_timer");
      this._elements.countdownValue.textContent = "∞";
      return;
    }

    this._elements.countdownLabel.textContent = this._t("countdown_remaining");
    this._elements.countdownValue.textContent = "--:--";
  }

  _syncError(boiler, duration, timer, scripts) {
    const missing = [];

    if (!boiler) {
      missing.push(this._config.boiler_entity);
    }
    if (!duration) {
      missing.push(this._config.duration_entity);
    }
    if (!timer) {
      missing.push(this._config.timer_entity);
    }
    if (!scripts.onTimed) {
      missing.push(this._config.script_on_timed);
    }
    if (!scripts.onContinuous) {
      missing.push(this._config.script_on_continuous);
    }
    if (!scripts.off) {
      missing.push(this._config.script_off);
    }

    if (missing.length === 0) {
      this._elements.error.hidden = true;
      this._elements.error.textContent = "";
      return;
    }

    this._elements.error.hidden = false;
    this._elements.error.textContent = `${this._t("missing_entity")}: ${missing.join(", ")}`;
  }

  _syncButtons(boiler, duration, timer, scripts) {
    const hasHass = !!this._hass;
    const hasCoreEntities = !!boiler && !!duration && !!timer;
    const hasScripts = !!scripts.onTimed && !!scripts.onContinuous && !!scripts.off;
    const hasDuration = !!duration;

    const disabled = !hasHass || !hasCoreEntities || !hasScripts;
    this._elements.powerBtn.disabled = disabled;
    this._elements.powerBtn.textContent = this._t("turn_on");
    this._elements.powerBtn.classList.remove("off-btn");
    this._elements.powerBtn.classList.add("on-btn");
    this._elements.timerMenuBtn.disabled = !hasHass || !hasDuration;
    this._elements.quickTimerBtns.forEach((button) => {
      const hasOption = !!button.dataset.option;
      const isOffAction = button.dataset.action === "off";
      button.disabled = disabled || (!isOffAction && !hasOption);
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
    this._syncCountdown(timer, boiler);
    this._syncHeatingVisual(boiler, timer, duration);
  }

  _syncHeatingVisual(boiler, timer, durationEntity) {
    if (!this._elements.boilerVisual) {
      return;
    }

    const isOn = this._isEntityOn(boiler);
    const profile = this._heatingProfile(boiler, timer, durationEntity);
    this._elements.boilerVisual.classList.toggle("off", !isOn);
    this._elements.boilerVisual.style.setProperty("--heat-primary", profile.primaryColor);
    this._elements.boilerVisual.style.setProperty("--heat-secondary", profile.secondaryColor);
    this._elements.boilerVisual.style.setProperty("--heat-glow", profile.glowColor);
    this._elements.boilerVisual.style.setProperty("--heat-progress", `${Math.round(profile.progress * 100)}%`);
    this._elements.boilerStage.textContent = profile.label;
    this._elements.boilerStageSub.textContent = profile.subLabel;
  }

  _heatingProfile(boiler, timer, durationEntity) {
    const isOn = this._isEntityOn(boiler);
    const timerActive = timer?.state === "active" || timer?.state === "paused";

    if (!isOn) {
      return {
        progress: 0,
        label: this._t("stage_off"),
        subLabel: this._t("no_heating"),
        primaryColor: "#c7d0dd",
        secondaryColor: "#dde4ee",
        glowColor: "rgba(0, 0, 0, 0)",
      };
    }

    if (!timerActive) {
      return this._buildHeatingProfile(
        0.72,
        this._t("stage_continuous"),
        this._t("no_timer_mode")
      );
    }

    const remaining = this._remainingSeconds(timer);
    const total = this._timerTotalSeconds(timer, durationEntity);
    const progress = total > 0 && remaining !== null ? this._clamp(1 - remaining / total, 0, 1) : 0;
    const percent = Math.round(progress * 100);

    if (progress < 0.34) {
      return this._buildHeatingProfile(
        progress,
        this._t("stage_cool"),
        this._formatWarmedPercent(percent)
      );
    }
    if (progress < 0.67) {
      return this._buildHeatingProfile(
        progress,
        this._t("stage_warm"),
        this._formatWarmedPercent(percent)
      );
    }
    return this._buildHeatingProfile(
      progress,
      this._t("stage_hot"),
      this._formatWarmedPercent(percent)
    );
  }

  _buildHeatingProfile(progress, label, subLabel) {
    const clamped = this._clamp(progress, 0, 1);
    const primary = this._colorByHeat(clamped);
    const secondary = this._mixColors(primary, "#e2f4ff", 0.35);
    const glow = this._hexToRgba(primary, 0.33);

    return {
      progress: clamped,
      label,
      subLabel,
      primaryColor: primary,
      secondaryColor: secondary,
      glowColor: glow,
    };
  }

  _timerTotalSeconds(timer, durationEntity) {
    const fromTimer = this._parseDurationString(timer?.attributes?.duration);
    if (fromTimer !== null && fromTimer > 0) {
      return fromTimer;
    }

    const selected = durationEntity?.state || "30m";
    const minutes = this._optionToMinutes(selected);
    if (minutes !== null && minutes > 0) {
      return minutes * 60;
    }

    return 0;
  }

  _durationOptions(durationEntity) {
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
      return `${hours}${this._t("hours_short")} ${mins}${this._t("minutes_short")}`;
    }
    if (hours > 0) {
      return `${hours}${this._t("hours_short")}`;
    }
    return `${minutes}${this._t("minutes_short")}`;
  }

  _selectDurationOption(option) {
    if (!this._hass) {
      return;
    }

    this._hass.callService("input_select", "select_option", {
      entity_id: this._config.duration_entity,
      option,
    });

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

    if (this._isNoTimerOption(option)) {
      this._runScript(this._config.script_on_continuous, {
        boiler_entity: this._config.boiler_entity,
        turn_on_action: this._config.turn_on_action,
        turn_on_data: this._safeServiceData(this._config.turn_on_data),
      });
      return;
    }

    this._runScript(this._config.script_on_timed, {
      duration_option: option,
      duration: this._optionToHhMmSs(option) || "00:30:00",
      boiler_entity: this._config.boiler_entity,
      turn_on_action: this._config.turn_on_action,
      turn_on_data: this._safeServiceData(this._config.turn_on_data),
    });
  }

  _openTimerModal() {
    if (!this._elements.timerModal || this._elements.timerMenuBtn.disabled) {
      return;
    }

    this._elements.timerModal.hidden = false;
    window.addEventListener("keydown", this._handleEscapeKey);
  }

  _closeTimerModal() {
    if (!this._elements.timerModal) {
      return;
    }

    this._elements.timerModal.hidden = true;
    window.removeEventListener("keydown", this._handleEscapeKey);
  }

  _handleTurnOn() {
    if (!this._hass) {
      return;
    }

    const durationState = this._hass.states[this._config.duration_entity]?.state || "30m";
    this._activateSelectedDuration(durationState);
  }

  _handleTurnOff() {
    this._runScript(this._config.script_off, {
      boiler_entity: this._config.boiler_entity,
      turn_off_action: this._config.turn_off_action,
      turn_off_data: this._safeServiceData(this._config.turn_off_data),
    });
  }

  _runScript(entityId, variables = null) {
    if (!this._hass || !entityId) {
      return;
    }

    const data = { entity_id: entityId };
    if (variables && Object.keys(variables).length > 0) {
      data.variables = variables;
    }

    this._hass.callService("script", "turn_on", data);
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
    const warm = "#f97316";
    const hot = "#dc2626";

    if (progress <= 0.5) {
      return this._mixColors(cool, warm, progress / 0.5);
    }
    return hot;
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

  _scriptEntities() {
    if (!this._hass) {
      return { onTimed: null, onContinuous: null, off: null };
    }

    return {
      onTimed: this._hass.states[this._config.script_on_timed],
      onContinuous: this._hass.states[this._config.script_on_continuous],
      off: this._hass.states[this._config.script_off],
    };
  }
}

class BoilerWaterCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = { ...DEFAULT_CONFIG };
    this._hass = null;
  }

  setConfig(config) {
    this._config = { ...DEFAULT_CONFIG, ...(config || {}) };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._hass) {
      return;
    }

    const labels = this._labels();
    this.innerHTML = "";

    const form = document.createElement("ha-form");
    form.hass = this._hass;
    form.data = this._config;
    form.schema = [
      {
        name: "language",
        label: labels.language,
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "he", label: "עברית" },
              { value: "en", label: "English" },
              { value: "ru", label: "Русский" },
            ],
          },
        },
      },
      {
        name: "title",
        label: labels.title,
        selector: { text: {} },
      },
      {
        name: "boiler_entity",
        label: labels.boiler_entity,
        required: true,
        selector: { entity: {} },
      },
      {
        name: "duration_entity",
        label: labels.duration_entity,
        required: true,
        selector: { entity: { domain: "input_select" } },
      },
      {
        name: "timer_entity",
        label: labels.timer_entity,
        required: true,
        selector: { entity: { domain: "timer" } },
      },
      {
        name: "script_on_timed",
        label: labels.script_on_timed,
        required: true,
        selector: { entity: { domain: "script" } },
      },
      {
        name: "script_on_continuous",
        label: labels.script_on_continuous,
        required: true,
        selector: { entity: { domain: "script" } },
      },
      {
        name: "script_off",
        label: labels.script_off,
        required: true,
        selector: { entity: { domain: "script" } },
      },
      {
        name: "boiler_flow_image",
        label: labels.boiler_flow_image,
        selector: { text: {} },
      },
    ];
    form.computeLabel = (schema) => schema.label;
    form.addEventListener("value-changed", (event) => this._onValueChanged(event));

    this.appendChild(form);
  }

  _onValueChanged(event) {
    const value = event?.detail?.value || {};
    const nextConfig = { ...this._config, ...value };
    this._config = nextConfig;
    this._render();
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: nextConfig },
    }));
  }

  _labels() {
    const language = String(this._config?.language || "he").toLowerCase();
    const lang = SUPPORTED_LANGUAGES.includes(language) ? language : "he";
    const map = {
      he: {
        language: "שפה",
        title: "כותרת",
        boiler_entity: "ישות דוד",
        duration_entity: "ישות משך זמן",
        timer_entity: "ישות טיימר",
        script_on_timed: "סקריפט הדלקה עם טיימר",
        script_on_continuous: "סקריפט הדלקה רציפה",
        script_off: "סקריפט כיבוי",
        boiler_flow_image: "תמונת זרימת מים (נתיב / URL)",
      },
      en: {
        language: "Language",
        title: "Title",
        boiler_entity: "Boiler Entity",
        duration_entity: "Duration Entity",
        timer_entity: "Timer Entity",
        script_on_timed: "Timed On Script",
        script_on_continuous: "Continuous On Script",
        script_off: "Off Script",
        boiler_flow_image: "Water Flow Image (path / URL)",
      },
      ru: {
        language: "Язык",
        title: "Заголовок",
        boiler_entity: "Сущность бойлера",
        duration_entity: "Сущность длительности",
        timer_entity: "Сущность таймера",
        script_on_timed: "Скрипт включения с таймером",
        script_on_continuous: "Скрипт непрерывного включения",
        script_off: "Скрипт выключения",
        boiler_flow_image: "Изображение потока (путь / URL)",
      },
    };

    return map[lang];
  }
}

if (!customElements.get("boiler-water-card")) {
  customElements.define("boiler-water-card", BoilerWaterCard);
}

if (!customElements.get("boiler-water-card-editor")) {
  customElements.define("boiler-water-card-editor", BoilerWaterCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "boiler-water-card")) {
  window.customCards.push({
    type: "boiler-water-card",
    name: "Boiler Water Card",
    description: "Styled control card for boiler On/Off and timer selection.",
  });
}
