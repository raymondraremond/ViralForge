import { NextResponse } from "next/server";
import { db, isDatabaseConfigured } from "@/lib/drizzle/db";
import { contentItems } from "@/lib/drizzle/schema";
import { eq, and, lte } from "drizzle-orm";
import { postContentToSocial } from "@/lib/actions";

/**
 * CRON JOB: POST SCHEDULED CONTENT
 * This endpoint should be called periodically (e.g., every 5-15 mins) by a scheduler.
 * It finds all content items with 'scheduled' status that are due and posts them.
 */

export async function GET(req: Request) {
  // Simple auth check for cron (in prod, use CRON_SECRET)
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  
  if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const now = new Date();
    
    // Find items that are 'scheduled' and scheduledAt <= now
    const scheduledItems = await db.select()
      .from(contentItems)
      .where(
        and(
          eq(contentItems.status, "scheduled"),
          lte(contentItems.scheduledAt, now)
        )
      );
    
    console.log(`[CRON_POSTER]: Found ${scheduledItems.length} items to post.`);
    
    const results = [];
    
    for (const item of scheduledItems) {
      try {
        console.log(`[CRON_POSTER]: Posting item "${item.title}" (ID: ${item.id}) for user ${item.userId}`);
        
        // Use the existing action to post
        const result = await postContentToSocial(item.id, item.userId);
        
        results.push({ 
          id: item.id, 
          title: item.title, 
          status: result.success ? "success" : "failed",
          error: result.error
        });
      } catch (err: any) {
        results.push({ id: item.id, title: item.title, status: "error", error: err.message });
      }
    }

    return NextResponse.json({ 
      message: "Scheduled posting cron complete",
      results,
      count: scheduledItems.length
    });

  } catch (error: any) {
    console.error("[CRON_POSTER_ERROR]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
