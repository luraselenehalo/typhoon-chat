"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_MODEL } from "./models";
import { DEFAULT_SETTINGS, type Settings } from "./settings";
import * as storage from "./storage";
import { completeOnce, streamChat } from "./typhoon-client";
import type {
  Conversation,
  ImageAttachment,
  Message,
  ModelId,
  SendFlags,
} from "./types";

interface UseChatOptions {
  apiKey: string;
  settings: Settings;
}

interface SendOptions {
  text: string;
  attachments?: ImageAttachment[];
  /** Extra context to inject as user-message preamble (e.g. OCR result). */
  hiddenPreamble?: string;
  flags?: SendFlags;
}

function newId() {
  return Math.random().toString(36).slice(2, 11);
}

function makeConversation(model: ModelId): Conversation {
  const now = Date.now();
  return {
    id: newId(),
    title: "New conversation",
    messages: [],
    model,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Owns conversation state for the whole app.
 *
 * Key behaviours:
 *  - **Lazy create**: a new conversation is materialised only on first send,
 *    so reopening the site with `activeId === null` doesn't litter storage
 *    with empty drafts.
 *  - **Streaming-aware**: assistant content mutates in-place while
 *    streaming; only the terminal state is persisted (cheap writes).
 *  - **Auto-title**: after the first assistant reply, a background
 *    completion summarises the topic and rewrites `conversation.title`.
 */
export function useChat({ apiKey, settings }: UseChatOptions) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // Hydrate from localStorage on mount. We do NOT auto-select the most-recent
  // conversation — landing on the empty hero is the desired first-open state.
  useEffect(() => {
    setConversations(storage.loadAll());
  }, []);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const messages = active?.messages ?? [];

  /** Write a single conversation back to state + storage. */
  const writeConversation = useCallback((next: Conversation) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === next.id);
      const merged =
        idx >= 0
          ? [...prev.slice(0, idx), next, ...prev.slice(idx + 1)]
          : [next, ...prev];
      storage.saveAll(merged);
      return merged;
    });
  }, []);

  /** Reset to the empty hero — no new conversation is created yet. */
  const startNew = useCallback(() => {
    setActiveId(null);
    setError(null);
  }, []);

  const select = useCallback((id: string) => {
    setActiveId(id);
    setError(null);
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      storage.remove(id);
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (id === activeId) setActiveId(null);
        return next;
      });
    },
    [activeId],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearAllConversations = useCallback(() => {
    storage.saveAll([]);
    setConversations([]);
    setActiveId(null);
  }, []);

  /**
   * Fire-and-forget title generator. Asks the model for a 3-5 word topical
   * label and patches the conversation in-place when it arrives.
   */
  const generateTitle = useCallback(
    async (convId: string, userText: string, assistantText: string) => {
      try {
        const titlePrompt =
          "You will be given the first user/assistant turn of a conversation. Reply with a short (3-5 word) title that summarises the topic. No quotes, no trailing punctuation. Match the language of the user's message.";
        const out = await completeOnce({
          messages: [
            {
              id: "tg-u",
              role: "user",
              content: `User: ${userText}\n\nAssistant: ${assistantText.slice(0, 400)}`,
              createdAt: 0,
            },
          ],
          model: DEFAULT_MODEL,
          apiKey,
          settings: {
            ...DEFAULT_SETTINGS,
            temperature: 0.2,
            maxCompletionTokens: 20,
          },
          systemOverride: titlePrompt,
        });

        const cleaned = out.replace(/^["'`\s]+|["'`\s.!?]+$/g, "").slice(0, 60);
        if (!cleaned) return;
        setConversations((prev) => {
          const next = prev.map((c) =>
            c.id === convId ? { ...c, title: cleaned } : c,
          );
          storage.saveAll(next);
          return next;
        });
      } catch {
        // Title gen is best-effort. Falling back to the seeded title is fine.
      }
    },
    [apiKey],
  );

  const send = useCallback(
    async (input: SendOptions | string) => {
      const opts: SendOptions =
        typeof input === "string" ? { text: input } : input;
      const trimmed = opts.text.trim();
      if (!trimmed || isStreaming) return;

      // Materialise the conversation now if we don't have one yet
      let convId = activeId;
      let conv: Conversation;
      if (!convId) {
        conv = makeConversation(model);
        convId = conv.id;
        setActiveId(convId);
      } else {
        conv =
          conversations.find((c) => c.id === convId) ?? makeConversation(model);
      }

      // The text we *display* keeps preamble (OCR) hidden; the text we
      // *send* to the model includes it so the assistant has context.
      const apiContent = opts.hiddenPreamble
        ? `${opts.hiddenPreamble}\n\n${trimmed}`
        : trimmed;

      const userMsg: Message = {
        id: newId(),
        role: "user",
        content: trimmed,
        attachments: opts.attachments,
        createdAt: Date.now(),
      };
      const assistantMsg: Message = {
        id: newId(),
        role: "assistant",
        content: "",
        createdAt: Date.now(),
        status: "streaming",
        model,
      };

      const isFirstMessage = conv.messages.length === 0;
      const seeded: Conversation = {
        ...conv,
        title: isFirstMessage ? storage.deriveTitle(trimmed) : conv.title,
        messages: [...conv.messages, userMsg, assistantMsg],
        updatedAt: Date.now(),
        model,
      };
      writeConversation(seeded);

      setIsStreaming(true);
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;

      // The messages array we send upstream uses `apiContent` for the
      // freshly-added user turn so the model sees the OCR preamble.
      const streamingHistory: Message[] = [
        ...conv.messages,
        { ...userMsg, content: apiContent },
      ];

      let acc = "";
      try {
        for await (const delta of streamChat({
          messages: streamingHistory,
          model,
          apiKey,
          settings,
          flags: opts.flags,
          signal: controller.signal,
        })) {
          acc += delta;
          setConversations((prev) =>
            prev.map((c) =>
              c.id !== convId
                ? c
                : {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === assistantMsg.id ? { ...m, content: acc } : m,
                    ),
                  },
            ),
          );
        }

        // Flush terminal state to storage
        setConversations((prev) => {
          const next = prev.map((c) => {
            if (c.id !== convId) return c;
            return {
              ...c,
              updatedAt: Date.now(),
              messages: c.messages.map((m) =>
                m.id === assistantMsg.id
                  ? { ...m, content: acc, status: "complete" as const }
                  : m,
              ),
            };
          });
          storage.saveAll(next);
          return next;
        });

        // Background title gen — only on the very first turn of a chat
        if (isFirstMessage && acc.trim().length > 0) {
          generateTitle(convId, trimmed, acc);
        }
      } catch (err: unknown) {
        const aborted =
          err instanceof DOMException && err.name === "AbortError";
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        setError(aborted ? null : message);
        setConversations((prev) => {
          const next = prev.map((c) => {
            if (c.id !== convId) return c;
            return {
              ...c,
              updatedAt: Date.now(),
              messages: c.messages.map((m) =>
                m.id === assistantMsg.id
                  ? {
                      ...m,
                      status: (aborted ? "aborted" : "error") as
                        | "aborted"
                        | "error",
                    }
                  : m,
              ),
            };
          });
          storage.saveAll(next);
          return next;
        });
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [
      activeId,
      apiKey,
      conversations,
      generateTitle,
      isStreaming,
      model,
      settings,
      writeConversation,
    ],
  );

  return {
    conversations,
    activeId,
    active,
    messages,
    model,
    setModel,
    isStreaming,
    error,
    send,
    stop,
    startNew,
    select,
    deleteConversation,
    clearAllConversations,
  };
}
