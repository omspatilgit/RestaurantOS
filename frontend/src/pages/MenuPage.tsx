import { useEffect, useState, useCallback, useSearchParams } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Minus, Plus, X, Flame,
  Clock, ChefHat, CheckCircle, Loader2, Search, SlidersHorizontal
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

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

interface CartItem extends MenuItem {
  qty: number;
}

const MOCK_MENU: MenuItem[] = [
  { id: '1', name: 'Butter Chicken', description: 'Tender chicken in creamy tomato sauce', price: 320, category: 'Main', is_veg: false, is_available: true, spice_level: 2, prep_time_min: 20, image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&auto=format&fit=crop' },
  { id: '2', name: 'Paneer Tikka', description: 'Grilled cottage cheese with spiced marinade', price: 280, category: 'Starters', is_veg: true, is_available: true, spice_level: 2, prep_time_min: 15, image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&auto=format&fit=crop' },
  { id: '3', name: 'Biryani', description: 'Aromatic basmati rice with tender meat and spices', price: 350, category: 'Main', is_veg: false, is_available: true, spice_level: 3, prep_time_min: 30, image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop' },
  { id: '4', name: 'Dal Makhani', description: 'Slow-cooked black lentils in butter and cream', price: 220, category: 'Main', is_veg: true, is_available: true, spice_level: 1, prep_time_min: 25, image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop' },
  { id: '5', name: 'Garlic Naan', description: 'Freshly baked bread with garlic and butter', price: 60, category: 'Breads', is_veg: true, is_available: true, spice_level: 0, prep_time_min: 8, image_url: 'https://images.unsplash.com/photo-1505253468034-514d2507d914?w=400&auto=format&fit=crop' },
  { id: '6', name: 'Mango Lassi', description: 'Chilled yogurt drink with fresh mango', price: 120, category: 'Drinks', is_veg: true, is_available: true, spice_level: 0, prep_time_min: 5, image_url: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&auto=format&fit=crop' },
  { id: '7', name: 'Gulab Jamun', description: 'Soft milk dumplings in rose syrup', price: 100, category: 'Desserts', is_veg: true, is_available: true, spice_level: 0, prep_time_min: 5, image_url: 'https://images.unsplash.com/photo-1601303516534-bf43e9e29ee1?w=400&auto=format&fit=crop' },
  { id: '8', name: 'Chicken Tikka', description: 'Marinated chicken pieces grilled in tandoor', price: 380, category: 'Starters', is_veg: false, is_available: true, spice_level: 3, prep_time_min: 18, image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&auto=format&fit=crop' },
  { id: '9', name: 'Samosa (2 pcs)', description: 'Crispy pastry stuffed with spiced potatoes', price: 80, category: 'Starters', is_veg: true, is_available: false, spice_level: 2, prep_time_min: 10, image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop' },
  { id: '10', name: 'Masala Chai', description: 'Spiced Indian tea with milk', price: 50, category: 'Drinks', is_veg: true, is_available: true, spice_level: 1, prep_time_min: 5, image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop' },
];

function SpiceLevel({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map(i => (
        <Flame key={i} className={cn('w-3 h-3', i <= level ? 'text-neon-red' : 'text-surface-700')} />
      ))}
    </div>
  );
}

function MenuCard({ item, cartQty, onAdd, onRemove }: {
  item: MenuItem; cartQty: number; onAdd: () => void; onRemove: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        'bg-surface-900 border border-surface-700/60 rounded-2xl overflow-hidden',
        'transition-colors duration-200 hover:border-surface-600',
        !item.is_available && 'opacity-60'
      )}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-surface-800">
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          loading="lazy"
          onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop'; }}
        />
        {/* Availability badge */}
        <div className="absolute top-3 left-3">
          {item.is_available ? (
            <Badge variant="live" size="sm" dot pulse>Live</Badge>
          ) : (
            <Badge variant="danger" size="sm">Unavailable</Badge>
          )}
        </div>
        {/* Veg indicator */}
        <div className={cn(
          'absolute top-3 right-3 w-6 h-6 rounded border-2 flex items-center justify-center',
          item.is_veg ? 'border-neon-green bg-neon-green/20' : 'border-neon-red bg-neon-red/20'
        )}>
          <span className={cn('w-2.5 h-2.5 rounded-full', item.is_veg ? 'bg-neon-green' : 'bg-neon-red')} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-surface-50 text-sm leading-tight">{item.name}</h3>
          <p className="text-brand-400 font-bold text-sm shrink-0 ml-2">₹{item.price}</p>
        </div>
        <p className="text-surface-400 text-xs leading-relaxed mb-3 line-clamp-2">{item.description}</p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <SpiceLevel level={item.spice_level} />
            {item.spice_level === 0 && <span className="text-[10px] text-surface-500">Mild</span>}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-surface-500">
            <Clock className="w-3 h-3" />
            {item.prep_time_min}m
          </div>
        </div>

        {/* Add to cart */}
        {item.is_available ? (
          cartQty > 0 ? (
            <div className="flex items-center justify-between bg-brand-500/10 border border-brand-500/20 rounded-xl px-3 py-2">
              <button
                id={`remove-${item.id}`}
                onClick={onRemove}
                className="w-7 h-7 rounded-lg bg-surface-700 hover:bg-surface-600 flex items-center justify-center transition-colors cursor-pointer text-surface-200"
                aria-label={`Remove ${item.name}`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <motion.span
                key={cartQty}
                initial={{ scale: 1.4 }}
                animate={{ scale: 1 }}
                className="text-sm font-bold text-brand-400 min-w-6 text-center"
              >
                {cartQty}
              </motion.span>
              <button
                id={`add-${item.id}`}
                onClick={onAdd}
                className="w-7 h-7 rounded-lg bg-brand-500 hover:bg-brand-600 flex items-center justify-center transition-colors cursor-pointer text-white"
                aria-label={`Add ${item.name}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id={`add-new-${item.id}`}
              onClick={onAdd}
              className="w-full h-9 rounded-xl bg-surface-800 hover:bg-brand-500/15 border border-surface-700 hover:border-brand-500/30 text-xs font-medium text-surface-300 hover:text-brand-400 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add to Order
            </button>
          )
        ) : (
          <div className="w-full h-9 rounded-xl bg-surface-800/50 border border-surface-700/50 text-xs text-surface-600 flex items-center justify-center">
            Not Available Today
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CartDrawer({ cart, open, onClose, onAdd, onRemove, onCheckout, tableNo }: {
  cart: CartItem[]; open: boolean; onClose: () => void;
  onAdd: (id: string) => void; onRemove: (id: string) => void;
  onCheckout: () => void; tableNo: number;
}) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-surface-900 border-l border-surface-700/50 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-surface-700/50">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-brand-400" />
                <h2 className="font-bold text-surface-50">Your Order</h2>
                <Badge variant="warning" size="sm">{cart.reduce((s, i) => s + i.qty, 0)} items</Badge>
              </div>
              <button
                id="close-cart"
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-surface-700 text-surface-400 hover:text-surface-100 transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Table info */}
            <div className="px-5 py-3 bg-brand-500/5 border-b border-surface-700/30">
              <p className="text-xs text-surface-400">
                Table <span className="text-brand-400 font-bold">#{tableNo}</span>
              </p>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <AnimatePresence>
                {cart.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30, height: 0 }}
                    className="flex items-center gap-3 bg-surface-800 rounded-xl p-3 border border-surface-700/50"
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-100 truncate">{item.name}</p>
                      <p className="text-xs text-surface-500">₹{item.price} each</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => onRemove(item.id)} className="w-7 h-7 rounded-lg bg-surface-700 hover:bg-surface-600 flex items-center justify-center transition-colors cursor-pointer">
                        <Minus className="w-3 h-3 text-surface-300" />
                      </button>
                      <span className="text-sm font-bold text-brand-400 w-5 text-center">{item.qty}</span>
                      <button onClick={() => onAdd(item.id)} className="w-7 h-7 rounded-lg bg-brand-500 hover:bg-brand-600 flex items-center justify-center transition-colors cursor-pointer">
                        <Plus className="w-3 h-3 text-white" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-surface-100 w-16 text-right shrink-0">
                      ₹{item.price * item.qty}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-surface-700/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-surface-300">Subtotal</span>
                <span className="text-surface-300">₹{total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-surface-500 text-sm">GST (5%)</span>
                <span className="text-surface-500 text-sm">₹{Math.round(total * 0.05)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-surface-700 pt-3">
                <span className="text-lg font-bold text-surface-50">Total</span>
                <span className="text-xl font-bold text-brand-400">₹{Math.round(total * 1.05)}</span>
              </div>
              <Button id="place-order" size="lg" className="w-full" onClick={onCheckout} icon={<ChefHat className="w-4 h-4" />}>
                Place Order
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const tableNo = Number(searchParams.get('table') || 1);

  useEffect(() => {
    fetch(`${API}/api/menu`)
      .then(r => r.json())
      .then(({ data }) => { if (data?.length) setMenu(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(menu.map(m => m.category)))];

  const filtered = menu.filter(item => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                        item.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const cartQty = (id: string) => cart.find(c => c.id === id)?.qty ?? 0;
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = useCallback((item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === id);
      if (!existing) return prev;
      if (existing.qty === 1) return prev.filter(c => c.id !== id);
      return prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c);
    });
  }, []);

  const handleCheckout = async () => {
    const items = cart.map(c => ({ name: c.name, qty: c.qty, price: c.price }));
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    try {
      await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table_number: tableNo, items, total_amount: total }),
      });
    } catch {}
    setCart([]);
    setCartOpen(false);
    setOrderSuccess(true);
    setTimeout(() => setOrderSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b border-surface-700/50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center glow-orange">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold font-display text-gradient-brand leading-tight">RestaurantOS</h1>
              <p className="text-[10px] text-surface-500">Table #{tableNo}</p>
            </div>
          </div>
          <button
            id="open-cart"
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500/10 border border-brand-500/20 hover:bg-brand-500/20 transition-all cursor-pointer"
            aria-label={`Cart with ${cartCount} items`}
          >
            <ShoppingCart className="w-4 h-4 text-brand-400" />
            <span className="text-sm font-medium text-brand-400 hidden sm:block">Cart</span>
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center"
              >
                {cartCount}
              </motion.span>
            )}
          </button>
        </div>

        {/* Search + filter */}
        <div className="max-w-4xl mx-auto px-4 pb-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              id="menu-search"
              type="search"
              placeholder="Search dishes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-surface-800 border border-surface-600 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              id={`cat-${cat}`}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border',
                activeCategory === cat
                  ? 'bg-brand-500 text-white border-brand-400 glow-orange'
                  : 'bg-surface-800 text-surface-400 border-surface-700 hover:border-surface-500 hover:text-surface-200'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
          </div>
        )}

        {/* Menu grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map(item => (
              <MenuCard
                key={item.id}
                item={item}
                cartQty={cartQty(item.id)}
                onAdd={() => addToCart(item)}
                onRemove={() => removeFromCart(item.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && !loading && (
          <div className="text-center py-20 text-surface-500">
            <SlidersHorizontal className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No dishes found for "{search}"</p>
          </div>
        )}
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-neon-green/15 border border-neon-green/40 glow-green backdrop-blur-xl rounded-2xl px-6 py-4"
          >
            <CheckCircle className="w-6 h-6 text-neon-green shrink-0" />
            <div>
              <p className="text-sm font-semibold text-neon-green">Order Placed!</p>
              <p className="text-xs text-surface-400">Your order has been sent to the kitchen 🍳</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer
        cart={cart}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onAdd={id => { const item = menu.find(m => m.id === id); if (item) addToCart(item); }}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
        tableNo={tableNo}
      />
    </div>
  );
}
