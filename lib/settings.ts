import type { Lang } from "./i18n/dict";

/**
 * Tunable model parameters + language preference.
 * Lives in localStorage alongside the user profile and conversations.
 */
export interface Settings {
  language: Lang;

  /** Maximum length of the assistant's reply. */
  maxCompletionTokens: number;
  /** Sampling temperature. Higher = more creative. */
  temperature: number;
  /** Nucleus sampling threshold. */
  topP: number;
  /** Discourages repetition. 0 = off. */
  frequencyPenalty: number;
}

export const DEFAULT_SETTINGS: Settings = {
  language: "en",
  maxCompletionTokens: 1024,
  temperature: 0.6,
  topP: 0.6,
  frequencyPenalty: 0,
};

const KEY = "typhoon.settings.v1";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadSettings(): Settings {
  if (!isBrowser()) return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    // Merge over defaults so newly-added fields don't break old saves
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: Settings) {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
}

export function clearSettings() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(KEY);
}

/** Keys of Settings that we expose as "advanced" model parameters. */
export const ADVANCED_KEYS = [
  "maxCompletionTokens",
  "temperature",
  "topP",
  "frequencyPenalty",
] as const;
export type AdvancedKey = (typeof ADVANCED_KEYS)[number];

/** Bounds + step for each advanced key — used by the slider UI. */
export const ADVANCED_RANGES: Record<
  AdvancedKey,
  { min: number; max: number; step: number }
> = {
  maxCompletionTokens: { min: 64, max: 8192, step: 64 },
  temperature: { min: 0, max: 2, step: 0.05 },
  topP: { min: 0.05, max: 1, step: 0.05 },
  frequencyPenalty: { min: -2, max: 2, step: 0.1 },
};

/** Returns the list of fields that differ from defaults — used by Reset. */
export function diffFromDefaults(s: Settings): AdvancedKey[] {
  return ADVANCED_KEYS.filter((k) => s[k] !== DEFAULT_SETTINGS[k]);
}
