import { sql } from '@vercel/postgres';

// Initialize database schema (idempotent)
export async function initDatabase() {
  try {
    // Create sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at BIGINT NOT NULL,
        display_order INTEGER DEFAULT 0
      )
    `;

    // Create entries table
    await sql`
      CREATE TABLE IF NOT EXISTS entries (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        idea TEXT NOT NULL,
        score NUMERIC(3,1) NOT NULL,
        blocks JSONB NOT NULL,
        analysis JSONB NOT NULL,
        created_at BIGINT NOT NULL
      )
    `;

    // Create index for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_entries_session_id ON entries(session_id)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries(created_at DESC)
    `;

    // Ensure default session exists
    const defaultSession = await sql`
      SELECT id FROM sessions WHERE id = 'default' LIMIT 1
    `;
    if (defaultSession.rows.length === 0) {
      await sql`
        INSERT INTO sessions (id, name, created_at, display_order)
        VALUES ('default', 'Sesi Utama', ${Date.now()}, 0)
      `;
    }
  } catch (error) {
    console.error('Database init error:', error);
    // Don't throw - allow app to continue with fallback
  }
}

// Get or create default session
export async function getDefaultSessionId() {
  try {
    const result = await sql`
      SELECT id FROM sessions ORDER BY display_order DESC, created_at DESC LIMIT 1
    `;
    if (result.rows.length > 0) {
      return result.rows[0].id;
    }
    // Create default if none exists
    await sql`
      INSERT INTO sessions (id, name, created_at, display_order)
      VALUES ('default', 'Sesi Utama', ${Date.now()}, 0)
      ON CONFLICT (id) DO NOTHING
    `;
    return 'default';
  } catch (error) {
    console.error('getDefaultSessionId error:', error);
    return 'default';
  }
}

