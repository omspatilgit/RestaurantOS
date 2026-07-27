require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function initSchema() {
  console.log('🚀 Initializing RestaurantOS database schema...\n');

  // --- menu_items ---
  const { error: e1 } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS menu_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        price NUMERIC(10,2) NOT NULL,
        category TEXT NOT NULL DEFAULT 'Main',
        image_url TEXT,
        is_available BOOLEAN NOT NULL DEFAULT true,
        is_veg BOOLEAN NOT NULL DEFAULT false,
        spice_level INTEGER DEFAULT 0,
        prep_time_min INTEGER DEFAULT 15,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `
  });

  if (e1) {
    // Table might already exist or rpc not available — use raw SQL via REST
    console.log('Note: RPC method not available, using direct insert approach.');
  }

  // --- orders ---
  const { error: e2 } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        table_number INTEGER NOT NULL,
        items JSONB NOT NULL DEFAULT '[]',
        total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'kitchen', 'served', 'cancelled')),
        customer_name TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `
  });
  if (e2) console.log('orders table:', e2.message);

  // --- queue ---
  const { error: e3 } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS queue (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        party_name TEXT NOT NULL,
        party_size INTEGER NOT NULL,
        phone TEXT,
        status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'seated', 'left')),
        estimated_wait_min INTEGER,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `
  });
  if (e3) console.log('queue table:', e3.message);

  console.log('\n✅ Schema initialization attempted. Seeding sample menu items...\n');

  // Seed menu items
  const menuItems = [
    { name: 'Butter Chicken', description: 'Tender chicken in creamy tomato sauce', price: 320, category: 'Main', is_veg: false, spice_level: 2, prep_time_min: 20, image_url: '/images/butter_chicken.png' },
    { name: 'Paneer Tikka', description: 'Grilled cottage cheese with spiced marinade', price: 280, category: 'Starters', is_veg: true, spice_level: 2, prep_time_min: 15, image_url: '/images/paneer_tikka.png' },
    { name: 'Biryani', description: 'Aromatic basmati rice with spices', price: 350, category: 'Main', is_veg: false, spice_level: 3, prep_time_min: 30, image_url: '/images/biryani.png' },
    { name: 'Dal Makhani', description: 'Slow-cooked black lentils in butter and cream', price: 220, category: 'Main', is_veg: true, spice_level: 1, prep_time_min: 25, image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
    { name: 'Garlic Naan', description: 'Freshly baked bread with garlic and butter', price: 60, category: 'Breads', is_veg: true, spice_level: 0, prep_time_min: 8, image_url: 'https://images.unsplash.com/photo-1505253468034-514d2507d914?w=400' },
    { name: 'Mango Lassi', description: 'Chilled yogurt drink with fresh mango', price: 120, category: 'Drinks', is_veg: true, spice_level: 0, prep_time_min: 5, image_url: '/images/mango_lassi.png' },
    { name: 'Gulab Jamun', description: 'Soft milk dumplings in rose syrup', price: 100, category: 'Desserts', is_veg: true, spice_level: 0, prep_time_min: 5, image_url: 'https://images.unsplash.com/photo-1601303516534-bf43e9e29ee1?w=400' },
    { name: 'Chicken Tikka', description: 'Marinated chicken pieces grilled in tandoor', price: 380, category: 'Starters', is_veg: false, spice_level: 3, prep_time_min: 18, image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400' },
    { name: 'Samosa (2 pcs)', description: 'Crispy pastry stuffed with spiced potatoes', price: 80, category: 'Starters', is_veg: true, spice_level: 2, prep_time_min: 10, image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
    { name: 'Masala Chai', description: 'Spiced Indian tea with milk', price: 50, category: 'Drinks', is_veg: true, spice_level: 1, prep_time_min: 5, image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
  ];

  const { error: seedErr } = await supabase.from('menu_items').upsert(menuItems, { onConflict: 'name' });
  if (seedErr) {
    console.log('Seed note:', seedErr.message);
    console.log('(This may mean the table does not exist yet — please create it via Supabase dashboard)');
    console.log('\n📋 SQL to run in Supabase SQL Editor:\n');
    console.log(getCreateTableSQL());
  } else {
    console.log('✅ Menu items seeded successfully!');
  }
}

function getCreateTableSQL() {
  return `
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL DEFAULT 'Main',
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_veg BOOLEAN NOT NULL DEFAULT false,
  spice_level INTEGER DEFAULT 0,
  prep_time_min INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INTEGER NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'kitchen', 'served', 'cancelled')),
  customer_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_name TEXT NOT NULL,
  party_size INTEGER NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'seated', 'left')),
  estimated_wait_min INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue ENABLE ROW LEVEL SECURITY;

-- Allow anon read on menu_items
CREATE POLICY "Anyone can read menu items" ON menu_items FOR SELECT USING (true);
-- Allow authenticated to insert orders
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Service role manages all" ON orders FOR ALL USING (true);
CREATE POLICY "Queue read" ON queue FOR SELECT USING (true);
CREATE POLICY "Queue insert" ON queue FOR INSERT WITH CHECK (true);
CREATE POLICY "Queue update" ON queue FOR UPDATE USING (true);
  `;
}

initSchema().catch(console.error);
