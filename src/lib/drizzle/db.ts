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

  let url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "[DB] DATABASE_URL is not set. Add it to .env.local to enable database features."
    );
  }

  // AUTO-REPAIR: Convert pooler URL to direct URL if it's a known Supabase pooler pattern
  // Pooler: postgresql://postgres.REF:PW@aws-0-REGION.pooler.supabase.com:5432/postgres
  // Direct: postgresql://postgres:PW@db.REF.supabase.co:5432/postgres
  if (url.includes("pooler.supabase.com")) {
    const match = url.match(/postgresql:\/\/postgres\.([^:]+):([^@]+)@aws-0-[^.]+\.pooler\.supabase\.com:5432\/postgres/);
    if (match) {
      const [, projectRef, password] = match;
      const directUrl = `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`;
      console.log(`[DB] Auto-converted pooler URL to direct URL for stability`);
      url = directUrl;
    }
  }

  const client = postgres(url, { 
    ssl: { rejectUnauthorized: false },
    prepare: false,
    connect_timeout: 10,
    max: 1 // Keep connections low in serverless
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
