# Boiler Card + Boiler Manager (Home Assistant)

Custom boiler control solution for Home Assistant with:
- Lovelace custom card (`boiler-water-card`)
- Built-in custom integration (`boiler_manager`)
- Timer control, recurring tasks, and timeline tasks
- Task entities as real `switch` entities
- Optional card sensors (temperature / current / voltage)
- Mobile-friendly popups (Safari + Chrome)
- In-card task backup/restore (Import/Export)
- Per-task conditional execution by external entity state

## What You Get

- Quick buttons: `15 / 30 / 60 / Off`
- Timer popup from hamburger menu
- Tasks popup from same hamburger menu
- Create, edit, enable/disable, and delete tasks from card UI
- Import/Export tasks directly from Tasks view in hamburger popup
  - Import mode buttons: `merge` / `replace`
- Per-task condition in card UI:
  - `Condition Entity` (for example `input_boolean.some_flag`)
  - `Skip If State` (for example `on`)
- Sensor chips shown only when configured in the card
- Custom display name per sensor in card editor
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
- Scheduler tick every second for near-immediate start/stop transitions
- Mobile-first schedule/task modals:
  - touch-friendly controls
  - no horizontal scrolling
  - centered/stable dialogs for Safari + Chrome

## Project Structure

- `www/boiler-card/boiler-card.js` - source frontend card
- `custom_components/boiler_manager/` - integration
- `lovelace/boiler-card-example.yaml` - example card config
- `home-assistant/packages/boiler_hot_water.yaml` - optional legacy package flow

## Installation

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

### 2) Frontend Card File

On integration startup, card assets are auto-copied to:
- `/config/www/boiler-card/boiler-card.js`

### 3) Lovelace Resource Registration (Automatic + Safe)

On integration startup, Boiler Manager also tries to auto-register this resource:
- `/local/boiler-card/boiler-card.js` (`module`)

Behavior:
- Adds the card resource only if missing
- Updates only this card resource entry if needed
- Does **not** remove or overwrite unrelated existing resources

Notes:
- Works with Lovelace Storage mode (`.storage/lovelace_resources`)
- If your dashboard/resources are YAML-managed, add resource manually

Manual fallback (if auto registration is blocked/fails):
- `Settings -> Dashboards -> Resources -> Add Resource`
- URL: `/local/boiler-card/boiler-card.js`
- Type: `JavaScript Module`

### 4) Add Card

```yaml
type: custom:boiler-water-card
title: דוד מים חמים
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

# Optional card sensors (card-only configuration)
temperature_sensor: sensor.boiler_temperature
temperature_sensor_name: טמפרטורת דוד
current_sensor: sensor.boiler_current
current_sensor_name: זרם נוכחי
voltage_sensor: sensor.boiler_voltage
voltage_sensor_name: מתח קו
```

Notes:
- `integration_entry_id` is optional if you have only one Boiler Manager entry.
- The card can also run in script mode (legacy), but built-in integration mode is recommended.

## Card Usage Guide

### Quick Daily Flow

1. Open hamburger menu (`☰`)
2. Choose `Timer` for immediate heat, or `Tasks` for automation
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

- Open hamburger menu (`☰`) -> `Tasks`
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
- Select days
- Select months
- Set recurrence via 3 buttons (`forever / once / range`)
- Save

### Manual OFF During Active Task

- Pressing `Off` while a schedule/timeline segment is currently active performs a **manual immediate off**
- The currently running segment is skipped until its natural end
- The task itself is **not** deleted or disabled
- The task resumes automatically on its **next scheduled event**

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
  - `skip_if_state`
- Runtime behavior:
  - During each scheduler tick, condition is checked before task activation.
  - If `condition_entity.state == skip_if_state` (case-insensitive), the task is skipped for that check cycle.
  - If the condition entity is missing/unavailable, task is not blocked by this condition.
- Defaults:
  - If `condition_entity` is set and `skip_if_state` is empty, backend defaults `skip_if_state` to `on`.
- Import/Export:
  - Condition fields are included in exported JSON.
  - Condition fields are restored on import (`merge` and `replace`).

### Task Order In List

- Tasks window always sorts by the next real execution time
- The closest upcoming task is first
- Tasks with no upcoming execution (for now) are pushed lower

## Sensor Display (Card Only)

- Sensor fields are configured in the card editor:
  - `temperature_sensor`, `current_sensor`, `voltage_sensor`
  - Optional custom names:
    - `temperature_sensor_name`
    - `current_sensor_name`
    - `voltage_sensor_name`
- If no sensors are configured, sensor UI is hidden completely.
- If configured, chips appear below the boiler visual.

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
  skip_if_state: "on"
```

## Entity Behavior

- Each task is exposed as a `switch` entity
- Friendly name equals task name from UI
- Extra attributes include:
  - `task_type`
  - `days`, `months`, `recurrence`, `start_date`, `end_date`
  - `condition_entity`, `skip_if_state`
  - `timeline_points`, `timeline_label` for timeline tasks
  - `active_now`
- `active_now` represents the task being active by schedule window/timeline timing

## Timing Accuracy

- Scheduler runs every second (`SCHEDULER_INTERVAL = 1s`)
- This minimizes delay between planned event time and actual entity `turn_on/turn_off`
- Minor runtime jitter (system load/network) may still happen, but should be very small

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
