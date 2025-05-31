import { useEffect, useState, useCallback } from 'react';
import { streamingService } from '../services/StreamingService';

interface StreamingHookState {
  isStreaming: boolean;
  isConnected: boolean;
  overlayUrl: string | null;
  error: string | null;
  loading: boolean;
}

interface StreamingHookActions {
  enableStreaming: () => Promise<void>;
  disableStreaming: () => Promise<void>;
  publishWorkoutUpdate: (workoutData: any) => void;
  publishSessionStats: (sessionData: any) => void;
  refreshConnection: () => void;
}

export function useStreaming(userId?: string): [StreamingHookState, StreamingHookActions] {
  const [state, setState] = useState<StreamingHookState>({
    isStreaming: false,
    isConnected: false,
    overlayUrl: null,
    error: null,
    loading: false,
  });

  // Initialize streaming service
  useEffect(() => {
    if (userId) {
      streamingService.initialize(userId).catch(error => {
        console.error('Failed to initialize streaming service:', error);
        setState(prev => ({ ...prev, error: error.message }));
      });
    }
  }, [userId]);

  // Set up event listeners
  useEffect(() => {
    const handleConnected = () => {
      setState(prev => ({ ...prev, isConnected: true, error: null }));
    };

    const handleDisconnected = () => {
      setState(prev => ({ ...prev, isConnected: false }));
    };

    const handleStreamingEnabled = (data: { overlayUrl: string }) => {
      setState(prev => ({ 
        ...prev, 
        isStreaming: true, 
        overlayUrl: data.overlayUrl,
        loading: false,
        error: null 
      }));
    };

    const handleStreamingDisabled = () => {
      setState(prev => ({ 
        ...prev, 
        isStreaming: false, 
        overlayUrl: null,
        loading: false 
      }));
    };

    const handleError = (error: { message: string }) => {
      setState(prev => ({ 
        ...prev, 
        error: error.message,
        loading: false 
      }));
    };

    // Add event listeners
    streamingService.on('connected', handleConnected);
    streamingService.on('disconnected', handleDisconnected);
    streamingService.on('streamingEnabled', handleStreamingEnabled);
    streamingService.on('streamingDisabled', handleStreamingDisabled);
    streamingService.on('error', handleError);

    // Load initial state
    const status = streamingService.getStreamingStatus();
    setState(prev => ({
      ...prev,
      isStreaming: status.isStreaming,
      isConnected: status.isConnected,
      overlayUrl: status.overlayUrl,
    }));

    // Cleanup
    return () => {
      streamingService.off('connected', handleConnected);
      streamingService.off('disconnected', handleDisconnected);
      streamingService.off('streamingEnabled', handleStreamingEnabled);
      streamingService.off('streamingDisabled', handleStreamingDisabled);
      streamingService.off('error', handleError);
    };
  }, []);

  // Actions
  const enableStreaming = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await streamingService.enableStreaming();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to enable streaming',
        loading: false 
      }));
    }
  }, []);

  const disableStreaming = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await streamingService.disableStreaming();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to disable streaming',
        loading: false 
      }));
    }
  }, []);

  const publishWorkoutUpdate = useCallback((workoutData: any) => {
    if (!state.isStreaming || !state.isConnected) {
      console.warn('Cannot publish workout update: streaming not active or not connected');
      return;
    }

    try {
      // Transform workout data to match expected format
      const workoutUpdate = {
        sessionId: workoutData.sessionId || 'current-session',
        userId: userId || 'unknown',
        currentExercise: {
          name: workoutData.exerciseName || 'Unknown Exercise',
          category: workoutData.category || 'General',
          muscleGroups: workoutData.muscleGroups || [],
        },
        currentSet: {
          setNumber: workoutData.currentSet || 1,
          reps: workoutData.reps || 0,
          weight: workoutData.weight || 0,
          restTime: workoutData.restTime,
          completed: workoutData.completed || false,
        },
        sessionProgress: {
          exercisesCompleted: workoutData.exercisesCompleted || 0,
          totalExercises: workoutData.totalExercises || 1,
          timeElapsed: workoutData.timeElapsed || 0,
          estimatedTimeRemaining: workoutData.estimatedTimeRemaining,
        },
        timestamp: new Date(),
      };

      streamingService.publishWorkoutUpdate(workoutUpdate);
    } catch (error) {
      console.error('Error publishing workout update:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to publish workout update' 
      }));
    }
  }, [state.isStreaming, state.isConnected, userId]);

  const publishSessionStats = useCallback((sessionData: any) => {
    if (!state.isStreaming || !state.isConnected) {
      console.warn('Cannot publish session stats: streaming not active or not connected');
      return;
    }

    try {
      // Transform session data to match expected format
      const sessionStats = {
        sessionId: sessionData.sessionId || 'current-session',
        userId: userId || 'unknown',
        totalTime: sessionData.totalTime || 0,
        exercisesCompleted: sessionData.exercisesCompleted || 0,
        totalSets: sessionData.totalSets || 0,
        totalReps: sessionData.totalReps || 0,
        totalVolume: sessionData.totalVolume || 0,
        caloriesBurned: sessionData.caloriesBurned,
        averageRestTime: sessionData.averageRestTime,
        personalRecords: sessionData.personalRecords || [],
        timestamp: new Date(),
      };

      streamingService.publishSessionStats(sessionStats);
    } catch (error) {
      console.error('Error publishing session stats:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to publish session stats' 
      }));
    }
  }, [state.isStreaming, state.isConnected, userId]);

  const refreshConnection = useCallback(() => {
    const status = streamingService.getStreamingStatus();
    setState(prev => ({
      ...prev,
      isStreaming: status.isStreaming,
      isConnected: status.isConnected,
      overlayUrl: status.overlayUrl,
      error: null,
    }));
  }, []);

  return [
    state,
    {
      enableStreaming,
      disableStreaming,
      publishWorkoutUpdate,
      publishSessionStats,
      refreshConnection,
    }
  ];
}

// Helper hook for automatic workout streaming
export function useWorkoutStreaming(userId?: string, workoutData?: any) {
  const [streamingState, streamingActions] = useStreaming(userId);

  // Automatically publish workout updates when data changes
  useEffect(() => {
    if (workoutData && streamingState.isStreaming && streamingState.isConnected) {
      streamingActions.publishWorkoutUpdate(workoutData);
    }
  }, [workoutData, streamingState.isStreaming, streamingState.isConnected, streamingActions]);

  return [streamingState, streamingActions];
}
