"""Run: py -m unittest tests.test_targets  (from the repo root)."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "custom_components" / "boiler_manager"))

import targets  # noqa: E402  (pure module, no Home Assistant imports)


class NormalizeTargetEntitiesTests(unittest.TestCase):
    def test_none_and_empty_mean_main_only(self):
        self.assertEqual(targets.normalize_target_entities(None, main_entity="switch.boiler"), [])
        self.assertEqual(targets.normalize_target_entities([], main_entity="switch.boiler"), [])
        self.assertEqual(targets.normalize_target_entities(["", "  "], main_entity="switch.boiler"), [])

    def test_main_only_is_canonicalised_to_empty(self):
        self.assertEqual(
            targets.normalize_target_entities(["switch.boiler"], main_entity="switch.boiler"),
            [],
        )

    def test_dedupes_and_keeps_order(self):
        result = targets.normalize_target_entities(
            [" switch.heater ", "switch.boiler", "switch.heater"],
            main_entity="switch.boiler",
        )
        self.assertEqual(result, ["switch.heater", "switch.boiler"])

    def test_single_string_is_accepted(self):
        self.assertEqual(
            targets.normalize_target_entities("switch.heater", main_entity="switch.boiler"),
            ["switch.heater"],
        )

    def test_invalid_ids_raise(self):
        with self.assertRaises(ValueError):
            targets.normalize_target_entities(["heater"], main_entity="switch.boiler")
        with self.assertRaises(ValueError):
            targets.normalize_target_entities(42, main_entity="switch.boiler")


class EffectiveAndSelectableTests(unittest.TestCase):
    def test_effective_targets_fall_back_to_main(self):
        self.assertEqual(targets.effective_targets([], "switch.boiler"), ["switch.boiler"])
        self.assertEqual(targets.effective_targets(["switch.heater"], "switch.boiler"), ["switch.heater"])
        self.assertEqual(targets.effective_targets([], ""), [])

    def test_selectable_targets_start_with_main_and_dedupe(self):
        self.assertEqual(
            targets.selectable_targets("switch.boiler", ["switch.heater", "switch.boiler", "", "light.x"]),
            ["switch.boiler", "switch.heater", "light.x"],
        )

    def test_validate_targets_allowed(self):
        selectable = ["switch.boiler", "switch.heater"]
        targets.validate_targets_allowed(["switch.heater"], selectable)  # no raise
        with self.assertRaises(ValueError) as ctx:
            targets.validate_targets_allowed(["switch.heater", "light.other"], selectable)
        self.assertIn("light.other", str(ctx.exception))


class ActiveTargetsTests(unittest.TestCase):
    def test_active_targets_map_unions_tasks_per_entity(self):
        active = [
            ("t1", []),                              # main only
            ("t2", ["switch.heater", "switch.boiler"]),
            ("t3", ["light.lamp"]),
        ]
        result = targets.active_targets_map(active, "switch.boiler")
        self.assertEqual(result, {
            "switch.boiler": {"t1", "t2"},
            "switch.heater": {"t2"},
            "light.lamp": {"t3"},
        })

    def test_secondary_transitions(self):
        on, off, driven = targets.secondary_transitions(
            previous_driven={"switch.heater", "light.old"},
            active_targets={"switch.boiler", "switch.heater", "light.new"},
            main_entity="switch.boiler",
        )
        self.assertEqual(on, ["light.new", "switch.heater"])
        self.assertEqual(off, ["light.old"])
        self.assertEqual(driven, {"switch.heater", "light.new"})

    def test_secondary_transitions_never_touch_main(self):
        on, off, driven = targets.secondary_transitions(
            previous_driven=set(),
            active_targets={"switch.boiler"},
            main_entity="switch.boiler",
        )
        self.assertEqual((on, off, driven), ([], [], set()))


if __name__ == "__main__":
    unittest.main()
