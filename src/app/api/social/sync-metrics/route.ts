import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle/db";
import { socialAccounts, growthMetrics } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { ApifyService } from "@/lib/social/apify";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }

    const accounts = await db.select().from(socialAccounts).where(eq(socialAccounts.userId, userId));
    const apify = new ApifyService();
    const results = [];

    for (const account of accounts) {
      let metrics = null;
      if (account.platform.toLowerCase() === "instagram") {
        metrics = await apify.getInstagramMetrics(account.handle);
      } else if (account.platform.toLowerCase() === "tiktok") {
        metrics = await apify.getTikTokMetrics(account.handle);
      }

      if (metrics) {
        // Save to growth_metrics
        await db.insert(growthMetrics).values({
          userId,
          socialAccountId: account.id,
          followerCount: metrics.followerCount,
          viewsCount: Number(metrics.avgViews) || 0,
          engagementRate: metrics.engagementRate.toString(),
          recordedAt: new Date(),
        });
        
        results.push({ platform: account.platform, success: true, followers: metrics.followerCount });
      } else {
        results.push({ platform: account.platform, success: false, error: "Failed to scrape" });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("[SYNC_METRICS_ERROR]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
