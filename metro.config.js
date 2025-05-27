// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enhanced path mapping support for @/ alias - comprehensive mapping
config.resolver.alias = {
  '@': path.resolve(__dirname, '.'),
  '@/components': path.resolve(__dirname, 'components'),
  '@/contexts': path.resolve(__dirname, 'contexts'),
  '@/hooks': path.resolve(__dirname, 'hooks'),
  '@/utils': path.resolve(__dirname, 'utils'),
  '@/types': path.resolve(__dirname, 'types'),
  '@/data': path.resolve(__dirname, 'data'),
  '@/services': path.resolve(__dirname, 'services'),
  '@/lib': path.resolve(__dirname, 'lib'),
  '@/constants': path.resolve(__dirname, 'constants'),
  '@/assets': path.resolve(__dirname, 'assets'),
  '@/screens': path.resolve(__dirname, 'screens'),
  '@backend': path.resolve(__dirname, 'backend'),
};

// Add platform-specific extensions for better web support
config.resolver.platforms = ['native', 'web', 'ios', 'android'];

// Add resolver to handle native-only modules on web
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Handle platform-specific imports
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.js', 'web.ts', 'web.tsx'];

// Add Node.js polyfills including https, crypto, and disabled modules
config.resolver.extraNodeModules = {
  stream: require.resolve('stream-browserify'),
  events: require.resolve('events'),
  buffer: require.resolve('buffer'),
  https: require.resolve('https-browserify'),
  http: require.resolve('@tradle/react-native-http'),
  crypto: require.resolve('./polyfills/empty.js'),
  path: require.resolve('path-browserify'),
  url: require.resolve('url'),
  util: require.resolve('util'),
  querystring: require.resolve('querystring-es3'),
  zlib: require.resolve('browserify-zlib'),
  assert: require.resolve('assert'),
  // Empty modules for Node.js-only functionality
  net: require.resolve('./polyfills/empty.js'),
  tls: require.resolve('./polyfills/empty.js'),
  fs: require.resolve('./polyfills/empty.js'),
  child_process: require.resolve('./polyfills/empty.js'),
};

// Add custom resolver to handle problematic modules on web
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle react-native-maps on web platform
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      filePath: path.resolve(__dirname, 'lib/mocks/react-native-maps.web.js'),
      type: 'sourceFile',
    };
  }

  // Handle any react-native-maps sub-modules on web
  if (platform === 'web' && moduleName.startsWith('react-native-maps/')) {
    return {
      filePath: path.resolve(__dirname, 'lib/mocks/react-native-maps.web.js'),
      type: 'sourceFile',
    };
  }

  // Handle specific problematic native modules on web
  if (platform === 'web' && moduleName === 'react-native/Libraries/Utilities/codegenNativeCommands') {
    return {
      filePath: path.resolve(__dirname, 'polyfills/empty.js'),
      type: 'sourceFile',
    };
  }

  // Use default resolver for everything else
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
