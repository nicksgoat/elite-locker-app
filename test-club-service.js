/**
 * Test script to verify club service is working with real backend
 */

// This is a simple test to verify club fetching works
// Run this in the app to test the club service

const testClubService = async () => {
  try {
    console.log('Testing club service...');

    // Import the club service
    const { clubService } = require('./services/clubService');

    // Test getting all clubs with cache bypass
    console.log('Fetching all clubs (bypassing cache)...');
    const allClubs = await clubService.getClubs({
      limit: 5,
      bypassCache: true
    });
    console.log('All clubs:', allClubs);
    console.log('Number of clubs found:', allClubs?.length || 0);

    // Test getting user's clubs (this will require authentication)
    console.log('Fetching user clubs (bypassing cache)...');
    try {
      const userClubs = await clubService.getMyClubs({
        bypassCache: true
      });
      console.log('User clubs:', userClubs);
      console.log('Number of user clubs found:', userClubs?.length || 0);
    } catch (error) {
      console.log('User clubs error (expected if not authenticated):', error.message);
    }

    // Test connection
    console.log('Testing Supabase connection...');
    const { checkSupabaseConnection } = require('./lib/supabase-new');
    const isConnected = await checkSupabaseConnection();
    console.log('Supabase connected:', isConnected);

    console.log('Club service test completed');
  } catch (error) {
    console.error('Club service test failed:', error);
  }
};

// Export for use in the app
module.exports = { testClubService };
