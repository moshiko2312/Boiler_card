export function dayOrderForLanguage(lang) {
  if (lang === "he") {
    return [6, 0, 1, 2, 3, 4, 5];
  }
  return [0, 1, 2, 3, 4, 5, 6];
}

export function dayLabel(day, t) {
  const map = {
    0: t("day_mon"),
    1: t("day_tue"),
    2: t("day_wed"),
    3: t("day_thu"),
    4: t("day_fri"),
    5: t("day_sat"),
    6: t("day_sun"),
  };
  return map[day] || String(day);
}

export function formatScheduleDays(days, lang, t) {
  if (!Array.isArray(days) || days.length === 0) {
    return "";
  }
  const order = dayOrderForLanguage(lang);
  const rank = new Map(order.map((day, index) => [day, index]));
  const normalized = days
    .map((day) => Number.parseInt(day, 10))
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6);
  const sorted = [...new Set(normalized)].sort((a, b) => {
    const aRank = rank.has(a) ? rank.get(a) : 999;
    const bRank = rank.has(b) ? rank.get(b) : 999;
    return aRank - bRank;
  });

  return sorted
    .map((day) => dayLabel(day, t))
    .filter((label) => label.length > 0)
    .join(", ");
}
