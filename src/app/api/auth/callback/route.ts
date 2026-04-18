import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle/db";
import { socialAccounts } from "@/lib/drizzle/schema";

/**
 * OAUTH CALLBACK HANDLER
 * handles code exchange and token storage for TikTok/IG/YouTube.
 */

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const platform = searchParams.get("state"); // Using state to pass platform name
  
  if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

  // In a real app, exchange 'code' for access_token here
  const mockAccessToken = `vforge_${Math.random().toString(36).substring(7)}`;

  try {
    // Save to DB
    // Note: In prod, you'd get the real userId from the session
    console.log(`[AUTH]: Successfully connected ${platform}`);

    // Return to settings
    return NextResponse.redirect(new URL("/settings?success=connected", req.url));
  } catch (error) {
    return NextResponse.json({ error: "Failed to save account" }, { status: 500 });
  }
}
