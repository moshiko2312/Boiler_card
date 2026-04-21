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

const DEFAULT_CONFIG = {
  title: "דוד מים חמים / Boiler",
  boiler_entity: "switch.boiler",
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
    return 3;
  }

  _renderShell() {
    window.removeEventListener("keydown", this._handleEscapeKey);
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --boiler-bg-a: #fff7ec;
          --boiler-bg-b: #f8fdff;
          --boiler-text: #192436;
          --boiler-muted: #5a6880;
          --boiler-accent: #ea7a20;
          --boiler-accent-soft: #ffd9bb;
          --boiler-ok: #198754;
          --boiler-off: #64748b;
          --boiler-danger: #c63d2f;
          display: block;
          width: 100%;
          box-sizing: border-box;
          font-family: "Heebo", "Rubik", "Noto Sans Hebrew", sans-serif;
        }

        ha-card {
          border-radius: 22px;
          overflow: hidden;
          background:
            radial-gradient(circle at 10% 10%, #ffe7cf 0%, rgba(255, 231, 207, 0) 42%),
            radial-gradient(circle at 85% 20%, #dff5ff 0%, rgba(223, 245, 255, 0) 38%),
            linear-gradient(145deg, var(--boiler-bg-a), var(--boiler-bg-b));
          box-shadow: 0 16px 34px rgba(20, 40, 80, 0.12);
          animation: card-enter 260ms ease;
        }

        .wrap {
          display: grid;
          gap: 10px;
          padding: 14px;
          color: var(--boiler-text);
        }

        .row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: center;
          gap: 10px;
        }

        .title {
          grid-column: 2;
          margin: 0;
          font-size: clamp(0.96rem, 2.1vw, 1.08rem);
          letter-spacing: 0.01em;
          line-height: 1.2;
          min-width: 0;
          text-align: center;
        }

        .subtitle {
          margin: 0;
          color: var(--boiler-muted);
          font-size: 0.86rem;
          text-align: center;
        }

        .boiler-visual {
          --heat-primary: #38bdf8;
          --heat-secondary: #93c5fd;
          --heat-glow: rgba(56, 189, 248, 0.35);
          --heat-progress: 0%;
          display: grid;
          grid-template-columns: 76px 1fr;
          align-items: center;
          gap: 10px;
          border-radius: 14px;
          padding: 8px 10px;
          border: 1px solid rgba(50, 88, 128, 0.12);
          background: rgba(255, 255, 255, 0.78);
        }

        .boiler-icon {
          position: relative;
          width: 50px;
          height: 66px;
          margin: 0 auto;
          border-radius: 16px;
          border: 2px solid #264160;
          background: linear-gradient(180deg, #f8fcff 0%, #dbe7f3 100%);
          overflow: hidden;
          box-shadow: 0 0 0 0 var(--heat-glow);
          animation: boiler-glow 1.8s ease-in-out infinite;
        }

        .boiler-icon::before {
          content: "";
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 18px;
          height: 5px;
          border-radius: 8px;
          background: #27405f;
        }

        .boiler-water {
          position: absolute;
          left: 4px;
          right: 4px;
          bottom: 4px;
          height: calc(18% + var(--heat-progress));
          max-height: calc(100% - 8px);
          border-radius: 10px 10px 12px 12px;
          background: linear-gradient(180deg, var(--heat-secondary) 0%, var(--heat-primary) 100%);
          transition: height 420ms ease, background 420ms ease;
        }

        .boiler-meta {
          display: grid;
          gap: 4px;
        }

        .boiler-stage {
          display: none;
        }

        .boiler-stage-sub {
          margin: 0;
          font-size: 0.74rem;
          color: #5a6880;
        }

        .boiler-progress-track {
          height: 10px;
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
            #2351ff 0%,
            #2351ff 24%,
            #f5d24a 24%,
            #f5d24a 50%,
            #f08a2d 50%,
            #f08a2d 76%,
            #ff342c 76%,
            #ff2a23 100%
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

        .boiler-visual.off .boiler-icon::before {
          background: #7b8798;
        }

        .boiler-visual.off .boiler-water {
          background: linear-gradient(180deg, #d3dbe6 0%, #bec8d6 100%);
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
          grid-column: 3;
          justify-self: end;
          border-radius: 999px;
          padding: 5px 10px;
          font-size: 0.74rem;
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

        .countdown {
          border-radius: 14px;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(50, 88, 128, 0.12);
          display: grid;
          gap: 2px;
        }

        .countdown-label {
          color: var(--boiler-muted);
          font-size: 0.78rem;
        }

        .countdown-value {
          font-size: 1.34rem;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .field-label {
          font-size: 0.79rem;
          color: var(--boiler-muted);
        }

        .timer-picker-btn {
          width: 100%;
          border-radius: 12px;
          border: 1px solid #d4deeb;
          min-height: 42px;
          padding: 9px 11px;
          font-size: 0.92rem;
          color: var(--boiler-text);
          background: rgba(255, 255, 255, 0.92);
          text-align: left;
          font-weight: 700;
          cursor: pointer;
          transition: border-color 140ms ease, box-shadow 140ms ease, transform 120ms ease;
        }

        .timer-picker-btn:hover {
          transform: translateY(-1px);
        }

        .timer-picker-btn:focus {
          border-color: #7aa7da;
          box-shadow: 0 0 0 3px rgba(122, 167, 218, 0.2);
          outline: none;
        }

        .actions {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }

        .actions button {
          border: 0;
          border-radius: 12px;
          min-height: 44px;
          padding: 10px 9px;
          font-weight: 800;
          cursor: pointer;
          color: #fff;
          transition: transform 120ms ease, filter 120ms ease;
        }

        .actions button:active {
          transform: translateY(1px);
        }

        .actions button[disabled],
        .timer-picker-btn[disabled] {
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
            padding: 12px;
            gap: 8px;
          }

          .row {
            grid-template-columns: 1fr;
            justify-items: center;
            gap: 8px;
          }

          .title {
            width: 100%;
            line-height: 1.25;
          }

          .chip {
            grid-column: 1;
            justify-self: center;
            font-size: 0.74rem;
            padding: 5px 10px;
          }

          .subtitle {
            font-size: 0.88rem;
          }

          .actions {
            grid-template-columns: 1fr;
          }

          .actions button {
            min-height: 46px;
            font-size: 0.96rem;
          }

          .countdown-value {
            font-size: 1.24rem;
          }

          .timer-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .boiler-visual {
            grid-template-columns: 1fr;
            gap: 8px;
            text-align: center;
          }

          .boiler-icon {
            width: 48px;
            height: 64px;
          }

          .boiler-meta {
            gap: 5px;
          }

          .timer-picker-btn {
            min-height: 48px;
            font-size: 0.94rem;
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
            <span class="chip off" id="status-chip">OFF / כבוי</span>
          </div>

          <p class="subtitle" id="subtitle">Ready / מוכן להפעלה</p>

          <div class="boiler-visual" id="boiler-visual">
            <div class="boiler-icon" id="boiler-icon">
              <div class="boiler-water" id="boiler-water"></div>
            </div>
            <div class="boiler-meta">
              <p class="boiler-stage" id="boiler-stage">Cool Start / התחלה קרה</p>
              <p class="boiler-stage-sub" id="boiler-stage-sub">0% warmed / 0% התחממות</p>
              <div class="boiler-progress-track">
                <div class="boiler-progress-fill" id="boiler-progress-fill"></div>
              </div>
            </div>
          </div>

          <div class="countdown">
            <span class="countdown-label" id="countdown-label">Remaining / זמן נותר</span>
            <span class="countdown-value" id="countdown-value">--:--</span>
          </div>

          <label class="field-label" for="timer-picker-btn">Timer / טיימר</label>
          <button type="button" class="timer-picker-btn" id="timer-picker-btn">Select Timer / בחר טיימר</button>

          <div class="actions">
            <button class="on-btn" id="power-btn">הדלק / Turn On</button>
          </div>

          <p class="error" id="error" hidden></p>
        </div>
      </ha-card>

      <div class="timer-modal" id="timer-modal" hidden>
        <div class="timer-modal-backdrop" id="timer-modal-backdrop"></div>
        <div class="timer-modal-panel" role="dialog" aria-modal="true" aria-label="Timer Picker">
          <div class="timer-modal-head">
            <h3 class="timer-modal-title">בחר טיימר / Select Timer</h3>
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
      boilerStage: this.shadowRoot.getElementById("boiler-stage"),
      boilerStageSub: this.shadowRoot.getElementById("boiler-stage-sub"),
      boilerProgressFill: this.shadowRoot.getElementById("boiler-progress-fill"),
      countdownLabel: this.shadowRoot.getElementById("countdown-label"),
      countdownValue: this.shadowRoot.getElementById("countdown-value"),
      statusChip: this.shadowRoot.getElementById("status-chip"),
      timerPickerBtn: this.shadowRoot.getElementById("timer-picker-btn"),
      powerBtn: this.shadowRoot.getElementById("power-btn"),
      error: this.shadowRoot.getElementById("error"),
      timerModal: this.shadowRoot.getElementById("timer-modal"),
      timerModalBackdrop: this.shadowRoot.getElementById("timer-modal-backdrop"),
      timerCloseBtn: this.shadowRoot.getElementById("timer-close-btn"),
      timerGrid: this.shadowRoot.getElementById("timer-grid"),
    };

    this._elements.timerPickerBtn.addEventListener("click", () => this._openTimerModal());
    this._elements.timerCloseBtn.addEventListener("click", () => this._closeTimerModal());
    this._elements.timerModalBackdrop.addEventListener("click", () => this._closeTimerModal());
    this._elements.powerBtn.addEventListener("click", () => this._handlePowerToggle());
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

    this._elements.title.textContent = cfg.title;
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

    this._elements.timerPickerBtn.textContent = `Timer: ${this._renderOptionLabel(selected)}`;
    this._renderTimerGrid(options, selected);
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
      this._elements.statusChip.textContent = "Unavailable / לא זמין";
      this._elements.statusChip.classList.remove("on");
      this._elements.statusChip.classList.add("off");
      this._elements.subtitle.textContent = "Check boiler entity / בדוק ישות דוד";
      return;
    }

    const isOn = this._isEntityOn(boiler);

    this._elements.statusChip.textContent = isOn ? "ON / דולק" : "OFF / כבוי";
    this._elements.statusChip.classList.toggle("on", isOn);
    this._elements.statusChip.classList.toggle("off", !isOn);

    if (timer?.state === "active") {
      this._elements.subtitle.textContent = "Heating with timer / חימום עם טיימר";
    } else if (isOn) {
      this._elements.subtitle.textContent = "Heating continuously / חימום רציף";
    } else {
      this._elements.subtitle.textContent = "Ready / מוכן להפעלה";
    }
  }

  _syncCountdown(timer, boiler) {
    if (timer?.state === "active" || timer?.state === "paused") {
      const seconds = this._remainingSeconds(timer);
      this._elements.countdownLabel.textContent =
        timer.state === "paused"
          ? "Paused / מושהה"
          : "Remaining / זמן נותר";
      this._elements.countdownValue.textContent = this._formatSeconds(seconds);
      return;
    }

    if (this._isEntityOn(boiler)) {
      this._elements.countdownLabel.textContent = "No Timer / ללא טיימר";
      this._elements.countdownValue.textContent = "∞";
      return;
    }

    this._elements.countdownLabel.textContent = "Remaining / זמן נותר";
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
    this._elements.error.textContent = `Missing entity / ישות חסרה: ${missing.join(", ")}`;
  }

  _syncButtons(boiler, duration, timer, scripts) {
    const hasHass = !!this._hass;
    const hasCoreEntities = !!boiler && !!duration && !!timer;
    const hasScripts = !!scripts.onTimed && !!scripts.onContinuous && !!scripts.off;
    const hasDuration = !!duration;
    const isOn = this._isEntityOn(boiler);

    const disabled = !hasHass || !hasCoreEntities || !hasScripts;
    this._elements.powerBtn.disabled = disabled;
    this._elements.powerBtn.textContent = isOn ? "כיבוי / Turn Off" : "הדלק / Turn On";
    this._elements.powerBtn.classList.toggle("off-btn", isOn);
    this._elements.powerBtn.classList.toggle("on-btn", !isOn);
    this._elements.timerPickerBtn.disabled = !hasHass || !hasDuration;
    if (this._elements.timerPickerBtn.disabled) {
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
        label: "Off / כבוי",
        subLabel: "No heating / ללא חימום",
        primaryColor: "#c7d0dd",
        secondaryColor: "#dde4ee",
        glowColor: "rgba(0, 0, 0, 0)",
      };
    }

    if (!timerActive) {
      return this._buildHeatingProfile(
        0.72,
        "Continuous Heat / חימום רציף",
        "No timer mode / מצב ללא טיימר"
      );
    }

    const remaining = this._remainingSeconds(timer);
    const total = this._timerTotalSeconds(timer, durationEntity);
    const progress = total > 0 && remaining !== null ? this._clamp(1 - remaining / total, 0, 1) : 0;
    const percent = Math.round(progress * 100);

    if (progress < 0.34) {
      return this._buildHeatingProfile(
        progress,
        "Stage 1 Cool / שלב 1 כחול",
        `${percent}% warmed / ${percent}% התחממות`
      );
    }
    if (progress < 0.67) {
      return this._buildHeatingProfile(
        progress,
        "Stage 2 Warm / שלב 2 כתום",
        `${percent}% warmed / ${percent}% התחממות`
      );
    }
    return this._buildHeatingProfile(
      progress,
      "Stage 3 Hot / שלב 3 אדום",
      `${percent}% warmed / ${percent}% התחממות`
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
      return "ללא טיימר / No Timer";
    }

    const minutes = this._optionToMinutes(option);
    if (minutes === null) {
      return option;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m / ${minutes} דקות`;
    }
    if (hours > 0) {
      return `${hours}h / ${minutes} דקות`;
    }
    return `${minutes}m / ${minutes} דקות`;
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
    if (!this._elements.timerModal || this._elements.timerPickerBtn.disabled) {
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

  _handlePowerToggle() {
    if (!this._hass) {
      return;
    }

    const boiler = this._hass.states[this._config.boiler_entity];
    if (this._isEntityOn(boiler)) {
      this._handleTurnOff();
      return;
    }

    this._handleTurnOn();
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
    return normalized === "no timer" || normalized.includes("ללא");
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

if (!customElements.get("boiler-water-card")) {
  customElements.define("boiler-water-card", BoilerWaterCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "boiler-water-card")) {
  window.customCards.push({
    type: "boiler-water-card",
    name: "Boiler Water Card",
    description: "Styled control card for boiler On/Off and timer selection.",
  });
}
