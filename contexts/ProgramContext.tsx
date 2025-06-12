import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { 
  programService, 
  TrainingMax, 
  ProgramSubscription,
  ApiError
} from '@/services';
import { Program, ProgramWorkout } from '@/types/workout';

interface ProgramContextType {
  programs: Program[];
  featuredPrograms: Program[];
  myPrograms: Program[];
  mySubscriptions: ProgramSubscription[];
  currentProgram: Program | null;
  trainingMaxes: TrainingMax[];
  isLoadingPrograms: boolean;
  isLoadingFeatured: boolean;
  isLoadingMyPrograms: boolean;
  isLoadingSubscriptions: boolean;
  
  getProgram: (programId: string) => Promise<Program | null>;
  getProgramWorkout: (programId: string, workoutId: string) => Promise<ProgramWorkout | null>;
  subscribeToProgram: (programId: string, options: Partial<ProgramSubscription>) => Promise<void>;
  updateSubscriptionStatus: (subscriptionId: string, status: ProgramSubscription['status']) => Promise<void>;
  updateTrainingMax: (exerciseName: string, weight: number, unit: 'kg' | 'lb') => Promise<void>;
  getTrainingMax: (exerciseName: string) => TrainingMax | null;
  calculateWorkingWeight: (exerciseName: string, percentage: number) => number | null;
  markWorkoutComplete: (subscriptionId: string, workoutId: string) => Promise<void>;
  getNextScheduledWorkout: (subscriptionId: string) => Promise<{
    workout: ProgramWorkout | null;
    date: Date | null;
  }>;
}

// Create the context with a default value
const ProgramContext = createContext<ProgramContextType>({
  programs: [],
  featuredPrograms: [],
  myPrograms: [],
  mySubscriptions: [],
  currentProgram: null,
  trainingMaxes: [],
  isLoadingPrograms: false,
  isLoadingFeatured: false,
  isLoadingMyPrograms: false,
  isLoadingSubscriptions: false,
  
  getProgram: async () => null,
  getProgramWorkout: async () => null,
  subscribeToProgram: async () => {},
  updateSubscriptionStatus: async () => {},
  updateTrainingMax: async () => {},
  getTrainingMax: () => null,
  calculateWorkingWeight: () => null,
  markWorkoutComplete: async () => {},
  getNextScheduledWorkout: async () => ({ workout: null, date: null }),
});

export const ProgramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [programs, setPrograms] = useState<Program[]>([]);
  const [featuredPrograms, setFeaturedPrograms] = useState<Program[]>([]);
  const [myPrograms, setMyPrograms] = useState<Program[]>([]);
  const [mySubscriptions, setMySubscriptions] = useState<ProgramSubscription[]>([]);
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);
  const [trainingMaxes, setTrainingMaxes] = useState<TrainingMax[]>([]);
  
  // Loading states
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [isLoadingMyPrograms, setIsLoadingMyPrograms] = useState(false);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  
  // Cache for program details
  const [programCache, setProgramCache] = useState<Record<string, Program>>({});
  
  // Load initial data
  useEffect(() => {
    loadFeaturedPrograms();
    loadAllPrograms();
    loadMySubscriptions();
    loadTrainingMaxes();
  }, []);
  
  // Load featured programs
  const loadFeaturedPrograms = useCallback(async () => {
    setIsLoadingFeatured(true);
    try {
      const featured = await programService.getFeaturedPrograms();
      setFeaturedPrograms(featured);
    } catch (error) {
      console.error('Error loading featured programs:', error);
      // Fallback to empty array
      setFeaturedPrograms([]);
    } finally {
      setIsLoadingFeatured(false);
    }
  }, []);
  
  // Load all programs
  const loadAllPrograms = useCallback(async () => {
    setIsLoadingPrograms(true);
    try {
      const result = await programService.getPrograms();
      setPrograms(result.programs);
    } catch (error) {
      console.error('Error loading programs:', error);
      // Fallback to empty array
      setPrograms([]);
    } finally {
      setIsLoadingPrograms(false);
    }
  }, []);
  
  // Load my subscriptions
  const loadMySubscriptions = useCallback(async () => {
    setIsLoadingSubscriptions(true);
    try {
      // In a real implementation, this would come from the API
      // For now, we'll use mock data
      const mockSubscriptions: ProgramSubscription[] = [
        {
          id: 's1',
          programId: 'p1',
          startDate: new Date('2023-11-01'),
          status: 'active',
          currentWeek: 2,
          currentDay: 3,
          addToCalendar: true,
          receiveReminders: true,
          adaptToProgress: true,
          autoScheduleDeloads: true,
        }
      ];
      setMySubscriptions(mockSubscriptions);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      // Fallback to empty array
      setMySubscriptions([]);
    } finally {
      setIsLoadingSubscriptions(false);
    }
  }, []);
  
  // Load training maxes
  const loadTrainingMaxes = useCallback(async () => {
    try {
      const maxes = await programService.getTrainingMaxes();
      setTrainingMaxes(maxes);
    } catch (error) {
      console.error('Error loading training maxes:', error);
      // Fallback to empty array
      setTrainingMaxes([]);
    }
  }, []);
  
  // Get a single program by ID
  const getProgram = useCallback(async (programId: string): Promise<Program | null> => {
    // Check cache first
    if (programCache[programId]) {
      return programCache[programId];
    }
    
    // Check if it's in the already loaded programs
    const existingProgram = programs.find(p => p.id === programId) || 
                           featuredPrograms.find(p => p.id === programId) ||
                           myPrograms.find(p => p.id === programId);
    
    if (existingProgram) {
      // Add to cache
      setProgramCache(prev => ({
        ...prev,
        [programId]: existingProgram
      }));
      return existingProgram;
    }
    
    // Fetch from API
    try {
      const program = await programService.getProgramById(programId);
      
      // Add to cache
      setProgramCache(prev => ({
        ...prev,
        [programId]: program
      }));
      
      return program;
    } catch (error) {
      console.error(`Error fetching program ${programId}:`, error);
      return null;
    }
  }, [programs, featuredPrograms, myPrograms, programCache]);
  
  // Get a specific workout from a program
  const getProgramWorkout = useCallback(async (
    programId: string, 
    workoutId: string
  ): Promise<ProgramWorkout | null> => {
    try {
      // First, try to get the program
      const program = await getProgram(programId);
      if (!program) return null;
      
      // Check if the workout is in the program
      const workout = program.workouts.find(w => w.id === workoutId);
      if (workout) return workout;
      
      // If not found in the program, fetch it directly
      return await programService.getProgramWorkout(programId, workoutId);
    } catch (error) {
      console.error(`Error fetching workout ${workoutId} from program ${programId}:`, error);
      return null;
    }
  }, [getProgram]);
  
  // Subscribe to a program
  const subscribeToProgram = useCallback(async (
    programId: string, 
    options: Partial<ProgramSubscription>
  ): Promise<void> => {
    try {
      const subscription = await programService.subscribeToProgram(programId, {
        startDate: options.startDate || new Date(),
        addToCalendar: options.addToCalendar,
        receiveReminders: options.receiveReminders,
        adaptToProgress: options.adaptToProgress,
        autoScheduleDeloads: options.autoScheduleDeloads,
      });
      
      // Add to subscriptions
      setMySubscriptions(prev => [...prev, subscription]);
    } catch (error) {
      console.error(`Error subscribing to program ${programId}:`, error);
      throw error;
    }
  }, []);
  
  // Update subscription status
  const updateSubscriptionStatus = useCallback(async (
    subscriptionId: string, 
    status: ProgramSubscription['status']
  ): Promise<void> => {
    try {
      await programService.updateProgramSubscription(
        mySubscriptions.find(s => s.id === subscriptionId)?.programId || '',
        { status }
      );
      
      // Update local state
      setMySubscriptions(prev => 
        prev.map(sub => sub.id === subscriptionId ? { ...sub, status } : sub)
      );
    } catch (error) {
      console.error(`Error updating subscription ${subscriptionId}:`, error);
      throw error;
    }
  }, [mySubscriptions]);
  
  // Update a training max
  const updateTrainingMax = useCallback(async (
    exerciseName: string,
    weight: number,
    unit: 'kg' | 'lb'
  ): Promise<void> => {
    try {
      // For now, we'll use a mock exercise ID since we need to map exercise name to ID
      // In a real app, this would be handled properly with exercise lookup
      const mockExerciseId = `exercise-${exerciseName.toLowerCase().replace(/\s+/g, '-')}`;

      const updatedMax = await programService.updateTrainingMax(
        mockExerciseId,
        weight,
        unit
      );
      
      // Update local state - map the response to the expected format
      const mappedMax = {
        id: updatedMax.id,
        exerciseId: mockExerciseId,
        exerciseName: exerciseName,
        value: weight,
        unit: unit,
        lastUpdated: new Date()
      };

      setTrainingMaxes(prev => {
        const existingIndex = prev.findIndex(tm => tm.exerciseName === exerciseName);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = mappedMax;
          return updated;
        } else {
          return [...prev, mappedMax];
        }
      });
    } catch (error) {
      console.error(`Error updating training max for ${exerciseName}:`, error);
      throw error;
    }
  }, []);
  
  // Get a training max
  const getTrainingMax = useCallback((exerciseName: string): TrainingMax | null => {
    return trainingMaxes.find(tm => tm.exerciseName === exerciseName) || null;
  }, [trainingMaxes]);
  
  // Calculate working weight
  const calculateWorkingWeight = useCallback((
    exerciseName: string, 
    percentage: number
  ): number | null => {
    const trainingMax = getTrainingMax(exerciseName);
    if (!trainingMax) return null;
    
    return programService.calculateWorkingWeight(
      trainingMax.weight,
      percentage,
      trainingMax.unit
    );
  }, [getTrainingMax]);
  
  // Mark a workout as complete
  const markWorkoutComplete = useCallback(async (
    subscriptionId: string, 
    workoutId: string
  ): Promise<void> => {
    try {
      const subscription = mySubscriptions.find(s => s.id === subscriptionId);
      if (!subscription) throw new Error('Subscription not found');
      
      const result = await programService.markProgramWorkoutComplete(
        subscription.programId,
        workoutId
      );
      
      if (result.success && result.nextWorkout) {
        // Update subscription with next workout
        setMySubscriptions(prev => 
          prev.map(sub => {
            if (sub.id === subscriptionId) {
              return {
                ...sub,
                currentWeek: result.nextWorkout?.week || sub.currentWeek,
                currentDay: result.nextWorkout?.day || sub.currentDay,
              };
            }
            return sub;
          })
        );
      }
    } catch (error) {
      console.error(`Error marking workout ${workoutId} as complete:`, error);
      throw error;
    }
  }, [mySubscriptions]);
  
  // Get the next scheduled workout
  const getNextScheduledWorkout = useCallback(async (
    subscriptionId: string
  ): Promise<{
    workout: ProgramWorkout | null;
    date: Date | null;
  }> => {
    const subscription = mySubscriptions.find(sub => sub.id === subscriptionId);
    if (!subscription || subscription.status !== 'active') {
      return { workout: null, date: null };
    }
    
    try {
      const program = await getProgram(subscription.programId);
      if (!program) {
        return { workout: null, date: null };
      }
      
      // Find the next workout based on current week/day
      const nextWorkout = program.workouts.find(
        workout => workout.week === subscription.currentWeek && workout.day === subscription.currentDay
      ) || null;
      
      // Calculate the date for this workout
      const nextDate = new Date(subscription.startDate);
      const totalDays = ((subscription.currentWeek - 1) * 7) + (subscription.currentDay - 1);
      nextDate.setDate(nextDate.getDate() + totalDays);
      
      return {
        workout: nextWorkout,
        date: nextDate
      };
    } catch (error) {
      console.error(`Error getting next workout for subscription ${subscriptionId}:`, error);
      return { workout: null, date: null };
    }
  }, [mySubscriptions, getProgram]);
  
  return (
    <ProgramContext.Provider
      value={{
        programs,
        featuredPrograms,
        myPrograms,
        mySubscriptions,
        currentProgram,
        trainingMaxes,
        isLoadingPrograms,
        isLoadingFeatured,
        isLoadingMyPrograms,
        isLoadingSubscriptions,
        getProgram,
        getProgramWorkout,
        subscribeToProgram,
        updateSubscriptionStatus,
        updateTrainingMax,
        getTrainingMax,
        calculateWorkingWeight,
        markWorkoutComplete,
        getNextScheduledWorkout,
      }}
    >
      {children}
    </ProgramContext.Provider>
  );
};

export const useProgram = () => useContext(ProgramContext);

export default ProgramContext;
