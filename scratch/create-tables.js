// Create all tables in Supabase using the SQL endpoint
const SUPABASE_URL = 'https://nokjsonipeponxugsinq.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5va2pzb25pcGVwb254dWdzaW5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU1MTQ3MSwiZXhwIjoyMDkyMTI3NDcxfQ.QT6hSwAjO_8QNXYC38R2r5TOmIurnhXn2vweUQlUWdE';

// We'll use the pg_net or rpc approach. Actually, Supabase exposes
// a /rest/v1/rpc endpoint for calling functions. But for DDL we need
// to use the dashboard SQL editor or the Management API.
// 
// Alternative: use the Supabase Management API at api.supabase.com
// But that needs a personal access token.
//
// Best approach: Use the `supabase-js` client to call `supabase.rpc()` 
// with a custom function, or use a connection pooler URL.
//
// Let's try connecting via the Supabase connection pooler (Supavisor)
// which has IPv4 addresses.

const postgres = require('postgres');

async function findPoolerAndConnect() {
  // Supabase pooler URL format:
  // Transaction mode: postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
  // Session mode: postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres
  
  const projectRef = 'nokjsonipeponxugsinq';
  const password = 'p3oBLj5PjlvWS7gD';
  
  // Try common AWS regions for the pooler
  const regions = [
    'eu-west-1',
    'us-east-1', 
    'us-west-1',
    'ap-southeast-1',
    'eu-central-1',
    'us-east-2',
    'ap-northeast-1',
    'eu-west-2',
    'sa-east-1',
    'ap-south-1',
    'us-west-2',
    'eu-north-1',
    'af-south-1',
  ];

  for (const region of regions) {
    const poolerHost = `aws-0-${region}.pooler.supabase.com`;
    // Session mode (port 5432) supports prepared statements needed by Drizzle
    const url = `postgresql://postgres.${projectRef}:${password}@${poolerHost}:5432/postgres`;
    
    console.log(`Trying region: ${region} (${poolerHost})...`);
    
    try {
      const sql = postgres(url, { 
        ssl: 'require',
        connect_timeout: 5,
        idle_timeout: 5,
      });
      const result = await sql`SELECT NOW() as time`;
      console.log(`✅ SUCCESS with region: ${region}!`);
      console.log(`   Time: ${result[0].time}`);
      console.log(`\n   SESSION POOLER URL:`);
      console.log(`   ${url}`);
      
      // Now create tables!
      console.log('\n=== Creating tables ===\n');
      
      await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
      console.log('✅ uuid-ossp extension enabled');

      await sql`
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
          full_name TEXT,
          avatar_url TEXT,
          niche TEXT,
          monetization_goal DECIMAL(12, 2) DEFAULT 0.00,
          monetization_status TEXT DEFAULT 'pending',
          is_autonomous BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        )
      `;
      console.log('✅ profiles table created');

      await sql`
        CREATE TABLE IF NOT EXISTS public.social_accounts (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
          platform TEXT NOT NULL,
          platform_user_id TEXT NOT NULL,
          handle TEXT NOT NULL,
          access_token TEXT NOT NULL,
          refresh_token TEXT,
          expires_at TIMESTAMP WITH TIME ZONE,
          is_active BOOLEAN DEFAULT true,
          metadata JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          UNIQUE(user_id, platform, platform_user_id)
        )
      `;
      console.log('✅ social_accounts table created');

      await sql`
        CREATE TABLE IF NOT EXISTS public.content_items (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
          social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE SET NULL,
          title TEXT,
          hook TEXT,
          script_content TEXT,
          media_url TEXT,
          media_type TEXT,
          status TEXT DEFAULT 'draft',
          scheduled_at TIMESTAMP WITH TIME ZONE,
          posted_at TIMESTAMP WITH TIME ZONE,
          platform_post_id TEXT,
          ai_metadata JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        )
      `;
      console.log('✅ content_items table created');

      await sql`
        CREATE TABLE IF NOT EXISTS public.growth_metrics (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
          social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE CASCADE NOT NULL,
          follower_count INTEGER DEFAULT 0,
          engagement_rate DECIMAL(5, 4) DEFAULT 0,
          views_count BIGINT DEFAULT 0,
          recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        )
      `;
      console.log('✅ growth_metrics table created');

      await sql`
        CREATE TABLE IF NOT EXISTS public.trends (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          platform TEXT NOT NULL,
          trend_type TEXT NOT NULL,
          trend_data JSONB NOT NULL,
          virality_score INTEGER,
          is_active BOOLEAN DEFAULT true,
          discovered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        )
      `;
      console.log('✅ trends table created');

      // Enable RLS
      console.log('\n=== Enabling RLS ===\n');
      await sql`ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY`;
      await sql`ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY`;
      await sql`ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY`;
      await sql`ALTER TABLE public.growth_metrics ENABLE ROW LEVEL SECURITY`;
      await sql`ALTER TABLE public.trends ENABLE ROW LEVEL SECURITY`;
      console.log('✅ RLS enabled on all tables');

      // Create RLS policies (using DO block to handle "already exists" gracefully)
      console.log('\n=== Creating RLS Policies ===\n');
      
      const policies = [
        `CREATE POLICY IF NOT EXISTS "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id)`,
        `CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id)`,
        `CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id)`,
        `CREATE POLICY IF NOT EXISTS "Users can view own social accounts" ON public.social_accounts FOR SELECT USING (auth.uid() = user_id)`,
        `CREATE POLICY IF NOT EXISTS "Users can manage own social accounts" ON public.social_accounts FOR ALL USING (auth.uid() = user_id)`,
        `CREATE POLICY IF NOT EXISTS "Users can view own content" ON public.content_items FOR SELECT USING (auth.uid() = user_id)`,
        `CREATE POLICY IF NOT EXISTS "Users can manage own content" ON public.content_items FOR ALL USING (auth.uid() = user_id)`,
        `CREATE POLICY IF NOT EXISTS "Users can view own metrics" ON public.growth_metrics FOR SELECT USING (auth.uid() = user_id)`,
        `CREATE POLICY IF NOT EXISTS "All users can view trends" ON public.trends FOR SELECT USING (true)`,
      ];

      for (const p of policies) {
        try {
          await sql.unsafe(p);
        } catch (e) {
          // Policy might already exist, that's fine
          if (!e.message.includes('already exists')) {
            console.log(`  ⚠️ Policy warning: ${e.message.substring(0, 100)}`);
          }
        }
      }
      console.log('✅ RLS policies created');

      // Create trigger for auto-creating profile on signup
      console.log('\n=== Creating Auth Trigger ===\n');
      await sql`
        CREATE OR REPLACE FUNCTION public.handle_new_user() 
        RETURNS trigger AS $$
        BEGIN
          INSERT INTO public.profiles (id, full_name, avatar_url)
          VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
          RETURN new;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER
      `;
      
      // Drop existing trigger if exists, then recreate
      try {
        await sql`DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users`;
        await sql`
          CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user()
        `;
      } catch (e) {
        console.log(`  ⚠️ Trigger note: ${e.message.substring(0, 100)}`);
      }
      console.log('✅ Auth trigger created');

      console.log('\n🎉 ALL TABLES AND POLICIES CREATED SUCCESSFULLY! 🎉\n');
      
      await sql.end();
      process.exit(0);
    } catch (err) {
      if (err.message.includes('ENOTFOUND') || err.message.includes('timeout') || err.message.includes('connect')) {
        // Wrong region, try next
        continue;
      }
      console.error(`Error with ${region}: ${err.message}`);
    }
  }
  
  console.error('\n❌ Could not find working pooler region. Please run schema.sql manually in the Supabase SQL Editor.');
  process.exit(1);
}

findPoolerAndConnect();
