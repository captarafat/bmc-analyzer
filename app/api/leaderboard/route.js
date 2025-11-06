import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getDefaultSessionId } from '../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId') || await getDefaultSessionId();

    const entries = await sql`
      SELECT 
        id,
        name,
        idea,
        score,
        blocks,
        analysis,
        created_at as "at"
      FROM entries
      WHERE session_id = ${sessionId}
      ORDER BY score DESC, created_at ASC
    `;

    const leaderboard = entries.rows.map((row) => ({
      name: row.name,
      idea: row.idea,
      score: Number(row.score),
      at: Number(row.at),
      blocks: row.blocks,
      analysis: row.analysis,
    }));

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
      return NextResponse.json({ ok: false, error: 'Missing entry ID' }, { status: 400 });
    }

    const sid = sessionId || await getDefaultSessionId();
    
    const result = await sql`
      DELETE FROM entries
      WHERE created_at = ${at} AND session_id = ${sid}
    `;

    return NextResponse.json({ ok: true, removed: result.rowCount || 0 });
  } catch (error) {
    console.error('Leaderboard DELETE error:', error);
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
}
