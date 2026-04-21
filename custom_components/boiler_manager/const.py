"""Constants for Boiler Manager integration."""

from __future__ import annotations

from datetime import timedelta

DOMAIN = "boiler_manager"

CONF_NAME = "name"
CONF_BOILER_ENTITY = "boiler_entity"
CONF_TEMPERATURE_SENSOR = "temperature_sensor"
CONF_POWER_SENSOR = "power_sensor"
CONF_CURRENT_SENSOR = "current_sensor"

DEFAULT_NAME = "Boiler Manager"

SERVICE_TURN_ON_CONTINUOUS = "turn_on_continuous"
SERVICE_RUN_TIMED = "run_timed"
SERVICE_TURN_OFF = "turn_off"
SERVICE_CREATE_SCHEDULE = "create_schedule"
SERVICE_UPDATE_SCHEDULE = "update_schedule"
SERVICE_DELETE_SCHEDULE = "delete_schedule"

ATTR_ENTRY_ID = "entry_id"
ATTR_TASK_ID = "task_id"
ATTR_TASK_NAME = "name"
ATTR_START_TIME = "start_time"
ATTR_END_TIME = "end_time"
ATTR_DAYS = "days"
ATTR_ENABLED = "enabled"
ATTR_DURATION = "duration"
ATTR_MINUTES = "minutes"

STORAGE_VERSION = 1
STORAGE_KEY = f"{DOMAIN}_{{entry_id}}"

SCHEDULER_INTERVAL = timedelta(minutes=1)

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
