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

export async function GET() {
  ensureSessions();
  const list = globalThis.sessions.order.map((id) => globalThis.sessions.byId[id]);
  return NextResponse.json({ sessions: list });
}

export async function POST(request) {
  ensureSessions();
  const body = await request.json().catch(() => ({}));
  const name = String(body?.name || '').trim() || `Sesi ${globalThis.sessions.order.length + 1}`;
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  globalThis.sessions.byId[id] = { id, name, createdAt: Date.now(), entries: [] };
  globalThis.sessions.order.unshift(id);
  return NextResponse.json({ ok: true, session: globalThis.sessions.byId[id] });
}

export async function DELETE(request) {
  ensureSessions();
  const body = await request.json().catch(() => ({}));
  const id = body?.id;
  if (!id || !globalThis.sessions.byId[id]) {
    return NextResponse.json({ ok: false, error: 'Sesi tidak wujud' }, { status: 400 });
  }
  delete globalThis.sessions.byId[id];
  globalThis.sessions.order = globalThis.sessions.order.filter((x) => x !== id);
  return NextResponse.json({ ok: true });
}


