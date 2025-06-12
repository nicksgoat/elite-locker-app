/**
 * Elite Locker - Real-time Sync Hook
 * 
 * This hook provides React components with real-time database synchronization.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { 
  subscribeToTableChanges, 
  unsubscribeFromChanges, 
  performOptimisticUpdate,
  SyncEvent,
  SyncEventType 
} from '../utils/realtimeSync';
import { createLogger } from '../utils/secureLogger';

const logger = createLogger('useRealtimeSync');

// Hook options interface
export interface RealtimeSyncOptions {
  table: string;
  filter?: (record: any) => boolean;
  optimisticUpdates?: boolean;
  conflictResolution?: 'local' | 'remote' | 'manual';
  onConflict?: (localRecord: any, remoteRecord: any) => any;
  onError?: (error: Error) => void;
}

// Sync state interface
export interface SyncState<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  lastSync: number | null;
  hasConflicts: boolean;
  pendingOperations: number;
}

// Hook return interface
export interface RealtimeSyncReturn<T> {
  // State
  data: T[];
  isLoading: boolean;
  error: Error | null;
  lastSync: number | null;
  hasConflicts: boolean;
  pendingOperations: number;
  
  // Actions
  insert: (record: Omit<T, 'id'>) => Promise<T>;
  update: (id: string, updates: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
  
  // Sync control
  enableOptimisticUpdates: () => void;
  disableOptimisticUpdates: () => void;
  forceSync: () => Promise<void>;
}

/**
 * Real-time sync hook for database tables
 * @param options Sync configuration options
 * @returns Sync state and actions
 */
export function useRealtimeSync<T extends { id: string }>(
  options: RealtimeSyncOptions
): RealtimeSyncReturn<T> {
  const {
    table,
    filter,
    optimisticUpdates = true,
    conflictResolution = 'manual',
    onConflict,
    onError
  } = options;

  // State
  const [state, setState] = useState<SyncState<T>>({
    data: [],
    isLoading: true,
    error: null,
    lastSync: null,
    hasConflicts: false,
    pendingOperations: 0
  });

  // Refs
  const subscriptionRef = useRef<string | null>(null);
  const optimisticUpdatesEnabled = useRef(optimisticUpdates);
  const pendingOperationsRef = useRef<Map<string, any>>(new Map());

  // Handle sync events
  const handleSyncEvent = useCallback((event: SyncEvent) => {
    logger.debug(`Sync event received for table ${table}`, { 
      type: event.type, 
      recordId: event.record?.id 
    });

    setState(prevState => {
      const newData = [...prevState.data];
      let hasChanges = false;

      switch (event.type) {
        case SyncEventType.INSERT:
          // Check if record already exists (avoid duplicates)
          if (!newData.find(item => item.id === event.record.id)) {
            newData.push(event.record as T);
            hasChanges = true;
          }
          break;

        case SyncEventType.UPDATE:
          const updateIndex = newData.findIndex(item => item.id === event.record.id);
          if (updateIndex !== -1) {
            // Check for conflicts if this was a local optimistic update
            const pendingOp = pendingOperationsRef.current.get(event.record.id);
            if (pendingOp && event.source === 'remote') {
              // Conflict detected
              if (conflictResolution === 'manual' && onConflict) {
                const resolvedRecord = onConflict(pendingOp, event.record);
                newData[updateIndex] = resolvedRecord;
              } else if (conflictResolution === 'remote') {
                newData[updateIndex] = event.record as T;
              }
              // For 'local', keep the current record
              
              return {
                ...prevState,
                hasConflicts: conflictResolution === 'manual',
                lastSync: Date.now()
              };
            } else {
              newData[updateIndex] = event.record as T;
              hasChanges = true;
            }
          }
          break;

        case SyncEventType.DELETE:
          const deleteIndex = newData.findIndex(item => item.id === event.record.id);
          if (deleteIndex !== -1) {
            newData.splice(deleteIndex, 1);
            hasChanges = true;
          }
          break;
      }

      // Clear pending operation if it exists
      if (event.record?.id) {
        pendingOperationsRef.current.delete(event.record.id);
      }

      return hasChanges ? {
        ...prevState,
        data: newData,
        lastSync: Date.now(),
        pendingOperations: pendingOperationsRef.current.size,
        error: null
      } : {
        ...prevState,
        lastSync: Date.now(),
        pendingOperations: pendingOperationsRef.current.size
      };
    });
  }, [table, conflictResolution, onConflict]);

  // Initialize subscription
  useEffect(() => {
    if (!table) return;

    logger.info(`Setting up real-time sync for table ${table}`);

    try {
      subscriptionRef.current = subscribeToTableChanges(
        table,
        handleSyncEvent,
        filter
      );

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      logger.error(`Failed to set up sync for table ${table}`, { error: error.message });
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error as Error 
      }));
      
      if (onError) {
        onError(error as Error);
      }
    }

    return () => {
      if (subscriptionRef.current) {
        unsubscribeFromChanges(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [table, handleSyncEvent, filter, onError]);

  // Insert record
  const insert = useCallback(async (record: Omit<T, 'id'>): Promise<T> => {
    const id = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newRecord = { ...record, id } as T;

    try {
      if (optimisticUpdatesEnabled.current) {
        // Optimistic update
        setState(prev => ({
          ...prev,
          data: [...prev.data, newRecord],
          pendingOperations: prev.pendingOperations + 1
        }));

        pendingOperationsRef.current.set(id, newRecord);
        await performOptimisticUpdate(table, newRecord, 'insert');
      }

      // TODO: Implement actual database insert
      // const { data, error } = await supabase.from(table).insert(record).select().single();
      // if (error) throw error;
      // return data as T;

      return newRecord;
    } catch (error) {
      logger.error(`Failed to insert record in table ${table}`, { error: error.message });
      
      // Revert optimistic update
      if (optimisticUpdatesEnabled.current) {
        setState(prev => ({
          ...prev,
          data: prev.data.filter(item => item.id !== id),
          pendingOperations: Math.max(0, prev.pendingOperations - 1),
          error: error as Error
        }));
        
        pendingOperationsRef.current.delete(id);
      }
      
      throw error;
    }
  }, [table]);

  // Update record
  const update = useCallback(async (id: string, updates: Partial<T>): Promise<T> => {
    const existingRecord = state.data.find(item => item.id === id);
    if (!existingRecord) {
      throw new Error(`Record with id ${id} not found`);
    }

    const updatedRecord = { ...existingRecord, ...updates };

    try {
      if (optimisticUpdatesEnabled.current) {
        // Optimistic update
        setState(prev => ({
          ...prev,
          data: prev.data.map(item => item.id === id ? updatedRecord : item),
          pendingOperations: prev.pendingOperations + 1
        }));

        pendingOperationsRef.current.set(id, updatedRecord);
        await performOptimisticUpdate(table, updatedRecord, 'update');
      }

      // TODO: Implement actual database update
      // const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single();
      // if (error) throw error;
      // return data as T;

      return updatedRecord;
    } catch (error) {
      logger.error(`Failed to update record ${id} in table ${table}`, { error: error.message });
      
      // Revert optimistic update
      if (optimisticUpdatesEnabled.current) {
        setState(prev => ({
          ...prev,
          data: prev.data.map(item => item.id === id ? existingRecord : item),
          pendingOperations: Math.max(0, prev.pendingOperations - 1),
          error: error as Error
        }));
        
        pendingOperationsRef.current.delete(id);
      }
      
      throw error;
    }
  }, [table, state.data]);

  // Remove record
  const remove = useCallback(async (id: string): Promise<void> => {
    const existingRecord = state.data.find(item => item.id === id);
    if (!existingRecord) {
      throw new Error(`Record with id ${id} not found`);
    }

    try {
      if (optimisticUpdatesEnabled.current) {
        // Optimistic update
        setState(prev => ({
          ...prev,
          data: prev.data.filter(item => item.id !== id),
          pendingOperations: prev.pendingOperations + 1
        }));

        pendingOperationsRef.current.set(id, existingRecord);
        await performOptimisticUpdate(table, { id }, 'delete');
      }

      // TODO: Implement actual database delete
      // const { error } = await supabase.from(table).delete().eq('id', id);
      // if (error) throw error;

    } catch (error) {
      logger.error(`Failed to delete record ${id} from table ${table}`, { error: error.message });
      
      // Revert optimistic update
      if (optimisticUpdatesEnabled.current) {
        setState(prev => ({
          ...prev,
          data: [...prev.data, existingRecord],
          pendingOperations: Math.max(0, prev.pendingOperations - 1),
          error: error as Error
        }));
        
        pendingOperationsRef.current.delete(id);
      }
      
      throw error;
    }
  }, [table, state.data]);

  // Refresh data
  const refresh = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // TODO: Implement actual data fetching
      // const { data, error } = await supabase.from(table).select('*');
      // if (error) throw error;
      
      setState(prev => ({
        ...prev,
        // data: data as T[],
        isLoading: false,
        lastSync: Date.now(),
        error: null
      }));
    } catch (error) {
      logger.error(`Failed to refresh data for table ${table}`, { error: error.message });
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error
      }));
      
      if (onError) {
        onError(error as Error);
      }
    }
  }, [table, onError]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Enable optimistic updates
  const enableOptimisticUpdates = useCallback(() => {
    optimisticUpdatesEnabled.current = true;
    logger.info(`Optimistic updates enabled for table ${table}`);
  }, [table]);

  // Disable optimistic updates
  const disableOptimisticUpdates = useCallback(() => {
    optimisticUpdatesEnabled.current = false;
    logger.info(`Optimistic updates disabled for table ${table}`);
  }, [table]);

  // Force sync
  const forceSync = useCallback(async (): Promise<void> => {
    logger.info(`Force sync triggered for table ${table}`);
    await refresh();
  }, [refresh, table]);

  return {
    // State
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    lastSync: state.lastSync,
    hasConflicts: state.hasConflicts,
    pendingOperations: state.pendingOperations,
    
    // Actions
    insert,
    update,
    remove,
    refresh,
    clearError,
    
    // Sync control
    enableOptimisticUpdates,
    disableOptimisticUpdates,
    forceSync
  };
}
