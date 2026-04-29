import { NextResponse } from "next/server";
import { ViralBrain } from "@/lib/ai/brain";
import { db, isDatabaseConfigured } from "@/lib/drizzle/db";
import { trends } from "@/lib/drizzle/schema";
import { desc, eq } from "drizzle-orm";

/**
 * API ENDPOINT: TREND SCANNER
 * Scans for viral trends using AI for the given niche/platform.
 * GET: Fetch saved trends from DB
 * POST: Run a new scan for specific niche/platform
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const niche = searchParams.get("niche") || "AI & Technology";
    const platform = searchParams.get("platform") || "tiktok";
    const live = searchParams.get("live");

    // If "live" param is set, run a fresh AI scan
    if (live === "true") {
      const brain = new ViralBrain();
      const discovered = await brain.analyzeTrends(niche, platform);
      
      // Save to DB
      const saved = [];
      if (isDatabaseConfigured()) {
        for (const trend of discovered) {
          try {
            const result = await brain.saveTrend({
              platform,
              trendType: trend.trendType || "pattern",
              trendData: trend.trendData || trend,
              viralityScore: trend.viralityScore || 75
            });
            if (result) saved.push(result[0]);
          } catch (e) {
            console.error("[SCAN] Save trend error:", e);
          }
        }
      }

      return NextResponse.json({
        success: true,
        scanned: [{ platform, niche, count: discovered.length }],
        trends: discovered,
        saved: saved.length,
        message: `Discovered ${discovered.length} trends for ${niche} on ${platform}`
      });
    }

    // Default: just scan with hardcoded niches (original behavior but improved)
    const brain = new ViralBrain();
    const platforms = [platform];
    const niches = [niche];

    const results = [];
    const allDiscovered: any[] = [];

    for (const p of platforms) {
      for (const n of niches) {
        console.log(`[SCANNER] Scanning ${n} on ${p}...`);
        const discovered = await brain.analyzeTrends(n, p);

        if (Array.isArray(discovered)) {
          for (const trend of discovered) {
            try {
              await brain.saveTrend({
                platform: p,
                trendType: trend.trendType || "pattern",
                trendData: trend.trendData || trend,
                viralityScore: trend.viralityScore || 75
              });
            } catch (e) {
              console.error("[SCAN] Error saving trend:", e);
            }
            allDiscovered.push({ ...trend, platform: p });
          }
        }

        results.push({ platform: p, niche: n, count: discovered?.length || 0 });
      }
    }

    return NextResponse.json({
      success: true,
      scanned: results,
      trends: allDiscovered,
      message: `Trends scanned and persisted. Found ${allDiscovered.length} total trends.`
    });

  } catch (error: any) {
    console.error("[SCAN_ERROR]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
