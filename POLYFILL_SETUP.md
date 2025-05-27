# 🔧 Node.js Polyfill Setup for React Native

## Current Polyfills Configured

### Metro Config (`metro.config.js`)
```js
config.resolver.extraNodeModules = {
  stream: require.resolve('stream-browserify'),
  events: require.resolve('events'),
  buffer: require.resolve('buffer'),
  https: require.resolve('https-browserify'),
  http: require.resolve('@tradle/react-native-http'),
  crypto: require.resolve('react-native-crypto'),
  net: false, // Disable net module for React Native (not available)
  tls: false, // Disable tls module for React Native (not available)
  fs: false, // Disable fs module for React Native (not available)
  path: require.resolve('path-browserify'),
};
```

### Global Polyfills (`index.js`)
```js
import { Buffer } from 'buffer';
import 'react-native-get-random-values';
import crypto from 'react-native-crypto';

global.Buffer = Buffer;
global.crypto = crypto;
```

### Dependencies Required
```json
{
  "@tradle/react-native-http": "^2.0.1",
  "browserify-zlib": "^0.2.0",
  "buffer": "^6.0.3",
  "events": "^3.3.0",
  "https-browserify": "^1.0.0",
  "path-browserify": "^1.0.1",
  "react-native-crypto": "^2.2.0",
  "react-native-get-random-values": "^1.11.0",
  "react-native-polyfill-globals": "^3.1.0",
  "stream-browserify": "^3.0.0",
  "web-streams-polyfill": "^4.1.0"
}
```

## Common Issues & Solutions

### ❌ "crypto" module not found
- **Cause**: Node.js packages trying to import `crypto`
- **Solution**: Add `crypto: require.resolve('react-native-crypto')` to Metro config
- **Example**: `ws`, `node-fetch`, `axios` with HTTPS

### ❌ "buffer" module not found  
- **Cause**: Node.js packages expecting Buffer global
- **Solution**: Import Buffer and set `global.Buffer = Buffer`

### ❌ "stream" module not found
- **Cause**: Node.js packages using streams
- **Solution**: Add `stream: require.resolve('stream-browserify')` to Metro config

### ❌ "events" module not found
- **Cause**: Node.js packages using EventEmitter
- **Solution**: Add `events: require.resolve('events')` to Metro config

### ❌ "net" module not found
- **Cause**: Node.js packages trying to use TCP networking
- **Solution**: Set `net: false` in Metro config (not available in React Native)
- **Example**: `ws` WebSocket library, `node-fetch`

### ❌ "fs" module not found
- **Cause**: Node.js packages trying to access file system
- **Solution**: Set `fs: false` in Metro config (not available in React Native)

### ❌ "tls" module not found
- **Cause**: Node.js packages using TLS/SSL directly
- **Solution**: Set `tls: false` in Metro config (not available in React Native)

## Adding New Polyfills

1. **Install the polyfill package**:
   ```bash
   npm install [polyfill-package]
   ```

2. **Add to Metro config**:
   ```js
   config.resolver.extraNodeModules = {
     // existing polyfills...
     'node-module': require.resolve('polyfill-package'),
   };
   ```

3. **Add global if needed** (in `index.js`):
   ```js
   import polyfill from 'polyfill-package';
   global.moduleName = polyfill;
   ```

## Testing
- Clear Metro cache: `npx expo start --clear`
- Test on both iOS and Android
- Check for any remaining Node.js module errors 