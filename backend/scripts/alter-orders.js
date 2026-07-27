require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function alterOrders() {
  console.log('Adding missing columns to orders table...');
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
    `
  });

  if (error) {
    console.error('RPC exec_sql failed:', error.message);
    // Since exec_sql might not exist, let's try a workaround
  } else {
    console.log('Successfully altered orders table via RPC.');
  }
}

alterOrders().catch(console.error);
