import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, User, ArrowRight, Sparkles, Star, Clock, Wifi, Hash } from 'lucide-react';
import { cn } from '../../lib/utils';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export default function TableCheckIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tableNo, setTableNo] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'table' | 'name'>('table');
  const [error, setError] = useState('');
    const [tables, setTables] = useState<{id?: string, table_number: number, status: string}[]>([]);
  const [waitTime, setWaitTime] = useState<number | null>(null);

  // Pre-fill from URL params
  const urlTable = searchParams.get('table');
  const initialTable = urlTable || '';

  useEffect(() => {
    const fetchData = () => {
      // Fetch tables status
      // Fetch tables
      fetch(`${API}/api/tables`)
        .then(r => r.json())
        .then(d => { if (d.success) setTables(d.data); })
        .catch(() => {});
        
      // Fetch dashboard stats to calculate wait time
      fetch(`${API}/api/dashboard/stats`)
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            const pending = d.data.pending_orders || 0;
            const wait = Math.ceil(pending * 5 + 10);
            setWaitTime(wait);
          }
        })
        .catch(() => {});
    };

    fetchData(); // Initial fetch
    
    // Auto-refresh every 5 seconds so table statuses stay live
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTableNext = () => {
    const t = tableNo || initialTable;
    if (!t || isNaN(Number(t)) || Number(t) < 1) {
      setError('Please select a valid table');
      return;
    }
    setError('');
    setStep('name');
  };

  const handleStart = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    const t = tableNo || initialTable;
    
    // Update table status to occupied
    const tableObj = tables.find(tbl => String(tbl.table_number) === t);
    if (tableObj && tableObj.id) {
      try {
        await fetch(`${API}/api/tables/${tableObj.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'occupied' })
        });
      } catch (e) {
        console.error(e);
      }
    }

    sessionStorage.setItem('customer_table', t);
    sessionStorage.setItem('customer_name', name.trim());
    navigate(`/portal/menu?table=${t}&name=${encodeURIComponent(name.trim())}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 bg-brand-400 glow-lime"
        >
          <ChefHat className="w-12 h-12 text-black" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-4xl font-black font-display mb-2 text-brand-400 tracking-tight"
        >
          RestaurantOS
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-sm font-medium mb-3 text-brand-400/60"
        >
          Order. Track. Enjoy. ✨
        </motion.p>
        
        {waitTime !== null && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-400/30 bg-brand-400/10 text-brand-400 font-mono uppercase tracking-widest text-[10px]"
          >
            <Clock className="w-4 h-4" />
            <span className="font-bold">Est. Wait: ~{waitTime} mins</span>
          </motion.div>
        )}

      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm glass rounded-4xl p-6"
      >
        <AnimatePresence mode="wait">
          {step === 'table' ? (
            <motion.div
              key="table-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div>
                <p className="text-[10px] font-bold font-mono uppercase tracking-[0.2em] mb-1 text-brand-400/60">
                  Step 1 of 2
                </p>
                <h2 className="text-xl font-bold text-white">Select your table</h2>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Which table are you seated at?
                </p>
              </div>

              {tables.length > 0 ? (
                <div className="grid grid-cols-5 gap-2 my-4">
                  {tables.map(t => (
                    <button
                      key={t.table_number}
                      onClick={() => {
                        if (t.status === 'available') {
                          setTableNo(String(t.table_number));
                          setError('');
                        }
                      }}
                      className={cn(
                        "aspect-square rounded-xl flex flex-col items-center justify-center border transition-all relative overflow-hidden",
                        t.status !== 'available' ? "cursor-not-allowed" : "cursor-pointer"
                      )}
                      style={{
                        background: tableNo === String(t.table_number) 
                          ? 'rgba(204,255,0,0.2)' 
                          : t.status !== 'available' 
                            ? 'rgba(255,255,255,0.02)' 
                            : 'rgba(204,255,0,0.05)',
                        borderColor: tableNo === String(t.table_number) 
                          ? '#ccff00' 
                          : t.status !== 'available' 
                            ? 'rgba(255,255,255,0.1)' 
                            : 'rgba(204,255,0,0.2)',
                        color: t.status !== 'available' ? 'rgba(255,255,255,0.3)' : 'white'
                      }}
                    >
                      {t.status !== 'available' && (
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500/50" />
                      )}
                      <span className="font-bold text-lg">{t.table_number}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="relative my-4">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400/50" />
                  <input
                    type="number"
                    placeholder={initialTable || "Table number"}
                    value={tableNo || initialTable}
                    onChange={e => { setTableNo(e.target.value); setError(''); }}
                    className="w-full h-12 pl-12 pr-4 rounded-xl text-white text-lg font-bold placeholder:font-normal focus:outline-none transition-all bg-brand-400/10 border border-brand-400/20 focus:border-brand-400/60 focus:glow-lime"
                  />
                </div>
              )}

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400">{error}</motion.p>
              )}

              <button
                onClick={handleTableNext}
                className="w-full h-12 rounded-full font-bold text-black flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 mt-2 bg-brand-400 glow-lime hover:bg-brand-300"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="name-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <button
                  onClick={() => setStep('table')}
                  className="text-xs mb-3 flex items-center gap-1 cursor-pointer transition-opacity hover:opacity-70 text-brand-400/60"
                >
                  ← Back
                </button>
                <p className="text-[10px] font-bold font-mono uppercase tracking-[0.2em] mb-1 text-brand-400/60">
                  Step 2 of 2
                </p>
                <h2 className="text-xl font-bold text-white">What's your name?</h2>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  So we know who to call 🙂
                </p>
              </div>

              {/* Table confirmation */}
              <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-brand-400/10 border border-brand-400/20">
                <span className="text-sm text-brand-400/70">Table</span>
                <span className="font-bold text-white">#{tableNo || initialTable}</span>
                <span className="ml-auto text-xs text-brand-400/50">confirmed ✓</span>
              </div>

              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400/50" />
                <input
                  id="customer-name-input"
                  type="text"
                  placeholder="Your name..."
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleStart()}
                  className="w-full h-14 pl-12 pr-4 rounded-xl text-white text-lg font-bold placeholder:font-normal focus:outline-none transition-all bg-brand-400/10 border border-brand-400/20 focus:border-brand-400/60 focus:glow-lime"
                  autoFocus
                />
              </div>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400">{error}</motion.p>
              )}

              <button
                id="start-ordering-btn"
                onClick={handleStart}
                className="w-full h-14 rounded-full font-bold text-black text-base flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 bg-brand-400 glow-lime hover:bg-brand-300"
              >
                <Sparkles className="w-5 h-5" />
                Start Ordering!
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bottom note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xs mt-6 text-center"
        style={{ color: 'rgba(255,255,255,0.2)' }}
      >
        Powered by RestaurantOS · Live order tracking included
      </motion.p>
    </div>
  );
}
