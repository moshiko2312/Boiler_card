"""Constants for Boiler Manager integration."""

from __future__ import annotations

from datetime import timedelta

DOMAIN = "boiler_manager"

CONF_NAME = "name"
CONF_BOILER_ENTITY = "boiler_entity"
CONF_TEMPERATURE_SENSOR = "temperature_sensor"
CONF_POWER_SENSOR = "power_sensor"
CONF_CURRENT_SENSOR = "current_sensor"
CONF_HEBCAL_ENABLED = "hebcal_enabled"
CONF_HEBCAL_CITY = "hebcal_city"

DEFAULT_NAME = "Boiler Manager"
DEFAULT_HEBCAL_CITY = "IL-Jerusalem"

SERVICE_TURN_ON_CONTINUOUS = "turn_on_continuous"
SERVICE_RUN_TIMED = "run_timed"
SERVICE_TURN_OFF = "turn_off"
SERVICE_CREATE_SCHEDULE = "create_schedule"
SERVICE_CREATE_TIMELINE = "create_timeline"
SERVICE_UPDATE_SCHEDULE = "update_schedule"
SERVICE_DELETE_SCHEDULE = "delete_schedule"
SERVICE_EXPORT_TASKS = "export_tasks"
SERVICE_IMPORT_TASKS = "import_tasks"
SERVICE_SET_VACATION_MODE = "set_vacation_mode"
SERVICE_REFRESH_HEBCAL = "refresh_hebcal"

ATTR_ENTRY_ID = "entry_id"
ATTR_TASK_ID = "task_id"
ATTR_TASK_NAME = "name"
ATTR_TASK_TYPE = "task_type"
ATTR_START_TIME = "start_time"
ATTR_END_TIME = "end_time"
ATTR_DAYS = "days"
ATTR_MONTHS = "months"
ATTR_RECURRENCE = "recurrence"
ATTR_START_DATE = "start_date"
ATTR_END_DATE = "end_date"
ATTR_ENABLED = "enabled"
ATTR_CONDITION_ENTITY = "condition_entity"
ATTR_SKIP_IF_STATE = "skip_if_state"
ATTR_CONDITION_OPERATOR = "condition_operator"
ATTR_DURATION = "duration"
ATTR_MINUTES = "minutes"
ATTR_TIMELINE_POINTS = "timeline_points"
ATTR_POINT_TIME = "at"
ATTR_DURATION_OPTION = "duration_option"
ATTR_DURATION_MINUTES = "duration_minutes"
ATTR_MODE = "mode"
ATTR_FILE_PATH = "file_path"
ATTR_TASKS = "tasks"
ATTR_VACATION_MODE = "vacation_mode"

TASK_TYPE_WINDOW = "window"
TASK_TYPE_TIMELINE = "timeline"
TASK_TYPES = [TASK_TYPE_WINDOW, TASK_TYPE_TIMELINE]

RECURRENCE_FOREVER = "forever"
RECURRENCE_ONCE = "once"
RECURRENCE_RANGE = "range"
RECURRENCE_OPTIONS = [RECURRENCE_FOREVER, RECURRENCE_ONCE, RECURRENCE_RANGE]

IMPORT_MODE_MERGE = "merge"
IMPORT_MODE_REPLACE = "replace"
IMPORT_MODES = [IMPORT_MODE_MERGE, IMPORT_MODE_REPLACE]

CONDITION_OPERATOR_EQ = "eq"
CONDITION_OPERATOR_GT = "gt"
CONDITION_OPERATOR_LT = "lt"
CONDITION_OPERATOR_GTE = "gte"
CONDITION_OPERATOR_LTE = "lte"
CONDITION_OPERATORS = [
    CONDITION_OPERATOR_EQ,
    CONDITION_OPERATOR_GT,
    CONDITION_OPERATOR_LT,
    CONDITION_OPERATOR_GTE,
    CONDITION_OPERATOR_LTE,
]

STORAGE_VERSION = 1
STORAGE_KEY = f"{DOMAIN}_{{entry_id}}"

# Run scheduler every second so schedule transitions happen almost immediately.
SCHEDULER_INTERVAL = timedelta(seconds=1)

MODE_OFF = "off"
MODE_MANUAL_CONTINUOUS = "manual_continuous"
MODE_MANUAL_TIMED = "manual_timed"
MODE_SCHEDULE = "schedule"

DAY_NAME_TO_INDEX = {
    "mon": 0,
    "monday": 0,
    "tue": 1,
    "tues": 1,
    "tuesday": 1,
    "wed": 2,
    "wednesday": 2,
    "thu": 3,
    "thur": 3,
    "thurs": 3,
    "thursday": 3,
    "fri": 4,
    "friday": 4,
    "sat": 5,
    "saturday": 5,
    "sun": 6,
    "sunday": 6,
}

WEEKDAY_LABELS = {
    0: "mon",
    1: "tue",
    2: "wed",
    3: "thu",
    4: "fri",
    5: "sat",
    6: "sun",
}


def signal_tasks_updated(entry_id: str) -> str:
    """Return dispatcher signal name for task add/remove/update."""
    return f"{DOMAIN}_{entry_id}_tasks_updated"



def signal_state_updated(entry_id: str) -> str:
    """Return dispatcher signal name for manager state updates."""
    return f"{DOMAIN}_{entry_id}_state_updated"
