import { pgTable, text, timestamp, uuid, decimal, integer, boolean, jsonb, bigint, unique } from "drizzle-orm/pg-core";

// 1. Profiles (Syncs with Auth)
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().notNull(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  niche: text("niche"),
  monetizationGoal: decimal("monetization_goal", { precision: 12, scale: 2 }).default("0.00"),
  isAutonomous: boolean("is_autonomous").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 2. Social Accounts
export const socialAccounts = pgTable("social_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  platform: text("platform").notNull(), // 'tiktok', 'instagram', etc.
  platformUserId: text("platform_user_id").notNull(),
  handle: text("handle").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  isActive: boolean("is_active").default(true),
  webhookUrl: text("webhook_url"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniqueAccount: unique().on(t.userId, t.platform, t.platformUserId),
}));

// 3. Content Items
export const contentItems = pgTable("content_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  socialAccountId: uuid("social_account_id").references(() => socialAccounts.id, { onDelete: "set null" }),
  title: text("title"),
  hook: text("hook"),
  scriptContent: text("script_content"),
  mediaUrl: text("media_url"),
  mediaType: text("media_type"), // 'video', 'image', etc.
  status: text("status").default("draft"), // 'draft', 'scheduled', etc.
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  postedAt: timestamp("posted_at", { withTimezone: true }),
  platformPostId: text("platform_post_id"),
  aiMetadata: jsonb("ai_metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 4. Growth Metrics
export const growthMetrics = pgTable("growth_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  socialAccountId: uuid("social_account_id").references(() => socialAccounts.id, { onDelete: "cascade" }).notNull(),
  followerCount: integer("follower_count").default(0),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 4 }).default("0"),
  viewsCount: bigint("views_count", { mode: "number" }).default(0),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow().notNull(),
});

// 5. Trends
export const trends = pgTable("trends", {
  id: uuid("id").primaryKey().defaultRandom(),
  platform: text("platform").notNull(),
  trendType: text("trend_type").notNull(),
  trendData: jsonb("trend_data").notNull(),
  viralityScore: integer("virality_score"),
  isActive: boolean("is_active").default(true),
  discoveredAt: timestamp("discovered_at", { withTimezone: true }).defaultNow().notNull(),
});
