export type Theme = "light" | "dark";

const KEY = "typhoon.theme.v1";

/**
 * Theme preference is stored in localStorage. If unset, we follow the OS
 * preference once and only commit on first explicit toggle.
 */

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadTheme(): Theme | null {
  if (!isBrowser()) return null;
  const v = window.localStorage.getItem(KEY);
  return v === "light" || v === "dark" ? v : null;
}

export function saveTheme(theme: Theme) {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, theme);
}

export function clearTheme() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(KEY);
}

/** True if the user's OS currently prefers dark mode. */
export function systemPrefersDark(): boolean {
  if (!isBrowser()) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * The exact script we inline in <head> to prevent FOUC. Kept here so it
 * can be referenced from layout.tsx as a single source of truth.
 */
export const themeBootScript = `
(function(){try{
  var k='${KEY}';
  var t=localStorage.getItem(k);
  var dark = t==='dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (dark) document.documentElement.classList.add('dark');
  // theme-ready is added after the first paint so initial state doesn't animate
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      document.documentElement.classList.add('theme-ready');
    });
  });
}catch(e){}})();
`;
