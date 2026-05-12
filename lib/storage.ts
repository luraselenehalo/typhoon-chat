import { DEFAULT_MODEL, MODELS } from "./models";
import type { Conversation } from "./types";

const KEY = "typhoon.conversations.v1";
const VALID_MODELS = new Set(MODELS.map((m) => m.id));

/**
 * Tiny localStorage adapter for conversations.
 *
 * - Keyed array of Conversation objects (sorted by updatedAt desc on write).
 * - SSR-safe: reads return [] when window is undefined.
 * - All writes go through `saveAll` to keep ordering invariants in one place.
 */

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadAll(): Conversation[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Migrate: any conversation persisted with a now-invalid model ID gets
    // remapped to the current default. Otherwise the next send would 404.
    return (parsed as Conversation[]).map((c) =>
      VALID_MODELS.has(c.model) ? c : { ...c, model: DEFAULT_MODEL },
    );
  } catch {
    return [];
  }
}

export function saveAll(conversations: Conversation[]) {
  if (!isBrowser()) return;
  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(sorted));
  } catch {
    // Quota exceeded — silently drop. Could surface a toast in a future tier.
  }
}

export function upsert(conv: Conversation) {
  const all = loadAll();
  const idx = all.findIndex((c) => c.id === conv.id);
  if (idx >= 0) all[idx] = conv;
  else all.unshift(conv);
  saveAll(all);
}

export function remove(id: string) {
  saveAll(loadAll().filter((c) => c.id !== id));
}

/** Derive a short title from the first user message (used after first send). */
export function deriveTitle(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 48) return cleaned;
  return cleaned.slice(0, 47) + "…";
}
