/**
 * Run: node --test tests/holiday-rules.test.mjs
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  holidayTaskPolicyForKind,
  holidayTimerPolicyForKind,
} from "../custom_components/boiler_manager/frontend/boiler-holiday-rules.js";

const KINDS = ["shabbat", "holiday_regular", "holiday_shabbat"];

test("generic timer policy applies to every active kind when per-kind keys are unset", () => {
  const config = { holiday_timer_policy: "block" };
  KINDS.forEach((kind) => {
    assert.equal(holidayTimerPolicyForKind(kind, config, "block"), "block", kind);
  });
});

test("generic task policy applies to every active kind when per-kind keys are unset", () => {
  const config = { holiday_task_policy: "force_off" };
  KINDS.forEach((kind) => {
    assert.equal(holidayTaskPolicyForKind(kind, config, "force_off"), "force_off", kind);
  });
});

test("per-kind 'allow' (editor default) does not mask the generic policy", () => {
  const config = {
    holiday_timer_policy: "block",
    shabbat_timer_policy: "allow",
    holiday_regular_timer_policy: "allow",
    holiday_shabbat_timer_policy: "allow",
  };
  KINDS.forEach((kind) => {
    assert.equal(holidayTimerPolicyForKind(kind, config, "block"), "block", kind);
  });
});

test("explicit per-kind restriction overrides a generic allow", () => {
  const config = { holiday_timer_policy: "allow", shabbat_timer_policy: "block" };
  assert.equal(holidayTimerPolicyForKind("shabbat", config, "allow"), "block");
  assert.equal(holidayTimerPolicyForKind("holiday_regular", config, "allow"), "allow");
});

test("explicit per-kind restriction overrides a different generic restriction", () => {
  const config = { holiday_task_policy: "block", holiday_regular_task_policy: "postpone" };
  assert.equal(holidayTaskPolicyForKind("holiday_regular", config, "block"), "postpone");
  assert.equal(holidayTaskPolicyForKind("shabbat", config, "block"), "block");
});

test("legacy yomtov_* aliases still count as the holiday_shabbat override", () => {
  const config = { holiday_timer_policy: "allow", yomtov_timer_policy: "force_off" };
  assert.equal(holidayTimerPolicyForKind("holiday_shabbat", config, "allow"), "force_off");
});

test("kind 'none' returns the fallback unchanged", () => {
  assert.equal(holidayTimerPolicyForKind("none", { shabbat_timer_policy: "block" }, "allow"), "allow");
  assert.equal(holidayTaskPolicyForKind("none", {}, "postpone"), "postpone");
});

test("everything unset resolves to allow", () => {
  KINDS.forEach((kind) => {
    assert.equal(holidayTimerPolicyForKind(kind, {}, "allow"), "allow", kind);
    assert.equal(holidayTaskPolicyForKind(kind, null, "allow"), "allow", kind);
  });
});
