"""Scheduler behaviour for multi-target tasks, run against lightweight Home Assistant stubs.

Run: py -m unittest tests.test_manager_targets  (from the repo root)

The stubs only cover what ``manager.py`` touches at import time and during
scheduling; they are not a Home Assistant test harness.
"""

from __future__ import annotations

import sys
import types
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def _module(name: str, **attrs):
    module = types.ModuleType(name)
    module.__dict__.update(attrs)
    sys.modules[name] = module
    return module


def _install_ha_stubs() -> None:
    if "homeassistant" in sys.modules:
        return

    class Platform:
        SWITCH = "switch"
        SENSOR = "sensor"

    class ConfigEntry:  # noqa: D401 - marker type only
        pass

    class Context:
        user_id = None

    class HomeAssistant:
        pass

    class ServiceCall:
        pass

    class HomeAssistantError(Exception):
        pass

    class ServiceValidationError(HomeAssistantError):
        pass

    class _Registry:
        def async_get_entity_id(self, *_args):
            return None

        def async_remove(self, *_args):
            return None

        def async_get(self, *_args):
            return None

        def async_update_entity(self, *_args, **_kwargs):
            return None

    class Store:
        def __init__(self, _hass, _version, _key):
            self.saved = None

        async def async_load(self):
            return None

        async def async_save(self, data):
            self.saved = data

    def _identity(value):
        return value

    def _config_entry_only_config_schema(_domain):
        return _identity

    ha = _module("homeassistant")
    const = _module("homeassistant.const", SUN_EVENT_SUNRISE="sunrise", SUN_EVENT_SUNSET="sunset", Platform=Platform)
    config_entries = _module("homeassistant.config_entries", ConfigEntry=ConfigEntry)
    core = _module(
        "homeassistant.core",
        Context=Context,
        HomeAssistant=HomeAssistant,
        ServiceCall=ServiceCall,
        callback=lambda func: func,
    )
    exceptions = _module(
        "homeassistant.exceptions",
        HomeAssistantError=HomeAssistantError,
        ServiceValidationError=ServiceValidationError,
    )
    helpers = _module("homeassistant.helpers")
    entity_registry = _module("homeassistant.helpers.entity_registry", async_get=lambda _hass: _Registry())
    sun = _module("homeassistant.helpers.sun", get_astral_event_date=lambda *_args: None)
    dispatcher = _module("homeassistant.helpers.dispatcher", async_dispatcher_send=lambda *_a, **_k: None)
    event = _module(
        "homeassistant.helpers.event",
        async_call_later=lambda *_a, **_k: (lambda: None),
        async_track_time_change=lambda *_a, **_k: (lambda: None),
        async_track_time_interval=lambda *_a, **_k: (lambda: None),
    )
    storage = _module("homeassistant.helpers.storage", Store=Store)
    aiohttp_client = _module("homeassistant.helpers.aiohttp_client", async_get_clientsession=lambda _hass: None)
    config_validation = _module(
        "homeassistant.helpers.config_validation",
        string=_identity,
        entity_id=_identity,
        boolean=_identity,
        ensure_list=lambda value: value if isinstance(value, list) else [value],
        config_entry_only_config_schema=_config_entry_only_config_schema,
    )
    selector = _module("homeassistant.helpers.selector")
    util = _module("homeassistant.util")
    local_tz = timezone.utc
    dt = _module(
        "homeassistant.util.dt",
        now=lambda: datetime.now(local_tz),
        utcnow=lambda: datetime.now(timezone.utc),
        as_utc=lambda value: value.astimezone(timezone.utc),
        as_local=lambda value: value.astimezone(local_tz),
        parse_datetime=lambda value: datetime.fromisoformat(value) if value else None,
    )
    _module("aiohttp", ClientError=Exception, ClientTimeout=lambda **_k: None)

    ha.const = const
    ha.config_entries = config_entries
    ha.core = core
    ha.exceptions = exceptions
    ha.helpers = helpers
    ha.util = util
    helpers.entity_registry = entity_registry
    helpers.sun = sun
    helpers.dispatcher = dispatcher
    helpers.event = event
    helpers.storage = storage
    helpers.aiohttp_client = aiohttp_client
    helpers.config_validation = config_validation
    helpers.selector = selector
    util.dt = dt


_install_ha_stubs()
sys.path.insert(0, str(ROOT))

from custom_components.boiler_manager import manager as manager_module  # noqa: E402
from custom_components.boiler_manager.manager import BoilerManager, BoilerManagerError  # noqa: E402


class _Services:
    def __init__(self, hass):
        self._hass = hass

    def has_service(self, _domain, _service):
        return False

    async def async_call(self, domain, service, data, blocking=False):
        self._hass.calls.append((domain, service, data["entity_id"]))


class _Config:
    def path(self, *parts):
        return str(Path("Z:/__nonexistent__").joinpath(*parts))


class _States:
    def get(self, _entity_id):
        return None


class FakeHass:
    def __init__(self):
        self.calls: list[tuple[str, str, str]] = []
        self.services = _Services(self)
        self.states = _States()
        self.config = _Config()
        self.auth = None


class FakeEntry:
    entry_id = "entry1"

    def __init__(self, allowed):
        self.data = {"boiler_entity": "switch.boiler", "name": "Test"}
        self.options = {"allowed_entities": allowed}


def _window_around_now():
    now = manager_module.dt_util.now()
    start = (now - timedelta(hours=1)).strftime("%H:%M")
    end = (now + timedelta(hours=1)).strftime("%H:%M")
    return start, end


async def _new_manager(allowed=("switch.heater",)):
    hass = FakeHass()
    manager = BoilerManager(hass, FakeEntry(list(allowed)))
    await manager._async_load()
    return hass, manager


class TargetNormalisationTests(unittest.IsolatedAsyncioTestCase):
    async def test_allowed_and_canonical_forms(self):
        _hass, manager = await _new_manager()
        self.assertEqual(manager.selectable_targets, ["switch.boiler", "switch.heater"])
        self.assertEqual(manager._normalize_targets(["switch.boiler"]), [])
        self.assertEqual(manager._normalize_targets(["switch.heater", "switch.boiler"]), ["switch.heater", "switch.boiler"])
        with self.assertRaises(BoilerManagerError):
            manager._normalize_targets(["light.not_allowed"])


class SchedulerTests(unittest.IsolatedAsyncioTestCase):
    async def test_task_targeting_main_and_secondary_switches_both(self):
        hass, manager = await _new_manager()
        start, end = _window_around_now()
        task = await manager.async_create_task(
            name="Both", start_time=start, end_time=end, days=None,
            target_entities=["switch.boiler", "switch.heater"], enabled=True,
        )
        on_calls = {entity for (_d, service, entity) in hass.calls if service == "turn_on"}
        self.assertEqual(on_calls, {"switch.boiler", "switch.heater"})
        self.assertEqual(manager.mode, "schedule")
        self.assertEqual(manager.mode_attributes["active_targets"], ["switch.boiler", "switch.heater"])
        self.assertEqual(manager._secondary_driven, {"switch.heater"})
        self.assertEqual(manager._store.saved["secondary_driven"], ["switch.heater"])

        hass.calls.clear()
        await manager.async_set_task_enabled(task.task_id, False)
        off_calls = {entity for (_d, service, entity) in hass.calls if service == "turn_off"}
        self.assertEqual(off_calls, {"switch.boiler", "switch.heater"})
        self.assertEqual(manager.mode, "off")
        self.assertEqual(manager._secondary_driven, set())

    async def test_secondary_only_task_leaves_main_alone(self):
        hass, manager = await _new_manager()
        start, end = _window_around_now()
        await manager.async_create_task(
            name="Heater only", start_time=start, end_time=end, days=None,
            target_entities=["switch.heater"], enabled=True,
        )
        self.assertEqual([c for c in hass.calls if c[2] == "switch.boiler"], [])
        self.assertIn(("switch", "turn_on", "switch.heater"), hass.calls)
        self.assertEqual(manager.mode, "off")
        self.assertEqual(manager.mode_attributes["active_targets"], ["switch.heater"])

        hass.calls.clear()
        await manager.async_set_vacation_mode(True)
        self.assertIn(("switch", "turn_off", "switch.heater"), hass.calls)
        self.assertEqual([c for c in hass.calls if c[2] == "switch.boiler"], [])

    async def test_restart_releases_secondary_that_is_no_longer_active(self):
        hass, manager = await _new_manager()
        manager._secondary_driven = {"switch.heater"}
        await manager._async_apply_schedule_state()
        self.assertIn(("switch", "turn_off", "switch.heater"), hass.calls)
        self.assertEqual(manager._secondary_driven, set())


class DuplicateAndPortabilityTests(unittest.IsolatedAsyncioTestCase):
    async def test_same_window_different_targets_is_not_a_duplicate(self):
        _hass, manager = await _new_manager()
        await manager.async_create_task(name="A", start_time="10:00", end_time="11:00", days=None, enabled=True)
        await manager.async_create_task(
            name="B", start_time="10:00", end_time="11:00", days=None,
            target_entities=["switch.boiler", "switch.heater"], enabled=True,
        )
        with self.assertRaises(BoilerManagerError):
            await manager.async_create_task(
                name="C", start_time="10:00", end_time="11:00", days=None,
                target_entities=["switch.heater", "switch.boiler"], enabled=True,
            )

    async def test_export_import_round_trip_keeps_targets(self):
        _hass, source = await _new_manager()
        await source.async_create_task(
            name="Both", start_time="10:00", end_time="11:00", days=None,
            target_entities=["switch.boiler", "switch.heater"], enabled=True,
        )
        payload = source.export_tasks_payload()
        self.assertEqual(payload["tasks"][0]["target_entities"], ["switch.boiler", "switch.heater"])

        _hass2, target = await _new_manager()
        result = await target.async_import_tasks(payload["tasks"], mode="replace")
        self.assertEqual(result["imported"], 1)
        self.assertEqual(target.tasks[0].target_entities, ["switch.boiler", "switch.heater"])

        _hass3, strict = await _new_manager(allowed=())
        with self.assertRaises(BoilerManagerError):
            await strict.async_import_tasks(payload["tasks"], mode="merge")

    async def test_stored_task_without_targets_loads_as_main_only(self):
        _hass, manager = await _new_manager()
        task = manager_module._task_from_raw({
            "task_id": "old1", "name": "Legacy", "start_time": "10:00", "end_time": "11:00",
        })
        self.assertEqual(task.target_entities, [])
        self.assertEqual(task.as_dict()["target_entities"], [])


if __name__ == "__main__":
    unittest.main()
