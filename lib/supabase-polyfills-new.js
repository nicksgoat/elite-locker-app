/**
 * Supabase Polyfills for React Native
 *
 * This file provides the minimal set of polyfills required for Supabase to work in React Native.
 */

// Import required polyfills
import zlib from 'browserify-zlib';
import { Buffer } from 'buffer';
import events from 'events';
import * as expoCrypto from 'expo-crypto';
import httpsBrowserify from 'https-browserify';
import path from 'path-browserify';
import 'react-native-get-random-values';
import fs from 'react-native-level-fs';
import os from 'react-native-os';
import { URL, URLSearchParams } from 'react-native-url-polyfill';
import streamBrowserify from 'stream-browserify';
import { TextDecoder, TextEncoder } from 'text-encoding';
import httpMock from './mocks/http';
import wsMock from './mocks/ws';

// Polyfill global objects
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.URL = URL;
global.URLSearchParams = URLSearchParams;

// Polyfill crypto
global.crypto = {
  ...global.crypto,
  getRandomValues: expoCrypto.getRandomValues,
  subtle: expoCrypto.subtle,
  randomUUID: expoCrypto.randomUUID,
};

// Polyfill Node.js modules
global.process = global.process || {};
global.process.env = global.process.env || {};
global.process.browser = true;
global.process.version = '';
global.process.versions = { node: '' };

// Polyfill EventEmitter
global.EventEmitter = events.EventEmitter;
global.events = events;

// Polyfill stream
global.stream = streamBrowserify;
global.Buffer = Buffer;

// Polyfill http and https
global.http = httpMock;
global.https = httpsBrowserify;
global.url = urlMock;
global.util = require('./mocks/util');
global.zlib = zlib;
global.path = path;
global.os = os;
global.fs = fs;

// Polyfill WebSocket
global.WebSocket = global.WebSocket || require('react-native-websocket').default;
global.ws = wsMock;

// Disable WebSocket server in ws package
global.__WS_IS_REACT_NATIVE__ = true;

// Initialize polyfills
export const initSupabasePolyfills = () => {
  console.log('Supabase polyfills initialized');
};

export default initSupabasePolyfills;
