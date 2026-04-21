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
};

class BoilerWaterCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = { ...DEFAULT_CONFIG };
    this._hass = null;
    this._elements = {};
    this._ticker = null;
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
    return 4;
  }

  _renderShell() {
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
          gap: 12px;
          padding: 18px;
          color: var(--boiler-text);
        }

        .row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .title {
          margin: 0;
          font-size: 1.1rem;
          letter-spacing: 0.01em;
          line-height: 1.2;
        }

        .subtitle {
          margin: 0;
          color: var(--boiler-muted);
          font-size: 0.92rem;
        }

        .chip {
          border-radius: 999px;
          padding: 6px 12px;
          font-size: 0.78rem;
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
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(50, 88, 128, 0.12);
          display: grid;
          gap: 3px;
        }

        .countdown-label {
          color: var(--boiler-muted);
          font-size: 0.82rem;
        }

        .countdown-value {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .field-label {
          font-size: 0.83rem;
          color: var(--boiler-muted);
        }

        select {
          width: 100%;
          border-radius: 12px;
          border: 1px solid #d4deeb;
          padding: 10px 12px;
          font-size: 0.96rem;
          color: var(--boiler-text);
          background: rgba(255, 255, 255, 0.92);
          outline: none;
          transition: border-color 140ms ease, box-shadow 140ms ease;
        }

        select:focus {
          border-color: #7aa7da;
          box-shadow: 0 0 0 3px rgba(122, 167, 218, 0.2);
        }

        .actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        button {
          border: 0;
          border-radius: 12px;
          padding: 11px 10px;
          font-weight: 800;
          cursor: pointer;
          color: #fff;
          transition: transform 120ms ease, filter 120ms ease;
        }

        button:active {
          transform: translateY(1px);
        }

        button[disabled] {
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

        @media (max-width: 520px) {
          .wrap {
            padding: 14px;
            gap: 10px;
          }

          .actions {
            grid-template-columns: 1fr;
          }

          .countdown-value {
            font-size: 1.34rem;
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
      </style>

      <ha-card>
        <div class="wrap">
          <div class="row">
            <h2 class="title" id="title"></h2>
            <span class="chip off" id="status-chip">OFF / כבוי</span>
          </div>

          <p class="subtitle" id="subtitle">Ready / מוכן להפעלה</p>

          <div class="countdown">
            <span class="countdown-label" id="countdown-label">Remaining / זמן נותר</span>
            <span class="countdown-value" id="countdown-value">--:--</span>
          </div>

          <label class="field-label" for="duration-select">Timer / טיימר</label>
          <select id="duration-select"></select>

          <div class="actions">
            <button class="on-btn" id="on-btn">הדלק / Turn On</button>
            <button class="off-btn" id="off-btn">כיבוי / Turn Off</button>
          </div>

          <p class="error" id="error" hidden></p>
        </div>
      </ha-card>
    `;

    this._elements = {
      title: this.shadowRoot.getElementById("title"),
      subtitle: this.shadowRoot.getElementById("subtitle"),
      countdownLabel: this.shadowRoot.getElementById("countdown-label"),
      countdownValue: this.shadowRoot.getElementById("countdown-value"),
      statusChip: this.shadowRoot.getElementById("status-chip"),
      durationSelect: this.shadowRoot.getElementById("duration-select"),
      onBtn: this.shadowRoot.getElementById("on-btn"),
      offBtn: this.shadowRoot.getElementById("off-btn"),
      error: this.shadowRoot.getElementById("error"),
    };

    this._elements.durationSelect.addEventListener("change", (event) =>
      this._handleDurationChange(event)
    );
    this._elements.onBtn.addEventListener("click", () => this._handleTurnOn());
    this._elements.offBtn.addEventListener("click", () => this._handleTurnOff());
  }

  _sync() {
    if (!this._hass || !this._elements.title) {
      return;
    }

    const cfg = this._config;
    const boiler = this._hass.states[cfg.boiler_entity];
    const duration = this._hass.states[cfg.duration_entity];
    const timer = this._hass.states[cfg.timer_entity];

    this._elements.title.textContent = cfg.title;
    this._syncDurationOptions(duration);
    this._syncStatus(boiler, timer);
    this._syncCountdown(timer, boiler);
    this._syncError(boiler, duration, timer);
    this._syncButtons();
  }

  _syncDurationOptions(durationEntity) {
    const select = this._elements.durationSelect;
    const options = this._durationOptions(durationEntity);

    if (select.options.length !== options.length) {
      select.innerHTML = "";
      options.forEach((option) => {
        const item = document.createElement("option");
        item.value = option;
        item.textContent = this._renderOptionLabel(option);
        select.appendChild(item);
      });
    } else {
      options.forEach((option, index) => {
        if (select.options[index].value !== option) {
          select.options[index].value = option;
          select.options[index].textContent = this._renderOptionLabel(option);
        }
      });
    }

    const selected = durationEntity?.state || "30m";
    select.value = options.includes(selected) ? selected : "30m";
  }

  _syncStatus(boiler, timer) {
    const isOn = boiler?.state === "on";

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

    if (boiler?.state === "on") {
      this._elements.countdownLabel.textContent = "No Timer / ללא טיימר";
      this._elements.countdownValue.textContent = "∞";
      return;
    }

    this._elements.countdownLabel.textContent = "Remaining / זמן נותר";
    this._elements.countdownValue.textContent = "--:--";
  }

  _syncError(boiler, duration, timer) {
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

    if (missing.length === 0) {
      this._elements.error.hidden = true;
      this._elements.error.textContent = "";
      return;
    }

    this._elements.error.hidden = false;
    this._elements.error.textContent = `Missing entity / ישות חסרה: ${missing.join(", ")}`;
  }

  _syncButtons() {
    const hasHass = !!this._hass;
    const hasScripts =
      !!this._config.script_on_timed &&
      !!this._config.script_on_continuous &&
      !!this._config.script_off;

    const disabled = !hasHass || !hasScripts;
    this._elements.onBtn.disabled = disabled;
    this._elements.offBtn.disabled = disabled;
  }

  _refreshLiveCountdown() {
    if (!this._hass || !this._elements.countdownValue) {
      return;
    }

    const timer = this._hass.states[this._config.timer_entity];
    const boiler = this._hass.states[this._config.boiler_entity];
    this._syncCountdown(timer, boiler);
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

  _handleDurationChange(event) {
    if (!this._hass) {
      return;
    }

    this._hass.callService("input_select", "select_option", {
      entity_id: this._config.duration_entity,
      option: event.target.value,
    });
  }

  _handleTurnOn() {
    if (!this._hass) {
      return;
    }

    const durationState = this._hass.states[this._config.duration_entity]?.state || "30m";

    if (this._isNoTimerOption(durationState)) {
      this._runScript(this._config.script_on_continuous);
      return;
    }

    this._runScript(this._config.script_on_timed, {
      duration_option: durationState,
      duration: this._optionToHhMmSs(durationState) || "00:30:00",
    });
  }

  _handleTurnOff() {
    this._runScript(this._config.script_off);
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
}

customElements.define("boiler-water-card", BoilerWaterCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "boiler-water-card",
  name: "Boiler Water Card",
  description: "Styled control card for boiler On/Off and timer selection.",
});
