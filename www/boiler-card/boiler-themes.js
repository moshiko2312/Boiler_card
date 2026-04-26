export function normalizeCardTheme(theme) {
  const normalized = String(theme || "").trim().toLowerCase();
  if (normalized === "dark_glass" || normalized === "dark-glass") {
    return "dark-glass";
  }
  if (normalized === "amber_glow" || normalized === "amber-glow") {
    return "amber-glow";
  }
  if (normalized === "smart_room_blue" || normalized === "smart-room-blue") {
    return "smart-room-blue";
  }
  if (normalized === "midnight_black" || normalized === "midnight-black") {
    return "midnight-black";
  }
  if (normalized === "gallery_neon" || normalized === "gallery-neon") {
    return "gallery-neon";
  }
  if (normalized === "slate_ice" || normalized === "slate-ice") {
    return "slate-ice";
  }
  if (normalized === "neo_contrast" || normalized === "neo-contrast") {
    return "neo-contrast";
  }
  if (normalized === "clear_frost" || normalized === "clear-frost") {
    return "clear-frost";
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
        ha-card.theme-smart-room-blue {
          background:
            radial-gradient(140% 120% at 0% 0%, rgba(0, 212, 255, 0.17) 0%, rgba(0, 212, 255, 0) 52%),
            radial-gradient(120% 100% at 100% 0%, rgba(10, 74, 122, 0.32) 0%, rgba(10, 74, 122, 0) 55%),
            linear-gradient(160deg, rgba(14, 31, 56, 0.98) 0%, rgba(6, 15, 30, 0.96) 100%);
          border: 1px solid rgba(118, 209, 255, 0.34);
          box-shadow:
            0 16px 36px rgba(2, 8, 20, 0.56),
            0 0 0 1px rgba(0, 212, 255, 0.14),
            inset 0 1px 0 rgba(184, 233, 255, 0.14);
        }
        ha-card.theme-smart-room-blue .wrap {
          color: #e9f6ff;
        }
        ha-card.theme-smart-room-blue .subtitle,
        ha-card.theme-smart-room-blue .sensors-chips,
        ha-card.theme-smart-room-blue .boiler-muted {
          color: rgba(196, 227, 247, 0.84);
        }
        ha-card.theme-smart-room-blue .boiler-visual {
          border: 1px solid rgba(124, 200, 236, 0.42);
          background: linear-gradient(160deg, rgba(120, 194, 255, 0.14), rgba(35, 100, 160, 0.1));
          box-shadow: inset 0 1px 0 rgba(189, 232, 255, 0.2);
        }
        ha-card.theme-smart-room-blue .boiler-icon {
          border-color: rgba(123, 181, 219, 0.75);
          background: linear-gradient(180deg, rgba(19, 40, 64, 0.96) 0%, rgba(10, 24, 44, 0.93) 100%);
        }
        ha-card.theme-smart-room-blue .boiler-main-image {
          filter: saturate(1.12) contrast(1.08) brightness(1.03);
        }
        ha-card.theme-midnight-black {
          background:
            radial-gradient(150% 130% at 10% 0%, rgba(76, 120, 170, 0.14) 0%, rgba(76, 120, 170, 0) 52%),
            radial-gradient(120% 100% at 100% 0%, rgba(22, 33, 52, 0.48) 0%, rgba(22, 33, 52, 0) 55%),
            linear-gradient(165deg, rgba(8, 11, 18, 0.99) 0%, rgba(2, 5, 10, 0.98) 100%);
          border: 1px solid rgba(131, 166, 209, 0.2);
          box-shadow:
            0 18px 40px rgba(0, 0, 0, 0.7),
            0 0 0 1px rgba(125, 169, 219, 0.08),
            inset 0 1px 0 rgba(178, 206, 239, 0.08);
        }
        ha-card.theme-midnight-black .wrap {
          color: #edf3ff;
        }
        ha-card.theme-midnight-black .subtitle,
        ha-card.theme-midnight-black .sensors-chips,
        ha-card.theme-midnight-black .boiler-muted {
          color: rgba(201, 215, 236, 0.8);
        }
        ha-card.theme-midnight-black .boiler-visual {
          border: 1px solid rgba(128, 157, 194, 0.34);
          background: linear-gradient(160deg, rgba(123, 153, 192, 0.12), rgba(22, 32, 49, 0.16));
          box-shadow: inset 0 1px 0 rgba(188, 208, 237, 0.12);
        }
        ha-card.theme-midnight-black .boiler-icon {
          border-color: rgba(126, 162, 206, 0.6);
          background: linear-gradient(180deg, rgba(13, 24, 39, 0.98) 0%, rgba(5, 12, 23, 0.96) 100%);
        }
        ha-card.theme-midnight-black .boiler-main-image {
          filter: saturate(1.05) contrast(1.1) brightness(0.93);
        }
        ha-card.theme-frost-light {
          background:
            radial-gradient(130% 110% at 0% 0%, rgba(130, 201, 255, 0.27) 0%, rgba(130, 201, 255, 0) 54%),
            radial-gradient(120% 100% at 100% 0%, rgba(174, 214, 255, 0.2) 0%, rgba(174, 214, 255, 0) 56%),
            linear-gradient(180deg, rgba(246, 251, 255, 0.98) 0%, rgba(232, 242, 252, 0.96) 100%);
          border: 1px solid rgba(150, 188, 228, 0.42);
          box-shadow:
            0 12px 28px rgba(34, 75, 120, 0.14),
            0 0 0 1px rgba(168, 204, 242, 0.24),
            inset 0 1px 0 rgba(255, 255, 255, 0.66);
        }
        ha-card.theme-frost-light .wrap {
          color: #10253d;
        }
        ha-card.theme-frost-light .subtitle,
        ha-card.theme-frost-light .sensors-chips,
        ha-card.theme-frost-light .boiler-muted {
          color: rgba(39, 75, 111, 0.78);
        }
        ha-card.theme-frost-light .boiler-visual {
          border: 1px solid rgba(148, 186, 223, 0.45);
          background: linear-gradient(160deg, rgba(255, 255, 255, 0.78), rgba(217, 234, 250, 0.64));
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
        }
        ha-card.theme-frost-light .boiler-icon {
          border-color: rgba(112, 152, 196, 0.7);
          background: linear-gradient(180deg, rgba(240, 247, 255, 0.98) 0%, rgba(224, 236, 249, 0.95) 100%);
        }
        ha-card.theme-frost-light .boiler-main-image {
          filter: saturate(1.02) contrast(1.03) brightness(1.05);
        }
        ha-card.theme-frost-light .boiler-stage-sub {
          color: #15324f;
          text-shadow: none;
        }
        ha-card.theme-frost-light .countdown-label {
          color: #2f5377;
          text-shadow: none;
        }
        ha-card.theme-frost-light .countdown-value {
          color: #10253d;
          text-shadow: none;
        }
        ha-card.theme-frost-light .upcoming-task-notice {
          border-color: rgba(104, 166, 205, 0.48);
          background: linear-gradient(165deg, rgba(152, 209, 242, 0.32), rgba(120, 184, 224, 0.26));
          color: #123454;
          text-shadow: none;
        }
        ha-card.theme-frost-light .active-task-notice {
          border-color: rgba(121, 188, 147, 0.5);
          background: linear-gradient(165deg, rgba(170, 224, 194, 0.34), rgba(135, 205, 168, 0.28));
          color: #12422e;
          text-shadow: none;
        }
        ha-card.theme-frost-light .vacation-notice {
          border-color: rgba(223, 176, 103, 0.66);
          background: linear-gradient(165deg, rgba(255, 222, 170, 0.42), rgba(244, 193, 122, 0.32));
          color: #5b3308;
          text-shadow: none;
        }
        ha-card.theme-gallery-neon {
          background:
            radial-gradient(130% 110% at 0% 0%, rgba(0, 195, 255, 0.18) 0%, rgba(0, 195, 255, 0) 48%),
            radial-gradient(120% 100% at 100% 0%, rgba(134, 82, 255, 0.18) 0%, rgba(134, 82, 255, 0) 52%),
            linear-gradient(175deg, rgba(12, 20, 35, 0.98) 0%, rgba(7, 12, 22, 0.98) 100%);
          border: 1px solid rgba(126, 210, 255, 0.28);
          box-shadow: 0 18px 40px rgba(2, 8, 24, 0.54), inset 0 1px 0 rgba(205, 238, 255, 0.1);
        }
        ha-card.theme-gallery-neon .wrap { color: #edf8ff; }
        ha-card.theme-gallery-neon .subtitle,
        ha-card.theme-gallery-neon .sensors-chips,
        ha-card.theme-gallery-neon .boiler-muted { color: rgba(194, 224, 244, 0.84); }
        ha-card.theme-gallery-neon .boiler-visual {
          border: 1px solid rgba(128, 201, 247, 0.38);
          background: linear-gradient(160deg, rgba(93, 181, 255, 0.13), rgba(105, 78, 214, 0.11));
        }
        ha-card.theme-gallery-neon .boiler-icon {
          border-color: rgba(130, 189, 235, 0.68);
          background: linear-gradient(180deg, rgba(20, 33, 55, 0.95) 0%, rgba(10, 18, 33, 0.94) 100%);
        }
        ha-card.theme-slate-ice {
          background:
            radial-gradient(140% 120% at 0% 0%, rgba(136, 199, 226, 0.2) 0%, rgba(136, 199, 226, 0) 52%),
            linear-gradient(180deg, rgba(34, 50, 72, 0.98) 0%, rgba(19, 30, 46, 0.97) 100%);
          border: 1px solid rgba(166, 209, 234, 0.34);
          box-shadow: 0 16px 34px rgba(7, 17, 30, 0.48), inset 0 1px 0 rgba(216, 240, 252, 0.1);
        }
        ha-card.theme-slate-ice .wrap { color: #ecf7ff; }
        ha-card.theme-slate-ice .subtitle,
        ha-card.theme-slate-ice .sensors-chips,
        ha-card.theme-slate-ice .boiler-muted { color: rgba(206, 228, 240, 0.82); }
        ha-card.theme-slate-ice .boiler-visual {
          border: 1px solid rgba(152, 193, 218, 0.4);
          background: linear-gradient(160deg, rgba(188, 222, 241, 0.12), rgba(96, 133, 161, 0.13));
        }
        ha-card.theme-slate-ice .boiler-icon {
          border-color: rgba(155, 196, 219, 0.7);
          background: linear-gradient(180deg, rgba(34, 53, 75, 0.96) 0%, rgba(22, 36, 55, 0.95) 100%);
        }
        ha-card.theme-neo-contrast {
          background:
            radial-gradient(130% 110% at 0% 0%, rgba(0, 209, 255, 0.2) 0%, rgba(0, 209, 255, 0) 50%),
            radial-gradient(120% 100% at 100% 0%, rgba(117, 82, 255, 0.2) 0%, rgba(117, 82, 255, 0) 52%),
            linear-gradient(175deg, rgba(10, 17, 31, 0.99) 0%, rgba(4, 9, 18, 0.99) 100%);
          border: 1px solid rgba(124, 210, 255, 0.3);
          box-shadow: 0 18px 40px rgba(2, 8, 24, 0.58), inset 0 1px 0 rgba(200, 236, 255, 0.1);
        }
        ha-card.theme-neo-contrast .wrap { color: #eef8ff; }
        ha-card.theme-neo-contrast .subtitle,
        ha-card.theme-neo-contrast .sensors-chips,
        ha-card.theme-neo-contrast .boiler-muted { color: rgba(197, 226, 245, 0.84); }
        ha-card.theme-neo-contrast .boiler-visual {
          border: 1px solid rgba(125, 201, 247, 0.38);
          background: linear-gradient(160deg, rgba(90, 181, 255, 0.13), rgba(102, 76, 214, 0.11));
        }
        ha-card.theme-neo-contrast .boiler-icon {
          border-color: rgba(130, 189, 235, 0.68);
          background: linear-gradient(180deg, rgba(20, 33, 55, 0.95) 0%, rgba(10, 18, 33, 0.94) 100%);
        }
        ha-card.theme-clear-frost {
          background:
            radial-gradient(130% 110% at 0% 0%, rgba(175, 208, 234, 0.22) 0%, rgba(175, 208, 234, 0) 56%),
            linear-gradient(180deg, rgba(245, 250, 255, 0.78) 0%, rgba(230, 240, 250, 0.72) 100%);
          border: 1px solid rgba(132, 164, 194, 0.45);
          box-shadow:
            0 10px 22px rgba(27, 58, 92, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.68);
          backdrop-filter: blur(12px);
        }
        ha-card.theme-clear-frost .wrap { color: #1a3047; }
        ha-card.theme-clear-frost .subtitle,
        ha-card.theme-clear-frost .sensors-chips,
        ha-card.theme-clear-frost .boiler-muted { color: rgba(44, 73, 103, 0.82); }
        ha-card.theme-clear-frost .boiler-visual {
          border: 1px solid rgba(132, 164, 194, 0.44);
          background: linear-gradient(160deg, rgba(255, 255, 255, 0.66), rgba(223, 236, 248, 0.5));
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);
        }
        ha-card.theme-clear-frost .boiler-icon {
          border-color: rgba(123, 158, 190, 0.66);
          background: linear-gradient(180deg, rgba(246, 251, 255, 0.92) 0%, rgba(228, 239, 249, 0.88) 100%);
        }
        ha-card.theme-clear-frost .title,
        ha-card.theme-clear-frost .countdown-label,
        ha-card.theme-clear-frost .countdown-value,
        ha-card.theme-clear-frost .boiler-stage-sub,
        ha-card.theme-clear-frost .upcoming-task-notice,
        ha-card.theme-clear-frost .active-task-notice,
        ha-card.theme-clear-frost .vacation-notice {
          color: #111111;
          text-shadow: none;
        }
        :host([data-card-theme="dark-glass"]) .timer-modal-backdrop {
          background: rgba(4, 10, 20, 0.72);
        }
        :host([data-card-theme="amber-glow"]) .timer-modal-backdrop {
          background: rgba(10, 7, 5, 0.74);
        }
        :host([data-card-theme="smart-room-blue"]) .timer-modal-backdrop {
          background: rgba(2, 10, 21, 0.78);
        }
        :host([data-card-theme="midnight-black"]) .timer-modal-backdrop {
          background: rgba(0, 0, 0, 0.84);
        }
        :host([data-card-theme="frost-light"]) .timer-modal-backdrop {
          background: rgba(206, 222, 240, 0.5);
        }
        :host([data-card-theme="gallery-neon"]) .timer-modal-backdrop { background: rgba(3, 8, 20, 0.8); }
        :host([data-card-theme="slate-ice"]) .timer-modal-backdrop { background: rgba(6, 15, 25, 0.76); }
        :host([data-card-theme="neo-contrast"]) .timer-modal-backdrop { background: rgba(3, 8, 20, 0.82); }
        :host([data-card-theme="clear-frost"]) .timer-modal-backdrop { background: rgba(180, 198, 216, 0.4); }
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
        :host([data-card-theme="smart-room-blue"]) .timer-modal-panel,
        :host([data-card-theme="smart-room-blue"]) .confirm-modal-panel,
        :host([data-card-theme="smart-room-blue"]) .guide-modal-panel {
          background:
            radial-gradient(140% 120% at 0% 0%, rgba(0, 212, 255, 0.15) 0%, rgba(0, 212, 255, 0) 52%),
            radial-gradient(120% 100% at 100% 0%, rgba(10, 74, 122, 0.28) 0%, rgba(10, 74, 122, 0) 55%),
            linear-gradient(160deg, rgba(14, 31, 56, 0.98) 0%, rgba(6, 15, 30, 0.96) 100%);
          border: 1px solid rgba(127, 210, 255, 0.34);
          box-shadow:
            0 18px 38px rgba(2, 8, 20, 0.6),
            0 0 0 1px rgba(0, 212, 255, 0.14),
            inset 0 1px 0 rgba(184, 233, 255, 0.12);
          color: #e9f6ff;
        }
        :host([data-card-theme="midnight-black"]) .timer-modal-panel,
        :host([data-card-theme="midnight-black"]) .confirm-modal-panel,
        :host([data-card-theme="midnight-black"]) .guide-modal-panel {
          background:
            radial-gradient(145% 120% at 10% 0%, rgba(76, 120, 170, 0.12) 0%, rgba(76, 120, 170, 0) 52%),
            linear-gradient(165deg, rgba(8, 11, 18, 0.99) 0%, rgba(2, 5, 10, 0.98) 100%);
          border: 1px solid rgba(131, 166, 209, 0.24);
          box-shadow:
            0 20px 42px rgba(0, 0, 0, 0.72),
            0 0 0 1px rgba(125, 169, 219, 0.08),
            inset 0 1px 0 rgba(178, 206, 239, 0.08);
          color: #edf3ff;
        }
        :host([data-card-theme="frost-light"]) .timer-modal-panel,
        :host([data-card-theme="frost-light"]) .confirm-modal-panel,
        :host([data-card-theme="frost-light"]) .guide-modal-panel {
          background:
            radial-gradient(130% 110% at 0% 0%, rgba(130, 201, 255, 0.24) 0%, rgba(130, 201, 255, 0) 54%),
            radial-gradient(120% 100% at 100% 0%, rgba(174, 214, 255, 0.18) 0%, rgba(174, 214, 255, 0) 56%),
            linear-gradient(180deg, rgba(246, 251, 255, 0.98) 0%, rgba(232, 242, 252, 0.96) 100%);
          border: 1px solid rgba(150, 188, 228, 0.42);
          box-shadow:
            0 14px 30px rgba(34, 75, 120, 0.16),
            0 0 0 1px rgba(168, 204, 242, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.66);
          color: #10253d;
        }
        :host([data-card-theme="gallery-neon"]) .timer-modal-panel,
        :host([data-card-theme="gallery-neon"]) .confirm-modal-panel,
        :host([data-card-theme="gallery-neon"]) .guide-modal-panel {
          background:
            radial-gradient(130% 110% at 0% 0%, rgba(0, 195, 255, 0.16) 0%, rgba(0, 195, 255, 0) 48%),
            radial-gradient(120% 100% at 100% 0%, rgba(134, 82, 255, 0.16) 0%, rgba(134, 82, 255, 0) 52%),
            linear-gradient(175deg, rgba(12, 20, 35, 0.98) 0%, rgba(7, 12, 22, 0.98) 100%);
          border: 1px solid rgba(126, 210, 255, 0.3);
          color: #edf8ff;
        }
        :host([data-card-theme="slate-ice"]) .timer-modal-panel,
        :host([data-card-theme="slate-ice"]) .confirm-modal-panel,
        :host([data-card-theme="slate-ice"]) .guide-modal-panel {
          background:
            radial-gradient(140% 120% at 0% 0%, rgba(136, 199, 226, 0.18) 0%, rgba(136, 199, 226, 0) 52%),
            linear-gradient(180deg, rgba(34, 50, 72, 0.98) 0%, rgba(19, 30, 46, 0.97) 100%);
          border: 1px solid rgba(166, 209, 234, 0.34);
          color: #ecf7ff;
        }
        :host([data-card-theme="neo-contrast"]) .timer-modal-panel,
        :host([data-card-theme="neo-contrast"]) .confirm-modal-panel,
        :host([data-card-theme="neo-contrast"]) .guide-modal-panel {
          background:
            radial-gradient(130% 110% at 0% 0%, rgba(0, 209, 255, 0.17) 0%, rgba(0, 209, 255, 0) 50%),
            radial-gradient(120% 100% at 100% 0%, rgba(117, 82, 255, 0.16) 0%, rgba(117, 82, 255, 0) 52%),
            linear-gradient(175deg, rgba(10, 17, 31, 0.99) 0%, rgba(4, 9, 18, 0.99) 100%);
          border: 1px solid rgba(124, 210, 255, 0.3);
          color: #eef8ff;
        }
        :host([data-card-theme="clear-frost"]) .timer-modal-panel,
        :host([data-card-theme="clear-frost"]) .confirm-modal-panel,
        :host([data-card-theme="clear-frost"]) .guide-modal-panel {
          background:
            radial-gradient(130% 110% at 0% 0%, rgba(175, 208, 234, 0.2) 0%, rgba(175, 208, 234, 0) 56%),
            linear-gradient(180deg, rgba(245, 250, 255, 0.84) 0%, rgba(230, 240, 250, 0.78) 100%);
          border: 1px solid rgba(132, 164, 194, 0.45);
          box-shadow:
            0 12px 26px rgba(27, 58, 92, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.68);
          color: #1a3047;
          backdrop-filter: blur(12px);
        }
        :host([data-card-theme="clear-frost"]) .timer-modal-panel,
        :host([data-card-theme="clear-frost"]) .confirm-modal-panel,
        :host([data-card-theme="clear-frost"]) .guide-modal-panel,
        :host([data-card-theme="clear-frost"]) .timer-modal-panel *,
        :host([data-card-theme="clear-frost"]) .confirm-modal-panel *,
        :host([data-card-theme="clear-frost"]) .guide-modal-panel * {
          color: #111111;
          text-shadow: none;
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
        :host([data-card-theme="smart-room-blue"]) .timer-modal-head,
        :host([data-card-theme="smart-room-blue"]) .guide-modal-head,
        :host([data-card-theme="smart-room-blue"]) .tasks-head,
        :host([data-card-theme="smart-room-blue"]) .history-head {
          border-bottom-color: rgba(130, 211, 255, 0.3);
        }
        :host([data-card-theme="midnight-black"]) .timer-modal-head,
        :host([data-card-theme="midnight-black"]) .guide-modal-head,
        :host([data-card-theme="midnight-black"]) .tasks-head,
        :host([data-card-theme="midnight-black"]) .history-head {
          border-bottom-color: rgba(131, 166, 209, 0.28);
        }
        :host([data-card-theme="frost-light"]) .timer-modal-head,
        :host([data-card-theme="frost-light"]) .guide-modal-head,
        :host([data-card-theme="frost-light"]) .tasks-head,
        :host([data-card-theme="frost-light"]) .history-head {
          border-bottom-color: rgba(146, 182, 218, 0.34);
        }
        :host([data-card-theme="clear-frost"]) .timer-modal-head,
        :host([data-card-theme="clear-frost"]) .guide-modal-head,
        :host([data-card-theme="clear-frost"]) .tasks-head,
        :host([data-card-theme="clear-frost"]) .history-head {
          border-bottom-color: rgba(132, 164, 194, 0.42);
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
        :host([data-card-theme="smart-room-blue"]) .timer-modal-title,
        :host([data-card-theme="smart-room-blue"]) .tasks-title,
        :host([data-card-theme="smart-room-blue"]) .confirm-modal-title,
        :host([data-card-theme="smart-room-blue"]) .schedule-label {
          color: #e9f6ff;
        }
        :host([data-card-theme="midnight-black"]) .timer-modal-title,
        :host([data-card-theme="midnight-black"]) .tasks-title,
        :host([data-card-theme="midnight-black"]) .confirm-modal-title,
        :host([data-card-theme="midnight-black"]) .schedule-label {
          color: #edf3ff;
        }
        :host([data-card-theme="frost-light"]) .timer-modal-title,
        :host([data-card-theme="frost-light"]) .tasks-title,
        :host([data-card-theme="frost-light"]) .confirm-modal-title,
        :host([data-card-theme="frost-light"]) .schedule-label {
          color: #10253d;
        }
        :host([data-card-theme="frost-light"]) .smarthome-icon-btn {
          color: #133252;
          border-color: rgba(124, 165, 203, 0.66);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(220, 236, 249, 0.88));
          box-shadow: 0 2px 7px rgba(26, 62, 96, 0.2);
        }
        :host([data-card-theme="frost-light"]) .timer-modal-panel,
        :host([data-card-theme="frost-light"]) .confirm-modal-panel,
        :host([data-card-theme="frost-light"]) .guide-modal-panel {
          text-shadow: none;
        }
        :host([data-card-theme="gallery-neon"]) .timer-modal-title,
        :host([data-card-theme="gallery-neon"]) .tasks-title,
        :host([data-card-theme="gallery-neon"]) .confirm-modal-title,
        :host([data-card-theme="gallery-neon"]) .schedule-label { color: #edf8ff; }
        :host([data-card-theme="slate-ice"]) .timer-modal-title,
        :host([data-card-theme="slate-ice"]) .tasks-title,
        :host([data-card-theme="slate-ice"]) .confirm-modal-title,
        :host([data-card-theme="slate-ice"]) .schedule-label { color: #ecf7ff; }
        :host([data-card-theme="neo-contrast"]) .timer-modal-title,
        :host([data-card-theme="neo-contrast"]) .tasks-title,
        :host([data-card-theme="neo-contrast"]) .confirm-modal-title,
        :host([data-card-theme="neo-contrast"]) .schedule-label { color: #eef8ff; }
        :host([data-card-theme="clear-frost"]) .timer-modal-title,
        :host([data-card-theme="clear-frost"]) .tasks-title,
        :host([data-card-theme="clear-frost"]) .confirm-modal-title,
        :host([data-card-theme="clear-frost"]) .schedule-label { color: #111111; }
        :host([data-card-theme="dark-glass"]) .menu-view .tasks-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.14);
        }
        :host([data-card-theme="amber-glow"]) .menu-view .tasks-card {
          background: rgba(255, 191, 138, 0.06);
          border: 1px solid rgba(255, 190, 130, 0.28);
        }
        :host([data-card-theme="smart-room-blue"]) .menu-view .tasks-card {
          background: rgba(96, 174, 220, 0.08);
          border: 1px solid rgba(122, 198, 236, 0.28);
        }
        :host([data-card-theme="midnight-black"]) .menu-view .tasks-card {
          background: rgba(88, 114, 146, 0.1);
          border: 1px solid rgba(120, 152, 192, 0.26);
        }
        :host([data-card-theme="frost-light"]) .menu-view .tasks-card {
          background: rgba(235, 245, 255, 0.7);
          border: 1px solid rgba(149, 186, 222, 0.34);
        }
        :host([data-card-theme="clear-frost"]) .menu-view .tasks-card {
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(132, 164, 194, 0.38);
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
        :host([data-card-theme="smart-room-blue"]) .timer-modal-panel input,
        :host([data-card-theme="smart-room-blue"]) .timer-modal-panel select,
        :host([data-card-theme="smart-room-blue"]) .timer-modal-panel textarea,
        :host([data-card-theme="smart-room-blue"]) .confirm-modal-panel input,
        :host([data-card-theme="smart-room-blue"]) .confirm-modal-panel select {
          background: rgba(141, 208, 245, 0.1);
          border-color: rgba(130, 206, 246, 0.32);
          color: #e9f6ff;
        }
        :host([data-card-theme="midnight-black"]) .timer-modal-panel input,
        :host([data-card-theme="midnight-black"]) .timer-modal-panel select,
        :host([data-card-theme="midnight-black"]) .timer-modal-panel textarea,
        :host([data-card-theme="midnight-black"]) .confirm-modal-panel input,
        :host([data-card-theme="midnight-black"]) .confirm-modal-panel select {
          background: rgba(100, 130, 166, 0.14);
          border-color: rgba(132, 166, 206, 0.3);
          color: #edf3ff;
        }
        :host([data-card-theme="frost-light"]) .timer-modal-panel input,
        :host([data-card-theme="frost-light"]) .timer-modal-panel select,
        :host([data-card-theme="frost-light"]) .timer-modal-panel textarea,
        :host([data-card-theme="frost-light"]) .confirm-modal-panel input,
        :host([data-card-theme="frost-light"]) .confirm-modal-panel select {
          background: rgba(255, 255, 255, 0.82);
          border-color: rgba(145, 180, 214, 0.48);
          color: #10253d;
        }
        :host([data-card-theme="gallery-neon"]) .timer-modal-panel input,
        :host([data-card-theme="gallery-neon"]) .timer-modal-panel select,
        :host([data-card-theme="gallery-neon"]) .timer-modal-panel textarea,
        :host([data-card-theme="gallery-neon"]) .confirm-modal-panel input,
        :host([data-card-theme="gallery-neon"]) .confirm-modal-panel select {
          background: rgba(111, 185, 255, 0.12);
          border-color: rgba(126, 210, 255, 0.3);
          color: #edf8ff;
        }
        :host([data-card-theme="slate-ice"]) .timer-modal-panel input,
        :host([data-card-theme="slate-ice"]) .timer-modal-panel select,
        :host([data-card-theme="slate-ice"]) .timer-modal-panel textarea,
        :host([data-card-theme="slate-ice"]) .confirm-modal-panel input,
        :host([data-card-theme="slate-ice"]) .confirm-modal-panel select {
          background: rgba(145, 187, 214, 0.14);
          border-color: rgba(166, 209, 234, 0.35);
          color: #ecf7ff;
        }
        :host([data-card-theme="neo-contrast"]) .timer-modal-panel input,
        :host([data-card-theme="neo-contrast"]) .timer-modal-panel select,
        :host([data-card-theme="neo-contrast"]) .timer-modal-panel textarea,
        :host([data-card-theme="neo-contrast"]) .confirm-modal-panel input,
        :host([data-card-theme="neo-contrast"]) .confirm-modal-panel select {
          background: rgba(111, 185, 255, 0.12);
          border-color: rgba(124, 210, 255, 0.3);
          color: #eef8ff;
        }
        :host([data-card-theme="clear-frost"]) .timer-modal-panel input,
        :host([data-card-theme="clear-frost"]) .timer-modal-panel select,
        :host([data-card-theme="clear-frost"]) .timer-modal-panel textarea,
        :host([data-card-theme="clear-frost"]) .confirm-modal-panel input,
        :host([data-card-theme="clear-frost"]) .confirm-modal-panel select {
          background: rgba(255, 255, 255, 0.72);
          border-color: rgba(132, 164, 194, 0.5);
          color: #111111;
        }
        :host([data-card-theme="clear-frost"]) .timer-modal-panel input::placeholder,
        :host([data-card-theme="clear-frost"]) .confirm-modal-panel input::placeholder {
          color: rgba(20, 20, 20, 0.55);
        }
        :host([data-card-theme="dark-glass"]) .timer-modal-panel input::placeholder,
        :host([data-card-theme="dark-glass"]) .confirm-modal-panel input::placeholder {
          color: rgba(226, 238, 255, 0.6);
        }
        :host([data-card-theme="amber-glow"]) .timer-modal-panel input::placeholder,
        :host([data-card-theme="amber-glow"]) .confirm-modal-panel input::placeholder {
          color: rgba(255, 220, 188, 0.62);
        }
        :host([data-card-theme="smart-room-blue"]) .timer-modal-panel input::placeholder,
        :host([data-card-theme="smart-room-blue"]) .confirm-modal-panel input::placeholder {
          color: rgba(188, 226, 246, 0.62);
        }
        :host([data-card-theme="midnight-black"]) .timer-modal-panel input::placeholder,
        :host([data-card-theme="midnight-black"]) .confirm-modal-panel input::placeholder {
          color: rgba(197, 215, 238, 0.58);
        }
        :host([data-card-theme="frost-light"]) .timer-modal-panel input::placeholder,
        :host([data-card-theme="frost-light"]) .confirm-modal-panel input::placeholder {
          color: rgba(57, 92, 127, 0.58);
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
        :host([data-card-theme="smart-room-blue"]) .timer-btn,
        :host([data-card-theme="smart-room-blue"]) .tasks-add-btn,
        :host([data-card-theme="smart-room-blue"]) .tasks-vacation-btn,
        :host([data-card-theme="smart-room-blue"]) .tasks-export-btn,
        :host([data-card-theme="smart-room-blue"]) .tasks-import-btn,
        :host([data-card-theme="smart-room-blue"]) .tasks-mode-btn,
        :host([data-card-theme="smart-room-blue"]) .schedule-type-btn,
        :host([data-card-theme="smart-room-blue"]) .schedule-section-btn,
        :host([data-card-theme="smart-room-blue"]) .schedule-action-btn,
        :host([data-card-theme="smart-room-blue"]) .confirm-action-btn,
        :host([data-card-theme="smart-room-blue"]) .guide-tab-btn {
          background: rgba(141, 208, 245, 0.1);
          color: #e9f6ff;
          border-color: rgba(130, 206, 246, 0.32);
          box-shadow: 0 0 0 1px rgba(24, 162, 236, 0.1);
        }
        :host([data-card-theme="midnight-black"]) .timer-btn,
        :host([data-card-theme="midnight-black"]) .tasks-add-btn,
        :host([data-card-theme="midnight-black"]) .tasks-vacation-btn,
        :host([data-card-theme="midnight-black"]) .tasks-export-btn,
        :host([data-card-theme="midnight-black"]) .tasks-import-btn,
        :host([data-card-theme="midnight-black"]) .tasks-mode-btn,
        :host([data-card-theme="midnight-black"]) .schedule-type-btn,
        :host([data-card-theme="midnight-black"]) .schedule-section-btn,
        :host([data-card-theme="midnight-black"]) .schedule-action-btn,
        :host([data-card-theme="midnight-black"]) .confirm-action-btn,
        :host([data-card-theme="midnight-black"]) .guide-tab-btn {
          background: rgba(102, 130, 166, 0.15);
          color: #edf3ff;
          border-color: rgba(132, 166, 206, 0.3);
          box-shadow: 0 0 0 1px rgba(125, 169, 219, 0.1);
        }
        :host([data-card-theme="frost-light"]) .timer-btn,
        :host([data-card-theme="frost-light"]) .tasks-add-btn,
        :host([data-card-theme="frost-light"]) .tasks-vacation-btn,
        :host([data-card-theme="frost-light"]) .tasks-export-btn,
        :host([data-card-theme="frost-light"]) .tasks-import-btn,
        :host([data-card-theme="frost-light"]) .tasks-mode-btn,
        :host([data-card-theme="frost-light"]) .schedule-type-btn,
        :host([data-card-theme="frost-light"]) .schedule-section-btn,
        :host([data-card-theme="frost-light"]) .schedule-action-btn,
        :host([data-card-theme="frost-light"]) .confirm-action-btn,
        :host([data-card-theme="frost-light"]) .guide-tab-btn {
          background: rgba(255, 255, 255, 0.8);
          color: #133252;
          border-color: rgba(145, 180, 214, 0.46);
          box-shadow: 0 0 0 1px rgba(140, 186, 228, 0.14);
        }
        :host([data-card-theme="clear-frost"]) .timer-btn,
        :host([data-card-theme="clear-frost"]) .tasks-add-btn,
        :host([data-card-theme="clear-frost"]) .tasks-vacation-btn,
        :host([data-card-theme="clear-frost"]) .tasks-export-btn,
        :host([data-card-theme="clear-frost"]) .tasks-import-btn,
        :host([data-card-theme="clear-frost"]) .tasks-mode-btn,
        :host([data-card-theme="clear-frost"]) .schedule-type-btn,
        :host([data-card-theme="clear-frost"]) .schedule-section-btn,
        :host([data-card-theme="clear-frost"]) .schedule-action-btn,
        :host([data-card-theme="clear-frost"]) .confirm-action-btn,
        :host([data-card-theme="clear-frost"]) .guide-tab-btn {
          background: rgba(255, 255, 255, 0.7);
          color: #111111;
          border-color: rgba(132, 164, 194, 0.46);
          box-shadow: none;
        }
        :host([data-card-theme="dark-glass"]) .timer-btn.active,
        :host([data-card-theme="dark-glass"]) .tasks-vacation-btn.active,
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
        :host([data-card-theme="smart-room-blue"]) .timer-btn.active,
        :host([data-card-theme="smart-room-blue"]) .tasks-vacation-btn.active,
        :host([data-card-theme="smart-room-blue"]) .tasks-mode-btn.active,
        :host([data-card-theme="smart-room-blue"]) .schedule-type-btn.active,
        :host([data-card-theme="smart-room-blue"]) .schedule-section-btn.active,
        :host([data-card-theme="smart-room-blue"]) .schedule-action-btn.primary,
        :host([data-card-theme="smart-room-blue"]) .confirm-action-btn.primary,
        :host([data-card-theme="smart-room-blue"]) .guide-tab-btn.active {
          background: linear-gradient(165deg, rgba(0, 212, 255, 0.94), rgba(28, 127, 196, 0.9));
          color: #ffffff;
          border-color: rgba(122, 219, 255, 0.9);
          box-shadow: 0 0 0 1px rgba(65, 194, 251, 0.32), 0 0 14px rgba(49, 180, 241, 0.24);
        }
        :host([data-card-theme="midnight-black"]) .timer-btn.active,
        :host([data-card-theme="midnight-black"]) .tasks-vacation-btn.active,
        :host([data-card-theme="midnight-black"]) .tasks-mode-btn.active,
        :host([data-card-theme="midnight-black"]) .schedule-type-btn.active,
        :host([data-card-theme="midnight-black"]) .schedule-section-btn.active,
        :host([data-card-theme="midnight-black"]) .schedule-action-btn.primary,
        :host([data-card-theme="midnight-black"]) .confirm-action-btn.primary,
        :host([data-card-theme="midnight-black"]) .guide-tab-btn.active {
          background: linear-gradient(165deg, rgba(70, 120, 176, 0.96), rgba(38, 72, 119, 0.92));
          color: #ffffff;
          border-color: rgba(132, 176, 226, 0.9);
          box-shadow: 0 0 0 1px rgba(89, 151, 217, 0.3), 0 0 14px rgba(77, 129, 194, 0.24);
        }
        :host([data-card-theme="frost-light"]) .timer-btn.active,
        :host([data-card-theme="frost-light"]) .tasks-vacation-btn.active,
        :host([data-card-theme="frost-light"]) .tasks-mode-btn.active,
        :host([data-card-theme="frost-light"]) .schedule-type-btn.active,
        :host([data-card-theme="frost-light"]) .schedule-section-btn.active,
        :host([data-card-theme="frost-light"]) .schedule-action-btn.primary,
        :host([data-card-theme="frost-light"]) .confirm-action-btn.primary,
        :host([data-card-theme="frost-light"]) .guide-tab-btn.active {
          background: linear-gradient(165deg, rgba(66, 160, 230, 0.96), rgba(39, 112, 172, 0.92));
          color: #ffffff;
          border-color: rgba(122, 194, 255, 0.9);
          box-shadow: 0 0 0 1px rgba(98, 174, 238, 0.3), 0 0 14px rgba(91, 165, 227, 0.22);
        }
        :host([data-card-theme="gallery-neon"]) .timer-btn.active,
        :host([data-card-theme="gallery-neon"]) .tasks-vacation-btn.active,
        :host([data-card-theme="gallery-neon"]) .tasks-mode-btn.active,
        :host([data-card-theme="gallery-neon"]) .schedule-type-btn.active,
        :host([data-card-theme="gallery-neon"]) .schedule-section-btn.active,
        :host([data-card-theme="gallery-neon"]) .schedule-action-btn.primary,
        :host([data-card-theme="gallery-neon"]) .confirm-action-btn.primary,
        :host([data-card-theme="gallery-neon"]) .guide-tab-btn.active {
          background: linear-gradient(165deg, rgba(0, 195, 255, 0.95), rgba(101, 76, 221, 0.9));
          color: #fff;
        }
        :host([data-card-theme="slate-ice"]) .timer-btn.active,
        :host([data-card-theme="slate-ice"]) .tasks-vacation-btn.active,
        :host([data-card-theme="slate-ice"]) .tasks-mode-btn.active,
        :host([data-card-theme="slate-ice"]) .schedule-type-btn.active,
        :host([data-card-theme="slate-ice"]) .schedule-section-btn.active,
        :host([data-card-theme="slate-ice"]) .schedule-action-btn.primary,
        :host([data-card-theme="slate-ice"]) .confirm-action-btn.primary,
        :host([data-card-theme="slate-ice"]) .guide-tab-btn.active {
          background: linear-gradient(165deg, rgba(117, 186, 218, 0.95), rgba(76, 127, 169, 0.9));
          color: #fff;
        }
        :host([data-card-theme="neo-contrast"]) .timer-btn.active,
        :host([data-card-theme="neo-contrast"]) .tasks-vacation-btn.active,
        :host([data-card-theme="neo-contrast"]) .tasks-mode-btn.active,
        :host([data-card-theme="neo-contrast"]) .schedule-type-btn.active,
        :host([data-card-theme="neo-contrast"]) .schedule-section-btn.active,
        :host([data-card-theme="neo-contrast"]) .schedule-action-btn.primary,
        :host([data-card-theme="neo-contrast"]) .confirm-action-btn.primary,
        :host([data-card-theme="neo-contrast"]) .guide-tab-btn.active {
          background: linear-gradient(165deg, rgba(0, 209, 255, 0.95), rgba(99, 72, 222, 0.9));
          color: #fff;
        }
        :host([data-card-theme="clear-frost"]) .timer-btn.active,
        :host([data-card-theme="clear-frost"]) .tasks-vacation-btn.active,
        :host([data-card-theme="clear-frost"]) .tasks-mode-btn.active,
        :host([data-card-theme="clear-frost"]) .schedule-type-btn.active,
        :host([data-card-theme="clear-frost"]) .schedule-section-btn.active,
        :host([data-card-theme="clear-frost"]) .schedule-action-btn.primary,
        :host([data-card-theme="clear-frost"]) .confirm-action-btn.primary,
        :host([data-card-theme="clear-frost"]) .guide-tab-btn.active {
          background: linear-gradient(165deg, rgba(96, 153, 203, 0.94), rgba(71, 122, 170, 0.9));
          color: #111111;
          border-color: rgba(115, 170, 216, 0.86);
          box-shadow: none;
        }
        :host([data-card-theme="clear-frost"]) .quick-timer-btn,
        :host([data-card-theme="clear-frost"]) .timer-menu-btn {
          background: linear-gradient(165deg, rgba(171, 224, 238, 0.72), rgba(139, 204, 225, 0.66));
          color: #0f2a3d;
          border-color: rgba(104, 170, 196, 0.6);
          box-shadow: none;
          text-shadow: none;
        }
        :host([data-card-theme="clear-frost"]) .quick-timer-btn.selected,
        :host([data-card-theme="clear-frost"]) .timer-menu-btn.selected {
          background: linear-gradient(165deg, rgba(95, 192, 220, 0.9), rgba(72, 166, 197, 0.86));
          color: #0c1f2d;
          border-color: rgba(79, 152, 181, 0.86);
          box-shadow: none;
        }
        :host([data-card-theme="clear-frost"]) .quick-timer-btn.off-action {
          background: linear-gradient(165deg, rgba(196, 236, 245, 0.78), rgba(170, 225, 239, 0.72));
          color: #103145;
          border-color: rgba(120, 182, 202, 0.58);
        }
        :host([data-card-theme="clear-frost"]) .tasks-head,
        :host([data-card-theme="clear-frost"]) .history-head {
          background: linear-gradient(165deg, rgba(188, 232, 244, 0.6), rgba(165, 218, 235, 0.54));
        }
        :host([data-card-theme="clear-frost"]) .history-item,
        :host([data-card-theme="clear-frost"]) .tasks-row,
        :host([data-card-theme="clear-frost"]) .tasks-empty {
          background: rgba(205, 236, 245, 0.36);
          border-color: rgba(123, 183, 204, 0.36);
          color: #111111;
        }
        :host([data-card-theme="clear-frost"]) #history-clear-btn,
        :host([data-card-theme="clear-frost"]) #history-export-btn {
          background: linear-gradient(165deg, rgba(161, 223, 239, 0.84), rgba(130, 203, 224, 0.78)) !important;
          color: #0f2a3d !important;
          border-color: rgba(102, 170, 195, 0.72) !important;
          box-shadow: none !important;
        }
        :host([data-card-theme="dark-glass"]) .tasks-vacation-btn.active:focus,
        :host([data-card-theme="dark-glass"]) .tasks-vacation-btn.active:focus-visible {
          outline: none;
          border-color: rgba(125, 210, 240, 0.86);
          background: linear-gradient(165deg, rgba(102, 190, 224, 0.94), rgba(49, 146, 186, 0.9));
          box-shadow: 0 0 0 2px rgba(120, 212, 255, 0.32);
          color: #ffffff;
        }

`;
}
