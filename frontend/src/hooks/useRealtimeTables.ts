import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

export type TableStatus = 'available' | 'occupied' | 'cleaning' | 'reserved';

export interface RestaurantTable {
  id: string;
  table_number: number;
  capacity: number;
  status: TableStatus;
  current_order_id?: string | null;
  created_at: string;
}

interface UseRealtimeTablesOptions {
  onInsert?: (table: RestaurantTable) => void;
  onUpdate?: (table: RestaurantTable) => void;
  onDelete?: (table: Partial<RestaurantTable>) => void;
}

export function useRealtimeTables({
  onInsert,
  onUpdate,
  onDelete,
}: UseRealtimeTablesOptions = {}) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [connected, setConnected] = useState(false);

  const onInsertRef = useRef(onInsert);
  const onUpdateRef = useRef(onUpdate);
  const onDeleteRef = useRef(onDelete);

  useEffect(() => {
    onInsertRef.current = onInsert;
    onUpdateRef.current = onUpdate;
    onDeleteRef.current = onDelete;
  });

  useEffect(() => {
    const channel = supabase
      .channel('tables-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'restaurant_tables' },
        (payload) => {
          onInsertRef.current?.(payload.new as RestaurantTable);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'restaurant_tables' },
        (payload) => {
          onUpdateRef.current?.(payload.new as RestaurantTable);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'restaurant_tables' },
        (payload) => {
          onDeleteRef.current?.(payload.old as Partial<RestaurantTable>);
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return { connected };
}
