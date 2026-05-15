import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const videoId = new URL(request.url).searchParams.get('video_id');

  if (!videoId) {
    return NextResponse.json({ error: 'Missing video_id.' }, { status: 400 });
  }

  // Replace with your actual streaming proxy implementation.
  return NextResponse.json(
    { error: 'Stream route not implemented.' },
    { status: 501 }
  );
}
