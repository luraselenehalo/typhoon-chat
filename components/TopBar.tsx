"use client";

import { Menu, Plus, Settings } from "lucide-react";
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
  /** Mobile-only — opens the history drawer (rail is hidden on phones). */
  onOpenSidebar: () => void;
  /** Mobile-only — quick new-chat shortcut (rail's + is hidden too). */
  onNew: () => void;
}

/**
 * Top strip.
 *
 * Layout differs slightly between mobile and desktop:
 *  - **Mobile**: hamburger (opens drawer) + new-chat shortcut, then model,
 *    then theme + settings. The IconRail is hidden on small screens so
 *    these controls compensate.
 *  - **Desktop**: just model on the left, theme + settings on the right.
 */
export function TopBar({
  model,
  onModelChange,
  displayName,
  onOpenSettings,
  onOpenSidebar,
  onNew,
}: TopBarProps) {
  const { t } = useI18n();
  const initials = initialsOf(displayName);

  return (
    <div className="flex items-center justify-between gap-2 pt-3 md:pt-4 px-3 md:px-5">
      <div className="flex items-center gap-1">
        {/* Mobile-only nav controls */}
        <button
          aria-label={t("rail.toggle")}
          onClick={onOpenSidebar}
          className="md:hidden w-9 h-9 grid place-items-center rounded-lg text-ink-500 hover:text-ink-900 hover:bg-paper-300/70 transition-colors"
        >
          <Menu size={17} strokeWidth={1.75} />
        </button>
        <button
          aria-label={t("rail.newChat")}
          onClick={onNew}
          className="md:hidden w-9 h-9 grid place-items-center rounded-lg text-ink-500 hover:text-ink-900 hover:bg-paper-300/70 transition-colors"
        >
          <Plus size={17} strokeWidth={1.75} />
        </button>

        <ModelPicker value={model} onChange={onModelChange} />
      </div>

      <div className="flex items-center gap-1.5 md:gap-2">
        <ThemeToggle />

        <button
          aria-label={t("topbar.settings")}
          onClick={onOpenSettings}
          className="inline-flex items-center gap-2 h-7 pr-2.5 md:pr-3.5 pl-2 md:pl-2.5 rounded-full bg-paper-300/60 hover:bg-paper-300 transition-colors"
          title={`${t("topbar.account")} · ${displayName}`}
        >
          <span className="w-5 h-5 rounded-full bg-ink-900 grid place-items-center text-[9px] font-medium text-paper-50">
            {initials}
          </span>
          <span className="hidden md:inline text-[12px] font-medium text-ink-700">
            {t("topbar.settings")}
          </span>
          <Settings size={12} className="text-ink-500" />
        </button>
      </div>
    </div>
  );
}
