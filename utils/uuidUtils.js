/**
 * UUID utility functions that work in React Native with Hermes engine
 * This provides an alternative to the standard uuid library which relies on crypto.getRandomValues()
 */

/**
 * Generate a simple UUID v4 compatible string without using crypto.getRandomValues()
 * This is less cryptographically secure but works in all environments
 * @returns {string} A UUID v4 compatible string
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a simple short ID (not a UUID but useful for many purposes)
 * @param {number} length - The desired length of the ID
 * @returns {string} A random alphanumeric string
 */
export function generateShortId(length = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}

/**
 * Create a deterministic ID based on input string
 * Useful when you need a reproducible ID from the same input
 * @param {string} input - The input string to hash
 * @returns {string} A hash of the input string
 */
export function generateHashId(input) {
  let hash = 0;
  
  if (input.length === 0) {
    return hash.toString(16);
  }
  
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Make it positive and convert to hex
  return Math.abs(hash).toString(16);
} 