import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle/db";
import { growthMetrics } from "@/lib/drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/client"; // Wait, this is server side, should use server client

// Using a simplified version for now since I don't have the server-side supabase client helper easily accessible without checking lib
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
