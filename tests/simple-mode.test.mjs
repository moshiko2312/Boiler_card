/**
 * Run: node --test tests/simple-mode.test.mjs
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  holidayUiVisible,
  isSimpleModeEnabled,
} from "../custom_components/boiler_manager/frontend/boiler-simple-mode.js";

test("simple mode off by default", () => {
  assert.equal(isSimpleModeEnabled({}), false);
  assert.equal(isSimpleModeEnabled(null), false);
});

test("simple mode accepts boolean and string truthy values", () => {
  assert.equal(isSimpleModeEnabled({ simple_mode: true }), true);
  assert.equal(isSimpleModeEnabled({ simple_mode: "true" }), true);
  assert.equal(isSimpleModeEnabled({ simple_mode: "on" }), true);
  assert.equal(isSimpleModeEnabled({ simple_mode: false }), false);
  assert.equal(isSimpleModeEnabled({ simple_mode: "no" }), false);
});

test("holiday UI visible when simple mode is off", () => {
  assert.equal(holidayUiVisible({ simpleMode: false, editingTaskTriggerMode: "" }), true);
});

test("holiday UI hidden in simple mode for new tasks", () => {
  assert.equal(holidayUiVisible({ simpleMode: true, editingTaskTriggerMode: "" }), false);
  assert.equal(holidayUiVisible({ simpleMode: true, editingTaskTriggerMode: "schedule" }), false);
});

test("holiday UI revealed in simple mode when editing an existing hebcal task", () => {
  assert.equal(holidayUiVisible({ simpleMode: true, editingTaskTriggerMode: "hebcal_event" }), true);
});
