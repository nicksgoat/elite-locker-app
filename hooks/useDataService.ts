import { useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/api/dataService';
import { Exercise, Program, Club } from '../types/workout';

interface UseDataServiceState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useExercises = (): UseDataServiceState<Exercise[]> => {
  const [data, setData] = useState<Exercise[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dataService.getExercises();
      
      if (result.data) {
        setData(result.data);
      }
      
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load exercises');
      console.error('Error in useExercises:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh: loadData,
  };
};

export const usePrograms = (): UseDataServiceState<Program[]> => {
  const [data, setData] = useState<Program[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dataService.getPrograms();
      
      if (result.data) {
        setData(result.data);
      }
      
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load programs');
      console.error('Error in usePrograms:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh: loadData,
  };
};

export const useClubs = (): UseDataServiceState<Club[]> => {
  const [data, setData] = useState<Club[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dataService.getClubs();
      
      if (result.data) {
        setData(result.data);
      }
      
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load clubs');
      console.error('Error in useClubs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh: loadData,
  };
};

export const useWorkoutHistory = (userId: string): UseDataServiceState<any[]> => {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await dataService.getWorkoutHistory(userId);
      
      if (result.data) {
        setData(result.data);
      }
      
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load workout history');
      console.error('Error in useWorkoutHistory:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh: loadData,
  };
};

// Hook for searching exercises
export const useExerciseSearch = () => {
  const [data, setData] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchExercises = useCallback(async (query: string) => {
    if (!query.trim()) {
      setData([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await dataService.searchExercises(query);
      
      if (result.data) {
        setData(result.data);
      }
      
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to search exercises');
      console.error('Error in useExerciseSearch:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    search: searchExercises,
  };
}; 