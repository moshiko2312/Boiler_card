# Boiler Water Card (Home Assistant)

Custom Lovelace card for a hot-water boiler with:
- `Turn On` and `Turn Off` buttons
- Timer dropdown from 15 minutes to 4 hours (15-minute steps)
- `No Timer` mode
- Server-side auto shutoff for safety

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

## Important

- Replace `switch.boiler` with your real boiler switch entity if needed.
- If entities do not exist yet, import the package file first and restart HA.
- Auto shutoff is handled by automation `boiler_turn_off_on_timer_finished`.
