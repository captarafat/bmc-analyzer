import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const sessionId = body?.sessionId;
  if (globalThis.sessions && sessionId && globalThis.sessions.byId?.[sessionId]) {
    globalThis.sessions.byId[sessionId].entries = [];
  } else if (globalThis.sessions) {
    const current = globalThis.sessions.order?.[0];
    if (current) globalThis.sessions.byId[current].entries = [];
  } else {
    globalThis.leaderboard = [];
  }
  return NextResponse.json({ ok: true });
}


