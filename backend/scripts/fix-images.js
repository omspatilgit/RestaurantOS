require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MOCK_IMAGES = {
  'Butter Chicken': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80',
  'Garlic Naan': 'https://images.unsplash.com/photo-1605881528191-62f38ce9208d?w=800&q=80',
  'Paneer Tikka': 'https://images.unsplash.com/photo-1599487405270-86430b5d5d87?w=800&q=80',
  'Biryani': 'https://images.unsplash.com/photo-1589302168068-964664d93cb0?w=800&q=80',
  'Chicken Tikka Masala': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
  'Paneer Butter Masala': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc3?w=800&q=80',
  'Gulab Jamun': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
  'Kheer': 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=800&q=80',
  'Masala Chai': 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=800&q=80',
  'Mango Lassi': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'
};

async function fixMenuImages() {
  console.log('Fixing menu images...');
  const { data: menuItems, error } = await supabase.from('menu_items').select('*');
  
  if (error) {
    console.error('Error fetching menu:', error.message);
    return;
  }

  for (const item of menuItems) {
    let imageUrl = MOCK_IMAGES[item.name];
    if (!imageUrl) {
      imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'; // fallback
    }

    const { error: updateError } = await supabase
      .from('menu_items')
      .update({ image_url: imageUrl })
      .eq('id', item.id);
      
    if (updateError) {
      console.error(`Failed to update ${item.name}:`, updateError.message);
    } else {
      console.log(`Updated image for ${item.name}`);
    }
  }
  console.log('Finished updating menu images.');
}

fixMenuImages().catch(console.error);
