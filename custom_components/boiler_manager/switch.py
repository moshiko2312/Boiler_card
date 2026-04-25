"""Switch platform for Boiler Manager."""

from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers import entity_registry as er

from .const import (
    ATTR_CONDITION_OPERATOR,
    ATTR_HEBCAL_EVENT_KIND,
    ATTR_HEBCAL_EVENT_PHASE,
    ATTR_HEBCAL_HOLIDAY_MODE,
    ATTR_HEBCAL_OFFSET_MINUTES,
    ATTR_TASK_ID,
    ATTR_TASK_TYPE,
    ATTR_TRIGGER_MODE,
    DOMAIN,
    signal_state_updated,
    signal_tasks_updated,
)
from .manager import (
    BoilerManager,
    BoilerTask,
    async_user_label_from_context,
    format_days_for_display,
    format_timeline_for_display,
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Boiler Manager switch entities from config entry."""
    manager: BoilerManager = hass.data[DOMAIN]["managers"][entry.entry_id]

    entities: dict[str, BoilerTaskSwitch] = {}

    for task in manager.tasks:
        entity = BoilerTaskSwitch(manager, task.task_id)
        entities[task.task_id] = entity

    if entities:
        async_add_entities(list(entities.values()))

    @callback
    def _handle_tasks_update(payload: dict[str, Any]) -> None:
        action = payload.get("action")
        task_id = payload.get(ATTR_TASK_ID)
        if not task_id:
            return

        if action == "add":
            if task_id in entities:
                return
            task = manager.get_task(task_id)
            if not task:
                return
            entity = BoilerTaskSwitch(manager, task_id)
            entities[task_id] = entity
            async_add_entities([entity])
            return

        if action == "remove":
            entity = entities.pop(task_id, None)
            if entity:
                registry = er.async_get(hass)
                if entity.entity_id and registry.async_get(entity.entity_id):
                    registry.async_remove(entity.entity_id)
                hass.async_create_task(entity.async_remove())
            return

        if action == "update":
            entity = entities.get(task_id)
            if entity:
                entity._sync_name_from_task(sync_registry=True)
                entity.async_write_ha_state()

    entry.async_on_unload(
        async_dispatcher_connect(
            hass,
            signal_tasks_updated(entry.entry_id),
            _handle_tasks_update,
        )
    )


class BoilerTaskSwitch(SwitchEntity):
    """One schedule task switch entity."""

    _attr_has_entity_name = False
    _attr_icon = "mdi:calendar-clock"

    def __init__(self, manager: BoilerManager, task_id: str) -> None:
        self._manager = manager
        self._task_id = task_id
        self._attr_unique_id = f"{manager.entry.entry_id}_task_{task_id}"
        self._last_known_name = ""
        self._sync_name_from_task(sync_registry=False)

    @property
    def name(self) -> str:
        """Switch name."""
        return self._attr_name

    @property
    def available(self) -> bool:
        """Whether task exists."""
        return self._task is not None

    @property
    def is_on(self) -> bool:
        """Task enabled state."""
        task = self._task
        return bool(task and task.enabled)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Extra details for UI/automation."""
        task = self._task
        if not task:
            return {"task_id": self._task_id, "removed": True}

        return {
            "task_id": task.task_id,
            "task_name": task.name,
            ATTR_TASK_TYPE: task.task_type,
            ATTR_TRIGGER_MODE: task.trigger_mode,
            ATTR_HEBCAL_EVENT_KIND: task.hebcal_event_kind,
            ATTR_HEBCAL_EVENT_PHASE: task.hebcal_event_phase,
            ATTR_HEBCAL_HOLIDAY_MODE: task.hebcal_holiday_mode,
            ATTR_HEBCAL_OFFSET_MINUTES: task.hebcal_offset_minutes,
            "start_time": task.start_time,
            "end_time": task.end_time,
            "days": task.days,
            "days_label": format_days_for_display(task.days),
            "months": task.months,
            "recurrence": task.recurrence,
            "start_date": task.start_date,
            "end_date": task.end_date,
            "condition_entity": task.condition_entity,
            ATTR_CONDITION_OPERATOR: task.condition_operator,
            "skip_if_state": task.skip_if_state,
            "timeline_points": [point.as_dict() for point in task.timeline_points],
            "timeline_label": format_timeline_for_display(task.timeline_points),
            "active_now": task.task_id in self._manager.active_task_ids,
            "entry_id": self._manager.entry.entry_id,
            "boiler_entity": self._manager.boiler_entity,
        }

    @property
    def device_info(self) -> dict[str, Any]:
        """Attach task entities under one integration device."""
        return self._manager.device_info

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Enable schedule task."""
        ctx = kwargs.get("context") or getattr(self, "context", None) or getattr(self, "_context", None)
        caller = await async_user_label_from_context(self.hass, ctx)
        await self._manager.async_set_task_enabled(self._task_id, True, history_user=caller)

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Disable schedule task."""
        ctx = kwargs.get("context") or getattr(self, "context", None) or getattr(self, "_context", None)
        caller = await async_user_label_from_context(self.hass, ctx)
        await self._manager.async_set_task_enabled(self._task_id, False, history_user=caller)

    async def async_added_to_hass(self) -> None:
        """Subscribe for manager state updates."""
        self._sync_name_from_task(sync_registry=True)
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass,
                signal_state_updated(self._manager.entry.entry_id),
                self._handle_manager_update,
            )
        )

    @callback
    def _handle_manager_update(self) -> None:
        """Push state updates from manager."""
        self._sync_name_from_task(sync_registry=False)
        self.async_write_ha_state()

    @property
    def _task(self) -> BoilerTask | None:
        return self._manager.get_task(self._task_id)

    @callback
    def _sync_name_from_task(self, sync_registry: bool) -> None:
        """Keep entity name in sync with task name."""
        task = self._task
        next_name = task.name if task else f"Task {self._task_id}"
        if not next_name:
            next_name = f"Task {self._task_id}"

        if next_name == self._last_known_name:
            return

        self._attr_name = next_name
        self._last_known_name = next_name

        if not sync_registry or not self.hass or not self.entity_id:
            return

        registry = er.async_get(self.hass)
        if not registry.async_get(self.entity_id):
            return

        try:
            registry.async_update_entity(self.entity_id, name=next_name)
        except Exception:  # noqa: BLE001
            # Keep runtime entity stable even if registry update API changes.
            return
