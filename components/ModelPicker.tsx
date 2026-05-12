"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MODELS, findModel } from "@/lib/models";
import type { ModelId } from "@/lib/types";

interface ModelPickerProps {
  value: ModelId;
  onChange: (id: ModelId) => void;
}

/**
 * Top-bar model selector. When only one model is registered we render a
 * static label (no chevron, no menu) — opening a dropdown to pick "the one
 * option" reads as broken UX. The component automatically upgrades to a
 * real picker the moment a second entry is added to `MODELS`.
 */
export function ModelPicker({ value, onChange }: ModelPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = findModel(value);
  const isMulti = MODELS.length > 1;

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

  // Single-model: render a non-interactive label only
  if (!isMulti) {
    return (
      <div className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[12px] text-ink-700">
        <span className="w-1.5 h-1.5 rounded-full bg-ink-900" />
        <span className="font-medium">{current.label}</span>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[12px] text-ink-700 hover:bg-paper-300/70 transition-colors"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-ink-900" />
        <span className="font-medium">{current.label}</span>
        <ChevronDown size={12} className="text-ink-400" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 top-full mt-1.5 w-72 rounded-2xl bg-paper-50 hairline shadow-card p-1.5 z-30"
          >
            {MODELS.map((m) => {
              const selected = m.id === value;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    onChange(m.id);
                    setOpen(false);
                  }}
                  className="w-full flex items-start gap-3 px-2.5 py-2 rounded-xl hover:bg-paper-300/60 transition-colors text-left"
                >
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-ink-900 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-ink-900">
                      {m.label}
                    </div>
                    <div className="text-[11.5px] text-ink-500 leading-snug">
                      {m.description}
                    </div>
                  </div>
                  {selected && (
                    <Check size={14} className="mt-1 text-ink-900 shrink-0" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
