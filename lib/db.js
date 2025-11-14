import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Log Redis status (only in development)
if (process.env.NODE_ENV === 'development') {
  if (redis) {
    console.log('✅ Redis initialized successfully');
  } else {
    console.warn('⚠️  Redis not initialized - missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN');
  }
}

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
  if (!redis) {
    console.warn('Redis not initialized in getSessionEntries');
    return [];
  }
  
  try {
    // Get all entry IDs from sorted set (sorted by score descending)
    const entryIds = await redis.zrange(`entries:${sessionId}`, 0, -1, { rev: true });
    console.log(`Found ${entryIds.length} entries for session ${sessionId}`);
    
    if (entryIds.length === 0) {
      console.log(`No entries found for session ${sessionId}`);
      return [];
    }
    
    const entries = await Promise.all(
      entryIds.map(async (id) => {
        try {
          const entry = await redis.hgetall(`entry:${id}`);
          if (!entry || !entry.id) {
            console.warn(`Entry ${id} not found or empty`);
            return null;
          }
          
          // Parse blocks - handle both string and object
          let blocks = {};
          if (entry.blocks !== undefined && entry.blocks !== null) {
            if (typeof entry.blocks === 'string') {
              try {
                // Skip if it's the string "[object Object]" which means object was incorrectly stringified
                if (entry.blocks === '[object Object]') {
                  console.warn(`Entry ${id} has incorrectly stringified blocks, skipping`);
                  blocks = {};
                } else {
                  // Remove any leading/trailing whitespace
                  const cleaned = entry.blocks.trim();
                  if (cleaned && cleaned !== 'null' && cleaned !== 'undefined' && cleaned.startsWith('{')) {
                    blocks = JSON.parse(cleaned);
                  }
                }
              } catch (e) {
                console.warn(`Error parsing blocks for ${id}:`, e, 'Raw value:', entry.blocks);
                blocks = {};
              }
            } else if (typeof entry.blocks === 'object' && !Array.isArray(entry.blocks)) {
              // Already an object, use it directly
              blocks = entry.blocks;
            }
          }
          
          // Parse analysis - handle both string and object
          let analysis = {};
          if (entry.analysis !== undefined && entry.analysis !== null) {
            if (typeof entry.analysis === 'string') {
              try {
                // Skip if it's the string "[object Object]" which means object was incorrectly stringified
                if (entry.analysis === '[object Object]') {
                  console.warn(`Entry ${id} has incorrectly stringified analysis, skipping`);
                  analysis = {};
                } else {
                  // Remove any leading/trailing whitespace
                  const cleaned = entry.analysis.trim();
                  if (cleaned && cleaned !== 'null' && cleaned !== 'undefined' && cleaned.startsWith('{')) {
                    analysis = JSON.parse(cleaned);
                  }
                }
              } catch (e) {
                console.warn(`Error parsing analysis for ${id}:`, e, 'Raw value:', entry.analysis);
                analysis = {};
              }
            } else if (typeof entry.analysis === 'object' && !Array.isArray(entry.analysis)) {
              // Already an object, use it directly
              analysis = entry.analysis;
            }
          }
          
          return {
            name: entry.name || '',
            idea: entry.idea || '',
            score: Number(entry.score || 0),
            at: Number(entry.at || 0),
            blocks,
            analysis,
          };
        } catch (parseError) {
          console.error(`Error parsing entry ${id}:`, parseError);
          console.error('Entry data:', entry);
          return null;
        }
      })
    );
    
    // Filter out null entries and sort
    const validEntries = entries.filter(e => e !== null);
    const sorted = validEntries.sort((a, b) => b.score - a.score || a.at - b.at);
    
    console.log(`Returning ${sorted.length} valid entries`);
    return sorted;
  } catch (error) {
    console.error('getSessionEntries error:', error);
    console.error('Error stack:', error.stack);
    return [];
  }
}

// Save entry
export async function saveEntry(sessionId, entryData) {
  if (!redis) {
    console.error('Redis not initialized - check UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
    return null;
  }
  
  try {
    // Ensure session exists first
    const sessionExists = await redis.exists(`session:${sessionId}`);
    if (!sessionExists) {
      await redis.hset(`session:${sessionId}`, {
        id: sessionId,
        name: sessionId === 'default' ? 'Sesi Utama' : 'Sesi Baru',
        createdAt: Date.now(),
        displayOrder: 0,
      });
      await redis.zadd('sessions:order', { score: 0, member: sessionId });
    }
    
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
    
    // Add to sorted set (score for sorting)
    // Use score as the score value, and entryId as member
    // For tie-breaking, we'll use negative timestamp so higher timestamp = higher priority
    const sortScore = entryData.score * 1000000 + (999999 - (entryData.at % 1000000));
    await redis.zadd(`entries:${sessionId}`, {
      score: sortScore,
      member: entryId,
    });
    
    // Verify it was saved
    const verify = await redis.exists(`entry:${entryId}`);
    const verifySet = await redis.zscore(`entries:${sessionId}`, entryId);
    
    console.log(`Entry saved: ${entryId} to session: ${sessionId}`, {
      entryExists: verify,
      inSet: verifySet !== null,
      score: entryData.score,
    });
    
    return entryId;
  } catch (error) {
    console.error('saveEntry error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      sessionId,
      entryData: { name: entryData.name, idea: entryData.idea },
    });
    throw error; // Re-throw so caller knows it failed
  }
}

// Delete entry
export async function deleteEntry(sessionId, entryAt) {
  if (!redis) {
    console.error('Redis not initialized in deleteEntry');
    return false;
  }
  
  try {
    console.log(`Deleting entry with at=${entryAt} from session=${sessionId}`);
    const entryIds = await redis.zrange(`entries:${sessionId}`, 0, -1);
    console.log(`Found ${entryIds.length} entries in session ${sessionId}`);
    
    for (const id of entryIds) {
      const entry = await redis.hgetall(`entry:${id}`);
      const entryTimestamp = Number(entry.at || 0);
      const targetTimestamp = Number(entryAt);
      
      console.log(`Checking entry ${id}: entry.at=${entryTimestamp}, target=${targetTimestamp}, match=${entryTimestamp === targetTimestamp}`);
      
      if (entryTimestamp === targetTimestamp) {
        console.log(`Deleting entry ${id}`);
        await redis.del(`entry:${id}`);
        await redis.zrem(`entries:${sessionId}`, id);
        console.log(`Successfully deleted entry ${id}`);
        return true;
      }
    }
    
    console.warn(`Entry with at=${entryAt} not found in session ${sessionId}`);
    return false;
  } catch (error) {
    console.error('deleteEntry error:', error);
    console.error('Error details:', { sessionId, entryAt, error: error.message, stack: error.stack });
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

// Get active session (for student submissions)
export async function getActiveSessionId() {
  if (!redis) return await getDefaultSessionId();
  
  try {
    const activeId = await redis.get('active:session');
    if (activeId) {
      // Verify session exists
      const exists = await redis.exists(`session:${activeId}`);
      if (exists) {
        return activeId;
      }
    }
    // If no active session or it doesn't exist, use default
    const defaultId = await getDefaultSessionId();
    // Set default as active if not set
    await redis.set('active:session', defaultId);
    return defaultId;
  } catch (error) {
    console.error('getActiveSessionId error:', error);
    return await getDefaultSessionId();
  }
}

// Set active session
export async function setActiveSession(sessionId) {
  if (!redis) return false;
  
  try {
    // Verify session exists
    const exists = await redis.exists(`session:${sessionId}`);
    if (!exists) {
      return false;
    }
    await redis.set('active:session', sessionId);
    return true;
  } catch (error) {
    console.error('setActiveSession error:', error);
    return false;
  }
}

export { redis };
