require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 8000;

// ── Clients ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));

app.use(express.json());

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'RestaurantOS API' });
});

// ── Menu Items ────────────────────────────────────────────────────────────────
app.get('/api/menu', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;

    const MOCK_IMAGES = {
      'Butter Chicken': '/images/butter_chicken.png',
      'Garlic Naan': '/images/garlic_naan.png',
      'Paneer Tikka': '/images/paneer_tikka.png',
      'Biryani': '/images/biryani.png',
      'Lamb Biryani': '/images/biryani.png',
      'Chicken Tikka Masala': '/images/butter_chicken.png', // using butter chicken as close substitute
      'Paneer Butter Masala': '/images/paneer_tikka.png', // using paneer tikka as close substitute
      'Gulab Jamun': '/images/gulab_jamun.png',
      'Kheer': '/images/kheer.png',
      'Masala Chai': '/images/masala_chai.png',
      'Mango Lassi': '/images/mango_lassi.png',
      'Dal Tadka': '/images/dal_tadka.png',
      'Samosa (2 pcs)': '/images/samosa.png',
      'Onion Bhaji': '/images/onion_bhaji.png'
    };

    const enhancedData = data.map(item => ({
      ...item,
      image_url: MOCK_IMAGES[item.name] || '/images/biryani.png'
    }));

    res.json({ success: true, data: enhancedData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/menu/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', req.params.id)
      .single();

    const MOCK_IMAGES = {
      'Butter Chicken': '/images/butter_chicken.png',
      'Garlic Naan': '/images/garlic_naan.png',
      'Paneer Tikka': '/images/paneer_tikka.png',
      'Biryani': '/images/biryani.png',
      'Lamb Biryani': '/images/biryani.png',
      'Chicken Tikka Masala': '/images/butter_chicken.png', // using butter chicken as close substitute
      'Paneer Butter Masala': '/images/paneer_tikka.png', // using paneer tikka as close substitute
      'Gulab Jamun': '/images/gulab_jamun.png',
      'Kheer': '/images/kheer.png',
      'Masala Chai': '/images/masala_chai.png',
      'Mango Lassi': '/images/mango_lassi.png',
      'Dal Tadka': '/images/dal_tadka.png',
      'Samosa (2 pcs)': '/images/samosa.png',
      'Onion Bhaji': '/images/onion_bhaji.png'
    };

    const enhancedData = {
      ...data,
      image_url: MOCK_IMAGES[data.name] || '/images/biryani.png'
    };

    res.json({ success: true, data: enhancedData });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});

app.patch('/api/menu/:id/availability', async (req, res) => {
  try {
    const { is_available } = req.body;
    const { data, error } = await supabase
      .from('menu_items')
      .update({ is_available })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/menu', async (req, res) => {
  try {
    const { name, description, price, category, is_veg, spice_level, prep_time_min, image_url } = req.body;
    
    if (!name || !price || !category) {
      return res.status(400).json({ success: false, error: 'Name, price, and category are required' });
    }

    const newItem = {
      name,
      description: description || '',
      price: Number(price),
      category,
      is_veg: Boolean(is_veg),
      spice_level: Number(spice_level || 0),
      prep_time_min: Number(prep_time_min || 15),
      is_available: true
    };
    
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([newItem])
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      return res.status(201).json({ success: true, data });
    } catch (dbErr) {
      console.warn('Fallback to mock for new menu item', dbErr);
      return res.status(201).json({ success: true, data: { ...newItem, id: Date.now().toString(), image_url: image_url || '/images/biryani.png' } });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Tables ────────────────────────────────────────────────────────────────────
let mockTables = Array.from({ length: 10 }).map((_, i) => ({
  id: `tbl_mock_${i+1}`,
  table_number: i + 1,
  capacity: (i % 3 === 0) ? 6 : ((i % 2 === 0) ? 2 : 4),
  status: 'available',
  current_order_id: null,
  created_at: new Date().toISOString()
}));

app.get('/api/tables', async (req, res) => {
  try {
    const { data, error } = await supabase.from('restaurant_tables').select('*').order('table_number', { ascending: true });
    if (error || !data || data.length === 0) {
      return res.json({ success: true, data: mockTables });
    }
    res.json({ success: true, data });
  } catch (err) {
    res.json({ success: true, data: mockTables });
  }
});

app.post('/api/tables', async (req, res) => {
  try {
    const { table_number, capacity } = req.body;
    const newTable = { table_number: Number(table_number), capacity: Number(capacity || 4), status: 'available' };
    
    const { data, error } = await supabase.from('restaurant_tables').insert([newTable]).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.warn('Fallback to mock for new table', err);
    const tbl = { ...req.body, id: Date.now().toString(), status: 'available', created_at: new Date().toISOString() };
    mockTables.push(tbl);
    res.status(201).json({ success: true, data: tbl });
  }
});

app.patch('/api/tables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await supabase.from('restaurant_tables').update(updates).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.warn('Fallback to mock for updating table', err);
    const idx = mockTables.findIndex(t => t.id === req.params.id);
    if (idx >= 0) {
      mockTables[idx] = { ...mockTables[idx], ...req.body };
      return res.json({ success: true, data: mockTables[idx] });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/tables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('restaurant_tables').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    mockTables = mockTables.filter(t => t.id !== req.params.id);
    res.json({ success: true });
  }
});

// ── Orders ────────────────────────────────────────────────────────────────────
const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
const today = new Date().toISOString();

let inMemoryOrders = [
  {
    id: `ord_mock_1`,
    table_number: 2,
    items: [{ name: 'Butter Chicken', qty: 2, price: 250 }, { name: 'Garlic Naan', qty: 3, price: 40 }],
    total_amount: 620,
    status: 'served',
    customer_name: 'Rahul',
    notes: 'Extra spicy',
    created_at: twoDaysAgo,
    updated_at: twoDaysAgo,
  },
  {
    id: `ord_mock_2`,
    table_number: 5,
    items: [{ name: 'Paneer Tikka', qty: 1, price: 180 }, { name: 'Mango Lassi', qty: 2, price: 60 }],
    total_amount: 300,
    status: 'served',
    customer_name: 'Sneha',
    notes: null,
    created_at: twoDaysAgo,
    updated_at: twoDaysAgo,
  },
  {
    id: `ord_mock_3`,
    table_number: 1,
    items: [{ name: 'Biryani', qty: 2, price: 300 }],
    total_amount: 600,
    status: 'served',
    customer_name: 'Amit',
    notes: 'Less oil',
    created_at: yesterday,
    updated_at: yesterday,
  },
  {
    id: `ord_mock_4`,
    table_number: 7,
    items: [{ name: 'Dal Tadka', qty: 1, price: 150 }, { name: 'Garlic Naan', qty: 2, price: 40 }],
    total_amount: 230,
    status: 'served',
    customer_name: 'Priya',
    notes: null,
    created_at: yesterday,
    updated_at: yesterday,
  },
  {
    id: `ord_mock_5`,
    table_number: 3,
    items: [{ name: 'Masala Chai', qty: 4, price: 30 }, { name: 'Samosa (2 pcs)', qty: 2, price: 50 }],
    total_amount: 220,
    status: 'served',
    customer_name: 'Vikram',
    notes: null,
    created_at: today,
    updated_at: today,
  }
];

app.get('/api/orders', async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error || !data) {
      let filtered = inMemoryOrders;
      if (status) filtered = filtered.filter(o => o.status === status);
      return res.json({ success: true, data: filtered });
    }
    // Map over DB data and merge any matching memory order data to recover dropped fields like notes
    const enhancedData = data.map(d => {
      const memMatch = inMemoryOrders.find(m => String(m.id) === String(d.id));
      if (memMatch) {
        return { ...memMatch, ...d, notes: d.notes || memMatch.notes, customer_name: d.customer_name || memMatch.customer_name };
      }
      return d;
    });
    // Combine cloud and memory orders
    const combined = [...enhancedData, ...inMemoryOrders.filter(m => !enhancedData.find(d => String(d.id) === String(m.id)))];
    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json({ success: true, data: combined });
  } catch (err) {
    let filtered = inMemoryOrders;
    if (req.query.status) filtered = filtered.filter(o => o.status === req.query.status);
    res.json({ success: true, data: filtered });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { table_number, items, total_amount, customer_name, notes } = req.body;

    if (!table_number || !items || !items.length) {
      return res.status(400).json({ success: false, error: 'table_number and items are required' });
    }

    const newMemOrder = {
      id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      table_number: Number(table_number),
      items,
      total_amount: Number(total_amount || 0),
      customer_name: customer_name || 'Guest',
      notes: notes || null,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    inMemoryOrders.unshift(newMemOrder);

    try {
      let { data, error } = await supabase
        .from('orders')
        .insert({ table_number: Number(table_number), items, total_amount: Number(total_amount || 0), customer_name, notes })
        .select()
        .single();

      if (error && error.message.includes('column') && error.message.includes('schema cache')) {
        // Fallback: table is missing customer_name and notes
        console.warn('Fallback: Inserting without customer_name/notes');
        const retry = await supabase
          .from('orders')
          .insert({ table_number: Number(table_number), items, total_amount: Number(total_amount || 0) })
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (!error && data) {
        // Match the memory order ID with the database ID to avoid duplicates
        const idx = inMemoryOrders.findIndex(o => o.id === newMemOrder.id);
        if (idx !== -1) {
          inMemoryOrders[idx].id = data.id;
        }
        const mergedData = { ...(idx !== -1 ? inMemoryOrders[idx] : newMemOrder), ...data };
        return res.status(201).json({ success: true, data: mergedData });
      } else if (error) {
        console.error('Supabase insert error:', error.message, error.details);
      }
    } catch (e) {
      console.error('Supabase catch error:', e);
    }

    res.status(201).json({ success: true, data: newMemOrder });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'kitchen', 'served', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    // Update in-memory store
    const memOrder = inMemoryOrders.find(o => String(o.id) === String(req.params.id));
    if (memOrder) {
      memOrder.status = status;
      memOrder.updated_at = new Date().toISOString();
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .select()
        .single();

      if (!error && data) {
        return res.json({ success: true, data });
      }
    } catch {}

    res.json({ success: true, data: memOrder || { id: req.params.id, status } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Table Status ──────────────────────────────────────────────────────────────
app.get('/api/tables/status', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: dbOrders, error } = await supabase
      .from('orders')
      .select('table_number, status, created_at')
      .gte('created_at', today.toISOString());

    if (error && !error.message.includes('schema cache')) {
      console.error('Error fetching tables status:', error.message);
    }

    const orders = dbOrders || [];
    // Merge inMemoryOrders
    const memOrdersToday = inMemoryOrders.filter(m => new Date(m.created_at) >= today && !orders.find(o => o.id === m.id));
    const allOrders = [...orders, ...memOrdersToday];

    // Determine booked tables (active orders in last 3 hours)
    const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000;
    const bookedTables = new Set(
      allOrders
        .filter(o => o.status !== 'cancelled' && o.status !== 'completed' && new Date(o.created_at).getTime() > threeHoursAgo)
        .map(o => o.table_number)
    );

    const tables = [];
    for (let i = 1; i <= 10; i++) {
      tables.push({
        table_number: i,
        status: bookedTables.has(i) ? 'booked' : 'free'
      });
    }

    res.json({ success: true, data: tables });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tables/:table_number/checkout', async (req, res) => {
  try {
    const tableNum = Number(req.params.table_number);
    if (!tableNum) return res.status(400).json({ success: false, error: 'Invalid table' });

    // Update memory orders
    inMemoryOrders.forEach(o => {
      if (Number(o.table_number) === tableNum && o.status !== 'cancelled' && o.status !== 'completed') {
        o.status = 'completed';
        o.updated_at = new Date().toISOString();
      }
    });

    // Update db orders
    try {
      await supabase
        .from('orders')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('table_number', tableNum)
        .in('status', ['pending', 'kitchen', 'served']);
    } catch (e) {
      console.error('Supabase checkout error', e);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ── Queue ─────────────────────────────────────────────────────────────────────
let inMemoryQueue = [
  { id: 'q1', party_name: 'Sharma Family', party_size: 4, phone: '98765-43210', status: 'waiting', created_at: new Date(Date.now() - 26 * 60000).toISOString() },
  { id: 'q2', party_name: 'Raj & Friends', party_size: 6, phone: '', status: 'waiting', created_at: new Date(Date.now() - 21 * 60000).toISOString() },
  { id: 'q3', party_name: 'Mehta', party_size: 2, phone: '91234-56789', status: 'waiting', created_at: new Date(Date.now() - 19 * 60000).toISOString() },
  { id: 'q4', party_name: 'Patil', party_size: 2, phone: '', status: 'waiting', created_at: new Date().toISOString() },
];

app.get('/api/queue', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('queue')
      .select('*')
      .eq('status', 'waiting')
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // Combine cloud and memory queue
    const combined = [...data, ...inMemoryQueue.filter(m => !data.find(d => String(d.id) === String(m.id)))];
    combined.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    res.json({ success: true, data: combined.filter(q => q.status === 'waiting') });
  } catch (err) {
    res.json({ success: true, data: inMemoryQueue.filter(q => q.status === 'waiting') });
  }
});

app.post('/api/queue', async (req, res) => {
  try {
    const { party_name, party_size, phone, notes } = req.body;

    if (!party_name || !party_size) {
      return res.status(400).json({ success: false, error: 'party_name and party_size are required' });
    }

    const newMemQueue = {
      id: `q_${Date.now()}`,
      party_name,
      party_size,
      phone,
      notes,
      status: 'waiting',
      created_at: new Date().toISOString()
    };
    inMemoryQueue.push(newMemQueue);

    try {
      const { data, error } = await supabase
        .from('queue')
        .insert({ party_name, party_size, phone, notes })
        .select()
        .single();

      if (!error && data) {
        newMemQueue.id = data.id;
        return res.status(201).json({ success: true, data });
      }
    } catch (e) {}

    res.status(201).json({ success: true, data: newMemQueue });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/queue/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const memMatch = inMemoryQueue.find(q => String(q.id) === String(req.params.id));
    if (memMatch) memMatch.status = status;

    try {
      const { data, error } = await supabase
        .from('queue')
        .update({ status })
        .eq('id', req.params.id)
        .select()
        .single();

      if (!error && data) {
        return res.json({ success: true, data });
      }
    } catch (e) {}

    res.json({ success: true, data: memMatch || { id: req.params.id, status } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Bookings ──────────────────────────────────────────────────────────────────
let inMemoryBookings = [];

app.get('/api/bookings', (req, res) => {
  res.json({ success: true, data: inMemoryBookings });
});

app.post('/api/bookings', (req, res) => {
  const { name, phone, date, time, party_size, token_charge } = req.body;
  if (!name || !date || !time || !party_size) {
    return res.status(400).json({ success: false, error: 'Missing fields' });
  }
  const newBooking = {
    id: `book_${Date.now()}`,
    name,
    phone,
    date,
    time,
    party_size,
    token_charge,
    status: 'confirmed',
    created_at: new Date().toISOString()
  };
  inMemoryBookings.push(newBooking);
  res.status(201).json({ success: true, data: newBooking });
});

// ── Gemini AI: Wait Time Prediction ──────────────────────────────────────────
app.post('/api/predict-wait', async (req, res) => {
  try {
    const { active_tables, pending_orders, party_size } = req.body;

    if (party_size === undefined || party_size === null) {
      return res.status(400).json({ success: false, error: 'party_size is required' });
    }

    const prompt = `You are an AI assistant for a busy Indian restaurant called RestaurantOS.

Current restaurant state:
- Active tables (currently occupied): ${active_tables ?? 0}
- Pending/in-kitchen orders: ${pending_orders ?? 0}
- New party size (waiting customers): ${party_size}

Based on typical restaurant dynamics, predict:
1. Estimated wait time in minutes (be realistic: 5-45 minutes range usually)
2. A short, friendly message for the customer (1-2 sentences)
3. A confidence level: low, medium, or high

Respond ONLY with valid JSON in this exact format:
{
  "wait_time_min": <number>,
  "message": "<friendly string>",
  "confidence": "<low|medium|high>",
  "factors": "<brief explanation of key factors>"
}`;

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const response = await genai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const text = response.text;
    const parsed = JSON.parse(text);

    res.json({ success: true, data: parsed });
  } catch (err) {
    console.error('Gemini error:', err.message);
    // Fallback prediction if Gemini fails
    const fallback = {
      wait_time_min: Math.ceil((req.body.pending_orders || 3) * 7 + (req.body.party_size || 2) * 2),
      message: "We'll have a table ready for you shortly. Thank you for your patience!",
      confidence: 'medium',
      factors: 'Estimated based on current queue length',
    };
    res.json({ success: true, data: fallback, fallback: true });
  }
});

// ── Gemini AI: Chatbot ────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, error: 'messages array is required' });
    }

    const systemPrompt = `You are an AI assistant for a fine-dining Indian restaurant called RestaurantOS.
Be helpful, concise, and polite. 
Use a warm, welcoming tone.
Keep your answers brief (1-3 sentences maximum).

Information about the restaurant:
- Cuisine: Fine Indian (e.g. Paneer Tikka, Butter Chicken, Biryani, Garlic Naan)
- Peak hours: 7:00 PM to 9:30 PM.
- Current estimated wait time: roughly 15-25 minutes.
- Payment: We accept a token charge of ₹100 to reserve a table in advance, which is deducted from the final bill.

If the user asks about the menu, list 2-3 popular items. If they ask about wait times, tell them the estimated wait time.`;

    // Construct history for Gemini
    const contents = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // Prepend system prompt to the first user message, or add it as a new message if empty
    if (contents.length > 0 && contents[0].role === 'user') {
      contents[0].parts[0].text = `${systemPrompt}\n\nUser: ${contents[0].parts[0].text}`;
    } else {
      contents.unshift({ role: 'user', parts: [{ text: systemPrompt }] });
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const response = await genai.models.generateContent({
      model: modelName,
      contents,
      config: {
        temperature: 0.5,
      },
    });

    res.json({ success: true, reply: response.text });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to generate response' });
  }
});

// ── Dashboard Stats ───────────────────────────────────────────────────────────
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [ordersRes, menuRes, queueRes] = await Promise.all([
      supabase.from('orders').select('*').gte('created_at', today.toISOString()),
      supabase.from('menu_items').select('id, is_available'),
      supabase.from('queue').select('*').eq('status', 'waiting'),
    ]);

    let orders = ordersRes.data || [];
    
    // Merge inMemoryOrders that were created today
    const memOrdersToday = inMemoryOrders.filter(m => new Date(m.created_at) >= today && !orders.find(o => o.id === m.id));
    orders = [...orders, ...memOrdersToday];

    const menuItems = menuRes.data || [];
    let queueItems = queueRes.data || [];
    
    const memQueueWaiting = inMemoryQueue.filter(m => m.status === 'waiting' && !queueItems.find(q => String(q.id) === String(m.id)));
    queueItems = [...queueItems, ...memQueueWaiting];

    const totalRevenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + Number(o.total_amount), 0);

    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const kitchenOrders = orders.filter(o => o.status === 'kitchen').length;
    const servedOrders = orders.filter(o => o.status === 'served').length;

    res.json({
      success: true,
      data: {
        today_revenue: totalRevenue,
        total_orders: orders.length,
        pending_orders: pendingOrders,
        kitchen_orders: kitchenOrders,
        served_orders: servedOrders,
        active_menu_items: menuItems.filter(m => m.is_available).length,
        queue_length: queueItems.length,
        hourly_breakdown: generateHourlyData(orders),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function generateHourlyData(orders) {
  const hours = {};
  orders.forEach(order => {
    const h = new Date(order.created_at).getHours();
    const key = `${h}:00`;
    if (!hours[key]) hours[key] = { hour: key, revenue: 0, orders: 0 };
    hours[key].revenue += Number(order.total_amount);
    hours[key].orders += 1;
  });
  return Object.values(hours).sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
}

// ── Customer Feedback ─────────────────────────────────────────────────────────
let inMemoryFeedback = [];

app.post('/api/feedback', async (req, res) => {
  try {
    const { order_id, table_number, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }

    const feedback = {
      id: `fb_${Date.now()}`,
      order_id: order_id || null,
      table_number: Number(table_number || 0),
      rating: Number(rating),
      comment: comment || '',
      created_at: new Date().toISOString(),
    };

    inMemoryFeedback.push(feedback);

    // Try to store in Supabase if table exists
    try {
      await supabase.from('feedback').insert(feedback);
    } catch {}

    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/feedback/stats', async (req, res) => {
  try {
    const total = inMemoryFeedback.length;
    const avgRating = total > 0
      ? (inMemoryFeedback.reduce((s, f) => s + f.rating, 0) / total).toFixed(1)
      : '0.0';
    res.json({
      success: true,
      data: { total_reviews: total, average_rating: Number(avgRating), recent: inMemoryFeedback.slice(-5).reverse() },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Analytics: Popular Items ──────────────────────────────────────────────────
app.get('/api/analytics/popular-items', async (req, res) => {
  try {
    const { data: orders } = await supabase
      .from('orders')
      .select('items')
      .neq('status', 'cancelled');

    const allOrders = [...(orders || []), ...inMemoryOrders.filter(o => o.status !== 'cancelled')];
    const itemCount = {};

    allOrders.forEach(order => {
      let items = order.items;
      if (typeof items === 'string') {
        try { items = JSON.parse(items); } catch { items = []; }
      }
      if (Array.isArray(items)) {
        items.forEach(item => {
          const name = item.name || 'Unknown';
          if (!itemCount[name]) itemCount[name] = { name, count: 0, revenue: 0 };
          itemCount[name].count += Number(item.qty || 1);
          itemCount[name].revenue += Number(item.price || 0) * Number(item.qty || 1);
        });
      }
    });

    const popular = Object.values(itemCount).sort((a, b) => b.count - a.count).slice(0, 10);
    res.json({ success: true, data: popular });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 RestaurantOS API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.ENVIRONMENT || 'development'}`);
  console.log(`   Supabase: ${process.env.SUPABASE_URL ? '✅' : '❌ Missing'}`);
  console.log(`   Gemini:   ${process.env.GEMINI_API_KEY ? '✅' : '❌ Missing'}\n`);
});

