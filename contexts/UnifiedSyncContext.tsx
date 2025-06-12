/**
 * Elite Locker - Unified Sync Context
 * 
 * This context provides unified state management and synchronization
 * across all app data and UI components.
 */

import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { initializeRealtimeSync, getSyncStatistics } from '../utils/realtimeSync';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { createLogger } from '../utils/secureLogger';

const logger = createLogger('UnifiedSyncContext');

// Global app state interface
export interface AppState {
  // User data
  user: any | null;
  userProfile: any | null;
  
  // Workout data
  workouts: any[];
  activeWorkout: any | null;
  workoutTemplates: any[];
  exercises: any[];
  
  // Program data
  programs: any[];
  subscriptions: any[];
  trainingMaxes: any[];
  
  // Social data
  posts: any[];
  clubs: any[];
  
  // Sync state
  syncStatus: {
    isOnline: boolean;
    lastSync: number | null;
    pendingOperations: number;
    conflicts: number;
    isInitialized: boolean;
  };
  
  // UI state
  ui: {
    isLoading: boolean;
    error: string | null;
    notifications: any[];
    activeScreen: string | null;
  };
}

// Action types
export enum ActionType {
  // Sync actions
  SYNC_INITIALIZED = 'SYNC_INITIALIZED',
  SYNC_STATUS_UPDATED = 'SYNC_STATUS_UPDATED',
  SYNC_ERROR = 'SYNC_ERROR',
  
  // Data actions
  DATA_LOADED = 'DATA_LOADED',
  DATA_UPDATED = 'DATA_UPDATED',
  DATA_INSERTED = 'DATA_INSERTED',
  DATA_DELETED = 'DATA_DELETED',
  
  // UI actions
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR',
  ADD_NOTIFICATION = 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION',
  SET_ACTIVE_SCREEN = 'SET_ACTIVE_SCREEN',
  
  // User actions
  USER_SIGNED_IN = 'USER_SIGNED_IN',
  USER_SIGNED_OUT = 'USER_SIGNED_OUT',
  USER_PROFILE_UPDATED = 'USER_PROFILE_UPDATED',
  
  // Workout actions
  WORKOUT_STARTED = 'WORKOUT_STARTED',
  WORKOUT_ENDED = 'WORKOUT_ENDED',
  WORKOUT_UPDATED = 'WORKOUT_UPDATED',
  EXERCISE_ADDED = 'EXERCISE_ADDED',
  SET_LOGGED = 'SET_LOGGED',
}

// Action interface
export interface AppAction {
  type: ActionType;
  payload?: any;
  meta?: {
    table?: string;
    id?: string;
    timestamp?: number;
  };
}

// Initial state
const initialState: AppState = {
  user: null,
  userProfile: null,
  workouts: [],
  activeWorkout: null,
  workoutTemplates: [],
  exercises: [],
  programs: [],
  subscriptions: [],
  trainingMaxes: [],
  posts: [],
  clubs: [],
  syncStatus: {
    isOnline: false,
    lastSync: null,
    pendingOperations: 0,
    conflicts: 0,
    isInitialized: false,
  },
  ui: {
    isLoading: false,
    error: null,
    notifications: [],
    activeScreen: null,
  },
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case ActionType.SYNC_INITIALIZED:
      return {
        ...state,
        syncStatus: {
          ...state.syncStatus,
          isInitialized: true,
        },
      };

    case ActionType.SYNC_STATUS_UPDATED:
      return {
        ...state,
        syncStatus: {
          ...state.syncStatus,
          ...action.payload,
        },
      };

    case ActionType.DATA_LOADED:
      const { table, data } = action.payload;
      return {
        ...state,
        [table]: data,
        ui: {
          ...state.ui,
          isLoading: false,
          error: null,
        },
      };

    case ActionType.DATA_UPDATED:
      return updateDataInState(state, action);

    case ActionType.DATA_INSERTED:
      return insertDataInState(state, action);

    case ActionType.DATA_DELETED:
      return deleteDataFromState(state, action);

    case ActionType.SET_LOADING:
      return {
        ...state,
        ui: {
          ...state.ui,
          isLoading: action.payload,
        },
      };

    case ActionType.SET_ERROR:
      return {
        ...state,
        ui: {
          ...state.ui,
          error: action.payload,
          isLoading: false,
        },
      };

    case ActionType.CLEAR_ERROR:
      return {
        ...state,
        ui: {
          ...state.ui,
          error: null,
        },
      };

    case ActionType.USER_SIGNED_IN:
      return {
        ...state,
        user: action.payload,
      };

    case ActionType.USER_SIGNED_OUT:
      return {
        ...initialState,
        syncStatus: state.syncStatus,
      };

    case ActionType.WORKOUT_STARTED:
      return {
        ...state,
        activeWorkout: action.payload,
      };

    case ActionType.WORKOUT_ENDED:
      return {
        ...state,
        activeWorkout: null,
        workouts: [action.payload, ...state.workouts],
      };

    case ActionType.ADD_NOTIFICATION:
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, action.payload],
        },
      };

    case ActionType.REMOVE_NOTIFICATION:
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(n => n.id !== action.payload),
        },
      };

    default:
      return state;
  }
}

// Helper functions for data operations
function updateDataInState(state: AppState, action: AppAction): AppState {
  const { table, id, data } = action.payload;
  const tableData = state[table as keyof AppState] as any[];
  
  if (!Array.isArray(tableData)) {
    return state;
  }
  
  const updatedData = tableData.map(item => 
    item.id === id ? { ...item, ...data } : item
  );
  
  return {
    ...state,
    [table]: updatedData,
  };
}

function insertDataInState(state: AppState, action: AppAction): AppState {
  const { table, data } = action.payload;
  const tableData = state[table as keyof AppState] as any[];
  
  if (!Array.isArray(tableData)) {
    return state;
  }
  
  return {
    ...state,
    [table]: [...tableData, data],
  };
}

function deleteDataFromState(state: AppState, action: AppAction): AppState {
  const { table, id } = action.payload;
  const tableData = state[table as keyof AppState] as any[];
  
  if (!Array.isArray(tableData)) {
    return state;
  }
  
  const filteredData = tableData.filter(item => item.id !== id);
  
  return {
    ...state,
    [table]: filteredData,
  };
}

// Context interface
export interface UnifiedSyncContextType {
  // State
  state: AppState;
  
  // Actions
  dispatch: React.Dispatch<AppAction>;
  
  // Sync operations
  initializeSync: () => Promise<void>;
  refreshData: (table?: string) => Promise<void>;
  forceSync: () => Promise<void>;
  
  // Data operations
  loadData: (table: string) => Promise<void>;
  updateData: (table: string, id: string, data: any) => Promise<void>;
  insertData: (table: string, data: any) => Promise<void>;
  deleteData: (table: string, id: string) => Promise<void>;
  
  // UI operations
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
  
  // Utility functions
  getSyncStatistics: () => any;
  isDataStale: (table: string, maxAge?: number) => boolean;
}

// Create context
const UnifiedSyncContext = createContext<UnifiedSyncContextType | null>(null);

// Provider component
export const UnifiedSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize sync system
  const initializeSync = useCallback(async () => {
    try {
      logger.info('Initializing unified sync system');
      
      await initializeRealtimeSync();
      
      dispatch({
        type: ActionType.SYNC_INITIALIZED,
      });
      
      // Update sync status periodically
      const updateSyncStatus = () => {
        const stats = getSyncStatistics();
        dispatch({
          type: ActionType.SYNC_STATUS_UPDATED,
          payload: {
            lastSync: Date.now(),
            pendingOperations: stats.queueSize || 0,
            conflicts: stats.unresolvedConflicts || 0,
            isOnline: navigator.onLine,
          },
        });
      };
      
      updateSyncStatus();
      const interval = setInterval(updateSyncStatus, 30000); // Every 30 seconds
      
      return () => clearInterval(interval);
      
    } catch (error) {
      logger.error('Failed to initialize sync system', { error: error.message });
      dispatch({
        type: ActionType.SYNC_ERROR,
        payload: error.message,
      });
    }
  }, []);

  // Load data for a specific table
  const loadData = useCallback(async (table: string) => {
    dispatch({ type: ActionType.SET_LOADING, payload: true });
    
    try {
      // TODO: Implement actual data loading based on table
      // This would use the appropriate service (workoutService, programService, etc.)
      
      const mockData: any[] = []; // Replace with actual data loading
      
      dispatch({
        type: ActionType.DATA_LOADED,
        payload: { table, data: mockData },
      });
      
    } catch (error) {
      logger.error(`Failed to load data for table ${table}`, { error: error.message });
      dispatch({
        type: ActionType.SET_ERROR,
        payload: error.message,
      });
    }
  }, []);

  // Update data
  const updateData = useCallback(async (table: string, id: string, data: any) => {
    try {
      // TODO: Implement actual data update
      
      dispatch({
        type: ActionType.DATA_UPDATED,
        payload: { table, id, data },
        meta: { table, id, timestamp: Date.now() },
      });
      
    } catch (error) {
      logger.error(`Failed to update data in table ${table}`, { error: error.message });
      throw error;
    }
  }, []);

  // Insert data
  const insertData = useCallback(async (table: string, data: any) => {
    try {
      // TODO: Implement actual data insertion
      
      dispatch({
        type: ActionType.DATA_INSERTED,
        payload: { table, data },
        meta: { table, timestamp: Date.now() },
      });
      
    } catch (error) {
      logger.error(`Failed to insert data in table ${table}`, { error: error.message });
      throw error;
    }
  }, []);

  // Delete data
  const deleteData = useCallback(async (table: string, id: string) => {
    try {
      // TODO: Implement actual data deletion
      
      dispatch({
        type: ActionType.DATA_DELETED,
        payload: { table, id },
        meta: { table, id, timestamp: Date.now() },
      });
      
    } catch (error) {
      logger.error(`Failed to delete data from table ${table}`, { error: error.message });
      throw error;
    }
  }, []);

  // Refresh data
  const refreshData = useCallback(async (table?: string) => {
    if (table) {
      await loadData(table);
    } else {
      // Refresh all data
      const tables = ['workouts', 'exercises', 'programs', 'posts'];
      await Promise.all(tables.map(t => loadData(t)));
    }
  }, [loadData]);

  // Force sync
  const forceSync = useCallback(async () => {
    logger.info('Force sync triggered');
    await refreshData();
  }, [refreshData]);

  // UI operations
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: ActionType.SET_LOADING, payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    if (error) {
      dispatch({ type: ActionType.SET_ERROR, payload: error });
    } else {
      dispatch({ type: ActionType.CLEAR_ERROR });
    }
  }, []);

  const addNotification = useCallback((notification: any) => {
    const notificationWithId = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    
    dispatch({ type: ActionType.ADD_NOTIFICATION, payload: notificationWithId });
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      dispatch({ type: ActionType.REMOVE_NOTIFICATION, payload: notificationWithId.id });
    }, 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: ActionType.REMOVE_NOTIFICATION, payload: id });
  }, []);

  // Utility functions
  const isDataStale = useCallback((table: string, maxAge: number = 300000) => { // 5 minutes default
    const lastSync = state.syncStatus.lastSync;
    if (!lastSync) return true;
    
    return Date.now() - lastSync > maxAge;
  }, [state.syncStatus.lastSync]);

  // Initialize sync on mount
  useEffect(() => {
    initializeSync();
  }, [initializeSync]);

  const contextValue: UnifiedSyncContextType = {
    state,
    dispatch,
    initializeSync,
    refreshData,
    forceSync,
    loadData,
    updateData,
    insertData,
    deleteData,
    setLoading,
    setError,
    addNotification,
    removeNotification,
    getSyncStatistics,
    isDataStale,
  };

  return (
    <UnifiedSyncContext.Provider value={contextValue}>
      {children}
    </UnifiedSyncContext.Provider>
  );
};

// Hook to use the unified sync context
export const useUnifiedSync = (): UnifiedSyncContextType => {
  const context = useContext(UnifiedSyncContext);
  if (!context) {
    throw new Error('useUnifiedSync must be used within a UnifiedSyncProvider');
  }
  return context;
};

export default UnifiedSyncContext;
