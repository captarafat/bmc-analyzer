import { NextResponse } from 'next/server';
import { getDefaultSessionId, getSessionEntries, deleteEntry } from '../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId') || await getDefaultSessionId();

    const leaderboard = await getSessionEntries(sessionId);

    return NextResponse.json({ leaderboard, sessionId });
  } catch (error) {
    console.error('Leaderboard GET error:', error);
    return NextResponse.json({ leaderboard: [], sessionId: 'default' });
  }
}

export async function DELETE(request) {
  try {
    const { at, sessionId } = await request.json();
    if (!at) {
      return NextResponse.json({ ok: false, error: 'Missing entry timestamp' }, { status: 400 });
    }

    const sid = sessionId || await getDefaultSessionId();
    const removed = await deleteEntry(sid, at);

    return NextResponse.json({ ok: true, removed: removed ? 1 : 0 });
  } catch (error) {
    console.error('Leaderboard DELETE error:', error);
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
}
