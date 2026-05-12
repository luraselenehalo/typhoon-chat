"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/useTheme";

/**
 * Compact theme switcher. Renders the icon for the OPPOSITE of the current
 * theme — i.e. shows a moon when in light mode, sun when in dark — so the
 * affordance reads as "click to switch to that mode".
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="w-7 h-7 grid place-items-center rounded-full text-ink-500 hover:text-ink-900 hover:bg-paper-300/70 transition-colors"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.16 }}
          className="grid place-items-center"
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
