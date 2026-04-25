export function safeServiceData(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value;
}

export function isServiceRef(value) {
  if (typeof value !== "string") {
    return false;
  }
  const normalized = value.trim();
  if (!normalized.includes(".")) {
    return false;
  }
  const [domain, service] = normalized.split(".", 2);
  return !!domain && !!service;
}

export function isServiceAvailable(hass, serviceRef) {
  if (!hass || !isServiceRef(serviceRef)) {
    return false;
  }
  const normalized = String(serviceRef).trim().toLowerCase();
  const [domain, service] = normalized.split(".", 2);
  return !!(hass.services?.[domain]?.[service]);
}

export function callServiceRef(hass, serviceRef, data = null) {
  if (!hass || typeof serviceRef !== "string") {
    return false;
  }
  const normalized = serviceRef.trim().toLowerCase();
  const [domain, service] = normalized.split(".", 2);
  if (!domain || !service) {
    return false;
  }
  if (!isServiceAvailable(hass, serviceRef)) {
    return false;
  }
  hass.callService(domain, service, safeServiceData(data));
  return true;
}
