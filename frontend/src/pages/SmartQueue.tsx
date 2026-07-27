import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Clock, Brain, Zap, Plus, Phone, UserCheck,
  UserX, RefreshCw, Sparkles, ChevronRight, Wifi
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useRealtimeQueue, type RealtimeQueueEntry } from '../hooks/useRealtimeQueue';
import { useToast } from '../components/ui/Toast';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface QueueEntry {
  id: string;
  party_name: string;
  party_size: number;
  phone?: string;
  status: 'waiting' | 'seated' | 'left';
  estimated_wait_min?: number;
  created_at: string;
}

interface AIPrediction {
  wait_time_min: number;
  message: string;
  confidence: 'low' | 'medium' | 'high';
  factors: string;
}

const MOCK_QUEUE: QueueEntry[] = [
  { id: '1', party_name: 'Sharma Family', party_size: 4, phone: '98765-43210', status: 'waiting', estimated_wait_min: 12, created_at: new Date(Date.now() - 8 * 60000).toISOString() },
  { id: '2', party_name: 'Raj & Friends', party_size: 6, status: 'waiting', estimated_wait_min: 20, created_at: new Date(Date.now() - 3 * 60000).toISOString() },
  { id: '3', party_name: 'Mehta', party_size: 2, phone: '91234-56789', status: 'waiting', estimated_wait_min: 25, created_at: new Date(Date.now() - 1 * 60000).toISOString() },
];

function ConfidenceBadge({ confidence }: { confidence: 'low' | 'medium' | 'high' }) {
  const map = { low: 'warning', medium: 'info', high: 'success' } as const;
  return <Badge variant={map[confidence]} size="sm">{confidence} confidence</Badge>;
}

function AIPredictionCard({ prediction, loading, partySize, onPredict }: {
  prediction: AIPrediction | null; loading: boolean;
  partySize: number; onPredict: () => void;
}) {
  return (
    <Card variant="glow" padding="md" className="relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-brand-500/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
          <Brain className="w-4 h-4 text-brand-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-surface-50">Gemini AI Prediction</h3>
          <p className="text-[10px] text-surface-500">Powered by Google Gemini</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[10px] text-brand-400">
          <Sparkles className="w-3 h-3" />
          <span>AI</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-6 flex flex-col items-center gap-3"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-14 h-14 rounded-full border-2 border-brand-500/20 border-t-brand-500"
              />
              <Brain className="absolute inset-0 m-auto w-6 h-6 text-brand-400" />
            </div>
            <p className="text-sm text-surface-400">Gemini is thinking<span className="animate-pulse">...</span></p>
            <p className="text-xs text-surface-600">Analyzing queue & kitchen load</p>
          </motion.div>
        ) : prediction ? (
          <motion.div
            key="prediction"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-4xl font-bold font-display text-gradient-brand">
                  {prediction.wait_time_min}
                  <span className="text-lg text-surface-400 font-normal ml-1">min</span>
                </p>
                <p className="text-xs text-surface-500 mt-0.5">Estimated wait time</p>
              </div>
              <ConfidenceBadge confidence={prediction.confidence} />
            </div>
            <p className="text-sm text-surface-300 bg-surface-800/50 rounded-xl p-3 mb-3 leading-relaxed">
              "{prediction.message}"
            </p>
            <p className="text-xs text-surface-500 flex items-start gap-1.5">
              <Zap className="w-3 h-3 shrink-0 mt-0.5 text-brand-400" />
              {prediction.factors}
            </p>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 text-center">
            <p className="text-sm text-surface-400 mb-1">No prediction yet</p>
            <p className="text-xs text-surface-600">Enter party size and click predict</p>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        id="ai-predict-btn"
        className="w-full mt-4"
        variant="outline"
        size="sm"
        onClick={onPredict}
        loading={loading}
        icon={<Brain className="w-3.5 h-3.5" />}
      >
        {prediction ? 'Re-predict' : `Predict Wait for Party of ${partySize}`}
      </Button>
    </Card>
  );
}

function QueueRow({ entry, position, onSeat, onLeave }: {
  entry: QueueEntry; position: number;
  onSeat: (id: string) => void; onLeave: (id: string) => void;
}) {
  const waited = Math.floor((Date.now() - new Date(entry.created_at).getTime()) / 60000);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="flex items-center gap-4 p-4 bg-surface-800/60 border border-surface-700/50 rounded-xl hover:border-surface-600 transition-colors"
    >
      {/* Position */}
      <div className="w-8 h-8 rounded-full bg-brand-500/15 border border-brand-500/20 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-brand-400">#{position}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-surface-100 truncate">{entry.party_name}</span>
          <Badge variant="default" size="sm">
            <Users className="w-2.5 h-2.5 mr-0.5" />
            {entry.party_size}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-surface-500">
          {entry.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {entry.phone}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Waited {waited}m
          </span>
          {entry.estimated_wait_min && (
            <span className="text-neon-amber">~{entry.estimated_wait_min}m est.</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          id={`seat-${entry.id}`}
          onClick={() => onSeat(entry.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-green/10 border border-neon-green/20 text-neon-green text-xs font-medium hover:bg-neon-green/20 transition-colors cursor-pointer"
          aria-label={`Seat ${entry.party_name}`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Seat</span>
        </button>
        <button
          id={`leave-${entry.id}`}
          onClick={() => onLeave(entry.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-red/10 border border-neon-red/20 text-neon-red text-xs font-medium hover:bg-neon-red/20 transition-colors cursor-pointer"
          aria-label={`Mark ${entry.party_name} as left`}
        >
          <UserX className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Left</span>
        </button>
      </div>
    </motion.div>
  );
}

export default function SmartQueue() {
  const [queue, setQueue] = useState<QueueEntry[]>(MOCK_QUEUE);
  const [prediction, setPrediction] = useState<AIPrediction | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newParty, setNewParty] = useState({ name: '', size: 2, phone: '' });
  const [refreshing, setRefreshing] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const { realtime: toastRealtime } = useToast();

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/queue`);
      const { data } = await res.json();
      if (data) setQueue(data);
    } catch {}
  }, []);

  // Realtime queue subscription
  const handleQueueInsert = useCallback((entry: RealtimeQueueEntry) => {
    setRealtimeConnected(true);
    setQueue(prev => {
      if (prev.find(e => e.id === entry.id)) return prev;
      return [...prev, entry as QueueEntry];
    });
    toastRealtime(`🔔 New Party — ${entry.party_name}`, `Party of ${entry.party_size}`);
  }, [toastRealtime]);

  const handleQueueUpdate = useCallback((entry: RealtimeQueueEntry) => {
    setRealtimeConnected(true);
    if (entry.status !== 'waiting') {
      setQueue(prev => prev.filter(e => e.id !== entry.id));
    } else {
      setQueue(prev => prev.map(e => e.id === entry.id ? { ...e, ...entry } : e));
    }
  }, []);

  const { connected: queueConnected } = useRealtimeQueue({
    onInsert: handleQueueInsert,
    onUpdate: handleQueueUpdate,
  });

  useEffect(() => {
    setRealtimeConnected(queueConnected);
  }, [queueConnected]);

  useEffect(() => {
    fetchQueue();
    // Poll every 15 seconds as fallback
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, [fetchQueue]);


  const handlePredict = async () => {
    setAiLoading(true);
    try {
      const res = await fetch(`${API}/api/predict-wait`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          active_tables: 8,
          pending_orders: queue.length * 2,
          party_size: newParty.size || 2,
        }),
      });
      const { data } = await res.json();
      if (data) setPrediction(data);
    } catch {
      setPrediction({
        wait_time_min: 15 + queue.length * 5,
        message: "We'll have a table ready for you soon! Thank you for waiting.",
        confidence: 'medium',
        factors: 'Estimated based on current queue length and table turnover rate',
      });
    } finally {
      setAiLoading(false);
    }
  };

  const addToQueue = async () => {
    if (!newParty.name) return;
    const entry: QueueEntry = {
      id: Date.now().toString(),
      party_name: newParty.name,
      party_size: newParty.size,
      phone: newParty.phone || undefined,
      status: 'waiting',
      estimated_wait_min: prediction?.wait_time_min,
      created_at: new Date().toISOString(),
    };
    setQueue(prev => [...prev, entry]);
    setNewParty({ name: '', size: 2, phone: '' });
    setShowAddForm(false);
    try {
      await fetch(`${API}/api/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ party_name: entry.party_name, party_size: entry.party_size, phone: entry.phone }),
      });
    } catch {}
  };

  const updateStatus = async (id: string, status: 'seated' | 'left') => {
    setQueue(prev => prev.filter(e => e.id !== id));
    try {
      await fetch(`${API}/api/queue/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch {}
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchQueue();
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-surface-50">
            Smart <span className="text-gradient-brand">Queue</span>
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-surface-500">AI-powered wait-time prediction · {queue.length} parties waiting</p>
            <div className="flex items-center gap-1.5">
              <Wifi className={`w-3 h-3 ${realtimeConnected ? 'text-neon-green' : 'text-neon-amber'}`} />
              <span className={`text-xs ${realtimeConnected ? 'text-neon-green' : 'text-neon-amber'}`}>
                {realtimeConnected ? 'Live' : 'Connecting...'}
              </span>
              {realtimeConnected && <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button id="refresh-queue" variant="secondary" size="sm" icon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />} onClick={handleRefresh}>
            Refresh
          </Button>
          <Button id="add-to-queue" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowAddForm(v => !v)}>
            Add Party
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Queue list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Add party form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card variant="glass" padding="md" className="mb-4">
                  <h3 className="text-sm font-semibold text-surface-100 mb-4">Add Party to Queue</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      id="queue-party-name"
                      label="Party Name"
                      placeholder="Family name..."
                      value={newParty.name}
                      onChange={e => setNewParty(p => ({ ...p, name: e.target.value }))}
                    />
                    <Input
                      id="queue-party-size"
                      label="Party Size"
                      type="number"
                      min={1}
                      max={20}
                      value={newParty.size}
                      onChange={e => setNewParty(p => ({ ...p, size: Number(e.target.value) }))}
                    />
                    <Input
                      id="queue-party-phone"
                      label="Phone (optional)"
                      placeholder="98765-43210"
                      value={newParty.phone}
                      onChange={e => setNewParty(p => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button id="confirm-add-party" size="sm" onClick={addToQueue} icon={<ChevronRight className="w-3.5 h-3.5" />}>
                      Add to Queue
                    </Button>
                    <Button id="cancel-add-party" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Queue summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Waiting', value: queue.length, color: 'text-neon-amber' },
              { label: 'Total Guests', value: queue.reduce((s, e) => s + e.party_size, 0), color: 'text-brand-400' },
              { label: 'Avg. Wait', value: `${Math.round(queue.reduce((s, e) => s + (e.estimated_wait_min || 15), 0) / (queue.length || 1))}m`, color: 'text-neon-blue' },
            ].map(({ label, value, color }) => (
              <Card key={label} padding="sm">
                <p className={`text-xl font-bold font-display ${color}`}>{value}</p>
                <p className="text-xs text-surface-500 mt-0.5">{label}</p>
              </Card>
            ))}
          </div>

          {/* Queue entries */}
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {queue.map((entry, idx) => (
                <QueueRow
                  key={entry.id}
                  entry={entry}
                  position={idx + 1}
                  onSeat={id => updateStatus(id, 'seated')}
                  onLeave={id => updateStatus(id, 'left')}
                />
              ))}
            </AnimatePresence>
            {queue.length === 0 && (
              <div className="text-center py-16 text-surface-600">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No parties in queue</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: AI Prediction */}
        <div className="space-y-4">
          <AIPredictionCard
            prediction={prediction}
            loading={aiLoading}
            partySize={newParty.size}
            onPredict={handlePredict}
          />

          {/* Quick stats */}
          <Card variant="glass" padding="md">
            <h3 className="text-sm font-semibold text-surface-200 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-400" />
              Queue Insights
            </h3>
            <div className="space-y-2.5">
              {[
                { label: 'Peak Hour', value: '1:00 PM' },
                { label: 'Avg. Table Time', value: '45 min' },
                { label: 'Tables Available', value: '3 of 12' },
                { label: 'Turnover Rate', value: '~8/hr' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-surface-500">{label}</span>
                  <span className="text-surface-200 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
