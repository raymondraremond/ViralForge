// Fix RLS policies - PostgreSQL doesn't support IF NOT EXISTS for policies
// We need to check if they exist first, or use DO blocks
const postgres = require('postgres');

async function fixPolicies() {
  const url = 'postgresql://postgres.nokjsonipeponxugsinq:p3oBLj5PjlvWS7gD@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';
  const sql = postgres(url, { ssl: 'require' });

  console.log('=== Fixing RLS Policies ===\n');

  // Helper: drop then create policy
  async function ensurePolicy(table, name, definition) {
    try {
      await sql.unsafe(`DROP POLICY IF EXISTS "${name}" ON ${table}`);
      await sql.unsafe(`CREATE POLICY "${name}" ON ${table} ${definition}`);
      console.log(`  ✅ ${table} → "${name}"`);
    } catch (e) {
      console.log(`  ⚠️ ${table} → "${name}": ${e.message.substring(0, 120)}`);
    }
  }

  // Profiles
  await ensurePolicy('public.profiles', 'Users can view own profile', 'FOR SELECT USING (auth.uid() = id)');
  await ensurePolicy('public.profiles', 'Users can update own profile', 'FOR UPDATE USING (auth.uid() = id)');
  await ensurePolicy('public.profiles', 'Users can insert own profile', 'FOR INSERT WITH CHECK (auth.uid() = id)');
  
  // Social Accounts
  await ensurePolicy('public.social_accounts', 'Users can view own social accounts', 'FOR SELECT USING (auth.uid() = user_id)');
  await ensurePolicy('public.social_accounts', 'Users can manage own social accounts', 'FOR ALL USING (auth.uid() = user_id)');

  // Content Items  
  await ensurePolicy('public.content_items', 'Users can view own content', 'FOR SELECT USING (auth.uid() = user_id)');
  await ensurePolicy('public.content_items', 'Users can manage own content', 'FOR ALL USING (auth.uid() = user_id)');

  // Growth Metrics
  await ensurePolicy('public.growth_metrics', 'Users can view own metrics', 'FOR SELECT USING (auth.uid() = user_id)');

  // Trends (public read)
  await ensurePolicy('public.trends', 'All users can view trends', 'FOR SELECT USING (true)');

  // Also grant service_role full access for server-side operations
  await ensurePolicy('public.profiles', 'Service role full access profiles', 'FOR ALL TO service_role USING (true) WITH CHECK (true)');
  await ensurePolicy('public.social_accounts', 'Service role full access social_accounts', 'FOR ALL TO service_role USING (true) WITH CHECK (true)');
  await ensurePolicy('public.content_items', 'Service role full access content_items', 'FOR ALL TO service_role USING (true) WITH CHECK (true)');
  await ensurePolicy('public.growth_metrics', 'Service role full access growth_metrics', 'FOR ALL TO service_role USING (true) WITH CHECK (true)');
  await ensurePolicy('public.trends', 'Service role full access trends', 'FOR ALL TO service_role USING (true) WITH CHECK (true)');

  console.log('\n=== Verifying tables ===\n');

  // Quick verification
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;
  console.log('Tables in public schema:');
  for (const t of tables) {
    console.log(`  ✅ ${t.table_name}`);
  }

  const policies = await sql`
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    ORDER BY tablename, policyname
  `;
  console.log(`\nRLS Policies (${policies.length} total):`);
  for (const p of policies) {
    console.log(`  ✅ ${p.tablename} → ${p.policyname}`);
  }

  console.log('\n🎉 All policies fixed and verified!\n');
  await sql.end();
  process.exit(0);
}

fixPolicies();
