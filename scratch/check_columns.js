
const postgres = require('postgres');
const url = 'postgresql://postgres.nokjsonipeponxugsinq:p3oBLj5PjlvWS7gD@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';

async function check() {
  const sql = postgres(url, { ssl: 'require' });
  try {
    console.log('Checking profiles columns...');
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'profiles'
    `;
    console.log('Columns:', columns.map(c => c.column_name).join(', '));
  } catch (err) {
    console.error('Failed:', err.message);
  } finally {
    await sql.end();
  }
}

check();
