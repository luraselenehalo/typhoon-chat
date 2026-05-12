"use client";

import { motion } from "framer-motion";
import { ExternalLink, FileText, Github, MessageCircle, X } from "lucide-react";
import { useEffect } from "react";
import { ABOUT } from "@/lib/about";
import { useI18n } from "@/lib/i18n/useI18n";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Project-info dialog launched from the coffee icon at the bottom of the
 * rail. Primary CTA is the GitHub repo; secondary links cover issues +
 * license. Conditional render (no AnimatePresence) for the same reason the
 * settings dialog avoids it — keeps the backdrop click-through reliable.
 */
export function AboutModal({ open, onClose }: AboutModalProps) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-stretch md:place-items-center md:p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="w-full md:max-w-md bg-paper-100 md:rounded-3xl md:hairline md:shadow-card overflow-y-auto md:overflow-hidden h-dvh md:h-auto"
      >
        {/* Header — brand mark + version on the left, close on the right */}
        <header className="flex items-start justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <div className="text-[16px] font-semibold tracking-tight text-ink-900">
                {ABOUT.name}
              </div>
              <div className="text-[11.5px] text-ink-500 font-mono">
                v{ABOUT.version}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-md text-ink-400 hover:text-ink-900 hover:bg-paper-300/70 transition-colors"
          >
            <X size={15} />
          </button>
        </header>

        <div className="px-6 pb-5 space-y-4">
          <p className="text-[13px] text-ink-700 font-medium">
            {t("about.tagline")}
          </p>
          <p className="text-[13px] text-ink-500 leading-relaxed">
            {t("about.description")}
          </p>

          {/* Primary CTA — open the repo */}
          <a
            href={ABOUT.repoUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center justify-between w-full px-4 h-11 rounded-2xl bg-ink-900 text-paper-50 hover:bg-ink-700 transition-colors group"
          >
            <span className="flex items-center gap-2.5">
              <Github size={15} />
              <span className="text-[13.5px] font-medium">
                {t("about.github")}
              </span>
            </span>
            <ExternalLink
              size={13}
              className="opacity-60 group-hover:opacity-100 transition-opacity"
            />
          </a>

          {/* Secondary links */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={ABOUT.issuesUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-2 px-3 h-9 rounded-xl hairline bg-paper-50 hover:bg-paper-300/40 transition-colors"
            >
              <MessageCircle size={13} className="text-ink-500" />
              <span className="text-[12.5px] text-ink-700">
                {t("about.issues")}
              </span>
            </a>
            <a
              href={ABOUT.licenseUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-2 px-3 h-9 rounded-xl hairline bg-paper-50 hover:bg-paper-300/40 transition-colors"
            >
              <FileText size={13} className="text-ink-500" />
              <span className="text-[12.5px] text-ink-700">
                {t("about.license")} · {ABOUT.license}
              </span>
            </a>
          </div>

          {/* Tech stack */}
          <div className="pt-1">
            <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-400 mb-2">
              {t("about.builtWith")}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ABOUT.builtWith.map((tech) => (
                <span
                  key={tech}
                  className="px-2 h-6 inline-flex items-center rounded-full bg-paper-300/50 text-[11.5px] text-ink-700"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <footer className="border-t border-paper-300/40 px-6 py-3.5 text-[11.5px] text-ink-400 leading-relaxed">
          {t("about.thanks")}
        </footer>
      </motion.div>
    </div>
  );
}

function BrandMark() {
  return (
    <div className="relative w-10 h-10 rounded-2xl grid place-items-center bg-ink-900">
      <div className="w-3 h-3 rounded-full bg-paper-50" />
    </div>
  );
}
