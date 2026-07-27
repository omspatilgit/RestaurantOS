require('dotenv').config();
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createRestaurantTables() {
  console.log('🚀 Creating restaurant_tables in Postgres...\n');

  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
  });

  try {
    await client.connect();
    
    const sql = `
      CREATE TABLE IF NOT EXISTS restaurant_tables (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        table_number INTEGER UNIQUE NOT NULL,
        capacity INTEGER NOT NULL DEFAULT 4,
        status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'cleaning', 'reserved')),
        current_order_id UUID,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `;

    await client.query(sql);
    console.log('✅ Table created successfully in Postgres.');

    // Enable realtime for this table
    try {
      await client.query(`ALTER PUBLICATION supabase_realtime ADD TABLE restaurant_tables;`);
      console.log('✅ Realtime enabled for restaurant_tables.');
    } catch (e) {
      if (e.message.includes('already exists') || e.message.includes('duplicate')) {
        console.log('✅ Realtime already configured for restaurant_tables.');
      } else {
        console.log('⚠️ Could not configure realtime publication automatically:', e.message);
      }
    }

  } catch (error) {
    console.error('Error creating table:', error.message);
    return;
  } finally {
    await client.end();
  }

  console.log('🚀 Seeding tables...');
  // Seed default tables (1 to 10)
  const seedTables = Array.from({ length: 10 }).map((_, i) => ({
    table_number: i + 1,
    capacity: (i % 3 === 0) ? 6 : ((i % 2 === 0) ? 2 : 4), // Mix of capacities: 2, 4, 6
    status: 'available'
  }));

  const { error: seedErr } = await supabase
    .from('restaurant_tables')
    .upsert(seedTables, { onConflict: 'table_number' });

  if (seedErr) {
    console.error('Error seeding tables:', seedErr.message);
  } else {
    console.log('✅ Seeded tables 1-10 successfully.');
  }
}

createRestaurantTables();
