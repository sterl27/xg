# Alic3X Audio Producer UI

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Alic3X is the bridge between human intent and machine cognition.**

Alic3X Audio Producer UI is a cassette-deck inspired producer cockpit for audio direction workflows. It blends tactile playback controls with structured creative metadata, then bridges into optional media processing and generation systems.

This document serves as both:
- a **stack-agnostic concept spec**, and
- a **practical implementation guide** for this repository (Next.js + TypeScript).

---

## Table of contents

- [What this is](#what-this-is)
- [Core protocol (4 pillars)](#core-protocol-4-pillars)
- [Architecture (stack-agnostic)](#architecture-stack-agnostic)
- [Repository implementation](#repository-implementation)
- [Feature highlights](#feature-highlights)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [API routes](#api-routes)
- [Data model](#data-model)
- [Upload behavior](#upload-behavior)
- [ComfyUI add-on](#comfyui-add-on)
- [Security checklist](#security-checklist)
- [Accessibility checklist](#accessibility-checklist)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Screenshots / media placeholders](#screenshots--media-placeholders)
- [License](#license)

---

## What this is

Alic3X is **not just an audio player**. It is a production-direction layer that helps turn creative ideas into machine-readable metadata for:
- music-generation prompts,
- visual-generation workflows,
- backend processing pipelines,
- export bundles and session metadata.

The UI uses cassette-era metaphors (reels, transport controls, meters) while keeping the system architecture portable across web, native, and desktop platforms.

---

## Core protocol (4 pillars)

1. **Lexical Sifting**  
   Refines prompt/lyric language into concise, emotionally dense direction.

2. **Structural Tagging**  
   Encodes arrangement sections such as Intro / Build / Chorus-Drop / Bridge / Outro.

3. **Sonic Prompt Synthesis**  
   Converts mood + intent into production descriptors (BPM, texture, space, dynamics).

4. **Vocal Texture Management**  
   Defines delivery characteristics (close-mic, breathy, layered, gritty, ethereal, etc.).

---

## Architecture (stack-agnostic)

```text
Client UI
  ↓
Playback + queue + metadata state
  ↓
Upload / storage layer
  ↓
Optional processing API (FFmpeg)
Optional media resolver (YouTube)
Optional generation backend (ComfyUI)
  ↓
Exports (JSON / prompt packs / workflow payloads)
```

---

## Repository implementation

### Stack used in this repo

- **Next.js** (App Router)
- **React** + **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **lucide-react**

### Key files

```text
app/
  page.tsx                     # redirects to /music
  music/page.tsx               # main UI route
  api/
    youtube/info/route.ts
    youtube/stream/route.ts
    comfy/queue/route.ts
    alic3x/analyze/route.ts
components/
  Alic3XCassetteProducerUI.tsx
  Alic3XComfyAddon.tsx
lib/supabase/
  client.ts
  server.ts
  middleware.ts
README.md
```

---

## Feature highlights

### Cassette cockpit
- Animated reels and motion-driven VU style meters
- Transport controls (rew / prev / play-pause / next / ff / stop)
- Seek + volume controls
- Keyboard shortcut support

### Queue and local uploads
- Drag-and-drop + browse upload flow
- `.mp3` / `.wav` support
- Local object URL playback for immediate preview
- Queue search/filter
- Local track removal with object URL cleanup

### Metadata + bridges
- Track readouts for BPM / mood / intent
- YouTube resolver bridge scaffolding
- ComfyUI queue endpoint + add-on panel
- Alic3X analysis endpoint scaffold

---

## Quick start

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open:
- `http://localhost:3000` (redirects to `/music`)
- `http://localhost:3000/music`

### Production build

```bash
npm run build
npm run start
```

---

## Environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
COMFY_URL=http://127.0.0.1:8188

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

MEDIA_CACHE_BUCKET=
MEDIA_CACHE_ACCESS_KEY=
MEDIA_CACHE_SECRET_KEY=
YOUTUBE_RESOLVER_SECRET=
```

### Rules

- Only `NEXT_PUBLIC_*` values are exposed to browser code.
- Keep resolver/storage/service-role keys server-side only.
- Never commit real secrets.

---

## API routes

### `GET /api/youtube/info`
- Validates YouTube URL host.
- Returns `501` until a real resolver is implemented.
- Includes basic anti-open-proxy behavior.

### `GET /api/youtube/stream`
- Stream scaffold endpoint.
- Returns `501` until proxy/stream integration is added.

### `POST /api/comfy/queue`
- Accepts `workflow` payload.
- Forwards to `${COMFY_URL}/prompt`.
- Includes timeout/error handling.

### `POST /api/alic3x/analyze`
- Returns scaffolded analysis metadata.
- Intended to be replaced with a real model/provider integration.

---

## Data model

```ts
type Track = {
  id: string;
  title: string;
  artist?: string;
  src?: string;
  durationHint?: string;
  bpm?: number;
  mood?: string;
  intent?: string;
  local?: boolean;
  isYouTube?: boolean;
};
```

Recommended extension:

```ts
type ProducerTrack = Track & {
  vocalTexture?: string;
  genre?: string;
  tags?: string[];
  prompt?: string;
  createdAt?: string;
};
```

---

## Upload behavior

Supported file inputs:
- Extensions: `.mp3`, `.wav`
- MIME types: `audio/mpeg`, `audio/mp3`, `audio/wav`, `audio/x-wav`

Runtime flow:
1. Validate file
2. `URL.createObjectURL(file)`
3. Insert at top of queue
4. Immediate playback possible
5. `URL.revokeObjectURL(...)` on cleanup

> Current behavior is **local session preview only**. Persistence requires backend storage integration.

---

## ComfyUI add-on

`components/Alic3XComfyAddon.tsx` provides:
- design system selector,
- workflow type selector,
- prompt preview,
- queue trigger (`/api/comfy/queue`),
- queue state + prompt ID/error feedback.

### Production recommendations

- Keep ComfyUI worker private and isolated.
- Require auth for queue endpoints.
- Validate workflow JSON and template allowlists.
- Store generated assets in object storage.
- Use async polling/job IDs for long generation tasks.

---

## Keyboard shortcuts

| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `ArrowRight` | Seek +10s |
| `ArrowLeft` | Seek -10s |
| `ArrowUp` | Volume up |
| `ArrowDown` | Volume down |
| `N` | Next track |
| `B` | Previous track |
| `S` | Stop |

---

## Security checklist

- [ ] Validate uploads server-side (type + size)
- [ ] Sanitize filenames and metadata
- [ ] Use signed URLs for private assets
- [ ] Add rate limits to bridge endpoints
- [ ] Enforce request body size limits
- [ ] Add upstream timeout/circuit-break behavior
- [ ] Keep secrets out of client bundles
- [ ] Prevent open-proxy resolver behavior
- [ ] Authenticate sensitive endpoints

---

## Accessibility checklist

- [ ] `aria-label` for icon-only controls
- [ ] `aria-pressed` for toggle buttons
- [ ] `aria-current="true"` for active queue item
- [ ] Keyboard alternative for drag/drop uploads
- [ ] Visible focus states across all controls
- [ ] `role="alert"` for actionable error messaging
- [ ] Reduced-motion support
- [ ] Sufficient contrast in amber/cyan themes

---

## Deployment

Vercel is recommended for the current Next.js implementation.

Pre-deploy checks:
- [ ] `npm run build` passes
- [ ] env vars configured in platform secrets
- [ ] no sensitive values committed
- [ ] bridge/API routes hardened with rate limits
- [ ] resolver and generation backends not publicly exposed

---

## Roadmap

1. **Local Prototype** — cassette UI, queue, local uploads
2. **Audio Intelligence** — waveform + true analyzer + BPM/key detection
3. **Media Bridge** — robust YouTube + FFmpeg + persistence
4. **Comfy Automation** — template packs + polling + asset gallery
5. **Production Platform** — auth, user libraries, collaboration, hardened infra

---

## Screenshots / media placeholders

Add assets under `docs/` (recommended):

```text
docs/
  screenshots/
    cockpit-overview.png
    queue-upload.png
    protocol-panel.png
  gifs/
    playback-demo.gif
```

Then embed in this README, for example:

```md
![Cockpit Overview](docs/screenshots/cockpit-overview.png)
```

---

## Contributing

1. Fork and create a feature branch.
2. Keep changes scoped and documented.
3. Run lint/build locally before opening a PR.
4. Include screenshots or demo clips for UI-facing changes.

---

## License

MIT

---

## Credits

Built for the Alic3X workflow: cassette-era tactile interaction + modern AI-ready production metadata + optional media/generation bridges.
