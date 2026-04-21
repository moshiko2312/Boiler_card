# Boiler Water Card (Home Assistant)

Custom Lovelace card for a hot-water boiler with:
- `Turn On` and `Turn Off` buttons
- Center popup timer picker with grid options from 15 minutes to 4 hours (15-minute steps)
- Selecting a timer from the popup starts heating immediately and resets countdown automatically
- Dynamic boiler heating icon with deep modern colors (blue → orange → red) based on timer progress
- `No Timer` mode
- Server-side auto shutoff for safety
- Support for `switch`, `light`, and other entities that can be controlled via service calls
- Mobile-first responsive layout for both card and popup timer sheet

## Project Structure

- `www/boiler-card/boiler-card.js` - custom card frontend
- `home-assistant/packages/boiler_hot_water.yaml` - helpers/scripts/automations
- `lovelace/boiler-card-example.yaml` - ready card configuration

## Install

1. Copy frontend file:
   - source: `www/boiler-card/boiler-card.js`
   - destination: `/config/www/boiler-card/boiler-card.js`

2. Copy package file:
   - source: `home-assistant/packages/boiler_hot_water.yaml`
   - destination: `/config/packages/boiler_hot_water.yaml`

3. Ensure packages are enabled in `configuration.yaml`:

```yaml
homeassistant:
  packages: !include_dir_named packages
```

4. Add Lovelace resource:
   - URL: `/local/boiler-card/boiler-card.js?v=1`
   - Type: `JavaScript Module`

5. Restart Home Assistant.

## Add Card

Use the example from `lovelace/boiler-card-example.yaml` or paste this:

```yaml
type: custom:boiler-water-card
title: דוד מים חמים / Boiler
boiler_entity: switch.boiler
duration_entity: input_select.boiler_duration
timer_entity: timer.boiler_runtime
script_on_timed: script.boiler_turn_on_timed
script_on_continuous: script.boiler_turn_on_continuous
script_off: script.boiler_turn_off
```

Built-in integration mode (no script entities required):

```yaml
type: custom:boiler-water-card
title: דוד מים חמים / Boiler
boiler_entity: switch.boiler
service_run_timed: boiler_manager.run_timed
service_on_continuous: boiler_manager.turn_on_continuous
service_off: boiler_manager.turn_off
# Optional when you have multiple Boiler Manager entries:
# integration_entry_id: 01JABCDEFGH1234567890
```

## Advanced Entity Support

The card supports advanced on/off service parameters, useful for `light` entities and beyond:

```yaml
type: custom:boiler-water-card
title: Boiler Light Example
boiler_entity: light.boiler_indicator
duration_entity: input_select.boiler_duration
timer_entity: timer.boiler_runtime
script_on_timed: script.boiler_turn_on_timed
script_on_continuous: script.boiler_turn_on_continuous
script_off: script.boiler_turn_off
turn_on_action: homeassistant.turn_on
turn_off_action: homeassistant.turn_off
turn_on_data:
  brightness_pct: 100
  transition: 1
  color_temp_kelvin: 4000
turn_off_data:
  transition: 1
state_on_values:
  - "on"
state_off_values:
  - "off"
  - "idle"
  - "standby"
  - "unavailable"
  - "unknown"
```

Available advanced fields:
- `turn_on_action`: any Home Assistant service (default: `homeassistant.turn_on`)
- `turn_off_action`: any Home Assistant service (default: `homeassistant.turn_off`)
- `turn_on_data`: full service-data payload passed as-is to the turn-on action
- `turn_off_data`: full service-data payload passed as-is to the turn-off action
- `state_on_values`: states treated as ON in card UI
- `state_off_values`: states treated as OFF in card UI

For non-standard entity domains, set `state_on_values`/`state_off_values` explicitly to match your entity states.

## Important

- The package includes `input_text.boiler_switch_entity` (default target) and `input_text.boiler_active_entity` (runtime target).
- Set `input_text.boiler_switch_entity` to your real boiler entity (example: `switch.shelly_boiler`) if you do not use `switch.boiler`.
- The card passes `boiler_entity`, `turn_on_action`, `turn_off_action`, `turn_on_data`, and `turn_off_data` to scripts.
- Timer helper is configured with `restore: true`, so after Home Assistant restart it resumes from the saved remaining time.
- If entities do not exist yet, import the package file first and restart HA.
- Auto shutoff is handled by automation `boiler_turn_off_on_timer_finished`.

## Custom Component (Built-In Scheduler)

New integration files are under:
- `custom_components/boiler_manager/`

This integration moves control logic into Home Assistant (no package scripts required):
- Built-in services: `boiler_manager.turn_on_continuous`, `boiler_manager.run_timed`, `boiler_manager.turn_off`
- Built-in recurring schedules (`from` -> `to` + selected days)
- Every created schedule appears as a `switch` entity
- Deleting a schedule removes its switch entity
- Optional mirror sensors for temperature / power / current

### Install Integration

1. Copy folder:
   - source: `custom_components/boiler_manager`
   - destination: `/config/custom_components/boiler_manager`
2. Restart Home Assistant
3. Add integration: `Settings -> Devices & Services -> Add Integration -> Boiler Manager`
4. Configure:
   - boiler entity (`switch.*` / `light.*`)
   - optional sensor entities (`sensor.*`) for temperature / power / current

When the integration loads, it automatically installs/updates the card file at:
- `/config/www/boiler-card/boiler-card.js`

### Schedule Services

Create schedule task:

```yaml
service: boiler_manager.create_schedule
data:
  name: Morning Heat
  start_time: "10:00"
  end_time: "12:00"
  days: [0, 1, 2, 3, 4]
  enabled: true
```

Delete schedule task:

```yaml
service: boiler_manager.delete_schedule
data:
  task_id: a1b2c3d4e5
```

Update schedule task:

```yaml
service: boiler_manager.update_schedule
data:
  task_id: a1b2c3d4e5
  start_time: "09:30"
  end_time: "11:30"
  days: [0, 2, 4]
```
