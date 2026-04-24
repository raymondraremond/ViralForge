const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function test() {
  const url = 'postgresql://postgres:p3oBLj5PjlvWS7gD@[2a05:d018:135e:16e0:a985:5edc:7036:ef3b]:5432/postgres';
  console.log('Connecting to IPv6 directly:', url);
  const sql = postgres(url, { ssl: 'require' });
  try {
    const result = await sql`SELECT NOW()`;
    console.log('Success:', result);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

test();
