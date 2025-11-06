import { NextResponse } from 'next/server';
import { getDefaultSessionId, resetSession } from '../../../lib/db';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const sessionId = body?.sessionId || await getDefaultSessionId();

    await resetSession(sessionId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to reset' }, { status: 500 });
  }
}
