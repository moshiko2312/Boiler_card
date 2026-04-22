# Boiler Card + Boiler Manager (Home Assistant)

Custom boiler control solution for Home Assistant with:
- Lovelace custom card (`boiler-water-card`)
- Built-in custom integration (`boiler_manager`)
- Timer control, recurring tasks, and timeline tasks
- Task entities as real `switch` entities
- Optional card sensors (temperature / current / voltage)
- Mobile-friendly popups (Safari + Chrome)

## What You Get

- Quick buttons: `15 / 30 / 60 / Off`
- Timer popup from hamburger menu
- Tasks popup from same hamburger menu
- Create, edit, enable/disable, and delete tasks from card UI
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

Important:
- This copy step does **not** modify Lovelace Resources list.
- It only updates files inside `/config/www/boiler-card`.

### 3) Add Lovelace Resource (once)

`Settings -> Dashboards -> Resources -> Add Resource`

- URL: `/local/boiler-card/boiler-card.js?v=1`
- Type: `JavaScript Module`

If already exists, do not add again.

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

#### Task Type: Time Window

- Select `Type = Time Window`
- Set `Start` and `End`
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

### Delete Task

- In Tasks list click `Delete`
- Task is removed permanently
- Task switch entity is removed from entity registry

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
```

## Entity Behavior

- Each task is exposed as a `switch` entity
- Friendly name equals task name from UI
- Extra attributes include:
  - `task_type`
  - `days`, `months`, `recurrence`, `start_date`, `end_date`
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
