"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { findModel } from "@/lib/models";
import { useI18n } from "@/lib/i18n/useI18n";
import type { ModelId } from "@/lib/types";

interface ModelPickerProps {
  value: ModelId;
  onChange: (id: ModelId) => void;
}

/**
 * Model selector in the top bar.
 *
 * Today there's only one Typhoon variant registered, so the dropdown
 * surfaces a "Coming soon" placeholder instead of a list. When more
 * models land (see `lib/models.ts`), wire them in — the button + chevron
 * already behave like a real picker.
 *
 * The chevron rotates with `open`, giving a tactile cue that it's
 * interactive even when the menu doesn't currently let you pick.
 */
export function ModelPicker({ value }: ModelPickerProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = findModel(value);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[12px] text-ink-700 hover:bg-paper-300/70 transition-colors"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-ink-900" />
        <span className="font-medium">{current.label}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          className="text-ink-400"
        >
          <ChevronDown size={12} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute left-0 top-full mt-2 w-72 rounded-2xl bg-paper-50 hairline shadow-card z-30 overflow-hidden"
          >
            <div className="px-4 py-3.5 flex items-start gap-3">
              <span className="mt-0.5 grid place-items-center w-7 h-7 rounded-full bg-paper-300/60 text-ink-500 shrink-0">
                <Sparkles size={13} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-ink-900">
                  {t("model.more")}
                </div>
                <div className="text-[11.5px] text-ink-500 leading-snug mt-0.5">
                  {t("model.more.desc")}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
