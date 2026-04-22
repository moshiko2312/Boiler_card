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
    timer_prev_page: "עמוד קודם",
    timer_next_page: "עמוד הבא",
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
    minutes_short: "דק׳",
    hours_short: "ש׳",
    tasks_title: "משימות",
    tasks_add: "הוספה",
    tasks_empty: "אין משימות",
    task_name: "שם משימה",
    task_start: "התחלה",
    task_end: "סיום",
    task_days: "ימים",
    task_cancel: "ביטול",
    task_save: "שמירה",
    task_delete: "מחיקה",
    task_enabled: "פעיל",
    task_disabled: "כבוי",
    task_edit: "עריכה",
    menu_timers: "טיימר",
    menu_tasks: "משימות",
    recurrence_label: "מחזוריות",
    recurrence_forever: "קבוע",
    recurrence_once: "פעם אחת (מחיקה אוטומטית)",
    recurrence_range: "טווח תאריכים",
    date_start: "מתאריך",
    date_end: "עד תאריך",
    months_label: "חודשים",
    task_add_title: "הוספת משימה",
    task_edit_title: "עריכת משימה",
    task_type: "סוג",
    task_type_window: "חלון זמן",
    task_type_timeline: "טיים ליין",
    timeline_points: "נקודות זמן",
    timeline_add_point: "הוסף נקודה",
    timeline_remove_point: "הסר",
    timeline_time: "שעה",
    timeline_timer: "טיימר",
    upcoming_task_starts_in: "מתחיל בעוד",
    sensor_temperature: "טמפרטורה",
    sensor_current: "זרם",
    sensor_voltage: "מתח",
    sensor_unavailable: "לא זמין",
    day_mon: "ב׳",
    day_tue: "ג׳",
    day_wed: "ד׳",
    day_thu: "ה׳",
    day_fri: "ו׳",
    day_sat: "ש׳",
    day_sun: "א׳",
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
    timer_prev_page: "Previous page",
    timer_next_page: "Next page",
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
    tasks_title: "Tasks",
    tasks_add: "Add",
    tasks_empty: "No tasks yet",
    task_name: "Task Name",
    task_start: "Start",
    task_end: "End",
    task_days: "Days",
    task_cancel: "Cancel",
    task_save: "Save",
    task_delete: "Delete",
    task_enabled: "Enabled",
    task_disabled: "Disabled",
    task_edit: "Edit",
    menu_timers: "Timer",
    menu_tasks: "Tasks",
    recurrence_label: "Recurrence",
    recurrence_forever: "Forever",
    recurrence_once: "One Time (auto delete)",
    recurrence_range: "Date Range",
    date_start: "From Date",
    date_end: "To Date",
    months_label: "Months",
    task_add_title: "Add Task",
    task_edit_title: "Edit Task",
    task_type: "Type",
    task_type_window: "Time Window",
    task_type_timeline: "Timeline",
    timeline_points: "Timeline Points",
    timeline_add_point: "Add Point",
    timeline_remove_point: "Remove",
    timeline_time: "Time",
    timeline_timer: "Timer",
    upcoming_task_starts_in: "Starts in",
    sensor_temperature: "Temperature",
    sensor_current: "Current",
    sensor_voltage: "Voltage",
    sensor_unavailable: "Unavailable",
    day_mon: "Mon",
    day_tue: "Tue",
    day_wed: "Wed",
    day_thu: "Thu",
    day_fri: "Fri",
    day_sat: "Sat",
    day_sun: "Sun",
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
    timer_prev_page: "Предыдущая страница",
    timer_next_page: "Следующая страница",
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
    tasks_title: "Задачи",
    tasks_add: "Добавить",
    tasks_empty: "Задач пока нет",
    task_name: "Название задачи",
    task_start: "Начало",
    task_end: "Окончание",
    task_days: "Дни",
    task_cancel: "Отмена",
    task_save: "Сохранить",
    task_delete: "Удалить",
    task_enabled: "Включено",
    task_disabled: "Выключено",
    task_edit: "Изменить",
    menu_timers: "Таймер",
    menu_tasks: "Задачи",
    recurrence_label: "Повтор",
    recurrence_forever: "Постоянно",
    recurrence_once: "Один раз (автоудаление)",
    recurrence_range: "Период дат",
    date_start: "С даты",
    date_end: "По дату",
    months_label: "Месяцы",
    task_add_title: "Добавить задачу",
    task_edit_title: "Изменить задачу",
    task_type: "Тип",
    task_type_window: "Временное окно",
    task_type_timeline: "Таймлайн",
    timeline_points: "Точки таймлайна",
    timeline_add_point: "Добавить точку",
    timeline_remove_point: "Удалить",
    timeline_time: "Время",
    timeline_timer: "Таймер",
    upcoming_task_starts_in: "Запуск через",
    sensor_temperature: "Температура",
    sensor_current: "Ток",
    sensor_voltage: "Напряжение",
    sensor_unavailable: "Недоступно",
    day_mon: "Пн",
    day_tue: "Вт",
    day_wed: "Ср",
    day_thu: "Чт",
    day_fri: "Пт",
    day_sat: "Сб",
    day_sun: "Вс",
  },
};

const DEFAULT_CONFIG = {
  title: "דוד מים חמים",
  language: "he",
  boiler_entity: "switch.boiler",
  temperature_sensor: "",
  temperature_sensor_name: "",
  current_sensor: "",
  current_sensor_name: "",
  voltage_sensor: "",
  voltage_sensor_name: "",
  boiler_flow_image: "/local/boiler-card/boiler-flow.png",
  duration_entity: "input_select.boiler_duration",
  timer_entity: "timer.boiler_runtime",
  script_on_timed: "script.boiler_turn_on_timed",
  script_on_continuous: "script.boiler_turn_on_continuous",
  script_off: "script.boiler_turn_off",
  integration_entry_id: "",
  service_run_timed: "boiler_manager.run_timed",
  service_on_continuous: "boiler_manager.turn_on_continuous",
  service_off: "boiler_manager.turn_off",
  service_create_schedule: "boiler_manager.create_schedule",
  service_create_timeline: "boiler_manager.create_timeline",
  service_update_schedule: "boiler_manager.update_schedule",
  service_delete_schedule: "boiler_manager.delete_schedule",
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
    this._timerPageIndex = 0;
    this._timerPageSize = 6;
    this._timerGridRenderKey = "";
    this._tasksListRenderKey = "";
    this._menuMode = "timer";
    this._schedulePanel = "recurrence";
    this._editingTaskId = null;
    this._offPendingUntil = 0;
    this._handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        this._closeTimerModal();
        this._closeScheduleModal();
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
    this._timerGridRenderKey = "";
    this._tasksListRenderKey = "";
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
        }

        .countdown-value.continuous-active {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 2.3ch;
          padding: 2px 10px;
          border-radius: 999px;
          border: 1px solid rgba(171, 233, 255, 0.88);
          background: linear-gradient(165deg, rgba(72, 177, 221, 0.92), rgba(35, 130, 180, 0.88));
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(8, 34, 55, 0.5);
          box-shadow:
            0 5px 12px rgba(23, 97, 133, 0.34),
            inset 0 1px 0 rgba(255, 255, 255, 0.35);
          animation: continuous-badge-pulse 1.9s ease-in-out infinite;
        }

        .boiler-progress-row .timer-menu-btn {
          grid-area: menu;
          align-self: center;
        }

        .quick-timers {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 6px;
        }

        .sensors-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-bottom: 2px;
        }

        .sensor-pill {
          border: 0;
          border-radius: 0;
          background: transparent;
          padding: 0;
          display: inline-flex;
          align-items: center;
          gap: 0;
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
        }

        .tasks-title {
          margin: 0;
          font-size: 0.84rem;
          font-weight: 700;
          color: #edf4ff;
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

        .tasks-add-btn:hover {
          filter: brightness(1.05);
        }

        .tasks-add-btn[disabled] {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .tasks-list {
          display: grid;
          gap: 6px;
          min-width: 0;
          overflow-x: hidden;
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
          display: inline-flex;
          align-items: center;
          gap: 6px;
          max-width: 100%;
          flex-wrap: wrap;
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
        .tasks-add-btn:focus-visible {
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
          padding-bottom: calc(86px + env(safe-area-inset-bottom, 0px));
          box-sizing: border-box;
        }

        .schedule-field {
          display: grid;
          gap: 4px;
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

        .schedule-type-toggle {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px;
          min-width: 0;
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
          min-height: 38px;
          padding: 7px 10px;
          background: rgba(245, 251, 255, 0.88);
          color: #23435f;
          font-size: 0.82rem;
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

        .schedule-window-fields[hidden],
        .schedule-timeline-fields[hidden],
        .schedule-date-row[hidden] {
          display: none;
        }

        .schedule-section-panel[hidden] {
          display: none;
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
          margin-top: 6px;
          position: sticky;
          bottom: 0;
          z-index: 4;
          background: linear-gradient(
            180deg,
            rgba(19, 25, 41, 0),
            rgba(19, 25, 41, 0.22) 28%,
            rgba(19, 25, 41, 0.32)
          );
          padding-top: 10px;
          padding-bottom: max(10px, env(safe-area-inset-bottom, 0px));
          box-sizing: border-box;
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
          overflow-x: hidden;
        }

        .timer-modal button,
        .timer-modal input,
        .timer-modal select {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
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

        .timer-modal-actions {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-inline-start: auto;
        }

        .menu-mode-toggle {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(165deg, rgba(114, 130, 156, 0.84), rgba(84, 99, 123, 0.78));
          border: 1px solid rgba(176, 197, 223, 0.6);
          border-radius: 14px;
          padding: 4px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.24);
        }

        .menu-mode-btn {
          border: 1px solid rgba(172, 197, 223, 0.55);
          border-radius: 10px;
          min-height: 42px;
          min-width: 110px;
          padding: 8px 16px;
          font-size: 1rem;
          font-weight: 800;
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
          grid-template-columns: repeat(3, minmax(110px, 1fr));
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
          margin-inline-end: auto;
        }

        @media (max-width: 760px) {
          .boiler-visual {
            grid-template-columns: minmax(92px, 26vw) minmax(0, 1fr);
            gap: 10px;
            text-align: initial;
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
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 6px;
          }

          .sensors-row {
            grid-template-columns: minmax(0, 1fr);
          }

          .timer-modal {
            align-items: flex-end;
            padding: 6px;
          }

          #timer-modal {
            align-items: center;
            padding: 8px;
          }

          #schedule-modal {
            align-items: flex-end;
            padding: 6px;
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

          .timer-modal-head {
            position: sticky;
            top: 0;
            background: var(--ha-card-background, var(--card-background-color, #ffffff));
            z-index: 1;
            padding-bottom: 6px;
            flex-wrap: wrap;
            row-gap: 8px;
          }

          .timer-modal-title {
            flex: 1 1 auto;
          }

          .menu-mode-toggle {
            flex: 1 1 100%;
            justify-content: stretch;
          }

          .menu-mode-btn {
            flex: 1 1 0;
            min-width: 0;
          }

          .timer-modal-actions {
            width: 100%;
            margin-inline-start: 0;
            justify-content: space-between;
          }

          .timer-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .schedule-time-row {
            grid-template-columns: minmax(0, 1fr);
          }

          .schedule-type-toggle {
            grid-template-columns: minmax(0, 1fr);
          }

          .schedule-section-switch {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .schedule-section-btn {
            min-height: 40px;
            font-size: 0.86rem;
          }

          .timeline-point-row {
            grid-template-columns: minmax(0, 1fr);
            gap: 8px;
          }

          .timeline-point-remove {
            grid-column: auto;
            width: 100%;
          }

          .schedule-days {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .schedule-months {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .schedule-action-btn {
            min-height: 42px;
          }

          .schedule-input,
          .schedule-select,
          .schedule-type-btn,
          .timeline-point-add {
            min-height: 44px;
            font-size: 16px;
          }

          .timeline-point-time,
          .timeline-point-duration {
            min-height: 46px;
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
            width: min(48%, 220px);
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
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .timeline-point-row {
            grid-template-columns: minmax(0, 1fr);
            gap: 8px;
          }

          .timeline-point-remove {
            grid-column: auto;
            width: 100%;
          }

          #schedule-modal-panel {
            width: calc(100vw - 10px);
            max-height: min(90dvh, 860px);
            padding: 12px 10px calc(14px + env(safe-area-inset-bottom, 0px));
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

          .schedule-days,
          .schedule-months {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 6px;
          }

          .schedule-form {
            padding-bottom: calc(98px + env(safe-area-inset-bottom, 0px));
          }

          .schedule-modal-actions {
            gap: 8px;
          }

          .schedule-action-btn {
            width: min(49%, 180px);
            min-width: 0;
            min-height: 52px;
            font-size: 0.92rem;
            padding: 8px 10px;
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
            grid-template-columns: repeat(4, minmax(0, 1fr));
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

        @keyframes continuous-badge-pulse {
          0%, 100% {
            box-shadow:
              0 5px 12px rgba(23, 97, 133, 0.34),
              inset 0 1px 0 rgba(255, 255, 255, 0.35);
          }
          50% {
            box-shadow:
              0 7px 16px rgba(23, 97, 133, 0.42),
              0 0 0 4px rgba(75, 177, 224, 0.18),
              inset 0 1px 0 rgba(255, 255, 255, 0.45);
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
              <p class="upcoming-task-notice" id="upcoming-task-notice" hidden></p>
              <div class="sensors-row" id="sensors-row" hidden></div>
              <div class="boiler-progress-row">
                <p class="boiler-stage-sub" id="boiler-stage-sub">0% warmed</p>
                <div class="boiler-progress-track">
                  <div class="boiler-progress-fill" id="boiler-progress-fill"></div>
                </div>
                <span class="countdown-value" id="countdown-value">--:--</span>
                <span class="countdown-label" id="countdown-label">Remaining</span>
                <button type="button" class="timer-menu-btn" id="timer-menu-btn" aria-label="Timer menu">☰</button>
              </div>
            </div>
          </div>

          <div class="quick-timers" id="quick-timers">
            <button type="button" class="quick-timer-btn" data-minutes="15">15</button>
            <button type="button" class="quick-timer-btn" data-minutes="30">30</button>
            <button type="button" class="quick-timer-btn" data-minutes="60">60</button>
            <button type="button" class="quick-timer-btn off-action" id="quick-off-btn" data-action="off">Off</button>
          </div>

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
            </div>
            <div class="timer-modal-actions">
              <div class="timer-page-controls" id="timer-page-controls">
                <button type="button" class="timer-page-btn" id="timer-page-prev-btn" aria-label="Previous page">‹</button>
                <span class="timer-page-indicator" id="timer-page-indicator">1 / 1</span>
                <button type="button" class="timer-page-btn" id="timer-page-next-btn" aria-label="Next page">›</button>
              </div>
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
                <button type="button" class="tasks-add-btn" id="tasks-add-btn">Add</button>
              </div>
              <div class="tasks-list" id="tasks-list"></div>
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
            <div class="schedule-field">
              <label class="schedule-label" for="schedule-name-input" id="schedule-name-label">Task Name</label>
              <input class="schedule-input" id="schedule-name-input" type="text" maxlength="80" />
            </div>
            <div class="schedule-field">
              <label class="schedule-label" id="schedule-type-label">Type</label>
              <div class="schedule-type-toggle" id="schedule-type-toggle">
                <button type="button" class="schedule-type-btn" id="schedule-type-window-btn" data-type="window">Time Window</button>
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
                  <input class="schedule-input" id="schedule-start-input" type="time" />
                </div>
                <div class="schedule-field">
                  <label class="schedule-label" for="schedule-end-input" id="schedule-end-label">End</label>
                  <input class="schedule-input" id="schedule-end-input" type="time" />
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
                  <input class="schedule-input" id="schedule-start-date-input" type="date" />
                </div>
                <div class="schedule-field">
                  <label class="schedule-label" for="schedule-end-date-input" id="schedule-date-end-label">To Date</label>
                  <input class="schedule-input" id="schedule-end-date-input" type="date" />
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
            <div class="schedule-modal-actions">
              <button type="button" class="schedule-action-btn" id="schedule-cancel-btn">Cancel</button>
              <button type="submit" class="schedule-action-btn primary" id="schedule-save-btn">Save</button>
            </div>
          </form>
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
      boilerStageSub: this.shadowRoot.getElementById("boiler-stage-sub"),
      boilerProgressFill: this.shadowRoot.getElementById("boiler-progress-fill"),
      countdownLabel: this.shadowRoot.getElementById("countdown-label"),
      countdownValue: this.shadowRoot.getElementById("countdown-value"),
      sensorsRow: this.shadowRoot.getElementById("sensors-row"),
      quickTimerBtns: Array.from(this.shadowRoot.querySelectorAll(".quick-timer-btn")),
      quickOffBtn: this.shadowRoot.getElementById("quick-off-btn"),
      tasksTitle: this.shadowRoot.getElementById("tasks-title"),
      tasksAddBtn: this.shadowRoot.getElementById("tasks-add-btn"),
      tasksList: this.shadowRoot.getElementById("tasks-list"),
      timerMenuBtn: this.shadowRoot.getElementById("timer-menu-btn"),
      error: this.shadowRoot.getElementById("error"),
      timerModal: this.shadowRoot.getElementById("timer-modal"),
      timerModalBackdrop: this.shadowRoot.getElementById("timer-modal-backdrop"),
      timerModalPanel: this.shadowRoot.getElementById("timer-modal-panel"),
      timerCloseBtn: this.shadowRoot.getElementById("timer-close-btn"),
      timerModalTitle: this.shadowRoot.getElementById("timer-modal-title"),
      timerPageControls: this.shadowRoot.getElementById("timer-page-controls"),
      timerPagePrevBtn: this.shadowRoot.getElementById("timer-page-prev-btn"),
      timerPageNextBtn: this.shadowRoot.getElementById("timer-page-next-btn"),
      timerPageIndicator: this.shadowRoot.getElementById("timer-page-indicator"),
      modalModeTimerBtn: this.shadowRoot.getElementById("modal-mode-timer-btn"),
      modalModeTasksBtn: this.shadowRoot.getElementById("modal-mode-tasks-btn"),
      modalTimerView: this.shadowRoot.getElementById("modal-timer-view"),
      modalTasksView: this.shadowRoot.getElementById("modal-tasks-view"),
      timerGrid: this.shadowRoot.getElementById("timer-grid"),
      scheduleModal: this.shadowRoot.getElementById("schedule-modal"),
      scheduleModalBackdrop: this.shadowRoot.getElementById("schedule-modal-backdrop"),
      scheduleModalPanel: this.shadowRoot.getElementById("schedule-modal-panel"),
      scheduleModalTitle: this.shadowRoot.getElementById("schedule-modal-title"),
      scheduleCloseBtn: this.shadowRoot.getElementById("schedule-close-btn"),
      scheduleForm: this.shadowRoot.getElementById("schedule-form"),
      scheduleNameLabel: this.shadowRoot.getElementById("schedule-name-label"),
      scheduleTypeLabel: this.shadowRoot.getElementById("schedule-type-label"),
      scheduleTypeToggle: this.shadowRoot.getElementById("schedule-type-toggle"),
      scheduleTypeWindowBtn: this.shadowRoot.getElementById("schedule-type-window-btn"),
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
      timelinePointsLabel: this.shadowRoot.getElementById("timeline-points-label"),
      scheduleNameInput: this.shadowRoot.getElementById("schedule-name-input"),
      scheduleTypeInput: this.shadowRoot.getElementById("schedule-type-input"),
      scheduleWindowFields: this.shadowRoot.getElementById("schedule-window-fields"),
      scheduleTimelineFields: this.shadowRoot.getElementById("schedule-timeline-fields"),
      scheduleStartInput: this.shadowRoot.getElementById("schedule-start-input"),
      scheduleEndInput: this.shadowRoot.getElementById("schedule-end-input"),
      scheduleRecurrenceInput: this.shadowRoot.getElementById("schedule-recurrence-input"),
      scheduleDateRow: this.shadowRoot.getElementById("schedule-date-row"),
      scheduleStartDateInput: this.shadowRoot.getElementById("schedule-start-date-input"),
      scheduleEndDateInput: this.shadowRoot.getElementById("schedule-end-date-input"),
      scheduleDays: this.shadowRoot.getElementById("schedule-days"),
      scheduleMonths: this.shadowRoot.getElementById("schedule-months"),
      timelinePoints: this.shadowRoot.getElementById("timeline-points"),
      timelinePointAddBtn: this.shadowRoot.getElementById("timeline-point-add-btn"),
      scheduleCancelBtn: this.shadowRoot.getElementById("schedule-cancel-btn"),
      scheduleSaveBtn: this.shadowRoot.getElementById("schedule-save-btn"),
    };

    this._elements.timerMenuBtn.addEventListener("click", () => this._openTimerModal());
    this._elements.timerCloseBtn.addEventListener("click", () => this._closeTimerModal());
    this._elements.timerModalBackdrop.addEventListener("click", () => this._closeTimerModal());
    this._elements.timerPagePrevBtn.addEventListener("click", () => this._changeTimerPage(-1));
    this._elements.timerPageNextBtn.addEventListener("click", () => this._changeTimerPage(1));
    this._elements.modalModeTimerBtn?.addEventListener("click", () => this._setMenuMode("timer"));
    this._elements.modalModeTasksBtn?.addEventListener("click", () => this._setMenuMode("tasks"));
    this._elements.tasksAddBtn.addEventListener("click", () => this._openScheduleModal());
    this._elements.scheduleCloseBtn.addEventListener("click", () => this._closeScheduleModal());
    this._elements.scheduleCancelBtn.addEventListener("click", () => this._closeScheduleModal());
    this._elements.scheduleModalBackdrop.addEventListener("click", () => this._closeScheduleModal());
    this._elements.scheduleTypeWindowBtn?.addEventListener("click", () => this._setScheduleType("window"));
    this._elements.scheduleTypeTimelineBtn?.addEventListener("click", () => this._setScheduleType("timeline"));
    this._elements.schedulePanelRecurrenceBtn?.addEventListener("click", () => this._setSchedulePanel("recurrence"));
    this._elements.schedulePanelDaysBtn?.addEventListener("click", () => this._setSchedulePanel("days"));
    this._elements.schedulePanelMonthsBtn?.addEventListener("click", () => this._setSchedulePanel("months"));
    this._elements.scheduleRecurrenceForeverBtn?.addEventListener("click", () => this._setScheduleRecurrence("forever"));
    this._elements.scheduleRecurrenceOnceBtn?.addEventListener("click", () => this._setScheduleRecurrence("once"));
    this._elements.scheduleRecurrenceRangeBtn?.addEventListener("click", () => this._setScheduleRecurrence("range"));
    this._elements.timelinePointAddBtn?.addEventListener("click", () => this._addTimelinePointRow());
    this._elements.scheduleForm.addEventListener("submit", (event) => {
      event.preventDefault();
      this._submitScheduleTask();
    });
    this._elements.quickTimerBtns.forEach((button) => {
      button.addEventListener("click", () => this._handleQuickTimerClick(button));
    });
    this._renderScheduleDayButtons();
    this._renderScheduleMonthButtons();
    this._resetTimelinePoints();
    this._setSchedulePanel(this._schedulePanel);
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
    const scripts = this._scriptEntities();

    const title = typeof cfg.title === "string" && cfg.title.trim()
      ? cfg.title.trim()
      : this._t("default_title");
    this._elements.title.textContent = title;
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
    if (this._elements.tasksTitle) {
      this._elements.tasksTitle.textContent = this._t("tasks_title");
    }
    if (this._elements.tasksAddBtn) {
      this._elements.tasksAddBtn.textContent = this._t("tasks_add");
      this._elements.tasksAddBtn.disabled = !this._hasAnyTaskCreateService();
    }
    if (this._elements.modalModeTimerBtn) {
      this._elements.modalModeTimerBtn.textContent = this._t("menu_timers");
    }
    if (this._elements.modalModeTasksBtn) {
      this._elements.modalModeTasksBtn.textContent = this._t("menu_tasks");
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
      this._updateScheduleDayLabels();
      this._updateScheduleMonthLabels();
      this._syncScheduleTypeFields({ refreshTimelineOptions: true });
      this._syncScheduleRecurrenceFields();
      this._setSchedulePanel(this._schedulePanel);
    }
    this._setMenuMode(this._menuMode);
    const flowImage = cfg.boiler_flow_image || "/local/boiler-card/boiler-flow.png";
    if (this._elements.boilerMainImage?.getAttribute("src") !== flowImage) {
      this._elements.boilerMainImage.setAttribute("src", flowImage);
    }
    this._syncTimerPicker(duration, boiler, timer);
    this._syncHeatingVisual(boiler, timer, duration);
    this._syncStatus(boiler, timer);
    this._syncCountdown(timer, boiler);
    this._syncSensors();
    this._syncUpcomingTaskNotice();
    this._syncError(boiler, duration, timer, scripts);
    this._syncControls(boiler, duration, timer, scripts);
    this._syncScheduleList();
  }

  _syncTimerPicker(durationEntity, boilerEntity, timerEntity) {
    const options = this._durationOptions(durationEntity);
    const selected = this._selectedDurationOption(durationEntity, options);
    this._timerPageIndex = this._clamp(this._timerPageIndex, 0, this._timerPageCount(options) - 1);

    if (this._elements.timerMenuBtn) {
      this._elements.timerMenuBtn.setAttribute(
        "title",
        `${this._t("timer_label")}: ${this._renderOptionLabel(selected)}`
      );
    }
    this._syncQuickTimerButtons(options, selected, boilerEntity, timerEntity);
    this._renderTimerGrid(options, selected);
  }

  _syncQuickTimerButtons(options, selected, boilerEntity, timerEntity) {
    const isBoilerOn = this._isEntityOn(boilerEntity);
    const timerActive = timerEntity?.state === "active" || timerEntity?.state === "paused";
    const pendingOff = this._offPendingUntil > Date.now();
    const offSelected = pendingOff || (!isBoilerOn && !timerActive);
    const noTimerSelected = this._isNoTimerOption(selected);
    // Highlight timed quick buttons only while a timer is actually running/paused.
    // This prevents false "30m selected" visual state after restart when boiler is ON in continuous mode.
    const allowSelectedState = timerActive;
    const buttons = this._elements.quickTimerBtns || [];
    buttons.forEach((button) => {
      if (button.dataset.action === "off") {
        button.dataset.option = "";
        button.classList.toggle("selected", offSelected);
        return;
      }
      const minutes = Number.parseInt(button.dataset.minutes || "", 10);
      const option = this._optionByMinutes(minutes, options);
      button.dataset.option = option || "";
      button.classList.toggle(
        "selected",
        !offSelected && !noTimerSelected && allowSelectedState && !!option && option === selected
      );
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
    pageOptions.forEach((option) => {
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

    this._syncTimerPagerControls(pageCount);
  }

  _syncStatus(boiler, timer) {
    if (!boiler) {
      this._elements.subtitle.textContent = this._t("subtitle_check_entity");
      return;
    }

    const isOn = this._isEntityOn(boiler);

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
      this._elements.countdownValue.classList.remove("continuous-active");
      return;
    }

    if (this._isEntityOn(boiler)) {
      this._elements.countdownLabel.textContent = this._t("no_timer");
      this._elements.countdownValue.textContent = "∞";
      this._elements.countdownValue.classList.add("continuous-active");
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
      return;
    }

    row.hidden = false;
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
    const defs = [
      {
        key: "current_sensor",
        nameKey: "current_sensor_name",
        fallbackLabel: this._t("sensor_current"),
      },
      {
        key: "voltage_sensor",
        nameKey: "voltage_sensor_name",
        fallbackLabel: this._t("sensor_voltage"),
      },
    ];

    return defs
      .map(({ key, nameKey, fallbackLabel }) => {
        const entityId = String(this._config?.[key] || "").trim();
        const customName = String(this._config?.[nameKey] || "").trim();
        return { label: customName || fallbackLabel, entityId };
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

  _syncError(boiler, duration, timer, scripts) {
    const missing = [];
    const hasBuiltIn = this._hasBuiltInControlServices();

    if (!boiler) {
      missing.push(this._config.boiler_entity);
    }
    if (!duration && !hasBuiltIn) {
      missing.push(this._config.duration_entity);
    }
    if (!timer && !hasBuiltIn) {
      missing.push(this._config.timer_entity);
    }
    if (!scripts.onTimed && !hasBuiltIn) {
      missing.push(this._config.script_on_timed);
    }
    if (!scripts.onContinuous && !hasBuiltIn) {
      missing.push(this._config.script_on_continuous);
    }

    if (missing.length === 0) {
      this._elements.error.hidden = true;
      this._elements.error.textContent = "";
      return;
    }

    this._elements.error.hidden = false;
    this._elements.error.textContent = `${this._t("missing_entity")}: ${missing.join(", ")}`;
  }

  _syncControls(boiler, duration, timer, scripts) {
    const hasHass = !!this._hass;
    const hasCoreEntities = !!boiler && !!duration && !!timer;
    const hasOnScripts = !!scripts.onTimed && !!scripts.onContinuous;
    const hasBuiltIn = this._hasBuiltInControlServices();
    const canUseScripts = hasCoreEntities && hasOnScripts;
    const canUseBuiltIn = hasBuiltIn && !!boiler;
    const hasDuration = !!duration || hasBuiltIn;

    const timedButtonsDisabled = !hasHass || (!canUseScripts && !canUseBuiltIn);
    const offButtonDisabled = !hasHass || !boiler;
    this._elements.timerMenuBtn.disabled = !hasHass || !hasDuration;
    this._elements.quickTimerBtns.forEach((button) => {
      const hasOption = !!button.dataset.option;
      const isOffAction = button.dataset.action === "off";
      if (isOffAction) {
        button.disabled = offButtonDisabled;
        return;
      }
      button.disabled = timedButtonsDisabled || !hasOption;
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
    this._syncUpcomingTaskNotice();
    this._syncHeatingVisual(boiler, timer, duration);
  }

  _syncHeatingVisual(boiler, timer, durationEntity) {
    if (!this._elements.boilerVisual) {
      return;
    }

    const isOn = this._isEntityOn(boiler);
    const profile = this._heatingProfile(boiler, timer, durationEntity);
    this._elements.boilerVisual.classList.toggle("off", !isOn);
    this._elements.boilerVisual.classList.toggle("temp-driven", !!profile.isTemperatureDriven);
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
        isTemperatureDriven: false,
      };
    }

    if (!timerActive) {
      const profile = this._buildHeatingProfile(
        0.72,
        this._t("stage_continuous"),
        this._t("no_timer_mode")
      );
      profile.isTemperatureDriven = false;
      return profile;
    }

    const remaining = this._remainingSeconds(timer);
    const total = this._timerTotalSeconds(timer, durationEntity);
    const progress = total > 0 && remaining !== null ? this._clamp(1 - remaining / total, 0, 1) : 0;
    const percent = Math.round(progress * 100);

    if (progress < 0.34) {
      const profile = this._buildHeatingProfile(
        progress,
        this._t("stage_cool"),
        this._formatWarmedPercent(percent)
      );
      profile.isTemperatureDriven = false;
      return profile;
    }
    if (progress < 0.67) {
      const profile = this._buildHeatingProfile(
        progress,
        this._t("stage_warm"),
        this._formatWarmedPercent(percent)
      );
      profile.isTemperatureDriven = false;
      return profile;
    }
    const profile = this._buildHeatingProfile(
      progress,
      this._t("stage_hot"),
      this._formatWarmedPercent(percent)
    );
    profile.isTemperatureDriven = false;
    return profile;
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
      isTemperatureDriven: false,
    };
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

    const sensorEntityId = String(this._config?.temperature_sensor || "").trim();
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

    const durationEntity = this._hass.states[this._config.duration_entity];
    if (durationEntity) {
      this._hass.callService("input_select", "select_option", {
        entity_id: this._config.duration_entity,
        option,
      });
    }

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

    const useScripts = this._hasScriptControlServices();

    if (this._isNoTimerOption(option)) {
      if (useScripts) {
        this._runScript(this._config.script_on_continuous, {
          boiler_entity: this._config.boiler_entity,
          turn_on_action: this._config.turn_on_action,
          turn_on_data: this._safeServiceData(this._config.turn_on_data),
        });
      } else {
        this._callConfiguredService(this._config.service_on_continuous, this._builtInServiceBaseData());
      }
      return;
    }

    if (useScripts) {
      this._runScript(this._config.script_on_timed, {
        duration_option: option,
        duration: this._optionToHhMmSs(option) || "00:30:00",
        boiler_entity: this._config.boiler_entity,
        turn_on_action: this._config.turn_on_action,
        turn_on_data: this._safeServiceData(this._config.turn_on_data),
      });
      return;
    }

    const minutes = this._optionToMinutes(option);
    this._callConfiguredService(this._config.service_run_timed, {
      ...this._builtInServiceBaseData(),
      duration: this._optionToHhMmSs(option) || "00:30:00",
      ...(minutes ? { minutes } : {}),
    });
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

  _setMenuMode(mode) {
    this._menuMode = mode === "tasks" ? "tasks" : "timer";
    const isTimer = this._menuMode === "timer";
    if (this._elements.modalTimerView) {
      this._elements.modalTimerView.hidden = !isTimer;
    }
    if (this._elements.modalTasksView) {
      this._elements.modalTasksView.hidden = isTimer;
    }
    if (this._elements.modalModeTimerBtn) {
      this._elements.modalModeTimerBtn.classList.toggle("active", isTimer);
    }
    if (this._elements.modalModeTasksBtn) {
      this._elements.modalModeTasksBtn.classList.toggle("active", !isTimer);
    }
    if (this._elements.timerPageControls) {
      const duration = this._hass?.states[this._config.duration_entity];
      const options = this._durationOptions(duration);
      const pageCount = this._timerPageCount(options);
      this._elements.timerPageControls.hidden = !isTimer || pageCount <= 1;
    }
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
    if (this._elements.scheduleModalTitle) {
      this._elements.scheduleModalTitle.textContent = this._t("task_add_title");
    }
    this._elements.scheduleModal.hidden = false;
    this._attachEscapeListener();
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

  _isAnyModalOpen() {
    return !!(
      (this._elements.timerModal && !this._elements.timerModal.hidden)
      || (this._elements.scheduleModal && !this._elements.scheduleModal.hidden)
    );
  }

  _attachEscapeListener() {
    window.removeEventListener("keydown", this._handleEscapeKey);
    window.addEventListener("keydown", this._handleEscapeKey);
  }

  _renderScheduleDayButtons() {
    const container = this._elements.scheduleDays;
    if (!container) {
      return;
    }

    container.innerHTML = "";
    for (let day = 0; day <= 6; day += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "schedule-day";
      button.dataset.day = String(day);
      button.addEventListener("click", () => button.classList.toggle("selected"));
      container.appendChild(button);
    }
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
    const map = [
      this._t("day_mon"),
      this._t("day_tue"),
      this._t("day_wed"),
      this._t("day_thu"),
      this._t("day_fri"),
      this._t("day_sat"),
      this._t("day_sun"),
    ];
    const dayButtons = Array.from(this.shadowRoot.querySelectorAll(".schedule-day"));
    dayButtons.forEach((button, index) => {
      button.textContent = map[index] || String(index + 1);
    });
  }

  _formatScheduleDays(days) {
    if (!Array.isArray(days) || days.length === 0) {
      return "";
    }
    const map = {
      0: this._t("day_mon"),
      1: this._t("day_tue"),
      2: this._t("day_wed"),
      3: this._t("day_thu"),
      4: this._t("day_fri"),
      5: this._t("day_sat"),
      6: this._t("day_sun"),
    };
    return days
      .map((day) => map[Number.parseInt(day, 10)] || "")
      .filter((label) => !!label)
      .join(", ");
  }

  _updateScheduleMonthLabels() {
    const monthButtons = Array.from(this.shadowRoot.querySelectorAll(".schedule-month"));
    monthButtons.forEach((button, index) => {
      button.textContent = String(index + 1);
    });
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
    atInput.className = "schedule-input timeline-point-time";
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

    this._setSelectedScheduleDays(attrs.days);
    this._setSelectedScheduleMonths(attrs.months);
    this._syncScheduleRecurrenceFields();
    this._elements.scheduleModal.hidden = false;
    this._attachEscapeListener();
  }

  _setScheduleType(type) {
    const normalizedType = String(type || "window").toLowerCase() === "timeline" ? "timeline" : "window";
    if (this._elements.scheduleTypeInput) {
      this._elements.scheduleTypeInput.value = normalizedType;
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
  }

  _syncScheduleTypeFields({ refreshTimelineOptions = true } = {}) {
    const type = String(this._elements.scheduleTypeInput?.value || "window").toLowerCase();
    const isTimeline = type === "timeline";

    if (this._elements.scheduleTypeWindowBtn) {
      const isWindow = !isTimeline;
      this._elements.scheduleTypeWindowBtn.classList.toggle("active", isWindow);
      this._elements.scheduleTypeWindowBtn.setAttribute("aria-pressed", isWindow ? "true" : "false");
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

    if (!this._elements.scheduleDateRow) {
      return;
    }
    this._elements.scheduleDateRow.hidden = recurrence !== "range";
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
    const dayButtons = Array.from(this.shadowRoot.querySelectorAll(".schedule-day"));
    dayButtons.forEach((button) => {
      button.classList.add("selected");
    });
    const monthButtons = Array.from(this.shadowRoot.querySelectorAll(".schedule-month"));
    monthButtons.forEach((button) => button.classList.add("selected"));
    this._resetTimelinePoints();
    this._syncScheduleRecurrenceFields();
    this._setSchedulePanel("recurrence");
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
    const includeDateRange = recurrence === "range";

    const baseData = {
      ...this._builtInServiceBaseData(),
      name,
      days,
      months,
      recurrence,
      ...(includeDateRange && startDate ? { start_date: startDate } : {}),
      ...(includeDateRange && endDate ? { end_date: endDate } : {}),
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

    const startTime = String(this._elements.scheduleStartInput?.value || "").trim();
    const endTime = String(this._elements.scheduleEndInput?.value || "").trim();
    if (!startTime || !endTime) {
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
      .sort((a, b) => String(a.attributes?.start_time || "").localeCompare(String(b.attributes?.start_time || "")));

    return entities;
  }

  _syncUpcomingTaskNotice() {
    const notice = this._elements.upcomingTaskNotice;
    if (!notice) {
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

  _taskNextEventSortKey(taskState, nowTs) {
    const isEnabled = String(taskState?.state || "").toLowerCase() === "on";
    if (!isEnabled) {
      return null;
    }
    return this._nextTaskStartTimestamp(taskState?.attributes || {}, nowTs);
  }

  _sortTasksByNextEvent(taskStates, nowTs = Date.now()) {
    if (!Array.isArray(taskStates) || taskStates.length <= 1) {
      return Array.isArray(taskStates) ? taskStates : [];
    }

    return taskStates
      .map((taskState, index) => ({
        taskState,
        index,
        nextTs: this._taskNextEventSortKey(taskState, nowTs),
      }))
      .sort((a, b) => {
        const aHasNext = Number.isFinite(a.nextTs);
        const bHasNext = Number.isFinite(b.nextTs);
        if (aHasNext && bHasNext) {
          if (a.nextTs !== b.nextTs) {
            return a.nextTs - b.nextTs;
          }
        } else if (aHasNext !== bHasNext) {
          return aHasNext ? -1 : 1;
        }

        const aName = String(
          a.taskState?.attributes?.task_name
          || a.taskState?.attributes?.friendly_name
          || a.taskState?.attributes?.task_id
          || a.taskState?.entity_id
          || ""
        );
        const bName = String(
          b.taskState?.attributes?.task_name
          || b.taskState?.attributes?.friendly_name
          || b.taskState?.attributes?.task_id
          || b.taskState?.entity_id
          || ""
        );
        const byName = aName.localeCompare(bName);
        if (byName !== 0) {
          return byName;
        }
        return a.index - b.index;
      })
      .map((item) => item.taskState);
  }

  _syncScheduleList() {
    const list = this._elements.tasksList;
    if (!list) {
      return;
    }

    const tasks = this._sortTasksByNextEvent(this._taskSwitchEntities(), Date.now());
    const renderKey = JSON.stringify({
      lang: this._lang(),
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
      if (attrs.task_type === "timeline") {
        const timeline = String(attrs.timeline_label || "").trim();
        meta.textContent = `${timeline || "--"}${daysLabel}`;
      } else {
        meta.textContent = `${attrs.start_time || "--:--"} - ${attrs.end_time || "--:--"}${daysLabel}`;
      }
      main.appendChild(meta);

      const actions = document.createElement("div");
      actions.className = "task-actions";

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "task-toggle-btn";
      const isOn = String(taskState.state || "").toLowerCase() === "on";
      toggle.classList.toggle("on", isOn);
      toggle.textContent = isOn ? this._t("task_enabled") : this._t("task_disabled");
      toggle.addEventListener("click", () => {
        const [domain] = taskState.entity_id.split(".", 1);
        const service = isOn ? "turn_off" : "turn_on";
        this._hass?.callService(domain || "homeassistant", service, { entity_id: taskState.entity_id });
      });
      actions.appendChild(toggle);

      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "task-edit-btn";
      edit.textContent = this._t("task_edit");
      edit.disabled = !this._hasScheduleUpdateService();
      edit.addEventListener("click", () => {
        this._openScheduleModalForTask(taskState);
      });
      actions.appendChild(edit);

      const del = document.createElement("button");
      del.type = "button";
      del.className = "task-delete-btn";
      del.textContent = this._t("task_delete");
      del.addEventListener("click", () => {
        const taskId = attrs.task_id;
        if (!taskId || !this._hasScheduleDeleteService()) {
          return;
        }
        this._callConfiguredService(this._config.service_delete_schedule, {
          ...this._builtInServiceBaseData(),
          task_id: taskId,
        });
      });
      actions.appendChild(del);

      item.appendChild(main);
      item.appendChild(actions);
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

    const entityDomain = String(this._config.boiler_entity || "").split(".")[0];
    // Always send direct OFF to the entity domain first (works for switch/light/etc).
    if (entityDomain) {
      this._callEntityAction(
        `${entityDomain}.turn_off`,
        this._config.boiler_entity,
        null
      );
    }
    this._callEntityAction(
      "homeassistant.turn_off",
      this._config.boiler_entity,
      null
    );

    // Then call integration/script off flows (for mode cleanup, timers, etc).
    this._callConfiguredService(this._config.service_off, this._builtInServiceBaseData());
    if (this._hasScriptOffService()) {
      this._runScript(this._config.script_off, {
        boiler_entity: this._config.boiler_entity,
        turn_off_action: this._config.turn_off_action,
        turn_off_data: this._safeServiceData(this._config.turn_off_data),
      });
    }

    if (this._config.timer_entity) {
      this._hass?.callService("timer", "cancel", {
        entity_id: this._config.timer_entity,
      });
    }
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
    if (this._config.integration_entry_id) {
      data.entry_id = this._config.integration_entry_id;
    }
    if (this._config.boiler_entity) {
      data.boiler_entity = this._config.boiler_entity;
    }
    return data;
  }

  _hasScriptControlServices() {
    const scripts = this._scriptEntities();
    return !!scripts.onTimed && !!scripts.onContinuous;
  }

  _hasScriptOffService() {
    const scripts = this._scriptEntities();
    return !!scripts.off;
  }

  _hasBuiltInControlServices() {
    return this._isServiceAvailable(this._config.service_run_timed)
      && this._isServiceAvailable(this._config.service_on_continuous)
      && this._isServiceAvailable(this._config.service_off);
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
    this._form = null;
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
    if (!this._form) {
      this.innerHTML = "";
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (schema) => schema.label;
      this._form.addEventListener("value-changed", (event) => this._onValueChanged(event));
      this.appendChild(this._form);
    }

    this._form.hass = this._hass;
    this._form.data = this._config;
    this._form.schema = [
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
        name: "temperature_sensor",
        label: labels.temperature_sensor,
        selector: { entity: { domain: "sensor" } },
      },
      {
        name: "temperature_sensor_name",
        label: labels.temperature_sensor_name,
        selector: { text: {} },
      },
      {
        name: "current_sensor",
        label: labels.current_sensor,
        selector: { entity: { domain: "sensor" } },
      },
      {
        name: "current_sensor_name",
        label: labels.current_sensor_name,
        selector: { text: {} },
      },
      {
        name: "voltage_sensor",
        label: labels.voltage_sensor,
        selector: { entity: { domain: "sensor" } },
      },
      {
        name: "voltage_sensor_name",
        label: labels.voltage_sensor_name,
        selector: { text: {} },
      },
      {
        name: "boiler_flow_image",
        label: labels.boiler_flow_image,
        selector: { text: {} },
      },
    ];
  }

  _onValueChanged(event) {
    const value = event?.detail?.value || {};
    const prevLanguage = this._config?.language;
    const nextConfig = { ...this._config, ...value };
    this._config = nextConfig;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: nextConfig },
    }));

    // Keep editor stable so dropdown/entity selectors stay interactive.
    if (value.language && value.language !== prevLanguage) {
      this._render();
    }
  }

  _labels() {
    const language = String(this._config?.language || "he").toLowerCase();
    const lang = SUPPORTED_LANGUAGES.includes(language) ? language : "he";
    const map = {
      he: {
        language: "שפה",
        title: "כותרת",
        boiler_entity: "ישות דוד",
        temperature_sensor: "סנסור טמפרטורה",
        temperature_sensor_name: "שם תצוגה לסנסור טמפרטורה",
        current_sensor: "סנסור זרם",
        current_sensor_name: "שם תצוגה לסנסור זרם",
        voltage_sensor: "סנסור מתח",
        voltage_sensor_name: "שם תצוגה לסנסור מתח",
        boiler_flow_image: "תמונת זרימת מים (נתיב / URL)",
      },
      en: {
        language: "Language",
        title: "Title",
        boiler_entity: "Boiler Entity",
        temperature_sensor: "Temperature Sensor",
        temperature_sensor_name: "Temperature Sensor Display Name",
        current_sensor: "Current Sensor",
        current_sensor_name: "Current Sensor Display Name",
        voltage_sensor: "Voltage Sensor",
        voltage_sensor_name: "Voltage Sensor Display Name",
        boiler_flow_image: "Water Flow Image (path / URL)",
      },
      ru: {
        language: "Язык",
        title: "Заголовок",
        boiler_entity: "Сущность бойлера",
        temperature_sensor: "Датчик температуры",
        temperature_sensor_name: "Отображаемое имя датчика температуры",
        current_sensor: "Датчик тока",
        current_sensor_name: "Отображаемое имя датчика тока",
        voltage_sensor: "Датчик напряжения",
        voltage_sensor_name: "Отображаемое имя датчика напряжения",
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
