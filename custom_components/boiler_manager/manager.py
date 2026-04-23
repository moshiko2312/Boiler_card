"""Runtime manager for Boiler Manager integration."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime, time, timedelta, timezone
import logging
import re
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
    ATTR_CONDITION_OPERATOR,
    ATTR_CONDITION_ENTITY,
    ATTR_DAYS,
    ATTR_DURATION,
    ATTR_DURATION_MINUTES,
    ATTR_DURATION_OPTION,
    ATTR_ENABLED,
    ATTR_END_TIME,
    ATTR_END_DATE,
    ATTR_MINUTES,
    ATTR_MONTHS,
    ATTR_POINT_TIME,
    ATTR_RECURRENCE,
    ATTR_START_TIME,
    ATTR_START_DATE,
    ATTR_TASK_ID,
    ATTR_TASK_NAME,
    ATTR_TASK_TYPE,
    ATTR_TIMELINE_POINTS,
    ATTR_SKIP_IF_STATE,
    CONF_BOILER_ENTITY,
    CONF_CURRENT_SENSOR,
    CONF_NAME,
    CONF_POWER_SENSOR,
    CONF_TEMPERATURE_SENSOR,
    CONDITION_OPERATOR_EQ,
    CONDITION_OPERATOR_GT,
    CONDITION_OPERATOR_GTE,
    CONDITION_OPERATOR_LT,
    CONDITION_OPERATOR_LTE,
    CONDITION_OPERATORS,
    DOMAIN,
    DAY_NAME_TO_INDEX,
    DEFAULT_NAME,
    MODE_MANUAL_CONTINUOUS,
    MODE_MANUAL_TIMED,
    MODE_OFF,
    MODE_SCHEDULE,
    IMPORT_MODE_MERGE,
    IMPORT_MODE_REPLACE,
    IMPORT_MODES,
    RECURRENCE_FOREVER,
    RECURRENCE_ONCE,
    RECURRENCE_OPTIONS,
    SCHEDULER_INTERVAL,
    STORAGE_KEY,
    STORAGE_VERSION,
    TASK_TYPE_TIMELINE,
    TASK_TYPE_WINDOW,
    TASK_TYPES,
    WEEKDAY_LABELS,
    signal_state_updated,
    signal_tasks_updated,
)

_LOGGER = logging.getLogger(__name__)

STATE_KEY_MANUAL_CONTINUOUS = "manual_continuous"
STATE_KEY_MANUAL_UNTIL = "manual_until"
STATE_KEY_MANUAL_DURATION_SECONDS = "manual_duration_seconds"


class BoilerManagerError(HomeAssistantError):
    """Base manager error."""


@dataclass
class BoilerTimelinePoint:
    """One timeline point (time + duration option)."""

    at: str
    duration_option: str
    duration_minutes: int

    def as_dict(self) -> dict:
        return {
            ATTR_POINT_TIME: self.at,
            ATTR_DURATION_OPTION: self.duration_option,
            ATTR_DURATION_MINUTES: self.duration_minutes,
        }


@dataclass
class BoilerTask:
    """Represents one on/off schedule task."""

    task_id: str
    name: str
    start_time: str
    end_time: str
    task_type: str
    days: list[int]
    months: list[int]
    recurrence: str
    start_date: str | None
    end_date: str | None
    condition_entity: str | None
    condition_operator: str | None
    skip_if_state: str | None
    enabled: bool
    timeline_points: list[BoilerTimelinePoint] = field(default_factory=list)
    once_started: bool = False

    def as_dict(self) -> dict:
        """Return serializable dict."""
        return {
            ATTR_TASK_ID: self.task_id,
            ATTR_TASK_NAME: self.name,
            ATTR_START_TIME: self.start_time,
            ATTR_END_TIME: self.end_time,
            ATTR_TASK_TYPE: self.task_type,
            ATTR_TIMELINE_POINTS: [point.as_dict() for point in self.timeline_points],
            ATTR_DAYS: self.days,
            ATTR_MONTHS: self.months,
            ATTR_RECURRENCE: self.recurrence,
            ATTR_START_DATE: self.start_date,
            ATTR_END_DATE: self.end_date,
            ATTR_CONDITION_ENTITY: self.condition_entity,
            ATTR_CONDITION_OPERATOR: self.condition_operator,
            ATTR_SKIP_IF_STATE: self.skip_if_state,
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
        self._manual_duration_seconds: int | None = None
        self._schedule_driven = False
        self._active_task_ids: set[str] = set()
        # Task ids temporarily skipped until the current active segment ends
        # (used for user-initiated OFF so the task resumes only on its next event).
        self._snoozed_task_until: dict[str, datetime] = {}

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
            "entry_id": self.entry.entry_id,
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
        attrs["manual_duration_seconds"] = self._manual_duration_seconds
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
        await self._async_restore_manual_state()
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
        condition_entity: str | None = None,
        condition_operator: str | None = None,
        skip_if_state: str | None = None,
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
        (
            normalized_condition_entity,
            normalized_condition_operator,
            normalized_skip_if_state,
        ) = _normalize_task_condition(
            condition_entity,
            condition_operator,
            skip_if_state,
        )

        task_name = str(name or "").strip() or f"Task {normalized_start}-{normalized_end}"
        task_id = uuid.uuid4().hex[:10]

        task = BoilerTask(
            task_id=task_id,
            name=task_name,
            start_time=normalized_start,
            end_time=normalized_end,
            task_type=TASK_TYPE_WINDOW,
            timeline_points=[],
            days=normalized_days,
            months=normalized_months,
            recurrence=normalized_recurrence,
            start_date=normalized_start_date,
            end_date=normalized_end_date,
            condition_entity=normalized_condition_entity,
            condition_operator=normalized_condition_operator,
            skip_if_state=normalized_skip_if_state,
            enabled=bool(enabled),
            once_started=False,
        )

        self._ensure_no_duplicate_task(task)
        self._tasks[task_id] = task
        await self._async_save()

        async_dispatcher_send(
            self.hass,
            signal_tasks_updated(self.entry.entry_id),
            {"action": "add", ATTR_TASK_ID: task_id},
        )

        await self._async_apply_schedule_state()
        await self._async_activate_task_immediately_if_active(task_id)
        self._async_notify_state()
        return task

    async def async_create_timeline(
        self,
        *,
        name: str,
        points: list[dict] | None,
        days: list[int] | None,
        months: list[int] | None = None,
        recurrence: str | None = None,
        start_date: str | None = None,
        end_date: str | None = None,
        condition_entity: str | None = None,
        condition_operator: str | None = None,
        skip_if_state: str | None = None,
        enabled: bool,
    ) -> BoilerTask:
        """Create a new timeline task (multiple points on same day pattern)."""
        normalized_days = _normalize_days(days)
        normalized_months = _normalize_months(months)
        normalized_recurrence = _normalize_recurrence(recurrence)
        normalized_start_date, normalized_end_date = _normalize_date_bounds(
            start_date,
            end_date,
            normalized_recurrence,
        )
        (
            normalized_condition_entity,
            normalized_condition_operator,
            normalized_skip_if_state,
        ) = _normalize_task_condition(
            condition_entity,
            condition_operator,
            skip_if_state,
        )
        timeline_points = _normalize_timeline_points(points)
        first_start, last_end = _timeline_time_bounds(timeline_points)

        task_name = str(name or "").strip() or "Timeline"
        task_id = uuid.uuid4().hex[:10]

        task = BoilerTask(
            task_id=task_id,
            name=task_name,
            start_time=first_start,
            end_time=last_end,
            task_type=TASK_TYPE_TIMELINE,
            timeline_points=timeline_points,
            days=normalized_days,
            months=normalized_months,
            recurrence=normalized_recurrence,
            start_date=normalized_start_date,
            end_date=normalized_end_date,
            condition_entity=normalized_condition_entity,
            condition_operator=normalized_condition_operator,
            skip_if_state=normalized_skip_if_state,
            enabled=bool(enabled),
            once_started=False,
        )

        self._ensure_no_duplicate_task(task)
        self._tasks[task_id] = task
        await self._async_save()

        async_dispatcher_send(
            self.hass,
            signal_tasks_updated(self.entry.entry_id),
            {"action": "add", ATTR_TASK_ID: task_id},
        )

        await self._async_apply_schedule_state()
        await self._async_activate_task_immediately_if_active(task_id)
        self._async_notify_state()
        return task

    async def async_delete_task(self, task_id: str) -> bool:
        """Delete a schedule task."""
        key = str(task_id or "").strip()
        if not key or key not in self._tasks:
            return False

        self._tasks.pop(key)
        self._snoozed_task_until.pop(key, None)
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
        task_type: str | None = None,
        start_time: str | None = None,
        end_time: str | None = None,
        timeline_points: list[dict] | None = None,
        days: list[int] | None = None,
        months: list[int] | None = None,
        recurrence: str | None = None,
        start_date: str | None = None,
        end_date: str | None = None,
        condition_entity: str | None = None,
        condition_operator: str | None = None,
        skip_if_state: str | None = None,
        enabled: bool | None = None,
    ) -> BoilerTask:
        """Update task fields."""
        key = str(task_id or "").strip()
        if key not in self._tasks:
            raise BoilerManagerError(f"Unknown task id: {key}")

        task = self._tasks[key]
        snapshot = task.as_dict()
        self._snoozed_task_until.pop(key, None)

        try:
            if name is not None:
                task.name = str(name).strip() or task.name

            next_task_type = task.task_type if task_type is None else _normalize_task_type(task_type)
            task.task_type = next_task_type

            if next_task_type == TASK_TYPE_TIMELINE:
                if timeline_points is not None:
                    next_points = _normalize_timeline_points(timeline_points)
                elif task.timeline_points:
                    next_points = list(task.timeline_points)
                else:
                    derived_start = _normalize_time_string(start_time) if start_time is not None else task.start_time
                    derived_end = _normalize_time_string(end_time) if end_time is not None else task.end_time
                    minutes = max(1, _minutes_between(derived_start, derived_end))
                    next_points = _normalize_timeline_points(
                        [
                            {
                                ATTR_POINT_TIME: derived_start,
                                ATTR_DURATION_OPTION: _minutes_to_option_label(minutes),
                                ATTR_DURATION_MINUTES: minutes,
                            }
                        ]
                    )
                task.timeline_points = next_points
                task.start_time, task.end_time = _timeline_time_bounds(next_points)
            else:
                task.timeline_points = []
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
            if (
                condition_entity is not None
                or condition_operator is not None
                or skip_if_state is not None
            ):
                next_condition_entity = task.condition_entity if condition_entity is None else condition_entity
                next_condition_operator = (
                    task.condition_operator if condition_operator is None else condition_operator
                )
                next_skip_if_state = task.skip_if_state if skip_if_state is None else skip_if_state
                (
                    task.condition_entity,
                    task.condition_operator,
                    task.skip_if_state,
                ) = _normalize_task_condition(
                    next_condition_entity,
                    next_condition_operator,
                    next_skip_if_state,
                )
            if enabled is not None:
                task.enabled = bool(enabled)

            self._ensure_no_duplicate_task(task, exclude_task_id=key)
        except BoilerManagerError:
            self._tasks[key] = _task_from_raw(snapshot)
            raise

        await self._async_save()

        async_dispatcher_send(
            self.hass,
            signal_tasks_updated(self.entry.entry_id),
            {"action": "update", ATTR_TASK_ID: key},
        )

        await self._async_apply_schedule_state()
        await self._async_activate_task_immediately_if_active(key)
        self._async_notify_state()
        return task

    async def async_set_task_enabled(self, task_id: str, enabled: bool) -> None:
        """Enable/disable task from switch entity."""
        await self.async_update_task(task_id, enabled=enabled)

    def get_task(self, task_id: str) -> BoilerTask | None:
        """Return one task by id."""
        return self._tasks.get(task_id)

    def _ensure_no_duplicate_task(self, candidate: BoilerTask, *, exclude_task_id: str | None = None) -> None:
        """Block duplicate tasks with identical timing/day logic."""
        candidate_key = _task_duplicate_signature(candidate)
        for existing in self._tasks.values():
            if exclude_task_id and existing.task_id == exclude_task_id:
                continue
            if _task_duplicate_signature(existing) != candidate_key:
                continue
            raise BoilerManagerError(
                f"Duplicate task detected: '{candidate.name}' matches '{existing.name}'"
            )

    def export_tasks_payload(self) -> dict:
        """Return tasks payload for backup/export."""
        return {
            "version": 1,
            "tasks": [_task_to_export_dict(task) for task in self.tasks],
        }

    async def async_import_tasks(
        self,
        raw_tasks: list[dict],
        *,
        mode: str = IMPORT_MODE_MERGE,
    ) -> dict[str, int]:
        """Import tasks from payload with merge/replace mode."""
        normalized_mode = str(mode or IMPORT_MODE_MERGE).strip().lower()
        if normalized_mode not in IMPORT_MODES:
            raise BoilerManagerError(
                f"Unsupported import mode: {mode}. Expected one of: {', '.join(IMPORT_MODES)}"
            )

        if not isinstance(raw_tasks, list):
            raise BoilerManagerError("Import payload must include a tasks list")

        imported_tasks: list[BoilerTask] = []
        for index, raw in enumerate(raw_tasks, start=1):
            try:
                task = _task_from_import_raw(raw)
            except BoilerManagerError as err:
                raise BoilerManagerError(f"Invalid imported task #{index}: {err}") from err
            imported_tasks.append(task)

        existing_by_signature: dict[str, BoilerTask] = {}
        if normalized_mode == IMPORT_MODE_MERGE:
            existing_by_signature = {
                _task_duplicate_signature(task): task for task in self._tasks.values()
            }

        seen_import_signatures: dict[str, BoilerTask] = {}
        for task in imported_tasks:
            signature = _task_duplicate_signature(task)
            duplicate_import = seen_import_signatures.get(signature)
            if duplicate_import:
                raise BoilerManagerError(
                    f"Import payload has duplicate tasks: '{duplicate_import.name}' and '{task.name}'"
                )
            seen_import_signatures[signature] = task

            if normalized_mode == IMPORT_MODE_MERGE and signature in existing_by_signature:
                existing = existing_by_signature[signature]
                raise BoilerManagerError(
                    f"Imported task '{task.name}' duplicates existing task '{existing.name}'"
                )

        removed_ids: list[str] = []
        if normalized_mode == IMPORT_MODE_REPLACE:
            removed_ids = list(self._tasks.keys())
            for task_id in removed_ids:
                self._async_remove_task_switch_entity(task_id)
            self._tasks.clear()
            self._active_task_ids.clear()
            self._snoozed_task_until.clear()

        for task in imported_tasks:
            self._tasks[task.task_id] = task

        await self._async_save()

        for task_id in removed_ids:
            async_dispatcher_send(
                self.hass,
                signal_tasks_updated(self.entry.entry_id),
                {"action": "remove", ATTR_TASK_ID: task_id},
            )

        for task in imported_tasks:
            async_dispatcher_send(
                self.hass,
                signal_tasks_updated(self.entry.entry_id),
                {"action": "add", ATTR_TASK_ID: task.task_id},
            )

        await self._async_apply_schedule_state()
        self._async_notify_state()
        return {
            "imported": len(imported_tasks),
            "removed": len(removed_ids),
            "total": len(self._tasks),
        }

    async def async_turn_on_continuous(self) -> None:
        """Turn on boiler and keep it running until explicit off."""
        self._manual_continuous = True
        self._manual_until = None
        self._manual_duration_seconds = None
        self._schedule_driven = False
        self._cancel_timed_off()
        await self._async_save()
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
        self._manual_duration_seconds = seconds
        self._schedule_driven = False

        self._cancel_timed_off()
        self._schedule_manual_timeout(seconds)

        await self._async_save()
        await self._async_turn_on_entity()
        self._async_notify_state()
        return seconds

    async def async_turn_off(self) -> None:
        """Turn off boiler and clear manual states."""
        now = dt_util.now()
        self._async_snooze_active_tasks_until_segment_end(now)
        self._manual_continuous = False
        self._manual_until = None
        self._manual_duration_seconds = None
        self._schedule_driven = False
        self._cancel_timed_off()
        await self._async_save()
        await self._async_apply_schedule_state()
        await self._async_turn_off_entity()
        self._async_notify_state()

    async def _async_handle_timed_finished(self) -> None:
        """Handle end of timed operation."""
        self._manual_until = None
        self._manual_duration_seconds = None
        self._cancel_timed_off()
        await self._async_save()
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
        manual_timed_expired = False

        if self._manual_until and now >= self._manual_until:
            self._manual_until = None
            self._manual_duration_seconds = None
            self._cancel_timed_off()
            manual_timed_expired = True
            await self._async_save()

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

        # If a scheduled task becomes active while manual timed mode is running,
        # schedule should take over immediately.
        if self._manual_until and self._active_task_ids:
            self._manual_until = None
            self._manual_duration_seconds = None
            self._cancel_timed_off()
            await self._async_save()

        manual_active = self._manual_continuous or self._manual_until is not None
        if manual_active:
            return

        if self._active_task_ids:
            self._schedule_driven = True
            await self._async_turn_on_entity()
            return

        if self._schedule_driven or manual_timed_expired:
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

    async def _async_activate_task_immediately_if_active(self, task_id: str) -> None:
        """Turn on boiler immediately when a just-saved task is active right now."""
        key = str(task_id or "").strip()
        if not key:
            return

        task = self._tasks.get(key)
        if not task or not task.enabled:
            return

        now = dt_util.now()
        active_now = self._tasks_active_now(now)
        active_ids = {item.task_id for item in active_now}
        if key not in active_ids:
            return

        self._active_task_ids = active_ids

        if self._manual_continuous or self._manual_until is not None:
            return

        self._schedule_driven = True
        await self._async_turn_on_entity()

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
            if self._task_is_blocked_by_condition(task):
                continue
            snoozed_until = self._snoozed_task_until.get(task.task_id)
            if snoozed_until:
                if now < snoozed_until:
                    continue
                self._snoozed_task_until.pop(task.task_id, None)

            windows = _task_time_windows(task)
            for start, end in windows:
                if start == end:
                    continue

                # Same-day window, e.g. 10:00 -> 12:00.
                if start < end:
                    if _task_matches_schedule_day(task, weekday, current_date) and start <= now_time < end:
                        active.append(task)
                        break
                    continue

                # Cross-midnight window, e.g. 22:00 -> 02:00.
                if now_time >= start:
                    if _task_matches_schedule_day(task, weekday, current_date):
                        active.append(task)
                        break
                    continue

                if now_time < end and _task_matches_schedule_day(task, previous_weekday, previous_date):
                    active.append(task)
                    break

        return active

    def _task_is_blocked_by_condition(self, task: BoilerTask) -> bool:
        """Return True when task should be skipped due to external entity condition."""
        condition_entity = str(task.condition_entity or "").strip()
        condition_operator = _normalize_condition_operator(task.condition_operator)
        condition_value = str(task.skip_if_state or "").strip()
        if not condition_entity or not condition_value:
            return False

        condition_state = self.hass.states.get(condition_entity)
        if condition_state is None:
            return False

        current_state = str(condition_state.state or "").strip()
        if condition_operator == CONDITION_OPERATOR_EQ:
            return current_state.lower() == condition_value.lower()

        current_numeric = _parse_float(current_state)
        expected_numeric = _parse_float(condition_value)
        if current_numeric is None or expected_numeric is None:
            return False

        if condition_operator == CONDITION_OPERATOR_GT:
            return current_numeric > expected_numeric
        if condition_operator == CONDITION_OPERATOR_LT:
            return current_numeric < expected_numeric
        if condition_operator == CONDITION_OPERATOR_GTE:
            return current_numeric >= expected_numeric
        if condition_operator == CONDITION_OPERATOR_LTE:
            return current_numeric <= expected_numeric

        return False

    def _async_snooze_active_tasks_until_segment_end(self, now: datetime) -> None:
        """Skip currently active task segments until they naturally end."""
        for task in self._tasks_active_now(now):
            active_until = self._task_active_until(task, now)
            if active_until and active_until > now:
                self._snoozed_task_until[task.task_id] = active_until

    def _task_active_until(self, task: BoilerTask, now: datetime) -> datetime | None:
        """Return end timestamp of the currently active segment for one task."""
        local_now = dt_util.as_local(now)
        tzinfo = local_now.tzinfo
        if tzinfo is None:
            return None

        weekday = local_now.weekday()
        previous_weekday = (weekday - 1) % 7
        now_time = local_now.time().replace(second=0, microsecond=0)
        current_date = local_now.date()
        previous_date = current_date - timedelta(days=1)
        next_date = current_date + timedelta(days=1)

        latest_end_local: datetime | None = None
        for start, end in _task_time_windows(task):
            if start == end:
                continue

            end_local: datetime | None = None
            if start < end:
                if _task_matches_schedule_day(task, weekday, current_date) and start <= now_time < end:
                    end_local = datetime.combine(current_date, end, tzinfo=tzinfo)
            else:
                if now_time >= start and _task_matches_schedule_day(task, weekday, current_date):
                    end_local = datetime.combine(next_date, end, tzinfo=tzinfo)
                elif now_time < end and _task_matches_schedule_day(task, previous_weekday, previous_date):
                    end_local = datetime.combine(current_date, end, tzinfo=tzinfo)

            if end_local and (latest_end_local is None or end_local > latest_end_local):
                latest_end_local = end_local

        if latest_end_local is None:
            return None
        return dt_util.as_utc(latest_end_local)

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
        self._manual_continuous = bool(raw.get(STATE_KEY_MANUAL_CONTINUOUS, False))
        self._manual_until = _parse_stored_datetime(raw.get(STATE_KEY_MANUAL_UNTIL))
        self._manual_duration_seconds = _parse_positive_int(raw.get(STATE_KEY_MANUAL_DURATION_SECONDS))
        if self._manual_continuous:
            # Continuous and timed are mutually exclusive.
            self._manual_until = None
            self._manual_duration_seconds = None

    async def _async_save(self) -> None:
        """Persist tasks to storage."""
        payload = {
            "tasks": [task.as_dict() for task in self._tasks.values()],
            STATE_KEY_MANUAL_CONTINUOUS: self._manual_continuous,
            STATE_KEY_MANUAL_UNTIL: (
                dt_util.as_utc(self._manual_until).isoformat() if self._manual_until else None
            ),
            STATE_KEY_MANUAL_DURATION_SECONDS: self._manual_duration_seconds,
        }
        await self._store.async_save(payload)

    def _cancel_timed_off(self) -> None:
        """Cancel pending timed-off callback."""
        if self._unsub_timed_off:
            self._unsub_timed_off()
            self._unsub_timed_off = None

    def _schedule_manual_timeout(self, seconds: int) -> None:
        """Schedule callback for current timed-manual session."""
        @callback
        def _handle_timed_finished(_now) -> None:
            self.hass.async_create_task(self._async_handle_timed_finished())

        self._unsub_timed_off = async_call_later(self.hass, max(1, int(seconds)), _handle_timed_finished)

    async def _async_restore_manual_state(self) -> None:
        """Restore runtime manual state after Home Assistant restart."""
        now = dt_util.now()

        if self._manual_continuous:
            await self._async_turn_on_entity()
            return

        if not self._manual_until:
            return

        if self._manual_until <= now:
            return

        remaining_seconds = int((self._manual_until - now).total_seconds())
        self._schedule_manual_timeout(remaining_seconds)
        await self._async_turn_on_entity()

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
    task_type = _normalize_task_type(raw.get(ATTR_TASK_TYPE))
    timeline_points: list[BoilerTimelinePoint] = []
    if task_type == TASK_TYPE_TIMELINE:
        raw_points = raw.get(ATTR_TIMELINE_POINTS)
        if raw_points in (None, []):
            # Fallback for old/partial payloads without timeline points.
            timeline_points = _normalize_timeline_points(
                [
                    {
                        ATTR_POINT_TIME: start_time,
                        ATTR_DURATION_OPTION: _minutes_to_option_label(
                            max(1, _minutes_between(start_time, end_time))
                        ),
                        ATTR_DURATION_MINUTES: max(1, _minutes_between(start_time, end_time)),
                    }
                ]
            )
        else:
            timeline_points = _normalize_timeline_points(raw_points)
        start_time, end_time = _timeline_time_bounds(timeline_points)
    days = _normalize_days(raw.get(ATTR_DAYS))
    months = _normalize_months(raw.get(ATTR_MONTHS))
    recurrence = _normalize_recurrence(raw.get(ATTR_RECURRENCE))
    start_date, end_date = _normalize_date_bounds(
        raw.get(ATTR_START_DATE),
        raw.get(ATTR_END_DATE),
        recurrence,
    )
    condition_entity, condition_operator, skip_if_state = _normalize_task_condition(
        raw.get(ATTR_CONDITION_ENTITY),
        raw.get(ATTR_CONDITION_OPERATOR),
        raw.get(ATTR_SKIP_IF_STATE),
    )
    enabled = bool(raw.get(ATTR_ENABLED, True))
    once_started = bool(raw.get("once_started", False))

    return BoilerTask(
        task_id=task_id,
        name=name,
        start_time=start_time,
        end_time=end_time,
        task_type=task_type,
        timeline_points=timeline_points,
        days=days,
        months=months,
        recurrence=recurrence,
        start_date=start_date,
        end_date=end_date,
        condition_entity=condition_entity,
        condition_operator=condition_operator,
        skip_if_state=skip_if_state,
        enabled=enabled,
        once_started=once_started,
    )


def _task_to_export_dict(task: BoilerTask) -> dict:
    """Convert runtime task to portable export payload."""
    return {
        ATTR_TASK_NAME: task.name,
        ATTR_TASK_TYPE: task.task_type,
        ATTR_START_TIME: task.start_time,
        ATTR_END_TIME: task.end_time,
        ATTR_TIMELINE_POINTS: [point.as_dict() for point in task.timeline_points],
        ATTR_DAYS: list(task.days),
        ATTR_MONTHS: list(task.months),
        ATTR_RECURRENCE: task.recurrence,
        ATTR_START_DATE: task.start_date,
        ATTR_END_DATE: task.end_date,
        ATTR_CONDITION_ENTITY: task.condition_entity,
        ATTR_CONDITION_OPERATOR: task.condition_operator,
        ATTR_SKIP_IF_STATE: task.skip_if_state,
        ATTR_ENABLED: bool(task.enabled),
    }


def _task_from_import_raw(raw: dict) -> BoilerTask:
    """Parse one task object from import payload (without task_id/entity ids)."""
    if not isinstance(raw, dict):
        raise BoilerManagerError("Task payload must be an object")

    name = str(raw.get(ATTR_TASK_NAME) or "").strip()
    if not name:
        raise BoilerManagerError("Task name is required")

    task_type = _normalize_task_type(raw.get(ATTR_TASK_TYPE))
    recurrence = _normalize_recurrence(raw.get(ATTR_RECURRENCE))
    days = _normalize_days(raw.get(ATTR_DAYS))
    months = _normalize_months(raw.get(ATTR_MONTHS))
    start_date, end_date = _normalize_date_bounds(
        raw.get(ATTR_START_DATE),
        raw.get(ATTR_END_DATE),
        recurrence,
    )
    condition_entity, condition_operator, skip_if_state = _normalize_task_condition(
        raw.get(ATTR_CONDITION_ENTITY),
        raw.get(ATTR_CONDITION_OPERATOR),
        raw.get(ATTR_SKIP_IF_STATE),
    )
    enabled = bool(raw.get(ATTR_ENABLED, True))

    if task_type == TASK_TYPE_TIMELINE:
        raw_points = raw.get(ATTR_TIMELINE_POINTS)
        if raw_points in (None, []):
            start_time = _normalize_time_string(raw.get(ATTR_START_TIME))
            end_time = _normalize_time_string(raw.get(ATTR_END_TIME))
            minutes = max(1, _minutes_between(start_time, end_time))
            timeline_points = _normalize_timeline_points(
                [
                    {
                        ATTR_POINT_TIME: start_time,
                        ATTR_DURATION_OPTION: _minutes_to_option_label(minutes),
                        ATTR_DURATION_MINUTES: minutes,
                    }
                ]
            )
        else:
            timeline_points = _normalize_timeline_points(raw_points)
        start_time, end_time = _timeline_time_bounds(timeline_points)
    else:
        timeline_points = []
        start_time = _normalize_time_string(raw.get(ATTR_START_TIME))
        end_time = _normalize_time_string(raw.get(ATTR_END_TIME))

    return BoilerTask(
        task_id=uuid.uuid4().hex[:10],
        name=name,
        start_time=start_time,
        end_time=end_time,
        task_type=task_type,
        timeline_points=timeline_points,
        days=days,
        months=months,
        recurrence=recurrence,
        start_date=start_date,
        end_date=end_date,
        condition_entity=condition_entity,
        condition_operator=condition_operator,
        skip_if_state=skip_if_state,
        enabled=enabled,
        once_started=False,
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


def _parse_stored_datetime(value: str | None) -> datetime | None:
    """Parse datetime persisted in manager storage."""
    raw = str(value or "").strip()
    if not raw:
        return None

    parsed = dt_util.parse_datetime(raw)
    if parsed is None:
        return None

    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return dt_util.as_utc(parsed)


def _parse_positive_int(value: int | str | None) -> int | None:
    """Parse positive integer from storage payload."""
    if value is None:
        return None
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return None
    if parsed <= 0:
        return None
    return parsed


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


def _normalize_task_type(value: str | None) -> str:
    """Normalize task type."""
    if value is None:
        return TASK_TYPE_WINDOW

    normalized = str(value).strip().lower()
    if normalized not in TASK_TYPES:
        raise BoilerManagerError(f"Unsupported task type: {value}")
    return normalized


def _normalize_task_condition(
    condition_entity: str | None,
    condition_operator: str | None,
    skip_if_state: str | None,
) -> tuple[str | None, str | None, str | None]:
    """Normalize optional skip condition fields."""
    entity = str(condition_entity or "").strip()
    operator = _normalize_condition_operator(condition_operator)
    state = str(skip_if_state or "").strip()

    if not entity:
        return None, None, None
    if "." not in entity:
        raise BoilerManagerError(f"Invalid condition entity id: {condition_entity}")
    if not state:
        if operator == CONDITION_OPERATOR_EQ:
            state = "on"
        else:
            raise BoilerManagerError("Condition value is required for numeric operators")

    if operator != CONDITION_OPERATOR_EQ and _parse_float(state) is None:
        raise BoilerManagerError(
            f"Condition value must be numeric for operator '{operator}': {skip_if_state}"
        )

    return entity, operator, state


def _normalize_condition_operator(value: str | None) -> str:
    """Normalize condition operator token."""
    normalized = str(value or "").strip().lower()
    aliases = {
        "": CONDITION_OPERATOR_EQ,
        "=": CONDITION_OPERATOR_EQ,
        "==": CONDITION_OPERATOR_EQ,
        "eq": CONDITION_OPERATOR_EQ,
        ">": CONDITION_OPERATOR_GT,
        "gt": CONDITION_OPERATOR_GT,
        "<": CONDITION_OPERATOR_LT,
        "lt": CONDITION_OPERATOR_LT,
        ">=": CONDITION_OPERATOR_GTE,
        "gte": CONDITION_OPERATOR_GTE,
        "<=": CONDITION_OPERATOR_LTE,
        "lte": CONDITION_OPERATOR_LTE,
    }
    operator = aliases.get(normalized)
    if operator is None or operator not in CONDITION_OPERATORS:
        raise BoilerManagerError(f"Unsupported condition operator: {value}")
    return operator


def _parse_float(value: str | None) -> float | None:
    """Parse numeric string into float, return None if invalid."""
    raw = str(value or "").strip()
    if not raw:
        return None
    try:
        return float(raw)
    except (TypeError, ValueError):
        return None


def _normalize_timeline_points(value: list[dict] | None) -> list[BoilerTimelinePoint]:
    """Normalize timeline point payloads."""
    if value is None:
        return []
    if not isinstance(value, list):
        raise BoilerManagerError("Timeline points must be a list")

    normalized: list[BoilerTimelinePoint] = []
    for raw in value:
        if not isinstance(raw, dict):
            raise BoilerManagerError("Invalid timeline point format")

        at = _normalize_time_string(raw.get(ATTR_POINT_TIME))
        option = str(raw.get(ATTR_DURATION_OPTION) or "").strip()
        minutes_raw = raw.get(ATTR_DURATION_MINUTES)

        if minutes_raw is None:
            minutes = _option_to_minutes(option)
        else:
            try:
                minutes = int(minutes_raw)
            except (TypeError, ValueError) as err:
                raise BoilerManagerError("Invalid timeline duration minutes") from err

        if minutes <= 0:
            raise BoilerManagerError("Timeline duration must be greater than zero")
        if not option:
            option = _minutes_to_option_label(minutes)

        normalized.append(
            BoilerTimelinePoint(
                at=at,
                duration_option=option,
                duration_minutes=minutes,
            )
        )

    if not normalized:
        raise BoilerManagerError("At least one timeline point must be provided")

    normalized.sort(key=lambda point: point.at)
    return normalized


def _option_to_minutes(value: str) -> int:
    """Parse minutes from option text like 30m / 30 min / etc."""
    normalized = str(value or "").strip().lower()
    if not normalized:
        return 0
    if "no timer" in normalized or "ללא" in normalized or "без таймера" in normalized:
        return 0

    match = re.search(r"(\d+)", normalized)
    if not match:
        return 0
    return int(match.group(1))


def _minutes_to_option_label(minutes: int) -> str:
    """Build default option label."""
    return f"{int(minutes)}m"


def _minutes_between(start_hhmm: str, end_hhmm: str) -> int:
    """Minutes from start to end, wrapping across midnight when needed."""
    start = _time_from_hhmm(start_hhmm)
    end = _time_from_hhmm(end_hhmm)
    base = date(2000, 1, 1)
    start_dt = datetime.combine(base, start)
    end_dt = datetime.combine(base, end)
    if end_dt <= start_dt:
        end_dt += timedelta(days=1)
    return int((end_dt - start_dt).total_seconds() // 60)


def _time_plus_minutes(start_hhmm: str, minutes: int) -> str:
    """Return HH:MM after adding minutes to a start HH:MM."""
    start = _time_from_hhmm(start_hhmm)
    base = datetime.combine(date(2000, 1, 1), start)
    result = base + timedelta(minutes=minutes)
    return result.time().replace(second=0, microsecond=0).strftime("%H:%M")


def _timeline_time_bounds(points: list[BoilerTimelinePoint]) -> tuple[str, str]:
    """Return rough first/last bounds for timeline metadata display."""
    if not points:
        return "00:00", "00:00"

    sorted_points = sorted(points, key=lambda point: point.at)
    start = sorted_points[0].at

    def _end_key(point: BoilerTimelinePoint) -> tuple[int, str]:
        start_minutes = _time_from_hhmm(point.at).hour * 60 + _time_from_hhmm(point.at).minute
        end_minutes = start_minutes + int(point.duration_minutes)
        return end_minutes, point.at

    last_point = max(sorted_points, key=_end_key)
    end = _time_plus_minutes(last_point.at, last_point.duration_minutes)
    return start, end


def _task_time_windows(task: BoilerTask) -> list[tuple[time, time]]:
    """Return normalized active windows for a task."""
    if task.task_type == TASK_TYPE_TIMELINE and task.timeline_points:
        windows: list[tuple[time, time]] = []
        for point in task.timeline_points:
            start = _time_from_hhmm(point.at)
            end = _time_from_hhmm(_time_plus_minutes(point.at, point.duration_minutes))
            windows.append((start, end))
        return windows

    return [(_time_from_hhmm(task.start_time), _time_from_hhmm(task.end_time))]


def _task_duplicate_signature(task: BoilerTask) -> str:
    """Stable signature for duplicate detection."""
    task_type = TASK_TYPE_TIMELINE if task.task_type == TASK_TYPE_TIMELINE else TASK_TYPE_WINDOW
    days = ",".join(str(day) for day in sorted(set(task.days)))
    months = ",".join(str(month) for month in sorted(set(task.months)))
    recurrence = _normalize_recurrence(task.recurrence)
    start_date, end_date = _normalize_date_bounds(task.start_date, task.end_date, recurrence)
    range_start = start_date or ""
    range_end = end_date or ""

    if task_type == TASK_TYPE_TIMELINE:
        points = sorted(
            (
                f"{_normalize_time_string(point.at)}>{max(1, int(point.duration_minutes))}"
                for point in task.timeline_points
            ),
            key=str,
        )
        points_key = ",".join(points)
        return "|".join(
            [
                task_type,
                points_key,
                days,
                months,
                recurrence,
                range_start,
                range_end,
            ]
        )

    start_time = _normalize_time_string(task.start_time)
    end_time = _normalize_time_string(task.end_time)
    return "|".join(
        [
            task_type,
            start_time,
            end_time,
            days,
            months,
            recurrence,
            range_start,
            range_end,
        ]
    )


def format_timeline_for_display(points: list[BoilerTimelinePoint]) -> str:
    """Human-readable timeline summary for UI."""
    if not points:
        return ""
    ordered = sorted(points, key=lambda point: point.at)
    chunks = [f"{point.at}→{point.duration_option}" for point in ordered]
    return " | ".join(chunks)


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
