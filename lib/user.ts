const KEY = "typhoon.user.v1";

export interface UserPrefs {
  apiKey: string;
  displayName: string;
}

/**
 * User preferences live in localStorage only. Clearing browser data wipes
 * them — that's the intended behaviour (no accounts, no backend).
 */

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadUser(): UserPrefs | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UserPrefs>;
    if (!parsed.apiKey || !parsed.displayName) return null;
    return { apiKey: parsed.apiKey, displayName: parsed.displayName };
  } catch {
    return null;
  }
}

export function saveUser(u: UserPrefs) {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(u));
}

export function clearUser() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(KEY);
}

/** Take the first letters of up to two words for the avatar chip. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
