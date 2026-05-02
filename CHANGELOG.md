# Changelog

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
