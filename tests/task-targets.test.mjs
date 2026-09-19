/**
 * Run: node --test tests/task-targets.test.mjs
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  effectiveTargets,
  normalizeSelectedTargets,
  selectableTargets,
  targetsCaption,
  targetsDuplicateKey,
} from "../custom_components/boiler_manager/frontend/boiler-task-targets.js";

const states = {
  "switch.boiler": { attributes: { friendly_name: "Boiler" } },
  "switch.heater": { attributes: { friendly_name: "Heater" } },
  "light.lamp": { attributes: {} },
};

test("selectable targets come from the Mode sensor and always start with the main entity", () => {
  assert.deepEqual(
    selectableTargets({ allowed_entities: ["switch.heater", "switch.boiler", "light.lamp"] }, "switch.boiler"),
    ["switch.boiler", "switch.heater", "light.lamp"]
  );
  assert.deepEqual(selectableTargets({}, "switch.boiler"), ["switch.boiler"]);
  assert.deepEqual(selectableTargets(null, ""), []);
});

test("effective targets fall back to the main entity", () => {
  assert.deepEqual(effectiveTargets([], "switch.boiler"), ["switch.boiler"]);
  assert.deepEqual(effectiveTargets(null, "switch.boiler"), ["switch.boiler"]);
  assert.deepEqual(effectiveTargets(["switch.heater"], "switch.boiler"), ["switch.heater"]);
});

test("normalizing a selection dedupes and canonicalises main-only to empty", () => {
  assert.deepEqual(normalizeSelectedTargets(["switch.boiler"], "switch.boiler"), []);
  assert.deepEqual(normalizeSelectedTargets([" switch.heater ", "switch.heater", "switch.boiler"], "switch.boiler"), ["switch.heater", "switch.boiler"]);
  assert.deepEqual(normalizeSelectedTargets([], "switch.boiler"), []);
});

test("caption is empty for main-only tasks and lists friendly names otherwise", () => {
  assert.equal(targetsCaption([], "switch.boiler", states), "");
  assert.equal(targetsCaption(["switch.boiler"], "switch.boiler", states), "");
  assert.equal(targetsCaption(["switch.boiler", "switch.heater"], "switch.boiler", states), "Boiler, Heater");
  assert.equal(targetsCaption(["light.lamp"], "switch.boiler", states), "light.lamp");
});

test("duplicate key uses the effective target set regardless of order", () => {
  assert.equal(targetsDuplicateKey([], "switch.boiler"), "switch.boiler");
  assert.equal(targetsDuplicateKey(["switch.boiler"], "switch.boiler"), "switch.boiler");
  assert.equal(targetsDuplicateKey(["switch.heater", "switch.boiler"], "switch.boiler"), "switch.boiler,switch.heater");
  assert.equal(targetsDuplicateKey(["switch.boiler", "switch.heater"], "switch.boiler"), "switch.boiler,switch.heater");
});
