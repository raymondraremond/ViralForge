import { Anthropic } from "@anthropic-ai/sdk";
import { OpenAI } from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApifyClient } from "apify-client";
import { db } from "@/lib/drizzle/db";
import { trends as trendsTable } from "@/lib/drizzle/schema";

/**
 * VIRALFORGE AI BRAIN
 * Multi-agent system for autonomous content growth.
 */

export class ViralBrain {
  private anthropic: Anthropic;
  private openai: OpenAI;
  private gemini: GoogleGenerativeAI;
  private apify: ApifyClient;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) console.warn("[BRAIN_WARNING]: ANTHROPIC_API_KEY is missing.");
    if (!process.env.OPENAI_API_KEY) console.warn("[BRAIN_WARNING]: OPENAI_API_KEY is missing.");
    if (!process.env.GOOGLE_AI_API_KEY) console.warn("[BRAIN_WARNING]: GOOGLE_AI_API_KEY is missing.");
    if (!process.env.APIFY_API_TOKEN) console.warn("[BRAIN_WARNING]: APIFY_API_TOKEN is missing.");

    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "missing" });
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "missing" });
    this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "missing");
    this.apify = new ApifyClient({ token: process.env.APIFY_API_TOKEN || "missing" });
  }

  /**
   * Agent 1: Trend Analyst
   * Studies current high-performing hooks and formats in a specific niche.
   */
  async analyzeTrends(niche: string, platform: string) {
    console.log(`[BRAIN]: Starting real-world trend analysis for ${niche} on ${platform}...`);
    
    let scrapedData: any[] = [];
    
    try {
      if (platform.toLowerCase() === "tiktok") {
        // Using TikTok Scraper to find trending videos for the niche
        const run = await this.apify.actor("clockworks/tiktok-scraper").call({
          hashtags: [niche.replace(/\s+/g, '')],
          resultsPerPage: 5,
          shouldDownloadVideo: false,
          shouldDownloadCover: false,
        });
        const { items } = await this.apify.dataset(run.defaultDatasetId).listItems();
        scrapedData = items;
      } else if (platform.toLowerCase() === "instagram") {
        // Using Instagram Scraper for Reels/Posts
        const run = await this.apify.actor("apify/instagram-scraper").call({
          search: niche,
          searchType: "hashtag",
          resultsLimit: 5,
        });
        const { items } = await this.apify.dataset(run.defaultDatasetId).listItems();
        scrapedData = items;
      } else if (platform.toLowerCase() === "youtube") {
        // Using YouTube Scraper for Shorts/Videos
        const run = await this.apify.actor("apify/youtube-scraper").call({
          searchKeywords: niche,
          maxResults: 5,
          searchSort: "relevance",
        });
        const { items } = await this.apify.dataset(run.defaultDatasetId).listItems();
        scrapedData = items;
      } else if (platform.toLowerCase() === "twitter" || platform.toLowerCase() === "x") {
        // Using Twitter/X Scraper
        const run = await this.apify.actor("apidojo/twitter-scraper-lite").call({
          searchTerms: [niche],
          maxTweets: 5,
          tweetLanguage: "en",
        });
        const { items } = await this.apify.dataset(run.defaultDatasetId).listItems();
        scrapedData = items;
      }
    } catch (error) {
      console.error(`[BRAIN_ERROR]: Apify scraping failed:`, error);
      // Fallback to simulation or simplified logic if needed
      return [];
    }

    if (scrapedData.length === 0) {
      console.log(`[BRAIN]: No real data found, skipping LLM analysis.`);
      return [];
    }

    if (process.env.GOOGLE_AI_API_KEY) {
      console.log(`[BRAIN]: Using Gemini for trend analysis...`);
      const model = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const contentText = result.response.text();
      try {
        const jsonMatch = contentText.match(/\[[\s\S]*\]/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      } catch (e) {
        console.error("[BRAIN]: Gemini JSON parse failed", e);
      }
    }

    if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "missing") {
      console.log(`[BRAIN]: Falling back to Anthropic for trend analysis...`);
      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      });

      const contentText = response.content
        .filter(block => block.type === 'text')
        .map(block => (block as any).text)
        .join('\n');

      try {
        const jsonMatch = contentText.match(/\[[\s\S]*\]/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      } catch (e) {
        console.error("[BRAIN]: Anthropic JSON parse failed", e);
      }
    }

    // Default fallback
    return scrapedData.map((item: any) => ({
      type: "pattern",
      description: item.text || item.caption || "Viral Pattern",
      viralityScore: 85,
      hashtag: niche
    }));
  }

  /**
   * Agent 2: Creative Strategist
   * Generates a script and visual cues based on trend analysis.
   */
  async generateContentStrategy(trendData: any, niche: string) {
    const prompt = `Based on these trends: ${JSON.stringify(trendData)}, 
    create a viral 30-second script for a ${niche} video. 
    Include:
    1. A pattern-interrupt hook.
    2. Visual prompts for AI Video generation.
    3. Voiceover script.
    4. A title for the post.
    Return JSON format with keys: title, hook, visual_prompt, voiceover, style.`;

    if (process.env.GOOGLE_AI_API_KEY) {
      console.log(`[BRAIN]: Using Gemini for content strategy...`);
      const model = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      } catch (e) {
        console.error("[BRAIN]: Gemini Strategy JSON parse failed", e);
      }
    }

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "missing") {
      console.log(`[BRAIN]: Falling back to OpenAI for content strategy...`);
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      return response.choices[0].message.content;
    }

    return {
      title: "Fallback Viral Post",
      hook: "Stop scrolling for a second...",
      visual_prompt: "Cinematic shot of neon city",
      voiceover: "This is a fallback script because no AI keys were found.",
      style: "Cinematic"
    };
  }

  /**
   * Agent 3: Performance Optimizer
   * Decides if content needs variation based on past metrics.
   */
  async optimizeStyle(pastMetrics: any) {
    // Logic to adjust "style" if engagement is dropping
    // Returns "Keep Style" or "Pivot Style" with recommendations
  }

  /**
   * Persistence: Save Discovered Trends
   */
  async saveTrend(data: any) {
    return await db.insert(trendsTable).values({
      platform: data.platform,
      trendType: data.type,
      trendData: data.details,
      viralityScore: data.score,
    }).returning();
  }
}
