import { NextRequest, NextResponse } from 'next/server';

const COMFY_URL = process.env.COMFY_URL ?? 'http://127.0.0.1:8188';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.workflow) {
      return NextResponse.json({ error: 'Missing workflow.' }, { status: 400 });
    }

    const response = await fetch(`${COMFY_URL}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: body.workflow,
        client_id: body.clientId ?? 'alic3x-audio-producer',
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Failed to queue ComfyUI workflow.' },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `ComfyUI queue request failed: ${message}` },
      { status: 500 }
    );
  }
}
