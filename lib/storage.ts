/**
 * Elite Locker - Local Storage Utility
 *
 * This file provides utilities for caching data locally for offline use.
 */

import { Platform } from 'react-native';

// Platform-specific storage
let AsyncStorage: any;
if (Platform.OS === 'web') {
  // Web storage implementation
  AsyncStorage = {
    getItem: (key: string) => {
      try {
        return Promise.resolve(localStorage.getItem(key));
      } catch {
        return Promise.resolve(null);
      }
    },
    setItem: (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
        return Promise.resolve();
      } catch {
        return Promise.resolve();
      }
    },
    removeItem: (key: string) => {
      try {
        localStorage.removeItem(key);
        return Promise.resolve();
      } catch {
        return Promise.resolve();
      }
    },
    getAllKeys: () => {
      try {
        return Promise.resolve(Object.keys(localStorage));
      } catch {
        return Promise.resolve([]);
      }
    },
    multiGet: (keys: string[]) => {
      try {
        const result = keys.map(key => [key, localStorage.getItem(key)]);
        return Promise.resolve(result);
      } catch {
        return Promise.resolve([]);
      }
    },
    multiSet: (keyValuePairs: [string, string][]) => {
      try {
        keyValuePairs.forEach(([key, value]) => localStorage.setItem(key, value));
        return Promise.resolve();
      } catch {
        return Promise.resolve();
      }
    },
    multiRemove: (keys: string[]) => {
      try {
        keys.forEach(key => localStorage.removeItem(key));
        return Promise.resolve();
      } catch {
        return Promise.resolve();
      }
    },
  };
} else {
  // React Native storage
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

// Prefix for all cache keys to avoid conflicts
const CACHE_PREFIX = 'elite_locker_cache_';

// Default cache expiration time (24 hours in milliseconds)
const DEFAULT_CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Default storage limit (10MB)
const DEFAULT_STORAGE_LIMIT = 10 * 1024 * 1024; // 10MB in bytes

// Cache metadata key
const CACHE_METADATA_KEY = `${CACHE_PREFIX}metadata`;

// Cache item structure
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiration: number;
  size?: number;
  priority?: number; // 1-10, higher number = higher priority (less likely to be evicted)
  lastAccessed?: number;
}

// Cache metadata structure
interface CacheMetadata {
  totalSize: number;
  lastCleanup: number;
  itemCount: number;
  storageLimit: number;
}

/**
 * Get cache metadata
 * @returns The cache metadata
 */
async function getCacheMetadata(): Promise<CacheMetadata> {
  try {
    const metadataJson = await AsyncStorage.getItem(CACHE_METADATA_KEY);

    if (metadataJson) {
      return JSON.parse(metadataJson);
    }

    // Default metadata
    return {
      totalSize: 0,
      lastCleanup: Date.now(),
      itemCount: 0,
      storageLimit: DEFAULT_STORAGE_LIMIT,
    };
  } catch (error) {
    console.error('Error getting cache metadata:', error);

    // Default metadata
    return {
      totalSize: 0,
      lastCleanup: Date.now(),
      itemCount: 0,
      storageLimit: DEFAULT_STORAGE_LIMIT,
    };
  }
}

/**
 * Save cache metadata
 * @param metadata The cache metadata
 */
async function saveCacheMetadata(metadata: CacheMetadata): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error('Error saving cache metadata:', error);
  }
}

/**
 * Update cache metadata when adding an item
 * @param key The cache key
 * @param size The size of the item in bytes
 */
async function updateMetadataForAdd(key: string, size: number): Promise<void> {
  try {
    const metadata = await getCacheMetadata();

    // Check if the item already exists
    const existingItem = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);

    if (existingItem) {
      // Item exists, update the size difference
      const existingSize = JSON.parse(existingItem).size || 0;
      metadata.totalSize = metadata.totalSize - existingSize + size;
    } else {
      // New item
      metadata.totalSize += size;
      metadata.itemCount += 1;
    }

    await saveCacheMetadata(metadata);

    // Check if we need to clean up
    if (metadata.totalSize > metadata.storageLimit) {
      await cleanupCache();
    }
  } catch (error) {
    console.error(`Error updating metadata for add (${key}):`, error);
  }
}

/**
 * Update cache metadata when removing an item
 * @param key The cache key
 */
async function updateMetadataForRemove(key: string): Promise<void> {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const existingItemJson = await AsyncStorage.getItem(cacheKey);

    if (existingItemJson) {
      const existingItem = JSON.parse(existingItemJson);
      const metadata = await getCacheMetadata();

      metadata.totalSize -= existingItem.size || 0;
      metadata.itemCount -= 1;

      await saveCacheMetadata(metadata);
    }
  } catch (error) {
    console.error(`Error updating metadata for remove (${key}):`, error);
  }
}

/**
 * Calculate the size of data in bytes
 * @param data The data to measure
 * @returns The size in bytes
 */
function calculateDataSize(data: any): number {
  try {
    const json = JSON.stringify(data);
    return new Blob([json]).size;
  } catch (error) {
    console.error('Error calculating data size:', error);
    return 0;
  }
}

/**
 * Save data to the local cache
 * @param key The cache key
 * @param data The data to cache
 * @param expiration Cache expiration time in milliseconds (default: 24 hours)
 * @param priority Priority level (1-10, higher = more important)
 */
export async function saveToCache<T>(
  key: string,
  data: T,
  expiration: number = DEFAULT_CACHE_EXPIRATION,
  priority: number = 5
): Promise<void> {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const timestamp = Date.now();
    const size = calculateDataSize(data);

    const cacheItem: CacheItem<T> = {
      data,
      timestamp,
      expiration,
      size,
      priority,
      lastAccessed: timestamp,
    };

    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));

    // Update metadata
    await updateMetadataForAdd(key, size);
  } catch (error) {
    console.error(`Error saving to cache (${key}):`, error);
  }
}

/**
 * Get data from the local cache
 * @param key The cache key
 * @returns The cached data or null if not found or expired
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const cachedItemJson = await AsyncStorage.getItem(cacheKey);

    if (!cachedItemJson) {
      return null;
    }

    const cachedItem: CacheItem<T> = JSON.parse(cachedItemJson);
    const now = Date.now();

    // Check if the cache has expired
    if (now - cachedItem.timestamp > cachedItem.expiration) {
      // Cache expired, remove it
      await AsyncStorage.removeItem(cacheKey);
      await updateMetadataForRemove(key);
      return null;
    }

    // Update last accessed time
    cachedItem.lastAccessed = now;
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedItem));

    return cachedItem.data;
  } catch (error) {
    console.error(`Error getting from cache (${key}):`, error);
    return null;
  }
}

/**
 * Remove an item from the cache
 * @param key The cache key
 */
export async function removeFromCache(key: string): Promise<void> {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    await AsyncStorage.removeItem(cacheKey);
    await updateMetadataForRemove(key);
  } catch (error) {
    console.error(`Error removing from cache (${key}):`, error);
  }
}

/**
 * Clear all cached data
 */
export async function clearCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key =>
      key.startsWith(CACHE_PREFIX) && key !== CACHE_METADATA_KEY
    );

    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }

    // Reset metadata
    const metadata: CacheMetadata = {
      totalSize: 0,
      lastCleanup: Date.now(),
      itemCount: 0,
      storageLimit: DEFAULT_STORAGE_LIMIT,
    };

    await saveCacheMetadata(metadata);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Get all cached items
 * @returns An object with all cached items
 */
export async function getAllCachedItems(): Promise<Record<string, any>> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));

    if (cacheKeys.length === 0) {
      return {};
    }

    const keyValuePairs = await AsyncStorage.multiGet(cacheKeys);
    const result: Record<string, any> = {};

    for (const [key, value] of keyValuePairs) {
      if (value) {
        const normalizedKey = key.replace(CACHE_PREFIX, '');
        const cachedItem: CacheItem<any> = JSON.parse(value);
        result[normalizedKey] = cachedItem.data;
      }
    }

    return result;
  } catch (error) {
    console.error('Error getting all cached items:', error);
    return {};
  }
}

/**
 * Check if a cache key exists and is not expired
 * @param key The cache key
 * @returns True if the key exists and is not expired
 */
export async function cacheExists(key: string): Promise<boolean> {
  const data = await getFromCache(key);
  return data !== null;
}

/**
 * Update the expiration time of a cached item
 * @param key The cache key
 * @param expiration New expiration time in milliseconds
 */
export async function updateCacheExpiration(
  key: string,
  expiration: number = DEFAULT_CACHE_EXPIRATION
): Promise<void> {
  try {
    const data = await getFromCache(key);

    if (data !== null) {
      await saveToCache(key, data, expiration);
    }
  } catch (error) {
    console.error(`Error updating cache expiration (${key}):`, error);
  }
}

/**
 * Clean up the cache when it exceeds the storage limit
 * @param targetSize Target size to reduce to (default: 80% of limit)
 */
export async function cleanupCache(targetSize?: number): Promise<void> {
  try {
    const metadata = await getCacheMetadata();

    // Default target size is 80% of the limit
    const cleanupTarget = targetSize || (metadata.storageLimit * 0.8);

    // If we're already under the target, no need to clean up
    if (metadata.totalSize <= cleanupTarget) {
      return;
    }

    console.log(`Cleaning up cache: ${metadata.totalSize} bytes -> ${cleanupTarget} bytes target`);

    // Get all cache items
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key =>
      key.startsWith(CACHE_PREFIX) && key !== CACHE_METADATA_KEY
    );

    if (cacheKeys.length === 0) {
      return;
    }

    // Get all cache items
    const keyValuePairs = await AsyncStorage.multiGet(cacheKeys);
    const cacheItems: Array<{
      key: string;
      item: CacheItem<any>;
    }> = [];

    for (const [key, value] of keyValuePairs) {
      if (value) {
        try {
          const item = JSON.parse(value);
          cacheItems.push({
            key,
            item,
          });
        } catch (e) {
          // Skip invalid items
        }
      }
    }

    // Sort items by priority for eviction:
    // 1. Expired items first
    // 2. Then by priority (lower first)
    // 3. Then by last accessed time (oldest first)
    const now = Date.now();
    cacheItems.sort((a, b) => {
      // Check if either item is expired
      const aExpired = now - a.item.timestamp > a.item.expiration;
      const bExpired = now - b.item.timestamp > b.item.expiration;

      if (aExpired && !bExpired) return -1;
      if (!aExpired && bExpired) return 1;

      // Compare by priority
      const aPriority = a.item.priority || 5;
      const bPriority = b.item.priority || 5;
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Compare by last accessed time
      const aLastAccessed = a.item.lastAccessed || a.item.timestamp;
      const bLastAccessed = b.item.lastAccessed || b.item.timestamp;
      return aLastAccessed - bLastAccessed;
    });

    // Remove items until we're under the target size
    let currentSize = metadata.totalSize;
    const keysToRemove: string[] = [];

    for (const { key, item } of cacheItems) {
      if (currentSize <= cleanupTarget) {
        break;
      }

      const itemSize = item.size || 0;
      currentSize -= itemSize;
      keysToRemove.push(key);
    }

    // Remove the selected items
    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);

      // Update metadata
      metadata.totalSize = currentSize;
      metadata.itemCount -= keysToRemove.length;
      metadata.lastCleanup = now;

      await saveCacheMetadata(metadata);

      console.log(`Cleaned up ${keysToRemove.length} items, new size: ${currentSize} bytes`);
    }
  } catch (error) {
    console.error('Error cleaning up cache:', error);
  }
}

/**
 * Set the storage limit for the cache
 * @param limit The new storage limit in bytes
 */
export async function setCacheStorageLimit(limit: number): Promise<void> {
  try {
    const metadata = await getCacheMetadata();
    metadata.storageLimit = Math.max(limit, 1024 * 1024); // Minimum 1MB
    await saveCacheMetadata(metadata);

    // Clean up if we're over the new limit
    if (metadata.totalSize > metadata.storageLimit) {
      await cleanupCache();
    }
  } catch (error) {
    console.error('Error setting cache storage limit:', error);
  }
}

/**
 * Get cache statistics
 * @returns Cache statistics
 */
export async function getCacheStats(): Promise<{
  totalSize: number;
  itemCount: number;
  storageLimit: number;
  lastCleanup: Date;
  usagePercentage: number;
}> {
  const metadata = await getCacheMetadata();

  return {
    totalSize: metadata.totalSize,
    itemCount: metadata.itemCount,
    storageLimit: metadata.storageLimit,
    lastCleanup: new Date(metadata.lastCleanup),
    usagePercentage: (metadata.totalSize / metadata.storageLimit) * 100,
  };
}
