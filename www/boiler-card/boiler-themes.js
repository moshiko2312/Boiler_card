export function normalizeCardTheme(theme) {
  const normalized = String(theme || "").trim().toLowerCase();
  if (normalized === "dark_glass" || normalized === "dark-glass") {
    return "dark-glass";
  }
  if (normalized === "amber_glow" || normalized === "amber-glow") {
    return "amber-glow";
  }
  return "classic";
}

export function buildThemeCss() {
  return `
        ha-card.theme-dark-glass {
          background:
            radial-gradient(140% 120% at 0% 0%, rgba(76, 141, 255, 0.18) 0%, rgba(76, 141, 255, 0) 55%),
            radial-gradient(120% 100% at 100% 0%, rgba(108, 92, 231, 0.16) 0%, rgba(108, 92, 231, 0) 52%),
            linear-gradient(180deg, rgba(20, 27, 45, 0.98) 0%, rgba(14, 20, 34, 0.95) 100%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow:
            0 14px 32px rgba(0, 0, 0, 0.34),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }
        ha-card.theme-dark-glass .wrap {
          color: #ecf4ff;
        }
        ha-card.theme-dark-glass .subtitle,
        ha-card.theme-dark-glass .sensors-chips,
        ha-card.theme-dark-glass .boiler-muted {
          color: rgba(225, 236, 255, 0.78);
        }
        ha-card.theme-dark-glass .boiler-visual {
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: linear-gradient(160deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.07));
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
        }
        ha-card.theme-dark-glass .boiler-icon {
          border-color: rgba(194, 214, 247, 0.6);
          background: linear-gradient(180deg, rgba(37, 48, 68, 0.95) 0%, rgba(31, 41, 59, 0.9) 100%);
        }
        ha-card.theme-dark-glass .boiler-main-image {
          filter: saturate(1.08) contrast(1.06) brightness(1.04);
        }
        ha-card.theme-amber-glow {
          background:
            radial-gradient(140% 120% at 0% 0%, rgba(255, 170, 64, 0.14) 0%, rgba(255, 170, 64, 0) 58%),
            radial-gradient(120% 100% at 100% 0%, rgba(255, 129, 64, 0.11) 0%, rgba(255, 129, 64, 0) 55%),
            radial-gradient(120% 100% at 100% 0%, rgba(108, 92, 231, 0.14) 0%, rgba(108, 92, 231, 0) 52%),
            linear-gradient(180deg, rgba(20, 27, 45, 0.98) 0%, rgba(14, 20, 34, 0.95) 100%);
          border: 1px solid rgba(255, 176, 92, 0.42);
          box-shadow:
            0 14px 32px rgba(0, 0, 0, 0.38),
            0 0 0 1px rgba(255, 156, 64, 0.24),
            inset 0 1px 0 rgba(255, 219, 173, 0.16);
        }
        ha-card.theme-amber-glow .wrap {
          color: #fff4e8;
        }
        ha-card.theme-amber-glow .subtitle {
          color: rgba(255, 223, 194, 0.84);
        }
        ha-card.theme-amber-glow .boiler-visual {
          border: 1px solid rgba(255, 188, 123, 0.44);
          background: linear-gradient(160deg, rgba(255, 210, 160, 0.16), rgba(255, 180, 120, 0.08));
          box-shadow: inset 0 1px 0 rgba(255, 224, 184, 0.16);
        }
        ha-card.theme-amber-glow .boiler-icon {
          border-color: rgba(255, 186, 116, 0.65);
          background: linear-gradient(180deg, rgba(37, 48, 68, 0.95) 0%, rgba(31, 41, 59, 0.9) 100%);
        }
        ha-card.theme-amber-glow .boiler-main-image {
          filter: saturate(1.1) contrast(1.07) brightness(1.05);
        }
        :host([data-card-theme="dark-glass"]) .timer-modal-backdrop {
          background: rgba(4, 10, 20, 0.72);
        }
        :host([data-card-theme="amber-glow"]) .timer-modal-backdrop {
          background: rgba(10, 7, 5, 0.74);
        }
        :host([data-card-theme="dark-glass"]) .timer-modal-panel,
        :host([data-card-theme="dark-glass"]) .confirm-modal-panel,
        :host([data-card-theme="dark-glass"]) .guide-modal-panel {
          background:
            radial-gradient(140% 120% at 0% 0%, rgba(76, 141, 255, 0.16) 0%, rgba(76, 141, 255, 0) 55%),
            radial-gradient(120% 100% at 100% 0%, rgba(108, 92, 231, 0.14) 0%, rgba(108, 92, 231, 0) 52%),
            linear-gradient(180deg, rgba(20, 27, 45, 0.98) 0%, rgba(14, 20, 34, 0.95) 100%);
          border: 1px solid rgba(255, 255, 255, 0.16);
          box-shadow:
            0 16px 34px rgba(0, 0, 0, 0.36),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          color: #eaf2ff;
        }
        :host([data-card-theme="amber-glow"]) .timer-modal-panel,
        :host([data-card-theme="amber-glow"]) .confirm-modal-panel,
        :host([data-card-theme="amber-glow"]) .guide-modal-panel {
          background:
            radial-gradient(140% 120% at 0% 0%, rgba(255, 170, 64, 0.13) 0%, rgba(255, 170, 64, 0) 58%),
            radial-gradient(120% 100% at 100% 0%, rgba(255, 129, 64, 0.1) 0%, rgba(255, 129, 64, 0) 55%),
            radial-gradient(120% 100% at 100% 0%, rgba(108, 92, 231, 0.12) 0%, rgba(108, 92, 231, 0) 52%),
            linear-gradient(180deg, rgba(20, 27, 45, 0.98) 0%, rgba(14, 20, 34, 0.95) 100%);
          border: 1px solid rgba(255, 179, 98, 0.42);
          box-shadow:
            0 16px 34px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255, 152, 68, 0.22),
            inset 0 1px 0 rgba(255, 214, 168, 0.14);
          color: #fff0df;
        }
        :host([data-card-theme="dark-glass"]) .timer-modal-head,
        :host([data-card-theme="dark-glass"]) .guide-modal-head,
        :host([data-card-theme="dark-glass"]) .tasks-head,
        :host([data-card-theme="dark-glass"]) .history-head {
          border-bottom-color: rgba(255, 255, 255, 0.14);
        }
        :host([data-card-theme="amber-glow"]) .timer-modal-head,
        :host([data-card-theme="amber-glow"]) .guide-modal-head,
        :host([data-card-theme="amber-glow"]) .tasks-head,
        :host([data-card-theme="amber-glow"]) .history-head {
          border-bottom-color: rgba(255, 196, 135, 0.36);
        }
        :host([data-card-theme="dark-glass"]) .timer-modal-title,
        :host([data-card-theme="dark-glass"]) .tasks-title,
        :host([data-card-theme="dark-glass"]) .confirm-modal-title,
        :host([data-card-theme="dark-glass"]) .schedule-label {
          color: #ecf4ff;
        }
        :host([data-card-theme="amber-glow"]) .timer-modal-title,
        :host([data-card-theme="amber-glow"]) .tasks-title,
        :host([data-card-theme="amber-glow"]) .confirm-modal-title,
        :host([data-card-theme="amber-glow"]) .schedule-label {
          color: #fff0df;
        }
        :host([data-card-theme="dark-glass"]) .menu-view .tasks-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.14);
        }
        :host([data-card-theme="amber-glow"]) .menu-view .tasks-card {
          background: rgba(255, 191, 138, 0.06);
          border: 1px solid rgba(255, 190, 130, 0.28);
        }
        :host([data-card-theme="dark-glass"]) .timer-modal-panel input,
        :host([data-card-theme="dark-glass"]) .timer-modal-panel select,
        :host([data-card-theme="dark-glass"]) .timer-modal-panel textarea,
        :host([data-card-theme="dark-glass"]) .confirm-modal-panel input,
        :host([data-card-theme="dark-glass"]) .confirm-modal-panel select {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.18);
          color: #eaf2ff;
        }
        :host([data-card-theme="amber-glow"]) .timer-modal-panel input,
        :host([data-card-theme="amber-glow"]) .timer-modal-panel select,
        :host([data-card-theme="amber-glow"]) .timer-modal-panel textarea,
        :host([data-card-theme="amber-glow"]) .confirm-modal-panel input,
        :host([data-card-theme="amber-glow"]) .confirm-modal-panel select {
          background: rgba(255, 209, 165, 0.08);
          border-color: rgba(255, 196, 136, 0.34);
          color: #fff1e2;
        }
        :host([data-card-theme="dark-glass"]) .timer-modal-panel input::placeholder,
        :host([data-card-theme="dark-glass"]) .confirm-modal-panel input::placeholder {
          color: rgba(226, 238, 255, 0.6);
        }
        :host([data-card-theme="amber-glow"]) .timer-modal-panel input::placeholder,
        :host([data-card-theme="amber-glow"]) .confirm-modal-panel input::placeholder {
          color: rgba(255, 220, 188, 0.62);
        }
        :host([data-card-theme="dark-glass"]) .timer-btn,
        :host([data-card-theme="dark-glass"]) .tasks-add-btn,
        :host([data-card-theme="dark-glass"]) .tasks-vacation-btn,
        :host([data-card-theme="dark-glass"]) .tasks-export-btn,
        :host([data-card-theme="dark-glass"]) .tasks-import-btn,
        :host([data-card-theme="dark-glass"]) .tasks-mode-btn,
        :host([data-card-theme="dark-glass"]) .schedule-type-btn,
        :host([data-card-theme="dark-glass"]) .schedule-section-btn,
        :host([data-card-theme="dark-glass"]) .schedule-action-btn,
        :host([data-card-theme="dark-glass"]) .confirm-action-btn,
        :host([data-card-theme="dark-glass"]) .guide-tab-btn {
          background: rgba(255, 255, 255, 0.08);
          color: #eaf2ff;
          border-color: rgba(255, 255, 255, 0.18);
        }
        :host([data-card-theme="amber-glow"]) .timer-btn,
        :host([data-card-theme="amber-glow"]) .tasks-add-btn,
        :host([data-card-theme="amber-glow"]) .tasks-vacation-btn,
        :host([data-card-theme="amber-glow"]) .tasks-export-btn,
        :host([data-card-theme="amber-glow"]) .tasks-import-btn,
        :host([data-card-theme="amber-glow"]) .tasks-mode-btn,
        :host([data-card-theme="amber-glow"]) .schedule-type-btn,
        :host([data-card-theme="amber-glow"]) .schedule-section-btn,
        :host([data-card-theme="amber-glow"]) .schedule-action-btn,
        :host([data-card-theme="amber-glow"]) .confirm-action-btn,
        :host([data-card-theme="amber-glow"]) .guide-tab-btn {
          background: rgba(255, 199, 146, 0.08);
          color: #fff0df;
          border-color: rgba(255, 196, 136, 0.34);
          box-shadow: 0 0 0 1px rgba(255, 157, 73, 0.1);
        }
        :host([data-card-theme="dark-glass"]) .timer-btn.active,
        :host([data-card-theme="dark-glass"]) .tasks-mode-btn.active,
        :host([data-card-theme="dark-glass"]) .schedule-type-btn.active,
        :host([data-card-theme="dark-glass"]) .schedule-section-btn.active,
        :host([data-card-theme="dark-glass"]) .schedule-action-btn.primary,
        :host([data-card-theme="dark-glass"]) .confirm-action-btn.primary,
        :host([data-card-theme="dark-glass"]) .guide-tab-btn.active {
          background: linear-gradient(165deg, rgba(102, 190, 224, 0.94), rgba(49, 146, 186, 0.9));
          color: #ffffff;
          border-color: rgba(125, 210, 240, 0.86);
        }
        :host([data-card-theme="amber-glow"]) .timer-btn.active,
        :host([data-card-theme="amber-glow"]) .tasks-mode-btn.active,
        :host([data-card-theme="amber-glow"]) .schedule-type-btn.active,
        :host([data-card-theme="amber-glow"]) .schedule-section-btn.active,
        :host([data-card-theme="amber-glow"]) .schedule-action-btn.primary,
        :host([data-card-theme="amber-glow"]) .confirm-action-btn.primary,
        :host([data-card-theme="amber-glow"]) .guide-tab-btn.active {
          background: linear-gradient(165deg, rgba(255, 183, 102, 0.96), rgba(241, 126, 42, 0.92));
          color: #ffffff;
          border-color: rgba(255, 193, 129, 0.9);
          box-shadow: 0 0 0 1px rgba(255, 164, 74, 0.38), 0 0 14px rgba(255, 150, 68, 0.26);
        }

`;
}
