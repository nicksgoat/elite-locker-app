/**
 * Elite Locker - Loading Utilities
 * 
 * This file contains utility functions and hooks for managing loading states
 * consistently throughout the application.
 */

import { useState, useCallback, useEffect } from 'react';
import { handleApiError } from './errorUtils';

/**
 * Hook for managing loading state with error handling
 * @returns Loading state utilities
 */
export function useLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  
  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);
  
  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);
  
  const setLoadingError = useCallback((err: any) => {
    setError(handleApiError(err));
    setIsLoading(false);
  }, []);
  
  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError
  };
}

/**
 * Hook for loading data with automatic loading state management
 * @param loadFn The function to load data
 * @param deps Dependencies that should trigger a reload
 * @returns Loading state and data
 */
export function useLoadData<T>(
  loadFn: () => Promise<T>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const { isLoading, error, startLoading, stopLoading, setLoadingError } = useLoading();
  
  const loadData = useCallback(async () => {
    startLoading();
    try {
      const result = await loadFn();
      setData(result);
      stopLoading();
      return result;
    } catch (err) {
      setLoadingError(err);
      return null;
    }
  }, [loadFn, startLoading, stopLoading, setLoadingError]);
  
  useEffect(() => {
    loadData();
  }, [loadData, ...deps]);
  
  return {
    data,
    isLoading,
    error,
    reload: loadData
  };
}

/**
 * Hook for managing a paginated list with loading states
 * @param loadFn The function to load a page of data
 * @param pageSize The number of items per page
 * @param deps Dependencies that should trigger a reload
 * @returns Pagination state and controls
 */
export function usePagination<T>(
  loadFn: (params: { limit: number; offset: number }) => Promise<T[]>,
  pageSize: number = 10,
  deps: any[] = []
) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { isLoading, error, startLoading, stopLoading, setLoadingError } = useLoading();
  
  const loadPage = useCallback(async (pageNum: number) => {
    startLoading();
    try {
      const offset = pageNum * pageSize;
      const newItems = await loadFn({ limit: pageSize, offset });
      
      if (pageNum === 0) {
        setItems(newItems);
      } else {
        setItems(prev => [...prev, ...newItems]);
      }
      
      setHasMore(newItems.length === pageSize);
      stopLoading();
      return newItems;
    } catch (err) {
      setLoadingError(err);
      return [];
    }
  }, [loadFn, pageSize, startLoading, stopLoading, setLoadingError]);
  
  const loadNextPage = useCallback(async () => {
    if (isLoading || !hasMore) return;
    const nextPage = page + 1;
    await loadPage(nextPage);
    setPage(nextPage);
  }, [isLoading, hasMore, page, loadPage]);
  
  const refresh = useCallback(async () => {
    setPage(0);
    setHasMore(true);
    return loadPage(0);
  }, [loadPage]);
  
  useEffect(() => {
    refresh();
  }, deps);
  
  return {
    items,
    isLoading,
    error,
    hasMore,
    loadNextPage,
    refresh
  };
}

/**
 * Hook for managing a mutation with loading state
 * @param mutationFn The function to perform the mutation
 * @returns Mutation state and function
 */
export function useMutation<T, P>(
  mutationFn: (params: P) => Promise<T>
) {
  const { isLoading, error, startLoading, stopLoading, setLoadingError } = useLoading();
  const [data, setData] = useState<T | null>(null);
  
  const mutate = useCallback(async (params: P) => {
    startLoading();
    try {
      const result = await mutationFn(params);
      setData(result);
      stopLoading();
      return result;
    } catch (err) {
      setLoadingError(err);
      return null;
    }
  }, [mutationFn, startLoading, stopLoading, setLoadingError]);
  
  return {
    mutate,
    data,
    isLoading,
    error
  };
}
