"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { loadTheme, saveTheme, type Theme } from "./theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (next: Theme) => void;
  toggle: () => void;
}

const Ctx = createContext<ThemeContextValue | null>(null);

/**
 * App-wide theme store. The actual visual state is driven by the `.dark`
 * class on <html> (set synchronously by the boot script in <head>), so we
 * read the DOM on mount to recover the initial value.
 *
 * Like SettingsProvider, this exists so that toggling the theme from one
 * surface (Settings → Save, ThemeToggle button) is reflected immediately
 * everywhere else.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  // Snap to whatever the boot script applied
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setThemeState(isDark ? "dark" : "light");
  }, []);

  // Auto-follow OS — only while the user hasn't opted in explicitly
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (loadTheme()) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => apply(mq.matches ? "dark" : "light", false);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apply = useCallback((next: Theme, persist: boolean) => {
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setThemeState(next);
    if (persist) saveTheme(next);
  }, []);

  const setTheme = useCallback(
    (next: Theme) => apply(next, true),
    [apply],
  );

  const toggle = useCallback(() => {
    apply(theme === "dark" ? "light" : "dark", true);
  }, [theme, apply]);

  return (
    <Ctx.Provider value={{ theme, setTheme, toggle }}>{children}</Ctx.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
}
