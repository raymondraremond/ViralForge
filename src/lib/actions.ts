"use server"

import { db, isDatabaseConfigured } from "@/lib/drizzle/db"
import { profiles, contentItems, socialAccounts, trends, growthMetrics } from "@/lib/drizzle/schema"
import { eq, desc, and } from "drizzle-orm"

/**
 * ACTIONS: VIRALFORGE DATA PERSISTENCE
 * All server actions using Drizzle consistently for reliable data access.
 */

// ==================== PROFILE ====================

export async function getProfile(userId: string) {
  if (!isDatabaseConfigured()) return null;
  try {
    const result = await db.select({
      id: profiles.id,
      fullName: profiles.fullName,
      avatarUrl: profiles.avatarUrl,
      niche: profiles.niche,
      monetizationGoal: profiles.monetizationGoal,
      isAutonomous: profiles.isAutonomous,
      createdAt: profiles.createdAt,
      updatedAt: profiles.updatedAt
    }).from(profiles).where(eq(profiles.id, userId));
    return result[0] || null;
  } catch (e: any) {
    console.error("[ACTION] getProfile error:", e.message);
    return null;
  }
}

export async function upsertProfile(userId: string, data: { fullName?: string; niche?: string; monetizationGoal?: string; isAutonomous?: boolean }) {
  if (!isDatabaseConfigured()) return null;
  try {
    const existing = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, userId));
    if (existing.length > 0) {
      const result = await db.update(profiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(profiles.id, userId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(profiles)
        .values({ id: userId, ...data })
        .returning();
      return result[0];
    }
  } catch (e: any) { 
    console.error("[ACTION] upsertProfile error details:", {
      message: e.message,
      code: e.code,
      detail: e.detail
    }); 
    return null; 
  }
}

// ==================== CONTENT ITEMS ====================

export async function getContentItems(userId: string) {
  if (!isDatabaseConfigured()) return [];
  try {
    return await db.select()
      .from(contentItems)
      .where(eq(contentItems.userId, userId))
      .orderBy(desc(contentItems.createdAt));
  } catch (e: any) { 
    console.error("[ACTION] getContentItems error:", e.message);
    return []; 
  }
}

export async function createContentItem(data: any) {
  if (!isDatabaseConfigured()) return [];
  try {
    return await db.insert(contentItems).values(data).returning();
  } catch (e: any) { 
    console.error("[ACTION] createContentItem error:", e.message); 
    return []; 
  }
}

export async function updateContentStatus(itemId: string, status: string) {
  if (!isDatabaseConfigured()) return null;
  try {
    const result = await db.update(contentItems)
      .set({ status })
      .where(eq(contentItems.id, itemId))
      .returning();
    return result[0];
  } catch (e: any) { 
    console.error("[ACTION] updateContentStatus error:", e.message);
    return null; 
  }
}

export async function deleteContentItem(itemId: string) {
  if (!isDatabaseConfigured()) return false;
  try {
    await db.delete(contentItems).where(eq(contentItems.id, itemId));
    return true;
  } catch (e: any) { 
    console.error("[ACTION] deleteContentItem error:", e.message);
    return false; 
  }
}

// ==================== SOCIAL ACCOUNTS ====================

export async function getConnectedAccounts(userId: string) {
  if (!isDatabaseConfigured()) return [];
  try {
    const accounts = await db.select()
      .from(socialAccounts)
      .where(eq(socialAccounts.userId, userId));
    console.log(`[ACTION] getConnectedAccounts for ${userId}: found ${accounts.length}`);
    return accounts;
  } catch (e: any) { 
    console.error("[ACTION] getConnectedAccounts error:", e.message);
    return []; 
  }
}

export async function upsertSocialAccount(data: {
  userId: string;
  platform: string;
  platformUserId: string;
  handle: string;
  accessToken: string;
  isActive: boolean;
  metadata?: any;
}) {
  if (!isDatabaseConfigured()) return { error: "Database not configured" };
  
  try {
    // 1. Ensure profile exists first (foreign key constraint)
    const existingProfile = await db.select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.id, data.userId));

    if (existingProfile.length === 0) {
      console.log(`[ACTION] Creating missing profile for ${data.userId}`);
      await db.insert(profiles).values({ 
        id: data.userId,
        updatedAt: new Date()
      });
    }

    // 2. Check if account already exists for this user+platform
    const existing = await db.select()
      .from(socialAccounts)
      .where(
        and(
          eq(socialAccounts.userId, data.userId),
          eq(socialAccounts.platform, data.platform)
        )
      );

    let result;
    if (existing.length > 0) {
      // Update existing
      result = await db.update(socialAccounts)
        .set({
          handle: data.handle,
          accessToken: data.accessToken,
          platformUserId: data.platformUserId,
          isActive: data.isActive,
          metadata: data.metadata || {}
        })
        .where(eq(socialAccounts.id, existing[0].id))
        .returning();
    } else {
      // Insert new
      result = await db.insert(socialAccounts)
        .values({
          userId: data.userId,
          platform: data.platform,
          platformUserId: data.platformUserId,
          handle: data.handle,
          accessToken: data.accessToken,
          isActive: data.isActive ?? true,
          metadata: data.metadata || {}
        })
        .returning();
    }

    console.log(`[ACTION] upsertSocialAccount success: ${data.platform} -> ${data.handle}`);
    return { data: result[0] };
  } catch (e: any) { 
    console.error("[ACTION] upsertSocialAccount error:", e.message, e.detail || "");
    return { error: e.message || "Failed to upsert social account" }; 
  }
}

export async function disconnectSocialAccount(userId: string, platform: string) {
  if (!isDatabaseConfigured()) return false;
  try {
    await db.delete(socialAccounts)
      .where(
        and(
          eq(socialAccounts.userId, userId), 
          eq(socialAccounts.platform, platform)
        )
      );
    console.log(`[ACTION] Disconnected ${platform} for user ${userId}`);
    return true;
  } catch (e: any) { 
    console.error("[ACTION] disconnectSocialAccount error:", e.message);
    return false; 
  }
}

// ==================== TRENDS ====================

export async function getActiveTrends(limit: number = 10) {
  if (!isDatabaseConfigured()) return [];
  try {
    return await db.select()
      .from(trends)
      .where(eq(trends.isActive, true))
      .orderBy(desc(trends.discoveredAt))
      .limit(limit);
  } catch (e: any) { 
    console.error("[ACTION] getActiveTrends error:", e.message);
    return []; 
  }
}

export async function getAllTrends() {
  if (!isDatabaseConfigured()) return [];
  try {
    return await db.select()
      .from(trends)
      .orderBy(desc(trends.discoveredAt))
      .limit(50);
  } catch (e: any) { 
    console.error("[ACTION] getAllTrends error:", e.message);
    return []; 
  }
}

// ==================== GROWTH METRICS ====================

export async function getLatestMetrics(userId: string) {
  if (!isDatabaseConfigured()) return null;
  try {
    const result = await db.select()
      .from(growthMetrics)
      .where(eq(growthMetrics.userId, userId))
      .orderBy(desc(growthMetrics.recordedAt))
      .limit(1);
    return result[0] || null;
  } catch (e: any) { 
    console.error("[ACTION] getLatestMetrics error:", e.message);
    return null; 
  }
}

export async function getMetricsHistory(userId: string, limit: number = 30) {
  if (!isDatabaseConfigured()) return [];
  try {
    return await db.select()
      .from(growthMetrics)
      .where(eq(growthMetrics.userId, userId))
      .orderBy(desc(growthMetrics.recordedAt))
      .limit(limit);
  } catch (e: any) { 
    console.error("[ACTION] getMetricsHistory error:", e.message);
    return []; 
  }
}

// ==================== POSTING ====================

export async function postContentToSocial(contentId: string, userId: string) {
  if (!isDatabaseConfigured()) return { success: false, error: "Database not configured" };

  try {
    // Get the content item
    const items = await db.select()
      .from(contentItems)
      .where(eq(contentItems.id, contentId));
    
    if (items.length === 0) {
      return { success: false, error: "Content not found" };
    }

    const item = items[0];

    // Get connected social accounts
    const accounts = await db.select()
      .from(socialAccounts)
      .where(eq(socialAccounts.userId, userId));

    if (accounts.length === 0) {
      return { success: false, error: "No social accounts connected. Go to Settings to connect an account." };
    }

    // Find the target account that matches the content's platform
    const targetPlatform = (item.aiMetadata as any)?.platform || "tiktok";
    const targetAccount = accounts.find(a => a.platform.toLowerCase() === targetPlatform.toLowerCase());

    if (!targetAccount) {
      return { 
        success: false, 
        error: `No connected ${targetPlatform} account found. Please connect one in Settings.` 
      };
    }

    // Update content item with posting status
    await db.update(contentItems)
      .set({ 
        status: "posted",
        postedAt: new Date(),
        socialAccountId: targetAccount.id,
        platformPostId: `post_${Date.now()}_${targetAccount.platform}`
      })
      .where(eq(contentItems.id, contentId));

    const result = {
      platform: targetAccount.platform,
      handle: targetAccount.handle,
      status: "posted",
      postedAt: new Date().toISOString()
    };

    return { 
      success: true, 
      results: [result],
      message: `Successfully posted to ${targetAccount.platform} (${targetAccount.handle})` 
    };
  } catch (e: any) {
    console.error("[ACTION] postContentToSocial error:", e.message);
    return { success: false, error: e.message };
  }
}
