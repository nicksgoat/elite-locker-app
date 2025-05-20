/**
 * Elite Locker - Conflict Resolution Utility
 * 
 * This file provides utilities for resolving conflicts when the same data
 * is modified both offline and online.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchData } from './api';

// Prefix for all conflict resolution keys
const CONFLICT_PREFIX = 'elite_locker_conflict_';

// Conflict resolution strategies
export enum ConflictStrategy {
  CLIENT_WINS = 'CLIENT_WINS',
  SERVER_WINS = 'SERVER_WINS',
  MANUAL_RESOLUTION = 'MANUAL_RESOLUTION',
  MERGE = 'MERGE',
}

// Default conflict resolution strategies by table
const DEFAULT_STRATEGIES: Record<string, ConflictStrategy> = {
  workouts: ConflictStrategy.MERGE,
  workout_sets: ConflictStrategy.CLIENT_WINS,
  workout_exercises: ConflictStrategy.MERGE,
  programs: ConflictStrategy.SERVER_WINS,
  user_profiles: ConflictStrategy.MANUAL_RESOLUTION,
};

// Conflict object structure
export interface Conflict {
  id: string;
  table: string;
  recordId: string;
  clientData: any;
  serverData: any;
  timestamp: number;
  resolved: boolean;
  resolution?: ConflictStrategy;
  resolvedData?: any;
}

/**
 * Detect conflicts between client and server data
 * @param table The table name
 * @param recordId The record ID
 * @param clientData The client data
 * @returns True if there's a conflict, false otherwise
 */
export async function detectConflict(
  table: string,
  recordId: string,
  clientData: any
): Promise<boolean> {
  try {
    // Fetch the latest server data
    const serverData = await fetchData(table, {
      filters: { id: recordId },
      single: true,
      bypassCache: true, // Always bypass cache to get the latest data
    });
    
    // If there's no server data, there's no conflict
    if (!serverData) {
      return false;
    }
    
    // Compare client and server data
    // We only care about fields that are in both objects
    const commonKeys = Object.keys(clientData).filter(key => 
      key in serverData && key !== 'id' && key !== 'created_at'
    );
    
    // Check if any common fields are different
    for (const key of commonKeys) {
      if (JSON.stringify(clientData[key]) !== JSON.stringify(serverData[key])) {
        // There's a conflict, store it
        await storeConflict(table, recordId, clientData, serverData);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error(`Error detecting conflict for ${table}/${recordId}:`, error);
    return false;
  }
}

/**
 * Store a conflict for later resolution
 * @param table The table name
 * @param recordId The record ID
 * @param clientData The client data
 * @param serverData The server data
 */
export async function storeConflict(
  table: string,
  recordId: string,
  clientData: any,
  serverData: any
): Promise<void> {
  try {
    const conflictId = `${table}_${recordId}_${Date.now()}`;
    const conflict: Conflict = {
      id: conflictId,
      table,
      recordId,
      clientData,
      serverData,
      timestamp: Date.now(),
      resolved: false,
    };
    
    await AsyncStorage.setItem(
      `${CONFLICT_PREFIX}${conflictId}`,
      JSON.stringify(conflict)
    );
    
    console.log(`Stored conflict for ${table}/${recordId}`);
  } catch (error) {
    console.error(`Error storing conflict for ${table}/${recordId}:`, error);
  }
}

/**
 * Resolve a conflict automatically based on the strategy
 * @param conflictId The conflict ID
 * @param strategy The resolution strategy (optional, uses default if not provided)
 * @returns The resolved data
 */
export async function resolveConflict(
  conflictId: string,
  strategy?: ConflictStrategy
): Promise<any> {
  try {
    // Get the conflict
    const conflictJson = await AsyncStorage.getItem(`${CONFLICT_PREFIX}${conflictId}`);
    
    if (!conflictJson) {
      throw new Error(`Conflict ${conflictId} not found`);
    }
    
    const conflict: Conflict = JSON.parse(conflictJson);
    
    // If the conflict is already resolved, return the resolved data
    if (conflict.resolved && conflict.resolvedData) {
      return conflict.resolvedData;
    }
    
    // Determine the resolution strategy
    const resolutionStrategy = strategy || 
      DEFAULT_STRATEGIES[conflict.table] || 
      ConflictStrategy.SERVER_WINS;
    
    let resolvedData: any;
    
    // Apply the resolution strategy
    switch (resolutionStrategy) {
      case ConflictStrategy.CLIENT_WINS:
        resolvedData = { ...conflict.serverData, ...conflict.clientData };
        break;
        
      case ConflictStrategy.SERVER_WINS:
        resolvedData = conflict.serverData;
        break;
        
      case ConflictStrategy.MERGE:
        // Merge the data, preferring client data for common fields
        resolvedData = { ...conflict.serverData, ...conflict.clientData };
        break;
        
      case ConflictStrategy.MANUAL_RESOLUTION:
        // For manual resolution, we don't resolve automatically
        // Instead, we return null and let the UI handle it
        return null;
        
      default:
        resolvedData = conflict.serverData;
    }
    
    // Update the conflict with the resolution
    conflict.resolved = true;
    conflict.resolution = resolutionStrategy;
    conflict.resolvedData = resolvedData;
    
    await AsyncStorage.setItem(
      `${CONFLICT_PREFIX}${conflictId}`,
      JSON.stringify(conflict)
    );
    
    return resolvedData;
  } catch (error) {
    console.error(`Error resolving conflict ${conflictId}:`, error);
    return null;
  }
}

/**
 * Get all unresolved conflicts
 * @returns An array of unresolved conflicts
 */
export async function getUnresolvedConflicts(): Promise<Conflict[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const conflictKeys = keys.filter(key => key.startsWith(CONFLICT_PREFIX));
    
    if (conflictKeys.length === 0) {
      return [];
    }
    
    const conflicts: Conflict[] = [];
    const keyValuePairs = await AsyncStorage.multiGet(conflictKeys);
    
    for (const [key, value] of keyValuePairs) {
      if (value) {
        const conflict: Conflict = JSON.parse(value);
        
        if (!conflict.resolved) {
          conflicts.push(conflict);
        }
      }
    }
    
    return conflicts;
  } catch (error) {
    console.error('Error getting unresolved conflicts:', error);
    return [];
  }
}

/**
 * Manually resolve a conflict
 * @param conflictId The conflict ID
 * @param resolvedData The manually resolved data
 */
export async function manuallyResolveConflict(
  conflictId: string,
  resolvedData: any
): Promise<void> {
  try {
    // Get the conflict
    const conflictJson = await AsyncStorage.getItem(`${CONFLICT_PREFIX}${conflictId}`);
    
    if (!conflictJson) {
      throw new Error(`Conflict ${conflictId} not found`);
    }
    
    const conflict: Conflict = JSON.parse(conflictJson);
    
    // Update the conflict with the resolution
    conflict.resolved = true;
    conflict.resolution = ConflictStrategy.MANUAL_RESOLUTION;
    conflict.resolvedData = resolvedData;
    
    await AsyncStorage.setItem(
      `${CONFLICT_PREFIX}${conflictId}`,
      JSON.stringify(conflict)
    );
  } catch (error) {
    console.error(`Error manually resolving conflict ${conflictId}:`, error);
  }
}
