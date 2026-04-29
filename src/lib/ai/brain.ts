import { GoogleGenerativeAI } from "@google/generative-ai";
import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/drizzle/db";
import { trends as trendsTable } from "@/lib/drizzle/schema";

/**
 * VIRALBRAIN: The Autonomous Growth Engine
 * -----------------------------------------
 * Multi-agent AI system that:
 * 1. Discovers viral trends using AI (with optional Apify scraping)
 * 2. Generates content strategies & scripts from those trends
 * 3. Creates text-based content ready for posting
 */

export class ViralBrain {
  private gemini: any;
  private openai: any;
  private anthropic: any;

  constructor() {
    if (process.env.GOOGLE_AI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
      this.gemini = genAI;
    }

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "missing") {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "missing") {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
  }

  /**
   * Safely parse JSON from AI response text
   */
  private safeJsonParse(text: string, type: "array" | "object" = "array"): any {
    try {
      // Try direct parse first
      return JSON.parse(text);
    } catch {
      // Try to extract JSON from markdown code blocks or mixed text
      const pattern = type === "array" ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/;
      const match = text.match(pattern);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch {
          console.error("[BRAIN] Failed to parse extracted JSON");
        }
      }
    }
    return type === "array" ? [] : {};
  }

  /**
   * Call Gemini with a prompt and return text
   */
  private async callGemini(prompt: string): Promise<string | null> {
    if (!this.gemini) return null;
    try {
      const model = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e: any) {
      console.error("[BRAIN] Gemini call failed:", e.message);
      return null;
    }
  }

  /**
   * Call Anthropic with a prompt and return text
   */
  private async callAnthropic(prompt: string): Promise<string | null> {
    if (!this.anthropic) return null;
    try {
      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      });
      return response.content
        .filter((block: any) => block.type === 'text')
        .map((block: any) => block.text)
        .join('\n');
    } catch (e: any) {
      console.error("[BRAIN] Anthropic call failed:", e.message);
      return null;
    }
  }

  /**
   * Call OpenAI with a prompt and return text
   */
  private async callOpenAI(prompt: string): Promise<string | null> {
    if (!this.openai) return null;
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
      });
      return response.choices[0].message.content;
    } catch (e: any) {
      console.error("[BRAIN] OpenAI call failed:", e.message);
      return null;
    }
  }

  /**
   * Try all AI providers in order until one succeeds
   */
  private async callAI(prompt: string): Promise<string | null> {
    // Try Gemini first (primary)
    let result = await this.callGemini(prompt);
    if (result) return result;

    // Fallback to Anthropic
    result = await this.callAnthropic(prompt);
    if (result) return result;

    // Fallback to OpenAI
    result = await this.callOpenAI(prompt);
    if (result) return result;

    console.error("[BRAIN] All AI providers failed. Check your API keys.");
    return null;
  }

  /**
   * Agent 1: Trend Analyst
   * Uses AI to discover current viral trends for the given niche/platform.
   * No external scrapers needed — works purely with AI knowledge.
   */
  async analyzeTrends(niche: string, platform: string): Promise<any[]> {
    console.log(`[BRAIN] Analyzing trends for "${niche}" on ${platform}...`);
    
    const trendPrompt = `You are an expert social media trend analyst. Analyze the CURRENT viral trends for the niche "${niche}" on ${platform} as of today.

Think about what kinds of content are going viral right now on ${platform} in the ${niche} space. Consider:
- Popular hashtags and challenges
- Trending audio/sound formats
- Visual hooks that stop scrollers
- Hot topics people are discussing
- Content formats getting high engagement

Return EXACTLY a JSON array of 3-5 trend objects. Each object must have:
- "trendType": one of "hashtag", "audio", "visual_hook", "topic", "challenge"
- "viralityScore": number 60-98 (how viral this trend is)
- "trendData": { "description": "clear description of the trend", "growth": "+XX%" estimated growth, "hashtags": ["relevant", "hashtags"], "why_viral": "brief explanation" }

Return ONLY the JSON array, no other text.`;

    const responseText = await this.callAI(trendPrompt);
    if (!responseText) {
      console.log("[BRAIN] No AI response for trends, using intelligent defaults");
      return this.getDefaultTrends(niche, platform);
    }

    const trends = this.safeJsonParse(responseText, "array");
    if (Array.isArray(trends) && trends.length > 0) {
      console.log(`[BRAIN] Discovered ${trends.length} trends`);
      return trends;
    }

    return this.getDefaultTrends(niche, platform);
  }

  /**
   * Fallback trends when AI is unavailable
   */
  private getDefaultTrends(niche: string, platform: string): any[] {
    return [
      {
        trendType: "visual_hook",
        viralityScore: 85,
        trendData: {
          description: `Pattern-interrupt hooks in ${niche} content`,
          growth: "+42%",
          hashtags: [niche.replace(/\s+/g, '').toLowerCase(), "viral", platform.toLowerCase()],
          why_viral: "Stops scrollers in the first 0.5 seconds"
        }
      },
      {
        trendType: "topic",
        viralityScore: 78,
        trendData: {
          description: `"Did you know?" educational clips about ${niche}`,
          growth: "+31%",
          hashtags: ["didyouknow", "mindblown", niche.replace(/\s+/g, '').toLowerCase()],
          why_viral: "High save and share rates on educational content"
        }
      },
      {
        trendType: "challenge",
        viralityScore: 72,
        trendData: {
          description: `Before/After transformation in ${niche}`,
          growth: "+25%",
          hashtags: ["transformation", "beforeafter", niche.replace(/\s+/g, '').toLowerCase()],
          why_viral: "Curiosity gap drives completion rates"
        }
      }
    ];
  }

  /**
   * Agent 2: Creative Strategist
   * Converts trends into a content script and strategy.
   */
  async generateContentStrategy(trends: any[], niche: string, platform: string = "tiktok") {
    console.log(`[BRAIN] Generating content strategy for ${niche} on ${platform}...`);

    const strategyPrompt = `You are a viral content creator who has generated millions of views. Based on these current trends:
${JSON.stringify(trends, null, 2)}

Create a complete viral content piece for ${platform} in the "${niche}" niche.

Return a JSON object with these EXACT keys:
{
  "title": "A compelling, clickable title for the post (max 80 chars)",
  "hook": "The opening hook that stops scrollers (max 100 chars, pattern-interrupt style)",
  "visual_prompt": "Detailed description of what the video/image should show, scene by scene",
  "voiceover": "Complete voiceover script, 20-40 seconds worth of narration",
  "caption": "The social media caption with hashtags and call-to-action (max 300 chars)",
  "hashtags": ["array", "of", "relevant", "hashtags"],
  "style": "The visual style (e.g., Cinematic, Fast-paced, Minimalist, Documentary)",
  "posting_tips": "Best time and strategy to post this content"
}

Make the content genuinely engaging, not generic. It should feel like something a real viral creator would post.
Return ONLY the JSON object, no other text.`;

    const responseText = await this.callAI(strategyPrompt);
    if (!responseText) {
      console.log("[BRAIN] AI strategy generation failed, using intelligent fallback");
      return this.getDefaultStrategy(niche, platform);
    }

    const strategy = this.safeJsonParse(responseText, "object");
    if (strategy && strategy.title) {
      console.log(`[BRAIN] Strategy generated: "${strategy.title}"`);
      return strategy;
    }

    return this.getDefaultStrategy(niche, platform);
  }

  /**
   * Fallback strategy when AI is unavailable
   */
  private getDefaultStrategy(niche: string, platform: string) {
    return {
      title: `The ${niche} Secret Nobody Talks About`,
      hook: `Stop scrolling. This ${niche.toLowerCase()} hack changed everything for me...`,
      visual_prompt: `Open with a dramatic zoom into a screen showing ${niche} data. Quick cuts between impressive results and the process. End with a satisfying reveal.`,
      voiceover: `Here's what nobody tells you about ${niche.toLowerCase()}. Most people think it's complicated, but there's one simple trick that changed everything. I went from zero to seeing real results in just 30 days. And the best part? Anyone can do this. Follow for more ${niche.toLowerCase()} tips.`,
      caption: `This changed my entire approach to ${niche.toLowerCase()} 🔥 Save this for later! #${niche.replace(/\s+/g, '')} #viral #${platform}`,
      hashtags: [niche.replace(/\s+/g, ''), "viral", platform, "tips", "growth"],
      style: "Cinematic with fast cuts",
      posting_tips: "Post between 7-9 PM local time for maximum engagement. Use a curiosity-driven thumbnail."
    };
  }

  /**
   * FULL PIPELINE: Analyze → Strategize → Return complete content
   * This is the main entry point for content generation.
   */
  async generateFullContent(niche: string, platform: string) {
    console.log(`[BRAIN] === FULL PIPELINE START: ${niche} on ${platform} ===`);

    // Step 1: Discover trends
    const trends = await this.analyzeTrends(niche, platform);
    console.log(`[BRAIN] Trends found: ${trends.length}`);

    // Step 2: Generate content strategy from trends
    const strategy = await this.generateContentStrategy(trends, niche, platform);
    console.log(`[BRAIN] Strategy generated: "${strategy.title}"`);

    // Step 3: Save trends to database
    for (const trend of trends) {
      try {
        await this.saveTrend({
          platform,
          trendType: trend.trendType || "pattern",
          trendData: trend.trendData || trend,
          viralityScore: trend.viralityScore || 75
        });
      } catch (e) {
        console.error("[BRAIN] Failed to save trend:", e);
      }
    }

    console.log(`[BRAIN] === FULL PIPELINE COMPLETE ===`);
    
    return {
      trends,
      strategy,
      generatedAt: new Date().toISOString(),
      platform,
      niche
    };
  }

  /**
   * Persistence: Save Discovered Trends
   */
  async saveTrend(data: any) {
    if (!db) return null;
    try {
      return await db.insert(trendsTable).values({
        platform: data.platform,
        trendType: data.trendType || data.type,
        trendData: data.trendData || data.details,
        viralityScore: data.viralityScore || data.score,
      }).returning();
    } catch (e) {
      console.error("[BRAIN] saveTrend error:", e);
      return null;
    }
  }
}
