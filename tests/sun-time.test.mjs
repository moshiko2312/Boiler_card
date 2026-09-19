/**
 * Run: node --test tests/sun-time.test.mjs
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  formatScheduleTimeLabel,
  formatScheduleTimeValue,
  isSunTimeValue,
  parseScheduleTimeValue,
  scheduleTimeMinutesOfDay,
  scheduleTimeSortKey,
} from "../custom_components/boiler_manager/frontend/boiler-sun-time.js";

const t = (key) => ({
  schedule_time_mode_sunrise: "Sunrise",
  schedule_time_mode_sunset: "Sunset",
}[key] || key);

test("parse fixed HH:MM", () => {
  assert.deepEqual(parseScheduleTimeValue("10:00"), { mode: "fixed", time: "10:00", offset: 0 });
});

test("parse fixed pads single-digit hour", () => {
  assert.deepEqual(parseScheduleTimeValue("7:05"), { mode: "fixed", time: "07:05", offset: 0 });
});

test("parse bare sunrise", () => {
  assert.deepEqual(parseScheduleTimeValue("sunrise"), { mode: "sunrise", time: "", offset: 0 });
});

test("parse sunset with negative offset", () => {
  assert.deepEqual(parseScheduleTimeValue("sunset-45"), { mode: "sunset", time: "", offset: -45 });
});

test("parse is case-insensitive and tolerates spaces", () => {
  assert.deepEqual(parseScheduleTimeValue(" Sunrise + 30 "), { mode: "sunrise", time: "", offset: 30 });
});

test("parse rejects garbage and empty", () => {
  assert.equal(parseScheduleTimeValue(""), null);
  assert.equal(parseScheduleTimeValue("noon"), null);
  assert.equal(parseScheduleTimeValue("25:00"), null);
  assert.equal(parseScheduleTimeValue(null), null);
});

test("format fixed", () => {
  assert.equal(formatScheduleTimeValue({ mode: "fixed", time: "10:00", offset: 0 }), "10:00");
});

test("format sun with zero offset omits sign", () => {
  assert.equal(formatScheduleTimeValue({ mode: "sunrise", time: "", offset: 0 }), "sunrise");
});

test("format sun with signed offsets", () => {
  assert.equal(formatScheduleTimeValue({ mode: "sunrise", time: "", offset: 30 }), "sunrise+30");
  assert.equal(formatScheduleTimeValue({ mode: "sunset", time: "", offset: -45 }), "sunset-45");
});

test("format clamps offset to ±120", () => {
  assert.equal(formatScheduleTimeValue({ mode: "sunset", time: "", offset: 500 }), "sunset+120");
  assert.equal(formatScheduleTimeValue({ mode: "sunset", time: "", offset: -500 }), "sunset-120");
});

test("format returns empty for invalid input", () => {
  assert.equal(formatScheduleTimeValue({ mode: "fixed", time: "", offset: 0 }), "");
  assert.equal(formatScheduleTimeValue(null), "");
});

test("isSunTimeValue", () => {
  assert.equal(isSunTimeValue("sunrise+10"), true);
  assert.equal(isSunTimeValue("10:00"), false);
  assert.equal(isSunTimeValue(""), false);
});

test("minutes of day for fixed value ignores sun state", () => {
  assert.equal(scheduleTimeMinutesOfDay("06:30", null), 390);
});

test("minutes of day for sunrise uses next_rising local time plus offset", () => {
  const rising = new Date();
  rising.setHours(6, 10, 0, 0);
  const sunState = { attributes: { next_rising: rising.toISOString() } };
  assert.equal(scheduleTimeMinutesOfDay("sunrise+30", sunState), 400);
});

test("minutes of day for sunset wraps past midnight", () => {
  const setting = new Date();
  setting.setHours(23, 50, 0, 0);
  const sunState = { attributes: { next_setting: setting.toISOString() } };
  assert.equal(scheduleTimeMinutesOfDay("sunset+20", sunState), 10);
});

test("minutes of day returns null when sun state missing", () => {
  assert.equal(scheduleTimeMinutesOfDay("sunset", null), null);
  assert.equal(scheduleTimeMinutesOfDay("sunset", { attributes: {} }), null);
});

test("sort key: fixed uses clock minutes, sun uses estimated anchors", () => {
  assert.equal(scheduleTimeSortKey("06:00"), 360);
  assert.equal(scheduleTimeSortKey("sunrise+30"), 390);
  assert.equal(scheduleTimeSortKey("sunset-60"), 1020);
  assert.equal(scheduleTimeSortKey("bad"), Number.MAX_SAFE_INTEGER);
});

test("label: fixed passes through, sun is translated with offset", () => {
  assert.equal(formatScheduleTimeLabel("10:00", t), "10:00");
  assert.equal(formatScheduleTimeLabel("sunrise", t), "Sunrise");
  assert.equal(formatScheduleTimeLabel("sunset-45", t), "Sunset-45");
  assert.equal(formatScheduleTimeLabel("sunrise+5", t), "Sunrise+5");
});
