import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
  TrendingUp, ShoppingBag, ChefHat, Users,
  IndianRupee, Clock, CheckCircle2, Loader2
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import QRCodeGenerator from '../components/QRCodeGenerator';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface Stats {
  today_revenue: number;
  total_orders: number;
  pending_orders: number;
  kitchen_orders: number;
  served_orders: number;
  active_menu_items: number;
  queue_length: number;
  hourly_breakdown: { hour: string; revenue: number; orders: number }[];
}

const MOCK_STATS: Stats = {
  today_revenue: 12480,
  total_orders: 38,
  pending_orders: 4,
  kitchen_orders: 6,
  served_orders: 28,
  active_menu_items: 10,
  queue_length: 3,
  hourly_breakdown: [
    { hour: '10:00', revenue: 640, orders: 2 },
    { hour: '11:00', revenue: 980, orders: 3 },
    { hour: '12:00', revenue: 2840, orders: 9 },
    { hour: '13:00', revenue: 3200, orders: 10 },
    { hour: '14:00', revenue: 1860, orders: 6 },
    { hour: '15:00', revenue: 920, orders: 3 },
    { hour: '16:00', revenue: 480, orders: 2 },
    { hour: '17:00', revenue: 560, orders: 2 },
    { hour: '18:00', revenue: 1000, orders: 1 },
  ],
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-3 border border-surface-600/50 text-sm">
        <p className="text-surface-300 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">
            {p.name === 'revenue' ? `₹${p.value.toLocaleString()}` : `${p.value} orders`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const statCards = (s: Stats) => [
  {
    label: "Today's Revenue",
    value: `₹${s.today_revenue.toLocaleString()}`,
    icon: IndianRupee,
    color: 'text-brand-400',
    bg: 'bg-brand-500/10',
    border: 'border-brand-500/20',
    change: '+18%',
    positive: true,
  },
  {
    label: 'Total Orders',
    value: s.total_orders,
    icon: ShoppingBag,
    color: 'text-neon-blue',
    bg: 'bg-neon-blue/10',
    border: 'border-neon-blue/20',
    change: `${s.pending_orders} pending`,
    positive: true,
  },
  {
    label: 'In Kitchen',
    value: s.kitchen_orders,
    icon: ChefHat,
    color: 'text-neon-amber',
    bg: 'bg-neon-amber/10',
    border: 'border-neon-amber/20',
    change: 'Active now',
    positive: true,
  },
  {
    label: 'Queue',
    value: `${s.queue_length} parties`,
    icon: Users,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    change: 'Waiting',
    positive: true,
  },
  {
    label: 'Served Today',
    value: s.served_orders,
    icon: CheckCircle2,
    color: 'text-neon-green',
    bg: 'bg-neon-green/10',
    border: 'border-neon-green/20',
    change: 'Completed',
    positive: true,
  },
  {
    label: 'Menu Items',
    value: s.active_menu_items,
    icon: TrendingUp,
    color: 'text-neon-orange',
    bg: 'bg-neon-orange/10',
    border: 'border-neon-orange/20',
    change: 'Available',
    positive: true,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats>(MOCK_STATS);
  const [popularItems, setPopularItems] = useState<{name: string, count: number, revenue: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = () => {
      fetch(`${API}/api/dashboard/stats`)
        .then(r => r.json())
        .then(({ data }) => { if (data) setStats(data); })
        .catch(() => {/* use mock */})
        .finally(() => setLoading(false));

      fetch(`${API}/api/analytics/popular-items`)
        .then(r => r.json())
        .then(({ data }) => { if (data) setPopularItems(data); })
        .catch(() => {});
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2500);
    return () => clearInterval(interval);
  }, []);

  const cards = statCards(stats);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display text-surface-50">
          Good {getGreeting()}, <span className="text-gradient-brand">Chef</span> 👨‍🍳
        </h1>
        <p className="text-surface-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {loading && <span className="inline-flex items-center gap-1 ml-2 text-brand-400"><Loader2 className="w-3 h-3 animate-spin" />Loading live data...</span>}
        </p>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        {cards.map((c) => (
          <motion.div key={c.label} variants={item}>
            <Card className={`border ${c.border} hover:scale-105 transition-transform duration-200`} padding="md">
              <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                <c.icon className={`w-4 h-4 ${c.color}`} />
              </div>
              <p className="text-2xl font-bold text-surface-50 font-display">{c.value}</p>
              <p className="text-xs text-surface-400 mt-0.5">{c.label}</p>
              <p className={`text-[10px] mt-1 ${c.positive ? 'text-neon-green' : 'text-neon-red'}`}>{c.change}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue area chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card variant="default" padding="md">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-surface-50">Revenue Today</h2>
                <p className="text-xs text-surface-500 mt-0.5">Hourly breakdown · Auto-refreshing</p>
              </div>
              <div className="flex items-center gap-1.5 text-neon-green text-xs">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Live</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.hourly_breakdown} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(48,54,61,0.5)" />
                <XAxis dataKey="hour" tick={{ fill: '#6e7681', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6e7681', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f97316"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                  dot={{ fill: '#f97316', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Orders bar chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card variant="default" padding="md">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-surface-50">Orders/Hour</h2>
                <p className="text-xs text-surface-500 mt-0.5">Today's volume</p>
              </div>
              <Clock className="w-4 h-4 text-surface-500" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.hourly_breakdown} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(48,54,61,0.5)" />
                <XAxis dataKey="hour" tick={{ fill: '#6e7681', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6e7681', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" fill="#58a6ff" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Order status breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card variant="default" padding="md">
          <h2 className="text-base font-semibold text-surface-50 mb-4">Order Pipeline</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Pending', count: stats.pending_orders, color: 'bg-neon-amber', text: 'text-neon-amber' },
              { label: 'In Kitchen', count: stats.kitchen_orders, color: 'bg-brand-500', text: 'text-brand-400' },
              { label: 'Served', count: stats.served_orders, color: 'bg-neon-green', text: 'text-neon-green' },
            ].map(({ label, count, color, text }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold font-display text-surface-50 mb-1">{count}</div>
                <div className={`text-sm font-medium ${text} mb-2`}>{label}</div>
                <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((count / Math.max(stats.total_orders, 1)) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                    className={`h-full ${color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Upgrades: QR Codes & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <QRCodeGenerator />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card variant="glass" padding="md">
            <h2 className="text-base font-semibold text-surface-50 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              Popular Items
            </h2>
            <div className="space-y-3">
              {popularItems.length > 0 ? popularItems.slice(0, 5).map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-surface-800 flex items-center justify-center text-xs font-bold text-surface-400">
                      #{idx + 1}
                    </div>
                    <p className="text-sm font-medium text-surface-200">{item.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-surface-50">{item.count}x</p>
                    <p className="text-[10px] text-surface-500">₹{item.revenue}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-surface-500 py-2">Not enough data to show popular items yet.</p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
