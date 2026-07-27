require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function enableRealtime() {
  console.log('Enabling realtime for orders table...');
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      BEGIN;
      DROP PUBLICATION IF EXISTS supabase_realtime;
      CREATE PUBLICATION supabase_realtime;
      COMMIT;
      ALTER PUBLICATION supabase_realtime ADD TABLE orders;
      ALTER PUBLICATION supabase_realtime ADD TABLE queue;
      ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
    `
  });

  if (error) {
    console.error('RPC failed, trying raw insert if possible. Error:', error.message);
  } else {
    console.log('Realtime enabled via RPC!');
  }
}

enableRealtime().catch(console.error);
