"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  Copy,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { memo, useState } from "react";
import { Markdown } from "./Markdown";
import { useI18n } from "@/lib/i18n/useI18n";
import type { Message as MessageType } from "@/lib/types";

interface MessageProps {
  message: MessageType;
  onRegenerate?: () => void;
}

/**
 * Renders one message.
 *
 * The user/assistant distinction is now visual rather than textual:
 *  - User messages sit in a soft right-aligned pill, capped to ~80% width.
 *  - Assistant messages flow full-width on the left with no chrome — just
 *    the markdown body.
 *
 * Memoised on content so streaming updates don't re-render the whole list.
 */
export const Message = memo(
  function Message({ message, onRegenerate }: MessageProps) {
    if (message.role === "user") {
      return <UserMessage message={message} />;
    }
    return <AssistantMessage message={message} onRegenerate={onRegenerate} />;
  },
  (prev, next) => {
    const a = prev.message;
    const b = next.message;
    return (
      a.id === b.id &&
      a.content === b.content &&
      a.status === b.status &&
      a.attachments === b.attachments &&
      prev.onRegenerate === next.onRegenerate
    );
  },
);

function UserMessage({ message }: { message: MessageType }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex justify-end py-2.5"
    >
      <div className="max-w-[78%]">
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-1.5 flex flex-wrap gap-1.5 justify-end">
            {message.attachments.map((a, i) => (
              <div
                key={i}
                className="w-20 h-20 rounded-xl overflow-hidden bg-paper-300 hairline"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.dataUrl}
                  alt={a.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
        <div className="rounded-2xl bg-paper-300/70 px-4 py-2.5 text-[15px] leading-7 text-ink-900 whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </motion.div>
  );
}

function AssistantMessage({
  message,
  onRegenerate,
}: {
  message: MessageType;
  onRegenerate?: () => void;
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const isStreaming = message.status === "streaming";
  const isError = message.status === "error";
  const isComplete = !message.status || message.status === "complete";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="group py-3"
    >
      {/* Subtle assistant marker — gradient dot at the left edge, only
          visible while a reply is streaming or errored, so the line
          stays clean once the answer is settled. */}
      {(isStreaming || isError) && (
        <div className="mb-1.5 flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-ink-400">
          <span>{t("message.assistant")}</span>
          {isStreaming && <CursorDot />}
          {isError && (
            <span className="inline-flex items-center gap-1 normal-case tracking-normal text-rose-500">
              <AlertCircle size={11} />
              {t("message.error")}
            </span>
          )}
        </div>
      )}

      <Markdown>{message.content}</Markdown>

      {isComplete && message.content && (
        <div className="mt-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <IconButton onClick={handleCopy} label={t("message.copy")}>
            {copied ? (
              <Check size={13} className="text-emerald-600" />
            ) : (
              <Copy size={13} />
            )}
          </IconButton>
          {onRegenerate && (
            <IconButton onClick={onRegenerate} label={t("message.regenerate")}>
              <RotateCcw size={13} />
            </IconButton>
          )}
          <IconButton label={t("message.good")}>
            <ThumbsUp size={13} />
          </IconButton>
          <IconButton label={t("message.bad")}>
            <ThumbsDown size={13} />
          </IconButton>
        </div>
      )}
    </motion.div>
  );
}

function IconButton({
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
      onClick={onClick}
      aria-label={label}
      className="p-1.5 rounded-md text-ink-400 hover:text-ink-900 hover:bg-paper-300/70 transition-colors"
    >
      {children}
    </button>
  );
}

function CursorDot() {
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full bg-ink-400"
      style={{ animation: "pulse 1.1s ease-in-out infinite" }}
    />
  );
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-3"
    >
      <div className="flex items-center gap-1.5">
        {[0, 0.18, 0.36].map((d, i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-ink-400"
            style={{
              animation: "pulse 1.2s ease-in-out infinite",
              animationDelay: `${d}s`,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
