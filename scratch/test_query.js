
const postgres = require('postgres');
const url = 'postgresql://postgres.nokjsonipeponxugsinq:p3oBLj5PjlvWS7gD@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';

async function check() {
  const sql = postgres(url, { ssl: 'require' });
  try {
    console.log('Testing query on profiles...');
    const id = '76285eed-243f-4b56-b518-6d208c98fec1';
    const result = await sql`
      SELECT "id", "full_name", "avatar_url", "niche", "monetization_goal", "monetization_status", "is_autonomous", "created_at", "updated_at" 
      FROM "profiles" 
      WHERE "id" = ${id}
    `;
    console.log('Result:', result);
  } catch (err) {
    console.error('FULL ERROR OBJECT:', err);
    console.error('Error message:', err.message);
  } finally {
    await sql.end();
  }
}

check();
