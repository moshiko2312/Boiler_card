export function buildBoilerShellHtml({ cardTheme, themeCss }) {
  return `
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
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          background: var(--boiler-bg-a);
          border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(120, 140, 170, 0.25)));
          box-shadow: var(--ha-card-box-shadow, 0 12px 26px rgba(20, 40, 80, 0.1));
          animation: card-enter 260ms ease;
        }

        ${themeCss}
        .wrap {
          display: grid;
          gap: 8px;
          padding: 10px;
          color: var(--boiler-text);
        }

        .row {
          display: block;
        }

        .child-lock-indicator {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 28px;
          height: 28px;
          border-radius: 999px;
          border: 1px solid rgba(255, 210, 120, 0.7);
          background: linear-gradient(180deg, rgba(255, 198, 88, 0.35), rgba(196, 120, 22, 0.32));
          color: #fff7e0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.92rem;
          line-height: 1;
          box-shadow: 0 2px 8px rgba(25, 15, 0, 0.35);
          z-index: 6;
        }

        .child-lock-indicator[hidden] {
          display: none !important;
        }

        .smarthome-top-actions {
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          width: calc(100% - 20px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 7;
        }

        .smarthome-top-actions[hidden] {
          display: none !important;
        }

        .smarthome-icon-btn {
          width: 30px;
          height: 30px;
          border-radius: 999px;
          border: 1px solid rgba(132, 157, 189, 0.6);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.26), rgba(255, 255, 255, 0.12));
          color: var(--boiler-text);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          line-height: 1;
          cursor: pointer;
          box-shadow: 0 2px 7px rgba(20, 30, 48, 0.28);
        }

        :host([data-device-profile="boiler_smarthome4u"]) .smarthome-icon-btn {
          width: 36px;
          height: 36px;
          font-size: 1.02rem;
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
          filter: saturate(1.03) contrast(1.02) brightness(0.96);
          transition: filter 420ms ease;
        }

        :host([data-device-profile="switcher_touch"]) .boiler-main-image {
          object-fit: contain;
          padding: 3px;
          box-sizing: border-box;
          background: rgba(236, 243, 252, 0.14);
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

        .quick-timers.has-overflow {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .smarthome-modal-body {
          display: grid;
          gap: 10px;
          padding: 4px 2px 2px;
        }

        .smarthome-modal-row {
          display: grid;
          gap: 6px;
        }

        .smarthome-modal-row label {
          font-size: 0.84rem;
          font-weight: 700;
          color: var(--boiler-muted);
        }

        .smarthome-modal-row input,
        .smarthome-modal-row select {
          width: 100%;
          border-radius: 10px;
          border: 1px solid rgba(130, 150, 178, 0.45);
          background: rgba(255, 255, 255, 0.74);
          color: var(--boiler-text);
          padding: 10px 11px;
          font-size: 0.92rem;
          box-sizing: border-box;
        }

        .smarthome-modal-actions {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 4px;
        }

        .smarthome-modal-btn {
          border: 1px solid rgba(120, 145, 178, 0.45);
          border-radius: 10px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.26), rgba(255, 255, 255, 0.12));
          color: var(--boiler-text);
          font-size: 0.84rem;
          font-weight: 700;
          padding: 8px 11px;
          cursor: pointer;
        }

        #smarthome-boost-modal .timer-modal-head,
        #smarthome-settings-modal .timer-modal-head {
          border: 1px solid rgba(120, 145, 178, 0.45);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.26), rgba(255, 255, 255, 0.12));
          box-shadow: none;
        }

        #smarthome-boost-modal .timer-modal-head,
        #smarthome-settings-modal .timer-modal-head {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        #smarthome-boost-modal .timer-modal-title,
        #smarthome-settings-modal .timer-modal-title {
          text-align: center;
          width: auto;
          min-height: 0;
          padding: 0;
        }

        .boost-digital {
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr) 42px;
          gap: 8px;
          align-items: center;
        }

        .boost-step-btn {
          min-height: 44px;
          border-radius: 10px;
          border: 1px solid rgba(122, 146, 179, 0.5);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.16));
          color: var(--boiler-text);
          font-size: 1.1rem;
          font-weight: 900;
          cursor: pointer;
        }

        .settings-icon-grid {
          display: grid;
          gap: 6px;
        }

        .settings-icon-row {
          display: grid;
          grid-template-columns: 44px minmax(0, 1fr);
          gap: 8px;
          align-items: center;
        }

        .settings-icon-chip {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: 1px solid rgba(124, 147, 176, 0.56);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.12));
          color: var(--boiler-text);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1.05rem;
          cursor: pointer;
        }

        .settings-icon-chip[data-active="true"] {
          border-color: rgba(102, 192, 255, 0.9);
          box-shadow: 0 0 0 2px rgba(90, 178, 236, 0.22) inset;
        }

        .settings-icon-chip[data-power-state] {
          color: rgba(208, 220, 236, 0.72);
        }

        .settings-icon-chip[data-active="true"][data-power-state="on"] {
          color: rgba(96, 208, 140, 0.95);
        }

        .settings-icon-chip[data-active="true"][data-power-state="previous"] {
          color: rgba(237, 187, 92, 0.95);
        }

        .settings-icon-chip[data-active="true"][data-power-state="off"] {
          color: rgba(232, 113, 113, 0.95);
        }

        .settings-power-options {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 4px;
        }

        .settings-power-options .settings-icon-chip {
          width: 42px;
          height: 42px;
          margin-inline: auto;
          position: relative;
        }

        #smarthome-power-on-label {
          text-align: center;
        }

        #smarthome-settings-modal-panel {
          width: min(340px, calc(100vw - 24px));
          max-height: min(68dvh, 390px);
          padding: 12px;
        }

        #smarthome-settings-modal .smarthome-modal-body {
          gap: 8px;
        }

        #smarthome-settings-modal .smarthome-modal-actions {
          margin-top: 2px;
        }

        #smarthome-boost-modal-panel {
          width: min(360px, calc(100vw - 26px));
          max-height: min(64dvh, 360px);
          padding: 12px;
        }

        #smarthome-boost-modal .smarthome-modal-body {
          gap: 8px;
        }

        #smarthome-boost-modal .smarthome-modal-row {
          max-width: 290px;
          margin: 0 auto;
        }

        #smarthome-boost-modal-label {
          text-align: center;
        }

        #smarthome-boost-modal-input {
          text-align: center;
          font-weight: 800;
          letter-spacing: 0.02em;
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

        .quick-timers.has-overflow .quick-timer-btn.off-action {
          grid-column: 1 / -1;
          min-height: 40px;
          font-size: 0.9rem;
          font-weight: 900;
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
          color: #1b1103;
          text-shadow: none;
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
          width: 40px;
          height: 40px;
          padding: 0;
          gap: 0;
          border: 1px solid rgba(180, 196, 217, 0.72);
          border-radius: 12px;
          background: linear-gradient(165deg, rgba(248, 252, 255, 0.95), rgba(227, 237, 247, 0.92));
          color: #8b2f2f;
          box-shadow:
            0 2px 6px rgba(16, 30, 50, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.62);
        }

        .history-export-btn svg {
          width: 22px;
          height: 22px;
          flex-shrink: 0;
          fill: currentColor;
        }

        .history-export-btn #history-export-label {
          display: none;
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
            165deg,
            rgba(20, 34, 56, 0.6),
            rgba(13, 25, 44, 0.72)
          );
          border: 1px solid rgba(160, 188, 218, 0.26);
          border-radius: 14px;
          backdrop-filter: blur(12px) saturate(128%);
          -webkit-backdrop-filter: blur(12px) saturate(128%);
          box-shadow:
            0 -8px 24px rgba(10, 20, 36, 0.32),
            inset 0 1px 0 rgba(226, 242, 255, 0.14);
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
          max-height: min(78dvh, 590px);
          overflow: auto;
          overflow-x: hidden;
          border-radius: 18px;
          border: 1px solid rgba(80, 108, 140, 0.25);
          background: var(--ha-card-background, var(--card-background-color, #ffffff));
          box-shadow: 0 26px 60px rgba(14, 27, 51, 0.35);
          padding: 12px;
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
          align-items: center;
          justify-content: center;
          padding: 10px;
        }

        .timer-modal-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          grid-template-areas:
            "title"
            "toggle"
            "actions";
          align-items: center;
          gap: 5px;
          margin: 0 0 4px;
          position: sticky;
          top: 0;
          z-index: 6;
          background: linear-gradient(
            165deg,
            rgba(63, 74, 93, 0.98),
            rgba(55, 66, 85, 0.96)
          );
          border-radius: 10px;
          padding: 2px 6px 2px;
          box-shadow: 0 2px 10px rgba(14, 27, 51, 0.24);
        }

        .timer-modal-title {
          grid-area: title;
          margin: 0;
          font-size: 1rem;
          color: var(--boiler-text);
          display: flex;
          align-items: center;
          min-height: 26px;
          min-width: 0;
          width: 100%;
          justify-content: center;
          text-align: center;
          padding-left: 0;
          padding-right: 0;
          max-width: calc(100% - 132px);
          margin-inline: auto;
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
          row-gap: 4px;
          margin-bottom: 4px;
          padding-top: 30px;
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
          row-gap: 4px;
          margin-bottom: 4px;
          padding-top: 30px;
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
          width: 38px;
          height: 38px;
          font-size: 1.2rem;
        }

        .timer-page-indicator {
          min-width: 48px;
          text-align: center;
          font-size: 0.96rem;
          color: var(--boiler-muted);
          font-weight: 700;
        }

        .timer-close-btn {
          width: 38px;
          height: 38px;
          font-size: 1rem;
        }

        #timer-close-btn,
        #schedule-close-btn,
        #smarthome-boost-modal-close-btn,
        #smarthome-settings-modal-close-btn {
          position: absolute;
          left: 6px;
          top: 5px;
          z-index: 9;
        }

        #guide-modal-close-btn {
          position: absolute;
          left: 6px;
          top: 2px;
          z-index: 9;
          width: 34px;
          height: 34px;
          font-size: 0.95rem;
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
          text-align: center;
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
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 0;
          width: 100%;
          flex: 1 1 auto;
          padding: 0;
          text-align: center;
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
          top: 6px;
          transform: none;
          z-index: 9;
        }

        #timer-guide-btn {
          position: absolute;
          left: 60px;
          top: 6px;
          transform: none;
          z-index: 9;
          font-size: 1rem;
        }

        #timer-history-btn {
          position: absolute;
          left: 112px;
          top: 6px;
          transform: none;
          z-index: 9;
          font-size: 1rem;
        }

        #timer-close-btn,
        #timer-guide-btn,
        #timer-history-btn {
          width: 36px;
          height: 36px;
          font-size: 0.92rem;
        }

        #timer-close-btn {
          font-size: 0.92rem;
          font-weight: 700;
        }

        .timer-icon-svg {
          width: 18px;
          height: 18px;
          display: block;
          fill: currentColor;
        }

        .timer-icon-glyph {
          display: block;
          font-size: 1rem;
          line-height: 1;
          font-weight: 700;
        }

        #timer-history-btn.active {
          border-color: rgba(180, 196, 217, 0.72);
          background: linear-gradient(165deg, rgba(248, 252, 255, 0.95), rgba(227, 237, 247, 0.92));
          color: #8b2f2f;
          text-shadow: none;
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
          font-size: 1.06rem;
          font-weight: 800;
          color: #ffffff;
          text-align: center;
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
          justify-content: center;
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

        .guide-profile-grid {
          display: grid;
          gap: 8px;
          margin: 0 0 10px;
        }

        .guide-profile-card {
          display: grid;
          grid-template-columns: 46px minmax(0, 1fr);
          gap: 8px;
          align-items: center;
          padding: 8px;
          border-radius: 10px;
          border: 1px solid rgba(166, 189, 216, 0.38);
          background: rgba(255, 255, 255, 0.05);
        }

        .guide-profile-thumb {
          width: 46px;
          height: 46px;
          border-radius: 999px;
          overflow: hidden;
          border: 1px solid rgba(188, 208, 234, 0.45);
          background: rgba(10, 26, 43, 0.3);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .guide-profile-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .guide-profile-title {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 800;
          line-height: 1.2;
          color: #f5f9ff;
        }

        .guide-profile-desc {
          margin: 2px 0 0;
          font-size: 0.78rem;
          line-height: 1.3;
          color: #d4e1f3;
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
          .title {
            font-size: clamp(1rem, 2.8vw, 1.14rem);
          }

          .subtitle {
            font-size: 0.9rem;
          }

          .menu-mode-btn {
            min-height: 46px;
            font-size: 0.96rem;
          }

          .quick-timer-btn {
            min-height: 42px;
            font-size: 0.86rem;
          }

          .timer-option-btn {
            min-height: 48px;
            font-size: 0.96rem;
          }

          .tasks-title {
            font-size: 0.95rem;
          }

          .tasks-mode-btn,
          .tasks-import-btn,
          .tasks-export-btn,
          .tasks-add-btn,
          .tasks-vacation-btn {
            font-size: 0.9rem;
          }

          .schedule-label {
            font-size: 0.86rem;
          }

          .schedule-action-btn {
            font-size: 0.98rem;
          }

          .confirm-action-btn {
            font-size: 0.96rem;
          }

          .guide-tab-btn {
            min-height: 42px;
            font-size: 0.9rem;
          }

          .child-lock-indicator {
            top: 8px;
            right: 8px;
            width: 26px;
            height: 26px;
            font-size: 0.84rem;
          }

          .smarthome-top-actions {
            top: 8px;
            left: 8px;
          }

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

          .quick-timers.has-overflow {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .smarthome-modal-row input,
          .smarthome-modal-row select,
          .smarthome-modal-btn {
            min-height: 44px;
            font-size: 16px;
          }

          .sensors-row {
            grid-template-columns: repeat(var(--sensor-columns, 3), minmax(0, 1fr));
          }

          .timer-modal {
            align-items: flex-end;
            padding: 6px;
          }

          #timer-modal {
            align-items: center;
            justify-content: center;
            padding: 8px;
          }

          #schedule-modal {
            align-items: center;
            justify-content: center;
            padding: 10px;
          }

          #smarthome-boost-modal {
            align-items: center;
            justify-content: center;
            padding: 10px;
          }

          #smarthome-boost-modal-panel {
            width: min(330px, calc(100vw - 22px));
            max-height: min(66dvh, 350px);
            padding: 10px;
          }

          #smarthome-settings-modal {
            align-items: center;
            justify-content: center;
            padding: 10px;
          }

          #smarthome-settings-modal-panel {
            width: min(320px, calc(100vw - 20px));
            max-height: min(70dvh, 380px);
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
            max-height: min(78dvh, 640px);
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
            padding: 5px 8px 6px;
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
            padding-left: 42px;
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
            row-gap: 4px;
            margin-bottom: 4px;
            padding-top: 36px;
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
          .child-lock-indicator {
            top: 7px;
            right: 7px;
            width: 24px;
            height: 24px;
            font-size: 0.8rem;
          }

          :host([data-device-profile="boiler_smarthome4u"]) .child-lock-indicator {
            right: 58px;
          }

          .smarthome-top-actions {
            top: 7px;
            left: 7px;
            right: 7px;
            width: calc(100% - 14px);
          }

          .smarthome-icon-btn {
            width: 28px;
            height: 28px;
            font-size: 0.86rem;
          }

          :host([data-device-profile="boiler_smarthome4u"]) .smarthome-icon-btn {
            width: 34px;
            height: 34px;
            font-size: 0.98rem;
          }

          #smarthome-boost-modal-panel {
            width: min(310px, calc(100vw - 18px));
            max-height: min(70dvh, 340px);
            padding: 10px 8px;
          }

          :host([data-device-profile="boiler_smarthome4u"]) #smarthome-boost-modal-panel {
            width: min(350px, calc(100vw - 14px));
            max-height: min(76dvh, 430px);
            padding: 12px 10px;
          }

          #smarthome-settings-modal-panel {
            width: min(300px, calc(100vw - 16px));
            max-height: min(74dvh, 360px);
            padding: 10px 8px;
          }

          :host([data-device-profile="boiler_smarthome4u"]) #smarthome-settings-modal-panel {
            width: min(342px, calc(100vw - 14px));
            max-height: min(78dvh, 450px);
            padding: 12px 10px;
          }

          #smarthome-boost-modal .smarthome-modal-row {
            max-width: 270px;
          }

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

          #timer-close-btn,
          #timer-guide-btn,
          #timer-history-btn {
            font-size: 1rem;
          }

          #timer-close-btn {
            font-size: 0.9rem;
          }

          .quick-timers {
            grid-template-columns: repeat(auto-fit, minmax(76px, 1fr));
            gap: 5px;
          }

          .quick-timers.has-overflow {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .settings-icon-chip {
            width: 42px;
            height: 42px;
          }

          .settings-power-options {
            gap: 2px;
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
        <span class="child-lock-indicator" id="child-lock-indicator" hidden title="Child lock">🔒</span>
        <div class="smarthome-top-actions" id="smarthome-top-actions" hidden>
          <button type="button" class="smarthome-icon-btn" id="smarthome-boost-btn" aria-label="Boost time">⏱</button>
          <button type="button" class="smarthome-icon-btn" id="smarthome-settings-btn" aria-label="Settings">⚙</button>
        </div>
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
              <button type="button" class="timer-close-btn" id="timer-history-btn" aria-label="History">
                <svg class="timer-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c5.24 0 9.53 3.48 11 7-1.47 3.52-5.76 7-11 7S2.47 15.52 1 12c1.47-3.52 5.76-7 11-7zm0 2c-4.11 0-7.62 2.51-9.17 5 1.55 2.49 5.06 5 9.17 5s7.62-2.51 9.17-5C19.62 9.51 16.11 7 12 7zm0 2.5A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5z"/></svg>
              </button>
              <button type="button" class="timer-close-btn" id="timer-guide-btn" aria-label="Guide">
                <span class="timer-icon-glyph" aria-hidden="true">ℹ</span>
              </button>
              <button type="button" class="timer-close-btn" id="timer-close-btn" aria-label="Close">
                <svg class="timer-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.41L10.59 13.4 4.29 19.7 2.88 18.29 9.17 12 2.88 5.71 4.29 4.3l6.3 6.29 6.29-6.3z"/></svg>
              </button>
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

      <div class="timer-modal" id="smarthome-boost-modal" hidden>
        <div class="timer-modal-backdrop" id="smarthome-boost-modal-backdrop"></div>
        <div class="timer-modal-panel" id="smarthome-boost-modal-panel" role="dialog" aria-modal="true" aria-label="Boost time">
          <div class="timer-modal-head">
            <h3 class="timer-modal-title" id="smarthome-boost-modal-title">Boost time</h3>
          </div>
          <div class="smarthome-modal-body">
            <div class="smarthome-modal-row">
              <label for="smarthome-boost-modal-input" id="smarthome-boost-modal-label">Minutes</label>
              <div class="boost-digital">
                <button type="button" class="boost-step-btn" id="smarthome-boost-down-btn" aria-label="Decrease">▼</button>
                <input id="smarthome-boost-modal-input" type="number" min="1" step="1" />
                <button type="button" class="boost-step-btn" id="smarthome-boost-up-btn" aria-label="Increase">▲</button>
              </div>
            </div>
            <div class="smarthome-modal-actions">
              <button type="button" class="smarthome-modal-btn" id="smarthome-boost-modal-cancel-btn">Cancel</button>
              <button type="button" class="smarthome-modal-btn" id="smarthome-boost-modal-save-btn">Save</button>
            </div>
          </div>
        </div>
      </div>

      <div class="timer-modal" id="smarthome-settings-modal" hidden>
        <div class="timer-modal-backdrop" id="smarthome-settings-modal-backdrop"></div>
        <div class="timer-modal-panel" id="smarthome-settings-modal-panel" role="dialog" aria-modal="true" aria-label="Switch settings">
          <div class="timer-modal-head">
            <h3 class="timer-modal-title" id="smarthome-settings-modal-title">Switch settings</h3>
          </div>
          <div class="smarthome-modal-body">
            <div class="settings-icon-grid">
              <div class="settings-icon-row">
                <button type="button" class="settings-icon-chip" id="smarthome-backlight-toggle-btn" aria-label="Backlight mode">💡</button>
                <label id="smarthome-backlight-label">Backlight mode</label>
                <input id="smarthome-backlight-select" type="hidden" value="off" />
              </div>
              <div class="settings-icon-row">
                <button type="button" class="settings-icon-chip" id="smarthome-child-lock-toggle-btn" aria-label="Child lock">🔒</button>
                <label id="smarthome-child-lock-label">Child lock</label>
                <input id="smarthome-child-lock-select" type="hidden" value="off" />
              </div>
              <div class="smarthome-modal-row">
                <label id="smarthome-power-on-label">Power-on behavior</label>
                <div class="settings-power-options" id="smarthome-power-on-options"></div>
                <input id="smarthome-power-on-select" type="hidden" value="off" />
              </div>
            </div>
            <div class="smarthome-modal-actions">
              <button type="button" class="smarthome-modal-btn" id="smarthome-settings-modal-cancel-btn">Cancel</button>
              <button type="button" class="smarthome-modal-btn" id="smarthome-settings-modal-save-btn">Save</button>
            </div>
          </div>
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
              <div class="guide-profile-grid" id="guide-profile-grid"></div>
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
}
