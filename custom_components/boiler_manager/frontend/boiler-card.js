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

const SUPPORTED_LANGUAGES = ["he", "en", "ru", "fr"];

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
    vacation_mode_notice: "מצב חופשה פעיל • ביטול שעונים",
    vacation_mode_enable: "הפעל מצב חופשה",
    vacation_mode_disable: "בטל מצב חופשה",
    tasks_import: "ייבוא",
    tasks_export: "ייצוא",
    import_mode_merge: "מיזוג",
    import_mode_replace: "החלפה",
    import_replace_confirm: "לייבא במצב החלפה? זה ימחק את כל המשימות הקיימות לפני הייבוא.",
    import_invalid_file: "קובץ ייבוא לא תקין",
    import_select_tasks_title: "בחירת משימות לייבוא",
    import_select_tasks_message: "בחר אילו משימות לייבא:",
    import_select_all: "בחר הכל",
    import_clear_all: "נקה הכל",
    import_no_tasks_selected: "לא נבחרו משימות לייבוא",
    import_no_new_tasks: "כל המשימות שנבחרו כבר קיימות (או כפולות), אין משימות חדשות לייבוא",
    import_task_unnamed: "משימה ללא שם",
    dialog_title: "אישור פעולה",
    dialog_ok: "אישור",
    duplicate_task_title: "זוהתה כפילות במשימות",
    duplicate_task_message_intro: "לא ניתן לשמור. נמצאה כפילות עם המשימות הבאות:",
    tasks_empty: "אין משימות",
    task_name: "שם משימה",
    task_start: "התחלה",
    task_end: "סיום",
    schedule_time_mode: "סוג זמן",
    schedule_time_mode_fixed: "שעה קבועה",
    schedule_time_mode_sunrise: "זריחה",
    schedule_time_mode_sunset: "שקיעה",
    schedule_time_offset: "אופסט (דקות)",
    schedule_sun_toggle: "שימוש בזריחה/שקיעה",
    invalid_schedule_time: "זמן משימה לא תקין",
    task_days: "ימים",
    task_cancel: "ביטול",
    task_save: "שמירה",
    clear_value: "נקה",
    task_delete: "מחיקה",
    task_enabled: "פעיל",
    task_disabled: "כבוי",
    task_enable: "הפעל",
    task_disable: "השבת",
    task_edit: "עריכה",
    menu_timers: "טיימר",
    menu_tasks: "משימות",
    menu_import_export: "ייבוא/ייצוא",
    menu_holidays_shabbat: "חגים ושבתות",
    holidays_shabbat_title: "חגים ושבתות",
    holidays_shabbat_description: "כללים גלובליים חלים כשהמצב למעלה «פעיל». רשימת החלונות להצגה בלבד.",
    holidays_shabbat_status_label: "סטטוס",
    holidays_shabbat_sources_label: "מקורות",
    holidays_shabbat_timer_rule_label: "כלל טיימרים",
    holidays_shabbat_task_rule_label: "כלל משימות",
    holidays_shabbat_status_active: "פעיל עכשיו",
    holidays_shabbat_status_inactive: "לא פעיל",
    holidays_shabbat_source_holiday: "חג",
    holidays_shabbat_source_shabbat: "שבת",
    holidays_shabbat_source_not_set: "לא הוגדר",
    holidays_shabbat_source_hebcal: "Hebcal (מקומי)",
    holidays_shabbat_hebcal_waiting: "טוען…",
    holidays_shabbat_hebcal_no_cache: "אין קובץ (הפעל Hebcal באפשרויות האינטגרציה, שמור והפעל מחדש)",
    holidays_shabbat_hebcal_idle: "לא בחלון מוגבל",
    holidays_shabbat_hebcal_meta_label: "Hebcal — קובץ",
    holidays_shabbat_hebcal_meta_off: "לא בשימוש (כבה טעינת מטמון או אין נתיב)",
    holidays_shabbat_hebcal_meta_loading: "טוען מהשרת…",
    holidays_shabbat_hebcal_meta_err: "טעינה נכשלה",
    holidays_shabbat_hebcal_meta_ok: "נטען",
    holidays_shabbat_hebcal_meta_windows: "חלונות",
    holidays_shabbat_hebcal_meta_items: "פריטים",
    holidays_shabbat_hebcal_meta_json_err: "פענוח JSON נכשל",
    holidays_shabbat_hebcal_meta_invalid_payload: "תגובה לא תקינה",
    holidays_shabbat_hebcal_need_entry: "הוסף מזהה כניסה או נתיב קובץ, או וודא שיש רק כניסת Boiler Manager אחת (או כבה 'זיהוי אוטומטי' והזן ידנית). הקובץ: hebcal-<מזהה>.json",
    holidays_shabbat_hebcal_scope_label: "חלונות Hebcal שמפעילים כללים",
    holidays_shabbat_hebcal_scope_both: "שבת וחגים (ברירת מחדל)",
    holidays_shabbat_hebcal_scope_shabbat: "שבת בלבד",
    holidays_shabbat_hebcal_scope_holiday: "יום טוב / חג בלבד",
    holidays_shabbat_practical_hint: "משימה בודדת: עורך משימה ← תנאי + דלג אם מצב (למשל on).",
    holidays_shabbat_windows_title: "כל החלונות מהקובץ (שבת / חג)",
    holidays_shabbat_windows_empty: "אין חלונות בקובץ Hebcal.",
    holidays_shabbat_window_kind_shabbat: "שבת",
    holidays_shabbat_window_kind_holiday: "חג",
    holidays_shabbat_window_state_active: "עכשיו",
    holidays_shabbat_window_state_past: "עבר",
    holidays_shabbat_window_state_upcoming: "עתיד",
    holiday_policy_allow: "ללא הגבלה",
    holiday_policy_block: "חסימה",
    holiday_policy_postpone: "דחייה",
    holiday_policy_force_off: "כיבוי כללי",
    holiday_timer_rule_block_notice: "טיימרים חסומים בזמן חג/שבת.",
    holiday_timer_rule_postpone_notice: "טיימרים במצב דחייה בזמן חג/שבת.",
    holiday_timer_rule_force_off_notice: "בזמן חג/שבת מופעל כיבוי כללי.",
    holiday_task_rule_block_notice: "הפעלת משימות חסומה בזמן חג/שבת.",
    holiday_task_rule_postpone_notice: "משימות במצב דחייה בזמן חג/שבת.",
    holiday_task_rule_force_off_notice: "בזמן חג/שבת מופעל כיבוי כללי על משימות.",
    holiday_runtime_notice: "חג/שבת פעיל • כללי ההגבלה חלים",
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
    condition_entity_label: "ישות תנאי",
    condition_enabled_toggle: "הפעל תנאי",
    condition_operator_label: "אופרטור",
    condition_state_label: "דלג אם מצב",
    condition_state_placeholder: "on",
    condition_op_eq: "=",
    condition_op_gt: ">",
    condition_op_lt: "<",
    condition_op_gte: ">=",
    condition_op_lte: "<=",
    condition_summary_prefix: "דלג אם",
    active_task_ends_at: "מסתיימת ב",
    upcoming_task_starts_in: "מתחיל בעוד",
    sensor_temperature: "טמפרטורה",
    sensor_power: "צריכה",
    sensor_current: "זרם",
    sensor_voltage: "מתח",
    sensor_switcher_on: "סנסור פעיל",
    sensor_switcher_always: "סנסור קבוע",
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
    vacation_mode_notice: "Vacation mode active • schedules paused",
    vacation_mode_enable: "Enable Vacation Mode",
    vacation_mode_disable: "Disable Vacation Mode",
    tasks_import: "Import",
    tasks_export: "Export",
    import_mode_merge: "Merge",
    import_mode_replace: "Replace",
    import_replace_confirm: "Import in replace mode? This will remove all existing tasks before import.",
    import_invalid_file: "Invalid import file",
    import_select_tasks_title: "Select Tasks to Import",
    import_select_tasks_message: "Choose which tasks to import:",
    import_select_all: "Select All",
    import_clear_all: "Clear All",
    import_no_tasks_selected: "No tasks were selected for import",
    import_no_new_tasks: "All selected tasks already exist (or are duplicates), no new tasks to import",
    import_task_unnamed: "Unnamed task",
    dialog_title: "Confirm Action",
    dialog_ok: "OK",
    duplicate_task_title: "Duplicate Task Detected",
    duplicate_task_message_intro: "Cannot save. Duplicate settings found with these tasks:",
    tasks_empty: "No tasks yet",
    task_name: "Task Name",
    task_start: "Start",
    task_end: "End",
    schedule_time_mode: "Time Type",
    schedule_time_mode_fixed: "Fixed Time",
    schedule_time_mode_sunrise: "Sunrise",
    schedule_time_mode_sunset: "Sunset",
    schedule_time_offset: "Offset (minutes)",
    schedule_sun_toggle: "Use sunrise/sunset",
    invalid_schedule_time: "Invalid schedule time",
    task_days: "Days",
    task_cancel: "Cancel",
    task_save: "Save",
    clear_value: "Clear",
    task_delete: "Delete",
    task_enabled: "Enabled",
    task_disabled: "Disabled",
    task_enable: "Enable",
    task_disable: "Disable",
    task_edit: "Edit",
    menu_timers: "Timer",
    menu_tasks: "Tasks",
    menu_import_export: "Import/Export",
    menu_holidays_shabbat: "Holidays & Shabbat",
    holidays_shabbat_title: "Holidays & Shabbat",
    holidays_shabbat_description: "Global rules apply when status is Active. The list is read-only from Hebcal.",
    holidays_shabbat_status_label: "Status",
    holidays_shabbat_sources_label: "Sources",
    holidays_shabbat_timer_rule_label: "Timer Rule",
    holidays_shabbat_task_rule_label: "Task Rule",
    holidays_shabbat_status_active: "Active now",
    holidays_shabbat_status_inactive: "Inactive",
    holidays_shabbat_source_holiday: "Holiday",
    holidays_shabbat_source_shabbat: "Shabbat",
    holidays_shabbat_source_not_set: "Not set",
    holidays_shabbat_source_hebcal: "Hebcal (local file)",
    holidays_shabbat_hebcal_waiting: "Loading…",
    holidays_shabbat_hebcal_no_cache: "No cache file (enable Hebcal in integration options, restart)",
    holidays_shabbat_hebcal_idle: "Not in a restricted window",
    holidays_shabbat_hebcal_meta_label: "Hebcal file",
    holidays_shabbat_hebcal_meta_off: "Not used (cache off or no URL)",
    holidays_shabbat_hebcal_meta_loading: "Loading from server…",
    holidays_shabbat_hebcal_meta_err: "Load failed",
    holidays_shabbat_hebcal_meta_ok: "Loaded",
    holidays_shabbat_hebcal_meta_windows: "windows",
    holidays_shabbat_hebcal_meta_items: "items",
    holidays_shabbat_hebcal_meta_json_err: "Invalid JSON",
    holidays_shabbat_hebcal_meta_invalid_payload: "Invalid response body",
    holidays_shabbat_hebcal_need_entry: "Add entry ID or file URL, or ensure only one Boiler Manager entry exists (or turn off auto-detect and set manually). File: hebcal-<entry_id>.json",
    holidays_shabbat_hebcal_scope_label: "Hebcal windows that trigger rules",
    holidays_shabbat_hebcal_scope_both: "Shabbat and holidays (default)",
    holidays_shabbat_hebcal_scope_shabbat: "Shabbat only",
    holidays_shabbat_hebcal_scope_holiday: "Yom Tov / holidays only",
    holidays_shabbat_practical_hint: "Single task: task editor → Condition + Skip if state (e.g. on).",
    holidays_shabbat_windows_title: "All windows from file (Shabbat / holiday)",
    holidays_shabbat_windows_empty: "No windows in Hebcal file.",
    holidays_shabbat_window_kind_shabbat: "Shabbat",
    holidays_shabbat_window_kind_holiday: "Holiday",
    holidays_shabbat_window_state_active: "Now",
    holidays_shabbat_window_state_past: "Past",
    holidays_shabbat_window_state_upcoming: "Upcoming",
    holiday_policy_allow: "No restriction",
    holiday_policy_block: "Block",
    holiday_policy_postpone: "Postpone",
    holiday_policy_force_off: "Force Off",
    holiday_timer_rule_block_notice: "Timers are blocked during holiday/Shabbat.",
    holiday_timer_rule_postpone_notice: "Timers are postponed during holiday/Shabbat.",
    holiday_timer_rule_force_off_notice: "Holiday/Shabbat rule forced a full shutdown.",
    holiday_task_rule_block_notice: "Task activation is blocked during holiday/Shabbat.",
    holiday_task_rule_postpone_notice: "Tasks are postponed during holiday/Shabbat.",
    holiday_task_rule_force_off_notice: "Holiday/Shabbat rule forced task shutdown.",
    holiday_runtime_notice: "Holiday/Shabbat is active • restriction rules are applied",
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
    condition_entity_label: "Condition Entity",
    condition_enabled_toggle: "Enable Condition",
    condition_operator_label: "Operator",
    condition_state_label: "Skip If State",
    condition_state_placeholder: "on",
    condition_op_eq: "=",
    condition_op_gt: ">",
    condition_op_lt: "<",
    condition_op_gte: ">=",
    condition_op_lte: "<=",
    condition_summary_prefix: "Skip if",
    active_task_ends_at: "Ends at",
    upcoming_task_starts_in: "Starts in",
    sensor_temperature: "Temperature",
    sensor_power: "Power",
    sensor_current: "Current",
    sensor_voltage: "Voltage",
    sensor_switcher_on: "On Sensor",
    sensor_switcher_always: "Always Sensor",
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
    vacation_mode_notice: "Режим отпуска активен • расписания приостановлены",
    vacation_mode_enable: "Включить режим отпуска",
    vacation_mode_disable: "Выключить режим отпуска",
    tasks_import: "Импорт",
    tasks_export: "Экспорт",
    import_mode_merge: "Слияние",
    import_mode_replace: "Замена",
    import_replace_confirm: "Импорт в режиме замены? Все текущие задачи будут удалены перед импортом.",
    import_invalid_file: "Некорректный файл импорта",
    import_select_tasks_title: "Выбор задач для импорта",
    import_select_tasks_message: "Выберите задачи для импорта:",
    import_select_all: "Выбрать все",
    import_clear_all: "Снять выбор",
    import_no_tasks_selected: "Не выбраны задачи для импорта",
    import_no_new_tasks: "Все выбранные задачи уже существуют (или являются дубликатами), новых задач для импорта нет",
    import_task_unnamed: "Задача без названия",
    dialog_title: "Подтверждение",
    dialog_ok: "ОК",
    duplicate_task_title: "Обнаружен дубликат задачи",
    duplicate_task_message_intro: "Сохранение невозможно. Обнаружено совпадение со следующими задачами:",
    tasks_empty: "Задач пока нет",
    task_name: "Название задачи",
    task_start: "Начало",
    task_end: "Окончание",
    schedule_time_mode: "Тип времени",
    schedule_time_mode_fixed: "Фиксированное время",
    schedule_time_mode_sunrise: "Восход",
    schedule_time_mode_sunset: "Закат",
    schedule_time_offset: "Смещение (минуты)",
    schedule_sun_toggle: "Использовать восход/закат",
    invalid_schedule_time: "Некорректное время задачи",
    task_days: "Дни",
    task_cancel: "Отмена",
    task_save: "Сохранить",
    clear_value: "Очистить",
    task_delete: "Удалить",
    task_enabled: "Включено",
    task_disabled: "Выключено",
    task_enable: "Включить",
    task_disable: "Отключить",
    task_edit: "Изменить",
    menu_timers: "Таймер",
    menu_tasks: "Задачи",
    menu_import_export: "Импорт/Экспорт",
    menu_holidays_shabbat: "Праздники и Шаббат",
    holidays_shabbat_title: "Праздники и Шаббат",
    holidays_shabbat_description: "Глобальные правила при статусе «Активно». Список только для просмотра.",
    holidays_shabbat_status_label: "Статус",
    holidays_shabbat_sources_label: "Источники",
    holidays_shabbat_timer_rule_label: "Правило таймера",
    holidays_shabbat_task_rule_label: "Правило задач",
    holidays_shabbat_status_active: "Сейчас активно",
    holidays_shabbat_status_inactive: "Не активно",
    holidays_shabbat_source_holiday: "Праздник",
    holidays_shabbat_source_shabbat: "Шаббат",
    holidays_shabbat_source_not_set: "Не задано",
    holidays_shabbat_source_hebcal: "Hebcal (локальный файл)",
    holidays_shabbat_hebcal_waiting: "Загрузка…",
    holidays_shabbat_hebcal_no_cache: "Нет файла (включите Hebcal в настройках интеграции, перезапуск)",
    holidays_shabbat_hebcal_idle: "Вне ограниченного окна",
    holidays_shabbat_hebcal_meta_label: "Hebcal файл",
    holidays_shabbat_hebcal_meta_off: "Не используется",
    holidays_shabbat_hebcal_meta_loading: "Загрузка…",
    holidays_shabbat_hebcal_meta_err: "Ошибка загрузки",
    holidays_shabbat_hebcal_meta_ok: "Загружено",
    holidays_shabbat_hebcal_meta_windows: "окон",
    holidays_shabbat_hebcal_meta_items: "записей",
    holidays_shabbat_hebcal_meta_json_err: "Неверный JSON",
    holidays_shabbat_hebcal_meta_invalid_payload: "Некорректный ответ",
    holidays_shabbat_hebcal_need_entry: "Укажите ID или URL, или одна запись Boiler Manager (или отключите авто). Файл: hebcal-<entry_id>.json",
    holidays_shabbat_hebcal_scope_label: "Окна Hebcal для правил",
    holidays_shabbat_hebcal_scope_both: "Шаббат и праздники",
    holidays_shabbat_hebcal_scope_shabbat: "Только Шаббат",
    holidays_shabbat_hebcal_scope_holiday: "Только праздники",
    holidays_shabbat_practical_hint: "Одна задача: редактор → Условие + пропуск при состоянии.",
    holidays_shabbat_windows_title: "Все окна из файла",
    holidays_shabbat_windows_empty: "Нет окон в файле Hebcal.",
    holidays_shabbat_window_kind_shabbat: "Шаббат",
    holidays_shabbat_window_kind_holiday: "Праздник",
    holidays_shabbat_window_state_active: "Сейчас",
    holidays_shabbat_window_state_past: "Прошло",
    holidays_shabbat_window_state_upcoming: "Будет",
    holiday_policy_allow: "Без ограничений",
    holiday_policy_block: "Блокировать",
    holiday_policy_postpone: "Отложить",
    holiday_policy_force_off: "Принудительно выключить",
    holiday_timer_rule_block_notice: "Таймеры заблокированы во время праздника/Шаббата.",
    holiday_timer_rule_postpone_notice: "Таймеры отложены во время праздника/Шаббата.",
    holiday_timer_rule_force_off_notice: "Правило праздника/Шаббата выполнило общее отключение.",
    holiday_task_rule_block_notice: "Запуск задач заблокирован во время праздника/Шаббата.",
    holiday_task_rule_postpone_notice: "Задачи отложены во время праздника/Шаббата.",
    holiday_task_rule_force_off_notice: "Правило праздника/Шаббата отключило задачи.",
    holiday_runtime_notice: "Праздник/Шаббат активен • применяются правила ограничений",
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
    condition_entity_label: "Сущность условия",
    condition_enabled_toggle: "Включить условие",
    condition_operator_label: "Оператор",
    condition_state_label: "Пропускать при состоянии",
    condition_state_placeholder: "on",
    condition_op_eq: "=",
    condition_op_gt: ">",
    condition_op_lt: "<",
    condition_op_gte: ">=",
    condition_op_lte: "<=",
    condition_summary_prefix: "Пропускать если",
    active_task_ends_at: "Заканчивается в",
    upcoming_task_starts_in: "Запуск через",
    sensor_temperature: "Температура",
    sensor_power: "Мощность",
    sensor_current: "Ток",
    sensor_voltage: "Напряжение",
    sensor_switcher_on: "Датчик (вкл)",
    sensor_switcher_always: "Датчик (всегда)",
    sensor_unavailable: "Недоступно",
    day_mon: "Пн",
    day_tue: "Вт",
    day_wed: "Ср",
    day_thu: "Чт",
    day_fri: "Пт",
    day_sat: "Сб",
    day_sun: "Вс",
  },
  fr: {
    default_title: "Chauffe-eau",
    status_on: "MARCHE",
    status_off: "ARRÊT",
    status_unavailable: "Indisponible",
    subtitle_ready: "Prêt",
    subtitle_heating_timer: "Chauffage avec minuterie",
    subtitle_heating_continuous: "Chauffage continu",
    subtitle_check_entity: "Vérifiez l'entité du chauffe-eau",
    countdown_remaining: "Restant",
    countdown_paused: "En pause",
    no_timer: "Sans minuterie",
    timer_label: "Minuterie",
    timer_select: "Choisir une minuterie",
    timer_menu: "Menu minuterie",
    timer_prev_page: "Page précédente",
    timer_next_page: "Page suivante",
    turn_on: "Allumer",
    turn_off: "Éteindre",
    missing_entity: "Entité manquante",
    no_heating: "Pas de chauffage",
    no_timer_mode: "Mode sans minuterie",
    warmed_suffix: "chauffé",
    stage_cool: "Étape froide",
    stage_warm: "Étape tiède",
    stage_hot: "Étape chaude",
    stage_continuous: "Chauffage continu",
    stage_off: "Arrêt",
    minutes_short: "min",
    hours_short: "h",
    tasks_title: "Tâches",
    tasks_add: "Ajouter",
    vacation_mode_notice: "Mode vacances actif • plannings en pause",
    vacation_mode_enable: "Activer le mode vacances",
    vacation_mode_disable: "Désactiver le mode vacances",
    tasks_import: "Importer",
    tasks_export: "Exporter",
    import_mode_merge: "Fusionner",
    import_mode_replace: "Remplacer",
    import_replace_confirm: "Importer en mode remplacement ? Cela supprimera toutes les tâches existantes avant l'import.",
    import_invalid_file: "Fichier d'import invalide",
    import_select_tasks_title: "Sélectionner les tâches à importer",
    import_select_tasks_message: "Choisissez les tâches à importer :",
    import_select_all: "Tout sélectionner",
    import_clear_all: "Tout désélectionner",
    import_no_tasks_selected: "Aucune tâche sélectionnée pour l'import",
    import_no_new_tasks: "Toutes les tâches sélectionnées existent déjà (ou sont des doublons), aucune nouvelle tâche à importer",
    import_task_unnamed: "Tâche sans nom",
    dialog_title: "Confirmer l'action",
    dialog_ok: "OK",
    duplicate_task_title: "Tâche en double détectée",
    duplicate_task_message_intro: "Impossible d'enregistrer. Doublon détecté avec ces tâches :",
    tasks_empty: "Aucune tâche",
    task_name: "Nom de la tâche",
    task_start: "Début",
    task_end: "Fin",
    schedule_time_mode: "Type d'heure",
    schedule_time_mode_fixed: "Heure fixe",
    schedule_time_mode_sunrise: "Lever du soleil",
    schedule_time_mode_sunset: "Coucher du soleil",
    schedule_time_offset: "Décalage (minutes)",
    schedule_sun_toggle: "Utiliser lever/coucher",
    invalid_schedule_time: "Heure de tâche invalide",
    task_days: "Jours",
    task_cancel: "Annuler",
    task_save: "Enregistrer",
    clear_value: "Effacer",
    task_delete: "Supprimer",
    task_enabled: "Activée",
    task_disabled: "Désactivée",
    task_enable: "Activer",
    task_disable: "Désactiver",
    task_edit: "Modifier",
    menu_timers: "Minuterie",
    menu_tasks: "Tâches",
    menu_import_export: "Import/Export",
    menu_holidays_shabbat: "Fetes et Shabbat",
    holidays_shabbat_title: "Fetes et Shabbat",
    holidays_shabbat_description: "Regles globales si statut Actif. Liste lecture seule depuis Hebcal.",
    holidays_shabbat_status_label: "Statut",
    holidays_shabbat_sources_label: "Sources",
    holidays_shabbat_timer_rule_label: "Regle minuterie",
    holidays_shabbat_task_rule_label: "Regle taches",
    holidays_shabbat_status_active: "Actif maintenant",
    holidays_shabbat_status_inactive: "Inactif",
    holidays_shabbat_source_holiday: "Fete",
    holidays_shabbat_source_shabbat: "Chabbat",
    holidays_shabbat_source_not_set: "Non defini",
    holidays_shabbat_source_hebcal: "Hebcal (fichier local)",
    holidays_shabbat_hebcal_waiting: "Chargement…",
    holidays_shabbat_hebcal_no_cache: "Pas de cache (activer Hebcal dans l'integration, redemarrer)",
    holidays_shabbat_hebcal_idle: "Pas dans une fenetre restreinte",
    holidays_shabbat_hebcal_meta_label: "Hebcal fichier",
    holidays_shabbat_hebcal_meta_off: "Non utilise",
    holidays_shabbat_hebcal_meta_loading: "Chargement…",
    holidays_shabbat_hebcal_meta_err: "Echec du chargement",
    holidays_shabbat_hebcal_meta_ok: "Charge",
    holidays_shabbat_hebcal_meta_windows: "fenetres",
    holidays_shabbat_hebcal_meta_items: "elements",
    holidays_shabbat_hebcal_meta_json_err: "JSON invalide",
    holidays_shabbat_hebcal_meta_invalid_payload: "Reponse invalide",
    holidays_shabbat_hebcal_need_entry: "Ajoutez ID ou URL, ou une seule entree Boiler Manager (ou desactivez l'auto). Fichier: hebcal-<entry_id>.json",
    holidays_shabbat_hebcal_scope_label: "Fenetres Hebcal pour les regles",
    holidays_shabbat_hebcal_scope_both: "Chabbat et fetes",
    holidays_shabbat_hebcal_scope_shabbat: "Chabbat seulement",
    holidays_shabbat_hebcal_scope_holiday: "Fetes seulement",
    holidays_shabbat_practical_hint: "Une tache: editeur → Condition + ignorer si etat.",
    holidays_shabbat_windows_title: "Toutes les fenetres du fichier",
    holidays_shabbat_windows_empty: "Pas de fenetres dans le fichier Hebcal.",
    holidays_shabbat_window_kind_shabbat: "Chabbat",
    holidays_shabbat_window_kind_holiday: "Fete",
    holidays_shabbat_window_state_active: "Maintenant",
    holidays_shabbat_window_state_past: "Passe",
    holidays_shabbat_window_state_upcoming: "A venir",
    holiday_policy_allow: "Sans restriction",
    holiday_policy_block: "Bloquer",
    holiday_policy_postpone: "Reporter",
    holiday_policy_force_off: "Arret force",
    holiday_timer_rule_block_notice: "Les minuteries sont bloquees pendant fete/Chabbat.",
    holiday_timer_rule_postpone_notice: "Les minuteries sont reportees pendant fete/Chabbat.",
    holiday_timer_rule_force_off_notice: "La regle fete/Chabbat a force l'arret general.",
    holiday_task_rule_block_notice: "L'activation des taches est bloquee pendant fete/Chabbat.",
    holiday_task_rule_postpone_notice: "Les taches sont reportees pendant fete/Chabbat.",
    holiday_task_rule_force_off_notice: "La regle fete/Chabbat a arrete les taches.",
    holiday_runtime_notice: "Fete/Chabbat actif • regles de restriction appliquees",
    recurrence_label: "Récurrence",
    recurrence_forever: "Toujours",
    recurrence_once: "Une fois (suppression auto)",
    recurrence_range: "Plage de dates",
    date_start: "Date de début",
    date_end: "Date de fin",
    months_label: "Mois",
    task_add_title: "Ajouter une tâche",
    task_edit_title: "Modifier la tâche",
    task_type: "Type",
    task_type_window: "Plage horaire",
    task_type_timeline: "Chronologie",
    timeline_points: "Points de chronologie",
    timeline_add_point: "Ajouter un point",
    timeline_remove_point: "Supprimer",
    timeline_time: "Heure",
    timeline_timer: "Minuterie",
    condition_entity_label: "Entité de condition",
    condition_enabled_toggle: "Activer la condition",
    condition_operator_label: "Opérateur",
    condition_state_label: "Ignorer si état",
    condition_state_placeholder: "on",
    condition_op_eq: "=",
    condition_op_gt: ">",
    condition_op_lt: "<",
    condition_op_gte: ">=",
    condition_op_lte: "<=",
    condition_summary_prefix: "Ignorer si",
    active_task_ends_at: "Se termine à",
    upcoming_task_starts_in: "Commence dans",
    sensor_temperature: "Température",
    sensor_power: "Puissance",
    sensor_current: "Courant",
    sensor_voltage: "Tension",
    sensor_switcher_on: "Capteur actif",
    sensor_switcher_always: "Capteur permanent",
    sensor_unavailable: "Indisponible",
    day_mon: "Lun",
    day_tue: "Mar",
    day_wed: "Mer",
    day_thu: "Jeu",
    day_fri: "Ven",
    day_sat: "Sam",
    day_sun: "Dim",
  },
};

const DEFAULT_CONFIG = {
  title: "דוד מים חמים",
  language: "he",
  switcher_mode: false,
  boiler_entity: "",
  temperature_sensor: "",
  power_sensor: "",
  current_sensor: "",
  voltage_sensor: "",
  switcher_time_left_sensor: "",
  switcher_sensor_1: "",
  switcher_sensor_2: "",
  switcher_icon_sensor: "",
  switcher_timer_values: "15,30,45,60",
  timer_values: "15,30,60",
  holiday_entity: "",
  shabbat_entity: "",
  holiday_active_states: "on,home,active,true",
  holiday_timer_policy: "allow",
  holiday_task_policy: "allow",
  hebcal_local_enabled: true,
  hebcal_cache_path: "",
  hebcal_window_scope: "both",
  auto_entry_id: true,
  boiler_flow_image: "/local/boiler-card/boiler-flow.png",
  duration_entity: "",
  timer_entity: "",
  script_on_timed: "",
  script_on_continuous: "",
  script_off: "",
  integration_entry_id: "",
  service_run_timed: "boiler_manager.run_timed",
  service_on_continuous: "boiler_manager.turn_on_continuous",
  service_off: "boiler_manager.turn_off",
  service_create_schedule: "boiler_manager.create_schedule",
  service_create_timeline: "boiler_manager.create_timeline",
  service_update_schedule: "boiler_manager.update_schedule",
  service_delete_schedule: "boiler_manager.delete_schedule",
  service_import_tasks: "boiler_manager.import_tasks",
  service_export_tasks: "boiler_manager.export_tasks",
  service_set_vacation_mode: "boiler_manager.set_vacation_mode",
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
    this._quickTimersRenderKey = "";
    this._tasksListRenderKey = "";
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
    this._hebcalCache = null;
    this._hebcalFetchInFlight = false;
    this._hebcalLastAttempt = 0;
    this._hebcalScheduledUrl = "";
    this._hebcalLastResolvedEntryId = "";
    this._hebcalFetchError = "";
    this._hebcalLastHttpStatus = 0;
    this._holidaysShabbatInlineBound = false;
    this._handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        this._closeTimerModal();
        this._closeScheduleModal();
        this._closeConfirmModal(false);
        this._closeImportSelectionModal(false);
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

        .holiday-shabbat-notice {
          margin: 0 0 4px;
          padding: 6px 10px;
          border-radius: 9px;
          border: 1px solid rgba(143, 192, 255, 0.78);
          background: linear-gradient(165deg, rgba(86, 146, 222, 0.3), rgba(43, 102, 176, 0.26));
          color: #f2f8ff;
          font-size: 0.74rem;
          font-weight: 900;
          text-align: center;
          letter-spacing: 0.01em;
          text-shadow: 0 1px 1px rgba(12, 31, 58, 0.45);
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

        .holidays-shabbat-card {
          gap: 10px;
          min-height: 120px;
        }

        .holidays-shabbat-status {
          margin: 0;
          padding: 6px 10px;
          border-radius: 9px;
          border: 1px solid rgba(143, 192, 255, 0.68);
          background: linear-gradient(165deg, rgba(90, 155, 231, 0.25), rgba(38, 99, 175, 0.24));
          color: #eff7ff;
          font-size: 0.85rem;
          font-weight: 800;
          text-align: center;
        }

        .holidays-shabbat-status.inactive {
          border-color: rgba(170, 187, 208, 0.52);
          background: linear-gradient(165deg, rgba(145, 160, 183, 0.2), rgba(101, 117, 140, 0.2));
          color: rgba(234, 241, 252, 0.86);
        }

        .holidays-shabbat-sources-line {
          margin: 0;
          font-size: 0.76rem;
          line-height: 1.35;
          color: rgba(200, 216, 240, 0.88);
          word-break: break-word;
        }

        .holidays-shabbat-settings-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          align-items: stretch;
        }

        .holidays-shabbat-setting {
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 0;
          min-height: 72px;
        }

        .holidays-shabbat-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: rgba(202, 220, 244, 0.9);
        }

        .holidays-shabbat-hebcal-block {
          margin-top: 6px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .holidays-shabbat-hebcal-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .holidays-shabbat-hebcal-meta {
          font-size: 0.74rem;
          font-weight: 600;
          color: rgba(200, 216, 240, 0.92);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          direction: ltr;
          unicode-bidi: isolate;
          text-align: left;
          display: block;
          line-height: 1.35;
          word-break: break-word;
        }

        .holidays-shabbat-hebcal-meta.error {
          color: #ffb4a8;
        }

        .holidays-shabbat-policy-select {
          width: 100%;
          max-width: 100%;
          min-height: 40px;
          border-radius: 10px;
          border: 1px solid rgba(120, 140, 170, 0.35);
          background: rgba(20, 32, 52, 0.55);
          color: #eef5ff;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 6px 10px;
          box-sizing: border-box;
          margin-top: auto;
        }

        .holidays-shabbat-windows-section {
          margin-top: 4px;
          min-height: 0;
        }

        .holidays-shabbat-windows-head {
          margin-bottom: 4px;
        }

        .holidays-shabbat-windows-title {
          font-size: 0.72rem;
          font-weight: 700;
          color: rgba(210, 224, 248, 0.95);
        }

        .holidays-shabbat-window-list {
          max-height: min(42vh, 280px);
          overflow-y: auto;
          overflow-x: hidden;
          border: 1px solid rgba(120, 140, 170, 0.35);
          border-radius: 10px;
          background: rgba(6, 12, 22, 0.45);
          -webkit-overflow-scrolling: touch;
        }

        .holidays-shabbat-windows-empty {
          padding: 10px 8px;
          font-size: 0.78rem;
          color: rgba(190, 206, 230, 0.85);
          text-align: center;
        }

        .holidays-shabbat-window-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 6px 10px;
          padding: 7px 8px;
          border-bottom: 1px solid rgba(120, 140, 170, 0.18);
          align-items: center;
          font-size: 0.76rem;
        }

        .holidays-shabbat-window-row:last-child {
          border-bottom: none;
        }

        .holidays-shabbat-window-main {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .holidays-shabbat-window-name {
          font-weight: 700;
          color: #eef5ff;
          line-height: 1.25;
        }

        .holidays-shabbat-window-range {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          direction: ltr;
          text-align: start;
          unicode-bidi: isolate;
          font-size: 0.68rem;
          color: rgba(186, 202, 228, 0.88);
        }

        .holidays-shabbat-window-badges {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 3px;
          flex-shrink: 0;
        }

        .holidays-shabbat-badge {
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 0.62rem;
          font-weight: 800;
          white-space: nowrap;
        }

        .holidays-shabbat-badge-kind-shabbat {
          background: rgba(100, 140, 255, 0.32);
          color: #e8f0ff;
        }

        .holidays-shabbat-badge-kind-holiday {
          background: rgba(255, 170, 90, 0.28);
          color: #fff4e8;
        }

        .holidays-shabbat-badge-state-active {
          background: rgba(60, 180, 120, 0.35);
          color: #e8fff4;
        }

        .holidays-shabbat-badge-state-past {
          background: rgba(120, 130, 150, 0.28);
          color: rgba(230, 236, 248, 0.82);
        }

        .holidays-shabbat-badge-state-upcoming {
          background: rgba(90, 160, 220, 0.25);
          color: #e8f4ff;
        }

        .holidays-shabbat-footnote {
          margin: 8px 0 0;
          font-size: 0.72rem;
          line-height: 1.4;
          color: rgba(185, 200, 225, 0.82);
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
        .tasks-mode-btn[disabled] {
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
          padding-bottom: calc(132px + env(safe-area-inset-bottom, 0px));
          box-sizing: border-box;
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

        .schedule-time-meta-row {
          grid-template-columns: minmax(0, 1fr) minmax(96px, 120px);
          position: relative;
          z-index: 2;
        }

        .schedule-time-offset-input {
          direction: ltr;
          text-align: center;
          font-variant-numeric: tabular-nums;
        }

        .schedule-inline-toggle {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 26px;
          user-select: none;
        }

        .schedule-inline-toggle-input {
          width: 16px;
          height: 16px;
          margin: 0;
          accent-color: #5fb5df;
          cursor: pointer;
          flex: 0 0 auto;
        }

        .schedule-inline-toggle-text {
          font-size: 0.73rem;
          color: #dce7f5;
          font-weight: 700;
          cursor: pointer;
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
        .schedule-date-row[hidden],
        .schedule-condition-row[hidden],
        .schedule-time-meta-row[hidden],
        .timeline-point-mode-row[hidden] {
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
          grid-template-columns: minmax(0, 1fr) minmax(118px, 154px) minmax(74px, 86px);
          gap: 6px;
          align-items: center;
          min-width: 0;
        }

        .timeline-point-time-group {
          display: grid;
          gap: 6px;
          min-width: 0;
        }

        .timeline-point-time-row[hidden] {
          display: none;
        }

        .timeline-point-time,
        .timeline-point-duration,
        .timeline-point-remove {
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .timeline-point-duration {
          max-width: 154px;
          justify-self: stretch;
          align-self: end;
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
          align-self: end;
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
          display: flex;
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
          flex: 1 1 0;
          border: 1px solid rgba(172, 197, 223, 0.55);
          border-radius: 10px;
          min-height: 42px;
          min-width: 0;
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

        .timer-modal-panel.menu-mode-tasks .timer-modal-head,
        .timer-modal-panel.menu-mode-import-export .timer-modal-head,
        .timer-modal-panel.menu-mode-holidays-shabbat .timer-modal-head {
          grid-template-areas:
            "title"
            "toggle";
          row-gap: 6px;
          margin-bottom: 8px;
        }

        .timer-modal-panel.menu-mode-tasks .timer-modal-actions,
        .timer-modal-panel.menu-mode-import-export .timer-modal-actions,
        .timer-modal-panel.menu-mode-holidays-shabbat .timer-modal-actions {
          position: static;
          width: 100%;
          height: 0;
          min-height: 0;
          overflow: visible;
          padding: 0;
          margin: 0;
          pointer-events: none;
        }

        .timer-modal-panel.menu-mode-tasks #timer-close-btn,
        .timer-modal-panel.menu-mode-import-export #timer-close-btn,
        .timer-modal-panel.menu-mode-holidays-shabbat #timer-close-btn {
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
            align-items: flex-end;
            padding: 6px;
          }

          #confirm-modal {
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
          .timer-modal-panel.menu-mode-holidays-shabbat .timer-modal-head {
            row-gap: 6px;
            margin-bottom: 6px;
          }

          .timer-grid {
            grid-template-columns: repeat(auto-fit, minmax(118px, 1fr));
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

          .timeline-point-duration {
            max-width: none;
            align-self: stretch;
          }

          .schedule-inline-toggle {
            min-height: 30px;
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

          .holidays-shabbat-settings-row {
            grid-template-columns: minmax(0, 1fr);
          }

          .holidays-shabbat-setting {
            min-height: 0;
          }

          .holidays-shabbat-status {
            font-size: 0.8rem;
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

          .schedule-days,
          .schedule-months {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 6px;
          }

          .schedule-form {
            padding-bottom: calc(146px + env(safe-area-inset-bottom, 0px));
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
              <p class="active-task-notice" id="active-task-notice" hidden></p>
              <p class="vacation-notice" id="vacation-notice" hidden></p>
              <p class="holiday-shabbat-notice" id="holiday-shabbat-notice" hidden></p>
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
              <button type="button" class="menu-mode-btn" id="modal-mode-holidays-shabbat-btn">Holidays &amp; Shabbat</button>
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
          <div class="menu-view" id="modal-holidays-shabbat-view" hidden>
            <div class="tasks-card holidays-shabbat-card">
              <p class="tasks-title" id="holidays-shabbat-title">Holidays &amp; Shabbat</p>
              <p class="holidays-shabbat-status inactive" id="holidays-shabbat-status">Inactive</p>
              <p class="holidays-shabbat-sources-line" id="holidays-shabbat-sources-line"></p>
              <div class="holidays-shabbat-settings-row">
                <div class="holidays-shabbat-setting">
                  <span class="holidays-shabbat-label" id="holidays-shabbat-timer-rule-label">Timer Rule</span>
                  <select id="holidays-shabbat-timer-policy" class="holidays-shabbat-policy-select" aria-label="Timer policy"></select>
                </div>
                <div class="holidays-shabbat-setting">
                  <span class="holidays-shabbat-label" id="holidays-shabbat-task-rule-label">Task Rule</span>
                  <select id="holidays-shabbat-task-policy" class="holidays-shabbat-policy-select" aria-label="Task policy"></select>
                </div>
              </div>
              <div class="holidays-shabbat-hebcal-block" id="holidays-shabbat-hebcal-block" hidden>
                <div class="holidays-shabbat-hebcal-row">
                  <span class="holidays-shabbat-label" id="holidays-shabbat-hebcal-label">Hebcal</span>
                  <span class="holidays-shabbat-hebcal-meta" id="holidays-shabbat-hebcal-meta" dir="ltr"></span>
                </div>
                <div class="holidays-shabbat-setting" id="holidays-shabbat-hebcal-scope-wrap" hidden>
                  <span class="holidays-shabbat-label" id="holidays-shabbat-hebcal-scope-label"></span>
                  <select id="holidays-shabbat-hebcal-scope" class="holidays-shabbat-policy-select" aria-label="Hebcal scope"></select>
                </div>
              </div>
              <div class="holidays-shabbat-windows-section" id="holidays-shabbat-windows-section" hidden>
                <div class="holidays-shabbat-windows-head">
                  <span class="holidays-shabbat-windows-title" id="holidays-shabbat-windows-title"></span>
                </div>
                <div class="holidays-shabbat-window-list" id="holidays-shabbat-window-list" role="list"></div>
              </div>
              <p class="holidays-shabbat-footnote" id="holidays-shabbat-footnote"></p>
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
              <div class="schedule-control-row">
                <input class="schedule-input" id="schedule-name-input" type="text" maxlength="80" />
                <button type="button" class="schedule-clear-btn" id="schedule-name-clear-btn" aria-label="Clear">✕</button>
              </div>
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
                  <label class="schedule-inline-toggle" for="schedule-start-sun-enabled-input">
                    <input
                      class="schedule-inline-toggle-input"
                      id="schedule-start-sun-enabled-input"
                      type="checkbox"
                    />
                    <span class="schedule-inline-toggle-text" id="schedule-start-sun-enabled-label">Use sunrise/sunset</span>
                  </label>
                  <div class="schedule-control-row schedule-time-meta-row" id="schedule-start-meta-row" hidden>
                    <select class="schedule-select schedule-time-mode-input" id="schedule-start-mode-input">
                      <option value="fixed">Fixed Time</option>
                      <option value="sunrise">Sunrise</option>
                      <option value="sunset">Sunset</option>
                    </select>
                    <input
                      class="schedule-input schedule-time-offset-input"
                      id="schedule-start-offset-input"
                      type="number"
                      min="-120"
                      max="120"
                      step="1"
                      value="0"
                    />
                  </div>
                  <div class="schedule-control-row schedule-time-input-row" id="schedule-start-time-row">
                    <input class="schedule-input schedule-time-input" id="schedule-start-input" type="time" dir="ltr" />
                    <button type="button" class="schedule-clear-btn" id="schedule-start-clear-btn" aria-label="Clear">✕</button>
                  </div>
                </div>
                <div class="schedule-field">
                  <label class="schedule-label" for="schedule-end-input" id="schedule-end-label">End</label>
                  <label class="schedule-inline-toggle" for="schedule-end-sun-enabled-input">
                    <input
                      class="schedule-inline-toggle-input"
                      id="schedule-end-sun-enabled-input"
                      type="checkbox"
                    />
                    <span class="schedule-inline-toggle-text" id="schedule-end-sun-enabled-label">Use sunrise/sunset</span>
                  </label>
                  <div class="schedule-control-row schedule-time-meta-row" id="schedule-end-meta-row" hidden>
                    <select class="schedule-select schedule-time-mode-input" id="schedule-end-mode-input">
                      <option value="fixed">Fixed Time</option>
                      <option value="sunrise">Sunrise</option>
                      <option value="sunset">Sunset</option>
                    </select>
                    <input
                      class="schedule-input schedule-time-offset-input"
                      id="schedule-end-offset-input"
                      type="number"
                      min="-120"
                      max="120"
                      step="1"
                      value="0"
                    />
                  </div>
                  <div class="schedule-control-row schedule-time-input-row" id="schedule-end-time-row">
                    <input class="schedule-input schedule-time-input" id="schedule-end-input" type="time" dir="ltr" />
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
              <label class="schedule-inline-toggle" for="schedule-condition-enabled-input">
                <input
                  class="schedule-inline-toggle-input"
                  id="schedule-condition-enabled-input"
                  type="checkbox"
                />
                <span class="schedule-inline-toggle-text" id="schedule-condition-enabled-label">Enable Condition</span>
              </label>
              <div class="schedule-time-row schedule-condition-row" id="schedule-condition-row" hidden>
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
      holidayShabbatNotice: this.shadowRoot.getElementById("holiday-shabbat-notice"),
      boilerStageSub: this.shadowRoot.getElementById("boiler-stage-sub"),
      boilerProgressFill: this.shadowRoot.getElementById("boiler-progress-fill"),
      countdownLabel: this.shadowRoot.getElementById("countdown-label"),
      countdownValue: this.shadowRoot.getElementById("countdown-value"),
      sensorsRow: this.shadowRoot.getElementById("sensors-row"),
      quickTimers: this.shadowRoot.getElementById("quick-timers"),
      quickTimerBtns: [],
      quickOffBtn: null,
      tasksTitle: this.shadowRoot.getElementById("tasks-title"),
      importExportTitle: this.shadowRoot.getElementById("import-export-title"),
      holidaysShabbatTitle: this.shadowRoot.getElementById("holidays-shabbat-title"),
      holidaysShabbatStatus: this.shadowRoot.getElementById("holidays-shabbat-status"),
      holidaysShabbatSourcesLine: this.shadowRoot.getElementById("holidays-shabbat-sources-line"),
      holidaysShabbatTimerRuleLabel: this.shadowRoot.getElementById("holidays-shabbat-timer-rule-label"),
      holidaysShabbatTimerPolicySelect: this.shadowRoot.getElementById("holidays-shabbat-timer-policy"),
      holidaysShabbatTaskRuleLabel: this.shadowRoot.getElementById("holidays-shabbat-task-rule-label"),
      holidaysShabbatTaskPolicySelect: this.shadowRoot.getElementById("holidays-shabbat-task-policy"),
      holidaysShabbatWindowsSection: this.shadowRoot.getElementById("holidays-shabbat-windows-section"),
      holidaysShabbatWindowsTitle: this.shadowRoot.getElementById("holidays-shabbat-windows-title"),
      holidaysShabbatWindowList: this.shadowRoot.getElementById("holidays-shabbat-window-list"),
      holidaysShabbatFootnote: this.shadowRoot.getElementById("holidays-shabbat-footnote"),
      holidaysShabbatHebcalBlock: this.shadowRoot.getElementById("holidays-shabbat-hebcal-block"),
      holidaysShabbatHebcalLabel: this.shadowRoot.getElementById("holidays-shabbat-hebcal-label"),
      holidaysShabbatHebcalMeta: this.shadowRoot.getElementById("holidays-shabbat-hebcal-meta"),
      holidaysShabbatHebcalScopeWrap: this.shadowRoot.getElementById("holidays-shabbat-hebcal-scope-wrap"),
      holidaysShabbatHebcalScopeLabel: this.shadowRoot.getElementById("holidays-shabbat-hebcal-scope-label"),
      holidaysShabbatHebcalScopeSelect: this.shadowRoot.getElementById("holidays-shabbat-hebcal-scope"),
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
      timerModalTitle: this.shadowRoot.getElementById("timer-modal-title"),
      timerPageControls: this.shadowRoot.getElementById("timer-page-controls"),
      timerPagePrevBtn: this.shadowRoot.getElementById("timer-page-prev-btn"),
      timerPageNextBtn: this.shadowRoot.getElementById("timer-page-next-btn"),
      timerPageIndicator: this.shadowRoot.getElementById("timer-page-indicator"),
      modalModeTimerBtn: this.shadowRoot.getElementById("modal-mode-timer-btn"),
      modalModeTasksBtn: this.shadowRoot.getElementById("modal-mode-tasks-btn"),
      modalModeImportExportBtn: this.shadowRoot.getElementById("modal-mode-import-export-btn"),
      modalModeHolidaysShabbatBtn: this.shadowRoot.getElementById("modal-mode-holidays-shabbat-btn"),
      modalTimerView: this.shadowRoot.getElementById("modal-timer-view"),
      modalTasksView: this.shadowRoot.getElementById("modal-tasks-view"),
      modalImportExportView: this.shadowRoot.getElementById("modal-import-export-view"),
      modalHolidaysShabbatView: this.shadowRoot.getElementById("modal-holidays-shabbat-view"),
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
      scheduleStartSunEnabledInput: this.shadowRoot.getElementById("schedule-start-sun-enabled-input"),
      scheduleStartSunEnabledLabel: this.shadowRoot.getElementById("schedule-start-sun-enabled-label"),
      scheduleStartMetaRow: this.shadowRoot.getElementById("schedule-start-meta-row"),
      scheduleStartModeInput: this.shadowRoot.getElementById("schedule-start-mode-input"),
      scheduleStartOffsetInput: this.shadowRoot.getElementById("schedule-start-offset-input"),
      scheduleStartTimeRow: this.shadowRoot.getElementById("schedule-start-time-row"),
      scheduleEndSunEnabledInput: this.shadowRoot.getElementById("schedule-end-sun-enabled-input"),
      scheduleEndSunEnabledLabel: this.shadowRoot.getElementById("schedule-end-sun-enabled-label"),
      scheduleEndMetaRow: this.shadowRoot.getElementById("schedule-end-meta-row"),
      scheduleEndModeInput: this.shadowRoot.getElementById("schedule-end-mode-input"),
      scheduleEndOffsetInput: this.shadowRoot.getElementById("schedule-end-offset-input"),
      scheduleEndTimeRow: this.shadowRoot.getElementById("schedule-end-time-row"),
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
      scheduleConditionEnabledInput: this.shadowRoot.getElementById("schedule-condition-enabled-input"),
      scheduleConditionEnabledLabel: this.shadowRoot.getElementById("schedule-condition-enabled-label"),
      scheduleConditionRow: this.shadowRoot.getElementById("schedule-condition-row"),
      scheduleConditionStateLabel: this.shadowRoot.getElementById("schedule-condition-state-label"),
      timelinePointsLabel: this.shadowRoot.getElementById("timeline-points-label"),
      scheduleNameInput: this.shadowRoot.getElementById("schedule-name-input"),
      scheduleNameClearBtn: this.shadowRoot.getElementById("schedule-name-clear-btn"),
      scheduleTypeInput: this.shadowRoot.getElementById("schedule-type-input"),
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
    };

    this._elements.timerMenuBtn.addEventListener("click", () => this._openTimerModal());
    this._elements.timerCloseBtn.addEventListener("click", () => this._closeTimerModal());
    this._elements.timerModalBackdrop.addEventListener("click", () => this._closeTimerModal());
    this._elements.timerPagePrevBtn.addEventListener("click", () => this._changeTimerPage(-1));
    this._elements.timerPageNextBtn.addEventListener("click", () => this._changeTimerPage(1));
    this._elements.modalModeTimerBtn?.addEventListener("click", () => this._setMenuMode("timer"));
    this._elements.modalModeTasksBtn?.addEventListener("click", () => this._setMenuMode("tasks"));
    this._elements.modalModeImportExportBtn?.addEventListener("click", () => this._setMenuMode("import_export"));
    this._elements.modalModeHolidaysShabbatBtn?.addEventListener("click", () => this._setMenuMode("holidays_shabbat"));
    this._elements.tasksAddBtn.addEventListener("click", () => this._openScheduleModal());
    this._elements.tasksVacationBtn?.addEventListener("click", () => this._toggleVacationMode());
    this._elements.tasksImportBtn?.addEventListener("click", () => this._openImportTasksFilePicker());
    this._elements.tasksExportBtn?.addEventListener("click", () => this._exportTasksFromCard());
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
    this._elements.scheduleTypeWindowBtn?.addEventListener("click", () => this._setScheduleType("window"));
    this._elements.scheduleTypeTimelineBtn?.addEventListener("click", () => this._setScheduleType("timeline"));
    this._elements.schedulePanelRecurrenceBtn?.addEventListener("click", () => this._setSchedulePanel("recurrence"));
    this._elements.schedulePanelDaysBtn?.addEventListener("click", () => this._setSchedulePanel("days"));
    this._elements.schedulePanelMonthsBtn?.addEventListener("click", () => this._setSchedulePanel("months"));
    this._elements.scheduleRecurrenceForeverBtn?.addEventListener("click", () => this._setScheduleRecurrence("forever"));
    this._elements.scheduleRecurrenceOnceBtn?.addEventListener("click", () => this._setScheduleRecurrence("once"));
    this._elements.scheduleRecurrenceRangeBtn?.addEventListener("click", () => this._setScheduleRecurrence("range"));
    this._elements.scheduleConditionEntityInput?.addEventListener("input", () => this._onConditionEntityInputChanged());
    this._elements.scheduleConditionEntityInput?.addEventListener("change", () => this._onConditionEntityChanged());
    this._elements.scheduleConditionOperatorInput?.addEventListener("change", () => this._onConditionOperatorChanged());
    this._elements.scheduleConditionEnabledInput?.addEventListener("change", () => this._syncScheduleConditionFields());
    this._elements.scheduleConditionEnabledInput?.addEventListener("input", () => this._syncScheduleConditionFields());
    this._elements.scheduleStartSunEnabledInput?.addEventListener("change", () => this._syncScheduleSunTimeFields("start"));
    this._elements.scheduleStartSunEnabledInput?.addEventListener("input", () => this._syncScheduleSunTimeFields("start"));
    this._elements.scheduleEndSunEnabledInput?.addEventListener("change", () => this._syncScheduleSunTimeFields("end"));
    this._elements.scheduleEndSunEnabledInput?.addEventListener("input", () => this._syncScheduleSunTimeFields("end"));
    this._elements.scheduleStartModeInput?.addEventListener("change", () => this._syncScheduleSunTimeFields("start"));
    this._elements.scheduleStartModeInput?.addEventListener("input", () => this._syncScheduleSunTimeFields("start"));
    this._elements.scheduleEndModeInput?.addEventListener("change", () => this._syncScheduleSunTimeFields("end"));
    this._elements.scheduleEndModeInput?.addEventListener("input", () => this._syncScheduleSunTimeFields("end"));
    this._elements.scheduleStartOffsetInput?.addEventListener("input", () => this._clampScheduleSunOffset("start"));
    this._elements.scheduleEndOffsetInput?.addEventListener("input", () => this._clampScheduleSunOffset("end"));
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
    this._syncScheduleConditionFields();
    this._setSchedulePanel(this._schedulePanel);
    this._setImportMode(this._importMode);
    this._setMenuMode(this._menuMode);
  }

  _sync() {
    if (!this._hass || !this._elements.title) {
      return;
    }

    const resolvedEntry = this._resolvedIntegrationEntryId();
    if (resolvedEntry !== this._hebcalLastResolvedEntryId) {
      this._hebcalLastResolvedEntryId = resolvedEntry;
      if (resolvedEntry) {
        this._hebcalLastAttempt = 0;
      }
    }
    this._maybeRefreshHebcalCache();

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
    if (this._elements.tasksTitle) {
      this._elements.tasksTitle.textContent = this._t("tasks_title");
    }
    if (this._elements.importExportTitle) {
      this._elements.importExportTitle.textContent = this._t("menu_import_export");
    }
    if (this._elements.holidaysShabbatTitle) {
      this._elements.holidaysShabbatTitle.textContent = this._t("holidays_shabbat_title");
    }
    if (this._elements.holidaysShabbatTimerRuleLabel) {
      this._elements.holidaysShabbatTimerRuleLabel.textContent = this._t("holidays_shabbat_timer_rule_label");
    }
    if (this._elements.holidaysShabbatTaskRuleLabel) {
      this._elements.holidaysShabbatTaskRuleLabel.textContent = this._t("holidays_shabbat_task_rule_label");
    }
    if (this._elements.holidaysShabbatFootnote) {
      this._elements.holidaysShabbatFootnote.textContent = `${this._t("holidays_shabbat_description")} ${this._t("holidays_shabbat_practical_hint")}`.trim();
    }
    const hasTasksView = this._hasTasksView();
    const hasImportExportView = this._hasImportExportView();
    const hasHolidaysShabbatView = this._hasHolidaysShabbatView();
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
    if (this._elements.modalModeHolidaysShabbatBtn) {
      this._elements.modalModeHolidaysShabbatBtn.textContent = this._t("menu_holidays_shabbat");
      this._elements.modalModeHolidaysShabbatBtn.hidden = !hasHolidaysShabbatView;
    }
    this._syncHolidaysShabbatPanel();
    const scheduleModalOpen = !!(this._elements.scheduleModal && !this._elements.scheduleModal.hidden);
    if (!scheduleModalOpen) {
      this._syncScheduleSunModeOptionLabels();
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
      if (this._elements.scheduleStartSunEnabledLabel) {
        this._elements.scheduleStartSunEnabledLabel.textContent = this._t("schedule_sun_toggle");
      }
      if (this._elements.scheduleEndSunEnabledLabel) {
        this._elements.scheduleEndSunEnabledLabel.textContent = this._t("schedule_sun_toggle");
      }
      if (this._elements.scheduleStartSunEnabledInput) {
        this._elements.scheduleStartSunEnabledInput.setAttribute("aria-label", `${this._t("task_start")} - ${this._t("schedule_sun_toggle")}`);
      }
      if (this._elements.scheduleEndSunEnabledInput) {
        this._elements.scheduleEndSunEnabledInput.setAttribute("aria-label", `${this._t("task_end")} - ${this._t("schedule_sun_toggle")}`);
      }
      if (this._elements.scheduleStartModeInput) {
        this._elements.scheduleStartModeInput.setAttribute(
          "aria-label",
          `${this._t("task_start")} - ${this._t("schedule_time_mode")}`
        );
      }
      if (this._elements.scheduleEndModeInput) {
        this._elements.scheduleEndModeInput.setAttribute(
          "aria-label",
          `${this._t("task_end")} - ${this._t("schedule_time_mode")}`
        );
      }
      if (this._elements.scheduleStartOffsetInput) {
        this._elements.scheduleStartOffsetInput.setAttribute(
          "aria-label",
          `${this._t("task_start")} - ${this._t("schedule_time_offset")}`
        );
      }
      if (this._elements.scheduleEndOffsetInput) {
        this._elements.scheduleEndOffsetInput.setAttribute(
          "aria-label",
          `${this._t("task_end")} - ${this._t("schedule_time_offset")}`
        );
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
      if (this._elements.scheduleConditionEnabledLabel) {
        this._elements.scheduleConditionEnabledLabel.textContent = this._t("condition_enabled_toggle");
      }
      if (this._elements.scheduleConditionEnabledInput) {
        this._elements.scheduleConditionEnabledInput.setAttribute("aria-label", this._t("condition_enabled_toggle"));
      }
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
      this._setSchedulePanel(this._schedulePanel);
    }
    this._setMenuMode(this._menuMode);
    const flowImage = cfg.boiler_flow_image || "/local/boiler-card/boiler-flow.png";
    if (this._elements.boilerMainImage?.getAttribute("src") !== flowImage) {
      this._elements.boilerMainImage.setAttribute("src", flowImage);
    }
    this._syncTimerPicker(duration, boiler, timer, managerMode);
    this._syncHeatingVisual(boiler, timer, duration, managerMode);
    this._syncStatus(boiler, timer, managerMode);
    this._syncCountdown(timer, boiler, managerMode);
    this._syncVacationNotice(managerMode);
    this._syncHolidayShabbatNotice();
    this._syncSensors();
    this._syncActiveTaskNotice();
    this._syncUpcomingTaskNotice();
    this._syncError(boiler);
    this._syncControls(boiler, managerMode);
    this._syncScheduleList();
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

    if (legacyTimerActive || builtInTimedActive) {
      this._elements.subtitle.textContent = this._t("subtitle_heating_timer");
    } else if (isOn) {
      this._elements.subtitle.textContent = this._t("subtitle_heating_continuous");
    } else {
      this._elements.subtitle.textContent = this._t("subtitle_ready");
    }
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

    if (this._isBuiltInTimedMode(managerMode)) {
      this._elements.countdownLabel.textContent = this._t("countdown_remaining");
      this._elements.countdownValue.textContent = this._formatSeconds(this._managerTimedRemainingSeconds(managerMode));
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
      button.disabled = timedButtonsDisabled || !hasOption || vacationEnabled;
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
    if (colorProgress < 0.72) {
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
    // 15m timers stay literal. Longer timers ramp color progress differently so
    // blue->orange->red remains believable across short/long durations.
    const minHeat = 15;
    const maxHeat = 68;
    const normalized = this._clamp((totalMinutes - minHeat) / 135, 0, 1);
    const curve = Math.pow(normalized, 0.62);
    return this._clamp(minHeat + (maxHeat - minHeat) * curve, minHeat, maxHeat);
  }

  _stagedHeatGradient(colorProgress) {
    const p = this._clamp(colorProgress, 0, 1);
    const blue = "#2b7fff";
    const orange = "#f97316";
    const red = "#dc2626";

    if (p < 0.3) {
      return `linear-gradient(90deg, ${blue} 0%, ${blue} 100%)`;
    }

    const orangePhase = this._clamp((p - 0.3) / 0.35, 0, 1);
    const redPhase = this._clamp((p - 0.65) / 0.35, 0, 1);

    let blueWidth = 100 - (orangePhase * 62) - (redPhase * 20);
    let orangeWidth = (orangePhase * 62) - (redPhase * 14);
    let redWidth = redPhase * 34;

    blueWidth = this._clamp(blueWidth, 10, 100);
    orangeWidth = this._clamp(orangeWidth, 0, 80);
    redWidth = this._clamp(redWidth, 0, 45);

    const total = blueWidth + orangeWidth + redWidth;
    if (total < 100) {
      blueWidth += 100 - total;
    } else if (total > 100) {
      const scale = 100 / total;
      blueWidth *= scale;
      orangeWidth *= scale;
      redWidth *= scale;
    }

    const blueEnd = blueWidth;
    const orangeEnd = blueEnd + orangeWidth;
    const blend = 3.8;

    if (redWidth <= 0.01) {
      return `linear-gradient(90deg, ${blue} 0%, ${blue} ${Math.max(0, blueEnd - blend)}%, ${orange} ${Math.min(100, blueEnd + blend)}%, ${orange} 100%)`;
    }

    return `linear-gradient(90deg, ${blue} 0%, ${blue} ${Math.max(0, blueEnd - blend)}%, ${orange} ${Math.min(100, blueEnd + blend)}%, ${orange} ${Math.max(0, orangeEnd - blend)}%, ${red} ${Math.min(100, orangeEnd + blend)}%, ${red} 100%)`;
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

    if (celsiusValue <= 42) {
      const primary = "#f97316";
      return {
        label: this._t("stage_warm"),
        primaryColor: primary,
        secondaryColor: this._mixColors(primary, "#ffe2c7", 0.35),
        glowColor: this._hexToRgba(primary, 0.33),
      };
    }

    if (celsiusValue < 52) {
      const primary = "#ea6a15";
      return {
        label: this._t("stage_hot"),
        primaryColor: primary,
        secondaryColor: this._mixColors(primary, "#ffd7bf", 0.35),
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
    // Explicit fixed bands from 0C with blue->orange->red mapping.
    if (celsiusValue <= 0) {
      return 0;
    }
    if (celsiusValue <= 30) {
      return this._clamp((celsiusValue / 30) * 0.58, 0, 0.58);
    }
    if (celsiusValue <= 42) {
      return this._clamp(0.58 + ((celsiusValue - 30) / 12) * 0.2, 0.58, 0.78);
    }
    if (celsiusValue < 52) {
      return this._clamp(0.78 + ((celsiusValue - 42) / 10) * 0.14, 0.78, 0.92);
    }
    if (celsiusValue < 60) {
      return this._clamp(0.92 + ((celsiusValue - 52) / 8) * 0.08, 0.92, 1);
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
    if (this._timerActionBlockedByHoliday({ showMessage: true })) {
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
    if (this._timerActionBlockedByHoliday({ showMessage: true })) {
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

  _hasHolidaysShabbatView() {
    return true;
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

  _normalizedIntegrationEntryId() {
    let raw = String(this._config?.integration_entry_id || "").trim();
    raw = raw.replace(/^["']+|["']+$/g, "");
    return raw.trim();
  }

  /** Hebcal fetch is on unless explicitly turned off (handles unset / empty from older YAML). */
  _isHebcalLocalFetchEnabled() {
    const v = this._config?.hebcal_local_enabled;
    if (v === false) {
      return false;
    }
    if (v === true) {
      return true;
    }
    const s = String(v ?? "").trim().toLowerCase();
    if (s === "false" || s === "0" || s === "off" || s === "no") {
      return false;
    }
    return true;
  }

  _isAutoEntryIdEnabled() {
    const v = this._config?.auto_entry_id;
    if (v === false) {
      return false;
    }
    const s = String(v ?? "").trim().toLowerCase();
    if (s === "false" || s === "0" || s === "off" || s === "no") {
      return false;
    }
    return true;
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

  _resolvedIntegrationEntryId() {
    const direct = this._normalizedIntegrationEntryId();
    if (direct) {
      return direct;
    }
    if (!this._isAutoEntryIdEnabled() || !this._hass?.states) {
      return "";
    }
    const mgrCandidates = this._boilerManagerCandidates();
    const boiler = String(this._config?.boiler_entity || "").trim().toLowerCase();

    if (boiler && mgrCandidates.length > 0) {
      const forBoiler = mgrCandidates.filter(
        (c) => String(c.boilerEntity || "").trim().toLowerCase() === boiler,
      );
      const idSet = new Set(
        forBoiler.map((c) => String(c.entryId || "").trim()).filter((id) => id.length > 0),
      );
      if (idSet.size === 1) {
        return [...idSet][0];
      }
    }

    if (mgrCandidates.length === 1 && mgrCandidates[0].entryId) {
      return String(mgrCandidates[0].entryId).trim();
    }
    return this._entryIdFromModeSensorsFallback();
  }

  /** When generic candidate scan misses, match Boiler Manager mode sensors (entry_id on attributes). */
  _entryIdFromModeSensorsFallback() {
    if (!this._hass?.states) {
      return "";
    }
    const boiler = String(this._config?.boiler_entity || "").trim().toLowerCase();
    let list = Object.values(this._hass.states)
      .filter((s) => s?.entity_id?.startsWith("sensor."))
      .filter((s) => {
        const a = s?.attributes || {};
        return (
          a.active_tasks_count !== undefined
          && String(a.entry_id || "").trim().length > 0
          && String(a.boiler_entity || "").includes(".")
        );
      });
    if (boiler) {
      list = list.filter(
        (s) => String(s?.attributes?.boiler_entity || "").trim().toLowerCase() === boiler,
      );
    }
    const ids = [...new Set(list.map((s) => String(s.attributes.entry_id || "").trim()).filter(Boolean))];
    if (ids.length !== 1) {
      return "";
    }
    return ids[0];
  }

  _hebcalCacheUrl() {
    const manual = String(this._config?.hebcal_cache_path || "").trim();
    if (manual) {
      return manual;
    }
    if (!this._isHebcalLocalFetchEnabled()) {
      return "";
    }
    const entryId = this._resolvedIntegrationEntryId();
    if (!entryId) {
      return "";
    }
    return `/local/boiler-card/hebcal-${entryId}.json`;
  }

  _maybeRefreshHebcalCache() {
    const url = this._hebcalCacheUrl();
    if (!this._hass) {
      return;
    }
    if (!url) {
      this._hebcalCache = null;
      this._hebcalFetchError = "";
      this._hebcalLastHttpStatus = 0;
      return;
    }
    const now = Date.now();
    if (url !== this._hebcalScheduledUrl) {
      this._hebcalScheduledUrl = url;
      this._hebcalLastAttempt = 0;
      this._hebcalCache = null;
      this._hebcalFetchError = "";
      this._hebcalLastHttpStatus = 0;
    }
    if (this._hebcalFetchInFlight) {
      return;
    }
    if (now - this._hebcalLastAttempt < 5 * 60 * 1000) {
      return;
    }
    this._hebcalFetchInFlight = true;
    this._hebcalLastAttempt = now;
    this._hebcalFetchError = "";
    const stamp = now;
    const sep = url.includes("?") ? "&" : "?";
    if (this.shadowRoot?.querySelector("ha-card")) {
      this._syncHolidaysShabbatPanel();
    }
    fetch(`${url}${sep}t=${stamp}`, { cache: "no-store" })
      .then(async (resp) => {
        this._hebcalLastHttpStatus = resp.status;
        if (!resp.ok) {
          const st = resp.statusText ? `${resp.status} ${resp.statusText}`.trim() : `HTTP ${resp.status}`;
          this._hebcalFetchError = st;
          this._hebcalCache = null;
          return;
        }
        let data;
        try {
          data = await resp.json();
        } catch (e) {
          this._hebcalFetchError = e?.message || this._t("holidays_shabbat_hebcal_meta_json_err");
          this._hebcalCache = null;
          return;
        }
        if (data && typeof data === "object") {
          this._hebcalFetchError = "";
          this._hebcalCache = data;
        } else {
          this._hebcalFetchError = this._t("holidays_shabbat_hebcal_meta_invalid_payload");
          this._hebcalCache = null;
        }
      })
      .catch((err) => {
        this._hebcalCache = null;
        this._hebcalFetchError = err?.message || String(err || "network");
      })
      .finally(() => {
        this._hebcalFetchInFlight = false;
        if (this._hass && this.shadowRoot?.querySelector("ha-card")) {
          const boiler = this._hass.states[this._config.boiler_entity];
          const timer = this._hass.states[this._config.timer_entity];
          const managerMode = this._boilerManagerModeEntity();
          this._maybeEnforceHolidayRules(managerMode, boiler, timer);
          this._syncHolidaysShabbatPanel();
          this._syncHolidayShabbatNotice();
        }
      });
  }

  _normalizeHebcalWindowScope(raw) {
    const s = String(raw ?? "both").trim().toLowerCase();
    if (s === "shabbat" || s === "shabbat_only") {
      return "shabbat";
    }
    if (s === "holiday" || s === "holidays" || s === "yom_tov" || s === "yom-tov") {
      return "holiday";
    }
    return "both";
  }

  _patchCardConfig(patch) {
    const next = { ...this._config, ...patch };
    this._config = next;
    this.dispatchEvent(new CustomEvent("config-changed", {
      bubbles: true,
      composed: true,
      detail: { config: next },
    }));
    this._sync();
  }

  _maybeBindHolidaysShabbatInlineControls() {
    if (this._holidaysShabbatInlineBound) {
      return;
    }
    const timerSel = this._elements.holidaysShabbatTimerPolicySelect;
    const taskSel = this._elements.holidaysShabbatTaskPolicySelect;
    const scopeSel = this._elements.holidaysShabbatHebcalScopeSelect;
    if (!timerSel || !taskSel || !scopeSel) {
      return;
    }
    this._holidaysShabbatInlineBound = true;
    timerSel.addEventListener("change", (event) => {
      const v = String(event?.target?.value || "allow").trim().toLowerCase();
      this._patchCardConfig({ holiday_timer_policy: v });
    });
    taskSel.addEventListener("change", (event) => {
      const v = String(event?.target?.value || "allow").trim().toLowerCase();
      this._patchCardConfig({ holiday_task_policy: v });
    });
    scopeSel.addEventListener("change", (event) => {
      const v = this._normalizeHebcalWindowScope(event?.target?.value);
      this._patchCardConfig({ hebcal_window_scope: v });
    });
  }

  _fillHolidayPolicySelect(select) {
    if (!select) {
      return;
    }
    const specs = [
      ["allow", "holiday_policy_allow"],
      ["block", "holiday_policy_block"],
      ["postpone", "holiday_policy_postpone"],
      ["force_off", "holiday_policy_force_off"],
    ];
    specs.forEach(([val, key], idx) => {
      let opt = select.options[idx];
      if (!opt) {
        opt = document.createElement("option");
        select.appendChild(opt);
      }
      opt.value = val;
      opt.textContent = this._t(key);
    });
    while (select.options.length > specs.length) {
      select.remove(select.options.length - 1);
    }
  }

  _fillHebcalScopeSelect(select) {
    if (!select) {
      return;
    }
    const specs = [
      ["both", "holidays_shabbat_hebcal_scope_both"],
      ["shabbat", "holidays_shabbat_hebcal_scope_shabbat"],
      ["holiday", "holidays_shabbat_hebcal_scope_holiday"],
    ];
    specs.forEach(([val, key], idx) => {
      let opt = select.options[idx];
      if (!opt) {
        opt = document.createElement("option");
        select.appendChild(opt);
      }
      opt.value = val;
      opt.textContent = this._t(key);
    });
    while (select.options.length > specs.length) {
      select.remove(select.options.length - 1);
    }
  }

  _syncHolidaysInlinePolicySelects() {
    this._fillHolidayPolicySelect(this._elements.holidaysShabbatTimerPolicySelect);
    this._fillHolidayPolicySelect(this._elements.holidaysShabbatTaskPolicySelect);
    const tPol = this._holidayTimerPolicy();
    const taskPol = this._holidayTaskPolicy();
    const ts = this._elements.holidaysShabbatTimerPolicySelect;
    const tas = this._elements.holidaysShabbatTaskPolicySelect;
    if (ts && ts.value !== tPol) {
      ts.value = tPol;
    }
    if (tas && tas.value !== taskPol) {
      tas.value = taskPol;
    }
  }

  _syncHebcalScopeUi() {
    const wrap = this._elements.holidaysShabbatHebcalScopeWrap;
    const scopeLabel = this._elements.holidaysShabbatHebcalScopeLabel;
    const scopeSel = this._elements.holidaysShabbatHebcalScopeSelect;
    if (!wrap || !scopeLabel || !scopeSel) {
      return;
    }
    if (!this._hebcalMetaPanelWanted() || !this._hebcalCacheUrl()) {
      wrap.hidden = true;
      return;
    }
    wrap.hidden = false;
    scopeLabel.textContent = this._t("holidays_shabbat_hebcal_scope_label");
    this._fillHebcalScopeSelect(scopeSel);
    const sc = this._normalizeHebcalWindowScope(this._config?.hebcal_window_scope);
    if (scopeSel.value !== sc) {
      scopeSel.value = sc;
    }
  }

  _hebcalWindowStatuses() {
    const out = {
      shabbat: false,
      holiday: false,
      active: false,
      label: "",
    };
    if (!this._hebcalCacheUrl()) {
      return out;
    }
    const payload = this._hebcalCache;
    if (!payload || !Array.isArray(payload.windows)) {
      return out;
    }
    const scope = this._normalizeHebcalWindowScope(this._config?.hebcal_window_scope);
    const now = new Date();
    const labels = [];
    for (const w of payload.windows) {
      const start = w.starts_at ? new Date(w.starts_at) : null;
      const end = w.ends_at ? new Date(w.ends_at) : null;
      if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        continue;
      }
      const kind = String(w.kind || "").toLowerCase();
      if (scope === "shabbat" && kind !== "shabbat") {
        continue;
      }
      if (scope === "holiday" && kind !== "holiday") {
        continue;
      }
      if (now >= start && now < end) {
        if (kind === "shabbat") {
          out.shabbat = true;
        } else if (kind === "holiday") {
          out.holiday = true;
        }
        out.active = true;
        const piece = String(w.label || w.hebrew || "").trim();
        if (piece && !labels.includes(piece)) {
          labels.push(piece);
        }
      }
    }
    out.label = labels.slice(0, 3).join(", ");
    return out;
  }

  _hebcalSummaryText(hebcalWin) {
    const base = this._t("holidays_shabbat_source_hebcal");
    if (!this._isHebcalLocalFetchEnabled()) {
      return "";
    }
    const url = this._hebcalCacheUrl();
    if (!url) {
      return `${base}: ${this._t("holidays_shabbat_hebcal_need_entry")}`;
    }
    if (this._hebcalFetchInFlight && !this._hebcalCache) {
      return `${base}: ${this._t("holidays_shabbat_hebcal_waiting")}`;
    }
    if (!this._hebcalCache) {
      return `${base}: ${this._t("holidays_shabbat_hebcal_no_cache")}`;
    }
    if (hebcalWin.active) {
      return hebcalWin.label
        ? `${base}: ${hebcalWin.label}`
        : `${base}: ${this._t("holidays_shabbat_status_active")}`;
    }
    return `${base}: ${this._t("holidays_shabbat_hebcal_idle")}`;
  }

  _holidayShabbatStatus() {
    const holiday = this._holidaySourceStatus(this._config?.holiday_entity);
    const shabbat = this._holidaySourceStatus(this._config?.shabbat_entity);
    const hebcal = this._hebcalWindowStatuses();
    const active = Boolean(holiday.active || shabbat.active || hebcal.active);
    return {
      holiday,
      shabbat,
      hebcal,
      active,
    };
  }

  _holidayPolicyLabel(policy) {
    const normalized = this._normalizeHolidayPolicy(policy);
    if (normalized === "block") {
      return this._t("holiday_policy_block");
    }
    if (normalized === "postpone") {
      return this._t("holiday_policy_postpone");
    }
    if (normalized === "force_off") {
      return this._t("holiday_policy_force_off");
    }
    return this._t("holiday_policy_allow");
  }

  _holidaySourceDisplayName(source) {
    if (!source?.configured) {
      return this._t("holidays_shabbat_source_not_set");
    }
    const stateObj = source.stateObj;
    if (!stateObj) {
      return `${source.entityId} (${this._t("status_unavailable")})`;
    }
    const friendly = String(stateObj.attributes?.friendly_name || "").trim();
    const entityName = friendly || source.entityId;
    const stateText = String(stateObj.state || "").trim();
    return `${entityName} (${stateText || this._t("status_unavailable")})`;
  }

  _holidaySourceSummaryLine(kind, source) {
    const label = kind === "shabbat"
      ? this._t("holidays_shabbat_source_shabbat")
      : this._t("holidays_shabbat_source_holiday");
    return `${label}: ${this._holidaySourceDisplayName(source)}`;
  }

  _syncHolidaysShabbatPanel() {
    const status = this._holidayShabbatStatus();

    if (this._elements.holidaysShabbatStatus) {
      this._elements.holidaysShabbatStatus.textContent = status.active
        ? this._t("holidays_shabbat_status_active")
        : this._t("holidays_shabbat_status_inactive");
      this._elements.holidaysShabbatStatus.classList.toggle("inactive", !status.active);
    }
    if (this._elements.holidaysShabbatSourcesLine) {
      const holidayLine = this._holidaySourceSummaryLine("holiday", status.holiday);
      const shabbatLine = this._holidaySourceSummaryLine("shabbat", status.shabbat);
      const hebcalPart = this._hebcalSummaryText(status.hebcal);
      const parts = [holidayLine, shabbatLine];
      if (hebcalPart) {
        parts.push(hebcalPart);
      }
      const line = `${this._t("holidays_shabbat_sources_label")}: ${parts.join(" • ")}`;
      this._elements.holidaysShabbatSourcesLine.textContent = line;
      this._elements.holidaysShabbatSourcesLine.title = line;
    }
    this._maybeBindHolidaysShabbatInlineControls();
    this._syncHolidaysInlinePolicySelects();
    this._syncHolidaysHebcalMeta();
    this._syncHebcalScopeUi();
    this._syncHolidaysWindowList();
  }

  _syncHolidaysWindowList() {
    const section = this._elements.holidaysShabbatWindowsSection;
    const list = this._elements.holidaysShabbatWindowList;
    const title = this._elements.holidaysShabbatWindowsTitle;
    if (!section || !list || !title) {
      return;
    }
    title.textContent = this._t("holidays_shabbat_windows_title");
    const payload = this._hebcalCache;
    const windows = (payload && Array.isArray(payload.windows)) ? payload.windows : [];
    if (!this._hebcalMetaPanelWanted() || !this._hebcalCacheUrl()) {
      section.hidden = true;
      list.innerHTML = "";
      return;
    }
    section.hidden = false;
    if (this._hebcalFetchInFlight && !payload) {
      list.innerHTML = `<div class="holidays-shabbat-windows-empty">${this._escapeHtml(this._t("holidays_shabbat_hebcal_meta_loading"))}</div>`;
      return;
    }
    if (windows.length === 0) {
      list.innerHTML = `<div class="holidays-shabbat-windows-empty">${this._escapeHtml(this._t("holidays_shabbat_windows_empty"))}</div>`;
      return;
    }
    const now = Date.now();
    const sorted = [...windows].sort((a, b) => {
      const ta = new Date(a?.starts_at || 0).getTime();
      const tb = new Date(b?.starts_at || 0).getTime();
      return ta - tb;
    });
    const lang = this._lang();
    const locale = lang === "he" ? "he-IL" : lang === "ru" ? "ru-RU" : lang === "fr" ? "fr-FR" : "en-GB";
    const fmt = (iso) => {
      const d = iso ? new Date(iso) : null;
      if (!d || Number.isNaN(d.getTime())) {
        return "—";
      }
      return d.toLocaleString(locale, { dateStyle: "short", timeStyle: "short" });
    };
    const rowsHtml = sorted.map((w) => {
      const start = w?.starts_at ? new Date(w.starts_at) : null;
      const end = w?.ends_at ? new Date(w.ends_at) : null;
      let state = "upcoming";
      if (start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        const t0 = start.getTime();
        const t1 = end.getTime();
        if (now >= t0 && now < t1) {
          state = "active";
        } else if (now >= t1) {
          state = "past";
        }
      }
      const kind = String(w?.kind || "").toLowerCase();
      const kindKey = kind === "holiday" ? "holidays_shabbat_window_kind_holiday" : "holidays_shabbat_window_kind_shabbat";
      const stateKey = state === "active"
        ? "holidays_shabbat_window_state_active"
        : state === "past"
          ? "holidays_shabbat_window_state_past"
          : "holidays_shabbat_window_state_upcoming";
      const rawName = String(w?.label || w?.hebrew || w?.title || "").trim() || this._t(kindKey);
      const name = this._escapeHtml(rawName);
      const range = this._escapeHtml(`${fmt(w?.starts_at)} → ${fmt(w?.ends_at)}`);
      const kindClass = kind === "holiday" ? "holidays-shabbat-badge-kind-holiday" : "holidays-shabbat-badge-kind-shabbat";
      const stateClass = state === "active"
        ? "holidays-shabbat-badge-state-active"
        : state === "past"
          ? "holidays-shabbat-badge-state-past"
          : "holidays-shabbat-badge-state-upcoming";
      return `<div class="holidays-shabbat-window-row" role="listitem">
        <div class="holidays-shabbat-window-main">
          <span class="holidays-shabbat-window-name">${name}</span>
          <span class="holidays-shabbat-window-range">${range}</span>
        </div>
        <div class="holidays-shabbat-window-badges">
          <span class="holidays-shabbat-badge ${kindClass}">${this._escapeHtml(this._t(kindKey))}</span>
          <span class="holidays-shabbat-badge ${stateClass}">${this._escapeHtml(this._t(stateKey))}</span>
        </div>
      </div>`;
    }).join("");
    list.innerHTML = rowsHtml;
  }

  _hebcalMetaPanelWanted() {
    const manual = String(this._config?.hebcal_cache_path || "").trim();
    return Boolean(manual) || this._isHebcalLocalFetchEnabled();
  }

  _truncateHebcalUrlDisplay(url, maxLen = 72) {
    const s = String(url || "");
    if (s.length <= maxLen) {
      return s;
    }
    return `${s.slice(0, Math.max(0, maxLen - 1))}…`;
  }

  _syncHolidaysHebcalMeta() {
    const block = this._elements.holidaysShabbatHebcalBlock;
    const label = this._elements.holidaysShabbatHebcalLabel;
    const meta = this._elements.holidaysShabbatHebcalMeta;
    if (!block || !label || !meta) {
      return;
    }
    if (!this._hebcalMetaPanelWanted()) {
      block.hidden = true;
      return;
    }
    block.hidden = false;
    label.textContent = this._t("holidays_shabbat_hebcal_meta_label");
    meta.classList.remove("error");
    const url = this._hebcalCacheUrl();
    const urlDisp = url ? this._truncateHebcalUrlDisplay(url) : "";
    if (!url) {
      meta.classList.add("error");
      meta.textContent = this._t("holidays_shabbat_hebcal_need_entry");
      return;
    }
    if (this._hebcalFetchInFlight && !this._hebcalCache) {
      meta.textContent = `${this._t("holidays_shabbat_hebcal_meta_loading")} • ${urlDisp}`;
      return;
    }
    if (this._hebcalFetchError) {
      meta.classList.add("error");
      const bits = [this._t("holidays_shabbat_hebcal_meta_err"), this._hebcalFetchError, urlDisp].filter(Boolean);
      meta.textContent = bits.join(" • ");
      return;
    }
    const payload = this._hebcalCache;
    if (!payload || typeof payload !== "object") {
      meta.classList.add("error");
      const hint = this._hebcalLastHttpStatus
        ? `HTTP ${this._hebcalLastHttpStatus}`
        : this._t("holidays_shabbat_hebcal_no_cache");
      meta.textContent = `${this._t("holidays_shabbat_hebcal_meta_err")}: ${hint} • ${urlDisp}`;
      return;
    }
    const fetched = String(payload.fetched_at || payload.fetchedAt || "").trim();
    const winCount = Array.isArray(payload.windows) ? payload.windows.length : 0;
    const items = payload.items_count ?? payload.itemsCount;
    const winWord = this._t("holidays_shabbat_hebcal_meta_windows");
    const parts = [
      this._t("holidays_shabbat_hebcal_meta_ok"),
      urlDisp,
      `${winCount} ${winWord}`,
    ];
    if (fetched) {
      parts.push(`fetched_at=${fetched}`);
    }
    if (items != null && String(items).trim() !== "") {
      parts.push(`${items} ${this._t("holidays_shabbat_hebcal_meta_items")}`);
    }
    meta.textContent = parts.join(" • ");
  }

  _syncHolidayShabbatNotice() {
    const notice = this._elements.holidayShabbatNotice;
    if (!notice) {
      return;
    }
    const status = this._holidayShabbatStatus();
    if (!status.active) {
      notice.hidden = true;
      notice.textContent = "";
      return;
    }
    const timerPolicy = this._holidayPolicyLabel(this._holidayTimerPolicy());
    const taskPolicy = this._holidayPolicyLabel(this._holidayTaskPolicy());
    notice.textContent = `${this._t("holiday_runtime_notice")} • ${this._t("holidays_shabbat_timer_rule_label")}: ${timerPolicy} • ${this._t("holidays_shabbat_task_rule_label")}: ${taskPolicy}`;
    notice.hidden = false;
  }

  _isTimerBlockedByHoliday(status = null) {
    const sourceStatus = status || this._holidayShabbatStatus();
    if (!sourceStatus.active) {
      return false;
    }
    return this._holidayTimerPolicy() !== "allow";
  }

  _isTaskBlockedByHoliday(status = null) {
    const sourceStatus = status || this._holidayShabbatStatus();
    if (!sourceStatus.active) {
      return false;
    }
    return this._holidayTaskPolicy() !== "allow";
  }

  _maybeExplainTimerHolidayBlock(policy) {
    const normalized = this._normalizeHolidayPolicy(policy);
    if (normalized === "force_off") {
      this._showInfoModal(this._t("holiday_timer_rule_force_off_notice"), this._t("holidays_shabbat_title"));
      return;
    }
    if (normalized === "postpone") {
      this._showInfoModal(this._t("holiday_timer_rule_postpone_notice"), this._t("holidays_shabbat_title"));
      return;
    }
    this._showInfoModal(this._t("holiday_timer_rule_block_notice"), this._t("holidays_shabbat_title"));
  }

  _maybeExplainTaskHolidayBlock(policy) {
    const normalized = this._normalizeHolidayPolicy(policy);
    if (normalized === "force_off") {
      this._showInfoModal(this._t("holiday_task_rule_force_off_notice"), this._t("holidays_shabbat_title"));
      return;
    }
    if (normalized === "postpone") {
      this._showInfoModal(this._t("holiday_task_rule_postpone_notice"), this._t("holidays_shabbat_title"));
      return;
    }
    this._showInfoModal(this._t("holiday_task_rule_block_notice"), this._t("holidays_shabbat_title"));
  }

  _timerActionBlockedByHoliday({ showMessage = false } = {}) {
    const status = this._holidayShabbatStatus();
    if (!status.active) {
      return false;
    }
    const policy = this._holidayTimerPolicy();
    if (policy === "allow") {
      return false;
    }
    if (policy === "force_off") {
      const boiler = this._hass?.states?.[this._config?.boiler_entity];
      const timer = this._hass?.states?.[this._config?.timer_entity];
      const managerMode = this._boilerManagerModeEntity();
      this._forceHolidayShutdown(boiler, timer, managerMode);
    }
    if (showMessage) {
      this._maybeExplainTimerHolidayBlock(policy);
    }
    return true;
  }

  _taskActionBlockedByHoliday({ showMessage = false } = {}) {
    const status = this._holidayShabbatStatus();
    if (!status.active) {
      return false;
    }
    const policy = this._holidayTaskPolicy();
    if (policy === "allow") {
      return false;
    }
    if (policy === "force_off") {
      const boiler = this._hass?.states?.[this._config?.boiler_entity];
      const timer = this._hass?.states?.[this._config?.timer_entity];
      const managerMode = this._boilerManagerModeEntity();
      this._forceHolidayShutdown(boiler, timer, managerMode);
    }
    if (showMessage) {
      this._maybeExplainTaskHolidayBlock(policy);
    }
    return true;
  }

  _maybeEnforceHolidayRules(managerMode, boiler, timer) {
    const status = this._holidayShabbatStatus();
    if (!status.active) {
      return;
    }
    const timerPolicy = this._holidayTimerPolicy();
    const taskPolicy = this._holidayTaskPolicy();
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

  _availableMenuModes() {
    const modes = ["timer"];
    if (this._hasTasksView()) {
      modes.push("tasks");
    }
    if (this._hasImportExportView()) {
      modes.push("import_export");
    }
    if (this._hasHolidaysShabbatView()) {
      modes.push("holidays_shabbat");
    }
    return modes;
  }

  _setMenuMode(mode) {
    const requested = mode === "tasks" || mode === "import_export" || mode === "holidays_shabbat" ? mode : "timer";
    const availableModes = this._availableMenuModes();
    const normalized = availableModes.includes(requested) ? requested : "timer";
    this._menuMode = normalized;
    const isTimer = this._menuMode === "timer";
    const isTasks = this._menuMode === "tasks";
    const isImportExport = this._menuMode === "import_export";
    const isHolidaysShabbat = this._menuMode === "holidays_shabbat";
    if (this._elements.timerModalPanel) {
      this._elements.timerModalPanel.classList.toggle("menu-mode-tasks", isTasks);
      this._elements.timerModalPanel.classList.toggle("menu-mode-import-export", isImportExport);
      this._elements.timerModalPanel.classList.toggle("menu-mode-holidays-shabbat", isHolidaysShabbat);
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
    if (this._elements.modalHolidaysShabbatView) {
      this._elements.modalHolidaysShabbatView.hidden = !isHolidaysShabbat;
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
    if (this._elements.modalModeHolidaysShabbatBtn) {
      this._elements.modalModeHolidaysShabbatBtn.classList.toggle("active", isHolidaysShabbat);
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
    const normalizedStartTime = this._normalizeScheduleWindowTimeKey(attrs.start_time);
    const normalizedEndTime = this._normalizeScheduleWindowTimeKey(attrs.end_time);
    const normalizedTimelinePoints = Array.isArray(attrs.timeline_points)
      ? attrs.timeline_points
          .map((point) => {
            const at = this._normalizeScheduleWindowTimeKey(point?.at);
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

    const base = {
      name,
      task_type: taskType,
      start_time: normalizedStartTime || String(attrs.start_time || "").trim(),
      end_time: normalizedEndTime || String(attrs.end_time || "").trim(),
      timeline_points: normalizedTimelinePoints,
      days,
      months,
      recurrence,
      ...(attrs.start_date ? { start_date: String(attrs.start_date).trim() } : {}),
      ...(attrs.end_date ? { end_date: String(attrs.end_date).trim() } : {}),
      condition_entity: conditionEntity || null,
      condition_operator: conditionOperator || "eq",
      skip_if_state: skipIfState || null,
      enabled,
    };

    if (taskType === "timeline") {
      if (normalizedTimelinePoints.length > 0) {
        return base;
      }
      return null;
    }

    const startTime = base.start_time;
    const endTime = base.end_time;
    if (!startTime || !endTime) {
      return null;
    }

    return base;
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
    this._syncScheduleSunModeOptionLabels();
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
      this._applyScheduleWindowTimeSpec("start", { mode: "fixed", time: "", offset: 0 }, "10:00");
      this._elements.scheduleStartInput.value = "";
      this._elements.scheduleStartInput.focus({ preventScroll: true });
      return;
    }

    if (key === "end_time" && this._elements.scheduleEndInput) {
      this._applyScheduleWindowTimeSpec("end", { mode: "fixed", time: "", offset: 0 }, "12:00");
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
      this._setScheduleConditionEnabled(false);
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

    const timeGroup = document.createElement("div");
    timeGroup.className = "timeline-point-time-group";

    const sunToggleRow = document.createElement("label");
    sunToggleRow.className = "schedule-inline-toggle timeline-point-sun-toggle";

    const sunToggleInput = document.createElement("input");
    sunToggleInput.type = "checkbox";
    sunToggleInput.className = "schedule-inline-toggle-input timeline-point-sun-enabled";

    const sunToggleText = document.createElement("span");
    sunToggleText.className = "schedule-inline-toggle-text timeline-point-sun-toggle-text";
    sunToggleText.textContent = this._t("schedule_sun_toggle");

    sunToggleRow.appendChild(sunToggleInput);
    sunToggleRow.appendChild(sunToggleText);

    const modeRow = document.createElement("div");
    modeRow.className = "schedule-control-row schedule-time-meta-row timeline-point-mode-row";

    const modeSelect = document.createElement("select");
    modeSelect.className = "schedule-select timeline-point-mode";
    modeSelect.innerHTML = `
      <option value="fixed">${this._t("schedule_time_mode_fixed")}</option>
      <option value="sunrise">${this._t("schedule_time_mode_sunrise")}</option>
      <option value="sunset">${this._t("schedule_time_mode_sunset")}</option>
    `;

    const offsetInput = document.createElement("input");
    offsetInput.type = "number";
    offsetInput.min = "-120";
    offsetInput.max = "120";
    offsetInput.step = "1";
    offsetInput.value = "0";
    offsetInput.className = "schedule-input schedule-time-offset-input timeline-point-offset";
    offsetInput.setAttribute("title", this._t("schedule_time_offset"));

    modeRow.appendChild(modeSelect);
    modeRow.appendChild(offsetInput);

    const fixedRow = document.createElement("div");
    fixedRow.className = "schedule-control-row timeline-point-time-row";

    const atInput = document.createElement("input");
    atInput.type = "time";
    atInput.className = "schedule-input schedule-time-input timeline-point-time";
    atInput.setAttribute("dir", "ltr");
    atInput.value = "06:00";

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "schedule-clear-btn timeline-point-time-clear";
    clearBtn.setAttribute("aria-label", "Clear");
    clearBtn.textContent = "✕";
    clearBtn.addEventListener("click", () => {
      atInput.value = "06:00";
      sunToggleInput.checked = false;
      modeSelect.value = "fixed";
      offsetInput.value = "0";
      this._syncTimelinePointSunTimeFields(row);
    });

    fixedRow.appendChild(atInput);
    fixedRow.appendChild(clearBtn);
    timeGroup.appendChild(sunToggleRow);
    timeGroup.appendChild(modeRow);
    timeGroup.appendChild(fixedRow);

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

    const parsed = this._parseScheduleWindowTimeSpec(point?.at || "06:00", "06:00");
    sunToggleInput.checked = parsed.mode !== "fixed";
    modeSelect.value = parsed.mode;
    offsetInput.value = String(parsed.offset);
    atInput.value = parsed.time;
    row.appendChild(timeGroup);
    this._syncTimelinePointSunTimeFields(row);
    sunToggleInput.addEventListener("change", () => this._syncTimelinePointSunTimeFields(row));
    sunToggleInput.addEventListener("input", () => this._syncTimelinePointSunTimeFields(row));
    modeSelect.addEventListener("change", () => this._syncTimelinePointSunTimeFields(row));
    modeSelect.addEventListener("input", () => this._syncTimelinePointSunTimeFields(row));
    offsetInput.addEventListener("input", () => this._clampTimelinePointSunOffset(row));

    row.appendChild(durationSelect);
    row.appendChild(removeBtn);
    container.appendChild(row);
  }

  _syncTimelinePointSunTimeFields(row) {
    const root = row || null;
    if (!root) {
      return;
    }
    const sunEnabledInput = root.querySelector(".timeline-point-sun-enabled");
    const modeRow = root.querySelector(".timeline-point-mode-row");
    const modeInput = root.querySelector(".timeline-point-mode");
    const offsetInput = root.querySelector(".timeline-point-offset");
    const fixedRow = root.querySelector(".timeline-point-time-row");
    const useSunMode = !!sunEnabledInput?.checked;
    if (modeRow) {
      modeRow.hidden = !useSunMode;
    }
    if (!useSunMode) {
      if (modeInput) {
        modeInput.value = "fixed";
      }
      if (offsetInput) {
        offsetInput.value = "0";
      }
      if (fixedRow) {
        fixedRow.hidden = false;
      }
      return;
    }
    const mode = String(modeInput?.value || "fixed").toLowerCase();
    const isFixed = mode === "fixed";
    if (fixedRow) {
      fixedRow.hidden = !isFixed;
    }
  }

  _clampTimelinePointSunOffset(row) {
    const root = row || null;
    if (!root) {
      return;
    }
    const offsetInput = root.querySelector(".timeline-point-offset");
    if (!offsetInput) {
      return;
    }
    const raw = Number.parseInt(offsetInput.value, 10);
    const safe = Number.isInteger(raw) ? this._clamp(raw, -120, 120) : 0;
    offsetInput.value = String(safe);
  }

  _collectTimelinePointAtValue(row) {
    const root = row || null;
    if (!root) {
      return null;
    }
    const sunEnabled = !!root.querySelector(".timeline-point-sun-enabled")?.checked;
    const atInput = root.querySelector(".timeline-point-time");
    if (!sunEnabled) {
      return this._normalizeHhMm(String(atInput?.value || "").trim());
    }

    const mode = String(root.querySelector(".timeline-point-mode")?.value || "fixed").trim().toLowerCase();
    const offsetInput = root.querySelector(".timeline-point-offset");
    if (mode === "sunrise" || mode === "sunset") {
      const raw = Number.parseInt(String(offsetInput?.value || "0").trim(), 10);
      const offset = Number.isInteger(raw) ? this._clamp(raw, -120, 120) : 0;
      if (offsetInput) {
        offsetInput.value = String(offset);
      }
      return offset === 0 ? mode : `${mode}${offset >= 0 ? `+${offset}` : offset}`;
    }

    return this._normalizeHhMm(String(atInput?.value || "").trim());
  }

  _collectTimelinePoints() {
    const rows = Array.from(this.shadowRoot.querySelectorAll(".timeline-point-row"));
    return rows
      .map((row) => {
        const at = this._collectTimelinePointAtValue(row);
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
      .filter((item) => !!item);
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
    this._syncScheduleSunModeOptionLabels();
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
      this._applyScheduleWindowTimeSpec("start", String(attrs.start_time || "10:00"), "10:00");
      this._applyScheduleWindowTimeSpec("end", String(attrs.end_time || "12:00"), "12:00");
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
    this._setScheduleConditionEnabled(!!String(attrs.condition_entity || "").trim());
    if (this._elements.scheduleConditionOperatorInput) {
      this._elements.scheduleConditionOperatorInput.value = this._normalizeConditionOperator(attrs.condition_operator);
    }
    this._refreshConditionOperatorOptions(String(attrs.condition_entity || "").trim());
    if (this._elements.scheduleConditionStateInput) {
      this._elements.scheduleConditionStateInput.value = String(attrs.skip_if_state || "").trim();
    }
    this._refreshConditionStateOptions(String(attrs.condition_entity || "").trim());

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

  _syncScheduleSunModeOptionLabels() {
    const applyLabels = (select) => {
      if (!select) {
        return;
      }
      const fixed = select.querySelector("option[value=\"fixed\"]");
      const sunrise = select.querySelector("option[value=\"sunrise\"]");
      const sunset = select.querySelector("option[value=\"sunset\"]");
      if (fixed) {
        fixed.textContent = this._t("schedule_time_mode_fixed");
      }
      if (sunrise) {
        sunrise.textContent = this._t("schedule_time_mode_sunrise");
      }
      if (sunset) {
        sunset.textContent = this._t("schedule_time_mode_sunset");
      }
    };

    applyLabels(this._elements.scheduleStartModeInput);
    applyLabels(this._elements.scheduleEndModeInput);
    const timelineModeSelects = Array.from(this.shadowRoot.querySelectorAll(".timeline-point-mode"));
    timelineModeSelects.forEach(applyLabels);
    if (this._elements.scheduleStartSunEnabledLabel) {
      this._elements.scheduleStartSunEnabledLabel.textContent = this._t("schedule_sun_toggle");
    }
    if (this._elements.scheduleEndSunEnabledLabel) {
      this._elements.scheduleEndSunEnabledLabel.textContent = this._t("schedule_sun_toggle");
    }
    const timelineSunToggleTexts = Array.from(this.shadowRoot.querySelectorAll(".timeline-point-sun-toggle-text"));
    timelineSunToggleTexts.forEach((node) => {
      node.textContent = this._t("schedule_sun_toggle");
    });
    const timelineSunToggleInputs = Array.from(this.shadowRoot.querySelectorAll(".timeline-point-sun-enabled"));
    timelineSunToggleInputs.forEach((input) => {
      input.setAttribute("aria-label", this._t("schedule_sun_toggle"));
    });
    if (this._elements.scheduleStartOffsetInput) {
      this._elements.scheduleStartOffsetInput.setAttribute("title", this._t("schedule_time_offset"));
    }
    if (this._elements.scheduleEndOffsetInput) {
      this._elements.scheduleEndOffsetInput.setAttribute("title", this._t("schedule_time_offset"));
    }
    const timelineOffsetInputs = Array.from(this.shadowRoot.querySelectorAll(".timeline-point-offset"));
    timelineOffsetInputs.forEach((input) => input.setAttribute("title", this._t("schedule_time_offset")));
  }

  _setScheduleConditionEnabled(enabled) {
    if (this._elements.scheduleConditionEnabledInput) {
      this._elements.scheduleConditionEnabledInput.checked = !!enabled;
    }
    this._syncScheduleConditionFields();
  }

  _syncScheduleConditionFields() {
    const enabled = !!this._elements.scheduleConditionEnabledInput?.checked;
    if (this._elements.scheduleConditionRow) {
      this._elements.scheduleConditionRow.hidden = !enabled;
    }
  }

  _parseScheduleWindowTimeSpec(value, fallbackTime = "10:00") {
    const fallback = this._normalizeHhMm(fallbackTime) || "10:00";
    const raw = String(value || "").trim().toLowerCase();
    const asTime = this._normalizeHhMm(raw);
    if (asTime) {
      return { mode: "fixed", time: asTime, offset: 0 };
    }

    const match = raw.match(/^(sunrise|sunset)(?:\s*([+-])\s*(\d{1,3}))?$/i);
    if (!match) {
      return { mode: "fixed", time: fallback, offset: 0 };
    }

    const mode = String(match[1] || "sunrise").toLowerCase();
    const sign = String(match[2] || "");
    const numeric = Number.parseInt(String(match[3] || "0"), 10);
    let offset = Number.isInteger(numeric) ? numeric : 0;
    if (sign === "-") {
      offset = -Math.abs(offset);
    } else {
      offset = Math.abs(offset);
    }
    offset = this._clamp(offset, -120, 120);
    return {
      mode: mode === "sunset" ? "sunset" : "sunrise",
      time: fallback,
      offset,
    };
  }

  _applyScheduleWindowTimeSpec(prefix, value, fallbackTime = "10:00") {
    const normalizedPrefix = prefix === "end" ? "end" : "start";
    const spec = typeof value === "object" && value !== null && "mode" in value
      ? {
          mode: String(value.mode || "fixed").toLowerCase() === "sunset"
            ? "sunset"
            : (String(value.mode || "fixed").toLowerCase() === "sunrise" ? "sunrise" : "fixed"),
          time: this._normalizeHhMm(value.time || fallbackTime) || this._normalizeHhMm(fallbackTime) || "10:00",
          offset: this._clamp(Number.parseInt(value.offset, 10) || 0, -120, 120),
        }
      : this._parseScheduleWindowTimeSpec(value, fallbackTime);

    const modeInput = normalizedPrefix === "end"
      ? this._elements.scheduleEndModeInput
      : this._elements.scheduleStartModeInput;
    const modeEnabledInput = normalizedPrefix === "end"
      ? this._elements.scheduleEndSunEnabledInput
      : this._elements.scheduleStartSunEnabledInput;
    const offsetInput = normalizedPrefix === "end"
      ? this._elements.scheduleEndOffsetInput
      : this._elements.scheduleStartOffsetInput;
    const timeInput = normalizedPrefix === "end"
      ? this._elements.scheduleEndInput
      : this._elements.scheduleStartInput;

    if (modeInput) {
      modeInput.value = spec.mode;
    }
    if (modeEnabledInput) {
      modeEnabledInput.checked = spec.mode !== "fixed";
    }
    if (offsetInput) {
      offsetInput.value = String(spec.offset);
    }
    if (timeInput) {
      timeInput.value = spec.time;
    }
    this._syncScheduleSunTimeFields(normalizedPrefix);
  }

  _syncScheduleSunTimeFields(prefix) {
    const normalizedPrefix = prefix === "end" ? "end" : "start";
    const modeEnabledInput = normalizedPrefix === "end"
      ? this._elements.scheduleEndSunEnabledInput
      : this._elements.scheduleStartSunEnabledInput;
    const modeRow = normalizedPrefix === "end"
      ? this._elements.scheduleEndMetaRow
      : this._elements.scheduleStartMetaRow;
    const modeInput = normalizedPrefix === "end"
      ? this._elements.scheduleEndModeInput
      : this._elements.scheduleStartModeInput;
    const row = normalizedPrefix === "end"
      ? this._elements.scheduleEndTimeRow
      : this._elements.scheduleStartTimeRow;
    const useSunMode = !!modeEnabledInput?.checked;
    if (modeRow) {
      modeRow.hidden = !useSunMode;
    }
    if (!useSunMode) {
      if (modeInput) {
        modeInput.value = "fixed";
      }
      const offsetInput = normalizedPrefix === "end"
        ? this._elements.scheduleEndOffsetInput
        : this._elements.scheduleStartOffsetInput;
      if (offsetInput) {
        offsetInput.value = "0";
      }
      if (row) {
        row.hidden = false;
      }
      return;
    }
    const mode = String(modeInput?.value || "fixed").toLowerCase();
    const isFixed = mode === "fixed";
    if (row) {
      row.hidden = !isFixed;
    }
  }

  _clampScheduleSunOffset(prefix) {
    const normalizedPrefix = prefix === "end" ? "end" : "start";
    const offsetInput = normalizedPrefix === "end"
      ? this._elements.scheduleEndOffsetInput
      : this._elements.scheduleStartOffsetInput;
    if (!offsetInput) {
      return;
    }
    const raw = Number.parseInt(offsetInput.value, 10);
    const safe = Number.isInteger(raw) ? this._clamp(raw, -120, 120) : 0;
    offsetInput.value = String(safe);
  }

  _collectScheduleWindowTimeSpec(prefix) {
    const normalizedPrefix = prefix === "end" ? "end" : "start";
    const modeEnabledInput = normalizedPrefix === "end"
      ? this._elements.scheduleEndSunEnabledInput
      : this._elements.scheduleStartSunEnabledInput;
    const modeInput = normalizedPrefix === "end"
      ? this._elements.scheduleEndModeInput
      : this._elements.scheduleStartModeInput;
    const offsetInput = normalizedPrefix === "end"
      ? this._elements.scheduleEndOffsetInput
      : this._elements.scheduleStartOffsetInput;
    const timeInput = normalizedPrefix === "end"
      ? this._elements.scheduleEndInput
      : this._elements.scheduleStartInput;

    if (!modeEnabledInput?.checked) {
      return this._normalizeHhMm(String(timeInput?.value || "").trim());
    }

    const mode = String(modeInput?.value || "fixed").trim().toLowerCase();
    if (mode !== "sunrise" && mode !== "sunset") {
      return this._normalizeHhMm(String(timeInput?.value || "").trim());
    }

    const raw = Number.parseInt(String(offsetInput?.value || "0").trim(), 10);
    const offset = Number.isInteger(raw) ? this._clamp(raw, -120, 120) : 0;
    if (offsetInput) {
      offsetInput.value = String(offset);
    }
    return offset === 0 ? mode : `${mode}${offset >= 0 ? `+${offset}` : offset}`;
  }

  _normalizeScheduleWindowTimeKey(value) {
    const raw = String(value || "").trim().toLowerCase();
    const asTime = this._normalizeHhMm(raw);
    if (asTime) {
      return asTime;
    }

    const match = raw.match(/^(sunrise|sunset)(?:\s*([+-])\s*(\d{1,3}))?$/i);
    if (!match) {
      return null;
    }

    const mode = String(match[1] || "").toLowerCase();
    const sign = String(match[2] || "");
    const numeric = Number.parseInt(String(match[3] || "0"), 10);
    if (!Number.isInteger(numeric)) {
      return null;
    }
    let offset = numeric;
    if (sign === "-") {
      offset = -Math.abs(offset);
    } else {
      offset = Math.abs(offset);
    }
    if (offset < -120 || offset > 120) {
      return null;
    }
    return offset === 0 ? mode : `${mode}${offset >= 0 ? `+${offset}` : offset}`;
  }

  _renderScheduleWindowTimeLabel(value) {
    const normalized = this._normalizeScheduleWindowTimeKey(value);
    if (!normalized) {
      return String(value || "--:--").trim() || "--:--";
    }

    const asTime = this._normalizeHhMm(normalized);
    if (asTime) {
      return asTime;
    }

    const match = normalized.match(/^(sunrise|sunset)([+-]\d+)?$/);
    if (!match) {
      return normalized;
    }
    const mode = match[1] === "sunset" ? "sunset" : "sunrise";
    const label = this._t(mode === "sunset" ? "schedule_time_mode_sunset" : "schedule_time_mode_sunrise");
    const offset = Number.parseInt(String(match[2] || "0"), 10) || 0;
    if (offset === 0) {
      return label;
    }
    const minutesSuffix = this._t("minutes_short");
    return `${label} ${offset >= 0 ? "+" : ""}${offset} ${minutesSuffix}`;
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
    this._applyScheduleWindowTimeSpec("start", "10:00", "10:00");
    this._applyScheduleWindowTimeSpec("end", "12:00", "12:00");
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
    this._setScheduleConditionEnabled(false);
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
    const conditionEnabled = !!this._elements.scheduleConditionEnabledInput?.checked;
    const conditionEntity = conditionEnabled
      ? String(this._elements.scheduleConditionEntityInput?.value || "").trim()
      : "";
    let conditionOperator = this._normalizeConditionOperator(
      this._elements.scheduleConditionOperatorInput?.value || "eq"
    );
    let skipIfState = conditionEnabled
      ? String(this._elements.scheduleConditionStateInput?.value || "").trim()
      : "";
    if (conditionEnabled && conditionEntity && !skipIfState) {
      skipIfState = conditionOperator === "eq" ? "on" : "0";
    }
    if (!conditionEnabled || !conditionEntity) {
      conditionOperator = "eq";
      skipIfState = "";
    }
    const includeDateRange = recurrence === "range";

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

    const startTime = this._collectScheduleWindowTimeSpec("start");
    const endTime = this._collectScheduleWindowTimeSpec("end");
    if (!startTime || !endTime) {
      this._showInfoModal(this._t("invalid_schedule_time"), this._t("dialog_title"));
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

    const desiredEntryId = this._resolvedIntegrationEntryId();
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

    const startTime = this._normalizeScheduleWindowTimeKey(payload.start_time);
    const endTime = this._normalizeScheduleWindowTimeKey(payload.end_time);
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
        const at = this._normalizeScheduleWindowTimeKey(point?.at);
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
    return `${this._renderScheduleWindowTimeLabel(attrs.start_time)} - ${this._renderScheduleWindowTimeLabel(attrs.end_time)}${dayText}`;
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
    notice.textContent = `${label} • ${this._t("active_task_ends_at")} ${this._formatClockTime(active.endTs)}`;
    notice.hidden = false;
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

      const endTs = this._taskCurrentEndTimestamp(attrs, nowTs);
      if (!Number.isFinite(endTs) || endTs <= nowTs) {
        return;
      }

      if (!nearest || endTs < nearest.endTs) {
        nearest = {
          endTs,
          name: String(attrs.task_name || attrs.friendly_name || attrs.task_id || "").trim(),
        };
      }
    });

    return nearest;
  }

  _taskCurrentEndTimestamp(attrs, nowTs) {
    const now = new Date(nowTs);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const taskType = String(attrs?.task_type || "window").toLowerCase() === "timeline" ? "timeline" : "window";

    if (taskType === "timeline" && Array.isArray(attrs?.timeline_points)) {
      let activeEnd = null;
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
          const endTs = start.getTime() + (durationMinutes * 60 * 1000);
          const startTs = start.getTime();
          if (nowTs >= startTs && nowTs < endTs) {
            if (activeEnd === null || endTs < activeEnd) {
              activeEnd = endTs;
            }
          }
        });
      });
      return activeEnd;
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
        return endTs;
      }
    }

    return null;
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
        condition_entity: taskState.attributes?.condition_entity || "",
        condition_operator: taskState.attributes?.condition_operator || "",
        skip_if_state: taskState.attributes?.skip_if_state || "",
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
      if (attrs.task_type === "timeline") {
        const timeline = String(attrs.timeline_label || "").trim();
        meta.textContent = `${timeline || "--"}${daysLabel}${conditionLabel}`;
      } else {
        meta.textContent = `${this._renderScheduleWindowTimeLabel(attrs.start_time)} - ${this._renderScheduleWindowTimeLabel(attrs.end_time)}${daysLabel}${conditionLabel}`;
      }
      main.appendChild(meta);

      const actions = document.createElement("div");
      actions.className = "task-actions";

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "task-toggle-btn";
      const isOn = String(taskState.state || "").toLowerCase() === "on";
      toggle.classList.toggle("on", isOn);
      toggle.textContent = isOn ? this._t("task_disable") : this._t("task_enable");
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
    const configuredEntryId = this._resolvedIntegrationEntryId();
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
    const warm = "#f97316";
    const veryHot = "#dc2626";
    const p = this._clamp(progress, 0, 1);

    if (p < 0.3) {
      return cool;
    }
    if (p < 0.72) {
      return warm;
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

  _escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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

    const desiredEntryId = this._resolvedIntegrationEntryId();
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
    this._maybeApplyIntegrationDefaults();
    this._maybeApplySwitcherDefaults();
    this._render();
  }

  _maybeApplyIntegrationDefaults() {
    if (this._asTruthy(this._config?.switcher_mode)) {
      return;
    }

    if (!this._hass) {
      return;
    }

    const defaults = this._integrationDefaultsFromStates();
    if (!defaults || !defaults.boiler_entity) {
      return;
    }

    let nextConfig = { ...this._config };
    if (this._shouldAutofillBoilerEntity()) {
      nextConfig = { ...nextConfig, ...defaults };
    } else {
      const curEntry = String(nextConfig.integration_entry_id || "").trim();
      if (!curEntry && defaults.integration_entry_id) {
        nextConfig.integration_entry_id = defaults.integration_entry_id;
      }
    }

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
    if (!this._hass || !this._asTruthy(this._config?.switcher_mode)) {
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
    if (!this._form) {
      this.innerHTML = "";
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (schema) => schema.label;
      this._form.addEventListener("value-changed", (event) => this._onValueChanged(event));
      this.appendChild(this._form);
    }

    this._form.hass = this._hass;
    this._form.data = this._config;
    const isSwitcherMode = this._asTruthy(this._config?.switcher_mode);
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
              { value: "fr", label: "Français" },
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
        name: "switcher_mode",
        label: labels.switcher_mode,
        selector: { boolean: {} },
      },
      {
        name: "boiler_entity",
        label: labels.boiler_entity,
        required: true,
        selector: isSwitcherMode
          ? { entity: { domain: "switch" } }
          : { entity: {} },
      },
      ...(isSwitcherMode
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
        : [
          {
            name: "timer_values",
            label: labels.timer_values,
            selector: { text: {} },
          },
          {
            name: "temperature_sensor",
            label: labels.temperature_sensor,
            selector: { entity: { domain: "sensor" } },
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
        ]),
      {
        name: "boiler_flow_image",
        label: labels.boiler_flow_image,
        selector: { text: {} },
      },
      {
        name: "auto_entry_id",
        label: labels.auto_entry_id,
        selector: { boolean: {} },
      },
      {
        name: "integration_entry_id",
        label: labels.integration_entry_id,
        selector: { text: {} },
      },
      {
        name: "hebcal_local_enabled",
        label: labels.hebcal_local_enabled,
        selector: { boolean: {} },
      },
      {
        name: "hebcal_cache_path",
        label: labels.hebcal_cache_path,
        selector: { text: {} },
      },
    ];
  }

  _onValueChanged(event) {
    const value = event?.detail?.value || {};
    const prevLanguage = this._normalizeLanguage(this._config?.language);
    const hasLanguageChange = Object.prototype.hasOwnProperty.call(value, "language");
    const hasSwitcherModeChange = Object.prototype.hasOwnProperty.call(value, "switcher_mode");
    const prevSwitcherMode = this._asTruthy(this._config?.switcher_mode);
    const nextLanguage = hasLanguageChange
      ? this._normalizeLanguage(value.language)
      : prevLanguage;
    let nextConfig = { ...this._config, ...value };
    const nextSwitcherMode = this._asTruthy(nextConfig?.switcher_mode);

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

    this._config = nextConfig;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: nextConfig },
    }));

    // Keep editor stable so dropdown/entity selectors stay interactive.
    if ((hasLanguageChange && nextLanguage !== prevLanguage) || (hasSwitcherModeChange && nextSwitcherMode !== prevSwitcherMode)) {
      this._render();
    }
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
        switcher_mode: "Switcher Mode",
        boiler_entity: "ישות דוד",
        temperature_sensor: "סנסור טמפרטורה",
        power_sensor: "סנסור צריכה (W)",
        current_sensor: "סנסור זרם",
        voltage_sensor: "סנסור מתח",
        switcher_time_left_sensor: "סנסור זמן נותר (Switcher)",
        switcher_sensor_1: "Sensor 1 - רק בזמן דלוק",
        switcher_sensor_2: "Sensor 2 - תמיד מוצג",
        switcher_icon_sensor: "סנסור טמפ׳ לאייקון/פרוגרס",
        switcher_timer_values: "ערכי טיימר בדקות (לדוגמה: 15,30,45,60)",
        timer_values: "ערכי טיימר בדקות (גנרי, לדוגמה: 20,40,90)",
        boiler_flow_image: "תמונת זרימת מים (נתיב / URL)",
        auto_entry_id: "זיהוי אוטומטי של כניסת Boiler Manager (כבה אם כמה כניסות)",
        integration_entry_id: "מזהה כניסה ידני (ריק = אוטומטי כשיש כניסה אחת)",
        hebcal_local_enabled: "טען מטמון Hebcal מקומי (/local/boiler-card/hebcal-…)",
        hebcal_cache_path: "נתיב קובץ Hebcal ידני (ריק = אוטומטי לפי entry)",
      },
      en: {
        language: "Language",
        title: "Title",
        switcher_mode: "Switcher Mode",
        boiler_entity: "Boiler Entity",
        temperature_sensor: "Temperature Sensor",
        power_sensor: "Power Sensor (W)",
        current_sensor: "Current Sensor",
        voltage_sensor: "Voltage Sensor",
        switcher_time_left_sensor: "Switcher Time Left Sensor",
        switcher_sensor_1: "Switcher Sensor 1 (On only)",
        switcher_sensor_2: "Switcher Sensor 2 (Always)",
        switcher_icon_sensor: "Switcher Icon Temperature Sensor",
        switcher_timer_values: "Switcher Timer Values in minutes (e.g. 15,30,45,60)",
        timer_values: "Timer Values in minutes (generic, e.g. 20,40,90)",
        boiler_flow_image: "Water Flow Image (path / URL)",
        auto_entry_id: "Auto-detect Boiler Manager entry (off if multiple entries)",
        integration_entry_id: "Manual entry ID (empty = auto when only one entry)",
        hebcal_local_enabled: "Load Hebcal cache from /local/boiler-card/hebcal-…",
        hebcal_cache_path: "Custom Hebcal JSON URL/path (empty = auto from entry ID)",
      },
      ru: {
        language: "Язык",
        title: "Заголовок",
        switcher_mode: "Режим Switcher",
        boiler_entity: "Сущность бойлера",
        temperature_sensor: "Датчик температуры",
        power_sensor: "Датчик мощности (W)",
        current_sensor: "Датчик тока",
        voltage_sensor: "Датчик напряжения",
        switcher_time_left_sensor: "Switcher датчик оставшегося времени",
        switcher_sensor_1: "Switcher датчик 1 (только ВКЛ)",
        switcher_sensor_2: "Switcher датчик 2 (всегда)",
        switcher_icon_sensor: "Switcher датчик температуры иконки",
        switcher_timer_values: "Значения таймера Switcher в минутах (например 15,30,45,60)",
        timer_values: "Значения таймера в минутах (общие, например 20,40,90)",
        boiler_flow_image: "Изображение потока (путь / URL)",
        auto_entry_id: "Авто-определение записи Boiler Manager (выкл. при нескольких)",
        integration_entry_id: "ID записи вручную (пусто = авто при одной записи)",
        hebcal_local_enabled: "Загружать кеш Hebcal из /local/boiler-card/hebcal-…",
        hebcal_cache_path: "Свой URL/путь JSON Hebcal (пусто = авто по entry)",
      },
      fr: {
        language: "Langue",
        title: "Titre",
        switcher_mode: "Mode Switcher",
        boiler_entity: "Entité chauffe-eau",
        temperature_sensor: "Capteur de température",
        power_sensor: "Capteur de puissance (W)",
        current_sensor: "Capteur de courant",
        voltage_sensor: "Capteur de tension",
        switcher_time_left_sensor: "Capteur temps restant Switcher",
        switcher_sensor_1: "Capteur Switcher 1 (marche)",
        switcher_sensor_2: "Capteur Switcher 2 (toujours)",
        switcher_icon_sensor: "Capteur température icône Switcher",
        switcher_timer_values: "Valeurs minuterie Switcher en minutes (ex: 15,30,45,60)",
        timer_values: "Valeurs minuterie en minutes (générique, ex: 20,40,90)",
        boiler_flow_image: "Image du flux d'eau (chemin / URL)",
        auto_entry_id: "Detecter auto l'entree Boiler Manager (off si plusieurs)",
        integration_entry_id: "ID d'entree manuel (vide = auto si une entree)",
        hebcal_local_enabled: "Charger le cache Hebcal (/local/boiler-card/hebcal-…)",
        hebcal_cache_path: "URL/chemin JSON Hebcal (vide = auto selon entry)",
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
