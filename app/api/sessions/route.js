import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { initDatabase, getDefaultSessionId } from '../../../lib/db';

export async function GET() {
  try {
    await initDatabase();
    
    const sessions = await sql`
      SELECT 
        id,
        name,
        created_at as "createdAt",
        (SELECT COUNT(*) FROM entries WHERE entries.session_id = sessions.id) as entry_count
      FROM sessions
      ORDER BY display_order DESC, created_at DESC
    `;

    const list = sessions.rows.map((row) => ({
      id: row.id,
      name: row.name,
      createdAt: Number(row.createdAt),
      entryCount: Number(row.entry_count || 0),
    }));

    return NextResponse.json({ sessions: list });
  } catch (error) {
    console.error('Sessions GET error:', error);
    return NextResponse.json({ sessions: [] });
  }
}

export async function POST(request) {
  try {
    await initDatabase();
    
    const body = await request.json().catch(() => ({}));
    const name = String(body?.name || '').trim() || `Sesi ${Date.now()}`;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const createdAt = Date.now();

    await sql`
      INSERT INTO sessions (id, name, created_at, display_order)
      VALUES (${id}, ${name}, ${createdAt}, ${createdAt})
    `;

    return NextResponse.json({ ok: true, session: { id, name, createdAt } });
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

    // Check if session exists
    const check = await sql`SELECT id FROM sessions WHERE id = ${id} LIMIT 1`;
    if (check.rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'Sesi tidak wujud' }, { status: 400 });
    }

    // Delete session (entries will be cascade deleted)
    await sql`DELETE FROM sessions WHERE id = ${id}`;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Sessions DELETE error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to delete session' }, { status: 500 });
  }
}
