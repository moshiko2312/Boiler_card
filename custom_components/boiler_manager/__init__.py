"""Boiler Manager integration."""

from __future__ import annotations

from pathlib import Path
import logging

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv

from .const import (
    ATTR_DAYS,
    ATTR_DURATION,
    ATTR_ENABLED,
    ATTR_END_TIME,
    ATTR_END_DATE,
    ATTR_ENTRY_ID,
    ATTR_MINUTES,
    ATTR_MONTHS,
    ATTR_RECURRENCE,
    ATTR_START_TIME,
    ATTR_START_DATE,
    ATTR_TASK_ID,
    ATTR_TASK_NAME,
    CONF_BOILER_ENTITY,
    DOMAIN,
    RECURRENCE_OPTIONS,
    SERVICE_CREATE_SCHEDULE,
    SERVICE_DELETE_SCHEDULE,
    SERVICE_RUN_TIMED,
    SERVICE_TURN_OFF,
    SERVICE_TURN_ON_CONTINUOUS,
    SERVICE_UPDATE_SCHEDULE,
)
from .manager import BoilerManager, BoilerManagerError

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SWITCH, Platform.SENSOR]

DATA_MANAGERS = "managers"
DATA_SERVICES_REGISTERED = "services_registered"

BASE_SERVICE_SCHEMA = {
    vol.Optional(ATTR_ENTRY_ID): cv.string,
    vol.Optional(CONF_BOILER_ENTITY): cv.entity_id,
}

RUN_TIMED_SCHEMA = vol.Schema(
    {
        **BASE_SERVICE_SCHEMA,
        vol.Optional(ATTR_DURATION): cv.string,
        vol.Optional(ATTR_MINUTES): vol.Coerce(int),
    },
    extra=vol.PREVENT_EXTRA,
)

CREATE_SCHEDULE_SCHEMA = vol.Schema(
    {
        **BASE_SERVICE_SCHEMA,
        vol.Required(ATTR_TASK_NAME): cv.string,
        vol.Required(ATTR_START_TIME): cv.string,
        vol.Required(ATTR_END_TIME): cv.string,
        vol.Optional(ATTR_DAYS): [vol.Any(vol.In(list(range(7))), cv.string)],
        vol.Optional(ATTR_MONTHS): [vol.Any(vol.In(list(range(1, 13))), cv.string)],
        vol.Optional(ATTR_RECURRENCE): vol.In(RECURRENCE_OPTIONS),
        vol.Optional(ATTR_START_DATE): cv.string,
        vol.Optional(ATTR_END_DATE): cv.string,
        vol.Optional(ATTR_ENABLED, default=True): cv.boolean,
    },
    extra=vol.PREVENT_EXTRA,
)

UPDATE_SCHEDULE_SCHEMA = vol.Schema(
    {
        **BASE_SERVICE_SCHEMA,
        vol.Required(ATTR_TASK_ID): cv.string,
        vol.Optional(ATTR_TASK_NAME): cv.string,
        vol.Optional(ATTR_START_TIME): cv.string,
        vol.Optional(ATTR_END_TIME): cv.string,
        vol.Optional(ATTR_DAYS): [vol.Any(vol.In(list(range(7))), cv.string)],
        vol.Optional(ATTR_MONTHS): [vol.Any(vol.In(list(range(1, 13))), cv.string)],
        vol.Optional(ATTR_RECURRENCE): vol.In(RECURRENCE_OPTIONS),
        vol.Optional(ATTR_START_DATE): cv.string,
        vol.Optional(ATTR_END_DATE): cv.string,
        vol.Optional(ATTR_ENABLED): cv.boolean,
    },
    extra=vol.PREVENT_EXTRA,
)

DELETE_SCHEDULE_SCHEMA = vol.Schema(
    {
        **BASE_SERVICE_SCHEMA,
        vol.Required(ATTR_TASK_ID): cv.string,
    },
    extra=vol.PREVENT_EXTRA,
)


async def async_setup(hass: HomeAssistant, _config: dict) -> bool:
    """Set up integration domain storage."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN].setdefault(DATA_MANAGERS, {})
    hass.data[DOMAIN].setdefault(DATA_SERVICES_REGISTERED, False)
    await _async_register_services(hass)
    await _async_install_frontend_card(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Boiler Manager from config entry."""
    await _async_install_frontend_card(hass)

    manager = BoilerManager(hass, entry)
    await manager.async_setup()

    hass.data[DOMAIN][DATA_MANAGERS][entry.entry_id] = manager

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    await _async_register_services(hass)

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload Boiler Manager config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    manager = hass.data[DOMAIN][DATA_MANAGERS].pop(entry.entry_id, None)
    if manager:
        await manager.async_unload()

    return unload_ok


async def _async_register_services(hass: HomeAssistant) -> None:
    """Register integration services once."""
    if hass.data[DOMAIN][DATA_SERVICES_REGISTERED]:
        return

    async def _turn_on_continuous(call: ServiceCall) -> None:
        manager = _resolve_manager(hass, call)
        await manager.async_turn_on_continuous()

    async def _run_timed(call: ServiceCall) -> None:
        manager = _resolve_manager(hass, call)
        duration = call.data.get(ATTR_DURATION)
        minutes = call.data.get(ATTR_MINUTES)
        await manager.async_run_timed(duration=duration, minutes=minutes)

    async def _turn_off(call: ServiceCall) -> None:
        manager = _resolve_manager(hass, call)
        await manager.async_turn_off()

    async def _create_schedule(call: ServiceCall) -> None:
        manager = _resolve_manager(hass, call)
        await manager.async_create_task(
            name=call.data[ATTR_TASK_NAME],
            start_time=call.data[ATTR_START_TIME],
            end_time=call.data[ATTR_END_TIME],
            days=call.data.get(ATTR_DAYS),
            months=call.data.get(ATTR_MONTHS),
            recurrence=call.data.get(ATTR_RECURRENCE),
            start_date=call.data.get(ATTR_START_DATE),
            end_date=call.data.get(ATTR_END_DATE),
            enabled=call.data.get(ATTR_ENABLED, True),
        )

    async def _update_schedule(call: ServiceCall) -> None:
        manager = _resolve_manager(hass, call)

        if not any(
            key in call.data
            for key in (
                ATTR_TASK_NAME,
                ATTR_START_TIME,
                ATTR_END_TIME,
                ATTR_DAYS,
                ATTR_MONTHS,
                ATTR_RECURRENCE,
                ATTR_START_DATE,
                ATTR_END_DATE,
                ATTR_ENABLED,
            )
        ):
            raise ServiceValidationError("No update fields provided")

        await manager.async_update_task(
            task_id=call.data[ATTR_TASK_ID],
            name=call.data.get(ATTR_TASK_NAME),
            start_time=call.data.get(ATTR_START_TIME),
            end_time=call.data.get(ATTR_END_TIME),
            days=call.data.get(ATTR_DAYS),
            months=call.data.get(ATTR_MONTHS),
            recurrence=call.data.get(ATTR_RECURRENCE),
            start_date=call.data.get(ATTR_START_DATE),
            end_date=call.data.get(ATTR_END_DATE),
            enabled=call.data.get(ATTR_ENABLED),
        )

    async def _delete_schedule(call: ServiceCall) -> None:
        manager = _resolve_manager(hass, call)
        removed = await manager.async_delete_task(call.data[ATTR_TASK_ID])
        if not removed:
            raise ServiceValidationError(f"Task not found: {call.data[ATTR_TASK_ID]}")

    hass.services.async_register(
        DOMAIN,
        SERVICE_TURN_ON_CONTINUOUS,
        _wrap_service_errors(_turn_on_continuous),
        schema=vol.Schema(BASE_SERVICE_SCHEMA),
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_RUN_TIMED,
        _wrap_service_errors(_run_timed),
        schema=RUN_TIMED_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_TURN_OFF,
        _wrap_service_errors(_turn_off),
        schema=vol.Schema(BASE_SERVICE_SCHEMA),
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_CREATE_SCHEDULE,
        _wrap_service_errors(_create_schedule),
        schema=CREATE_SCHEDULE_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_UPDATE_SCHEDULE,
        _wrap_service_errors(_update_schedule),
        schema=UPDATE_SCHEDULE_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_DELETE_SCHEDULE,
        _wrap_service_errors(_delete_schedule),
        schema=DELETE_SCHEDULE_SCHEMA,
    )

    hass.data[DOMAIN][DATA_SERVICES_REGISTERED] = True



def _async_unregister_services(hass: HomeAssistant) -> None:
    """Unregister integration services when last entry is unloaded."""
    for service in (
        SERVICE_TURN_ON_CONTINUOUS,
        SERVICE_RUN_TIMED,
        SERVICE_TURN_OFF,
        SERVICE_CREATE_SCHEDULE,
        SERVICE_UPDATE_SCHEDULE,
        SERVICE_DELETE_SCHEDULE,
    ):
        if hass.services.has_service(DOMAIN, service):
            hass.services.async_remove(DOMAIN, service)

    hass.data[DOMAIN][DATA_SERVICES_REGISTERED] = False



def _resolve_manager(hass: HomeAssistant, call: ServiceCall) -> BoilerManager:
    """Resolve target manager for service call."""
    managers: dict[str, BoilerManager] = hass.data[DOMAIN][DATA_MANAGERS]
    if not managers:
        raise ServiceValidationError("No Boiler Manager entry is loaded")

    entry_id = call.data.get(ATTR_ENTRY_ID)
    boiler_entity = call.data.get(CONF_BOILER_ENTITY)

    if entry_id:
        manager = managers.get(entry_id)
        if not manager:
            raise ServiceValidationError(f"Entry not found: {entry_id}")
        return manager

    if boiler_entity:
        for manager in managers.values():
            if manager.boiler_entity == boiler_entity:
                return manager
        raise ServiceValidationError(f"No entry found for boiler entity: {boiler_entity}")

    if len(managers) == 1:
        return next(iter(managers.values()))

    raise ServiceValidationError(
        "Multiple Boiler Manager entries found. Provide entry_id or boiler_entity in service data."
    )



def _wrap_service_errors(handler):
    """Translate manager exceptions to HA service validation errors."""

    async def _wrapped(call: ServiceCall) -> None:
        try:
            await handler(call)
        except BoilerManagerError as err:
            raise ServiceValidationError(str(err)) from err

    return _wrapped


async def _async_install_frontend_card(hass: HomeAssistant) -> None:
    """Install/update Lovelace frontend assets under /config/www automatically."""
    source_dir = Path(__file__).resolve().parent / "frontend"
    target_dir = Path(hass.config.path("www", "boiler-card"))

    if not source_dir.exists():
        _LOGGER.warning("Boiler frontend assets folder is missing: %s", source_dir)
        return

    try:
        copied = await hass.async_add_executor_job(_copy_frontend_assets, source_dir, target_dir)
        _LOGGER.debug("Boiler frontend assets synced to %s (%d changed)", target_dir, copied)
    except OSError as err:
        _LOGGER.error("Failed to install boiler frontend assets into www: %s", err)


def _copy_frontend_assets(source_dir: Path, target_dir: Path) -> int:
    """Copy all frontend assets if changed."""
    target_dir.mkdir(parents=True, exist_ok=True)
    changed = 0

    for source in source_dir.iterdir():
        if not source.is_file():
            continue

        target = target_dir / source.name
        source_bytes = source.read_bytes()

        if target.exists() and target.read_bytes() == source_bytes:
            continue

        target.write_bytes(source_bytes)
        changed += 1

    return changed
