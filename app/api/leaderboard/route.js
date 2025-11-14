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
    const body = await request.json();
    const { at, sessionId } = body;
    
    console.log('DELETE request:', { at, sessionId, body });
    
    if (!at) {
      return NextResponse.json({ ok: false, error: 'Missing entry timestamp' }, { status: 400 });
    }

    const sid = sessionId || await getDefaultSessionId();
    console.log(`Attempting to delete entry at=${at} from session=${sid}`);
    
    const removed = await deleteEntry(sid, at);

    console.log(`Delete result: removed=${removed}`);

    return NextResponse.json({ ok: true, removed: removed ? 1 : 0 });
  } catch (error) {
    console.error('Leaderboard DELETE error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ ok: false, error: 'Bad request', details: error.message }, { status: 400 });
  }
}
