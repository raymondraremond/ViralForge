import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle/db";
import { trends } from "@/lib/drizzle/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const allTrends = await db
      .select()
      .from(trends)
      .where(eq(trends.isActive, true))
      .orderBy(desc(trends.discoveredAt))
      .limit(20);

    return NextResponse.json(allTrends);
  } catch (error: any) {
    console.error("[TRENDS_API_ERROR]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
