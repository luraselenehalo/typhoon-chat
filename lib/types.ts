export type Role = "user" | "assistant" | "system";

export type MessageStatus = "streaming" | "complete" | "error" | "aborted";

export interface ImageAttachment {
  /** Data URL for inline rendering (kept small via downscale before upload). */
  dataUrl: string;
  /** Original filename — shown beneath the thumbnail. */
  name: string;
}

export interface Message {
  id: string;
  role: Role;
  /** Display text. For user messages this excludes injected OCR context. */
  content: string;
  /** Optional images on a user message — shown as thumbnails. */
  attachments?: ImageAttachment[];
  createdAt: number;
  status?: MessageStatus;
  model?: ModelId;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: ModelId;
  createdAt: number;
  updatedAt: number;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
  preview?: string;
}

export type ModelId = "typhoon-v2.5-30b-a3b-instruct";

export interface ModelMeta {
  id: ModelId;
  label: string;
  description: string;
  reasoning?: boolean;
}

/** Flags passed from the composer into useChat.send(). */
export interface SendFlags {
  deepSearch?: boolean;
  reason?: boolean;
}
