"""Hebcal cache window building and Hebcal-event task scheduling.

Run: py -m unittest tests.test_hebcal_windows  (from the repo root)

Uses the lightweight Home Assistant stubs from ``tests.test_manager_targets``
(its ``dt_util.as_local`` is UTC, so scheduling tests use UTC timestamps).
"""

from __future__ import annotations

import unittest
from datetime import date

from tests.test_manager_targets import FakeEntry, FakeHass  # installs the stubs on import

from custom_components.boiler_manager import hebcal_cache
from custom_components.boiler_manager.manager import BoilerManager, BoilerTask, _task_hebcal_event_windows


def _holiday(day, title, subcat="major", yomtov=False, hebrew=""):
    item = {"date": day, "category": "holiday", "subcat": subcat, "title": title, "hebrew": hebrew}
    if yomtov:
        item["yomtov"] = True
    return item


def _candles(at, memo):
    return {"date": at, "category": "candles", "title_orig": "Candle lighting", "memo": memo}


def _havdalah(at, memo):
    return {"date": at, "category": "havdalah", "title_orig": "Havdalah", "memo": memo}


# Real Hebcal output for IL-Jerusalem, Tishrei 5787 (Sep 11 - Oct 3 2026).
TISHREI = [
    _holiday("2026-09-11", "Erev Rosh Hashana"),
    _candles("2026-09-11T18:10:00+03:00", "Erev Rosh Hashana"),
    _holiday("2026-09-12", "Rosh Hashana 5787", yomtov=True, hebrew="ראש השנה תשפ״ז"),
    _candles("2026-09-12T19:26:00+03:00", "Rosh Hashana 5787"),
    _holiday("2026-09-13", "Rosh Hashana II", yomtov=True, hebrew="ראש השנה ב׳"),
    _havdalah("2026-09-13T19:24:00+03:00", "Rosh Hashana II"),
    _holiday("2026-09-14", "Tzom Gedaliah", subcat="fast"),
    _candles("2026-09-18T18:01:00+03:00", "Parashat Vayeilech"),
    _holiday("2026-09-19", "Shabbat Shuva", subcat="shabbat"),
    _havdalah("2026-09-19T19:16:00+03:00", ""),
    _holiday("2026-09-20", "Erev Yom Kippur"),
    _candles("2026-09-20T17:58:00+03:00", "Erev Yom Kippur"),
    _holiday("2026-09-21", "Yom Kippur", yomtov=True, hebrew="יום כיפור"),
    _havdalah("2026-09-21T19:14:00+03:00", "Yom Kippur"),
    _holiday("2026-09-25", "Erev Sukkot"),
    _candles("2026-09-25T17:52:00+03:00", "Erev Sukkot"),
    _holiday("2026-09-26", "Sukkot I", yomtov=True, hebrew="סוכות א׳"),
    _havdalah("2026-09-26T19:07:00+03:00", "Sukkot I"),
    _holiday("2026-09-27", "Sukkot II (CH''M)"),
    _holiday("2026-09-28", "Sukkot III (CH''M)"),
    _holiday("2026-10-02", "Sukkot VII (Hoshana Raba)"),
    _candles("2026-10-02T17:43:00+03:00", "Sukkot VII (Hoshana Raba)"),
    _holiday("2026-10-03", "Shmini Atzeret", yomtov=True, hebrew="שמיני עצרת"),
    _havdalah("2026-10-03T18:58:00+03:00", "Shmini Atzeret"),
]


def _build():
    return hebcal_cache._build_windows(TISHREI, "Asia/Jerusalem")


def _timed(windows):
    return [w for w in windows if not w.get("all_day")]


def _span(w):
    return (w["starts_at"][:16], w["ends_at"][:16])


class BuildWindowsTests(unittest.TestCase):
    def test_candle_windows_do_not_cascade_after_a_two_day_yomtov(self):
        spans = [_span(w) for w in _timed(_build())]
        self.assertEqual(
            spans,
            [
                ("2026-09-11T18:10", "2026-09-13T19:24"),  # Rosh Hashana I+II (incl. Shabbat)
                ("2026-09-18T18:01", "2026-09-19T19:16"),  # Shabbat Shuva
                ("2026-09-20T17:58", "2026-09-21T19:14"),  # Yom Kippur
                ("2026-09-25T17:52", "2026-09-26T19:07"),  # Sukkot I
                ("2026-10-02T17:43", "2026-10-03T18:58"),  # Shmini Atzeret
            ],
        )

    def test_yomtov_periods_are_holiday_kind_with_work_prohibited(self):
        by_start = {w["starts_at"][:10]: w for w in _timed(_build())}
        rosh_hashana = by_start["2026-09-11"]
        self.assertEqual(rosh_hashana["kind"], "holiday")
        self.assertTrue(rosh_hashana["work_prohibited"])
        self.assertEqual(rosh_hashana["label"], "Rosh Hashana 5787")
        self.assertEqual(rosh_hashana["hebrew"], "ראש השנה תשפ״ז")
        self.assertEqual(by_start["2026-09-20"]["label"], "Yom Kippur")
        self.assertEqual(by_start["2026-09-20"]["kind"], "holiday")

    def test_plain_shabbat_stays_shabbat_kind(self):
        by_start = {w["starts_at"][:10]: w for w in _timed(_build())}
        shabbat = by_start["2026-09-18"]
        self.assertEqual(shabbat["kind"], "shabbat")
        self.assertFalse(shabbat.get("work_prohibited"))
        self.assertEqual(shabbat["label"], "Parashat Vayeilech")

    def test_all_day_windows_only_for_holidays_without_candle_lighting(self):
        all_day = {w["label"]: w for w in _build() if w.get("all_day")}
        self.assertEqual(
            sorted(all_day),
            sorted([
                "Erev Rosh Hashana", "Erev Yom Kippur", "Erev Sukkot",
                "Sukkot II (CH''M)", "Sukkot III (CH''M)", "Sukkot VII (Hoshana Raba)",
            ]),
        )
        for w in all_day.values():
            self.assertEqual(w["kind"], "holiday", w["label"])
            self.assertFalse(w["work_prohibited"], w["label"])
            self.assertEqual(w["starts_at"][11:16], "00:00", w["label"])

    def test_yomtov_without_candle_data_falls_back_to_all_day_window(self):
        windows = hebcal_cache._build_windows(
            [_holiday("2026-09-21", "Yom Kippur", yomtov=True, hebrew="יום כיפור")],
            "Asia/Jerusalem",
        )
        self.assertEqual(len(windows), 1)
        self.assertTrue(windows[0]["all_day"])
        self.assertTrue(windows[0]["work_prohibited"])
        self.assertEqual(windows[0]["kind"], "holiday")

    def test_windows_are_sorted_by_start(self):
        starts = [w["starts_at"] for w in _build()]
        self.assertEqual(starts, sorted(starts))


def _task(**overrides):
    base = dict(
        task_id="t1", name="t", start_time="06:00", end_time="08:00", task_type="window",
        days=[], months=[], recurrence="forever", start_date=None, end_date=None,
        condition_entity=None, condition_operator=None, skip_if_state=None, enabled=True,
        trigger_mode="hebcal_event", hebcal_event_kind="holiday", hebcal_event_phase="start",
        hebcal_holiday_mode="all", hebcal_offset_minutes=0,
    )
    base.update(overrides)
    return BoilerTask(**base)


def _manager_with_windows(windows):
    manager = BoilerManager(FakeHass(), FakeEntry([]))
    manager._hebcal_windows = lambda _now: list(windows)
    return manager


ALL_DAY_CHOL_HAMOED = {
    "kind": "holiday", "all_day": True, "work_prohibited": False, "label": "Sukkot II (CH''M)",
    "starts_at": "2026-09-27T00:00:00+00:00", "ends_at": "2026-09-28T00:00:00+00:00",
}
YOM_KIPPUR = {
    "kind": "holiday", "work_prohibited": True, "label": "Yom Kippur",
    "starts_at": "2026-09-20T17:58:00+00:00", "ends_at": "2026-09-21T19:14:00+00:00",
}


class HebcalTaskWindowTests(unittest.TestCase):
    def test_all_day_window_runs_at_the_task_start_clock_ignoring_phase_and_offset(self):
        manager = _manager_with_windows([ALL_DAY_CHOL_HAMOED])
        task = _task(start_time="06:30", end_time="08:00", hebcal_event_phase="end", hebcal_offset_minutes=90)
        windows = _task_hebcal_event_windows(task, manager, date(2026, 9, 27))
        self.assertEqual([(s.strftime("%H:%M"), e.strftime("%H:%M")) for s, e in windows], [("06:30", "08:00")])
        self.assertEqual(_task_hebcal_event_windows(task, manager, date(2026, 9, 28)), [])

    def test_timed_window_still_anchors_at_event_plus_offset(self):
        manager = _manager_with_windows([YOM_KIPPUR])
        task = _task(start_time="05:00", end_time="06:30", hebcal_holiday_mode="yomtov", hebcal_offset_minutes=-60)
        windows = _task_hebcal_event_windows(task, manager, date(2026, 9, 20))
        self.assertEqual([(s.strftime("%H:%M"), e.strftime("%H:%M")) for s, e in windows], [("16:58", "18:28")])

    def test_regular_subtype_skips_work_prohibited_windows(self):
        manager = _manager_with_windows([YOM_KIPPUR, ALL_DAY_CHOL_HAMOED])
        task = _task(hebcal_holiday_mode="regular")
        self.assertEqual(_task_hebcal_event_windows(task, manager, date(2026, 9, 20)), [])
        self.assertEqual(len(_task_hebcal_event_windows(task, manager, date(2026, 9, 27))), 1)


if __name__ == "__main__":
    unittest.main()
