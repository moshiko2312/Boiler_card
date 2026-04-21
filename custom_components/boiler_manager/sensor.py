"""Sensor platform for Boiler Manager."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    ATTR_DEVICE_CLASS,
    ATTR_STATE_CLASS,
    ATTR_UNIT_OF_MEASUREMENT,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_state_change_event

from .const import DOMAIN, signal_state_updated
from .manager import BoilerManager


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Boiler Manager sensors."""
    manager: BoilerManager = hass.data[DOMAIN]["managers"][entry.entry_id]

    entities: list[SensorEntity] = [
        BoilerModeSensor(manager),
        BoilerActiveTasksCountSensor(manager),
    ]

    if manager.temperature_sensor:
        entities.append(
            BoilerSourceMirrorSensor(
                manager,
                key="temperature",
                source_entity_id=manager.temperature_sensor,
                name="Temperature",
                icon="mdi:thermometer",
            )
        )

    if manager.power_sensor:
        entities.append(
            BoilerSourceMirrorSensor(
                manager,
                key="power",
                source_entity_id=manager.power_sensor,
                name="Power",
                icon="mdi:flash",
            )
        )

    if manager.current_sensor:
        entities.append(
            BoilerSourceMirrorSensor(
                manager,
                key="current",
                source_entity_id=manager.current_sensor,
                name="Current",
                icon="mdi:current-ac",
            )
        )

    async_add_entities(entities)


class BoilerBaseSensor(SensorEntity):
    """Base class for boiler sensors."""

    _attr_has_entity_name = True

    def __init__(self, manager: BoilerManager, key: str, name: str) -> None:
        self._manager = manager
        self._attr_unique_id = f"{manager.entry.entry_id}_{key}"
        self._attr_name = name

    @property
    def device_info(self) -> dict[str, Any]:
        """Attach under integration device."""
        return self._manager.device_info


class BoilerModeSensor(BoilerBaseSensor):
    """Current control mode sensor."""

    _attr_icon = "mdi:water-boiler"

    def __init__(self, manager: BoilerManager) -> None:
        super().__init__(manager, "mode", "Mode")

    @property
    def native_value(self) -> str:
        """Mode state."""
        return self._manager.mode

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Mode details."""
        return self._manager.mode_attributes

    async def async_added_to_hass(self) -> None:
        """Subscribe to manager updates."""
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass,
                signal_state_updated(self._manager.entry.entry_id),
                self._handle_manager_update,
            )
        )

    @callback
    def _handle_manager_update(self) -> None:
        self.async_write_ha_state()


class BoilerActiveTasksCountSensor(BoilerBaseSensor):
    """Number of active schedules right now."""

    _attr_icon = "mdi:counter"

    def __init__(self, manager: BoilerManager) -> None:
        super().__init__(manager, "active_tasks", "Active Schedules")

    @property
    def native_value(self) -> int:
        """How many schedule tasks are currently active."""
        return len(self._manager.active_task_ids)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"active_task_ids": sorted(self._manager.active_task_ids)}

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass,
                signal_state_updated(self._manager.entry.entry_id),
                self._handle_manager_update,
            )
        )

    @callback
    def _handle_manager_update(self) -> None:
        self.async_write_ha_state()


class BoilerSourceMirrorSensor(BoilerBaseSensor):
    """Mirror a source sensor (temperature/power/current) under one boiler device."""

    def __init__(
        self,
        manager: BoilerManager,
        *,
        key: str,
        source_entity_id: str,
        name: str,
        icon: str,
    ) -> None:
        super().__init__(manager, key, name)
        self._source_entity_id = source_entity_id
        self._attr_icon = icon

    @property
    def available(self) -> bool:
        """Source sensor exists."""
        return self.hass.states.get(self._source_entity_id) is not None

    @property
    def native_value(self) -> str | float | int | None:
        """Pass through source value."""
        source = self.hass.states.get(self._source_entity_id)
        if source is None:
            return None

        state = source.state
        if state in {"unknown", "unavailable"}:
            return None

        try:
            numeric = float(state)
            if numeric.is_integer():
                return int(numeric)
            return numeric
        except ValueError:
            return state

    @property
    def native_unit_of_measurement(self) -> str | None:
        """Pass source unit if present."""
        source = self.hass.states.get(self._source_entity_id)
        if source is None:
            return None
        return source.attributes.get(ATTR_UNIT_OF_MEASUREMENT)

    @property
    def device_class(self) -> str | None:
        """Pass source device class if present."""
        source = self.hass.states.get(self._source_entity_id)
        if source is None:
            return None
        return source.attributes.get(ATTR_DEVICE_CLASS)

    @property
    def state_class(self) -> str | None:
        """Pass source state class if present."""
        source = self.hass.states.get(self._source_entity_id)
        if source is None:
            return None
        return source.attributes.get(ATTR_STATE_CLASS)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"source_entity_id": self._source_entity_id}

    async def async_added_to_hass(self) -> None:
        """Track source sensor changes and manager updates."""
        self.async_on_remove(
            async_track_state_change_event(
                self.hass,
                [self._source_entity_id],
                self._handle_source_change,
            )
        )
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass,
                signal_state_updated(self._manager.entry.entry_id),
                self._handle_source_change,
            )
        )

    @callback
    def _handle_source_change(self, _event) -> None:
        self.async_write_ha_state()
