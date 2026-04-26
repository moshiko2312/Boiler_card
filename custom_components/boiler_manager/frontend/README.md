# Boiler Card Frontend Modules

This folder contains the Lovelace frontend source for `boiler-water-card`.

## Module layout

- `boiler-card.js`  
  Main card runtime (render/update flow, services, task/timer behavior, event wiring).
- `boiler-shell.js`  
  Static card shell template (large HTML/CSS markup used by the runtime render step).
- `boiler-task-export.js`  
  Task export normalization/mapping helpers used by runtime export flow.
- `boiler-timer-paging.js`  
  Timer modal pagination helpers (page count/index calculations).
- `boiler-holiday-rules.js`  
  Holiday/Shabbat policy normalization and rule-evaluation helpers.
- `boiler-heat-utils.js`  
  Heating/temperature calculation helpers shared by runtime visual logic.
- `boiler-import-display.js`  
  Import modal task title/subtitle display helpers.
- `boiler-time-utils.js`  
  Shared time parsing/formatting and timer option conversion helpers.
- `boiler-schedule-days.js`  
  Day-order and localized schedule-days formatting helpers.
- `boiler-entity-search.js`  
  Condition-entity list and query matching helpers for editor autocomplete.
- `boiler-task-display.js`  
  Task list meta-text and history timestamp formatting helpers.
- `boiler-history-utils.js`  
  History rows normalization and export payload helpers.
- `boiler-service-utils.js`  
  Service reference validation/availability and guarded service-call helpers.
- `boiler-control-services.js`  
  Control-service resolution and base payload helpers for switcher/manager modes.
- `boiler-entity-state-utils.js`  
  Config-driven entity on/off state normalization helpers.
- `boiler-editor.js`  
  Card editor registration and editor UI/logic (`boiler-water-card-editor`).
- `boiler-i18n.js`  
  Translation dictionaries and supported language list.
- `boiler-themes.js`  
  Card theme normalization and shared theme CSS blocks.
- `boiler-config.js`  
  Frontend constants such as default card config and Hebcal city metadata.
- `boiler-flow.png`, `switcher-touch.png`, `boiler-smarthome4u.png`  
  UI image assets used in editor/profile visuals.

## Sync behavior

On integration startup, files from this folder are copied to:

- `/config/www/boiler-card/`

The mirrored files under `www/boiler-card/` are committed in this repo for consistency,
but `custom_components/boiler_manager/frontend/` is the source of truth.

## Editing guidelines

- Keep module boundaries clear (runtime vs shell template vs editor vs i18n/themes/config).
- When adding new user-facing text, update `boiler-i18n.js` (all supported languages).
- When adding new visual themes, implement in `boiler-themes.js` and expose through editor labels.
- Keep `tasks-vacation-btn` state styling consistent: default theme uses high-contrast dark text for active state, and dark-glass uses blue active/focus styling only when active.
- After frontend changes, verify that mirrored files in `www/boiler-card/` are in sync.
