// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add polyfills for Node.js modules
config.resolver.extraNodeModules = {
  stream: require.resolve('stream-browserify'),
  events: require.resolve('events'),
  http: path.resolve(__dirname, 'lib/mocks/http.js'),
  https: require.resolve('https-browserify'),
  zlib: require.resolve('browserify-zlib'),
  path: require.resolve('path-browserify'),
  fs: require.resolve('react-native-level-fs'),
  os: require.resolve('react-native-os'),
  buffer: require.resolve('buffer'),
  url: path.resolve(__dirname, 'lib/mocks/url.js'),
  util: path.resolve(__dirname, 'lib/mocks/util.js'),
  ws: path.resolve(__dirname, 'lib/mocks/ws.js'),
};

// Add custom resolver for problematic modules
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Redirect ws to our mock implementation
  if (moduleName === 'ws') {
    return {
      filePath: path.resolve(__dirname, 'lib/mocks/ws.js'),
      type: 'sourceFile',
    };
  }

  // Redirect http to our mock implementation
  if (moduleName === 'http') {
    return {
      filePath: path.resolve(__dirname, 'lib/mocks/http.js'),
      type: 'sourceFile',
    };
  }

  // Redirect url to our mock implementation
  if (moduleName === 'url') {
    return {
      filePath: path.resolve(__dirname, 'lib/mocks/url.js'),
      type: 'sourceFile',
    };
  }

  // Redirect util to our mock implementation
  if (moduleName === 'util') {
    return {
      filePath: path.resolve(__dirname, 'lib/mocks/util.js'),
      type: 'sourceFile',
    };
  }

  // Let Metro handle other modules
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
