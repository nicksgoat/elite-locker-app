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
