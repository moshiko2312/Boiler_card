# Boiler Card + Boiler Manager (Home Assistant)

Custom boiler control solution for Home Assistant with:
- Lovelace custom card (`boiler-water-card`)
- Built-in custom integration (`boiler_manager`)
- Timer control, recurring tasks, and timeline tasks
- Task entities as real `switch` entities
- Optional sensor mirror support (temperature / power / current)

## What You Get

- Quick buttons: `15 / 30 / 60 / Off`
- Timer popup from hamburger menu
- Tasks popup from same hamburger menu
- Create, edit, enable/disable, and delete tasks from card UI
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
- Optional sensors:
  - temperature sensor
  - power sensor
  - current sensor

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
```

Notes:
- `integration_entry_id` is optional if you have only one Boiler Manager entry.
- The card can also run in script mode (legacy), but built-in integration mode is recommended.

## Card Usage Guide

### Timer Mode

- Open hamburger menu (`☰`)
- Choose `Timer`
- Pick duration option
- Boiler starts immediately via integration service
- If a schedule/timeline is currently active, timed buttons are blocked until that active segment ends

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

## Troubleshooting

- If new UI changes are not visible:
  - Hard refresh browser: `Ctrl/Cmd + Shift + R`
- If services are missing:
  - Restart Home Assistant
- If card says missing entities:
  - Verify integration loaded successfully in `Settings -> Devices & Services`
- If you changed frontend JS manually:
  - Ensure latest file exists at `/config/www/boiler-card/boiler-card.js`

## Legacy Package Mode (Optional)

Legacy package setup still exists in:
- `home-assistant/packages/boiler_hot_water.yaml`

Use built-in integration mode for new installs.
