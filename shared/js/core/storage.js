export function readSetting(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch (e) {
    return fallback;
  }
}

export function writeSetting(key, value) {
  try {
    localStorage.setItem(key, String(value));
    return true;
  } catch (e) {
    return false;
  }
}
