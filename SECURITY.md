# Security Notes — Typhoon Chat

This is a **client-trust** application: there is no backend account system, no database, and no server-side storage of user data. The user's Typhoon API key is the only credential, and it lives only in the user's browser. That model shifts where the threats are — most of our attack surface is the browser session itself.

This document captures the threats, the controls already in place, and the things to do before going to production.

---

## Threat model summary

| Threat | Severity | Mitigation status |
|---|---|---|
| API key exfiltration (XSS) | Critical | Mitigated by CSP + react-markdown's HTML escaping |
| API key exfiltration (phishing) | Critical | User education only — see below |
| API key exfiltration (3rd party extensions) | High | Document risk; can't mitigate at app layer |
| API key exfiltration (server-side log leak) | Critical | We don't log the Authorization header anywhere |
| Prompt injection via OCR / user input | Medium | System prompt separation; display untrusted content visibly |
| Image upload abuse (huge files, malicious content) | Medium | Client-side size + type check; server-side type also enforced |
| Clickjacking | Low | `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'` |
| MITM | High | HSTS w/ preload, HTTPS-only deploy |
| Dependency compromise (supply chain) | High | Pin versions; run `npm audit` regularly; lock file committed |

---

## Controls in place

### 1. Server-side API key handling

The proxy at `app/api/chat/route.ts` does this and **only this** with the user's key:

```
read Authorization header → forward verbatim → discard
```

It does not:
- Write the key to any log
- Cache, persist, or echo it in responses
- Set it as a cookie
- Send it anywhere other than `api.opentyphoon.ai`

`/api/ocr` and `/api/validate-key` follow the same pattern.

> **Operator note:** If you deploy this and add observability (Datadog, Sentry, Vercel logs, etc.), audit every integration to confirm `Authorization` headers are stripped before being sent off-box.

### 2. Strict security headers (`next.config.js`)

Every response includes:

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- `Content-Security-Policy` — restricts:
  - `script-src` to same-origin + a single inline theme-boot script
  - `connect-src` to same-origin + `api.opentyphoon.ai`
  - `frame-ancestors 'none'` (can't be embedded in another site)
  - `img-src` to `'self' data: blob:` (for thumbnails + OCR previews)

### 3. XSS protection

- All assistant output runs through **react-markdown with default settings** — raw HTML is escaped, no `rehype-raw` or similar opt-in.
- No `dangerouslySetInnerHTML` anywhere except the audited theme-boot script in `app/layout.tsx`.
- Code blocks are tokenized by Prism and rendered as plain `<span>` elements.
- OCR text is plain string content sent to the model, never rendered as HTML.

### 4. CSRF

- All API routes accept POST with `Authorization: Bearer <key>` — there are **no cookies**, so CSRF is structurally impossible (an attacker on another origin can't replay a request that requires reading a value only the user's JS can read).

### 5. Production source maps

`productionBrowserSourceMaps: false` — internal source paths and unminified logic aren't shipped to clients.

### 6. Upload constraints

- Client checks accept type (`image/png`, `image/jpeg`, `image/webp`, `image/gif`) and 6MB cap before upload.
- Server route at `/api/ocr` re-validates `instanceof File` and rejects anything else with 400.

---

## Recommendations before production deploy

Things to add when this graduates from a personal tool:

### High priority

1. **Rate limiting on the proxies.** Currently a leaked deploy URL could be used to proxy through your infrastructure (using attackers' own Typhoon keys — but still consuming your bandwidth + Vercel quota). Add per-IP rate limiting (Upstash Ratelimit, Vercel KV, or middleware) — at minimum `10 req/min/IP` on `/api/chat` and `2 req/min/IP` on `/api/ocr`.

2. **Request body size limits.** Enforce a hard cap on `/api/ocr` upload size at the route level (the Next.js body parser will gladly accept gigabytes by default on Node runtime routes). 10MB should be the absolute ceiling.

3. **Subresource Integrity for Google Fonts.** Currently we load Inter from Google. Either self-host it (best) or add SRI hashes. Self-hosting eliminates an external connection from your CSP.

4. **Lock dependencies.** `npm ci` in production, `package-lock.json` committed (already done). Add Dependabot or Renovate. Run `npm audit --production` in CI and fail on `high` or above.

5. **Production logging hygiene.** If you deploy to a platform that captures request headers (Vercel access logs, AWS WAF, Cloudflare, etc.), confirm the `Authorization` header is redacted at the platform level. Many platforms have built-in redaction for this header — verify it's enabled.

### Medium priority

6. **Honeytoken canary.** Add a one-time check in onboarding that calls `/api/validate-key` with a slightly malformed key to confirm the proxy correctly rejects. This catches deployment misconfigurations.

7. **Service worker for key isolation.** Move the API key out of localStorage into a service-worker-managed in-memory store. Service workers don't have direct DOM access, so an XSS payload would have a harder time exfiltrating the key. Tradeoff: more complexity, key lost on tab close. Probably overkill unless this becomes a high-value target.

8. **Document the trust boundary.** Add a "Privacy" section accessible from Settings explaining: (a) what data leaves the browser, (b) what we never see, (c) what a malicious browser extension *can* see. Transparency is a control.

9. **Browser extension warning.** On Onboarding, detect known-bad-extension patterns (Chrome devtools exposed, suspicious window.* mutations) and warn the user. Imperfect, but raises the bar.

10. **Detect copy-pasted suspicious keys.** If the entered API key looks like a different provider's format (e.g., `sk-ant-`, `xai-`, `goog-`), warn the user before submitting — they may have pasted the wrong credential.

### Low priority / hardening

11. **Pinning the Typhoon TLS certificate** in the server-side `fetch` would protect against compromised CAs. Not currently practical in Edge runtime.

12. **Subresource integrity for `react-syntax-highlighter` Prism themes** — these are imported from npm, not CDN, so already covered by the lockfile.

13. **Localize error messages carefully.** Error responses from Typhoon may include details about the user's account state — strip these before showing to the user if they could be sensitive.

---

## What we explicitly do NOT do

- We do **not** store any user data on the server.
- We do **not** set any cookies (auth or analytics).
- We do **not** load third-party scripts (analytics, ads, error tracking).
- We do **not** send chat content anywhere except Typhoon.
- We do **not** retain Authorization headers in our application logic.

If you fork this project and add any of the above, document the change here and re-evaluate the threat model.

---

## Reporting a vulnerability

This is a personal/educational project — if you find an issue, open a GitHub issue with the `security` label or contact the maintainer directly. For active deployments, redact any keys from your report and rotate the affected key first.
