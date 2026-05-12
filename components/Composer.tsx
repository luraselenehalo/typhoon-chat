"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Globe,
  Image as ImageIcon,
  Lightbulb,
  Loader2,
  Paperclip,
  Square,
  X,
} from "lucide-react";
import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useI18n } from "@/lib/i18n/useI18n";
import type { ImageAttachment } from "@/lib/types";

interface ComposerProps {
  onSend: (payload: {
    text: string;
    attachments?: ImageAttachment[];
    /** Hidden context (OCR text) — appended to the API message only. */
    hiddenPreamble?: string;
    flags: { deepSearch: boolean; reason: boolean };
  }) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  apiKey: string;
}

const MAX_IMAGE_SIZE = 6 * 1024 * 1024; // 6MB — Typhoon OCR's practical limit
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

/**
 * Card-shaped composer with:
 *  - Image attach (paperclip) → Typhoon OCR → injected as hidden preamble
 *  - Deep Search / Reason toggle chips
 *  - Send ↔ Stop swap during streaming
 */
export function Composer({
  onSend,
  onStop,
  isStreaming,
  apiKey,
}: ComposerProps) {
  const { t } = useI18n();
  const [value, setValue] = useState("");
  const [deepSearch, setDeepSearch] = useState(false);
  const [reason, setReason] = useState(false);
  const [attachments, setAttachments] = useState<ImageAttachment[]>([]);
  const [ocrText, setOcrText] = useState<string>("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  // Auto-focus textarea when streaming finishes so the user can keep typing
  // without clicking back into the input. Tracked via a ref so we only
  // focus on the falling edge (true → false), not on mount.
  const prevStreaming = useRef(isStreaming);
  useEffect(() => {
    if (prevStreaming.current && !isStreaming) {
      // requestAnimationFrame waits one frame so the textarea isn't
      // disabled by lingering React updates from the stream tail.
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
    prevStreaming.current = isStreaming;
  }, [isStreaming]);

  // Also focus on initial mount so the user can type the first message
  // without clicking. Runs once, no deps.
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const submit = () => {
    const trimmed = value.trim();
    if ((!trimmed && attachments.length === 0) || isStreaming || ocrLoading)
      return;
    onSend({
      text: trimmed || t("message.image"),
      attachments: attachments.length > 0 ? attachments : undefined,
      hiddenPreamble: ocrText
        ? `[Image text (OCR)]:\n${ocrText}`
        : undefined,
      flags: { deepSearch, reason },
    });
    setValue("");
    setAttachments([]);
    setOcrText("");
    setOcrError(null);
    requestAnimationFrame(resize);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleAttachClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // allow re-selecting the same file

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setOcrError("Only PNG / JPEG / WebP / GIF images are supported.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setOcrError("Image is too large (max 6MB).");
      return;
    }

    // Build a data URL for inline preview
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("read failed"));
      reader.readAsDataURL(file);
    }).catch(() => "");
    if (!dataUrl) {
      setOcrError(t("composer.ocr.failed"));
      return;
    }

    setAttachments((prev) => [...prev, { dataUrl, name: file.name }]);
    setOcrLoading(true);
    setOcrError(null);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      });
      if (!res.ok) {
        throw new Error(`OCR failed (${res.status})`);
      }
      const data = (await res.json()) as { text?: string };
      setOcrText((prev) =>
        [prev, data.text ?? ""].filter(Boolean).join("\n\n"),
      );
    } catch {
      setOcrError(t("composer.ocr.failed"));
    } finally {
      setOcrLoading(false);
    }
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
    if (attachments.length === 1) setOcrText("");
  };

  const canSend =
    (value.trim().length > 0 || attachments.length > 0) &&
    !isStreaming &&
    !ocrLoading;
  const showStop = Boolean(isStreaming);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full bg-paper-50 rounded-3xl hairline shadow-card"
    >
      {/* Attachment thumbnails */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 pt-3 flex-wrap">
              {attachments.map((a, i) => (
                <Thumb key={i} att={a} onRemove={() => removeAttachment(i)} />
              ))}
              {ocrLoading && (
                <div className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-full bg-paper-300/60 text-[12px] text-ink-500">
                  <Loader2 size={12} className="animate-spin" />
                  {t("composer.ocr.reading")}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-5 pt-4 pb-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder={t("composer.placeholder")}
          className="w-full resize-none bg-transparent
                     text-[15px] leading-6 text-ink-900
                     placeholder:text-ink-400
                     focus:outline-none focus:ring-0
                     max-h-[220px]"
        />
      </div>

      {ocrError && (
        <div className="px-5 pb-1 text-[11.5px] text-rose-600 dark:text-rose-400">
          {ocrError}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 px-2 md:px-3 pb-3 pt-1">
        {/* Chip row scrolls horizontally on narrow phones rather than wrapping
            — keeps the composer height stable. */}
        <div className="flex items-center gap-1 min-w-0 overflow-x-auto no-scrollbar">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleFileChange}
            className="hidden"
          />
          <IconChip label={t("composer.attach")} onClick={handleAttachClick}>
            <Paperclip size={15} strokeWidth={1.75} />
          </IconChip>

          <TextChip
            active={deepSearch}
            onClick={() => setDeepSearch((v) => !v)}
            icon={<Globe size={13} strokeWidth={1.75} />}
            label={t("composer.deepSearch")}
          />

          <TextChip
            active={reason}
            onClick={() => setReason((v) => !v)}
            icon={<Lightbulb size={13} strokeWidth={1.75} />}
            label={t("composer.reason")}
          />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {showStop ? (
            <motion.button
              key="stop"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.12 }}
              onClick={onStop}
              aria-label={t("composer.stop")}
              className="w-9 h-9 grid place-items-center rounded-full bg-ink-900 text-paper-50 hover:bg-ink-700 transition-colors"
            >
              <Square size={12} fill="currentColor" />
            </motion.button>
          ) : (
            <motion.button
              key="send"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.12 }}
              onClick={submit}
              disabled={!canSend}
              aria-label={t("composer.send")}
              className={`w-9 h-9 grid place-items-center rounded-full transition-colors
                          ${
                            canSend
                              ? "bg-ink-900 text-paper-50 hover:bg-ink-700"
                              : "bg-ink-900/40 text-paper-50/80 cursor-not-allowed"
                          }`}
            >
              <ArrowUp size={16} strokeWidth={2.25} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function Thumb({
  att,
  onRemove,
}: {
  att: ImageAttachment;
  onRemove: () => void;
}) {
  return (
    <div className="relative group">
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-paper-300 hairline">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={att.dataUrl}
          alt={att.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute -top-1 -right-1 grid place-items-center">
        <button
          onClick={onRemove}
          aria-label="Remove image"
          className="w-4 h-4 rounded-full bg-ink-900 text-paper-50 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={9} strokeWidth={2.5} />
        </button>
      </div>
      <div className="absolute inset-x-0 -bottom-4 grid place-items-center">
        <span className="text-[10px] text-ink-400 max-w-[80px] truncate inline-flex items-center gap-0.5">
          <ImageIcon size={9} />
          {att.name}
        </span>
      </div>
    </div>
  );
}

function IconChip({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="w-8 h-8 grid place-items-center rounded-full text-ink-500 hover:text-ink-900 hover:bg-paper-300/70 transition-colors"
    >
      {children}
    </button>
  );
}

function TextChip({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 px-2.5 h-8 rounded-full text-[12.5px]
                  transition-colors
                  ${
                    active
                      ? "bg-ink-900 text-paper-50"
                      : "text-ink-500 hover:text-ink-900 hover:bg-paper-300/70"
                  }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
