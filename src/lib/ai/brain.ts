import { ApifyClient } from "apify-client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/drizzle/db";
import { trends as trendsTable } from "@/lib/drizzle/schema";

/**
 * VIRALBRAIN: The Autonomous Growth Engine
 * -----------------------------------------
 * This class orchestrates the intelligence layer. 
 * It connects to Apify for scraping, and Google Gemini (primary) 
 * with OpenAI/Anthropic as fallbacks for analysis.
 */

export class ViralBrain {
  private apify: ApifyClient;
  private gemini: any;
  private openai: any;
  private anthropic: any;

  constructor() {
    this.apify = new ApifyClient({
      token: process.env.APIFY_API_TOKEN || "missing",
    });

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
   * Agent 1: Trend Analyst
   * Scrapes real data and uses AI to extract viral patterns.
   */
  async analyzeTrends(niche: string, platform: string) {
    console.log(`[BRAIN]: Starting real-world trend analysis for ${niche} on ${platform}...`);
    
    let scrapedData: any[] = [];
    
    try {
      if (platform.toLowerCase() === "tiktok") {
        // Using TikTok Scraper (TikTok Hashtag Scraper)
        const run = await this.apify.actor("clockworks/tiktok-scraper").call({
          hashtags: [niche.replace(/\s+/g, '')],
          resultsPerPage: 5,
          shouldDownloadVideos: false,
          shouldDownloadCovers: false,
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
      return [];
    }

    if (scrapedData.length === 0) {
      console.log(`[BRAIN]: No real data found, skipping LLM analysis.`);
      return [];
    }

    const trendPrompt = `
      Analyze this raw social media data for the niche "${niche}" on ${platform}:
      ${JSON.stringify(scrapedData.slice(0, 5))}
      
      Extract the top 3 viral trends/patterns. 
      Return ONLY a JSON array of objects with these keys:
      - trendType: "hashtag", "audio", "visual_hook", or "topic"
      - viralityScore: 0-100
      - trendData: { description: string, growth: string }
    `;

    if (process.env.GOOGLE_AI_API_KEY) {
      console.log(`[BRAIN]: Using Gemini for trend analysis...`);
      try {
        const model = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(trendPrompt);
        const contentText = result.response.text();
        const jsonMatch = contentText.match(/\[[\s\S]*\]/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      } catch (e) {
        console.error("[BRAIN]: Gemini Trend analysis failed", e);
      }
    }

    if (this.anthropic) {
      console.log(`[BRAIN]: Falling back to Anthropic for trend analysis...`);
      try {
        const response = await this.anthropic.messages.create({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 1500,
          messages: [{ role: "user", content: trendPrompt }],
        });

        const contentText = response.content
          .filter((block: any) => block.type === 'text')
          .map((block: any) => block.text)
          .join('\n');

        const jsonMatch = contentText.match(/\[[\s\S]*\]/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      } catch (e) {
        console.error("[BRAIN]: Anthropic Trend analysis failed", e);
      }
    }

    return [];
  }

  /**
   * Agent 2: Creative Strategist
   * Converts trends into a content script and strategy.
   */
  async generateContentStrategy(trends: any[], niche: string, platform: string = "tiktok") {
    const strategyPrompt = `Using these trends: ${JSON.stringify(trends)}, 
    create a viral 30-second script for a ${niche} video on ${platform}. 
    Include:
    1. A pattern-interrupt hook.
    2. Visual prompts for AI Video generation.
    3. Voiceover script.
    4. A title for the post.
    Return JSON format with keys: title, hook, visual_prompt, voiceover, style.`;

    if (process.env.GOOGLE_AI_API_KEY) {
      console.log(`[BRAIN]: Using Gemini for content strategy...`);
      try {
        const model = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(strategyPrompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      } catch (e) {
        console.error("[BRAIN]: Gemini Strategy failed", e);
      }
    }

    if (this.openai) {
      console.log(`[BRAIN]: Falling back to OpenAI for content strategy...`);
      try {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: strategyPrompt }],
          response_format: { type: "json_object" }
        });
        return JSON.parse(response.choices[0].message.content);
      } catch (e) {
        console.error("[BRAIN]: OpenAI Strategy failed", e);
      }
    }

    return {
      title: "Fallback Viral Post",
      hook: "Stop scrolling for a second...",
      visual_prompt: "Cinematic shot of neon city",
      voiceover: "This is a fallback script because AI generation failed.",
      style: "Cinematic"
    };
  }

  /**
   * Agent 3: Performance Optimizer
   */
  async optimizeStyle(pastMetrics: any) {
    return "Keep Style";
  }

  /**
   * Persistence: Save Discovered Trends
   */
  async saveTrend(data: any) {
    if (!db) return null;
    return await db.insert(trendsTable).values({
      platform: data.platform,
      trendType: data.trendType || data.type,
      trendData: data.trendData || data.details,
      viralityScore: data.viralityScore || data.score,
    }).returning();
  }
}
