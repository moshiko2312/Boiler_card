"""Download Hebcal calendar JSON and write a normalized local cache for the Lovelace card."""

from __future__ import annotations

import json
import logging
from datetime import date, datetime, time, timedelta
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

import asyncio

from aiohttp import ClientError, ClientTimeout

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.util import dt as dt_util

from .const import CONF_HEBCAL_CITY, DEFAULT_HEBCAL_CITY

_LOGGER = logging.getLogger(__name__)

HEBCAL_URL_TEMPLATE = (
    "https://www.hebcal.com/hebcal?cfg=json&v=1&year=now&maj=on&min=on&mod=on&nx=on&ss=on&mf=on&c=on&geo=city&city={city}"
)


def hebcal_cache_filename(entry_id: str) -> str:
    """Public cache filename under www/boiler-card (matches card default URL)."""
    return f"hebcal-{entry_id}.json"


def hebcal_cache_path(hass: HomeAssistant, entry_id: str) -> Path:
    """Absolute path to the cache file for a config entry."""
    return Path(hass.config.path("www", "boiler-card", hebcal_cache_filename(entry_id)))


def _parse_event_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    text = str(value).strip()
    if not text:
        return None
    if "T" in text:
        try:
            return datetime.fromisoformat(text.replace("Z", "+00:00"))
        except ValueError:
            return None
    try:
        parsed = date.fromisoformat(text.split("T", 1)[0])
    except ValueError:
        return None
    return datetime.combine(parsed, time.min, tzinfo=ZoneInfo("UTC"))


def _resolve_zone(tzid: str | None) -> ZoneInfo:
    candidate = (tzid or "").strip() or "Asia/Jerusalem"
    try:
        return ZoneInfo(candidate)
    except Exception:  # noqa: BLE001
        try:
            return ZoneInfo("Asia/Jerusalem")
        except Exception:  # noqa: BLE001
            return ZoneInfo("UTC")


MAX_PROHIBITED_PERIOD_DAYS = 4


def _build_windows(items: list[dict[str, Any]], tzid: str | None) -> list[dict[str, Any]]:
    """Normalize Hebcal items into windows.

    * Timed windows: candle lighting -> the next havdalah. Candle lightings that
      fall while a window is already open (second Yom Tov day, Shabbat running
      into Yom Tov) do not start a new window, so a two-day Yom Tov never pairs
      with the havdalah of the following week. A window that contains a Yom Tov
      day is ``kind: holiday`` with ``work_prohibited``; otherwise it is Shabbat.
    * All-day windows (``all_day: true``, local midnight to midnight): holidays
      without candle lighting (Erev, Chol HaMoed, Chanukah, ...). A Yom Tov day
      that has no candle/havdalah data in the feed also falls back to this.
    """
    tz = _resolve_zone(tzid)
    events: list[tuple[datetime, str, dict[str, Any]]] = []
    holidays: list[tuple[date, dict[str, Any]]] = []

    for item in items:
        if not isinstance(item, dict):
            continue
        category = str(item.get("category") or "").lower()
        raw_date = item.get("date")
        if raw_date is None:
            continue
        ds = str(raw_date)
        if category in ("candles", "havdalah") and "T" in ds:
            dt = _parse_event_datetime(ds)
            if dt is not None:
                events.append((dt, category, item))
        elif category == "holiday" and "T" not in ds:
            try:
                d = date.fromisoformat(ds.split("T", 1)[0])
            except ValueError:
                continue
            holidays.append((d, item))

    events.sort(key=lambda entry: entry[0])
    yomtov_by_date = {d: item for d, item in holidays if item.get("yomtov")}

    windows: list[dict[str, Any]] = []
    covered_yomtov: set[date] = set()
    open_candle: tuple[datetime, dict[str, Any]] | None = None

    for event_time, category, item in events:
        if category == "candles":
            if open_candle is None:
                open_candle = (event_time, item)
            continue
        if open_candle is None:
            continue
        start_time, candle_item = open_candle
        open_candle = None
        if event_time <= start_time or (event_time - start_time) > timedelta(days=MAX_PROHIBITED_PERIOD_DAYS):
            _LOGGER.debug("Skipping implausible Hebcal period %s -> %s", start_time, event_time)
            continue
        start_local = start_time.astimezone(tz)
        end_local = event_time.astimezone(tz)
        yomtov_items: list[dict[str, Any]] = []
        day = start_local.date()
        while day <= end_local.date():
            if day in yomtov_by_date:
                yomtov_items.append(yomtov_by_date[day])
                covered_yomtov.add(day)
            day += timedelta(days=1)
        if yomtov_items:
            first = yomtov_items[0]
            windows.append(
                {
                    "kind": "holiday",
                    "starts_at": start_local.isoformat(),
                    "ends_at": end_local.isoformat(),
                    "label": str(first.get("title") or ""),
                    "hebrew": first.get("hebrew"),
                    "work_prohibited": True,
                }
            )
        else:
            label = str(
                candle_item.get("memo")
                or candle_item.get("title_orig")
                or candle_item.get("title")
                or "Shabbat",
            )
            windows.append(
                {
                    "kind": "shabbat",
                    "starts_at": start_local.isoformat(),
                    "ends_at": end_local.isoformat(),
                    "label": label,
                    "hebrew": candle_item.get("hebrew"),
                }
            )

    for d, item in holidays:
        is_yomtov = bool(item.get("yomtov"))
        if not is_yomtov and str(item.get("subcat") or "").lower() != "major":
            continue
        if is_yomtov and d in covered_yomtov:
            continue
        start_local = datetime.combine(d, time.min, tzinfo=tz)
        end_local = start_local + timedelta(days=1)
        windows.append(
            {
                "kind": "holiday",
                "starts_at": start_local.isoformat(),
                "ends_at": end_local.isoformat(),
                "label": str(item.get("title") or ""),
                "hebrew": item.get("hebrew"),
                "work_prohibited": is_yomtov,
                "all_day": True,
            }
        )

    windows.sort(key=lambda w: w.get("starts_at") or "")
    return windows


def _atomic_write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    data = json.dumps(payload, ensure_ascii=False, indent=2)
    tmp.write_text(data, encoding="utf-8")
    tmp.replace(path)


async def async_ensure_hebcal_cache_file(
    hass: HomeAssistant,
    entry: ConfigEntry,
    *,
    city: str | None = None,
) -> bool:
    """Ensure a local Hebcal cache JSON exists for this entry.

    Creates a minimal placeholder file when missing, so the card always has a
    predictable local JSON path even before first successful remote refresh.
    """
    target = hebcal_cache_path(hass, entry.entry_id)
    if target.exists():
        return True

    resolved_city = (city or "").strip() or str(
        entry.options.get(CONF_HEBCAL_CITY)
        or entry.data.get(CONF_HEBCAL_CITY)
        or DEFAULT_HEBCAL_CITY,
    ).strip() or DEFAULT_HEBCAL_CITY
    url = HEBCAL_URL_TEMPLATE.format(city=resolved_city)
    payload: dict[str, Any] = {
        "schema_version": 2,
        "fetched_at": dt_util.utcnow().isoformat(),
        "timezone": "Asia/Jerusalem",
        "source_url": url,
        "city": resolved_city,
        "entry_id": entry.entry_id,
        "windows": [],
        "items_count": 0,
    }
    try:
        await hass.async_add_executor_job(_atomic_write_json, target, payload)
    except OSError as err:
        _LOGGER.error("Failed to create initial Hebcal cache %s: %s", target, err)
        return False
    _LOGGER.info("Created initial Hebcal cache for entry %s", entry.entry_id)
    return True


async def async_refresh_hebcal_cache(
    hass: HomeAssistant,
    entry: ConfigEntry,
    *,
    city: str | None = None,
) -> bool:
    """Fetch Hebcal JSON, normalize, and write www/boiler-card/hebcal-<entry_id>.json.

    On HTTP/parse errors, leaves any existing cache file unchanged.
    """
    ensured = await async_ensure_hebcal_cache_file(hass, entry, city=city)
    if not ensured:
        return False
    target = hebcal_cache_path(hass, entry.entry_id)
    resolved_city = (city or "").strip() or str(
        entry.options.get(CONF_HEBCAL_CITY)
        or entry.data.get(CONF_HEBCAL_CITY)
        or DEFAULT_HEBCAL_CITY,
    ).strip() or DEFAULT_HEBCAL_CITY
    url = HEBCAL_URL_TEMPLATE.format(city=resolved_city)

    session = async_get_clientsession(hass)
    timeout = ClientTimeout(total=45)
    try:
        async with session.get(url, timeout=timeout) as resp:
            resp.raise_for_status()
            payload = await resp.json(content_type=None)
    except (ClientError, asyncio.TimeoutError, json.JSONDecodeError, ValueError) as err:
        _LOGGER.warning("Hebcal fetch failed for entry %s: %s", entry.entry_id, err)
        return False

    if not isinstance(payload, dict):
        _LOGGER.warning("Hebcal response for entry %s was not a JSON object", entry.entry_id)
        return False

    items = payload.get("items")
    if not isinstance(items, list):
        _LOGGER.warning("Hebcal response for entry %s missing items[]", entry.entry_id)
        return False

    location = payload.get("location")
    tzid = None
    if isinstance(location, dict):
        tzid = location.get("tzid")

    windows = _build_windows(items, str(tzid) if tzid else None)
    out: dict[str, Any] = {
        "schema_version": 2,
        "fetched_at": dt_util.utcnow().isoformat(),
        "timezone": str(tzid or "Asia/Jerusalem"),
        "source_url": url,
        "city": resolved_city,
        "entry_id": entry.entry_id,
        "windows": windows,
        "items_count": len(items),
    }

    try:
        await hass.async_add_executor_job(_atomic_write_json, target, out)
    except OSError as err:
        _LOGGER.error("Failed to write Hebcal cache %s: %s", target, err)
        return False

    _LOGGER.info(
        "Hebcal cache updated for entry %s (%d windows, %d items)",
        entry.entry_id,
        len(windows),
        len(items),
    )
    return True
