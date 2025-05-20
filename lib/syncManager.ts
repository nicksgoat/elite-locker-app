/**
 * Elite Locker - Sync Manager
 *
 * This file provides utilities for managing offline data synchronization.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { detectConflict, getUnresolvedConflicts, resolveConflict } from './conflictResolution';
import {
    SYNC_PREFIX,
    SyncOperation,
    SyncOperationType
} from './syncTypes';

// Import API functions dynamically to avoid circular dependency
let apiModule: any = null;
const getApiModule = () => {
  if (!apiModule) {
    apiModule = require('./api');
  }
  return {
    insertData: apiModule.insertData,
    updateData: apiModule.updateData,
    deleteData: apiModule.deleteData
  };
};

// Import connectivity hook dynamically to avoid circular dependency
let useConnectivity: any = null;
const getConnectivityHook = () => {
  if (!useConnectivity) {
    // Dynamically import to avoid circular dependency
    useConnectivity = require('@/contexts/ConnectivityContext').useConnectivity;
  }
  return useConnectivity;
};

/**
 * Queue a create operation for later synchronization
 * @param table The table to insert into
 * @param data The data to insert
 * @returns The operation ID
 */
export async function queueCreateOperation(
  table: string,
  data: any
): Promise<string> {
  const operationId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const operation: SyncOperation = {
    id: operationId,
    type: SyncOperationType.CREATE,
    table,
    data,
    timestamp: Date.now(),
  };

  await AsyncStorage.setItem(
    `${SYNC_PREFIX}${operationId}`,
    JSON.stringify(operation)
  );

  return operationId;
}

/**
 * Queue an update operation for later synchronization
 * @param table The table to update
 * @param id The ID of the record to update
 * @param data The data to update
 * @returns The operation ID
 */
export async function queueUpdateOperation(
  table: string,
  id: string,
  data: any
): Promise<string> {
  const operationId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const operation: SyncOperation = {
    id: operationId,
    type: SyncOperationType.UPDATE,
    table,
    data: { id, ...data },
    timestamp: Date.now(),
  };

  await AsyncStorage.setItem(
    `${SYNC_PREFIX}${operationId}`,
    JSON.stringify(operation)
  );

  return operationId;
}

/**
 * Queue a delete operation for later synchronization
 * @param table The table to delete from
 * @param id The ID of the record to delete
 * @returns The operation ID
 */
export async function queueDeleteOperation(
  table: string,
  id: string
): Promise<string> {
  const operationId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const operation: SyncOperation = {
    id: operationId,
    type: SyncOperationType.DELETE,
    table,
    data: { id },
    timestamp: Date.now(),
  };

  await AsyncStorage.setItem(
    `${SYNC_PREFIX}${operationId}`,
    JSON.stringify(operation)
  );

  return operationId;
}

/**
 * Get all pending sync operations
 * @returns An array of pending sync operations
 */
export async function getPendingSyncOperations(): Promise<SyncOperation[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const syncKeys = keys.filter(key => key.startsWith(SYNC_PREFIX));

    if (syncKeys.length === 0) {
      return [];
    }

    const operations: SyncOperation[] = [];
    const keyValuePairs = await AsyncStorage.multiGet(syncKeys);

    for (const [key, value] of keyValuePairs) {
      if (value) {
        const operation: SyncOperation = JSON.parse(value);
        operations.push(operation);
      }
    }

    // Sort operations by timestamp (oldest first)
    return operations.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error('Error getting pending sync operations:', error);
    return [];
  }
}

/**
 * Remove a sync operation from the queue
 * @param operationId The ID of the operation to remove
 */
export async function removeSyncOperation(operationId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${SYNC_PREFIX}${operationId}`);
  } catch (error) {
    console.error(`Error removing sync operation (${operationId}):`, error);
  }
}


/**
 * Process all pending sync operations
 * @param options Options for processing operations
 * @returns The number of successfully processed operations and conflicts
 */
export async function processPendingSyncOperations(
  options: ProcessSyncOptions = {}
): Promise<SyncResult> {
  const { onProgress, resolveConflicts = true } = options;
  const operations = await getPendingSyncOperations();

  if (operations.length === 0) {
    return { success: 0, conflicts: 0 };
  }

  let successCount = 0;
  let conflictCount = 0;

  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i];

    // Skip invalid operations
    if (!operation || !operation.type || !operation.table) {
      console.error(`Invalid operation: ${JSON.stringify(operation)}`);
      continue;
    }

    // Call progress callback if provided
    if (onProgress) {
      onProgress(i, operations.length);
    }

    try {
      let success = false;
      let hasConflict = false;

      // Check for conflicts for update operations
      if (operation.type === SyncOperationType.UPDATE && operation.data && operation.data.id) {
        const { id, ...updateData } = operation.data;
        hasConflict = await detectConflict(operation.table, id, updateData);

        if (hasConflict) {
          conflictCount++;

          // If we're resolving conflicts automatically, do it now
          if (resolveConflicts) {
            // The conflict ID is stored in the conflict resolution utility
            // We'll resolve all conflicts at the end
            console.log(`Conflict detected for ${operation.table}/${id}`);
          }

          // Skip this operation for now
          continue;
        }
      }

      // Process the operation if there's no conflict
      if (!hasConflict) {
        switch (operation.type) {
          case SyncOperationType.CREATE:
            const { insertData } = getApiModule();
            // Add null check for operation.data
            if (operation.data) {
              const createResult = await insertData(operation.table, operation.data);
              success = createResult !== null;
            } else {
              console.error(`Invalid create operation data: ${JSON.stringify(operation)}`);
              success = false;
            }
            break;

          case SyncOperationType.UPDATE:
            const { updateData } = getApiModule();
            // Add null check for operation.data
            if (operation.data && operation.data.id) {
              const { id, ...updateDataObj } = operation.data;
              const updateResult = await updateData(operation.table, id, updateDataObj);
              success = updateResult !== null;
            } else {
              console.error(`Invalid update operation data: ${JSON.stringify(operation)}`);
              success = false;
            }
            break;

          case SyncOperationType.DELETE:
            const { deleteData } = getApiModule();
            // Add null check for operation.data
            if (operation.data && operation.data.id) {
              const deleteResult = await deleteData(operation.table, operation.data.id);
              success = deleteResult && deleteResult.success;
            } else {
              console.error(`Invalid delete operation data: ${JSON.stringify(operation)}`);
              success = false;
            }
            break;
        }

        if (success) {
          await removeSyncOperation(operation.id);
          successCount++;
        }
      }
    } catch (error) {
      console.error(`Error processing sync operation (${operation.id}):`, error);
    }
  }

  // Call progress callback with final state
  if (onProgress) {
    onProgress(operations.length, operations.length);
  }

  return { success: successCount, conflicts: conflictCount };
}

/**
 * Hook to use the sync manager
 * @returns Functions to interact with the sync manager
 */
export function useSyncManager() {
  // Get the connectivity hook dynamically to avoid circular dependency
  const useConnectivityHook = getConnectivityHook();
  const { isConnected, isSupabaseConnected } = useConnectivityHook();

  const [syncProgress, setSyncProgress] = useState<{ processed: number; total: number }>({ processed: 0, total: 0 });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [conflicts, setConflicts] = useState<number>(0);

  // Get the count of pending operations
  const getPendingCount = async () => {
    const operations = await getPendingSyncOperations();
    return operations.length;
  };

  // Get the count of unresolved conflicts
  const getConflictCount = async () => {
    const unresolvedConflicts = await getUnresolvedConflicts();
    return unresolvedConflicts.length;
  };

  // Sync data with progress tracking
  const syncData = async (options: { resolveConflicts?: boolean } = {}) => {
    if (!isConnected || !isSupabaseConnected) {
      return { success: 0, conflicts: 0 };
    }

    setIsSyncing(true);
    setSyncProgress({ processed: 0, total: 0 });

    try {
      const result = await processPendingSyncOperations({
        onProgress: (processed, total) => {
          setSyncProgress({ processed, total });
        },
        resolveConflicts: options.resolveConflicts
      });

      setConflicts(result.conflicts);
      return result;
    } finally {
      setIsSyncing(false);
    }
  };

  // Resolve all conflicts
  const resolveAllConflicts = async () => {
    const unresolvedConflicts = await getUnresolvedConflicts();
    let resolvedCount = 0;

    for (const conflict of unresolvedConflicts) {
      const resolvedData = await resolveConflict(conflict.id);

      if (resolvedData) {
        resolvedCount++;
      }
    }

    return resolvedCount;
  };

  return {
    queueCreateOperation,
    queueUpdateOperation,
    queueDeleteOperation,
    getPendingSyncOperations,
    getPendingCount,
    getConflictCount,
    processPendingSyncOperations: syncData,
    resolveAllConflicts,
    syncProgress,
    isSyncing,
    conflicts,
  };
}
