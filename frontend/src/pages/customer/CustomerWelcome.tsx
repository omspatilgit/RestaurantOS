
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Utensils, CalendarDays, ArrowRight } from 'lucide-react';

export default function CustomerWelcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-96 bg-brand-500/20 rounded-full blur-[120px] -translate-y-1/2 opacity-50" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-400/10 rounded-full blur-[100px] translate-y-1/2 translate-x-1/4 opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-400/10 border border-brand-400/20 mb-6 glow-lime">
          <Utensils className="w-10 h-10 text-brand-400" />
        </div>
        <h1 className="text-4xl font-black mb-2 tracking-tight">Restaurant<span className="text-brand-400">OS</span></h1>
        <p className="text-surface-400 text-sm font-medium">Experience fine dining, reimagined.</p>
      </motion.div>

      <div className="w-full max-w-sm space-y-4 relative z-10">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate('/portal/checkin')}
          className="w-full group relative overflow-hidden bg-surface-900 border border-surface-700/50 rounded-2xl p-6 text-left transition-all hover:border-brand-400/50 hover:bg-surface-800"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">At Restaurant</h2>
              <p className="text-xs text-surface-400">Scan QR or enter table number</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center group-hover:bg-brand-400 group-hover:text-black transition-colors">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/portal/prebook')}
          className="w-full group relative overflow-hidden bg-brand-400 border border-brand-300 rounded-2xl p-6 text-left transition-all hover:bg-brand-300 glow-lime"
        >
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h2 className="text-xl font-bold text-black mb-1">Pre-Book Table</h2>
              <p className="text-xs text-black/70 font-medium">Reserve your spot in advance</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-black" />
            </div>
          </div>
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 text-xs font-semibold text-surface-600 relative z-10"
      >
        Powered by Smart Restaurant Management
      </motion.div>
    </div>
  );
}
