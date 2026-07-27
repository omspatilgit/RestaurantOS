import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar as CalendarIcon, Clock, Users, User, Phone, Mail, CheckCircle2, Loader2, IndianRupee } from 'lucide-react';
import { sendBookingConfirmation } from '../../lib/email';
import PreBookChatbot from '../../components/PreBookChatbot';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const TOKEN_CHARGE = 100;

export default function CustomerPreBook() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Form, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    party_size: 2,
  });
  const [bookingId, setBookingId] = useState('');

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email || !formData.date || !formData.time) return;
    setStep(2);
  };

  const handlePaymentAndConfirm = async () => {
    setLoading(true);
    try {
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const res = await fetch(`${API}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, token_charge: TOKEN_CHARGE }),
      });
      const { data } = await res.json();
      if (data?.id) {
        setBookingId(data.id);
        
        // Send email confirmation using EmailJS
        await sendBookingConfirmation({
          id: data.id,
          name: formData.name,
          email: formData.email,
          date: formData.date,
          time: formData.time,
          party_size: formData.party_size
        });

        setStep(3);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to process booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden flex flex-col">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-96 bg-brand-500/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 flex items-center mb-8 pt-4">
        <button 
          onClick={() => step === 1 ? navigate('/portal') : setStep(1)} 
          className="w-10 h-10 rounded-xl bg-surface-900 border border-surface-700 flex items-center justify-center cursor-pointer transition-all active:scale-95 hover:border-brand-400/50"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold">
          {step === 1 ? 'Pre-Book Table' : step === 2 ? 'Confirm & Pay' : 'Booking Confirmed'}
        </h1>
        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 relative z-10 max-w-md w-full mx-auto">
        {step === 1 && (
          <motion.form 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} 
            onSubmit={handleProceedToPayment}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-400 uppercase tracking-wider ml-1">Your Name</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500"><User className="w-5 h-5" /></div>
                <input
                  type="text" required
                  placeholder="Enter your full name"
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-14 bg-surface-900 border border-surface-700 rounded-2xl pl-12 pr-4 text-white focus:outline-none focus:border-brand-400 focus:glow-lime transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-400 uppercase tracking-wider ml-1">Phone Number</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500"><Phone className="w-5 h-5" /></div>
                <input
                  type="tel" required
                  placeholder="10-digit mobile number"
                  value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-14 bg-surface-900 border border-surface-700 rounded-2xl pl-12 pr-4 text-white focus:outline-none focus:border-brand-400 focus:glow-lime transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-400 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500"><Mail className="w-5 h-5" /></div>
                <input
                  type="email" required
                  placeholder="your@email.com"
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-14 bg-surface-900 border border-surface-700 rounded-2xl pl-12 pr-4 text-white focus:outline-none focus:border-brand-400 focus:glow-lime transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-surface-400 uppercase tracking-wider ml-1">Date</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500"><CalendarIcon className="w-4 h-4" /></div>
                  <input
                    type="date" required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full h-14 bg-surface-900 border border-surface-700 rounded-2xl pl-10 pr-3 text-sm text-white focus:outline-none focus:border-brand-400 focus:glow-lime transition-all [color-scheme:dark]"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-surface-400 uppercase tracking-wider ml-1">Time</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500"><Clock className="w-4 h-4" /></div>
                  <input
                    type="time" required
                    value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="w-full h-14 bg-surface-900 border border-surface-700 rounded-2xl pl-10 pr-3 text-sm text-white focus:outline-none focus:border-brand-400 focus:glow-lime transition-all [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pb-6">
              <label className="text-xs font-bold text-surface-400 uppercase tracking-wider ml-1">Party Size</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500"><Users className="w-5 h-5" /></div>
                <select
                  value={formData.party_size}
                  onChange={e => setFormData({ ...formData, party_size: Number(e.target.value) })}
                  className="w-full h-14 bg-surface-900 border border-surface-700 rounded-2xl pl-12 pr-4 text-white appearance-none focus:outline-none focus:border-brand-400 focus:glow-lime transition-all"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'People'}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-surface-500">▼</div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-14 rounded-2xl font-bold text-black bg-brand-400 hover:bg-brand-300 glow-lime transition-all active:scale-95 mt-4"
            >
              Continue to Payment
            </button>
          </motion.form>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="bg-surface-900 border border-surface-700/50 rounded-3xl p-6 glass">
              <h3 className="text-sm font-bold text-surface-400 mb-4 uppercase tracking-wider">Booking Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-surface-300">Name</span>
                  <span className="font-bold">{formData.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-surface-300">Date & Time</span>
                  <span className="font-bold">{formData.date} • {formData.time}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-surface-300">Party Size</span>
                  <span className="font-bold">{formData.party_size} People</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-surface-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-base font-bold text-white">Token Charge</span>
                  <span className="text-xl font-black text-brand-400 flex items-center">
                    <IndianRupee className="w-5 h-5" />{TOKEN_CHARGE}
                  </span>
                </div>
                <p className="text-[10px] text-surface-500">This amount will be deducted from your final food bill.</p>
              </div>
            </div>

            <button
              onClick={handlePaymentAndConfirm}
              disabled={loading}
              className="w-full h-14 rounded-2xl font-bold text-black bg-brand-400 hover:bg-brand-300 glow-lime transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing Payment...</>
              ) : (
                `Pay ₹${TOKEN_CHARGE} & Confirm Booking`
              )}
            </button>
            <p className="text-center text-xs text-surface-500">
              <span className="opacity-50">🔒 Secure Mock Payment</span>
            </p>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center pt-8">
            <div className="w-24 h-24 rounded-full bg-brand-400/10 border-2 border-brand-400 flex items-center justify-center mx-auto mb-6 glow-lime">
              <CheckCircle2 className="w-12 h-12 text-brand-400" />
            </div>
            <h2 className="text-3xl font-black mb-2 text-brand-400">Booking Confirmed!</h2>
            <p className="text-surface-300 mb-8 max-w-[280px] mx-auto text-sm">
              Your table for {formData.party_size} is reserved for {formData.date} at {formData.time}.
            </p>
            
            <div className="bg-surface-900 border border-surface-700 rounded-2xl p-4 mb-8 max-w-xs mx-auto">
              <p className="text-xs text-surface-400 uppercase tracking-wider mb-1">Booking ID</p>
              <p className="font-mono font-bold text-lg">{bookingId || 'BK-12345'}</p>
            </div>

            <button
              onClick={() => navigate('/portal')}
              className="w-full max-w-xs mx-auto h-12 rounded-xl font-bold text-white bg-surface-800 border border-surface-600 hover:border-brand-400 hover:text-brand-400 transition-all active:scale-95"
            >
              Return Home
            </button>
          </motion.div>
        )}
      </div>

      <PreBookChatbot />
    </div>
  );
}
