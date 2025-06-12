/**
 * Elite Locker - Real-time Database Synchronization
 * 
 * This file provides comprehensive real-time synchronization between
 * the Supabase database and React Native UI components.
 */

import { supabase } from '../lib/supabase-client';
import { createLogger } from './secureLogger';
import AsyncStorage from '@react-native-async-storage/async-storage';

const logger = createLogger('RealtimeSync');

// Sync event types
export enum SyncEventType {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  SYNC = 'SYNC',
  CONFLICT = 'CONFLICT',
}

// Sync event interface
export interface SyncEvent {
  id: string;
  type: SyncEventType;
  table: string;
  record: any;
  oldRecord?: any;
  timestamp: number;
  userId?: string;
  source: 'local' | 'remote';
}

// Sync listener interface
export interface SyncListener {
  id: string;
  table: string;
  callback: (event: SyncEvent) => void;
  filter?: (record: any) => boolean;
}

// Sync conflict interface
export interface SyncConflict {
  id: string;
  table: string;
  localRecord: any;
  remoteRecord: any;
  timestamp: number;
  resolved: boolean;
  resolution?: 'local' | 'remote' | 'merge';
}

// Real-time sync manager class
export class RealtimeSyncManager {
  private listeners: Map<string, SyncListener> = new Map();
  private subscriptions: Map<string, any> = new Map();
  private conflicts: Map<string, SyncConflict> = new Map();
  private isInitialized: boolean = false;
  private syncQueue: SyncEvent[] = [];
  private isProcessingQueue: boolean = false;

  // Initialize real-time sync
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('RealtimeSyncManager already initialized');
      return;
    }

    try {
      logger.info('Initializing real-time sync manager');
      
      // Load existing conflicts from storage
      await this.loadConflicts();
      
      // Set up auth state listener
      this.setupAuthListener();
      
      this.isInitialized = true;
      logger.info('Real-time sync manager initialized successfully');
      
    } catch (error) {
      logger.error('Failed to initialize real-time sync manager', { error: error.message });
      throw error;
    }
  }

  // Subscribe to table changes
  subscribeToTable(
    table: string, 
    callback: (event: SyncEvent) => void,
    filter?: (record: any) => boolean
  ): string {
    const listenerId = `${table}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const listener: SyncListener = {
      id: listenerId,
      table,
      callback,
      filter
    };
    
    this.listeners.set(listenerId, listener);
    
    // Set up Supabase real-time subscription if not exists
    if (!this.subscriptions.has(table)) {
      this.setupTableSubscription(table);
    }
    
    logger.info(`Subscribed to table ${table}`, { listenerId });
    return listenerId;
  }

  // Unsubscribe from table changes
  unsubscribe(listenerId: string): void {
    const listener = this.listeners.get(listenerId);
    if (!listener) {
      logger.warn(`Listener ${listenerId} not found`);
      return;
    }

    this.listeners.delete(listenerId);
    
    // Check if any other listeners exist for this table
    const hasOtherListeners = Array.from(this.listeners.values())
      .some(l => l.table === listener.table);
    
    if (!hasOtherListeners) {
      this.removeTableSubscription(listener.table);
    }
    
    logger.info(`Unsubscribed from table ${listener.table}`, { listenerId });
  }

  // Emit sync event to local listeners
  emitSyncEvent(event: SyncEvent): void {
    const tableListeners = Array.from(this.listeners.values())
      .filter(listener => listener.table === event.table);
    
    tableListeners.forEach(listener => {
      try {
        // Apply filter if exists
        if (listener.filter && !listener.filter(event.record)) {
          return;
        }
        
        listener.callback(event);
      } catch (error) {
        logger.error(`Error in sync listener ${listener.id}`, { error: error.message });
      }
    });
    
    // Add to sync queue for processing
    this.syncQueue.push(event);
    this.processQueue();
  }

  // Handle optimistic updates
  async optimisticUpdate(
    table: string,
    record: any,
    operation: 'insert' | 'update' | 'delete'
  ): Promise<string> {
    const eventId = `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const event: SyncEvent = {
      id: eventId,
      type: operation === 'insert' ? SyncEventType.INSERT :
            operation === 'update' ? SyncEventType.UPDATE :
            SyncEventType.DELETE,
      table,
      record,
      timestamp: Date.now(),
      source: 'local'
    };
    
    // Emit immediately for optimistic UI update
    this.emitSyncEvent(event);
    
    logger.info(`Optimistic ${operation} for table ${table}`, { eventId, recordId: record.id });
    return eventId;
  }

  // Resolve sync conflicts
  async resolveConflict(
    conflictId: string, 
    resolution: 'local' | 'remote' | 'merge',
    mergedData?: any
  ): Promise<void> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      logger.warn(`Conflict ${conflictId} not found`);
      return;
    }

    try {
      let resolvedRecord: any;
      
      switch (resolution) {
        case 'local':
          resolvedRecord = conflict.localRecord;
          break;
        case 'remote':
          resolvedRecord = conflict.remoteRecord;
          break;
        case 'merge':
          resolvedRecord = mergedData || { ...conflict.remoteRecord, ...conflict.localRecord };
          break;
      }
      
      // Update the database with resolved record
      const { error } = await supabase
        .from(conflict.table)
        .update(resolvedRecord)
        .eq('id', resolvedRecord.id);
      
      if (error) {
        throw error;
      }
      
      // Mark conflict as resolved
      conflict.resolved = true;
      conflict.resolution = resolution;
      this.conflicts.set(conflictId, conflict);
      
      // Save conflicts to storage
      await this.saveConflicts();
      
      // Emit sync event
      this.emitSyncEvent({
        id: `resolve_${conflictId}`,
        type: SyncEventType.UPDATE,
        table: conflict.table,
        record: resolvedRecord,
        timestamp: Date.now(),
        source: 'local'
      });
      
      logger.info(`Conflict ${conflictId} resolved with ${resolution}`, { 
        table: conflict.table,
        recordId: resolvedRecord.id 
      });
      
    } catch (error) {
      logger.error(`Failed to resolve conflict ${conflictId}`, { error: error.message });
      throw error;
    }
  }

  // Get unresolved conflicts
  getUnresolvedConflicts(): SyncConflict[] {
    return Array.from(this.conflicts.values()).filter(conflict => !conflict.resolved);
  }

  // Setup table subscription
  private setupTableSubscription(table: string): void {
    try {
      const subscription = supabase
        .channel(`${table}_changes`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: table 
          },
          (payload) => this.handleDatabaseChange(table, payload)
        )
        .subscribe();
      
      this.subscriptions.set(table, subscription);
      logger.info(`Set up real-time subscription for table ${table}`);
      
    } catch (error) {
      logger.error(`Failed to set up subscription for table ${table}`, { error: error.message });
    }
  }

  // Remove table subscription
  private removeTableSubscription(table: string): void {
    const subscription = this.subscriptions.get(table);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(table);
      logger.info(`Removed real-time subscription for table ${table}`);
    }
  }

  // Handle database changes from Supabase
  private handleDatabaseChange(table: string, payload: any): void {
    try {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      const event: SyncEvent = {
        id: `db_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: eventType === 'INSERT' ? SyncEventType.INSERT :
              eventType === 'UPDATE' ? SyncEventType.UPDATE :
              SyncEventType.DELETE,
        table,
        record: newRecord || oldRecord,
        oldRecord,
        timestamp: Date.now(),
        source: 'remote'
      };
      
      // Check for conflicts with local changes
      this.checkForConflicts(event);
      
      // Emit sync event
      this.emitSyncEvent(event);
      
      logger.debug(`Database change received for table ${table}`, { 
        eventType, 
        recordId: (newRecord || oldRecord)?.id 
      });
      
    } catch (error) {
      logger.error(`Error handling database change for table ${table}`, { error: error.message });
    }
  }

  // Check for sync conflicts
  private checkForConflicts(remoteEvent: SyncEvent): void {
    // Look for recent local changes that might conflict
    const recentLocalEvents = this.syncQueue
      .filter(event => 
        event.source === 'local' &&
        event.table === remoteEvent.table &&
        event.record?.id === remoteEvent.record?.id &&
        (Date.now() - event.timestamp) < 60000 // Within last minute
      );
    
    if (recentLocalEvents.length > 0) {
      const localEvent = recentLocalEvents[recentLocalEvents.length - 1];
      
      const conflictId = `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const conflict: SyncConflict = {
        id: conflictId,
        table: remoteEvent.table,
        localRecord: localEvent.record,
        remoteRecord: remoteEvent.record,
        timestamp: Date.now(),
        resolved: false
      };
      
      this.conflicts.set(conflictId, conflict);
      this.saveConflicts();
      
      logger.warn(`Sync conflict detected for table ${remoteEvent.table}`, { 
        conflictId,
        recordId: remoteEvent.record?.id 
      });
    }
  }

  // Setup auth state listener
  private setupAuthListener(): void {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        logger.info('User signed in, refreshing subscriptions');
        this.refreshAllSubscriptions();
      } else if (event === 'SIGNED_OUT') {
        logger.info('User signed out, clearing subscriptions');
        this.clearAllSubscriptions();
      }
    });
  }

  // Refresh all subscriptions
  private refreshAllSubscriptions(): void {
    const tables = Array.from(this.subscriptions.keys());
    tables.forEach(table => {
      this.removeTableSubscription(table);
      this.setupTableSubscription(table);
    });
  }

  // Clear all subscriptions
  private clearAllSubscriptions(): void {
    this.subscriptions.forEach((subscription, table) => {
      this.removeTableSubscription(table);
    });
  }

  // Process sync queue
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.syncQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    
    try {
      // Process events in batches
      const batchSize = 10;
      const batch = this.syncQueue.splice(0, batchSize);
      
      for (const event of batch) {
        await this.processSyncEvent(event);
      }
      
    } catch (error) {
      logger.error('Error processing sync queue', { error: error.message });
    } finally {
      this.isProcessingQueue = false;
      
      // Process remaining events
      if (this.syncQueue.length > 0) {
        setTimeout(() => this.processQueue(), 100);
      }
    }
  }

  // Process individual sync event
  private async processSyncEvent(event: SyncEvent): Promise<void> {
    try {
      // Store event for conflict detection and analytics
      await AsyncStorage.setItem(
        `sync_event_${event.id}`,
        JSON.stringify(event)
      );
      
      // Clean up old events (keep last 100)
      this.cleanupOldEvents();
      
    } catch (error) {
      logger.error(`Error processing sync event ${event.id}`, { error: error.message });
    }
  }

  // Load conflicts from storage
  private async loadConflicts(): Promise<void> {
    try {
      const conflictsJson = await AsyncStorage.getItem('sync_conflicts');
      if (conflictsJson) {
        const conflicts = JSON.parse(conflictsJson);
        this.conflicts = new Map(Object.entries(conflicts));
      }
    } catch (error) {
      logger.error('Error loading conflicts from storage', { error: error.message });
    }
  }

  // Save conflicts to storage
  private async saveConflicts(): Promise<void> {
    try {
      const conflictsObj = Object.fromEntries(this.conflicts);
      await AsyncStorage.setItem('sync_conflicts', JSON.stringify(conflictsObj));
    } catch (error) {
      logger.error('Error saving conflicts to storage', { error: error.message });
    }
  }

  // Cleanup old sync events
  private async cleanupOldEvents(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const syncEventKeys = keys.filter(key => key.startsWith('sync_event_'));
      
      if (syncEventKeys.length > 100) {
        // Remove oldest events
        const keysToRemove = syncEventKeys.slice(0, syncEventKeys.length - 100);
        await AsyncStorage.multiRemove(keysToRemove);
      }
    } catch (error) {
      logger.error('Error cleaning up old sync events', { error: error.message });
    }
  }

  // Get sync statistics
  getStatistics(): any {
    return {
      listeners: this.listeners.size,
      subscriptions: this.subscriptions.size,
      conflicts: this.conflicts.size,
      unresolvedConflicts: this.getUnresolvedConflicts().length,
      queueSize: this.syncQueue.length,
      isInitialized: this.isInitialized,
      isProcessingQueue: this.isProcessingQueue
    };
  }

  // Cleanup resources
  async cleanup(): Promise<void> {
    logger.info('Cleaning up real-time sync manager');
    
    // Clear all subscriptions
    this.clearAllSubscriptions();
    
    // Clear listeners
    this.listeners.clear();
    
    // Save any pending conflicts
    await this.saveConflicts();
    
    this.isInitialized = false;
    logger.info('Real-time sync manager cleaned up');
  }
}

// Create singleton instance
export const realtimeSyncManager = new RealtimeSyncManager();

// Utility functions
export const initializeRealtimeSync = async (): Promise<void> => {
  await realtimeSyncManager.initialize();
};

export const subscribeToTableChanges = (
  table: string,
  callback: (event: SyncEvent) => void,
  filter?: (record: any) => boolean
): string => {
  return realtimeSyncManager.subscribeToTable(table, callback, filter);
};

export const unsubscribeFromChanges = (listenerId: string): void => {
  realtimeSyncManager.unsubscribe(listenerId);
};

export const performOptimisticUpdate = async (
  table: string,
  record: any,
  operation: 'insert' | 'update' | 'delete'
): Promise<string> => {
  return await realtimeSyncManager.optimisticUpdate(table, record, operation);
};

export const resolveSyncConflict = async (
  conflictId: string,
  resolution: 'local' | 'remote' | 'merge',
  mergedData?: any
): Promise<void> => {
  await realtimeSyncManager.resolveConflict(conflictId, resolution, mergedData);
};

export const getSyncStatistics = (): any => {
  return realtimeSyncManager.getStatistics();
};
