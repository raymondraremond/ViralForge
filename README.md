# ⚡ ViralForge: Deployment Guide

ViralForge is built for high-performance autonomous social media growth. Follow these steps to take it live.

## 1. Supabase Setup
1.  **Create a New Project** on [Supabase](https://supabase.com).
2.  **Run the Schema**: Copy the contents of `supabase/schema.sql` into the Supabase SQL Editor and run it.
3.  **Auth Configuration**:
    *   Enable Email and/or Google OAuth.
    *   Set the Site URL to your Vercel URL.
4.  **Database URL**: Copy the Connection String (PostgreSQL) for Drizzle.

## 2. Environment Variables
Add these to Vercel and your `.env.local`:

```env
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# AI Agents
ANTHROPIC_API_KEY=... # For Trend Analysis (Claude 3.5)
OPENAI_API_KEY=...    # For Script Generation (GPT-4o)

# Media Production
RUNWAY_API_KEY=...    # For Video Generation
ELEVENLABS_API_KEY=... # For Voiceovers
```

## 3. Deployment (Vercel)
1.  Connect your GitHub repo to **Vercel**.
2.  Install dependencies: `npm install`.
3.  Set the Root Directory to `./`.
4.  Deploy.

## 4. API Keys & SocialKit
To connect social accounts, you need to register Apps on:
*   **TikTok for Developers** (Client ID/Secret)
*   **Meta for Developers** (Instagram Graph API)
*   **Google Cloud Console** (YouTube Data API)

## 5. Running Migrations
If you make changes to `src/lib/drizzle/schema.ts`, run:
```bash
npx drizzle-kit push
```

## 6. Development
```bash
npm run dev
```

---
**ViralForge AI Brain is now active.** It will scan trends and generate content every 6 hours via the configured Vercel Cron.
