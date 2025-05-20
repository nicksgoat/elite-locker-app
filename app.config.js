module.exports = {
  name: 'Elite Locker',
  slug: 'elite-locker',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  scheme: 'elitelocker',
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.elitelocker.app',
    infoPlist: {
      UIBackgroundModes: ['fetch']
    }
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#000000'
    },
    package: 'com.elitelocker.app'
  },
  web: {
  },
  extra: {
    eas: {
      projectId: 'your-project-id'
    }
  },
  plugins: [
    'expo-router',
    'expo-background-fetch'
  ]
};
