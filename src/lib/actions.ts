"use server"

import { db, isDatabaseConfigured } from "@/lib/drizzle/db"
import { profiles, contentItems, socialAccounts, trends, growthMetrics } from "@/lib/drizzle/schema"
import { eq, desc, and } from "drizzle-orm"

/**
 * ACTIONS: VIRALFORGE DATA PERSISTENCE
 * All server actions with demo-mode fallbacks when DB is not configured.
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
  } catch { return []; }
}

export async function createContentItem(data: any) {
  if (!isDatabaseConfigured()) return [];
  try {
    return await db.insert(contentItems).values(data).returning();
  } catch (e) { console.error("[ACTION] createContentItem error:", e); return []; }
}

export async function updateContentStatus(itemId: string, status: string) {
  if (!isDatabaseConfigured()) return null;
  try {
    const result = await db.update(contentItems)
      .set({ status })
      .where(eq(contentItems.id, itemId))
      .returning();
    return result[0];
  } catch { return null; }
}

export async function deleteContentItem(itemId: string) {
  if (!isDatabaseConfigured()) return false;
  try {
    await db.delete(contentItems).where(eq(contentItems.id, itemId));
    return true;
  } catch { return false; }
}

// ==================== SOCIAL ACCOUNTS ====================

export async function getConnectedAccounts(userId: string) {
  if (!isDatabaseConfigured()) return [];
  try {
    return await db.select().from(socialAccounts).where(eq(socialAccounts.userId, userId));
  } catch { return []; }
}

export async function upsertSocialAccount(data: any) {
  if (!isDatabaseConfigured()) return { error: "Database not configured" };
  try {
    // 1. Ensure profile exists first (FK requirement)
    const profile = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, data.userId));
    if (profile.length === 0) {
      console.log(`[ACTION] Creating missing profile for ${data.userId} before connecting account`);
      await db.insert(profiles).values({
        id: data.userId,
        updatedAt: new Date()
      });
    }

    // 2. Now upsert the social account
    const existing = await db.select({ id: socialAccounts.id })
      .from(socialAccounts)
      .where(and(eq(socialAccounts.userId, data.userId), eq(socialAccounts.platform, data.platform)));
    
    if (existing.length > 0) {
      // Note: social_accounts table doesn't have an updatedAt column yet
      const result = await db.update(socialAccounts)
        .set(data)
        .where(eq(socialAccounts.id, existing[0].id))
        .returning();
      return { data: result[0] };
    } else {
      const result = await db.insert(socialAccounts).values(data).returning();
      return { data: result[0] };
    }
  } catch (e: any) { 
    console.error("[ACTION] upsertSocialAccount error details:", {
      message: e.message,
      code: e.code,
      detail: e.detail
    }); 
    return { error: e.message }; 
  }
}

export async function disconnectSocialAccount(userId: string, platform: string) {
  if (!isDatabaseConfigured()) return false;
  try {
    await db.delete(socialAccounts).where(and(eq(socialAccounts.userId, userId), eq(socialAccounts.platform, platform)));
    return true;
  } catch { return false; }
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
  } catch { return []; }
}

export async function getAllTrends() {
  if (!isDatabaseConfigured()) return [];
  try {
    return await db.select()
      .from(trends)
      .orderBy(desc(trends.discoveredAt))
      .limit(50);
  } catch { return []; }
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
  } catch { return null; }
}

export async function getMetricsHistory(userId: string, limit: number = 30) {
  if (!isDatabaseConfigured()) return [];
  try {
    return await db.select()
      .from(growthMetrics)
      .where(eq(growthMetrics.userId, userId))
      .orderBy(desc(growthMetrics.recordedAt))
      .limit(limit);
  } catch { return []; }
}
