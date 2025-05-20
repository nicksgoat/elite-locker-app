/**
 * Elite Locker - Polyfills
 *
 * This file contains polyfills for Node.js modules that are not available in React Native.
 * It should be imported at the entry point of the application.
 */

// Import web-streams polyfill first
import './web-streams-polyfill';

// Import other polyfills
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

// Add crypto polyfill
if (typeof global.crypto === 'undefined') {
  global.crypto = {};
}

if (typeof global.crypto.getRandomValues === 'undefined') {
  global.crypto.getRandomValues = function(array) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}

// Add stream polyfill
if (typeof global.stream === 'undefined') {
  try {
    global.stream = require('stream-browserify');
  } catch (e) {
    console.warn('Failed to polyfill stream:', e);
  }
}

// Initialize any other polyfills here
export const initPolyfills = () => {
  // Add any additional polyfill initialization here if needed
  console.log('Polyfills initialized');
};

export default initPolyfills;
