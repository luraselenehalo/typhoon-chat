import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Server-side proxy to Typhoon's OpenAI-compatible chat endpoint.
 *
 * BYO-key model: the client owns the Typhoon API key (stored in their browser)
 * and sends it in the `Authorization` header on every request. The proxy
 * forwards it verbatim — we don't read, log, or persist it.
 *
 * Why proxy at all (vs. browser → Typhoon direct):
 *  - avoids relying on Typhoon enabling permissive CORS
 *  - gives us one place to inject defaults or add server-side features later
 *    (rate limiting, prompt rewriting, etc.) without breaking clients
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return new Response(
      JSON.stringify({
        error:
          "Missing API key. Open Settings and add your Typhoon API key.",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  const baseUrl =
    process.env.TYPHOON_BASE_URL ?? "https://api.opentyphoon.ai/v1";

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const upstream = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
    body: JSON.stringify(body),
    signal: req.signal,
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Preserve upstream content-type so callers can use this endpoint for
  // non-streaming requests too (e.g. title generation). The streaming code
  // path passes `stream: true` and gets back text/event-stream as expected.
  const ct =
    upstream.headers.get("content-type") ?? "application/json; charset=utf-8";

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": ct,
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
