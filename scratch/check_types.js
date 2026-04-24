
const postgres = require('postgres');
const url = 'postgresql://postgres.nokjsonipeponxugsinq:p3oBLj5PjlvWS7gD@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';

async function check() {
  const sql = postgres(url, { ssl: 'require' });
  try {
    console.log('Checking profiles columns with types...');
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'profiles'
    `;
    console.table(columns);
  } catch (err) {
    console.error('Failed:', err.message);
  } finally {
    await sql.end();
  }
}

check();
