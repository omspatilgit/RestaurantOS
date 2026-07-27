import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import {
  ShoppingBag, Clock, ChefHat, CheckCircle2,
  RefreshCw, GripVertical, IndianRupee, Zap, Volume2
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useRealtimeOrders, type RealtimeOrder } from '../hooks/useRealtimeOrders';
import { useToast } from '../components/ui/Toast';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  table_number: number;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'kitchen' | 'served' | 'cancelled';
  customer_name?: string;
  notes?: string;
  created_at: string;
}

type Column = 'pending' | 'kitchen' | 'served';

const COLUMNS: { id: Column; label: string; icon: React.ElementType; color: string; badge: string }[] = [
  { id: 'pending', label: 'Pending', icon: Clock, color: 'border-neon-amber/30 bg-neon-amber/5', badge: 'warning' },
  { id: 'kitchen', label: 'In Kitchen', icon: ChefHat, color: 'border-brand-500/30 bg-brand-500/5', badge: 'warning' },
  { id: 'served', label: 'Served', icon: CheckCircle2, color: 'border-neon-green/30 bg-neon-green/5', badge: 'success' },
];

function sanitizeItems(rawItems: any): OrderItem[] {
  if (!rawItems) return [];
  if (Array.isArray(rawItems)) return rawItems;
  if (typeof rawItems === 'string') {
    try {
      const parsed = JSON.parse(rawItems);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
}

function sanitizeOrder(o: any): Order {
  return {
    id: String(o.id || Math.random()),
    table_number: Number(o.table_number || 1),
    items: sanitizeItems(o.items),
    total_amount: Number(o.total_amount || 0),
    status: (['pending', 'kitchen', 'served', 'cancelled'].includes(o.status) ? o.status : 'pending') as any,
    customer_name: o.customer_name || undefined,
    notes: o.notes || undefined,
    created_at: o.created_at || new Date().toISOString(),
  };
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  return diff < 1 ? 'Just now' : `${diff}m ago`;
}

// Simple new-order chime using Web Audio API
function playNewOrderChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

function OrderCard({ order, index, isNew }: { order: Order; index: number; isNew?: boolean }) {
  const itemsList = sanitizeItems(order.items);
  const totalVal = Number(order.total_amount || 0);
  const tableNum = Number(order.table_number || 1);

  return (
    <Draggable draggableId={order.id} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} className="mb-3">
          <motion.div
            initial={isNew ? { opacity: 0, scale: 0.85, y: -20 } : { opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            layout
            className={`bg-surface-800 border rounded-xl p-4 transition-all duration-200 ${
              isNew
                ? 'border-brand-400/60 glow-orange ring-2 ring-brand-500/30'
                : snapshot.isDragging
                ? 'border-brand-500/60 glow-orange shadow-xl rotate-1 scale-105'
                : 'border-surface-700/60 hover:border-surface-600'
            }`}
          >
            {isNew && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-brand-400 mb-2">
                <Zap className="w-2.5 h-2.5 animate-pulse" />
                NEW ORDER — LIVE
              </div>
            )}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div {...provided.dragHandleProps} className="text-surface-600 hover:text-surface-400 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-brand-400">T{tableNum}</span>
                </div>
                {order.customer_name && (
                  <span className="text-xs text-surface-200 font-semibold">{order.customer_name}</span>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-surface-50 flex items-center justify-end gap-0.5">
                  <IndianRupee className="w-3 h-3 text-brand-400" />
                  {totalVal.toLocaleString()}
                </p>
                <p className="text-[10px] text-surface-500">{timeAgo(order.created_at)}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1 mb-3 bg-surface-900/40 rounded-lg p-2 border border-surface-700/30">
              {itemsList.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-surface-300 truncate max-w-44">
                    <span className="text-brand-400 font-bold">×{item.qty || 1}</span> {item.name || 'Dish'}
                  </span>
                  <span className="text-surface-500 font-medium">₹{(Number(item.price) || 0) * (Number(item.qty) || 1)}</span>
                </div>
              ))}
              {itemsList.length === 0 && (
                <span className="text-xs text-surface-500 italic">No item details</span>
              )}
            </div>

            {order.notes && (
              <p className="text-[10px] text-neon-amber bg-neon-amber/10 rounded-lg px-2 py-1 border border-neon-amber/20">
                📝 {order.notes}
              </p>
            )}
          </motion.div>
        </div>
      )}
    </Draggable>
  );
}

// Skeleton loader for initial loading state
function OrderCardSkeleton() {
  return (
    <div className="mb-3">
      <div className="bg-surface-800 border border-surface-700/60 rounded-xl p-4 space-y-3 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-surface-700" />
            <div className="w-8 h-8 rounded-lg bg-surface-700" />
            <div className="w-16 h-3 rounded bg-surface-700" />
          </div>
          <div className="text-right space-y-1">
            <div className="w-12 h-4 rounded bg-surface-700 ml-auto" />
            <div className="w-10 h-2.5 rounded bg-surface-700 ml-auto" />
          </div>
        </div>
        <div className="bg-surface-900/40 rounded-lg p-2 space-y-1.5">
          <div className="flex justify-between"><div className="w-28 h-3 rounded bg-surface-700" /><div className="w-8 h-3 rounded bg-surface-700" /></div>
          <div className="flex justify-between"><div className="w-20 h-3 rounded bg-surface-700" /><div className="w-8 h-3 rounded bg-surface-700" /></div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersKanban() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { realtime: toastRealtime, success: toastSuccess } = useToast();

  // Use refs for toast functions to avoid dependency loops (Bug 4 fix)
  const toastRealtimeRef = useRef(toastRealtime);
  const toastSuccessRef = useRef(toastSuccess);
  useEffect(() => {
    toastRealtimeRef.current = toastRealtime;
    toastSuccessRef.current = toastSuccess;
  });

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/orders`);
      const json = await res.json();
      if (json?.data && Array.isArray(json.data)) {
        const sanitized = json.data.map(sanitizeOrder);
        setOrders(prev => {
          const existingIds = new Set(prev.map(o => o.id));
          const brandNew = sanitized.filter(o => !existingIds.has(o.id));
          if (brandNew.length > 0 && prev.length > 0) {
            setTimeout(() => {
              brandNew.forEach(o => {
                toastRealtimeRef.current(
                  `🔔 New Order — Table ${o.table_number}`,
                  `${o.customer_name ? o.customer_name + ' · ' : ''}${o.items.length} items · ₹${o.total_amount}`
                );
                setNewOrderIds(n => new Set([...n, o.id]));
              });
              if (soundEnabled) playNewOrderChime();
            }, 0);
          }
          return sanitized;
        });
      }
    } catch {/* keep current */}
  }, [soundEnabled]);

  useEffect(() => {
    setLoading(true);
    fetchOrders().finally(() => setLoading(false));

    // Poll every 2.5 seconds as primary fallback to ensure instant updates
    const interval = setInterval(fetchOrders, 2500);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // ── Supabase Realtime Hook ──────────────────────────────────────────────────
  const handleInsert = useCallback((rawOrder: RealtimeOrder) => {
    const newOrder = sanitizeOrder(rawOrder);
    setOrders(prev => {
      if (prev.find(o => o.id === newOrder.id)) return prev;
      return [newOrder, ...prev];
    });
    setNewOrderIds(prev => new Set([...prev, newOrder.id]));
    toastRealtimeRef.current(
      `🔔 New Order — Table ${newOrder.table_number}`,
      `${newOrder.customer_name ? newOrder.customer_name + ' · ' : ''}${newOrder.items.length} items · ₹${newOrder.total_amount}`
    );
    if (soundEnabled) playNewOrderChime();
  }, [soundEnabled]);

  // Clear new-order highlight markers after 8 seconds
  useEffect(() => {
    if (newOrderIds.size === 0) return;
    const timer = setTimeout(() => setNewOrderIds(new Set()), 8000);
    return () => clearTimeout(timer);
  }, [newOrderIds.size]);

  const handleUpdate = useCallback((rawUpdated: RealtimeOrder) => {
    const updated = sanitizeOrder(rawUpdated);
    setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
  }, []);

  const handleDelete = useCallback((deleted: Partial<RealtimeOrder>) => {
    if (deleted.id) setOrders(prev => prev.filter(o => o.id !== deleted.id));
  }, []);

  useRealtimeOrders({ onInsert: handleInsert, onUpdate: handleUpdate, onDelete: handleDelete });

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setTimeout(() => setRefreshing(false), 600);
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId as Column;
    setOrders(prev => prev.map(o => o.id === draggableId ? { ...o, status: newStatus } : o));

    try {
      await fetch(`${API}/api/orders/${draggableId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (newStatus === 'served') toastSuccessRef.current('Order served!', 'Order status updated.');
    } catch {/* optimistic UI stays */}
  };

  const byColumn = (col: Column) => orders.filter(o => o.status === col);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-surface-50">
            Orders <span className="text-gradient-brand">Kanban</span>
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-surface-500">Drag to update · Real-time auto sync</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
              <span className="text-xs text-neon-green">Live Sync Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(v => !v)}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-brand-500/10 border-brand-500/20 text-brand-400'
                : 'bg-surface-800 border-surface-700 text-surface-500'
            }`}
            aria-label={soundEnabled ? 'Mute notifications' : 'Unmute notifications'}
            title={soundEnabled ? 'Sound on' : 'Sound off'}
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
          <Button
            id="refresh-orders"
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(col => {
            const colOrders = byColumn(col.id);
            return (
              <div key={col.id} className={`rounded-2xl border p-4 min-h-96 ${col.color}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <col.icon className="w-4 h-4 text-surface-400" />
                    <h3 className="text-sm font-semibold text-surface-200">{col.label}</h3>
                  </div>
                  <Badge variant={col.badge as any} size="sm">{colOrders.length}</Badge>
                </div>

                <div className="mb-4 px-3 py-1.5 bg-surface-800/50 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-surface-500">Subtotal</span>
                  <span className="text-surface-200 font-semibold flex items-center gap-0.5">
                    <IndianRupee className="w-3 h-3 text-brand-400" />
                    {colOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0).toLocaleString()}
                  </span>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-32 rounded-xl transition-colors duration-200 ${
                        snapshot.isDraggingOver ? 'bg-surface-700/30 ring-2 ring-brand-500/30' : ''
                      }`}
                    >
                      {loading ? (
                        <>
                          <OrderCardSkeleton />
                          <OrderCardSkeleton />
                        </>
                      ) : (
                        <AnimatePresence>
                          {colOrders.map((order, idx) => (
                            <OrderCard
                              key={order.id}
                              order={order}
                              index={idx}
                              isNew={newOrderIds.has(order.id)}
                            />
                          ))}
                        </AnimatePresence>
                      )}
                      {provided.placeholder}
                      {!loading && colOrders.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex flex-col items-center justify-center py-10 text-surface-600">
                          <ShoppingBag className="w-8 h-8 mb-2 opacity-30" />
                          <p className="text-xs">No orders in this stage</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
