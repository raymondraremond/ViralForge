
const postgres = require('postgres');
// Reconstructed direct URL
const url = 'postgresql://postgres:p3oBLj5PjlvWS7gD@db.nokjsonipeponxugsinq.supabase.co:5432/postgres';

async function check() {
  const sql = postgres(url, { ssl: 'require' });
  try {
    console.log('Testing direct connection to DB host...');
    const result = await sql`SELECT 1 as connected`;
    console.log('Success:', result);
  } catch (err) {
    console.error('Failed direct connection:', err.message);
  } finally {
    await sql.end();
  }
}

check();
