import { DEFAULT_SYSTEM_PROMPT } from "./models";
import type { Settings } from "./settings";
import type { Message, ModelId, SendFlags } from "./types";

/**
 * Streaming chat client. Talks to our `/api/chat` proxy which forwards to
 * Typhoon's OpenAI-compatible endpoint.
 *
 * The proxy speaks OpenAI SSE format; we yield content deltas as they
 * arrive so the caller (a React hook) can append to the assistant message
 * in-place.
 */

interface StreamChatOptions {
  messages: Message[];
  model: ModelId;
  apiKey: string;
  settings: Settings;
  flags?: SendFlags;
  signal?: AbortSignal;
  /** Override the default system prompt for one-off calls (e.g. title gen). */
  systemOverride?: string;
}

interface DeltaChunk {
  choices?: Array<{
    delta?: { content?: string; role?: string };
    finish_reason?: string | null;
  }>;
}

/**
 * Layer the Deep Search / Reason instructions on top of the base prompt
 * when those toggles are active. We don't pre-bake combinations — each
 * flag adds an additive paragraph so the order is stable + easy to debug.
 */
function buildSystemPrompt(base: string, flags?: SendFlags): string {
  const parts = [base];
  if (flags?.reason) {
    parts.push(
      "\n\n[Reason mode] Think carefully and methodically. Lay out your reasoning step-by-step before reaching a conclusion. Consider edge cases, counter-arguments, and any hidden assumptions. Prioritize correctness over speed.",
    );
  }
  if (flags?.deepSearch) {
    parts.push(
      "\n\n[Deep Search mode] Produce a thorough, well-structured answer that draws on the full breadth of your knowledge. Where the question involves real-time information you may not have, acknowledge the limitation explicitly rather than guessing. Cite reasoning and sources from your training where possible.",
    );
  }
  return parts.join("");
}

function toApiMessages(messages: Message[], systemPrompt: string) {
  const hasSystem = messages.some((m) => m.role === "system");
  const head =
    !hasSystem && systemPrompt
      ? [{ role: "system" as const, content: systemPrompt }]
      : [];
  return [
    ...head,
    ...messages.map(({ role, content }) => ({ role, content })),
  ];
}

export async function* streamChat({
  messages,
  model,
  apiKey,
  settings,
  flags,
  signal,
  systemOverride,
}: StreamChatOptions): AsyncGenerator<string, void, unknown> {
  const systemPrompt =
    systemOverride ?? buildSystemPrompt(DEFAULT_SYSTEM_PROMPT, flags);

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: toApiMessages(messages, systemPrompt),
      stream: true,
      temperature: settings.temperature,
      top_p: settings.topP,
      max_completion_tokens: settings.maxCompletionTokens,
      frequency_penalty: settings.frequencyPenalty,
    }),
    signal,
  });

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => "Request failed");
    throw new Error(errText || `HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      const line = frame.split("\n").find((l) => l.startsWith("data:"));
      if (!line) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;

      try {
        const json = JSON.parse(payload) as DeltaChunk;
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        // skip malformed frames silently — upstream emits keepalives
      }
    }
  }
}

/**
 * Non-streaming completion — used by the title generator. Re-uses the same
 * proxy and just collects the streaming chunks server-side… err, we still
 * stream client-side and concatenate, since the proxy is streaming-only by
 * default. It's a few hundred bytes; cost is negligible.
 */
export async function completeOnce(opts: StreamChatOptions): Promise<string> {
  let out = "";
  for await (const delta of streamChat(opts)) out += delta;
  return out;
}
