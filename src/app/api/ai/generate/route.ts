import { NextResponse } from "next/server";
import { ViralBrain } from "@/lib/ai/brain";
import { db, isDatabaseConfigured } from "@/lib/drizzle/db";
import { contentItems, socialAccounts } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * API ENDPOINT: GENERATE CONTENT
 * Orchestrates the Brain pipeline: Trends → Strategy → Content Saved.
 * Returns the generated content with full details.
 */

export async function POST(req: Request) {
  try {
    const { userId, niche, platform, isAutonomous, postToSocial } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }

    console.log(`[API] Generate content: niche=${niche}, platform=${platform}, userId=${userId}`);

    const brain = new ViralBrain();

    // Run the full AI pipeline
    const result = await brain.generateFullContent(
      niche || "AI & Technology",
      platform || "tiktok"
    );

    const { strategy, trends } = result;

    // Save content to database
    let savedItem = null;
    if (isDatabaseConfigured()) {
      try {
        const insertData = {
          userId,
          title: strategy.title || "AI Generated Post",
          hook: strategy.hook || "",
          scriptContent: strategy.voiceover || "",
          mediaUrl: null as string | null,
          mediaType: "text" as string,
          status: isAutonomous ? "scheduled" : "brain_review",
          scheduledAt: isAutonomous ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
          aiMetadata: {
            visual_prompt: strategy.visual_prompt,
            caption: strategy.caption,
            hashtags: strategy.hashtags,
            style: strategy.style,
            posting_tips: strategy.posting_tips,
            trends_used: trends.length,
            generated_at: result.generatedAt,
            platform: result.platform,
            niche: result.niche,
          }
        };

        const inserted = await db.insert(contentItems).values(insertData).returning();
        savedItem = inserted[0];
        console.log(`[API] Content saved to DB: ${savedItem?.id} — "${savedItem?.title}"`);
      } catch (dbError: any) {
        console.error("[API] DB insert error:", dbError.message);
        // Continue — return the generated content even if DB save fails
      }
    }

    // If postToSocial is requested, attempt to post
    let postResult = null;
    if (postToSocial && savedItem && isDatabaseConfigured()) {
      try {
        const accounts = await db.select()
          .from(socialAccounts)
          .where(eq(socialAccounts.userId, userId));

        const targetAccount = accounts.find(a => 
          a.platform.toLowerCase() === platform.toLowerCase()
        );

        if (targetAccount) {
          postResult = {
            posted: true,
            platform: targetAccount.platform,
            handle: targetAccount.handle,
            message: `Content queued for posting to ${targetAccount.handle} on ${targetAccount.platform}`
          };

          // Update content status to scheduled
          await db.update(contentItems)
            .set({ 
              status: "scheduled",
              socialAccountId: targetAccount.id,
              scheduledAt: new Date(Date.now() + 60 * 1000) // Schedule 1 min from now
            })
            .where(eq(contentItems.id, savedItem.id));
        }
      } catch (postError: any) {
        console.error("[API] Post scheduling error:", postError.message);
      }
    }

    return NextResponse.json({
      success: true,
      item: savedItem,
      strategy,
      trends: trends.slice(0, 3),
      postResult,
      message: savedItem 
        ? `Content generated and saved: "${strategy.title}"` 
        : `Content generated (not saved — DB may be unavailable)`
    });

  } catch (error: any) {
    console.error("[API] Generate error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Unknown error during generation" 
    }, { status: 500 });
  }
}
