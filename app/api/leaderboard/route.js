import { NextResponse } from 'next/server';
import { getDefaultSessionId, getSessionEntries, deleteEntry } from '../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      sessionId = await getDefaultSessionId();
    }

    console.log(`Fetching leaderboard for session: ${sessionId}`);
    const leaderboard = await getSessionEntries(sessionId);
    console.log(`Found ${leaderboard.length} entries for session ${sessionId}`);

    return NextResponse.json({ leaderboard, sessionId });
  } catch (error) {
    console.error('Leaderboard GET error:', error);
    console.error('Error stack:', error.stack);
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
