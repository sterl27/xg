# Alic3X Audio Producer UI

> **Alic3X is the bridge between human intent and machine cognition.**

A high-fidelity, cassette-deck inspired producer cockpit that combines local audio playback, upload management, creative direction, AI producer metadata, YouTube bridge hooks, and optional ComfyUI visual/audio generation into one unified workspace.

This document covers both the **concept** (stack-agnostic) and the **reference implementation** (Next.js + TypeScript).

---

## What This Is

Not just an audio player. A **production-direction layer** — a producer cockpit for shaping songs, structuring lyrics, defining vocal intent, and exporting machine-readable metadata into music-generation, visual-generation, and audio-processing workflows.

The interface is inspired by analog cassette decks and studio control surfaces. The **concept is portable** to any framework, native app environment, or desktop application. The reference implementation uses Next.js.

---

## The 4-Pillar Creative Protocol

All producer output flows through four core functions.

### 1. Lexical Sifting
Compresses lyric and prompt material into emotionally dense, minimal phrasing.

**Target:** 160–190 words · minimalist weight · hollow space · no filler · high imagery density

### 2. Structural Tagging
Converts arrangement intent into machine-readable production section markers.

```
[Intro: Solo dry piano motif]
[Build: Rising white noise and filter sweep]
[Chorus / Drop: Sidechained sub-bass and lead]
[Bridge: Half-time breakdown with distant vocal chops]
[Outro: Final echoing delay fade]
```

### 3. Sonic Prompt Synthesis
Maps emotional intent into concrete production metadata.

```
92 BPM cinematic slowburn
sidechained sub-bass pulse
arpeggiated pluck synths
tape saturation · wide stereo shimmer · clinical reverb
```

### 4. Vocal Texture Management
Defines the vocal persona and delivery style.

```
ethereal · breathy · close-mic · female lead · intimate delivery · cinematic restraint
```

---

## Core Features

### Interface
- Cassette-deck inspired layout with animated tape reels
- Analog-style amber VU meters (motion-driven; real Web Audio API planned)
- Transport controls: rewind, previous, play/pause, fast-forward, stop
- Volume and balance knobs
- Progress display with step counter
- Motion-based level bars
- 4-pillar protocol cards

### Audio & Queue
- Local `.mp3` and `.wav` playback
- Drag-and-drop upload zone with browse-file fallback
- Immediate local preview — no server required for playback
- Removable local uploads with automatic object URL cleanup
- Demo/library queue with active-track highlighting
- Searchable producer queue
- BPM, mood, intent, and engine metadata panels

### Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `ArrowRight` | Seek +10 seconds |
| `ArrowLeft` | Seek −10 seconds |
| `ArrowUp` | Volume up |
| `ArrowDown` | Volume down |
| `N` | Next track |
| `B` | Previous track |
| `S` | Stop |

### Optional Modules
- YouTube audio bridge (server-side resolver)
- FFmpeg processing bridge (format conversion, normalization, trimming)
- ComfyUI workflow automation (cover art, visualizer stills, lyric video, moodboards)
- Persistent object storage
- Authenticated producer sessions

---

## Architecture Overview (Stack-Agnostic)

The system has four layers regardless of implementation stack:

```
Client UI
  ↓
Audio playback layer + queue and metadata state
  ↓
Upload / storage layer
  ↓
Optional processing API        ← FFmpeg
Optional external source       ← YouTube bridge
Optional generation backend    ← ComfyUI
  ↓
Export system                  ← Suno pack / JSON / ComfyUI workflow
```

Implementations can use web frameworks, native mobile frameworks, desktop app frameworks, game engines, embedded audio tools, or custom studio software — the data shapes and architecture remain consistent.

---

## Reference Implementation — Tech Stack

### Core Frontend

| Layer | Library |
|---|---|
| Framework | Next.js App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Icons | lucide-react |

### Optional Backend Modules

| Module | Purpose |
|---|---|
| Next.js API Routes | YouTube bridge, ComfyUI proxy, Alic3X analysis |
| FFmpeg | Format conversion, normalization, waveform prep |
| YouTube resolver | Metadata + stream extraction |
| ComfyUI | Cover art, visualizer, lyric video generation |
| Object storage | Persistent audio file storage |
| Database | Track and session metadata |

---

## File Structure

```
app/
  music/
    page.tsx
  api/
    youtube/
      info/route.ts
      stream/route.ts
    comfy/
      queue/route.ts
    alic3x/
      analyze/route.ts
components/
  Alic3XCassetteProducerUI.tsx
  Alic3XComfyAddon.tsx
  Alic3XPromptExporter.tsx
comfy-workflows/
  cover-art-cyberpunk-obsidian.json
  visualizer-frame-liquid-noir.json
  lyric-video-walker-blueprint.json
  moodboard-austere-catharsis.json
public/
  audio/
    farm-dayzz.mp3
    neon-morsecode.mp3
  images/
    cassette-cover.jpg
.env.local
README.md
```

---

## Installation

```bash
npx create-next-app@latest alic3x-audio-producer
cd alic3x-audio-producer
npm install framer-motion lucide-react
npm run dev
```

Open `http://localhost:3000`

---

## Component Setup

```
components/Alic3XCassetteProducerUI.tsx
```

Must be a Client Component:

```tsx
'use client';
```

Browser APIs used: drag-and-drop, file input, audio playback, `URL.createObjectURL()`, `URL.revokeObjectURL()`, client-side animation state.

```tsx
// app/music/page.tsx
import Alic3XCassetteProducerUI from '@/components/Alic3XCassetteProducerUI';

export default function MusicPage() {
  return <Alic3XCassetteProducerUI />;
}
```

---

## Track Data Model

### Core shape

```ts
type Track = {
  id: string;
  title: string;
  artist?: string;
  src?: string;
  durationHint?: string;
  bpm?: number;
  mood?: string;
  local?: boolean;
  isYouTube?: boolean;
};
```

### Extended producer shape

```ts
type ProducerTrack = Track & {
  intent?: string;
  vocalTexture?: string;
  genre?: string;
  tags?: string[];
  prompt?: string;
  createdAt?: string;
};
```

| Field | Purpose |
|---|---|
| `id` | Unique queue identifier |
| `title` | Track title shown in tape label and queue |
| `artist` | Artist, source, session, or upload label |
| `src` | Playable audio source URL or object URL |
| `durationHint` | Display duration before audio metadata loads |
| `bpm` | Producer metadata for timing and visual rhythm |
| `mood` | Sonic or emotional classification |
| `local` | Marks a local browser upload |
| `isYouTube` | Marks a YouTube bridge track |
| `intent` | Emotional direction or production goal |
| `vocalTexture` | Vocal delivery and character description |
| `tags` | Structural section tags |
| `prompt` | Assembled production prompt string |

---

## Local Upload Support

Accepted formats: `.mp3`, `.wav`

Accepted MIME types: `audio/mpeg`, `audio/mp3`, `audio/wav`, `audio/x-wav`

**Upload flow:**

1. User drops or selects a file.
2. Extension and MIME type are validated.
3. Object URL is created: `URL.createObjectURL(file)`
4. Track is added to the top of the producer queue.
5. Playback is available immediately.
6. On removal or unmount: `URL.revokeObjectURL(track.src)`

> Uploads are **local preview only** — not sent to a server, not persisted after refresh, and only exist in the current browser session.

---

## Persisting Uploaded Audio

For production, route uploads through a storage backend.

| Option | Notes |
|---|---|
| Vercel Blob | Zero-config for Vercel-hosted apps |
| Supabase Storage | Pairs naturally with Supabase auth + DB |
| AWS S3 | Industry standard, fine-grained IAM |
| Cloudflare R2 | S3-compatible, no egress fees |
| Firebase Storage | Good fit for Firebase-based apps |

**Production upload flow:**

```
Client upload
  ↓
Validate type + size (client and server)
  ↓
POST to authenticated upload endpoint
  ↓
Store in object storage
  ↓
Save metadata to database
  ↓
Return permanent URL
  ↓
Insert saved track into queue
```

**Persisted track metadata shape:**

```ts
type SavedTrack = {
  id: string;
  title: string;
  artist?: string;
  src: string;
  duration?: string;
  bpm?: number;
  key?: string;
  mood?: string;
  ownerId?: string;
  createdAt: string;
};
```

---

## Static Audio Files

```
public/audio/farm-dayzz.mp3  →  /audio/farm-dayzz.mp3
```

Reference in your track list:

```ts
src: '/audio/farm-dayzz.mp3'
```

---

## YouTube Audio Bridge

Frontend calls:

```ts
fetch(`/api/youtube/info?url=${encodeURIComponent(url)}`)
```

**Expected API response:**

```json
{
  "video_id": "abc123",
  "title": "Example Track",
  "author": "Example Artist",
  "duration_fmt": "03:42",
  "stream_url": "/api/youtube/stream?video_id=abc123"
}
```

**Queue item built from response:**

```ts
const track = {
  id: `yt-${data.video_id}-${Date.now()}`,
  title: data.title,
  artist: data.author ?? 'YouTube Stream',
  src: data.stream_url,
  durationHint: data.duration_fmt ?? '--:--',
  bpm: 128,
  mood: 'YouTube Bridge / Pending Alic3X scan',
  isYouTube: true,
};
```

### Info Route Scaffold

```ts
// app/api/youtube/info/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url).searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'Missing URL.' }, { status: 400 });

  try {
    const videoId = 'mock-video-id'; // replace with real resolver
    return NextResponse.json({
      video_id: videoId,
      title: 'Resolved YouTube Track',
      author: 'YouTube',
      duration_fmt: '--:--',
      stream_url: `/api/youtube/stream?video_id=${videoId}`,
    });
  } catch {
    return NextResponse.json({ error: 'Unable to resolve URL.' }, { status: 500 });
  }
}
```

### Stream Route Scaffold

```ts
// app/api/youtube/stream/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const videoId = new URL(request.url).searchParams.get('video_id');
  if (!videoId) return NextResponse.json({ error: 'Missing video_id.' }, { status: 400 });
  return NextResponse.json({ error: 'Stream route not implemented.' }, { status: 501 });
}
```

### Bridge Security Requirements
- No open proxy — validate domains before resolving
- Rate-limit all resolver endpoints
- Set request timeouts
- Keep all credentials server-side
- Respect platform terms, copyright rules, and user permissions

---

## FFmpeg Bridge

Use FFmpeg server-side for format conversion, loudness normalization, trimming, preview generation, waveform prep, and export.

```bash
ffmpeg -i input.wav -vn -codec:a libmp3lame -b:a 192k output.mp3
ffmpeg -i input.wav -af loudnorm output-normalized.wav
```

**Processing flow:**

```
Upload or source URL
  ↓
Server-side FFmpeg job
  ↓
Processed output file
  ↓
Object storage
  ↓
Signed playback URL returned
  ↓
Inserted into Alic3X producer queue
```

---

## Alic3X Metadata Layer

### Producer metadata shape

```json
{
  "title": "Neon Morsecode",
  "bpm": 92,
  "intent": "Austere Catharsis",
  "designSystem": "Cyberpunk Obsidian",
  "mood": "Cinematic slowburn",
  "vocalTexture": "ethereal, breathy, close-mic female vocal",
  "stylePrompt": "sidechained sub-bass pulse, arpeggiated pluck synths, tape saturation, wide stereo shimmer",
  "structure": [
    { "section": "Intro",          "description": "Solo dry piano motif" },
    { "section": "Build",          "description": "Rising white noise and filter sweep" },
    { "section": "Chorus / Drop",  "description": "Sidechained sub-bass and lead" },
    { "section": "Bridge",         "description": "Half-time breakdown with distant vocal chops" },
    { "section": "Outro",          "description": "Final echoing delay fade" }
  ]
}
```

### Analysis Route Scaffold

```ts
// app/api/alic3x/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({
    title: body.title ?? 'Untitled Session',
    bpm: body.bpm ?? 92,
    intent: 'Austere Catharsis',
    designSystem: body.designSystem ?? 'Cyberpunk Obsidian',
    mood: 'Cinematic slowburn with neon tension',
    vocalTexture: 'ethereal, breathy, close-mic vocal',
    stylePrompt: 'sidechained sub-bass pulse, arpeggiated pluck synths, tape saturation, wide stereo shimmer',
    structure: [
      { section: 'Intro',         description: 'Solo dry piano motif' },
      { section: 'Build',         description: 'Rising white noise and filter sweep' },
      { section: 'Chorus / Drop', description: 'Sidechained sub-bass and lead' },
      { section: 'Outro',         description: 'Final echoing delay fade' },
    ],
  });
}
```

### Production Prompt Template

```
Alic3X, analyze this track or lyric draft.

Design System: Cyberpunk Obsidian / Liquid Noir / Walker Blueprint
Target BPM: [BPM]
Vocal Texture: [breathy / close-mic / ethereal / gritty]
Arrangement: [intro / build / drop / bridge / outro]
Emotional Intent: [intent]

Output: concise style prompt, structural tags, lyric compression notes, and production metadata.
```

### Suno-Ready Export Example

```
Title: Neon Morsecode
BPM: 92
Design System: Cyberpunk Obsidian
Vocal: ethereal, breathy, close-mic female vocal
Production: sidechained sub-bass pulse, arpeggiated pluck synths, tape saturation, wide stereo shimmer

[Intro: Solo dry piano motif]
[Verse: Minimal vocal, intimate room tone]
[Build: Rising white noise and filter sweep]
[Chorus / Drop: Sidechained sub-bass and lead]
[Bridge: Half-time breakdown with distant vocal chops]
[Outro: Final echoing delay fade]
```

---

## ComfyUI Add-On

ComfyUI is an optional power-user backend for visual generation and AI asset pipelines. Alic3X handles creative direction; ComfyUI handles generation behind the scenes.

| Alic3X handles | ComfyUI handles |
|---|---|
| Track intent, BPM, mood | Cover art generation |
| Vocal texture, structure | Lyric video frames |
| Design system selection | Visualizer stills |
| Prompt export | Moodboards |
| | Batch workflow execution |

**End-to-end flow:**

```
Human idea
  ↓
Alic3X creative direction + metadata
  ↓
ComfyUI workflow JSON
  ↓
Generated visual / audio assets
  ↓
Alic3X export pack
```

### ComfyUI Setup

```bash
pip install comfy-cli
comfy install
python main.py
# With manager:
python main.py --enable-manager
pip install -r manager_requirements.txt
```

### Workflow Templates

```
comfy-workflows/
  cover-art-cyberpunk-obsidian.json
  visualizer-frame-liquid-noir.json
  lyric-video-walker-blueprint.json
  moodboard-austere-catharsis.json
```

**Template metadata shape:**

```json
{
  "trackTitle": "Neon Morsecode",
  "designSystem": "Cyberpunk Obsidian",
  "workflowType": "Cover Art",
  "bpm": 92,
  "prompt": "cinematic cyberpunk obsidian album cover, cyan neon signal lines, subtle magenta haze, black glass, austere catharsis",
  "negativePrompt": "low quality, blurry, noisy typography, distorted text"
}
```

### Queue API Route

```ts
// app/api/comfy/queue/route.ts
import { NextRequest, NextResponse } from 'next/server';

const COMFY_URL = process.env.COMFY_URL ?? 'http://127.0.0.1:8188';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.workflow) {
      return NextResponse.json({ error: 'Missing workflow.' }, { status: 400 });
    }
    const res = await fetch(`${COMFY_URL}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: body.workflow,
        client_id: body.clientId ?? 'alic3x-audio-producer',
      }),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: (await res.text()) || 'Failed to queue workflow.' },
        { status: res.status }
      );
    }
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: 'ComfyUI queue request failed.' }, { status: 500 });
  }
}
```

### Add-On Component Usage

```tsx
import Alic3XComfyAddon from '@/components/Alic3XComfyAddon';

<Alic3XComfyAddon
  trackTitle={activeTrack?.title ?? 'Untitled Session'}
  bpm={activeTrack?.bpm ?? 92}
  mood={activeTrack?.mood ?? 'Austere Catharsis'}
/>
```

### Use Cases

| Use Case | Input | Output |
|---|---|---|
| Cover Art | Title, design system, mood, BPM | Album / single cover |
| Visualizer Frame | Title, BPM, mood, color palette | Still frame or loop concept |
| Lyric Video Still | Lyric line, section tag, design system | Cinematic lyric frame |
| Moodboard | Alic3X metadata | Campaign reference board |
| Prompt Pack | Track metadata | Suno prompt + ComfyUI prompt + JSON |

### ComfyUI Deployment

**Local:** Next.js app → localhost ComfyUI server

**Production:**

```
Alic3X frontend
  ↓
Authenticated backend API
  ↓
Isolated ComfyUI worker
  ↓
Object storage
  ↓
Generated asset URL returned to client
```

**Safeguards:**
- Never expose ComfyUI directly to the public internet
- Authenticate all queue endpoints
- Validate workflow JSON before queuing
- Restrict available workflow templates
- Add request size limits and rate limits
- Use job IDs with polling; never block on generation synchronously
- Store outputs in object storage, not local disk

**Model paths:**

```
ComfyUI/models/checkpoints
ComfyUI/models/vae
ComfyUI/models/embeddings
```

Shared model paths: configure `extra_model_paths.yaml`

---

## Environment Variables

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
COMFY_URL=http://127.0.0.1:8188
MEDIA_CACHE_BUCKET=
MEDIA_CACHE_ACCESS_KEY=
MEDIA_CACHE_SECRET_KEY=
YOUTUBE_RESOLVER_SECRET=
```

Only prefix with `NEXT_PUBLIC_` values that must be readable in the browser. Keep storage credentials, resolver secrets, and `COMFY_URL` server-side only.

---

## Security Checklist

**Uploads**
- [ ] Validate file type and size client-side and server-side
- [ ] Sanitize file names before storage
- [ ] Never trust browser MIME data alone
- [ ] Enforce a maximum file size limit
- [ ] Store private audio behind signed URLs

**YouTube bridge**
- [ ] No open proxy — validate domains before resolving
- [ ] Rate-limit resolver endpoints
- [ ] Set request timeouts
- [ ] All credentials server-side
- [ ] Respect platform terms, copyright, and user permissions

**ComfyUI bridge**
- [ ] ComfyUI never publicly exposed
- [ ] Authenticate all queue endpoints
- [ ] Validate workflow JSON before queuing
- [ ] Restrict available workflow templates
- [ ] Rate-limit generation requests
- [ ] Store outputs in object storage

**General**
- [ ] Add request size limits to all API routes
- [ ] Log errors without leaking secrets
- [ ] Never expose internal service URLs in client-side responses

---

## Accessibility Checklist

- [ ] `aria-label` on all icon-only buttons
- [ ] `aria-pressed` on toggle buttons (play/pause, mute, shuffle)
- [ ] `aria-current="true"` on active queue item
- [ ] File input hidden with `sr-only`, mirrored by a visible keyboard-accessible button
- [ ] Visible focus states on all interactive elements
- [ ] `role="alert"` on error and status messages
- [ ] High-contrast mode support
- [ ] Reduced-motion mode support
- [ ] All drag-and-drop actions available through keyboard-accessible buttons
- [ ] Readable contrast against amber/cyan accents

---

## Browser Notes

- **Autoplay** may be blocked until the user interacts with the page
- **WAV files** can be large — convert to `.mp3` where quality permits
- **Object URLs** are local to the browser session and not portable across tabs or devices
- Demo tracks without a `src` simulate playback UI only

---

## Known Limitations

- Local uploads do not persist after page refresh
- YouTube playback requires a server-side resolver implementation
- FFmpeg must run server-side or in a worker environment
- ComfyUI workflows require valid exported workflow JSON
- VU meters are currently motion-driven, not true Web Audio API meters
- Exact track duration may be unavailable until audio metadata loads

---

## Deployment

Deploy on **Vercel** for best compatibility with the Next.js App Router.

**Pre-deployment checklist:**
- [ ] Compress large audio files (`.mp3` preferred over `.wav`)
- [ ] Move static tracks to `public/audio/` or a CDN
- [ ] Use signed URLs for private audio
- [ ] Connect object storage for persistent uploads
- [ ] Keep the player as a **client-side island** inside a server-rendered shell
- [ ] All secrets set in environment variables — none in source code
- [ ] Rate limiting on all bridge routes
- [ ] ComfyUI workers isolated from the frontend process

---

## Development Checklist

**Core player**
- [ ] Cassette UI rendering
- [ ] Demo tracks loading
- [ ] Play / pause / seek working
- [ ] Local upload and removal working
- [ ] Object URL cleanup on unmount

**YouTube bridge**
- [ ] `/api/youtube/info` scaffolded and resolving
- [ ] `/api/youtube/stream` scaffolded
- [ ] Frontend bridge panel wired to info route
- [ ] Queue item created from response

**Alic3X metadata**
- [ ] `/api/alic3x/analyze` scaffolded
- [ ] Metadata displayed in producer readouts
- [ ] Structural tags rendering in UI
- [ ] Suno export connected

**ComfyUI add-on**
- [ ] `Alic3XComfyAddon` component created
- [ ] `/api/comfy/queue` route created
- [ ] Design system selector wired
- [ ] Workflow type selector wired
- [ ] Prompt preview generating
- [ ] Queue button posting to API
- [ ] Prompt ID displaying on success

**Production**
- [ ] Environment variables set
- [ ] Object storage connected
- [ ] Auth on sensitive routes
- [ ] Rate limiting on bridge endpoints
- [ ] ComfyUI worker isolated

---

## Roadmap

| Phase | Focus |
|---|---|
| **1 — Local Prototype** | Static tracks, local upload, cassette UI, producer queue, Alic3X readouts |
| **2 — Audio Intelligence** | BPM/key detection, real waveform, Web Audio visualizer, Suno export |
| **3 — Media Bridge** | YouTube resolver, FFmpeg processing, persistent storage, saved sessions |
| **4 — ComfyUI Automation** | Cover art, visualizer stills, moodboards, job polling, asset gallery |
| **5 — Production Platform** | Auth, user libraries, cloud storage, team workspaces, deployment hardening |

**Future enhancements:**
- Real Web Audio API analyzer with true left/right VU meters
- Waveform rendering
- Drag-to-reorder queue
- Loop, shuffle, and repeat modes
- Stem separation
- BPM and key detection
- Cover art extraction from audio metadata
- ComfyUI asset gallery with job polling
- Alic3X metadata JSON export
- Suno prompt pack export
- Authenticated producer sessions with session save/load
- Preset and template libraries
- Local-first offline mode
- Collaborative project sessions

---

## Project Philosophy

Alic3X Audio Producer UI treats audio production as both a **creative and structured process**. It gives producers a tactile interface for listening, arranging, tagging, and shaping intent while preserving the structured metadata needed for AI-assisted production workflows.

The goal is not to replace the producer's intuition — it is to capture it precisely enough that machines can act on it faithfully.

---

## License

MIT License

---

## Credits

Built for the **Alic3X** audio producer workflow — a bridge between human intent and machine cognition, combining cassette-era tactile interaction with AI-assisted production metadata, local audio preview, YouTube bridge hooks, FFmpeg processing, and optional ComfyUI workflow automation.
