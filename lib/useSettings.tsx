"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  DEFAULT_SETTINGS,
  clearSettings,
  loadSettings,
  saveSettings,
  type Settings,
} from "./settings";

interface SettingsContextValue {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  replace: (next: Settings) => void;
  reset: () => void;
}

const Ctx = createContext<SettingsContextValue | null>(null);

/**
 * App-wide settings store. Mount this once near the root of the tree —
 * every `useSettings()` call within the subtree reads the same state, so
 * updating language / advanced params in one component instantly
 * propagates to every other consumer (Composer, TopBar, Onboarding, …).
 *
 * Before this lived as plain useState in each hook call, which meant Save
 * in SettingsModal only mutated the modal's local copy. The new language
 * persisted to localStorage but other components kept their stale snapshot
 * until full reload — the exact "can't change language back" bug.
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const replace = useCallback((next: Settings) => {
    saveSettings(next);
    setSettings(next);
  }, []);

  const reset = useCallback(() => {
    clearSettings();
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <Ctx.Provider value={{ settings, update, replace, reset }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useSettings must be used inside <SettingsProvider>");
  }
  return ctx;
}
