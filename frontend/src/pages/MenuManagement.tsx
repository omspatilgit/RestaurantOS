import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, RefreshCw, Flame, Clock, IndianRupee, Plus, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

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

const MOCK_MENU: MenuItem[] = [
  { id: '1', name: 'Butter Chicken', description: 'Tender chicken in creamy tomato sauce', price: 320, category: 'Main', is_veg: false, is_available: true, spice_level: 2, prep_time_min: 20, image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&auto=format&fit=crop' },
  { id: '2', name: 'Paneer Tikka', description: 'Grilled cottage cheese with spiced marinade', price: 280, category: 'Starters', is_veg: true, is_available: true, spice_level: 2, prep_time_min: 15, image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=200&auto=format&fit=crop' },
  { id: '3', name: 'Biryani', description: 'Aromatic basmati rice with spices', price: 350, category: 'Main', is_veg: false, is_available: true, spice_level: 3, prep_time_min: 30, image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop' },
  { id: '4', name: 'Dal Makhani', description: 'Slow-cooked black lentils in butter', price: 220, category: 'Main', is_veg: true, is_available: true, spice_level: 1, prep_time_min: 25, image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&auto=format&fit=crop' },
  { id: '5', name: 'Garlic Naan', description: 'Freshly baked bread with garlic', price: 60, category: 'Breads', is_veg: true, is_available: true, spice_level: 0, prep_time_min: 8, image_url: 'https://images.unsplash.com/photo-1505253468034-514d2507d914?w=200&auto=format&fit=crop' },
  { id: '6', name: 'Mango Lassi', description: 'Chilled yogurt drink with fresh mango', price: 120, category: 'Drinks', is_veg: true, is_available: true, spice_level: 0, prep_time_min: 5, image_url: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=200&auto=format&fit=crop' },
  { id: '7', name: 'Gulab Jamun', description: 'Soft milk dumplings in rose syrup', price: 100, category: 'Desserts', is_veg: true, is_available: true, spice_level: 0, prep_time_min: 5, image_url: 'https://images.unsplash.com/photo-1601303516534-bf43e9e29ee1?w=200&auto=format&fit=crop' },
  { id: '8', name: 'Chicken Tikka', description: 'Marinated chicken in tandoor', price: 380, category: 'Starters', is_veg: false, is_available: true, spice_level: 3, prep_time_min: 18, image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=200&auto=format&fit=crop' },
  { id: '9', name: 'Samosa (2 pcs)', description: 'Crispy pastry stuffed with potatoes', price: 80, category: 'Starters', is_veg: true, is_available: false, spice_level: 2, prep_time_min: 10, image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&auto=format&fit=crop' },
  { id: '10', name: 'Masala Chai', description: 'Spiced Indian tea with milk', price: 50, category: 'Drinks', is_veg: true, is_available: true, spice_level: 1, prep_time_min: 5, image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&auto=format&fit=crop' },
];

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>(MOCK_MENU);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState('All');

  // Add Dish state
  const [isAdding, setIsAdding] = useState(false);
  const [newDish, setNewDish] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    is_veg: false,
    spice_level: 0,
    prep_time_min: 15
  });
  const [addingError, setAddingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];

  const fetchMenu = () => {
    setLoading(true);
    fetch(`${API}/api/menu`)
      .then(r => r.json())
      .then(({ data }) => { if (data) setItems(data.length ? data : MOCK_MENU); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const toggleAvailability = async (item: MenuItem) => {
    setToggling(item.id);
    const updated = !item.is_available;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: updated } : i));
    try {
      await fetch(`${API}/api/menu/${item.id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: updated }),
      });
    } catch {}
    setTimeout(() => setToggling(null), 500);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDish.name || !newDish.price || !newDish.category) {
      setAddingError('Name, price, and category are required.');
      return;
    }
    setAddingError('');
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/api/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDish),
      });
      const { success, data, error } = await res.json();
      if (success && data) {
        setItems(prev => [...prev, data]);
        setIsAdding(false);
        setNewDish({ name: '', description: '', price: '', category: '', is_veg: false, spice_level: 0, prep_time_min: 15 });
      } else {
        setAddingError(error || 'Failed to add dish.');
      }
    } catch (err) {
      setAddingError('Network error. Failed to add dish.');
    }
    setIsSubmitting(false);
  };

  const filtered = items.filter(i => filterCat === 'All' || i.category === filterCat);
  const available = items.filter(i => i.is_available).length;

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-surface-50">
            Menu <span className="text-gradient-brand">Management</span>
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">
            {available} of {items.length} items available
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            id="refresh-menu"
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={fetchMenu}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsAdding(true)}
          >
            Add Dish
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Items', value: items.length, color: 'text-brand-400' },
          { label: 'Available', value: available, color: 'text-neon-green' },
          { label: 'Unavailable', value: items.length - available, color: 'text-neon-red' },
          { label: 'Categories', value: categories.length - 1, color: 'text-neon-blue' },
        ].map(({ label, value, color }) => (
          <Card key={label} padding="sm">
            <p className={`text-2xl font-bold font-display ${color}`}>{value}</p>
            <p className="text-xs text-surface-500 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            id={`menu-mgmt-cat-${cat}`}
            onClick={() => setFilterCat(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border ${
              filterCat === cat
                ? 'bg-brand-500 text-white border-brand-400'
                : 'bg-surface-800 text-surface-400 border-surface-700 hover:border-surface-500 hover:text-surface-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-700/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Item</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider hidden sm:table-cell">Details</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((item, idx) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-surface-700/30 hover:bg-surface-800/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-surface-700/50"
                          onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'; }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-surface-100">{item.name}</p>
                            <span className={`w-3 h-3 rounded-sm border flex items-center justify-center shrink-0 ${item.is_veg ? 'border-neon-green' : 'border-neon-red'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${item.is_veg ? 'bg-neon-green' : 'bg-neon-red'}`} />
                            </span>
                          </div>
                          <p className="text-xs text-surface-500 hidden md:block truncate max-w-48">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge variant="default" size="sm">{item.category}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-brand-400 flex items-center gap-0.5">
                        <IndianRupee className="w-3 h-3" />{item.price}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-3 text-xs text-surface-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{item.prep_time_min}m
                        </span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map(i => (
                            <Flame key={i} className={`w-3 h-3 ${i <= item.spice_level ? 'text-neon-red' : 'text-surface-700'}`} />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        id={`toggle-${item.id}`}
                        onClick={() => toggleAvailability(item)}
                        disabled={toggling === item.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer border ${
                          item.is_available
                            ? 'bg-neon-green/10 border-neon-green/20 text-neon-green hover:bg-neon-green/20'
                            : 'bg-surface-700 border-surface-600 text-surface-400 hover:bg-surface-600'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        aria-label={`Toggle ${item.name} availability`}
                      >
                        {toggling === item.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : item.is_available ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                        <span className="hidden sm:inline">{item.is_available ? 'Available' : 'Hidden'}</span>
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Dish Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-900 border border-surface-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-surface-800 flex justify-between items-center">
                <h2 className="text-lg font-bold text-surface-100">Add New Dish</h2>
                <button onClick={() => setIsAdding(false)} className="text-surface-400 hover:text-white transition-colors cursor-pointer p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
                {addingError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {addingError}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-surface-400">Dish Name *</label>
                  <input
                    type="text"
                    required
                    value={newDish.name}
                    onChange={e => setNewDish(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                    placeholder="e.g. Garlic Naan"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-surface-400">Category *</label>
                    <input
                      type="text"
                      required
                      value={newDish.category}
                      onChange={e => setNewDish(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                      placeholder="Main, Drinks, etc."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-surface-400">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newDish.price}
                      onChange={e => setNewDish(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                      placeholder="250"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-surface-400">Description</label>
                  <textarea
                    value={newDish.description}
                    onChange={e => setNewDish(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-brand-500 transition-colors h-16"
                    placeholder="Brief description of the dish..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 flex flex-col items-start justify-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newDish.is_veg}
                        onChange={e => setNewDish(prev => ({ ...prev, is_veg: e.target.checked }))}
                        className="rounded border-surface-600 bg-surface-800 text-brand-500 focus:ring-brand-500/50"
                      />
                      <span className="text-xs font-semibold text-surface-300">Is Veg?</span>
                    </label>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-surface-400">Spice Level (0-3)</label>
                    <input
                      type="number"
                      min={0} max={3}
                      value={newDish.spice_level}
                      onChange={e => setNewDish(prev => ({ ...prev, spice_level: Number(e.target.value) }))}
                      className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-surface-400">Prep (mins)</label>
                    <input
                      type="number"
                      min={1}
                      value={newDish.prep_time_min}
                      onChange={e => setNewDish(prev => ({ ...prev, prep_time_min: Number(e.target.value) }))}
                      className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-surface-800 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-surface-300 bg-surface-800 hover:bg-surface-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Dish'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
