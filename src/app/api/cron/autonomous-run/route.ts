import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle/db";
import { profiles } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * CRON JOB: AUTONOMOUS RUNNER
 * This endpoint should be called periodically (e.g., daily) by a scheduler.
 * It finds all users with isAutonomous enabled and triggers a generation run.
 */

export async function GET(req: Request) {
  // Simple auth check for cron (in prod, use CRON_SECRET)
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  
  if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const autoProfiles = await db.select().from(profiles).where(eq(profiles.isAutonomous, true));
    
    console.log(`[CRON]: Starting autonomous run for ${autoProfiles.length} profiles.`);
    
    const results = [];
    
    for (const profile of autoProfiles) {
      try {
        // Trigger the internal generate logic
        // We call the local API route or the service directly
        // For simplicity, we'll assume a POST to our own generate endpoint
        const res = await fetch(`${new URL(req.url).origin}/api/ai/generate`, {
          method: "POST",
          body: JSON.stringify({
            userId: profile.id,
            niche: profile.niche || "AI & Tech",
            platform: "tiktok", // Defaulting to TikTok for auto-runs
            isAutonomous: true
          })
        });
        const data = await res.json();
        results.push({ userId: profile.id, status: data.success ? "success" : "failed" });
      } catch (err) {
        results.push({ userId: profile.id, status: "error", error: err });
      }
    }

    return NextResponse.json({ 
      message: "Autonomous cron complete",
      results
    });

  } catch (error: any) {
    console.error("[CRON_ERROR]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
