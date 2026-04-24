const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  const url = process.env.DATABASE_URL;
  console.log('Testing connection to:', url ? url.substring(0, 20) + '...' : 'MISSING');
  
  if (!url) {
    console.error('DATABASE_URL is missing in .env.local');
    process.exit(1);
  }

  const sql = postgres(url, { ssl: 'require' });
  
  try {
    const result = await sql`SELECT 1 as connected`;
    console.log('Successfully connected to the database:', result);
    
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Existing tables:', tables.map(t => t.table_name));
    
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await sql.end();
  }
}

testConnection();
