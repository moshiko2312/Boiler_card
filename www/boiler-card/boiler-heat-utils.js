export function effectiveHeatupMinutes(totalMinutes, clamp) {
  // 15m timers stay literal. Longer timers increase heating pace sub-linearly
  // so visual heat-up remains believable and doesn't stay "blue" for too long.
  const minHeat = 15;
  const maxHeat = 55;
  const normalized = clamp((totalMinutes - minHeat) / 90, 0, 1);
  const curve = Math.pow(normalized, 0.7);
  return clamp(minHeat + (maxHeat - minHeat) * curve, minHeat, maxHeat);
}

export function timedHeatColorProgress(timerProgress, totalSeconds, clamp) {
  const progress = clamp(timerProgress, 0, 1);
  const totalMinutes = Number.isFinite(totalSeconds) && totalSeconds > 0 ? (totalSeconds / 60) : null;
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
    return progress;
  }

  const elapsedMinutes = progress * totalMinutes;
  const effectiveHeatMinutes = effectiveHeatupMinutes(totalMinutes, clamp);
  if (!Number.isFinite(effectiveHeatMinutes) || effectiveHeatMinutes <= 0) {
    return progress;
  }
  return clamp(elapsedMinutes / effectiveHeatMinutes, 0, 1);
}

export function stagedHeatGradient(colorProgress, clamp) {
  const p = clamp(colorProgress, 0, 1);
  const blue = "#2b7fff";
  const yellow = "#f3d34f";
  const orange = "#f97316";
  const red = "#dc2626";

  if (p < 0.3) {
    return `linear-gradient(90deg, ${blue} 0%, ${blue} 100%)`;
  }

  const yellowBase = 35 * clamp((p - 0.3) / 0.2, 0, 1);
  const orangeWidth = 30 * clamp((p - 0.5) / 0.2, 0, 1);
  const redWidth = 30 * clamp((p - 0.7) / 0.3, 0, 1);
  const yellowWidth = clamp(yellowBase - (redWidth * 0.4), 0, 40);
  const blueWidth = clamp(100 - yellowWidth - orangeWidth - redWidth, 0, 100);

  const blueEnd = blueWidth;
  const yellowEnd = blueEnd + yellowWidth;
  const orangeEnd = yellowEnd + orangeWidth;
  const blend = 2.2;

  if (orangeWidth <= 0.01) {
    return `linear-gradient(90deg, ${blue} 0%, ${blue} ${Math.max(0, blueEnd - blend)}%, ${yellow} ${Math.min(100, blueEnd + blend)}%, ${yellow} 100%)`;
  }
  if (redWidth <= 0.01) {
    return `linear-gradient(90deg, ${blue} 0%, ${blue} ${Math.max(0, blueEnd - blend)}%, ${yellow} ${Math.min(100, blueEnd + blend)}%, ${yellow} ${Math.max(0, yellowEnd - blend)}%, ${orange} ${Math.min(100, yellowEnd + blend)}%, ${orange} 100%)`;
  }
  return `linear-gradient(90deg, ${blue} 0%, ${blue} ${Math.max(0, blueEnd - blend)}%, ${yellow} ${Math.min(100, blueEnd + blend)}%, ${yellow} ${Math.max(0, yellowEnd - blend)}%, ${orange} ${Math.min(100, yellowEnd + blend)}%, ${orange} ${Math.max(0, orangeEnd - blend)}%, ${red} ${Math.min(100, orangeEnd + blend)}%, ${red} 100%)`;
}

export function parseNumericEntityState(entity) {
  const rawState = String(entity?.state || "").trim();
  if (!rawState) {
    return null;
  }

  const normalized = rawState.toLowerCase();
  if (normalized === "unknown" || normalized === "unavailable" || normalized === "none") {
    return null;
  }

  const value = Number.parseFloat(rawState.replace(",", "."));
  if (!Number.isFinite(value)) {
    return null;
  }

  const unit = String(entity?.attributes?.unit_of_measurement || "").trim();
  return { rawState, value, unit };
}

export function temperatureProgressFromCelsius(celsiusValue, clamp) {
  // Explicit fixed bands from 0C so cold water (0-30C) is always represented as blue range.
  if (celsiusValue <= 0) {
    return 0;
  }
  if (celsiusValue <= 30) {
    return clamp((celsiusValue / 30) * 0.6, 0, 0.6);
  }
  if (celsiusValue <= 40) {
    return clamp(0.6 + ((celsiusValue - 30) / 10) * 0.2, 0.6, 0.8);
  }
  if (celsiusValue < 50) {
    return clamp(0.8 + ((celsiusValue - 40) / 10) * 0.2, 0.8, 1);
  }
  return 1;
}

export function toCelsius(value, unit) {
  const temp = Number.parseFloat(String(value).replace(",", "."));
  if (!Number.isFinite(temp)) {
    return NaN;
  }

  const normalizedUnit = String(unit || "").trim().toLowerCase();
  if (normalizedUnit === "k" || normalizedUnit.includes("kelvin")) {
    return temp - 273.15;
  }
  if (
    normalizedUnit === "f"
    || normalizedUnit === "°f"
    || normalizedUnit.includes("fahrenheit")
    || normalizedUnit.includes("°f")
  ) {
    return (temp - 32) * (5 / 9);
  }
  return temp;
}

export function formatTemperatureDisplay(rawState, unit, celsiusValue, fallbackUnavailableLabel) {
  const cleanRaw = String(rawState || "").trim();
  const cleanUnit = String(unit || "").trim();
  if (cleanRaw && cleanUnit) {
    return `${cleanRaw} ${cleanUnit}`;
  }
  if (cleanRaw) {
    return cleanRaw;
  }
  if (Number.isFinite(celsiusValue)) {
    return `${Math.round(celsiusValue * 10) / 10} °C`;
  }
  return fallbackUnavailableLabel;
}
