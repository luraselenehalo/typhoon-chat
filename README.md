<div align="center">

# Typhoon Chat

**A minimalist, BYO-key chat client for [Typhoon](https://opentyphoon.ai) — Thailand's leading open-source Thai-first AI from SCB 10X.**

[![License: MIT](https://img.shields.io/badge/license-MIT-1a1a1a)](LICENSE)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-1a1a1a)](https://nextjs.org)
[![Typhoon 2.5](https://img.shields.io/badge/Typhoon-2.5-22e6ff)](https://opentyphoon.ai)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-22e6ff)](#contributing)

[Features](#features) · [Quick Start](#quick-start) · [Architecture](#architecture) · [Deployment](#deployment) · [Security](#privacy--security)

</div>

---

## Why?

Typhoon is a high-quality, openly released Thai-first LLM from SCB 10X. The official playground is solid for experimentation, but there's no polished third-party client you can fork, self-host, or just run locally.

This is that client. Paper-aesthetic UI, one-file-per-feature codebase, zero backend dependencies. Bring your own API key from [opentyphoon.ai](https://opentyphoon.ai) and you're done — no accounts, no database, no tracking. Everything lives in your browser; clearing your cache wipes everything.

## Features

- **Streaming chat** with stop-generation, regenerate, and abort-anywhere
- **Math rendering** via KaTeX — `$inline$` and `$$display$$`
- **Code blocks** with language tags, syntax highlighting, and one-click copy
- **Image OCR** — drop a photo, `typhoon-ocr-preview` extracts the text and injects it as context
- **Multilingual UI** — English, Thai (ไทย), Japanese (日本語), Chinese (中文)
- **Light / dark theme** with system-preference auto-detect and FOUC-free boot script
- **Auto-summarised conversation titles** — model generates a 3–5 word topic label after the first reply
- **Hover-to-expand history sidebar** (2 s dwell to open, click PanelLeft to pin)
- **Reason** and **Deep Search** modes (prompt-modifier based)
- **Advanced settings** — temperature, top-p, max tokens, frequency penalty with per-field reset confirmation
- **API key validation** on onboarding — invalid keys are rejected before you proceed
- **Privacy-first** — server-side proxy never logs your `Authorization` header
- **Tight security headers** — CSP, HSTS preload, X-Frame-Options DENY, no cookies

## Screenshots

> Drop screenshots in `docs/screenshots/` and reference them here once you have a deploy URL.

## Quick Start

```bash
git clone https://github.com/luraselenehalo/typhoon-chat
cd typhoon-chat
npm install
npm run dev
```

Open <http://localhost:3000>. The onboarding screen will ask for a display name and a Typhoon API key. Get a free key at [opentyphoon.ai](https://opentyphoon.ai).

No `.env` is required — your key lives in `localStorage`, not on the server.

## Configuration

Most things are user-configurable from the in-app Settings panel (top-right gear). For codebase-level changes:

| File | What lives here |
|---|---|
| `lib/models.ts` | Registered Typhoon models + default system prompt |
| `lib/about.ts` | Project metadata for the About modal (repo URL, version, credits) |
| `lib/i18n/dict.ts` | UI translations (add a new language by adding a new dict) |
| `app/globals.css` | Light / dark palette (CSS variables on `:root` and `.dark`) |
| `lib/settings.ts` | Default values + slider ranges for advanced model params |

### Optional environment variables

```bash
TYPHOON_BASE_URL=https://api.opentyphoon.ai/v1   # override if you self-host Typhoon
```

## Architecture

```
app/
  api/
    chat/             edge proxy — forwards Authorization to Typhoon, re-streams SSE
    ocr/              OCR proxy (Node runtime for multipart)
    validate-key/     onboarding ping test
  layout.tsx          providers (settings, theme) + FOUC-guard boot script
  page.tsx            splash → onboarding → app
components/
  AboutModal          project-info dialog
  Composer            input card, image attach, deep search / reason chips
  ConversationView    scrolling list, rAF-throttled auto-scroll
  HistoryPanel        hover-expand sidebar with delete confirm
  IconRail            slim left rail: toggle, new chat, about
  Markdown            react-markdown wrapper with KaTeX + code blocks
  Message             memoised; user pill on the right, assistant plain on the left
  ModelPicker         dropdown that degrades to a label when only one model is registered
  Onboarding          display-name + API key + validation
  SettingsModal       Basic + Advanced tabs, per-field reset confirm
  SidebarShell        hover/pin logic for the history sidebar
  ThemeToggle         sun/moon button
  TopBar              model label + theme toggle + settings entry
lib/
  about.ts            project metadata constants (edit for your fork)
  greeting.ts         time-of-day → greeting key
  i18n/               translation dict + useI18n hook
  models.ts           Typhoon model registry + DEFAULT_SYSTEM_PROMPT
  ocr.ts              client-side OCR wrapper
  settings.ts         advanced settings store + slider ranges
  storage.ts          localStorage adapter for conversations
  theme.ts            theme storage + inline boot script
  types.ts            Message / Conversation / ModelId / SendFlags
  typhoon-client.ts   streaming SSE client (no SDK in the browser bundle)
  useChat.ts          conversation state machine + streaming + abort + title gen
  user.ts             { apiKey, displayName } adapter
  useSettings.tsx     Context provider + hook
  useTheme.tsx        Context provider + hook
  useUser.ts          hook with hydration guard
```

### How streaming works

1. `Composer.onSend` → `useChat.send` appends a `user` and an empty `assistant` message.
2. `streamChat()` POSTs `/api/chat` with `Authorization: Bearer <userKey>`.
3. The edge proxy forwards the same header to `api.opentyphoon.ai/v1/chat/completions` and pipes the SSE response back 1:1. The server never reads, logs, or persists the key.
4. The client parses each `data:` frame, yields the `delta.content`, and `useChat` updates the in-flight message in place.
5. When the stream ends, the conversation flushes to `localStorage` and a background completion generates the conversation title.

### Data lifecycle

| Where | What | Persists past cache clear? |
|---|---|---|
| `localStorage["typhoon.user.v1"]` | API key + display name | No |
| `localStorage["typhoon.conversations.v1"]` | All conversations + messages | No |
| `localStorage["typhoon.settings.v1"]` | Advanced settings + language | No |
| `localStorage["typhoon.theme.v1"]` | Theme preference | No |
| Server | nothing | — |

## Privacy & Security

This is a **client-trust** application: the only credential is your Typhoon API key, and it lives only in your browser. The server-side proxy is a one-line pass-through — it doesn't read, log, or persist your `Authorization` header.

The full threat model + production hardening recommendations are in [`SECURITY.md`](SECURITY.md). At a glance:

- Strict CSP (`script-src 'self' 'unsafe-inline'` in production, no `unsafe-eval`)
- HSTS with preload, `X-Frame-Options: DENY`, `frame-ancestors 'none'`
- No cookies → no CSRF surface
- Production source maps disabled
- 6 MB max image upload, type-checked client *and* server

## Deployment

Deploys to **Vercel**, **Netlify**, **Cloudflare Pages**, or any Node 18+ host.

```bash
npm run build
npm start
```

For Vercel: connect the repo and ship — no env vars needed thanks to BYO-key. `/api/chat` and `/api/validate-key` run on Edge runtime; `/api/ocr` runs on Node (multipart requirement).

**Before production**, review [`SECURITY.md`](SECURITY.md) — specifically rate limiting on the proxy and request body size caps.

## Tech Stack

- **[Next.js 14](https://nextjs.org)** App Router with edge runtime for the proxies
- **[Tailwind CSS](https://tailwindcss.com)** with CSS-variable color tokens for theme flipping
- **[Framer Motion](https://www.framer.com/motion/)** for animations
- **[KaTeX](https://katex.org)** for math rendering
- **[react-markdown](https://github.com/remarkjs/react-markdown)** with `remark-gfm`, `remark-math`, `rehype-katex`
- **[react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)** with Prism One Light / One Dark
- **[Lucide](https://lucide.dev)** for icons

## Roadmap

- [ ] PDF upload + multi-page OCR (Typhoon OCR already supports it server-side)
- [ ] Voice input via Typhoon-Audio ASR
- [ ] TTS playback for assistant replies
- [ ] Multi-doc RAG with inline citations
- [ ] Web search adapter (Tavily / Serper) to make Deep Search actually search
- [ ] Service-worker isolation for the API key (XSS hardening)

## Contributing

PRs welcome. For non-trivial changes please open an issue first.

The codebase aims for:

- One concern per file, clear naming
- Comments explain *why*, not *what*
- No new dependencies without strong justification
- Type-safe end-to-end — `npm run build` must pass

```bash
npm run dev      # dev server with HMR
npm run build    # production build + type check
```

## Credits

- **[SCB 10X](https://www.scb10x.com)** for building Typhoon and making it openly available
- **[OpenTyphoon](https://opentyphoon.ai)** for the API + playground
- Every open-source project listed in the [Tech Stack](#tech-stack)

This is an **independent third-party project**. Not affiliated with or endorsed by SCB 10X.

## License

[MIT](LICENSE) — do whatever you want, just don't blame me.
