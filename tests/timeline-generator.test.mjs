/**
 * Run: node --test tests/timeline-generator.test.mjs
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERVAL_PRESET_MINUTES,
  formatIntervalLabel,
  generateTimelinePoints,
} from "../custom_components/boiler_manager/frontend/boiler-timeline-generator.js";

const t = (key) => ({ minutes_short: "min", hours_short: "h" }[key] || key);

test("every 3 hours from 06:00 to 23:00 includes 06:00 and stops at the last start <= end", () => {
  const result = generateTimelinePoints({
    start: "06:00",
    end: "23:00",
    intervalMinutes: 180,
    durationOption: "30m",
    durationMinutes: 30,
  });
  assert.equal(result.error, undefined);
  assert.deepEqual(result.points.map((p) => p.at), ["06:00", "09:00", "12:00", "15:00", "18:00", "21:00"]);
  assert.deepEqual(result.points[0], { at: "06:00", duration_option: "30m", duration_minutes: 30 });
});

test("a point exactly at the end time is the last activation", () => {
  const result = generateTimelinePoints({
    start: "05:00",
    end: "23:00",
    intervalMinutes: 360,
    durationOption: "60m",
    durationMinutes: 60,
  });
  assert.deepEqual(result.points.map((p) => p.at), ["05:00", "11:00", "17:00", "23:00"]);
});

test("start equal to end yields a single point", () => {
  const result = generateTimelinePoints({
    start: "07:30",
    end: "07:30",
    intervalMinutes: 60,
    durationOption: "15m",
    durationMinutes: 15,
  });
  assert.deepEqual(result.points.map((p) => p.at), ["07:30"]);
});

test("end before start is rejected (no cross-midnight generation)", () => {
  const result = generateTimelinePoints({
    start: "22:00",
    end: "02:00",
    intervalMinutes: 60,
    durationOption: "15m",
    durationMinutes: 15,
  });
  assert.equal(result.error, "end_before_start");
  assert.equal(result.points, undefined);
});

test("invalid or sun-based times are rejected", () => {
  assert.equal(generateTimelinePoints({ start: "sunrise", end: "20:00", intervalMinutes: 60, durationOption: "15m", durationMinutes: 15 }).error, "invalid_time");
  assert.equal(generateTimelinePoints({ start: "06:00", end: "", intervalMinutes: 60, durationOption: "15m", durationMinutes: 15 }).error, "invalid_time");
  assert.equal(generateTimelinePoints({ start: "25:00", end: "26:00", intervalMinutes: 60, durationOption: "15m", durationMinutes: 15 }).error, "invalid_time");
});

test("non-positive interval or duration is rejected", () => {
  assert.equal(generateTimelinePoints({ start: "06:00", end: "23:00", intervalMinutes: 0, durationOption: "15m", durationMinutes: 15 }).error, "invalid_interval");
  assert.equal(generateTimelinePoints({ start: "06:00", end: "23:00", intervalMinutes: 60, durationOption: "", durationMinutes: 0 }).error, "invalid_duration");
});

test("too many points is rejected instead of flooding the editor", () => {
  const result = generateTimelinePoints({
    start: "00:00",
    end: "23:59",
    intervalMinutes: 15,
    durationOption: "15m",
    durationMinutes: 15,
    maxPoints: 48,
  });
  assert.equal(result.error, "too_many_points");
});

test("interval presets are ascending minutes", () => {
  assert.ok(INTERVAL_PRESET_MINUTES.length > 5);
  for (let i = 1; i < INTERVAL_PRESET_MINUTES.length; i += 1) {
    assert.ok(INTERVAL_PRESET_MINUTES[i] > INTERVAL_PRESET_MINUTES[i - 1]);
  }
});

test("interval labels use minutes below an hour and hours otherwise", () => {
  assert.equal(formatIntervalLabel(30, t), "30 min");
  assert.equal(formatIntervalLabel(60, t), "1 h");
  assert.equal(formatIntervalLabel(90, t), "1.5 h");
  assert.equal(formatIntervalLabel(180, t), "3 h");
});
