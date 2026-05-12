"use client";

import { useCallback } from "react";
import { useSettings } from "../useSettings";
import { DICTS, type Lang } from "./dict";

/**
 * Translation hook. Reads the current language from the Settings store
 * and returns a `t()` lookup with English fallback + `{placeholder}`
 * interpolation.
 *
 *   const { t, lang, setLang } = useI18n();
 *   t("greeting.morning", { name: "Alex" });
 */
export function useI18n() {
  const { settings, update } = useSettings();
  const lang = settings.language;

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const raw = DICTS[lang]?.[key] ?? DICTS.en[key] ?? key;
      if (!vars) return raw;
      return raw.replace(/\{(\w+)\}/g, (_, k) =>
        k in vars ? String(vars[k]) : `{${k}}`,
      );
    },
    [lang],
  );

  const setLang = useCallback(
    (next: Lang) => update({ language: next }),
    [update],
  );

  return { t, lang, setLang };
}
