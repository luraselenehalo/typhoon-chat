"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/useI18n";
import type { Conversation } from "@/lib/types";

interface HistoryPanelProps {
  open: boolean;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Sliding conversation history. Always present in the layout but reveals
 * itself when `open` is true (driven by hover + pin from the parent).
 *
 * Delete now goes through a per-row confirm dialog instead of nuking the
 * conversation on the first click.
 */
export function HistoryPanel({
  open,
  conversations,
  activeId,
  onSelect,
  onDelete,
}: HistoryPanelProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // Reset confirm when the panel collapses
  useEffect(() => {
    if (!open) setConfirmId(null);
  }, [open]);

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()),
  );

  const { today, earlier } = bucketByDay(filtered);

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 288, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          // Slow + soft easing — feels like the panel "unfolds" rather than snaps.
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          className="shrink-0 overflow-hidden border-r border-paper-300/70 bg-paper-100"
        >
          <div className="w-72 flex flex-col h-full">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h2 className="text-[13px] font-medium text-ink-900">
                {t("history.title")}
              </h2>
            </div>

            <div className="px-3 pb-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("history.search")}
                className="w-full px-3 h-8 rounded-lg bg-paper-300/40 hairline text-[12.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-0 focus:border-ink-400/60"
              />
            </div>

            <div className="flex-1 overflow-y-auto pb-3">
              {filtered.length === 0 && (
                <div className="px-4 pt-6 text-[12px] text-ink-400">
                  {t("history.empty")}
                </div>
              )}

              <Group
                label={t("history.today")}
                items={today}
                activeId={activeId}
                confirmId={confirmId}
                onConfirm={setConfirmId}
                onSelect={onSelect}
                onDelete={onDelete}
              />
              <Group
                label={t("history.earlier")}
                items={earlier}
                activeId={activeId}
                confirmId={confirmId}
                onConfirm={setConfirmId}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

interface GroupProps {
  label: string;
  items: Conversation[];
  activeId: string | null;
  confirmId: string | null;
  onConfirm: (id: string | null) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function Group({
  label,
  items,
  activeId,
  confirmId,
  onConfirm,
  onSelect,
  onDelete,
}: GroupProps) {
  const { t } = useI18n();
  if (items.length === 0) return null;
  return (
    <div className="mt-2">
      <div className="px-4 pb-1 text-[10.5px] uppercase tracking-[0.14em] text-ink-400">
        {label}
      </div>
      <ul className="px-2 space-y-0.5">
        {items.map((c) => {
          const active = c.id === activeId;
          const isConfirming = c.id === confirmId;
          return (
            <li key={c.id}>
              <button
                onClick={() => onSelect(c.id)}
                className={`group relative w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors
                            ${
                              active
                                ? "bg-paper-300/80 text-ink-900"
                                : "text-ink-700 hover:bg-paper-300/60"
                            }`}
              >
                <MessageSquare
                  size={13}
                  className={active ? "text-ink-900" : "text-ink-400"}
                />
                <span className="flex-1 min-w-0 truncate text-[13px]">
                  {c.title}
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfirm(c.id);
                  }}
                  role="button"
                  aria-label={t("history.delete")}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-ink-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={12} />
                </span>
              </button>

              <AnimatePresence>
                {isConfirming && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="mx-2 mt-1.5 mb-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
                      <div className="text-[12.5px] font-medium text-rose-700 dark:text-rose-300">
                        {t("history.delete.title")}
                      </div>
                      <div className="mt-0.5 text-[11.5px] text-rose-600/80 dark:text-rose-400/80">
                        {t("history.delete.desc")}
                      </div>
                      <div className="mt-2 flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onConfirm(null)}
                          className="px-2.5 h-7 rounded-full text-[12px] text-ink-700 hover:bg-paper-300/70 transition-colors"
                        >
                          {t("history.delete.cancel")}
                        </button>
                        <button
                          onClick={() => {
                            onDelete(c.id);
                            onConfirm(null);
                          }}
                          className="px-2.5 h-7 rounded-full bg-rose-600 text-white text-[12px] hover:bg-rose-700 transition-colors"
                        >
                          {t("history.delete.confirm")}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function bucketByDay(items: Conversation[]) {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const cutoff = dayStart.getTime();
  const today: Conversation[] = [];
  const earlier: Conversation[] = [];
  for (const c of items) {
    if (c.updatedAt >= cutoff) today.push(c);
    else earlier.push(c);
  }
  return { today, earlier };
}
