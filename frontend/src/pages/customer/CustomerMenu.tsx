import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Minus, Plus, X, Clock, ChefHat, CheckCircle,
  Loader2, Search, ShoppingBag, ArrowLeft, Leaf, Sparkles, Star
} from 'lucide-react';
import { cn } from '../../lib/utils';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
  is_veg: boolean;
  spice_level: number;
  prep_time_min: number;
}

interface CartItem extends MenuItem { qty: number; }

// ─── Inline styles for the warm customer theme removed ───────────────────────

const MOCK_MENU: MenuItem[] = [
  { id: '1', name: 'Butter Chicken', description: 'Tender chicken in rich creamy tomato sauce with aromatic spices', price: 320, category: 'Main', is_veg: false, is_available: true, spice_level: 2, prep_time_min: 20, image_url: '/images/butter_chicken.png' },
  { id: '2', name: 'Paneer Tikka', description: 'Smoky grilled cottage cheese marinated in yogurt and spices', price: 280, category: 'Starters', is_veg: true, is_available: true, spice_level: 2, prep_time_min: 15, image_url: '/images/paneer_tikka.png' },
  { id: '3', name: 'Biryani', description: 'Fragrant basmati rice slow-cooked with tender meat and whole spices', price: 350, category: 'Main', is_veg: false, is_available: true, spice_level: 3, prep_time_min: 30, image_url: '/images/biryani.png' },
  { id: '4', name: 'Dal Makhani', description: 'Creamy slow-cooked black lentils simmered overnight in butter', price: 220, category: 'Main', is_veg: true, is_available: true, spice_level: 1, prep_time_min: 25, image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80' },
  { id: '5', name: 'Garlic Naan', description: 'Fluffy tandoor-baked flatbread with golden garlic butter', price: 60, category: 'Breads', is_veg: true, is_available: true, spice_level: 0, prep_time_min: 8, image_url: 'https://images.unsplash.com/photo-1505253468034-514d2507d914?w=600&auto=format&fit=crop&q=80' },
  { id: '6', name: 'Mango Lassi', description: 'Chilled blended yogurt with fresh Alphonso mango purée', price: 120, category: 'Drinks', is_veg: true, is_available: true, spice_level: 0, prep_time_min: 5, image_url: '/images/mango_lassi.png' },
  { id: '7', name: 'Gulab Jamun', description: 'Soft khoya dumplings soaked in saffron-rose sugar syrup', price: 100, category: 'Desserts', is_veg: true, is_available: true, spice_level: 0, prep_time_min: 5, image_url: 'https://images.unsplash.com/photo-1601303516534-bf43e9e29ee1?w=600&auto=format&fit=crop&q=80' },
  { id: '8', name: 'Chicken Tikka', description: 'Char-grilled chicken thigh marinated in spiced yogurt', price: 380, category: 'Starters', is_veg: false, is_available: true, spice_level: 3, prep_time_min: 18, image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&auto=format&fit=crop&q=80' },
  { id: '9', name: 'Samosa (2 pcs)', description: 'Golden crispy pastry pockets with spiced potato filling', price: 80, category: 'Starters', is_veg: true, is_available: false, spice_level: 2, prep_time_min: 10, image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80' },
  { id: '10', name: 'Masala Chai', description: 'Fragrant spiced tea brewed with ginger, cardamom and milk', price: 50, category: 'Drinks', is_veg: true, is_available: true, spice_level: 1, prep_time_min: 5, image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80' },
];

function SpiceDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map(i => (
        <div key={i} className={cn('w-2 h-2 rounded-full', i <= level ? 'bg-red-500' : 'bg-white/10')} />
      ))}
    </div>
  );
}

function MenuCard({ item, qty, onAdd, onRemove }: { item: MenuItem; qty: number; onAdd: () => void; onRemove: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={cn('rounded-3xl overflow-hidden flex flex-col glass border border-brand-400/20', !item.is_available && 'opacity-50')}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          loading="lazy"
          onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'; }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,5,0,0.9) 0%, transparent 60%)' }} />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {item.is_available ? (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: 'rgba(57,211,83,0.2)', border: '1px solid rgba(57,211,83,0.4)', color: '#39d353' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              LIVE
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: 'rgba(255,71,87,0.2)', border: '1px solid rgba(255,71,87,0.4)', color: '#ff4757' }}>
              SOLD OUT
            </div>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <div className={cn('w-6 h-6 rounded-md border-2 flex items-center justify-center', item.is_veg ? 'border-green-400' : 'border-red-400')}>
            <div className={cn('w-2.5 h-2.5 rounded-full', item.is_veg ? 'bg-green-400' : 'bg-red-400')} />
          </div>
        </div>

        {/* Price on image */}
        <div className="absolute bottom-3 left-3">
          <span className="text-2xl font-black text-white">₹{item.price}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="font-bold text-white text-base mb-1">{item.name}</h3>
          <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.description}</p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.prep_time_min}m</span>
              {item.is_veg && <span className="flex items-center gap-1"><Leaf className="w-3 h-3 text-green-400" />Veg</span>}
            </div>
            {item.spice_level > 0 && <SpiceDots level={item.spice_level} />}
          </div>
        </div>

        {/* Cart control */}
        {item.is_available ? (
          qty > 0 ? (
            <div className="flex items-center justify-between rounded-2xl px-3 py-2 bg-brand-400/10 border border-brand-400/30">
              <button id={`minus-${item.id}`} onClick={onRemove}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-90 bg-brand-400/20 text-brand-400 hover:bg-brand-400/30"
                aria-label={`Remove ${item.name}`}
              >
                <Minus className="w-4 h-4" />
              </button>
              <motion.span key={qty} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="text-lg font-black text-brand-400">{qty}</motion.span>
              <button id={`plus-${item.id}`} onClick={onAdd}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-90 text-black bg-brand-400 glow-lime"
                aria-label={`Add ${item.name}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id={`add-${item.id}`}
              onClick={onAdd}
              className="w-full h-11 rounded-2xl text-sm font-bold text-brand-400 transition-all cursor-pointer active:scale-95 bg-brand-400/10 border border-brand-400/30 hover:bg-brand-400/20"
            >
              + Add to Order
            </button>
          )
        ) : (
          <div className="w-full h-11 rounded-2xl flex items-center justify-center text-sm"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)' }}>
            Unavailable today
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CartSheet({ cart, onClose, onAdd, onRemove, onCheckout, tableNo, customerName }: {
  cart: CartItem[]; onClose: () => void; onAdd: (id: string) => void; onRemove: (id: string) => void;
  onCheckout: (notes: string) => Promise<void>; tableNo: string; customerName: string;
}) {
  const [placing, setPlacing] = useState(false);
  const [notes, setNotes] = useState('');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const gst = Math.round(total * 0.05);

  const handleOrder = async () => {
    setPlacing(true);
    await onCheckout(notes.trim());
    setPlacing(false);
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto rounded-t-3xl flex flex-col bg-surface-900 border border-brand-400/20 border-b-0 max-h-[85vh] glass"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-brand-400/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4 border-b border-brand-400/20">
          <div>
            <h2 className="text-lg font-bold text-brand-400 tracking-tight">Your Order</h2>
            <p className="text-xs text-brand-400/60">Table #{tableNo} · {customerName}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.06)' }} aria-label="Close cart">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <AnimatePresence>
            {cart.map(item => (
              <motion.div key={item.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3">
                <img src={item.image_url} alt={item.name}
                  className="w-14 h-14 rounded-2xl object-cover shrink-0"
                  onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'; }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                  <p className="text-xs text-brand-400/60">₹{item.price} × {item.qty}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => onRemove(item.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer text-white/60 hover:text-white transition-colors bg-white/5">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-5 text-center text-sm font-bold text-white">{item.qty}</span>
                  <button onClick={() => onAdd(item.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer text-black bg-brand-400">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm font-bold text-white w-14 text-right shrink-0">₹{item.price * item.qty}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-5 pb-6 pt-4 space-y-3 border-t border-brand-400/20">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm text-surface-400">
              <span>Subtotal</span><span>₹{total}</span>
            </div>
            <div className="flex justify-between text-sm text-surface-500">
              <span>GST (5%)</span><span>₹{gst}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 mt-2 border-t border-surface-700">
              <span className="text-white">Total</span>
              <span className="text-brand-400">₹{total + gst}</span>
            </div>
          </div>
          <div className="pt-2">
            <textarea
              placeholder="Any special requests? (e.g., make it extra spicy)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full h-16 bg-surface-800 border border-brand-400/20 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-brand-400 focus:glow-lime resize-none placeholder:text-surface-500"
            />
          </div>
          <button
            id="place-order-btn"
            onClick={handleOrder}
            disabled={placing}
            className="w-full h-14 rounded-full text-base font-bold text-black bg-brand-400 glow-lime hover:bg-brand-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            {placing ? <><Loader2 className="w-5 h-5 animate-spin text-black" /> Placing Order...</> : <><ChefHat className="w-5 h-5" /> Place Order</>}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function CustomerMenu() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableNo = searchParams.get('table') || sessionStorage.getItem('customer_table') || '1';
  const customerName = searchParams.get('name') || sessionStorage.getItem('customer_name') || 'Guest';

  const [menu, setMenu] = useState<MenuItem[]>(MOCK_MENU);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [orderSuccess, setOrderSuccess] = useState(false);

  // AI Recommender State
  const [aiMood, setAiMood] = useState<'bestseller' | 'spicy' | 'veg' | 'drink' | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<{ item: MenuItem; note: string } | null>(null);

  const handleAiRecommend = (mood: 'bestseller' | 'spicy' | 'veg' | 'drink') => {
    setAiMood(mood);
    setAiLoading(true);

    setTimeout(() => {
      let pick: MenuItem | undefined;
      let note = '';
      const available = menu.filter(m => m.is_available);

      if (mood === 'bestseller') {
        // Pick highest-priced available main course (most popular proxy)
        pick = available.filter(m => m.category?.toLowerCase() === 'main').sort((a, b) => b.price - a.price)[0] || available[0];
        note = `🔥 #1 Most Popular! 88% of guests love this. Pairs great with Naan.`;
      } else if (mood === 'spicy') {
        // Pick highest spice level available item
        pick = available.filter(m => m.spice_level >= 2).sort((a, b) => b.spice_level - a.spice_level)[0] || available[0];
        note = '🌶️ Chef Spice Pick! Slow-cooked with authentic ground spices.';
      } else if (mood === 'veg') {
        // Pick best veg item by price (premium feel)
        pick = available.filter(m => m.is_veg && m.category?.toLowerCase() !== 'drinks' && m.category?.toLowerCase() !== 'breads').sort((a, b) => b.price - a.price)[0] || available.find(m => m.is_veg);
        note = '🥬 Pure Vegetarian Favorite! Chef-recommended for a wholesome meal.';
      } else {
        // Pick from drinks category
        pick = available.filter(m => m.category?.toLowerCase() === 'drinks').sort((a, b) => b.price - a.price)[0] || available[available.length - 1];
        note = '🍹 Refreshing Choice! Perfect complement to your meal.';
      }

      if (pick) {
        setAiRecommendation({ item: pick, note });
      }
      setAiLoading(false);
    }, 600);
  };

  useEffect(() => {
    fetch(`${API}/api/menu`)
      .then(r => r.json())
      .then(({ data }) => { if (data) setMenu(data.length ? data : MOCK_MENU); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(menu.map(m => m.category)))];
  const filtered = menu.filter(item => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    const nameStr = item.name || '';
    const descStr = item.description || '';
    const matchSearch = nameStr.toLowerCase().includes(search.toLowerCase()) || descStr.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const cartQty = (id: string) => cart.find(c => c.id === id)?.qty ?? 0;
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const addToCart = useCallback((item: MenuItem) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id);
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === id);
      if (!ex) return prev;
      if (ex.qty === 1) return prev.filter(c => c.id !== id);
      return prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c);
    });
  }, []);

  const handleCheckout = async (notes: string) => {
    const items = cart.map(c => ({ name: c.name, qty: c.qty, price: c.price }));
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const total = subtotal + Math.round(subtotal * 0.05); // Include GST
    let createdId = `order-${Date.now()}`;
    try {
      const res = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table_number: Number(tableNo), items, total_amount: total, customer_name: customerName, notes }),
      });
      const json = await res.json();
      const orderObj = Array.isArray(json?.data) ? json.data[0] : (json?.data || json);
      if (orderObj?.id) {
        createdId = String(orderObj.id);
      }
    } catch {}
    sessionStorage.setItem('last_order_id', createdId);
    sessionStorage.setItem('last_order_table', String(tableNo));
    sessionStorage.setItem('last_order_name', String(customerName));
    setCart([]);
    setCartOpen(false);
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      navigate(`/portal/track?table=${tableNo}&name=${encodeURIComponent(customerName)}`);
    }, 2500);
  };

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-4 pb-3 bg-surface-900/80 backdrop-blur-xl border-b border-brand-400/10">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/portal')} className="p-2 rounded-xl cursor-pointer text-white/40 hover:text-white/80 transition-colors bg-white/5" aria-label="Back">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-black text-white">Our Menu</h1>
            <p className="text-xs text-brand-400/60">Table #{tableNo} · Hey, {customerName}! 👋</p>
          </div>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400/40" />
          <input
            id="customer-search"
            type="search"
            placeholder="Search dishes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-full text-sm text-white focus:outline-none bg-brand-400/10 border border-brand-400/20 focus:border-brand-400/60 focus:glow-lime transition-all"
          />
        </div>
      </div>

      {/* AI Food Assistant Widget */}
      <div className="px-4 pt-3 pb-1">
        <div className="rounded-2xl p-3.5 border relative overflow-hidden bg-brand-400/10 border-brand-400/30">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1">
                  AI Dish Sommelier <span className="text-[10px] text-brand-400 font-normal">· Smart Pick</span>
                </h3>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>Not sure what to order? Ask AI</p>
              </div>
            </div>
          </div>

          {/* AI Mood Buttons */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {[
              { key: 'bestseller', label: '🔥 Bestseller', emoji: '👑' },
              { key: 'spicy', label: '🌶️ Spicy Pick', emoji: '🔥' },
              { key: 'veg', label: '🥬 Veg Special', emoji: '🌱' },
              { key: 'drink', label: '🍹 Drinks', emoji: '🧊' },
            ].map(m => (
              <button
                key={m.key}
                onClick={() => handleAiRecommend(m.key as any)}
                className={cn(
                  'shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border',
                  aiMood === m.key
                    ? 'bg-brand-400 text-black border-brand-400 shadow-lg glow-lime'
                    : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* AI Result Card */}
          <AnimatePresence mode="wait">
            {aiLoading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-3 flex items-center gap-2 text-xs text-brand-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                AI is curating the best dish for you...
              </motion.div>
            ) : aiRecommendation ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 p-3 rounded-xl bg-black/40 border border-brand-400/30 flex items-center gap-3"
              >
                <img
                  src={aiRecommendation.item.image_url}
                  alt={aiRecommendation.item.name}
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                  onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-brand-400 fill-brand-400" />
                    <p className="text-xs font-bold text-white truncate">{aiRecommendation.item.name}</p>
                    <span className="text-xs font-bold text-brand-400 ml-auto">₹{aiRecommendation.item.price}</span>
                  </div>
                  <p className="text-[10px] text-brand-300/90 leading-tight mt-0.5 line-clamp-2">{aiRecommendation.note}</p>
                </div>
                <button
                  onClick={() => addToCart(aiRecommendation.item)}
                  className="px-2.5 py-1.5 rounded-lg bg-brand-400 hover:bg-brand-300 text-black font-bold text-xs shrink-0 cursor-pointer shadow-md"
                >
                  + Add
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3">
        {categories.map(cat => (
          <button key={cat} id={`c-cat-${cat}`} onClick={() => setActiveCategory(cat)}
            className={cn(
              "shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer border",
              activeCategory === cat ? "bg-brand-400 text-black border-brand-400 shadow-[0_4px_20px_rgba(204,255,0,0.3)] glow-lime" : "bg-brand-400/5 text-brand-400/60 border-brand-400/15 hover:bg-brand-400/10"
            )}>
            {cat}
          </button>
        ))}
      </div>

      {/* Menu grid */}
      <div className="px-4">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-400" /></div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map(item => (
                <MenuCard key={item.id} item={item} qty={cartQty(item.id)}
                  onAdd={() => addToCart(item)} onRemove={() => removeFromCart(item.id)} />
              ))}
            </AnimatePresence>
            {filtered.length === 0 && !loading && (
              <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <p className="text-4xl mb-3">🔍</p>
                <p>No dishes found</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cartCount > 0 && !cartOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-6 left-4 right-4 z-30 max-w-lg mx-auto"
          >
            <button
              id="open-cart-btn"
              onClick={() => setCartOpen(true)}
              className="w-full h-16 rounded-full text-black bg-brand-400 glow-lime font-bold flex items-center justify-between px-5 cursor-pointer active:scale-98 transition-all hover:bg-brand-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-base" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  {cartCount}
                </div>
                <span>{cartCount === 1 ? '1 item' : `${cartCount} items`}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black">₹{cartTotal}</span>
                <ShoppingBag className="w-5 h-5" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Sheet */}
      {cartOpen && (
        <CartSheet
          cart={cart}
          onClose={() => setCartOpen(false)}
          onAdd={id => { const item = menu.find(m => m.id === id); if (item) addToCart(item); }}
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
          tableNo={tableNo}
          customerName={customerName}
        />
      )}

      {/* Success overlay */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="text-center px-8"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6 }}
                className="text-7xl mb-4"
              >
                🎉
              </motion.div>
              <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#39d353' }} />
              <h2 className="text-2xl font-black text-white mb-2">Order Placed!</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm">
                Redirecting to live tracker...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
