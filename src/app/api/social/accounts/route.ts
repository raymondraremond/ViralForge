import { NextResponse } from "next/server";
import { db, isDatabaseConfigured } from "@/lib/drizzle/db";
import { socialAccounts } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * API ENDPOINT: SOCIAL ACCOUNTS
 * Returns connected social accounts for a user.
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ accounts: [] });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ accounts: [] });
    }

    const accounts = await db.select()
      .from(socialAccounts)
      .where(eq(socialAccounts.userId, userId));

    return NextResponse.json({ accounts });
  } catch (error: any) {
    console.error("[SOCIAL_API_ERROR]:", error);
    return NextResponse.json({ accounts: [], error: error.message }, { status: 500 });
  }
}
