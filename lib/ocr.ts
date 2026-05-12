/**
 * Client-side wrapper for our OCR proxy. Uploads a single file and
 * returns the extracted text (or throws on failure).
 */
export async function ocrImage(file: File, apiKey: string): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/ocr", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "OCR failed" }));
    throw new Error(data.error ?? `OCR failed (${res.status})`);
  }

  const data = (await res.json()) as { text?: string };
  return data.text ?? "";
}
