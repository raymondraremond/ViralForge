import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * DATABASE CONNECTION
 * Lazy initialization — only connects when DATABASE_URL is present.
 * Prevents build/runtime crashes when the key isn't set yet.
 */

let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (_db) return _db;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "[DB] DATABASE_URL is not set. Add it to .env.local to enable database features."
    );
  }

  const client = postgres(url, { 
    ssl: { rejectUnauthorized: false },
    prepare: false // Disable prepared statements for better pooler compatibility if needed
  });
  _db = drizzle(client, { schema });
  return _db;
}

// Proxy that lazily initializes on first access
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    const instance = getDb();
    return (instance as any)[prop];
  },
});

/**
 * Check if the database is configured (for demo mode fallbacks)
 */
export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}
