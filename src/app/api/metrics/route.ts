import { NextResponse } from "next/server";
import { db, isDatabaseConfigured } from "@/lib/drizzle/db";
import { growthMetrics } from "@/lib/drizzle/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ message: "Database not configured (demo mode)", data: [] });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Basic UUID validation to prevent DB errors on dummy strings like "test"
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.log(`[METRICS_API] Invalid UUID format: ${userId}. Returning empty data.`);
      return NextResponse.json([]);
    }

    const latestMetrics = await db
      .select()
      .from(growthMetrics)
      .where(eq(growthMetrics.userId, userId))
      .orderBy(desc(growthMetrics.recordedAt))
      .limit(7);

    return NextResponse.json(latestMetrics);
  } catch (error: any) {
    console.error("[METRICS_API_ERROR]:", error);
    return NextResponse.json({ 
      error: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      internalQuery: error.query
    }, { status: 500 });
  }
}
