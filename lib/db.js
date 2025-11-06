import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Get or create default session
export async function getDefaultSessionId() {
  if (!redis) return 'default';
  
  try {
    const defaultExists = await redis.exists('session:default');
    if (!defaultExists) {
      await redis.hset('session:default', {
        id: 'default',
        name: 'Sesi Utama',
        createdAt: Date.now(),
        displayOrder: 0,
      });
      await redis.zadd('sessions:order', { score: 0, member: 'default' });
    }
    return 'default';
  } catch (error) {
    console.error('getDefaultSessionId error:', error);
    return 'default';
  }
}

// Get all sessions
export async function getAllSessions() {
  if (!redis) return [];
  
  try {
    const sessionIds = await redis.zrange('sessions:order', 0, -1, { rev: true });
    if (sessionIds.length === 0) {
      await getDefaultSessionId();
      return [{ id: 'default', name: 'Sesi Utama', createdAt: Date.now(), entryCount: 0 }];
    }
    
    const sessions = await Promise.all(
      sessionIds.map(async (id) => {
        const session = await redis.hgetall(`session:${id}`);
        const entryCount = await redis.zcard(`entries:${id}`);
        return {
          id: session.id || id,
          name: session.name || 'Sesi',
          createdAt: Number(session.createdAt || Date.now()),
          entryCount: entryCount || 0,
        };
      })
    );
    
    return sessions;
  } catch (error) {
    console.error('getAllSessions error:', error);
    return [];
  }
}

// Get entries for a session
export async function getSessionEntries(sessionId) {
  if (!redis) return [];
  
  try {
    const entryIds = await redis.zrange(`entries:${sessionId}`, 0, -1, { rev: true, by: 'score' });
    if (entryIds.length === 0) return [];
    
    const entries = await Promise.all(
      entryIds.map(async (id) => {
        const entry = await redis.hgetall(`entry:${id}`);
        return {
          name: entry.name || '',
          idea: entry.idea || '',
          score: Number(entry.score || 0),
          at: Number(entry.at || 0),
          blocks: entry.blocks ? JSON.parse(entry.blocks) : {},
          analysis: entry.analysis ? JSON.parse(entry.analysis) : {},
        };
      })
    );
    
    return entries.sort((a, b) => b.score - a.score || a.at - b.at);
  } catch (error) {
    console.error('getSessionEntries error:', error);
    return [];
  }
}

// Save entry
export async function saveEntry(sessionId, entryData) {
  if (!redis) return;
  
  try {
    const entryId = entryData.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    
    await redis.hset(`entry:${entryId}`, {
      id: entryId,
      sessionId,
      name: entryData.name,
      idea: entryData.idea,
      score: entryData.score,
      blocks: JSON.stringify(entryData.blocks),
      analysis: JSON.stringify(entryData.analysis),
      at: entryData.at,
    });
    
    // Add to sorted set (score for sorting, timestamp as tiebreaker)
    await redis.zadd(`entries:${sessionId}`, {
      score: entryData.score,
      member: entryId,
    });
    
    return entryId;
  } catch (error) {
    console.error('saveEntry error:', error);
  }
}

// Delete entry
export async function deleteEntry(sessionId, entryAt) {
  if (!redis) return false;
  
  try {
    const entryIds = await redis.zrange(`entries:${sessionId}`, 0, -1);
    for (const id of entryIds) {
      const entry = await redis.hgetall(`entry:${id}`);
      if (Number(entry.at) === entryAt) {
        await redis.del(`entry:${id}`);
        await redis.zrem(`entries:${sessionId}`, id);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('deleteEntry error:', error);
    return false;
  }
}

// Create session
export async function createSession(name) {
  if (!redis) return null;
  
  try {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const createdAt = Date.now();
    
    await redis.hset(`session:${id}`, {
      id,
      name,
      createdAt,
      displayOrder: createdAt,
    });
    
    await redis.zadd('sessions:order', { score: createdAt, member: id });
    
    return { id, name, createdAt };
  } catch (error) {
    console.error('createSession error:', error);
    return null;
  }
}

// Delete session
export async function deleteSession(sessionId) {
  if (!redis) return false;
  
  try {
    // Delete all entries in session
    const entryIds = await redis.zrange(`entries:${sessionId}`, 0, -1);
    for (const id of entryIds) {
      await redis.del(`entry:${id}`);
    }
    await redis.del(`entries:${sessionId}`);
    
    // Delete session
    await redis.del(`session:${sessionId}`);
    await redis.zrem('sessions:order', sessionId);
    
    return true;
  } catch (error) {
    console.error('deleteSession error:', error);
    return false;
  }
}

// Reset session entries
export async function resetSession(sessionId) {
  if (!redis) return;
  
  try {
    const entryIds = await redis.zrange(`entries:${sessionId}`, 0, -1);
    for (const id of entryIds) {
      await redis.del(`entry:${id}`);
    }
    await redis.del(`entries:${sessionId}`);
  } catch (error) {
    console.error('resetSession error:', error);
  }
}

export { redis };
