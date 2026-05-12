"use client";

import { motion } from "framer-motion";
import { Coffee, PanelLeft, Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n/useI18n";

interface IconRailProps {
  onNew: () => void;
  onToggleHistory: () => void;
  onOpenAbout: () => void;
  newActive?: boolean;
}

/**
 * Slim left rail.
 *  Top: toggle history + new chat
 *  Bottom (pushed via mt-auto): About — coffee glyph that opens the
 *  project-info modal (GitHub link, license, credits).
 */
export function IconRail({
  onNew,
  onToggleHistory,
  onOpenAbout,
  newActive = true,
}: IconRailProps) {
  const { t } = useI18n();
  return (
    <nav className="flex flex-col items-center pt-5 pb-5 px-2.5 gap-1 shrink-0 h-full">
      <RailButton label={t("rail.toggle")} onClick={onToggleHistory}>
        <PanelLeft size={16} strokeWidth={1.75} />
      </RailButton>

      <RailButton
        label={t("rail.newChat")}
        active={newActive}
        onClick={onNew}
      >
        <Plus size={16} strokeWidth={2} />
      </RailButton>

      <RailButton
        label={t("rail.about")}
        onClick={onOpenAbout}
        className="mt-auto"
      >
        <Coffee size={15} strokeWidth={1.75} />
      </RailButton>
    </nav>
  );
}

function RailButton({
  children,
  label,
  active,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`relative w-9 h-9 grid place-items-center rounded-lg text-ink-500 hover:text-ink-900 transition-colors ${className}`}
    >
      {active && (
        <motion.span
          layoutId="rail-active"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="absolute inset-0 rounded-lg bg-ink-900"
        />
      )}
      <span className={`relative ${active ? "text-paper-50" : ""}`}>
        {children}
      </span>
    </button>
  );
}
