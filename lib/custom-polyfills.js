/**
 * Custom Polyfills for React Native
 * 
 * This file provides custom polyfills for various browser APIs that are not available in React Native.
 */

// Import required modules
import { ReadableStream, WritableStream, TransformStream } from './web-streams-polyfill';
import { TextEncoder, TextDecoder } from 'text-encoding';
import { URL, URLSearchParams } from 'react-native-url-polyfill';
import 'react-native-get-random-values';

// Polyfill global objects
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = ReadableStream;
}

if (typeof global.WritableStream === 'undefined') {
  global.WritableStream = WritableStream;
}

if (typeof global.TransformStream === 'undefined') {
  global.TransformStream = TransformStream;
}

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

if (typeof global.URL === 'undefined') {
  global.URL = URL;
}

if (typeof global.URLSearchParams === 'undefined') {
  global.URLSearchParams = URLSearchParams;
}

// Crypto polyfill
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

// Stream polyfill
if (typeof global.stream === 'undefined') {
  try {
    global.stream = require('stream-browserify');
  } catch (e) {
    console.warn('Failed to polyfill stream:', e);
  }
}

// Export a function to initialize polyfills
export const initPolyfills = () => {
  console.log('Custom polyfills initialized');
};

export default initPolyfills;
