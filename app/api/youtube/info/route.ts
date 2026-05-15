import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url).searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing YouTube URL.' }, { status: 400 });
  }

  // Basic domain validation — prevent open proxy misuse.
  const allowedDomains = ['youtube.com', 'youtu.be', 'www.youtube.com'];
  try {
    const parsed = new URL(url);
    if (!allowedDomains.includes(parsed.hostname)) {
      return NextResponse.json({ error: 'URL must be a YouTube link.' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL.' }, { status: 400 });
  }

  // Replace the block below with your actual resolver (e.g. yt-dlp subprocess or a metadata service).
  return NextResponse.json(
    { error: 'YouTube resolver not implemented. Add your server-side resolver here.' },
    { status: 501 }
  );
}
