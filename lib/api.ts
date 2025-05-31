/**
 * Elite Locker - API Utilities
 *
 * This file contains utility functions for interacting with the Supabase API.
 * It provides a consistent interface for CRUD operations and error handling.
 */

import { getFromCache, saveToCache } from './storage';
import { checkSupabaseConnection, handleSupabaseError, supabase } from './supabase-new';

// Import sync operations from syncManager, but avoid importing the whole module
// to prevent circular dependencies
let syncManager: any = null;
const getSyncManager = () => {
  if (!syncManager) {
    syncManager = require('./syncManager');
  }
  return {
    queueCreateOperation: syncManager.queueCreateOperation,
    queueUpdateOperation: syncManager.queueUpdateOperation,
    queueDeleteOperation: syncManager.queueDeleteOperation
  };
};

/**
 * Generic fetch function for getting data from Supabase with caching
 * @param table The table to fetch from
 * @param options Query options (select, filters, etc.)
 * @returns The fetched data or null if there's an error
 */
export async function fetchData<T>(
  table: string,
  options: {
    select?: string;
    filters?: Record<string, any>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
    single?: boolean;
    bypassCache?: boolean;
    cacheExpiration?: number;
  } = {}
): Promise<T | null> {
  const {
    select = '*',
    filters = {},
    order,
    limit,
    single = false,
    bypassCache = false,
    cacheExpiration = 24 * 60 * 60 * 1000 // 24 hours
  } = options;

  // Generate a cache key based on the query parameters
  const cacheKey = `${table}_${select}_${JSON.stringify(filters)}_${JSON.stringify(order)}_${limit}_${single}`;

  // Try to get data from cache first (unless bypassCache is true)
  if (!bypassCache) {
    const cachedData = await getFromCache<T>(cacheKey);
    if (cachedData !== null) {
      console.log(`Using cached data for ${table}`);
      return cachedData;
    }
  }

  // Check if we can connect to Supabase
  const isConnected = await checkSupabaseConnection();
  if (!isConnected) {
    console.log(`Cannot connect to Supabase, returning null for ${table}`);
    return null;
  }

  try {
    // Start building the query
    let query = supabase
      .from(table)
      .select(select);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    // Apply ordering
    if (order) {
      query = query.order(order.column, { ascending: order.ascending ?? true });
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    // Execute the query
    let response;
    if (single) {
      // For single queries, handle the specific "no rows returned" error
      try {
        response = await query.single();
      } catch (singleError: any) {
        // Handle the specific "JSON object requested, multiple (or no) rows returned" error
        if (singleError?.code === 'PGRST116') {
          console.log(`No single record found in ${table} for filters:`, filters);
          return null;
        }
        // Re-throw other errors
        throw singleError;
      }
    } else {
      response = await query;
    }

    // Safely handle the response
    if (!response) {
      console.error(`Unexpected null response from ${table} query`);
      return null;
    }

    const { data, error } = response;

    if (error) {
      // Handle specific Supabase error codes
      if (error.code === 'PGRST116') {
        console.log(`No records found in ${table} for query`);
        return single ? null : [];
      }

      // Handle schema cache errors (PGRST200, PGRST204)
      if (error.code === 'PGRST200' || error.code === 'PGRST204') {
        console.log(`Schema cache error for ${table}, using fallback data`);
        return single ? null : [];
      }

      // Log the error but don't throw
      console.error(`Error fetching data from ${table}:`, error);
      return null;
    }

    // Cache the data for future use
    if (data) {
      await saveToCache(cacheKey, data, cacheExpiration);
    }

    return data as T;
  } catch (error) {
    // Handle network errors gracefully
    const formattedError = handleSupabaseError(error, `fetching data from ${table}`);
    console.error(`Error in fetchData for ${table}:`, formattedError);
    return null;
  }
}


/**
 * Generic insert function for adding data to Supabase
 * @param table The table to insert into
 * @param data The data to insert
 * @param options Additional options
 * @returns The inserted data or null if there's an error
 */
export async function insertData<T>(
  table: string,
  data: Partial<T>,
  options: {
    offlineSupport?: boolean;
  } = {}
): Promise<T | null> {
  const { offlineSupport = true } = options;

  // Check if we can connect to Supabase
  const isConnected = await checkSupabaseConnection();

  // If we're offline and offline support is enabled, queue the operation for later
  if (!isConnected && offlineSupport) {
    console.log(`Offline: Queueing create operation for ${table}`);
    const { queueCreateOperation } = getSyncManager();
    await queueCreateOperation(table, data);

    // Return the data as if it was inserted successfully
    // This allows the UI to update immediately
    return data as T;
  }

  try {
    const response = await supabase
      .from(table)
      .insert(data)
      .select();

    // Safely handle the response
    if (!response) {
      console.error(`Unexpected null response from ${table} insert`);

      // If offline support is enabled, queue the operation
      if (offlineSupport) {
        console.log(`Error: Queueing create operation for ${table}`);
        const { queueCreateOperation } = getSyncManager();
        await queueCreateOperation(table, data);
        return data as T;
      }

      return null;
    }

    const { data: insertedData, error } = response;

    if (error) {
      console.error(`Error inserting data into ${table}:`, error);

      // Handle schema cache errors (PGRST200, PGRST204) - always queue for retry
      if (error.code === 'PGRST200' || error.code === 'PGRST204') {
        console.log(`Schema cache error for ${table}, queueing operation for retry`);
        const { queueCreateOperation } = getSyncManager();
        await queueCreateOperation(table, data);
        return { id: `temp-${Date.now()}`, ...data } as T;
      }

      // If there's an error and offline support is enabled, queue the operation
      if (offlineSupport) {
        console.log(`Error: Queueing create operation for ${table}`);
        const { queueCreateOperation } = getSyncManager();
        await queueCreateOperation(table, data);
        return data as T;
      }

      return null;
    }

    return insertedData[0] as T;
  } catch (error) {
    const formattedError = handleSupabaseError(error, `inserting data into ${table}`);
    console.error(`Error in insertData for ${table}:`, formattedError);

    // Handle schema cache errors - always queue for retry
    if (error && typeof error === 'object' && 'code' in error &&
        (error.code === 'PGRST200' || error.code === 'PGRST204')) {
      console.log(`Schema cache error for ${table}, queueing operation for retry`);
      const { queueCreateOperation } = getSyncManager();
      await queueCreateOperation(table, data);
      return { id: `temp-${Date.now()}`, ...data } as T;
    }

    // If there's an error and offline support is enabled, queue the operation
    if (offlineSupport) {
      console.log(`Error: Queueing create operation for ${table}`);
      const { queueCreateOperation } = getSyncManager();
      await queueCreateOperation(table, data);
      return data as T;
    }

    return null;
  }
}


/**
 * Generic update function for updating data in Supabase
 * @param table The table to update
 * @param id The ID of the record to update
 * @param data The data to update
 * @param options Additional options
 * @returns The updated data or null if there's an error
 */
export async function updateData<T>(
  table: string,
  id: string,
  data: Partial<T>,
  options: {
    offlineSupport?: boolean;
  } = {}
): Promise<T | null> {
  const { offlineSupport = true } = options;

  // Check if we can connect to Supabase
  const isConnected = await checkSupabaseConnection();

  // If we're offline and offline support is enabled, queue the operation for later
  if (!isConnected && offlineSupport) {
    console.log(`Offline: Queueing update operation for ${table}`);
    const { queueUpdateOperation } = getSyncManager();
    await queueUpdateOperation(table, id, data);

    // Return the data as if it was updated successfully
    // This allows the UI to update immediately
    return { id, ...data } as T;
  }

  try {
    const response = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select();

    // Safely handle the response
    if (!response) {
      console.error(`Unexpected null response from ${table} update`);

      // If offline support is enabled, queue the operation
      if (offlineSupport) {
        console.log(`Error: Queueing update operation for ${table}`);
        const { queueUpdateOperation } = getSyncManager();
        await queueUpdateOperation(table, id, data);
        return { id, ...data } as T;
      }

      return null;
    }

    const { data: updatedData, error } = response;

    if (error) {
      console.error(`Error updating data in ${table}:`, error);

      // If there's an error and offline support is enabled, queue the operation
      if (offlineSupport) {
        console.log(`Error: Queueing update operation for ${table}`);
        const { queueUpdateOperation } = getSyncManager();
        await queueUpdateOperation(table, id, data);
        return { id, ...data } as T;
      }

      return null;
    }

    return updatedData[0] as T;
  } catch (error) {
    const formattedError = handleSupabaseError(error, `updating data in ${table}`);
    console.error(`Error in updateData for ${table}:`, formattedError);

    // If there's an error and offline support is enabled, queue the operation
    if (offlineSupport) {
      console.log(`Error: Queueing update operation for ${table}`);
      const { queueUpdateOperation } = getSyncManager();
      await queueUpdateOperation(table, id, data);
      return { id, ...data } as T;
    }

    return null;
  }
}


/**
 * Generic delete function for removing data from Supabase
 * @param table The table to delete from
 * @param id The ID of the record to delete
 * @param options Additional options
 * @returns Success status
 */
export async function deleteData(
  table: string,
  id: string,
  options: {
    offlineSupport?: boolean;
  } = {}
): Promise<{ success: boolean }> {
  const { offlineSupport = true } = options;

  // Check if we can connect to Supabase
  const isConnected = await checkSupabaseConnection();

  // If we're offline and offline support is enabled, queue the operation for later
  if (!isConnected && offlineSupport) {
    console.log(`Offline: Queueing delete operation for ${table}`);
    const { queueDeleteOperation } = getSyncManager();
    await queueDeleteOperation(table, id);

    // Return success as if it was deleted successfully
    // This allows the UI to update immediately
    return { success: true };
  }

  try {
    const response = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    // Safely handle the response
    if (!response) {
      console.error(`Unexpected null response from ${table} delete`);

      // If offline support is enabled, queue the operation
      if (offlineSupport) {
        console.log(`Error: Queueing delete operation for ${table}`);
        const { queueDeleteOperation } = getSyncManager();
        await queueDeleteOperation(table, id);
        return { success: true };
      }

      return { success: false };
    }

    const { error } = response;

    if (error) {
      console.error(`Error deleting data from ${table}:`, error);

      // If there's an error and offline support is enabled, queue the operation
      if (offlineSupport) {
        console.log(`Error: Queueing delete operation for ${table}`);
        const { queueDeleteOperation } = getSyncManager();
        await queueDeleteOperation(table, id);
        return { success: true };
      }

      return { success: false };
    }

    return { success: true };
  } catch (error) {
    const formattedError = handleSupabaseError(error, `deleting data from ${table}`);
    console.error(`Error in deleteData for ${table}:`, formattedError);

    // If there's an error and offline support is enabled, queue the operation
    if (offlineSupport) {
      console.log(`Error: Queueing delete operation for ${table}`);
      const { queueDeleteOperation } = getSyncManager();
      await queueDeleteOperation(table, id);
      return { success: true };
    }

    return { success: false };
  }
}

/**
 * Function to handle file uploads to Supabase Storage
 * @param bucket The storage bucket
 * @param path The file path
 * @param file The file to upload
 * @returns The URL of the uploaded file or null if there's an error
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: Blob
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
      });

    if (error) {
      console.error(`Error uploading file to ${bucket}:`, error);
      return null;
    }

    // Get the public URL
    if (data && data.path) {
      try {
        const publicUrlResponse = supabase
          .storage
          .from(bucket)
          .getPublicUrl(data.path);

        // Safely access the data and publicUrl properties
        if (publicUrlResponse &&
            typeof publicUrlResponse === 'object' &&
            'data' in publicUrlResponse &&
            publicUrlResponse.data &&
            'publicUrl' in publicUrlResponse.data) {
          return publicUrlResponse.data.publicUrl;
        } else {
          console.error(`Invalid response format from getPublicUrl for ${bucket}/${data.path}:`, publicUrlResponse);
          return null;
        }
      } catch (urlError) {
        console.error(`Error getting public URL for ${bucket}/${data.path}:`, urlError);
        return null;
      }
    }

    return null;
  } catch (error) {
    const formattedError = handleSupabaseError(error, `uploading file to ${bucket}`);
    console.error(`Error in uploadFile for ${bucket}:`, formattedError);
    return null;
  }
}
