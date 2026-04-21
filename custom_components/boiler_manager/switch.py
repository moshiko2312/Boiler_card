"""Switch platform for Boiler Manager."""

from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers import entity_registry as er

from .const import ATTR_TASK_ID, DOMAIN, signal_state_updated, signal_tasks_updated
from .manager import BoilerManager, BoilerTask, format_days_for_display


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

    _attr_has_entity_name = True
    _attr_icon = "mdi:calendar-clock"

    def __init__(self, manager: BoilerManager, task_id: str) -> None:
        self._manager = manager
        self._task_id = task_id
        self._attr_unique_id = f"{manager.entry.entry_id}_task_{task_id}"

    @property
    def name(self) -> str:
        """Switch name."""
        task = self._task
        if not task:
            return f"Task {self._task_id}"
        return task.name

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
            "start_time": task.start_time,
            "end_time": task.end_time,
            "days": task.days,
            "days_label": format_days_for_display(task.days),
            "active_now": task.task_id in self._manager.active_task_ids,
            "entry_id": self._manager.entry.entry_id,
            "boiler_entity": self._manager.boiler_entity,
        }

    @property
    def device_info(self) -> dict[str, Any]:
        """Attach task entities under one integration device."""
        return self._manager.device_info

    async def async_turn_on(self, **_kwargs: Any) -> None:
        """Enable schedule task."""
        await self._manager.async_set_task_enabled(self._task_id, True)

    async def async_turn_off(self, **_kwargs: Any) -> None:
        """Disable schedule task."""
        await self._manager.async_set_task_enabled(self._task_id, False)

    async def async_added_to_hass(self) -> None:
        """Subscribe for manager state updates."""
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
        self.async_write_ha_state()

    @property
    def _task(self) -> BoilerTask | None:
        return self._manager.get_task(self._task_id)
