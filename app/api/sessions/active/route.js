import { NextResponse } from 'next/server';
import { setActiveSession, getActiveSessionId } from '../../../../lib/db';

export async function GET() {
  try {
    const activeSessionId = await getActiveSessionId();
    return NextResponse.json({ activeSessionId });
  } catch (error) {
    console.error('Get active session error:', error);
    return NextResponse.json({ activeSessionId: 'default' });
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const sessionId = body?.sessionId;
    
    if (!sessionId) {
      return NextResponse.json({ ok: false, error: 'Missing sessionId' }, { status: 400 });
    }

    const success = await setActiveSession(sessionId);
    
    if (!success) {
      return NextResponse.json({ ok: false, error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, activeSessionId: sessionId });
  } catch (error) {
    console.error('Set active session error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to set active session' }, { status: 500 });
  }
}

