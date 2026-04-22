"""Boiler Manager integration."""

from __future__ import annotations

from pathlib import Path
import json
import logging
from datetime import datetime, timezone
from uuid import uuid4

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
    ATTR_DURATION_MINUTES,
    ATTR_DURATION_OPTION,
    ATTR_ENTRY_ID,
    ATTR_MINUTES,
    ATTR_MODE,
    ATTR_MONTHS,
    ATTR_POINT_TIME,
    ATTR_FILE_PATH,
    ATTR_RECURRENCE,
    ATTR_START_TIME,
    ATTR_START_DATE,
    ATTR_TASK_ID,
    ATTR_TASKS,
    ATTR_TASK_NAME,
    ATTR_TASK_TYPE,
    ATTR_TIMELINE_POINTS,
    CONF_BOILER_ENTITY,
    DOMAIN,
    IMPORT_MODE_MERGE,
    IMPORT_MODES,
    RECURRENCE_OPTIONS,
    SERVICE_CREATE_TIMELINE,
    SERVICE_CREATE_SCHEDULE,
    SERVICE_DELETE_SCHEDULE,
    SERVICE_EXPORT_TASKS,
    SERVICE_IMPORT_TASKS,
    SERVICE_RUN_TIMED,
    SERVICE_TURN_OFF,
    SERVICE_TURN_ON_CONTINUOUS,
    SERVICE_UPDATE_SCHEDULE,
    TASK_TYPES,
)
from .manager import BoilerManager, BoilerManagerError

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SWITCH, Platform.SENSOR]

DATA_MANAGERS = "managers"
DATA_SERVICES_REGISTERED = "services_registered"

FRONTEND_RESOURCE_URL = "/local/boiler-card/boiler-card.js"
FRONTEND_RESOURCE_TYPE = "module"

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

TIMELINE_POINT_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_POINT_TIME): cv.string,
        vol.Required(ATTR_DURATION_OPTION): cv.string,
        vol.Optional(ATTR_DURATION_MINUTES): vol.Coerce(int),
    },
    extra=vol.PREVENT_EXTRA,
)

CREATE_TIMELINE_SCHEMA = vol.Schema(
    {
        **BASE_SERVICE_SCHEMA,
        vol.Required(ATTR_TASK_NAME): cv.string,
        vol.Required(ATTR_TIMELINE_POINTS): [TIMELINE_POINT_SCHEMA],
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
        vol.Optional(ATTR_TASK_TYPE): vol.In(TASK_TYPES),
        vol.Optional(ATTR_START_TIME): cv.string,
        vol.Optional(ATTR_END_TIME): cv.string,
        vol.Optional(ATTR_TIMELINE_POINTS): [TIMELINE_POINT_SCHEMA],
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

EXPORT_TASKS_SCHEMA = vol.Schema(
    {
        **BASE_SERVICE_SCHEMA,
        vol.Optional(ATTR_FILE_PATH): cv.string,
    },
    extra=vol.PREVENT_EXTRA,
)

IMPORT_TASKS_SCHEMA = vol.Schema(
    {
        **BASE_SERVICE_SCHEMA,
        vol.Optional(ATTR_FILE_PATH): cv.string,
        vol.Optional(ATTR_TASKS): list,
        vol.Optional(ATTR_MODE, default=IMPORT_MODE_MERGE): vol.In(IMPORT_MODES),
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

    async def _create_timeline(call: ServiceCall) -> None:
        manager = _resolve_manager(hass, call)
        await manager.async_create_timeline(
            name=call.data[ATTR_TASK_NAME],
            points=call.data[ATTR_TIMELINE_POINTS],
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
                ATTR_TASK_TYPE,
                ATTR_START_TIME,
                ATTR_END_TIME,
                ATTR_TIMELINE_POINTS,
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
            task_type=call.data.get(ATTR_TASK_TYPE),
            start_time=call.data.get(ATTR_START_TIME),
            end_time=call.data.get(ATTR_END_TIME),
            timeline_points=call.data.get(ATTR_TIMELINE_POINTS),
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

    async def _export_tasks(call: ServiceCall) -> None:
        manager = _resolve_manager(hass, call)
        payload = manager.export_tasks_payload()
        target_path = _resolve_backup_file_path(
            hass,
            call.data.get(ATTR_FILE_PATH),
            default_name=f"boiler_manager_tasks_{manager.entry.entry_id}_{_utc_timestamp()}.json",
        )
        await hass.async_add_executor_job(_write_json_file, target_path, payload)
        _LOGGER.info("Exported %s tasks to %s", len(payload.get("tasks", [])), target_path)

    async def _import_tasks(call: ServiceCall) -> None:
        manager = _resolve_manager(hass, call)
        mode = call.data.get(ATTR_MODE, IMPORT_MODE_MERGE)

        tasks_payload = call.data.get(ATTR_TASKS)
        file_path = call.data.get(ATTR_FILE_PATH)
        if tasks_payload is None and not file_path:
            raise ServiceValidationError(
                f"Provide either '{ATTR_TASKS}' or '{ATTR_FILE_PATH}' for import"
            )
        if tasks_payload is not None and file_path:
            raise ServiceValidationError(
                f"Provide only one source: '{ATTR_TASKS}' or '{ATTR_FILE_PATH}'"
            )

        if file_path:
            source_path = _resolve_backup_file_path(hass, file_path)
            raw_payload = await hass.async_add_executor_job(_read_json_file, source_path)
            if isinstance(raw_payload, dict):
                tasks_payload = raw_payload.get(ATTR_TASKS, [])
            elif isinstance(raw_payload, list):
                tasks_payload = raw_payload
            else:
                raise ServiceValidationError("Imported file must contain a JSON object or list")

        if not isinstance(tasks_payload, list):
            raise ServiceValidationError(f"'{ATTR_TASKS}' must be a list of task objects")

        result = await manager.async_import_tasks(tasks_payload, mode=mode)
        _LOGGER.info(
            "Imported tasks for entry %s (mode=%s, imported=%s, removed=%s, total=%s)",
            manager.entry.entry_id,
            mode,
            result["imported"],
            result["removed"],
            result["total"],
        )

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
        SERVICE_CREATE_TIMELINE,
        _wrap_service_errors(_create_timeline),
        schema=CREATE_TIMELINE_SCHEMA,
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
    hass.services.async_register(
        DOMAIN,
        SERVICE_EXPORT_TASKS,
        _wrap_service_errors(_export_tasks),
        schema=EXPORT_TASKS_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_IMPORT_TASKS,
        _wrap_service_errors(_import_tasks),
        schema=IMPORT_TASKS_SCHEMA,
    )

    hass.data[DOMAIN][DATA_SERVICES_REGISTERED] = True



def _async_unregister_services(hass: HomeAssistant) -> None:
    """Unregister integration services when last entry is unloaded."""
    for service in (
        SERVICE_TURN_ON_CONTINUOUS,
        SERVICE_RUN_TIMED,
        SERVICE_TURN_OFF,
        SERVICE_CREATE_SCHEDULE,
        SERVICE_CREATE_TIMELINE,
        SERVICE_UPDATE_SCHEDULE,
        SERVICE_DELETE_SCHEDULE,
        SERVICE_EXPORT_TASKS,
        SERVICE_IMPORT_TASKS,
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
        return

    try:
        resources_path = Path(hass.config.path(".storage", "lovelace_resources"))
        resource_changed = await hass.async_add_executor_job(
            _ensure_lovelace_resource_entry,
            resources_path,
            FRONTEND_RESOURCE_URL,
            FRONTEND_RESOURCE_TYPE,
        )
        if resource_changed:
            _LOGGER.info("Added Lovelace resource automatically: %s", FRONTEND_RESOURCE_URL)
            await _async_reload_lovelace_resources(hass)
    except (OSError, ValueError, TypeError) as err:
        _LOGGER.warning(
            "Failed to update Lovelace resources automatically (%s). "
            "You can add %s manually in Dashboard resources.",
            err,
            FRONTEND_RESOURCE_URL,
        )


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


async def _async_reload_lovelace_resources(hass: HomeAssistant) -> None:
    """Reload Lovelace resources so the new card URL is picked up immediately."""
    if not hass.services.has_service("lovelace", "reload_resources"):
        return

    try:
        await hass.services.async_call("lovelace", "reload_resources", {}, blocking=True)
    except Exception as err:  # noqa: BLE001
        _LOGGER.debug("Lovelace resources reload failed: %s", err)


def _ensure_lovelace_resource_entry(
    storage_path: Path,
    resource_url: str,
    resource_type: str,
) -> bool:
    """Ensure a single Lovelace resource entry exists without overwriting others."""
    payload: dict
    if storage_path.exists():
        with storage_path.open("r", encoding="utf-8") as handle:
            loaded = json.load(handle)
        if not isinstance(loaded, dict):
            raise ValueError("Invalid lovelace_resources format")
        payload = loaded
    else:
        payload = {
            "version": 1,
            "minor_version": 1,
            "key": "lovelace_resources",
            "data": {"items": []},
        }

    items = _resolve_resource_items(payload)
    desired_url = _normalize_resource_url(resource_url)
    changed = False

    for item in items:
        if not isinstance(item, dict):
            continue
        existing_url = _normalize_resource_url(item.get("url"))
        if existing_url != desired_url:
            continue

        if item.get("type") != resource_type:
            item["type"] = resource_type
            changed = True
        if changed:
            _write_json_file(storage_path, payload)
        return changed

    new_item = {
        "url": resource_url,
        "type": resource_type,
    }
    if any(isinstance(item, dict) and "id" in item for item in items):
        new_item["id"] = _next_resource_id(items)

    items.append(new_item)
    _write_json_file(storage_path, payload)
    return True


def _resolve_resource_items(payload: dict) -> list:
    """Return mutable Lovelace resources items list from storage payload."""
    data = payload.get("data")
    if isinstance(data, dict):
        items = data.get("items")
        if isinstance(items, list):
            return items
        data["items"] = []
        return data["items"]

    items = payload.get("items")
    if isinstance(items, list):
        return items

    payload["data"] = {"items": []}
    return payload["data"]["items"]


def _normalize_resource_url(value: str | None) -> str:
    """Normalize resource URL for duplicate checks."""
    text = str(value or "").strip()
    if not text:
        return ""
    return text.split("?", 1)[0].lower()


def _next_resource_id(items: list) -> int | str:
    """Generate next resource id while preserving existing id style."""
    ids = [item.get("id") for item in items if isinstance(item, dict) and "id" in item]
    if not ids:
        return 1

    int_ids = [value for value in ids if isinstance(value, int)]
    if len(int_ids) == len(ids):
        return max(int_ids) + 1

    numeric_str_ids = [
        int(value)
        for value in ids
        if isinstance(value, str) and value.isdigit()
    ]
    if len(numeric_str_ids) == len(ids):
        return str(max(numeric_str_ids) + 1)

    return uuid4().hex


def _utc_timestamp() -> str:
    """Return compact UTC timestamp for backup filenames."""
    return datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")


def _resolve_backup_file_path(
    hass: HomeAssistant,
    requested_path: str | None,
    *,
    default_name: str | None = None,
) -> Path:
    """Resolve a backup file path under /config."""
    config_dir = Path(hass.config.path()).resolve()

    if requested_path:
        candidate = Path(str(requested_path).strip())
        if not candidate.is_absolute():
            candidate = config_dir / candidate
    else:
        filename = default_name or f"boiler_manager_tasks_{_utc_timestamp()}.json"
        candidate = config_dir / "boiler_manager_backups" / filename

    candidate = candidate.resolve()
    if config_dir not in candidate.parents and candidate != config_dir:
        raise ServiceValidationError("Backup path must be inside /config")

    return candidate


def _write_json_file(path: Path, payload: dict) -> None:
    """Write JSON payload to disk."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)


def _read_json_file(path: Path) -> dict | list:
    """Read JSON payload from disk."""
    if not path.exists():
        raise ServiceValidationError(f"Backup file not found: {path}")
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)
