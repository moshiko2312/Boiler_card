"""Runtime manager for Boiler Manager integration."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, time, timedelta
import logging
import uuid

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_call_later, async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    ATTR_DAYS,
    ATTR_DURATION,
    ATTR_ENABLED,
    ATTR_END_TIME,
    ATTR_END_DATE,
    ATTR_MINUTES,
    ATTR_MONTHS,
    ATTR_RECURRENCE,
    ATTR_START_TIME,
    ATTR_START_DATE,
    ATTR_TASK_ID,
    ATTR_TASK_NAME,
    CONF_BOILER_ENTITY,
    CONF_CURRENT_SENSOR,
    CONF_NAME,
    CONF_POWER_SENSOR,
    CONF_TEMPERATURE_SENSOR,
    DOMAIN,
    DAY_NAME_TO_INDEX,
    DEFAULT_NAME,
    MODE_MANUAL_CONTINUOUS,
    MODE_MANUAL_TIMED,
    MODE_OFF,
    MODE_SCHEDULE,
    RECURRENCE_FOREVER,
    RECURRENCE_ONCE,
    RECURRENCE_OPTIONS,
    SCHEDULER_INTERVAL,
    STORAGE_KEY,
    STORAGE_VERSION,
    WEEKDAY_LABELS,
    signal_state_updated,
    signal_tasks_updated,
)

_LOGGER = logging.getLogger(__name__)


class BoilerManagerError(HomeAssistantError):
    """Base manager error."""


@dataclass
class BoilerTask:
    """Represents one on/off schedule task."""

    task_id: str
    name: str
    start_time: str
    end_time: str
    days: list[int]
    months: list[int]
    recurrence: str
    start_date: str | None
    end_date: str | None
    enabled: bool
    once_started: bool = False

    def as_dict(self) -> dict:
        """Return serializable dict."""
        return {
            ATTR_TASK_ID: self.task_id,
            ATTR_TASK_NAME: self.name,
            ATTR_START_TIME: self.start_time,
            ATTR_END_TIME: self.end_time,
            ATTR_DAYS: self.days,
            ATTR_MONTHS: self.months,
            ATTR_RECURRENCE: self.recurrence,
            ATTR_START_DATE: self.start_date,
            ATTR_END_DATE: self.end_date,
            ATTR_ENABLED: self.enabled,
            "once_started": self.once_started,
        }


class BoilerManager:
    """Runtime manager for one config entry."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        self._store: Store = Store(
            hass,
            STORAGE_VERSION,
            STORAGE_KEY.format(entry_id=entry.entry_id),
        )

        self._tasks: dict[str, BoilerTask] = {}
        self._unsub_scheduler = None
        self._unsub_timed_off = None

        self._manual_continuous = False
        self._manual_until: datetime | None = None
        self._schedule_driven = False
        self._active_task_ids: set[str] = set()

    @property
    def name(self) -> str:
        """Entry display name."""
        return str(self.entry.options.get(CONF_NAME) or self.entry.data.get(CONF_NAME) or DEFAULT_NAME)

    @property
    def boiler_entity(self) -> str:
        """Main controlled entity."""
        return str(self.entry.options.get(CONF_BOILER_ENTITY) or self.entry.data.get(CONF_BOILER_ENTITY) or "").strip()

    @property
    def temperature_sensor(self) -> str | None:
        """Configured temperature sensor entity."""
        value = str(self.entry.options.get(CONF_TEMPERATURE_SENSOR) or self.entry.data.get(CONF_TEMPERATURE_SENSOR) or "").strip()
        return value or None

    @property
    def power_sensor(self) -> str | None:
        """Configured power sensor entity."""
        value = str(self.entry.options.get(CONF_POWER_SENSOR) or self.entry.data.get(CONF_POWER_SENSOR) or "").strip()
        return value or None

    @property
    def current_sensor(self) -> str | None:
        """Configured current sensor entity."""
        value = str(self.entry.options.get(CONF_CURRENT_SENSOR) or self.entry.data.get(CONF_CURRENT_SENSOR) or "").strip()
        return value or None

    @property
    def tasks(self) -> list[BoilerTask]:
        """Return tasks sorted by name."""
        return sorted(self._tasks.values(), key=lambda task: (task.name.lower(), task.task_id))

    @property
    def active_task_ids(self) -> set[str]:
        """Task ids that are currently active by time window."""
        return set(self._active_task_ids)

    @property
    def mode(self) -> str:
        """Current manager mode."""
        now = dt_util.now()
        if self._manual_continuous:
            return MODE_MANUAL_CONTINUOUS
        if self._manual_until and now < self._manual_until:
            return MODE_MANUAL_TIMED
        if self._active_task_ids:
            return MODE_SCHEDULE
        return MODE_OFF

    @property
    def mode_attributes(self) -> dict:
        """Additional mode attrs for sensors/UI."""
        attrs: dict[str, str | int | list[str] | None] = {
            "boiler_entity": self.boiler_entity,
            "active_tasks_count": len(self._active_task_ids),
            "active_tasks": [
                self._tasks[task_id].name
                for task_id in sorted(self._active_task_ids)
                if task_id in self._tasks
            ],
        }
        if self._manual_until:
            attrs["manual_until"] = dt_util.as_local(self._manual_until).isoformat()
        else:
            attrs["manual_until"] = None
        return attrs

    @property
    def device_info(self) -> dict:
        """Device info for entities."""
        return {
            "identifiers": {("boiler_manager", self.entry.entry_id)},
            "name": self.name,
            "manufacturer": "Boiler Manager",
            "model": "Scheduler",
        }

    async def async_setup(self) -> None:
        """Load persisted state and start scheduler."""
        await self._async_load()
        self._unsub_scheduler = async_track_time_interval(
            self.hass,
            self._async_scheduler_tick,
            SCHEDULER_INTERVAL,
        )
        await self._async_apply_schedule_state()
        self._async_notify_state()

    async def async_unload(self) -> None:
        """Unload manager resources."""
        if self._unsub_scheduler:
            self._unsub_scheduler()
            self._unsub_scheduler = None
        self._cancel_timed_off()
        await self._async_save()

    async def async_create_task(
        self,
        *,
        name: str,
        start_time: str,
        end_time: str,
        days: list[int] | None,
        months: list[int] | None = None,
        recurrence: str | None = None,
        start_date: str | None = None,
        end_date: str | None = None,
        enabled: bool,
    ) -> BoilerTask:
        """Create a new schedule task."""
        normalized_start = _normalize_time_string(start_time)
        normalized_end = _normalize_time_string(end_time)
        normalized_days = _normalize_days(days)
        normalized_months = _normalize_months(months)
        normalized_recurrence = _normalize_recurrence(recurrence)
        normalized_start_date, normalized_end_date = _normalize_date_bounds(
            start_date,
            end_date,
            normalized_recurrence,
        )

        task_name = str(name or "").strip() or f"Task {normalized_start}-{normalized_end}"
        task_id = uuid.uuid4().hex[:10]

        task = BoilerTask(
            task_id=task_id,
            name=task_name,
            start_time=normalized_start,
            end_time=normalized_end,
            days=normalized_days,
            months=normalized_months,
            recurrence=normalized_recurrence,
            start_date=normalized_start_date,
            end_date=normalized_end_date,
            enabled=bool(enabled),
            once_started=False,
        )

        self._tasks[task_id] = task
        await self._async_save()

        async_dispatcher_send(
            self.hass,
            signal_tasks_updated(self.entry.entry_id),
            {"action": "add", ATTR_TASK_ID: task_id},
        )

        await self._async_apply_schedule_state()
        self._async_notify_state()
        return task

    async def async_delete_task(self, task_id: str) -> bool:
        """Delete a schedule task."""
        key = str(task_id or "").strip()
        if not key or key not in self._tasks:
            return False

        self._tasks.pop(key)
        self._async_remove_task_switch_entity(key)
        await self._async_save()

        async_dispatcher_send(
            self.hass,
            signal_tasks_updated(self.entry.entry_id),
            {"action": "remove", ATTR_TASK_ID: key},
        )

        await self._async_apply_schedule_state()
        self._async_notify_state()
        return True

    @callback
    def _async_remove_task_switch_entity(self, task_id: str) -> None:
        """Remove the task switch entity from registry for permanent deletion."""
        registry = er.async_get(self.hass)
        unique_id = f"{self.entry.entry_id}_task_{task_id}"
        entity_id = registry.async_get_entity_id("switch", DOMAIN, unique_id)
        if entity_id:
            registry.async_remove(entity_id)

    async def async_update_task(
        self,
        task_id: str,
        *,
        name: str | None = None,
        start_time: str | None = None,
        end_time: str | None = None,
        days: list[int] | None = None,
        months: list[int] | None = None,
        recurrence: str | None = None,
        start_date: str | None = None,
        end_date: str | None = None,
        enabled: bool | None = None,
    ) -> BoilerTask:
        """Update task fields."""
        key = str(task_id or "").strip()
        if key not in self._tasks:
            raise BoilerManagerError(f"Unknown task id: {key}")

        task = self._tasks[key]

        if name is not None:
            task.name = str(name).strip() or task.name
        if start_time is not None:
            task.start_time = _normalize_time_string(start_time)
        if end_time is not None:
            task.end_time = _normalize_time_string(end_time)
        if days is not None:
            task.days = _normalize_days(days)
        if months is not None:
            task.months = _normalize_months(months)

        next_recurrence = task.recurrence if recurrence is None else _normalize_recurrence(recurrence)
        next_start_date, next_end_date = _normalize_date_bounds(
            task.start_date if start_date is None else start_date,
            task.end_date if end_date is None else end_date,
            next_recurrence,
        )
        task.recurrence = next_recurrence
        task.start_date = next_start_date
        task.end_date = next_end_date
        if recurrence is not None and next_recurrence == RECURRENCE_ONCE:
            task.once_started = False
        if recurrence is not None and next_recurrence != RECURRENCE_ONCE:
            task.once_started = False
        if enabled is not None:
            task.enabled = bool(enabled)

        await self._async_save()

        async_dispatcher_send(
            self.hass,
            signal_tasks_updated(self.entry.entry_id),
            {"action": "update", ATTR_TASK_ID: key},
        )

        await self._async_apply_schedule_state()
        self._async_notify_state()
        return task

    async def async_set_task_enabled(self, task_id: str, enabled: bool) -> None:
        """Enable/disable task from switch entity."""
        await self.async_update_task(task_id, enabled=enabled)

    def get_task(self, task_id: str) -> BoilerTask | None:
        """Return one task by id."""
        return self._tasks.get(task_id)

    async def async_turn_on_continuous(self) -> None:
        """Turn on boiler and keep it running until explicit off."""
        self._manual_continuous = True
        self._manual_until = None
        self._schedule_driven = False
        self._cancel_timed_off()
        await self._async_turn_on_entity()
        self._async_notify_state()

    async def async_run_timed(self, *, duration: str | None = None, minutes: int | None = None) -> int:
        """Turn on boiler for fixed duration.

        Returns seconds scheduled.
        """
        seconds = _duration_to_seconds(duration=duration, minutes=minutes)
        if seconds <= 0:
            raise BoilerManagerError("Duration must be greater than zero")

        now = dt_util.now()
        self._manual_continuous = False
        self._manual_until = now + timedelta(seconds=seconds)
        self._schedule_driven = False

        self._cancel_timed_off()

        @callback
        def _handle_timed_finished(_now) -> None:
            self.hass.async_create_task(self._async_handle_timed_finished())

        self._unsub_timed_off = async_call_later(self.hass, seconds, _handle_timed_finished)

        await self._async_turn_on_entity()
        self._async_notify_state()
        return seconds

    async def async_turn_off(self) -> None:
        """Turn off boiler and clear manual states."""
        self._manual_continuous = False
        self._manual_until = None
        self._schedule_driven = False
        self._cancel_timed_off()
        await self._async_turn_off_entity()
        self._async_notify_state()

    async def _async_handle_timed_finished(self) -> None:
        """Handle end of timed operation."""
        self._manual_until = None
        self._cancel_timed_off()
        await self._async_apply_schedule_state()
        if not self._active_task_ids:
            await self._async_turn_off_entity()
        self._async_notify_state()

    async def _async_scheduler_tick(self, _now) -> None:
        """Periodic schedule evaluation."""
        await self._async_apply_schedule_state()
        self._async_notify_state()

    async def _async_apply_schedule_state(self) -> None:
        """Apply task-driven state (if not in manual mode)."""
        now = dt_util.now()

        if self._manual_until and now >= self._manual_until:
            self._manual_until = None

        previous_active = set(self._active_task_ids)
        active_tasks = self._tasks_active_now(now)
        self._active_task_ids = {task.task_id for task in active_tasks}
        storage_changed = False

        for task in active_tasks:
            if task.recurrence == RECURRENCE_ONCE and not task.once_started:
                task.once_started = True
                storage_changed = True

        finished_once_ids = [
            task.task_id
            for task in self._tasks.values()
            if task.recurrence == RECURRENCE_ONCE
            and task.once_started
            and task.task_id not in self._active_task_ids
        ]

        if finished_once_ids:
            for task_id in finished_once_ids:
                self._tasks.pop(task_id, None)
                self._active_task_ids.discard(task_id)
                self._async_remove_task_switch_entity(task_id)
                async_dispatcher_send(
                    self.hass,
                    signal_tasks_updated(self.entry.entry_id),
                    {"action": "remove", ATTR_TASK_ID: task_id},
                )
            storage_changed = True

        if storage_changed:
            await self._async_save()

        manual_active = self._manual_continuous or self._manual_until is not None
        if manual_active:
            return

        if self._active_task_ids:
            self._schedule_driven = True
            await self._async_turn_on_entity()
            return

        if self._schedule_driven:
            await self._async_turn_off_entity()
            self._schedule_driven = False
        elif previous_active != self._active_task_ids:
            self._schedule_driven = bool(self._active_task_ids)

    async def _async_turn_on_entity(self) -> None:
        """Turn on managed boiler entity."""
        entity_id = self.boiler_entity
        if not entity_id:
            _LOGGER.warning("No boiler entity configured")
            return

        domain = entity_id.split(".", 1)[0]
        await self._async_call_action(domain, "turn_on", entity_id)

    async def _async_turn_off_entity(self) -> None:
        """Turn off managed boiler entity."""
        entity_id = self.boiler_entity
        if not entity_id:
            _LOGGER.warning("No boiler entity configured")
            return

        domain = entity_id.split(".", 1)[0]
        await self._async_call_action(domain, "turn_off", entity_id)

    async def _async_call_action(self, domain: str, service: str, entity_id: str) -> None:
        """Call entity domain service with fallback to homeassistant.*."""
        data = {"entity_id": entity_id}

        try:
            await self.hass.services.async_call(domain, service, data, blocking=True)
            return
        except HomeAssistantError:
            _LOGGER.debug(
                "Service %s.%s failed/unavailable, falling back to homeassistant.%s",
                domain,
                service,
                service,
            )

        try:
            await self.hass.services.async_call("homeassistant", service, data, blocking=True)
        except Exception as err:  # noqa: BLE001
            _LOGGER.error("Failed to call %s on %s: %s", service, entity_id, err)

    def _tasks_active_now(self, now: datetime) -> list[BoilerTask]:
        """Return tasks active for provided timestamp."""
        local_now = dt_util.as_local(now)
        weekday = local_now.weekday()
        previous_weekday = (weekday - 1) % 7
        now_time = local_now.time().replace(second=0, microsecond=0)
        current_date = local_now.date()
        previous_date = current_date - timedelta(days=1)

        active: list[BoilerTask] = []
        for task in self._tasks.values():
            if not task.enabled:
                continue

            start = _time_from_hhmm(task.start_time)
            end = _time_from_hhmm(task.end_time)

            if start == end:
                continue

            # Same-day window, e.g. 10:00 -> 12:00.
            if start < end:
                if _task_matches_schedule_day(task, weekday, current_date) and start <= now_time < end:
                    active.append(task)
                continue

            # Cross-midnight window, e.g. 22:00 -> 02:00.
            if now_time >= start:
                if _task_matches_schedule_day(task, weekday, current_date):
                    active.append(task)
                continue

            if now_time < end and _task_matches_schedule_day(task, previous_weekday, previous_date):
                active.append(task)

        return active

    async def _async_load(self) -> None:
        """Load persisted tasks from storage."""
        raw = await self._store.async_load() or {}
        stored_tasks = raw.get("tasks", [])

        loaded: dict[str, BoilerTask] = {}
        for item in stored_tasks:
            try:
                task = _task_from_raw(item)
            except BoilerManagerError as err:
                _LOGGER.warning("Skipping invalid stored task: %s", err)
                continue
            loaded[task.task_id] = task

        self._tasks = loaded

    async def _async_save(self) -> None:
        """Persist tasks to storage."""
        payload = {"tasks": [task.as_dict() for task in self._tasks.values()]}
        await self._store.async_save(payload)

    def _cancel_timed_off(self) -> None:
        """Cancel pending timed-off callback."""
        if self._unsub_timed_off:
            self._unsub_timed_off()
            self._unsub_timed_off = None

    @callback
    def _async_notify_state(self) -> None:
        """Notify listeners to refresh entity state."""
        async_dispatcher_send(self.hass, signal_state_updated(self.entry.entry_id))


def _task_from_raw(raw: dict) -> BoilerTask:
    """Parse one task object from storage."""
    task_id = str(raw.get(ATTR_TASK_ID) or "").strip()
    if not task_id:
        raise BoilerManagerError("Task missing id")

    name = str(raw.get(ATTR_TASK_NAME) or "").strip()
    if not name:
        name = task_id

    start_time = _normalize_time_string(raw.get(ATTR_START_TIME))
    end_time = _normalize_time_string(raw.get(ATTR_END_TIME))
    days = _normalize_days(raw.get(ATTR_DAYS))
    months = _normalize_months(raw.get(ATTR_MONTHS))
    recurrence = _normalize_recurrence(raw.get(ATTR_RECURRENCE))
    start_date, end_date = _normalize_date_bounds(
        raw.get(ATTR_START_DATE),
        raw.get(ATTR_END_DATE),
        recurrence,
    )
    enabled = bool(raw.get(ATTR_ENABLED, True))
    once_started = bool(raw.get("once_started", False))

    return BoilerTask(
        task_id=task_id,
        name=name,
        start_time=start_time,
        end_time=end_time,
        days=days,
        months=months,
        recurrence=recurrence,
        start_date=start_date,
        end_date=end_date,
        enabled=enabled,
        once_started=once_started,
    )


def _normalize_time_string(value: str | None) -> str:
    """Validate and normalize HH:MM time strings."""
    raw = str(value or "").strip()
    parts = raw.split(":")
    if len(parts) != 2:
        raise BoilerManagerError(f"Invalid time format: {value}. Expected HH:MM")

    try:
        hours = int(parts[0])
        minutes = int(parts[1])
    except ValueError as err:
        raise BoilerManagerError(f"Invalid time: {value}") from err

    if hours < 0 or hours > 23 or minutes < 0 or minutes > 59:
        raise BoilerManagerError(f"Invalid time range: {value}")

    return f"{hours:02d}:{minutes:02d}"


def _normalize_days(value: list[int | str] | None) -> list[int]:
    """Normalize list of weekdays to 0..6. Defaults to all days."""
    if value is None:
        return [0, 1, 2, 3, 4, 5, 6]

    normalized: list[int] = []
    for item in value:
        if isinstance(item, int):
            day = item
        else:
            text = str(item).strip().lower()
            if text.isdigit():
                day = int(text)
            else:
                if text not in DAY_NAME_TO_INDEX:
                    raise BoilerManagerError(f"Unsupported day value: {item}")
                day = DAY_NAME_TO_INDEX[text]

        if day < 0 or day > 6:
            raise BoilerManagerError(f"Day index out of range: {item}")
        if day not in normalized:
            normalized.append(day)

    if not normalized:
        raise BoilerManagerError("At least one day must be provided")

    return sorted(normalized)


def _normalize_months(value: list[int | str] | None) -> list[int]:
    """Normalize list of months to 1..12. Defaults to all months."""
    if value is None:
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

    normalized: list[int] = []
    for item in value:
        if isinstance(item, int):
            month = item
        else:
            text = str(item).strip()
            if not text.isdigit():
                raise BoilerManagerError(f"Unsupported month value: {item}")
            month = int(text)

        if month < 1 or month > 12:
            raise BoilerManagerError(f"Month index out of range: {item}")
        if month not in normalized:
            normalized.append(month)

    if not normalized:
        raise BoilerManagerError("At least one month must be provided")

    return sorted(normalized)


def _normalize_recurrence(value: str | None) -> str:
    """Normalize recurrence mode."""
    if value is None:
        return RECURRENCE_FOREVER

    normalized = str(value).strip().lower()
    if normalized not in RECURRENCE_OPTIONS:
        raise BoilerManagerError(f"Unsupported recurrence: {value}")
    return normalized


def _normalize_date_bounds(
    start_date: str | None,
    end_date: str | None,
    recurrence: str,
) -> tuple[str | None, str | None]:
    """Normalize optional date bounds for recurrence."""
    if recurrence == RECURRENCE_FOREVER:
        return None, None

    start = _normalize_date_string(start_date)
    end = _normalize_date_string(end_date)

    if recurrence == RECURRENCE_ONCE:
        if start and not end:
            end = start
        if end and not start:
            start = end

    if start and end and end < start:
        raise BoilerManagerError("End date cannot be before start date")

    return start, end


def _normalize_date_string(value: str | None) -> str | None:
    """Validate YYYY-MM-DD date and normalize."""
    text = str(value or "").strip()
    if not text:
        return None

    try:
        parsed = date.fromisoformat(text)
    except ValueError as err:
        raise BoilerManagerError(f"Invalid date format: {value}. Expected YYYY-MM-DD") from err

    return parsed.isoformat()


def _task_matches_schedule_day(task: BoilerTask, weekday: int, day_date: date) -> bool:
    """Check if task is eligible for a given schedule day."""
    if weekday not in task.days:
        return False
    if task.months and day_date.month not in task.months:
        return False

    start = _normalize_date_string(task.start_date)
    end = _normalize_date_string(task.end_date)
    if start and day_date < date.fromisoformat(start):
        return False
    if end and day_date > date.fromisoformat(end):
        return False

    return True


def _duration_to_seconds(*, duration: str | None, minutes: int | None) -> int:
    """Parse duration inputs into total seconds."""
    if minutes is not None:
        if minutes <= 0:
            raise BoilerManagerError("Minutes must be > 0")
        return int(minutes) * 60

    if duration is None:
        raise BoilerManagerError("Either duration or minutes must be provided")

    raw = str(duration).strip()
    parts = raw.split(":")

    try:
        numbers = [int(part) for part in parts]
    except ValueError as err:
        raise BoilerManagerError(f"Invalid duration: {duration}") from err

    if len(numbers) == 2:
        mm, ss = numbers
        hh = 0
    elif len(numbers) == 3:
        hh, mm, ss = numbers
    else:
        raise BoilerManagerError("Duration must be MM:SS or HH:MM:SS")

    if hh < 0 or mm < 0 or ss < 0:
        raise BoilerManagerError("Duration values must be positive")

    total = hh * 3600 + mm * 60 + ss
    if total <= 0:
        raise BoilerManagerError("Duration must be greater than zero")

    return total


def _time_from_hhmm(value: str) -> time:
    """Convert HH:MM into datetime.time."""
    hours, minutes = value.split(":", 1)
    return time(hour=int(hours), minute=int(minutes))


def format_days_for_display(days: list[int]) -> str:
    """Human-readable compact weekday labels."""
    return ", ".join(WEEKDAY_LABELS.get(day, str(day)) for day in sorted(days))
