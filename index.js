// Import polyfills for crypto and buffer
import { Buffer } from 'buffer';
import * as expoCrypto from 'expo-crypto';
import 'react-native-get-random-values';

// Add global polyfills
global.Buffer = Buffer;

// Use expo-crypto instead of react-native-crypto to avoid seed issues
global.crypto = {
  getRandomValues: (array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  },
  randomUUID: expoCrypto.randomUUID || (() => {
    // Fallback UUID generation if expo-crypto doesn't have randomUUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }),
  subtle: expoCrypto.subtle || undefined,
};

// Import expo-router entry point
import 'expo-router/entry';
