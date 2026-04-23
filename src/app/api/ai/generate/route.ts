import { NextResponse } from "next/server";
import { ViralBrain } from "@/lib/ai/brain";
import { MediaService } from "@/lib/ai/services";
import { createContentItem } from "@/lib/actions";

/**
 * API ENDPOINT: TRIGGER AUTONOMOUS RUN
 * This orchestrates the Brain -> Production pipeline.
 */

export async function POST(req: Request) {
  try {
    const { userId, niche, platform, isAutonomous } = await req.json();

    const brain = new ViralBrain();
    const media = new MediaService();

    // 1. Analyze Trends
    console.log("[BRAIN]: Analyzing trends...");
    const trends = await brain.analyzeTrends(niche, platform);

    // 2. Generate Strategy & Script
    console.log("[BRAIN]: Generating strategy...");
    const strategyRaw = await brain.generateContentStrategy(trends, niche);
    const strategy = typeof strategyRaw === 'string' ? JSON.parse(strategyRaw) : strategyRaw;

    // 3. Produce Media (Video/Audio)
    console.log("[BRAIN]: Producing media assets...");
    const assets = await media.produceContent(strategy);

    // 4. Save to Database
    const newItem = await createContentItem({
      userId,
      title: strategy.title || "Autonomous Post",
      hook: strategy.hook,
      scriptContent: strategy.voiceover,
      mediaUrl: assets.finalMediaUrl,
      mediaType: "video",
      status: isAutonomous ? "scheduled" : "brain_review",
      scheduledAt: isAutonomous ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
      aiMetadata: {
        engine: "Gemini 1.5 Flash",
        trend_context: trends
      }
    });

    return NextResponse.json({ 
      success: true, 
      item: newItem,
      message: "Autonomous generation complete." 
    });

  } catch (error: any) {
    console.error("[API_ERROR]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
