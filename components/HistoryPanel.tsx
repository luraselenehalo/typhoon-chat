"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Coffee, MessageSquare, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/useI18n";
import type { Conversation } from "@/lib/types";

interface HistoryPanelProps {
  open: boolean;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  /** Close handler — only used by the mobile drawer's backdrop + X button. */
  onClose: () => void;
  /** About entry shown in the mobile drawer header (rail is hidden there). */
  onOpenAbout: () => void;
}

/**
 * Two presentations of the same list:
 *  - Desktop (md+): inline sidebar that animates width 0 → 288.
 *  - Mobile: full-height drawer that slides in from the left over a backdrop.
 *
 * Both share `HistoryListBody` so the content stays in one place.
 */
export function HistoryPanel({
  open,
  conversations,
  activeId,
  onSelect,
  onDelete,
  onClose,
  onOpenAbout,
}: HistoryPanelProps) {
  const { t } = useI18n();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setConfirmId(null);
  }, [open]);

  // Close drawer on Escape (mobile UX)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const list = (
    <HistoryListBody
      conversations={conversations}
      activeId={activeId}
      confirmId={confirmId}
      onConfirm={setConfirmId}
      onSelect={onSelect}
      onDelete={onDelete}
    />
  );

  return (
    <>
      {/* === Desktop: inline sidebar === */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 288, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="hidden md:block shrink-0 overflow-hidden border-r border-paper-300/70 bg-paper-100"
          >
            <div className="w-72 flex flex-col h-full">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <h2 className="text-[13px] font-medium text-ink-900">
                  {t("history.title")}
                </h2>
              </div>
              {list}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* === Mobile: full-height drawer + backdrop === */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={onClose}
              className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="md:hidden fixed inset-y-0 left-0 z-50 w-[82vw] max-w-[320px] bg-paper-100 flex flex-col shadow-card"
            >
              <div className="flex items-center justify-between px-4 pt-5 pb-2">
                <h2 className="text-[14px] font-medium text-ink-900">
                  {t("history.title")}
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAbout();
                    }}
                    aria-label={t("rail.about")}
                    className="p-1.5 rounded-md text-ink-500 hover:text-ink-900 hover:bg-paper-300/70 transition-colors"
                  >
                    <Coffee size={15} />
                  </button>
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="p-1.5 rounded-md text-ink-500 hover:text-ink-900 hover:bg-paper-300/70 transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
              {list}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

interface HistoryListBodyProps {
  conversations: Conversation[];
  activeId: string | null;
  confirmId: string | null;
  onConfirm: (id: string | null) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function HistoryListBody({
  conversations,
  activeId,
  confirmId,
  onConfirm,
  onSelect,
  onDelete,
}: HistoryListBodyProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()),
  );
  const { today, earlier } = bucketByDay(filtered);

  return (
    <>
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
          onConfirm={onConfirm}
          onSelect={onSelect}
          onDelete={onDelete}
        />
        <Group
          label={t("history.earlier")}
          items={earlier}
          activeId={activeId}
          confirmId={confirmId}
          onConfirm={onConfirm}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      </div>
    </>
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
                className={`group relative w-full flex items-center gap-2.5 px-2.5 py-2 md:py-1.5 rounded-lg text-left transition-colors
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
                  className="p-1 rounded text-ink-400 hover:text-rose-500 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
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
