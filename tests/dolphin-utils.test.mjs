/**
 * Run: node --test tests/dolphin-utils.test.mjs
 */
import assert from "node:assert/strict";
import test from "node:test";
import { resolveDolphinElectricCurrentSensorId } from "../custom_components/boiler_manager/frontend/boiler-dolphin-utils.js";

test("empty when not climate boiler", () => {
  assert.equal(resolveDolphinElectricCurrentSensorId("switch.x", {}), "");
});

test("exact stem match", () => {
  const states = {
    "climate.kitchen": { state: "heat" },
    "dolphin.kitchen_electric_current": { state: "1.2" },
  };
  assert.equal(
    resolveDolphinElectricCurrentSensorId("climate.kitchen", states),
    "dolphin.kitchen_electric_current"
  );
});

test("single dolphin current candidate", () => {
  const states = {
    "climate.other": { state: "off" },
    "dolphin.only_device_electric_current": { state: "0.5" },
  };
  assert.equal(
    resolveDolphinElectricCurrentSensorId("climate.other", states),
    "dolphin.only_device_electric_current"
  );
});

test("no match when multiple and ambiguous", () => {
  const states = {
    "climate.x": { state: "off" },
    "dolphin.a_electric_current": { state: "1" },
    "dolphin.b_electric_current": { state: "2" },
  };
  assert.equal(resolveDolphinElectricCurrentSensorId("climate.x", states), "");
});

test("substring disambiguation", () => {
  const states = {
    "climate.mydevice": { state: "heat" },
    "dolphin.other_electric_current": { state: "1" },
    "dolphin.mydevice_electric_current": { state: "2" },
  };
  assert.equal(
    resolveDolphinElectricCurrentSensorId("climate.mydevice", states),
    "dolphin.mydevice_electric_current"
  );
});
