# Boiler Card + Boiler Manager (Home Assistant)

Custom boiler control solution for Home Assistant with:
- Lovelace custom card (`boiler-water-card`)
- Built-in custom integration (`boiler_manager`)
- No required Home Assistant package/scripts/timer helpers for normal install (integration-first flow)
- Timer control, recurring tasks, and timeline tasks
- Task entities as real `switch` entities
- Optional card sensors (temperature / power / current / voltage)
- Mobile-friendly popups (Safari + Chrome)
- In-card task backup/restore (Import/Export)
- Per-task conditional execution by external entity state (including numeric operators)
- Card editor auto-fills `boiler_entity` from Boiler Manager integration when a single matching entry is detected
- `Switcher mode` support with adapter behavior:
  - Uses `boiler_manager` timed/continuous/off services when available
  - Falls back to native `switcher_kis.turn_on_with_timer` / `homeassistant.turn_on` / `homeassistant.turn_off` when needed
- Card UI languages: `he` / `en` / `ru` / `fr`

## What You Get

- Quick buttons: `15 / 30 / 60 / Off`
- Timer popup from hamburger menu
- Tasks popup from same hamburger menu
- Separate `Import/Export` tab in the same menu
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
- Tasks list sorted by the **next upcoming event** (chronological order)
- Active task notice in card with current task end time
- Vacation mode toggle directly in Tasks tab
- Scheduler tick every second for near-immediate start/stop transitions
- Runtime state restore on Home Assistant restart (active manual timed/continuous sessions are recovered)
- Mobile-first schedule/task modals:
  - touch-friendly controls
  - no horizontal scrolling
  - centered/stable dialogs for Safari + Chrome
  - sticky top toolbar in mobile tasks view
  - timer page arrows hidden in tasks mode (list-only mode)

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

- Purpose: task backup and restore operations.
- Mode buttons:
  - `Merge`: append imported tasks to existing tasks.
  - `Replace`: clear existing tasks before import.
- Action buttons:
  - `Import`: upload JSON backup.
  - `Export`: download current task set as JSON.
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
  - Temperature sensor
  - Power sensor (`W`)
  - Current sensor
  - Voltage sensor
  - Flow image URL/path
- Right-side preview:
  - Real-time visual feedback while editing.

## Project Structure

- `www/boiler-card/boiler-card.js` - source frontend card
- `custom_components/boiler_manager/` - integration
- `lovelace/boiler-card-example.yaml` - example card config
- `home-assistant/packages/boiler_hot_water.yaml` - optional legacy package flow

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

# Optional card sensors (card-only configuration)
temperature_sensor: sensor.boiler_temperature
power_sensor: sensor.boiler_power
current_sensor: sensor.boiler_current
voltage_sensor: sensor.boiler_voltage
```

Notes:
- `integration_entry_id` is optional if you have only one Boiler Manager entry.
- Built-in integration mode is the supported/default runtime path.

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

### Tasks Mode

- Open hamburger menu (`☰`)
- Choose `Tasks`
- Click `Add`

### Import / Export (From Card UI)

- Open hamburger menu (`☰`) -> `Import/Export`
- Use mode buttons:
  - `merge` = add imported tasks to existing tasks
  - `replace` = remove existing tasks first, then import
- Click `Import` and pick a `.json` file
- Click `Export` to download a backup JSON

Import confirmation:
- `replace` mode shows in-card confirmation popup before execution
- Popup is custom-styled like the card and centered on desktop/mobile

#### Task Type: Time Window

- Select `Type = Time Window`
- Set `Start` and `End`
- Optional: set `Condition Entity` + `Skip If State`
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
  - choose time (`HH:MM`)
  - choose timer option from existing options (15m..)
- Optional: set `Condition Entity` + `Skip If State`
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

- Tasks window always sorts by the next real execution time
- The closest upcoming task is first
- Tasks with no upcoming execution (for now) are pushed lower

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
- Yellow: `30–40°C`
- Orange: `40–50°C`
- Red: `50°C+`

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

### Vacation Mode example

```yaml
service: boiler_manager.set_vacation_mode
data:
  boiler_entity: switch.boiler
  vacation_mode: true
```

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
    - at: "10:00"
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
    - at: "07:00"
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

- Tag `v0.1.4`:
  - GitHub release tag for Switcher adapter + docs update stream.
- Integration manifest `0.1.4`:
  - Aligned with `v0.1.4` tag.

Recent highlights:
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
