/**
 * Elite Locker - Error Utilities
 *
 * This file contains utility functions for handling errors consistently
 * throughout the application.
 */

import { ApiError } from '../services/types';

/**
 * Handle API errors consistently
 * @param error The error object
 * @param fallbackMessage A fallback message if the error doesn't have one
 * @returns A standardized error object
 */
export function handleApiError(error: any, fallbackMessage: string = 'An unexpected error occurred') {
  try {
    console.error('API Error:', error);

    // If error is null or undefined
    if (!error) {
      return {
        message: fallbackMessage,
        status: 500,
        data: null
      };
    }

    // If it's already an ApiError, return it
    if (error instanceof ApiError) {
      return {
        message: error.message,
        status: error.status,
        data: error.data
      };
    }

    // If it's a string
    if (typeof error === 'string') {
      return {
        message: error,
        status: 500,
        data: null
      };
    }

    // Handle network errors
    if (error.name === 'NetworkError' || error.message?.includes('Network')) {
      return {
        message: 'Network connection error. Please check your internet connection.',
        status: 0,
        data: error
      };
    }

    // Handle timeout errors
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      return {
        message: 'Request timed out. Please try again.',
        status: 408,
        data: error
      };
    }

    // If it's an Error object
    if (error instanceof Error) {
      return {
        message: error.message,
        status: 500,
        data: error.stack
      };
    }

    // If it's a Supabase error
    if (error?.error_description || error?.message) {
      return {
        message: error.error_description || error.message,
        status: error.status || 500,
        data: error
      };
    }

    // Default error
    return {
      message: fallbackMessage,
      status: 500,
      data: error
    };
  } catch (e) {
    // Last resort error handling
    console.error('Error in handleApiError:', e);
    return {
      message: fallbackMessage,
      status: 500,
      data: null
    };
  }
}

/**
 * Safe async function wrapper that handles errors gracefully
 * @param fn The async function to wrap
 * @param fallbackValue The value to return if the function fails
 * @param errorHandler Optional error handler
 * @returns The result of the function or the fallback value
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallbackValue: T,
  errorHandler?: (error: any) => void
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error('Safe async error:', error);
    if (errorHandler) {
      errorHandler(error);
    }
    return fallbackValue;
  }
}

/**
 * Safe property access with fallback
 * @param obj The object to access
 * @param path The property path (e.g., 'user.profile.name')
 * @param fallback The fallback value
 * @returns The property value or fallback
 */
export function safeGet<T>(obj: any, path: string, fallback: T): T {
  try {
    if (!obj || typeof obj !== 'object') {
      return fallback;
    }

    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return fallback;
      }
      current = current[key];
    }

    return current !== undefined ? current : fallback;
  } catch (error) {
    console.error('Safe get error:', error);
    return fallback;
  }
}

/**
 * Retry function with exponential backoff
 * @param fn The function to retry
 * @param maxRetries Maximum number of retries
 * @param baseDelay Base delay in milliseconds
 * @returns The result of the function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Debounce function to prevent excessive calls
 * @param fn The function to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function to limit call frequency
 * @param fn The function to throttle
 * @param limit The time limit in milliseconds
 * @returns The throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Show a toast message for an error
 * @param error The error object
 * @param fallbackMessage A fallback message if the error doesn't have one
 */
export function showErrorToast(error: any, fallbackMessage: string = 'An unexpected error occurred') {
  const errorData = handleApiError(error, fallbackMessage);

  // This would use a toast library in a real app
  console.error('Error Toast:', errorData.message);
}

/**
 * Safely execute an async function with error handling
 * @param asyncFn The async function to execute
 * @param errorHandler A function to handle errors
 * @returns The result of the async function or null if an error occurred
 */
export async function safeAsync<T>(
  asyncFn: () => Promise<T>,
  errorHandler?: (error: any) => void
): Promise<T | null> {
  try {
    return await asyncFn();
  } catch (error) {
    if (errorHandler) {
      errorHandler(error);
    } else {
      showErrorToast(error);
    }
    return null;
  }
}

/**
 * Create a safe version of a service function that handles errors
 * @param serviceFn The service function to make safe
 * @param errorHandler A function to handle errors
 * @returns A safe version of the service function
 */
export function createSafeService<T extends (...args: any[]) => Promise<any>>(
  serviceFn: T,
  errorHandler?: (error: any) => void
): (...args: Parameters<T>) => Promise<ReturnType<T> | null> {
  return async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
    try {
      return await serviceFn(...args);
    } catch (error) {
      if (errorHandler) {
        errorHandler(error);
      } else {
        showErrorToast(error);
      }
      return null;
    }
  };
}

/**
 * Check if an error is a network error
 * @param error The error to check
 * @returns True if it's a network error, false otherwise
 */
export function isNetworkError(error: any): boolean {
  return (
    error?.message?.includes('Network request failed') ||
    error?.message?.includes('Network Error') ||
    error?.message?.includes('Failed to fetch') ||
    error?.message?.includes('Network error') ||
    error?.code === 'ENOTFOUND' ||
    error?.code === 'ECONNREFUSED' ||
    error?.code === 'ECONNRESET' ||
    error?.code === 'ETIMEDOUT'
  );
}

/**
 * Check if an error is an authentication error
 * @param error The error to check
 * @returns True if it's an authentication error, false otherwise
 */
export function isAuthError(error: any): boolean {
  return (
    error?.status === 401 ||
    error?.code === 'UNAUTHORIZED' ||
    error?.message?.includes('not authenticated') ||
    error?.message?.includes('Invalid JWT') ||
    error?.message?.includes('JWT expired')
  );
}

/**
 * Format an error message for display
 * @param error The error to format
 * @param fallbackMessage A fallback message if the error doesn't have one
 * @returns A formatted error message
 */
export function formatErrorMessage(error: any, fallbackMessage: string = 'An unexpected error occurred'): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.error_description) {
    return error.error_description;
  }

  return fallbackMessage;
}
