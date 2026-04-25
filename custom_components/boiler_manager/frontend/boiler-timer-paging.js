export function timerPageCount(options, pageSize) {
  if (!Array.isArray(options) || options.length === 0) {
    return 1;
  }
  return Math.max(1, Math.ceil(options.length / pageSize));
}

export function timerPageIndexForOption(options, option, pageSize) {
  if (!Array.isArray(options) || options.length === 0) {
    return 0;
  }
  const selectedIndex = options.indexOf(option);
  if (selectedIndex < 0) {
    return 0;
  }
  return Math.floor(selectedIndex / pageSize);
}
