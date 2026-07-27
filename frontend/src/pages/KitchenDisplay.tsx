import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChefHat, Clock, CheckCircle2, RefreshCw,
  Flame
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface KitchenOrder {
  id: string;
  table_number: number;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'kitchen' | 'served' | 'cancelled';
  customer_name?: string;
  notes?: string;
  created_at: string;
}

function sanitizeItems(raw: any): OrderItem[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try { const p = JSON.parse(raw); if (Array.isArray(p)) return p; } catch {}
  }
  return [];
}

function TimerBadge({ iso }: { iso: string }) {
  const [minutes, setMinutes] = useState(0);
  useEffect(() => {
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
      setMinutes(Math.max(0, diff));
    };
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, [iso]);

  const isLate = minutes > 20;
  const isWarning = minutes > 12;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold ${
      isLate ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
      isWarning ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
      'bg-surface-800 text-surface-300 border border-surface-700/50'
    }`}>
      <Clock className="w-4 h-4" />
      <span>{minutes}m</span>
    </div>
  );
}

function KitchenOrderCard({ order, onServe }: { order: KitchenOrder; onServe: () => void }) {
  const items = sanitizeItems(order.items);
  const isKitchen = order.status === 'kitchen';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: 100 }}
      className={`rounded-2xl border p-5 ${
        isKitchen
          ? 'bg-brand-500/5 border-brand-500/30'
          : 'bg-neon-amber/5 border-neon-amber/30'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl ${
            isKitchen ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20' : 'bg-neon-amber/15 text-neon-amber border border-neon-amber/20'
          }`}>
            T{Number(order.table_number)}
          </div>
          <div>
            {order.customer_name && (
              <p className="text-base font-bold text-surface-100">{order.customer_name}</p>
            )}
            <p className={`text-xs font-semibold uppercase tracking-wider ${
              isKitchen ? 'text-brand-400' : 'text-neon-amber'
            }`}>
              {isKitchen ? '🔥 COOKING' : '⏳ NEW ORDER'}
            </p>
          </div>
        </div>
        <TimerBadge iso={order.created_at} />
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between bg-surface-900/60 rounded-xl px-4 py-2.5 border border-surface-700/30">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-brand-400 w-6">{item.qty || 1}×</span>
              <span className="text-base font-semibold text-surface-100">{item.name || 'Dish'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-neon-amber/10 border border-neon-amber/20 rounded-xl px-4 py-2.5 mb-4 text-sm text-neon-amber">
          📝 {order.notes}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {!isKitchen && (
          <button
            onClick={async () => {
              try {
                await fetch(`${API}/api/orders/${order.id}/status`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: 'kitchen' }),
                });
              } catch {}
            }}
            className="flex-1 h-12 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}
          >
            <ChefHat className="w-5 h-5" /> Start Cooking
          </button>
        )}
        <button
          onClick={onServe}
          className="flex-1 h-12 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
          style={{ background: 'linear-gradient(135deg, #39d353, #22c55e)', boxShadow: '0 4px 16px rgba(57,211,83,0.3)' }}
        >
          <CheckCircle2 className="w-5 h-5" /> Mark Served
        </button>
      </div>
    </motion.div>
  );
}

export default function KitchenDisplay() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/orders`);
      const json = await res.json();
      if (json?.data && Array.isArray(json.data)) {
        const active = json.data
          .filter((o: any) => o.status === 'pending' || o.status === 'kitchen')
          .map((o: any) => ({
            id: String(o.id),
            table_number: Number(o.table_number || 1),
            items: sanitizeItems(o.items),
            total_amount: Number(o.total_amount || 0),
            status: o.status,
            customer_name: o.customer_name,
            notes: o.notes,
            created_at: o.created_at || new Date().toISOString(),
          }));
        setOrders(active);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 2500);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const markServed = async (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    try {
      await fetch(`${API}/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'served' }),
      });
    } catch {}
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const kitchenOrders = orders.filter(o => o.status === 'kitchen');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-surface-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            Kitchen <span className="text-gradient-brand">Display</span>
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            {orders.length} active orders · Auto-refreshing every 2.5s
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-neon-green/10 border border-neon-green/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            <span className="text-xs text-neon-green font-medium">Live</span>
          </div>
          <Button
            id="refresh-kitchen"
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={fetchOrders}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-neon-amber/5 border border-neon-amber/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold font-display text-neon-amber">{pendingOrders.length}</p>
          <p className="text-xs text-surface-500">New Orders</p>
        </div>
        <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold font-display text-brand-400">{kitchenOrders.length}</p>
          <p className="text-xs text-surface-500">Cooking</p>
        </div>
        <div className="bg-surface-800 border border-surface-700/50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold font-display text-surface-200">{orders.length}</p>
          <p className="text-xs text-surface-500">Total Active</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-surface-500">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-brand-400" />
          <p className="text-sm">Loading kitchen orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-surface-600">
          <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-semibold text-surface-400">All caught up! 🎉</p>
          <p className="text-sm text-surface-600">No pending orders right now</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {/* Pending first (new orders), then kitchen (cooking) */}
            {[...pendingOrders, ...kitchenOrders].map(order => (
              <KitchenOrderCard
                key={order.id}
                order={order}
                onServe={() => markServed(order.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
