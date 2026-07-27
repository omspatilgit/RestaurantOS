import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Info, X } from 'lucide-react';

export default function CustomerLayout() {
  const [showAlert, setShowAlert] = useState(true);
  return (
    <div className="min-h-screen relative w-full overflow-x-hidden">
      <AnimatePresence>
        {showAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-2 left-2 right-2 z-50 pointer-events-none"
          >
            <div className="max-w-lg mx-auto bg-brand-500/20 border border-brand-500/40 rounded-2xl p-4 backdrop-blur-md flex items-start gap-3 pointer-events-auto shadow-2xl glass">
              <Info className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm text-white">
                <span className="font-bold text-brand-400 block mb-1">Customer Portal Note</span>
                This portal is optimized for Mobile Phones. Please use a real Gmail address during Pre-Booking to receive the confirmation email!
              </div>
              <button onClick={() => setShowAlert(false)} className="text-white/60 hover:text-white p-1 bg-white/5 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 max-w-lg mx-auto min-h-screen"
      >
        <Outlet />
      </motion.div>
    </div>
  );
}
