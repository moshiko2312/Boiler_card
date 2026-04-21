# Boiler Water Card (Home Assistant)

Custom Lovelace card for a hot-water boiler with:
- `Turn On` and `Turn Off` buttons
- Center popup timer picker with grid options from 15 minutes to 4 hours (15-minute steps)
- Selecting a timer from the popup starts heating immediately and resets countdown automatically
- Dynamic boiler heating icon with deep modern colors (blue → orange → red) based on timer progress
- `No Timer` mode
- Server-side auto shutoff for safety
- Support for `switch`, `light`, and other entities that can be controlled via service calls

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
- If entities do not exist yet, import the package file first and restart HA.
- Auto shutoff is handled by automation `boiler_turn_off_on_timer_finished`.
