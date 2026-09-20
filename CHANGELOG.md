# Changelog

## 1.2.1

### Added

- **Next event preview in the task editor** (type `Holidays/Shabbat`): a **Next event** block under the Hebcal controls shows which upcoming Shabbat / holiday the current `Event type` + `Holiday subtype` selection resolves to — kind badge (Shabbat / Holiday / Yom Tov), Hebrew and English name from the Hebcal cache, its date (candle lighting → havdalah for Shabbat), the exact activation time after `Phase` and `Offset`, and a reminder that the task repeats on every event of that type (hidden when recurrence is `once`). Shows loading / missing `integration_entry_id` / cache error / no-match status lines instead when needed. Live-updates as the controls change; in-card guide text updated (HE/EN/RU/FR).
- New helpers `nextMatchingHebcalWindow` / `hebcalWindowActivationIso` in `boiler-holiday-rules.js`; the editor's existing start/end autofill and the task-list caption now use the same window resolution. Tests in `tests/holiday-rules.test.mjs`.

### Changed

- **Yom Tov windows now use real times.** The Hebcal cache builds the window of a work-prohibited holiday from candle lighting to havdalah (like Shabbat) instead of a whole calendar day, so a `Holiday` + `Yom Tov` task anchors to the actual entry/exit time. Holidays without candle lighting (Erev, Chol HaMoed, Chanukah, Purim, …) stay whole-day windows, now marked `all_day: true` (cache `schema_version` 2).
- **Regular holidays run at the task's own start clock.** On an all-day window the scheduler activates the task at its `Start` time on that date (phase and offset do not apply). The editor keeps the start clock editable and hides phase/offset for the `Regular holiday` subtype; `All holidays` keeps the clock editable (used on regular days) and shows phase/offset (used on Yom Tov). Previously every holiday anchored at 00:00 and the only way to move it was a large minute offset.
- Existing tasks: a `Yom Tov` task now starts at candle lighting (+ offset) instead of midnight; a `Regular` / `All holidays` task runs at its saved start time on regular holidays. Review such tasks after updating.

### Fixed

- Shabbat/holiday window pairing cascaded after any two-day Yom Tov: the second evening's candle lighting was paired with the *following week's* havdalah, producing week-long "Shabbat" windows for the rest of the month (Tishrei 5787: `Rosh Hashana 5787` 12 Sep → 19 Sep, `Erev Sukkot` 25 Sep → 3 Oct). That kept Shabbat status and the holiday timer/task rules active for weeks. Candle lightings inside an open window are now ignored, a period longer than 4 days is discarded, and a period containing a Yom Tov day is classified `holiday` (work prohibited) instead of `shabbat`. Tests in `tests/test_hebcal_windows.py`.

## 1.2.0

### Added

- **Simple mode** (`simple_mode: true`, card editor → General): hides the Holidays/Shabbat task type and its Hebcal fields, the Holidays & Shabbat guide tab, and the `hebcal_city` / `holiday_active_states` editor fields. Holiday/Shabbat card rules are not applied while enabled. Existing Hebcal tasks stay listed; editing one temporarily reveals its Hebcal fields so nothing is lost on save.
- **Sunrise / sunset times in the task editor** (both modes): every time field (window start/end and each timeline point) has a **Sunrise/sunset** checkbox (☀ on timeline rows) that swaps the clock for a `Sunrise` / `Sunset` choice plus an offset in minutes (±120), sent to the backend as `sunrise+30` / `sunset-45`. Timeline points are a single compact row with a ✕ remove button; the row icon switches between ☀ (sunrise) and 🌙 (sunset), and a small "before / after / exactly at" caption above the offset reflects its sign. Task list and duplicate warnings show localized labels (e.g. `זריחה+30`); "upcoming task" and "ends at" notices resolve sun times from HA's `sun.sun` entity.
- **Timeline auto-fill**: in the task editor (type `Timeline`) set `From` / `To` / `Every` (30 min … 12 h) / `Run for` and press **Generate points** to create one activation every interval from `From` up to and including the last start at or before `To` (same day, fixed times, max 48 points). Saved as a normal timeline task; no backend change.
- **Multi-entity tasks**: new integration option **Allowed task entities** (`allowed_entities`) and an optional `target_entities` list per task (`create_schedule` / `create_timeline` / `update_schedule` / import/export, task switch attribute). The card shows a collapsed **Targets** dropdown (checkbox list) in the task editor when extra entities are allowed and lists targets in the task list. The scheduler switches each targeted entity independently and remembers the extra entities it turned on (released after restart if their task ended). Tasks without `target_entities` keep switching the boiler entity only; the Mode sensor gains `active_targets` / `allowed_entities` attributes.
- **Custom run duration**: every timeline duration select (auto-fill and each point) ends with a `Custom` entry that reveals a minutes input (1–1440), so runs are no longer limited to the configured timer presets. Durations that are not presets (custom, imported or service-created) are now preserved when editing instead of snapping to the first preset.
- New frontend modules `boiler-sun-time.js`, `boiler-simple-mode.js`, `boiler-timeline-generator.js` and `boiler-task-targets.js` with node tests (`tests/*.test.mjs`); new Python module `targets.py` with stdlib tests (`py -m unittest tests.test_targets tests.test_manager_targets`, the latter running `manager.py` against small Home Assistant stubs).

### Fixed

- The general `holiday_timer_policy` / `holiday_task_policy` card options never took effect: the per-kind policy (defaulting to `allow`) was always used for an active Shabbat/holiday and the general one was only consulted when nothing was active. Per-kind keys now override the general rule only when set to `block` / `postpone` / `force_off`; a per-kind `allow` (the editor default) inherits the general rule. Tests in `tests/holiday-rules.test.mjs`.

### Documentation

- README: corrected the task editor description (sunrise/sunset picker), the Holidays & Shabbat tab description (timer/task rules are YAML-only, the tab is read-only), and documented the general vs per-kind policy precedence.

## 1.1.2

### Added

- **Dolphin device profile** (`device_profile: dolphin`) for the [Dolphin](https://github.com/0xAlon/dolphin) Home Assistant integration: climate as primary boiler entity, profile image `boiler-dolphin.png`, editor card and guide text (HE/EN/RU/FR).
- **Climate-aware behavior**: card treats HVAC “on” states (e.g. `heat`) for the boiler climate entity; Boiler Manager turns on climate entities via `climate.set_hvac_mode` when `climate.turn_on` is not suitable.
- **Dolphin quick actions**: optional entities for Sabbath mode, fixed temperature, and up to six shower preset switches (`drop1`–`drop6`) with top-row buttons on the card.
- **Temperature fallback**: if `temperature_sensor` is unset, Dolphin profile uses `current_temperature` from the boiler climate entity.
- **Electric current heuristic**: optional auto-match of `dolphin.*_electric_current` when `current_sensor` is unset (`boiler-dolphin-utils.js`).
- **Unavailable subtitle** when the Dolphin climate entity is `unavailable` (e.g. Sabbath mode).
- **Tests**: `node --test tests/dolphin-utils.test.mjs` for the current-sensor heuristic.

### Documentation

- README: Dolphin section (4.3) expanded with behavior notes, YAML examples, and test command.
- `custom_components/boiler_manager/frontend/README.md`: new modules and asset listed.
