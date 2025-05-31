/**
 * API Configuration for Elite Locker
 *
 * This file centralizes all API endpoints and configurations.
 * Update the IP address here when developing on different networks.
 */

// Development configuration - using ngrok for HTTPS support
const DEV_NGROK_URL = 'https://5322-2603-8080-aaf0-8080-c08a-ef21-6074-74de.ngrok-free.app';
const DEV_IP = '192.168.1.98';
const DEV_PORT = '3001';

// Environment detection
const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';

// Base URLs
export const API_CONFIG = {
  // Streaming API - using ngrok HTTPS URL for Twitch OAuth compatibility
  STREAMING_API_BASE: isDevelopment
    ? `${DEV_NGROK_URL}/api`
    : 'https://api.elitelocker.app/api',

  STREAMING_SOCKET_URL: isDevelopment
    ? DEV_NGROK_URL
    : 'https://api.elitelocker.app',

  // Supabase - Elite Locker App project configuration
  SUPABASE_URL: 'https://emucorbwylxtykughxks.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtdWNvcmJ3eWx4dHlrdWdoeGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNTc3MTksImV4cCI6MjA2MzkzMzcxOX0.LQTfyzp5TkqOu7E8zMV5eL1x0lhkQwgIzcmfed3i5Ok',
};

// Specific endpoints
export const ENDPOINTS = {
  // Streaming
  STREAMING_ENABLE: `${API_CONFIG.STREAMING_API_BASE}/streaming/enable`,
  STREAMING_DISABLE: `${API_CONFIG.STREAMING_API_BASE}/streaming/disable`,
  STREAMING_STATUS: `${API_CONFIG.STREAMING_API_BASE}/streaming/status`,

  // Twitch
  TWITCH_AUTH_URL: `${API_CONFIG.STREAMING_API_BASE}/twitch/auth-url`,
  TWITCH_CALLBACK: `${API_CONFIG.STREAMING_API_BASE}/twitch/callback`,
  TWITCH_DISCONNECT: `${API_CONFIG.STREAMING_API_BASE}/twitch/disconnect`,

  // Health check
  HEALTH_CHECK: `http://${DEV_IP}:${DEV_PORT}/health`,
};

// Connection test utility
export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(ENDPOINTS.HEALTH_CHECK, {
      method: 'GET',
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

// Network info for debugging
export const getNetworkInfo = () => ({
  isDevelopment,
  devIP: DEV_IP,
  devPort: DEV_PORT,
  streamingApiBase: API_CONFIG.STREAMING_API_BASE,
  streamingSocketUrl: API_CONFIG.STREAMING_SOCKET_URL,
});

export default API_CONFIG;
