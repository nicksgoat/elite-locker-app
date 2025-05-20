/**
 * Elite Locker - Sync Types
 * 
 * This file contains types for the sync manager to avoid circular dependencies.
 */

// Types of sync operations
export enum SyncOperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

// Structure of a sync operation
export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  table: string;
  data: any;
  timestamp: number;
}

// Prefix for all pending sync operations
export const SYNC_PREFIX = 'elite_locker_sync_';

// Result of processing sync operations
export interface SyncResult {
  success: number;
  conflicts: number;
}

// Options for processing sync operations
export interface ProcessSyncOptions {
  onProgress?: (processed: number, total: number) => void;
  resolveConflicts?: boolean;
}
