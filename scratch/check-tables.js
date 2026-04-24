// Check which tables exist in Supabase via the REST API
const SUPABASE_URL = 'https://nokjsonipeponxugsinq.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5va2pzb25pcGVwb254dWdzaW5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU1MTQ3MSwiZXhwIjoyMDkyMTI3NDcxfQ.QT6hSwAjO_8QNXYC38R2r5TOmIurnhXn2vweUQlUWdE';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5va2pzb25pcGVwb254dWdzaW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTE0NzEsImV4cCI6MjA5MjEyNzQ3MX0.4Z2HhNFln4Zb3Tz2YukDXkKGwRdeB3H4gw6PvSppHkY';

const tables = ['profiles', 'social_accounts', 'content_items', 'growth_metrics', 'trends'];

async function checkTable(tableName) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=id&limit=1`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      }
    });
    const status = res.status;
    const body = await res.text();
    if (status === 200) {
      console.log(`✅ ${tableName}: EXISTS (${status})`);
    } else {
      console.log(`❌ ${tableName}: ${status} - ${body.substring(0, 200)}`);
    }
  } catch (err) {
    console.log(`❌ ${tableName}: NETWORK ERROR - ${err.message}`);
  }
}

async function main() {
  console.log('=== Checking Supabase Tables via REST API ===\n');
  for (const t of tables) {
    await checkTable(t);
  }
  console.log('\n=== Done ===');
}

main();
