"use server"

import { db } from "@/lib/drizzle/db"
import { profiles, contentItems, socialAccounts } from "@/lib/drizzle/schema"
import { eq, desc } from "drizzle-orm"

/**
 * ACTIONS: VIRALFORGE DATA PERSISTENCE
 */

export async function getProfile(userId: string) {
  const result = await db.select().from(profiles).where(eq(profiles.id, userId));
  return result[0];
}

export async function getContentItems(userId: string) {
  return await db.select()
    .from(contentItems)
    .where(eq(contentItems.userId, userId))
    .orderBy(desc(contentItems.createdAt));
}

export async function createContentItem(data: any) {
  return await db.insert(contentItems).values(data).returning();
}

export async function getConnectedAccounts(userId: string) {
  return await db.select().from(socialAccounts).where(eq(socialAccounts.userId, userId));
}
