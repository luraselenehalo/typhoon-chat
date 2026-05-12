"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Message, TypingIndicator } from "./Message";
import type { Message as MessageType } from "@/lib/types";

interface ConversationViewProps {
  messages: MessageType[];
  isStreaming?: boolean;
  error?: string | null;
  onRegenerate?: () => void;
}

/**
 * Scrolling message list.
 *
 * Layout: the inner container is min-height 100% + flex-end so that — with
 * just a couple of messages — they hug the bottom (right above the floating
 * composer). Long conversations grow upward naturally.
 *
 * Scroll behaviour: during streaming we coalesce scroll updates through
 * requestAnimationFrame and use instant jumps (not smooth) so successive
 * deltas don't fight each other. Once streaming ends we do one smooth scroll
 * to seal the position.
 */
export function ConversationView({
  messages,
  isStreaming,
  error,
  onRegenerate,
}: ConversationViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const isStreamingRef = useRef(isStreaming);

  // Schedule one scroll per animation frame regardless of how many deltas
  // arrive. This keeps the page calm under heavy token rates.
  useEffect(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const el = scrollRef.current;
      if (!el) return;
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      // Only follow if user is already near the bottom — preserve their
      // position if they scrolled up to read history.
      if (distanceFromBottom < 200) {
        el.scrollTop = el.scrollHeight;
      }
    });
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [messages, isStreaming]);

  // After streaming ends, do one final smooth scroll to "seat" the message.
  useEffect(() => {
    if (isStreamingRef.current && !isStreaming) {
      const el = scrollRef.current;
      if (el) {
        const distanceFromBottom =
          el.scrollHeight - el.scrollTop - el.clientHeight;
        if (distanceFromBottom < 200) {
          el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
        }
      }
    }
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  const last = messages[messages.length - 1];
  const showTyping =
    isStreaming && last && last.role === "assistant" && !last.content;

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto w-full">
      {/* Natural top-down flow — first message lands near the top of the
          viewport, conversation grows downward. */}
      <div className="pt-8 pb-40">
        <div className="mx-auto w-full max-w-2xl px-6 space-y-2">
          {messages.map((m, i) => (
            <Message
              key={m.id}
              message={m}
              onRegenerate={
                m.role === "assistant" && i === messages.length - 1
                  ? onRegenerate
                  : undefined
              }
            />
          ))}
          {showTyping && <TypingIndicator />}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="my-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 px-3.5 py-2.5 text-[13px] text-rose-700 dark:text-rose-300"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
