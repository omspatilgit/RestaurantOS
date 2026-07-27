import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

type OrderStatus = 'pending' | 'kitchen' | 'served' | 'cancelled';

export interface RealtimeOrder {
  id: string;
  table_number: number;
  items: { name: string; qty: number; price: number }[];
  total_amount: number;
  status: OrderStatus;
  customer_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface UseRealtimeOrdersOptions {
  onInsert?: (order: RealtimeOrder) => void;
  onUpdate?: (order: RealtimeOrder) => void;
  onDelete?: (order: Partial<RealtimeOrder>) => void;
  onError?: (error: Error) => void;
}

export function useRealtimeOrders({
  onInsert,
  onUpdate,
  onDelete,
  onError,
}: UseRealtimeOrdersOptions) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [connected, setConnected] = useState(false);

  const onInsertRef = useRef(onInsert);
  const onUpdateRef = useRef(onUpdate);
  const onDeleteRef = useRef(onDelete);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onInsertRef.current = onInsert;
    onUpdateRef.current = onUpdate;
    onDeleteRef.current = onDelete;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime-global')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          onInsertRef.current?.(payload.new as RealtimeOrder);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          onUpdateRef.current?.(payload.new as RealtimeOrder);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'orders' },
        (payload) => {
          onDeleteRef.current?.(payload.old as Partial<RealtimeOrder>);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true);
        } else if (status === 'CHANNEL_ERROR') {
          setConnected(false);
          onErrorRef.current?.(new Error('Orders realtime channel error'));
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  return { connected };
}

export function useRealtimeOrderStatus(
  orderId: string | null,
  onStatusChange?: (status: OrderStatus) => void
) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const onStatusChangeRef = useRef(onStatusChange);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  });

  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const updated = payload.new as RealtimeOrder;
          onStatusChangeRef.current?.(updated.status);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true);
        } else if (status === 'CHANNEL_ERROR') {
          setConnected(false);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [orderId]);

  return { connected };
}
