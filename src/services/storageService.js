/**
 * Safe localStorage persistence helpers for Local Demo Mode and guest cart state.
 */

const PREFIX = 'velora_';

export function readStorage(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(`${PREFIX}${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // Ignore quota / privacy mode storage errors gracefully
  }
}

export function removeStorage(key) {
  try {
    window.localStorage.removeItem(`${PREFIX}${key}`);
  } catch {
    // Ignore storage errors gracefully
  }
}
