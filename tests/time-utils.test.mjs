/**
 * Run: node --test tests/time-utils.test.mjs
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  CUSTOM_DURATION_OPTION,
  customDurationMinutes,
  durationOptionForMinutes,
  resolveDurationChoice,
} from "../custom_components/boiler_manager/frontend/boiler-time-utils.js";

test("custom minutes accept 1..1440 integers only", () => {
  assert.equal(customDurationMinutes("25"), 25);
  assert.equal(customDurationMinutes(" 90 "), 90);
  assert.equal(customDurationMinutes("1440"), 1440);
  assert.equal(customDurationMinutes("0"), null);
  assert.equal(customDurationMinutes("1441"), null);
  assert.equal(customDurationMinutes("-5"), null);
  assert.equal(customDurationMinutes("abc"), null);
  assert.equal(customDurationMinutes(""), null);
  assert.equal(customDurationMinutes(null), null);
});

test("custom minutes ignore fractions", () => {
  assert.equal(customDurationMinutes("12.7"), 12);
});

test("duration option label for minutes uses the backend's Nm format", () => {
  assert.equal(durationOptionForMinutes(25), "25m");
  assert.equal(durationOptionForMinutes(90), "90m");
});

test("resolveDurationChoice: preset option", () => {
  assert.deepEqual(resolveDurationChoice("30m", ""), { option: "30m", minutes: 30 });
});

test("resolveDurationChoice: custom option uses the typed minutes", () => {
  assert.deepEqual(resolveDurationChoice(CUSTOM_DURATION_OPTION, "25"), { option: "25m", minutes: 25 });
});

test("resolveDurationChoice: invalid custom or empty preset yields null", () => {
  assert.equal(resolveDurationChoice(CUSTOM_DURATION_OPTION, ""), null);
  assert.equal(resolveDurationChoice(CUSTOM_DURATION_OPTION, "5000"), null);
  assert.equal(resolveDurationChoice("", ""), null);
  assert.equal(resolveDurationChoice("No Timer", ""), null);
});
