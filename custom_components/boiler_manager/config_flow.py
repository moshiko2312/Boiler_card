"""Config flow for Boiler Manager integration."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.helpers import config_validation as cv

from .const import (
    CONF_BOILER_ENTITY,
    CONF_CURRENT_SENSOR,
    CONF_NAME,
    CONF_POWER_SENSOR,
    CONF_TEMPERATURE_SENSOR,
    DEFAULT_NAME,
    DOMAIN,
)


class BoilerManagerConfigFlow(config_entries.ConfigFlow):
    """Handle Boiler Manager config flow."""

    VERSION = 1
    domain = DOMAIN

    async def async_step_user(self, user_input: dict[str, Any] | None = None):
        """Handle initial setup step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            self._async_abort_entries_match({CONF_BOILER_ENTITY: user_input[CONF_BOILER_ENTITY]})

            title = str(user_input.get(CONF_NAME) or DEFAULT_NAME)
            return self.async_create_entry(title=title, data=user_input)

        schema = vol.Schema(
            {
                vol.Required(CONF_NAME, default=DEFAULT_NAME): cv.string,
                vol.Required(CONF_BOILER_ENTITY): cv.entity_id,
                vol.Optional(CONF_TEMPERATURE_SENSOR): cv.entity_id,
                vol.Optional(CONF_POWER_SENSOR): cv.entity_id,
                vol.Optional(CONF_CURRENT_SENSOR): cv.entity_id,
            }
        )

        return self.async_show_form(step_id="user", data_schema=schema, errors=errors)

    @staticmethod
    def async_get_options_flow(config_entry: config_entries.ConfigEntry):
        """Create options flow."""
        return BoilerManagerOptionsFlow(config_entry)


class BoilerManagerOptionsFlow(config_entries.OptionsFlow):
    """Handle options for Boiler Manager."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        self._config_entry = config_entry

    async def async_step_init(self, user_input: dict[str, Any] | None = None):
        """Manage options step."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        current = {**self._config_entry.data, **self._config_entry.options}
        base_schema = vol.Schema(
            {
                vol.Required(CONF_NAME, default=DEFAULT_NAME): cv.string,
                vol.Required(CONF_BOILER_ENTITY): cv.entity_id,
                vol.Optional(CONF_TEMPERATURE_SENSOR): cv.entity_id,
                vol.Optional(CONF_POWER_SENSOR): cv.entity_id,
                vol.Optional(CONF_CURRENT_SENSOR): cv.entity_id,
            }
        )
        # Compatibility fallback for older HA versions.
        if hasattr(self, "add_suggested_values_to_schema"):
            schema = self.add_suggested_values_to_schema(base_schema, current)
        else:
            schema = base_schema

        return self.async_show_form(step_id="init", data_schema=schema)
