# Boiler Card + Boiler Manager (Home Assistant)

Custom boiler control solution for Home Assistant with:
- Lovelace custom card (`boiler-water-card`)
- Built-in custom integration (`boiler_manager`)
- No required Home Assistant package/scripts/timer helpers for normal install (integration-first flow)
- Timer control, recurring tasks, and timeline tasks
- Task entities as real `switch` entities
- Optional card sensors (temperature / power / current / voltage)
- Mobile-friendly popups (Safari + Chrome); task edit modal stays the same grid as desktop, with narrower time/duration fields on small screens only
- In-card task backup/restore (Import/Export)
- Per-task conditional execution by external entity state (including numeric operators)
- Card editor auto-fills `boiler_entity` from Boiler Manager integration when a single matching entry is detected
- `Switcher mode` support with adapter behavior:
  - Uses `boiler_manager` timed/continuous/off services when available
  - Falls back to native `switcher_kis.turn_on_with_timer` / `homeassistant.turn_on` / `homeassistant.turn_off` when needed
- Card UI languages: `he` / `en` / `ru` / `fr`

## What You Get

- Quick buttons:
  - Default: `15 / 30 / 60 / Off`
  - Fully dynamic from configured timer values (adds/removes buttons automatically)
- Timer popup from hamburger menu
- Tasks popup from same hamburger menu
- Separate `Import/Export` tab in the same menu
- `Holidays & Shabbat` tab: Hebcal file status, global timer/task rules, Hebcal window scope (Shabbat / holidays / both), and a scrollable list of all windows from the local cache (read-only; rules apply automatically when status is **Active**)
- Create, edit, enable/disable, and delete tasks from card UI
- Import/Export tasks directly from dedicated Import/Export tab
  - Import mode buttons: `merge` / `replace`
- Per-task condition in card UI:
  - `Condition Entity` (for example `input_boolean.some_flag`)
  - `Condition Operator` (`=`, `>`, `<`, `>=`, `<=`)
  - `Skip If State` (for example `on`)
  - Smart state suggestions by selected entity domain (for example `light` => `on/off`)
- Sensor chips shown only when configured in the card
- Heat bar can run from real temperature sensor (with threshold colors)
- Task recurrence options:
  - `forever`
  - `once` (auto-removes after first completed run)
  - `range` (start/end date)
  - Selected from 3 fixed UI buttons (no dropdown)
- Day and month filtering
- Timeline task type:
  - Multiple points per day
  - Each point uses existing timer options (same as timer picker)
  - Overlap behavior: extends until latest end time (max end wins)
- Tasks list uses a **stable order** (start time -> name -> task id) to keep row/button mapping fixed during repeated toggles
- Active task notice in card with current task end time
- Vacation mode toggle directly in Tasks tab
- Vacation mode safety behavior:
  - Immediate forced OFF when enabled
  - Timed/continuous activation is blocked while active
  - Menu remains usable so vacation mode can always be disabled
- Scheduler tick every second for near-immediate start/stop transitions
- Runtime state restore on Home Assistant restart (active manual timed/continuous sessions are recovered)
- Schedule/task modals:
  - Touch-friendly controls; `font-size: 16px` on most form inputs on narrow screens to reduce iOS zoom quirks
  - Task editor (`#schedule-modal`) stays centered on small viewports (same overall layout as desktop)
  - On `max-width: 760px` / `520px`, only **time** and **timeline duration** controls inside the task modal are visually tightened (`max-width`, padding, `min-height`); category grids and action buttons are unchanged
  - Sticky top toolbar in mobile tasks list; timer page arrows hidden in tasks mode (list-only mode)

## UI Screenshots & Professional Walkthrough

> Place screenshots in `docs/screenshots/` using the exact filenames below.

### 1) Main Boiler Card
![Main Boiler Card](https://github.com/moshiko2312/Boiler_card/raw/main/docs/screenshots/01-main-card.png)

- Purpose: primary operational view for day-to-day boiler control.
- Header title/subtitle:
  - `title`: configurable card title.
  - `subtitle`: dynamic runtime status (ready / timed heating / continuous heating).
- Left image block: custom boiler flow image (`boiler_flow_image`).
- Center top value:
  - Shows live temperature when `temperature_sensor` is configured and valid.
  - Otherwise shows timer-based warming progress text.
- Progress bar:
  - Temperature-driven mode when live temperature exists.
  - Timer-driven fallback when no valid live temperature is available.
- Right block:
  - Countdown timer value and label.
  - Hamburger menu (`☰`) opens advanced modal.
- Bottom quick actions:
  - `15 / 30 / 60` timed presets.
  - `Off` immediate shutdown.

### 2) Timer Tab (Paged Options)
![Timer Tab](https://github.com/moshiko2312/Boiler_card/raw/main/docs/screenshots/02-timer-tab.png)

- Purpose: select full duration catalog beyond quick presets.
- Top controls:
  - Close (`✕`)
  - Previous/Next page arrows
  - Page indicator (`current / total`)
  - Mode tabs (`Timer`, `Tasks`, `Import/Export`)
- Timer grid:
  - All configured duration options including long presets and no-timer option.
  - Selected option is highlighted.

### 3) Tasks Tab
![Tasks Tab](https://github.com/moshiko2312/Boiler_card/raw/main/docs/screenshots/03-tasks-tab.png)

- Purpose: task automation management in one place.
- `Add`: create a new scheduled task (time window or timeline).
- Task rows include:
  - Task name.
  - Compact schedule summary (time, days, months, timeline points when relevant).
  - `Enable/Disable` action.
  - `Edit` action.
  - `Delete` action.
- Behavior:
  - Tasks are sorted by nearest next execution.
  - Actions are reflected in both card UI and integration state.

### 4) Import / Export Tab
![Import Export Tab](https://github.com/moshiko2312/Boiler_card/raw/main/docs/screenshots/05-import-export-tab.png)
![Import Task Selection List](https://github.com/moshiko2312/Boiler_card/raw/main/docs/screenshots/04-import-export-list.jpeg)

- Purpose: task backup and restore operations.
- Mode buttons:
  - `Merge`: append imported tasks to existing tasks.
  - `Replace`: clear existing tasks before import.
- Action buttons:
  - `Import`: upload JSON backup.
  - `Export`: download current task set as JSON.
- Import flow enhancement:
  - After choosing a JSON file, an in-card selection popup opens.
  - You can choose exactly which tasks to import (`Select All` / `Clear All`).
  - In `merge` mode, duplicate tasks are filtered out before service call to avoid import validation errors.
- Design goal:
  - Safe maintenance operations separated from normal task editing.

### 5) Replace Confirmation Dialog
![Replace Confirmation](https://github.com/moshiko2312/Boiler_card/raw/main/docs/screenshots/06-replace-confirmation.png)

- Purpose: guardrail before destructive import.
- Triggered when user imports in `Replace` mode.
- Content:
  - Clear warning message.
  - List/summary of impacted tasks when available.
- Action:
  - Explicit confirmation required to proceed.

### 6) Card Editor Configuration
![Card Editor Configuration](https://github.com/moshiko2312/Boiler_card/raw/main/docs/screenshots/07-card-editor.png)

- Purpose: configure card behavior and data sources.
- Key fields:
  - Language (`he` / `en` / `ru` / `fr`)
  - Title
    - When `Title` is still a default card title, changing `Language` auto-updates `Title` to that language's default.
    - Custom user-entered titles are preserved and are not overwritten by language changes.
  - Boiler entity
  - Timer values (`timer_values`) for regular mode
    - Default: `15,30,60`
    - If edited manually, quick buttons and timer grid are regenerated automatically
  - Switcher timer values (`switcher_timer_values`) for Switcher mode
  - Temperature sensor
  - Power sensor (`W`)
  - Current sensor
  - Voltage sensor
  - Flow image URL/path
  - `holiday_active_states` — which Home Assistant `state` strings count as “active” for optional YAML entities `holiday_entity` / `shabbat_entity` (see **`holiday_active_states` (card setting)** below)
  - `integration_entry_id` — links the card to a Boiler Manager config entry (Hebcal JSON path, services, optional city sync)
  - `hebcal_city` — dropdown of Hebcal `geo=city` tokens (Israel); when changed, the card calls `boiler_manager.refresh_hebcal` with `entry_id` + `hebcal_city` so the value is stored in **integration options** and the local JSON cache is refreshed (requires `integration_entry_id`). Choose “match integration” to clear the option override.
  - Hebcal file path override remains via card YAML `hebcal_cache_path` when needed (see **Holidays & Shabbat (Hebcal)**); timer/task rules and window scope are edited in the card **menu tab**, not duplicated in the editor list above
- Right-side preview:
  - Real-time visual feedback while editing.

### 7) Holidays & Shabbat tab
![Holidays and Shabbat tab](https://github.com/moshiko2312/Boiler_card/raw/main/docs/screenshots/08-holidays-shabbat-tab.png)

- Purpose: Jewish calendar windows from the local Hebcal cache, plus global rules for timers and tasks during “active” holiday/Shabbat time.
- The guide’s **חגים ושבתות** tab lists upcoming windows (Shabbat / holidays) from the local JSON; filters **הכל / חגים / שבתות** narrow the list. The line **עיר: …** reflects the Hebcal city token used for that cache (see **Holidays & Shabbat (Hebcal)** and card **`hebcal_city`**).
- In-tab controls persist to the card YAML via `config-changed` (save the dashboard after changing rules).

### 8) Mobile UI (reference screenshots)

Captured on a narrow phone viewport; layout matches the desktop grid (task editor stays multi-column; time fields use compact mobile-only CSS inside `#schedule-modal`).

![Mobile — main card](https://github.com/moshiko2312/Boiler_card/raw/main/docs/screenshots/mobile-01-main-card.png)

- Main card: quick timers, progress, hamburger menu.

![Mobile — guide: manual tab](https://github.com/moshiko2312/Boiler_card/raw/main/docs/screenshots/mobile-02-guide-manual-tab.png)

- In-card guide, **מדריך** tab (scrollable overview text).

![Mobile — guide: holidays & Shabbat tab](https://github.com/moshiko2312/Boiler_card/raw/main/docs/screenshots/mobile-03-guide-holidays-shabbat-tab.png)

- Same guide modal on **חגים ושבתות**: city line, filters, event cards.

![Mobile — task edit: timeline points](https://github.com/moshiko2312/Boiler_card/raw/main/docs/screenshots/mobile-04-task-edit-timeline.png)

- Task editor with **טיים ליין**: time + duration + remove per row.

![Mobile — task edit: holidays / Shabbat mode](https://github.com/moshiko2312/Boiler_card/raw/main/docs/screenshots/mobile-05-task-edit-holiday-mode.png)

- **חגים/שבתות** task type: start/end times, recurrence, event type, offset, phase.

![Mobile — task edit: time window](https://github.com/moshiko2312/Boiler_card/raw/main/docs/screenshots/mobile-06-task-edit-time-window.png)

- **חלון זמן**: start/end time row and recurrence.

![Mobile — timer modal: history](https://github.com/moshiko2312/Boiler_card/raw/main/docs/screenshots/mobile-07-timer-modal-history.png)

- Hamburger → history log (export / clear when configured).

![Mobile — tasks tab](https://github.com/moshiko2312/Boiler_card/raw/main/docs/screenshots/mobile-08-tasks-tab.png)

- **משימות** list: edit / disable / delete on each row.

## Project Structure

- `custom_components/boiler_manager/` — Home Assistant integration (Python + bundled frontend).
- `custom_components/boiler_manager/frontend/boiler-card.js` — Lovelace card source shipped with the integration (also copied to `www` on integration load).
- `www/boiler-card/boiler-card.js` — Mirror of the card script for repo consistency; keep it in sync with `frontend/boiler-card.js` when developing outside HA.
- `custom_components/boiler_manager/hebcal_cache.py` — Fetches Hebcal JSON and writes the normalized cache file under `www/boiler-card/`.
- `lovelace/boiler-card-example.yaml` — example card config
- `home-assistant/packages/boiler_hot_water.yaml` — optional legacy package flow

## Installation

### HACS (Recommended)

1. In Home Assistant, open `HACS -> Integrations -> ⋮ -> Custom repositories`
2. Add repository URL: `https://github.com/moshiko2312/Boiler_card`
3. Category: `Integration`
4. Install `Boiler Manager` from HACS and restart Home Assistant

### 1) Install Integration

Copy:
- Source: `custom_components/boiler_manager`
- Destination: `/config/custom_components/boiler_manager`

Restart Home Assistant.

Add integration:
- `Settings -> Devices & Services -> Add Integration -> Boiler Manager`

Configure:
- Boiler entity (`switch.*` or `light.*`)

Note:
- Sensors are now configured only in the **card editor UI**, not in integration setup/options.
- Timer logic runs through `boiler_manager` services by default; `home-assistant/packages/boiler_hot_water.yaml` is legacy-only.

### 2) Frontend Card File

On integration startup, card assets are auto-copied to:
- `/config/www/boiler-card/boiler-card.js`

The same directory receives **`hebcal-<config_entry_id>.json`** when Hebcal is enabled (integration option). The card loads it as `/local/boiler-card/hebcal-<entry_id>.json` (with optional override via `hebcal_cache_path` on the card).

### 3) Lovelace Resource Registration (Automatic + Safe + Backup)

On integration startup, Boiler Manager also tries to auto-register this resource:
- `/local/boiler-card/boiler-card.js` (`module`)

Behavior:
- Adds the card resource only if missing
- Updates only this card resource entry if needed
- Does **not** remove or overwrite unrelated existing resources

Notes:
- Works with Lovelace Storage mode (`.storage/lovelace_resources`)
- Works with YAML mode (`/config/ui-lovelace.yaml`) as well:
  - If the resource exists, only that entry is updated
  - If missing, a new resource entry is appended
  - Unrelated resource entries are preserved
- Before writing resources, integration creates a timestamped backup (when source file exists):
  - `/config/boiler_manager_backups/lovelace/`
  - Backup example:
    - `lovelace_resources.20260423_071500_123456.bak`
    - `ui-lovelace.yaml.20260423_071501_654321.bak`

Manual fallback (if auto registration is blocked/fails):
- `Settings -> Dashboards -> Resources -> Add Resource`
- URL: `/local/boiler-card/boiler-card.js`
- Type: `JavaScript Module`

### 4) Add Card

```yaml
type: custom:boiler-water-card
language: fr
title: Chauffe-eau
boiler_entity: switch.boiler
integration_entry_id: 01JABCDEFGH1234567890
service_run_timed: boiler_manager.run_timed
service_on_continuous: boiler_manager.turn_on_continuous
service_off: boiler_manager.turn_off
service_create_schedule: boiler_manager.create_schedule
service_create_timeline: boiler_manager.create_timeline
service_update_schedule: boiler_manager.update_schedule
service_delete_schedule: boiler_manager.delete_schedule
service_import_tasks: boiler_manager.import_tasks
service_export_tasks: boiler_manager.export_tasks
service_set_vacation_mode: boiler_manager.set_vacation_mode
service_clear_task_history: boiler_manager.clear_task_history

# Optional regular-mode timer list (minutes, comma-separated)
# Default is "15,30,60" when empty
timer_values: "15,30,60,90"

# Optional card sensors (card-only configuration)
temperature_sensor: sensor.boiler_temperature
power_sensor: sensor.boiler_power
current_sensor: sensor.boiler_current
voltage_sensor: sensor.boiler_voltage
```

Notes:
- `integration_entry_id` is optional if you have only one Boiler Manager entry.
- Built-in integration mode is the supported/default runtime path.
- If `timer_values` is edited manually, the bottom quick buttons and timer modal grid are updated automatically.

### 4.1) Optional: Switcher Mode Card Configuration

`switcher_mode` is intended for users with Switcher devices who still want full in-card time management.

#### Switcher mode behavior matrix

| Mode | Timed ON | Continuous ON / OFF | Tasks / Import-Export / Vacation |
|---|---|---|---|
| Adapter (recommended) | `boiler_manager.run_timed` (uses native `switcher_kis.turn_on_with_timer` when available) | `boiler_manager.turn_on_continuous` / `boiler_manager.turn_off` | Full support |
| Direct fallback | `switcher_kis.turn_on_with_timer` | `homeassistant.turn_on` / `homeassistant.turn_off` | Limited (depends on Boiler Manager services configured) |

```yaml
type: custom:boiler-water-card
language: he
title: דוד חכם
switcher_mode: true
boiler_entity: switch.switcher_touch_boiler

# Keep boiler_manager services for full Tasks/Import/Export/Vacation support:
service_run_timed: boiler_manager.run_timed
service_on_continuous: boiler_manager.turn_on_continuous
service_off: boiler_manager.turn_off
service_create_schedule: boiler_manager.create_schedule
service_create_timeline: boiler_manager.create_timeline
service_update_schedule: boiler_manager.update_schedule
service_delete_schedule: boiler_manager.delete_schedule
service_import_tasks: boiler_manager.import_tasks
service_export_tasks: boiler_manager.export_tasks
service_set_vacation_mode: boiler_manager.set_vacation_mode

# Optional Switcher-specific sensors:
switcher_time_left_sensor: sensor.switcher_touch_boiler_remaining_time
switcher_sensor_1: sensor.switcher_touch_boiler_electric_current
switcher_sensor_2: sensor.switcher_touch_boiler_power_consumption
switcher_icon_sensor: sensor.switcher_touch_boiler_temperature
switcher_timer_values: "15,30,45,60,90,120"
```

## Card Usage Guide

### Quick Daily Flow

1. Open hamburger menu (`☰`)
2. Choose `Timer` for immediate heat, `Tasks` for automation, or `Import/Export` for backup/restore
3. For automation, create a task and set:
   - Type (`Time Window` / `Timeline`)
   - Recurrence (`forever` / `once` / `range`)
   - Optional condition (`Condition Entity` + `Skip If State`)
   - Days + months filters
4. Save
5. Verify in Tasks list:
   - Task appears as switch entity
   - List order is by next event (closest first)

### Timer Mode

- Open hamburger menu (`☰`)
- Choose `Timer`
- Pick duration option
- Boiler starts immediately via integration service
- Timed buttons remain usable even when a task exists (subject to normal entity/service availability)
- Duration source priority:
  - Regular mode: `timer_values` (if set) -> `duration_entity` options -> internal defaults
  - Switcher mode: `switcher_timer_values` (if set) -> Switcher defaults

### Tasks Mode

- Open hamburger menu (`☰`)
- Choose `Tasks`
- Click `Add`
- `Vacation Mode` toggle behavior:
  - Enabling vacation performs immediate forced OFF for the configured boiler entity.
  - During vacation, timer activation is blocked until vacation is disabled.
  - Hamburger/menu stays available so vacation can always be disabled from the UI.

### Holidays & Shabbat (Hebcal)

- **Backend:** With `hebcal_enabled` on the integration (default for new entries), Boiler Manager refreshes the Hebcal cache on setup and once per day, and writes normalized windows to `/config/www/boiler-card/hebcal-<entry_id>.json`.
- **City:** Default token is `IL-Jerusalem` (`DEFAULT_HEBCAL_CITY`). Set or change **`hebcal_city`** under **Settings → Devices & services → Boiler Manager → Configure**, and/or use the **card editor** dropdown (see Card Editor above). Tokens follow Hebcal’s `geo=city` format (for example `IL-Tel_Aviv`).
- **Service:** `boiler_manager.refresh_hebcal` — same targeting as other services (`entry_id` or `boiler_entity`). Optional field **`hebcal_city`**: when present, updates the integration’s `hebcal_city` option then refreshes the cache; an **empty string** removes the option override so the entry falls back to data/default.
- **Card tab** (`☰` → `Holidays & Shabbat`):
  - **Status** — *Active* when any of: configured `holiday_entity` / `shabbat_entity` (YAML) says “on”, or current time falls inside a Hebcal window allowed by **Hebcal window scope** (Shabbat only / holidays only / both).
  - **Timer rule** / **Task rule** — global behavior while status is Active (allow / block / postpone / force off). Changed in-tab; Lovelace stores them on the card.
  - **Window list** — full read-only list from the JSON (labels, start→end, kind, past/now/upcoming). It does not assign rules per row; it is for verification and planning.
  - **Per-task exceptions** — still use the task editor **Condition** block (`condition_entity`, `condition_operator`, `skip_if_state`) if one task needs different logic than the global task rule.
- **Card editor:** Hebcal on/off, optional manual JSON path, entry id helpers — **not** the duplicate timer/task/scope controls (those stay in the tab).
- **Task editor integration (compact mode):**
  - In `Type`, choose `Holidays/Shabbat` to reveal per-task Hebcal controls directly inside the Time section.
  - When `Event type = Shabbat`, holiday subtype options are hidden.
  - `Phase = start` autofills/locks start time from next entry time.
  - `Phase = end` switches end-time control to timer-duration selection (same options as timeline), then derives start time automatically.
  - `Holiday + Yom Tov` follows the same start/end behavior as Shabbat.

### `holiday_active_states` (card setting)

This card setting is easy to misread: it is **not** a generic “map any entity” field. It only defines **which Home Assistant `state` values mean “this holiday/Shabbat source is active”** for the optional YAML keys `holiday_entity` and `shabbat_entity`.

- **What it does:** The card splits the string on commas or whitespace, lowercases each token, and compares the current `state` of `holiday_entity` / `shabbat_entity` (when configured in YAML) to that list. A match marks that source as active for holiday/Shabbat logic (together with global rules in the **Holidays & Shabbat** menu tab).
- **Default value in YAML/UI:** `on,home,active,true` — a reasonable default for binary sensors and many integrations. If you clear the field, the card still falls back internally to the same four tokens.
- **When you should care:** Only if you use **YAML** to set `holiday_entity` and/or `shabbat_entity` (for example a custom Jewish-calendar sensor or a template entity). Then add whatever **exact** `state` strings that integration uses when it means “on” (check **Developer tools → States**). Example: a lock used as a signal might use `locked` / `unlocked` — you would add the one that means “active” for your setup.
- **Hebcal-only:** If you rely on Boiler Manager’s Hebcal cache and attributes and you **do not** set `holiday_entity` / `shabbat_entity`, you can leave the default; this field has **almost no effect** on detection (Hebcal windows still drive status from the integration).

### Import / Export (From Card UI)

- Open hamburger menu (`☰`) -> `Import/Export`
- Use mode buttons:
  - `merge` = add imported tasks to existing tasks
  - `replace` = remove existing tasks first, then import
- Click `Import` and pick a `.json` file
- Review task list popup and mark only the tasks you want to import
- Click `Export` to download a backup JSON
- Card export/import now preserves the full task payload (type, window/timeline fields, sunrise/sunset offsets, days/months, recurrence/date range, condition fields, and enabled state)

Import confirmation:
- `replace` mode shows in-card confirmation popup before execution
- Popup is custom-styled like the card and centered on desktop/mobile

#### Task Type: Time Window

- Select `Type = Time Window`
- Set `Start` and `End`:
  - Toggle `Use sunrise/sunset` on/off per field for cleaner mobile/desktop layout
  - Fixed time (`HH:MM`)
  - Or sun-based value: `sunrise`, `sunset`, `sunrise+30`, `sunset-45` (offset range `-120..+120` minutes)
- Optional: enable condition with the `Enable Condition` toggle, then set `Condition Entity` + `Skip If State`
  - `Condition Operator` supports text equality and numeric comparisons
  - `Skip If State` field now suggests common values automatically by selected entity domain
- Select days
- Select months
- Set recurrence via 3 buttons (`forever / once / range`)
- Save

#### Task Type: Timeline

- Select `Type = Timeline`
- Add one or more points
- For each point:
  - Toggle `Use sunrise/sunset` on/off per point to keep the row compact
  - choose time mode: fixed `HH:MM`, `sunrise`, or `sunset`
  - optional offset range: `-120..+120` minutes for sunrise/sunset
  - choose timer option from existing options (15m..)
- Optional: enable condition with the `Enable Condition` toggle, then set `Condition Entity` + `Skip If State`
  - `Condition Operator` supports text equality and numeric comparisons
  - `Skip If State` field now suggests common values automatically by selected entity domain
- Select days
- Select months
- Set recurrence via 3 buttons (`forever / once / range`)
- Save

### Manual OFF During Active Task

- Pressing `Off` while a schedule/timeline segment is currently active performs a **manual immediate off**
- The currently running segment is skipped until its natural end
- The task itself is **not** deleted or disabled
- The task resumes automatically on its **next scheduled event**

### Schedule vs Manual Timer Priority

- If a scheduled task becomes active while a manual timed run is in progress, schedule mode takes priority
- Manual timed state is canceled automatically so task logic controls ON/OFF behavior
- In card UI, legacy `timer` helper countdown is ignored/canceled while schedule mode is active

### Edit Existing Task

- In Tasks list click `Edit`
- Change fields
- Save

### Disable vs Delete

- `Enable/Disable` button:
  - Keeps the task in the system
  - Only toggles availability (`on`/`off`)
  - Use this when you want to pause a task without losing settings
- `Delete` button:
  - Removes task permanently
  - Removes the related task switch entity from registry

### Delete Task

- In Tasks list click `Delete`
- Task is removed permanently
- Task switch entity is removed from entity registry

### Duplicate Protection (Logical Validation)

- The card blocks saving when a task duplicates an existing task's schedule logic.
- A styled in-card popup shows which existing tasks conflict.
- Save is canceled until conflict is resolved.
- Validation is enforced both:
  - In frontend card UI (before save)
  - In backend integration manager (service/API level)

### Task Conditions (Skip Logic)

- Each task can include:
  - `condition_entity`
  - `condition_operator` (`eq`, `gt`, `lt`, `gte`, `lte`)
  - `skip_if_state`
- Runtime behavior:
  - During each scheduler tick, condition is checked before task activation.
  - For `condition_operator = eq`, if `condition_entity.state == skip_if_state` (case-insensitive), task is skipped.
  - For `condition_operator = gt/lt/gte/lte`, the condition compares numeric values.
  - If the condition entity is missing/unavailable, task is not blocked by this condition.
- Defaults:
  - If `condition_entity` is set and operator is `eq`, empty `skip_if_state` defaults to `on`.
  - Numeric operators require numeric `skip_if_state` values.
- UX:
  - Card suggests likely values for `skip_if_state` based on selected entity domain and selected operator.
  - Numeric entities (`sensor`, `number`, `input_number`) expose numeric operators in the card.
  - Current entity state and relevant attribute option lists are included in suggestions when available.
- Import/Export:
  - Condition fields are included in exported JSON.
  - Condition fields are restored on import (`merge` and `replace`).

### Immediate Activation On Save

- When you create or update a task, integration checks whether the task is already active **right now**.
- If task is currently inside its allowed window (time/day/month/date and condition passes), boiler turns on immediately.
- No need to wait for next scheduler tick.

### Task Order In List

- Tasks window uses a stable deterministic order to prevent row movement while toggling:
  - by `start_time`
  - then by task name
  - then by task id/entity id

## Sensor Display (Card Only)

- Sensor fields are configured in the card editor:
  - `temperature_sensor`, `power_sensor`, `current_sensor`, `voltage_sensor`
- If no sensors are configured, sensor UI is hidden completely.
- If configured, chips appear below the boiler visual.
- Chips row above the bar shows only:
  - `power_sensor` (consumption)
  - `current_sensor`
  - `voltage_sensor`
- `temperature_sensor` is used for heat-bar logic and is **not** shown in that chips row.
- Chips grid always keeps equal distribution for available sensors (`1/2/3` columns based on visible sensors).

## Temperature-Driven Heat Bar

When `temperature_sensor` is configured and has a live numeric state:
- Heat progress/color is driven by the **real sensor value**
- Timer-based progress logic is ignored

Color thresholds:
- Blue: up to `30°C`
- Orange: `30–52°C`
- Red: `52°C+`

Timer-driven color model:
- Uses a staged `blue -> orange -> red` gradient (no yellow stage).
- Color progress is duration-aware, so short and long timers transition at different visual pace while remaining believable.

Fallback:
- If no valid live temperature is available, card automatically falls back to timer-based heat calculation.

## Services

### Core Control

- `boiler_manager.turn_on_continuous`
- `boiler_manager.run_timed`
- `boiler_manager.turn_off`

### Task Management

- `boiler_manager.create_schedule`
- `boiler_manager.create_timeline`
- `boiler_manager.update_schedule`
- `boiler_manager.delete_schedule`
- `boiler_manager.export_tasks`
- `boiler_manager.import_tasks`
- `boiler_manager.set_vacation_mode`

### Hebcal cache

- `boiler_manager.refresh_hebcal` — forces a download and rewrite of `hebcal-<entry_id>.json` for the matching config entry. Optional **`hebcal_city`** updates the stored city for that entry (see Holidays & Shabbat above).

Example:

```yaml
service: boiler_manager.refresh_hebcal
data:
  boiler_entity: switch.boiler
```

Example (set city and refresh):

```yaml
service: boiler_manager.refresh_hebcal
data:
  entry_id: 01JABCDEFGH1234567890
  hebcal_city: IL-Tel_Aviv
```

### Task history log

- `boiler_manager.clear_task_history` — clears persisted task action history used by the Mode sensor attributes and the in-card history view (same `entry_id` / `boiler_entity` targeting as other services).

Example:

```yaml
service: boiler_manager.clear_task_history
data:
  boiler_entity: switch.boiler
```

### Vacation Mode example

```yaml
service: boiler_manager.set_vacation_mode
data:
  boiler_entity: switch.boiler
  vacation_mode: true
```

Vacation mode runtime behavior:
- Forces immediate OFF across supported entity types (`switch`/`light`/`climate`/`water_heater`) using compatible service calls.
- Prevents timed/continuous activation while vacation is enabled.
- Keeps card menu access enabled so users can exit vacation mode from mobile/desktop.

### export_tasks example

```yaml
service: boiler_manager.export_tasks
data:
  boiler_entity: switch.boiler
  file_path: /config/boiler_manager_backups/tasks_backup.json
```

### import_tasks example (merge)

```yaml
service: boiler_manager.import_tasks
data:
  boiler_entity: switch.boiler
  file_path: /config/boiler_manager_backups/tasks_backup.json
  mode: merge
```

### import_tasks example (replace)

```yaml
service: boiler_manager.import_tasks
data:
  boiler_entity: switch.boiler
  file_path: /config/boiler_manager_backups/tasks_backup.json
  mode: replace
```

### create_timeline example

```yaml
service: boiler_manager.create_timeline
data:
  boiler_entity: switch.boiler
  name: "Morning Timeline"
  timeline_points:
    - at: "06:00"
      duration_option: "30m"
      duration_minutes: 30
    - at: "sunset-30"
      duration_option: "180m"
      duration_minutes: 180
  days: [0, 1, 2, 3, 4]
  months: [1, 2, 3, 10, 11, 12]
  recurrence: "forever"
  condition_entity: input_boolean.skip_morning_boiler
  condition_operator: "eq"
  skip_if_state: "on"
  enabled: true
```

### create_schedule example (with condition)

```yaml
service: boiler_manager.create_schedule
data:
  boiler_entity: switch.boiler
  name: "Morning Window"
  start_time: "10:00"
  end_time: "12:00"
  days: [0, 1, 2, 3, 4]
  recurrence: "forever"
  condition_entity: input_boolean.skip_morning_boiler
  condition_operator: "eq"
  skip_if_state: "on"
  enabled: true
```

### update_schedule example (timeline edit)

```yaml
service: boiler_manager.update_schedule
data:
  task_id: a1b2c3d4e5
  task_type: "timeline"
  timeline_points:
    - at: "sunrise+20"
      duration_option: "45m"
      duration_minutes: 45
    - at: "11:00"
      duration_option: "120m"
      duration_minutes: 120
  days: [0, 1, 2, 3, 4]
  months: [1, 2, 3, 4, 5, 6]
  recurrence: "range"
  start_date: "2026-05-01"
  end_date: "2026-08-31"
  condition_entity: input_boolean.skip_morning_boiler
  condition_operator: "eq"
  skip_if_state: "on"
```

### create_schedule example (numeric condition)

```yaml
service: boiler_manager.create_schedule
data:
  boiler_entity: switch.boiler
  name: "Block when hot"
  start_time: "10:00"
  end_time: "12:00"
  days: [0, 1, 2, 3, 4]
  recurrence: "forever"
  condition_entity: sensor.boiler_temperature
  condition_operator: "gt"
  skip_if_state: "50"
  enabled: true
```

## Entity Behavior

- Each task is exposed as a `switch` entity
- Friendly name equals task name from UI
- Extra attributes include:
  - `task_type`
  - `days`, `months`, `recurrence`, `start_date`, `end_date`
  - `condition_entity`, `skip_if_state`
  - `condition_operator`
  - `timeline_points`, `timeline_label` for timeline tasks
  - `active_now`
- `active_now` represents the task being active by schedule window/timeline timing

## Timing Accuracy

- Scheduler runs every second (`SCHEDULER_INTERVAL = 1s`)
- This minimizes delay between planned event time and actual entity `turn_on/turn_off`
- Minor runtime jitter (system load/network) may still happen, but should be very small

## Restart Behavior

- Tasks are persisted and restored automatically after Home Assistant restart
- Manual timed run (`run_timed`) is restored:
  - If remaining time exists, countdown resumes and auto-off is rescheduled
  - If end time already passed during downtime, manual timed state is cleared on startup
- Manual continuous mode is restored and boiler stays ON until explicit OFF
- For timed runs, when the managed entity is a Switcher switch and `switcher_kis.turn_on_with_timer` is available,
  Boiler Manager uses native Switcher timer service (up to 150 minutes) to keep device-side remaining-time behavior aligned.

## Versioning & Changelog

- Tag `v0.1.6`:
  - Hebcal city from card, `refresh_hebcal` city option, task-modal mobile time controls, in-card guide updates, task history / `clear_task_history`, and related integration fixes.
- Integration manifest `0.1.6`:
  - Aligned with `v0.1.6` tag.

Recent highlights:
- `0.1.6`
  - **Hebcal city:** Card editor dropdown (`hebcal_city`) + `HEBCAL_GEO_CITY_IDS` in integration `const.py`; `refresh_hebcal` accepts optional `hebcal_city` (writes integration options, then refreshes JSON).
  - **Task modal (mobile):** `#schedule-modal` centered like desktop; time / timeline duration inputs use tighter `max-width` and padding only under `max-width: 760px` / `520px` without changing button grids.
  - **Guide:** In-card guide text documents city selection (card + integration).
  - **Task history:** Persisted history, user labels from UI where available, `boiler_manager.clear_task_history` service, and card history controls (per integration changes in this release).
- `0.1.5`
  - Hebcal: integration-backed local JSON cache (`hebcal_cache.py`), daily refresh, `boiler_manager.refresh_hebcal` service, integration strings/options.
  - Card: **Holidays & Shabbat** menu tab (policies, Hebcal scope, scrollable full window list, compact layout); card editor lists Hebcal/entry fields only (no duplicate policy fields).
  - Added generic regular-mode timer configuration (`timer_values`) with default `15,30,60`.
  - Dynamic quick-button row and timer grid layout now auto-adjust to configured timer count.
  - Added import task selection list screenshot/docs update for Import/Export flow.
  - Improved modal/tab/header behavior for mobile + RTL/LTR layouts (close button and controls consistency).
  - Vacation mode UX hardening: forced OFF + keep menu usable to disable vacation mode.
  - Safer service resolution when stale Switcher timed service is present in regular mode.
  - Added sunrise/sunset + offset support for timeline points (`at`) in frontend/backend/services/docs.
  - Added compact toggles in schedule UI:
    - per-time-field `Use sunrise/sunset`
    - per-timeline-point `Use sunrise/sunset`
    - `Enable Condition` toggle for condition block
  - Updated heating color model to `blue -> orange -> red` with duration-aware progression.
- `0.1.4`
  - Metadata/version alignment and documentation cleanup.
- `0.1.3`
  - Switcher adapter behavior for timed control paths.
  - Enabled full time-management workflow in Switcher mode when Boiler Manager services are available.

## Troubleshooting

- If new UI changes are not visible:
  - Hard refresh browser: `Ctrl/Cmd + Shift + R`
- On mobile app/webview:
  - Close and reopen dashboard view after update (to clear frontend cache)
- If services are missing:
  - Restart Home Assistant
- If card says missing entities:
  - Verify integration loaded successfully in `Settings -> Devices & Services`
- If you changed frontend JS manually:
  - Ensure latest file exists at `/config/www/boiler-card/boiler-card.js`
- If popup buttons are not clickable on mobile:
  - Make sure you run the latest `boiler-card.js` from this repo (includes Safari/Chrome touch fixes)

## Legacy Package Mode (Optional)

Legacy package setup still exists in:
- `home-assistant/packages/boiler_hot_water.yaml`

Use built-in integration mode for new installs.
