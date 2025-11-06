import { NextResponse } from 'next/server';
import { redis, getDefaultSessionId } from '../../../lib/db';

export async function GET(request) {
  if (!redis) {
    return NextResponse.json({ error: 'Redis not initialized' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId') || await getDefaultSessionId();

    // Get all keys related to this session
    const sessionKey = `session:${sessionId}`;
    const entriesKey = `entries:${sessionId}`;

    // Check session exists
    const sessionExists = await redis.exists(sessionKey);
    const sessionData = sessionExists ? await redis.hgetall(sessionKey) : null;

    // Get entry IDs from sorted set
    const entryIds = await redis.zrange(entriesKey, 0, -1, { rev: true });
    
    // Get all entry data
    const entries = await Promise.all(
      entryIds.map(async (id) => {
        const entry = await redis.hgetall(`entry:${id}`);
        const score = await redis.zscore(entriesKey, id);
        return {
          id,
          entry,
          score,
          entryExists: entry && entry.id ? true : false,
        };
      })
    );

    // Count total entries
    const totalEntries = await redis.zcard(entriesKey);

    return NextResponse.json({
      sessionId,
      sessionExists,
      sessionData,
      totalEntries,
      entryIds,
      entries,
      summary: {
        sessionKey,
        entriesKey,
        entryCount: entryIds.length,
        validEntries: entries.filter(e => e.entryExists).length,
      },
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

