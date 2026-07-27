import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Plus, MoreVertical, Wifi, Coffee, Users, Trash2, CalendarDays } from 'lucide-react';
import type { RestaurantTable, TableStatus } from '../../hooks/useRealtimeTables';
import { useRealtimeTables } from '../../hooks/useRealtimeTables';
import { cn } from '../../lib/utils';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface Booking {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  party_size: number;
  token_charge: number;
  status: string;
}

export default function TableManagement() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTableNo, setNewTableNo] = useState('');
  const [newCapacity, setNewCapacity] = useState('4');
  
  // Realtime hook
  const { connected } = useRealtimeTables({
    onInsert: (tbl) => setTables(prev => [...prev, tbl].sort((a,b) => a.table_number - b.table_number)),
    onUpdate: (tbl) => setTables(prev => prev.map(t => t.id === tbl.id ? tbl : t)),
    onDelete: (tbl) => setTables(prev => prev.filter(t => t.id !== tbl.id))
  });

  useEffect(() => {
    fetchTables();
    
    // Auto-refresh fallback for mock backend (when realtime fails)
    const interval = setInterval(() => {
      fetchTables(true); // silent fetch
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTables = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [tablesRes, bookingsRes] = await Promise.all([
        fetch(`${API}/api/tables`),
        fetch(`${API}/api/bookings`)
      ]);
      const tablesData = await tablesRes.json();
      const bookingsData = await bookingsRes.json();
      
      if (tablesData.success) setTables(tablesData.data);
      if (bookingsData.success) setBookings(bookingsData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNo) return;
    
    try {
      await fetch(`${API}/api/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table_number: newTableNo, capacity: newCapacity })
      });
      setShowAddModal(false);
      setNewTableNo('');
      setNewCapacity('4');
      // No need to fetch manually, Realtime / Fallback will update
      if (!connected) fetchTables();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: TableStatus) => {
    try {
      await fetch(`${API}/api/tables/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!connected) fetchTables();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    try {
      await fetch(`${API}/api/tables/${id}`, { method: 'DELETE' });
      if (!connected) fetchTables();
    } catch (e) {
      console.error(e);
    }
  };

  const statusColors = {
    available: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
    occupied: 'border-red-500/50 bg-red-500/10 text-red-400',
    cleaning: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
    reserved: 'border-blue-500/50 bg-blue-500/10 text-blue-400'
  };

  return (
    <div className="p-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-brand-400 flex items-center gap-3">
            <LayoutGrid className="w-8 h-8" />
            Table Management
          </h1>
          <p className="text-surface-400 mt-1 flex items-center gap-2">
            Real-time floor plan layout
            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1", connected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-surface-700/50 border-surface-600 text-surface-400')}>
              <Wifi className="w-3 h-3" />
              {connected ? 'Live Sync Active' : 'Connecting...'}
            </span>
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl font-bold flex items-center gap-2 bg-brand-400 text-black hover:bg-brand-300 transition-colors glow-lime cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Table
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20 text-brand-400">Loading tables...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {tables.map(table => (
              <motion.div
                key={table.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-surface-900 border border-surface-700/50 rounded-3xl p-5 relative overflow-hidden group hover:border-brand-400/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-surface-800 border border-surface-600 flex items-center justify-center">
                      <span className="text-xl font-black text-brand-400">{table.table_number}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-bold">Table {table.table_number}</h3>
                      <p className="text-xs text-surface-400 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {table.capacity} Seats
                      </p>
                    </div>
                  </div>
                  
                  <button onClick={() => handleDelete(table.id)} className="p-2 text-surface-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Status Indicator */}
                <div className="mb-4">
                  <div className={cn("px-3 py-1.5 rounded-lg border text-xs font-bold inline-flex items-center gap-1.5 uppercase tracking-wide", statusColors[table.status])}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {table.status}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-surface-700/50">
                  <button 
                    onClick={() => handleUpdateStatus(table.id, 'available')}
                    disabled={table.status === 'available'}
                    className="py-1.5 rounded-lg text-xs font-semibold border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer disabled:opacity-30"
                  >
                    Set Available
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(table.id, 'occupied')}
                    disabled={table.status === 'occupied'}
                    className="py-1.5 rounded-lg text-xs font-semibold border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-30"
                  >
                    Set Occupied
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(table.id, 'cleaning')}
                    disabled={table.status === 'cleaning'}
                    className="py-1.5 rounded-lg text-xs font-semibold border border-amber-500/20 text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer disabled:opacity-30 col-span-2"
                  >
                    Mark for Cleaning
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-surface-900 border border-brand-400/30 rounded-3xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-white mb-4">Add New Table</h2>
              <form onSubmit={handleAddTable}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-surface-400 mb-1">Table Number</label>
                    <input
                      type="number" required autoFocus
                      value={newTableNo} onChange={e => setNewTableNo(e.target.value)}
                      className="w-full bg-surface-800 border border-surface-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-400 focus:glow-lime transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-surface-400 mb-1">Capacity (Seats)</label>
                    <input
                      type="number" required
                      value={newCapacity} onChange={e => setNewCapacity(e.target.value)}
                      className="w-full bg-surface-800 border border-surface-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-400 focus:glow-lime transition-all"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button" onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-surface-300 hover:text-white hover:bg-surface-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-brand-400 text-black hover:bg-brand-300 glow-lime transition-colors cursor-pointer"
                  >
                    Save Table
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bookings Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-black text-white mb-6">Upcoming Pre-Bookings</h2>
        
        {bookings.length === 0 ? (
          <div className="bg-surface-900 border border-surface-700/50 rounded-3xl p-8 text-center glass">
            <CalendarDays className="w-12 h-12 text-surface-500 mx-auto mb-4" />
            <p className="text-surface-400 font-medium">No upcoming bookings yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-surface-900 border border-brand-400/30 rounded-3xl p-6 glass">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{booking.name}</h3>
                    <p className="text-sm text-surface-400">{booking.phone}</p>
                  </div>
                  <div className="bg-brand-400/10 border border-brand-400/30 rounded-xl px-3 py-1 text-xs font-bold text-brand-400">
                    {booking.party_size} People
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-surface-300 gap-2">
                    <CalendarDays className="w-4 h-4 text-surface-500" /> {booking.date}
                  </div>
                  <div className="flex items-center text-sm text-surface-300 gap-2">
                    <Coffee className="w-4 h-4 text-surface-500" /> {booking.time}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-surface-700 flex justify-between items-center">
                  <span className="text-xs text-surface-400 font-bold uppercase tracking-wider">Token Paid</span>
                  <span className="text-brand-400 font-black">₹{booking.token_charge}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
