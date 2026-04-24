
const postgres = require('postgres');
const url = 'postgresql://postgres.nokjsonipeponxugsinq:p3oBLj5PjlvWS7gD@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';

async function check() {
  const sql = postgres(url, { ssl: 'require' });
  try {
    console.log('Disabling RLS on all tables...');
    await sql`ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE public.social_accounts DISABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE public.content_items DISABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE public.growth_metrics DISABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE public.trends DISABLE ROW LEVEL SECURITY`;
    console.log('✅ RLS disabled successfully.');
  } catch (err) {
    console.error('Failed:', err.message);
  } finally {
    await sql.end();
  }
}

check();
