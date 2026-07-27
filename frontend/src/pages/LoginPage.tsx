import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, Lock, ChefHat, Eye, EyeOff, Sparkles, Shield, Zap } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, signInOrSignUp, demoSignIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signInOrSignUp(email, password);
    if (error) {
      setError(error);
    } else {
      navigate('/dashboard', { replace: true });
    }
    setLoading(false);
  };

  const handleDemoLogin = () => {
    setDemoLoading(true);
    setError(null);
    setEmail('owner@restaurant.com');
    setPassword('owner123456');
    demoSignIn();
    navigate('/dashboard', { replace: true });
    setDemoLoading(false);
  };

  const floatingOrbs = [
    { size: 300, x: -10, y: -10, color: 'rgba(249,115,22,0.08)' },
    { size: 200, x: 80, y: 70, color: 'rgba(88,166,255,0.06)' },
    { size: 250, x: 20, y: 80, color: 'rgba(57,211,83,0.05)' },
  ];

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating orbs */}
      {floatingOrbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 4 + i * 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(249,115,22,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(249,115,22,0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo card */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 glow-orange mb-4"
          >
            <ChefHat className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold font-display text-gradient-brand mb-2"
          >
            RestaurantOS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-surface-400 text-sm"
          >
            Owner Portal — Enterprise Restaurant Management
          </motion.p>
        </div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="glass rounded-3xl p-8 border border-surface-700/50"
        >
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-4 h-4 text-brand-400" />
            <span className="text-sm text-surface-400">Owner Access Portal</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span className="text-xs text-neon-green">Live Sync</span>
            </div>
          </div>

          {/* Quick Demo Button */}
          <motion.div className="mb-6">
            <Button
              id="demo-login-btn"
              type="button"
              variant="outline"
              size="lg"
              loading={demoLoading}
              onClick={handleDemoLogin}
              className="w-full border-brand-500/40 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 font-bold glow-orange"
              icon={<Zap className="w-4 h-4 text-brand-400" />}
            >
              ⚡ Quick Demo Owner Sign-In
            </Button>
            <p className="text-[11px] text-surface-500 text-center mt-1.5">
              Instant 1-click access (Auto registers / signs in demo account)
            </p>
          </motion.div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-700/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface-900/90 px-3 text-surface-500">Or sign in with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              id="login-email"
              label="Email Address"
              type="email"
              placeholder="owner@restaurant.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
              autoComplete="email"
            />

            <Input
              id="login-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password (min 6 characters)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="text-surface-400 hover:text-surface-200 transition-colors cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
              autoComplete="current-password"
            />

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-neon-red/10 border border-neon-red/30 rounded-xl px-4 py-3 text-sm text-neon-red"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              id="login-submit"
              type="submit"
              size="lg"
              loading={loading}
              className="w-full mt-1"
              icon={<Sparkles className="w-4 h-4" />}
            >
              Sign In / Sign Up
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-700/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface-900/90 px-3 text-surface-500">Or continue with</span>
              </div>
            </div>

            <Button
              id="google-login-btn"
              type="button"
              variant="secondary"
              size="lg"
              className="w-full border-surface-700 hover:bg-surface-800"
              onClick={async () => {
                const { supabase } = await import('../lib/supabase');
                await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/dashboard' } });
              }}
              icon={
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"/>
                </svg>
              }
            >
              Sign In with Google
            </Button>
          </form>

          <p className="text-xs text-surface-500 text-center mt-6">
            Protected by Supabase Auth · Auto Sign-Up Enabled
          </p>
        </motion.div>

        {/* Bottom tag */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-xs text-surface-600 mt-6"
        >
          RestaurantOS v2 · Built for VibeAthon 6.0 by Om
        </motion.p>
      </motion.div>
    </div>
  );
}
