
import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/drizzle/db";

export async function GET() {
  return NextResponse.json({
    databaseConfigured: isDatabaseConfigured(),
    databaseUrlSet: !!process.env.DATABASE_URL,
    databaseUrlPreview: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 15)}...` : "not-set",
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV || "local"
  });
}
