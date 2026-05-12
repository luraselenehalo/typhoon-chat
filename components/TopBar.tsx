"use client";

import { Settings } from "lucide-react";
import { ModelPicker } from "./ModelPicker";
import { ThemeToggle } from "./ThemeToggle";
import { useI18n } from "@/lib/i18n/useI18n";
import type { ModelId } from "@/lib/types";
import { initialsOf } from "@/lib/user";

interface TopBarProps {
  model: ModelId;
  onModelChange: (id: ModelId) => void;
  displayName: string;
  onOpenSettings: () => void;
}

/**
 * Top strip — model label on the left, theme toggle + Settings on the right.
 * No payment surface (this is a free, third-party client).
 */
export function TopBar({
  model,
  onModelChange,
  displayName,
  onOpenSettings,
}: TopBarProps) {
  const { t } = useI18n();
  const initials = initialsOf(displayName);

  return (
    <div className="flex items-center justify-between pt-4 px-5">
      <ModelPicker value={model} onChange={onModelChange} />

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <button
          aria-label={t("topbar.settings")}
          onClick={onOpenSettings}
          className="inline-flex items-center gap-2 h-7 pr-3.5 pl-2.5 rounded-full bg-paper-300/60 hover:bg-paper-300 transition-colors"
          title={`${t("topbar.account")} · ${displayName}`}
        >
          <span className="w-5 h-5 rounded-full bg-ink-900 grid place-items-center text-[9px] font-medium text-paper-50">
            {initials}
          </span>
          <span className="text-[12px] font-medium text-ink-700">
            {t("topbar.settings")}
          </span>
          <Settings size={12} className="text-ink-500" />
        </button>
      </div>
    </div>
  );
}
