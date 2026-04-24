
const postgres = require('postgres');
const url = 'postgresql://postgres.nokjsonipeponxugsinq:p3oBLj5PjlvWS7gD@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';

async function check() {
  const sql = postgres(url, { ssl: 'require' });
  try {
    console.log('Checking tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Tables:', tables.map(t => t.table_name).join(', '));

    if (tables.some(t => t.table_name === 'growth_metrics')) {
      console.log('growth_metrics table exists.');
      // Try a valid UUID query
      const validUuid = '00000000-0000-0000-0000-000000000000';
      try {
        await sql`SELECT * FROM growth_metrics WHERE user_id = ${validUuid} LIMIT 1`;
        console.log('Query with valid UUID worked (returned 0 results).');
      } catch (e) {
        console.error('Query with valid UUID failed:', e.message);
      }

      // Try "test" query
      try {
        console.log('Testing with "test" userId...');
        await sql`SELECT * FROM growth_metrics WHERE user_id = ${'test'} LIMIT 1`;
        console.log('Query with "test" worked? (Unlikely)');
      } catch (e) {
        console.error('Query with "test" failed (EXPECTED):', e.message);
      }
    } else {
      console.log('growth_metrics table DOES NOT exist.');
    }
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    await sql.end();
  }
}

check();
