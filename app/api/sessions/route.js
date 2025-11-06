import { NextResponse } from 'next/server';
import { getAllSessions, createSession, deleteSession } from '../../../lib/db';

export async function GET() {
  try {
    const sessions = await getAllSessions();
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Sessions GET error:', error);
    return NextResponse.json({ sessions: [] });
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = String(body?.name || '').trim() || `Sesi ${Date.now()}`;
    
    const session = await createSession(name);
    
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Failed to create session' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, session });
  } catch (error) {
    console.error('Sessions POST error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to create session' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const id = body?.id;
    
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing session ID' }, { status: 400 });
    }

    const deleted = await deleteSession(id);
    
    if (!deleted) {
      return NextResponse.json({ ok: false, error: 'Sesi tidak wujud' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Sessions DELETE error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to delete session' }, { status: 500 });
  }
}
