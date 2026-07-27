require('dotenv').config();
const { Client } = require('pg');

async function fixDb() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Postgres');

    // 1. Add missing columns
    console.log('Adding missing columns...');
    await client.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
    `);
    
    console.log('Columns added.');

    // 2. Enable realtime
    console.log('Enabling realtime...');
    await client.query(`
      BEGIN;
      DROP PUBLICATION IF EXISTS supabase_realtime;
      CREATE PUBLICATION supabase_realtime;
      COMMIT;
      ALTER PUBLICATION supabase_realtime ADD TABLE orders;
      ALTER PUBLICATION supabase_realtime ADD TABLE queue;
      ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
    `);

    console.log('Realtime enabled successfully!');
  } catch (err) {
    console.error('Error fixing DB:', err.message);
  } finally {
    await client.end();
  }
}

fixDb();
