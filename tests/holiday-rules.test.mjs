/**
 * Run: node --test tests/holiday-rules.test.mjs
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  hebcalWindowActivationIso,
  holidayTaskPolicyForKind,
  holidayTimerPolicyForKind,
  nextMatchingHebcalWindow,
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

// ---------------------------------------------------------------------------
// Next-event resolution for the task editor preview
// ---------------------------------------------------------------------------

const T = (iso) => Date.parse(iso);
const NOW = T("2026-09-20T12:00:00+03:00");

const WINDOWS = [
  {
    kind: "holiday",
    starts_at: "2026-10-03T00:00:00+03:00",
    ends_at: "2026-10-04T00:00:00+03:00",
    label: "Sukkot I",
    hebrew: "סוכות א׳",
    work_prohibited: true,
  },
  {
    kind: "shabbat",
    starts_at: "2026-09-25T18:20:00+03:00",
    ends_at: "2026-09-26T19:18:00+03:00",
    label: "Parashat Vayeilech",
    hebrew: "פרשת וילך",
  },
  {
    kind: "holiday",
    starts_at: "2026-09-12T00:00:00+03:00",
    ends_at: "2026-09-13T00:00:00+03:00",
    label: "Rosh Hashana 5787",
    hebrew: "ראש השנה תשפ״ז",
    work_prohibited: true,
  },
  {
    kind: "holiday",
    starts_at: "2026-09-21T00:00:00+03:00",
    ends_at: "2026-09-22T00:00:00+03:00",
    label: "Yom Kippur",
    hebrew: "יום כיפור",
    work_prohibited: true,
  },
  {
    kind: "holiday",
    starts_at: "2026-10-05T00:00:00+03:00",
    ends_at: "2026-10-06T00:00:00+03:00",
    label: "Sukkot II (CH''M)",
    hebrew: "סוכות ב׳ (חוה״מ)",
    work_prohibited: false,
  },
  {
    kind: "shabbat",
    starts_at: "2026-09-18T18:30:00+03:00",
    ends_at: "2026-09-19T19:28:00+03:00",
    label: "Parashat Nitzavim",
    hebrew: "פרשת ניצבים",
  },
];

test("nextMatchingHebcalWindow returns null when there are no windows", () => {
  assert.equal(nextMatchingHebcalWindow([], { kind: "shabbat", now: NOW }), null);
  assert.equal(nextMatchingHebcalWindow(null, { kind: "holiday", now: NOW }), null);
});

test("nextMatchingHebcalWindow skips ended windows and picks the earliest upcoming one", () => {
  const w = nextMatchingHebcalWindow(WINDOWS, { kind: "shabbat", now: NOW });
  assert.equal(w?.label, "Parashat Vayeilech");
});

test("nextMatchingHebcalWindow filters by kind", () => {
  const w = nextMatchingHebcalWindow(WINDOWS, { kind: "holiday", holidaySubtype: "all", now: NOW });
  assert.equal(w?.label, "Yom Kippur");
});

test("nextMatchingHebcalWindow honours the yomtov subtype", () => {
  const w = nextMatchingHebcalWindow(WINDOWS, { kind: "holiday", holidaySubtype: "yomtov", now: NOW });
  assert.equal(w?.label, "Yom Kippur");
});

test("nextMatchingHebcalWindow honours the regular subtype", () => {
  const w = nextMatchingHebcalWindow(WINDOWS, { kind: "holiday", holidaySubtype: "regular", now: NOW });
  assert.equal(w?.label, "Sukkot II (CH''M)");
});

test("nextMatchingHebcalWindow returns null when no window matches the subtype", () => {
  const onlyYomTov = WINDOWS.filter((w) => w.kind !== "holiday" || w.work_prohibited);
  assert.equal(nextMatchingHebcalWindow(onlyYomTov, { kind: "holiday", holidaySubtype: "regular", now: NOW }), null);
});

test("nextMatchingHebcalWindow still returns a window that is currently in progress", () => {
  const during = T("2026-09-25T20:00:00+03:00");
  const w = nextMatchingHebcalWindow(WINDOWS, { kind: "shabbat", now: during });
  assert.equal(w?.label, "Parashat Vayeilech");
});

test("nextMatchingHebcalWindow ignores windows with unparseable dates", () => {
  const broken = [{ kind: "shabbat", starts_at: "soon", ends_at: "later", label: "bad" }, ...WINDOWS];
  const w = nextMatchingHebcalWindow(broken, { kind: "shabbat", now: NOW });
  assert.equal(w?.label, "Parashat Vayeilech");
});

test("hebcalWindowActivationIso uses the start anchor plus offset for phase start", () => {
  const w = WINDOWS[1];
  assert.equal(
    T(hebcalWindowActivationIso(w, { phase: "start", offsetMinutes: 30 })),
    T("2026-09-25T18:50:00+03:00")
  );
});

test("hebcalWindowActivationIso uses the end anchor and accepts negative offsets", () => {
  const w = WINDOWS[1];
  assert.equal(
    T(hebcalWindowActivationIso(w, { phase: "end", offsetMinutes: -45 })),
    T("2026-09-26T18:33:00+03:00")
  );
});

test("hebcalWindowActivationIso defaults to phase start with no offset", () => {
  const w = WINDOWS[3];
  assert.equal(T(hebcalWindowActivationIso(w)), T("2026-09-21T00:00:00+03:00"));
});

test("hebcalWindowActivationIso returns null for an invalid window", () => {
  assert.equal(hebcalWindowActivationIso(null, { phase: "start" }), null);
  assert.equal(hebcalWindowActivationIso({ starts_at: "nope" }, { phase: "start" }), null);
});

// ---------------------------------------------------------------------------
// All-day (no candle lighting) holiday windows run at the task's own start clock
// ---------------------------------------------------------------------------

const CHOL_HAMOED = {
  kind: "holiday",
  all_day: true,
  work_prohibited: false,
  starts_at: "2026-09-27T00:00:00+03:00",
  ends_at: "2026-09-28T00:00:00+03:00",
  label: "Sukkot II (CH''M)",
};

test("hebcalWindowActivationIso uses the task start clock on an all-day window", () => {
  const iso = hebcalWindowActivationIso(CHOL_HAMOED, { phase: "start", offsetMinutes: 0, startHHMM: "06:30" });
  assert.equal(iso, new Date(2026, 8, 27, 6, 30).toISOString());
});

test("hebcalWindowActivationIso ignores phase and offset on an all-day window", () => {
  const iso = hebcalWindowActivationIso(CHOL_HAMOED, { phase: "end", offsetMinutes: 90, startHHMM: "06:30" });
  assert.equal(iso, new Date(2026, 8, 27, 6, 30).toISOString());
});

test("hebcalWindowActivationIso falls back to midnight on an all-day window without a start clock", () => {
  const iso = hebcalWindowActivationIso(CHOL_HAMOED, { phase: "start", offsetMinutes: 0 });
  assert.equal(iso, new Date(2026, 8, 27, 0, 0).toISOString());
});

test("hebcalWindowActivationIso keeps anchor + offset semantics on timed windows even with a start clock", () => {
  const w = WINDOWS[1];
  const iso = hebcalWindowActivationIso(w, { phase: "start", offsetMinutes: 30, startHHMM: "06:30" });
  assert.equal(T(iso), T("2026-09-25T18:50:00+03:00"));
});
