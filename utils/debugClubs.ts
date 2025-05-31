/**
 * Elite Locker - Club Debug Utilities
 * 
 * This file contains utilities to help debug club-related issues
 */

import { clubService } from '../services/clubService';
import { clearCache } from '../lib/storage';

/**
 * Debug function to check club data integrity
 */
export const debugClubData = async () => {
  console.log('🔍 Starting club data debug...');
  
  try {
    // Test basic club fetching
    console.log('📋 Fetching all clubs...');
    const allClubs = await clubService.getClubs({ limit: 10, bypassCache: true });
    console.log(`✅ Found ${allClubs.length} clubs`);
    
    if (allClubs.length > 0) {
      console.log('📝 Sample club IDs:', allClubs.slice(0, 3).map(c => c.id));
    }
    
    // Test user clubs
    console.log('👤 Fetching user clubs...');
    const userClubs = await clubService.getMyClubs({ bypassCache: true });
    console.log(`✅ Found ${userClubs.length} user clubs`);
    
    // Test memberships
    console.log('🏘️ Fetching memberships...');
    const memberships = await clubService.getMyMemberships({ bypassCache: true });
    console.log(`✅ Found ${memberships.length} memberships`);
    
    // Test individual club fetching with first available club
    if (allClubs.length > 0) {
      const testClubId = allClubs[0].id;
      console.log(`🎯 Testing individual club fetch for ID: ${testClubId}`);
      
      try {
        const club = await clubService.getClub(testClubId, { bypassCache: true });
        console.log(`✅ Successfully fetched club: ${club.name}`);
      } catch (error) {
        console.error(`❌ Failed to fetch club ${testClubId}:`, error);
      }
    }
    
    return {
      allClubs: allClubs.length,
      userClubs: userClubs.length,
      memberships: memberships.length,
      success: true
    };
    
  } catch (error) {
    console.error('❌ Club data debug failed:', error);
    return {
      error: error.message,
      success: false
    };
  }
};

/**
 * Clear all club-related cache
 */
export const clearClubCache = async () => {
  console.log('🧹 Clearing club cache...');
  
  try {
    await clearCache();
    console.log('✅ Club cache cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear club cache:', error);
    return false;
  }
};

/**
 * Validate a club ID format
 */
export const validateClubId = (clubId: string): boolean => {
  if (!clubId || typeof clubId !== 'string') {
    return false;
  }
  
  const trimmed = clubId.trim();
  
  // Check if it's a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  return uuidRegex.test(trimmed) || trimmed.length > 0;
};

/**
 * Safe club navigation helper
 */
export const safeClubNavigation = (clubId: string, router: any) => {
  if (!validateClubId(clubId)) {
    console.warn('Invalid club ID for navigation:', clubId);
    return false;
  }
  
  try {
    router.push(`/club/${clubId.trim()}`);
    return true;
  } catch (error) {
    console.error('Navigation error:', error);
    return false;
  }
};

/**
 * Get club debug info
 */
export const getClubDebugInfo = () => {
  return {
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    platform: typeof process !== 'undefined' ? process.platform : 'unknown'
  };
};
