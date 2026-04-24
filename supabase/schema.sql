-- VIRALFORGE CORE DATABASE SCHEMA
-- Purpose: Production-ready autonomous social media engine

-- 1. Enable Necessary Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    niche TEXT, -- e.g., "AI SaaS", "Fitness Tech"
    monetization_goal DECIMAL(12, 2) DEFAULT 0.00,
    is_autonomous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Social Accounts Table (Encrypted Tokens via Vault or RLS)
CREATE TABLE IF NOT EXISTS public.social_accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    platform TEXT NOT NULL, -- 'tiktok', 'instagram', 'youtube', 'x', 'linkedin'
    platform_user_id TEXT NOT NULL,
    handle TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, platform, platform_user_id)
);

-- 4. Content Items (Generated Posts)
CREATE TABLE IF NOT EXISTS public.content_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE SET NULL,
    title TEXT,
    hook TEXT,
    script_content TEXT,
    media_url TEXT, -- Link to storage or generated video
    media_type TEXT, -- 'video', 'image', 'carousel'
    status TEXT DEFAULT 'draft', -- 'draft', 'brain_review', 'scheduled', 'posted', 'failed'
    scheduled_at TIMESTAMP WITH TIME ZONE,
    posted_at TIMESTAMP WITH TIME ZONE,
    platform_post_id TEXT, -- ID from the social platform
    ai_metadata JSONB DEFAULT '{}'::jsonb, -- Store model used, prompts, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Growth Metrics (Live Tracking)
CREATE TABLE IF NOT EXISTS public.growth_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE CASCADE NOT NULL,
    follower_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5, 4) DEFAULT 0,
    views_count BIGINT DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Trends Scanner Table
CREATE TABLE IF NOT EXISTS public.trends (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    platform TEXT NOT NULL,
    trend_type TEXT NOT NULL, -- 'audio', 'format', 'hashtag'
    trend_data JSONB NOT NULL,
    virality_score INTEGER, -- 1-100
    is_active BOOLEAN DEFAULT true,
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trends ENABLE ROW LEVEL SECURITY; -- Trends can be read by all users

-- Profiles: Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles 
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles 
    FOR UPDATE USING (auth.uid() = id);

-- Social Accounts: Users can only see their own accounts
CREATE POLICY "Users can view own social accounts" ON public.social_accounts 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own social accounts" ON public.social_accounts 
    FOR ALL USING (auth.uid() = user_id);

-- Content Items
CREATE POLICY "Users can view own content" ON public.content_items 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own content" ON public.content_items 
    FOR ALL USING (auth.uid() = user_id);

-- Growth Metrics
CREATE POLICY "Users can view own metrics" ON public.growth_metrics 
    FOR SELECT USING (auth.uid() = user_id);

-- Trends
CREATE POLICY "All users can view trends" ON public.trends 
    FOR SELECT USING (true);

-- 8. Functions & Triggers
-- Handle Profile Creation on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
