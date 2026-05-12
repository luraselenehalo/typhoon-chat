import type { NextRequest } from "next/server";

// OCR uses multipart/form-data with file binary — keep on Node runtime for
// reliable FormData/Blob handling.
export const runtime = "nodejs";

const OCR_DEFAULTS = {
  model: "typhoon-ocr-preview",
  task_type: "default",
  max_tokens: "16384",
  temperature: "0.1",
  top_p: "0.6",
  repetition_penalty: "1.2",
};

interface OcrResult {
  results?: Array<{
    success?: boolean;
    message?: { choices?: Array<{ message?: { content?: string } }> };
    filename?: string;
    error?: string;
  }>;
}

/**
 * Proxy to Typhoon's OCR endpoint.
 *
 * The client uploads an image (or PDF), we forward the multipart payload
 * to upstream with the user's Authorization header, then collapse the
 * per-page results into a single newline-joined string.
 *
 * Response shape: `{ text: string }` on success, `{ error: string }` otherwise.
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return Response.json({ error: "Missing API key" }, { status: 401 });
  }

  let incoming: FormData;
  try {
    incoming = await req.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = incoming.get("file");
  if (!file || !(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const out = new FormData();
  out.append("file", file);
  for (const [key, val] of Object.entries(OCR_DEFAULTS)) {
    out.append(key, val);
  }

  const baseUrl =
    process.env.TYPHOON_BASE_URL ?? "https://api.opentyphoon.ai/v1";

  const upstream = await fetch(`${baseUrl}/ocr`, {
    method: "POST",
    headers: { Authorization: auth },
    body: out,
  });

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => "OCR failed");
    return Response.json(
      { error: errText || `OCR failed (${upstream.status})` },
      { status: upstream.status },
    );
  }

  const result = (await upstream.json()) as OcrResult;

  // Flatten the per-page results into one string. If a page returned
  // structured JSON with a `natural_text` field, prefer that — otherwise
  // use the raw content.
  const pages: string[] = [];
  for (const page of result.results ?? []) {
    if (!page.success) continue;
    const raw = page.message?.choices?.[0]?.message?.content;
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as { natural_text?: string };
      pages.push(parsed.natural_text ?? raw);
    } catch {
      pages.push(raw);
    }
  }

  return Response.json({ text: pages.join("\n").trim() });
}
