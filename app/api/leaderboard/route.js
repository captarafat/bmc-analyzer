import { NextResponse } from 'next/server';

function ensureSessions() {
  if (!globalThis.sessions) {
    const defaultId = 'default';
    globalThis.sessions = {
      order: [defaultId],
      byId: {
        [defaultId]: { id: defaultId, name: 'Sesi Utama', createdAt: Date.now(), entries: [] },
      },
    };
  }
}

export async function GET(request) {
  ensureSessions();
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId') || globalThis.sessions.order[0];
  const session = globalThis.sessions.byId[sessionId];
  const sorted = [...(session?.entries || [])].sort((a, b) => b.score - a.score || a.at - b.at);
  return NextResponse.json({ leaderboard: sorted, sessionId });
}

export async function DELETE(request) {
  ensureSessions();
  try {
    const { at, sessionId } = await request.json();
    const sid = sessionId && globalThis.sessions.byId[sessionId] ? sessionId : globalThis.sessions.order[0];
    const entries = globalThis.sessions.byId[sid].entries;
    const before = entries.length;
    globalThis.sessions.byId[sid].entries = entries.filter((item) => item.at !== at);
    const removed = before - globalThis.sessions.byId[sid].entries.length;
    return NextResponse.json({ ok: true, removed });
  } catch (_e) {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
}


