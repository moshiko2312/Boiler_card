"""Pure helpers for multi-target tasks.

No Home Assistant imports on purpose: this module is unit-tested with the
standard library (``py -m unittest tests.test_targets``).

Conventions:
- A task stores ``target_entities`` as a list of entity ids. An empty list means
  "the entry's main boiler entity only" (backward compatible with tasks that
  predate multi-target support).
- ``selectable`` targets are the main entity followed by the entry's
  ``allowed_entities`` option.
"""

from __future__ import annotations

from typing import Iterable


def normalize_target_entities(value, *, main_entity: str) -> list[str]:
    """Validate/dedupe a target list. Returns [] when it is just the main entity."""
    if value is None:
        return []
    if isinstance(value, str):
        value = [value]
    if not isinstance(value, (list, tuple, set)):
        raise ValueError("target_entities must be a list of entity ids")

    normalized: list[str] = []
    for item in value:
        text = str(item or "").strip()
        if not text:
            continue
        if "." not in text:
            raise ValueError(f"Invalid target entity id: {item}")
        if text not in normalized:
            normalized.append(text)

    if normalized == [main_entity]:
        return []
    return normalized


def effective_targets(target_entities: list[str] | None, main_entity: str) -> list[str]:
    """Entities a task actually controls."""
    if target_entities:
        return list(target_entities)
    return [main_entity] if main_entity else []


def selectable_targets(main_entity: str, allowed_entities: Iterable[str] | None) -> list[str]:
    """Main entity first, then the allowed extras, deduped."""
    result: list[str] = [main_entity] if main_entity else []
    for item in allowed_entities or []:
        text = str(item or "").strip()
        if text and text not in result:
            result.append(text)
    return result


def validate_targets_allowed(target_entities: Iterable[str], selectable: Iterable[str]) -> None:
    """Raise ValueError naming any target that is not selectable for this entry."""
    allowed = set(selectable)
    rejected = [entity for entity in target_entities if entity not in allowed]
    if rejected:
        raise ValueError(
            "Target entities not allowed for this entry: "
            + ", ".join(rejected)
            + ". Add them under the integration's 'Allowed task entities' option."
        )


def active_targets_map(
    active_tasks: Iterable[tuple[str, list[str]]],
    main_entity: str,
) -> dict[str, set[str]]:
    """Map entity id -> ids of active tasks that target it."""
    result: dict[str, set[str]] = {}
    for task_id, target_entities in active_tasks:
        for entity_id in effective_targets(target_entities, main_entity):
            result.setdefault(entity_id, set()).add(task_id)
    return result


def secondary_transitions(
    *,
    previous_driven: set[str],
    active_targets: set[str],
    main_entity: str,
) -> tuple[list[str], list[str], set[str]]:
    """Decide what to do with non-main entities.

    Returns (turn_on, turn_off, now_driven). Entities currently targeted by an
    active task are (re)asserted on, like the main entity; entities we turned on
    earlier that are no longer targeted are turned off. The main entity is never
    included: it keeps the manual/timed/continuous logic of the manager.
    """
    secondaries_active = {entity for entity in active_targets if entity and entity != main_entity}
    turn_on = sorted(secondaries_active)
    turn_off = sorted(entity for entity in previous_driven if entity not in secondaries_active and entity != main_entity)
    return turn_on, turn_off, secondaries_active
