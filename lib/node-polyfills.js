/**
 * Node.js Polyfills for React Native
 *
 * This file provides polyfills for Node.js modules that are not available in React Native.
 */

// Import required polyfills
import 'react-native-get-random-values';
import { URL, URLSearchParams } from 'react-native-url-polyfill';
import { TextDecoder, TextEncoder } from 'text-encoding';

// Import web streams from the polyfill package
import * as webStreams from 'web-streams-polyfill';

// Import Node.js module polyfills
import http from '@tradle/react-native-http';
import zlib from 'browserify-zlib';
import events from 'events';
import * as expoCrypto from 'expo-crypto';
import https from 'https-browserify';
import path from 'path-browserify';
import fs from 'react-native-level-fs';
import os from 'react-native-os';
import streamBrowserify from 'stream-browserify';

// Polyfill global objects
global.ReadableStream = webStreams.ReadableStream;
global.WritableStream = webStreams.WritableStream;
global.TransformStream = webStreams.TransformStream;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.URL = URL;
global.URLSearchParams = URLSearchParams;

// Polyfill Node.js modules
global.stream = streamBrowserify;
global.events = events;
global.EventEmitter = events.EventEmitter;
global.path = path;

// Use expo-crypto instead of react-native-crypto
global.crypto = {
  ...global.crypto,
  getRandomValues: expoCrypto.getRandomValues,
  subtle: expoCrypto.subtle,
  randomUUID: expoCrypto.randomUUID,
};

global.http = http;
global.https = https;
global.os = os;
global.fs = fs;
global.zlib = zlib;

// Initialize polyfills
export const initNodePolyfills = () => {
  console.log('Node.js polyfills initialized');
};

export default initNodePolyfills;
