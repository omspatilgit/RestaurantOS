import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, ChefHat, Smile, RefreshCw,
  ArrowLeft, Wifi, Plus, ReceiptText, Star, CreditCard
} from 'lucide-react';
import { useRealtimeOrderStatus } from '../../hooks/useRealtimeOrders';
import { cn } from '../../lib/utils';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

type OrderStatus = 'pending' | 'kitchen' | 'served' | 'cancelled' | 'completed';

interface OrderData {
  id: string;
  table_number: number;
  items: { name: string; qty: number; price: number }[];
  total_amount: number;
  status: OrderStatus;
  customer_name?: string;
  created_at: string;
}

const STATUS_STEPS: { key: OrderStatus; label: string; sublabel: string; icon: React.ElementType; emoji: string }[] = [
  { key: 'pending', label: 'Order Received', sublabel: 'We got your order!', icon: CheckCircle2, emoji: '✅' },
  { key: 'kitchen', label: 'In the Kitchen', sublabel: 'Chef is cooking...', icon: ChefHat, emoji: '👨‍🍳' },
  { key: 'served', label: 'Served!', sublabel: 'Enjoy your meal!', icon: Smile, emoji: '🍽️' },
];

const STATUS_ORDER: OrderStatus[] = ['pending', 'kitchen', 'served'];

function getStepIndex(status: OrderStatus) {
  const idx = STATUS_ORDER.indexOf(status);
  return idx >= 0 ? idx : 0;
}

function LiveDot() {
  return (
    <div className="flex items-center gap-1.5 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
      <Wifi className="w-3 h-3 text-green-400" />
      <span className="text-xs font-semibold text-green-400">Live</span>
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
    </div>
  );
}

function TimeSince({ iso }: { iso: string }) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    const update = () => {
      if (!iso) return;
      const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
      if (isNaN(diff) || diff < 0) { setLabel('Just now'); return; }
      if (diff < 60) setLabel(`${diff}s ago`);
      else if (diff < 3600) setLabel(`${Math.floor(diff / 60)}m ago`);
      else setLabel(`${Math.floor(diff / 3600)}h ago`);
    };
    update();
    const id = setInterval(update, 3000);
    return () => clearInterval(id);
  }, [iso]);
  return <span>{label}</span>;
}

function sanitizeItems(rawItems: any) {
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

function FeedbackWidget({ orderId, tableNo }: { orderId: string; tableNo: string }) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl p-5 text-center"
        style={{ background: 'rgba(20,10,0,0.8)', border: '1px solid rgba(57,211,83,0.2)' }}
      >
        <p className="text-3xl mb-2">💚</p>
        <p className="text-sm font-bold text-white">Thank you for your feedback!</p>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>We appreciate you dining with us</p>
      </motion.div>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await fetch(`${API}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, table_number: Number(tableNo), rating, comment }),
      });
    } catch {}
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-5 glass"
    >
      <p className="text-[10px] font-bold font-mono uppercase tracking-[0.2em] mb-3 text-brand-400/60">
        Rate Your Experience
      </p>
      <div className="flex items-center justify-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            onClick={() => setRating(s)}
            onMouseEnter={() => setHoveredStar(s)}
            onMouseLeave={() => setHoveredStar(0)}
            className="cursor-pointer transition-transform hover:scale-125 active:scale-90"
          >
            <Star
              className={cn(
                "w-8 h-8 transition-colors",
                s <= (hoveredStar || rating) ? "text-brand-400 fill-brand-400 drop-shadow-[0_0_8px_rgba(204,255,0,0.5)]" : "text-white/10 fill-transparent"
              )}
            />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <textarea
            placeholder="Tell us more (optional)..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="w-full h-16 rounded-xl p-3 text-sm text-white resize-none focus:outline-none mb-3 bg-brand-400/5 border border-brand-400/20 focus:border-brand-400/60 focus:glow-lime"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-10 rounded-full text-sm font-bold text-black transition-all cursor-pointer active:scale-95 disabled:opacity-50 bg-brand-400 glow-lime hover:bg-brand-300"
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function OrderTracker() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tableNo = searchParams.get('table') || sessionStorage.getItem('last_order_table') || sessionStorage.getItem('customer_table') || '1';
  const customerName = searchParams.get('name') || sessionStorage.getItem('last_order_name') || sessionStorage.getItem('customer_name') || 'Guest';
  const orderId = searchParams.get('orderId') || sessionStorage.getItem('last_order_id') || null;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [loading, setLoading] = useState(true);

  const [justUpdated, setJustUpdated] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const prevStatusRef = useRef<OrderStatus | null>(null);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/orders?_t=${Date.now()}`, { cache: 'no-store' });
      const json = await res.json();
      const data = json?.data;
      if (Array.isArray(data)) {
        let found: any = null;
        if (orderId) {
          found = data.find((o: any) => String(o.id) === String(orderId));
        }
        if (!found && tableNo) {
          const activeOrders = data.filter((o: any) => String(o.table_number) === String(tableNo) && o.status !== 'completed' && o.status !== 'cancelled');
          if (activeOrders.length > 0) {
            found = activeOrders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
          } else {
            const tableOrders = data.filter((o: any) => String(o.table_number) === String(tableNo));
            if (tableOrders.length > 0) {
              found = tableOrders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
            }
          }
        }
        if (found) {
          const parsedOrder: OrderData = {
            id: String(found.id),
            table_number: Number(found.table_number || tableNo),
            items: sanitizeItems(found.items),
            total_amount: Number(found.total_amount || 0),
            status: found.status || 'pending',
            customer_name: found.customer_name || customerName,
            created_at: found.created_at || new Date().toISOString(),
          };

          if (prevStatusRef.current && prevStatusRef.current !== parsedOrder.status) {
            setJustUpdated(true);
            setTimeout(() => setJustUpdated(false), 3000);
          }
          prevStatusRef.current = parsedOrder.status;

          setOrder(parsedOrder);
          setStatus(parsedOrder.status);
        }
      }
    } catch {}
    setLoading(false);
  }, [orderId, tableNo, customerName]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 8000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  const handleStatusChange = useCallback((newStatus: OrderStatus) => {
    setStatus(newStatus);
    prevStatusRef.current = newStatus;
    setJustUpdated(true);
    setTimeout(() => setJustUpdated(false), 3000);
  }, []);

  useRealtimeOrderStatus(order?.id || orderId, handleStatusChange);

  const handleCheckout = async () => {
    if (!order) return;
    setCheckingOut(true);
    try {
      await fetch(`${API}/api/tables/${order.table_number}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      setStatus('completed');
      setOrder({ ...order, status: 'completed' });
    } catch (e) {
      console.error(e);
    }
    setCheckingOut(false);
  };

  const handleDone = () => {
    sessionStorage.removeItem('last_order_id');
    navigate(`/portal/menu?table=${tableNo}&name=${encodeURIComponent(customerName)}`);
  };

  const currentStep = getStepIndex(status);
  const isServed = status === 'served';
  const isCompleted = status === 'completed';

  const stepColors: Record<string, string> = {
    pending: '#a3cc00', // brand-500
    kitchen: '#ccff00', // brand-400
    served: '#10b981',  // emerald
    cancelled: '#ff4757',
    completed: '#58a6ff',
  };

  const accentColor = stepColors[status] || '#fb923c';

  if (isCompleted && order) {
    const subtotal = order.total_amount;
    const tax = subtotal * 0.05;
    const grandTotal = subtotal + tax;

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-900 border border-brand-400/20 glass rounded-4xl shadow-2xl w-full max-w-sm text-surface-50 p-6 relative overflow-hidden"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(204,255,0,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        >
          <div className="text-center border-b border-dashed border-surface-700 pb-4 mb-4">
            <h2 className="text-2xl font-black text-brand-400 font-display tracking-tight">RestaurantOS</h2>
            <p className="text-sm text-surface-400 mt-1">Table #{order.table_number} · {order.customer_name}</p>
            <p className="text-xs text-surface-500 mt-1">{new Date(order.created_at).toLocaleString()}</p>
          </div>
          
          <div className="space-y-3 mb-6 min-h-[150px]">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="font-medium text-surface-200">
                  <span className="text-surface-500 mr-2">{item.qty}x</span>{item.name}
                </span>
                <span className="text-surface-300 font-medium">₹{(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-dashed border-surface-700 pt-4 mb-4">
            <div className="flex justify-between text-sm font-medium text-surface-400">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-surface-500 mt-2">
              <span>Tax (5% GST)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="border-t-2 border-surface-600 pt-4 flex justify-between font-black text-xl mb-8 text-surface-50">
            <span>Total</span>
            <span className="text-brand-400">₹{grandTotal.toFixed(2)}</span>
          </div>
          
          <button 
            onClick={handleDone}
            className="w-full py-3.5 bg-brand-400 hover:bg-brand-300 transition-colors text-black rounded-full font-bold text-base flex items-center justify-center gap-2 glow-lime"
          >
            <CheckCircle2 className="w-5 h-5" /> Done & Close
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(`/portal/menu?table=${tableNo}&name=${encodeURIComponent(customerName)}`)}
          className="p-2 rounded-xl cursor-pointer text-white/40 hover:text-white/80 transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)' }} aria-label="Back to menu">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-bold text-white">Live Order Tracker</h1>
          <p className="text-xs text-brand-400/80">Table #{tableNo} · {customerName}</p>
        </div>
        <LiveDot />
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 rounded-full border-2 border-t-transparent" style={{ borderColor: `${accentColor}40`, borderTopColor: accentColor }} />
        </div>
      ) : !order ? (
        <NoOrder tableNo={tableNo} customerName={customerName} />
      ) : (
        <>
          {/* Big status display */}
          <motion.div
            key={status}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-10"
          >
            {/* Pulsing ring */}
            <div className="relative inline-flex items-center justify-center mb-5">
              {!isServed && (
                <motion.div
                  className="absolute w-40 h-40 rounded-full"
                  style={{ border: `2px solid ${accentColor}30` }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <motion.div
                animate={!isServed ? { scale: [1, 1.04, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-36 h-36 rounded-full flex items-center justify-center text-6xl"
                style={{ background: `radial-gradient(circle, ${accentColor}20 0%, ${accentColor}05 100%)`, border: `2px solid ${accentColor}30` }}
              >
                {STATUS_STEPS.find(s => s.key === status)?.emoji ?? '⏳'}
              </motion.div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={status} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h2 className="text-3xl font-black text-white mb-1">
                  {STATUS_STEPS.find(s => s.key === status)?.label ?? 'Processing'}
                </h2>
                <p className="text-base" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {STATUS_STEPS.find(s => s.key === status)?.sublabel}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Live update flash */}
            <AnimatePresence>
              {justUpdated && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full text-sm font-semibold"
                  style={{ background: 'rgba(57,211,83,0.15)', border: '1px solid rgba(57,211,83,0.3)', color: '#39d353' }}
                >
                  <Wifi className="w-3.5 h-3.5" />
                  Status updated live!
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Step timeline */}
          <div className="mb-8 px-2">
            <div className="relative">
              {/* Line */}
              <div className="absolute left-6 top-6 bottom-6 w-0.5" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <motion.div
                className="absolute left-6 top-6 w-0.5"
                style={{ background: `linear-gradient(to bottom, ${accentColor}, ${accentColor}30)` }}
                animate={{ height: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />

              <div className="space-y-6">
                {STATUS_STEPS.map((step, idx) => {
                  const done = idx <= currentStep;
                  const active = idx === currentStep;
                  const Icon = step.icon;

                  return (
                    <motion.div
                      key={step.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: done ? 1 : 0.35, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-4 relative"
                    >
                      {/* Icon circle */}
                      <motion.div
                        animate={active && !isServed ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 z-10"
                        style={{
                          background: done ? `${accentColor}20` : 'rgba(255,255,255,0.05)',
                          border: `2px solid ${done ? accentColor + '50' : 'rgba(255,255,255,0.08)'}`,
                          boxShadow: active ? `0 0 20px ${accentColor}30` : 'none',
                        }}
                      >
                        <Icon className="w-5 h-5" style={{ color: done ? accentColor : 'rgba(255,255,255,0.2)' }} />
                      </motion.div>

                      {/* Text */}
                      <div className="pt-2.5">
                        <p className="text-sm font-bold" style={{ color: done ? 'white' : 'rgba(255,255,255,0.25)' }}>
                          {step.label}
                          {active && !isServed && <span className="ml-2 text-xs font-normal" style={{ color: accentColor }}>← Now</span>}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: done ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)' }}>
                          {step.sublabel}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* If served — Check Out & Payment */}
          {isServed && (
            <div className="mb-6 space-y-4">
              <motion.button
                onClick={handleCheckout}
                disabled={checkingOut}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full py-4 rounded-full text-base font-bold text-black bg-brand-400 glow-lime flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 disabled:opacity-50 hover:bg-brand-300"
              >
                <CreditCard className="w-5 h-5" />
                {checkingOut ? 'Processing...' : 'Pay & Checkout'}
              </motion.button>
              
              <div className="flex gap-4">
                <Link
                  to={`/portal/menu?table=${tableNo}&name=${encodeURIComponent(customerName)}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-bold text-white cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Order More
                </Link>
              </div>
              
              <FeedbackWidget orderId={order?.id || ''} tableNo={tableNo} />
            </div>
          )}

          {/* Order summary card */}
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-5 mb-6 glass border border-brand-400/20"
            >
              <div className="flex items-center gap-2 mb-4">
                <ReceiptText className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-bold text-white">Your Order Details</h3>
                {order.created_at && (
                  <span className="ml-auto text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <TimeSince iso={order.created_at} />
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-white/70">
                      <span className="font-bold text-brand-400">×{item.qty || 1}</span> {item.name || 'Dish'}
                    </span>
                    <span className="text-white/50">₹{(Number(item.price) || 0) * (Number(item.qty) || 1)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-3 mt-3 text-sm font-bold border-t border-brand-400/20">
                <span className="text-white">Total Amount</span>
                <span className="text-brand-400">₹{order.total_amount}</span>
              </div>
            </motion.div>
          )}

          {/* Refresh button */}
          {!isServed && (
            <button
              onClick={fetchOrder}
              className="flex items-center gap-2 mx-auto mt-2 text-xs cursor-pointer transition-opacity hover:opacity-70"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              <RefreshCw className="w-3 h-3" /> Refresh manually
            </button>
          )}
        </>
      )}
    </div>
  );
}

function NoOrder({ tableNo, customerName }: { tableNo: string; customerName: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
      <div className="text-6xl mb-4">🍽️</div>
      <h2 className="text-xl font-bold text-white mb-2">No Active Order Found</h2>
      <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Place an order from the menu for Table #{tableNo} to start live tracking.
      </p>
      <Link
        to={`/portal/menu?table=${tableNo}&name=${encodeURIComponent(customerName)}`}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-black bg-brand-400 glow-lime hover:bg-brand-300 transition-colors"
      >
        <ChefHat className="w-4 h-4" /> Browse Menu & Order
      </Link>
    </div>
  );
}
