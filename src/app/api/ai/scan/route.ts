import { NextResponse } from "next/server";
import { ViralBrain } from "@/lib/ai/brain";

/**
 * API ENDPOINT: TREND SCANNER
 * Periodically scans for new viral patterns.
 */

export async function GET(req: Request) {
  try {
    const brain = new ViralBrain();
    const platforms = ["tiktok", "instagram"];
    const niches = ["AI SaaS", "Fitness Tech", "Finance"];
    
    const results = [];

    for (const platform of platforms) {
      for (const niche of niches) {
        console.log(`[SCANNER]: Scanning ${niche} on ${platform}...`);
        const trendsRaw = await brain.analyzeTrends(niche, platform);
        const trends = typeof trendsRaw === 'string' ? JSON.parse(trendsRaw) : trendsRaw;

        // Assuming trends is an array of objects
        if (Array.isArray(trends)) {
          for (const trend of trends) {
            await brain.saveTrend({
              platform,
              type: trend.type || "pattern",
              details: trend,
              score: trend.viralityScore || 80
            });
          }
        }
        
        results.push({ platform, niche, count: trends?.length || 0 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      scanned: results,
      message: "Trends scanned and persisted." 
    });

  } catch (error: any) {
    console.error("[SCAN_ERROR]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
