import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Validates a user-supplied Typhoon API key without consuming meaningful
 * tokens. We hit the cheapest endpoint we can — a 1-token chat completion —
 * and report only whether the key was accepted.
 *
 * Returns { valid: boolean, status: number } at HTTP 200 so the client can
 * branch on `valid` without parsing error envelopes.
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return new Response(JSON.stringify({ valid: false, status: 401 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const baseUrl =
    process.env.TYPHOON_BASE_URL ?? "https://api.opentyphoon.ai/v1";

  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      body: JSON.stringify({
        model: "typhoon-v2.5-30b-a3b-instruct",
        messages: [{ role: "user", content: "ping" }],
        max_completion_tokens: 1,
        stream: false,
      }),
      signal: req.signal,
    });

    return new Response(
      JSON.stringify({ valid: upstream.ok, status: upstream.status }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch {
    // Network / DNS failure — distinct from a 401 (bad key)
    return new Response(
      JSON.stringify({ valid: false, status: 0, network: true }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }
}
