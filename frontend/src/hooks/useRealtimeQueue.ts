import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface RealtimeQueueEntry {
  id: string;
  party_name: string;
  party_size: number;
  phone?: string;
  status: 'waiting' | 'seated' | 'left';
  estimated_wait_min?: number;
  created_at: string;
}

interface UseRealtimeQueueOptions {
  onInsert?: (entry: RealtimeQueueEntry) => void;
  onUpdate?: (entry: RealtimeQueueEntry) => void;
  onDelete?: (entry: Partial<RealtimeQueueEntry>) => void;
  onError?: (error: Error) => void;
}

export function useRealtimeQueue({
  onInsert,
  onUpdate,
  onDelete,
  onError,
}: UseRealtimeQueueOptions) {
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
      .channel('queue-realtime-global')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'queue' },
        (payload) => {
          onInsertRef.current?.(payload.new as RealtimeQueueEntry);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'queue' },
        (payload) => {
          onUpdateRef.current?.(payload.new as RealtimeQueueEntry);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'queue' },
        (payload) => {
          onDeleteRef.current?.(payload.old as Partial<RealtimeQueueEntry>);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true);
        } else if (status === 'CHANNEL_ERROR') {
          setConnected(false);
          onErrorRef.current?.(new Error('Queue realtime channel error'));
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
